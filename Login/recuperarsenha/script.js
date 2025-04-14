const API_BASE_URL = "http://localhost:8080";

document.getElementById("recoverForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("recoverEmail").value.trim();
    const button = document.querySelector("button[type=submit]");
    const messageDiv = document.getElementById("recoverMessage");

    if (!email) {
        messageDiv.textContent = "Por favor, preencha o e-mail.";
        return;
    }

    button.disabled = true;
    button.textContent = "Enviando...";

    fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        button.disabled = false;
        button.textContent = "Enviar";

        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Erro ao enviar solicitação.");
            });
        }

        return response.json();
    })
    .then(data => {
        messageDiv.style.color = "green";
        messageDiv.textContent = "Instruções de recuperação foram enviadas para o e-mail.";
    })
    .catch(error => {
        messageDiv.style.color = "red";
        messageDiv.textContent = error.message || "Erro ao processar a solicitação.";
    });
});
