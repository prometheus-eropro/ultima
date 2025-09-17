// api/consulta.js
export default async function handler(req, res) {
  let { tipo, cnpj, token } = req.query;

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

      // DEBUG: Mostra se algo está undefined
      console.log("🔍 Variáveis:", { baseId, tabela, apiKey });

      if (!baseId || !tabela || !apiKey) {
        console.error("❌ Variável de ambiente ausente.");
        return res.status(500).json({ status: 'erro', mensagem: 'Configuração do servidor incompleta' });
      }

      const formula = `AND({cnpj}="${cnpj}", {token}="${token}", {ativo}=1)`;
      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;

      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error("❌ Erro da Airtable:", resposta.status, texto);
        return res.status(resposta.status).json({ status: 'erro', mensagem: 'Erro ao acessar Airtable' });
      }

      const dados = await resposta.json();
      console.log("✅ Resposta do Airtable:", dados);

      if (dados.records && dados.records.length > 0) {
        res.status(200).json(dados.records[0].fields);
      } else {
        res.status(401).json({ status: 'erro', mensagem: 'CNPJ ou Token inválidos' });
      }

    } catch (erro) {
      console.error("💥 ERRO INTERNO:", erro);
      res.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor' });
    }
  } else {
    res.status(400).json({ status: 'erro', mensagem: 'Tipo inválido ou não suportado' });
  }
}
