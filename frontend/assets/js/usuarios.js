/**
 * ============================================
 * CRUD DE USUÁRIOS - JavaScript
 * ============================================
 * Gerencia a criação, edição, exclusão e listagem de usuários
 */

// Define a URL base da API
// window.location.origin pega http://localhost:3000 ou https://seusite.com
// Adiciona /api no final para formar URL completa da API
const API_BASE = window.location.origin + '/api'; // Constante com URL base

/**
 * SELEÇÃO DE ELEMENTOS DO DOM
 * Todos os elementos que serão manipulados
 */
const modal = document.getElementById('modal'); // Pega elemento com id='modal' (caixa de diálogo pop-up)
const modalTitle = document.getElementById('modalTitle'); // Pega elemento com id='modalTitle' (título do modal)
const usuarioForm = document.getElementById('usuarioForm'); // Pega elemento com id='usuarioForm' (formulário)
const usuarioIdInput = document.getElementById('usuarioId'); // Pega input hidden com id='usuarioId' (guarda ID ao editar)
const nomeInput = document.getElementById('nome'); // Pega input com id='nome' (campo nome)
const emailInput = document.getElementById('email'); // Pega input com id='email' (campo email)
const senhaInput = document.getElementById('senha'); // Pega input com id='senha' (campo senha)
const confirmarSenhaInput = document.getElementById('confirmarSenha'); // Pega input com id='confirmarSenha' (confirmação de senha)
const salvarBtn = document.getElementById('salvarBtn'); // Pega botão com id='salvarBtn' (botão de salvar)
const tabelaUsuarios = document.getElementById('tabelaUsuarios'); // Pega tbody com id='tabelaUsuarios' (corpo da tabela)
const messageDiv = document.getElementById('message'); // Pega div com id='message' (div para exibir mensagens)

/**
 * ESTADO DA APLICAÇÃO
 * Variável para rastrear se estamos criando ou editando
 */
let editandoUsuario = false; // Variável booleana: true = modo edição, false = modo criação

/**
 * FUNÇÃO: Verificar autenticação
 * Valida se o usuário está logado
 * Se não estiver, redireciona para login
 */
function verificarAuth() { // Define função verificarAuth (sem parâmetros)
    const usuario = localStorage.getItem('usuario'); // Busca item 'usuario' no localStorage do navegador
    if (!usuario) { // Se usuario é null/undefined (não está logado)
        window.location.href = '/'; // Redireciona para página inicial (login)
        return null; // Retorna null e sai da função
    } // Fecha if
    return JSON.parse(usuario); // Converte string JSON em objeto JavaScript e retorna
} // Fecha função

/**
 * FUNÇÃO: Fazer logout
 * Remove usuário do localStorage e redireciona para login
 */
function logout() { // Define função logout (sem parâmetros)
    localStorage.removeItem('usuario'); // Remove item 'usuario' do localStorage (desloga)
    window.location.href = '/'; // Redireciona para página inicial (login)
} // Fecha função

/**
 * FUNÇÃO: Toggle menu mobile
 * Abre/fecha o menu de navegação em celular
 */
function toggleMenu() { // Define função toggleMenu (sem parâmetros)
    const navMenu = document.getElementById('navMenu'); // Pega elemento com id='navMenu'
    navMenu.classList.toggle('show'); // Alterna (adiciona/remove) classe 'show' no elemento
} // Fecha função

/**
 * FUNÇÃO: Exibir mensagens
 * Mostra mensagem de sucesso/erro
 */
function showMessage(text, type = 'error') { // Define função com 2 parâmetros (type tem valor padrão 'error')
    messageDiv.textContent = text; // Define texto interno da div de mensagem
    messageDiv.className = `message ${type} show`; // Define classes da div (template literal)
    
    // Esconder após 5 segundos
    setTimeout(() => { // setTimeout executa função arrow após 5000ms (5 segundos)
        messageDiv.className = 'message'; // Remove classes 'error/success' e 'show' (esconde mensagem)
    }, 5000); // Delay de 5000 milissegundos
} // Fecha função

/**
 * FUNÇÃO: Abrir modal (criar ou editar)
 * Se usuario = null, modo criar
 * Se usuario = objeto, modo editar
 */
