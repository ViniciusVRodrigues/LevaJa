import api from './api';

export const userService = {
  // Listar todos os usuários
  getAll: async (params = {}) => {
    const { limit = 10, offset = 0 } = params;
    const response = await api.get('/usuarios', { params: { limit, offset } });
    return response.data;
  },

  // Buscar usuário por ID
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Criar novo usuário
  create: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  // Atualizar usuário
  update: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  delete: async (id) => {
    await api.delete(`/usuarios/${id}`);
  },
};
