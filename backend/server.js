const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

// Importar rotas
const usuariosRouter = require('./routes/usuarios');
const alunosRouter = require('./routes/alunos');
const professoresRouter = require('./routes/professores');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));

// Configurar rotas da API
app.use('/api/usuarios', usuariosRouter);
app.use('/api/alunos', alunosRouter);
app.use('/api/professores', professoresRouter);

// Rota para login
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email e senha são obrigatórios' 
            });
        }

        const { usuarioQueries } = require('./db/database');
        const usuario = await usuarioQueries.getByEmail(email);

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou senha inválidos' 
            });
        }

        // Remover senha da resposta
        const { senha: _, ...usuarioSeguro } = usuario;
        
        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso',
            usuario: usuarioSeguro
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para estatísticas do dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const { usuarioQueries, alunoQueries, professorQueries } = require('./db/database');
        
        const [totalUsuarios, totalAlunos, totalProfessores] = await Promise.all([
            usuarioQueries.count(),
            alunoQueries.count(),
            professorQueries.count()
        ]);

        res.json({
            success: true,
            data: {
                totalUsuarios,
                totalAlunos,
                totalProfessores
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar estatísticas' 
        });
    }
});

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

// Rota para páginas específicas
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/cadastro.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/usuarios.html'));
});

app.get('/alunos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/alunos.html'));
});

app.get('/professores', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/professores.html'));
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Inicializar banco de dados e servidor
const startServer = async () => {
    try {
        await initDatabase();
        console.log('Banco de dados inicializado com sucesso!');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📱 Frontend: http://localhost:${PORT}`);
            console.log(`🔌 API: http://localhost:${PORT}/api`);
            console.log('');
            console.log('📋 Credenciais padrão:');
            console.log('   Email: admin@escola.com');
            console.log('   Senha: 123456');
            console.log('');
        });
    } catch (error) {
        console.error('Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promessa rejeitada não tratada:', reason);
    process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;