// /api/gateway.js
export default async function handler(req, res) {
  try {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://ultima-neon.vercel.app",
      "https://www.aproveitai.com.br",
      "https://aproveitai.com.br",
      "http://localhost:3000"
    ];

    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { tabela } = req.query;

    const whitelist = {
      parceiros: ["cnpj", "nome", "cidade", "ramo", "logourl", "instagram", "whatsapp", "desconto", "ativo", "token"],
      clientes: ["idpublico", "nome", "cidade", "ramo", "desconto", "ativo", "cnpj"],
      beneficios: ["titulo", "descricao", "validade", "ativo"],
      promocoes: ["titulo", "descricao", "validade", "ativo"],
      depoimentos: ["nome", "mensagem", "cidade", "ativo"],
      faq: ["pergunta", "resposta", "ativo"],
      log: ["origemConsulta", "idPublico", "cnpj", "token", "log_erros", "dataHora"]
    };

    if (!tabela || !whitelist[tabela]) {
      return res.status(400).json({ error: "Tabela não permitida" });
    }

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
