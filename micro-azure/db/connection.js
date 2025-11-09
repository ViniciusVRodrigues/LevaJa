const sql = require('mssql');
const config = require('../config');

let pool = null;
let isConnecting = false;
let connectionPromise = null;
let lastConnectionAttempt = 0;
const MIN_RECONNECT_INTERVAL = 5000; // 5 segundos entre tentativas

/**
 * Inicializa conexão com Azure SQL
 */
async function connect() {
  try {
    // Verifica se já existe uma conexão válida
    if (pool && pool.connected && pool.healthy) {
      return pool;
    }

    // Se já está conectando, aguarda a promessa existente
    if (isConnecting && connectionPromise) {
      return await connectionPromise;
    }

    // Evita reconexões muito frequentes
    const now = Date.now();
    if (now - lastConnectionAttempt < MIN_RECONNECT_INTERVAL) {
      console.log('Aguardando intervalo de reconexão...');
      await new Promise(resolve => setTimeout(resolve, MIN_RECONNECT_INTERVAL - (now - lastConnectionAttempt)));
    }

    isConnecting = true;
    lastConnectionAttempt = Date.now();

    // Fecha pool anterior se existir
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error('Erro ao fechar pool anterior:', err.message);
      }
      pool = null;
    }

    console.log('Conectando ao Azure SQL Server...');
    
    // Cria nova promessa de conexão
    connectionPromise = sql.connect(config.database);
    pool = await connectionPromise;
    
    // Handler para detectar desconexões
    pool.on('error', (err) => {
      console.error('⚠️ Erro na conexão do pool:', err.message);
      pool = null;
    });

    console.log('✓ Conectado ao Azure SQL Server');

    // Cria tabela se não existir
    await initializeDatabase();

    isConnecting = false;
    connectionPromise = null;
    return pool;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    console.error('❌ Erro ao conectar ao Azure SQL:', error.message);
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

    // Inicia keep-alive para prevenir desconexões por inatividade
    startKeepAlive();
  } catch (error) {
    console.error('Erro ao inicializar database:', error.message);
  }
}

let keepAliveInterval = null;

/**
 * Mantém a conexão ativa com queries periódicas
 */
function startKeepAlive() {
  // Limpa interval anterior se existir
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  // Executa query simples a cada 4 minutos para manter conexão ativa
  keepAliveInterval = setInterval(async () => {
    try {
      if (pool && pool.connected) {
        await pool.request().query('SELECT 1 AS keepalive');
        console.log('💓 Keep-alive: conexão mantida');
      }
    } catch (err) {
      console.warn('⚠️ Keep-alive falhou:', err.message);
      pool = null;
    }
  }, 4 * 60 * 1000); // 4 minutos
}

/**
 * Obtém pool de conexão (com auto-reconexão)
 */
async function getPool() {
  try {
    // Verifica se o pool existe e está saudável
    if (pool && pool.connected && pool.healthy) {
      // Testa a conexão com uma query simples
      try {
        await pool.request().query('SELECT 1 AS test');
        return pool;
      } catch (err) {
        console.warn('⚠️ Pool parece conectado mas falhou no teste:', err.message);
        pool = null;
      }
    }

    // Se não há pool válido, reconecta
    if (!pool || !pool.connected) {
      console.log('🔄 Pool desconectado. Reconectando...');
      await connect();
    }

    return pool;
  } catch (error) {
    console.error('❌ Erro ao obter pool:', error.message);
    // Tenta reconectar uma vez
    await connect();
    return pool;
  }
}

/**
 * Fecha conexão
 */
async function close() {
  // Limpa keep-alive
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }

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
