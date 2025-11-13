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
// window.location.origin pega http://localhost:3000 ou https://seusite.com
// Adiciona /api no final para formar URL completa da API
const API_BASE = window.location.origin + '/api'; // Constante com URL base da API

// Elementos do DOM (elementos HTML que serão manipulados)
const modal = document.getElementById('modal'); // Pega elemento com id='modal' (caixa de diálogo pop-up)
const modalTitle = document.getElementById('modalTitle'); // Pega elemento com id='modalTitle' (título do modal)
const alunoForm = document.getElementById('alunoForm'); // Pega elemento com id='alunoForm' (formulário)
const alunoIdInput = document.getElementById('alunoId'); // Pega input hidden com id='alunoId' (guarda ID ao editar)
const nomeInput = document.getElementById('nome'); // Pega input com id='nome' (campo nome)
const dataNascimentoInput = document.getElementById('dataNascimento'); // Pega input tipo date com id='dataNascimento'
const serieTurmaInput = document.getElementById('serieTurma'); // Pega select com id='serieTurma' (dropdown série/turma)
const emailInput = document.getElementById('email'); // Pega input com id='email' (campo email)
const telefoneInput = document.getElementById('telefone'); // Pega input com id='telefone' (campo telefone)
const salvarBtn = document.getElementById('salvarBtn'); // Pega botão com id='salvarBtn' (botão de salvar)
const tabelaAlunos = document.getElementById('tabelaAlunos'); // Pega tbody com id='tabelaAlunos' (corpo da tabela)
const messageDiv = document.getElementById('message'); // Pega div com id='message' (div para exibir mensagens)
const searchInput = document.getElementById('searchInput'); // Pega input com id='searchInput' (campo de busca)

// Estado da aplicação
let editandoAluno = false; // Variável booleana: true = modo edição, false = modo criação

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
 * Abre/fecha menu em dispositivos móveis
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
function abrirModal(aluno = null) { // Define função com parâmetro aluno (padrão null)
    if (aluno) { // Se aluno existe (não é null) = MODO EDIÇÃO
        // Modo edição
        editandoAluno = true; // Define estado como edição
        modalTitle.textContent = 'Editar Aluno'; // Muda título do modal
        alunoIdInput.value = aluno.id; // Armazena ID no input hidden para saber qual editar
        nomeInput.value = aluno.nome; // Preenche campo nome com dados atuais do aluno
        dataNascimentoInput.value = aluno.data_nascimento; // Preenche data de nascimento (formato YYYY-MM-DD)
        serieTurmaInput.value = aluno.serie_turma; // Preenche série/turma (select)
        emailInput.value = aluno.email || ''; // Preenche email OU string vazia se for null (operador OR)
        telefoneInput.value = aluno.telefone || ''; // Preenche telefone OU string vazia se for null
    } else { // Se aluno é null = MODO CRIAÇÃO
        // Modo criação
        editandoAluno = false; // Define estado como criação
        modalTitle.textContent = 'Adicionar Aluno'; // Título para novo aluno
        alunoForm.reset(); // Limpa todos os campos do formulário
        alunoIdInput.value = ''; // Sem ID = novo registro (não é edição)
    } // Fecha else
    
    modal.classList.add('show'); // Adiciona classe 'show' ao modal (CSS torna visível)
    nomeInput.focus(); // Coloca cursor (foco) no primeiro campo (nome)
} // Fecha função

// FUNÇÃO: Fechar modal
function fecharModal() { // Define função fecharModal (sem parâmetros)
    modal.classList.remove('show'); // Remove classe 'show' (CSS esconde modal)
    alunoForm.reset(); // Limpa todos os campos do formulário
    editandoAluno = false; // Reseta estado para false (modo criação)
} // Fecha função

