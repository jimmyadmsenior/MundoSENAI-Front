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
    const passwordChangeToggle = document.getElementById('password-change-toggle');
    const showPasswordChangeBtn = document.getElementById('show-password-change');
    const passwordChangeFields = document.getElementById('password-change-fields');
    
    // Função de inicialização - executada imediatamente
    function initializeFormElements() {
        console.log('Inicializando elementos do formulário...');
        
        // Garantir que o formulário esteja oculto inicialmente
        if (userFormContainer) {
            userFormContainer.classList.add('hidden');
            userFormContainer.style.display = 'none';
        }
        
        // Garantir que todos os campos de senha estejam ocultos inicialmente
        const passwordFields = document.getElementById('password-fields');
        if (passwordFields) {
            passwordFields.classList.add('hidden');
            passwordFields.style.display = 'none';
            console.log('Campo de senha normal ocultado na inicialização');
        }
        
        if (passwordChangeToggle) {
            passwordChangeToggle.classList.add('hidden');
            passwordChangeToggle.style.display = 'none';
            console.log('Botão de alteração de senha ocultado na inicialização');
        }
        
        if (passwordChangeFields) {
            passwordChangeFields.classList.add('hidden');
            passwordChangeFields.style.display = 'none';
            console.log('Campos de alteração de senha ocultados na inicialização');
        }
    }
    
    // Executa a inicialização imediatamente
    initializeFormElements();
    
    // Função para mostrar/esconder o formulário de usuário
    function toggleUserForm(show = true, isEditing = false) {
        console.log('toggleUserForm - isEditing:', isEditing);
        
        if (show) {
            userFormContainer.classList.remove('hidden');
            userFormContainer.style.display = 'block';
            userFormContainer.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s';
            userFormContainer.style.transform = 'translateY(-30px) scale(1.03)';
            userFormContainer.style.boxShadow = '0 8px 32px 0 rgba(49,213,222,0.15)';
            setTimeout(() => {
                userFormContainer.style.transform = 'translateY(0) scale(1)';
                userFormContainer.style.boxShadow = '';
            }, 400);
            userFormTitle.textContent = isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário';
            
            // PRIMEIRO: Oculta TODOS os campos e botões relacionados a senha
            const passwordFields = document.getElementById('password-fields');
            const passwordChangeToggle = document.getElementById('password-change-toggle');
            const passwordChangeFields = document.getElementById('password-change-fields');
            
            // Verifica se os elementos existem antes de manipulá-los e oculta todos inicialmente
            if (passwordFields) {
                passwordFields.style.display = 'none';
            }
            
            if (passwordChangeToggle) {
                passwordChangeToggle.style.display = 'none';
            }
            
            if (passwordChangeFields) {
                passwordChangeFields.style.display = 'none';
            }
            
            // SEGUNDO: Configura o formulário de acordo com o modo
            if (!isEditing) {
                // Quando for ADICIONAR novo usuário
                clearUserForm();
                
                // Ao adicionar um novo usuário, mostra o campo de senha normal
                if (passwordFields) {
                    passwordFields.style.display = 'block';
                }
                
                console.log('Modo ADICIONAR: Campo de senha normal exibido');
            } else {
                // Quando for EDITAR um usuário existente
                // Mostra APENAS o botão para alterar senha se ele existir
                if (passwordChangeToggle) {
                    passwordChangeToggle.style.display = 'block';
                }
            }
            
            // Verificando o estado final dos elementos (somente se existirem)
            if (passwordFields) {
                console.log('password-fields (display):', passwordFields.style.display);
            }
            if (passwordChangeToggle) {
                console.log('password-change-toggle (display):', passwordChangeToggle.style.display);
            }
            if (passwordChangeFields) {
                console.log('password-change-fields (display):', passwordChangeFields.style.display);
            }
            
            userFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            userFormContainer.classList.add('hidden');
            userFormContainer.style.display = 'none';
            userFormContainer.style.transform = '';
            userFormContainer.style.boxShadow = '';
        }
    }
    
    // Função para limpar o formulário
    function clearUserForm() {
        document.getElementById('user-id').value = '';
        document.getElementById('user-name').value = '';
        document.getElementById('user-email').value = '';
        
        // Verifica se o elemento existe antes de manipulá-lo
        const passwordField = document.getElementById('user-password');
        if (passwordField) {
            passwordField.value = '';
        }
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
                <tr class="user-row" data-user-id="${user.id}">
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">
                                <i class="fas fa-user-edit"></i> <span class="btn-text">Editar</span>
                            </button>
                            <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                                <i class="fas fa-trash"></i> <span class="btn-text">Deletar</span>
                            </button>
                        </div>
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
            
            // Adiciona evento de clique nas linhas da tabela (exceto nos botões)
            document.querySelectorAll('.user-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    // Ignora cliques nos botões de ação
                    if (e.target.closest('.btn') || e.target.closest('i')) {
                        return;
                    }
                    
                    const userId = this.getAttribute('data-user-id');
                    editUser(userId);
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
            console.log('Iniciando edição do usuário ID:', userId);
            
            // Limpa completamente o formulário antes de preencher com novos dados
            clearUserForm();
            
            // Busca os dados do usuário
            const user = await apiService.get(`/user/${userId}`);
            
            // Preenche o formulário
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            
            // Certifica-se de que o campo de senha para novos usuários está escondido
            const passwordFields = document.getElementById('password-fields');
            if (passwordFields) {
                passwordFields.classList.add('hidden');
            }
            
            // Mostra o formulário, passando true para indicar que é modo de edição
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
            
            // Verifica se há alteração de senha em andamento
            const isChangingPassword = !document.getElementById('password-change-fields').classList.contains('hidden');
            
            if (isEditing && isChangingPassword) {
                // Se estiver alterando a senha
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                
                // Tenta alterar a senha primeiro
                const passwordChanged = await changePassword(userId, currentPassword, newPassword);
                
                // Se houver falha na alteração de senha, interrompe o processo
                if (!passwordChanged) {
                    return;
                }
            }
            
            // Coleta os dados do formulário
            const userData = {
                name: document.getElementById('user-name').value.trim(),
                email: document.getElementById('user-email').value.trim()
            };
            
            // Se não estiver editando, adiciona a senha
            if (!isEditing) {
                const passwordField = document.getElementById('user-password');
                if (passwordField) {
                    userData.password = passwordField.value;
                }
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
            
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert(`Erro ao salvar usuário: ${error.message}`);
        }
    }
    
    // Função para mostrar/esconder os campos de alteração de senha
    function togglePasswordChangeFields(show = false) {
        if (passwordChangeFields) {
            if (show) {
                passwordChangeFields.style.display = 'block';
                console.log('Campos de alteração de senha exibidos');
            } else {
                passwordChangeFields.style.display = 'none';
                console.log('Campos de alteração de senha ocultados');
                // Limpar os campos de senha quando ocultos
                if (document.getElementById('current-password')) {
                    document.getElementById('current-password').value = '';
                }
                if (document.getElementById('new-password')) {
                    document.getElementById('new-password').value = '';
                }
            }
        }
    }

    // Função para alterar a senha de um usuário
    async function changePassword(userId, currentPassword, newPassword) {
        try {
            // Verifica se os campos estão preenchidos
            if (!currentPassword || !newPassword) {
                alert('Por favor, preencha todos os campos de senha.');
                return false;
            }

            // Envia a requisição para alterar a senha
            const response = await apiService.put(`/user/${userId}/password`, {
                currentPassword,
                newPassword
            });

            // Limpa os campos de senha
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            
            // Esconde os campos de alteração de senha
            togglePasswordChangeFields(false);
            
            alert('Senha alterada com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert(`Erro ao alterar senha: ${error.message}`);
            return false;
        }
    }

    // Configura os eventos
    addUserBtn.addEventListener('click', () => toggleUserForm(true, false));
    cancelUserBtn.addEventListener('click', () => toggleUserForm(false));
    refreshUsersBtn.addEventListener('click', loadUsers);
    userForm.addEventListener('submit', saveUser);
    
    // Evento para o botão de alteração de senha
    if (showPasswordChangeBtn) {
        showPasswordChangeBtn.addEventListener('click', () => {
            togglePasswordChangeFields(true);
        });
    }
    
    // Garante que todos os campos de senha estejam ocultos ao iniciar
    const passwordFields = document.getElementById('password-fields');
    if (passwordFields) {
        passwordFields.classList.add('hidden');
    }
    
    if (passwordChangeToggle) {
        passwordChangeToggle.classList.add('hidden');
    }
    
    if (passwordChangeFields) {
        passwordChangeFields.classList.add('hidden');
    }
    
    // Carrega os usuários ao iniciar
    loadUsers();
});
