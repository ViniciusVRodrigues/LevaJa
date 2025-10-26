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
    // Permite múltiplas origens separadas por vírgula
    // Em desenvolvimento, pode usar '*', mas em produção deve especificar domínios
    origin: process.env.CORS_ORIGIN 
      ? (process.env.CORS_ORIGIN === '*' 
          ? '*' 
          : process.env.CORS_ORIGIN.split(',').map(o => o.trim()))
      : 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Configurações do Azure
  azure: {
    // Azure Functions
    functions: {
      function1Url: process.env.AZURE_FUNCTION1_URL,
      function1Key: process.env.AZURE_FUNCTION1_KEY,
      function2Url: process.env.AZURE_FUNCTION2_URL,
      function2Key: process.env.AZURE_FUNCTION2_KEY,
      timeout: parseInt(process.env.AZURE_FUNCTION_TIMEOUT) || 10000
    },
    // Azure Service Bus
    serviceBus: {
      connectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
      queueName: process.env.AZURE_SERVICE_BUS_QUEUE_NAME || 'default-queue'
    }
  },
  
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
