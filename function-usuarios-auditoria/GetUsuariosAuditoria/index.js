const { app } = require('@azure/functions');
const { connectDatabase } = require('../config/database');

app.http('GetUsuariosAuditoria', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'usuarios-auditoria',
  handler: async (request, context) => {
    try {
      const db = await connectDatabase();
      const collection = db.collection('usuarios_auditoria');

      // Paginação
      const page = parseInt(request.query.get('page')) || 1;
      const limit = parseInt(request.query.get('limit')) || 20;
      const skip = (page - 1) * limit;

      // Buscar auditorias
      const auditorias = await collection
        .find({})
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Contar total
      const total = await collection.countDocuments({});

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: auditorias,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      context.error('Error in GetUsuariosAuditoria:', error);
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
