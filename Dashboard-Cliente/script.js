// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para verificar o tipo de usuário
function isUserClient() {
  const userType = localStorage.getItem("userType");
  return userType === "CLIENT"; // Verifica se o tipo de usuário é 'CLIENT' (em maiúsculas)
}

// Função para fazer logout
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  window.location.href = "../Login/index.html"; // Redireciona para a página de login
}

// Função para fazer requisições autenticadas
function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };
  }

  return fetch(url, options).then(response => {
    if (response.status === 401) {
      // Redirecionar para login em caso de token inválido
      logout();
    }
    return response.json();
  });
}

// Função para listar os serviços
function listServices() {
  const servicesContainer = document.getElementById("service-list");
  servicesContainer.innerHTML = ''; // Limpa a lista antes de preencher

  fetchWithAuth("http://localhost:8080/api/services/client")
    .then(data => {
      if (data && data.length > 0) {
        data.forEach(service => {
          const listItem = document.createElement("li");
          listItem.textContent = `${service.name} - ${service.address}`;
          const editButton = document.createElement("button");
          editButton.textContent = "Editar";
          editButton.onclick = () => editService(service.id);
          listItem.appendChild(editButton);
          servicesContainer.appendChild(listItem);
        });
      } else {
        servicesContainer.innerHTML = "Nenhum serviço encontrado.";
      }
    })
    .catch(error => {
      console.error("Erro ao listar os serviços:", error);
    });
}

// Função para editar o serviço
function editService(serviceId) {
  window.location.href = `editService.html?id=${serviceId}`;
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

// Carregar os serviços ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  ensureClientAuthenticated(); // Verifica se o cliente está logado

  // Adicionar eventos de clique para os itens do menu
  document.getElementById("list-services").addEventListener("click", function () {
    listServices();
  });

  document.getElementById("create-service").addEventListener("click", function () {
    createNewService();
  });

  document.getElementById("update-service").addEventListener("click", function () {
    window.location.href = "updateService.html";
  });

  document.getElementById("specialty-services").addEventListener("click", function () {
    window.location.href = "specialtyServices.html";
  });

  document.getElementById("logout").addEventListener("click", function () {
    logout();
  });
});
