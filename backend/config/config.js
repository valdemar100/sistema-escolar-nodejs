// Configurações do sistema
module.exports = {
    // Configurações do servidor
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },

    // Configurações do banco de dados
    database: {
        path: './backend/db/escola.db',
        maxConnections: 10
    },

    // Configurações de segurança
    security: {
        saltRounds: 10,
        sessionSecret: process.env.SESSION_SECRET || 'valdemar-sistemas-2025',
        jwtSecret: process.env.JWT_SECRET || 'jwt-secret-key'
    },

    // Configurações da aplicação
    app: {
        name: 'Sistema Escolar',
        version: '1.0.0',
        author: 'Valdemar Sistemas',
        year: 2025
    },

    // Configurações de CORS
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://seu-dominio.com'] 
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true
    }
};