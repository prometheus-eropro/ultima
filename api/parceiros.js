import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { cnpj, token } = req.body;

    if (!cnpj || !token) {
      return res.status(400).json({ error: "CNPJ e Token são obrigatórios" });
    }

    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_PARCEIROS}?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}')`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return res.status(401).json({ error: "Parceiro inválido" });
    }

    return res.status(200).json(data.records[0].fields);
  } catch (err) {
    console.error("Erro em /parceiros:", err);
    return res.status(500).json({ error: "Erro interno ao buscar parceiro" });
  }
}
