//consumer (direct): escolhe QUAIS severidades vai ouvir
//npm run 02:consumidor -- erro (para errors)
//npm run 02:consumidor -- info aviso erro (para info e warning)

import { abrirCanal } from "../conexao";

async function main() {
  const canal = await abrirCanal();
  const exchange = "logs_direct";
  
  // declarando exchange
  await canal.assertExchange(exchange, "direct", { durable: true });

  //severidades que o consumidor vai ouvir (routing keys)
  const severidades = process.argv.slice(2);
  if (severidades.length === 0) {
    console.log("informe uma severidade ex: Ex: npm run 02:consumidor -- erro");
    process.exit(1);
  }

    // declarando fila temporaria
    //autodestroi quando o consumer desconectar (exclusive: true)
    const filaq = await canal.assertQueue("", { exclusive: true });

    //bind das severidades (routing keys) na fila temporaria
    for (const severidade of severidades) {
        await canal.bindQueue(filaq.queue, exchange, severidade);
    }

    console.log("Ouvindo mensagens", filaq.queue);

    //consumindo mensagens da fila temporaria
    canal.consume(filaq.queue, (msg) => {
        if (!msg) return;
        console.log("Recebido:", msg.content.toString());
        canal.ack(msg);
    });
}

main().catch((e) => {
  console.error("Erro:", e.message);
  process.exit(1);
});