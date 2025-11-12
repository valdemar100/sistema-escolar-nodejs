/**
 * ============================================
 * CRUD DE USUÁRIOS - JavaScript
 * ============================================
 * Gerencia a criação, edição, exclusão e listagem de usuários
 */

// Define a URL base da API
const API_BASE = window.location.origin + '/api';

/**
 * SELEÇÃO DE ELEMENTOS DO DOM
 * Todos os elementos que serão manipulados
 */
const modal = document.getElementById('modal'); // Modal (caixa de diálogo)
const modalTitle = document.getElementById('modalTitle'); // Título do modal
const usuarioForm = document.getElementById('usuarioForm'); // Formulário
const usuarioIdInput = document.getElementById('usuarioId'); // ID do usuário (oculto)
const nomeInput = document.getElementById('nome'); // Campo nome
const emailInput = document.getElementById('email'); // Campo email
const senhaInput = document.getElementById('senha'); // Campo senha
const confirmarSenhaInput = document.getElementById('confirmarSenha'); // Campo confirmar senha
const salvarBtn = document.getElementById('salvarBtn'); // Botão salvar
const tabelaUsuarios = document.getElementById('tabelaUsuarios'); // Tbody da tabela
const messageDiv = document.getElementById('message'); // Div de mensagens

/**
 * ESTADO DA APLICAÇÃO
 * Variável para rastrear se estamos criando ou editando
 */
let editandoUsuario = false; // true = editar, false = criar novo

/**
 * FUNÇÃO: Verificar autenticação
 * Valida se o usuário está logado
 * Se não estiver, redireciona para login
 */
function verificarAuth() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = '/';
        return null;
    }
    return JSON.parse(usuario); // Converte JSON string em objeto
}

/**
 * FUNÇÃO: Fazer logout
 * Remove usuário do localStorage e redireciona para login
 */
function logout() {
    localStorage.removeItem('usuario'); // Remove dados do navegador
    window.location.href = '/'; // Volta para login
}

/**
 * FUNÇÃO: Toggle menu mobile
 * Abre/fecha o menu de navegação em celular
 */
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('show'); // Alterna classe 'show'
}

/**
 * FUNÇÃO: Exibir mensagens
 * Mostra mensagem de sucesso/erro
 */
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    // Esconder após 5 segundos
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

/**
 * FUNÇÃO: Abrir modal (criar ou editar)
 * Se usuario = null, modo criar
 * Se usuario = objeto, modo editar
 */
function abrirModal(usuario = null) {
    if (usuario) {
        // ========== MODO EDIÇÃO ==========
        editandoUsuario = true;
        modalTitle.textContent = 'Editar Usuário';
        usuarioIdInput.value = usuario.id; // Armazena ID para saber qual editar
        nomeInput.value = usuario.nome; // Preenche campo com dados atuais
        emailInput.value = usuario.email;
        senhaInput.required = false; // Senha não obrigatória (pode manter a atual)
        confirmarSenhaInput.required = false;
        senhaInput.placeholder = 'Deixe em branco para manter a senha atual';
        confirmarSenhaInput.placeholder = 'Deixe em branco para manter a senha atual';
    } else {
        // ========== MODO CRIAÇÃO ==========
        editandoUsuario = false;
        modalTitle.textContent = 'Adicionar Usuário';
        usuarioForm.reset(); // Limpa todos os campos
        usuarioIdInput.value = ''; // Sem ID = novo registro
        senhaInput.required = true; // Senha obrigatória
        confirmarSenhaInput.required = true;
        senhaInput.placeholder = 'Digite a senha';
        confirmarSenhaInput.placeholder = 'Confirme a senha';
    }
    
    modal.classList.add('show'); // Mostra o modal
    nomeInput.focus(); // Coloca cursor no primeiro campo
}

/**
 * FUNÇÃO: Fechar modal
 * Remove a classe 'show' e limpa o formulário
 */
function fecharModal() {
    modal.classList.remove('show'); // Esconde o modal
    usuarioForm.reset(); // Limpa campos
    editandoUsuario = false; // Reseta estado
}

/**
 * FUNÇÃO: Carregar lista de usuários
 * Busca todos os usuários da API via GET
 * Exibe na tabela
 */
