// api/consulta.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "erro", mensagem: "Método não permitido" });
  }

  const { tipo, cnpj, token } = req.body;

  if (!tipo || !cnpj || !token) {
    return res.status(400).json({ status: "erro", mensagem: "Campos obrigatórios ausentes" });
  }

  if (tipo === "parceirosLogin") {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_PARCEIROS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      if (!baseId || !tabela || !apiKey) {
        console.error("❌ Variável de ambiente ausente.");
        return res.status(500).json({ status: "erro", mensagem: "Configuração do servidor incompleta" });
      }

      const formula = `AND({cnpj}="${cnpj}", {token}="${token}", {ativo}=1)`;
      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;

      console.log("🌐 Consultando Airtable:", url);

      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error("❌ Erro da Airtable:", resposta.status, texto);
        return res
          .status(resposta.status)
          .json({ status: "erro", mensagem: "Erro ao acessar Airtable" });
      }

      const dados = await resposta.json();
      console.log("✅ Resposta do Airtable:", dados);

      if (dados.records && dados.records.length > 0) {
        return res.status(200).json(dados.records[0].fields);
      } else {
        return res.status(401).json({ status: "erro", mensagem: "CNPJ ou Token inválidos" });
      }
    } catch (erro) {
      console.error("💥 ERRO INTERNO:", erro);
      return res.status(500).json({ status: "erro", mensagem: erro.message });
    }
  }

  return res.status(400).json({ status: "erro", mensagem: "Tipo inválido ou não suportado" });
}
