const email = localStorage.getItem("email");

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("servicos-lista");
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:8080/api/professionals/me/servicos-solicitados", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar serviços");
        }
        return response.json();
    })
    .then(data => {
        lista.innerHTML = "";
    
        // Filtra os serviços que não estão finalizados
        const servicosNaoFinalizados = data.filter(servico => servico.status.toLowerCase() !== "finalizado");
    
        if (servicosNaoFinalizados.length === 0) {
            lista.innerHTML = "<li>Nenhum serviço solicitado encontrado.</li>";
            return;
        }
    
        servicosNaoFinalizados.forEach(servico => {
            const item = document.createElement("li");
            const statusClass = servico.status.toLowerCase(); 
            const formattedDate = formatarData(servico.inicioServico);
    
            item.classList.add("service-item");
    
            let botoesHTML = "";
    
            if (!servico.professionalEmail) {
                botoesHTML = `
                    <button class="btn-remover-outro" onclick="cancelarSolicitacao(${servico.id}, '${servico.professionalEmail}')" style="width: 40%; background-color: #ff4d4d; color: white;">Cancelar solicitação</button>
                    <button onclick="viewProfile('${servico.clientEmail}')">Visualizar Perfil do Cliente</button>
                `;
            } else if (servico.professionalEmail === email) {
                botoesHTML = `
                    <p class="teste" style="background-color: rgba(137, 191, 116, 0.3); color: green; font-weight: bold; padding: 10px; margin: 10px 0; border-radius: 5px;">
                        O cliente aceitou sua solicitação de serviço.
                    </p>
                    <button onclick="viewProfile('${servico.clientEmail}')">Visualizar Perfil do Cliente</button>
                    <button class="btn-remover-outro" onclick="cancelarSolicitacao(${servico.id}, '${servico.professionalEmail}')" style="width: 40%; background-color: #ff4d4d; color: white;">Ocultar solicitação</button>
                `;
            } else {
                botoesHTML = `
                    <button class="btn-remover-outro" onclick="cancelarSolicitacao(${servico.id}, '${servico.professionalEmail}')" style="width: 100%; background-color: #ff4d4d; color: white; padding: 10px; margin-top: 10px;">
                        Serviço iniciado por outro profissional. Clique aqui para remover essa solicitação.
                    </button>
                `;
            }
    
            item.innerHTML = `
                <div class="service-header">
                    <h3 class="service-name">${servico.name}</h3>
                    <span class="service-status ${statusClass}">${servico.status}</span>
                </div>
                <p><strong>Especialidade:</strong> ${servico.specialty || "Não informada"}</p>
                <p><strong>Data do Serviço:</strong> ${formattedDate}</p>
                <p><strong>Descrição:</strong> ${servico.description || "Sem descrição"}</p>
                <p><strong>Localização:</strong> ${servico.location || "Não especificada"}</p>
                <div class="client-info-container">
                    <p><strong>Nome do Cliente:</strong> ${servico.clientName}</p>
                    <p><strong>Email do Cliente:</strong> ${servico.clientEmail}</p>
                </div>
                ${botoesHTML}
            `;
    
            lista.appendChild(item);
        });
    })
    
    .catch(error => {
        console.error(error);
        lista.innerHTML = "<li>Erro ao carregar os serviços.</li>";
    });
});

function formatarData(dataISO) {
    if (!dataISO) return "Sem data";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
}
function cancelarSolicitacao(idServico, professionalEmail) {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("email");

    const isMesmoProfissional = professionalEmail === email;
    const mensagemConfirmacao = isMesmoProfissional
        ? "Tem certeza que deseja ocultar a solicitação deste serviço?"
        : "Tem certeza que deseja cancelar a solicitação deste serviço?";
        console.log("[" + professionalEmail + "]");
        console.log("[" + email + "]");
        

    if (confirm(mensagemConfirmacao)) {
        fetch(`http://localhost:8080/api/professionals/me/remover-solicitacao/${idServico}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }

            const mensagemSucesso = isMesmoProfissional
                ? "Solicitação ocultada com sucesso."
                : "Solicitação cancelada com sucesso.";

            alert(mensagemSucesso);
            location.reload();
        })
        .catch(error => {
            console.error("Erro ao cancelar solicitação:", error);
            alert("Erro ao cancelar solicitação: " + error.message);
        });
    }
}



function cancelEdit() {
    window.location.href = "../index.html";
}
function viewProfile(email) {
    window.open('http://127.0.0.1:5500/dashboard-cliente/visualizarPerfis/index.html?email=' + encodeURIComponent(email), '_blank');
}