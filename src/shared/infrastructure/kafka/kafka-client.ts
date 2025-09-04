import { Kafka, logLevel } from 'kafkajs';

const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');

//Esto permitirá crear un cliente Kafka usando la ip del broker y el id del cliente, que se utilizarán para las conexiones
//El id del cliente se utiliza para identificar la aplicación que está produciendo o consumiendo mensajes
export const kafkaClient = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'catalog-service',
  retry: {
    retries: 2,
  },
  brokers,
  logLevel: logLevel.INFO,
});