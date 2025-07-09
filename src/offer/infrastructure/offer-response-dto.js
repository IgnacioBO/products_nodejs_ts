const Offer = require('../domain/offer-entity.js');

module.exports = class OfferResponseDTO {
     /**
     * @param {Offer} offer 
     */
  constructor(offer) {
    this.offer_id = offer.offerId;
    this.sku = offer.sku;
    this.is_published = offer.isPublished;
    this.prices = offer.prices;
  }
}