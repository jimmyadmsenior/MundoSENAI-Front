/**
 * Script para gerenciar a página de perfil do usuário
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const profileForm = document.getElementById('profile-form');
    const profileIdInput = document.getElementById('profile-id');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profileImageInput = document.getElementById('profile-image');
    const profileImagePreview = document.getElementById('profile-image-preview');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const profileMessage = document.getElementById('profile-message');
    
    // ID do usuário logado
    let currentUserId = null;
    
    // Função para mostrar mensagens
    function showMessage(text, type) {
        profileMessage.textContent = text;
        profileMessage.className = 'message';
        profileMessage.classList.add(type);
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            profileMessage.textContent = '';
            profileMessage.className = 'message';
        }, 5000);
    }
    
    // Função para carregar os dados do perfil
    async function loadProfileData() {
        try {
            // Verifica se o usuário está autenticado
            if (!apiService.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }
            
            // Obtém o ID do usuário da URL se existir
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('id');
            
            if (userId) {
                // Se temos um ID na URL, carregamos esse usuário
                try {
                    const user = await apiService.get(`/user/${userId}`);
                    
                    // Preenche o formulário
                    profileIdInput.value = user.id;
                    profileNameInput.value = user.name;
                    profileEmailInput.value = user.email;
                    
                    // Se o usuário tiver uma imagem, mostra na pré-visualização
                    if (user.image) {
                        profileImagePreview.innerHTML = '';
                        
                        const img = document.createElement('img');
                        img.src = user.image;
                        img.classList.add('preview-img');
                        profileImagePreview.appendChild(img);
                    }
                    
                    // Armazena o ID do usuário sendo editado
                    currentUserId = user.id;
                } catch (error) {
                    console.error('Erro ao carregar dados do usuário:', error);
                    showMessage('Erro ao carregar dados do usuário. Tente novamente mais tarde.', 'error');
                }
            } else {
                // Se não temos um ID na URL, carregamos o usuário logado a partir do token
                try {
                    // Obtemos o token e extraimos o ID do usuário
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Token não encontrado');
                    }
                    
                    // Decodifica o token para obter o ID do usuário
                    const tokenParts = token.split('.');
                    if (tokenParts.length !== 3) {
                        throw new Error('Token inválido');
                    }
                    
                    // Decodifica a parte do payload (índice 1)
                    const base64Url = tokenParts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const tokenData = JSON.parse(jsonPayload);
                    const loggedUserId = tokenData.id;
                    
                    if (!loggedUserId) {
                        throw new Error('ID de usuário não encontrado no token');
                    }
                    
                    // Busca os dados do usuário logado
                    const user = await apiService.get(`/user/${loggedUserId}`);
                    
                    // Preenche o formulário
                    profileIdInput.value = user.id;
                    profileNameInput.value = user.name;
                    profileEmailInput.value = user.email;
                    
                    // Se o usuário tiver uma imagem, mostra na pré-visualização
                    if (user.image) {
                        profileImagePreview.innerHTML = '';
                        
                        const img = document.createElement('img');
                        img.src = user.image;
                        img.classList.add('preview-img');
                        profileImagePreview.appendChild(img);
                    }
                    
                    // Armazena o ID do usuário sendo editado
                    currentUserId = user.id;
                } catch (error) {
                    console.error('Erro ao carregar dados do usuário logado:', error);
                    showMessage('Erro ao carregar dados do usuário. Tente novamente mais tarde.', 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
            showMessage('Erro ao carregar dados do perfil. Tente novamente mais tarde.', 'error');
        }
    }
    
    // Função para lidar com a pré-visualização da imagem
    function setupImagePreview() {
        // Limpa completamente a pré-visualização
        profileImagePreview.innerHTML = '';
        
        // Recria o input de imagem para garantir que não há eventos residuais
        const imageInputContainer = document.querySelector('.image-upload-container');
        const oldInput = document.getElementById('profile-image');
        
        // Cria um novo input
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.id = 'profile-image';
        newInput.accept = 'image/*';
        
        // Substitui o antigo pelo novo
        if (oldInput && imageInputContainer) {
            imageInputContainer.replaceChild(newInput, oldInput);
        }
        
        // Adiciona o evento ao novo input
        newInput.addEventListener('change', function() {
            // Limpa a pré-visualização anterior
            profileImagePreview.innerHTML = '';
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('preview-img');
                    profileImagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Função para obter a imagem do arquivo
    function getProfileImage() {
        const imageInput = document.getElementById('profile-image');
        
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
    
    // Função para salvar as alterações do perfil
    async function saveProfile(e) {
        e.preventDefault();
        
        try {
            const userId = profileIdInput.value;
            
            // Coleta os dados do formulário
            const userData = {
                name: profileNameInput.value.trim(),
                email: profileEmailInput.value.trim()
            };
            
            // Processa a imagem se existir
            const imageBase64 = await getProfileImage();
            if (imageBase64) {
                userData.image = imageBase64;
            }
            
            // Variável para controlar se a senha foi alterada
            let passwordChanged = false;
            
            // Verifica se o usuário está tentando alterar a senha
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // Se algum dos campos de senha estiver preenchido, verifica todos
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    showMessage('Para alterar a senha, preencha todos os campos de senha.', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showMessage('A nova senha e a confirmação não coincidem.', 'error');
                    return;
                }
                
                // Atualiza a senha em uma chamada separada
                try {
                    await apiService.put(`/user/password/${userId}`, {
                        currentPassword,
                        newPassword
                    });
                    
                    showMessage('Senha alterada com sucesso!', 'success');
                    passwordChanged = true; // Marca que a senha foi alterada
                    
                    // Limpa os campos de senha
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';
                } catch (passwordError) {
                    showMessage('Erro ao alterar a senha. Verifique se a senha atual está correta.', 'error');
                    return;
                }
            }
            
            // Atualiza os dados do usuário
            await apiService.put(`/user/${userId}`, userData);
            
            // Mensagem diferente dependendo se a senha foi alterada ou não
            if (passwordChanged) {
                showMessage('Perfil e senha atualizados com sucesso! Você será redirecionado para o login.', 'success');
                
                // Desloga o usuário após a atualização da senha
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage('Perfil atualizado com sucesso!', 'success');
            }
            
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            showMessage(`Erro ao salvar perfil: ${error.message}`, 'error');
        }
    }
    
    // Inicializa a pré-visualização da imagem
    setupImagePreview();
    
    // Adiciona o evento de submit ao formulário
    profileForm.addEventListener('submit', saveProfile);
    
    // Carrega os dados do perfil
    loadProfileData();
});
