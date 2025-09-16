// api/consulta.js
export default async function handler(req, res) {
  let { tipo, cnpj, token } = req.query;

  // Se for POST, pega do body
  if (req.method === 'POST') {
    const body = await req.json();
    cnpj = body.cnpj;
    token = body.token;
    tipo = body.tipo || tipo;
  }

  if (tipo === 'parceirosLogin') {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_PARCEIROS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}')`;

      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      const dados = await resposta.json();
      console.log("Resposta do Airtable:", dados);

      if (dados.records && dados.records.length > 0) {
        res.status(200).json({ status: 'ok', parceiro: dados.records[0].fields });
      } else {
        res.status(401).json({ status: 'erro', mensagem: 'CNPJ ou Token inválidos' });
      }
    } catch (erro) {
      console.error('Erro interno:', erro);
      res.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor' });
    }
  } else {
    res.status(400).json({ status: 'erro', mensagem: 'Tipo inválido' });
  }
}
