import {CreateOfferRequestDTO, PriceRequestDTO, UpdateFullOfferRequestDTO, UpdatePartialOfferRequestDTO, DeleteOfferRequestDTO} from './offer-request-dto';
import Offer from '../domain/offer-entity';
import {Price, CurrencyType, PriceType} from '../domain/price-vo';


export function jsonToCreateOfferRequestDTO(json: any): CreateOfferRequestDTO {

    const priceArray: any[] = Array.isArray(json.prices) ? json.prices : [];

    let prices: PriceRequestDTO[] | undefined = priceArray.map(a =>
    ({
        currency:  a.currency,
        type:       a.type,
        value:      a.value
    }));

    prices = prices.length > 0 ? prices : undefined;

    return {
        sku:           json.sku,
        isPublished:   json.is_published,
        prices: prices // puede ser undefined o null
    };
}

export function jsonToUpdateFullOfferRequestDTO(json: any): UpdateFullOfferRequestDTO {
    return jsonToCreateOfferRequestDTO(json);
}

export function jsonToUpdatePartialOfferRequestDTO(json: any): UpdatePartialOfferRequestDTO {
      return jsonToCreateOfferRequestDTO(json);
}

export function jsonToDeleteOfferRequestDTO(json: any): DeleteOfferRequestDTO {
    return {
        sku: json.sku
    };
}

// Algunos recomiendad separa cada funcion mapper para cada DTO, pero si no estan complejo ni tantas validaciones
//En mi caso yo estoy manejando los undefined y null en el repository, por lo que no necesito hacer validaciones complejas
//Si necesitas hacer validaciones complejas, entonces si es mejor separar cada mapper en su propia
export function offerRequestDTOtoEntity(dto: CreateOfferRequestDTO | UpdateFullOfferRequestDTO | UpdatePartialOfferRequestDTO): Offer {
    const prices = dto.prices?.map(a =>
        new Price({
            currency:  a.currency as CurrencyType,
            type:      a.type as PriceType,
            value:      a.value
        })
    );

    return new Offer({
        sku:             dto.sku,
        isPublished:     dto.isPublished,
        prices:          prices

    });
}

export function offerRequestDeleteDTOtoEntity(dto: DeleteOfferRequestDTO): Offer {
    return new Offer({
        sku:             dto.sku,
    });
}