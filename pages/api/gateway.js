// /pages/api/gateway.js
// Gateway central para redirecionar as requisições para cada módulo.
// ⚠️ Importante: todos os arquivos devem estar em /pages/api/ para o Vercel reconhecer como rota de API.

import clientes from "./clientes";
import parceiros from "./parceiros";
import beneficios from "./beneficios";
import promocoes from "./promocoes";
import depoimentos from "./depoimentos";
import log from "./log";
import salvarparceiro from "./salvarparceiro";
import consulta from "./consulta";
import health from "./health";
export default function handler(req, res) {

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

      case "beneficios":
        return await beneficios(req, res);

      case "promocoes":
        return await promocoes(req, res);

      case "depoimentos":
        return await depoimentos(req, res);

      case "log":
        return await log(req, res);

      case "salvarparceiro":
        return await salvarparceiro(req, res);

      case "consulta":
        return await consulta(req, res);

      case "health":
        return await health(req, res);

      default:
        return res.status(400).json({ error: `Tabela '${tabela}' não suportada.` });
    }
  } catch (err) {
    console.error("💥 Erro interno no gateway:", err);
    return res.status(500).json({ error: "Erro interno no gateway", detalhe: err.message });
  }
}
