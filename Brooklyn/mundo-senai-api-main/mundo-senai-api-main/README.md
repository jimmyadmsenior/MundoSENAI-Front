# Mundo SENAI API

Backend API para o projeto de Dashboard apresentado no evento Mundo SENAI em 5 de junho de 2025.

## Sobre o Projeto

Este projeto é o backend de uma aplicação desenvolvida pelos alunos do segundo ano do curso técnico de Desenvolvimento de Sistemas do SENAI. A aplicação consiste em uma dashboard que permite o cadastro de produtos e usuários com sistema de autenticação.

O backend foi desenvolvido utilizando tecnologias modernas como Node.js, TypeScript, Fastify e Prisma ORM, fornecendo uma API RESTful para o frontend da aplicação.

## Equipe

**Instrutores:**
- Celso Giusti
- Daniel Manoel
- Marlon Fanger

**Alunos:**
- Augusto Senna
- Jimmy
- Lívia Clemente
- Miguel Zacharias
- Marcela

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **TypeScript**: Superset tipado de JavaScript
- **Fastify**: Framework web rápido e de baixo overhead
- **Prisma**: ORM (Object-Relational Mapping) para acesso ao banco de dados
- **SQLite**: Banco de dados relacional leve
- **bcryptjs**: Biblioteca para hash de senhas

## Estrutura do Projeto

```
mundo-senai-api/
├── prisma/                  # Configurações do Prisma ORM
│   ├── migrations/          # Migrações do banco de dados
│   └── schema.prisma        # Schema do banco de dados
├── src/                     # Código fonte
│   ├── controllers/         # Controladores da aplicação
│   ├── lib/                 # Bibliotecas e utilitários
│   ├── routes/              # Rotas da API
│   ├── services/            # Serviços de negócio
│   ├── types/               # Definições de tipos TypeScript
│   └── server.ts            # Ponto de entrada da aplicação
├── .env                     # Variáveis de ambiente
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração do TypeScript
```

## Modelos de Dados

### Usuário (User)
- id: Identificador único
- email: Email do usuário (único)
- name: Nome do usuário
- password: Senha do usuário (armazenada com hash)
- createdAt: Data de criação
- updatedAt: Data de atualização

### Produto
- id: Identificador único
- name: Nome do produto
- description: Descrição do produto
- category: Categoria do produto
- price: Preço do produto
- stock: Quantidade em estoque
- imageUrl: URL da imagem do produto (opcional)
- createdAt: Data de criação
- updatedAt: Data de atualização

## Endpoints da API

### Usuários
- `POST /user`: Criar um novo usuário
- `GET /user`: Listar todos os usuários
- `GET /user/:id`: Buscar usuário por ID
- `PUT /user/:id`: Atualizar usuário
- `DELETE /user/:id`: Excluir usuário

### Produtos (A implementar)
- `POST /product`: Criar um novo produto
- `GET /product`: Listar todos os produtos
- `GET /product/:id`: Buscar produto por ID
- `PUT /product/:id`: Atualizar produto
- `DELETE /product/:id`: Excluir produto

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure o arquivo `.env` com as variáveis de ambiente necessárias
4. Execute as migrações do banco de dados:
   ```
   npx prisma migrate dev
   ```
5. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```
6. O servidor estará disponível em `http://localhost:3000`


Desenvolvido para o evento Mundo SENAI - Junho 2025
