// /api/gateway.js
export default async function handler(req, res) {
  try {
const origin = req.headers.origin;
const allowedOrigins = [
  "http://localhost:3000",
  "https://ultima-neon.vercel.app" // seu domínio na Vercel
];

if (!allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: "Origin not allowed" });
}

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // Pega a query string
    const { tabela } = req.query;

    // 🔒 Whitelist de tabelas e campos
    const whitelist = {
      parceiros: ["Nome", "Cidade", "Ramo", "LogoURL", "Instagram", "WhatsApp", "Desconto", "Ativo"],
      clientes: ["Nome", "Cidade", "Ramo", "Desconto", "Ativo", "ID Público"],
      beneficios: ["Titulo", "Descricao", "Validade", "Ativo"]
    };

    if (!tabela || !whitelist[tabela]) {
      return res.status(400).json({ error: "Tabela não permitida" });
    }

    // Chama Airtable
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}?pageSize=30`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();

    // Retorna apenas os campos liberados
    const result = data.records.map(r => {
      const safe = {};
      whitelist[tabela].forEach(f => {
        safe[f] = r.fields[f] || "";
      });
      return safe;
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro API Gateway:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
