require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    options: {
      encrypt: process.env.AZURE_SQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.NODE_ENV === 'development',
      // Configurações para prevenir timeouts
      enableArithAbort: true,
      connectTimeout: 60000, // 60 segundos (aumentado)
      requestTimeout: 60000, // 60 segundos (aumentado)
      cancelTimeout: 5000
    },
    pool: {
      max: 10,
      min: 0, // Não força conexões no startup (lazy)
      idleTimeoutMillis: 600000, // 10 minutos
      acquireTimeoutMillis: 60000, // 60 segundos (aumentado)
      createTimeoutMillis: 60000, // 60 segundos (aumentado)
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 500
    }
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = config;
