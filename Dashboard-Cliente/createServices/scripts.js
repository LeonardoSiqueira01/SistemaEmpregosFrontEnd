// Função para criar um novo serviço
function createService(token, serviceData) {
    fetch('http://localhost:8080/api/services', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,  // Inclui o token no cabeçalho de autenticação
            'Content-Type': 'application/json'   // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(serviceData)  // Envia os dados do serviço como JSON
    })
    .then(response => {
        if (response.ok) {
            return response.json();  // Se a resposta for OK, converte para JSON
        } else {
            throw new Error('Erro ao criar o serviço');  // Caso contrário, lança um erro
        }
    })
    .then(data => {
        console.log('Serviço criado:', data);  // Exibe os dados do serviço criado no console
        // Aqui você pode adicionar código para atualizar a UI com a resposta, por exemplo:
        alert('Serviço criado com sucesso!');
    })
    .catch(error => {
        console.error('Erro:', error);  // Exibe o erro no console
        alert('Erro ao criar o serviço');
    });
}

// Exemplo de como chamar a função
const token = 'seu-token-jwt';  // Substitua pelo token JWT real
const serviceData = {
    name: 'Novo Serviço',
    description: 'Descrição do novo serviço',
    // Adicione outros campos que são necessários para o cadastro do serviço
};

// Quando o formulário for submetido, chamamos a função para criar o serviço
document.getElementById('serviceForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Impede o envio do formulário
    createService(token, serviceData);  // Cria o serviço usando o token e os dados fornecidos
});
// Função para voltar para a tela anterior
function goBack() {
    window.history.back();
}
