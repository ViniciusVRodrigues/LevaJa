import api from './api';

/**
 * Serviço para consultar dados agregados de múltiplas fontes
 */

// Dashboard completo com dados agregados
export const getDashboard = async () => {
  const response = await api.get('/agregacao/dashboard');
  return response.data;
};

// Usuários com dados de auditoria
export const getUsersWithAudit = async (params = {}) => {
  const { limit = 10, offset = 0 } = params;
  const response = await api.get('/agregacao/usuarios-completo', {
    params: { limit, offset }
  });
  return response.data;
};

// Produtos com relatórios de auditoria
export const getProductsWithAudit = async (params = {}) => {
  const { limit = 10, offset = 0, categoria } = params;
  const response = await api.get('/agregacao/produtos-completo', {
    params: { limit, offset, categoria }
  });
  return response.data;
};

export default {
  getDashboard,
  getUsersWithAudit,
  getProductsWithAudit
};
