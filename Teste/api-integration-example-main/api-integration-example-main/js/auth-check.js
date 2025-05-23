/**
 * Script para verificar a autenticação em páginas protegidas
 * Redireciona para a página de login se o usuário não estiver autenticado
 */

// Verifica se o usuário está autenticado
function checkAuthentication() {
    // Verifica se existe um token no localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Se não houver token, redireciona para a página de login
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Configura o botão de logout
function setupLogout() {
    const logoutLink = document.getElementById('logout-link');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Função de logout
async function logout() {
    try {
        // Tenta fazer a requisição de logout para a API
        if (apiService.isAuthenticated()) {
            await apiService.post('/logout', {});
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        // Mesmo com erro, limpa o token e redireciona
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Executa a verificação quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verifica a autenticação
    const isAuthenticated = checkAuthentication();
    
    // Se estiver autenticado, configura o botão de logout
    if (isAuthenticated) {
        setupLogout();
    }
});
