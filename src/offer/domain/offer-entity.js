const {validateField, validateFields, validateArrayField} = require('../../shared/domain/utils/generic-functions.js');
const Price = require('./price-vo.js');

module.exports = class Offer {
    constructor({
        offerId,
        sku,
        isPublished,
        prices,
    }){

        validateField(offerId, "Offer ID", "string", false);
        validateField(sku, "SKU", "string", true);
        validateField(isPublished, "Is Published", "boolean", false);
        validateArrayField(prices, "Prices", "price", false);
        
        this.offerId = offerId;
        this.sku = sku;
        this.isPublished = isPublished;
        this.prices = prices;
    }
}