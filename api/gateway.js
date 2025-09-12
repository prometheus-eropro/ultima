// gateway.js

const form = document.getElementById("form-login");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cnpj = document.getElementById("cnpj").value.trim();
  const token = document.getElementById("token").value.trim();

  if (!cnpj || !token) {
    alert("CNPJ e Token são obrigatórios.");
    return;
  }

  try {
    const response = await fetch("/api/consulta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cnpj, token })
    });

    if (response.status === 200) {
      const data = await response.json();
      if (data.ativo) {
        window.location.href = "/painel.html";
      } else {
        alert("Seu cadastro ainda não foi aprovado.");
      }
    } else if (response.status === 401) {
      alert("CNPJ ou Token inválidos.");
    } else {
      alert("Erro ao validar parceiro. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
    alert("Erro de rede. Tente novamente mais tarde.");
  }
});