async function carregarUsuarios() {
    try {
        // Faz requisição GET para /api/usuarios
        const response = await fetch(`${API_BASE}/usuarios`);
        const data = await response.json(); // Converte resposta em JSON

        if (data.success) {
            // Se sucesso, exibe usuários na tabela
            exibirUsuarios(data.data);
        } else {
            showMessage('Erro ao carregar usuários: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showMessage('Erro de conexão ao carregar usuários');
    }
}

/**
 * FUNÇÃO: Exibir usuários na tabela
 * @param {array} usuarios - Array de usuários da API
 * 
 * Usa map() para converter cada usuário em uma linha HTML da tabela
 */
function exibirUsuarios(usuarios) {
    // Se não há usuários, mostra mensagem
    if (usuarios.length === 0) {
        tabelaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum usuário encontrado</td>
            </tr>
        `;
        return;
    }

    // map() transforma array de usuários em array de linhas HTML
    // join('') concatena todas as linhas em uma string
    tabelaUsuarios.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.id}</td> <!-- ID do usuário -->
            <td>${usuario.nome}</td> <!-- Nome -->
            <td>${usuario.email}</td> <!-- Email -->
            <td>${formatarData(usuario.created_at)}</td> <!-- Data de criação formatada -->
            <td>
                <!-- Botão EDITAR: onclick chama editarUsuario com o ID -->
                <button class="btn btn-small btn-primary" onclick="editarUsuario(${usuario.id})">
                    ✏️ Editar
                </button>
                <!-- Botão EXCLUIR: onclick chama confirmarExclusao -->
                <button class="btn btn-small btn-error" onclick="confirmarExclusao(${usuario.id}, '${usuario.nome}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join(''); // Join() junta todas as strings
}

/**
 * FUNÇÃO: Formatar data
 * @param {string} dataString - Data em formato ISO (ex: 2025-11-12T10:30:00)
 * @returns {string} - Data formatada (ex: 12/11/2025 10:30:00)
 * 
 * Converte data ISO para formato brasileiro
 */
function formatarData(dataString) {
    const data = new Date(dataString); // Cria objeto Date
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

/**
 * FUNÇÃO: Editar usuário
 * @param {number} id - ID do usuário a editar
 * 
 * 1. Busca dados do usuário via GET
 * 2. Abre modal com dados preenchidos
 */
async function editarUsuario(id) {
    try {
        // GET /api/usuarios/:id (busca um usuário específico)
        const response = await fetch(`${API_BASE}/usuarios/${id}`);
        const data = await response.json();

        if (data.success) {
            // Abre modal em modo edição com os dados
            abrirModal(data.data);
        } else {
            showMessage('Erro ao buscar usuário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        showMessage('Erro de conexão ao buscar usuário');
    }
}

/**
 * FUNÇÃO: Confirmar exclusão
 * @param {number} id - ID do usuário
 * @param {string} nome - Nome do usuário
 * 
 * Mostra diálogo de confirmação antes de excluir
 * Se usuário clica "OK", chama excluirUsuario()
 */
function confirmarExclusao(id, nome) {
    // confirm() mostra caixa de diálogo nativa do navegador
    // Retorna true se clicou OK, false se cancelou
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
        excluirUsuario(id); // Só executa se confirmou
    }
}

/**
 * FUNÇÃO: Excluir usuário
 * @param {number} id - ID do usuário a deletar
 * 
 * Faz requisição DELETE para /api/usuarios/:id
 * Recarrega lista após deletar
 */
async function excluirUsuario(id) {
    try {
        // DELETE /api/usuarios/:id (remove do banco)
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'DELETE' // HTTP DELETE
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Usuário excluído com sucesso!', 'success');
            carregarUsuarios(); // Recarrega a lista
        } else {
            showMessage('Erro ao excluir usuário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showMessage('Erro de conexão ao excluir usuário');
    }
}

/**
 * FUNÇÃO: Salvar usuário (criar ou atualizar)
 * @param {object} dadosUsuario - Dados do usuário {nome, email, senha, ...}
 * 
 * Se editandoUsuario = true: faz PUT (atualizar)
 * Se editandoUsuario = false: faz POST (criar)
 */
async function salvarUsuario(dadosUsuario) {
    try {
        salvarBtn.textContent = 'Salvando...';
        salvarBtn.disabled = true; // Desabilita enquanto processa

        // Determina se vai atualizar ou criar
        const url = editandoUsuario 
            ? `${API_BASE}/usuarios/${usuarioIdInput.value}` // Editar: PUT /api/usuarios/5
            : `${API_BASE}/usuarios`; // Criar: POST /api/usuarios
        
        // Determina qual método HTTP usar
        const method = editandoUsuario ? 'PUT' : 'POST';

        // Faz a requisição
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });

        const data = await response.json();

        // Verifica se foi bem sucedido
        if (data.success) {
            showMessage(data.message, 'success');
            fecharModal(); // Fecha modal
            carregarUsuarios(); // Recarrega tabela
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showMessage('Erro de conexão ao salvar usuário');
    } finally {
        // Sempre restaura estado do botão
        salvarBtn.textContent = 'Salvar';
        salvarBtn.disabled = false;
    }
}

/**
 * EVENT LISTENER: Ao submeter o formulário
 * Executa quando clica em "Salvar"
 */
usuarioForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Previne comportamento padrão
    
    // Pega valores dos campos
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    /**
     * VALIDAÇÕES
     */
    
    // Validação 1: Nome e email obrigatórios
    if (!nome || !email) {
        showMessage('Nome e e-mail são obrigatórios');
        return;
    }

    // Validação 2: Se criando novo, senha obrigatória
    // Se editando, senha é opcional
    if (!editandoUsuario && (!senha || !confirmarSenha)) {
        showMessage('Senha e confirmação são obrigatórias');
        return;
    }

    // Validação 3: Senhas coincidem?
    if (senha && senha !== confirmarSenha) {
        showMessage('As senhas não coincidem');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    if (senha && senha.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    // Preparar dados
    const dadosUsuario = {
        nome,
        email,
        confirmarSenha: senha
    };

    // Adicionar senha apenas se foi preenchida
    if (senha) {
        dadosUsuario.senha = senha;
    }

    salvarUsuario(dadosUsuario);
});

// Validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fechar modal ao clicar fora
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        fecharModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        fecharModal();
    }
});

// Fechar menu mobile ao clicar fora
document.addEventListener('click', (e) => {
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        navMenu.classList.remove('show');
    }
});

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    verificarAuth();
    carregarUsuarios();
});