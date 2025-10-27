const { app } = require('@azure/functions');
const { connectDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

app.http('GetUsuarioAuditoriaById', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'usuarios-auditoria/{id}',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      
      if (!ObjectId.isValid(id)) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            message: 'ID inválido'
          }
        };
      }

      const db = await connectDatabase();
      const collection = db.collection('usuarios_auditoria');

      const auditoria = await collection.findOne({ _id: new ObjectId(id) });

      if (!auditoria) {
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
          data: auditoria
        }
      };
    } catch (error) {
      context.error('Error in GetUsuarioAuditoriaById:', error);
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
