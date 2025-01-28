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
        window.location.assign("../../Login/index.html");
    }
}

// Função para validar o token
function isTokenValid(token) {
    if (!token) return false;

    try {
        const payload = decodeJWT(token);
        const now = Math.floor(Date.now() / 1000); // Timestamp atual
        return payload.exp > now; // Verifica se o token não expirou
    } catch (e) {
        console.error("Erro ao validar o token:", e);
        return false;
    }
}

// Função para buscar o endereço na API do ViaCEP
async function fetchAddress(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado.");
        }

        // Formata o endereço no padrão do Google Maps
        const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
        return formattedAddress;
    } catch (error) {
        console.error("Erro ao buscar o endereço:", error);
        throw new Error("Não foi possível buscar o endereço. Verifique o CEP e tente novamente.");
    }
}

async function criarServico(event) {
    event.preventDefault();

    const token = getAuthToken();
    if (!isTokenValid(token)) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.assign("../Login/index.html");
        return;
    }

    // Decodifica o token para obter o e-mail
    const decodedToken = decodeJWT(token);
    const email = decodedToken.sub; // E-mail do cliente extraído do token

    // Coleta os dados do formulário
    const descriptionElement = document.getElementById("description");
    const descriptionValue = descriptionElement ? descriptionElement.value.trim() : "";

    const serviceData = {
        name: document.getElementById("name").value.trim(),
        description: descriptionValue,
        serviceDate: document.getElementById("serviceDate").value, // data no formato 'yyyy-MM-dd'
        specialty: document.getElementById("specialty").value,  
        location: document.getElementById("location").value.trim(), // Agora pega o valor do campo de localização
    };

    // Validação dos campos obrigatórios
    if (!serviceData.name || !serviceData.description || !serviceData.serviceDate || !serviceData.location) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    const currentDate = new Date().toISOString().split('T')[0]; // Obtém a data atual no formato 'yyyy-MM-dd'
    if (serviceData.serviceDate < currentDate) {
        alert("A data do serviço deve ser a partir de hoje.");
        return;
    }
    // Envia a requisição para o backend para criar o serviço
    try {
        const response = await fetch(`http://localhost:8080/api/services/${email}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`${response.statusText} - ${errorDetails}`);
        }

        const result = await response.json();
        alert(`Serviço criado com sucesso!`);
        window.location.assign("/Dashboard-Cliente/index.html");
    } catch (error) {
        alert(`Erro ao criar serviço: ${error.message}`);
    }
}

// Adiciona o evento blur ao campo de CEP para buscar o endereço automaticamente
document.getElementById("location").addEventListener("blur", async function () {
    const cep = this.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cep.length === 8) {
        try {
            const formattedAddress = await fetchAddress(cep);
            // Preenche o campo de localização com o endereço formatado
            document.getElementById("location").value = formattedAddress;
            document.getElementById("addressOutput").textContent = formattedAddress;
            document.getElementById("formattedAddress").style.display = "none";
        } catch (error) {
            alert(error.message);
            document.getElementById("formattedAddress").style.display = "none";
        }
    } else {
        alert("Formato de CEP inválido. O CEP deve conter 8 dígitos.");
        document.getElementById("formattedAddress").style.display = "none";
    }
});

// Adiciona o evento de envio do formulário
document.addEventListener("DOMContentLoaded", function () {
    ensureClientAuthenticated(); // Verifica se o cliente está logado antes de carregar a página

    // Adicionando evento de envio do formulário
    document.getElementById("serviceForm").addEventListener("submit", criarServico);
});

function cancelEdit() {
    window.location.href = "../index.html";
}

