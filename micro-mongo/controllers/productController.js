const LoteProduct = require('../models/LoteProduct');

/**
 * Controller para operações de lotes de produtos
 */

class ProductController {
  /**
   * Lista todos os produtos (GET /lotes-produtos)
   */
  async getAll(req, res) {
    try {
      const { limit = 10, offset = 0, categoria } = req.query;

      // Filtro por categoria (opcional)
      const filter = categoria ? { categoria } : {};

      // Total de registros
      const total = await LoteProduct.countDocuments(filter);

      // Query paginada
      const products = await LoteProduct.find(filter)
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      res.json({
        data: products,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  /**
   * Busca produto por ID (GET /lotes-produtos/:id)
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Validate if ID is a valid MongoDB ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const product = await LoteProduct.findById(id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  /**
   * Cria novo produto (POST /lotes-produtos)
   */
  async create(req, res) {
    try {
      const { nome, categoria, estoque, valor, validade } = req.body;

      // Validação básica
      if (!nome || !categoria || estoque === undefined || valor === undefined) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: nome, categoria, estoque, valor' 
        });
      }

      const product = new LoteProduct({
        nome,
        categoria,
        estoque,
        valor,
        validade: validade ? new Date(validade) : undefined
      });

      await product.save();

      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  /**
   * Atualiza produto (PUT /lotes-produtos/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, categoria, estoque, valor, validade } = req.body;

      // Validate if ID is a valid MongoDB ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const updateData = {};
      if (nome !== undefined) updateData.nome = nome;
      if (categoria !== undefined) updateData.categoria = categoria;
      if (estoque !== undefined) updateData.estoque = estoque;
      if (valor !== undefined) updateData.valor = valor;
      if (validade !== undefined) updateData.validade = validade ? new Date(validade) : null;

      const product = await LoteProduct.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  /**
   * Atualiza estoque (PATCH /lotes-produtos/:id/estoque)
   */
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { estoque } = req.body;

      if (estoque === undefined) {
        return res.status(400).json({ error: 'Campo estoque é obrigatório' });
      }

      // Validate if ID is a valid MongoDB ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const product = await LoteProduct.findByIdAndUpdate(
        id,
        { estoque },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }

  /**
   * Deleta produto (DELETE /lotes-produtos/:id)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validate if ID is a valid MongoDB ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const product = await LoteProduct.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}

module.exports = new ProductController();
