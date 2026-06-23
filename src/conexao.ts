//conexao compartilhada com o rabbitmq
// conexao = tunel TCP ate o broker 
// canal = logica dentro da CONEXAO
// regra: uma conexao por app, um canal por tarefa

import {connect, Channel} from 'amqplib';

export async function abrirCanal(): Promise<Channel> {
    // amqp://usuario:senha@host:porta
    const conexao = await connect('amqp://guest:guest@localhost:5672');
    return await conexao.createChannel();
}
