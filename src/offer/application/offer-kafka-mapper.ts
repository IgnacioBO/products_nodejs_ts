import Offer from '../domain/offer-entity';
import Price from '../domain/price-vo';
import { OfferKafkaDTO, PriceKafkatDTO } from './offer-kafka-dto';

function priceToKafkaDTO(price: Price): PriceKafkatDTO {
    return {
        currency:  price.currency,
        type:       price.type,
        value:      price.value
    };
};


export function offerToKafkaDTO(offer: Offer): OfferKafkaDTO {
    return {
        offer_id: offer.offerId,
        sku: offer.sku,
        is_published: offer.isPublished,
        prices: offer.prices?.map(priceToKafkaDTO)
    };
}
