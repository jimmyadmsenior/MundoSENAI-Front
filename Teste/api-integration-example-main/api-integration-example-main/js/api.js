/**
 * Classe responsável por gerenciar as requisições para a API
 */
class ApiService {
    constructor() {
        // URL base da API - ajuste conforme necessário
        this.baseUrl = 'http://localhost:3000';
        // this.baseUrl = 'https://mundo-senai-api.onrender.com';
        this.token = localStorage.getItem('token');
    }

    /**
     * Define o token de autenticação
     * @param {string} token - Token JWT
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * Remove o token de autenticação
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        // Sempre pega o token atualizado do localStorage
        this.token = localStorage.getItem('token');
        return !!this.token;
    }

    /**
     * Prepara os headers para as requisições
     * @param {boolean} includeAuth - Se deve incluir o token de autenticação
     * @param {boolean} includeContentType - Se deve incluir o Content-Type
     * @returns {Object} - Headers da requisição
     */
    getHeaders(includeAuth = true, includeContentType = true) {
        const headers = {};
       
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Realiza uma requisição GET
     * @param {string} endpoint - Endpoint da API
     * @param {boolean} auth - Se a requisição precisa de autenticação
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async get(endpoint, auth = true) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(auth)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição GET:', error);
            throw error;
        }
    }

    /**
     * Realiza uma requisição POST
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @param {boolean} auth - Se a requisição precisa de autenticação
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async post(endpoint, data, auth = true) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(auth),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição POST:', error);
            throw error;
        }
    }

    /**
     * Realiza uma requisição PUT
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição PUT:', error);
            throw error;
        }
    }

    /**
     * Realiza uma requisição DELETE
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados opcionais a serem enviados no body
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async delete(endpoint, data = null) {
        try {
            const options = {
                method: 'DELETE',
                headers: this.getHeaders(true, data !== null) // Só inclui Content-Type se tiver dados
            };
           
            // Adiciona o body apenas se houver dados
            if (data !== null) {
                options.body = JSON.stringify(data);
            }
           
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            // Verifica se a resposta tem conteúdo antes de tentar converter para JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
           
            return { success: true };
        } catch (error) {
            console.error('Erro na requisição DELETE:', error);
            throw error;
        }
    }
}

// Exporta uma instância única do serviço de API
window.apiService = new ApiService();
var apiService = window.apiService;