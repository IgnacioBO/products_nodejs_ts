import type Offer from './offer-entity';
import type OfferFilters from './offer-filters';
import type PaginationsParams from '../../shared/domain/paginations-params-vo';

interface OfferRepository {

    createOffer(offers: Offer[]): Promise<Offer[]>;

    getAllOffers(offerFilters: OfferFilters, paginationParams: PaginationsParams): Promise<Offer[]>;

    getOfferBySku(sku: string): Promise<Offer[]>;

    updateFullOffer(offers: Offer[]): Promise<Offer[]>;

    updateOffer(offers: Offer[]): Promise<Offer[]>;

    deleteOffer(offer: Offer[]): Promise<string>;

    count(offerFilters: OfferFilters): Promise<number>;

  }

export default OfferRepository;