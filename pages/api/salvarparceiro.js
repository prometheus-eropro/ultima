// salvarparceiro.js

const form = document.getElementById("form-parceiro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cnpj = document.getElementById("cnpj").value.trim();
  const token = document.getElementById("token").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const ramo = document.getElementById("ramo").value.trim();
  const desconto = document.getElementById("desconto").value.trim();
  const beneficios = document.getElementById("beneficios").value.trim();

  const data = {
    cnpj,
    token,
    nome,
    cidade,
    ramo,
    desconto,
    beneficios,
    ativo: false, // SEMPRE começa como falso
    dataCadastro: new Date().toISOString().split("T")[0]
  };

  try {
    const response = await fetch("/api/parceiros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Cadastro enviado com sucesso!");
      window.location.href = `https://api.whatsapp.com/send/?phone=5528999789980&text=Olá+${encodeURIComponent(
        nome
      )}%2C+seu+cadastro+foi+recebido+com+sucesso%21+Aguarde+nossa+aprova%C3%A7%C3%A3o.`;
    } else {
      alert("Erro ao enviar cadastro. Verifique os dados e tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao salvar parceiro:", error);
    alert("Erro de rede ao salvar parceiro.");
  }
});
