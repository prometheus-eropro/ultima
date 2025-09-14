// /api/gateway.js
module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // normaliza tabela (case-insensitive) e mapeia para o nome da tabela no Airtable
    const raw = (req.query.tabela || '').toString().toLowerCase();
    const map = {
      clientes: 'clientes',
      parceiros: 'parceiros',
      promocoes: 'promocoes',
      beneficios: 'beneficios',
      depoimentos: 'depoimentos',
      faq: 'faq',
      log: 'log'
    };
    const tabela = map[raw];
    if (!tabela) return res.status(400).json({ error: 'Tabela inválida', recebida: raw });

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!baseId || !apiKey) {
      return res.status(500).json({ error: 'ENV_MISSING', dicas: 'Configure AIRTABLE_BASE_ID e AIRTABLE_API_KEY na Vercel (All Environments)' });
    }

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}`);
    // parâmetros opcionais
    ['pageSize','page','view','maxRecords','filterByFormula','sort[0][field]','sort[0][direction]']
      .forEach(k => { if (req.query[k]) url.searchParams.set(k, req.query[k]); });

    const r = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ error: 'AIRTABLE_ERROR', status: r.status, body: text.slice(0,500) });
    }
    try {
      const json = JSON.parse(text);
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
      return res.status(200).json(json);
    } catch {
      return res.status(500).json({ error: 'NOT_JSON_FROM_AIRTABLE', sample: text.slice(0,500) });
    }
  } catch (e) {
    console.error('[gateway] erro:', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
};
