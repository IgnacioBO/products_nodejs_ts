export interface PriceResponseDTO {
  currency?: string;
  type?: string;
  value?: number;
}


export interface OfferResponseDTO {
  offer_id?: string;
  sku: string;
  is_published?: boolean;
  prices?: PriceResponseDTO[];
}