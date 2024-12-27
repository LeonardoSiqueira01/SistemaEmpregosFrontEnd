async function assignProfessionalToService(serviceId) {
    const professionalId = document.getElementById("professional-id").value;

    try {
        const response = await fetchWithAuth(`http://localhost:8080/api/services/${serviceId}/vincularProfissional?professionalId=${professionalId}`, {
            method: "PUT", // Alterado de POST para PUT
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(await response.json());console.log('Professional ID:', professionalId);


        if (response.ok) {
            document.getElementById("confirmation-message").style.display = "block";
            document.getElementById("confirmation-message").innerText = "Profissional recebeu a solicitação de aceitar o serviço. Aguarde mais informações através do seu email e na caixa de mensagens do seu perfil.";
        } else {
            alert("Erro ao vincular o profissional. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao vincular profissional:", error);
        alert("Erro ao vincular o profissional. Tente novamente.");
    }
}

// Configuração do evento para o formulário de vinculação de profissional
document.getElementById("assign-professional-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio do formulário
    const serviceId = new URLSearchParams(window.location.search).get("id");
    assignProfessionalToService(serviceId);
});

// Função para realizar requisição com autenticação (Exemplo)
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token"); // Supondo que o token esteja no localStorage

    if (!token) {
        alert("Você não está autenticado. Por favor, faça login.");
        return;
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        ...options.headers, // Adiciona outros headers, se houver
    };

    const response = await fetch(url, {
        ...options,
        headers: headers,
    });

    if (!response.ok) {
        // Se a resposta não for ok, mostra um erro
        alert("Erro na requisição, verifique a conexão ou tente novamente.");
    }

    return response;
}