document.addEventListener("DOMContentLoaded", function() {

    function isEmailValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Expressão regular para verificar o formato do e-mail
        return emailRegex.test(email);
    }
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
       
        document.getElementById('cep').addEventListener('input', function(event) {
            let value = event.target.value;
        
            // Remove qualquer coisa que não seja número
            value = value.replace(/\D/g, '');
        
            // Aplica o formato de CEP (xxxxx-xxx)
            if (value.length > 5) {
                value = value.slice(0, 5) + '-' + value.slice(5, 8);
            }
        
            // Limita o tamanho do CEP a 9 caracteres
            if (value.length > 9) {
                value = value.slice(0, 9);
            }
        
            event.target.value = value;
        });
        
        const specialtiesSelect = document.getElementById('specialties');
        specialtiesOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            specialtiesSelect.appendChild(optElement);
        });
    }
    function formatCep(cep) {
        return formattedCep = cep.slice(0, 5) + '-' + cep.slice(5);    }
    

    loadProfileData();

    function showAddress(address) {
        const formattedAddressElement = document.getElementById("formattedAddress");
        const fullAddress = `${address.logradouro}, ${address.bairro} - ${address.localidade} / ${address.uf}`;
        
        formattedAddressElement.textContent = fullAddress;
        document.getElementById("addressOutput").style.display = "block";
        
        // Atualiza o valor do campo "location" com o endereço completo
        document.getElementById("location").value = fullAddress;
    }
    

    function fetchAddress(cep) {
        const formattedCep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    
        if (formattedCep.length === 8) {  // Verifica se o CEP tem 8 dígitos
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
            document.getElementById("addressOutput").style.display = "none";  // Esconde os resultados se o CEP não for válido
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

    document.getElementById("buscarEndereco").addEventListener("click", function() {
        const cep = document.getElementById("cep").value.trim();
        if (cep) {
            fetchAddress(cep); // Realiza a busca do endereço
        }
    });

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
                specialtiesArray = data.split(';').map(item => item.trim()); // Aqui já está utilizando ponto e vírgula
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
    



    document.getElementById("editProfileButton").addEventListener("click", function() {
        // Carregar os dados do perfil antes de fazer a validação
        loadProfileData();
        const email = document.getElementById("email").value.trim();
        if (!isEmailValid(email)) {
            alert("Por favor, insira um e-mail válido.");
            return;  // Impede o envio do formulário se o e-mail não for válido
        }

        // Obter as especialidades selecionadas no momento
        const updatedSpecialties = [...document.querySelectorAll("#specialties option:checked")].map(option => option.value);
    
        // Verificar se o campo de localização está vazio
        const location = document.getElementById("location").value.trim();
        if (!location) {
            alert("Por favor, insira um endereço válido.");
            return; // Impede a execução da função se o campo estiver vazio
        }
    
        // Obter as especialidades atuais do perfil
        const currentSpecialties = [...document.querySelectorAll("#currentSpecialties span")].map(span => span.textContent.trim());
    
        // Verificar se não há especialidades atuais no perfil e se nenhuma nova foi selecionada
        if (currentSpecialties.length === 0 && updatedSpecialties.length === 0) {
            alert("Por favor, selecione pelo menos uma especialidade válida.");
            return; // Impede a execução da função se não houver especialidades selecionadas e nenhuma especialidade atual
        }
    
        // Atualizar o perfil com as especialidades e localização
        updateProfileWithSpecialties(updatedSpecialties);
    });
    

    
    document.getElementById("cep").addEventListener("input", function(event) {
        let cep = event.target.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        if (cep.length > 5) {
            cep = formatCep(cep);  // Aplica a formatação
        }
        event.target.value = cep;  // Atualiza o campo de entrada com o valor formatado
    
        if (cep.length === 10) {  // Se o CEP tiver 10 caracteres (incluindo o '-')
            fetchAddress(cep);  // Realiza a busca do endereço
        } else {
            document.getElementById("addressOutput").style.display = "none";  // Esconde os resultados se o CEP não tiver 10 caracteres
        }
    });
    

    function updateProfileWithSpecialties(specialties) {
        const name = document.getElementById("name").value;
        const location = document.getElementById("location").value;
        let email = document.getElementById("email").value;  // Pega o novo email diretamente do formulário
    
        const storedToken = localStorage.getItem("authToken");
        const currentEmail = localStorage.getItem("email");

        if (!currentEmail || !storedToken) {
            alert("Erro: Token de autenticação ou e-mail não encontrados.");
            return;
        }
    
        // Verifique se o email foi alterado, se sim, exiba a mensagem de confirmação
       
    
        // Limpeza das especialidades antes de enviar (remover espaços extras)
        const cleanedSpecialtiesToRemove = specialtiesToRemove.map(specialty => specialty.trim()).filter(Boolean);
        const cleanedSpecialties = specialties.map(specialty => specialty.trim()).filter(Boolean);
    
        // Garantir que as especialidades sejam separadas por ponto e vírgula
        const specialtiesString = cleanedSpecialties.join(";");  // Para as especialidades
        const specialtiesToRemoveString = cleanedSpecialtiesToRemove.join(";");  // Para as removidas
    
        // Dados a serem enviados ao back-end
        const profileData = {
            name: name,
            email: email,  // Usa o email atualizado
            location: location,  // Endereço completo
            specialtiesToRemove: specialtiesToRemoveString || '',  // Garante que seja uma string vazia caso esteja vazio
            specialties: specialtiesString || '',
        };
    
        console.log('Dados enviados para o back-end:', profileData);  // Para depuração
    
        fetch(`http://localhost:8080/api/professionals/${currentEmail}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedToken}`
            },
            body: JSON.stringify(profileData)
        })
        .then(response => response.text().then(data => ({ status: response.status, data: data })))  // Inclui status e dados na mesma resposta
        .then(({ status, data }) => {
            if (status === 400 && data === "Este e-mail já está registrado em outra conta.") {
                alert("Este e-mail já está registrado em outra conta.");
                return;
            }
        
            if (email !== currentEmail) {
                const confirmChange = confirm("Tem certeza que deseja alterar o e-mail? Será necessário relogar.");
                if (confirmChange) {
                    console.log('Resposta da API:', data);
                    alert('Perfil atualizado com sucesso!');
                    window.location.href = "../../Login/index.html";
                    return;  // Adiciona um "return" aqui para evitar que o código abaixo seja executado

                } else {
                    return;
                }
            }
            
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

