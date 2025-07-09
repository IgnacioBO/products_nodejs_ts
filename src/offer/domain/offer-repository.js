//@ts-check
const Offer = require('./offer-entity.js');
const OfferFilters = require('./offer-filters.js');
const PaginationsParams = require('../../shared/domain/paginations-params-vo.js');

/**
 * Usando JSDoc para documentar el código dejando claro que es una interfaz
 * Osea que esta clase deberia ser implementada por otra clase
 * y no deberia ser instanciada directamente
 * @interface
 */
class OfferRepository {
    /**
     * Haremos un constructor que no recibe nada
     * Y lanzara error si se intenta instanciar la clase directamente (sin heredar de ella)
     * @throws {Error}
     * */
    constructor() {
        if (this.constructor === OfferRepository) {
            throw new Error('Cannot instantiate abstract class OfferRepository directly. This is an interface.');
        }
    }

    /**
     * Definimo que el metodo creatOffer recibe un array de objetos de la clase Offer
     * Y devuelve una promesa que resuelve un array de objetos de la clase Offer creados
     * @param {Offer[]} offers 
     * @returns {Promise<Offer[]>}
     */
    createOffer(offers) { throw new Error('Not implemented'); }  //Como en JS no existe el concepto de interface
    //Lo que hacemos es forzar un error si no se implementa el metodo en la clase que hereda de esta clase

    /**
     * @param {OfferFilters} offerFilters
     * @param {PaginationsParams} paginationParams
     * @returns {Promise<Offer[]>}
     */
    getAllOffers(offerFilters, paginationParams){ throw new Error('Not implemented'); }

    /**
     * @param {string} sku 
     * 
     * @returns {Promise<Offer[]>}
     */
    getOfferBySku(sku) { throw new Error('Not implemented'); }

    /**
     * @param {Offer[]} offers
     * @returns {Promise<Offer[]>}
     */ 
    updateFullOffer(offers) { throw new Error('Not implemented'); }

    /**
     * @param {Offer[]} offers
     * @returns {Promise<Offer[]>}
     */
    updateOffer(offers) { throw new Error('Not implemented'); }

    /**
     * @param {Offer[]} offer 
     * @returns {Promise<string>}
     */
    deleteOffer(offer) { throw new Error('Not implemented'); }
    

    /**
     * @param {OfferFilters} offerFilters
     * @returns {Promise<number>} - Devuelve el total de offers que cumplen con los filtros
     */
    count(offerFilters){ throw new Error('Not implemented'); }


  }

  module.exports = OfferRepository;