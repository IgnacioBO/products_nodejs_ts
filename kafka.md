Cliente Node.js/TS con KafkaJS (producer)

Para Node, la librería KafkaJS es simple y muy usada. Instálala en tu proyecto principal (no es necesario crear un repo aparte; lo ideal hexagonalmente es añadir un adapter de infraestructura “MessageBus/Kafka” y exponer un puerto EventBus en application).

npm i kafkajs
npm i -D @types/node

src/
  shared/
    application/
      event-bus-kafka.ts          # puerto (interfaz) para publicar eventos
    infrastructure/
      kafka/
        kafka-client.ts     # cliente KafkaJS
        kafka-event-bus.ts   # adapter que implementa EventBus con Kafka
  product/
    application/...
    domain/...
    infrastructure/...
  offer/
    ...

Para levantar 
docker compose -f compose.kafka.yml up -d

Para bajar
docker compose -f compose.kafka.yml down -v

2) Para crear los topicos dentro del codigo puede ser asi:
    Creamos los topics products y offers en Kafka en caso de que no existan
    const admin = kafkaClient.admin();
    await admin.connect();
    let topics = ["product", "offer"];
    let topicsCreated : string[] = await admin.listTopics();
    let topicsNotCreated = topics.filter(t => !topicsCreated.includes(t));
    if(topicsNotCreated.length > 0){
        await admin.createTopics({
            waitForLeaders: true,
            topics: topicsNotCreated.map(t => ({ topic: t, numPartitions: 3, replicationFactor: 1 }))
        });
    }
    await admin.disconnect();


3)
