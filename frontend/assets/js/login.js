// Configuração da API
const API_BASE = window.location.origin + '/api';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const loginBtn = document.getElementById('loginBtn');
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

// Função para fazer login
async function fazerLogin(email, senha) {
    try {
        loginBtn.textContent = 'Entrando...';
        loginBtn.disabled = true;

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.success) {
            // Salvar dados do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showMessage(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showMessage('Erro de conexão com o servidor');
    } finally {
        loginBtn.textContent = 'Entrar';
        loginBtn.disabled = false;
    }
}

// Event listener para o formulário
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    
    // Validações
    if (!email || !senha) {
        showMessage('Por favor, preencha todos os campos');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    await fazerLogin(email, senha);
});

// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Preencher campos automaticamente no desenvolvimento
if (window.location.hostname === 'localhost') {
    emailInput.value = 'admin@escola.com';
    senhaInput.value = '123456';
}

// Focar no primeiro campo
emailInput.focus();

// Permitir login com Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !loginBtn.disabled) {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Animação de entrada
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.querySelector('.login-card');
    loginCard.classList.add('fade-in');
});