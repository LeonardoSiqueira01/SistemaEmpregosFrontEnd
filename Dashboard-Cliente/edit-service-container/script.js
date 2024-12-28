// Função para carregar os detalhes do serviço no formulário
async function loadServiceDetails() {
  const urlParams = new URLSearchParams(window.location.search); // Recupera os parâmetros da URL
  const serviceId = urlParams.get('id'); // Extrai o valor do parâmetro 'id'
  console.log(serviceId);  // Espera-se que mostre o valor de 'id' da URL

  if (!serviceId) {
    console.error("Service ID não encontrado na URL.");
    alert("ID do serviço não encontrado na URL.");
    return; // Retorna caso o serviceId não seja encontrado
  }

  try {
    const token = localStorage.getItem("authToken"); // Corrigido para a chave correta
    if (!token) {
      throw new Error("Token não encontrado. Faça login novamente.");
    }
    console.log("Token: ", token);  // Verifique se o token é válido
    
    const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // Adiciona o token de autenticação
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("Acesso negado. Verifique se você tem permissões para editar este serviço.");
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message || "Erro ao carregar os dados do serviço"}`);
      }
      throw new Error("Erro ao carregar os detalhes do serviço");
    }

    // Quando a resposta for bem-sucedida, tenta fazer o parse do JSON
    const service = await response.json();

    // Preenche os campos do formulário com os dados do serviço
    document.getElementById("service-name").value = service.name || '';
    document.getElementById("service-description").value = service.description || '';
    document.getElementById("service-location").value = service.location || '';
    document.getElementById("service-specialty").value = service.specialty || '';
  } catch (error) {
    console.error("Erro ao carregar os detalhes do serviço:", error);
    alert("Erro ao carregar os detalhes do serviço. Tente novamente.");
  }
}


// Função para salvar as alterações no serviço
async function saveServiceChanges(serviceId) {
  // Obter os valores do formulário
  const name = document.getElementById("service-name").value;
  const description = document.getElementById("service-description").value;
  const location = document.getElementById("service-location").value;
  const specialty = document.getElementById("service-specialty").value;

  // Criar o objeto de atualização
  const updatedService = { name, description, location, specialty };

  try {
    // Recuperar o token de autenticação do localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Token de autenticação não encontrado. Faça login novamente.");
      return;
    }

    // Fazer a requisição de atualização
    const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedService),
    });

    // Tratar a resposta
    if (!response.ok) {
      const errorMessage = await response.text(); // Lê a mensagem de erro do corpo da resposta
      throw new Error(errorMessage || "Erro ao atualizar o serviço");
    }

    alert("Alteração concluída com sucesso!");

    // Redirecionar para a página anterior ou uma página de sucesso
    window.location.href = "../index.html";
  } catch (error) {
  }}

// Chama a função para carregar os detalhes do serviço ao carregar a página
window.onload = loadServiceDetails;

// Função chamada quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id'); // Pega o ID do serviço da URL
  if (!serviceId) {
    console.error("Service ID não encontrado na URL.");
    alert("ID do serviço não encontrado na URL.");
    return;
  }
  
  // Lidar com o envio do formulário
  document.getElementById("edit-service-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Previne o envio padrão
    saveServiceChanges(serviceId);  // Salva as alterações
  });
});

function cancelEdit() {
  // Redireciona para a página de lista de serviços (ou página anterior)
    window.location.href = "../index.html";
}
