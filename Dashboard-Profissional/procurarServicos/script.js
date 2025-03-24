function viewProfile(email) {
    window.open('http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=' + encodeURIComponent(email), '_blank');
}

document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("service-list");
    const filterButton = document.getElementById("apply-filters");
    const cepButton = document.getElementById("search-cep");
    function getProfessionalEmail() {
        return localStorage.getItem("email"); // Ajuste conforme onde armazena o email
    }


    function getAuthToken() {
        return localStorage.getItem("authToken");
    }
    
    
  

 
    // Função para buscar serviços com base em filtros (cidade e estado)
    const fetchServices = async (filters = {}) => {
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Token não encontrado.");
    
            const url = new URL("http://localhost:8080/api/services");
    
            if (filters.cidade) url.searchParams.append("cidade", filters.cidade);
            console.log("URL gerada:", url.toString());

            if (filters.especialidade) url.searchParams.append("especialidade", filters.especialidade);
    
            let response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            let services = await response.json();
    
            // Logando a cidade pesquisada e o número de serviços encontrados
            console.log(`Cidade pesquisada: ${filters.cidade || "Nenhuma"}`);
            console.log(`Serviços encontrados: ${services.length}`);
    
            renderServices(services);
        } catch (error) {
            console.error("Erro ao buscar serviços:", error);
            serviceList.innerHTML = "<p>Erro ao carregar os serviços. Tente novamente mais tarde.</p>";
        }
    };
    
    
    const renderServices = (services) => {
        serviceList.innerHTML = "";
        if (services.length === 0) {
            serviceList.innerHTML = "<p style='margin-top: 20px;'>Nenhum serviço encontrado.</p>";
            return;
        }
        services.forEach(service => {
            const serviceElement = document.createElement("div");
            serviceElement.classList.add("service-item");
    
            // Determinar a cor do status
            const statusClasses = {
                "ABERTO": "status-open",
                "INICIADO": "status-started",
                "FINALIZADO": "status-completed",
                "CANCELADO": "status-canceled"
            };
            const statusClass = statusClasses[service.status] || "";
    
            const date = new Date(service.serviceDate);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
            // Adicionando HTML para renderizar o serviço
            serviceElement.innerHTML = `
                <div class="service-header">
                    <h3 class="service-name">${service.name}</h3>
                    <span class="service-status ${statusClass}">${service.status}</span>
                </div>
                <p><strong>Especialidade:</strong> ${service.specialty}</p>
                <p><strong>Data do Serviço:</strong> ${formattedDate}</p>
                <p><strong>Descrição:</strong> ${service.description}</p>
                <p><strong>Localização:</strong> ${service.location}</p>
                 <div class="client-info-container">
                  <p> <strong>Nome do Cliente:</strong> ${service.clientName} </p>
                <p> <strong>Email do Cliente:</strong> ${service.clientEmail}</p> </div>
                <button class="request-link" data-service-id="${service.id}">Solicitar Vínculo</button>
                <button onclick="viewProfile('${service.clientEmail}')">Visualizar Perfil do Cliente</button>  <!-- Sempre visível -->

            `;
            serviceList.appendChild(serviceElement);
        });
       
        // Adiciona evento para o botão "Solicitar Vínculo"
        document.querySelectorAll('.request-link').forEach(button => {
            button.addEventListener('click', async (event) => {
                const serviceId = event.target.getAttribute('data-service-id');
                const professionalEmail = getProfessionalEmail(); // Método para pegar o email do profissional (a ser implementado)
                const encodedEmail = encodeURIComponent(professionalEmail);

                try {
                    const response = await fetch(`http://localhost:8080/api/services/${encodedEmail}/solicitar/${serviceId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error("Erro ao solicitar o vínculo.");
                    }
    
                    const data = await response.json();
                    alert("Solicitação de vínculo enviada com sucesso.");
                } catch (error) {
                    console.error(error);
                    alert("Você já esta realizando um serviço. Não pode iniciar outro sem finalizar o anterior!");
                }
            });
        });
    };
    

    filterButton.addEventListener("click", async () => {
        try {
            const cidade = document.getElementById("city").value.trim() || null;
            const especialidade = document.getElementById("specialty").value;  // Agora pega o valor do select
            console.log("Cidade selecionada:", cidade);

            console.log("Filtros de busca:", { cidade, especialidade });
        
            fetchServices({ cidade, especialidade });  // Envia a especialidade selecionada
        } catch (error) {
            console.error(error);
            alert("Erro ao aplicar filtros. Tente novamente.");
        }
    });
    

    fetchServices(); // Carregar serviços ao carregar a página
});



document.addEventListener('DOMContentLoaded', async () => {
    const cityInput = document.getElementById('city');
    const suggestionsList = document.getElementById('city-suggestions');
    let allCities = [];
    let debounceTimeout;

    // Função para remover acentos e normalizar strings
    function normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // Função para carregar as cidades do backend
    async function loadCities() {
        try {
            const response = await fetch("http://localhost:8080/api/cities");
            if (!response.ok) throw new Error("Erro ao buscar cidades");

            allCities = await response.json(); 
        } catch (error) {
            console.error("Erro ao carregar cidades:", error);
        }
    }

    await loadCities(); // Carrega as cidades ao iniciar a página

    // Evento de input para buscar cidades
    cityInput.addEventListener('input', () => {
        const query = normalizeText(cityInput.value.trim());

        if (query.length >= 2) { 
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const filteredCities = allCities.filter(city => 
                    normalizeText(city.nome).includes(query)
                );
                displaySuggestions(filteredCities);
            }, 50);
        } else {
            suggestionsList.style.display = 'none';
        }
    });

    // Função para exibir sugestões
    function displaySuggestions(cities) {
        suggestionsList.innerHTML = '';
    
        if (cities.length > 0) {
            suggestionsList.style.display = 'block';
            cities.forEach(city => {
                const listItem = document.createElement('li');
                listItem.textContent = `${city.nome} - ${city.estado}`; // Mostra "Cidade - UF"
    
                listItem.addEventListener('click', () => {
                    cityInput.value = city.nome.trim(); // Preenche apenas a cidade no input
                    document.getElementById("estado").value = city.estado.trim(); // Preenche o estado no campo correto
                    suggestionsList.innerHTML = "";
                    suggestionsList.style.display = 'none';
                    document.getElementById("apply-filters").click(); // Aplica automaticamente o filtro
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
