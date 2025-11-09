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
      connectTimeout: 30000, // 30 segundos
      requestTimeout: 30000   // 30 segundos
    },
    pool: {
      max: 10,
      min: 2, // Mantém pelo menos 2 conexões ativas
      idleTimeoutMillis: 300000, // 5 minutos (aumentado de 30s)
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = config;
