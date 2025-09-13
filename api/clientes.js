// /api/clientes.js
export default async function handler(req, res) {
  try {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "http://localhost:3000",
      "https://ultima-neon.vercel.app",
      "https://www.aproveitai.com.br",
      "https://aproveitai.com.br"
    ];

    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { idPublico } = req.query;
    if (!idPublico) {
      return res.status(400).json({ error: "Parâmetro idPublico obrigatório" });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    const url = `https://api.airtable.com/v0/${baseId}/clientes?filterByFormula=${encodeURIComponent(`{idpublico}='${idPublico}'`)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Airtable error: ${response.status}`);

    const data = await response.json();

    if (!data.records.length) {
      return res.status(404).json([]);
    }

    // Retorna direto o array, igual o front espera
    return res.status(200).json(data.records.map(r => ({
      idpublico: r.fields["idpublico"] || "",
      nome: r.fields["nome"] || "",
      cidade: r.fields["cidade"] || "",
      ramo: r.fields["ramo"] || "",
      desconto: r.fields["desconto"] || "",
      ativo: !!r.fields["ativo"]
    })));
  } catch (err) {
    console.error("Erro API clientes:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
