document.getElementById("userType").addEventListener("change", function() {
  const userType = this.value;
  const specialtiesField = document.getElementById("specialties");
  const specialtiesLabel = document.getElementById("specialtiesLabel");
  const locationContainer = document.getElementById("locationContainer");
  const cepField = document.getElementById("cep");
  const buscarEnderecoBtn = document.getElementById("buscarEnderecoBtn");
  const locationLabel = document.getElementById("locationLabel");

  // Verifica se o tipo de usuário é 'profissional'
  if (userType === "profissional") {
    // Exibe os campos relevantes para profissionais
    specialtiesField.style.display = "block";
    specialtiesLabel.style.display = "block";
    cepField.style.display = "inline-block"; // Torna o campo de input visível
    buscarEnderecoBtn.style.display = "inline-block"; // Torna o botão visível

    // Torna o container de localização visível e usa display flex para alinha-los corretamente
    locationContainer.style.display = "flex";
    locationContainer.style.alignItems = "center";
    locationContainer.style.justifyContent = "flex-start";
    
    // Configura o label e o input para que fiquem alinhados na mesma linha
    locationLabel.style.marginRight = "10px";
    locationLabel.style.flexShrink = "0";

    locationContainer.querySelector('input').style.display = "inline-block"; // Torna o campo de input visível
    locationContainer.querySelector('input').required = true; // Torna o campo obrigatório
    locationContainer.querySelector('input').readOnly = true; // Impede a edição manual do campo de localização

    // Exibe os campos de CEP e o botão de buscar endereço
    cepField.style.display = "inline-block";
    buscarEnderecoBtn.style.display = "inline-block";

    // Torna o campo de CEP obrigatório
    cepField.required = true;

  } else {
    // Esconde todos os campos relacionados ao profissional
    specialtiesField.style.display = "none";
    specialtiesLabel.style.display = "none";
    locationContainer.style.display = "none"; // Esconde o campo de localização para o cliente
    locationContainer.querySelector('input').style.display = "none"; // Esconde o campo de input de localização
    cepField.style.display = "none";
    buscarEnderecoBtn.style.display = "none";

    // Torna o campo de CEP não obrigatório
    cepField.required = false;
  }
});



document.getElementById("cep").addEventListener("input", function() {
  let cep = this.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
  if (cep.length > 5) {
    cep = cep.slice(0, 5) + '-' + cep.slice(5, 8); // Adiciona o hífen após o 5º caractere
  }
  this.value = cep; // Atualiza o valor no campo de input
});



document.getElementById("buscarEnderecoBtn").addEventListener("click", function() {
  let cep = document.getElementById("cep").value.replace(/\D/g, ''); // Remove o hífen e outros caracteres não numéricos

  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          
          // Atualiza o campo de localização com o endereço completo
          document.getElementById("location").value = address;

          // Adiciona o efeito de destaque no campo de localização
          document.getElementById("location").classList.add("highlight");

          // Opcional: Remover a classe de destaque após algum tempo (ex: 1 segundo)
          setTimeout(function() {
            document.getElementById("location").classList.remove("highlight");
          }, 1000); // 1000 ms = 1 segundo

          // Exibe o endereço formatado
          document.getElementById("formattedAddress").textContent = address;
          document.getElementById("addressOutput").style.display = "block"; // Exibe o endereço
        } else {
          alert('CEP não encontrado. Verifique e tente novamente.');
        }
      })
      .catch(() => {
        alert('Erro ao buscar o CEP. Verifique sua conexão ou o formato do CEP.');
      });
  } else {
    alert('Formato de CEP inválido.');
  }
});




function validateForm({ email, password, specialties, userType, location }) {
  // Validação do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Por favor, insira um e-mail válido.");
    return false;
  }

  // Validação da senha
  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return false;
  }

  // Validação das especialidades (se for profissional)
  if (userType === "profissional" && specialties.length === 0) {
    alert("Por favor, selecione pelo menos uma especialidade.");
    return false;
  }

  // Validação da localização (se for profissional)
  if (userType === "profissional" && !location) {
    alert("Por favor, insira sua localização.");
    return false;
  }

  return true;
}

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const userType = document.getElementById("userType").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const location = document.getElementById("location").value;

  const specialtiesSelect = document.getElementById("specialties");
  const specialties = Array.from(specialtiesSelect.selectedOptions).map(option => option.value).join("; ");
  
  const payload = {
    user: {
      name,
      email,
      password,
    },
    specialties: userType === "profissional" ? specialties : null,
    location: userType === "profissional" ? location : null,
    userType: userType,
  };

  // Validação do formulário
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

  if (cep.length === 8) {
    // Formatação do CEP com hífen
    const formattedCep = cep.slice(0, 5) + '-' + cep.slice(5);
    cepField.value = formattedCep; // Atualiza o campo com o CEP formatado

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          // Preencher o campo de endereço
          const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          document.getElementById("formattedAddress").textContent = address;
          document.getElementById("addressOutput").style.display = "block"; // Exibe o endereço

          // Atualiza o campo 'location' com o endereço completo
          cepField.value = address;
        } else {
          alert('CEP não encontrado. Verifique e tente novamente.');
        }
      })
      .catch(() => {
        alert('Erro ao buscar o CEP. Verifique sua conexão ou o formato do CEP.');
      });
      
  } else {
    alert('Formato de CEP inválido.');
  }
});



// Quando o usuário alterar manualmente o campo, resetar o estado de validação
document.getElementById("location").addEventListener("input", function() {
  this.dataset.validated = "false"; // Reseta a validação sempre que o usuário edita
});

