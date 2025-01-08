// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para verificar o tipo de usuário
function isUserClient() {
  const userType = localStorage.getItem("userType");
  return userType === "CLIENT"; // Verifica se o tipo de usuário é 'CLIENT'
}

// Função para fazer logout
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  window.location.href = "../Login/index.html"; // Redireciona para a página de login
}

// Função para fazer requisições autenticadas
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    logout();
    throw new Error("Usuário não autenticado. Redirecionando para login.");
  }

  const headers = options.headers || {};
  headers["Authorization"] = `Bearer ${token}`;
  headers["Content-Type"] = "application/json";

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }
  return response.json();
}
// Função para excluir um serviço
async function deleteService(serviceId) {
  // Verifica se o usuário confirma a exclusão do serviço
  if (!confirm("Tem certeza de que deseja excluir este serviço?")) {
    return; // Cancela a exclusão se o usuário não confirmar
  }

  try {
    const token = getAuthToken();  // Obtém o token de autenticação do localStorage
    if (!token) {
      throw new Error("Token não encontrado.");
    }

    // Faz a requisição para excluir o serviço usando a função fetchWithAuth
    const response = await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}`, {
      method: "DELETE"
    });

    if (response.success) {
      alert("Serviço excluído com sucesso.");
      listServices(); // Recarrega a lista de serviços após exclusão
    } else {
      alert("Erro ao excluir o serviço.");
    }
  } catch (error) {
    console.error("Erro ao excluir o serviço:", error);
    alert("Erro ao excluir o serviço. Tente novamente mais tarde.");
  }
}


// Função para listar os serviços do cliente logado
async function listServices() {
  const servicesContainer = document.getElementById("service-list");
  servicesContainer.innerHTML = ""; // Limpa a lista antes de preencher

  try {
    const token = getAuthToken(); // Obtém o token
    if (!token) {
      throw new Error("Token não encontrado.");
    }

    const response = await fetch("http://localhost:8080/api/services/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,  // Envia o token no header
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const services = await response.json();

      if (services.length === 0) {
        servicesContainer.innerHTML = "<p>Nenhum serviço encontrado.</p>";
        return;
      }
// Renderizar os serviços na página
services.forEach(service => {
  const serviceElement = document.createElement("div");
  serviceElement.classList.add("service-item");

  // Determinar a cor do status
  let statusClass = '';
  switch(service.status) {
    case 'ABERTO':
      statusClass = 'status-open';
      break;
    case 'INICIADO':
      statusClass = 'status-started';
      break;
    case 'FINALIZADO':
      statusClass = 'status-completed';
      break;
    case 'CANCELADO':
      statusClass = 'status-canceled';
      break;
    default:
      statusClass = '';
  }
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
    <button class="edit-btn" onclick="editService(${service.id})">Editar</button>
    <button class="assign-professional-btn" onclick="assignProfessional(${service.id})">Vincular Profissional</button>
<button class="delete-btn" onclick="deleteService(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Excluir</button>
    `;

function editService(serviceId) {
  // Atualize para o caminho correto para a página de edição
  window.location.href = "..Dashboard-Cliente/edit-service-container/index.html?id=" + serviceId;
}




  servicesContainer.appendChild(serviceElement);
});

    } else {
      throw new Error("Erro ao listar serviços.");
    }
  } catch (error) {
    console.error("Erro ao listar os serviços:", error);
    servicesContainer.innerHTML = "<p>Erro ao carregar os serviços. Tente novamente mais tarde.</p>";
  }
}

function assignProfessional(serviceId) {
  // Corrigir caminho relativo para a página de vinculação de profissional
  window.location.href = "../Dashboard-Cliente/vincularProfissional/index.html?serviceId=" + serviceId;
}


function editService(serviceId) {
  // Corrigir caminho relativo para a página de edição de serviço
  window.location.href = "../Dashboard-Cliente/edit-service-container/index.html?id=" + serviceId;
}

 



// Função para cadastrar um novo serviço
function createNewService() {
  window.location.href = "createServices/createService.html";
}

// Função para garantir que o cliente está logado
function ensureClientAuthenticated() {
  const token = getAuthToken();
  if (!token || !isUserClient()) {
    alert("Você precisa estar logado como Cliente para acessar este conteúdo.");
    window.location.href = "../Login/index.html"; // Redireciona para login se não houver token ou se não for Cliente
  }
}

// Carregar os serviços e configurar eventos ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  ensureClientAuthenticated(); // Verifica se o cliente está logado

  // Carregar serviços ao carregar a página
  listServices();

// Adicionar eventos de clique para os itens do menu
document.getElementById("list-services").addEventListener("click", listServices);
document.getElementById("create-service").addEventListener("click", createNewService);

document.getElementById("specialty-services").addEventListener("click", function () {
  window.location.href = "specialtyServices.html";
});
document.getElementById("logout").addEventListener("click", logout);
});

