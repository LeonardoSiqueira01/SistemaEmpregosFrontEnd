async function assignProfessionalToService(serviceId) {
    const professionalId = document.getElementById("professional-id").value;

    if (!professionalId) {
        alert("Por favor, informe o ID do profissional.");
        return;
    }

    try {
        // Faz a requisição ao backend
        const response = await fetchWithAuth(
            `http://localhost:8080/api/services/${serviceId}/vincularProfissional/${professionalId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text(); // Detalha o erro recebido
            alert(`Erro ao vincular o profissional: ${errorMessage}`);
            return;
        }

        // Exibe mensagem de sucesso
        const confirmationMessage = document.getElementById("confirmation-message");
        confirmationMessage.style.display = "block";
        confirmationMessage.innerText = "Solicitação enviada ao profissional. Aguarde a aceitação.";
    } catch (error) {
        console.error("Erro ao vincular profissional:", error);
        alert("Erro ao vincular o profissional. Por favor, tente novamente.");
    }
}

document.getElementById("assign-professional-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita envio padrão do formulário

    const serviceId = new URLSearchParams(window.location.search).get("serviceId");
    if (!serviceId || isNaN(serviceId)) {
        alert("ID do serviço não encontrado ou inválido.");
        return;
    }

    assignProfessionalToService(serviceId); // Chama a função para vincular o profissional
});


async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Você não está autenticado. Por favor, faça login.");
        throw new Error("Usuário não autenticado");
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
}


// Função para cancelar e redirecionar para a página anterior
function cancelEdit() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}

function voltar() {
    window.location.href = "../index.html"; // Redireciona para a página inicial ou lista de serviços
}
