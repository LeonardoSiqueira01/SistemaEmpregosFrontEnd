document.addEventListener("DOMContentLoaded", function() {
    // Função para obter o email da URL
    function getEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("email");
    }

    // Função para carregar o perfil do usuário
    async function loadProfile(email) {
        if (!email) {
            alert("Email não encontrado na URL.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(email)}`);
            const user = await response.json();

            if (user) {
                // Atualiza o título da página com base no tipo de usuário
                const profileHeading = document.getElementById("profile-heading");

                // Define o título e o cabeçalho com base no tipo de usuário
                if (user.type === "CLIENT") {
                    profileHeading.textContent = "Perfil do Cliente";
                    document.querySelector('.profile-container').classList.add('client-profile');
                } else if (user.type === "PROFESSIONAL") {
                    profileHeading.textContent = "Perfil do Profissional";
                    document.querySelector('.profile-container').classList.add('professional-profile');
                }

                // Exibe as informações do usuário
                const profileInfoDiv = document.getElementById("profile-info");
                let ratingsHtml = '';
                let specialtiesHtml = ''; // Variável para armazenar as especialidades

                if (user.type === "CLIENT") {
                    // Exibe informações específicas do cliente
                    ratingsHtml = user.ratings.map(rating => `
                        <div class="rating-item">
                            <p class="user-name"><strong>Profissional:</strong> ${rating.professionalName}</p>
                            <p class="commentary"><strong>Comentário:</strong> ${rating.commentaryForClient || 'Nenhum comentário disponível.'}</p>
                            <p><strong>Avaliação:</strong> <span class="rating-value">${rating.ratedClient || 'N/A'}</span></p>
                        </div>
                    `).join('');
                } else if (user.type === "PROFESSIONAL") {
                    // Exibe informações específicas do profissional
                    ratingsHtml = user.ratings.map(rating => `
                        <div class="rating-item">
                            <p class="user-name"><strong>Cliente:</strong> ${rating.clientName}</p>
                            <p class="commentary"><strong>Comentário:</strong> ${rating.comment || 'Nenhum comentário disponível.'}</p>
                            <p><strong>Avaliação:</strong> <span class="rating-value">${rating.ratedProfessional || 'N/A'}</span></p>
                        </div>
                    `).join('');

                    // Exibe as especialidades para profissionais
                    specialtiesHtml = user.specialties ? `<p><strong>Especialidades:</strong> ${user.specialties}</p>` : '';
                }

                // Atualiza a seção do perfil com as informações
                profileInfoDiv.innerHTML = `
                    <div class="profile-card">
                        <p><strong>Nome:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        ${specialtiesHtml} <!-- Exibe as especialidades apenas para profissionais -->
                        <p><strong>Total de Serviços Solicitados:</strong> ${user.totalServicesRequested}</p>
                        <p><strong>Total de Serviços Completados:</strong> ${user.totalServicesCompleted}</p>
                        <p><strong>Avaliação Média:</strong> ${user.averageRating}</p>
                    </div>
                `;

                // Insere os comentários na parte direita do perfil
                const profileRatingsDiv = document.getElementById("profile-ratings");
                profileRatingsDiv.innerHTML = `
                    <h2>Avaliações</h2>
                    ${ratingsHtml}
                `;
            } else {
                alert("Usuário não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao carregar o perfil:", error);
            alert("Erro ao carregar as informações do perfil.");
        }
    }

    // Obtém o email da URL e carrega o perfil
    const email = getEmailFromURL();
    loadProfile(email);
});
