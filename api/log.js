import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { idPublico, cnpj, statusCliente, acao, mensagem } = req.body;

    if (!acao) {
      return res.status(400).json({ error: "Ação é obrigatória" });
    }

    const body = {
      records: [
        {
          fields: {
            idPublico: idPublico || "",
            cnpj: cnpj || "",
            statusCliente: statusCliente || "N/A",
            acao,
            mensagem: mensagem || "",
            dataHora: new Date().toISOString(),
          },
        },
      ],
    };

    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LOG}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro em /log:", err);
    return res.status(500).json({ error: "Erro interno ao salvar log" });
  }
}