// FUNÇÃO: Carregar lista de alunos
async function carregarAlunos() { // Define função async (permite usar await)
    try { // Bloco try para capturar erros
        const response = await fetch(`${API_BASE}/alunos`); // Faz requisição GET para /api/alunos
        const data = await response.json(); // Converte resposta em objeto JavaScript (await espera conversão)

        if (data.success) { // Se API retornou success: true
            exibirAlunos(data.data); // Chama função passando array de alunos
        } else { // Se success: false
            showMessage('Erro ao carregar alunos: ' + data.message); // Mostra mensagem de erro
        } // Fecha else
    } catch (error) { // Bloco catch captura erros de rede/conexão
        console.error('Erro ao carregar alunos:', error); // Exibe erro no console do navegador
        showMessage('Erro de conexão ao carregar alunos'); // Mostra mensagem genérica ao usuário
    } // Fecha catch
} // Fecha função

// FUNÇÃO: Buscar alunos (filtro por nome)
async function buscarAlunos() { // Define função async (sem parâmetros)
    const termo = searchInput.value.trim(); // Pega valor do campo de busca e remove espaços
    
    try { // Bloco try
        const url = termo  // Operador ternário: se termo existe
            ? `${API_BASE}/alunos?search=${encodeURIComponent(termo)}` // Então: adiciona parâmetro search na URL (encodeURIComponent codifica caracteres especiais)
            : `${API_BASE}/alunos`; // Senão: URL sem filtro (busca todos)
            
        const response = await fetch(url); // Faz GET para URL determinada acima
        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se sucesso
            exibirAlunos(data.data); // Exibe alunos filtrados
        } else { // Se erro
            showMessage('Erro ao buscar alunos: ' + data.message); // Mostra erro
        } // Fecha else
    } catch (error) { // Captura erros
        console.error('Erro ao buscar alunos:', error); // Log no console
        showMessage('Erro de conexão ao buscar alunos'); // Mensagem ao usuário
    } // Fecha catch
} // Fecha função

// FUNÇÃO: Limpar busca
function limparBusca() { // Define função limparBusca (sem parâmetros)
    searchInput.value = ''; // Limpa campo de busca (define como string vazia)
    carregarAlunos(); // Recarrega todos os alunos (sem filtro)
} // Fecha função

// FUNÇÃO: Exibir alunos na tabela
function exibirAlunos(alunos) { // Define função com parâmetro alunos (array)
    if (alunos.length === 0) { // Se array está vazio (length = 0)
        tabelaAlunos.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nenhum aluno encontrado</td>
            </tr>
        `; // Define HTML interno do tbody
        return; // Sai da função (não executa resto do código)
    } // Fecha if

    // map percorre array e retorna novo array de strings HTML
    // join('') junta array de strings em uma única string sem separador
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
    `).join(''); // join concatena tudo em uma string
} // Fecha função

// FUNÇÃO: Formatar data para exibição (apenas data, sem hora)
function formatarData(dataString) { // Define função com parâmetro dataString
    const data = new Date(dataString + 'T00:00:00'); // Cria objeto Date adicionando hora 00:00:00 (evita problema de fuso horário)
    return data.toLocaleDateString('pt-BR'); // Retorna data formatada (pt-BR = português Brasil) apenas DD/MM/AAAA
} // Fecha função

// FUNÇÃO: Editar aluno
async function editarAluno(id) { // Define função async com parâmetro id
    try { // Bloco try para capturar erros
        const response = await fetch(`${API_BASE}/alunos/${id}`); // Faz GET para /api/alunos/1 (exemplo)
        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se API retornou success: true
            abrirModal(data.data); // Passa objeto aluno para abrirModal (modo edição)
        } else { // Se success: false
            showMessage('Erro ao buscar aluno: ' + data.message); // Mostra erro
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao buscar aluno:', error); // Log no console
        showMessage('Erro de conexão ao buscar aluno'); // Mensagem ao usuário
    } // Fecha catch
} // Fecha função

// FUNÇÃO: Confirmar exclusão
function confirmarExclusao(id, nome) { // Define função com 2 parâmetros (id e nome)
    if (confirm(`Tem certeza que deseja excluir o aluno "${nome}"?`)) { // confirm() mostra diálogo nativo (retorna true/false)
        excluirAluno(id); // Só executa se confirmou (true)
    } // Fecha if (se cancelou, não faz nada)
} // Fecha função

