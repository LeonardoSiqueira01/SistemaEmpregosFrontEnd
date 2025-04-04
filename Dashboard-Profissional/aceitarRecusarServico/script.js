// Estado da aplicação para os filtros
const state = {
    allCities: [],
    selectedCity: "",
    selectedState: "",
    selectedSpecialty: "",
    selectedStatus: "" 
};

// Obtendo elementos da interface
const requestedServiceList = document.getElementById("requested-service-list");
const requestedServiceContainer = document.getElementById("requested-service-list-container");

// Função para obter o e-mail do localStorage
function getEmailFromToken() {
    return localStorage.getItem("email") || null;
}

// Função para carregar serviços solicitados
async function carregarServicosSolicitados() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error('Token de autenticação não encontrado');
            return;
        }

        // Montando a URL com filtros aplicados
        let url = "http://localhost:8080/api/professionals/me";
        const params = [];

        if (state.selectedCity) params.push(`cidadeEstado=${encodeURIComponent(state.selectedCity + " - " + state.selectedState)}`);
        if (state.selectedSpecialty) params.push(`especialidade=${encodeURIComponent(state.selectedSpecialty)}`);
        if (state.selectedStatus) params.push(`status=${encodeURIComponent(state.selectedStatus)}`);
        if (params.length) url += "?" + params.join("&");

        // Realizando a requisição
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro na requisição:', errorMessage);
            alert('Erro ao carregar os serviços: ' + errorMessage);
            return;
        }

        const servicos = await response.json();
        exibirServicos(servicos);
    } catch (error) {
        console.error('Erro ao carregar serviços solicitados:', error);
    }
}

// Função para exibir serviços na tela
function exibirServicos(servicos) {
    requestedServiceList.innerHTML = '';
// Definindo a ordem dos status para a ordenação

    if (servicos.length === 0) {
        requestedServiceList.innerHTML = '<p>Não há serviços solicitados para você.</p>';
        return;
    }
    const statusOrder = {
        "ABERTO": 1,
        "INICIADO": 2,
        "FINALIZADO": 3,
    };
    servicos.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    servicos.forEach(servico => {
        const serviceElement = document.createElement('div');
        serviceElement.classList.add('service-item');

        const statusClasses = {
            "ABERTO": "status-open",
            "INICIADO": "status-started",
            "FINALIZADO": "status-completed",
            "CANCELADO": "status-canceled"
        };
        const statusClass = statusClasses[servico.status] || "";
        const formattedDate = formatarData(servico.serviceDate);
        const formattedStartDate = servico.inicioServico ? formatarData(servico.inicioServico) : null;
        const formattedEndDate = servico.conclusaoServico && servico.status === "FINALIZADO" ? formatarData(servico.conclusaoServico) : "";

        serviceElement.innerHTML = `
            <div class="service-header">
                <h3 class="service-name">${servico.name}</h3>
                <span class="service-status ${statusClass}">${servico.status}</span>
            </div>
            <p><strong>Especialidade:</strong> ${servico.specialty}</p>
            <p><strong>Data de criação do Serviço:</strong> ${formattedDate}</p>
            <p><strong>Descrição:</strong> ${servico.description}</p>
            <p><strong>Localização:</strong> ${servico.location}</p>
            <p><strong>Nome do Cliente:</strong> ${servico.clientName}</p>

            ${formattedStartDate ? `<p><strong>Data de início do serviço:</strong> ${formattedStartDate}</p>` : ""}
            ${formattedEndDate ? `<p><strong>Data de Conclusão do Serviço:</strong> ${formattedEndDate}</p>` : ""}

            ${['INICIADO', 'FINALIZADO', 'CANCELADO'].includes(servico.status) ? '' : `
                <button class="aceitarBtn" data-id="${servico.id}">Aceitar</button>
                <button class="recusarBtn" data-id="${servico.id}">Recusar</button>
            `}
            <button onclick="viewProfile('${servico.clientEmail}')">Visualizar Perfil do Cliente</button>

            ${servico.status === 'FINALIZADO' && servico.ratedClient === 0 ? `
                <button class="avaliarClienteBtn" data-id="${servico.id}">Avaliar Cliente</button>
            ` : ''}
        `;

        requestedServiceList.appendChild(serviceElement);
    });

    requestedServiceContainer.style.display = 'block';

    document.querySelectorAll('.aceitarBtn').forEach(button => {
        button.addEventListener('click', (e) => aceitarServico(e.target.dataset.id));
    });

    document.querySelectorAll('.recusarBtn').forEach(button => {
        button.addEventListener('click', (e) => recusarServico(e.target.dataset.id));
    });

    document.querySelectorAll('.avaliarClienteBtn').forEach(button => {
        button.addEventListener('click', (e) => avaliarCliente(e.target.dataset.id));
    });
}

