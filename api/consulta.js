import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { documento } = req.body;

    if (!documento) {
      return res.status(400).json({ error: "Documento não informado" });
    }

    // Conecta no Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    // Busca na tabela clientes
    const records = await base("clientes")
      .select({
        filterByFormula: `OR({cpf} = "${documento}", {idPublico} = "${documento}")`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const cliente = records[0].fields;

    // Salvar no log
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

    return res.status(200).json({ success: true, cliente });
  } catch (error) {
    console.error("Erro API:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
