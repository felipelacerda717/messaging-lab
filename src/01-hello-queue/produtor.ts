//produtor: coloca a mensagem na fila e encerra
// npm run 01:produtor

import { abrirCanal } from "../conexao";

async function main() {
    const canal = await abrirCanal();
    const fila = 'hello';

    //a fila continua existindo apos um restart do broker
    await canal.assertQueue(fila, { durable: true });

    const mensagem = "Hello, fila! enviado em: " + new Date().toISOString();

    //a mensagem eh gravada no disco e nao se perde
    canal.sendToQueue(fila, Buffer.from(mensagem), { persistent: true });
    console.log("Mensagem enviada: ", mensagem);

    //delay garantindo que a msg seja enviada antes de encerrar
    setTimeout(() => { process.exit(0) }, 500);


}

main().catch((e) => {
  console.error("Erro:", e.message);
  process.exit(1);
});