/**
 * Script para gerenciar a funcionalidade do dashboard
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos do DOM
    const productsCountElement = document.getElementById('products-count');
    const lowStockCountElement = document.getElementById('low-stock-count');
    const usersCountElement = document.getElementById('users-count');
    const recentProductsTable = document.getElementById('recent-products-table').querySelector('tbody');
    const categoryFilter = document.getElementById('category-filter');
    
    // Armazena todos os produtos para filtragem
    let allProducts = [];
    
    // Função para formatar valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    // Função para carregar as categorias disponíveis
    async function loadCategories(products) {
        // Extrai categorias únicas dos produtos
        const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
        
        // Limpa as opções existentes, exceto a primeira (Todas as categorias)
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Adiciona as categorias como opções
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    // Função para filtrar produtos por categoria
    function filterProductsByCategory(category) {
        if (!category) {
            // Se nenhuma categoria for selecionada, mostra os 5 produtos mais recentes
            renderRecentProducts(allProducts);
            return;
        }
        
        // Filtra os produtos pela categoria selecionada
        const filteredProducts = allProducts.filter(product => product.category === category);
        
        // Renderiza os produtos filtrados
        renderRecentProducts(filteredProducts);
    }
    
    // Função para renderizar a tabela de produtos recentes
    function renderRecentProducts(products) {
        // Ordena os produtos por data de criação (assumindo que há um campo createdAt)
        // e pega os 5 mais recentes
        const recentProducts = products
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);
        
        // Renderiza a tabela
        if (recentProducts.length === 0) {
            recentProductsTable.innerHTML = '<tr><td colspan="4" class="empty-cell">Nenhum produto encontrado</td></tr>';
        } else {
            let html = '';
            
            recentProducts.forEach(product => {
                const stockClass = product.stock < 10 ? 'low-stock' : '';
                
                html += `
                    <tr>
                        <td>
                            ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail">` : ''}
                            ${product.name}
                        </td>
                        <td>${product.category || 'N/A'}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td class="${stockClass}">${product.stock}</td>
                    </tr>
                `;
            });
            
            recentProductsTable.innerHTML = html;
        }
    }
    
    // Função para carregar os dados do dashboard
    async function loadDashboardData() {
        try {
            // Carrega a contagem de produtos
            const productsCount = await apiService.get('/product/count');
            productsCountElement.textContent = productsCount || 0;
            
            // Carrega produtos com estoque baixo
            const lowStockProducts = await apiService.get('/product/lowStock');
            lowStockCountElement.textContent = lowStockProducts.length || 0;
            
            // Carrega a contagem de usuários
            const users = await apiService.get('/user');
            usersCountElement.textContent = users.length || 0;
            
            // Carrega todos os produtos
            const products = await apiService.get('/product');
            
            // Armazena os produtos para filtragem
            allProducts = products;
            
            // Carrega as categorias disponíveis
            loadCategories(products);
            
            // Renderiza a tabela de produtos recentes
            renderRecentProducts(products);
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            
            // Mostra mensagem de erro nos elementos
            productsCountElement.textContent = 'Erro';
            lowStockCountElement.textContent = 'Erro';
            usersCountElement.textContent = 'Erro';
            recentProductsTable.innerHTML = '<tr><td colspan="4" class="error-cell">Erro ao carregar dados</td></tr>';
        }
    }
    
    // Configura o evento de mudança do filtro de categoria
    categoryFilter.addEventListener('change', () => {
        filterProductsByCategory(categoryFilter.value);
    });
    
    // Carrega os dados do dashboard
    loadDashboardData();
});
