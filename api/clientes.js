// /api/clientes.js
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

      const resp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/clientes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              idPublico: dados.idPublico,
              nome: dados.nome,
              cpf: dados.cpf,
              dataNascimento: dados.dataNascimento,
              celular: dados.celular,
              grupo: dados.grupo,
              cidade: dados.cidade,
              ativo: dados.ativo === true || dados.ativo === "true",

            },
          }),
        }
      );

      const json = await resp.json();
      return res.status(200).json(json);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Erro ao salvar no Airtable" });
    }
  }

  if (req.method === "GET") {
    const { idPublico } = req.query;
    try {
      let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/clientes`;
      if (idPublico) {
        url += `?filterByFormula={idPublico}="${idPublico}"`;
      }

      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      const json = await resp.json();

      const clientes = (json.records || []).map((r) => ({
        id: r.id,
        idPublico: r.fields.idPublico,
        nome: r.fields.nome,
        cpf: r.fields.cpf,
        dataNascimento: r.fields.dataNascimento,
        celular: r.fields.celular,
        grupo: r.fields.grupo,
        cidade: r.fields.cidade,
        ativo: r.fields.ativo,
      }));

      return res.status(200).json(clientes);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Erro ao buscar no Airtable" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
