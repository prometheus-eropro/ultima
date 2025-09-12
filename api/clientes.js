// CORRIGIDO: clientes.js (para cadastro e validação correta do cliente e parceiro)

const apiBase = "https://api.airtable.com/v0/appMQwMQMQz7dLlSZ";
const apiKey = "Bearer keyGQGo7eS3nk5dNm";

async function salvarCliente(dados) {
  const idPublico = gerarIDPublico();
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(idPublico)}&size=150x150`;

  const clienteData = {
    records: [
      {
        fields: {
          idPublico: idPublico,
          nome: dados.nome,
          cpf: dados.cpf,
          celular: dados.celular,
          grupo: dados.grupo,
          cidade: dados.cidade,
          dataNascimento: dados.dataNascimento,
          dataCadastro: new Date().toLocaleDateString("en-US"),
          ativo: false,
          qrURL: qrURL
        },
      },
    ],
  };

  const response = await fetch(`${apiBase}/clientes`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clienteData),
  });

  if (response.ok) {
    const whatsappMsg = `https://api.whatsapp.com/send?phone=5528996692303&text=Novo cliente cadastrado: ${idPublico}`;
    window.location.href = whatsappMsg;
  } else {
    alert("Erro ao salvar cadastro.");
  }
}

async function salvarParceiro(dados) {
  const parceiroData = {
    records: [
      {
        fields: {
          cnpj: dados.cnpj,
          nome: dados.nome,
          cidade: dados.cidade,
          ramo: dados.ramo,
          desconto: dados.desconto,
          beneficios: dados.beneficios,
          ativo: false,
          token: dados.token
        },
      },
    ],
  };

  const response = await fetch(`${apiBase}/parceiros`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parceiroData),
  });

  if (response.ok) {
    const whatsappMsg = `https://api.whatsapp.com/send?phone=5528996692303&text=Novo parceiro cadastrado: ${dados.nome}`;
    window.location.href = whatsappMsg;
  } else {
    alert("Erro ao salvar cadastro do parceiro.");
  }
}

function gerarIDPublico() {
  const prefix = "APV";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random.slice(0, 5)}-${random.slice(5)}`;
}

// CORRIGIDO: Validação da área do cliente
async function buscarClientePorID(idPublico) {
  const url = `${apiBase}/clientes?filterByFormula={idPublico}='${idPublico}'`;
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });
  if (!response.ok) throw new Error("Erro na busca do cliente");

  const data = await response.json();
  return data.records.length > 0 ? data.records[0].fields : null;
}

// Validação da área do parceiro
async function validarLoginParceiro(cnpj, token) {
  const url = `${apiBase}/parceiros?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}', {ativo}=1)`;
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });
  const data = await response.json();
  return data.records.length > 0;
}
