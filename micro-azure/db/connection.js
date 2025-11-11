const sql = require('mssql');
const config = require('../config');

let pool = null;
let isConnecting = false;
let connectionPromise = null;
let lastConnectionAttempt = 0;
const MIN_RECONNECT_INTERVAL = 5000; // 5 segundos entre tentativas
let tableInitialized = false;
let reconnectionStartTime = null; // Track when reconnection started

/**
 * Aguarda com timeout
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se está em processo de reconexão
 */
function isReconnecting() {
  const reconnecting = isConnecting || (reconnectionStartTime !== null);
  if (reconnecting && Date.now() % 5000 < 100) { // Log a cada ~5s para não poluir
    console.log(`🔄 Sistema em reconexão: isConnecting=${isConnecting}, reconnectionStartTime=${reconnectionStartTime ? 'set' : 'null'}`);
  }
  return reconnecting;
}

/**
 * Obtém tempo decorrido desde início da reconexão (em segundos)
 */
function getReconnectionElapsedSeconds() {
  if (reconnectionStartTime === null) return 0;
  return Math.floor((Date.now() - reconnectionStartTime) / 1000);
}

/**
 * Inicializa conexão com Azure SQL com retry automático
 */
async function connect(retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 segundos entre retries
  
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
      await sleep(waitTime);
    }

    isConnecting = true;
    lastConnectionAttempt = Date.now();
    
    // Mark reconnection start if this is a reconnection (pool was null/disconnected)
    if (!pool || !pool.connected) {
      if (reconnectionStartTime === null) {
        reconnectionStartTime = Date.now();
        console.log('🔄 Iniciando processo de reconexão...');
      }
    }

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

    console.log(`🔄 Conectando ao Azure SQL Server... (tentativa ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    // Cria nova promessa de conexão
    connectionPromise = sql.connect(config.database);
    pool = await connectionPromise;
    
    // Handler para detectar desconexões
    pool.on('error', (err) => {
      console.error('❌ Erro na conexão do pool:', err.message);
      pool = null;
      tableInitialized = false;
      reconnectionStartTime = Date.now(); // Mark as needing reconnection
    });

    console.log('✅ Conectado ao Azure SQL Server');

    // Inicializa tabela apenas uma vez
    if (!tableInitialized) {
      await initializeDatabase();
      tableInitialized = true;
    }

    // Só limpa os flags DEPOIS de tudo estar pronto
    isConnecting = false;
    connectionPromise = null;
    reconnectionStartTime = null; // Clear reconnection state on success
    console.log('✅ Reconexão finalizada com sucesso. Sistema operacional.');
    return pool;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    pool = null;
    
    console.error(`❌ Erro ao conectar ao Azure SQL (tentativa ${retryCount + 1}):`, error.message);
    
    // Retry logic com exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`🔄 Tentando novamente em ${delay / 1000} segundos...`);
      await sleep(delay);
      return connect(retryCount + 1);
    }
    
    console.error('❌ Falha após todas as tentativas de conexão');
    // Keep reconnectionStartTime set so we can report it
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
      // Testa a conexão com uma query simples
      try {
        await pool.request().query('SELECT 1 AS test');
        return pool;
      } catch (testError) {
        console.warn('⚠️ Teste de conexão falhou:', testError.message);
        pool = null; // Invalida o pool
        if (reconnectionStartTime === null) {
          reconnectionStartTime = Date.now(); // Mark as needing reconnection
          console.log('🔄 Conexão perdida, marcando para reconexão...');
        }
      }
    }

    // Se pool não existe ou está desconectado, cria novo
    if (!pool || !pool.connected) {
      console.log('🔄 Pool não disponível. Conectando...');
      if (reconnectionStartTime === null) {
        reconnectionStartTime = Date.now();
      }
      return await connect();
    }

    return pool;
  } catch (error) {
    console.error('❌ Erro ao obter pool:', error.message);
    throw error;
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
      reconnectionStartTime = null;
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
  sql,
  isReconnecting,
  getReconnectionElapsedSeconds
};
