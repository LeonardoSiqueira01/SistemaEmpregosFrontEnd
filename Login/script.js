document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const loginButton = document.querySelector("button[type=submit]");
    loginButton.disabled = true;
    loginButton.textContent = "Carregando...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validação de entrada no front-end
    if (!email || !password) {
        document.getElementById("errorMessage").textContent = "Por favor, preencha todos os campos.";
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
        return;
    }

    const loginData = { email, password };

    fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
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
        if (!data.token || !data.userType) {
            throw new Error("Resposta inválida do servidor: token ou tipo de usuário ausente.");
        }

        // Armazena o token e o tipo de usuário
        localStorage.setItem("authToken", `Bearer ${data.token}`);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("userId", data.userId); // Salvar o ID do usuário

        // Redireciona o usuário para o painel correspondente
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
        document.getElementById("errorMessage").textContent = error.message || "Erro ao tentar realizar o login.";
    });
});

// Funções auxiliares
const API_BASE_URL = "http://localhost:8080"; // Utilize variável de ambiente no futuro

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html";
}

function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (token) {
        options.headers = {
            ...options.headers,
            "Authorization": token
        };
    }

    return fetch(url, options).then(response => {
        if (response.status === 401) {
            logout(); // Redireciona para login se o token for inválido
        }
        return response;
    });
}
