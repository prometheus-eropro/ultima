// api/consulta.js
import Airtable from "airtable";

function escapeAirtableString(s = "") {
  return String(s).replace(/"/g, '\\"');
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body = req.body || {};
    const { tipo } = body;

    // --- Conexão com Airtable ---
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    if (!apiKey || !baseId) {
      console.error("Falta AIRTABLE_API_KEY ou AIRTABLE_BASE_ID");
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    // --- Login do parceiro ---
    if (tipo === "parceirosLogin") {
      const cnpj = (body.cnpj || "").toString().trim();
      const token = (body.token || "").toString().trim();

      if (!cnpj || !token) {
        return res.status(400).json({ error: "CNPJ e token são obrigatórios" });
      }

      const safeCnpj = escapeAirtableString(cnpj);
      const safeToken = escapeAirtableString(token);

      // ⚠️ use exatamente os nomes das colunas que estão no Airtable
      const filter = `AND({A cnpj} = "${safeCnpj}", {A token} = "${safeToken}")`;

      const records = await base("parceiros")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      if (!records || records.length === 0) {
        return res.status(401).json({ error: "CNPJ ou token inválidos" });
      }

      const record = records[0].fields;

      // Se não tiver campo de status, comentar esse trecho
      // const statusField = record.Status || record.status;
      // if (statusField && statusField.toLowerCase() === "inativo") {
      //   return res.status(423).json({ error: "Parceiro inativo" });
      // }

// Exemplo de como pegar os dados corretamente
const parceiro = data.records[0].fields;

// Ajustando para os nomes REAIS do Airtable
const cnpj = parceiro["A cnpj"] || "";
const nome = parceiro["A nome"] || "";
const cidade = parceiro["A cidade"] || "";
const ramo = parceiro["A ramo"] || "";
const desconto = parceiro["A desconto"] || "";
const beneficios = parceiro["A beneficios"] || "";
const token = parceiro["A token"] || "";
const ativo = parceiro["A ativo"] || false;
      };

      return res.status(200).json({ success: true, parceiro });
    }

    // --- Consulta de cliente ---
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
