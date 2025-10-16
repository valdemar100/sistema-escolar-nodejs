// Configuração da API
const API_BASE = window.location.origin + '/api';

// Elementos do DOM
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const usuarioForm = document.getElementById('usuarioForm');
const usuarioIdInput = document.getElementById('usuarioId');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const salvarBtn = document.getElementById('salvarBtn');
const tabelaUsuarios = document.getElementById('tabelaUsuarios');
const messageDiv = document.getElementById('message');

// Estado da aplicação
let editandoUsuario = false;

// Verificar autenticação
function verificarAuth() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = '/';
        return null;
    }
    return JSON.parse(usuario);
}

// Função de logout
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/';
}

// Toggle menu mobile
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('show');
}

// Função para exibir mensagens
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Abrir modal
function abrirModal(usuario = null) {
    if (usuario) {
        // Modo edição
        editandoUsuario = true;
        modalTitle.textContent = 'Editar Usuário';
        usuarioIdInput.value = usuario.id;
        nomeInput.value = usuario.nome;
        emailInput.value = usuario.email;
        senhaInput.required = false;
        confirmarSenhaInput.required = false;
        senhaInput.placeholder = 'Deixe em branco para manter a senha atual';
        confirmarSenhaInput.placeholder = 'Deixe em branco para manter a senha atual';
    } else {
        // Modo criação
        editandoUsuario = false;
        modalTitle.textContent = 'Adicionar Usuário';
        usuarioForm.reset();
        usuarioIdInput.value = '';
        senhaInput.required = true;
        confirmarSenhaInput.required = true;
        senhaInput.placeholder = 'Digite a senha';
        confirmarSenhaInput.placeholder = 'Confirme a senha';
    }
    
    modal.classList.add('show');
    nomeInput.focus();
}

// Fechar modal
function fecharModal() {
    modal.classList.remove('show');
    usuarioForm.reset();
    editandoUsuario = false;
}

// Carregar lista de usuários
async function carregarUsuarios() {
    try {
        const response = await fetch(`${API_BASE}/usuarios`);
        const data = await response.json();

        if (data.success) {
            exibirUsuarios(data.data);
        } else {
            showMessage('Erro ao carregar usuários: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showMessage('Erro de conexão ao carregar usuários');
    }
}

// Exibir usuários na tabela
function exibirUsuarios(usuarios) {
    if (usuarios.length === 0) {
        tabelaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum usuário encontrado</td>
            </tr>
        `;
        return;
    }

    tabelaUsuarios.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${formatarData(usuario.created_at)}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editarUsuario(${usuario.id})">
                    ✏️ Editar
                </button>
                <button class="btn btn-small btn-error" onclick="confirmarExclusao(${usuario.id}, '${usuario.nome}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

// Editar usuário
async function editarUsuario(id) {
    try {
        const response = await fetch(`${API_BASE}/usuarios/${id}`);
        const data = await response.json();

        if (data.success) {
            abrirModal(data.data);
        } else {
            showMessage('Erro ao buscar usuário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        showMessage('Erro de conexão ao buscar usuário');
    }
}

// Confirmar exclusão
function confirmarExclusao(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
        excluirUsuario(id);
    }
}

// Excluir usuário
async function excluirUsuario(id) {
    try {
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Usuário excluído com sucesso!', 'success');
            carregarUsuarios();
        } else {
            showMessage('Erro ao excluir usuário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showMessage('Erro de conexão ao excluir usuário');
    }
}

// Salvar usuário (criar ou atualizar)
async function salvarUsuario(dadosUsuario) {
    try {
        salvarBtn.textContent = 'Salvando...';
        salvarBtn.disabled = true;

        const url = editandoUsuario 
            ? `${API_BASE}/usuarios/${usuarioIdInput.value}`
            : `${API_BASE}/usuarios`;
        
        const method = editandoUsuario ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, 'success');
            fecharModal();
            carregarUsuarios();
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showMessage('Erro de conexão ao salvar usuário');
    } finally {
        salvarBtn.textContent = 'Salvar';
        salvarBtn.disabled = false;
    }
}

// Event listener para o formulário
usuarioForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    // Validações
    if (!nome || !email) {
        showMessage('Nome e e-mail são obrigatórios');
        return;
    }

    if (!editandoUsuario && (!senha || !confirmarSenha)) {
        showMessage('Senha e confirmação são obrigatórias');
        return;
    }

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