// consumer (reliability): ack manual + prefetch + dead letter queue.
// processa UMA tarefa por vez e so tira da fila depois do ack.
// tarefa cujo texto contem "falha" eh rejeitada.

// npm run 03:consumidor -> tarefa que falha vai pro DLQ (comportamento seguro)
// npm run 03:consumidor -- requeue -> tarefa que falha volta pra mesma fila (vira poison message)

import { abrirCanal } from "../conexao";

const FILA = "tarefas";
const DLX = "tarefas_dlx";
const FILA_DLQ = "tarefas_dlq";

async function main() {
  const canal = await abrirCanal();

  // declara o mesmo cenario do produtor (idempotente, garante que existe dps)
  await canal.assertExchange(DLX, "fanout", { durable: true });
  await canal.assertQueue(FILA_DLQ, { durable: true });
  await canal.bindQueue(FILA_DLQ, DLX, "");
  await canal.assertQueue(FILA, {
    durable: true,
    arguments: { "x-dead-letter-exchange": DLX },
  });

  // prefetch 1: o broker so manda a proxima msg depois que essa tomou ack
  // sem isso, um consumer engole a fila inteira e nao da pra dividir carga
  // de forma justa entre varios consumers
  await canal.prefetch(1);

  // se rodar com "requeue", a msg que falha volta pra mesma fila (demonstra poison message)
  const reentregar = process.argv[2] === "requeue";

  console.log("Aguardando tarefas (prefetch 1). Ctrl+C pra sair.");

  // noAck: false -> ack manual, EU que confirmo. se eu nao confirmar e cair,
  // o broker reentrega pra outro consumer (a tarefa nao se perde).
  canal.consume(FILA, (msg) => {
    if (!msg) return;
    const texto = msg.content.toString();

    // simula um processamento que pode dar errado
    const falhou = texto.includes("falha");

    if (!falhou) {
      console.log("OK processado:", texto);
      canal.ack(msg); // confirma -> some da fila de vez
      return;
    }

    console.log("FALHOU:", texto);
    // nack(msg, allUpTo=false, requeue):
    //   requeue=false -> rejeita e manda pro DLX/DLQ (seguro, tira o veneno da fila)
    //   requeue=true  -> volta pra mesma fila, falha de novo, e de novo... (poison message)
    canal.nack(msg, false, reentregar);
  }, { noAck: false });
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
