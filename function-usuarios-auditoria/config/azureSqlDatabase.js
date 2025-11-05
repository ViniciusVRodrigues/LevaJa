const sql = require('mssql');

let pool = null;
let isConnecting = false;

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function getAzureSqlPool() {
  // Se já tem pool conectado, retorna
  if (pool && pool.connected) {
    return pool;
  }

  // Evita múltiplas tentativas simultâneas de conexão
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getAzureSqlPool();
  }

  isConnecting = true;
  
  try {
    console.log('Connecting to Azure SQL Database...');
    pool = await sql.connect(config);
    
    // Handler para detectar desconexões
    pool.on('error', (err) => {
      console.error('Azure SQL pool error:', err);
      pool = null;
    });

    console.log('Connected to Azure SQL Database');
    isConnecting = false;
    return pool;
  } catch (error) {
    isConnecting = false;
    console.error('Error connecting to Azure SQL:', error);
    pool = null;
    throw error;
  }
}

async function closeAzureSqlPool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = {
  getAzureSqlPool,
  closeAzureSqlPool,
  sql
};
