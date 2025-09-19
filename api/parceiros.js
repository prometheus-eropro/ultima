import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nomeFantasia, cnpj, token, cidade, whatsapp, beneficios, instagram, site, email } = req.body;

  if (!nomeFantasia || !cnpj || !token || !cidade || !whatsapp) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_PARCEIROS;


  const checkUrl = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula={cnpj}='${cnpj}'`;

  try {
    // Verifica se o CNPJ já existe
    const checkResponse = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const checkData = await checkResponse.json();

    if (checkData.records && checkData.records.length > 0) {
      const parceiroExistente = checkData.records[0].fields;
      if (parceiroExistente.token !== token) {
        return res.status(401).json({ error: "Token incorreto para este CNPJ" });
      } else {
        return res.status(200).json({ mensagem: "Parceiro já cadastrado", parceiro: parceiroExistente });
      }
    }

    // Se não existe, cria
    const novoParceiro = {
      fields: {
        nomeFantasia,
        cnpj,
        token,
        cidade,
        whatsapp,
        beneficios,
        instagram,
        site,
        email,
        ativo: "NAO",
        dataCadastro: new Date().toISOString().split("T")[0],
        idPublico: `PARC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      }
    };

    const createResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${tabela}`, {
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
