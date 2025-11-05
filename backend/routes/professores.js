const express = require('express');
const { professorQueries } = require('../db/database');

const router = express.Router();

/**
 * ============================================
 * CADASTRO 3: PROFESSORES - CRUD COMPLETO
 * ============================================
 * 
 * Estrutura idêntica aos outros cadastros, com campos específicos:
 * - nome: Nome do professor
 * - email: Email do professor
 * - disciplina: Matéria que leciona
 * - telefone: Telefone de contato
 * 
 * Operações CRUD:
 * - LISTAR (GET): Busca todos os professores ou filtra por termo
 * - INCLUIR (POST): Cria novo professor
 * - EDITAR (PUT): Atualiza dados do professor
 * - EXCLUIR (DELETE): Remove professor do banco
 */

/**
 * LISTAR PROFESSORES (READ/SELECT)
 * Rota: GET /api/professores
 * Função: Retorna todos os professores ou busca por nome/disciplina
 * 
 * Diferencial: Busca tanto no nome quanto na disciplina
 * SQL: SELECT * FROM professores WHERE nome LIKE '%?%' OR disciplina LIKE '%?%'
 */
router.get('/', async (req, res) => {
    try {
        // Verifica se há parâmetro de busca
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

        const novoProfessor = await professorQueries.create(nome, disciplina, email || '', telefone || '');
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

        const resultado = await professorQueries.update(id, nome, disciplina, email || '', telefone || '');
        
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Professor atualizado com sucesso'
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
        
        if (resultado.changes === 0) {
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