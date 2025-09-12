// /api/parceiros.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { cnpj, nome, cidade, ramo, desconto, beneficios, token } = req.body;

  if (!cnpj || !nome || !cidade || !ramo || !token) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  const parceiro = {
    records: [
      {
        fields: {
          cnpj,
          nome,
          cidade,
          ramo,
          desconto: desconto || "",
          beneficios: beneficios || "",
          ativo: false,
          token,
          dataCadastro: new Date().toISOString().split("T")[0],
        },
      },
    ],
  };

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_PARCEIROS}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parceiro),
      }
    );

    if (!airtableRes.ok) {
      const errorText = await airtableRes.text();
      return res.status(500).json({ error: "Erro ao salvar no Airtable", detalhes: errorText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