// FUNÇÃO: Excluir aluno
async function excluirAluno(id) { // Define função async com parâmetro id
    try { // Bloco try para capturar erros
        const response = await fetch(`${API_BASE}/alunos/${id}`, { // Faz DELETE para /api/alunos/5 (exemplo)
            method: 'DELETE' // Define método HTTP como DELETE
        }); // Fecha objeto de configuração

        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se API retornou success: true
            showMessage('Aluno excluído com sucesso!', 'success'); // Mensagem verde de sucesso
            carregarAlunos(); // Recarrega a lista (atualiza tabela)
        } else { // Se success: false
            showMessage('Erro ao excluir aluno: ' + data.message); // Mensagem vermelha de erro
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao excluir aluno:', error); // Log no console
        showMessage('Erro de conexão ao excluir aluno'); // Mensagem ao usuário
    } // Fecha catch
} // Fecha função

// FUNÇÃO: Salvar aluno (criar ou atualizar)
async function salvarAluno(dadosAluno) { // Define função async com parâmetro dadosAluno (objeto)
    try { // Bloco try para capturar erros
        salvarBtn.textContent = 'Salvando...'; // Muda texto do botão para feedback visual
        salvarBtn.disabled = true; // Desabilita botão enquanto processa (evita duplo clique)

        const url = editandoAluno  // Operador ternário: se editandoAluno é true
            ? `${API_BASE}/alunos/${alunoIdInput.value}` // Então: Editar: PUT /api/alunos/5
            : `${API_BASE}/alunos`; // Senão: Criar: POST /api/alunos
        
        const method = editandoAluno ? 'PUT' : 'POST'; // Se editar = PUT, se criar = POST

        const response = await fetch(url, { // Faz fetch para URL determinada acima
            method: method, // Define método HTTP (POST ou PUT)
            headers: { // Cabeçalhos HTTP
                'Content-Type': 'application/json' // Informa que está enviando JSON
            }, // Fecha headers
            body: JSON.stringify(dadosAluno) // Converte objeto JavaScript em string JSON e envia no corpo
        }); // Fecha objeto de configuração

        const data = await response.json(); // Converte resposta em objeto

        if (data.success) { // Se API retornou success: true
            showMessage(data.message, 'success'); // Mensagem verde com texto da API
            fecharModal(); // Fecha modal
            carregarAlunos(); // Recarrega tabela (mostra novo/editado aluno)
        } else { // Se success: false
            showMessage(data.message); // Mensagem vermelha com erro da API
        } // Fecha else
    } catch (error) { // Captura erros de rede
        console.error('Erro ao salvar aluno:', error); // Log no console
        showMessage('Erro de conexão ao salvar aluno'); // Mensagem ao usuário
    } finally { // Bloco finally sempre executa (sucesso ou erro)
        salvarBtn.textContent = 'Salvar'; // Volta texto original
        salvarBtn.disabled = false; // Reabilita botão
    } // Fecha finally
} // Fecha função

// FUNÇÃO: Formatação de telefone (máscara automática)
function formatarTelefone(valor) { // Define função com parâmetro valor
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, ''); // Regex \D = tudo que NÃO é dígito, g = global (todas ocorrências)
    
    // Aplica a máscara (conforme quantidade de dígitos)
    if (valor.length >= 11) { // Se tem 11+ dígitos (celular com 9)
        return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Regex com grupos: (11) 98888-7777
    } else if (valor.length >= 10) { // Se tem 10 dígitos (telefone fixo)
        return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // (11) 8888-7777
    } else if (valor.length >= 6) { // Se tem 6+ dígitos
        return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); // (11) 8888-77
    } else if (valor.length >= 2) { // Se tem 2+ dígitos
        return valor.replace(/(\d{2})(\d{0,5})/, '($1) $2'); // (11) 888
    } else { // Senão (menos de 2 dígitos)
        return valor; // Retorna sem formatação
    } // Fecha else
} // Fecha função

// EVENT LISTENER: Formatação do telefone (aplica máscara enquanto digita)
telefoneInput.addEventListener('input', (e) => { // Adiciona escutador de evento 'input' (dispara a cada caractere digitado)
    e.target.value = formatarTelefone(e.target.value); // Formata valor do input e substitui
}); // Fecha addEventListener