function abrirModal(usuario = null) { // Define função com parâmetro usuario (padrão null)
    if (usuario) { // Se usuario existe (não é null) = MODO EDIÇÃO
        // ========== MODO EDIÇÃO ==========
        editandoUsuario = true; // Define estado como edição
        modalTitle.textContent = 'Editar Usuário'; // Muda título do modal
        usuarioIdInput.value = usuario.id; // Armazena ID no input hidden para saber qual editar
        nomeInput.value = usuario.nome; // Preenche campo nome com dados atuais do usuário
        emailInput.value = usuario.email; // Preenche campo email com dados atuais
        senhaInput.required = false; // Senha não obrigatória (pode manter a atual)
        confirmarSenhaInput.required = false; // Confirmação também não obrigatória
        senhaInput.placeholder = 'Deixe em branco para manter a senha atual'; // Placeholder explicativo
        confirmarSenhaInput.placeholder = 'Deixe em branco para manter a senha atual'; // Placeholder explicativo
    } else { // Se usuario é null = MODO CRIAÇÃO
        // ========== MODO CRIAÇÃO ==========
        editandoUsuario = false; // Define estado como criação
        modalTitle.textContent = 'Adicionar Usuário'; // Título para novo usuário
        usuarioForm.reset(); // Limpa todos os campos do formulário
        usuarioIdInput.value = ''; // Sem ID = novo registro (não é edição)
        senhaInput.required = true; // Senha obrigatória ao criar
        confirmarSenhaInput.required = true; // Confirmação obrigatória ao criar
        senhaInput.placeholder = 'Digite a senha'; // Placeholder padrão
        confirmarSenhaInput.placeholder = 'Confirme a senha'; // Placeholder padrão
    } // Fecha else
    
    modal.classList.add('show'); // Adiciona classe 'show' ao modal (CSS torna visível)
    nomeInput.focus(); // Coloca cursor (foco) no primeiro campo (nome)
} // Fecha função

/**
 * FUNÇÃO: Fechar modal
 * Remove a classe 'show' e limpa o formulário
 */
function fecharModal() { // Define função fecharModal (sem parâmetros)
    modal.classList.remove('show'); // Remove classe 'show' (CSS esconde modal)
    usuarioForm.reset(); // Limpa todos os campos do formulário
    editandoUsuario = false; // Reseta estado para false (modo criação)
} // Fecha função

/**
 * FUNÇÃO: Carregar lista de usuários
 * Busca todos os usuários da API via GET
 * Exibe na tabela
 */
async function carregarUsuarios() { // Define função async (permite usar await)
    try { // Bloco try para capturar erros
        // Faz requisição GET para /api/usuarios
        const response = await fetch(`${API_BASE}/usuarios`); // await espera resposta (Promise)
        const data = await response.json(); // Converte resposta em objeto JavaScript (await espera conversão)

        if (data.success) { // Se API retornou success: true
            // Se sucesso, exibe usuários na tabela
            exibirUsuarios(data.data); // Chama função passando array de usuários
        } else { // Se success: false
            showMessage('Erro ao carregar usuários: ' + data.message); // Mostra mensagem de erro
        } // Fecha else
    } catch (error) { // Bloco catch captura erros de rede/conexão
        console.error('Erro ao carregar usuários:', error); // Exibe erro no console do navegador
        showMessage('Erro de conexão ao carregar usuários'); // Mostra mensagem genérica ao usuário
    } // Fecha catch
} // Fecha função

/**
 * FUNÇÃO: Exibir usuários na tabela
 * @param {array} usuarios - Array de usuários da API
 * 
 * Usa map() para converter cada usuário em uma linha HTML da tabela
 */
function exibirUsuarios(usuarios) { // Define função com parâmetro usuarios (array)
    // Se não há usuários, mostra mensagem
    if (usuarios.length === 0) { // Se array está vazio (length = 0)
        tabelaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum usuário encontrado</td>
            </tr>
        `; // Define HTML interno do tbody
        return; // Sai da função (não executa resto do código)
    } // Fecha if

    // map() transforma array de usuários em array de linhas HTML
    // join('') concatena todas as linhas em uma string
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
    `).join(''); // join('') junta array de strings em uma única string sem separador
} // Fecha função

/**
 * FUNÇÃO: Formatar data
 * @param {string} dataString - Data em formato ISO (ex: 2025-11-12T10:30:00)
 * @returns {string} - Data formatada (ex: 12/11/2025 10:30:00)
 * 
 * Converte data ISO para formato brasileiro
 */
function formatarData(dataString) { // Define função com parâmetro dataString
    const data = new Date(dataString); // Cria objeto Date a partir da string ISO
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR'); // Retorna data formatada (pt-BR = português Brasil) + espaço + hora formatada
} // Fecha função

/**
 * FUNÇÃO: Editar usuário
 * @param {number} id - ID do usuário a editar
 * 
 * 1. Busca dados do usuário via GET
 * 2. Abre modal com dados preenchidos
 */
async function editarUsuario(id) { // Define função async com parâmetro id
    try { // Bloco try para capturar erros
        // GET /api/usuarios/:id (busca um usuário específico)
        const response = await fetch(`${API_BASE}/usuarios/${id}`); // Faz GET para /api/usuarios/1 (exemplo)
        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se API retornou success: true
            // Abre modal em modo edição com os dados
            abrirModal(data.data); // Passa objeto usuário para abrirModal (modo edição)
        } else { // Se success: false
            showMessage('Erro ao buscar usuário: ' + data.message); // Mostra erro
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao buscar usuário:', error); // Log no console
        showMessage('Erro de conexão ao buscar usuário'); // Mensagem ao usuário
    } // Fecha catch
} // Fecha função

