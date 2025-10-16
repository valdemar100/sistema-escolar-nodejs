# 📚 Documentação Técnica - Sistema Escolar

## 🏗️ Arquitetura do Sistema

### 🔄 **Fluxo de Dados**
```
Frontend (HTML/CSS/JS) ↔ API REST ↔ Backend (Node.js) ↔ SQLite
```

### 🛠️ **Stack Tecnológica**

#### Backend
- **Node.js** v14+ - Runtime JavaScript
- **Express.js** v4.18+ - Framework web minimalista
- **SQLite3** v5.1+ - Banco de dados relacional local
- **CORS** v2.8+ - Cross-Origin Resource Sharing

#### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos responsivos com Flexbox/Grid
- **JavaScript ES6+** - Lógica do cliente (Vanilla JS)
- **Chart.js** - Gráficos interativos
- **Fetch API** - Requisições HTTP

## 🗄️ Banco de Dados

### 📊 **Esquema das Tabelas**

#### Tabela: usuarios
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: alunos
```sql
CREATE TABLE alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    serie_turma TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: professores
```sql
CREATE TABLE professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    disciplina TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API REST

### 🛡️ **Padrão de Resposta**
```json
{
    "success": true|false,
    "message": "Mensagem descritiva",
    "data": {} // Apenas em caso de sucesso
}
```

### 🔐 **Endpoints de Autenticação**
- `POST /api/login` - Autenticar usuário

### 👤 **Endpoints de Usuários**
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário por ID
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### 🎓 **Endpoints de Alunos**
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos?search=termo` - Buscar alunos
- `GET /api/alunos/:id` - Buscar aluno por ID
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

### 👨‍🏫 **Endpoints de Professores**
- `GET /api/professores` - Listar professores
- `GET /api/professores?search=termo` - Buscar professores
- `GET /api/professores/:id` - Buscar professor por ID
- `POST /api/professores` - Criar professor
- `PUT /api/professores/:id` - Atualizar professor
- `DELETE /api/professores/:id` - Deletar professor

### 📊 **Endpoints do Dashboard**
- `GET /api/dashboard` - Estatísticas gerais

## 🎨 CSS Framework Personalizado

### 🎯 **Sistema de Design**

#### Variáveis CSS
```css
:root {
    --primary: #3B82F6;
    --primary-dark: #2563EB;
    --background: #F9FAFB;
    --text-primary: #111827;
    --text-secondary: #6B7280;
    --success: #10B981;
    --error: #EF4444;
    --warning: #F59E0B;
}
```

#### Breakpoints Responsivos
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### 🧩 **Componentes Principais**
- `.card` - Cartões com sombra
- `.btn` - Botões com variações
- `.form-input` - Campos de formulário
- `.table` - Tabelas responsivas
- `.modal` - Modais com backdrop
- `.message` - Mensagens de feedback

## 🔒 Segurança

### 🛡️ **Medidas Implementadas**
- **Validação de entrada** - Frontend e backend
- **Sanitização de dados** - Prevenção de SQL injection
- **CORS configurado** - Controle de origem
- **Headers de segurança** - Express security

### 🔐 **Autenticação**
- **Sessão local** - localStorage do navegador
- **Validação de rotas** - Middleware de verificação
- **Logout seguro** - Limpeza de sessão

## 🚀 Deploy

### 🌐 **Plataformas Suportadas**
- **Render** - Recomendado para Node.js
- **Heroku** - Plataforma clássica
- **Vercel** - Ideal para projetos fullstack
- **Railway** - Nova alternativa moderna

### ⚙️ **Variáveis de Ambiente**
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SESSION_SECRET=sua-chave-secreta
JWT_SECRET=sua-jwt-secret
```

## 🧪 Testes

### 📝 **Testes Manuais Recomendados**
1. **Login/Logout** - Fluxo de autenticação
2. **CRUD Completo** - Criar, ler, atualizar, deletar
3. **Responsividade** - Diferentes tamanhos de tela
4. **Validações** - Campos obrigatórios e formatos
5. **Busca** - Funcionalidade de pesquisa
6. **Performance** - Tempo de resposta das APIs

## 🔧 Manutenção

### 📊 **Monitoramento**
- Logs do servidor no console
- Backup automático do SQLite
- Verificação de integridade dos dados

### 🔄 **Atualizações**
- Dependências do Node.js
- Patches de segurança
- Novas funcionalidades

---

**Desenvolvido por Valdemar Sistemas - 2025** 🚀