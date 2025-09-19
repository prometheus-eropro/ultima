export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { cnpj, token } = req.body;

  if (!cnpj || !token) {
    return res.status(400).json({ error: "CNPJ e token são obrigatórios" });
  }

  try {
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/parceiros?filterByFormula=AND({A cnpj}='${cnpj}', {A token}='${token}')`;

    const airtableRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });

    const data = await airtableRes.json();

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "Parceiro não encontrado ou token inválido" });
    }

    return res.status(200).json(data.records[0].fields);
  } catch (err) {
    console.error("Erro ao consultar parceiro:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
