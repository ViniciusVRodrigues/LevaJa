const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * Rotas para operações de usuários
 */

// GET /api/v1/usuarios - Lista todos os usuários
router.get('/', userController.getUsers.bind(userController));

// GET /api/v1/usuarios/:id - Busca um usuário por ID
router.get('/:id', userController.getUserById.bind(userController));

// POST /api/v1/usuarios - Cria um novo usuário
router.post('/', userController.createUser.bind(userController));

// PUT /api/v1/usuarios/:id - Atualiza um usuário
router.put('/:id', userController.updateUser.bind(userController));

// DELETE /api/v1/usuarios/:id - Deleta um usuário
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
