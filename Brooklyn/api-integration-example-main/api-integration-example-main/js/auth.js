/**
 * Classe responsável por gerenciar a autenticação
 */
class AuthService {
    constructor() {
        this.loginForm = document.getElementById('login-section');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('login-btn');
        this.loginMessage = document.getElementById('login-message');
        
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        // Evento de login
        this.loginBtn.addEventListener('click', () => this.login());
    }

    /**
     * Verifica o status de autenticação ao carregar a página
     */
    checkAuthStatus() {
        if (apiService.isAuthenticated()) {
            // Se já estiver autenticado, esconde a seção de login e mostra a de produtos
            this.showAuthenticatedUI();
        } else {
            // Se não estiver autenticado, mostra a seção de login
            this.showLoginUI();
        }
    }

    /**
     * Mostra a UI para usuários autenticados
     */
    showAuthenticatedUI() {
        // Esconde a seção de login
        document.getElementById('login-section').classList.add('hidden');
        
        // Mostra a seção de produtos por padrão
        document.getElementById('products-section').classList.remove('hidden');
        
        // Atualiza a navegação
        document.querySelector('nav a[data-page="products"]').classList.add('active');
        document.querySelector('nav a[data-page="login"]').classList.remove('active');
        
        // Carrega os produtos
        productsService.loadProducts();
    }

    /**
     * Mostra a UI para usuários não autenticados
     */
    showLoginUI() {
        // Mostra a seção de login
        document.getElementById('login-section').classList.remove('hidden');
        
        // Esconde as outras seções
        document.getElementById('products-section').classList.add('hidden');
        document.getElementById('users-section').classList.add('hidden');
        
        // Atualiza a navegação
        document.querySelector('nav a[data-page="login"]').classList.add('active');
        document.querySelector('nav a[data-page="products"]').classList.remove('active');
        document.querySelector('nav a[data-page="users"]').classList.remove('active');
    }

    /**
     * Realiza o login do usuário
     */
    async login() {
        try {
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;
            
            if (!email || !password) {
                this.showMessage('Preencha todos os campos', 'error');
                return;
            }
            
            // Desabilita o botão durante o login
            this.loginBtn.disabled = true;
            this.loginBtn.textContent = 'Entrando...';
            
            // Faz a requisição de login
            const response = await apiService.post('/login', { email, password }, false);
            
            // Armazena o token
            apiService.setToken(response.token);
            
            // Limpa os campos
            this.emailInput.value = '';
            this.passwordInput.value = '';
            
            // Mostra mensagem de sucesso
            this.showMessage('Login realizado com sucesso!', 'success');
            
            // Atualiza a UI
            setTimeout(() => this.showAuthenticatedUI(), 1000);
            
        } catch (error) {
            this.showMessage(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        } finally {
            // Reabilita o botão
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = 'Entrar';
        }
    }

    /**
     * Realiza o logout do usuário
     */
    async logout() {
        try {
            // Faz a requisição de logout
            await apiService.post('/logout', {});
            
            // Limpa o token
            apiService.clearToken();
            
            // Atualiza a UI
            this.showLoginUI();
            
            // Mostra mensagem de sucesso
            this.showMessage('Logout realizado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            
            // Mesmo com erro, limpa o token e atualiza a UI
            apiService.clearToken();
            this.showLoginUI();
        }
    }

    /**
     * Exibe uma mensagem na tela
     * @param {string} text - Texto da mensagem
     * @param {string} type - Tipo da mensagem (success, error)
     */
    showMessage(text, type) {
        this.loginMessage.textContent = text;
        this.loginMessage.className = 'message';
        this.loginMessage.classList.add(type);
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            this.loginMessage.textContent = '';
            this.loginMessage.className = 'message';
        }, 5000);
    }
}

// Será inicializado após o carregamento da página
