import api from './api';

/**
 * Serviço para consultar estatísticas e auditorias das Azure Functions
 */

// Estatísticas de usuários
export const getUserStatistics = async () => {
  const response = await api.get('/statistics/usuarios');
  return response.data;
};

// Lista logs de auditoria de usuários
export const getUserAuditLogs = async (params = {}) => {
  const { limit = 10, offset = 0 } = params;
  const response = await api.get('/statistics/usuarios-auditoria', {
    params: { limit, offset }
  });
  return response.data;
};

// Busca auditoria específica de usuário
export const getUserAuditById = async (id) => {
  const response = await api.get(`/statistics/usuarios-auditoria/${id}`);
  return response.data;
};

// Lista logs de auditoria de produtos
export const getProductAuditLogs = async (params = {}) => {
  const { limit = 10, offset = 0 } = params;
  const response = await api.get('/statistics/produtos-auditoria', {
    params: { limit, offset }
  });
  return response.data;
};

// Busca auditoria específica de produto
export const getProductAuditById = async (id) => {
  const response = await api.get(`/statistics/produtos-auditoria/${id}`);
  return response.data;
};

export default {
  getUserStatistics,
  getUserAuditLogs,
  getUserAuditById,
  getProductAuditLogs,
  getProductAuditById
};
