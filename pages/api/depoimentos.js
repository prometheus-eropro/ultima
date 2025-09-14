export default async function handler(req, res) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: "Configuração inválida." });
  }

  const tabela = "Depoimentos";
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tabela)}`;

  if (req.method === "GET") {
    try {
      const response = await fetch(`${url}?pageSize=30`, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      const data = await response.json();
      const records = (data.records || []).map(r => ({
        id: r.id,
        autor: r.fields.Autor || "",
        mensagem: r.fields.Mensagem || "",
        data: r.fields.Data || "",
      }));
      return res.status(200).json(records);
    } catch (e) {
      return res.status(500).json({ error: "Erro ao buscar depoimentos." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}
