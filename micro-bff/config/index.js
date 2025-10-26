require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  services: {
    userService: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000
    },
    productService: {
      url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000
    }
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
