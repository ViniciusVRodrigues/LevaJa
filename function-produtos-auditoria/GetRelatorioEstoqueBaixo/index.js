const { getPool } = require('../config/database');

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

        context.res = {
            status: 200,
            body: {
                success: true,
                limiteEstoque,
                totalProdutos: produtos.recordset.length,
                totalAlertas: alertas.recordset.length,
                produtos: produtos.recordset,
                alertas: alertas.recordset
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
