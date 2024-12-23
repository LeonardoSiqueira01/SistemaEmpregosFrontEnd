// Definindo a URL base da API diretamente no código
const API_BASE_URL = "http://localhost:8080"; // URL da API

// Ouvinte de evento para o formulário de login
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();  // Previne o comportamento padrão do formulário (recarregar a página)

    const loginButton = document.querySelector("button[type=submit]"); 
    loginButton.disabled = true;
    loginButton.textContent = "Carregando...";

    const email = document.getElementById("email").value.trim(); // Pega o valor do email
    const password = document.getElementById("password").value; // Pega o valor da senha

    // Validação de entrada no front-end
    if (!email || !password) {
        document.getElementById("errorMessage").textContent = "Por favor, preencha todos os campos."; // Exibe mensagem de erro
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
        return; // Sai da função sem fazer o login
    }

    // Prepara os dados para envio no corpo da requisição
    const loginData = { email, password };

    // Realiza a requisição fetch para o login
    fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData) // Envia os dados no formato JSON
    })
    .then(response => {
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";

        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Erro ao tentar realizar o login.");
            });
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Verifique o que o servidor retorna aqui
    
        if (!data.token || !data.userType) {
            throw new Error("Resposta inválida do servidor: token ou tipo de usuário ausente.");
        }
    
        const token = data.token.startsWith("Bearer ") ? data.token : `Bearer ${data.token}`;
        localStorage.setItem("authToken", token);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("userId", data.userId);
    
        const userType = data.userType.toUpperCase();
        const dashboardUrl = userType === "CLIENT"
            ? "../Dashboard-Cliente/index.html"
            : userType === "PROFESSIONAL"
            ? "../Dashboard-Profissional/index.html"
            : null;
    
        if (dashboardUrl) {
            window.location.href = dashboardUrl;
        } else {
            alert("Tipo de usuário desconhecido.");
        }
    })
    
    .catch(error => {
        console.error("Erro no login:", error.message);
        document.getElementById("errorMessage").textContent =
            error.message === "Failed to fetch"
                ? "Erro de conexão. Verifique sua internet."
                : error.message || "Erro ao tentar realizar o login.";
    });
});

// Função auxiliar para obter o token de autenticação
function getAuthToken() {
    return localStorage.getItem("authToken");
}

// Função para fazer logout (limpa o token e o tipo de usuário)
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html";
}

// Função para realizar requisições com autenticação (usando o token)
function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        console.error("Token de autenticação ausente.");
        logout();
        return Promise.reject(new Error("Usuário não autenticado. Faça login novamente."));
    }

    // Verificar expiração do token (chamada ao método de expiração do token)
    if (isTokenExpired(token)) {
        logout();
        return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
    }

    // Adiciona o token ao cabeçalho da requisição
    options.headers = {
        ...options.headers,
        "Authorization": token
    };

    return fetch(url, options).then(response => {
        if (response.status === 401) {
            logout(); // Redireciona para login se o token for inválido
        }
        return response;
    });
}

// Função para verificar se o token expirou
function isTokenExpired(token) {
    const [, payload] = token.split(".");  // Decodifica o payload do token
    const decodedPayload = JSON.parse(atob(payload)); // Decodifica o payload base64
    return decodedPayload.exp * 1000 < Date.now(); // Verifica se o token expirou
}
