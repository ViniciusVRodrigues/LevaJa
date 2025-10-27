const sql = require('mssql');

let pool = null;

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

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to Azure SQL Database');
      
      // Criar tabelas se não existirem
      await initializeSchema();
    } catch (error) {
      console.error('Error connecting to SQL Server:', error);
      throw error;
    }
  }
  return pool;
}

async function initializeSchema() {
  try {
    // Tabela de auditoria de produtos
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='produtos_auditoria' AND xtype='U')
      CREATE TABLE produtos_auditoria (
        id INT IDENTITY(1,1) PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        timestamp DATETIME2 NOT NULL,
        lote_id VARCHAR(50) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        estoque INT,
        validade DATE,
        valor DECIMAL(10,2),
        processed_at DATETIME2 DEFAULT GETDATE(),
        original_event NVARCHAR(MAX),
        INDEX idx_timestamp (timestamp DESC),
        INDEX idx_lote_id (lote_id)
      )
    `);

    // Tabela de alertas
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='alertas' AND xtype='U')
      CREATE TABLE alertas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        lote_id VARCHAR(50) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        mensagem NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        INDEX idx_tipo (tipo),
        INDEX idx_created_at (created_at DESC)
      )
    `);

    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing schema:', error);
  }
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = {
  getPool,
  closePool,
  sql
};
