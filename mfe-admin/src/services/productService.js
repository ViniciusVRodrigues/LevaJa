import api from './api';

export const productService = {
  // Listar todos os lotes de produtos
  getAll: async (params = {}) => {
    const { limit = 10, offset = 0, categoria } = params;
    const queryParams = { limit, offset };
    if (categoria) queryParams.categoria = categoria;
    const response = await api.get('/lotes-produtos', { params: queryParams });
    return response.data;
  },

  // Buscar lote de produto por ID
  getById: async (id) => {
    const response = await api.get(`/lotes-produtos/${id}`);
    return response.data;
  },

  // Criar novo lote de produto
  create: async (productData) => {
    const response = await api.post('/lotes-produtos', productData);
    return response.data;
  },

  // Atualizar lote de produto
  update: async (id, productData) => {
    const response = await api.put(`/lotes-produtos/${id}`, productData);
    return response.data;
  },

  // Deletar lote de produto
  delete: async (id) => {
    await api.delete(`/lotes-produtos/${id}`);
  },

  // Atualizar estoque
  updateStock: async (id, estoque) => {
    const response = await api.patch(`/lotes-produtos/${id}/estoque`, { estoque });
    return response.data;
  },
};
