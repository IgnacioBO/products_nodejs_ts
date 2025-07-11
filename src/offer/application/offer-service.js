//@ts-check
const Offer = require('../domain/offer-entity.js');
const Price = require('../domain/price-vo.js');
const OfferFilters = require('../domain/offer-filters');
const OfferRepository = require('../domain/offer-repository.js');
//const OfferFiltersDTO = require('../application/offer-filters-dto.js');
const PaginationsParams = require('../../shared/domain/paginations-params-vo');
const ProductService = require('../../products/application/product-service');
const {ProductoNotFoundError} = require('../../products/domain/product-errors');
const OfferFiltersDTO = require('./offer-filters-dto.js');


class OfferService {
    //Cosntrucftor que recibirá el repositorio de productos como parametro (que lo inyectaremos desde el index.js)
    /** 
     * @param {ProductService} productService - Servicio de productos que se inyecta en el constructor
     * @param {OfferRepository} offerRepository - Repositorio de ofertas que se inyecta en el constructor
     * @throws {Error} - Lanza un error si no se puede obtener los productos
    */
    constructor(productService, offerRepository) {
        this.productService = productService;
        this.offerRepository = offerRepository;
    }

  async createOffer(offers) {
    try{
        let skusNotFound = [];

        //Revisar si existen los productos de las ofertas a crear
        for (const offer of offers) {
            try{
                const product = await this.productService.getProductBySku(offer.sku);
            }
            catch (error) {
                if(error instanceof ProductoNotFoundError){
                    skusNotFound.push(offer.sku);
                } else {
                    throw error;
                }
            }
        }
        if(skusNotFound.length > 0){
            throw new ProductoNotFoundError(skusNotFound.join(', '));
        }
        const offersObjectArray = offers.map(p => this._jsonArrayToCreateOffer(p));    
        const result = await this.offerRepository.createOffer(offersObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }

    async updateFullOffer(offers) {
        try{
            //Transformamos el array de productos de un json a un array de objetos de la clase Product
            const offersObjectArray = offers.map(p => this._jsonArrayToCreateOffer(p));
            //Aqui llamamos al repositorio de productos y le pasamos el array de objetos de la clase Product
            //El repo hace la insercion y nos devuelve un array de objetos Product con los datos insertados
            const result = await this.offerRepository.updateFullOffer(offersObjectArray);
            return result;
        }
        catch (error) {
            throw error;
        }
    }

    async updateOffer(offers) {
        try{
            const offersObjectArray = offers.map(p => this._jsonArrayToCreateOffer(p));
            const result = await this.offerRepository.updateOffer(offersObjectArray);
            return result;
        }
        catch (error) {
            throw error;
        }

    }

    async deleteOffer(offers) {
    try{
        const offersObjectArray = offers.map(p => this._jsonArrayToCreateOffer(p));
        const result = await this.offerRepository.deleteOffer(offersObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }


    //GetAllProduct recibe un objeto de tipo productFiltersDTO y trasnformara este DTO a un objeto de tipo ProductFilters
  /**
   * * @param {OfferFiltersDTO} offerFiltersDTO - 
   * * @param {PaginationsParams} paginationsParams - Objeto de tipo PaginationsParams
   * * @returns {Promise<Offer[]>} - Devuelve una promesa que resuelve un array de objetos de tipo Product
   * * @throws {Error} - Lanza un error si no se puede obtener los productos
   * */
  async getAllOffers(offerFiltersDTO, paginationsParams) {
    //Transformamos el DTO a un objeto de tipo OfferFilters
    //Aqui a futuro en vez de transformar el DTO a un objeto de tipo OfferFilters directamente
    //podriamos usar un mapper que se encargue de transformar el DTO a un objeto de tipo OfferFilters
    const offerFilters = new OfferFilters({
      sku: offerFiltersDTO.sku,
      offer_id: offerFiltersDTO.offer_id,
    });
    const ofertas = await this.offerRepository.getAllOffers(offerFilters, paginationsParams);
    return ofertas;
  }

  async count (offerFiltersDTO){
    const offerFilters = new OfferFilters({
        sku: offerFiltersDTO.sku,
         offer_id: offerFiltersDTO.offer_id,
    });
    const count = await this.offerRepository.count(offerFilters);
    return count;
  }
  

   _jsonArrayToCreateOffer(json) {
    const pricesArray = Array.isArray(json.prices) ? json.prices : [];

    const prices = pricesArray.map(a =>
        new Price({
        currency:  a.currency,
        type:       a.type,
        value: a.value        
        })
    );

    return new Offer({
        sku:                json.sku,
        isPublished: json.is_published, 
        ...(prices.length && { prices }), // sólo inserta prices si hay al menos uno
    });
    }
}


module.exports = OfferService;