const productService = require('../services/productService');
const serviceBusService = require('../services/serviceBusService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controller para lógica de negócio relacionada a lotes de produtos
 */

// Regex de validação de ID (formato MongoDB ObjectId)
const ID_REGEX = /^[a-fA-F0-9]{24}$/;

/**
 * Valida formato de ID
 */
function validateId(id) {
  if (!ID_REGEX.test(id)) {
    throw new AppError('ID inválido', 400, 'BAD_REQUEST', ['O ID deve ser um ObjectId válido']);
  }
}

/**
 * Validação de dados de produto
 */
function validateProductData(productData) {
  const errors = [];

  // Validação de campos obrigatórios
  if (!productData.nome) {
    errors.push('O campo nome é obrigatório');
  }
  if (!productData.categoria) {
    errors.push('O campo categoria é obrigatório');
  }
  if (productData.estoque === undefined || productData.estoque === null) {
    errors.push('O campo estoque é obrigatório');
  }
  if (productData.valor === undefined || productData.valor === null) {
    errors.push('O campo valor é obrigatório');
  }

  if (errors.length > 0) {
    throw new AppError('Campos obrigatórios faltando', 400, 'BAD_REQUEST', errors);
  }

  // Validação de tamanho do nome
  if (productData.nome.length < 3 || productData.nome.length > 150) {
    throw new AppError(
      'Nome inválido',
      400,
      'BAD_REQUEST',
      ['O nome deve ter entre 3 e 150 caracteres']
    );
  }

  // Validação de estoque
  if (typeof productData.estoque !== 'number' || productData.estoque < 0) {
    throw new AppError(
      'Estoque inválido',
      400,
      'BAD_REQUEST',
      ['O estoque deve ser um número maior ou igual a 0']
    );
  }

  // Validação de valor
  if (typeof productData.valor !== 'number' || productData.valor < 0) {
    throw new AppError(
      'Valor inválido',
      400,
      'BAD_REQUEST',
      ['O valor deve ser um número maior ou igual a 0']
    );
  }
}

class ProductController {
  /**
   * Lista todos os lotes de produtos
   */
  async getProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const categoria = req.query.categoria || null;

      // Validação básica
      if (limit < 1 || limit > 100) {
        throw new AppError('O parâmetro limit deve estar entre 1 e 100', 400, 'BAD_REQUEST');
      }
      if (offset < 0) {
        throw new AppError('O parâmetro offset deve ser maior ou igual a 0', 400, 'BAD_REQUEST');
      }

      const data = await productService.getProducts(limit, offset, categoria);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca um lote de produto por ID
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      validateId(id);
      const data = await productService.getProductById(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria um novo lote de produto
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;

      // Validação de dados
      validateProductData(productData);

      const data = await productService.createProduct(productData);

      // Envia evento para Service Bus (criação via evento)
      try {
        await serviceBusService.sendMessage('lote-criado', {
          eventType: 'LoteCriado',
          timestamp: new Date().toISOString(),
          data: {
            loteId: data.id || data._id || data.insertedId,
            nome: productData.nome,
            categoria: productData.categoria,
            estoque: productData.estoque,
            validade: productData.validade || null,
            valor: productData.valor
          }
        });
        console.log('Evento LoteCriado enviado para Service Bus');
      } catch (busError) {
        // Não falha a criação se o Service Bus não estiver configurado
        console.warn('Não foi possível enviar evento para Service Bus:', busError.message);
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um lote de produto
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      validateId(id);
      const productData = req.body;

      // Validação de dados
      validateProductData(productData);

      const data = await productService.updateProduct(id, productData);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta um lote de produto
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      validateId(id);
      await productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza o estoque de um lote de produto
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      validateId(id);
      const { estoque } = req.body;

      // Validação do campo estoque
      if (estoque === undefined) {
        throw new AppError(
          'Campo obrigatório faltando',
          400,
          'BAD_REQUEST',
          ['O campo estoque é obrigatório']
        );
      }

      // Validação de estoque
      if (typeof estoque !== 'number' || estoque < 0) {
        throw new AppError(
          'Estoque inválido',
          400,
          'BAD_REQUEST',
          ['O estoque deve ser um número maior ou igual a 0']
        );
      }

      const data = await productService.updateStock(id, estoque);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
