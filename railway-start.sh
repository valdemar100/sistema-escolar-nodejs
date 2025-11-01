#!/bin/bash

# Railway startup script
echo "🚀 Iniciando Sistema Escolar no Railway..."
echo "📊 Valdemar Sistemas - 2025"

# Verificar se o diretório do banco existe
mkdir -p backend/db

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o banco existe, se não, criar
if [ ! -f "backend/db/escola.db" ]; then
    echo "🗄️ Criando banco de dados inicial..."
    node -e "
    const Database = require('./backend/db/database');
    console.log('✅ Banco criado com sucesso!');
    "
fi

echo "🌐 Iniciando servidor..."
node scripts/start.js