// API segura para listar/cadastrar Benefícios
export default async function handler(req, res) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: "Configuração inválida. Verifique variáveis de ambiente." });
  }

  const tabela = "Beneficios"; // nome da tabela no Airtable
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tabela)}`;

  if (req.method === "GET") {
    try {
      const response = await fetch(`${url}?pageSize=30`, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      const data = await response.json();
      const records = (data.records || []).map(r => ({
        id: r.id,
        titulo: r.fields.Titulo || "",
        descricao: r.fields.Descricao || "",
        ativo: r.fields.Ativo || false,
      }));
      return res.status(200).json(records);
    } catch (e) {
      return res.status(500).json({ error: "Erro ao buscar benefícios." });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body || {};
      if (!body.titulo) {
        return res.status(400).json({ error: "Campo 'titulo' é obrigatório." });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Titulo: body.titulo,
            Descricao: body.descricao || "",
            Ativo: true,
          },
        }),
      });

      const data = await response.json();
      return res.status(201).json({ id: data.id, ...data.fields });
    } catch (e) {
      return res.status(500).json({ error: "Erro ao cadastrar benefício." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}
