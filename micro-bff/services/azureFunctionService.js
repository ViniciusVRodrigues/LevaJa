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
  async callFunction1(options) {
    try {
      if (!config.azure?.functions?.function1Url) {
        console.warn('Function 1 URL not configured');
        return { success: false, message: 'Function 1 not configured' };
      }

      // Support both old format (direct data) and new format (options object)
      const isOptionsObject = options && (options.path || options.method);
      
      if (isOptionsObject) {
        const { path = '', method = 'POST', params = {}, data = {} } = options;
        const baseUrl = config.azure.functions.function1Url.replace(/\/$/, '');
        const url = `${baseUrl}${path}`;
        
        const headers = config.azure.functions.function1Key
          ? { 'x-functions-key': config.azure.functions.function1Key }
          : {};

        const requestConfig = { headers };
        
        if (method.toUpperCase() === 'GET') {
          requestConfig.params = params;
          const response = await azureFunctionClient.get(url, requestConfig);
          return response.data;
        } else {
          const response = await azureFunctionClient.post(url, data, requestConfig);
          return response.data;
        }
      } else {
        // Legacy: direct POST with data
        const response = await azureFunctionClient.post(
          config.azure.functions.function1Url,
          options,
          {
            headers: config.azure.functions.function1Key
              ? { 'x-functions-key': config.azure.functions.function1Key }
              : {}
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error calling Function1:', error.message);
      throw error;
    }
  }

  /**
   * Chama a segunda Azure Function (exemplo: notificações)
   */
  async callFunction2(options) {
    try {
      if (!config.azure?.functions?.function2Url) {
        console.warn('Function 2 URL not configured');
        return { success: false, message: 'Function 2 not configured' };
      }

      // Support both old format (direct data) and new format (options object)
      const isOptionsObject = options && (options.path || options.method);
      
      if (isOptionsObject) {
        const { path = '', method = 'POST', params = {}, data = {} } = options;
        const baseUrl = config.azure.functions.function2Url.replace(/\/$/, '');
        const url = `${baseUrl}${path}`;
        
        const headers = config.azure.functions.function2Key
          ? { 'x-functions-key': config.azure.functions.function2Key }
          : {};

        const requestConfig = { headers };
        
        if (method.toUpperCase() === 'GET') {
          requestConfig.params = params;
          const response = await azureFunctionClient.get(url, requestConfig);
          return response.data;
        } else {
          const response = await azureFunctionClient.post(url, data, requestConfig);
          return response.data;
        }
      } else {
        // Legacy: direct POST with data
        const response = await azureFunctionClient.post(
          config.azure.functions.function2Url,
          options,
          {
            headers: config.azure.functions.function2Key
              ? { 'x-functions-key': config.azure.functions.function2Key }
              : {}
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error calling Function2:', error.message);
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
