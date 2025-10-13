//@ts-check
import type Offer from '../domain/offer-entity';
import type OfferFilters from '../domain/offer-filters';
import type OfferRepository from '../domain/offer-repository';
import type PaginationsParams from'../../shared/domain/paginations-params-vo';
import type ProductService from '../../products/application/product-service';
import {ProductoNotFoundError} from '../../products/domain/product-errors';
import type OfferFiltersDTO from './offer-filters-dto';
import {offerRequestDTOtoEntity, offerRequestDeleteDTOtoEntity} from './offer-request-mapper';
import type { CreateOfferRequestDTO, DeleteOfferRequestDTO, UpdateFullOfferRequestDTO, UpdatePartialOfferRequestDTO } from './offer-request-dto';
import { EventBus } from "../../shared/application/event-bus-kafka";
import { offerToKafkaDTO } from './offer-kafka-mapper';
import { KafkaJSError } from 'kafkajs';
import { OfferKafkaDTO } from './offer-kafka-dto';

class OfferService {

    productService: ProductService;
    offerRepository: OfferRepository;
    eventBus : EventBus;
    eventTopic: string;
    constructor(productService: ProductService, offerRepository: OfferRepository, eventBus: EventBus) {
        this.productService = productService;
        this.offerRepository = offerRepository;
        this.eventBus = eventBus;
        this.eventTopic = String(process.env.KAFKA_OFFER_TOPIC);
    }

  async createOffer(offers: CreateOfferRequestDTO[]): Promise<{offers: Offer[], warnings?: any[]}> {
    let result: Offer[] = [];
    try{
        let skusNotFound: string[] = [];

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

        const offersObjectArray: Offer[] = offers.map(offerRequestDTOtoEntity);
        result = await this.offerRepository.createOffer(offersObjectArray);
        const resultoToKafkaDTO: OfferKafkaDTO[] = result.map(offerToKafkaDTO);
        await this.eventBus.publish_with_default_meta(this.eventTopic, "offer.created", resultoToKafkaDTO);
        return {offers: result};
    }
    catch (error) {
          if(error instanceof KafkaJSError){
            let message = "KafkaJSError al publicar evento en topic '" + this.eventTopic + "'";
            console.log(message);
            console.log(error);
            return {offers: result, warnings: [{message, details: error.message}]};
          }
            throw error;
        }

  }

    async updateFullOffer(offers: UpdateFullOfferRequestDTO[]): Promise<{offers: Offer[], warnings?: any[]} > {
        let result: Offer[] = [];
        try{
            const offersObjectArray = offers.map(offerRequestDTOtoEntity);
            result = await this.offerRepository.updateFullOffer(offersObjectArray);
            const resultoToKafkaDTO: OfferKafkaDTO[] = result.map(offerToKafkaDTO);
            await this.eventBus.publish_with_default_meta(this.eventTopic, "offer.updated", resultoToKafkaDTO);
            return {offers: result};
        }
        catch (error) {
          if(error instanceof KafkaJSError){
            let message = "KafkaJSError al publicar evento en topic '" + this.eventTopic + "'";
            console.log(message);
            console.log(error);
            return {offers: result, warnings: [{message, details: error.message}]};
          }
            throw error;
        }
    }

    async updateOffer(offers: UpdatePartialOfferRequestDTO[]): Promise<{offers: Offer[], warnings?: any[]}> {
        let result: Offer[] = [];
        try{
            const offersObjectArray = offers.map(offerRequestDTOtoEntity);
            result = await this.offerRepository.updateOffer(offersObjectArray);
            const resultoToKafkaDTO: OfferKafkaDTO[] = result.map(offerToKafkaDTO);
            await this.eventBus.publish_with_default_meta(this.eventTopic, "offer.updated", resultoToKafkaDTO);
            return {offers: result};
        }
        catch (error) {
          if(error instanceof KafkaJSError){
            let message = "KafkaJSError al publicar evento en topic '" + this.eventTopic + "'";
            console.log(message);
            console.log(error);
            return {offers: result, warnings: [{message, details: error.message}]};
          }
            throw error;
        }
    }

    async deleteOffer(offers: DeleteOfferRequestDTO[]): Promise<string> {
    try{
        const offersObjectArray = offers.map(offerRequestDeleteDTOtoEntity);
        const result = await this.offerRepository.deleteOffer(offersObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }


    //GetAllProduct recibe un objeto de tipo productFiltersDTO y trasnformara este DTO a un objeto de tipo ProductFilters
  async getAllOffers(offerFiltersDTO: OfferFiltersDTO, paginationsParams: PaginationsParams): Promise<Offer[]> {
  
    const offerFilters: OfferFilters = {
      sku: offerFiltersDTO.sku,
      offer_id: offerFiltersDTO.offer_id,
    };
    const ofertas: Offer[] = await this.offerRepository.getAllOffers(offerFilters, paginationsParams);
    return ofertas;
  }

  async count (offerFiltersDTO: OfferFiltersDTO): Promise<number> {
    const offerFilters: OfferFilters ={
        sku: offerFiltersDTO.sku,
        offer_id: offerFiltersDTO.offer_id,
    };
    const count: number = await this.offerRepository.count(offerFilters);
    return count;
  }
  
}

export default OfferService;