function cancelEdit() {
    window.location.href = "../index.html";
}

// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
}

// Evento para carregar profissionais ao clicar no botão "Filtrar"
document.addEventListener("DOMContentLoaded", () => {
    const serviceListContainer = document.getElementById("service-list-container");
    const serviceList = document.getElementById("service-list");
    const filterButton = document.getElementById("filter-btn"); // Botão de filtragem
    const specialtySelect = document.getElementById("specialty"); // Campo de especialidade
    const token = getAuthToken();

    // Função para carregar profissionais com ou sem filtro
    async function loadProfessionals(specialty = "") {
        serviceListContainer.style.display = "block";
        serviceList.innerHTML = ""; // Limpa a lista

        try {
            // Monta a URL com base na especialidade selecionada
            let url = "http://localhost:8080/api/client";
            if (specialty) {
                url += `?specialties=${encodeURIComponent(specialty)}`;
            }

            // Faz a requisição ao backend
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar profissionais. Verifique o token ou a API.");
            }

            const professionals = await response.json();

            // Exibe os profissionais na lista
            if (professionals.length > 0) {
                professionals.forEach(professional => {
                    const listItem = document.createElement("li");
                    listItem.classList.add("service-item");

                    listItem.innerHTML = `
                        <div class="professional-header">
                            <h3 class="professional-name">${professional.name}</h3>
                        </div>
                        <p><strong>Email:</strong> ${professional.email}</p>
                        <p><strong>Especialidades:</strong> ${professional.specialties}</p>
                        <p><strong>Localização:</strong> ${professional.location}</p>
                        <p><strong>Serviços Completos:</strong> ${professional.totalServicesCompleted}</p>
                        <p><strong>Nota Média:</strong> ${professional.averageRating.toFixed(2)}</p>
                        <div class="availability">
                            <strong>Disponível:</strong> 
                            <span class="${professional.available ? 'available' : 'not-available'}">
                                ${professional.available ? "Sim" : "Não"}
                            </span>
                            <button class="view-profile-btn" data-email="${professional.email}">Visualizar Perfil</button>
                        </div>
                        <hr>
                    `;

                    serviceList.appendChild(listItem);
                });

                // Evento para visualizar perfil
                document.querySelectorAll(".view-profile-btn").forEach(button => {
                    button.addEventListener("click", function() {
                        const email = this.getAttribute("data-email");
                        viewProfile(email);
                    });
                });

            } else {
                serviceList.innerHTML = "<p>Nenhum profissional encontrado para esta especialidade.</p>";
            }

        } catch (error) {
            console.error(error);
            serviceList.innerHTML = "<p>Erro ao buscar profissionais. Tente novamente mais tarde.</p>";
        }
    }

    function viewProfile(email) {
        window.open(`../VisualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
    }

    // Adiciona o evento ao botão "Filtrar"
    filterButton.addEventListener("click", () => {
        const selectedSpecialty = specialtySelect.value;
        loadProfessionals(selectedSpecialty);
    });

    // Carrega todos os profissionais ao iniciar a página
    loadProfessionals();
});
