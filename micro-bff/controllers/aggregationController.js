const userService = require('../services/userService');
const productService = require('../services/productService');
const azureFunctionService = require('../services/azureFunctionService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controller para agregação de dados de múltiplas fontes
 */

class AggregationController {
  /**
   * Agrega dados de usuários e auditoria
   * GET /agregacao/usuarios-completo
   */
  async getUsersWithAudit(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;

      // Busca usuários do microserviço
      const usersResponse = await userService.getAll({ limit, offset });

      // Tenta buscar estatísticas de auditoria da function
      let auditStats = null;
      try {
        auditStats = await azureFunctionService.callFunction1({
          path: '/api/statistics',
          method: 'GET'
        });
      } catch (error) {
        console.warn('Não foi possível buscar estatísticas de auditoria:', error.message);
      }

      // Retorna dados agregados
      res.json({
        usuarios: usersResponse.data,
        total: usersResponse.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        auditoria: auditStats || { message: 'Estatísticas de auditoria não disponíveis' }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega dados de produtos e auditoria
   * GET /agregacao/produtos-completo
   */
  async getProductsWithAudit(req, res, next) {
    try {
      const { limit = 10, offset = 0, categoria } = req.query;

      // Busca produtos do microserviço
      const productsResponse = await productService.getAll({ limit, offset, categoria });

      // Tenta buscar relatórios de auditoria da function
      let lowStockReport = null;
      let expirationReport = null;

      try {
        lowStockReport = await azureFunctionService.callFunction2({
          path: '/api/relatorios/estoque-baixo',
          method: 'GET'
        });
      } catch (error) {
        console.warn('Não foi possível buscar relatório de estoque baixo:', error.message);
      }

      try {
        expirationReport = await azureFunctionService.callFunction2({
          path: '/api/relatorios/vencimentos-proximos',
          method: 'GET'
        });
      } catch (error) {
        console.warn('Não foi possível buscar relatório de vencimentos:', error.message);
      }

      // Retorna dados agregados
      res.json({
        produtos: productsResponse.data,
        total: productsResponse.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        relatorios: {
          estoqueBaixo: lowStockReport || { message: 'Relatório não disponível' },
          vencimentosProximos: expirationReport || { message: 'Relatório não disponível' }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna dashboard completo com dados agregados de todas as fontes
   * GET /agregacao/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      // Busca resumo de usuários
      const usersResponse = await userService.getAll({ limit: 5, offset: 0 });

      // Busca resumo de produtos
      const productsResponse = await productService.getAll({ limit: 5, offset: 0 });

      // Tenta buscar estatísticas de auditoria
      let userStats = null;
      try {
        userStats = await azureFunctionService.callFunction1({
          path: '/api/statistics',
          method: 'GET'
        });
      } catch (error) {
        console.warn('Estatísticas de usuários não disponíveis:', error.message);
      }

      // Tenta buscar relatórios de produtos
      let lowStock = null;
      let nearExpiration = null;

      try {
        lowStock = await azureFunctionService.callFunction2({
          path: '/api/relatorios/estoque-baixo',
          method: 'GET',
          params: { limit: 5 }
        });
      } catch (error) {
        console.warn('Relatório de estoque baixo não disponível:', error.message);
      }

      try {
        nearExpiration = await azureFunctionService.callFunction2({
          path: '/api/relatorios/vencimentos-proximos',
          method: 'GET',
          params: { limit: 5 }
        });
      } catch (error) {
        console.warn('Relatório de vencimentos não disponível:', error.message);
      }

      // Retorna dashboard agregado
      res.json({
        usuarios: {
          total: usersResponse.total,
          recentes: usersResponse.data,
          estatisticas: userStats || { message: 'Estatísticas não disponíveis' }
        },
        produtos: {
          total: productsResponse.total,
          recentes: productsResponse.data,
          alertas: {
            estoqueBaixo: lowStock || { message: 'Relatório não disponível' },
            vencimentosProximos: nearExpiration || { message: 'Relatório não disponível' }
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AggregationController();
