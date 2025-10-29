const express = require('express');

// Verificar se está em produção
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Importar banco de dados apropriado
const database = isProduction 
    ? require('../db/memory-database') 
    : require('../db/database');
const { professorQueries } = database;

const router = express.Router();

// GET /api/professores - Listar todos os professores ou buscar por termo
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let professores;
        
        if (search) {
            professores = await professorQueries.search(search);
        } else {
            professores = await professorQueries.getAll();
        }
        
        res.json({
            success: true,
            data: professores
        });
    } catch (error) {
        console.error('Erro ao listar professores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar professores'
        });
    }
});

// GET /api/professores/:id - Buscar professor por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professor = await professorQueries.getById(id);
        
        if (!professor) {
            return res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }

        res.json({
            success: true,
            data: professor
        });
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar professor'
        });
    }
});

// POST /api/professores - Criar novo professor
router.post('/', async (req, res) => {
    try {
        const { nome, disciplina, email, telefone } = req.body;

        // Validações
        if (!nome || !disciplina) {
            return res.status(400).json({
                success: false,
                message: 'Nome e disciplina são obrigatórios'
            });
        }

        const novoProfessor = await professorQueries.create({ 
            nome, 
            materia: disciplina, 
            email: email || '', 
            telefone: telefone || '' 
        });
        res.status(201).json({
            success: true,
            message: 'Professor criado com sucesso',
            data: novoProfessor
        });
    } catch (error) {
        console.error('Erro ao criar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar professor'
        });
    }
});

// PUT /api/professores/:id - Atualizar professor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, disciplina, email, telefone } = req.body;

        // Validações
        if (!nome || !disciplina) {
            return res.status(400).json({
                success: false,
                message: 'Nome e disciplina são obrigatórios'
            });
        }

        const resultado = await professorQueries.update(id, { 
            nome, 
            materia: disciplina, 
            email: email || '', 
            telefone: telefone || '' 
        });
        
        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Professor atualizado com sucesso',
            data: resultado
        });
    } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar professor'
        });
    }
});

// DELETE /api/professores/:id - Deletar professor
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const resultado = await professorQueries.delete(id);
        
        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Professor deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar professor'
        });
    }
});

module.exports = router;