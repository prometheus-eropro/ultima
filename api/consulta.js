export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "erro", mensagem: "Método não permitido" });
  }

  const { tipo, cnpj, token, cpf, idPublico, statusCliente, nomeCliente, codigoAutorizacao, log_erros } = req.body;

  if (!tipo) {
    return res.status(400).json({ status: "erro", mensagem: "Campo 'tipo' obrigatório" });
  }

  // ====================
  // LOGIN PARCEIROS
  // ====================
  if (tipo === "parceirosLogin") {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_PARCEIROS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      if (!baseId || !tabela || !apiKey) {
        return res.status(500).json({ status: "erro", mensagem: "Configuração do servidor incompleta" });
      }

      const formula = `AND({cnpj}="${cnpj}", {token}="${token}", {ativo}=1)`;
      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;

      const resposta = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error("Erro da Airtable:", texto);
        return res.status(resposta.status).json({ status: "erro", mensagem: "Erro ao acessar Airtable" });
      }

      const dados = await resposta.json();
      if (dados.records && dados.records.length > 0) {
        return res.status(200).json(dados.records[0].fields);
      } else {
        return res.status(401).json({ status: "erro", mensagem: "CNPJ ou Token inválidos" });
      }
    } catch (e) {
      console.error("Erro interno parceirosLogin:", e);
      return res.status(500).json({ status: "erro", mensagem: e.message });
    }
  }

  // ====================
  // VALIDAR CLIENTE
  // ====================
  if (tipo === "validarCliente") {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_CLIENTES;
      const apiKey = process.env.AIRTABLE_API_KEY;

      if (!baseId || !tabela || !apiKey) {
        return res.status(500).json({ status: "erro", mensagem: "Configuração do servidor incompleta" });
      }

      const formula = `OR({cpf}="${cpf}", {idPublico}="${idPublico || cpf}")`;
      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;

      const resposta = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error("Erro da Airtable validarCliente:", texto);
        return res.status(resposta.status).json({ status: "erro", mensagem: "Erro ao acessar Airtable" });
      }

      const dados = await resposta.json();
      if (dados.records && dados.records.length > 0) {
        return res.status(200).json({
          sucesso: true,
          cliente: dados.records[0].fields
        });
      } else {
        return res.status(404).json({ status: "erro", mensagem: "Cliente não encontrado" });
      }
    } catch (e) {
      console.error("Erro interno validarCliente:", e);
      return res.status(500).json({ status: "erro", mensagem: e.message });
    }
  }

  // ====================
  // LOG DE VALIDAÇÃO
  // ====================
  if (tipo === "logvalidacao") {
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_LOGS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      const resposta = await fetch(`https://api.airtable.com/v0/${baseId}/${tabela}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            Status: statusCliente,
            NomeCliente: nomeCliente,
            CodigoAutorizacao: codigoAutorizacao,
            IdPublico: idPublico,
            Erros: log_erros || ""
          }
        })
      });

      if (!resposta.ok) {
        const txt = await resposta.text();
        console.error("Erro Airtable log:", txt);
        return res.status(500).json({ status: "erro", mensagem: "Falha ao salvar log" });
      }

      return res.status(200).json({ status: "ok" });
    } catch (e) {
      console.error("Erro interno logvalidacao:", e);
      return res.status(500).json({ status: "erro", mensagem: e.message });
    }
  }

  // ====================
  // DEFAULT
  // ====================
  return res.status(400).json({ status: "erro", mensagem: "Tipo inválido ou não suportado" });
}
