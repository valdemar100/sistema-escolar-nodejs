const express = require('express');
const { alunoQueries } = require('../db/database');

const router = express.Router();

/**
 * ============================================
 * CADASTRO 2: ALUNOS - CRUD COMPLETO
 * ============================================
 * 
 * Estrutura idêntica ao cadastro de usuários, mas com campos específicos:
 * - nome: Nome do aluno
 * - email: Email do aluno
 * - curso: Curso que está matriculado
 * - matricula: Número de matrícula único
 * 
 * Operações CRUD:
 * - LISTAR (GET): Busca todos os alunos ou filtra por nome
 * - INCLUIR (POST): Cria novo aluno
 * - EDITAR (PUT): Atualiza dados do aluno
 * - EXCLUIR (DELETE): Remove aluno do banco
 */

/**
 * LISTAR ALUNOS (READ/SELECT)
 * Rota: GET /api/alunos
 * Função: Retorna todos os alunos ou busca por nome
 * 
 * Diferencial: Tem sistema de busca por nome (search query parameter)
 * SQL: SELECT * FROM alunos ou SELECT * FROM alunos WHERE nome LIKE '%?%'
 */
router.get('/', async (req, res) => {
    try {
        // Verifica se há parâmetro de busca na URL (?search=nome)
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

        const novoAluno = await alunoQueries.create(nome, dataNascimento, serieTurma, email || '', telefone || '');
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

        const resultado = await alunoQueries.update(id, nome, dataNascimento, serieTurma, email || '', telefone || '');
        
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Aluno atualizado com sucesso'
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
        
        if (resultado.changes === 0) {
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