const { getPool } = require('../config/database');

module.exports = async function (context, req) {
    try {
        const id = parseInt(context.bindingData.id);
        
        if (isNaN(id)) {
            context.res = {
                status: 400,
                body: {
                    success: false,
                    message: 'ID inválido'
                }
            };
            return;
        }

        const pool = await getPool();

        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM produtos_auditoria WHERE id = @id');

        if (result.recordset.length === 0) {
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
                data: result.recordset[0]
            }
        };
    } catch (error) {
        context.log.error('Error in GetProdutoAuditoriaById:', error);
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
