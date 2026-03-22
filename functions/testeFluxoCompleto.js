const fetch = require("node-fetch");

const BASE_URL = "http://127.0.0.1:5001/imoconnect-9d71c/us-central1";

async function chamarFunction(nome, dados) {
  const response = await fetch(`${BASE_URL}/${nome}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: dados })
  });

  const json = await response.json();
  console.log(`\n🔵 Resposta de ${nome}:`);
  console.log(JSON.stringify(json, null, 2));
  return json;
}

async function executarFluxo() {
  try {
    console.log("🚀 INICIANDO TESTE COMPLETO DO FLUXO\n");

    const criar = await chamarFunction("criarNovoCiclo", {
      leadId: "lead_teste_001",
      nome: "Cliente Teste",
      telefone: "11999999999",
      score: 80
    });

    const interesseId = criar.result?.interesseId;

    if (!interesseId) {
      console.log("❌ Não foi possível obter interesseId");
      return;
    }

    await chamarFunction("assumirInteresse", {
      interesseId: interesseId,
      corretorId: "corretor_teste_01",
      nomeCorretor: "Corretor Teste"
    });

    console.log("\n⏳ Aguardando 3 segundos...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    await chamarFunction("encerrarInteresse", {
      interesseId: interesseId,
      motivo: "Teste manual finalizado"
    });

    console.log("\n✅ FLUXO FINALIZADO COM SUCESSO");

  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
  }
}

executarFluxo();
