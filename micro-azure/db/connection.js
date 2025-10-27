const sql = require('mssql');
const config = require('../config');

let pool = null;

/**
 * Inicializa conexão com Azure SQL
 */
async function connect() {
  try {
    if (pool) {
      return pool;
    }

    console.log('Conectando ao Azure SQL Server...');
    pool = await sql.connect(config.database);
    console.log('✓ Conectado ao Azure SQL Server');

    // Cria tabela se não existir
    await initializeDatabase();

    return pool;
  } catch (error) {
    console.error('Erro ao conectar ao Azure SQL:', error.message);
    throw error;
  }
}

/**
 * Inicializa schema do banco de dados
 */
async function initializeDatabase() {
  try {
    const createTableQuery = `
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios')
      BEGIN
        CREATE TABLE usuarios (
          id INT IDENTITY(1,1) PRIMARY KEY,
          nome NVARCHAR(100) NOT NULL,
          email NVARCHAR(255) NOT NULL UNIQUE,
          senha NVARCHAR(255) NOT NULL,
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE()
        );
      END
    `;

    await pool.request().query(createTableQuery);
    console.log('✓ Tabela usuarios verificada/criada');
  } catch (error) {
    console.error('Erro ao inicializar database:', error.message);
  }
}

/**
 * Obtém pool de conexão
 */
function getPool() {
  if (!pool) {
    throw new Error('Database não conectado. Chame connect() primeiro.');
  }
  return pool;
}

/**
 * Fecha conexão
 */
async function close() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Conexão com Azure SQL fechada');
  }
}

module.exports = {
  connect,
  getPool,
  close,
  sql
};
