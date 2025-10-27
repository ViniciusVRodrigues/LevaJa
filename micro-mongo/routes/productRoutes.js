const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * Rotas de lotes de produtos
 */

// GET /lotes-produtos - Lista produtos (com paginação e filtro)
router.get('/', productController.getAll);

// GET /lotes-produtos/:id - Busca produto por ID
router.get('/:id', productController.getById);

// POST /lotes-produtos - Cria novo produto
router.post('/', productController.create);

// PUT /lotes-produtos/:id - Atualiza produto
router.put('/:id', productController.update);

// PATCH /lotes-produtos/:id/estoque - Atualiza estoque
router.patch('/:id/estoque', productController.updateStock);

// DELETE /lotes-produtos/:id - Deleta produto
router.delete('/:id', productController.delete);

module.exports = router;
