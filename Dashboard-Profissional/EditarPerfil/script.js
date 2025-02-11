document.addEventListener("DOMContentLoaded", function() {
    // Função para carregar as especialidades existentes
    function loadSpecialties() {
        const specialtiesOptions = [
            "Ajudante de Mestre de Obras", "Aulas particulares", "Arquitetura e urbanismo", 
            "Assistente virtual", "Babá", "Babysitter (cuidador de crianças)", "Barbeiro", 
            "Carpinteiro", "Cabeleireiro", "Consultoria de imagem", "Consultoria de inovação e transformação digital", 
            "Consultoria de marketing", "Consultoria em finanças pessoais", "Consultoria em produtividade", 
            "Consultoria jurídica", "Contador", "Cozinheiro", "Cuidador de idosos", "Dentista", 
            "Desentupidora", "Design gráfico", "Diarista", "Eletricista", "Encanador", "Engenheiro", 
            "Estética (depilação, manicure, pedicure)", "Fisioterapeuta", "Freelancer (diversas áreas)", 
            "Free Lancer de Designer", "Fotógrafo", "Gestão de eventos", "Gestão de redes sociais", 
            "Gerente de projetos", "Jardinagem", "Limpeza residencial", "Mestre de Obras", "Marceneiro", 
            "Manutenção de computadores", "Manutenção de eletrodomésticos", "Maquiador", "Médico (atendimentos particulares)", 
            "Nutricionista", "Organização de ambientes e espaços", "Padeiro", "Personal trainer", 
            "Pintor", "Produção de conteúdo para blogs e mídias sociais", "Reformas e reparos (gerais)", 
            "Recepcionista", "Recrutamento e seleção", "Redator", "Segurança privada", 
            "Serviços de TI (tecnologia da informação)", "Serviços de comida (chef particular)", 
            "Serviços de transporte (motoboy, fretes)", "Serviços Gerais", "Terapeuta", 
            "Translator (tradução)", "Veterinário", "Web designer", "Web developer (desenvolvedor de sites)", 
            "Zelador"
        ];

        const specialtiesSelect = document.getElementById('specialties');
        specialtiesOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            specialtiesSelect.appendChild(optElement);
        });
    }
    
    loadProfileData();

    // Função para exibir o endereço formatado após a consulta do CEP
    function showAddress(address) {
        const formattedAddressElement = document.getElementById("formattedAddress");
        const fullAddress = `${address.logradouro}, ${address.bairro} - ${address.localidade} / ${address.uf}`;
        
        formattedAddressElement.textContent = fullAddress;
        document.getElementById("addressOutput").style.display = "block";
        
        // Atualiza o valor do campo "location" com o endereço completo
        document.getElementById("location").value = fullAddress;
    }

    function fetchAddress(cep) {
        // Remover qualquer caractere não numérico, incluindo o hífen
        const formattedCep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        // Verificar se o CEP possui 8 dígitos após a remoção dos caracteres não numéricos
        if (formattedCep.length === 8) { // Para 8 dígitos válidos
            fetch(`https://viacep.com.br/ws/${formattedCep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('CEP não encontrado!');
                        document.getElementById("addressOutput").style.display = "none";
                    } else {
                        showAddress(data);
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar o CEP:', error);
                    alert('Erro ao buscar o CEP.');
                });
        } else {
            // Se o CEP não tiver 8 caracteres após o tratamento, esconder o resultado
            document.getElementById("addressOutput").style.display = "none";
        }
    }
    
    document.getElementById("location").addEventListener("input", function(event) {
        const cep = event.target.value;
        if (cep.replace(/\D/g, '').length === 8) {  // Quando o CEP tem 8 dígitos (removendo qualquer não numérico)
            fetchAddress(cep); // Realiza a busca do endereço
        } else {
            document.getElementById("addressOutput").style.display = "none";  // Esconde os resultados caso o CEP não tenha 8 dígitos
        }
    });

    // Função para carregar as especialidades atuais
    function loadCurrentSpecialties() {
        const email = localStorage.getItem("email");
        const storedToken = localStorage.getItem("authToken");

        fetch(`http://localhost:8080/api/professionals/${email}/specialties`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${storedToken}`
            }
        })
        .then(response => response.text())
        .then(data => {
            let specialtiesArray = [];
            if (data.trim() !== '') {
                specialtiesArray = data.split(';').map(item => item.trim());
            }
            displayCurrentSpecialties(specialtiesArray);  
        })
        .catch(error => {
            console.error('Erro ao carregar as especialidades:', error);
            alert('Erro ao carregar as especialidades.');
        });
    }

    function loadProfileData() {
        const email = localStorage.getItem("email");
        const storedToken = localStorage.getItem("authToken");

        fetch(`http://localhost:8080/api/professionals/${email}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${storedToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Carrega o nome e o local (endereço) nos campos correspondentes
            document.getElementById("name").value = data.name;
            document.getElementById("email").value = data.email;
            document.getElementById("location").value = data.location;

            // Carrega as especialidades atuais
            const specialtiesArray = data.specialties.split(';').map(item => item.trim());
            displayCurrentSpecialties(specialtiesArray);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados do perfil:', error);
            alert('Erro ao carregar os dados do perfil.');
        });
    }

    let specialtiesToRemove = []; // Lista para armazenar as especialidades removidas

    function displayCurrentSpecialties(currentSpecialties) {
        const currentSpecialtiesContainer = document.getElementById("currentSpecialties");
        currentSpecialtiesContainer.innerHTML = '';  // Limpa a lista antes de exibir novamente
    
        currentSpecialties.forEach(specialty => {
            const span = document.createElement('span');
            span.textContent = specialty;
            span.classList.add('specialty');
    
            // Botão para remoção de especialidade
            const removeButton = document.createElement('button');
            removeButton.textContent = 'X';
            removeButton.classList.add('remove-specialty');
            removeButton.addEventListener('click', function() {
                removeSpecialty(specialty);  // Remove a especialidade clicada
            });
    
            span.appendChild(removeButton);
            currentSpecialtiesContainer.appendChild(span);
        });
    }
    
    document.getElementById("backButton").addEventListener("click", function() {
        window.history.back();  // Volta para a página anterior
    });

    // Atualizar a função de remoção de especialidades
    function removeSpecialty(specialtyToRemove) {
        specialtyToRemove = specialtyToRemove.trim();  // Remove espaços extras

        // Cria uma lista de especialidades, mantendo as compostas intactas
        let specialties = [...document.querySelectorAll("#currentSpecialties span")]
                            .map(span => span.textContent.replace('X', '').trim());

        // Filtra a lista para remover a especialidade exata (sem fragmentação)
        specialties = specialties.filter(specialty => specialty !== specialtyToRemove);

        // Adiciona a especialidade removida à lista de especialidades a serem removidas
        specialtiesToRemove.push(specialtyToRemove);

        // Atualiza a lista de especialidades no front-end
        displayCurrentSpecialties(specialties);  
    }

    document.getElementById("editProfileButton").addEventListener("click", function() {
        // Carregar os dados do perfil antes de fazer a validação
        loadProfileData();

        // Obter as especialidades selecionadas no momento
        const updatedSpecialties = [...document.querySelectorAll("#specialties option:checked")].map(option => option.value);

        // Verificar se o campo de localização está vazio
        const location = document.getElementById("location").value.trim();
        if (!location) {
            alert("Por favor, insira um endereço válido.");
            return; // Impede a execução da função se o campo estiver vazio
        }

        // Verificar se pelo menos uma especialidade foi selecionada
        if (updatedSpecialties.length === 0 || updatedSpecialties.some(specialty => specialty.trim() === "")) {
            alert("Por favor, selecione pelo menos uma especialidade válida.");
            return; // Impede a execução da função se não houver especialidades selecionadas
        }

        // Atualizar o perfil com as especialidades e localização
        updateProfileWithSpecialties(updatedSpecialties);
    });

    // Atualizar a função de envio para o backend
    function updateProfileWithSpecialties(specialties) {
        const name = document.getElementById("name").value;
        const location = document.getElementById("location").value;  // Endereço completo

        const email = localStorage.getItem("email");
        const storedToken = localStorage.getItem("authToken");

        if (!email || !storedToken) {
            alert("Erro: Token de autenticação ou e-mail não encontrados.");
            return;
        }

        // Limpeza das especialidades antes de enviar (remover espaços extras)
        const cleanedSpecialtiesToRemove = specialtiesToRemove.map(specialty => specialty.trim()).filter(Boolean);
        const cleanedSpecialties = specialties.map(specialty => specialty.trim()).filter(Boolean);

        // Dados a serem enviados ao back-end
        const profileData = {
            name: name,
            email: email,
            location: location,  // Endereço completo
            specialtiesToRemove: cleanedSpecialtiesToRemove.join("; "),  // Especialidades removidas
            specialties: cleanedSpecialties.join("; "),  // Especialidades restantes
        };

        console.log('Dados enviados para o back-end:', profileData);  // Para depuração

        fetch(`http://localhost:8080/api/professionals/${email}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedToken}`
            },
            body: JSON.stringify(profileData)
        })
        .then(response => response.text())
        .then(data => {
            console.log('Resposta da API:', data);
            alert('Perfil atualizado com sucesso!');
            window.history.back();  // Volta para a página anterior
        })
        .catch(error => {
            alert('Erro ao atualizar o perfil: ' + error.message);
        });
    }

    loadSpecialties();
    loadCurrentSpecialties();
});
