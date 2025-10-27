const { connectDatabase } = require('../config/database');

module.exports = async function (context, req) {
  try {
    context.log('GetStatistics function triggered');

    const db = await connectDatabase();
    const collection = db.collection('usuarios_auditoria');

    // Total de usuários criados via eventos
    const totalUsuarios = await collection.countDocuments({});

    // Usuários criados hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const usuariosHoje = await collection.countDocuments({
      timestamp: { $gte: hoje.toISOString() }
    });

    // Última data de processamento
    const ultimoRegistro = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    const ultimaData = ultimoRegistro.length > 0 
      ? ultimoRegistro[0].timestamp 
      : null;

    // Usuários por dia (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const usuariosPorDia = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: seteDiasAtras.toISOString() }
        }
      },
      {
        $group: {
          _id: { $substr: ["$timestamp", 0, 10] },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    context.res = {
      status: 200,
      body: {
        success: true,
        statistics: {
          totalUsuariosCriados: totalUsuarios,
          usuariosCriadosHoje: usuariosHoje,
          ultimaDataProcessamento: ultimaData,
          usuariosPorDia: usuariosPorDia.map(item => ({
            data: item._id,
            count: item.count
          }))
        }
      }
    };
  } catch (error) {
    context.log(`Error in GetStatistics: ${error.message}`);
    context.res = {
      status: 500,
      body: {
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      }
    };
  }
};
