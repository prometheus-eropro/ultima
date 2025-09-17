const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { documento } = req.body;

  try {
    const records = await base('clientes')
      .select({
        filterByFormula: `OR({cpf} = "${documento}", {idPublico} = "${documento}")`
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }

    const cliente = records[0].fields;

    res.status(200).json({
      sucesso: true,
      cliente: {
        nome: cliente.nome,
        cpf: cliente.cpf,
        idPublico: cliente.idPublico,
        grupo: cliente.grupo,
        celular: cliente.celular,
      }
    });

  } catch (error) {
    console.error('Erro consulta Airtable:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro na API de consulta', detalhe: error.message });
  }
}
