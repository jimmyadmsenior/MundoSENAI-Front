/**
 * Script para gerenciar as operações relacionadas a usuários
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const usersList = document.getElementById('users-list');
    const userForm = document.getElementById('user-form');
    const userFormContainer = document.getElementById('user-form-container');
    const userFormTitle = document.getElementById('user-form-title');
    const addUserBtn = document.getElementById('add-user-btn');
    const cancelUserBtn = document.getElementById('cancel-user');
    const refreshUsersBtn = document.getElementById('refresh-users');
    
    // Função para mostrar/esconder o formulário de usuário
    function toggleUserForm(show = true, isEditing = false) {
        if (show) {
            userFormContainer.classList.remove('hidden');
            userFormContainer.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s';
            userFormContainer.style.transform = 'translateY(-30px) scale(1.03)';
            userFormContainer.style.boxShadow = '0 8px 32px 0 rgba(49,213,222,0.15)';
            setTimeout(() => {
                userFormContainer.style.transform = 'translateY(0) scale(1)';
                userFormContainer.style.boxShadow = '';
            }, 400);
            userFormTitle.textContent = isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário';
            // Esconde todos os campos de senha e botões de troca de senha ao editar
            document.getElementById('password-fields').classList.add('hidden');
            document.getElementById('password-change-toggle').classList.add('hidden');
            document.getElementById('password-change-fields').classList.add('hidden');
            if (!isEditing) {
                clearUserForm();
                // Mostra campos de senha apenas ao adicionar
                document.getElementById('password-fields').classList.remove('hidden');
            }
            userFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            userFormContainer.classList.add('hidden');
            userFormContainer.style.transform = '';
            userFormContainer.style.boxShadow = '';
        }
    }
    
    // Função para limpar o formulário
    function clearUserForm() {
        document.getElementById('user-id').value = '';
        document.getElementById('user-name').value = '';
        document.getElementById('user-email').value = '';
        document.getElementById('user-password').value = '';
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        
        // Limpa completamente o input de imagem e a pré-visualização
        const imageInput = document.getElementById('user-image');
        // Cria um novo elemento input para substituir o atual
        const newImageInput = document.createElement('input');
        newImageInput.type = 'file';
        newImageInput.id = 'user-image';
        newImageInput.accept = 'image/*';
        // Substitui o input antigo pelo novo
        imageInput.parentNode.replaceChild(newImageInput, imageInput);
        
        // Limpa a pré-visualização
        document.getElementById('image-preview').innerHTML = '';
    }
    
    // Função para carregar a lista de usuários
    async function loadUsers() {
        try {
            usersList.innerHTML = '<tr><td colspan="3" class="loading-cell">Carregando usuários...</td></tr>';
            const users = await apiService.get('/user');

            // Obtém o ID do usuário logado a partir do token
            const token = localStorage.getItem('token');
            let loggedUserId = null;
            if (token) {
                try {
                    const tokenParts = token.split('.');
                    if (tokenParts.length === 3) {
                        const base64Url = tokenParts[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        const tokenData = JSON.parse(jsonPayload);
                        loggedUserId = tokenData.id;
                    }
                } catch (e) { /* ignora erro */ }
            }

            // Filtra para não mostrar o usuário logado
            const filteredUsers = users.filter(user => user.id !== loggedUserId);

            if (!filteredUsers || filteredUsers.length === 0) {
                usersList.innerHTML = '<tr><td colspan="3" class="empty-cell">Nenhum usuário encontrado</td></tr>';
                return;
            }

            let html = '';
            filteredUsers.forEach(user => {
                html += `
                <tr data-id="${user.id}">
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">
                            <i class="fas fa-user-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            usersList.innerHTML = html;

            // Adiciona eventos aos botões de ação
            document.querySelectorAll('.edit-user').forEach(button => {
                button.addEventListener('click', (e) => {
                    const userId = e.currentTarget.getAttribute('data-id');
                    editUser(userId); // Abre o formulário de edição na mesma página
                });
            });
            document.querySelectorAll('.delete-user').forEach(button => {
                button.addEventListener('click', (e) => {
                    const userId = e.currentTarget.getAttribute('data-id');
                    deleteUser(userId);
                });
            });
            
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            usersList.innerHTML = `
                <tr>
                    <td colspan="3" class="error-cell">
                        Erro ao carregar usuários: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    // Função para editar um usuário
    async function editUser(userId) {
        try {
            // Limpa completamente o formulário antes de preencher com novos dados
            clearUserForm();
            
            // Busca os dados do usuário
            const user = await apiService.get(`/user/${userId}`);
            
            // Preenche o formulário
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-password').value = ''; // Senha não é retornada pela API
            
            // Se o usuário tiver uma imagem, mostra na pré-visualização
            if (user.image) {
                const imagePreview = document.getElementById('image-preview');
                imagePreview.innerHTML = '';
                
                const img = document.createElement('img');
                img.src = user.image;
                img.classList.add('preview-img');
                imagePreview.appendChild(img);
            }
            
            // Mostra o formulário
            toggleUserForm(true, true);
            
        } catch (error) {
            console.error('Erro ao carregar usuário para edição:', error);
            alert(`Erro ao carregar usuário: ${error.message}`);
        }
    }
    
    // Função para excluir um usuário
    async function deleteUser(userId) {
        try {
            // Confirmação
            if (!confirm('Tem certeza que deseja excluir este usuário?')) {
                return;
            }
            
            // Exclui o usuário
            await apiService.delete(`/user/${userId}`);
            
            // Recarrega a lista de usuários
            loadUsers();
            
            // Mostra mensagem de sucesso
            alert('Usuário excluído com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert(`Erro ao excluir usuário: ${error.message}`);
        }
    }
    
    // Função para salvar um usuário (novo ou editado)
    async function saveUser(e) {
        e.preventDefault();
        
        try {
            const userId = document.getElementById('user-id').value;
            const isEditing = !!userId;
            
            // Coleta os dados do formulário
            const userData = {
                name: document.getElementById('user-name').value.trim(),
                email: document.getElementById('user-email').value.trim(),
                password: document.getElementById('user-password').value
            };
            
            // Se estiver editando, remove o campo de senha para não exigir senha
            if (isEditing) {
                delete userData.password;
            }
            
            // Processa a imagem se existir
            getImageBase64(async (imageBase64) => {
                if (imageBase64) {
                    userData.image = imageBase64;
                }
            
                let response;
                
                if (isEditing) {
                    // Atualiza o usuário existente
                    response = await apiService.put(`/user/${userId}`, userData);
                } else {
                    // Cria um novo usuário
                    response = await apiService.post('/user', userData);
                }
                
                // Esconde o formulário
                toggleUserForm(false);
                
                // Recarrega a lista de usuários
                loadUsers();
                
                // Mostra mensagem de sucesso
                alert(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            });
            
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert(`Erro ao salvar usuário: ${error.message}`);
        }
    }
    
    // Função para lidar com a pré-visualização da imagem
    function handleImagePreview() {
        // Configura o evento para ser chamado quando o formulário é mostrado
        addUserBtn.addEventListener('click', setupImagePreview);
        
        // Adiciona o evento de clique aos botões de edição após carregar os usuários
        function addEditButtonListeners() {
            document.querySelectorAll('.edit-user').forEach(btn => {
                btn.addEventListener('click', setupImagePreview);
            });
        }
        
        // Adiciona o evento ao carregamento de usuários
        const originalLoadUsers = loadUsers;
        loadUsers = async function() {
            await originalLoadUsers();
            addEditButtonListeners();
        };
    }
    
    // Função para configurar a pré-visualização da imagem
    function setupImagePreview() {
        // Limpa completamente a pré-visualização
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = '';
        
        // Recria o input de imagem para garantir que não há eventos residuais
        const imageInputContainer = document.querySelector('.image-upload-container');
        const oldInput = document.getElementById('user-image');
        
        // Cria um novo input
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.id = 'user-image';
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
    
    // Função para converter a imagem em base64
    function getImageBase64(callback) {
        const imageInput = document.getElementById('user-image');
        
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                callback(e.target.result);
            };
            
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            callback(null);
        }
    }
    
    // Configura os eventos
    addUserBtn.addEventListener('click', () => toggleUserForm(true, false));
    cancelUserBtn.addEventListener('click', () => toggleUserForm(false));
    refreshUsersBtn.addEventListener('click', loadUsers);
    userForm.addEventListener('submit', saveUser);
    
    handleImagePreview();
    
    // Carrega os usuários ao iniciar
    loadUsers();
});
