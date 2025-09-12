// consulta.js

const form = document.getElementById("form-consulta");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("idpublico").value.trim();

  if (!id) {
    alert("Informe o ID público.");
    return;
  }

  try {
    const response = await fetch(`/api/clientes?id=${encodeURIComponent(id)}`);

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("cliente", JSON.stringify(data));
      window.location.href = "/painelcliente.html";
    } else if (response.status === 404) {
      alert("Cliente não encontrado.");
    } else {
      alert("Erro ao buscar dados do cliente.");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro ao conectar com o servidor.");
  }
});
