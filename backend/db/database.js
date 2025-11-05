/**
 * ============================================
 * BANCO DE DADOS - SQLite
 * ============================================
 * 
 * Tecnologia: SQLite3 (banco de dados SQL leve e local)
 * Arquivo do banco: escola.db
 * 
 * Por que SQLite?
 * - Não precisa de servidor separado (MySQL, PostgreSQL)
 * - Armazena tudo em um único arquivo .db
 * - Perfeito para aplicações pequenas/médias
 * - Funciona bem no Railway e outros hosts
 * 
 * Estrutura:
 * - 3 tabelas principais (usuarios, alunos, professores)
 * - Cada tabela com CRUD completo
 * - Relacionamentos através de IDs
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco
const dbPath = path.join(__dirname, 'escola.db');

/**
 * CONEXÃO COM O BANCO
 * Cria/abre o arquivo escola.db na pasta backend/db/
 */
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco SQLite com sucesso!');
    }
});

/**
 * INICIALIZAÇÃO DAS TABELAS
 * Cria as tabelas se não existirem (CREATE TABLE IF NOT EXISTS)
 */
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            /**
             * TABELA: usuarios
             * Campos:
             * - id: Chave primária auto-incremento
             * - nome: Nome completo do usuário
             * - email: Email único (login)
             * - senha: Senha (em texto puro - poderia usar hash)
             * - created_at: Data de criação
             * - updated_at: Data da última atualização
             */
            db.run(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela usuarios:', err.message);
                } else {
                    console.log('Tabela usuarios criada/verificada com sucesso!');
                }
            });

            // Tabela de alunos
            db.run(`
                CREATE TABLE IF NOT EXISTS alunos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    data_nascimento DATE NOT NULL,
                    serie_turma TEXT NOT NULL,
                    email TEXT,
                    telefone TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela alunos:', err.message);
                } else {
                    console.log('Tabela alunos criada/verificada com sucesso!');
                }
            });

            // Tabela de professores
            db.run(`
                CREATE TABLE IF NOT EXISTS professores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    disciplina TEXT NOT NULL,
                    email TEXT,
                    telefone TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela professores:', err.message);
                    reject(err);
                } else {
                    console.log('Tabela professores criada/verificada com sucesso!');
                    
                    // Inserir usuário padrão se não existir
                    db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
                        if (err) {
                            console.error('Erro ao verificar usuários:', err.message);
                        } else if (row.count === 0) {
                            // Inserir usuário administrador padrão
                            db.run(`
                                INSERT INTO usuarios (nome, email, senha) 
                                VALUES (?, ?, ?)
                            `, ['Administrador', 'admin@escola.com', '123456'], (err) => {
                                if (err) {
                                    console.error('Erro ao inserir usuário padrão:', err.message);
                                } else {
                                    console.log('Usuário padrão criado: admin@escola.com / 123456');
                                }
                            });
                        }
                    });
                    
                    resolve();
                }
            });
        });
    });
};

// Funções para usuários
const usuarioQueries = {
    // Listar todos os usuários
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, nome, email, created_at FROM usuarios ORDER BY nome', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Buscar usuário por ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, nome, email, created_at FROM usuarios WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Buscar usuário por email (para login)
    getByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Criar novo usuário
    create: (nome, email, senha) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senha],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, nome, email });
                }
            );
        });
    },

    // Atualizar usuário
    update: (id, nome, email, senha = null) => {
        return new Promise((resolve, reject) => {
            let query = 'UPDATE usuarios SET nome = ?, email = ?, updated_at = CURRENT_TIMESTAMP';
            let params = [nome, email];
            
            if (senha) {
                query += ', senha = ?';
                params.push(senha);
            }
            
            query += ' WHERE id = ?';
            params.push(id);

            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Deletar usuário
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Contar usuários
    count: () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM usuarios', (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });
    }
};

// Funções para alunos
const alunoQueries = {
    // Listar todos os alunos
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM alunos ORDER BY nome', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Buscar aluno por ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Buscar alunos por nome
    searchByName: (nome) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM alunos WHERE nome LIKE ? ORDER BY nome', [`%${nome}%`], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Criar novo aluno
    create: (nome, dataNascimento, serieTurma, email, telefone) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO alunos (nome, data_nascimento, serie_turma, email, telefone) VALUES (?, ?, ?, ?, ?)',
                [nome, dataNascimento, serieTurma, email, telefone],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, nome, dataNascimento, serieTurma, email, telefone });
                }
            );
        });
    },

    // Atualizar aluno
    update: (id, nome, dataNascimento, serieTurma, email, telefone) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE alunos SET nome = ?, data_nascimento = ?, serie_turma = ?, email = ?, telefone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nome, dataNascimento, serieTurma, email, telefone, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    // Deletar aluno
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM alunos WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Contar alunos
    count: () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM alunos', (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });
    }
};

// Funções para professores
const professorQueries = {
    // Listar todos os professores
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM professores ORDER BY nome', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Buscar professor por ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM professores WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Buscar professores por nome ou disciplina
    search: (termo) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM professores WHERE nome LIKE ? OR disciplina LIKE ? ORDER BY nome',
                [`%${termo}%`, `%${termo}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Criar novo professor
    create: (nome, disciplina, email, telefone) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO professores (nome, disciplina, email, telefone) VALUES (?, ?, ?, ?)',
                [nome, disciplina, email, telefone],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, nome, disciplina, email, telefone });
                }
            );
        });
    },

    // Atualizar professor
    update: (id, nome, disciplina, email, telefone) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE professores SET nome = ?, disciplina = ?, email = ?, telefone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nome, disciplina, email, telefone, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    // Deletar professor
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM professores WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Contar professores
    count: () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM professores', (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });
    }
};

// Exportar conexão e funções
module.exports = {
    db,
    initDatabase,
    usuarioQueries,
    alunoQueries,
    professorQueries
};