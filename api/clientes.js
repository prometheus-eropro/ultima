// pages/api/clientes.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const id = (req.query.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "ID não fornecido" });
  }

  try {
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CLIENTES}?filterByFormula=${encodeURIComponent(`{idPublico}='${id}'`)}`;

    const airtableRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });

    const data = await airtableRes.json();

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.status(200).json(data.records[0].fields);
  } catch (err) {
    console.error("Erro ao buscar cliente:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}