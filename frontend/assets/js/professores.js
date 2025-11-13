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
// window.location.origin pega http://localhost:3000 ou https://seusite.com
// Adiciona /api no final para formar URL completa da API
const API_BASE = window.location.origin + '/api'; // Constante com URL base da API

// Elementos do DOM (elementos HTML que serão manipulados)
const modal = document.getElementById('modal'); // Pega elemento com id='modal' (caixa de diálogo pop-up)
const modalTitle = document.getElementById('modalTitle'); // Pega elemento com id='modalTitle' (título do modal)
const professorForm = document.getElementById('professorForm'); // Pega elemento com id='professorForm' (formulário)
const professorIdInput = document.getElementById('professorId'); // Pega input hidden com id='professorId' (guarda ID ao editar)
const nomeInput = document.getElementById('nome'); // Pega input com id='nome' (campo nome)
const disciplinaInput = document.getElementById('disciplina'); // Pega select com id='disciplina' (dropdown disciplina)
const emailInput = document.getElementById('email'); // Pega input com id='email' (campo email)
const telefoneInput = document.getElementById('telefone'); // Pega input com id='telefone' (campo telefone)
const salvarBtn = document.getElementById('salvarBtn'); // Pega botão com id='salvarBtn' (botão de salvar)
const tabelaProfessores = document.getElementById('tabelaProfessores'); // Pega tbody com id='tabelaProfessores' (corpo da tabela)
const messageDiv = document.getElementById('message'); // Pega div com id='message' (div para exibir mensagens)
const searchInput = document.getElementById('searchInput'); // Pega input com id='searchInput' (campo de busca)

// Estado da aplicação
let editandoProfessor = false; // Variável booleana: true = modo edição, false = modo criação

/**
 * FUNÇÃO: Verificar autenticação
 * Se não está logado, redireciona para login
/**
 * FUNÇÃO: Verificar autenticação
 * Se não está logado, redireciona para login
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
 * Remove usuário do localStorage e volta para login
 */
function logout() { // Define função logout (sem parâmetros)
    localStorage.removeItem('usuario'); // Remove item 'usuario' do localStorage (desloga)
    window.location.href = '/'; // Redireciona para página inicial (login)
} // Fecha função

/**
 * FUNÇÃO: Toggle menu mobile
 * Abre/fecha menu de navegação em celular
 */
function toggleMenu() { // Define função toggleMenu (sem parâmetros)
    const navMenu = document.getElementById('navMenu'); // Pega elemento com id='navMenu'
    navMenu.classList.toggle('show'); // Alterna (adiciona/remove) classe 'show' no elemento
} // Fecha função

/**
 * FUNÇÃO: Exibir mensagens de sucesso/erro
 */
function showMessage(text, type = 'error') { // Define função com 2 parâmetros (type tem valor padrão 'error')
    messageDiv.textContent = text; // Define texto interno da div de mensagem
    messageDiv.className = `message ${type} show`; // Define classes da div (template literal)
    
    // Esconder após 5 segundos
    setTimeout(() => { // setTimeout executa função arrow após 5000ms (5 segundos)
        messageDiv.className = 'message'; // Remove classes 'error/success' e 'show' (esconde mensagem)
    }, 5000); // Delay de 5000 milissegundos
} // Fecha função

// FUNÇÃO: Abrir modal (criar ou editar)
function abrirModal(professor = null) { // Define função com parâmetro professor (padrão null)
    if (professor) { // Se professor existe (não é null) = MODO EDIÇÃO
        // Modo edição
        editandoProfessor = true; // Define estado como edição
        modalTitle.textContent = 'Editar Professor'; // Muda título do modal
        professorIdInput.value = professor.id; // Armazena ID no input hidden para saber qual editar
        nomeInput.value = professor.nome; // Preenche campo nome com dados atuais do professor
        disciplinaInput.value = professor.disciplina; // Preenche disciplina (select)
        emailInput.value = professor.email || ''; // Preenche email OU string vazia se for null (operador OR)
        telefoneInput.value = professor.telefone || ''; // Preenche telefone OU string vazia se for null
    } else { // Se professor é null = MODO CRIAÇÃO
        // Modo criação
        editandoProfessor = false; // Define estado como criação
        modalTitle.textContent = 'Adicionar Professor'; // Título para novo professor
        professorForm.reset(); // Limpa todos os campos do formulário
        professorIdInput.value = ''; // Sem ID = novo registro (não é edição)
    } // Fecha else
    
    modal.classList.add('show'); // Adiciona classe 'show' ao modal (CSS torna visível)
    nomeInput.focus(); // Coloca cursor (foco) no primeiro campo (nome)
} // Fecha função

