// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
}

// Função para garantir que o cliente esteja logado
function ensureClientAuthenticated() {
    const token = getAuthToken();
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "CLIENT") {
        alert("Você precisa estar autenticado como Cliente para acessar esta página.");
        window.location.href = "../Login/index.html"; // Redireciona para login se não houver token ou não for cliente
    }
}

document.addEventListener("DOMContentLoaded", function () {
    ensureClientAuthenticated(); // Verifica se o cliente está logado antes de carregar a página

    // Definir o ID do cliente no campo oculto
    const clientId = localStorage.getItem("userId");
    if (clientId) {
        document.getElementById("client").value = clientId;
    } else {
        alert("ID do cliente não encontrado no localStorage.");
        return; // Impede o restante da execução se o ID não for encontrado
    }

    // Adicionando evento de envio do formulário
    document.getElementById("serviceForm").addEventListener("submit", criarServico);
});

// Função para enviar o formulário de serviço
async function criarServico(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const serviceData = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        serviceDate: document.getElementById("serviceDate").value,
        specialty: document.getElementById("specialty").value,
        location: document.getElementById("location").value,
        client: document.getElementById("client").value, // O ID do cliente
        professional: null, // O profissional será null
        status: "ABERTO" // Ou algum status inicial que você defina
    };

    // Verifique se todos os campos obrigatórios estão preenchidos antes de enviar
    if (!serviceData.name || !serviceData.description || !serviceData.serviceDate || !serviceData.location) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const token = getAuthToken();
    const headers = {
        "Authorization": token,
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch("http://localhost:8080/api/services", { // ou o endereço correto da sua API
            method: "POST",
            headers: headers,
            body: JSON.stringify(serviceData)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar serviço: ' + response.statusText);
        }

        const result = await response.json();
        alert("Serviço criado com sucesso: " + result.id);
    } catch (error) {
        alert("Erro ao criar serviço: " + error.message);
    }
}
