async function assignProfessionalToService(serviceId) {
    const professionalId = document.getElementById("professional-id").value;

    if (!professionalId) {
        alert("Por favor, informe o ID do profissional.");
        return;
    }

    try {
        // Faz a requisição ao backend
        const response = await fetchWithAuth(
            `http://localhost:8080/api/services/${serviceId}/vincularProfissional/${professionalId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text(); // Detalha o erro recebido
            alert(`Erro ao vincular o profissional: ${errorMessage}`);
            return;
        }

        // Exibe mensagem de sucesso
        const confirmationMessage = document.getElementById("confirmation-message");
        confirmationMessage.style.display = "block";
        confirmationMessage.innerText = "Solicitação enviada ao profissional. Aguarde a aceitação.";
    } catch (error) {
        console.error("Erro ao vincular profissional:", error);
        alert("Erro ao vincular o profissional. Por favor, tente novamente.");
    }
}

document.getElementById("assign-professional-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita envio padrão do formulário

    const serviceId = new URLSearchParams(window.location.search).get("serviceId");
    if (!serviceId || isNaN(serviceId)) {
        alert("ID do serviço não encontrado ou inválido.");
        return;
    }

    assignProfessionalToService(serviceId); // Chama a função para vincular o profissional
});


async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Você não está autenticado. Por favor, faça login.");
        throw new Error("Usuário não autenticado");
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
}


// Função para cancelar e redirecionar para a página anterior
function cancelEdit() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}

function voltar() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}


                document.addEventListener("DOMContentLoaded", () => {
                    const searchProfessionalsLink = document.getElementById("search-professionals");
                    const serviceListContainer = document.getElementById("service-list-container");
                    const serviceList = document.getElementById("service-list");
                    const token = localStorage.getItem("authToken");
                
                    searchProfessionalsLink.addEventListener("click", async (event) => {
                        event.preventDefault();
                
                        serviceListContainer.style.display = "block";
                        serviceList.innerHTML = "";
                
                        try {
                            const response = await fetch("http://localhost:8080/api/client", {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
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
                                        <button class="assign-button" onclick="assignProfessional('${professional.id}')">Vincular Profissional</button>
                                        <button onclick="viewProfile('${professional.email}')">Visualizar Perfil</button>

                                        `;
                
                                    serviceList.appendChild(listItem);
                                });
                            } else {
                                serviceList.innerHTML = "<p>Nenhum profissional encontrado.</p>";
                            }
                        } catch (error) {
                            console.error(error);
                            serviceList.innerHTML = "<p>Erro ao buscar profissionais. Tente novamente mais tarde.</p>";
                        }
                    });
                });
                function viewProfile(email) {
                    window.open(`../VisualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
                  }
                async function assignProfessional(professionalId) {
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
                        const response = await fetchWithAuth(
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
                