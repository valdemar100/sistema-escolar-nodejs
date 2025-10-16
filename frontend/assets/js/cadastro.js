// Configuração da API
const API_BASE = window.location.origin + '/api';

// Elementos do DOM
const cadastroForm = document.getElementById('cadastroForm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const cadastroBtn = document.getElementById('cadastroBtn');
const messageDiv = document.getElementById('message');

// Verificar se já está logado
if (localStorage.getItem('usuario')) {
    window.location.href = '/dashboard';
}

// Função para exibir mensagens
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Função para cadastrar usuário
async function cadastrarUsuario(dadosUsuario) {
    try {
        cadastroBtn.textContent = 'Criando conta...';
        cadastroBtn.disabled = true;

        const response = await fetch(`${API_BASE}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUsuario)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Conta criada com sucesso! Redirecionando para o login...', 'success');
            
            // Limpar formulário
            cadastroForm.reset();
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showMessage(data.message || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showMessage('Erro de conexão com o servidor');
    } finally {
        cadastroBtn.textContent = 'Criar Conta';
        cadastroBtn.disabled = false;
    }
}

// Event listener para o formulário
cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        showMessage('Por favor, preencha todos os campos');
        return;
    }

    if (nome.length < 2) {
        showMessage('Nome deve ter pelo menos 2 caracteres');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    if (senha.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem');
        return;
    }

    // Preparar dados
    const dadosUsuario = {
        nome,
        email,
        senha,
        confirmarSenha
    };

    await cadastrarUsuario(dadosUsuario);
});

// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Focar no primeiro campo
nomeInput.focus();

// Permitir cadastro com Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !cadastroBtn.disabled) {
        cadastroForm.dispatchEvent(new Event('submit'));
    }
});

// Animação de entrada
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.querySelector('.login-card');
    loginCard.classList.add('fade-in');
});

// Validação em tempo real das senhas
function validarSenhas() {
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    if (confirmarSenha && senha !== confirmarSenha) {
        confirmarSenhaInput.style.borderColor = '#EF4444';
    } else {
        confirmarSenhaInput.style.borderColor = '#e5e7eb';
    }
}

senhaInput.addEventListener('input', validarSenhas);
confirmarSenhaInput.addEventListener('input', validarSenhas);