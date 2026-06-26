// consumer do DLQ: le as tarefas que falharam e foram parar no cemiterio.
// aqui eh onde eh decidido o que fazer com a tarefa morta:
// logar, alertar alguem, reprocessar na mao, etc.
//
// npm run 03:dlq
// DLQ = Death Letter Queue AKA fila de mensagens mortas

import { abrirCanal } from "../conexao";

const FILA_DLQ = "tarefas_dlq";

async function main() {
  const canal = await abrirCanal();
  await canal.assertQueue(FILA_DLQ, { durable: true });

  console.log("Lendo o DLQ (tarefas que falharam). Ctrl+C pra sair.");

  canal.consume(FILA_DLQ, (msg) => {
    if (!msg) return;
    console.log("Tarefa morta:", msg.content.toString());
    canal.ack(msg); // tira do DLQ depois de tratar
  }, { noAck: false });
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
