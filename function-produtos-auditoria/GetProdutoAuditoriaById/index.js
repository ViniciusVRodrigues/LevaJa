const { app } = require('@azure/functions');
const { getPool } = require('../config/database');

app.http('GetProdutoAuditoriaById', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'produtos-auditoria/{id}',
  handler: async (request, context) => {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            message: 'ID inválido'
          }
        };
      }

      const pool = await getPool();

      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM produtos_auditoria WHERE id = @id');

      if (result.recordset.length === 0) {
        return {
          status: 404,
          jsonBody: {
            success: false,
            message: 'Auditoria não encontrada'
          }
        };
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: result.recordset[0]
        }
      };
    } catch (error) {
      context.error('Error in GetProdutoAuditoriaById:', error);
      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Erro ao buscar auditoria',
          error: error.message
        }
      };
    }
  }
});
