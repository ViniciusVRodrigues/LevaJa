import api from './api';

/**
 * Serviço para consultar relatórios
 */

// Relatório de produtos com estoque baixo (apenas array)
export const getLowStockReport = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/estoque-baixo', {
    params: { limit }
  });
  return response.data;
};

// Relatório completo de produtos com estoque baixo (inclui verificação)
export const getLowStockReportComplete = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/estoque-baixo-completo', {
    params: { limit }
  });
  return response.data;
};

// Relatório de produtos próximos do vencimento (apenas array)
export const getNearExpirationReport = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/vencimentos-proximos', {
    params: { limit }
  });
  return response.data;
};

// Relatório completo de produtos próximos do vencimento (inclui verificação)
export const getNearExpirationReportComplete = async (params = {}) => {
  const { limit = 50 } = params;
  const response = await api.get('/statistics/relatorios/vencimentos-proximos-completo', {
    params: { limit }
  });
  return response.data;
};

export default {
  getLowStockReport,
  getLowStockReportComplete,
  getNearExpirationReport,
  getNearExpirationReportComplete
};
