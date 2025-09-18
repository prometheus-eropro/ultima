// api/consulta.js
import Airtable from "airtable";

function escapeAirtableString(s = "") {
  return String(s).replace(/"/g, '\\"');
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // DEBUG: logs para ver o que chegou (remova quando funcionar)
  console.log(">>> /api/consulta headers:", req.headers);
  console.log(">>> /api/consulta body:", req.body);

  try {
    const body = req.body || {};
    const { tipo } = body;

    // Suporte ao formato antigo (documento) para compatibilidade
    if (tipo !== "parceirosLogin" && !body.documento) {
      return res.status(400).json({ error: "Documento não informado" });
    }

    // Conexão com Airtable
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    if (!apiKey || !baseId) {
      console.error("Falta AIRTABLE_API_KEY ou AIRTABLE_BASE_ID");
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    if (tipo === "parceirosLogin") {
      const cnpj = (body.cnpj || "").toString().trim();
      const token = (body.token || "").toString().trim();

      if (!cnpj || !token) {
        return res.status(400).json({ error: "CNPJ e token são obrigatórios" });
      }

      // Monta fórmula para buscar parceiro pela coluna cnpj ou idPublico E com token correspondente
      // Ajuste os nomes de campo entre chaves se no Airtable seu campo tiver outro nome
      const safeCnpj = escapeAirtableString(cnpj);
      const safeToken = escapeAirtableString(token);

      const filter = `AND( OR({cnpj} = "${safeCnpj}", {idPublico} = "${safeCnpj}"), {token} = "${safeToken}" )`;

      const records = await base("parceiros")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      if (!records || records.length === 0) {
        // não encontrado ou credenciais inválidas
        return res.status(401).json({ error: "CNPJ ou token inválidos" });
      }

      const record = records[0].fields;

      // Checa se parceiro está ativo — ajustar nomes de campo conforme seu Airtable
      const statusField = (record.Status || record.status || record.ativo || record.ativoParceiro);
      const isActive = (typeof statusField === "string" ? statusField.toLowerCase() !== "inativo" && statusField.toLowerCase() !== "false" : statusField !== false);

      if (!isActive) {
        return res.status(423).json({ error: "Parceiro inativo" });
      }

      // Retorna dados essenciais para o front
      const cliente = {
        id: records[0].id,
        nome: record.nome || record.Name || record.Nome || "",
        cnpj: record.cnpj || "",
        whatsapp: record.whatsapp || "",
        instagram: record.instagram || "",
        idPublico: record.idPublico || "",
        // adicione outros campos que quiser expor
      };

      return res.status(200).json({ success: true, cliente });
    }

    // --- Backward compatibility: buscar por documento (CPF / idPublico) ---
    if (body.documento) {
      const documento = String(body.documento).trim();
      const safeDoc = escapeAirtableString(documento);
      const filter = `OR({cpf} = "${safeDoc}", {idPublico} = "${safeDoc}")`;
      const records = await base("clientes")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      if (!records || records.length === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      const cliente = records[0].fields;

      // salvar log (opcional)
      try {
        await base("log").create([
          {
            fields: {
              dataHora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
              Status: "ativo",
              NomeCliente: cliente.nome || "Desconhecido",
              IdPublico: cliente.idPublico || "",
              cnpj: process.env.CNPJ_PARCEIRO || "",
              origemConsulta: "parceiro-web",
            },
          },
        ]);
      } catch (e) {
        console.warn("Não foi possível gravar log:", e);
      }

      return res.status(200).json({ success: true, cliente });
    }

    return res.status(400).json({ error: "Requisição inválida" });
  } catch (error) {
    console.error("Erro API:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
