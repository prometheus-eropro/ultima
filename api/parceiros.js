// /api/parceiros.js
export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_TOKEN;

  if (req.method === "POST") {
    // Cadastrar novo parceiro
    try {
      const { cnpj, token: parceiroToken, nome, cidade, ramo, desconto, beneficios } = req.body;

      const response = await fetch(`https://api.airtable.com/v0/${baseId}/parceiros`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            cnpj,
            token: parceiroToken,
            nome,
            cidade,
            ramo,
            desconto,
            beneficios,
            ativo: false,
            dataCadastro: new Date().toISOString().split("T")[0]
          }
        })
      });

      if (!response.ok) throw new Error(`Erro Airtable: ${response.status}`);

      const data = await response.json();
      return res.status(200).json(data.fields);
    } catch (err) {
      console.error("Erro ao salvar parceiro:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  if (req.method === "GET") {
    // Login de parceiro
    const cnpj = (req.query.cnpj || "").trim();
    const parceiroToken = (req.query.token || "").trim();

    if (!cnpj || !parceiroToken) {
      return res.status(400).json({ error: "CNPJ e token obrigatórios" });
    }

    try {
      const url = `https://api.airtable.com/v0/${baseId}/parceiros?filterByFormula=AND({cnpj}='${cnpj}', {token}='${parceiroToken}')`;

      const response = await fetch(encodeURI(url), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Erro Airtable: ${response.status}`);

      const data = await response.json();

      if (!data.records.length) {
        return res.status(404).json({ error: "Parceiro não encontrado ou token incorreto" });
      }

      return res.status(200).json(data.records[0].fields);
    } catch (err) {
      console.error("Erro ao buscar parceiro:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
