export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { cnpj, token, documento, tipo } = req.body;

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    // --- Login do parceiro ---
    if (tipo === "parceirosLogin") {
      if (!cnpj) {
        return res.status(400).json({ error: "CNPJ é obrigatório" });
      }

      // se quiser validar também token, precisa ter a coluna "token" criada no Airtable
      const filter = token
        ? `AND({cnpj}='${cnpj}', {token}='${token}')`
        : `{A cnpj}='${cnpj}'`;

      const url = `https://api.airtable.com/v0/${baseId}/parceiros?filterByFormula=${encodeURIComponent(filter)}`;

      const airtableRes = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await airtableRes.json();

      if (!data.records || data.records.length === 0) {
        return res.status(404).json({ error: "Parceiro não encontrado ou token inválido" });
      }

      const parceiro = data.records[0].fields;

      return res.status(200).json({
        success: true,
        parceiro: {
          id: data.records[0].id,
          nome: parceiro["nome"] || "",
          cnpj: parceiro["cnpj"] || "",
          cidade: parceiro["cidade"] || "",
          ramo: parceiro["ramo"] || "",
          beneficios: parceiro["beneficios"] || "",
          desconto: parceiro["desconto"] || "",
        },
      });
    }

    // --- Consulta de cliente ---
    if (documento) {
      const filter = `OR({cpf} = '${documento}', {idPublico} = '${documento}')`;
      const url = `https://api.airtable.com/v0/${baseId}/clientes?filterByFormula=${encodeURIComponent(filter)}`;

      const airtableRes = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await airtableRes.json();

      if (!data.records || data.records.length === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      return res.status(200).json({ success: true, cliente: data.records[0].fields });
    }

    return res.status(400).json({ error: "Requisição inválida" });
  } catch (err) {
    console.error("Erro em /consulta:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
