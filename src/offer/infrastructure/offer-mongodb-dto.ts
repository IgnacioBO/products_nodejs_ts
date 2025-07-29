export interface PriceMongoDTO {
    currency: string;
    type: string;
    value: number;
}

export interface OfferMongoDTO {
    offer_id?: string;
    sku: string;
    is_published?: boolean;
    prices?: PriceMongoDTO[];
}