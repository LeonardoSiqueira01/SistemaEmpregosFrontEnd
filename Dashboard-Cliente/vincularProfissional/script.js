class ProfessionalServiceManager {
    constructor() {
        this.token = localStorage.getItem("authToken");
        this.serviceListContainer = document.getElementById("service-list-container");
        this.serviceList = document.getElementById("service-list");

        document.addEventListener("DOMContentLoaded", () => {
            this.fetchProfessionals();
        });

        document.getElementById("specialty-services").addEventListener("click", () => {
            const specialtyContainer = document.getElementById("specialty-container");
            specialtyContainer.style.display = specialtyContainer.style.display === "none" || specialtyContainer.style.display === "" ? "block" : "none";
        });

        document.getElementById("specialty").addEventListener("change", () => this.fetchProfessionals());
        document.getElementById("city").addEventListener("input", () => this.fetchProfessionals());
    }

    async fetchProfessionals() {
        this.serviceListContainer.style.display = "block";
        this.serviceList.innerHTML = "";
    
        try {
            let url = "http://localhost:8080/api/client";  // Certifique-se de que a URL está correta para o seu backend
            const specialty = document.getElementById("specialty").value;
            const cityInput = document.getElementById("city");
            const city = cityInput && cityInput.value ? cityInput.value.trim() : ""; // Certifique-se de que 'city' não seja undefined
            const estadoElement = document.getElementById("estado");
            const estado = estadoElement && estadoElement.value ? estadoElement.value.trim() : ""; // Certifique-se de que 'estado' não seja undefined
    
            let queryParams = [];
            if (specialty) queryParams.push(`specialties=${encodeURIComponent(specialty)}`);
            if (city && estado) queryParams.push(`cidadeEstado=${encodeURIComponent(city + " - " + estado)}`);
            
    
            if (queryParams.length > 0) {
                url += "?" + queryParams.join("&");
            }
    
            const response = await this.fetchWithAuth(url);
    
            if (!response.ok) throw new Error("Erro ao buscar profissionais.");
    
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
                        <p><strong>Especialidades:</strong> ${Array.isArray(professional.specialties) ? professional.specialties.join(", ") : professional.specialties}</p>
                        <p><strong>Localização:</strong> ${professional.location ? professional.location : "Não informado"}</p>
                        <p><strong>Serviços Completos:</strong> ${professional.totalServicesCompleted || 0}</p>
                        <p><strong>Nota Média:</strong> ${professional.averageRating ? professional.averageRating.toFixed(2) : "Sem avaliações"}</p>
                        <div class="availability">
                            <strong>Disponível:</strong>
                            <span class="${professional.available ? 'available' : 'not-available'}"> ${professional.available ? "Sim" : "Não"} </span>
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
            this.serviceList.innerHTML = "<p class='error-message'>Erro ao buscar profissionais. Tente novamente mais tarde.</p>";
        }
    }
    

    viewProfile(email) {
        window.open(`../VisualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
    }

    async assignProfessional(professionalId) {
        const serviceId = new URLSearchParams(window.location.search).get("serviceId");

        if (!serviceId || isNaN(parseInt(serviceId))) {
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
                { method: "PUT", headers: { "Content-Type": "application/json" } }
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
            localStorage.removeItem("authToken");
            window.location.href = "../login.html";
            throw new Error("Usuário não autenticado");
        }

        const headers = {
            "Authorization": `Bearer ${this.token}`,
            ...options.headers,
        };

        return fetch(url, { ...options, headers });
    }
}

const professionalServiceManager = new ProfessionalServiceManager();

document.addEventListener("DOMContentLoaded", async () => {
    const cityInput = document.getElementById("city");
    const suggestionsList = document.getElementById("city-suggestions");
    let allCities = [];
    let debounceTimeout;

    function normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    async function loadCities() {
        try {
            const response = await fetch("http://localhost:8080/api/cities");
            if (!response.ok) throw new Error("Erro ao buscar cidades");
            allCities = await response.json();
        } catch (error) {
            console.error("Erro ao carregar cidades:", error);
        }
    }

    await loadCities();

    cityInput.addEventListener("input", () => {
        const query = normalizeText(cityInput.value.trim());
        if (query.length >= 2) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const filteredCities = allCities.filter(city => normalizeText(city.nome).includes(query));
                displaySuggestions(filteredCities);
            }, 50);
        } else {
            suggestionsList.style.display = "none";
        }
    });

    document.addEventListener("click", (event) => {
        if (suggestionsList && !cityInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = "none";
        }
    });

    function displaySuggestions(cities) {
        suggestionsList.innerHTML = '';
        if (cities.length > 0) {
            suggestionsList.style.display = 'block';
            cities.forEach(city => {
                const listItem = document.createElement('li');
                listItem.textContent = `${city.nome} - ${city.estado}`; // Mostra "Cidade - Estado"

                listItem.addEventListener('click', () => {
                    // Preenche o campo cidade com "Cidade" (sem o estado)
                    cityInput.value = `${city.nome.trim()} - ${city.estado.trim()}`; 

                    // Preenche o estado separadamente
                    document.getElementById("estado").value = city.estado.trim(); 
                    
                    // Exibe o estado ao lado da cidade no campo
                    cityInput.setAttribute('data-state', city.estado.trim());  // Armazena o estado no atributo data-state
                    
                    // Oculta sugestões
                    suggestionsList.innerHTML = "";
                    suggestionsList.style.display = 'none';

                    // Aplica o filtro automaticamente após selecionar a cidade
                    professionalServiceManager.fetchProfessionals();
                });

                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.style.display = 'none';
        }
    }

    // Ocultar a lista de sugestões ao clicar fora
    document.addEventListener("click", (event) => {
        if (!cityInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = "none";
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("apply-filters");

    if (button) {
        button.addEventListener("click", function () {
            const cityInput = document.getElementById("city");

            if (cityInput) {
                console.log("Cidade pesquisada: " + cityInput.value);
            } else {
                console.error("Campo de cidade não encontrado!");
            }
        });
    } else {
        console.error("Botão de filtro não encontrado!");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("apply-filters");

    if (button) {
        button.addEventListener("click", function () {
            const cityInput = document.getElementById("city");
            const specialtyInput = document.getElementById("specialty");

            const cityValue = cityInput ? cityInput.value.trim() : '';
            const specialtyValue = specialtyInput ? specialtyInput.value.trim() : '';

            console.log("Cidade pesquisada: " + cityValue);
            console.log("Especialidade selecionada: " + specialtyValue);

            // Atualizar a consulta para buscar profissionais com base nos filtros
            professionalServiceManager.fetchProfessionals(); // Chama o método de busca de profissionais com os filtros
        });
    } else {
        console.error("Botão de filtro não encontrado!");
    }
});
function cancelEdit() {
    window.location.href = "../index.html";
}