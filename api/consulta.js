// /api/consulta.js
export default async function handler(req, res) {
  try {
    const { tipo, idPublico, cnpj, token } = req.query;

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_TOKEN;

    let tabela = "";
    if (tipo === "clientes") tabela = "clientes";
    if (tipo === "parceiros") tabela = "parceiros";
    if (tipo === "beneficios") tabela = "beneficios";
    if (tipo === "promocoes") tabela = "promocoes";
    if (tipo === "depoimentos") tabela = "depoimentos";
    if (tipo === "faq") tabela = "faq";
    if (tipo === "log") tabela = "log";

    if (!tabela) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Erro Airtable: ${response.status}`);

    const data = await response.json();

    if (tipo === "clientes" && idPublico) {
      const cliente = data.records.find(r => r.fields.idpublico === idPublico);
      return res.status(cliente ? 200 : 404).json(cliente ? [cliente.fields] : []);
    }

    if (tipo === "parceiros" && cnpj && token) {
      const parceiro = data.records.find(
        r => r.fields.cnpj === cnpj && r.fields.token === token
      );
      if (!parceiro) return res.status(401).json({ error: "CNPJ/Token inválidos" });
      if (!parceiro.fields.ativo) return res.status(423).json({ error: "Parceiro inativo" });
      return res.status(200).json(parceiro.fields);
    }

    // Se não houver filtro → retorna todos
    return res.status(200).json(data.records.map(r => r.fields));
  } catch (err) {
    console.error("Erro API Consulta:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
