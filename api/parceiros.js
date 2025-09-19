import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nomeFantasia, cnpj, token, cidade, whatsapp, beneficios, instagram, site, email } = req.body;

  if (!nomeFantasia || !cnpj || !cidade || !whatsapp) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_PARCEIROS;

    if (!apiKey || !baseId || !tableName) {
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    // Verifica se já existe parceiro com este CNPJ
    const checkUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(`{A cnpj}='${cnpj}'`)}`;

    const checkResponse = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const checkData = await checkResponse.json();

    if (checkData.records && checkData.records.length > 0) {
      return res.status(200).json({
        mensagem: "Parceiro já cadastrado",
        parceiro: checkData.records[0].fields,
      });
    }

    // Cria novo parceiro
    const novoParceiro = {
      fields: {
        "A nome": nomeFantasia,
        "A cnpj": cnpj,
        "A token": token || "", // só funciona se a coluna existir no Airtable
        "A cidade": cidade,
        whatsapp,
        beneficios,
        instagram,
        site,
        email,
        "A ativo": "NAO",
        dataCadastro: new Date().toISOString().split("T")[0],
        idPublico: `PARC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    };

    const createResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoParceiro),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      return res.status(500).json({ error: "Erro ao salvar parceiro", detalhes: createData });
    }

    return res.status(200).json({ mensagem: "Cadastro realizado com sucesso!", parceiro: createData.fields });
  } catch (err) {
    console.error("Erro em /parceiros:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
