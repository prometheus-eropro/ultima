export default async function parceiros(req, res) {
  // Aceita tanto por headers quanto por query params
  const cnpj = req.headers['cnpj'] || req.query.cnpj;
  const token = req.headers['token'] || req.query.token;

  if (!cnpj || !token) {
    return res.status(400).json({ error: "CNPJ e Token são obrigatórios" });
  }

  // Aqui você coloca a lógica da sua tabela de parceiros
  return res.status(200).json({
    message: "Acesso autorizado ✅",
    tabela: "parceiros",
    cnpj,
    token
  });
}
