const { connectDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

module.exports = async function (context, req) {
  try {
    context.log('GetUsuarioAuditoriaById function triggered');

    const id = req.params.id;
    
    if (!ObjectId.isValid(id)) {
      context.res = {
        status: 400,
        body: {
          success: false,
          message: 'ID inválido'
        }
      };
      return;
    }

    const db = await connectDatabase();
    const collection = db.collection('usuarios_auditoria');

    const auditoria = await collection.findOne({ _id: new ObjectId(id) });

    if (!auditoria) {
      context.res = {
        status: 404,
        body: {
          success: false,
          message: 'Auditoria não encontrada'
        }
      };
      return;
    }

    context.res = {
      status: 200,
      body: {
        success: true,
        data: auditoria
      }
    };
  } catch (error) {
    context.log(`Error in GetUsuarioAuditoriaById: ${error.message}`);
    context.res = {
      status: 500,
      body: {
        success: false,
        message: 'Erro ao buscar auditoria',
        error: error.message
      }
    };
  }
};
