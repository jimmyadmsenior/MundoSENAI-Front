# Exemplo de Integração com API - Mundo SENAI

## Introdução

Este é um projeto didático que demonstra como consumir uma API RESTful usando JavaScript puro (sem frameworks). O objetivo é fornecer aos alunos uma base sólida para entender como integrar um front-end com um back-end através de APIs, seguindo boas práticas de desenvolvimento.

### O que é uma API?

API (Application Programming Interface) é um conjunto de regras e definições que permite que diferentes softwares se comuniquem entre si. No contexto web, uma API RESTful utiliza métodos HTTP padrão (GET, POST, PUT, DELETE) para realizar operações em recursos.

### Por que este projeto é importante?

A integração com APIs é uma habilidade essencial para desenvolvedores web modernos. Este projeto demonstra:

- Como estruturar um projeto front-end para consumir APIs
- Como implementar autenticação usando JWT (JSON Web Tokens)
- Como gerenciar operações CRUD (Create, Read, Update, Delete) em diferentes recursos
- Como lidar com upload e exibição de imagens
- Como implementar navegação entre páginas e controle de acesso

## Estrutura do Projeto

```
api-integration-example/
├── assets/         # Imagens e outros recursos estáticos
├── css/            # Arquivos de estilo
│   └── styles.css  # Estilos da aplicação
├── js/             # Arquivos JavaScript
│   ├── api.js      # Serviço base para comunicação com a API
│   ├── auth-check.js # Verificação de autenticação
│   ├── login.js    # Lógica da página de login e cadastro
│   ├── products.js # Operações relacionadas a produtos
│   ├── profile.js  # Gerenciamento do perfil de usuário
│   └── users.js    # Operações relacionadas a usuários
├── dashboard.html  # Página principal após login
├── index.html     # Redirecionamento para login
├── login.html     # Página de login e cadastro
├── products.html  # Página de gerenciamento de produtos
├── profile.html   # Página de perfil do usuário
├── users.html     # Página de gerenciamento de usuários
└── README.md      # Este arquivo de documentação
```

## Funcionalidades Implementadas

### 1. Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Logout
- Proteção de rotas (redirecionamento para login quando não autenticado)

### 2. Gerenciamento de Produtos
- Listagem de todos os produtos
- Adição de novos produtos com imagem
- Edição de produtos existentes
- Exclusão de produtos
- Filtragem de produtos por categoria

### 3. Gerenciamento de Usuários
- Listagem de todos os usuários
- Adição de novos usuários com imagem de perfil
- Edição de usuários existentes
- Exclusão de usuários
- Destaque para o usuário atual na lista

### 4. Perfil de Usuário
- Visualização e edição dos dados do usuário
- Alteração de senha com verificação
- Upload de imagem de perfil
- Logout automático após alteração de senha

## Como o Projeto Funciona

### 1. Serviço de API (api.js)

Este arquivo é o coração da integração com a API. Ele contém uma classe `ApiService` que encapsula todas as operações de comunicação:

```javascript
// Exemplo simplificado do ApiService
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000'; // URL base da API
        this.token = localStorage.getItem('token');
    }

    // Método para fazer requisições GET
    async get(endpoint, auth = true) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(auth)
        });
        // Tratamento de resposta...
    }

    // Outros métodos: post, put, delete...
}
```

### 2. Autenticação (login.js e auth-check.js)

O sistema utiliza JWT (JSON Web Tokens) para autenticação. O token é armazenado no localStorage após o login bem-sucedido e enviado em todas as requisições subsequentes.

```javascript
// Exemplo de login
async function login(email, password) {
    try {
        const response = await apiService.post('/auth/login', { email, password }, false);
        if (response.token) {
            apiService.setToken(response.token);
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        // Tratamento de erro...
    }
}
```

### 3. Gerenciamento de Recursos (products.js e users.js)

Estes arquivos implementam operações CRUD para produtos e usuários, respectivamente. Eles seguem um padrão semelhante:

1. **Carregar dados**: Buscar recursos da API e exibi-los na interface
2. **Adicionar**: Enviar novos dados para a API
3. **Editar**: Atualizar dados existentes
4. **Excluir**: Remover recursos

### 4. Manipulação de Imagens

O projeto demonstra como fazer upload e exibir imagens:

```javascript
// Exemplo de upload de imagem
async function getImageBase64() {
    const imageInput = document.getElementById('product-image');
    if (imageInput.files && imageInput.files[0]) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(imageInput.files[0]);
        });
    }
    return null;
}
```

## Como Usar Este Projeto

### Pré-requisitos

1. Um servidor de API RESTful rodando (por padrão em http://localhost:3000)
2. Navegador web moderno com suporte a JavaScript ES6+

### Passos para Execução

1. Clone ou baixe este repositório
2. Certifique-se de que a API está rodando
3. Abra o arquivo `index.html` em um navegador (ou use um servidor local como Live Server)
4. Use as credenciais fornecidas pela API para fazer login ou crie um novo usuário

### Fluxo de Uso Típico

1. Faça login ou cadastre-se
2. Explore o dashboard para ver estatísticas básicas
3. Navegue para a página de produtos para gerenciar produtos
4. Navegue para a página de usuários para gerenciar usuários
5. Acesse seu perfil para editar suas informações

## Adaptação para Seu Projeto

Este exemplo foi projetado para ser uma base de aprendizado. Para adaptá-lo ao seu projeto:

### 1. Configuração da API

Modifique a URL base da API no arquivo `api.js`:

```javascript
this.baseUrl = 'https://sua-api.com'; // Altere para a URL da sua API
```

### 2. Personalização dos Endpoints

Ajuste os endpoints conforme a estrutura da sua API:

```javascript
// Exemplo: Se sua API usa /api/v1/products em vez de /product
const products = await apiService.get('/api/v1/products');
```

### 3. Adaptação dos Modelos de Dados

Modifique os campos dos formulários e a exibição de dados de acordo com os modelos da sua API:

```javascript
// Exemplo: Se seu produto tem um campo 'sku' em vez de 'category'
html += `<td>${product.sku}</td>`;
```

### 4. Personalização Visual

Modifique os arquivos CSS e HTML para adequar a interface ao design do seu projeto.

## Conceitos Importantes para Aprender

### 1. Promises e Async/Await

O projeto utiliza programação assíncrona moderna para lidar com requisições à API:

```javascript
async function loadProducts() {
    try {
        const products = await apiService.get('/product');
        // Processar os dados...
    } catch (error) {
        // Tratar erros...
    }
}
```

### 2. Manipulação do DOM

O projeto demonstra como atualizar dinamicamente a interface do usuário:

```javascript
function renderProductsTable(products) {
    let html = '';
    products.forEach(product => {
        html += `<tr>...</tr>`; // Gera HTML para cada produto
    });
    productsList.innerHTML = html; // Atualiza a tabela
}
```

### 3. Gerenciamento de Estado

O token JWT é usado para manter o estado de autenticação entre páginas:

```javascript
// Verificação de autenticação
if (!apiService.isAuthenticated()) {
    window.location.href = 'login.html';
}
```