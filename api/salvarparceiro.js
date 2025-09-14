// /pages/api/salvarparceiro.js
// Salva novo parceiro no Airtable

export default async function handler(req, res) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: "Configuração inválida. Verifique variáveis de ambiente." });
  }

  try {
    const { 
      cnpj, 
      nome, 
      cidade, 
      ramo, 
      desconto, 
      beneficios, 
      whatsapp, 
      instagram, 
      site, 
      email
    } = req.body;

    if (!cnpj || !nome || !cidade || !ramo) {
      return res.status(400).json({ error: "CNPJ, Nome, Cidade e Ramo são obrigatórios." });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/parceiros`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            cnpj: String(cnpj),
            nome,
            cidade,
            ramo,
            desconto: desconto || "",      // 🔹 respeita o nome do Airtable
            beneficios: beneficios || "",
            whatsapp: whatsapp || "",
            instagram: instagram || "",
            site: site || "",
            email: email || "",            // 🔹 adiciona email
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Erro Airtable:", data.error);
      return res.status(500).json({ error: "Erro no Airtable", detalhe: data.error });
    }

    return res.status(201).json({ id: data.id, ...data.fields });
  } catch (err) {
    console.error("Erro ao salvar parceiro:", err);
    return res.status(500).json({ error: "Erro interno", detalhe: err.message });
  }
}
