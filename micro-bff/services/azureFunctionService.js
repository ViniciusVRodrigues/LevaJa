const axios = require('axios');
const config = require('../config');

/**
 * Serviço para comunicação com Azure Functions via HTTP
 */

const azureFunctionClient = axios.create({
  timeout: config.azure?.functions?.timeout || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging de erros
azureFunctionClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Azure Function Error:', error.message);
    throw error;
  }
);

class AzureFunctionService {
  /**
   * Chama a primeira Azure Function (exemplo: processamento de dados)
   */
  async callFunction1(data) {
    try {
      if (!config.azure?.functions?.function1Url) {
        console.warn('Function 1 URL not configured');
        return { success: false, message: 'Function 1 not configured' };
      }

      const response = await azureFunctionClient.post(
        config.azure.functions.function1Url,
        data,
        {
          headers: config.azure.functions.function1Key
            ? { 'x-functions-key': config.azure.functions.function1Key }
            : {}
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Chama a segunda Azure Function (exemplo: notificações)
   */
  async callFunction2(data) {
    try {
      if (!config.azure?.functions?.function2Url) {
        console.warn('Function 2 URL not configured');
        return { success: false, message: 'Function 2 not configured' };
      }

      const response = await azureFunctionClient.post(
        config.azure.functions.function2Url,
        data,
        {
          headers: config.azure.functions.function2Key
            ? { 'x-functions-key': config.azure.functions.function2Key }
            : {}
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método genérico para chamar qualquer Azure Function
   */
  async callFunction(url, data, key = null) {
    try {
      const headers = key ? { 'x-functions-key': key } : {};
      const response = await azureFunctionClient.post(url, data, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AzureFunctionService();
