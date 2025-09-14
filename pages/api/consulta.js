// /pages/api/consulta.js

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    const { cnpj, token } = req.body;

    if (!cnpj || !token) {
      return res.status(400).json({ error: "CNPJ e Token são obrigatórios." });
    }

    // 👉 Aqui você faz a lógica real de consulta
    // Por exemplo, consultar Airtable ou outro serviço:
    // const response = await fetch(...)

    return res.status(200).json({
      message: "Consulta realizada com sucesso!",
      recebido: { cnpj, token },
    });

  } catch (err) {
    console.error("Erro em /api/consulta:", err);
    return res.status(500).json({ error: "Erro interno", detalhe: err.message });
  }
}
