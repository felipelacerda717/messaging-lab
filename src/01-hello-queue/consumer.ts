//consumer: fica ligado escutando a fila e processando as mensagens
// npm run 01:consumer

import { abrirCanal } from "../conexao";

async function main() {
    const canal = await abrirCanal();
    const fila = 'hello';

    // Declarar  aqui tambem o consumidor pode subir ANTES do produtor.
    await canal.assertQueue(fila, { durable: true });

    console.log("Aguardando mensagens na fila:", fila);

    canal.consume(fila, (msg) => {
        if (!msg) return;

        console.log("Mensagem recebida: ", msg.content.toString());

        //ack = msg processada, pode descartar
        //sem o ack, a msg volta para a fila e outro consumidor pode processar
        canal.ack(msg);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});