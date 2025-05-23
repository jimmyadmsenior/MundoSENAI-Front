/**
 * Script para gerenciar as operações relacionadas a produtos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const productsList = document.getElementById('products-list');
    const productForm = document.getElementById('product-form');
    const productFormContainer = document.getElementById('product-form-container');
    const productFormTitle = document.getElementById('product-form-title');
    const addProductBtn = document.getElementById('add-product-btn');
    const cancelProductBtn = document.getElementById('cancel-product');
    const refreshProductsBtn = document.getElementById('refresh-products');
    const categorySearchInput = document.getElementById('category-search');
    const searchBtn = document.getElementById('search-btn');
    const filterTags = document.getElementById('filter-tags');
    
    // Armazena a categoria atual de busca
    let currentCategory = '';
    
    // Função para formatar valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    // Função para mostrar/esconder o formulário de produto
    function toggleProductForm(show = true, isEditing = false) {
        if (show) {
            productFormContainer.classList.remove('hidden');
            productFormTitle.textContent = isEditing ? 'Editar Produto' : 'Adicionar Novo Produto';
            
            if (!isEditing) {
                clearProductForm();
            }
            
            // Rola até o formulário
            productFormContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            productFormContainer.classList.add('hidden');
        }
    }
    
    // Função para limpar o formulário
    function clearProductForm() {
        document.getElementById('product-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-description').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-stock').value = '';
        document.getElementById('product-category').value = '';
        
        // Limpa completamente o input de imagem e a pré-visualização
        const imageInput = document.getElementById('product-image');
        // Cria um novo elemento input para substituir o atual
        const newImageInput = document.createElement('input');
        newImageInput.type = 'file';
        newImageInput.id = 'product-image';
        newImageInput.accept = 'image/*';
        // Substitui o input antigo pelo novo
        imageInput.parentNode.replaceChild(newImageInput, imageInput);
        
        // Limpa a pré-visualização
        document.getElementById('product-image-preview').innerHTML = '';
        
        // Reseta a variável de imagem atual
        currentProductImageUrl = null;
    }
    
    // Função para carregar a lista de produtos
    async function loadProducts() {
        try {
            // Mostra mensagem de carregamento
            productsList.innerHTML = '<tr><td colspan="5" class="loading-cell">Carregando produtos...</td></tr>';
            
            // Busca os produtos na API
            const products = await apiService.get('/product');
            
            // Renderiza a tabela de produtos
            if (!products || products.length === 0) {
                productsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhum produto encontrado</td></tr>';
                return;
            }
            
            let html = '';
            
            products.forEach(product => {
                // Verifica se o estoque está baixo (menos de 10 unidades)
                const stockClass = product.stock < 10 ? 'low-stock' : '';
                
                html += `
                    <tr data-id="${product.id}">
                        <td>
                            ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail">` : ''}
                            ${product.name}
                        </td>
                        <td>${product.category || 'N/A'}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td class="${stockClass}">${product.stock}</td>
                        <td class="actions-cell">
                            <button class="btn btn-sm edit-product" data-id="${product.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            productsList.innerHTML = html;
            
            // Adiciona eventos aos botões de ação
            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.currentTarget.getAttribute('data-id');
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.currentTarget.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Erro ao carregar produtos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    // Variável para armazenar a URL da imagem atual do produto sendo editado
    let currentProductImageUrl = null;
    
    // Função para editar um produto
    async function editProduct(productId) {
        try {
            // Limpa completamente o formulário antes de preencher com novos dados
            clearProductForm();
            
            // Busca os dados do produto
            const product = await apiService.get(`/product/${productId}`);
            
            // Preenche o formulário
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-category').value = product.category || '';
            
            // Armazena a URL da imagem atual para caso o usuário não selecione uma nova imagem
            currentProductImageUrl = product.imageUrl || null;
            
            // Se o produto tiver uma imagem, mostra na pré-visualização
            if (product.imageUrl) {
                // Atualiza a pré-visualização
                const imagePreview = document.getElementById('product-image-preview');
                imagePreview.innerHTML = '';
                
                const img = document.createElement('img');
                img.src = product.imageUrl;
                img.classList.add('preview-img');
                img.onerror = function() {
                    imagePreview.innerHTML = '<div class="image-error">Imagem não disponível</div>';
                };
                imagePreview.appendChild(img);
            }
            
            // Mostra o formulário
            toggleProductForm(true, true);
            
        } catch (error) {
            console.error('Erro ao carregar produto para edição:', error);
            alert(`Erro ao carregar produto: ${error.message}`);
        }
    }
    
    // Função para excluir um produto
    async function deleteProduct(productId) {
        try {
            // Confirmação
            if (!confirm('Tem certeza que deseja excluir este produto?')) {
                return;
            }
            
            // Exclui o produto
            await apiService.delete(`/product/${productId}`);
            
            // Recarrega a lista de produtos
            loadProducts();
            
            // Mostra mensagem de sucesso
            alert('Produto excluído com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert(`Erro ao excluir produto: ${error.message}`);
        }
    }
    
    // Função para salvar um produto (novo ou editado)
    async function saveProduct(e) {
        e.preventDefault();
        
        try {
            const productId = document.getElementById('product-id').value;
            const isEditing = !!productId;
            
            // Coleta os dados do formulário
            const productData = {
                name: document.getElementById('product-name').value.trim(),
                description: document.getElementById('product-description').value.trim(),
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                category: document.getElementById('product-category').value.trim()
            };
            
            // Processa a imagem do produto
            const newImageUrl = await getProductImage();
            
            // Se temos uma nova imagem, usamos ela
            if (newImageUrl) {
                productData.imageUrl = newImageUrl;
            } 
            // Se estamos editando e temos uma imagem atual, mantemos ela
            else if (isEditing && currentProductImageUrl) {
                productData.imageUrl = currentProductImageUrl;
            }
            
            let response;
            
            if (isEditing) {
                // Atualiza o produto existente
                response = await apiService.put(`/product/${productId}`, productData);
            } else {
                // Cria um novo produto
                response = await apiService.post('/product', productData);
            }
            
            // Limpa a variável de imagem atual
            currentProductImageUrl = null;
            
            // Esconde o formulário
            toggleProductForm(false);
            
            // Recarrega a lista de produtos
            loadProducts();
            
            // Mostra mensagem de sucesso
            alert(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert(`Erro ao salvar produto: ${error.message}`);
        }
    }
    
    // Função para buscar produtos por categoria
    async function searchProductsByCategory() {
        const category = categorySearchInput.value.trim();
        
        if (!category) {
            // Se a categoria estiver vazia, carrega todos os produtos
            currentCategory = '';
            loadProducts();
            // Limpa as tags de filtro
            filterTags.innerHTML = '';
            return;
        }
        
        try {
            // Mostra mensagem de carregamento
            productsList.innerHTML = '<tr><td colspan="5" class="loading-cell">Buscando produtos na categoria "' + category + '"...</td></tr>';
            
            // Busca os produtos na API pelo endpoint de categoria
            const products = await apiService.get(`/product/category/${encodeURIComponent(category)}`);
            
            // Atualiza a categoria atual
            currentCategory = category;
            
            // Atualiza as tags de filtro
            updateFilterTags(category);
            
            // Renderiza os produtos encontrados
            if (!products || products.length === 0) {
                productsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhum produto encontrado na categoria "' + category + '"</td></tr>';
                return;
            }
            
            // Renderiza a tabela com os produtos encontrados
            renderProductsTable(products);
            
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            productsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Erro ao buscar produtos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    // Função para atualizar as tags de filtro
    function updateFilterTags(category) {
        if (!category) {
            filterTags.innerHTML = '';
            return;
        }
        
        filterTags.innerHTML = `
            <div class="filter-tag">
                <span>Categoria: ${category}</span>
                <button class="tag-remove" title="Remover filtro"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Adiciona evento para remover o filtro
        document.querySelector('.tag-remove').addEventListener('click', () => {
            categorySearchInput.value = '';
            currentCategory = '';
            loadProducts();
            filterTags.innerHTML = '';
        });
    }
    
    // Função para renderizar a tabela de produtos
    function renderProductsTable(products) {
        let html = '';
        
        products.forEach(product => {
            // Verifica se o estoque está baixo (menos de 10 unidades)
            const stockClass = product.stock < 10 ? 'low-stock' : '';
            
            html += `
                <tr data-id="${product.id}">
                    <td>
                        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail">` : ''}
                        ${product.name}
                    </td>
                    <td>${product.category || 'N/A'}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td class="${stockClass}">${product.stock}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm edit-product" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        productsList.innerHTML = html;
        
        // Adiciona eventos aos botões de ação
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
    }
    
    // Modifica a função loadProducts para usar a função renderProductsTable
    async function loadProducts() {
        try {
            // Mostra mensagem de carregamento
            productsList.innerHTML = '<tr><td colspan="5" class="loading-cell">Carregando produtos...</td></tr>';
            
            // Busca os produtos na API
            const products = await apiService.get('/product');
            
            // Renderiza a tabela de produtos
            if (!products || products.length === 0) {
                productsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhum produto encontrado</td></tr>';
                return;
            }
            
            // Usa a função de renderização da tabela
            renderProductsTable(products);
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Erro ao carregar produtos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    // Função para lidar com a pré-visualização da imagem
    function handleProductImagePreview() {
        // Configura o evento para ser chamado quando o formulário é mostrado
        addProductBtn.addEventListener('click', setupImagePreview);
        
        // Adiciona o evento de clique aos botões de edição após carregar os produtos
        function addEditButtonListeners() {
            document.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', setupImagePreview);
            });
        }
        
        // Adiciona o evento ao carregamento de produtos
        const originalLoadProducts = loadProducts;
        loadProducts = async function() {
            await originalLoadProducts();
            addEditButtonListeners();
        };
    }
    
    // Função para configurar a pré-visualização da imagem
    function setupImagePreview() {
        // Limpa completamente a pré-visualização
        const imagePreview = document.getElementById('product-image-preview');
        imagePreview.innerHTML = '';
        
        // Recria o input de imagem para garantir que não há eventos residuais
        const imageInputContainer = document.querySelector('.image-upload-container');
        const oldInput = document.getElementById('product-image');
        
        // Cria um novo input
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.id = 'product-image';
        newInput.accept = 'image/*';
        
        // Substitui o antigo pelo novo
        if (oldInput && imageInputContainer) {
            imageInputContainer.replaceChild(newInput, oldInput);
        }
        
        // Adiciona o evento ao novo input
        newInput.addEventListener('change', function() {
            // Limpa a pré-visualização anterior
            imagePreview.innerHTML = '';
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('preview-img');
                    imagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Função para obter a imagem do arquivo
    function getProductImage() {
        const imageInput = document.getElementById('product-image');
        
        if (imageInput.files && imageInput.files[0]) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(imageInput.files[0]);
            });
        }
        
        // Se não houver imagem, retorna null
        return Promise.resolve(null);
    }
    
    // Configura os eventos
    addProductBtn.addEventListener('click', () => toggleProductForm(true, false));
    cancelProductBtn.addEventListener('click', () => toggleProductForm(false));
    refreshProductsBtn.addEventListener('click', () => {
        categorySearchInput.value = '';
        currentCategory = '';
        filterTags.innerHTML = '';
        loadProducts();
    });
    productForm.addEventListener('submit', saveProduct);
    
    // Configura os eventos de busca
    searchBtn.addEventListener('click', searchProductsByCategory);
    categorySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProductsByCategory();
        }
    });
    
    // Inicializa o preview de imagem
    handleProductImagePreview();
    
    // Carrega os produtos ao iniciar
    loadProducts();
});
