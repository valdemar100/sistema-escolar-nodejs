const { Pool } = require('pg');

// Configuração do banco PostgreSQL para produção
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let db;

if (isProduction) {
    // Configuração PostgreSQL para produção
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
} else {
    // Usar SQLite local para desenvolvimento
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'escola.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao conectar com o banco de dados:', err.message);
        } else {
            console.log('Conectado ao banco SQLite com sucesso!');
        }
    });
}

// Função para executar queries compatível com ambos os bancos
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (isProduction) {
            // PostgreSQL
            db.query(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        } else {
            // SQLite
            if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ 
                        rows: [], 
                        rowCount: this.changes,
                        lastID: this.lastID 
                    });
                });
            } else {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows, rowCount: rows.length });
                });
            }
        }
    });
};

// Função para inicializar as tabelas
const initDatabase = async () => {
    try {
        if (isProduction) {
            console.log('🌐 Inicializando banco PostgreSQL...');
            
            // Criar tabelas PostgreSQL
            await query(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    senha VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await query(`
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

            await query(`
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

            // Inserir usuário admin se não existir
            const adminExists = await query('SELECT id FROM usuarios WHERE email = $1', ['admin@escola.com']);
            if (adminExists.rows.length === 0) {
                await query(
                    'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
                    ['Administrador', 'admin@escola.com', '123456']
                );
            }

            console.log('✅ Banco PostgreSQL configurado!');
        } else {
            // Usar a função SQLite existente
            const sqliteDb = require('./database');
            await sqliteDb.initDatabase();
        }
    } catch (error) {
        console.error('Erro ao inicializar banco:', error);
        throw error;
    }
};

// Funções para usuários compatíveis com ambos os bancos
const usuarioQueries = {
    getAll: async () => {
        const result = await query(
            isProduction 
                ? 'SELECT * FROM usuarios ORDER BY nome'
                : 'SELECT * FROM usuarios ORDER BY nome'
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await query(
            isProduction 
                ? 'SELECT * FROM usuarios WHERE id = $1'
                : 'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );
        return result.rows[0] || null;
    },

    getByEmail: async (email) => {
        const result = await query(
            isProduction 
                ? 'SELECT * FROM usuarios WHERE email = $1'
                : 'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return result.rows[0] || null;
    },

    create: async (nome, email, senha) => {
        if (isProduction) {
            const result = await query(
                'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
                [nome, email, senha]
            );
            return result.rows[0];
        } else {
            const result = await query(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senha]
            );
            return { id: result.lastID, nome, email, senha };
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
            
            const result = await query(sql, params);
            return { changes: result.rowCount };
        } else {
            let sql = 'UPDATE usuarios SET nome = ?, email = ?, updated_at = CURRENT_TIMESTAMP';
            let params = [nome, email];
            
            if (senha) {
                sql += ', senha = ? WHERE id = ?';
                params.push(senha, id);
            } else {
                sql += ' WHERE id = ?';
                params.push(id);
            }
            
            const result = await query(sql, params);
            return { changes: result.rowCount };
        }
    },

    delete: async (id) => {
        const result = await query(
            isProduction 
                ? 'DELETE FROM usuarios WHERE id = $1'
                : 'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return { changes: result.rowCount };
    },

    count: async () => {
        const result = await query('SELECT COUNT(*) as total FROM usuarios');
        return isProduction ? parseInt(result.rows[0].count) : result.rows[0].total;
    }
};

// Funções similares para alunos e professores...
const alunoQueries = {
    getAll: async () => {
        const result = await query('SELECT * FROM alunos ORDER BY nome');
        return result.rows;
    },

    getById: async (id) => {
        const result = await query(
            isProduction 
                ? 'SELECT * FROM alunos WHERE id = $1'
                : 'SELECT * FROM alunos WHERE id = ?',
            [id]
        );
        return result.rows[0] || null;
    },

    create: async (nome, dataNascimento, serieTurma, email, telefone) => {
        if (isProduction) {
            const result = await query(
                'INSERT INTO alunos (nome, data_nascimento, serie_turma, email, telefone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nome, dataNascimento, serieTurma, email, telefone]
            );
            return result.rows[0];
        } else {
            const result = await query(
                'INSERT INTO alunos (nome, data_nascimento, serie_turma, email, telefone) VALUES (?, ?, ?, ?, ?)',
                [nome, dataNascimento, serieTurma, email, telefone]
            );
            return { id: result.lastID, nome, data_nascimento: dataNascimento, serie_turma: serieTurma, email, telefone };
        }
    },

    update: async (id, nome, dataNascimento, serieTurma, email, telefone) => {
        const result = await query(
            isProduction 
                ? 'UPDATE alunos SET nome = $1, data_nascimento = $2, serie_turma = $3, email = $4, telefone = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6'
                : 'UPDATE alunos SET nome = ?, data_nascimento = ?, serie_turma = ?, email = ?, telefone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nome, dataNascimento, serieTurma, email, telefone, id]
        );
        return { changes: result.rowCount };
    },

    delete: async (id) => {
        const result = await query(
            isProduction 
                ? 'DELETE FROM alunos WHERE id = $1'
                : 'DELETE FROM alunos WHERE id = ?',
            [id]
        );
        return { changes: result.rowCount };
    },

    count: async () => {
        const result = await query('SELECT COUNT(*) as total FROM alunos');
        return isProduction ? parseInt(result.rows[0].count) : result.rows[0].total;
    }
};

const professorQueries = {
    getAll: async () => {
        const result = await query('SELECT * FROM professores ORDER BY nome');
        return result.rows;
    },

    getById: async (id) => {
        const result = await query(
            isProduction 
                ? 'SELECT * FROM professores WHERE id = $1'
                : 'SELECT * FROM professores WHERE id = ?',
            [id]
        );
        return result.rows[0] || null;
    },

    create: async (nome, disciplina, email, telefone) => {
        if (isProduction) {
            const result = await query(
                'INSERT INTO professores (nome, disciplina, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, disciplina, email, telefone]
            );
            return result.rows[0];
        } else {
            const result = await query(
                'INSERT INTO professores (nome, disciplina, email, telefone) VALUES (?, ?, ?, ?)',
                [nome, disciplina, email, telefone]
            );
            return { id: result.lastID, nome, disciplina, email, telefone };
        }
    },

    update: async (id, nome, disciplina, email, telefone) => {
        const result = await query(
            isProduction 
                ? 'UPDATE professores SET nome = $1, disciplina = $2, email = $3, telefone = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5'
                : 'UPDATE professores SET nome = ?, disciplina = ?, email = ?, telefone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nome, disciplina, email, telefone, id]
        );
        return { changes: result.rowCount };
    },

    delete: async (id) => {
        const result = await query(
            isProduction 
                ? 'DELETE FROM professores WHERE id = $1'
                : 'DELETE FROM professores WHERE id = ?',
            [id]
        );
        return { changes: result.rowCount };
    },

    count: async () => {
        const result = await query('SELECT COUNT(*) as total FROM professores');
        return isProduction ? parseInt(result.rows[0].count) : result.rows[0].total;
    }
};

module.exports = {
    initDatabase,
    usuarioQueries,
    alunoQueries,
    professorQueries
};