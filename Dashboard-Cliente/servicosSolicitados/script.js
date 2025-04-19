// token permanece igual
const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('servicesContainer');

  fetch('http://localhost:8080/api/client/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro na resposta da API');
    }
    return response.json();
  })
  .then(data => {
    container.innerHTML = "";

    const servicosNaoFinalizados = data.filter(servico => servico.status && servico.status.toLowerCase() == "aberto");

    if (servicosNaoFinalizados.length === 0) {
      container.innerHTML = '<p>Nenhum serviço com profissionais solicitados encontrado.</p>';
      return;
    }

    servicosNaoFinalizados.forEach(service => {
      const div = document.createElement('div');
      div.className = 'service-card';

      const ul = document.createElement('ul');
      ul.className = 'professional-list';

      const formattedDate = formatarData(service.serviceDate);

      div.innerHTML = `
        <div class="service-header">
          <h3 class="service-title">
            ${service.serviceName || "Sem nome"}
            <button class="toggle-btn" style="background:none;border:none;color:#ff4081;font-size:1.2em;cursor:pointer;" title="Mostrar/ocultar detalhes">▲</button>
          </h3>
          <span class="service-status">${service.status || "Pendente"}</span>
        </div>
        <div class="service-details">
          <p><strong>Descrição:</strong> ${service.description || "Sem descrição"}</p>
          <p><strong>Data do Serviço:</strong> ${formattedDate}</p>
          <p><strong>Data de Criação:</strong> ${formatarData(service.createdAt)}</p>
          ${service.completedAt ? `<p><strong>Data de Conclusão:</strong> ${formatarData(service.completedAt)}</p>` : ""}
          ${service.observation ? `<p><strong>Observações:</strong> ${service.observation}</p>` : ""}
          <p><strong>Especialidade:</strong> ${service.specialty || "Não informada"}</p>
          <p><strong>Localização:</strong> ${service.location || "Não especificada"}</p>
          <p><strong>Profissionais Solicitados:</strong></p>
        </div>
      `;

      // Profissionais solicitados
      service.requestedProfessionals.forEach(profId => {
        fetch(`http://localhost:8080/api/client/profissionais/${profId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao buscar profissional');
          return res.json();
        })
        .then(profissional => {
          const li = document.createElement('li');
          li.classList.add('professional-card');

          const specialties = profissional.specialties?.trim() || "Não informadas";
          const location = profissional.location?.trim() || "Não informada";
          const nome = profissional.name?.trim() || "Nome não disponível";
          const email = profissional.email?.trim() || "E-mail não disponível";
          const concluidos = profissional.totalServicesCompleted ?? 0;
          const mediaAvaliacao = typeof profissional.averageRating === 'number'
            ? profissional.averageRating.toFixed(1)
            : "Sem avaliações";
          const disponibilidade = profissional.available ? 'Sim' : 'Não';

          li.innerHTML = `
            <div class="professional-info">
              <h4 class="professional-name">${nome}</h4>
              <p class="professional-email">${email}</p>
              <p><strong>Especialidades:</strong> ${specialties}</p>
              <p><strong>Localização:</strong> ${location}</p>
              <p><strong>Serviços Concluídos:</strong> ${concluidos}</p>
              <p><strong>Média de Avaliações:</strong> ${mediaAvaliacao}</p>
              <p><strong>Disponível:</strong> ${disponibilidade}</p>
            </div>
            <div class="professional-actions">
              <button class="remove-btn" data-service-id="${service.serviceId}" data-prof-id="${profId}">Remover Solicitação</button>
              <button class="view-profile-btn" data-email="${email}">Ver Perfil</button>
            </div>
          `;
          ul.appendChild(li);
        })
        .catch(error => {
          const li = document.createElement('li');
          li.textContent = `Erro ao buscar profissional com ID ${profId}`;
          ul.appendChild(li);
        });
      });

      // Botão toggle
      const detailsDiv = div.querySelector('.service-details');
      const toggleBtn = div.querySelector('.toggle-btn');
      toggleBtn.addEventListener('click', () => {
        detailsDiv.classList.toggle('hidden');
        ul.classList.toggle('hidden');
        toggleBtn.textContent = toggleBtn.textContent === '▲' ? '▼' : '▲';
      });

      div.appendChild(ul);
      container.appendChild(div);
    });
  })
  .catch(error => {
    console.error('Erro ao buscar serviços:', error);
    container.innerHTML = '<p>Erro ao buscar serviços.</p>';
  });
});

// Delegação de eventos
document.addEventListener('click', function (event) {
  const target = event.target;

  if (target.classList.contains('remove-btn')) {
    const serviceId = target.getAttribute('data-service-id');
    const profId = target.getAttribute('data-prof-id');

    if (confirm("Tem certeza que deseja cancelar esta solicitação?")) {
      fetch(`http://localhost:8080/api/client/me/remover-solicitacao/${serviceId}/${profId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao remover solicitação');
        alert('Solicitação removida com sucesso!');
        window.location.reload();
      })
      .catch(err => {
        alert('Erro ao remover solicitação: ' + err.message);
      });
    }
  }

  if (target.classList.contains('view-profile-btn')) {
    const email = target.getAttribute('data-email');
    viewProfile(email);
  }
});

// Funções auxiliares
function formatarData(dataISO) {
  if (!dataISO) return "Sem data";
  const data = new Date(dataISO);
  return isNaN(data.getTime()) ? "Data inválida" : data.toLocaleDateString("pt-BR");
}

function viewProfile(email) {
  window.open('http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=' + encodeURIComponent(email), '_blank');
}

function cancelEdit() {
  window.location.href = "../index.html";
}
