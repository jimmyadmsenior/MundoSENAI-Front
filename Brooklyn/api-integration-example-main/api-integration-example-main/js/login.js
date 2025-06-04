/**
 * Script para gerenciar a funcionalidade de login e cadastro
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se já está autenticado
    if (localStorage.getItem('token')) {
        // Se já estiver autenticado, redireciona para o dashboard
        window.location.href = "dashboard.html";
        return;
    }

    // Elementos do DOM - Login
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const loginMessage = document.getElementById('login-message');

    // Elementos do DOM - Cadastro
    const registerForm = document.getElementById('register-form');
    const registerNameInput = document.getElementById('register-name');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const registerBtn = document.getElementById('register-btn');
    const registerMessage = document.getElementById('register-message');

    // Elementos para alternar entre login e cadastro
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Função para mostrar popup elegante (usa função global do HTML)
    function showPopup(message) {
        if (typeof window.showPopup === 'function') {
            window.showPopup(message);
        }
    }

    // Função para mostrar mensagens de login
    function showLoginMessage(text, type) {
        if (type === 'success') {
            showPopup(text);
            loginMessage.textContent = '';
            loginMessage.className = 'message';
            return;
        }
        loginMessage.textContent = text;
        loginMessage.className = 'message';
        loginMessage.classList.add(type);

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            loginMessage.textContent = '';
            loginMessage.className = 'message';
        }, 5000);
    }

    // Função para mostrar mensagens de cadastro
    function showRegisterMessage(text, type) {
        registerMessage.textContent = text;
        registerMessage.className = 'message';
        registerMessage.classList.add(type);

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            registerMessage.textContent = '';
            registerMessage.className = 'message';
        }, 5000);
    }

    // Função para alternar entre os formulários
    function toggleForms(showRegister = false) {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        
        if (showRegister) {
            // Mostrar formulário de cadastro
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerNameInput.focus();
            
            // Força a exibição do formulário de cadastro
            registerForm.style.display = '';
            loginForm.style.display = 'none';
        } else {
            // Mostrar formulário de login
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            emailInput.focus();
            
            // Força a exibição do formulário de login
            loginForm.style.display = '';
            registerForm.style.display = 'none';
        }
    }

    // Função de login
    async function login() {
        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                showLoginMessage('Preencha todos os campos', 'error');
                return;
            }
            loginBtn.disabled = true;
            loginBtn.textContent = 'Entrando...';
            const response = await apiService.post('/login', { email, password }, false);
            if (!response.token) {
                showLoginMessage('Erro: o backend não retornou um token. Verifique as credenciais ou o servidor.', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Entrar';
                return;
            }
            apiService.setToken(response.token);
            emailInput.value = '';
            passwordInput.value = '';
            showLoginMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            showLoginMessage(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    }

    // Função de cadastro
    async function register() {
        try {
            const name = registerNameInput.value.trim();
            const email = registerEmailInput.value.trim();
            const password = registerPasswordInput.value;
            const confirmPassword = registerConfirmPasswordInput.value;

            if (!name || !email || !password || !confirmPassword) {
                showRegisterMessage('Preencha todos os campos', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showRegisterMessage('As senhas não coincidem', 'error');
                return;
            }

            // Desabilita o botão durante o cadastro
            registerBtn.disabled = true;
            registerBtn.textContent = 'Cadastrando...';

            // Faz a requisição de cadastro
            const response = await apiService.post('/user', {
                name,
                email,
                password
            }, false);

            // Limpa os campos
            registerNameInput.value = '';
            registerEmailInput.value = '';
            registerPasswordInput.value = '';
            registerConfirmPasswordInput.value = '';

            showRegisterMessage('Cadastro realizado com sucesso! Você já pode fazer login.', 'success');

            setTimeout(() => {
                const loginSection = document.getElementById('login-section');
                const registerSection = document.getElementById('register-section');
                
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                
                loginForm.style.display = '';
                registerForm.style.display = 'none';
                
                toggleForms(false);
                
                emailInput.focus();
            }, 1500);

        } catch (error) {
            showRegisterMessage(error.message || 'Erro ao fazer cadastro. Tente novamente.', 'error');
        } finally {
            // Reabilita o botão
            registerBtn.disabled = false;
            registerBtn.textContent = 'Cadastrar';
        }
    }

    // Eventos de login
    loginBtn.addEventListener('click', login);
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    // Eventos de cadastro
    registerBtn.addEventListener('click', register);
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });

    // Eventos para alternar entre os formulários
    loginTab.addEventListener('click', () => toggleForms(false));
    registerTab.addEventListener('click', () => toggleForms(true));
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms(true);
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms(false);
    });

    // Foca no campo de email ao carregar a página
    emailInput.focus();
});