// EVENT LISTENER: Busca em tempo real (ao pressionar Enter)
searchInput.addEventListener('keyup', (e) => { // Adiciona escutador de evento 'keyup' (tecla solta)
    if (e.key === 'Enter') { // Se tecla pressionada foi Enter
        buscarAlunos(); // Chama função de busca
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Submeter formulário (ao clicar em Salvar)
alunoForm.addEventListener('submit', (e) => { // Adiciona escutador de evento 'submit' ao formulário
    e.preventDefault(); // Previne comportamento padrão (não recarrega página)
    
    const nome = nomeInput.value.trim(); // Pega valor do campo nome e remove espaços
    const dataNascimento = dataNascimentoInput.value; // Pega valor da data (formato YYYY-MM-DD)
    const serieTurma = serieTurmaInput.value; // Pega valor do select série/turma
    const email = emailInput.value.trim(); // Pega email e remove espaços
    const telefone = telefoneInput.value.trim(); // Pega telefone e remove espaços

    // VALIDAÇÕES
    if (!nome || !dataNascimento || !serieTurma) { // Se nome vazio OU data vazia OU série vazia (operador lógico OR)
        showMessage('Nome, data de nascimento e série/turma são obrigatórios'); // Mostra mensagem de erro
        return; // Sai da função (não continua)
    } // Fecha if

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

    // Validar idade (não pode ter mais de 25 anos ou menos de 5 anos)
    const hoje = new Date(); // Cria objeto Date com data/hora atual
    const nascimento = new Date(dataNascimento); // Cria objeto Date com data de nascimento
    const idade = hoje.getFullYear() - nascimento.getFullYear(); // Calcula idade (ano atual - ano nascimento)
    
    if (idade < 5 || idade > 25) { // Se idade menor que 5 OU maior que 25
        showMessage('Idade deve estar entre 5 e 25 anos'); // Erro
        return; // Sai
    } // Fecha if

    // Preparar dados
    const dadosAluno = { // Cria objeto com os dados do aluno
        nome, // Shorthand property: equivalente a nome: nome
        dataNascimento, // Equivalente a dataNascimento: dataNascimento
        serieTurma, // Equivalente a serieTurma: serieTurma
        email, // Email (pode ser string vazia)
        telefone // Telefone (pode ser string vazia)
    }; // Fecha objeto

    salvarAluno(dadosAluno); // Chama função que envia dados para API
}); // Fecha addEventListener

// FUNÇÃO: Validar e-mail usando regex
function isValidEmail(email) { // Define função com parâmetro email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex: caracteres + @ + caracteres + . + caracteres
    return emailRegex.test(email); // .test() retorna true se email corresponde ao padrão, false se não
} // Fecha função

// EVENT LISTENER: Fechar modal ao clicar fora (no overlay)
modal.addEventListener('click', (e) => { // Adiciona escutador de evento 'click' ao modal
    if (e.target === modal) { // Se elemento clicado (e.target) é o próprio modal (não o conteúdo interno)
        fecharModal(); // Fecha modal
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Fechar modal com tecla ESC
document.addEventListener('keydown', (e) => { // Adiciona escutador de evento 'keydown' (tecla pressionada) ao documento
    if (e.key === 'Escape' && modal.classList.contains('show')) { // Se tecla é Escape E modal tem classe 'show' (está aberto)
        fecharModal(); // Fecha modal
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Fechar menu mobile ao clicar fora
document.addEventListener('click', (e) => { // Escuta cliques em todo o documento
    const navMenu = document.getElementById('navMenu'); // Pega elemento do menu
    const menuBtn = document.querySelector('.mobile-menu-btn'); // Pega botão do menu (querySelector = 1º elemento com essa classe)
    
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) { // Se clique NÃO foi dentro do menu E NÃO foi no botão
        navMenu.classList.remove('show'); // Remove classe 'show' (fecha menu)
    } // Fecha if
}); // Fecha addEventListener

// EVENT LISTENER: Inicializar página (quando HTML termina de carregar)
document.addEventListener('DOMContentLoaded', () => { // Escuta evento DOMContentLoaded (DOM pronto)
    verificarAuth(); // Verifica se usuário está logado (se não, redireciona)
    carregarAlunos(); // Carrega lista de alunos da API e exibe na tabela
}); // Fecha addEventListener