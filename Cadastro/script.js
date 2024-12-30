document.getElementById("userType").addEventListener("change", function() {
  const userType = this.value;
  const specialtiesField = document.getElementById("specialties");
  const specialtiesLabel = document.getElementById("specialtiesLabel");
  const locationField = document.getElementById("location");
  const locationLabel = document.querySelector('label[for="location"]');
  const cepLink = document.getElementById("cep-link");
  const addressOutput = document.getElementById("addressOutput"); // Adicionado para controlar a exibição do endereço formatado

  if (userType === "profissional") {
    specialtiesField.style.display = "block"; // Mostra o campo de especialidades
    specialtiesLabel.style.display = "block"; // Mostra o label de especialidades
    locationField.style.display = "block"; // Mostra o campo de localização
    locationLabel.style.display = "block"; // Mostra o label de localização
    locationField.required = true; // Torna o campo de localização obrigatório
    cepLink.style.display = "block"; // Garante que o link seja visível para profissionais

    // Verifica se o campo de localização já está validado
    if (locationField.dataset.validated === "true") {
      addressOutput.style.display = "block"; // Exibe o endereço formatado se já estiver validado
    } else {
      addressOutput.style.display = "none"; // Esconde o endereço até que seja validado novamente
    }
  } else {
    specialtiesField.style.display = "none"; // Esconde o campo de especialidades
    specialtiesLabel.style.display = "none"; // Esconde o label de especialidades
    locationField.style.display = "none"; // Esconde o campo de localização
    locationLabel.style.display = "none"; // Esconde o label de localização
    locationField.required = false; // Remove a obrigatoriedade do campo de localização
    cepLink.style.display = "none"; // Oculta o link de CEP para clientes
    addressOutput.style.display = "none"; // Oculta o endereço formatado para clientes
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
  const location = document.getElementById("location").value;  // Localização (agora com o endereço completo)

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
    location: userType === "profissional" ? location : null,  // Apenas adiciona localização para profissionais (endereço completo)
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
      window.location.href = "../Login/index.html";
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


document.getElementById("location").addEventListener("blur", function() {
  const cepField = this;
  const cep = cepField.value.replace(/\D/g, ''); // Remove caracteres não numéricos
  const validated = cepField.dataset.validated; // Recupera o indicador de validação

  if (validated === "true") return; // Evita reprocessamento se o CEP já estiver validado

  if (cep.length === 8) {
    // Fazer a requisição para a API de CEP
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          // Preencher o campo de endereço
          const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          document.getElementById("formattedAddress").textContent = address;
          document.getElementById("addressOutput").style.display = "block"; // Exibe o endereço
          
          // Agora, preencher o campo 'location' com o endereço completo
          cepField.value = address;  // Atualiza o campo 'location' com o endereço completo
          cepField.dataset.validated = "true"; // Marca o campo como validado
        } else {
          alert('CEP não encontrado. Verifique e tente novamente.');
          cepField.dataset.validated = "false"; // Reseta o indicador
        }
      })
      .catch(() => {
        alert('Erro ao buscar o CEP. Verifique sua conexão.');
        cepField.dataset.validated = "false"; // Reseta o indicador
      });
  } else {
    alert('Formato de CEP inválido.');
    cepField.dataset.validated = "false"; // Reseta a validação
  }
});


// Quando o usuário alterar manualmente o campo, resetar o estado de validação
document.getElementById("location").addEventListener("input", function() {
  this.dataset.validated = "false"; // Reseta a validação sempre que o usuário edita
});
