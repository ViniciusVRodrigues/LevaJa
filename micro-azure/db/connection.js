const sql = require('mssql');
const config = require('../config');

let pool = null;
let isConnecting = false;

/**
 * Inicializa conexão com Azure SQL
 */
async function connect() {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    // Evita múltiplas tentativas simultâneas de conexão
    if (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return connect();
    }

    isConnecting = true;
    console.log('Conectando ao Azure SQL Server...');
    pool = await sql.connect(config.database);
    
    // Handler para detectar desconexões
    pool.on('error', (err) => {
      console.error('Erro na conexão do pool:', err);
      pool = null;
    });

    console.log('✓ Conectado ao Azure SQL Server');

    // Cria tabela se não existir
    await initializeDatabase();

    isConnecting = false;
    return pool;
  } catch (error) {
    isConnecting = false;
    console.error('Erro ao conectar ao Azure SQL:', error.message);
    pool = null;
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
 * Obtém pool de conexão (com auto-reconexão)
 */
async function getPool() {
  // Se não há pool ou está desconectado, reconecta
  if (!pool || !pool.connected) {
    console.log('Pool desconectado. Reconectando...');
    await connect();
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
