document.getElementById("logout").addEventListener("click", logout);


document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("service-list");
    const filterButton = document.getElementById("apply-filters");
    const cepButton = document.getElementById("search-cep");

    // Função para buscar endereço pelo CEP
    const fetchAddressByCEP = async (cep) => {
        const cepInput = cep.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cepInput.length !== 8) {
            alert("Digite um CEP válido com 8 dígitos.");
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepInput}/json/`);
            if (!response.ok) throw new Error("Erro ao buscar endereço.");
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            // Preencher os campos com os dados do endereço
            document.getElementById("city").value = data.localidade || "";
            document.getElementById("logradouro").textContent = data.logradouro || "N/A";
            document.getElementById("bairro").textContent = data.bairro || "N/A";
            document.getElementById("estado").textContent = data.uf || "N/A";
            document.getElementById("address-info").style.display = "block";
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar o endereço. Tente novamente.");
        }
    };

    // Adicionar evento ao botão de busca por CEP
    cepButton.addEventListener("click", () => {
        const cep = document.getElementById("cep").value;
        fetchAddressByCEP(cep);
    });

    // Função para buscar serviços com base em filtros (cidade e estado)
    const fetchServices = async (filters = {}) => {
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Token não encontrado.");
    
            const url = new URL("http://localhost:8080/api/services");
    
            if (filters.cidade) url.searchParams.append("cidades", filters.cidade); // Corrigir parâmetro para "cidades"
            if (filters.especialidade) url.searchParams.append("especialidade", filters.especialidade);
    
            let response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            let services = await response.json();
            console.log("Resposta da API:", services); // Exibir a resposta da API
    
            renderServices(services);
        } catch (error) {
            console.error("Erro ao buscar serviços:", error);
            serviceList.innerHTML = "<p>Erro ao carregar os serviços. Tente novamente mais tarde.</p>";
        }
    };
    
    // Renderizar lista de serviços
    const renderServices = (services) => {
        serviceList.innerHTML = "";
        if (services.length === 0) {
            serviceList.innerHTML = "<p>Nenhum serviço encontrado.</p>";
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

            serviceElement.innerHTML = `
                <div class="service-header">
                    <h3 class="service-name">${service.name}</h3>
                    <span class="service-status ${statusClass}">${service.status}</span>
                </div>
                <p><strong>Especialidade:</strong> ${service.specialty}</p>
                <p><strong>Data do Serviço:</strong> ${formattedDate}</p>
                <p><strong>Descrição:</strong> ${service.description}</p>
                <p><strong>Localização:</strong> ${service.location}</p>
            `;
            serviceList.appendChild(serviceElement);
        });
    };

    filterButton.addEventListener("click", async () => {
        try {
            const cidade = document.getElementById("city").value.trim();
            const especialidade = document.getElementById("specialty").value.trim();
    
            console.log("Filtros de busca:", { cidade, especialidade });
    
            fetchServices({ cidade, especialidade });
        } catch (error) {
            console.error(error);
            alert("Erro ao aplicar filtros. Tente novamente.");
        }
    });

    fetchServices(); // Carregar serviços ao carregar a página
});

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html";}


