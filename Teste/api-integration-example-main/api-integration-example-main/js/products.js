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
    
    // Função de inicialização - executada imediatamente
    function initializeFormElements() {
        console.log('Inicializando elementos do formulário de produtos...');
        
        // Garantir que o formulário esteja oculto inicialmente
        if (productFormContainer) {
            productFormContainer.classList.add('hidden');
            productFormContainer.style.display = 'none';
            console.log('Formulário de produtos ocultado na inicialização');
        }
    }
    
    // Executa a inicialização imediatamente
    initializeFormElements();
    
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
            productFormContainer.style.display = 'block';
            productFormContainer.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s';
            productFormContainer.style.transform = 'translateY(-30px) scale(1.03)';
            productFormContainer.style.boxShadow = '0 8px 32px 0 rgba(49,213,222,0.15)';
            setTimeout(() => {
                productFormContainer.style.transform = 'translateY(0) scale(1)';
                productFormContainer.style.boxShadow = '';
            }, 400);
            productFormTitle.textContent = isEditing ? 'Editar Produto' : 'Adicionar Novo Produto';
            
            if (!isEditing) {
                clearProductForm();
            }
            
            // Rola até o formulário
            productFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            console.log('Formulário de produto exibido - modo:', isEditing ? 'edição' : 'adição');
        } else {
            productFormContainer.classList.add('hidden');
            productFormContainer.style.display = 'none';
            productFormContainer.style.transform = '';
            productFormContainer.style.boxShadow = '';
            
            console.log('Formulário de produto ocultado');
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
            
            // Verifica se existem produtos
            if (!products || products.length === 0) {
                productsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhum produto encontrado</td></tr>';
                
                // Atualiza também o container de cards para dispositivos móveis
                const cardsContainer = document.getElementById('products-cards');
                if (cardsContainer) {
                    cardsContainer.innerHTML = '<div class="empty-cell">Nenhum produto encontrado</div>';
                }
                return;
            }
            
            // Usa a função de renderização da tabela
            renderProductsTable(products);
            
            // Cria os cards para visualização em dispositivos móveis
            createProductCards(products);
            
            // Verifica o tamanho da tela e ajusta a visualização
            checkScreenSize();
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Erro ao carregar produtos: ${error.message}
                    </td>
                </tr>
            `;
            
            // Atualiza também o container de cards para dispositivos móveis
            const cardsContainer = document.getElementById('products-cards');
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="error-cell">Erro ao carregar produtos: ${error.message}</div>`;
            }
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
            
            // Mostra a imagem atual do produto
            showCurrentProductImage(product.imageUrl);
            
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
            
            // Atualiza também o container de cards para dispositivos móveis
            const cardsContainer = document.getElementById('products-cards');
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="loading-cell">Buscando produtos na categoria "${category}"...</div>`;
            }
            
            // Busca os produtos na API pelo endpoint de categoria
            const products = await apiService.get(`/product/category/${encodeURIComponent(category)}`);
            
            // Atualiza a categoria atual
            currentCategory = category;
            
            // Atualiza as tags de filtro
            updateFilterTags(category);
            
            // Renderiza os produtos encontrados
            if (!products || products.length === 0) {
                productsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhum produto encontrado na categoria "' + category + '"</td></tr>';
                
                // Atualiza também o container de cards para dispositivos móveis
                if (cardsContainer) {
                    cardsContainer.innerHTML = `<div class="empty-cell">Nenhum produto encontrado na categoria "${category}"</div>`;
                }
                return;
            }
            
            // Renderiza a tabela com os produtos encontrados
            renderProductsTable(products);
            
            // Também renderiza os cards para visualização móvel
            createProductCards(products);
            
            // Verifica o tamanho da tela e ajusta a visualização
            checkScreenSize();
            
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            productsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Erro ao buscar produtos: ${error.message}
                    </td>
                </tr>
            `;
            
            // Atualiza também o container de cards para dispositivos móveis
            const cardsContainer = document.getElementById('products-cards');
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="error-cell">Erro ao buscar produtos: ${error.message}</div>`;
            }
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
                    </td>
                    <td>${product.name}</td>
                    <td>${product.description || ''}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td class="${stockClass}">${product.stock}</td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}" style="white-space: nowrap; min-width: 90px;">
                                <i class="fas fa-user-edit"></i> <span class="btn-text">Editar</span>
                            </button>
                            <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}" style="white-space: nowrap; min-width: 90px;">
                                <i class="fas fa-trash"></i> <span class="btn-text">Deletar</span>
                            </button>
                        </div>
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
    
    // Função para mostrar a imagem atual ao editar
    function showCurrentProductImage(imageUrl) {
        const group = document.getElementById('product-current-image-group');
        const preview = document.getElementById('product-current-image-preview');
        if (imageUrl) {
            group.style.display = '';
            preview.innerHTML = `<img src="${imageUrl}" alt="Foto do produto" style="max-width:120px;max-height:120px;border-radius:8px;box-shadow:0 2px 8px #0002;">`;
        } else {
            group.style.display = 'none';
            preview.innerHTML = '';
        }
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
    
    // Função para criar cards de produtos (visualização móvel)
    function createProductCards(products) {
        const cardsContainer = document.getElementById('products-cards');
        if (!cardsContainer) {
            console.error('Container de cards não encontrado');
            return;
        }
        
        cardsContainer.innerHTML = '';
        
        if (!products || products.length === 0) {
            cardsContainer.innerHTML = '<div class="empty-cell">Nenhum produto encontrado</div>';
            return;
        }
        
        products.forEach(product => {
            const stockClass = product.stock < 10 ? 'low-stock' : '';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', product.id);
            card.style.backgroundColor = '#1e2633';
            card.style.borderRadius = '12px';
            card.style.padding = '15px';
            card.style.marginBottom = '15px';
            card.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
            card.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            card.innerHTML = `
                <div class="product-card-header" style="display: flex; align-items: center; margin-bottom: 12px;">
                    ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">` : '<div style="width: 60px; height: 60px; background: #2a3649; border-radius: 8px; margin-right: 12px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 24px; color: #4a5568;"></i></div>'}
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #fff;">${product.name}</h3>
                </div>
                <div class="product-card-body" style="background-color: #2a3649; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <div class="product-card-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="product-card-label" style="color: #a0aec0; font-size: 14px;">Descrição:</span>
                        <span class="product-card-value" style="color: #e2e8f0; font-size: 14px; text-align: right; font-weight: 500;">${product.description || 'N/A'}</span>
                    </div>
                    <div class="product-card-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="product-card-label" style="color: #a0aec0; font-size: 14px;">Categoria:</span>
                        <span class="product-card-value" style="color: #e2e8f0; font-size: 14px; text-align: right; font-weight: 500;">${product.category || 'N/A'}</span>
                    </div>
                    <div class="product-card-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="product-card-label" style="color: #a0aec0; font-size: 14px;">Preço:</span>
                        <span class="product-card-value" style="color: #e2e8f0; font-size: 14px; text-align: right; font-weight: 500;">${formatCurrency(product.price)}</span>
                    </div>
                    <div class="product-card-item" style="display: flex; justify-content: space-between;">
                        <span class="product-card-label" style="color: #a0aec0; font-size: 14px;">Estoque:</span>
                        <span class="product-card-value ${stockClass}" style="color: ${product.stock < 10 ? '#f56565' : '#e2e8f0'}; font-size: 14px; text-align: right; font-weight: 500;">${product.stock}</span>
                    </div>
                </div>
                <div class="product-card-footer" style="display: flex; justify-content: space-between; padding-top: 10px;">
                    <button class="btn btn-primary edit-product" data-id="${product.id}" style="flex: 1; margin-right: 8px; padding: 8px 0; border-radius: 6px; font-size: 14px; font-weight: 500; border: none; background: linear-gradient(135deg, #31d5de 0%, #1c31a5 100%); color: white; cursor: pointer;">
                        <i class="fas fa-user-edit"></i> <span class="btn-text">Editar</span>
                    </button>
                    <button class="btn btn-danger delete-product" data-id="${product.id}" style="flex: 1; margin-left: 8px; padding: 8px 0; border-radius: 6px; font-size: 14px; font-weight: 500; border: none; background: linear-gradient(135deg, #ff6b6b 0%, #d63031 100%); color: white; cursor: pointer;">
                        <i class="fas fa-trash"></i> <span class="btn-text">Deletar</span>
                    </button>
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
        
        // Adiciona eventos aos botões de ação nos cards
        cardsContainer.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        cardsContainer.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
    }
    
    // Função para verificar o tamanho da tela e ajustar a visualização
    function checkScreenSize() {
        const tableContainer = document.querySelector('.table-container');
        const cardsContainer = document.getElementById('products-cards');
        
        if (!tableContainer || !cardsContainer) {
            console.error('Containers de tabela ou cards não encontrados');
            return;
        }
        
        if (window.innerWidth <= 480) {
            // Em dispositivos pequenos (como o teste em 316x498), mostra cards
            tableContainer.style.display = 'none';
            cardsContainer.style.display = 'block';
            console.log('Ativando visualização em cards para dispositivos móveis');
        } else {
            // Em dispositivos maiores, mostra tabela
            tableContainer.style.display = 'block';
            cardsContainer.style.display = 'none';
            console.log('Ativando visualização em tabela para dispositivos maiores');
        }
    }
    
    // Adiciona evento de redimensionamento da janela para ajustar a visualização
    window.addEventListener('resize', checkScreenSize);
    
    // Inicializa o preview de imagem
    handleProductImagePreview();
    
    // Carrega os produtos ao iniciar
    loadProducts();
});
