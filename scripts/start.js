#!/usr/bin/env node

/**
 * Script de inicialização do Sistema Escolar
 * Este script configura o ambiente e inicia o servidor
 */

const { initDatabase } = require('../backend/db/database');
const config = require('../backend/config/config');

async function inicializar() {
    console.log('🚀 Iniciando Sistema Escolar...');
    console.log('📊 Valdemar Sistemas - 2025');
    console.log('');

    try {
        // Inicializar banco de dados
        console.log('🗄️  Inicializando banco de dados...');
        await initDatabase();
        console.log('✅ Banco de dados configurado!');
        
        // Exibir informações do sistema
        console.log('');
        console.log('📋 Informações do Sistema:');
        console.log(`   Nome: ${config.app.name}`);
        console.log(`   Versão: ${config.app.version}`);
        console.log(`   Autor: ${config.app.author}`);
        console.log(`   Porta: ${config.server.port}`);
        console.log('');
        
        // Iniciar servidor
        require('../backend/server');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error.message);
        process.exit(1);
    }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
    inicializar();
}

module.exports = { inicializar };