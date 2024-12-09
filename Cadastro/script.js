// Função de validação
function validateForm({ email, password }) {
  // Regex para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Verificar se o email é válido
  if (!emailRegex.test(email)) {
    alert("Por favor, insira um e-mail válido.");
    return false;
  }

  // Verificar se a senha tem pelo menos 6 caracteres
  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return false;
  }

  // Tudo validado
  return true;
}

// Gerencia o envio do formulário de registro
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const userType = document.getElementById("userType").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const payload = { type: userType, name, email, password };

  // Validar os campos antes de enviar
  if (!validateForm({ email, password })) return;
  try {
    const registerResponse = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (registerResponse.ok) {
        alert("Cadastro realizado! Um código foi enviado ao seu e-mail.");
        document.getElementById("registerForm").reset(); // Limpa o formulário
        toggleScreens("verificationScreen"); // Alterna para a tela de verificação
    } else {
        const errorText = await registerResponse.text(); // Pega o conteúdo como texto
        alert(`Erro no cadastro: ${errorText}`); // Exibe o erro
    }
} catch (err) {
    alert("Erro ao se conectar com o servidor.");
    console.error(err);
}
});

// Gerencia o envio do formulário de verificação
document.getElementById("verificationForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const verificationCode = document.getElementById("verificationCode").value;

  try {
    const verifyResponse = await fetch("http://localhost:8080/api/verify?code=" + verificationCode, {
      method: "GET",  // Alterado para GET
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (verifyResponse.ok) {
      alert("Cadastro concluído com sucesso!");
      toggleScreens("initialScreen"); // Retorna para a tela inicial
    } else {
      const error = await verifyResponse.json();
      alert(`Erro na verificação: ${error.message}`);
    }
  } catch (err) {
    alert("Erro ao se conectar com o servidor.");
    console.error(err);
  }
});

// Função para alternar entre telas
function toggleScreens(screenId) {
  document.getElementById("initialScreen").style.display = "none";
  document.getElementById("verificationScreen").style.display = "none";
  document.getElementById(screenId).style.display = "block";
}
