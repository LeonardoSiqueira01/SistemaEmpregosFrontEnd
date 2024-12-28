// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
}

// Função para decodificar o token JWT e obter o payload
function decodeJWT(token) {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload;
}

// Função para garantir que o cliente esteja logado
function ensureClientAuthenticated() {
    const token = getAuthToken();
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "CLIENT") {
        alert("Você precisa estar autenticado como Cliente para acessar esta página.");
        window.location.assign("../Login/index.html");
      
    }
}

// Função para criar o serviço
async function criarServico(event) {
    event.preventDefault();

    // Decodifica o token para obter o e-mail
    const token = getAuthToken();
    const decodedToken = decodeJWT(token);
    const email = decodedToken.sub;  // E-mail do cliente extraído do token

    // Coleta os dados do formulário
    const serviceData = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        serviceDate: document.getElementById("serviceDate").value,  // data no formato 'yyyy-MM-dd'
        specialty: document.getElementById("specialty").value,
        location: document.getElementById("location").value
    };

    // Validação dos campos obrigatórios
    if (!serviceData.name || !serviceData.description || !serviceData.serviceDate || !serviceData.location) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // Envia a requisição para o backend para criar o serviço, passando o email diretamente
    try {
        const response = await fetch(`http://localhost:8080/api/services/${email}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)  // Envia os dados do serviço
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`${response.statusText} - ${errorDetails}`);
        }

        const result = await response.json();
        alert(`Serviço criado com sucesso! ID: ${result.id}`);
        window.location.assign("/Dashboard-Cliente/index.html");
        

    } catch (error) {
        alert(`Erro ao criar serviço: ${error.message}`);
    }
}

// Função para garantir que o token seja válido
function isTokenValid(token) {
    if (!token) return false;

    try {
        const payload = decodeJWT(token);
        const now = Math.floor(Date.now() / 1000);  // Timestamp atual
        return payload.exp > now;  // Verifica se o token não expirou
    } catch (e) {
        console.error("Erro ao validar o token:", e);
        return false;
    }
}

// Adiciona o evento de envio do formulário
document.addEventListener("DOMContentLoaded", function () {
    ensureClientAuthenticated(); // Verifica se o cliente está logado antes de carregar a página

    // Adicionando evento de envio do formulário
    document.getElementById("serviceForm").addEventListener("submit", criarServico);
});

function cancelEdit() {
    // Redireciona para a página de lista de serviços (ou página anterior)
      window.location.href = "../index.html";
  }
  