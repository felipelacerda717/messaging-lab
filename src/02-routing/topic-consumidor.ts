// consumidor (topic): faz bind com PADROES usando * e #.
//npm run 02:topic-consumidor -- "cliente.*.criado"
//npm run 02:topic-consumidor -- "#" (ouve tudo)

import { abrirCanal } from "../conexao";

async function main() {
    const canal = await abrirCanal();
    const exchange = "eventos_topic";

    await canal.assertExchange(exchange, "topic", { durable: true });

    //padroes que o consumidor vai ouvir (routing keys)
    const padroes = process.argv.slice(2);
    if (padroes.length === 0) {
        console.log("informe um padrao ex: Ex: npm run 02:topic-consumidor -- cliente.*.criado");
        process.exit(1);
    }
    
    // declarando fila temporaria
    //autodestroi quando o consumer desconectar (exclusive: true)
    const filaq = await canal.assertQueue("", { exclusive: true });

    //bind dos padroes (routing keys) na fila temporaria
    for (const padrao of padroes) {
        await canal.bindQueue(filaq.queue, exchange, padrao);
    }

    console.log("Ouvindo mensagens", filaq.queue);
    
    //consumindo mensagens da fila temporaria
    canal.consume(filaq.queue, (msg) => {
        if (!msg) return;
        console.log("Recebido:", msg.content.toString());
        canal.ack(msg);
    });
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });