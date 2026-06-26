// produtor (topic): a routing key eh um caminho com pontos.
//npm run 02:topic-produtor -- cliente.agencia.criado "novo cliente"


import { abrirCanal } from "../conexao";

async function main() {
    const canal = await abrirCanal();
    const exchange = "eventos_topic";

    await canal.assertExchange(exchange, "topic", { durable: true });

    const routingKey = process.argv[2] || "cliente.agencia.criado";
    const texto = process.argv[3] || `evento teste (${routingKey})`;

    canal.publish(exchange, routingKey, Buffer.from(texto));
    console.log(`Mensagem enviada: ${texto}`);

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });