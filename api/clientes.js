import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { idPublico } = req.query;
    if (!idPublico) {
      return res.status(400).json({ error: "idPublico é obrigatório" });
    }

    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CLIENTES}?filterByFormula={idPublico}='${idPublico}'`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.status(200).json(data.records[0].fields);
  } catch (err) {
    console.error("Erro em /clientes:", err);
    return res.status(500).json({ error: "Erro interno ao buscar cliente" });
  }
}
