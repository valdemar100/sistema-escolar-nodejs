# 📚 Sistema Escolar

Sistema completo para gerenciamento escolar desenvolvido com **Node.js**, **Express**, **SQLite** e **HTML/CSS/JavaScript** puro.

## 🎨 Características

- ✅ **Front-end moderno e responsivo** com paleta de cores profissional
- ✅ **Back-end robusto** em Node.js + Express
- ✅ **Banco SQLite** para persistência local
- ✅ **CRUD completo** para usuários, alunos e professores
- ✅ **Sistema de autenticação** funcional
- ✅ **Dashboard interativo** com gráficos Chart.js
- ✅ **Design totalmente responsivo** (mobile-first)
- ✅ **Busca e filtros** em tempo real

## 🎯 Funcionalidades

### 🔐 Sistema de Login
- Autenticação por e-mail e senha
- Validação de credenciais no banco
- Redirecionamento automático
- **Credenciais padrão:** `admin@escola.com` / `123456`

### 👤 Gerenciamento de Usuários
- ➕ Criar novos usuários
- ✏️ Editar informações
- 🗑️ Excluir usuários
- 📋 Listar todos os usuários
- ✔️ Validação de e-mail único

### 🎓 Gerenciamento de Alunos
- ➕ Cadastrar alunos completos
- 🔍 Buscar por nome
- 📊 Organizar por série/turma
- ✏️ Editar dados pessoais
- 🗑️ Remover alunos

### 👨‍🏫 Gerenciamento de Professores
- ➕ Adicionar professores
- 📚 Definir disciplinas
- 🔍 Buscar por nome ou matéria
- ✏️ Atualizar informações
- 🗑️ Excluir registros

### 📊 Dashboard Interativo
- 📈 **Gráfico em tempo real** (Chart.js)
- 🧮 Contadores dinâmicos
- 📱 Layout responsivo
- 🔄 Atualização automática

## 🚀 Instalação e Uso

### 1️⃣ Pré-requisitos
```bash
# Node.js versão 14+ instalado
node --version
npm --version
```

### 2️⃣ Clone ou baixe o projeto
```bash
# Se usando Git
git clone <url-do-repositorio>
cd sistema-escolar

# Ou extrair arquivos ZIP na pasta desejada
```

### 3️⃣ Instalar dependências
```bash
npm install
```

### 4️⃣ Executar o sistema
```bash
# Modo recomendado (script de inicialização)
npm start

# Modo desenvolvimento (com auto-restart)
npm run dev

# Modo servidor direto
npm run server
```

### 5️⃣ Acessar o sistema
```
🌐 Abra seu navegador em: http://localhost:3000
📧 E-mail: admin@escola.com  
🔐 Senha: 123456
```

## 📁 Estrutura do Projeto

```
sistema-escolar/
├── 📁 backend/                   # Servidor Node.js
│   ├── 📄 server.js              # Servidor principal Express
│   ├── 📁 config/
│   │   └── 📄 config.js          # Configurações do sistema
│   ├── 📁 middleware/            # Middlewares personalizados
│   ├── 📁 routes/                # Rotas da API REST
│   │   ├── 📄 usuarios.js        # CRUD de usuários
│   │   ├── 📄 alunos.js          # CRUD de alunos
│   │   └── 📄 professores.js     # CRUD de professores
│   └── 📁 db/                    # Banco de dados SQLite
│       ├── 📄 database.js        # Configuração e queries
│       └── 📄 escola.db          # Arquivo do banco (auto-gerado)
├── 📁 frontend/                  # Interface do usuário
│   ├── � pages/                 # Páginas HTML
│   │   ├── �📄 login.html         # Tela de login
│   │   ├── 📄 cadastro.html      # Cadastro de usuários
│   │   ├── 📄 index.html         # Dashboard principal
│   │   ├── 📄 usuarios.html      # Gerenciar usuários
│   │   ├── 📄 alunos.html        # Gerenciar alunos
│   │   └── 📄 professores.html   # Gerenciar professores
│   └── 📁 assets/                # Recursos estáticos
│       ├── 📁 css/
│       │   └── 📄 style.css      # Estilos responsivos
│       ├── 📁 js/                # Scripts JavaScript
│       │   ├── 📄 login.js       # Lógica do login
│       │   ├── 📄 cadastro.js    # Lógica do cadastro
│       │   ├── 📄 usuarios.js    # Lógica dos usuários
│       │   ├── 📄 alunos.js      # Lógica dos alunos
│       │   └── 📄 professores.js # Lógica dos professores
│       └── 📁 images/            # Imagens e ícones
├── 📁 scripts/                   # Scripts de automação
│   └── 📄 start.js               # Script de inicialização
├── 📁 docs/                      # Documentação adicional
├── 📄 package.json               # Dependências e scripts
├── 📄 .gitignore                 # Arquivos ignorados pelo Git
└── 📄 README.md                  # Documentação principal
```

