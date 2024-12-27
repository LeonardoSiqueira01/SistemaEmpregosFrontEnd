// Função para carregar as informações do serviço no formulário
async function loadServiceDetails(serviceId) {
    try {
      const service = await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}`, { method: "GET" });
      document.getElementById("service-name").value = service.name;
      document.getElementById("service-description").value = service.description;
      document.getElementById("service-location").value = service.location;
      document.getElementById("service-specialty").value = service.specialty;
    } catch (error) {
      console.error("Erro ao carregar os detalhes do serviço:", error);
    }
  }
  
  // Função para salvar as alterações no serviço
  async function saveServiceChanges(serviceId) {
    const name = document.getElementById("service-name").value;
    const description = document.getElementById("service-description").value;
    const location = document.getElementById("service-location").value;
    const specialty = document.getElementById("service-specialty").value;
  
    const updatedService = { name, description, location, specialty };
  
    try {
      await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify(updatedService),
      });
      alert("Serviço atualizado com sucesso!");
      window.location.href = "servicesList.html"; // Redireciona para a lista de serviços
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
      alert("Erro ao salvar as alterações. Tente novamente.");
    }
  }
  
  // Função para cancelar a edição e voltar para a lista de serviços
  function cancelEdit() {
    window.location.href = "servicesList.html"; // Redireciona para a lista de serviços
  }
  
  // Configuração do evento para o formulário de edição
  document.getElementById("edit-service-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio do formulário
    const serviceId = new URLSearchParams(window.location.search).get("id");
    saveServiceChanges(serviceId);
  });
  