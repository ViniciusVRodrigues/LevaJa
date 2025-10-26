const morgan = require('morgan');

/**
 * Configuração de logging de requisições HTTP
 */

// Formato customizado de log
morgan.token('body', (req) => {
  // Não logar senhas
  if (req.body && req.body.senha) {
    const sanitized = { ...req.body, senha: '***' };
    return JSON.stringify(sanitized);
  }
  return JSON.stringify(req.body);
});

// Formato de desenvolvimento com cores
const devFormat = ':method :url :status :response-time ms - :res[content-length] :body';

// Formato de produção mais conciso
const prodFormat = ':remote-addr - :method :url :status :response-time ms';

const logger = process.env.NODE_ENV === 'production' 
  ? morgan(prodFormat)
  : morgan(devFormat);

module.exports = logger;
