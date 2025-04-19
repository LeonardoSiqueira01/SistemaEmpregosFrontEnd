function getToken() {
  return localStorage.getItem("authToken");
}

// Pega o ID do serviço da URL
const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('serviceId');

// Função para carregar as solicitações
async function loadProfessionalRequests(serviceId) {
  try {
    const response = await fetch(`http://localhost:8080/api/services/${serviceId}/profissionais`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const professionals = await response.json();
      console.log(professionals); // Verifique o conteúdo da resposta
      const container = document.getElementById("professional-requests-container");

      if (professionals.length === 0) {
        container.innerHTML = "<p>Nenhum profissional solicitou este serviço.</p>";
      } else {
        professionals.forEach(professional => {
          const div = document.createElement("div");
          div.classList.add("professional-request");
          
          div.innerHTML = `
            <h3>${professional.name}</h3>
            <p><strong>Email:</strong> ${professional.email}</p>
            <p><strong>Especialidades:</strong> ${professional.specialties}</p>
            <p><strong>Localização:</strong> ${professional.location}</p>
            <p><strong>Avaliação:</strong> ${professional.averageRating?.toFixed(2)}</p>
            <p><strong>Total de serviços concluídos:</strong> ${professional.totalServicesCompleted}</p>
            <p><strong>Disponibilidade:</strong> ${professional.available ? 'Disponível' : 'Indisponível'}</p>
            <button class="view-profile-btn" onclick="viewProfile('${professional.email}')">Visualizar Perfil</button>

            <!-- Botões de Aceitar e Recusar -->
            <div class="action-buttons">
              <button class="aceitar-btn" data-professional-email="${professional.email}">Aceitar</button>
              <button class="recusar-btn" data-professional-email="${professional.email}">Recusar</button>
            </div>
          `;
          
          container.appendChild(div);
        });

        // Adiciona os eventos aos botões
        document.querySelectorAll('.aceitar-btn, .recusar-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const professionalEmail = e.target.dataset.professionalEmail;
            const aceitar = e.target.classList.contains('aceitar-btn');  // Simplificado
            aceitarOuRecusarServico(serviceId, professionalEmail, aceitar);
          });
        });
      }
    } else {
      throw new Error('Erro ao carregar solicitações.');
    }
  } catch (error) {
    console.error(error);
    document.getElementById("professional-requests-container").innerHTML = `<p>Erro ao carregar as solicitações. Tente novamente mais tarde.</p>`;
  }
}
function viewProfile(email) {
  window.open('http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=' + encodeURIComponent(email), '_blank');
}

loadProfessionalRequests(serviceId); // Chama a função para carregar as solicitações

async function aceitarOuRecusarServico(serviceId, professionalEmail, aceitar) {
  const token = getToken(); // Pega o token de autenticação

  if (!token) {
    console.error('Token de autenticação não encontrado');
    return;
  }

  const url = `http://localhost:8080/api/services/${professionalEmail}/services/${serviceId}/${aceitar ? 'accept' : 'reject'}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const message = await response.text();
      alert(message);

      // Limpa o contêiner da lista antes de recarregar
      const container = document.getElementById("professional-requests-container");
      container.innerHTML = '';  // Limpa a lista anterior

      // Adiciona um pequeno atraso antes de recarregar a lista
      setTimeout(() => {
        loadProfessionalRequests(serviceId); // Recarrega a lista após um pequeno atraso
      }, 500);  // Aguarda 500ms antes de recarregar

      // Se a resposta for aceitar, volta para a tela anterior
      if (aceitar) {
        setTimeout(() => {
          window.history.back(); // Volta para a página anterior
        }, 1000);  // Aguarda 1 segundo para garantir que a atualização da lista seja feita antes de voltar
      }

    } else {
      const errorMessage = await response.text();
      console.error('Erro ao processar solicitação:', errorMessage);
      alert('Erro: ' + errorMessage);
    }
  } catch (error) {
    console.error('Erro de rede:', error);
    alert('Erro ao comunicar com o servidor.');
  }
}


function voltar() {
  window.history.back();  // Isso leva o usuário de volta à página anterior no histórico
}