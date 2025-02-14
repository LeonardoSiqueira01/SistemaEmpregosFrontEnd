function formatCEP(cep) {
  // Remove todos os caracteres não numéricos
  cep = cep.replace(/\D/g, '');

  // Adiciona o hífen, se necessário
  if (cep.length > 5) {
    cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
  }

  return cep;
}

document.getElementById("service-cep").addEventListener("input", (e) => {
  const cepInput = e.target;
  cepInput.value = formatCEP(cepInput.value);  // Formata o valor do campo enquanto digita
});

async function loadServiceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');

  if (!serviceId) {
    console.error("Service ID não encontrado na URL.");
    alert("ID do serviço não encontrado na URL.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token não encontrado. Faça login novamente.");
    }

    const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
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

    const service = await response.json();

    // Preenche os campos do formulário com os dados do serviço
    document.getElementById("service-name").value = service.name || '';
    document.getElementById("service-description").value = service.description || '';
    document.getElementById("service-specialty").value = service.specialty || '';
    
    // Se já tiver um endereço atribuído, exibe no campo de localização
    if (service.location) {
      document.getElementById("service-location").value = service.location;
    }

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

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  if (!serviceId) {
    console.error("Service ID não encontrado na URL.");
    alert("ID do serviço não encontrado na URL.");
    return;
  }
  
  document.getElementById("edit-service-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveServiceChanges(serviceId);  
  });
});

function cancelEdit() {
  // Redireciona para a página de lista de serviços (ou página anterior)
    window.location.href = "../index.html";
}

async function fetchAddress() {
  let cep = document.getElementById("service-cep").value.replace(/\D/g, ''); // Remove o hífen, se houver

  if (cep.length !== 8) {
    alert("Por favor, insira um CEP válido com 8 dígitos.");
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error("Erro ao buscar o endereço.");
    }

    const addressData = await response.json();

    if (addressData.erro) {
      alert("CEP não encontrado.");
      return;
    }

    // Preenche o campo de localização com os dados recebidos
    document.getElementById("service-location").value = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;

  } catch (error) {
    console.error("Erro ao buscar o endereço:", error);
    alert("Erro ao buscar o endereço. Tente novamente.");
  }
}