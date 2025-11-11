import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for Azure SQL reconnection error
    if (error.response?.status === 503 && 
        (error.response?.data?.error === 'AZURE_SQL_RECONNECTING' || 
         error.response?.data?.code === 'AZURE_SQL_RECONNECTING')) {
      const retryIn = error.response.data.retryIn || 15;
      const message = error.response.data.message || 
        `O banco de dados está reconectando. Por favor, tente novamente em ${retryIn} segundos.`;
      
      console.warn('Azure SQL Reconnecting:', message);
      
      // Create a custom error with reconnection info
      const reconnectionError = new Error(message);
      reconnectionError.isReconnecting = true;
      reconnectionError.retryIn = retryIn;
      reconnectionError.originalError = error;
      
      return Promise.reject(reconnectionError);
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao comunicar com o servidor';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

export default api;
