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

        if (data.length === 0) {
            lista.innerHTML = "<li>Nenhum serviço solicitado encontrado.</li>";
            return;
        }

        data.forEach(servico => {
            const item = document.createElement("li");
            const statusClass = servico.status.toLowerCase(); // Ex: "aberto", "iniciado", etc.
            const formattedDate = formatarData(servico.inicioServico);
            
            item.classList.add("service-item");
            
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
                <button class="btn-cancelar" onclick="cancelarSolicitacao(${servico.id})">Cancelar Solicitação</button>
                <button onclick="viewProfile('${servico.clientEmail}')">Visualizar Perfil do Cliente</button>
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

function cancelarSolicitacao(idServico) {
    const token = localStorage.getItem("authToken");

    if (confirm("Tem certeza que deseja cancelar a solicitação deste serviço?")) {
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
            alert("Solicitação cancelada com sucesso.");
            location.reload(); // Recarrega a lista de serviços
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