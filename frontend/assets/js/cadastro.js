/**
 * ============================================
 * CADASTRO - JavaScript
 * ============================================
 * Controla a lógica de criação de nova conta
 */

// Define a URL base da API
const API_BASE = window.location.origin + '/api';

/**
 * SELEÇÃO DE ELEMENTOS DO DOM
 * Esses elementos serão manipulados pelo JavaScript
 */
const cadastroForm = document.getElementById('cadastroForm'); // Formulário
const nomeInput = document.getElementById('nome'); // Campo de nome
const emailInput = document.getElementById('email'); // Campo de email
const senhaInput = document.getElementById('senha'); // Campo de senha
const confirmarSenhaInput = document.getElementById('confirmarSenha'); // Campo confirmar senha
const cadastroBtn = document.getElementById('cadastroBtn'); // Botão de cadastro
const messageDiv = document.getElementById('message'); // Div para mensagens

/**
 * VERIFICAÇÃO DE AUTENTICAÇÃO
 * Se já está logado, redireciona para o dashboard
 */
if (localStorage.getItem('usuario')) {
    window.location.href = '/dashboard';
}

/**
 * FUNÇÃO: Exibir mensagens na tela
 * Mostra mensagem e a esconde após 5 segundos
 */
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

/**
 * FUNÇÃO: Cadastrar novo usuário
 * Envia dados para a API via POST
 */
async function cadastrarUsuario(dadosUsuario) {
    try {
        // Mudar texto do botão
        cadastroBtn.textContent = 'Criando conta...';
        cadastroBtn.disabled = true; // Desabilita para não clicar 2x

        // Fazer requisição POST para /api/usuarios
        const response = await fetch(`${API_BASE}/usuarios`, {
            method: 'POST', // POST para criar
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUsuario) // Converte dados em JSON
        });

        // Recebe e converte resposta em objeto
        const data = await response.json();

        // Verifica se foi criado com sucesso
        if (data.success) {
            // Mostrar mensagem de sucesso
            showMessage('Conta criada com sucesso! Redirecionando para o login...', 'success');
            
            // Limpar todos os campos do formulário
            cadastroForm.reset();
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            // Mostrar mensagem de erro da API
            showMessage(data.message || 'Erro ao criar conta');
        }
    } catch (error) {
        // Erro de conexão
        console.error('Erro no cadastro:', error);
        showMessage('Erro de conexão com o servidor');
    } finally {
        // Restaurar estado do botão
        cadastroBtn.textContent = 'Criar Conta';
        cadastroBtn.disabled = false;
    }
}

/**
 * EVENT LISTENER: Ao submeter o formulário
 * Executa quando clica no botão "Criar Conta" ou pressiona Enter
 */
cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne recarregar a página
    
    // Pega os valores e remove espaços
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    /**
     * VALIDAÇÕES - Verificar antes de enviar para API
     */
    
    // Validação 1: Todos os campos preenchidos?
    if (!nome || !email || !senha || !confirmarSenha) {
        showMessage('Por favor, preencha todos os campos');
        return;
    }

    // Validação 2: Nome tem pelo menos 2 caracteres?
    if (nome.length < 2) {
        showMessage('Nome deve ter pelo menos 2 caracteres');
        return;
    }

    // Validação 3: Email tem formato válido?
    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um e-mail válido');
        return;
    }

    // Validação 4: Senha tem pelo menos 6 caracteres?
    if (senha.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    // Validação 5: As senhas coincidem?
    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem');
        return;
    }

    // Se passou em todas as validações, preparar dados
    const dadosUsuario = {
        nome,
        email,
        senha,
        confirmarSenha
    };

    // Enviar para cadastro
    await cadastrarUsuario(dadosUsuario);
});

/**
 * FUNÇÃO: Validar formato de email
 * Usa expressão regular para validar
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * FOCAR NO PRIMEIRO CAMPO
 * Coloca o cursor no campo de nome quando a página carrega
 */
nomeInput.focus();

/**
 * PERMITIR CADASTRO COM ENTER
 * Se pressionar Enter, submete o formulário
 */
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !cadastroBtn.disabled) {
        cadastroForm.dispatchEvent(new Event('submit'));
    }
});

/**
 * ANIMAÇÃO DE ENTRADA
 * Aplica fade-in quando a página carrega
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.querySelector('.login-card');
    loginCard.classList.add('fade-in');
});

/**
 * VALIDAÇÃO EM TEMPO REAL DAS SENHAS
 * Enquanto o usuário digita, valida se as senhas coincidem
 * Se não coincidem, coloca borda vermelha no campo
 */
function validarSenhas() {
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    // Se há conteúdo em confirmar senha
    if (confirmarSenha && senha !== confirmarSenha) {
        // Coloca borda vermelha (erro)
        confirmarSenhaInput.style.borderColor = '#EF4444';
    } else {
        // Coloca borda cinza normal
        confirmarSenhaInput.style.borderColor = '#e5e7eb';
    }
}

// Executa validação quando digita na senha
senhaInput.addEventListener('input', validarSenhas);
// Executa validação quando digita na confirmação
confirmarSenhaInput.addEventListener('input', validarSenhas);