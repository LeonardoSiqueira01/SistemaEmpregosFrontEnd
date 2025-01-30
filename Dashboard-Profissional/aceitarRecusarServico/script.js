function getEmailFromToken() {
    const email = localStorage.getItem("email");
    if (!email) {
        console.error("E-mail não encontrado no localStorage.");
        return null;
    }
    return email;
}

document.getElementById('requested-services').addEventListener('click', async function () {
    try {
        const token = localStorage.getItem("authToken"); // ou qualquer outro nome que você tenha usado

        if (!token) {
            console.error('Token de autenticação não encontrado');
            return;
        }

        const response = await fetch('http://localhost:8080/api/professionals/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro na requisição:', errorMessage);
            alert('Erro ao carregar os serviços: ' + errorMessage);
            return;
        }

        const servicos = await response.json();
        const servicosArray = Array.from(servicos);

        const container = document.getElementById('requested-service-list');
        container.innerHTML = '';

        const serviceContainer = document.getElementById('requested-service-list-container');

        if (servicosArray.length === 0) {
            container.innerHTML = '<p>Não há serviços solicitados para você.</p>';
        } else {
            servicosArray.forEach(servico => {
                const serviceElement = document.createElement('div');
                serviceElement.classList.add('service-item');

                // Status e Data de Serviço
                const statusClasses = {
                    "ABERTO": "status-open",
                    "INICIADO": "status-started",
                    "FINALIZADO": "status-completed",
                 "CANCELADO": "status-canceled"
                };
                const statusClass = statusClasses[servico.status] || "";
                const date = new Date(servico.serviceDate);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

                // Verificando a data de início do serviço
                const inicioServico = servico.inicioServico ? new Date(servico.inicioServico) : null;
                const formattedStartDate = inicioServico 
                    ? `${inicioServico.getDate().toString().padStart(2, '0')}/${(inicioServico.getMonth() + 1).toString().padStart(2, '0')}/${inicioServico.getFullYear()}` 
                    : null;

                const conclusaoServico = servico.conclusaoServico ? new Date(servico.conclusaoServico) : null;
                const formattedEndDate = conclusaoServico && servico.status === "FINALIZADO"
                    ? `${conclusaoServico.getDate().toString().padStart(2, '0')}/${(conclusaoServico.getMonth() + 1).toString().padStart(2, '0')}/${conclusaoServico.getFullYear()}`
                    : "";
                    

                // Definindo o HTML
                serviceElement.innerHTML = `
                    <div class="service-header">
                        <h3 class="service-name">${servico.name}</h3>
                        <span class="service-status ${statusClass}">${servico.status}</span>
                    </div>
                    <p><strong>Especialidade:</strong> ${servico.specialty}</p>
                    <p><strong>Data de criação do Serviço:</strong> ${formattedDate}</p>
                    <p><strong>Descrição:</strong> ${servico.description}</p>
                    <p><strong>Localização:</strong> ${servico.location}</p>
                    <p><strong>Nome do Cliente:</strong> ${servico.clientName}</p>  

                    ${formattedStartDate ? `<p><strong>Data de início do serviço:</strong> ${formattedStartDate}</p>` : ""}

                    ${formattedEndDate ? `<p><strong>Data de Conclusão do Serviço:</strong> ${formattedEndDate}</p>` : ""}

                    <!-- Remover botões caso o serviço esteja iniciado, finalizado ou cancelado -->
                    ${['INICIADO', 'FINALIZADO', 'CANCELADO'].includes(servico.status) ? '' : `
                        <button class="aceitarBtn" data-id="${servico.id}">Aceitar</button>
                        <button class="recusarBtn" data-id="${servico.id}">Recusar</button>
                    `}
                    
                        <button onclick="viewProfile('${servico.clientEmail}')">Visualizar Perfil do Cliente</button>  <!-- Sempre visível -->

                    ${servico.status === 'FINALIZADO' && servico.ratedClient === 0 ? `
                        <button class="avaliarClienteBtn" data-id="${servico.id}">Avaliar Cliente</button>
                    ` : ''}
                    
                    
                `;

                container.appendChild(serviceElement);
            });

            serviceContainer.style.display = 'block';

            document.querySelectorAll('.aceitarBtn').forEach(button => {
                button.addEventListener('click', (e) => aceitarServico(e.target.dataset.id));
            });

            document.querySelectorAll('.recusarBtn').forEach(button => {
                button.addEventListener('click', (e) => recusarServico(e.target.dataset.id));
            });
            document.querySelectorAll('.avaliarClienteBtn').forEach(button => {
                button.addEventListener('click', (e) => avaliarClienteBtn(e.target.dataset.id));
            });
        }
    } catch (error) {
        console.error('Erro ao carregar serviços solicitados:', error);
    }
});

function viewProfile(email) {
    window.open('http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=' + encodeURIComponent(email), '_blank');
}


const email = getEmailFromToken();


async function aceitarServico(serviceId) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }

   
    
    
    try {
        const response = await fetch(`http://localhost:8080/api/professionals/${email}/services/${serviceId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro ao aceitar serviço:', errorMessage);
            alert('Erro ao aceitar o serviço: ' + errorMessage);
            return;
        }

        const message = await response.text();
        alert(message);
        document.getElementById('requested-services').click(); // Atualiza a lista
    } catch (error) {
        console.error('Erro ao aceitar serviço:', error);
    }
}


async function recusarServico(serviceId) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }

    // Extraia o email do token ou use uma fonte confiável
    const email = getEmailFromToken(token); // Função que você precisa implementar

    try {
        const response = await fetch(`http://localhost:8080/api/professionals/${email}/services/${serviceId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro ao recusar serviço:', errorMessage);
            alert('Erro ao recusar o serviço: ' + errorMessage);
            return;
        }

        const message = await response.text();
        alert(message);
        document.getElementById('requested-services').click(); // Atualiza a lista
    } catch (error) {
        console.error('Erro ao recusar serviço:', error);
    }
}


function Voltar() {
    // Redireciona para a página de lista de serviços (ou página anterior)
      window.location.href = "../index.html";
  }

  function avaliarClienteBtn(serviceId) {
    window.location.href = "../avaliarCliente/index.html?id=" + serviceId;  // Redireciona para a página de avaliação do cliente
}