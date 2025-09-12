// /api/clientes.js
export default async function handler(req, res) {
  try {
    // CORS
const origin = req.headers.origin;
const allowedOrigins = [
  "http://localhost:3000",
  "https://ultima-neon.vercel.app"  // seu domínio na Vercel
];

if (!allowedOrigins.includes(origin)) {
  console.warn("Origin bloqueada:", origin);
  return res.status(403).json({ error: "Origin not allowed" });
}

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // Normalizar parâmetro
    const { idPublico } = req.query;
    if (!idPublico || typeof idPublico !== "string" || idPublico.length > 40) {
      return res.status(400).json({ error: "Parâmetro idPublico inválido" });
    }

    // Airtable fetch
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const url = `https://api.airtable.com/v0/${baseId}/Clientes?filterByFormula=${encodeURIComponent(`{ID Publico} = '${idPublico}'`)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();

    // Mapear para formato limpo
const clientes = data.records.map(r => ({
  id: r.id,
idPublico: r.fields["idPublico"] || "",
  nome: r.fields["nome"] || "",
  cidade: r.fields["cidade"] || "",
  ramo: r.fields["ramo"] || "",
  desconto: r.fields["desconto"] || "",
  ativo: !!r.fields["ativo"] || !!r.fields["Ativo"], // aceita os dois jeitos
}));

    return res.status(200).json({ clientes });
  } catch (err) {
    console.error("Erro API clientes:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
