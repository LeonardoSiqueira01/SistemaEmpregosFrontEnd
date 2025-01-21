document.getElementById("logout").addEventListener("click", logout);

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        window.location.href = "../Login/index.html";
        return;
    }

    const email = localStorage.getItem("email");

    if (!email) {
        alert("Erro: email não encontrado.");
        return;
    }

    fetchWithAuth(`http://localhost:8080/api/client-summary?email=${email}`)
        .then(data => {
            if (data.name) {
                document.getElementById('professional-name').textContent = data.name;
                document.getElementById('requested-services').textContent = data.requestedServices;
                document.getElementById('completed-services').textContent = data.completedServices;
                const roundedRating = parseFloat(data.averageRating).toFixed(2);
                document.getElementById('average-rating').textContent = roundedRating;       
                 } else {
                alert('Erro ao carregar dados do cliente.');
            }
        })
        .catch(error => {
            console.error('Erro ao obter o resumo do cliente:', error);
            alert('Erro ao carregar o resumo do cliente.');
        });
});

function fetchWithAuth(url, options = {}) {
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken) {
        alert("Você precisa estar autenticado para acessar esta funcionalidade.");
        window.location.href = "../Login/index.html";
        return Promise.reject("Token de autenticação não encontrado.");
    }

    // Adiciona o cabeçalho Authorization com o token
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
    };

    return fetch(url, { ...options, headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        });
}
