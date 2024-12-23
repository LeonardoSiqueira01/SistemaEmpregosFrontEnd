document.getElementById("userType").addEventListener("change", function() {
  const userType = this.value;
  const specialtiesField = document.getElementById("specialties");
  const specialtiesLabel = document.getElementById("specialtiesLabel");
  const locationField = document.getElementById("location");
  const locationLabel = document.querySelector('label[for="location"]');

  if (userType === "profissional") {
    specialtiesField.style.display = "block"; // Mostra o campo de especialidades
    specialtiesLabel.style.display = "block"; // Mostra o label de especialidades
    locationField.style.display = "block"; // Mostra o campo de localização
    locationLabel.style.display = "block"; // Mostra o label de localização
    locationField.required = true; // Torna o campo de localização obrigatório
  } else {
    specialtiesField.style.display = "none"; // Esconde o campo de especialidades
    specialtiesLabel.style.display = "none"; // Esconde o label de especialidades
    locationField.style.display = "none"; // Esconde o campo de localização
    locationLabel.style.display = "none"; // Esconde o label de localização
    locationField.required = false; // Remove a obrigatoriedade do campo de localização
  }
});


function validateForm({ email, password, specialties, userType, location }) {
  // Regex para validar e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Verificar se o e-mail é válido
  if (!emailRegex.test(email)) {
    alert("Por favor, insira um e-mail válido.");
    return false;
  }

  // Verificar se a senha tem pelo menos 6 caracteres
  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return false;
  }

  // Se for profissional, garantir que pelo menos uma especialidade seja selecionada
  if (userType === "profissional" && specialties.length === 0) {
    alert("Por favor, selecione pelo menos uma especialidade.");
    return false;
  }

  // Se for profissional, garantir que a localização seja preenchida
  if (userType === "profissional" && !location) {
    alert("Por favor, insira sua localização.");
    return false;
  }

  return true;  // Tudo validado
}

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const userType = document.getElementById("userType").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const location = document.getElementById("location").value;  // Localização

  const specialtiesSelect = document.getElementById("specialties");
  const specialties = Array.from(specialtiesSelect.selectedOptions).map(option => option.value).join(", "); // Juntar as especialidades em uma string separada por vírgulas
  
  // Criar o payload com as especialidades como uma string
  const payload = {
    user: {
      name,
      email,
      password,
    },
    specialties: userType === "profissional" ? specialties : null, // Usar a string de especialidades ou null
    location: userType === "profissional" ? location : null,  // Apenas adiciona localização para profissionais
    userType: userType,
  };
  
  if (!validateForm({ email, password, specialties, userType, location })) return;
  
  try {
    const registerResponse = await fetch(`http://localhost:8080/api/register?type=${userType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (registerResponse.ok) {
      alert("Cadastro realizado! Um código foi enviado ao seu e-mail.");
      document.getElementById("registerForm").reset();
      toggleScreens("verificationScreen");
    } else {
      const errorText = await registerResponse.text();
      alert(`Erro no cadastro: ${errorText}`);  
    }
  } catch (err) {
    alert("Erro ao se conectar com o servidor.");
    console.error(err);
  }
});

document.getElementById("verificationForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const verificationCode = document.getElementById("verificationCode").value;

  try {
    const verifyResponse = await fetch("http://localhost:8080/api/verify?code=" + verificationCode, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (verifyResponse.ok) {
      alert("Cadastro concluído com sucesso!");
      toggleScreens("initialScreen");
    } else {
      const errorText = await verifyResponse.text();
      alert(`Erro na verificação: ${errorText}`);
    }
  } catch (err) {
    alert("Erro ao se conectar com o servidor.");
    console.error(err);
  }
});

function toggleScreens(screenId) {
  document.getElementById("initialScreen").style.display = "none";
  document.getElementById("verificationScreen").style.display = "none";
  document.getElementById(screenId).style.display = "block";
}
