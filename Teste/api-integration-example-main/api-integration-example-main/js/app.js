/**
 * Arquivo principal da aplicação
 * Responsável por inicializar os serviços e gerenciar a navegação
 */

// Espera o DOM ser carregado completamente
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os serviços
    window.authService = new AuthService();
    window.productsService = new ProductsService();
    window.usersService = new UsersService();
    
    // Configura a navegação
    setupNavigation();
    
    // Configura o modal
    setupModal();
});

/**
 * Configura a navegação entre as páginas
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPage = link.getAttribute('data-page');
            
            // Verifica se precisa estar autenticado para acessar a página
            if ((targetPage === 'products' || targetPage === 'users') && !apiService.isAuthenticated()) {
                showModal('Acesso Restrito', 'Você precisa fazer login para acessar esta página.');
                return;
            }
            
            // Remove a classe active de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Adiciona a classe active ao link clicado
            link.classList.add('active');
            
            // Esconde todas as páginas
            pages.forEach(page => page.classList.add('hidden'));
            
            // Mostra a página selecionada
            document.getElementById(`${targetPage}-section`).classList.remove('hidden');
            
            // Carrega os dados da página selecionada
            if (targetPage === 'products' && apiService.isAuthenticated()) {
                productsService.loadProducts();
            } else if (targetPage === 'users' && apiService.isAuthenticated()) {
                usersService.loadUsers();
            }
        });
    });
    
    // Adiciona botão de logout na navegação
    const nav = document.querySelector('nav ul');
    const logoutLi = document.createElement('li');
    const logoutLink = document.createElement('a');
    
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
    });
    
    logoutLi.appendChild(logoutLink);
    nav.appendChild(logoutLi);
    
    // Verifica se o usuário está autenticado para mostrar/esconder o botão de logout
    function updateLogoutButton() {
        if (apiService.isAuthenticated()) {
            logoutLi.style.display = 'block';
        } else {
            logoutLi.style.display = 'none';
        }
    }
    
    // Atualiza o botão de logout inicialmente
    updateLogoutButton();
    
    // Adiciona um listener para verificar mudanças no token
    window.addEventListener('storage', (e) => {
        if (e.key === 'token') {
            updateLogoutButton();
        }
    });
}

/**
 * Configura o modal
 */
function setupModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Fecha o modal ao clicar no botão de fechar
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });
    
    // Fecha o modal ao clicar fora dele
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });
}

/**
 * Mostra um modal com título e conteúdo
 * @param {string} title - Título do modal
 * @param {string} content - Conteúdo do modal
 */
function showModal(title, content) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    
    modalOverlay.classList.remove('hidden');
}

/**
 * Formata um valor para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param {string} dateString - String de data
 * @returns {string} - Data formatada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}
