export interface PriceRequestDTO {
  currency: string;
  type: string;
  value: number;
}

export interface CreateOfferRequestDTO {
    sku: string;
    isPublished?: boolean;
    prices?: PriceRequestDTO[];
}

export interface UpdateFullOfferRequestDTO extends CreateOfferRequestDTO {}

//Aca se define el DTO para actualizar una oferta, que es opcionalmente parcial de CreateOfferRequestDTO, osea todos los campos son opcionales
//Pero como ponemos sku:string, entonces solo el sku es obligatorio
export interface UpdatePartialOfferRequestDTO extends Partial <CreateOfferRequestDTO> {
    sku: string;
}

export interface DeleteOfferRequestDTO {
    sku: string;
}