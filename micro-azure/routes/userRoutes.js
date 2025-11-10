const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * Rotas de usuários
 */

// GET /usuarios - Lista usuários (com paginação)
router.get('/', userController.getAll);

// GET /usuarios/:id - Busca usuário por ID
router.get('/:id', userController.getById);

// POST /usuarios - Cria novo usuário
router.post('/', userController.create);

// PUT /usuarios/:id - Atualiza usuário
router.put('/:id', userController.update);

// DELETE /usuarios/:id - Deleta usuário
router.delete('/:id', userController.delete);

module.exports = router;
