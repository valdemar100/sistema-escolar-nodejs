// Base de dados em memória para produção (Vercel)
let usuarios = [
    {
        id: 1,
        nome: 'Administrador',
        email: 'admin@escola.com',
        senha: '123456',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

let alunos = [
    {
        id: 1,
        nome: 'João Silva',
        data_nascimento: '2005-03-15',
        serie_turma: '3º Ano A',
        email: 'joao.silva@email.com',
        telefone: '(11) 99999-0001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        nome: 'Maria Santos',
        data_nascimento: '2004-07-22',
        serie_turma: '3º Ano B',
        email: 'maria.santos@email.com',
        telefone: '(11) 99999-0002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

let professores = [
    {
        id: 1,
        nome: 'Prof. Carlos Oliveira',
        materia: 'Matemática',
        email: 'carlos.oliveira@escola.com',
        telefone: '(11) 99999-1001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        nome: 'Profa. Ana Costa',
        materia: 'Português',
        email: 'ana.costa@escola.com',
        telefone: '(11) 99999-1002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Funções para usuários
const usuarioQueries = {
    getAll: () => Promise.resolve(usuarios),
    getById: (id) => Promise.resolve(usuarios.find(u => u.id === parseInt(id))),
    getByEmail: (email) => Promise.resolve(usuarios.find(u => u.email === email)),
    create: (dados) => {
        const novoUsuario = {
            id: usuarios.length + 1,
            ...dados,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        usuarios.push(novoUsuario);
        return Promise.resolve(novoUsuario);
    },
    update: (id, dados) => {
        const index = usuarios.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...dados, updated_at: new Date().toISOString() };
            return Promise.resolve(usuarios[index]);
        }
        return Promise.resolve(null);
    },
    delete: (id) => {
        const index = usuarios.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            usuarios.splice(index, 1);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    },
    count: () => Promise.resolve(usuarios.length)
};

// Funções para alunos
const alunoQueries = {
    getAll: () => Promise.resolve(alunos),
    getById: (id) => Promise.resolve(alunos.find(a => a.id === parseInt(id))),
    create: (dados) => {
        const novoAluno = {
            id: alunos.length + 1,
            ...dados,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        alunos.push(novoAluno);
        return Promise.resolve(novoAluno);
    },
    update: (id, dados) => {
        const index = alunos.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            alunos[index] = { ...alunos[index], ...dados, updated_at: new Date().toISOString() };
            return Promise.resolve(alunos[index]);
        }
        return Promise.resolve(null);
    },
    delete: (id) => {
        const index = alunos.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            alunos.splice(index, 1);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    },
    count: () => Promise.resolve(alunos.length)
};

// Funções para professores
const professorQueries = {
    getAll: () => Promise.resolve(professores),
    getById: (id) => Promise.resolve(professores.find(p => p.id === parseInt(id))),
    create: (dados) => {
        const novoProfessor = {
            id: professores.length + 1,
            ...dados,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        professores.push(novoProfessor);
        return Promise.resolve(novoProfessor);
    },
    update: (id, dados) => {
        const index = professores.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            professores[index] = { ...professores[index], ...dados, updated_at: new Date().toISOString() };
            return Promise.resolve(professores[index]);
        }
        return Promise.resolve(null);
    },
    delete: (id) => {
        const index = professores.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            professores.splice(index, 1);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    },
    count: () => Promise.resolve(professores.length)
};

// Função de inicialização (não faz nada na versão em memória)
const initDatabase = () => {
    console.log('✅ Base de dados em memória inicializada para produção!');
    return Promise.resolve();
};

module.exports = {
    initDatabase,
    usuarioQueries,
    alunoQueries,
    professorQueries
};