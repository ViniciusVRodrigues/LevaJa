const sql = require('mssql');
const config = require('../config');

let pool = null;
let isConnecting = false;
let connectionPromise = null;
let lastConnectionAttempt = 0;
const MIN_RECONNECT_INTERVAL = 3000; // 3 segundos entre tentativas
let tableInitialized = false;

/**
 * Inicializa conexão com Azure SQL (lazy - só quando necessário)
 */
async function connect() {
  try {
    // Se já está conectando, aguarda a promessa existente
    if (isConnecting && connectionPromise) {
      console.log('⏳ Aguardando conexão em andamento...');
      return await connectionPromise;
    }

    // Evita reconexões muito frequentes
    const now = Date.now();
    if (now - lastConnectionAttempt < MIN_RECONNECT_INTERVAL) {
      const waitTime = MIN_RECONNECT_INTERVAL - (now - lastConnectionAttempt);
      console.log(`⏱️ Aguardando ${waitTime}ms antes de reconectar...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    isConnecting = true;
    lastConnectionAttempt = Date.now();

    // Fecha pool anterior se existir
    if (pool) {
      try {
        await pool.close();
        console.log('🔌 Pool anterior fechado');
      } catch (err) {
        console.warn('⚠️ Erro ao fechar pool anterior:', err.message);
      }
      pool = null;
    }

    console.log('🔄 Conectando ao Azure SQL Server...');
    
    // Cria nova promessa de conexão
    connectionPromise = sql.connect(config.database);
    pool = await connectionPromise;
    
    // Handler para detectar desconexões
    pool.on('error', (err) => {
      console.error('❌ Erro na conexão do pool:', err.message);
      pool = null;
      tableInitialized = false;
    });

    console.log('✅ Conectado ao Azure SQL Server');

    // Inicializa tabela apenas uma vez
    if (!tableInitialized) {
      await initializeDatabase();
      tableInitialized = true;
    }

    isConnecting = false;
    connectionPromise = null;
    return pool;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    pool = null;
    console.error('❌ Erro ao conectar ao Azure SQL:', error.message);
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
    console.log('✅ Tabela usuarios verificada/criada');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error.message);
    throw error;
  }
}

/**
 * Obtém pool de conexão (com auto-reconexão sob demanda)
 * Esta função é chamada toda vez que um request precisa acessar o banco
 */
async function getPool() {
  try {
    // Verifica se o pool existe e está conectado
    if (pool && pool.connected && pool.healthy) {
      return pool;
    }

    // Se pool não existe ou está desconectado, cria novo
    if (!pool || !pool.connected) {
      console.log('🔄 Pool não disponível. Conectando...');
      return await connect();
    }

    return pool;
  } catch (error) {
    console.error('❌ Erro ao obter pool:', error.message);
    
    // Em caso de erro, tenta reconectar
    try {
      console.log('🔄 Tentando reconectar após erro...');
      return await connect();
    } catch (reconnectError) {
      console.error('❌ Falha na reconexão:', reconnectError.message);
      throw reconnectError;
    }
  }
}

/**
 * Fecha conexão
 */
async function close() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      tableInitialized = false;
      console.log('🔌 Conexão com Azure SQL fechada');
    } catch (err) {
      console.error('❌ Erro ao fechar conexão:', err.message);
    }
  }
}

module.exports = {
  connect,
  getPool,
  close,
  sql
};
