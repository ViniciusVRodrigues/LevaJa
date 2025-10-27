const { getPool } = require('../config/database');

module.exports = async function (context, req) {
    try {
        context.log('Testing database connection...');

        // Verificar variáveis de ambiente
        const envVars = {
            AZURE_SQL_SERVER: process.env.AZURE_SQL_SERVER ? 'SET' : 'NOT SET',
            AZURE_SQL_DATABASE: process.env.AZURE_SQL_DATABASE ? 'SET' : 'NOT SET',
            AZURE_SQL_USER: process.env.AZURE_SQL_USER ? 'SET' : 'NOT SET',
            AZURE_SQL_PASSWORD: process.env.AZURE_SQL_PASSWORD ? 'SET' : 'NOT SET'
        };

        context.log('Environment variables:', envVars);

        // Tentar conectar ao banco
        const pool = await getPool();
        
        // Testar query simples
        const result = await pool.request().query('SELECT @@VERSION as version, GETDATE() as current_time');
        
        // Verificar se as tabelas existem
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        // Contar registros nas tabelas
        let counts = {};
        try {
            const produtosCount = await pool.request().query('SELECT COUNT(*) as total FROM produtos_auditoria');
            counts.produtos_auditoria = produtosCount.recordset[0].total;

            const alertasCount = await pool.request().query('SELECT COUNT(*) as total FROM alertas');
            counts.alertas = alertasCount.recordset[0].total;
        } catch (err) {
            counts.error = 'Tables may not exist yet';
        }

        context.res = {
            status: 200,
            body: {
                success: true,
                message: 'Conexão com o banco de dados estabelecida com sucesso!',
                environmentVariables: envVars,
                database: {
                    version: result.recordset[0].version,
                    currentTime: result.recordset[0].current_time,
                    tables: tablesResult.recordset.map(t => t.TABLE_NAME),
                    recordCounts: counts
                }
            }
        };
    } catch (error) {
        context.log.error('Error testing database connection:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao conectar com o banco de dados',
                error: {
                    message: error.message,
                    code: error.code,
                    name: error.name
                },
                environmentVariables: {
                    AZURE_SQL_SERVER: process.env.AZURE_SQL_SERVER ? 'SET' : 'NOT SET',
                    AZURE_SQL_DATABASE: process.env.AZURE_SQL_DATABASE ? 'SET' : 'NOT SET',
                    AZURE_SQL_USER: process.env.AZURE_SQL_USER ? 'SET' : 'NOT SET',
                    AZURE_SQL_PASSWORD: process.env.AZURE_SQL_PASSWORD ? 'SET' : 'NOT SET'
                }
            }
        };
    }
};
