// api/consulta.js
export default async function handler(req, res) {
  let { tipo, cnpj, token } = req.query;

  // Se for POST, pega do body
  if (req.method === 'POST') {
  cnpj = req.body.cnpj;
  token = req.body.token;
  tipo = req.body.tipo || tipo;
}

if (tipo === 'parceirosLogin') {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tabela = process.env.AIRTABLE_PARCEIROS;
    const apiKey = process.env.AIRTABLE_API_KEY;

    const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}', {ativo}=1)`;

    const resposta = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    const dados = await resposta.json();
    console.log("Resposta do Airtable:", dados);

    if (dados.records && dados.records.length > 0) {
      res.status(200).json(dados.records[0].fields);
    } else {
      res.status(401).json({ status: 'erro', mensagem: 'CNPJ ou Token inválidos' });
    }
  } catch (erro) {
    console.error('Erro interno:', erro);
    res.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor' });
  }
}
