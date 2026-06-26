// produtor (direct): publica em um exchange, nao entra direto numa fila
// npm run 02:produtor -- erro "exemplo"

import { abrirCanal } from "../conexao";

async function main() {
    const canal = await abrirCanal();
    const exchange = "logs_direct";

    // declarando exchange
    await canal.assertExchange(exchange, "direct", { durable: true });

    const severidade = process.argv[2] || "info";
    const texto = process.argv[3] || `log de teste (${severidade})`;

    // publicando no exchange com severidade como routing key
    canal.publish(exchange, severidade, Buffer.from(texto));
    console.log(`Mensagem enviada: ${texto}`);

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });