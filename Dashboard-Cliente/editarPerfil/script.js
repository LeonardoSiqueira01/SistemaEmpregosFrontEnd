document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('authToken');
    const currentEmail = localStorage.getItem('email');
  
    if (!token || !currentEmail) {
      document.getElementById('responseMessage').textContent = "Você precisa estar logado.";
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/client/${currentEmail}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const dados = await response.json();
        document.getElementById('name').value = dados.name;
        document.getElementById('email').value = dados.email;
      } else {
        const erro = await response.text();
        document.getElementById('responseMessage').textContent = erro;
      }
    } catch (error) {
      document.getElementById('responseMessage').textContent = "Erro ao carregar perfil: " + error.message;
    }
  });
  
  document.getElementById('editForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    const token = localStorage.getItem('authToken');
    const currentEmail = localStorage.getItem('email');
  
    if (!token || !currentEmail) {
      document.getElementById('responseMessage').textContent = "Você precisa estar logado.";
      return;
    }
  
    const dados = {
      name: name || null,
      email: email || null,
      password: password || null
    };
  
    try {
      const response = await fetch(`http://localhost:8080/api/client/${currentEmail}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
  
      const result = await response.text();
      document.getElementById('responseMessage').textContent = result;
  
      if (response.ok && email && email !== currentEmail) {
        localStorage.setItem('email', email); // atualiza localStorage se o e-mail mudou
      }
    } catch (error) {
      document.getElementById('responseMessage').textContent = "Erro ao atualizar perfil: " + error.message;
    }
  });
  function cancelEdit() {
    window.location.href = "../index.html";
}