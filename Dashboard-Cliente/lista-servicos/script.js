

// Função para obter o token do localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Função para verificar o tipo de usuário
function isUserClient() {
  const userType = localStorage.getItem("userType");
  return userType === "CLIENT"; // Verifica se o tipo de usuário é 'CLIENT'
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

async function listServices(specialty = '') {
  const servicesContainer = document.getElementById("service-list");
  servicesContainer.innerHTML = ""; // Limpa a lista antes de preencher

  try {
    const token = getAuthToken(); // Obtém o token
    if (!token) {
      throw new Error("Token não encontrado.");
    }

    // Construa a URL com base na especialidade
    let url = "http://localhost:8080/api/services/me";
    if (specialty) {
      url += `?specialty=${encodeURIComponent(specialty)}`; // Adiciona o filtro se houver
    }

    const response = await fetch(url, {
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

const inicioServico = service.inicioServico ? new Date(service.inicioServico) : null;
const formattedStartDate = inicioServico
  ? `${inicioServico.getDate().toString().padStart(2, '0')}/${(inicioServico.getMonth() + 1).toString().padStart(2, '0')}/${inicioServico.getFullYear()}`
  : null;

const conclusaoServico = service.conclusaoServico ? new Date(service.conclusaoServico) : null;
const formattedEndDate = conclusaoServico && service.status === "FINALIZADO"
  ? `${conclusaoServico.getDate().toString().padStart(2, '0')}/${(conclusaoServico.getMonth() + 1).toString().padStart(2, '0')}/${conclusaoServico.getFullYear()}`
  : null;
  serviceElement.innerHTML = `
  <div class="service-header">
    <h3 class="service-name">${service.name}</h3>
    <span class="service-status ${statusClass}">${service.status}</span>
  </div>
  
  <p><strong>Especialidade:</strong> ${service.specialty}</p>
  <p><strong>Data de criação do Serviço:</strong> ${formattedDate}</p>
  <p><strong>Descrição:</strong> ${service.description}</p>
  <p><strong>Localização:</strong> ${service.location}</p>
  
  <!-- Exibe a data de início do serviço se ela existir -->
  ${formattedStartDate ? `<p><strong>Data de início do serviço:</strong> ${formattedStartDate}</p>` : ""}
  
  <!-- Exibe a data de conclusão do serviço se ela existir -->
  ${formattedEndDate ? `<p><strong>Data de Conclusão do Serviço:</strong> ${formattedEndDate}</p>` : ""}
  
  <!-- Exibe as informações do profissional vinculado, caso o serviço não esteja ABERTO ou CANCELADO -->
  ${service.status !== "ABERTO" && service.status !== "CANCELADO" ? `
    <div class="professional-info" style="background-color: #f1f1f1; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <p><strong>Profissional Vinculado:</strong> ${service.professionalName}</p>
      <p><strong>Email:</strong> ${service.professionalEmail}</p>
    </div>
  ` : ""}
  
<!-- Botões de ação -->
<button class="edit-btn" 
        onclick="editService(${service.id})" 
        ${service.status !== 'ABERTO'  ? 'style="display:none;"' : ''}>
    Editar
</button>

  
  <!-- Exibe os botões "Vincular Profissional" e "Excluir" apenas se o serviço for ABERTO -->
  <button class="assign-professional-btn" onclick="assignProfessional(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Vincular Profissional</button>
  <button class="delete-btn" onclick="deleteService(${service.id})" ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>Excluir</button>
<button class="finalizebtn" id="finalizebtn${service.id}" 
            ${service.status !== "INICIADO" ? 'style="display:none"' : ''} 
            onclick="finalizeService(${service.id})">Finalizar Serviço</button>
  <button class="view-requests-btn" 
        onclick="viewProfessionalRequests(${service.id})" 
        ${service.status !== "ABERTO" ? 'style="display:none"' : ''}>
    Ver Solicitações
</button>

  `;

 // Adicionando o evento de clique diretamente após a renderização
 const finalizeButton = document.getElementById(`finalizebtn${service.id}`);
 if (finalizeButton) {
   finalizeButton.addEventListener('click', function() {
     // Redireciona para o formulário de finalização
     window.location.href = `/finalizar-servico?id=${service.id}`;
   });
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
  window.location.href = "../vincularProfissional/index.html?serviceId=" + serviceId;
}


function editService(serviceId) {
  // Corrigir caminho relativo para a página de edição de serviço
  //window.location.href = "../Dashboard-Cliente/edit-service-container/index.html?id=" + serviceId;
  window.location.href = "../edit-service-container/index.html?id=" + serviceId;

}

function finalizeService(serviceId) {
  window.location.href = "../avaliarProfissional/index.html?id=" + serviceId;  // Corrigido para chamar o caminho de avaliação
}

function viewProfessionalRequests(serviceId) {
  // Redireciona para a nova tela onde os profissionais solicitantes serão listados
  window.location.href = "RequisicoesProfissionais/index.html?serviceId=" + serviceId;
}

// Função para garantir que o cliente está logado
function ensureClientAuthenticated() {
  const token = getAuthToken();
  if (!token || !isUserClient()) {
    alert("Você precisa estar logado como Cliente para acessar este conteúdo.");
    window.location.href = "../Login/index.html"; // Redireciona para login se não houver token ou se não for Cliente
  }
}
  document.addEventListener("DOMContentLoaded", function () {
    ensureClientAuthenticated(); // Verifica se o cliente está logado
  
    // Carregar serviços automaticamente ao carregar a página
    listServices(); // Chama a função para listar os serviços assim que a página for carregada
    
    // Evento para o botão "Listar Serviços"
    document.getElementById("list-services").addEventListener("click", function () {
      // Resetar a seleção do filtro
      document.getElementById("specialty").value = ""; // Reseta para "Selecione uma especialidade"
      
      // Ocultar o container de especialidades
      document.getElementById("specialty-container").style.display = "none";
      
      // Carregar serviços ao clicar no botão "Listar Serviços"
      listServices(); // Chama novamente a função para listar os serviços
  });
  
  document.getElementById("specialty-services").addEventListener("click", function () {
    const specialtyContainer = document.getElementById("specialty-container");

    // Alternar a visibilidade do container de especialidade
    if (specialtyContainer.style.display === "none" || specialtyContainer.style.display === "") {
      specialtyContainer.style.display = "block"; // Exibe o filtro de especialidades
    } else {
      specialtyContainer.style.display = "none"; // Oculta o filtro
    }
  });
  

  // Evento para o botão de filtro
  document.getElementById("filter-btn").addEventListener("click", function () {
    const specialty = document.getElementById("specialty").value;
    // Se uma especialidade for selecionada, passa ela como parâmetro
    listServices(specialty); // Atualiza a listagem de serviços com o filtro
  });
});

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

// Função para cancelar edição e voltar à página principal
function cancelEdit() {
  window.location.href = "../index.html";
}

// Função para finalizar o serviço e enviar a avaliação
document.getElementById('finalizarForm').addEventListener('submit', function(event) {
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
      'Authorization': 'Bearer ' + localStorage.getItem('authToken') // Token JWT
    },
    body: JSON.stringify(clienteRating)
  })
  .then(response => response.json())
  .then(data => {
    if (data) {
      document.getElementById('responseMessage').textContent = 'Serviço finalizado com sucesso!';
    } else {
      document.getElementById('responseMessage').textContent = 'Erro ao finalizar o serviço.';
    }
  })
  .catch(error => {
    document.getElementById('responseMessage').textContent = 'Erro de comunicação com o servidor.';
  });
});
