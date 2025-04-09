// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para verificar o tipo de usuário
function isUserClient() {
  return localStorage.getItem("userType") === "CLIENT";
}

// Função para requisições autenticadas
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    logout();
    throw new Error("Usuário não autenticado. Redirecionando para login.");
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) logout();
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }
  return response.json();
}

// Listagem dos serviços com filtros
async function listServices(specialty = '', cidadeEstado = '', status = '') {
  const servicesContainer = document.getElementById("service-list");
  servicesContainer.innerHTML = "";

  try {
    const token = getAuthToken();
    if (!token) throw new Error("Token não encontrado.");

    let url = "http://localhost:8080/api/services/me";
    const params = new URLSearchParams();

    if (specialty) params.append("specialty", specialty);
    if (cidadeEstado) params.append("cidadeEstado", cidadeEstado);
    if (status) params.append("status", status);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetchWithAuth(url);

    if (response.length === 0) {
      servicesContainer.innerHTML = "<p class='no-services-message'>Nenhum serviço encontrado.</p>";
      return;
    }

    response.forEach(service => {
      const serviceElement = document.createElement("div");
      serviceElement.classList.add("service-item");

      const statusClassMap = {
        "ABERTO": "status-open",
        "INICIADO": "status-started",
        "FINALIZADO": "status-completed",
        "CANCELADO": "status-canceled"
      };

      const formatDate = dateStr => {
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      };

      const formattedDate = formatDate(service.serviceDate);
      const formattedStartDate = service.inicioServico ? formatDate(service.inicioServico) : null;
      const formattedEndDate = service.conclusaoServico && service.status === "FINALIZADO" ? formatDate(service.conclusaoServico) : null;

      serviceElement.innerHTML = `
        <div class="service-header">
          <h3 class="service-name">${service.name}</h3>
          <span class="service-status ${statusClassMap[service.status] || ''}">${service.status}</span>
        </div>
        <p><strong>Especialidade:</strong> ${service.specialty}</p>
        <p><strong>Data de criação do Serviço:</strong> ${formattedDate}</p>
        <p><strong>Descrição:</strong> ${service.description}</p>
        <p><strong>Localização:</strong> ${service.location}</p>
        ${formattedStartDate ? `<p><strong>Data de Início:</strong> ${formattedStartDate}</p>` : ""}
        ${formattedEndDate ? `<p><strong>Data de Conclusão:</strong> ${formattedEndDate}</p>` : ""}
        ${service.imageUrl ? `
          <div class="image-preview">
            <button onclick="window.open('${service.imageUrl}', '_blank')">Visualizar Imagem</button>
          </div>` : ""}
        ${service.status !== "ABERTO" && service.status !== "CANCELADO" ? `
          <div class="professional-info">
            <p><strong>Profissional Vinculado:</strong> ${service.professionalName}</p>
            <p><strong>Email:</strong> ${service.professionalEmail}</p>
            <button onclick="viewProfile('${service.professionalEmail}')">Visualizar Perfil</button>
          </div>` : ""}
        <div class="actions">
          <button class="edit-btn" onclick="editService(${service.id})" ${service.status !== 'ABERTO' ? 'style="display:none;"' : ''}>Editar</button>
          <button class="assign-professional-btn" onclick="assignProfessional(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Vincular Profissional</button>
          <button class="delete-btn" onclick="deleteService(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Excluir</button>
          <button class="finalizebtn" id="finalizebtn${service.id}" ${service.status !== "INICIADO" ? 'style="display:none"' : ''}>Finalizar Serviço</button>
          <button class="view-requests-btn" onclick="viewProfessionalRequests(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Ver Solicitações</button>
        </div>
      `;

      servicesContainer.appendChild(serviceElement);

      const finalizeButton = document.getElementById(`finalizebtn${service.id}`);
      if (finalizeButton) {
        finalizeButton.addEventListener('click', function() {
          window.location.href = `../avaliarProfissional/index.html?id=${service.id}`;
        });
      }
      
    });
  } catch (error) {
    console.error("Erro ao listar os serviços:", error);
    servicesContainer.innerHTML = "<p>Erro ao carregar os serviços. Tente novamente mais tarde.</p>";
  }
}


// Demais funções utilitárias

function assignProfessional(serviceId) {
  window.location.href = `../vincularProfissional/index.html?serviceId=${serviceId}`;
}