## 🎨 Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| 🔵 Primária | `#3B82F6` | Botões, links ativos |
| 🔷 Primária escura | `#2563EB` | Hover dos botões |
| ⚪ Fundo | `#F9FAFB` | Background geral |
| ⚫ Texto principal | `#111827` | Textos principais |
| 🔘 Texto secundário | `#6B7280` | Textos auxiliares |
| 🟢 Sucesso | `#10B981` | Mensagens de sucesso |
| 🔴 Erro | `#EF4444` | Mensagens de erro |
| 🟡 Aviso | `#F59E0B` | Mensagens de alerta |

## 🔌 API Endpoints

### 🔐 Autenticação
- `POST /api/login` - Fazer login

### 👤 Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### 🎓 Alunos
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos?search=nome` - Buscar alunos
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

### 👨‍🏫 Professores
- `GET /api/professores` - Listar professores
- `GET /api/professores?search=termo` - Buscar professores
- `POST /api/professores` - Criar professor
- `PUT /api/professores/:id` - Atualizar professor
- `DELETE /api/professores/:id` - Deletar professor

### 📊 Dashboard
- `GET /api/dashboard` - Estatísticas gerais

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados local
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilos e responsividade
- **JavaScript (Vanilla)** - Lógica do frontend
- **Chart.js** - Gráficos interativos
- **Fetch API** - Comunicação com o backend

## 📱 Responsividade

O sistema é **totalmente responsivo** e funciona perfeitamente em:
- 📱 **Mobile** (320px+)
- 📟 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Widescreen** (1200px+)

## �️ Organização de Arquivos

### 📋 **Separação por Funcionalidade**
- **`/backend`** - Toda lógica do servidor
- **`/frontend/pages`** - Páginas HTML organizadas
- **`/frontend/assets`** - CSS, JS e imagens
- **`/scripts`** - Scripts de automação e deploy
- **`/docs`** - Documentação técnica
- **`/config`** - Arquivos de configuração

### 🎯 **Vantagens da Organização**
- ✅ **Escalabilidade** - Fácil de expandir
- ✅ **Manutenção** - Código bem organizado  
- ✅ **Deploy** - Estrutura pronta para produção
- ✅ **Colaboração** - Padrão profissional

## �🔧 Scripts Disponíveis

```bash
npm start        # Script de inicialização completa
npm run dev      # Desenvolvimento com nodemon
npm run server   # Servidor direto sem inicialização
npm run init-db  # Inicializar apenas o banco
npm run build    # Informativo (arquivos estáticos)
```

## 🚀 Deploy / Publicação

### Opção 1: Render (Recomendado)
1. Crie conta no [Render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Configure como "Web Service"
4. Build Command: `npm install`
5. Start Command: `npm start`

### Opção 2: Heroku
1. Instale Heroku CLI
2. `heroku create nome-do-app`
3. `git push heroku main`

### Opção 3: Vercel
1. Instale Vercel CLI: `npm i -g vercel`
2. Na pasta do projeto: `vercel`
3. Siga as instruções

## 🐛 Solução de Problemas

### Erro de porta ocupada
```bash
# Matar processo na porta 3000
npx kill-port 3000
```

### Banco não inicializa
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
- Verifique se o backend está rodando na porta correta
- Confirme se o frontend está acessando a URL correta

## 💡 Melhorias Futuras

- [ ] Sistema de permissões por usuário
- [ ] Upload de fotos de perfil
- [ ] Relatórios em PDF
- [ ] Notificações em tempo real
- [ ] Backup automático do banco
- [ ] Tema escuro (dark mode)
- [ ] Integração com APIs externas

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para fins educacionais.

---

**🎯 Sistema funcional, responsivo e pronto para uso!** 🚀