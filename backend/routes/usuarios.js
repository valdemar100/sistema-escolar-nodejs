const express = require('express');
const { usuarioQueries } = require('../db/database');

const router = express.Router();

// GET /api/usuarios - Listar todos os usuários
router.get('/', async (req, res) => {
    try {
        const usuarios = await usuarioQueries.getAll();
        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários'
        });
    }
});

// GET /api/usuarios/:id - Buscar usuário por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await usuarioQueries.getById(id);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário'
        });
    }
});

// POST /api/usuarios - Criar novo usuário
router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        // Verificar se email já existe
        const usuarioExistente = await usuarioQueries.getByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        const novoUsuario = await usuarioQueries.create(nome, email, senha);
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: novoUsuario
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário'
        });
    }
});

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha, confirmarSenha } = req.body;

        // Validações
        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nome e email são obrigatórios'
            });
        }

        // Se senha foi fornecida, verificar confirmação
        if (senha && senha !== confirmarSenha) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        // Verificar se usuário existe
        const usuarioExistente = await usuarioQueries.getById(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se email já está em uso por outro usuário
        const usuarioComEmail = await usuarioQueries.getByEmail(email);
        if (usuarioComEmail && usuarioComEmail.id != id) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        const resultado = await usuarioQueries.update(id, nome, email, senha || null);
        
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar usuário'
        });
    }
});

// DELETE /api/usuarios/:id - Deletar usuário
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const resultado = await usuarioQueries.delete(id);
        
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuário deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar usuário'
        });
    }
});

module.exports = router;