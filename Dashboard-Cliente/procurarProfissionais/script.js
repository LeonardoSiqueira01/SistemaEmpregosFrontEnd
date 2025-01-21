function cancelEdit() {
    window.location.href = "../index.html";
}

// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
  }
  
  // Função para verificar o tipo de usuário
  function isUserClient() {
    const userType = localStorage.getItem("userType");
    return userType === "CLIENT"; // Verifica se o tipo de usuário é 'CLIENT'
  }

document.addEventListener("DOMContentLoaded", () => {
    const searchProfessionalsLink = document.getElementById("search-professionals");
    const serviceListContainer = document.getElementById("service-list-container");
    const serviceList = document.getElementById("service-list");
    const token = getAuthToken(); // Substitua com o token correto ou obtenha de outra forma.

    searchProfessionalsLink.addEventListener("click", async (event) => {
        event.preventDefault(); // Evita o comportamento padrão do link.

        // Oculta outras seções e exibe o contêiner de resultados
        serviceListContainer.style.display = "block";
        serviceList.innerHTML = ""; // Limpa a lista

        try {
            // Faz a requisição para buscar profissionais
            const response = await fetch("http://localhost:8080/api/client", {
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
                    listItem.classList.add("service-item"); // Adiciona a classe de estilo do cartão de serviço

                    // Criação do conteúdo formatado com divs para cada campo
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
                        <hr>
                    `;

                    // Adiciona o item à lista
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


document.addEventListener("DOMContentLoaded", () => {
    // Supondo que você tenha uma função que recupera os dados do cliente
    const clientName = "João Silva"; // Exemplo de nome
    const requestedServices = 5;
    const completedServices = 3;
    const averageRating = 4.2;

    // Preenche as informações no HTML
    document.getElementById("client-name").textContent = clientName;
    document.getElementById("requested-services").textContent = requestedServices;
    document.getElementById("completed-services").textContent = completedServices;
    document.getElementById("average-rating").textContent = averageRating;
});
