/**
 * ============================================
 * CRUD DE ALUNOS - JavaScript
 * ============================================
 * Gerencia criação, edição, exclusão e listagem de alunos
 * 
 * ESTRUTURA:
 * Este arquivo segue o mesmo padrão que usuarios.js
 * 
 * FUNÇÕES PRINCIPAIS:
 * - verificarAuth(): Valida se está logado
 * - carregarAlunos(): Busca todos os alunos (GET /api/alunos)
 * - exibirAlunos(): Mostra alunos na tabela
 * - editarAluno(id): Abre modal para editar
 * - excluirAluno(id): Remove aluno do banco (DELETE /api/alunos/:id)
 * - salvarAluno(): Cria ou atualiza aluno (POST ou PUT)
 * - buscarAlunos(): Filtra alunos por nome (busca em tempo real)
 * 
 * DIFERENÇAS EM RELAÇÃO A USUÁRIOS:
 * - Campos adicionais: dataNascimento, serieTurma, telefone
 * - Tem busca/filtro por nome em tempo real
 * - Usa alunoQueries no backend (não usuarioQueries)
 */

// Configuração da API
const API_BASE = window.location.origin + '/api';

// Elementos do DOM (elementos HTML que serão manipulados)
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const alunoForm = document.getElementById('alunoForm');
const alunoIdInput = document.getElementById('alunoId');
const nomeInput = document.getElementById('nome');
const dataNascimentoInput = document.getElementById('dataNascimento');
const serieTurmaInput = document.getElementById('serieTurma');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const salvarBtn = document.getElementById('salvarBtn');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const messageDiv = document.getElementById('message');
const searchInput = document.getElementById('searchInput'); // Campo de busca

// Estado da aplicação
let editandoAluno = false; // true = editar, false = criar

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
function abrirModal(aluno = null) {
    if (aluno) {
        // Modo edição
        editandoAluno = true;
        modalTitle.textContent = 'Editar Aluno';
        alunoIdInput.value = aluno.id;
        nomeInput.value = aluno.nome;
        dataNascimentoInput.value = aluno.data_nascimento;
        serieTurmaInput.value = aluno.serie_turma;
        emailInput.value = aluno.email || '';
        telefoneInput.value = aluno.telefone || '';
    } else {
        // Modo criação
        editandoAluno = false;
        modalTitle.textContent = 'Adicionar Aluno';
        alunoForm.reset();
        alunoIdInput.value = '';
    }
    
    modal.classList.add('show');
    nomeInput.focus();
}

// Fechar modal
function fecharModal() {
    modal.classList.remove('show');
    alunoForm.reset();
    editandoAluno = false;
}

// Carregar lista de alunos
async function carregarAlunos() {
    try {
        const response = await fetch(`${API_BASE}/alunos`);
        const data = await response.json();

        if (data.success) {
            exibirAlunos(data.data);
        } else {
            showMessage('Erro ao carregar alunos: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        showMessage('Erro de conexão ao carregar alunos');
    }
}

// Buscar alunos
async function buscarAlunos() {
    const termo = searchInput.value.trim();
    
    try {
        const url = termo 
            ? `${API_BASE}/alunos?search=${encodeURIComponent(termo)}`
            : `${API_BASE}/alunos`;
            
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            exibirAlunos(data.data);
        } else {
            showMessage('Erro ao buscar alunos: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        showMessage('Erro de conexão ao buscar alunos');
    }
}

// Limpar busca
function limparBusca() {
    searchInput.value = '';
    carregarAlunos();
}

// Exibir alunos na tabela
function exibirAlunos(alunos) {
    if (alunos.length === 0) {
        tabelaAlunos.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nenhum aluno encontrado</td>
            </tr>
        `;
        return;
    }

    tabelaAlunos.innerHTML = alunos.map(aluno => `
        <tr>
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${formatarData(aluno.data_nascimento)}</td>
            <td>${aluno.serie_turma}</td>
            <td>${aluno.email || '-'}</td>
            <td>${aluno.telefone || '-'}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editarAluno(${aluno.id})">
                    ✏️ Editar
                </button>
                <button class="btn btn-small btn-error" onclick="confirmarExclusao(${aluno.id}, '${aluno.nome}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// Formatar data para exibição
function formatarData(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

// Editar aluno
async function editarAluno(id) {
    try {
        const response = await fetch(`${API_BASE}/alunos/${id}`);
        const data = await response.json();

        if (data.success) {
            abrirModal(data.data);
        } else {
            showMessage('Erro ao buscar aluno: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        showMessage('Erro de conexão ao buscar aluno');
    }
}

// Confirmar exclusão
function confirmarExclusao(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o aluno "${nome}"?`)) {
        excluirAluno(id);
    }
}

// Excluir aluno
async function excluirAluno(id) {
    try {
        const response = await fetch(`${API_BASE}/alunos/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Aluno excluído com sucesso!', 'success');
            carregarAlunos();
        } else {
            showMessage('Erro ao excluir aluno: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        showMessage('Erro de conexão ao excluir aluno');
    }
}

// Salvar aluno (criar ou atualizar)
async function salvarAluno(dadosAluno) {
    try {
        salvarBtn.textContent = 'Salvando...';
        salvarBtn.disabled = true;

        const url = editandoAluno 
            ? `${API_BASE}/alunos/${alunoIdInput.value}`
            : `${API_BASE}/alunos`;
        
        const method = editandoAluno ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAluno)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, 'success');
            fecharModal();
            carregarAlunos();
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar aluno:', error);
        showMessage('Erro de conexão ao salvar aluno');
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
        buscarAlunos();
    }
});

// Event listener para o formulário
alunoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    const dataNascimento = dataNascimentoInput.value;
    const serieTurma = serieTurmaInput.value;
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();

    // Validações
    if (!nome || !dataNascimento || !serieTurma) {
        showMessage('Nome, data de nascimento e série/turma são obrigatórios');
        return;
    }

    if (email && !isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    // Validar idade (não pode ter mais de 25 anos ou menos de 5 anos)
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (idade < 5 || idade > 25) {
        showMessage('Idade deve estar entre 5 e 25 anos');
        return;
    }

    // Preparar dados
    const dadosAluno = {
        nome,
        dataNascimento,
        serieTurma,
        email,
        telefone
    };

    salvarAluno(dadosAluno);
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
    carregarAlunos();
});