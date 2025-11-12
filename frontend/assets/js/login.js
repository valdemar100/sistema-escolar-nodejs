/**
 * ============================================
 * LOGIN - JavaScript
 * ============================================
 * Este arquivo controla toda a lógica de login
 */

// Define a URL base da API (pegando automaticamente o domínio)
// Exemplo: http://localhost:3000/api ou https://railway.app/api
const API_BASE = window.location.origin + '/api';

/**
 * SELEÇÃO DE ELEMENTOS DO DOM (HTML)
 * Esses elementos serão manipulados via JavaScript
 */
const loginForm = document.getElementById('loginForm'); // Formulário de login
const emailInput = document.getElementById('email'); // Campo de email
const senhaInput = document.getElementById('senha'); // Campo de senha
const loginBtn = document.getElementById('loginBtn'); // Botão de login
const messageDiv = document.getElementById('message'); // Div para mostrar mensagens

/**
 * VERIFICAÇÃO DE AUTENTICAÇÃO
 * Se o usuário já está logado (dados no localStorage),
 * redireciona diretamente para o dashboard
 */
if (localStorage.getItem('usuario')) {
    window.location.href = '/dashboard';
}

/**
 * FUNÇÃO: Exibir mensagens na tela
 * @param {string} text - Texto da mensagem
 * @param {string} type - Tipo: 'error' (vermelho) ou 'success' (verde)
 * 
 * Exibe a mensagem e a esconde automaticamente após 5 segundos
 */
function showMessage(text, type = 'error') {
    messageDiv.textContent = text; // Define o texto da mensagem
    messageDiv.className = `message ${type} show`; // Aplica classe de estilo
    
    // Esconder mensagem após 5 segundos (5000 ms)
    setTimeout(() => {
        messageDiv.className = 'message'; // Remove a classe 'show'
    }, 5000);
}

/**
 * FUNÇÃO: Fazer login
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * 
 * Envia os dados para a API via POST
 * Se correto, salva dados no localStorage e redireciona
 */
async function fazerLogin(email, senha) {
    try {
        // Mudar texto do botão enquanto processa
        loginBtn.textContent = 'Entrando...';
        loginBtn.disabled = true; // Desabilita o botão para não clicar 2x

        // Faz requisição POST para /api/login
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST', // POST para enviar dados
            headers: {
                'Content-Type': 'application/json', // Formato JSON
            },
            // Converte email e senha em JSON
            body: JSON.stringify({ email, senha })
        });

        // Converte a resposta em objeto JavaScript
        const data = await response.json();

        // Verifica se login foi bem sucedido
        if (data.success) {
            // Salvar dados do usuário no localStorage
            // localStorage persiste os dados mesmo fechando o navegador
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Mostrar mensagem de sucesso em verde
            showMessage('Login realizado com sucesso!', 'success');
            
            // Aguardar 1 segundo e redirecionar para o dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Se falhou, mostrar mensagem de erro
            showMessage(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        // Se houver erro de conexão
        console.error('Erro no login:', error);
        showMessage('Erro de conexão com o servidor');
    } finally {
        // Sempre executado, independente se sucesso ou erro
        // Restaurar estado do botão
        loginBtn.textContent = 'Entrar';
        loginBtn.disabled = false;
    }
}

/**
 * EVENT LISTENER: Ao submeter o formulário
 * Este código executa quando o usuário clica no botão "Entrar" ou pressiona Enter
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão (recarregar página)
    
    // Pega os valores dos inputs e remove espaços em branco
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    
    /**
     * VALIDAÇÕES - Verificar antes de enviar para a API
     */
    
    // Validação 1: Campos vazios?
    if (!email || !senha) {
        showMessage('Por favor, preencha todos os campos');
        return; // Para a execução
    }

    // Validação 2: Email tem formato válido?
    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    // Se passou nas validações, fazer login
    await fazerLogin(email, senha);
});

/**
 * FUNÇÃO: Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true se válido, false se inválido
 * 
 * Usa expressão regular (regex) para validar
 */
function isValidEmail(email) {
    // Regex: algo@algo.algo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * PREENCHIMENTO AUTOMÁTICO
 * Se estiver no localhost (desenvolvimento),
 * preenche automaticamente com credencial padrão
 * Para facilitar testes
 */
if (window.location.hostname === 'localhost') {
    emailInput.value = 'admin@escola.com';
    senhaInput.value = '123456';
}

/**
 * FOCAR NO PRIMEIRO CAMPO
 * Coloca o cursor no campo de email quando a página carrega
 * Para melhor UX
 */
emailInput.focus();

/**
 * PERMITIR LOGIN COM ENTER
 * Se o usuário pressionar Enter, submete o formulário
 * Como se clicasse no botão
 */
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !loginBtn.disabled) {
        // Dispara o evento de submit do formulário
        loginForm.dispatchEvent(new Event('submit'));
    }
});

/**
 * ANIMAÇÃO DE ENTRADA
 * Quando a página carrega, aplica a animação fade-in
 * (aparece gradualmente)
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.querySelector('.login-card');
    loginCard.classList.add('fade-in');
});