const { Pool } = require('pg');

// Verificar se está em produção
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

console.log('🔍 Ambiente detectado:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');

let pool;

if (isProduction) {
    console.log('🌐 Configurando PostgreSQL...');
    console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    if (process.env.DATABASE_URL) {
        try {
            // Limpar a string de possíveis caracteres ocultos
            const cleanUrl = process.env.DATABASE_URL.trim();
            console.log('URL limpa preview:', cleanUrl.substring(0, 50) + '...');
            
            pool = new Pool({
                connectionString: cleanUrl,
                ssl: { rejectUnauthorized: false }
            });
            console.log('✅ Pool PostgreSQL criado');
        } catch (poolError) {
            console.error('❌ Erro ao criar pool:', poolError.message);
        }
    } else {
        console.error('❌ DATABASE_URL não encontrada');
    }
} else {
    console.log('🏠 Usando SQLite local');
}

// Função simples para executar queries
const executeQuery = async (sql, params = []) => {
    if (isProduction && pool) {
        try {
            console.log('🔍 Executando query PostgreSQL:', sql.substring(0, 100));
            console.log('🔍 Parâmetros:', params);
            console.log('🔍 Pool config:', pool.options?.connectionString?.substring(0, 50) + '...');
            
            const result = await pool.query(sql, params);
            console.log('✅ Query executada, linhas retornadas:', result.rows.length);
            return result;
        } catch (error) {
            console.error('❌ Erro PostgreSQL completo:', error);
            console.error('❌ Erro message:', error.message);
            console.error('❌ Erro code:', error.code);
            console.error('❌ Erro hostname:', error.hostname);
            throw error;
        }
    } else {
        throw new Error('Pool PostgreSQL não disponível ou não é produção');
    }
};

// Inicializar database
const initDatabase = async () => {
    if (!isProduction) {
        console.log('🏠 Usando database.js local');
        const localDb = require('./database');
        return await localDb.initDatabase();
    }

    try {
        console.log('🌐 Inicializando PostgreSQL...');
        
        // Testar conexão
        await executeQuery('SELECT NOW()');
        console.log('✅ Conexão PostgreSQL OK');

        // Criar tabelas
        await executeQuery(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela usuarios OK');

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS alunos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                data_nascimento DATE NOT NULL,
                serie_turma VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela alunos OK');

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS professores (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                disciplina VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela professores OK');

        // Criar usuário admin
        try {
            const adminCheck = await executeQuery('SELECT id FROM usuarios WHERE email = $1', ['admin@escola.com']);
            if (adminCheck.rows.length === 0) {
                await executeQuery(
                    'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
                    ['Administrador', 'admin@escola.com', '123456']
                );
                console.log('✅ Admin criado');
            } else {
                console.log('✅ Admin já existe');
            }
        } catch (adminError) {
            console.log('⚠️ Erro admin:', adminError.message);
        }

        console.log('🎉 Database inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar database:', error);
        // Não fazer throw para não quebrar o servidor
    }
};

// Queries simplificadas
const usuarioQueries = {
    getAll: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM usuarios ORDER BY nome');
            return result.rows;
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.getAll();
        }
    },

    getById: async (id) => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM usuarios WHERE id = $1', [id]);
            return result.rows[0] || null;
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.getById(id);
        }
    },

    getByEmail: async (email) => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM usuarios WHERE email = $1', [email]);
            return result.rows[0] || null;
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.getByEmail(email);
        }
    },

    create: async (nome, email, senha) => {
        if (isProduction) {
            const result = await executeQuery(
                'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
                [nome, email, senha]
            );
            return result.rows[0];
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.create(nome, email, senha);
        }
    },

    update: async (id, nome, email, senha = null) => {
        if (isProduction) {
            let sql = 'UPDATE usuarios SET nome = $1, email = $2, updated_at = CURRENT_TIMESTAMP';
            let params = [nome, email];
            
            if (senha) {
                sql += ', senha = $3 WHERE id = $4';
                params.push(senha, id);
            } else {
                sql += ' WHERE id = $3';
                params.push(id);
            }
            
            const result = await executeQuery(sql, params);
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.update(id, nome, email, senha);
        }
    },

    delete: async (id) => {
        if (isProduction) {
            const result = await executeQuery('DELETE FROM usuarios WHERE id = $1', [id]);
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.delete(id);
        }
    },

    count: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT COUNT(*) as count FROM usuarios');
            return parseInt(result.rows[0].count);
        } else {
            const localDb = require('./database');
            return await localDb.usuarioQueries.count();
        }
    }
};

