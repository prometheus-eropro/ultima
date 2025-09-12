// /api/log.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { nomeCliente, idPublico, log_erros, origemConsulta, dataHora } = req.body;

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/log`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          nomeCliente,
          idPublico,
          log_erros,
          origemConsulta,
          dataHora
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro Airtable: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Erro ao salvar log:", err);
    return res.status(500).json({ error: "Erro ao salvar log" });
  }
}
