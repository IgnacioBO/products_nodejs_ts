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


class OfferService {

    productService: ProductService;
    offerRepository: OfferRepository;
    constructor(productService: ProductService, offerRepository: OfferRepository) {
        this.productService = productService;
        this.offerRepository = offerRepository;
    }

  async createOffer(offers: CreateOfferRequestDTO[]): Promise<Offer[]> {
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
        const result: Offer[] = await this.offerRepository.createOffer(offersObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }

    async updateFullOffer(offers: UpdateFullOfferRequestDTO[]): Promise<Offer[]> {
        try{
            const offersObjectArray = offers.map(offerRequestDTOtoEntity);
            const result = await this.offerRepository.updateFullOffer(offersObjectArray);
            return result;
        }
        catch (error) {
            throw error;
        }
    }

    async updateOffer(offers: UpdatePartialOfferRequestDTO[]): Promise<Offer[]> {
        try{
            const offersObjectArray = offers.map(offerRequestDTOtoEntity);
            const result = await this.offerRepository.updateOffer(offersObjectArray);
            return result;
        }
        catch (error) {
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