// Função para formatar datas
function formatarData(dataString) {
    const date = new Date(dataString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Função para visualizar o perfil do cliente
function viewProfile(email) {
    window.open(`http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
}

// Função para aceitar serviço
async function aceitarServico(serviceId) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }

    try {
        const email = getEmailFromToken();
        const response = await fetch(`http://localhost:8080/api/professionals/${email}/services/${serviceId}/accept`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro ao aceitar serviço:', errorMessage);
            alert('Erro ao aceitar o serviço: ' + errorMessage);
            return;
        }

        alert(await response.text());
        carregarServicosSolicitados(); // Atualiza a lista
    } catch (error) {
        console.error('Erro ao aceitar serviço:', error);
    }
}

// Função para recusar serviço
async function recusarServico(serviceId) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }

    try {
        const email = getEmailFromToken();
        const response = await fetch(`http://localhost:8080/api/professionals/${email}/services/${serviceId}/reject`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro ao recusar serviço:', errorMessage);
            alert('Erro ao recusar o serviço: ' + errorMessage);
            return;
        }

        alert(await response.text());
        carregarServicosSolicitados(); // Atualiza a lista
    } catch (error) {
        console.error('Erro ao recusar serviço:', error);
    }
}

// Função para avaliar cliente
function avaliarCliente(serviceId) {
    window.location.href = `../avaliarCliente/index.html?id=${serviceId}`;
}

// Chama a função automaticamente ao carregar a página
window.onload = carregarServicosSolicitados;


document.addEventListener("DOMContentLoaded", async function () {
    const cityInput = document.getElementById("city");
    const suggestionsList = document.getElementById("city-suggestions");
    const specialtySelect = document.getElementById("specialty");
    const filterButton = document.getElementById("apply-filters");
    const statusSelect = document.getElementById("status");


    statusSelect.addEventListener("change", () => {
        state.selectedStatus = statusSelect.value;
    });
    

    if (!localStorage.getItem("authToken")) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "../login/index.html";
        return;
    }

    let debounceTimeout;

    // Função para normalizar texto removendo acentos
    function normalizeText(text) {
        return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    // Função para carregar cidades do backend
    async function loadCities() {
        try {
            const response = await fetch("http://localhost:8080/api/cities");
            if (!response.ok) throw new Error("Erro ao buscar cidades");
            state.allCities = await response.json();
        } catch (error) {
            console.error("Erro ao carregar cidades:", error);
        }
    }

    await loadCities();

    // Atualiza a interface com base no estado
    function updateUI() {
        cityInput.value = state.selectedCity ? `${state.selectedCity} - ${state.selectedState}` : "";
        specialtySelect.value = state.selectedSpecialty;
    }

    // Exibir sugestões de cidades
    function displaySuggestions(cities) {
        suggestionsList.innerHTML = '';
        if (cities.length > 0) {
            suggestionsList.style.display = 'block';
            cities.forEach(city => {
                const listItem = document.createElement('li');
                listItem.textContent = `${city.nome} - ${city.estado}`;
                listItem.addEventListener('click', () => {
                    state.selectedCity = city.nome;
                    state.selectedState = city.estado;
                    updateUI();
                    suggestionsList.innerHTML = "";
                    suggestionsList.style.display = 'none';
                    filterButton.click();
                });
                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.style.display = 'none';
        }
    }

    // Evento para capturar entrada no input de cidade
    cityInput.addEventListener('input', () => {
        const query = normalizeText(cityInput.value.trim());
        if (query.length >= 2) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const filteredCities = state.allCities.filter(city =>
                    normalizeText(city.nome).includes(query)
                );
                displaySuggestions(filteredCities);
            }, 200);
        } else {
          // Limpa o estado quando o usuário apagar a cidade
        state.selectedCity = "";
        state.selectedState = "";
        suggestionsList.style.display = 'none';

        // Aplica os filtros novamente para mostrar todos os serviços
        filterButton.click();
        }
    });

    // Atualiza estado ao mudar especialidade
    specialtySelect.addEventListener("change", () => {
        state.selectedSpecialty = specialtySelect.value;
    });

    filterButton.addEventListener("click", carregarServicosSolicitados);

    updateUI();
    await carregarServicosSolicitados();
});
function Voltar() {
    window.location.href = "../index.html";
}

// Chamar a função ao carregar a página
window.onload = carregarServicosSolicitados;