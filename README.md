Anotacoes sobre meus estudos de messageria com RabbitMQ e TS.


A mensagem viaja de um produtor para um consumer atraves de uma fila

Passos:

1. docker compose up -d (sobe a fila);
2. npm install (dependencias basicas node);
3. npm run 01:consumer (roda o cosumer);
4. npm run 01:produtor
5. http://localhost:15672 (painel senha e user ambos guest)

O que aprendi:

- Conexao e canal:
  A conexao eh a responsavel pelo tunelamento TCP ate o broker
  O canal eh a logica dessa conexao
- ack:
  confirma que a msg foi recebida e processada com sucesso para poder descartar
  sem o ack o broker assume que falhou e reentrega a msg a outro consumer ou o msm
- durable true:
  significa que a fila vai continuar existindo mesmo apos o restart do broker RBMQ
- persistent: true:
  A mensagem eh gravada em disco e nao se perde apos o restart do broker
- durable vs persistent:
  Mantem coisas diferentes, durabel eh responsavel por manter a fila enquanto o persistent o conteudo da mensagem
  Ou seja, para manter o conteudo precisa de ambos, durable para o recipiente (fila) e persistent para o conteudo (msg)
- Broker:
  RabbitMQ eh um message broker; intermediario que recebe, guarda, roteia e entrega as mensagens, desacoplando o que seria feito diretamente entre produtor e consumidor
- (produtor que envia -> RBMQ broker que guarda as filas -> entrega para o consumer que recebe a msg)

Resultado do lab:

O consumidor desligado nao processou as mensagens na fila, o painel registrou que haviam mensagens prontas para serem consumidas e estavam sendo aguardadas, quando o consumer foi ligado, a fila entregou as msgs que estavam guardadas ao consumer que as processou (ack).


obs:

- O que pode esperar alguns segundos, eh lento ou pode falhar vai pra fila
- login, abrir uma tela sao coisas que precisam de resposta imediata, entao nao vao pra fila

Exemplo sem fila:

Usuario envia 3k msgs, o sistema tenta enviar essas 3k,  trava minutos depois, a api falha na msg 2k, tudo eh perdido

Com fila o usuario envia 3k msgs, o sistema joga as 3k pra fila, responde ok como retorno, os consumers pegam uma a uma e enviam no ritmo que a API aguenta; se uma falhar ela toma retry e eh reentregue, as outras continuam.
