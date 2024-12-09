document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = {
        email: email,
        password: password
    };

    fetch("http://localhost:8080/api/login", {  // Verifique se a URL está correta
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login bem-sucedido");
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(error => {
        console.error("Erro no login:", error);
    });
});
