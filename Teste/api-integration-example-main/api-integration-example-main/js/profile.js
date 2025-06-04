/**
 * Script para gerenciar a página de perfil do usuário
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const profileForm = document.getElementById('profile-form');
    const profileIdInput = document.getElementById('profile-id');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
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
            
            // Variável para controlar se a senha foi alterada
            let passwordChanged = false;
            
            // Verifica se o usuário está tentando alterar a senha
            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            
            // Só exige todos os campos de senha se algum deles for preenchido (ignorando espaços)
            const algumCampoPreenchido = currentPassword !== '' || newPassword !== '' || confirmPassword !== '';
            const todosCamposPreenchidos = currentPassword !== '' && newPassword !== '' && confirmPassword !== '';
            if (algumCampoPreenchido) {
                if (!todosCamposPreenchidos) {
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
            
            // Atualiza os dados do usuário SEM exigir senha
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
    
    // Adiciona o evento de submit ao formulário
    profileForm.addEventListener('submit', saveProfile);
    
    // Carrega os dados do perfil
    loadProfileData();
});
