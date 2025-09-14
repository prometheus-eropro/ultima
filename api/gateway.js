// /api/gateway.js

import clientes from "./clientes.js";
import parceiros from "./parceiros.js";
import log from "./log.js";

export default async function handler(req, res) {
  try {
    const { tabela } = req.query;

    if (!tabela) {
      return res.status(400).json({ error: "Parâmetro 'tabela' é obrigatório." });
    }

    console.log(`🔍 Consulta recebida para a tabela: ${tabela}`);

    switch (tabela.toLowerCase()) {
      case "clientes":
        return await clientes(req, res);

      case "parceiros":
        return await parceiros(req, res);

      case "log":
        return await log(req, res);

      default:
        return res.status(400).json({ error: `Tabela '${tabela}' não suportada.` });
    }
  } catch (err) {
    console.error("💥 Erro interno no gateway:", err);
    return res.status(500).json({ error: "Erro interno no gateway", detalhe: err.message });
  }
}
