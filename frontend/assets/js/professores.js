/**
 * ============================================
 * CRUD DE PROFESSORES - JavaScript
 * ============================================
 * Gerencia criação, edição, exclusão e listagem de professores
 * 
 * ESTRUTURA:
 * Este arquivo segue o mesmo padrão que usuarios.js
 * 
 * FUNÇÕES PRINCIPAIS:
 * - verificarAuth(): Valida se está logado
 * - carregarProfessores(): Busca todos os professores (GET /api/professores)
 * - exibirProfessores(): Mostra professores na tabela
 * - editarProfessor(id): Abre modal para editar
 * - excluirProfessor(id): Remove professor do banco (DELETE /api/professores/:id)
 * - salvarProfessor(): Cria ou atualiza professor (POST ou PUT)
 * - buscarProfessores(): Filtra professores por nome/disciplina
 * 
 * DIFERENÇAS EM RELAÇÃO A USUÁRIOS:
 * - Campos adicionais: disciplina, telefone
 * - Tem busca/filtro por nome e disciplina em tempo real
 * - Usa professorQueries no backend
 */

// Configuração da API
const API_BASE = window.location.origin + '/api';

// Elementos do DOM (elementos HTML que serão manipulados)
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const professorForm = document.getElementById('professorForm');
const professorIdInput = document.getElementById('professorId');
const nomeInput = document.getElementById('nome');
const disciplinaInput = document.getElementById('disciplina');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const salvarBtn = document.getElementById('salvarBtn');
const tabelaProfessores = document.getElementById('tabelaProfessores');
const messageDiv = document.getElementById('message');
const searchInput = document.getElementById('searchInput'); // Campo de busca

// Estado da aplicação
let editandoProfessor = false; // true = editar, false = criar

/**
 * FUNÇÃO: Verificar autenticação
 * Se não está logado, redireciona para login
 */
function verificarAuth() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = '/';
        return null;
    }
    return JSON.parse(usuario);
}

/**
 * FUNÇÃO: Fazer logout
 * Remove usuário do localStorage e volta para login
 */
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/';
}

/**
 * FUNÇÃO: Toggle menu mobile
 * Abre/fecha menu de navegação em celular
 */
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('show');
}

/**
 * FUNÇÃO: Exibir mensagens de sucesso/erro
 */
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    // Esconder após 5 segundos
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Abrir modal
function abrirModal(professor = null) {
    if (professor) {
        // Modo edição
        editandoProfessor = true;
        modalTitle.textContent = 'Editar Professor';
        professorIdInput.value = professor.id;
        nomeInput.value = professor.nome;
        disciplinaInput.value = professor.disciplina;
        emailInput.value = professor.email || '';
        telefoneInput.value = professor.telefone || '';
    } else {
        // Modo criação
        editandoProfessor = false;
        modalTitle.textContent = 'Adicionar Professor';
        professorForm.reset();
        professorIdInput.value = '';
    }
    
    modal.classList.add('show');
    nomeInput.focus();
}

// Fechar modal
function fecharModal() {
    modal.classList.remove('show');
    professorForm.reset();
    editandoProfessor = false;
}

// Carregar lista de professores
async function carregarProfessores() {
    try {
        const response = await fetch(`${API_BASE}/professores`);
        const data = await response.json();

        if (data.success) {
            exibirProfessores(data.data);
        } else {
            showMessage('Erro ao carregar professores: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        showMessage('Erro de conexão ao carregar professores');
    }
}

// Buscar professores
async function buscarProfessores() {
    const termo = searchInput.value.trim();
    
    try {
        const url = termo 
            ? `${API_BASE}/professores?search=${encodeURIComponent(termo)}`
            : `${API_BASE}/professores`;
            
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            exibirProfessores(data.data);
        } else {
            showMessage('Erro ao buscar professores: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        showMessage('Erro de conexão ao buscar professores');
    }
}

// Limpar busca
function limparBusca() {
    searchInput.value = '';
    carregarProfessores();
}

// Exibir professores na tabela
function exibirProfessores(professores) {
    if (professores.length === 0) {
        tabelaProfessores.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nenhum professor encontrado</td>
            </tr>
        `;
        return;
    }

    tabelaProfessores.innerHTML = professores.map(professor => `
        <tr>
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
            <td>
                <span class="badge" style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                    ${professor.disciplina}
                </span>
            </td>
            <td>${professor.email || '-'}</td>
            <td>${professor.telefone || '-'}</td>
            <td>${formatarData(professor.created_at)}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editarProfessor(${professor.id})">
                    ✏️ Editar
                </button>
                <button class="btn btn-small btn-error" onclick="confirmarExclusao(${professor.id}, '${professor.nome}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// Formatar data para exibição
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Editar professor
async function editarProfessor(id) {
    try {
        const response = await fetch(`${API_BASE}/professores/${id}`);
        const data = await response.json();

        if (data.success) {
            abrirModal(data.data);
        } else {
            showMessage('Erro ao buscar professor: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        showMessage('Erro de conexão ao buscar professor');
    }
}

// Confirmar exclusão
function confirmarExclusao(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o professor "${nome}"?`)) {
        excluirProfessor(id);
    }
}

// Excluir professor
async function excluirProfessor(id) {
    try {
        const response = await fetch(`${API_BASE}/professores/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Professor excluído com sucesso!', 'success');
            carregarProfessores();
        } else {
            showMessage('Erro ao excluir professor: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir professor:', error);
        showMessage('Erro de conexão ao excluir professor');
    }
}

// Salvar professor (criar ou atualizar)
async function salvarProfessor(dadosProfessor) {
    try {
        salvarBtn.textContent = 'Salvando...';
        salvarBtn.disabled = true;

        const url = editandoProfessor 
            ? `${API_BASE}/professores/${professorIdInput.value}`
            : `${API_BASE}/professores`;
        
        const method = editandoProfessor ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosProfessor)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, 'success');
            fecharModal();
            carregarProfessores();
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar professor:', error);
        showMessage('Erro de conexão ao salvar professor');
    } finally {
        salvarBtn.textContent = 'Salvar';
        salvarBtn.disabled = false;
    }
}

// Formatação de telefone
function formatarTelefone(valor) {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Aplica a máscara
    if (valor.length >= 11) {
        return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length >= 10) {
        return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (valor.length >= 6) {
        return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length >= 2) {
        return valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
        return valor;
    }
}

// Event listener para formatação do telefone
telefoneInput.addEventListener('input', (e) => {
    e.target.value = formatarTelefone(e.target.value);
});

// Event listener para busca em tempo real
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        buscarProfessores();
    }
});

// Event listener para o formulário
professorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    const disciplina = disciplinaInput.value;
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();

    // Validações
    if (!nome || !disciplina) {
        showMessage('Nome e disciplina são obrigatórios');
        return;
    }

    if (email && !isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    // Preparar dados
    const dadosProfessor = {
        nome,
        disciplina,
        email,
        telefone
    };

    salvarProfessor(dadosProfessor);
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
    carregarProfessores();
});