/**
 * Middleware centralizado para tratamento de erros
 */

class AppError extends Error {
  constructor(message, statusCode, code = null, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, code, details = [] } = err;

  // Tratamento para erros de axios (chamadas aos microsserviços)
  if (err.response) {
    statusCode = err.response.status || 500;
    message = err.response.data?.message || message || 'Erro ao comunicar com o serviço';
    code = err.response.data?.code || err.response.data?.error || code;
    details = err.response.data?.details || details;
    
    // Se o microsserviço retornou erro de reconexão, preserva o payload completo
    if (code === 'AZURE_SQL_RECONNECTING' || err.response.data?.error === 'AZURE_SQL_RECONNECTING') {
      const retryIn = err.response.data?.retryIn || 15;
      
      // Log para diagnóstico
      console.warn('Azure SQL reconnecting:', {
        message,
        retryIn,
        path: req.path,
        method: req.method
      });
      
      return res.status(503).json({
        error: 'AZURE_SQL_RECONNECTING',
        retryIn,
        message: message || 'O banco de dados está reconectando, tente novamente em alguns instantes.'
      });
    }
  } else if (err.request) {
    statusCode = 503;
    message = 'Serviço indisponível no momento, tente novamente em alguns instantes';
    code = 'SERVICE_UNAVAILABLE';
  }

  // Log do erro (em produção poderia integrar com serviço de log)
  console.error('Error:', {
    message,
    statusCode,
    code,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Não expor stack trace em produção
  const response = {
    message,
    ...(code && { code }),
    ...(details.length > 0 && { details })
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota ${req.method} ${req.path} não encontrada`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler
};
