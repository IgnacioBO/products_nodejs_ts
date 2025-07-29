import { OfferMongoDTO, PriceMongoDTO } from './offer-mongodb-dto';
import Offer from '../domain/offer-entity';
import {Price, CurrencyType, PriceType } from '../domain/price-vo';
import { WithId } from 'mongodb';


export function priceToMongoDTO(price: Price): PriceMongoDTO {
    return {
        currency: price.currency,
        type: price.type,
        value: price.value
    };
}



export function offerToMongoDTO(offer: Offer): OfferMongoDTO {
    return {
        offer_id: offer.offerId,
        sku: offer.sku,
        is_published: offer.isPublished,
        // Solo “esparce” prices si existe y tiene al menos un elemento
        ...(offer.prices?.length
        ? { prices: offer.prices.map(priceToMongoDTO) }
        : {}),
    };
}


export function offerToPartialUpdateMongoDTO(offer: Offer): Partial<OfferMongoDTO> {
    return {
        //Solo pondremos los campos que queremos actualizar, si no estan definidos, no se actualizan
        ...(offer.offerId !== undefined && { offer_id: offer.offerId }),
        ...(offer.isPublished !== undefined && { is_published: offer.isPublished }),
        ...(offer.prices?.length
        ? { prices: offer.prices.map(priceToMongoDTO) }
        : {}),
    };
}



export function mongoOfferDTOtoEntity(dto: OfferMongoDTO): Offer {
    const prices = dto.prices?.map(a =>
        new Price({
            currency:  a.currency as CurrencyType,
            type:      a.type as PriceType,
            value:      a.value
        })
    );

    return new Offer({
        offerId:         dto.offer_id,
        sku:             dto.sku,
        isPublished:     dto.is_published,
        prices:          prices

    });
}


export function documentToOffer(document: WithId<OfferMongoDTO>): Offer {
    const priceArray = Array.isArray(document.prices) ? document.prices : [];
    const prices = priceArray.map(a =>
        new Price({
            currency:  a.currency as CurrencyType,
            type:      a.type as PriceType,
            value:     a.value
        }));
    return new Offer({
        offerId:      document.offer_id,
        sku:          document.sku,
        isPublished:  document.is_published,
        ...(prices.length && {prices})
    });

}