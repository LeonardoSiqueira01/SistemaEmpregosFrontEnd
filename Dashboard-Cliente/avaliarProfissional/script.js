document.getElementById('finalizarForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Obtendo o serviceId dinamicamente da URL
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id'); // Obtém o ID da URL

  // Obtendo os valores de avaliação e comentário
  const rating = document.getElementById('rating').value;
  const comment = document.getElementById('comment').value;

  // Criando o objeto de avaliação
  const clienteRating = {
    rating: parseFloat(rating),
    comment: comment
  };

  // Fazendo a requisição para finalizar o serviço
  fetch(`http://localhost:8080/api/services/${serviceId}/finalizar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    },
    body: JSON.stringify(clienteRating)
  })
  .then(response => response.json())
  .then(data => {
    if (data) {
      alert('Serviço finalizado com sucesso!');
      window.location.href = '../index.html'; // Redireciona de volta para a lista de serviços
    } else {
      alert('Erro ao finalizar o serviço.');
    }
  })
  .catch(error => {
    alert('Erro de comunicação com o servidor.');
  });
});
