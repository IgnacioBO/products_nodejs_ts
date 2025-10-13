export interface PriceKafkatDTO {
  currency?: string;
  type?: string;
  value?: number;
}

export interface OfferKafkaDTO {
    offer_id?: string;
    sku: string;
    is_published?: boolean;
    prices?: PriceKafkatDTO[];
}