const alunoQueries = {
    getAll: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM alunos ORDER BY nome');
            return result.rows;
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.getAll();
        }
    },

    getById: async (id) => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM alunos WHERE id = $1', [id]);
            return result.rows[0] || null;
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.getById(id);
        }
    },

    create: async (nome, dataNascimento, serieTurma, email, telefone) => {
        if (isProduction) {
            const result = await executeQuery(
                'INSERT INTO alunos (nome, data_nascimento, serie_turma, email, telefone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nome, dataNascimento, serieTurma, email || '', telefone || '']
            );
            return result.rows[0];
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.create(nome, dataNascimento, serieTurma, email, telefone);
        }
    },

    update: async (id, nome, dataNascimento, serieTurma, email, telefone) => {
        if (isProduction) {
            const result = await executeQuery(
                'UPDATE alunos SET nome = $1, data_nascimento = $2, serie_turma = $3, email = $4, telefone = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
                [nome, dataNascimento, serieTurma, email || '', telefone || '', id]
            );
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.update(id, nome, dataNascimento, serieTurma, email, telefone);
        }
    },

    delete: async (id) => {
        if (isProduction) {
            const result = await executeQuery('DELETE FROM alunos WHERE id = $1', [id]);
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.delete(id);
        }
    },

    count: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT COUNT(*) as count FROM alunos');
            return parseInt(result.rows[0].count);
        } else {
            const localDb = require('./database');
            return await localDb.alunoQueries.count();
        }
    }
};

const professorQueries = {
    getAll: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM professores ORDER BY nome');
            return result.rows;
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.getAll();
        }
    },

    getById: async (id) => {
        if (isProduction) {
            const result = await executeQuery('SELECT * FROM professores WHERE id = $1', [id]);
            return result.rows[0] || null;
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.getById(id);
        }
    },

    create: async (nome, disciplina, email, telefone) => {
        if (isProduction) {
            console.log('🔍 Criando professor PostgreSQL:', { nome, disciplina, email, telefone });
            const result = await executeQuery(
                'INSERT INTO professores (nome, disciplina, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, disciplina, email || '', telefone || '']
            );
            console.log('✅ Professor criado:', result.rows[0]);
            return result.rows[0];
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.create(nome, disciplina, email, telefone);
        }
    },

    update: async (id, nome, disciplina, email, telefone) => {
        if (isProduction) {
            const result = await executeQuery(
                'UPDATE professores SET nome = $1, disciplina = $2, email = $3, telefone = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
                [nome, disciplina, email || '', telefone || '', id]
            );
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.update(id, nome, disciplina, email, telefone);
        }
    },

    delete: async (id) => {
        if (isProduction) {
            const result = await executeQuery('DELETE FROM professores WHERE id = $1', [id]);
            return { changes: result.rowCount };
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.delete(id);
        }
    },

    count: async () => {
        if (isProduction) {
            const result = await executeQuery('SELECT COUNT(*) as count FROM professores');
            return parseInt(result.rows[0].count);
        } else {
            const localDb = require('./database');
            return await localDb.professorQueries.count();
        }
    }
};

module.exports = {
    initDatabase,
    usuarioQueries,
    alunoQueries,
    professorQueries
};