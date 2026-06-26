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


====================================================================

Nivel 02 - Routing


No nivel 01 o produtor publicava direto na fila. Aqui ele publica num exchange e o exchange decide pra quais filas a msg vai, com base na routing key.

(produtor -> exchange (decide a rota) -> fila(s) que deram bind na routing key -> consumer)


Passos (direct):

1. docker compose up -d (sobe a fila);
2. npm run 02:consumidor -- erro (consumer que so ouve a severidade erro)
3. npm run 02:produtor -- erro "deu ruim" (produz um log de severidade erro)
4. http://localhost:15672 (painel, aba Exchanges pra ver o logs_direct)


Passos (topic):

1. npm run 02:topic-consumidor -- "cliente.*.criado" (ouve qualquer cliente.X.criado)
2. npm run 02:topic-produtor -- cliente.agencia.criado "novo cliente"
3. dica: "#" no consumer ouve TUDO


O que aprendi:

- Exchange:
  eh o roteador que fica na frente das filas. o produtor nao fala mais com a fila direto, ele fala com o exchange e o exchange roteia
- routing key:
  eh o "endereco" que o produtor poe na msg pro exchange saber pra onde mandar
- direct:
  a routing key tem que ser igual igual. msg com key "erro" so cai em fila que deu bind em "erro"
- topic:
  a routing key eh um caminho com pontos (cliente.agencia.criado) e da pra usar curinga no bind
  * = uma palavra naquela posicao (cliente.*.criado)
  # = zero ou mais palavras (cliente.#)
- bind (bindQueue):
  eh o que liga a fila no exchange por uma routing key. sem bind a fila nao recebe nada do exchange
- fila exclusiva e temporaria (assertQueue("", { exclusive: true })):
  o nome vem vazio e o rabbit gera um nome aleatorio, e ela se autodestroi quando o consumer desconecta
  diferente do nivel 01 que a fila tinha nome fixo e ficava guardada


direct vs topic:

  direct casa a routing key exata, bom quando as categorias sao fixas (erro, aviso, info)
  topic casa por padrao com curinga, bom quando o "endereco" tem niveis e voce quer pegar grupos (todos os eventos de cliente, tudo de uma agencia, etc)


Resultado do lab:

Subi dois consumers ao mesmo tempo, cada um dando bind numa routing key diferente. Mandei uma msg "erro" e so o consumer de "erro" recebeu, o de "info" ignorou. No topic, o consumer com "cliente.*.criado" pegou o cliente.agencia.criado mas ignorou um cliente.agencia.editado, provando que o exchange filtra pela routing key antes de entregar.


obs:

- no 01 a fila era o destino; no 02 o destino eh o exchange e a fila eh so quem assina (bind) o que quer receber
- isso eh pub/sub na pratica: um produtor publica uma vez e varios consumers interessados recebem, cada um filtrando o que importa pra ele
