// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para verificar o tipo de usuário
function isUserClient() {
  const userType = localStorage.getItem("userType");
  return userType === "CLIENT"; // Verifica se o tipo de usuário é 'CLIENT'
}

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
function listServices() {
  window.location.href = "../lista-servicos/index.html"; // Redireciona para a página de serviços
}

// Carregar os serviços e configurar eventos ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  ensureClientAuthenticated(); // Verifica se o cliente está logado

// Adicionar eventos de clique para os itens do menu
document.getElementById("list-services").addEventListener("click", listServices);
document.getElementById("create-service").addEventListener("click", createNewService);

document.getElementById("specialty-services").addEventListener("click", function () {
  window.location.href = "specialtyServices.html";
});
document.getElementById("logout").addEventListener("click", logout);
});
  // Verificar se o botão de logout existe antes de adicionar o evento
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

document.addEventListener('DOMContentLoaded', function () {
  const email = localStorage.getItem("email");  // Substitua com o valor real do usuário logado

  // Obtém o resumo do cliente usando fetch com autenticação
  fetchWithAuth(`http://localhost:8080/api/client-summary?email=${email}`)
      .then(data => {

          // Verifica se os dados foram recebidos corretamente
          if (data.name) {  // Alterado de clientName para name
              // Atualiza os elementos com as informações do usuário
              document.getElementById('client-name').textContent = data.name;  // Alterado de clientName para name
              document.getElementById('requested-services').textContent = data.requestedServices;
              document.getElementById('completed-services').textContent = data.completedServices;
              document.getElementById('average-rating').textContent = data.averageRating.toFixed(1);
          } else {
              alert('Erro ao carregar dados do cliente.');
          }
      })
      .catch(error => {
          console.error('Erro ao obter o resumo do cliente:', error);
          alert('Erro ao carregar o resumo do cliente.');
      });
});