function editService(serviceId) {
  window.location.href = `../edit-service-container/index.html?id=${serviceId}`;
}

function finalizeService(serviceId) {
  window.location.href = "../avaliarProfissional/index.html?id=" + serviceId;  // Corrigido para chamar o caminho de avaliação
}

function viewProfessionalRequests(serviceId) {
  window.location.href = `RequisicoesProfissionais/index.html?serviceId=${serviceId}`;
}

function viewProfile(email) {
  window.open(`../VisualizarPerfis/index.html?email=${encodeURIComponent(email)}`, '_blank');
}

function ensureClientAuthenticated() {
  if (!getAuthToken() || !isUserClient()) {
    alert("Você precisa estar logado como Cliente para acessar este conteúdo.");
    window.location.href = "../Login/index.html";
  }
}

async function deleteService(serviceId) {
  if (!confirm("Tem certeza de que deseja excluir este serviço?")) return;

  try {
    await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}`, {
      method: "DELETE"
    });
    alert("Serviço excluído com sucesso.");
    listServices();
  } catch (error) {
    console.error("Erro ao excluir o serviço:", error);
    alert("Erro ao excluir o serviço. Tente novamente mais tarde.");
  }
}

function cancelEdit() {
  window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  ensureClientAuthenticated();
  await listServices(); // Coloque await se quiser esperar antes de continuar

  const listBtn = document.getElementById("list-services");
  const specialtyBtn = document.getElementById("specialty-services");
  const filterBtn = document.getElementById("filter-btn");
  const cityInput = document.getElementById("city");
  const suggestionsList = document.getElementById("city-suggestions");
  const estadoInput = document.getElementById("estado"); // novo input para o estado, se não existir crie

  // Load cities uma vez
  let allCities = [];

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

  cityInput?.addEventListener("input", () => {
    console.log("Digitando cidade:", cityInput.value); // ADICIONE ISSO

    const query = normalizeText(cityInput.value.trim());
    suggestionsList.innerHTML = "";

    if (query.length < 2) {
      suggestionsList.style.display = "none";
      return;
    }

    const filteredCities = allCities.filter(city =>
      normalizeText(city.nome).includes(query)
    );

    if (filteredCities.length === 0) {
      suggestionsList.style.display = "none";
      return;
    }

    suggestionsList.style.display = "block";
    filteredCities.forEach(city => {
      const li = document.createElement("li");
      li.textContent = `${city.nome} - ${city.estado}`;
      li.addEventListener("click", () => {
        cityInput.value = `${city.nome} - ${city.estado}`;
        estadoInput.value = city.estado; // Se o input existe
        cityInput.setAttribute("data-state", city.estado);
        suggestionsList.innerHTML = "";
        suggestionsList.style.display = "none";
      });
      suggestionsList.appendChild(li);
    });
  });

  document.addEventListener("click", (event) => {
    if (!cityInput.contains(event.target) && !suggestionsList.contains(event.target)) {
      suggestionsList.style.display = "none";
    }
  });

  listBtn?.addEventListener("click", () => {
    document.getElementById("specialty").value = "";
    document.getElementById("specialty-container").style.display = "none";
    listServices();
  });

  specialtyBtn?.addEventListener("click", () => {
    const specialtyContainer = document.getElementById("specialty-container");
    specialtyContainer.style.display = specialtyContainer.style.display === "block" ? "none" : "block";
  });

  filterBtn?.addEventListener("click", () => {
    const specialty = document.getElementById("specialty").value;
    const city = document.getElementById("city").value;
    const status = document.getElementById("status").value;
    listServices(specialty, city, status);
  });
});


// Envio da avaliação
const finalizeForm = document.getElementById('finalizarForm');
if (finalizeForm) {
  finalizeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const serviceId = document.getElementById('serviceId').value;
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    const clienteRating = {
      rating: parseFloat(rating),
      comment: comment
    };

    fetch(`http://localhost:8080/api/services/${serviceId}/finalizar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
      },
      body: JSON.stringify(clienteRating)
    })
    .then(res => res.json())
    .then(data => {
      const message = document.getElementById('responseMessage');
      message.textContent = data ? 'Serviço finalizado com sucesso!' : 'Erro ao finalizar o serviço.';
    })
    .catch(() => {
      document.getElementById('responseMessage').textContent = 'Erro de comunicação com o servidor.';
    });
  });
}
