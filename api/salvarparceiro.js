// /api/salvarParceiro.js
export default async function handler(req, res) {
  const { nome, cnpj, cidade, ramo, whatsapp } = req.body;

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "parceiros";

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        nome,
        cnpj,
        cidade,
        ramo,
        whatsapp,
        ativo: true,
        dataCadastro: new Date().toISOString().split("T")[0],
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: data });
  }
}
