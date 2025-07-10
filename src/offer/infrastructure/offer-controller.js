//@ts-check
//const { ProductoNotFoundError, ProductWithSKUAlreadyExistsError } = require("../domain/product-errors"); //Para poder identificar el tipo de error (instance of) que viene desde las capas dominio y poder manejarlo en el controller
const httpError = require("../../shared/infrastructure/errors/http-errors"); //Para poder enviar al cliente error con status code y mensaje de error
//const ProductFiltersDTO = require('../application/product-filters-dto.js');
const PaginationMetadata = require("../../shared/application/pagination-metadata.js");
const PaginationsParams = require("../../shared/domain/paginations-params-vo.js");
const PaginationMetadataResponseDTO = require("../../shared/application/pagination-metadata-dto.js");
const OfferResponseDTO = require("./offer-response-dto.js");
const OfferFiltersDTO = require("../application/offer-filters-dto.js");
const { OfferNotFoundError } = require("../domain/offer-errors.js");
const Offer = require("../domain/offer-entity.js");

class OfferController {
    constructor(offerService) {
      this.offerService = offerService;
      //Se hace bind para que this dentro de la funcion createOffer se refiera a la instancia de la clase OfferController
      //Asi podemos usar this.productService dentro de la funcion createOffer
      this.createOffer = this.createOffer.bind(this);
      this.getAll = this.getAll.bind(this);
      this.updateFullOffer = this.updateFullOffer.bind(this);
      this.updateOffer = this.updateOffer.bind(this);
      this.deleteOffer = this.deleteOffer.bind(this);
    }


    /**JSdoc para definir los tipos de los parametros de la funcion:
     @param {import("express").Request} req - The request object
     @param {import("express").Response & {success}} res - The response object
     @param {import("express").NextFunction} next - The next function
    */
    async createOffer(req, res, next) {
        try {
            
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku || offer.is_published == undefined) {
                    next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku e is_published`));
                }
                if(Array.isArray(offer.prices)) {
                    for (const price of offer.prices) {
                        if (typeof price.value !== 'number') {
                            next(httpError.BadRequestError(`El precio de la oferta ${offer.sku} no es un numero`));
                        }
                        price.value = Math.trunc(price.value * 100) / 100; // Truncamos el valor del precio a dos decimales
                        if (price.value < 0) {
                            next(httpError.BadRequestError(`El precio de la oferta ${offer.sku} no puede ser negativo`));
                        }

                    }
                    
                }
            }
            const result = await this.offerService.createOffer(requestBody);
            const offerRespone = result.map(offer => new OfferResponseDTO(offer));
            res.status(201).success({data: offerRespone});
        } catch (error) {
            next(httpError.InternalServerError(error.message));
        }
    }

    async updateFullOffer(req, res, next) {
        try {
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku || offer.is_published == undefined) {
                    next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku e is_published`));
                }
            }
            const result = await this.offerService.updateFullOffer(requestBody);
            const offerResponse = result.map(offer => new OfferResponseDTO(offer));

            res.status(201).success({data:offerResponse});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                next(httpError.NotFoundError(error.message));
            }
            next(httpError.InternalServerError(error.message));
        }
    }

    async updateOffer(req, res, next) {
        try {
            const requestBody = req.body;
            if (!Array.isArray(requestBody)) {
                next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku) {
                    next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku`));
                }
            }
            const result = await this.offerService.updateOffer(requestBody);
            const offerResponse = result.map(offer => new OfferResponseDTO(offer));

            res.status(201).success({data:offerResponse});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                next(httpError.NotFoundError(error.message));
            }
            next(httpError.InternalServerError(error.message));
        }
    }

    async deleteOffer(req, res, next) {
        try {
            const requestBody = req.body;
            let arrayDeSkus = [];
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku) {
                    next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios para eliminar: sku`));
                }
                arrayDeSkus.push({sku : offer.sku});
            }
            const result = await this.offerService.deleteOffer(arrayDeSkus);
            //const offerResponse = result.map(product => new OfferResponseDTO(product));
            res.status(200).success({message: result});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                next(httpError.NotFoundError(error.message));
            }
            next(httpError.InternalServerError(error.message));
        }
    }


    /**
     * Aca definimos los parametros para que el AUTOMCOMPLTEADO AYUDE
     * @param {import("express").Request} req - The request object
     * @param {import("express").Response & {success}} res - The response object
     * @param {import("express").NextFunction} next - The next function
     */
    async getAll(req, res, next) {
      try {

        const { sku, offer_id, page = 0, limit = 0 } = req.query;

        const offerFiltersDTO = new OfferFiltersDTO({
            sku: sku,
            offer_id: offer_id,
        });

        const totalCount = await this.offerService.count(offerFiltersDTO);
        const paginationMetadata = new PaginationMetadata(Number(page), Number(limit), totalCount, 50);
        const paginationsParams = new PaginationsParams(paginationMetadata.offset, paginationMetadata.limit);

        const offers = await this.offerService.getAllOffers(offerFiltersDTO, paginationsParams);
        paginationMetadata.count = offers.length;
        const paginationMetadataResponseDTO = new PaginationMetadataResponseDTO(paginationMetadata);
        const offerResponse = offers.map(offer => new OfferResponseDTO(offer));

    
        res.success({data: offerResponse, message: 'success', meta: paginationMetadataResponseDTO});
      } catch (error) {
        next(httpError.InternalServerError(error.message));
      }
    } 
  }
  
  module.exports = OfferController;