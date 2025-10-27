const { app } = require('@azure/functions');
const { getPool } = require('../config/database');

app.http('GetProdutosAuditoria', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'produtos-auditoria',
  handler: async (request, context) => {
    try {
      const pool = await getPool();

      // Paginação
      const page = parseInt(request.query.get('page')) || 1;
      const limit = parseInt(request.query.get('limit')) || 20;
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

      return {
        status: 200,
        jsonBody: {
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
      context.error('Error in GetProdutosAuditoria:', error);
      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Erro ao buscar auditorias',
          error: error.message
        }
      };
    }
  }
});
