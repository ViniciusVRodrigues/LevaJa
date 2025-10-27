const { connectDatabase } = require('../config/database');

module.exports = async function (context, req) {
  try {
    context.log('GetUsuariosAuditoria function triggered');

    const db = await connectDatabase();
    const collection = db.collection('usuarios_auditoria');

    // Paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

    context.res = {
      status: 200,
      body: {
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
    context.log(`Error in GetUsuariosAuditoria: ${error.message}`);
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
