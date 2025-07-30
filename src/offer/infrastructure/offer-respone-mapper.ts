import Offer from '../domain/offer-entity';
import Price from '../domain/price-vo';
import { OfferResponseDTO, PriceResponseDTO } from './offer-response-dto';


function priceToResponseDTO(price: Price): PriceResponseDTO {
    return {
        currency:  price.currency,
        type:       price.type,
        value:      price.value
    };
};


export function offerToResponseDTO(offer: Offer): OfferResponseDTO {
    return {
        offer_id: offer.offerId,
        sku: offer.sku,
        is_published: offer.isPublished,
        prices: offer.prices?.map(priceToResponseDTO)
    };
}
