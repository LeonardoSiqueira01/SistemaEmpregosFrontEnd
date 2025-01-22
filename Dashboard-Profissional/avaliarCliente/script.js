document.addEventListener('DOMContentLoaded', function() {
    // Obtendo o ID do serviço e o email do profissional do localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');  // Altere para 'id', que é o parâmetro na URL
    const professionalEmail = localStorage.getItem("email");

    // Verificando se os valores estão corretos
    console.log('Service ID:', serviceId);
    console.log('Professional Email:', professionalEmail);

    if (!serviceId || !professionalEmail) {
        alert('ID do serviço ou email do profissional não encontrado.');
        return;
    }

    // Atribuindo o valor do serviceId ao campo oculto
    document.getElementById('serviceId').value = serviceId;

    // Não é mais necessário o campo 'professionalId' se você usar o email
    // Como o email está sendo passado diretamente no corpo da requisição, você não precisa definir esse valor em um campo oculto.

    // Evento para o envio do formulário
    document.getElementById('avaliarClienteForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        // Validação básica da nota
        if (rating < 1 || rating > 5) {
            alert('Por favor, insira uma nota de 1 a 5.');
            return;
        }

        const feedback = {
            rating: parseFloat(rating),
            comment: comment
        };

        const token = localStorage.getItem("authToken");

        fetch(`http://localhost:8080/api/services/${serviceId}/professional/${professionalEmail}/rate-client`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(feedback)
})
.then(response => {
    // Verifica se o status da resposta é 2xx (sucesso)
    if (!response.ok) {
        throw new Error('Erro ao enviar avaliação: ' + response.statusText);
    }

    // Tenta parsear a resposta como JSON, se falhar, trata como texto simples
    return response.text();
})
.then(data => {
    // Verifica se a resposta contém a mensagem esperada
    const responseMessageElement = document.getElementById('responseMessage');
    if (data === "Avaliação registrada com sucesso!") {
        responseMessageElement.textContent = 'Avaliação enviada com sucesso!';
        responseMessageElement.classList.add('success');
        responseMessageElement.classList.remove('error');
        setTimeout(() => window.location.href = '../index.html', 3000); // Redireciona após 3 segundos
    } else {
        // Se a resposta não for a esperada, exibe uma mensagem de erro
        responseMessageElement.textContent = 'Erro ao enviar avaliação. Tente novamente.';
        responseMessageElement.classList.add('error');
        responseMessageElement.classList.remove('success');
    }
})
.catch(error => {
    // Captura qualquer erro durante a requisição e exibe uma mensagem de erro
    const responseMessageElement = document.getElementById('responseMessage');
    responseMessageElement.textContent = 'Erro ao enviar avaliação: ' + error.message;
    responseMessageElement.classList.add('error');
    responseMessageElement.classList.remove('success');
});

     
    });
});
