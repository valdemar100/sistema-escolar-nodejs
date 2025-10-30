# 🗄️ **Configuração de Banco de Dados para Produção**

## 📋 **Passo a Passo para Neon (PostgreSQL Gratuito)**

### **1. 🚀 Criar Conta no Neon**
1. Acesse [neon.tech](https://neon.tech)
2. Clique em "Sign Up" 
3. Registre-se com GitHub ou email

### **2. 🗄️ Criar Banco de Dados**
1. Após login, clique em "Create a project"
2. Escolha:
   - **Nome**: `sistema-escolar`
   - **Região**: `US East (Ohio)` ou mais próxima
   - **PostgreSQL Version**: Mais recente
3. Clique em "Create project"

### **3. 📋 Copiar String de Conexão**
1. Na dashboard do projeto, vá em "Connection Details"
2. Copie a **Connection String** (algo como):
   ```
   postgresql://usuario:senha@host/database
   ```

### **4. ⚙️ Configurar na Vercel**
1. No dashboard da Vercel, vá no seu projeto
2. Clique em "Settings" → "Environment Variables"
3. Adicione:
   ```
   Name: DATABASE_URL
   Value: [cole a connection string aqui]
   Environment: Production
   ```
4. Clique em "Save"

### **5. 🚀 Deploy**
1. Faça push das mudanças:
   ```bash
   git add .
   git commit -m "✨ Adiciona suporte PostgreSQL para produção"
   git push origin main
   ```
2. A Vercel vai fazer redeploy automaticamente

---

## 🎯 **Alternativas de Banco Gratuito**

### **🌟 Neon** (Recomendado)
- ✅ **500MB** gratuito
- ✅ **PostgreSQL** completo
- ✅ **SSL** automático
- ✅ **Dashboard** intuitivo

### **🔥 Supabase**
- ✅ **500MB** gratuito
- ✅ **PostgreSQL** + APIs automáticas
- ✅ **Interface** amigável

### **⚡ PlanetScale**
- ✅ **5GB** gratuito
- ✅ **MySQL** serverless
- ✅ **Branching** de schema

---

## 📊 **Como Funciona**

### **🏠 Local (Desenvolvimento)**
- **Banco**: SQLite (`escola.db`)
- **Comando**: `npm start`
- **Dados**: Persistem no arquivo local

### **🌐 Produção (Vercel)**
- **Banco**: PostgreSQL (Neon)
- **Deploy**: Automático via GitHub
- **Dados**: Persistem no servidor

### **🔄 Migração Automática**
O sistema detecta automaticamente onde está rodando:
- **Local**: Usa SQLite
- **Vercel**: Usa PostgreSQL

---

## 🛠️ **Comandos Úteis**

```bash
# Testar localmente
npm start

# Ver logs do banco
npm run server

# Deploy manual (se necessário)
git push origin main
```

---

## ✅ **Resultado Final**

Com essa configuração você terá:
- 🏠 **SQLite local** para desenvolvimento
- 🌐 **PostgreSQL** na Vercel em produção
- 📊 **CRUD completo** funcionando em ambos
- 🔄 **Migração automática** entre ambientes

**Seu Sistema Escolar funcionará perfeitamente online com banco real!** 🎉