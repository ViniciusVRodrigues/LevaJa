const { getPool } = require('../config/database');

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
                alertas: alertas.recordset
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
