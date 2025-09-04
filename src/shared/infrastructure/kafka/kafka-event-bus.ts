import { kafkaClient } from './kafka-client';
import type { EventBus, DomainEvent } from '../../application/event-bus-kafka';

export class KafkaEventBus implements EventBus {
    //Generar un productor Kafka
  private producer = kafkaClient.producer({
    allowAutoTopicCreation: false,
    // opciones para transacciones/idempotencia en el futuro
    // idempotent: true,
    // maxInFlightRequests: 1,
  });

  private connected = false;

  private async ensureConnected() {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async publish(topic: string, events: DomainEvent[]): Promise<void> {
    await this.ensureConnected();
    await this.producer.send({
      topic,
      // usar key = id del agregado para orden por entidad
      messages: events.map(e => ({ key: e.event_id, value: JSON.stringify(e) })),
    });
  }
}