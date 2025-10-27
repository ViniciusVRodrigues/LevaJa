const { getPool } = require('../config/database');

module.exports = async function (context, req) {
    try {
        const pool = await getPool();

        // Paginação
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Buscar auditorias
        const result = await pool.request()
            .input('limit', limit)
            .input('offset', offset)
            .query(`
                SELECT * FROM produtos_auditoria
                ORDER BY timestamp DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        // Contar total
        const countResult = await pool.request()
            .query('SELECT COUNT(*) as total FROM produtos_auditoria');

        const total = countResult.recordset[0].total;

        context.res = {
            status: 200,
            body: {
                success: true,
                data: result.recordset,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        context.log.error('Error in GetProdutosAuditoria:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao buscar auditorias',
                error: error.message
            }
        };
    }
};