// FUNÇÃO: Fechar modal
function fecharModal() { // Define função fecharModal (sem parâmetros)
    modal.classList.remove('show'); // Remove classe 'show' (CSS esconde modal)
    professorForm.reset(); // Limpa todos os campos do formulário
    editandoProfessor = false; // Reseta estado para false (modo criação)
} // Fecha função

// FUNÇÃO: Carregar lista de professores
async function carregarProfessores() { // Define função async (permite usar await)
    try { // Bloco try para capturar erros
        const response = await fetch(`${API_BASE}/professores`); // Faz requisição GET para /api/professores
        const data = await response.json(); // Converte resposta em objeto JavaScript (await espera conversão)

        if (data.success) { // Se API retornou success: true
            exibirProfessores(data.data); // Chama função passando array de professores
        } else { // Se success: false
            showMessage('Erro ao carregar professores: ' + data.message); // Mostra mensagem de erro
        } // Fecha else
    } catch (error) { // Bloco catch captura erros de rede/conexão
        console.error('Erro ao carregar professores:', error); // Exibe erro no console do navegador
        showMessage('Erro de conexão ao carregar professores'); // Mostra mensagem genérica ao usuário
    } // Fecha catch
} // Fecha função

// FUNÇÃO: Buscar professores (filtro por nome/disciplina)
async function buscarProfessores() { // Define função async (sem parâmetros)
    const termo = searchInput.value.trim(); // Pega valor do campo de busca e remove espaços
    
    try { // Bloco try
        const url = termo  // Operador ternário: se termo existe
            ? `${API_BASE}/professores?search=${encodeURIComponent(termo)}` // Então: adiciona parâmetro search na URL (encodeURIComponent codifica caracteres especiais)
            : `${API_BASE}/professores`; // Senão: URL sem filtro (busca todos)
            
        const response = await fetch(url); // Faz GET para URL determinada acima
        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se sucesso (success é true)
            exibirProfessores(data.data); // Chama função passando array data.data
        } else { // Se falhou
            showMessage('Erro ao buscar professores: ' + data.message); // Mostra erro com mensagem concatenada
        }
    } catch (error) { // Captura erro de rede ou código
        console.error('Erro ao buscar professores:', error); // Exibe erro no console
        showMessage('Erro de conexão ao buscar professores'); // Mostra mensagem genérica
    }
}

// Limpar busca
function limparBusca() { // Função para limpar campo de busca
    searchInput.value = ''; // Define valor do input como string vazia
    carregarProfessores(); // Recarrega todos professores (sem filtro)
}