/**
 * FUNÇÃO: Confirmar exclusão
 * @param {number} id - ID do usuário
 * @param {string} nome - Nome do usuário
 * 
 * Mostra diálogo de confirmação antes de excluir
 * Se usuário clica "OK", chama excluirUsuario()
/**
 * FUNÇÃO: Confirmar exclusão
 * @param {number} id - ID do usuário
 * @param {string} nome - Nome do usuário
 * 
 * Mostra diálogo de confirmação antes de excluir
 * Se usuário clica "OK", chama excluirUsuario()
 */
function confirmarExclusao(id, nome) { // Define função com 2 parâmetros (id e nome)
    // confirm() mostra caixa de diálogo nativa do navegador
    // Retorna true se clicou OK, false se cancelou
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) { // Template literal com nome do usuário
        excluirUsuario(id); // Só executa se confirmou (true)
    } // Fecha if (se cancelou, não faz nada)
} // Fecha função

/**
 * FUNÇÃO: Excluir usuário
 * @param {number} id - ID do usuário a deletar
 * 
 * Faz requisição DELETE para /api/usuarios/:id
 * Recarrega lista após deletar
 */
async function excluirUsuario(id) { // Define função async com parâmetro id
    try { // Bloco try para capturar erros
        // DELETE /api/usuarios/:id (remove do banco)
        const response = await fetch(`${API_BASE}/usuarios/${id}`, { // Faz DELETE para /api/usuarios/5 (exemplo)
            method: 'DELETE' // Define método HTTP como DELETE
        }); // Fecha objeto de configuração

        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se API retornou success: true
            showMessage('Usuário excluído com sucesso!', 'success'); // Mensagem verde de sucesso
            carregarUsuarios(); // Recarrega a lista (atualiza tabela)
        } else { // Se success: false
            showMessage('Erro ao excluir usuário: ' + data.message); // Mensagem vermelha de erro
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao excluir usuário:', error); // Log no console
        showMessage('Erro de conexão ao excluir usuário'); // Mensagem ao usuário
    } // Fecha catch
} // Fecha função

/**
 * FUNÇÃO: Salvar usuário (criar ou atualizar)
 * @param {object} dadosUsuario - Dados do usuário {nome, email, senha, ...}
 * 
 * Se editandoUsuario = true: faz PUT (atualizar)
 * Se editandoUsuario = false: faz POST (criar)
 */
