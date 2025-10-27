import api from './api';

/**
 * Serviço para consultar relatórios
 */

// Relatório de produtos com estoque baixo
export const getLowStockReport = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/estoque-baixo', {
    params: { limit }
  });
  return response.data;
};

// Relatório de produtos próximos do vencimento
export const getNearExpirationReport = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/vencimentos-proximos', {
    params: { limit }
  });
  return response.data;
};

export default {
  getLowStockReport,
  getNearExpirationReport
};