// Exibir professores na tabela
function exibirProfessores(professores) { // Recebe array de professores como parâmetro
    if (professores.length === 0) { // Se array está vazio
        tabelaProfessores.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nenhum professor encontrado</td>
            </tr>
        `; // Define HTML interno da tabela
        return; // Sai da função aqui
    }

    // map percorre array de professores, retorna novo array com HTML de cada linha
    // join transforma array em string única sem separador
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
function formatarData(dataString) { // Recebe string de data como parâmetro
    const data = new Date(dataString); // Cria objeto Date a partir da string
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { // Retorna data formatada pt-BR + espaço + hora
        hour: '2-digit', // Hora com 2 dígitos
        minute: '2-digit' // Minuto com 2 dígitos
    }); // toLocaleTimeString formata hora em português
}

// Editar professor
async function editarProfessor(id) { // Função assíncrona, recebe ID do professor
    try { // Bloco de tentativa
        const response = await fetch(`${API_BASE}/professores/${id}`); // Faz GET, aguarda resposta (await pausa execução)
        const data = await response.json(); // Converte resposta JSON em objeto, aguarda conversão

        if (data.success) { // Se sucesso é true
            abrirModal(data.data); // Chama função passando objeto professor
        } else { // Se falhou
            showMessage('Erro ao buscar professor: ' + data.message); // Mostra mensagem de erro concatenada
        }
    } catch (error) { // Captura erros de rede ou código
        console.error('Erro ao buscar professor:', error); // Exibe erro no console
        showMessage('Erro de conexão ao buscar professor'); // Mostra mensagem genérica
    }
}

// Confirmar exclusão
function confirmarExclusao(id, nome) { // Recebe ID e nome do professor
    if (confirm(`Tem certeza que deseja excluir o professor "${nome}"?`)) { // Mostra diálogo de confirmação, retorna true/false
        excluirProfessor(id); // Se confirmou, chama função passando ID
    } // Se cancelou, não faz nada
}

// Excluir professor
async function excluirProfessor(id) { // Função assíncrona, recebe ID
    try { // Bloco de tentativa
        const response = await fetch(`${API_BASE}/professores/${id}`, { // Faz requisição DELETE, aguarda resposta
            method: 'DELETE' // Método HTTP DELETE
        }); // Segundo parâmetro de fetch é objeto de configuração

        const data = await response.json(); // Converte resposta em objeto, aguarda

        if (data.success) { // Se exclusão funcionou
            showMessage('Professor excluído com sucesso!', 'success'); // Mostra mensagem verde
            carregarProfessores(); // Recarrega lista atualizada
        } else { // Se falhou // Se falhou
            showMessage('Erro ao excluir professor: ' + data.message); // Mostra mensagem de erro concatenada
        }
    } catch (error) { // Captura erros
        console.error('Erro ao excluir professor:', error); // Exibe erro no console
        showMessage('Erro de conexão ao excluir professor'); // Mostra mensagem genérica
    }
}

// Salvar professor (criar ou atualizar)
async function salvarProfessor(dadosProfessor) { // Função assíncrona, recebe objeto com dados
    try { // Bloco de tentativa
        salvarBtn.textContent = 'Salvando...'; // Muda texto do botão
        salvarBtn.disabled = true; // Desabilita botão (disabled = true)

        const url = editandoProfessor // Define URL baseado na variável booleana
            ? `${API_BASE}/professores/${professorIdInput.value}` // Se editando, usa PUT com ID
            : `${API_BASE}/professores`; // Se criando, usa POST sem ID (operad or ternário)
        
        const method = editandoProfessor ? 'PUT' : 'POST'; // Define método: PUT se editando, POST se criando

        const response = await fetch(url, { // Faz requisição para URL, aguarda resposta
            method: method, // Método HTTP (PUT ou POST)
            headers: { // Cabeçalhos da requisição
                'Content-Type': 'application/json' // Informa que corpo é JSON
            }, // Objeto headers
            body: JSON.stringify(dadosProfessor) // Converte objeto em string JSON
        }); // Segundo parâmetro de fetch é objeto de configuração

        const data = await response.json(); // Converte resposta em objeto, aguarda

        if (data.success) { // Se salvou com sucesso
            showMessage(data.message, 'success'); // Mostra mensagem verde vinda do backend
            fecharModal(); // Fecha modal
            carregarProfessores(); // Recarrega lista atualizada
        } else { // Se falhou
            showMessage(data.message); // Mostra mensagem de erro (sem segundo parâmetro é erro)
        }
    } catch (error) { // Captura erros de rede ou código
        console.error('Erro ao salvar professor:', error); // Exibe erro no console
        showMessage('Erro de conexão ao salvar professor'); // Mostra mensagem genérica
    } finally { // Bloco que sempre executa (sucesso ou erro)
        salvarBtn.textContent = 'Salvar'; // Restaura texto original do botão
        salvarBtn.disabled = false; // Reabilita botão
    }
}

// Formatação de telefone
function formatarTelefone(valor) { // Recebe valor do input
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, ''); // \D pega qualquer caractere não dígito, /g é global (todos), substitui por vazio
    
    // Aplica a máscara
    if (valor.length >= 11) { // Se tem 11+ dígitos (celular com DDD)
        return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Regex captura 3 grupos: (DD) NNNNN-NNNN
    } else if (valor.length >= 10) { // Se tem 10 dígitos (fixo com DDD)
        return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // (DD) NNNN-NNNN
    } else if (valor.length >= 6) { // Se tem 6-9 dígitos
        return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); // {0,4} = 0 a 4 dígitos
    } else if (valor.length >= 2) { // Se tem 2-5 dígitos
        return valor.replace(/(\d{2})(\d{0,5})/, '($1) $2'); // {0,5} = 0 a 5 dígitos
    } else { // Se tem menos de 2 dígitos
        return valor; // Retorna sem formatação
    }
}

// Event listener para formatação do telefone
telefoneInput.addEventListener('input', (e) => { // Escuta evento input (qualquer mudança no campo)
    e.target.value = formatarTelefone(e.target.value); // e.target é o elemento, value é o valor digitado
}); // Arrow function recebe evento como parâmetro

// Event listener para busca em tempo real
searchInput.addEventListener('keyup', (e) => { // Escuta evento keyup (quando solta tecla)
    if (e.key === 'Enter') { // Se tecla pressionada foi Enter
        buscarProfessores(); // Executa busca
    } // Senão não faz nada
}); // e.key contém nome da tecla

// Event listener para o formulário
professorForm.addEventListener('submit', (e) => { // Escuta evento submit (envio do formulário)
    e.preventDefault(); // Previne comportamento padrão (recarregar página)
    
    const nome = nomeInput.value.trim(); // Pega valor do input e remove espaços das pontas
    const disciplina = disciplinaInput.value; // Pega valor selecionado no select
    const email = emailInput.value.trim(); // Pega email e remove espaços
    const telefone = telefoneInput.value.trim(); // Pega telefone e remove espaços

    // Validações
    if (!nome || !disciplina) { // Se nome vazio OU disciplina vazia (! é NOT, || é OR)
        showMessage('Nome e disciplina são obrigatórios'); // Mostra mensagem de erro
        return; // Sai da função sem salvar
    }

    // Validar email obrigatório
    if (!email) { // Se email está vazio (! inverte o valor booleano)
        showMessage('E-mail é obrigatório'); // Mostra mensagem de erro
        return; // Sai da função sem salvar
    } // Fecha if

    // Validar formato do email
    if (!isValidEmail(email)) { // Se email não é válido (chama função isValidEmail)
        showMessage('Por favor, digite um e-mail válido'); // Mostra erro
        return; // Sai da função
    } // Fecha if

    // Validar telefone obrigatório
    if (!telefone) { // Se telefone está vazio (! converte para booleano e inverte)
        showMessage('Telefone é obrigatório'); // Mostra mensagem de erro
        return; // Sai da função sem salvar
    } // Fecha if

    // Validar que telefone tem exatamente 11 dígitos
    const apenasNumeros = telefone.replace(/\D/g, ''); // Remove tudo que não é dígito (\D = não-dígito, /g = global)
    if (apenasNumeros.length !== 11) { // Se quantidade de números não é igual a 11 (!== é diferente)
        showMessage('Telefone deve ter exatamente 11 dígitos (DDD + número)'); // Mostra erro
        return; // Sai da função
    } // Fecha if

    // Preparar dados
    const dadosProfessor = { // Cria objeto literal
        nome, // Shorthand: mesmo que nome: nome
        disciplina, // Shorthand
        email, // Shorthand
        telefone // Shorthand
    }; // Objeto com 4 propriedades

    salvarProfessor(dadosProfessor); // Chama função passando objeto
}); // Arrow function recebe evento

// Validar e-mail
function isValidEmail(email) { // Recebe string de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex: início(^), sem espaço/@ (+), @, sem espaço/@ (+), ponto, sem espaço/@ (+), fim($)
    return emailRegex.test(email); // test() retorna true se email corresponde ao padrão
}

// Fechar modal ao clicar fora
modal.addEventListener('click', (e) => { // Escuta clique no modal
    if (e.target === modal) { // Se clicou exatamente no fundo (não no conteúdo interno)
        fecharModal(); // Fecha modal
    } // === compara valor E tipo
}); // e.target é o elemento clicado

// Fechar modal com ESC
document.addEventListener('keydown', (e) => { // Escuta tecla pressionada no documento todo
    if (e.key === 'Escape' && modal.classList.contains('show')) { // Se ESC E modal está visível
        fecharModal(); // Fecha modal
    } // && é AND, ambas condições devem ser true
}); // contains verifica se classe existe

// Fechar menu mobile ao clicar fora
document.addEventListener('click', (e) => { // Escuta clique no documento
    const navMenu = document.getElementById('navMenu'); // Pega elemento do menu
    const menuBtn = document.querySelector('.mobile-menu-btn'); // Pega botão do menu
    
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) { // Se clique fora do menu E fora do botão
        navMenu.classList.remove('show'); // Remove classe show (fecha menu)
    } // contains verifica se elemento contém outro
}); // ! é NOT

// Inicializar página
document.addEventListener('DOMContentLoaded', () => { // Escuta quando DOM estiver completamente carregado
    verificarAuth(); // Verifica se usuário está logado
    carregarProfessores(); // Carrega lista de professores
}); // Arrow function sem parâmetros