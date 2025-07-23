import {validateField, validateArrayField} from '../../shared/domain/utils/generic-functions';
import Price from './price-vo';

interface IOffer {
    offerId?: string;
    sku: string;
    isPublished?: boolean;
    prices?: Price[];
}

class Offer implements IOffer {
    offerId?: string;
    sku: string;
    isPublished?: boolean;
    prices?: Price[];

    constructor(params: IOffer) {

        validateField(params.offerId, "Offer ID", "string", false);
        validateField(params.sku, "SKU", "string", true);
        validateField(params.isPublished, "Is Published", "boolean", false);
        validateArrayField(params.prices, "Prices", "price", false);

        this.offerId = params.offerId;
        this.sku = params.sku;
        this.isPublished = params.isPublished;
        this.prices = params.prices;
    }
}

export default Offer;