async function salvarUsuario(dadosUsuario) { // Define função async com parâmetro dadosUsuario (objeto)
    try { // Bloco try para capturar erros
        salvarBtn.textContent = 'Salvando...'; // Muda texto do botão para feedback visual
        salvarBtn.disabled = true; // Desabilita botão enquanto processa (evita duplo clique)

        // Determina se vai atualizar ou criar (operador ternário)
        const url = editandoUsuario  // Se editandoUsuario é true
            ? `${API_BASE}/usuarios/${usuarioIdInput.value}` // Então: Editar: PUT /api/usuarios/5
            : `${API_BASE}/usuarios`; // Senão: Criar: POST /api/usuarios
        
        // Determina qual método HTTP usar (operador ternário)
        const method = editandoUsuario ? 'PUT' : 'POST'; // Se editar = PUT, se criar = POST

        // Faz a requisição
        const response = await fetch(url, { // Faz fetch para URL determinada acima
            method: method, // Define método HTTP (POST ou PUT)
            headers: { // Cabeçalhos HTTP
                'Content-Type': 'application/json' // Informa que está enviando JSON
            }, // Fecha headers
            body: JSON.stringify(dadosUsuario) // Converte objeto JavaScript em string JSON e envia no corpo
        }); // Fecha objeto de configuração

        const data = await response.json(); // Converte resposta em objeto

        // Verifica se foi bem sucedido
        if (data.success) { // Se API retornou success: true
            showMessage(data.message, 'success'); // Mensagem verde com texto da API
            fecharModal(); // Fecha modal
            carregarUsuarios(); // Recarrega tabela (mostra novo/editado usuário)
        } else { // Se success: false
            showMessage(data.message); // Mensagem vermelha com erro da API
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao salvar usuário:', error); // Log no console
        showMessage('Erro de conexão ao salvar usuário'); // Mensagem ao usuário
    } finally { // Bloco finally sempre executa (sucesso ou erro)
        // Sempre restaura estado do botão
        salvarBtn.textContent = 'Salvar'; // Volta texto original
        salvarBtn.disabled = false; // Reabilita botão
    } // Fecha finally
} // Fecha função salvarUsuario

/**
 * EVENT LISTENER: Ao submeter o formulário
 * Executa quando clica em "Salvar"
 */
usuarioForm.addEventListener('submit', (e) => { // Adiciona escutador de evento 'submit' ao formulário
    e.preventDefault(); // Previne comportamento padrão (não recarrega página)
    
    // Pega valores dos campos
    const nome = nomeInput.value.trim(); // .trim() remove espaços no início/fim
    const email = emailInput.value.trim(); // Pega valor do campo email e remove espaços
    const senha = senhaInput.value; // Pega valor da senha (sem trim para permitir espaços)
    const confirmarSenha = confirmarSenhaInput.value; // Pega valor da confirmação

    /**
     * VALIDAÇÕES
     */
    
    // Validação 1: Nome e email obrigatórios
    if (!nome || !email) { // Se nome está vazio OU email está vazio (operador lógico OR)
        showMessage('Nome e e-mail são obrigatórios'); // Mostra mensagem de erro
        return; // Sai da função (não continua)
    } // Fecha if

    // Validação 2: Se criando novo, senha obrigatória
    // Se editando, senha é opcional
    if (!editandoUsuario && (!senha || !confirmarSenha)) { // Se NÃO está editando E (senha vazia OU confirmação vazia)
        showMessage('Senha e confirmação são obrigatórias'); // Erro
        return; // Sai
    } // Fecha if

    // Validação 3: Senhas coincidem?
    if (senha && senha !== confirmarSenha) { // Se senha existe E senha diferente de confirmarSenha (!== = diferente)
        showMessage('As senhas não coincidem'); // Erro
        return; // Sai
    } // Fecha if

    if (!isValidEmail(email)) { // Chama função que valida formato do email (se retorna false)
        showMessage('Por favor, digite um e-mail válido'); // Erro
        return; // Sai
    } // Fecha if

    if (senha && senha.length < 6) { // Se senha existe E tamanho menor que 6 caracteres
        showMessage('A senha deve ter pelo menos 6 caracteres'); // Erro
        return; // Sai
    } // Fecha if

    // Preparar dados
    const dadosUsuario = { // Cria objeto com os dados do usuário
        nome, // Shorthand property: equivalente a nome: nome
        email, // Equivalente a email: email
        confirmarSenha: senha // Adiciona confirmarSenha com valor de senha
    }; // Fecha objeto

    // Adicionar senha apenas se foi preenchida
    if (senha) { // Se senha não está vazia
        dadosUsuario.senha = senha; // Adiciona propriedade senha ao objeto
    } // Fecha if

    salvarUsuario(dadosUsuario); // Chama função que envia dados para API
}); // Fecha addEventListener

// FUNÇÃO: Validar e-mail
// Usa expressão regular (regex) para verificar formato do email
function isValidEmail(email) { // Define função com parâmetro email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex: caracteres + @ + caracteres + . + caracteres
    return emailRegex.test(email); // .test() retorna true se email corresponde ao padrão, false se não
} // Fecha função

// EVENT LISTENER: Fechar modal ao clicar fora
// Quando clica no fundo escuro (overlay), fecha o modal
modal.addEventListener('click', (e) => { // Adiciona escutador de evento 'click' ao modal
    if (e.target === modal) { // Se elemento clicado (e.target) é o próprio modal (não o conteúdo interno)
        fecharModal(); // Fecha modal
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Fechar modal com ESC
// Quando pressiona tecla ESC e modal está aberto, fecha
document.addEventListener('keydown', (e) => { // Adiciona escutador de evento 'keydown' (tecla pressionada) ao documento
    if (e.key === 'Escape' && modal.classList.contains('show')) { // Se tecla é Escape E modal tem classe 'show' (está aberto)
        fecharModal(); // Fecha modal
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Fechar menu mobile ao clicar fora
// Quando clica em qualquer lugar fora do menu, fecha o menu
document.addEventListener('click', (e) => { // Escuta cliques em todo o documento
    const navMenu = document.getElementById('navMenu'); // Pega elemento do menu
    const menuBtn = document.querySelector('.mobile-menu-btn'); // Pega botão do menu (querySelector = 1º elemento com essa classe)
    
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) { // Se clique NÃO foi dentro do menu E NÃO foi no botão
        navMenu.classList.remove('show'); // Remove classe 'show' (fecha menu)
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Inicializar página
// Executa quando o HTML terminou de carregar completamente
document.addEventListener('DOMContentLoaded', () => { // Escuta evento DOMContentLoaded (DOM pronto)
    verificarAuth(); // Verifica se usuário está logado (se não, redireciona)
    carregarUsuarios(); // Carrega lista de usuários da API e exibe na tabela
}); // Fecha addEventListener