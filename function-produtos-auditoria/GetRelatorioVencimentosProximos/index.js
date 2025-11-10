const { getPool } = require('../config/database');
const { connectMongoDB } = require('../config/mongoDatabase');

module.exports = async function (context, req) {
    try {
        const diasProximos = parseInt(req.query.dias) || 30;

        const pool = await getPool();

        // Buscar alertas de vencimento próximo
        const alertas = await pool.request()
            .input('dias', diasProximos)
            .query(`
                SELECT DISTINCT
                    a.lote_id,
                    a.nome,
                    pa.validade,
                    pa.estoque,
                    pa.categoria,
                    DATEDIFF(day, GETDATE(), pa.validade) as dias_ate_vencimento,
                    a.created_at as alerta_criado_em
                FROM alertas a
                INNER JOIN (
                    SELECT lote_id, validade, estoque, categoria,
                           ROW_NUMBER() OVER (PARTITION BY lote_id ORDER BY timestamp DESC) as rn
                    FROM produtos_auditoria
                ) pa ON a.lote_id = pa.lote_id AND pa.rn = 1
                WHERE a.tipo = 'VENCIMENTO_PROXIMO'
                    AND pa.validade IS NOT NULL
                    AND DATEDIFF(day, GETDATE(), pa.validade) <= @dias
                    AND DATEDIFF(day, GETDATE(), pa.validade) >= 0
                ORDER BY dias_ate_vencimento ASC
            `);

        // Produtos com vencimento próximo (do último evento registrado)
        const produtos = await pool.request()
            .input('dias', diasProximos)
            .query(`
                WITH LatestProducts AS (
                    SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp,
                           DATEDIFF(day, GETDATE(), validade) as dias_ate_vencimento,
                           ROW_NUMBER() OVER (PARTITION BY lote_id ORDER BY timestamp DESC) as rn
                    FROM produtos_auditoria
                    WHERE validade IS NOT NULL
                      AND DATEDIFF(day, GETDATE(), validade) <= @dias
                      AND DATEDIFF(day, GETDATE(), validade) >= 0
                )
                SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp, dias_ate_vencimento
                FROM LatestProducts
                WHERE rn = 1
                ORDER BY dias_ate_vencimento ASC
            `);

        // Produtos já vencidos
        const vencidos = await pool.request()
            .query(`
                WITH LatestProducts AS (
                    SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp,
                           DATEDIFF(day, GETDATE(), validade) as dias_vencido,
                           ROW_NUMBER() OVER (PARTITION BY lote_id ORDER BY timestamp DESC) as rn
                    FROM produtos_auditoria
                    WHERE validade IS NOT NULL
                      AND validade < CAST(GETDATE() AS DATE)
                )
                SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp, dias_vencido
                FROM LatestProducts
                WHERE rn = 1
                ORDER BY dias_vencido DESC
            `);

        // ===== VERIFICAÇÃO DE DADOS (MongoDB) =====
        const inconsistencias = [];
        let produtosVencendoMongo = [];
        let produtosVencidosMongo = [];

        try {
            const db = await connectMongoDB();
            const collection = db.collection('lotes_produtos');

            const hoje = new Date();
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() + diasProximos);

            // Produtos vencendo no MongoDB (dados reais)
            produtosVencendoMongo = await collection
                .find({
                    validade: { 
                        $exists: true,
                        $gte: hoje,
                        $lte: dataLimite
                    }
                })
                .sort({ validade: 1 })
                .limit(50)
                .toArray();

            if (produtosVencendoMongo.length > 0) {
                inconsistencias.push({
                    tipo: 'VENCIMENTO_PROXIMO_MONGODB',
                    total: produtosVencendoMongo.length,
                    mensagem: `${produtosVencendoMongo.length} produtos vencendo em ≤ ${diasProximos} dias no MongoDB`,
                    severidade: 'ALTA'
                });
            }

            // Produtos já vencidos no MongoDB
            produtosVencidosMongo = await collection
                .find({
                    validade: { 
                        $exists: true,
                        $lt: hoje
                    }
                })
                .sort({ validade: -1 })
                .limit(50)
                .toArray();

            if (produtosVencidosMongo.length > 0) {
                inconsistencias.push({
                    tipo: 'PRODUTOS_VENCIDOS_MONGODB',
                    total: produtosVencidosMongo.length,
                    mensagem: `${produtosVencidosMongo.length} produtos já vencidos no MongoDB`,
                    severidade: 'CRÍTICA'
                });
            }

            // Verificar produtos sem validade
            const semValidade = await collection.countDocuments({
                $or: [
                    { validade: { $exists: false } },
                    { validade: null }
                ]
            });

            if (semValidade > 0) {
                inconsistencias.push({
                    tipo: 'SEM_VALIDADE',
                    total: semValidade,
                    mensagem: `${semValidade} produtos sem data de validade`,
                    severidade: 'BAIXA'
                });
            }

        } catch (mongoError) {
            context.log('Warning: Could not verify MongoDB data:', mongoError.message);
        }

        context.res = {
            status: 200,
            body: {
                success: true,
                diasProximos,
                totalProdutosProximos: produtos.recordset.length,
                totalProdutosVencidos: vencidos.recordset.length,
                totalAlertas: alertas.recordset.length,
                produtosProximos: produtos.recordset,
                produtosVencidos: vencidos.recordset,
                alertas: alertas.recordset,
                verification: {
                    produtosVencendoMongoDB: produtosVencendoMongo.length,
                    produtosVencidosMongoDB: produtosVencidosMongo.length,
                    totalInconsistencias: inconsistencias.length,
                    inconsistencias: inconsistencias,
                    exemplosVencendo: produtosVencendoMongo.slice(0, 5).map(p => ({
                        id: p._id,
                        nome: p.nome,
                        validade: p.validade,
                        estoque: p.estoque
                    })),
                    exemplosVencidos: produtosVencidosMongo.slice(0, 5).map(p => ({
                        id: p._id,
                        nome: p.nome,
                        validade: p.validade,
                        estoque: p.estoque
                    }))
                }
            }
        };
    } catch (error) {
        context.log.error('Error in GetRelatorioVencimentosProximos:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao buscar relatório de vencimentos',
                error: error.message
            }
        };
    }
};
