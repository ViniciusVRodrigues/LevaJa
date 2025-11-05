const { connectDatabase } = require('../config/database');
const { getAzureSqlPool, sql } = require('../config/azureSqlDatabase');

module.exports = async function (context, req) {
  try {
    context.log('GetStatistics function triggered');

    const db = await connectDatabase();
    const collection = db.collection('usuarios_auditoria');

    // Total de usuários criados via eventos (auditoria)
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

    // ===== VERIFICAÇÃO DE DADOS (Azure SQL) =====
    const inconsistencias = [];
    let totalUsuariosAzure = 0;
    let usuariosComProblemas = [];

    try {
      const pool = await getAzureSqlPool();
      
      // Total de usuários no Azure SQL
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM usuarios');
      totalUsuariosAzure = countResult.recordset[0].total;

      // Verificar duplicatas de email
      const duplicatasResult = await pool.request()
        .query(`
          SELECT email, COUNT(*) as total
          FROM usuarios
          GROUP BY email
          HAVING COUNT(*) > 1
        `);

      if (duplicatasResult.recordset.length > 0) {
        duplicatasResult.recordset.forEach(dup => {
          inconsistencias.push({
            tipo: 'DUPLICATA_EMAIL',
            email: dup.email,
            total: dup.total,
            mensagem: `Email ${dup.email} possui ${dup.total} registros`,
            severidade: 'ALTA'
          });
        });
      }

      // Verificar usuários com dados faltantes
      const usuariosProblemaResult = await pool.request()
        .query(`
          SELECT id, nome, email
          FROM usuarios
          WHERE nome IS NULL OR email IS NULL OR nome = '' OR email = ''
        `);

      if (usuariosProblemaResult.recordset.length > 0) {
        usuariosComProblemas = usuariosProblemaResult.recordset;
        inconsistencias.push({
          tipo: 'DADOS_FALTANTES',
          total: usuariosProblemaResult.recordset.length,
          mensagem: `${usuariosProblemaResult.recordset.length} usuários com dados faltantes`,
          severidade: 'MÉDIA'
        });
      }

      // Verificar duplicatas na auditoria
      const auditoriasGrouped = await collection.aggregate([
        {
          $group: {
            _id: "$email",
            count: { $sum: 1 }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]).toArray();

      if (auditoriasGrouped.length > 0) {
        inconsistencias.push({
          tipo: 'DUPLICATA_AUDITORIA',
          total: auditoriasGrouped.length,
          mensagem: `${auditoriasGrouped.length} emails com múltiplas auditorias`,
          severidade: 'BAIXA'
        });
      }

    } catch (azureError) {
      context.log('Warning: Could not verify Azure SQL data:', azureError.message);
    }

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
        },
        verification: {
          totalUsuariosAzureSQL: totalUsuariosAzure,
          totalInconsistencias: inconsistencias.length,
          inconsistencias: inconsistencias,
          usuariosComProblemas: usuariosComProblemas.slice(0, 5)
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
