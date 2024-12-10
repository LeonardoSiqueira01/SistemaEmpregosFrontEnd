// Mock API endpoint
const API_BASE_URL = "http://localhost:8080/api/services";
const PROFESSIONAL_API_URL = "http://localhost:8080/api/professionals";

// Referências ao formulário e seções
const serviceForm = document.getElementById("serviceForm");
const servicesList = document.getElementById("servicesList");
const professionalsList = document.getElementById("professionalsList");

// Filtragem de serviços e profissionais
const serviceFilterStatus = document.getElementById("serviceFilterStatus");
const specialtyFilter = document.getElementById("specialtyFilter");
const ratingFilter = document.getElementById("ratingFilter");
const ratingValue = document.getElementById("ratingValue");

// Mudança na nota mínima para profissionais
ratingFilter.addEventListener('input', () => {
    ratingValue.innerText = ratingFilter.value;
});

// Carregar serviços e profissionais ao iniciar
window.onload = () => {
    loadServices();
    loadProfessionals();
};

// Alternar seções
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Carregar serviços
function loadServices() {
    fetch(`${API_BASE_URL}`)
        .then(response => response.json())
        .then(services => {
            renderServices(services);
        })
        .catch(error => console.error("Erro ao carregar serviços:", error));
}

// Renderizar serviços
function renderServices(services) {
    const statusFilter = serviceFilterStatus.value;
    const filteredServices = services.filter(service => !statusFilter || service.status === statusFilter);
    servicesList.innerHTML = "";
    filteredServices.forEach(service => addServiceToTable(service));
}

// Adicionar serviço à tabela
function addServiceToTable(service) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${service.name}</td>
        <td>${service.description}</td>
        <td>${service.specialty}</td>
        <td>${service.status}</td>
        <td class="actions">
            ${service.status === "em aberto" ? `<button onclick="startService(${service.id})">Iniciar</button>` : ""}
            ${service.status === "iniciado" ? `<button onclick="finalizeService(${service.id})">Finalizar</button>` : ""}
        </td>
    `;
    servicesList.appendChild(row);
}

// Iniciar serviço
function startService(serviceId) {
    fetch(`${API_BASE_URL}/${serviceId}/start`, { method: "PUT" })
        .then(response => response.ok ? location.reload() : alert('Erro ao iniciar serviço'));
}

// Finalizar serviço
function finalizeService(serviceId) {
    fetch(`${API_BASE_URL}/${serviceId}/finalize`, { method: "PUT" })
        .then(response => response.ok ? location.reload() : alert('Erro ao finalizar serviço'));
}

// Carregar profissionais
function loadProfessionals() {
    fetch(`${PROFESSIONAL_API_URL}`)
        .then(response => response.json())
        .then(professionals => {
            renderProfessionals(professionals);
        })
        .catch(error => console.error("Erro ao carregar profissionais:", error));
}

// Renderizar profissionais
function renderProfessionals(professionals) {
    const filteredProfessionals = professionals.filter(professional => {
        const matchesSpecialty = [...specialtyFilter.selectedOptions].map(option => option.value).includes(professional.specialty);
        const matchesRating = professional.rating >= ratingFilter.value;
        return matchesSpecialty && matchesRating;
    });

    professionalsList.innerHTML = "";
    filteredProfessionals.forEach(professional => addProfessionalToTable(professional));
}

// Adicionar profissional à tabela
function addProfessionalToTable(professional) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${professional.name}</td>
        <td>${professional.specialty}</td>
        <td>${professional.rating}</td>
        <td><button>Contato</button></td>
    `;
    professionalsList.appendChild(row);
}

// Adicionar serviço (exemplo de lógica de envio para a API)
serviceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(serviceForm);
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        specialty: formData.get('specialty')
    };

    fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(service => {
        alert("Serviço cadastrado com sucesso!");
        serviceForm.reset();
        loadServices();
    })
    .catch(error => console.error("Erro ao cadastrar serviço:", error));
});
