// api/consulta.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "erro", mensagem: "Método não permitido" });
  }

  const { tipo, cnpj, token, cpf, idPublico } = req.body;

  if (!tipo) {
    return res.status(400).json({ status: "erro", mensagem: "Campo 'tipo' obrigatório" });
  }

  if (tipo === "parceirosLogin") {
    // ... seu código atual (sem alterações) ...
  }

  if (tipo === "validarCliente") {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_CLIENTES; // 🔥 precisa definir no .env
      const apiKey = process.env.AIRTABLE_API_KEY;

      if (!baseId || !tabela || !apiKey) {
        console.error("❌ Variável de ambiente ausente.");
        return res.status(500).json({ status: "erro", mensagem: "Configuração do servidor incompleta" });
      }

      // Usa CPF ou ID Público
      let formula;
      if (cpf) {
        formula = `OR({cpf}="${cpf}", {idPublico}="${cpf}")`;
      } else if (idPublico) {
        formula = `{idPublico}="${idPublico}"`;
      } else {
        return res.status(400).json({ status: "erro", mensagem: "CPF ou ID Público obrigatório" });
      }

      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;
      console.log("🌐 Validando cliente:", url);

      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        return res.status(resposta.status).json({ status: "erro", mensagem: "Erro ao acessar Airtable" });
      }

      if (dados.records && dados.records.length > 0) {
        return res.status(200).json({ cliente: dados.records[0].fields });
      } else {
        return res.status(404).json({ status: "erro", mensagem: "Cliente não encontrado" });
      }
    } catch (erro) {
      console.error("💥 ERRO INTERNO:", erro);
      return res.status(500).json({ status: "erro", mensagem: erro.message });
    }
  }

  return res.status(400).json({ status: "erro", mensagem: "Tipo inválido ou não suportado" });
}
