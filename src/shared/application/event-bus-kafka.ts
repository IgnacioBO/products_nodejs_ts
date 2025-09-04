//Aqui definimos la estructura de un evento de dominio
export type DomainEvent = {
  event_id: string;          // id del agregado (productId / offerId)
  event_name: string;        // p.ej. 'product.created'
  event_data_format: string; // p.ej. 'JSON'
  creation_date: string;  // ISO date
  timestamp: number;      // timestamp en milisegundos
  payload: unknown;    // DTO serializable
};

export interface EventBus {
    //El publish se encarga de enviar eventos a un topic específico
    //Events sera un array de DomainEvent, que representan los eventos a enviar
  publish(topic: string, events: DomainEvent[]): Promise<void>;
}