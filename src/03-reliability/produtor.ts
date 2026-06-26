// produtor (reliability): manda tarefas pra fila de trabalho.
// tarefa cujo texto contem "falha" vai ser rejeitada pelo consumer e cair no DLQ.
//
// npm run 03:produtor -- "processar pagamento"
// npm run 03:produtor -- "falha proposital"

import { abrirCanal } from "../conexao";

const FILA = "tarefas";
const DLX = "tarefas_dlx"; // exchange de dead-letter
const FILA_DLQ = "tarefas_dlq"; // fila morta (cemiterio das tarefas que falham)

async function main() {
  const canal = await abrirCanal();

  // monta o destino das tarefas mortas: exchange + fila + bind
  await canal.assertExchange(DLX, "fanout", { durable: true });
  await canal.assertQueue(FILA_DLQ, { durable: true });
  await canal.bindQueue(FILA_DLQ, DLX, "");

  // fila principal: toda msg rejeitada (nack sem requeue) eh redirecionada pro DLX
  await canal.assertQueue(FILA, {
    durable: true,
    arguments: { "x-dead-letter-exchange": DLX },
  });

  const texto = process.argv[2] || "tarefa de teste";

  // persistent: true -> msg gravada em disco, sobrevive a restart do broker
  canal.sendToQueue(FILA, Buffer.from(texto), { persistent: true });
  console.log(`Tarefa enviada: ${texto}`);

  setTimeout(() => process.exit(0), 500);
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
