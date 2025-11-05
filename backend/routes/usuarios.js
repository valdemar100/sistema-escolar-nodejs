const express = require('express');
const { usuarioQueries } = require('../db/database');

const router = express.Router();

/**
 * LISTAR (READ/SELECT) - 0,25 pontos
 * Rota: GET /api/usuarios
 * Função: Retorna todos os usuários cadastrados no banco de dados
 * 
 * Como funciona:
 * 1. Recebe requisição GET do frontend
 * 2. Chama usuarioQueries.getAll() que executa SELECT * FROM usuarios
 * 3. Retorna array com todos os usuários em formato JSON
 * 
 * SQL equivalente: SELECT * FROM usuarios
 */
router.get('/', async (req, res) => {
    try {
        // Busca todos os usuários no banco SQLite
        const usuarios = await usuarioQueries.getAll();
        
        // Retorna resposta de sucesso com os dados
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

/**
 * BUSCAR POR ID (READ/SELECT) 
 * Rota: GET /api/usuarios/:id
 * Função: Retorna um único usuário específico pelo ID
 * 
 * Como funciona:
 * 1. Recebe o ID pela URL (req.params.id)
 * 2. Busca no banco usando getById(id) - executa SELECT WHERE id = ?
 * 3. Se não encontrar, retorna erro 404
 * 4. Se encontrar, retorna o usuário em JSON
 * 
 * SQL equivalente: SELECT * FROM usuarios WHERE id = ?
 */
router.get('/:id', async (req, res) => {
    try {
        // Extrai o ID dos parâmetros da URL
        const { id } = req.params;
        
        // Busca usuário específico no banco
        const usuario = await usuarioQueries.getById(id);
        
        // Verifica se o usuário existe
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Retorna o usuário encontrado
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

/**
 * INCLUIR/CRIAR (CREATE/INSERT) - 0,25 pontos
 * Rota: POST /api/usuarios
 * Função: Cria um novo usuário no banco de dados
 * 
 * Como funciona:
 * 1. Recebe dados do formulário via req.body (nome, email, senha)
 * 2. VALIDA os dados:
 *    - Verifica se todos os campos obrigatórios foram preenchidos
 *    - Verifica se as senhas coincidem
 *    - Verifica se o email já não está cadastrado
 * 3. Chama usuarioQueries.create() que executa INSERT INTO usuarios
 * 4. Retorna status 201 (Created) com os dados do novo usuário
 * 
 * SQL equivalente: INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)
 */
router.post('/', async (req, res) => {
    try {
        // Extrai os dados enviados do formulário
        const { nome, email, senha, confirmarSenha } = req.body;

        // VALIDAÇÃO 1: Campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }

        // VALIDAÇÃO 2: Senhas devem coincidir
        if (senha !== confirmarSenha) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        // VALIDAÇÃO 3: Email já existe?
        const usuarioExistente = await usuarioQueries.getByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Cria o novo usuário no banco de dados (INSERT)
        const novoUsuario = await usuarioQueries.create(nome, email, senha);
        
        // Retorna sucesso com status 201 (Created)
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

/**
 * EDITAR/ATUALIZAR (UPDATE) - 0,25 pontos
 * Rota: PUT /api/usuarios/:id
 * Função: Atualiza os dados de um usuário existente
 * 
 * Como funciona:
 * 1. Recebe o ID pela URL (req.params.id)
 * 2. Recebe os novos dados pelo req.body (nome, email, senha)
 * 3. VALIDA os dados:
 *    - Verifica se campos obrigatórios foram preenchidos
 *    - Se senha foi alterada, verifica confirmação
 *    - Verifica se o usuário existe
 *    - Verifica se o email não está sendo usado por outro usuário
 * 4. Executa usuarioQueries.update() que faz UPDATE no banco
 * 5. Retorna confirmação de atualização
 * 
 * SQL equivalente: UPDATE usuarios SET nome=?, email=?, senha=? WHERE id=?
 */
router.put('/:id', async (req, res) => {
    try {
        // Extrai o ID da URL e os novos dados do body
        const { id } = req.params;
        const { nome, email, senha, confirmarSenha } = req.body;

        // VALIDAÇÃO 1: Campos obrigatórios
        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nome e email são obrigatórios'
            });
        }

        // VALIDAÇÃO 2: Se senha foi fornecida, deve confirmar
        if (senha && senha !== confirmarSenha) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        // VALIDAÇÃO 3: Usuário existe?
        const usuarioExistente = await usuarioQueries.getById(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // VALIDAÇÃO 4: Email já está em uso por outro usuário?
        const usuarioComEmail = await usuarioQueries.getByEmail(email);
        if (usuarioComEmail && usuarioComEmail.id != id) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Atualiza o usuário no banco (UPDATE)
        // Se senha não foi fornecida, passa null para manter a atual
        const resultado = await usuarioQueries.update(id, nome, email, senha || null);
        
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Retorna confirmação de sucesso
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

/**
 * EXCLUIR/DELETAR (DELETE) - 0,25 pontos
 * Rota: DELETE /api/usuarios/:id
 * Função: Remove um usuário do banco de dados
 * 
 * Como funciona:
 * 1. Recebe o ID do usuário pela URL (req.params.id)
 * 2. Chama usuarioQueries.delete(id) que executa DELETE FROM usuarios
 * 3. Verifica se alguma linha foi afetada (resultado.changes)
 * 4. Se nenhum registro foi deletado, retorna erro 404
 * 5. Se deletou com sucesso, retorna confirmação
 * 
 * SQL equivalente: DELETE FROM usuarios WHERE id = ?
 */
router.delete('/:id', async (req, res) => {
    try {
        // Extrai o ID do usuário a ser deletado
        const { id } = req.params;
        
        // Executa a deleção no banco (DELETE)
        const resultado = await usuarioQueries.delete(id);
        
        // Verifica se algum registro foi deletado
        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Retorna confirmação de exclusão
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