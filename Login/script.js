// Evento de envio do formulário de login
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const loginButton = document.querySelector("button[type=submit]");
    loginButton.disabled = true; // Desativa o botão para evitar múltiplos cliques
    loginButton.textContent = "Carregando...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = { email, password };

    fetch("http://localhost:8080/api/login", {
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
                throw new Error(data.message || "Erro no login.");
            });
        }
        return response.json();
    })
    .then(data => {
        if (!data.token || !data.userType) {
            throw new Error("Token ou tipo de usuário ausente na resposta.");
        }

        // Salvar o token e o tipo de usuário no localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userType", data.userType);

        // Redirecionar com base no tipo de usuário
        const dashboardUrl = data.userType === "cliente"
            ? "../Dashboard-Cliente/index.html"
            : data.userType === "profissional"
            ? "../Dashboard-Profissional/index.html"
            : null;

        if (dashboardUrl) {
            window.location.href = dashboardUrl;
        } else {
            alert("Tipo de usuário desconhecido!");
        }
    })
    .catch(error => {
        console.error("Erro no login:", error.message);
        document.getElementById("errorMessage").textContent = error.message || "Erro ao tentar realizar o login.";
    });
});

// Função para obter o token do localStorage
function getAuthToken() {
    return localStorage.getItem("authToken");
}

// Função para fazer logout
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html";
}

// Função para fazer requisições autenticadas
function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (token) {
        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`
        };
    }

    return fetch(url, options).then(response => {
        if (response.status === 401) {
            // Redirecionar para login em caso de token inválido
            logout();
        }
        return response;
    });
}
