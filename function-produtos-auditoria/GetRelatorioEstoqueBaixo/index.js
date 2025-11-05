const { getPool } = require('../config/database');
const { connectMongoDB } = require('../config/mongoDatabase');

module.exports = async function (context, req) {
    try {
        const limiteEstoque = parseInt(req.query.limite) || 50;

        const pool = await getPool();

        // Buscar alertas de estoque baixo
        const alertas = await pool.request()
            .input('limite', limiteEstoque)
            .query(`
                SELECT DISTINCT
                    a.lote_id,
                    a.nome,
                    pa.estoque,
                    pa.categoria,
                    a.created_at as alerta_criado_em
                FROM alertas a
                INNER JOIN (
                    SELECT lote_id, estoque, categoria, 
                           ROW_NUMBER() OVER (PARTITION BY lote_id ORDER BY timestamp DESC) as rn
                    FROM produtos_auditoria
                ) pa ON a.lote_id = pa.lote_id AND pa.rn = 1
                WHERE a.tipo = 'ESTOQUE_BAIXO' 
                    AND pa.estoque <= @limite
                ORDER BY pa.estoque ASC
            `);

        // Produtos com estoque baixo (do último evento registrado)
        const produtos = await pool.request()
            .input('limite', limiteEstoque)
            .query(`
                WITH LatestProducts AS (
                    SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp,
                           ROW_NUMBER() OVER (PARTITION BY lote_id ORDER BY timestamp DESC) as rn
                    FROM produtos_auditoria
                    WHERE estoque <= @limite
                )
                SELECT lote_id, nome, categoria, estoque, validade, valor, timestamp
                FROM LatestProducts
                WHERE rn = 1
                ORDER BY estoque ASC
            `);

        // ===== VERIFICAÇÃO DE DADOS (MongoDB) =====
        const inconsistencias = [];
        let produtosAtivosComEstoqueBaixo = [];
        let totalProdutosMongo = 0;

        try {
            const db = await connectMongoDB();
            const collection = db.collection('lotes_produtos');

            // Total de produtos no MongoDB
            totalProdutosMongo = await collection.countDocuments({});

            // Produtos com estoque baixo no MongoDB (dados reais atuais)
            const produtosEstoqueBaixo = await collection
                .find({ estoque: { $lte: limiteEstoque } })
                .sort({ estoque: 1 })
                .limit(50)
                .toArray();

            produtosAtivosComEstoqueBaixo = produtosEstoqueBaixo;

            if (produtosEstoqueBaixo.length > 0) {
                inconsistencias.push({
                    tipo: 'ESTOQUE_BAIXO_MONGODB',
                    total: produtosEstoqueBaixo.length,
                    mensagem: `${produtosEstoqueBaixo.length} produtos com estoque ≤ ${limiteEstoque} no MongoDB`,
                    severidade: 'ALTA'
                });
            }

            // Verificar produtos com estoque negativo
            const estoqueNegativo = await collection.countDocuments({ estoque: { $lt: 0 } });
            if (estoqueNegativo > 0) {
                inconsistencias.push({
                    tipo: 'ESTOQUE_NEGATIVO',
                    total: estoqueNegativo,
                    mensagem: `${estoqueNegativo} produtos com estoque negativo`,
                    severidade: 'CRÍTICA'
                });
            }

            // Verificar produtos com dados faltantes
            const dadosFaltantes = await collection.countDocuments({
                $or: [
                    { nome: { $exists: false } },
                    { nome: '' },
                    { categoria: { $exists: false } },
                    { categoria: '' }
                ]
            });

            if (dadosFaltantes > 0) {
                inconsistencias.push({
                    tipo: 'DADOS_FALTANTES',
                    total: dadosFaltantes,
                    mensagem: `${dadosFaltantes} produtos com dados faltantes`,
                    severidade: 'MÉDIA'
                });
            }

        } catch (mongoError) {
            context.log('Warning: Could not verify MongoDB data:', mongoError.message);
        }

        context.res = {
            status: 200,
            body: {
                success: true,
                limiteEstoque,
                totalProdutos: produtos.recordset.length,
                totalAlertas: alertas.recordset.length,
                produtos: produtos.recordset,
                alertas: alertas.recordset,
                verification: {
                    totalProdutosMongoDB: totalProdutosMongo,
                    produtosAtivosComEstoqueBaixo: produtosAtivosComEstoqueBaixo.length,
                    totalInconsistencias: inconsistencias.length,
                    inconsistencias: inconsistencias,
                    exemplos: produtosAtivosComEstoqueBaixo.slice(0, 5).map(p => ({
                        id: p._id,
                        nome: p.nome,
                        estoque: p.estoque,
                        categoria: p.categoria
                    }))
                }
            }
        };
    } catch (error) {
        context.log.error('Error in GetRelatorioEstoqueBaixo:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao buscar relatório de estoque baixo',
                error: error.message
            }
        };
    }
};
