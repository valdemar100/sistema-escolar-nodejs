const express = require('express');

// Verificar se está em produção
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Importar banco de dados apropriado
const database = isProduction 
    ? require('../db/memory-database') 
    : require('../db/database');
const { alunoQueries } = database;

const router = express.Router();

// GET /api/alunos - Listar todos os alunos ou buscar por nome
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let alunos;
        
        if (search) {
            alunos = await alunoQueries.searchByName(search);
        } else {
            alunos = await alunoQueries.getAll();
        }
        
        res.json({
            success: true,
            data: alunos
        });
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar alunos'
        });
    }
});

// GET /api/alunos/:id - Buscar aluno por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const aluno = await alunoQueries.getById(id);
        
        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar aluno'
        });
    }
});

// POST /api/alunos - Criar novo aluno
router.post('/', async (req, res) => {
    try {
        const { nome, dataNascimento, serieTurma, email, telefone } = req.body;

        // Validações
        if (!nome || !dataNascimento || !serieTurma) {
            return res.status(400).json({
                success: false,
                message: 'Nome, data de nascimento e série/turma são obrigatórios'
            });
        }

        // Validar formato da data
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(dataNascimento)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de data inválido (use AAAA-MM-DD)'
            });
        }

        const novoAluno = await alunoQueries.create({ 
            nome, 
            data_nascimento: dataNascimento, 
            serie_turma: serieTurma, 
            email: email || '', 
            telefone: telefone || '' 
        });
        res.status(201).json({
            success: true,
            message: 'Aluno criado com sucesso',
            data: novoAluno
        });
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar aluno'
        });
    }
});

// PUT /api/alunos/:id - Atualizar aluno
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, dataNascimento, serieTurma, email, telefone } = req.body;

        // Validações
        if (!nome || !dataNascimento || !serieTurma) {
            return res.status(400).json({
                success: false,
                message: 'Nome, data de nascimento e série/turma são obrigatórios'
            });
        }

        // Validar formato da data
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(dataNascimento)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de data inválido (use AAAA-MM-DD)'
            });
        }

        const resultado = await alunoQueries.update(id, { 
            nome, 
            data_nascimento: dataNascimento, 
            serie_turma: serieTurma, 
            email: email || '', 
            telefone: telefone || '' 
        });
        
        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Aluno atualizado com sucesso',
            data: resultado
        });
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar aluno'
        });
    }
});

// DELETE /api/alunos/:id - Deletar aluno
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const resultado = await alunoQueries.delete(id);
        
        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Aluno deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar aluno'
        });
    }
});

module.exports = router;