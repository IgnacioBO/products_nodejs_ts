import { kafkaClient } from './kafka-client';
import type { EventBus, DomainEvent } from '../../application/event-bus-kafka';
import { randomUUID } from 'crypto';

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

  async publish_with_default_meta(topic: string, event_name: string, payload: unknown): Promise<void> {
    const event: DomainEvent = {
        event_id: randomUUID(), //id unico del evento
        event_name: event_name,
        event_data_format: 'JSON',
        creation_date: new Date().toISOString(),
        timestamp: Date.now(),
        payload,
    }
    await this.ensureConnected();
    await this.producer.send({
      topic,
      messages: [{ key: event.event_id, value: JSON.stringify(event) }],
    });
  }
}