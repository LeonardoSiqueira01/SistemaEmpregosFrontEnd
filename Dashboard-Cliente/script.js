// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para fazer logout
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  window.location.href = "../Login/index.html";
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

  fetchWithAuth("http://localhost:8080/api/services")
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
  // Redireciona ou exibe o formulário de edição com o ID do serviço
  window.location.href = `editService.html?id=${serviceId}`;
}

// Função para cadastrar um novo serviço
function createNewService() {
  window.location.href = "createService.html";
}

// Carregar os serviços ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();
  if (token) {
      listServices(); // Chama a função para listar os serviços se o token estiver presente
  } else {
      alert("Você não está autenticado!");
      window.location.href = "../Login/index.html"; // Redireciona para login se não houver token
  }
});
