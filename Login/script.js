document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = {
        email: email,
        password: password
    };

    fetch("http://localhost:8080/api/login", { // Ajuste a URL conforme necessário
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.userType === "cliente") {
                window.location.href = "../Dashboard-Cliente/index.html";
            } else if (data.userType === "profissional") {
                window.location.href = "../Dashboard-Profissional/index.html";
            } else {
                alert("Tipo de usuário desconhecido!");
            }
        } else {
            document.getElementById("errorMessage").textContent = data.message || "Credenciais inválidas.";
        }
    })
    .catch(error => {
        console.error("Erro no login:", error);
        document.getElementById("errorMessage").textContent = "Erro ao tentar realizar o login. Tente novamente.";
    });
});
