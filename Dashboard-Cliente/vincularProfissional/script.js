// Função para vincular profissional ao serviço
async function assignProfessionalToService(serviceId) {
    const professionalId = document.getElementById("professional-id").value;

    if (!professionalId) {
        alert("Por favor, informe o ID do profissional.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Você não está autenticado. Por favor, faça login.");
        return;
    }

    try {
        // Realiza a requisição ao back-end
        const response = await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}/vincularProfissional/${professionalId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text(); // Obter mensagem de erro detalhada
            alert(`Erro ao vincular o profissional: ${errorMessage}`);
            return;
        }

        // Exibe mensagem de sucesso
        document.getElementById("confirmation-message").style.display = "block";
        document.getElementById("confirmation-message").innerText =
            "Solicitação enviada ao profissional. Aguarde a aceitação.";

    } catch (error) {
        console.error("Erro ao vincular profissional:", error);
        alert("Erro ao vincular o profissional. Por favor, tente novamente.");
    }
}

// Listener para o formulário
document.getElementById("assign-professional-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Obtém o ID do serviço da URL
    const serviceId = new URLSearchParams(window.location.search).get("serviceId");
    if (!serviceId || isNaN(serviceId)) {
        alert("ID do serviço não encontrado ou inválido.");
        return;
    }

    // Chama a função para vincular o profissional
    assignProfessionalToService(serviceId);
});

// Função para realizar requisição com autenticação
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("authToken"); // Token armazenado no localStorage

    if (!token) {
        alert("Você não está autenticado. Por favor, faça login.");
        return;
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        ...options.headers, // Inclui outros headers, se houver
    };

    const response = await fetch(url, {
        ...options,
        headers: headers,
    });

    return response;
}

// Função para cancelar e redirecionar para a página anterior
function cancelEdit() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}
