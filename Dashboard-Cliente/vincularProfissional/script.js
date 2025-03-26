

class ProfessionalServiceManager {
    constructor() {
        this.token = localStorage.getItem("authToken");
        this.serviceListContainer = document.getElementById("service-list-container");
        this.serviceList = document.getElementById("service-list");

        // Chama a função para buscar profissionais assim que a página carregar
        document.addEventListener("DOMContentLoaded", () => {
            this.fetchProfessionals();
        });

        // Exibir ou esconder o filtro ao clicar no botão "Serviços por Especialidade"
        document.getElementById("specialty-services").addEventListener("click", () => {
            const specialtyContainer = document.getElementById("specialty-container");
            specialtyContainer.style.display = (specialtyContainer.style.display === "none" || specialtyContainer.style.display === "") ? "block" : "none";
        });

        // Adiciona evento de mudança para o select de especialidade
        document.getElementById("specialty").addEventListener("change", (event) => {
            const specialty = event.target.value; // Obtém o valor da especialidade
            this.fetchProfessionals(specialty); // Chama a função fetchProfessionals com a especialidade selecionada
        });
    }

    async fetchProfessionals(specialty = "") {
        this.serviceListContainer.style.display = "block";
        this.serviceList.innerHTML = "";
    
        try {
            let url = "http://localhost:8080/api/client"; // Endpoint para profissionais
    
            // Se a especialidade for passada, adiciona como parâmetro de filtro
            if (specialty) {
                url += `?specialties=${encodeURIComponent(specialty)}`; // Corrigir o nome do parâmetro
            }
    
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error("Erro ao buscar profissionais.");
            }
    
            const professionals = await response.json();
    
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
                        </div>
                        <button class="assign-button" onclick="professionalServiceManager.assignProfessional('${professional.id}')">Vincular Profissional</button>
                        <button onclick="professionalServiceManager.viewProfile('${professional.email}')">Visualizar Perfil</button>
                    `;
    
                    this.serviceList.appendChild(listItem);
                });
            } else {
                this.serviceList.innerHTML = "<p>Nenhum profissional encontrado.</p>";
            }
        } catch (error) {
            console.error(error);
            this.serviceList.innerHTML = "<p>Erro ao buscar profissionais. Tente novamente mais tarde.</p>";
        }
    }
    

    viewProfile(email) {
        window.open(`../VisualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
    }

    async assignProfessional(professionalId) {
        const serviceId = new URLSearchParams(window.location.search).get("serviceId");

        if (!serviceId || isNaN(serviceId)) {
            alert("ID do serviço não encontrado ou inválido.");
            return;
        }

        if (!professionalId) {
            alert("Por favor, informe o ID do profissional.");
            return;
        }

        try {
            const response = await this.fetchWithAuth(
                `http://localhost:8080/api/services/${serviceId}/vincularProfissional/${professionalId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                alert(`Erro ao vincular o profissional: ${errorMessage}`);
                return;
            }

            alert("Solicitação enviada ao profissional. Aguarde a aceitação.");
        } catch (error) {
            console.error("Erro ao vincular profissional:", error);
            alert("Erro ao vincular o profissional. Por favor, tente novamente.");
        }
    }

    async fetchWithAuth(url, options = {}) {
        if (!this.token) {
            alert("Você não está autenticado. Por favor, faça login.");
            throw new Error("Usuário não autenticado");
        }

        const headers = {
            "Authorization": `Bearer ${this.token}`,
            ...options.headers,
        };

        return fetch(url, { ...options, headers });
    }
}

// Instancia a classe ProfessionalServiceManager assim que a página for carregada
const professionalServiceManager = new ProfessionalServiceManager();


// Função para cancelar e redirecionar para a página anterior
function cancelEdit() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}

function voltar() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}
