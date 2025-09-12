// api/consulta.js
export default async function handler(req, res) {
  let tipo, cnpj, token;
if (req.method === 'GET') {
  tipo = req.query.tipo;
  cnpj = req.query.cnpj;
  token = req.query.token;
} else if (req.method === 'POST') {
  ({ tipo, cnpj, token } = req.body || {});
}


  if (tipo === 'parceirosLogin') {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_PARCEIROS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}')`;

      const resposta = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      const dados = await resposta.json();

      if (dados.records && dados.records.length > 0) {
        res.status(200).json({ status: 'ok', parceiro: dados.records[0].fields });
      } else {
        res.status(401).json({ status: 'erro', mensagem: 'Dados inválidos' });
      }
    } catch (erro) {
      console.error('Erro interno:', erro);
      res.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor' });
    }
  } else {
    res.status(400).json({ status: 'erro', mensagem: 'Tipo inválido' });
  }
}
