document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("service-list");
    const filterButton = document.getElementById("apply-filters");
    const cepButton = document.getElementById("search-cep");

    // Função para buscar endereço pelo CEP
    const fetchAddressByCEP = async (cep) => {
        const cepInput = cep.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cepInput.length !== 8) {
            alert("Digite um CEP válido com 8 dígitos.");
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepInput}/json/`);
            if (!response.ok) throw new Error("Erro ao buscar endereço.");
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            // Preencher os campos com os dados do endereço
            document.getElementById("city").value = data.localidade;
            document.getElementById("logradouro").textContent = data.logradouro || "N/A";
            document.getElementById("bairro").textContent = data.bairro || "N/A";
            document.getElementById("estado").textContent = data.uf || "N/A";
            document.getElementById("address-info").style.display = "block";
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar o endereço. Tente novamente.");
        }
    };

    // Adicionar evento ao botão de busca por CEP
    cepButton.addEventListener("click", () => {
        const cep = document.getElementById("cep").value;
        fetchAddressByCEP(cep);
    });

    // Função para buscar e filtrar serviços
    const fetchServices = (filters = {}) => {
        // Simulação de serviços (você pode substituir por uma chamada de API real)
        const mockServices = [
            { id: 1, name: "Manutenção Elétrica", city: "São Paulo", specialty: "Eletricista" },
            { id: 2, name: "Reparo Hidráulico", city: "Rio de Janeiro", specialty: "Encanador" }
        ];

        const filtered = mockServices.filter(service => {
            return (
                (!filters.city || service.city.toLowerCase().includes(filters.city.toLowerCase())) &&
                (!filters.specialty || service.specialty.toLowerCase().includes(filters.specialty.toLowerCase()))
            );
        });

        renderServices(filtered);
    };

    const renderServices = (services) => {
        serviceList.innerHTML = "";
        if (services.length === 0) {
            serviceList.innerHTML = "<p>Nenhum serviço encontrado.</p>";
            return;
        }
        services.forEach(service => {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>${service.name}</h3>
                <p><strong>Cidade:</strong> ${service.city}</p>
                <p><strong>Especialidade:</strong> ${service.specialty}</p>
                <button onclick="requestService(${service.id})">Solicitar Vinculação</button>
            `;
            serviceList.appendChild(li);
        });
    };

    filterButton.addEventListener("click", () => {
        const city = document.getElementById("city").value;
        const specialty = document.getElementById("specialty").value;
        fetchServices({ city, specialty });
    });

    fetchServices(); // Carregar serviços iniciais
});
 // Função para fazer logout
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    window.location.href = "../Login/index.html"; // Redireciona para a página de login
  }

  document.getElementById("logout").addEventListener("click", logout);
