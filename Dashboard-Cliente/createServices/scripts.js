// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
}
function preencherEndereco(enderecoCompleto) {
    const locationInput = document.getElementById('location');
    locationInput.value = enderecoCompleto;

    // Aplica a borda após preencher
    locationInput.classList.add('input-com-borda');
}

// Atualiza contador de caracteres da descrição
document.getElementById('description').addEventListener('input', function () {
    const charCount = this.value.length;
    const maxLength = 1000;
    const remainingChars = maxLength - charCount;

    const charCountDisplay = document.getElementById('charCount');
    charCountDisplay.textContent = `Restam ${remainingChars} caracteres.`;
    charCountDisplay.style.color = remainingChars <= 0 ? 'red' : '';
});

// Decodifica o token JWT
function decodeJWT(token) {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload;
}

// Verifica se o usuário é cliente e está logado
function ensureClientAuthenticated() {
    const token = getAuthToken();
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "CLIENT") {
        alert("Você precisa estar autenticado como Cliente para acessar esta página.");
        window.location.assign("../../Login/index.html");
    }
}

// Valida a expiração do token
function isTokenValid(token) {
    if (!token) return false;

    try {
        const payload = decodeJWT(token);
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch (e) {
        console.error("Erro ao validar o token:", e);
        return false;
    }
}

// Busca o endereço usando o CEP
async function fetchAddress(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) throw new Error("CEP não encontrado.");

        const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
        return formattedAddress;
    } catch (error) {
        throw new Error("Não foi possível buscar o endereço. Verifique o CEP e tente novamente.");
    }
}

// Formata o CEP automaticamente ao digitar
document.getElementById("cep").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (value.length > 5) {
        value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }

    e.target.value = value;
});

document.getElementById("buscarEnderecoBtn").addEventListener("click", async function () {
    let cep = document.getElementById("cep").value.trim();

    // Remove o hífen para buscar na API
    cep = cep.replace("-", "");

    if (!cep.match(/^\d{8}$/)) {
        alert("Por favor, digite um CEP válido com 8 dígitos (ex: 12345-678 ou 12345678).");
        return;
    }

    try {
        const formattedAddress = await fetchAddress(cep);
        preencherEndereco(formattedAddress); // Aqui agora está certo!
        document.getElementById("formattedAddress").textContent = formattedAddress;
    } catch (error) {
        alert(error.message);
    }
});



// Envia o formulário para criar um novo serviço
async function criarServico(event) {
    event.preventDefault();

    const token = getAuthToken();
    if (!isTokenValid(token)) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.assign("../Login/index.html");
        return;
    }

    const decodedToken = decodeJWT(token);
    const email = decodedToken.sub;

    const serviceData = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        serviceDate: document.getElementById("serviceDate").value,
        specialty: document.getElementById("specialty").value,
        location: document.getElementById("location").value.trim(),
    };

    // Validações
    if (!serviceData.name || !serviceData.description || !serviceData.serviceDate || !serviceData.location) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const currentDate = new Date().toISOString().split('T')[0];
    if (serviceData.serviceDate < currentDate) {
        alert("A data do serviço deve ser a partir de hoje.");
        return;
    }

    // Envia para o backend
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

        alert("Serviço criado com sucesso!");
        window.location.assign("/Dashboard-Cliente/index.html");
    } catch (error) {
        alert(`Erro ao criar serviço: ${error.message}`);
    }
}

// Redireciona ao cancelar
function cancelEdit() {
    window.history.back();
}

// Garante autenticação e adiciona listener de envio
document.addEventListener("DOMContentLoaded", function () {
    ensureClientAuthenticated();

    const form = document.getElementById("serviceForm");
    form.addEventListener("submit", criarServico);
});
