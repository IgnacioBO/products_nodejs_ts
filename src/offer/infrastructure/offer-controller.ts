//@ts-check
//const { ProductoNotFoundError, ProductWithSKUAlreadyExistsError } = require("../domain/product-errors"); //Para poder identificar el tipo de error (instance of) que viene desde las capas dominio y poder manejarlo en el controller
const httpError = require("../../shared/infrastructure/errors/http-errors"); //Para poder enviar al cliente error con status code y mensaje de error
import { NextFunction } from "express";
//const ProductFiltersDTO = require('../application/product-filters-dto.js');
import PaginationMetadata from "../../shared/application/pagination-metadata";
const PaginationsParams = require("../../shared/domain/paginations-params-vo");
import type PaginationMetadataResponseDTO from "../../shared/application/pagination-metadata-dto";
import { toPaginationMetadataResponseDTO } from "../../shared/application/pagination-metadata-mapper";
import { CustomResponse } from "../../shared/infrastructure/middlewares/response-handlers";
import OfferFiltersDTO from "../application/offer-filters-dto";
import { CreateOfferRequestDTO, DeleteOfferRequestDTO, UpdateFullOfferRequestDTO, UpdatePartialOfferRequestDTO } from "../application/offer-request-dto";
import { jsonToCreateOfferRequestDTO, jsonToDeleteOfferRequestDTO, jsonToUpdateFullOfferRequestDTO, jsonToUpdatePartialOfferRequestDTO } from "../application/offer-request-mapper";
const OfferResponseDTO = require("./offer-response-dto.js");
const { OfferNotFoundError } = require("../domain/offer-errors");
const Offer = require("../domain/offer-entity");
import type OfferService from "../application/offer-service";
import { json } from "stream/consumers";

class OfferController {
    offerService: OfferService;
    constructor(offerService: OfferService) {
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
                return next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku || offer.is_published == undefined) {
                    return next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku e is_published`));
                }
                if(Array.isArray(offer.prices)) {
                    for (const price of offer.prices) {
                        if (typeof price.value !== 'number') {
                            return next(httpError.BadRequestError(`El precio de la oferta ${offer.sku} no es un numero`));
                        }
                        price.value = Math.trunc(price.value * 100) / 100; // Truncamos el valor del precio a dos decimales
                        if (price.value < 0) {
                            return next(httpError.BadRequestError(`El precio de la oferta ${offer.sku} no puede ser negativo`));
                        }

                    }
                    
                }
            }
            const requestDTO = requestBody.map(jsonToCreateOfferRequestDTO)
            const result = await this.offerService.createOffer(requestDTO);
            const offerRespone = result.map(offer => new OfferResponseDTO(offer));
            res.status(201).success({data: offerRespone});
        } catch (error) {
            return next(httpError.InternalServerError(error.message));
        }
    }

    async updateFullOffer(req: Request, res: CustomResponse<any[], PaginationMetadataResponseDTO>, next: NextFunction) {
        try {
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku || offer.is_published == undefined) {
                    return next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku e is_published`));
                }
            }
            const requestDTO: UpdateFullOfferRequestDTO[] = requestBody.map(jsonToUpdateFullOfferRequestDTO);
            const result = await this.offerService.updateFullOffer(requestDTO);
            const offerResponse = result.map(offer => new OfferResponseDTO(offer));

            res.status(201).success({data:offerResponse});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

    async updateOffer(req: Request, res: CustomResponse<any[], PaginationMetadataResponseDTO>, next: NextFunction) {
        try {
            const requestBody = req.body;
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku) {
                    return next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios: sku`));
                }
            }
            const requestDTO: UpdatePartialOfferRequestDTO[] = requestBody.map(jsonToUpdatePartialOfferRequestDTO)
            const result = await this.offerService.updateOffer(requestDTO);
            const offerResponse = result.map(offer => new OfferResponseDTO(offer));

            res.status(201).success({data:offerResponse});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

    async deleteOffer(req, res, next) {
        try {
            const requestBody = req.body;
            let arrayDeSkus = [];
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de offers'));
            }
            //Recorremos el array de offers y validamos que cada offer tenga los campos obligatorios (sku)
            for (let i = 0; i < requestBody.length; i++) {
                const offer = requestBody[i];
                if (!offer.sku) {
                    return next(httpError.BadRequestError(`El offer en la posicion ${i} no tiene todos los campos obligatorios para eliminar: sku`));
                }
                arrayDeSkus.push({sku : offer.sku});
            }
            const requestDTO: DeleteOfferRequestDTO[] = requestBody.map(jsonToDeleteOfferRequestDTO)
            const result = await this.offerService.deleteOffer(requestDTO);
            //const offerResponse = result.map(product => new OfferResponseDTO(product));
            res.status(200).success({message: result});
        } catch (error) {
            if(error instanceof OfferNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
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

        const offerFiltersDTO: OfferFiltersDTO = {
            sku: sku,
            offer_id: offer_id,
        };

        const totalCount = await this.offerService.count(offerFiltersDTO);
        const paginationMetadata = new PaginationMetadata(Number(page), Number(limit), totalCount, 50);
        const paginationsParams: PaginationsParams = {offset: paginationMetadata.offset, limit: paginationMetadata.limit};

        const offers = await this.offerService.getAllOffers(offerFiltersDTO, paginationsParams);
        paginationMetadata.count = offers.length;
        const paginationMetadataResponseDTO = toPaginationMetadataResponseDTO(paginationMetadata);
        const offerResponse = offers.map(offer => new OfferResponseDTO(offer));

    
        res.success({data: offerResponse, message: 'success', meta: paginationMetadataResponseDTO});
      } catch (error) {
        return next(httpError.InternalServerError(error.message));
      }
    } 
  }
  
 export default OfferController;