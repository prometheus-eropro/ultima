// API segura para cadastro de clientes
// Salvar em /api/clientes.js no projeto Vercel

export default async function handler(req, res) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, ALLOWED_ORIGIN } = process.env;
  const allowedOrigin = ALLOWED_ORIGIN || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const dados = req.body;

      // montar payload para Airtable
      const airtableResp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clientes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Nome: dados.nome,
              CPF: dados.cpf,
              DataNascimento: dados.dataNascimento,
              Celular: dados.celular,
              Grupo: dados.grupo,
              Cidade: dados.cidade,
              Ativo: dados.ativo,
              IdPublico: dados.idPublico,
            },
          }),
        }
      );

      const json = await airtableResp.json();
      return res.status(200).json({ ok: true, airtable: json });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao salvar no Airtable" });
    }
  }

  if (req.method === "GET") {
    const { idPublico } = req.query;
    try {
      const filter = idPublico ? `?filterByFormula={IdPublico}="${idPublico}"` : "";
      const airtableResp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clientes${filter}`,
        { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
      );

      const json = await airtableResp.json();
      const clientes = json.records.map(r => ({
        id: r.id,
        nome: r.fields.Nome,
        cpf: r.fields.CPF,
        dataNascimento: r.fields.DataNascimento,
        celular: r.fields.Celular,
        grupo: r.fields.Grupo,
        cidade: r.fields.Cidade,
        ativo: r.fields.Ativo,
        idPublico: r.fields.IdPublico,
      }));

      return res.status(200).json(clientes);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar no Airtable" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
