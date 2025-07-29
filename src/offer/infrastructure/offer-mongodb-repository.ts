import { getDb } from '../../shared/infrastructure/config/database-mongodb';
import Offer from '../domain/offer-entity';
import Price from '../domain/price-vo';
import OfferRepository from '../domain/offer-repository';
import OfferFilters from '../domain/offer-filters';
import PaginationsParams from '../../shared/domain/paginations-params-vo';
import {OfferNotFoundError, OfferAlreadyExists} from '../domain/offer-errors';
import { InsertManyResult, MongoBulkWriteError, W, WithId } from 'mongodb';
import { mongoOfferDTOtoEntity, offerToMongoDTO, documentToOffer } from './offer-mongodb-mapper';
import { OfferMongoDTO } from './offer-mongodb-dto';

class OfferMongoDBRepository implements OfferRepository {

    async createOffer(offers: Offer[]): Promise<Offer[]> {
        let offersCreated: Offer[] = [];
        try{
            let offersDTO = offers.map(offerToMongoDTO)
            //Le asignamos un offer_id a cada oferta antes de insertarlas en la base de datos
            for (const offer of offersDTO) {
                const offerId: string = await this._getNextSequenceValue(); //Obtenemos el siguiente valor de la secuencia para el campo offer_id
                offer.offer_id = offerId; //Asignamos el offer_id al objeto offer para que se devuelva en la respuesta
            }
            const res: InsertManyResult = await getDb().collection('offers').insertMany(offersDTO, { ordered: false });
            if (res.insertedCount === offers.length) {
                console.log(`Se crearon ${res.insertedCount} offers de manera exitosa`);
                console.log('Offers creadas:', res.insertedIds);
            }else {
                throw new Error(`Se esperaban ${offers.length} pero se crearon ${res.insertedCount}`)     
            }
            offersCreated = offersDTO.map(mongoOfferDTOtoEntity);
        }
        catch (error) {
            if(error instanceof MongoBulkWriteError){
                if(error.code == '11000') {
                    let listadoSKUs: string [] = [];
                    let listadoOfferIds: string []= [];
                    //.writeErros puede venir como un array o un objeto, por lo que verificamos si es un array
                    //Si es un array, recorremos cada error, si es un objeto, lo convertimos en un array
                    const writeErrors = Array.isArray(error.writeErrors) ? error.writeErrors : [error.writeErrors];
                    for (const writeError of writeErrors) {
                        if (writeError.err.errmsg.includes('offer_id')){
                            listadoOfferIds.push(writeError.err.op.offer_id);
                        }
                        if (writeError.err.errmsg.includes('sku')){
                            listadoSKUs.push(writeError.err.op.sku);
                        }
                    }
                    throw new OfferAlreadyExists("", listadoSKUs, listadoOfferIds); //Lanza un error si ya existen los SKUs o offer_id
                }
            }
            console.error('Error al crear offers:', error);
            if( error instanceof Error ){
                throw new Error(`Error al crear offers: ${error.message}`);     
            }
            throw error;
        }
        return offersCreated;
     }  


    async getAllOffers(offerFilters: OfferFilters, paginationParams: PaginationsParams): Promise<Offer[]> {
        let offers: WithId<OfferMongoDTO>[] = []; 
         try{
            this._cleanFindQuery(offerFilters); //Limpia los filtros de busqueda de mongodb y elimina campos vacios o no definidos
            //Le agregamos <OfferMongoDTO> para que el compilador sepa que estamos trabajando con documentos de tipo OfferMongoDTO
            offers = await getDb().collection<OfferMongoDTO>('offers').find(offerFilters).limit(paginationParams.limit).skip(paginationParams.offset).toArray();
        }
        catch (error) {
            console.error('Error al buscar las ofertas:', error);
            if (error instanceof Error){
                throw new Error(`Error al buscar las ofertas: ${error.message}`);     
            }
            throw new Error(`Error al buscar las ofertas: ${error}`);     
        }
        return offers.map(documentToOffer); //Mapea los documentos a objetos Offer
    }

    getOfferBySku(sku: string): Promise<Offer[]> { 
        throw new Error('Not implemented'); 
        //return new Offer({sku: "o"});
    }

    async updateFullOffer(offers: Offer[]): Promise<Offer[]> { 
        let offersUpdated: Offer[] = [];
        try{
            let offersDTO = offers.map(offerToMongoDTO)
            var query = []

            for (const offer of offersDTO) {
                var queryPrices = [];
                var hasPrices = Array.isArray(offer.prices);
                if (Array.isArray(offer.prices)) {
                    for (const price of offer.prices) {
                        queryPrices.push({ currency: price.currency, type: price.type, value: price.value });
                    }
                }
                let doc = hasPrices ? { $set: { is_published: offer.is_published, prices: queryPrices } } :
                { $set: { is_published: offer.is_published}, $unset: { prices: "" } };

                var queryIndividual = { updateOne: { filter: { sku: offer.sku }, 
                                        update: doc, 
                                        upsert: false }};

                query.push(queryIndividual)       
            }
            const res = await getDb().collection('offers').bulkWrite(query, { ordered: false });
            offersUpdated = offersDTO.map(mongoOfferDTOtoEntity);

            if (res.matchedCount === offers.length) {
                console.log(`Se actualizaron ${res.matchedCount} offers de manera exitosa`);
            }else {
                const offersEncontrados = (await getDb().collection('offers').find(
                    { sku: { $in: offers.map(o => o.sku) } }, 
                    { projection: { sku: 1 } }).toArray()); // Projection permite obtener solo el campo sku de los documentos encontrados
                const skusExistentes = offersEncontrados.map(o => o.sku);
                const skusNoExistenes = offers.filter(o => !skusExistentes.includes(o.sku)).map(o => o.sku); //Si el sku no esta en la lista de SKUs existentes, lo agregamos a la lista de SKUs no existentes con map
                let extraInfo = "";
                if( skusExistentes.length > 0) {
                    extraInfo = `Se actualizó solo ${skusExistentes.length} oferta(s) encontrada(s)`;
                }
                throw new OfferNotFoundError(`${extraInfo}`, skusNoExistenes, skusExistentes); //Lanza un error si no se encontraron todos los SKUs
            }
        }
        catch (error) {
            if(error instanceof MongoBulkWriteError){
                if(error.code == '11000') {
                    console.log(error); 
                    let listadoSKUs: string [] = [];
                    let listadoOfferIds: string []= [];
                    const writeErrors = Array.isArray(error.writeErrors) ? error.writeErrors : [error.writeErrors];
                    for (const writeError of writeErrors) {
                        if (writeError.err.errmsg.includes('offer_id')){
                            listadoOfferIds.push(writeError.err.op.offer_id);
                        }
                        if (writeError.err.errmsg.includes('sku')){
                            listadoSKUs.push(writeError.err.op.sku);
                        }
                    }
                    throw new OfferAlreadyExists("", listadoSKUs, listadoOfferIds); //Lanza un error si ya existen los SKUs o offer_id    
                }
            }
            console.error('Error al actualizar offers:', error);
            if (error instanceof OfferNotFoundError || error instanceof Error){
                throw error; 
            }
            throw new Error(`Error al actualizar offers: ${error}`);     
        }
        return offersUpdated; 
    }

    /**
     * @param {Offer[]} offers
     * @returns {Promise<Offer[]>}
     */
    async updateOffer(offers: Offer[]): Promise<Offer[]> {       
         
        try{
            var query = []

            for (const offer of offers) {
                var queryIndividual = { updateOne: { filter: { sku: offer.sku }, 
                                        update: { $set :{}}, 
                                        upsert: false }};

                if(offer.isPublished != undefined) {
                    queryIndividual.updateOne.update.$set.is_published = offer.isPublished; //Si is_published esta definido, lo actualizamos
                } 
                var queryPrices = [];
                if (Array.isArray(offer.prices)) {
                    for (const price of offer.prices){
                        queryPrices.push({currency: price.currency, type: price.type, value: price.value});
                    }
                    queryIndividual.updateOne.update.$set.prices = queryPrices;
                }
                query.push(queryIndividual)       
            }
            const res = await getDb().collection('offers').bulkWrite(query, { ordered: false });
            
            if (res.matchedCount === offers.length) {
                console.log(`Se actualizaron ${res.matchedCount} offers de manera exitosa`);
            }else {
                const offersEncontrados = (await getDb().collection('offers').find(
                    { sku: { $in: offers.map(o => o.sku) } }, 
                    { projection: { sku: 1 } }).toArray()); // Projection permite obtener solo el campo sku de los documentos encontrados
                const skusExistentes = offersEncontrados.map(o => o.sku);
                const skusNoExistenes = offers.filter(o => !skusExistentes.includes(o.sku)).map(o => o.sku); //Si el sku no esta en la lista de SKUs existentes, lo agregamos a la lista de SKUs no existentes con map
                let extraInfo = "";
                if( skusExistentes.length > 0) {
                    extraInfo = `Se actualizó solo ${skusExistentes.length} oferta(s) encontrada(s)`;
                }
                throw new OfferNotFoundError(`${extraInfo}`, skusNoExistenes, skusExistentes); //Lanza un error si no se encontraron todos los SKUs
            }
        }
        catch (error) {
            if(error.code == '11000') {
                console.log(error); 
                let listado = [];
                for (const writeError of error.writeErrors) {
                    if (writeError.err.errmsg.includes('offer_id')){
                        listado.push(` {offer_id: ${writeError.err.op.offer_id} - sku: ${writeError.err.op.sku} - campo: offer_id}`);
                    }
                    if (writeError.err.errmsg.includes('sku')){
                        listado.push(` {offer_id: ${writeError.err.op.offer_id} - sku: ${writeError.err.op.sku} - campo: sku}`);
                    }
                }
                throw new Error(`Error al actualizar offers, sku y/o offer_id ya existen para estos registros:${(listado)}`);     
            }
            if (error instanceof OfferNotFoundError){
                throw error; //Si el error es de tipo OfferNotFoundError, lo lanzamos
            }
            console.error('Error al actualizar offers:', error);
            throw new Error(`Error al actualizar offers: ${error.message}`);     
        }
        return offers;  
    }

    /**
     * @param {Offer[]} offers 
     * @returns {Promise<string>}
     */
    async deleteOffer(offers: Offer[]): Promise<string> { 
        let resultado: string = "";
        try{
            var query = []
            for (const offer of offers) {
                var queryIndividual = { deleteOne: { filter: { sku: offer.sku }}};
                query.push(queryIndividual)       
            }
            const res = await getDb().collection('offers').bulkWrite(query);
            resultado = `Se eliminaron ${res.deletedCount} offers `
            console.log(resultado);
        }
        catch (error) {
            console.error('Error al elimianar offers:', error);
            if (error instanceof Error){
                throw new Error(`Error al elimianar offers: ${error.message}`);     
            }
            throw new Error(`Error al elimianar offers: ${error}`);     
        }
        return resultado;  
    }

    async count(offerFilters: OfferFilters): Promise<number> { 
        let count = 0;
         try{
            this._cleanFindQuery(offerFilters); //Limpia los filtros de busqueda de mongodb y elimina campos vacios o no definidos
            count = await getDb().collection('offers').countDocuments(offerFilters); //Cuenta los documentos que cumplen con los filtros
            if (isNaN(count)) {
                throw new Error('El conteo de documentos no es un numero');
            }
        }
        catch (error) {
            console.error('Error al countar los documentos:', error);
            if (error instanceof Error){
                throw new Error(`Error al countar los documentos: ${error.message}`);     
            }
            throw new Error(`Error al countar los documentos: ${error}`);     
        }
        return count;
    }

    /**
     * Obtiene el siguiente valor de la secuencia para el campo offer_id
     * Utiliza la colección 'counters' para incrementar el valor de 'sequence_value' y devolverlo.
     * @returns {Promise<string>} - Devuelve el siguiente valor de la secuencia para el campo offer_id
     */
    async _getNextSequenceValue() {
        try{
            let result = await getDb().collection('counters').findOneAndUpdate( { id: "offer_id" }, //Busca el documento con el id offer_id
                { $inc: { sequence_value: 1 } }, //Incrementa el valor de sequence_value en 1
                { returnDocument: 'after' } //Devuelve el documento actualizado
            ); 
            if (result && result.sequence_value !== undefined) {
                return result.sequence_value.toString(); //Devuelve el valor actualizado de sequence_value como string
            } else {
                throw new Error('No es posible generar un offer_id, no se encontro el contador');
            }
        }
        catch (error) {
            throw error;
        }
    }
    

    // Limpia los filtros de busqueda de mongodb y elimina campos vacios o no definidos
    _cleanFindQuery(offerFilters: OfferFilters): void {
        const obj = offerFilters as Record<string, any>; //Lo casteamos a un objeto de tipo Record<string, any> para poder iterar sobre sus propiedades
        for (const key in obj) {
            if (obj[key] == undefined) {
                delete obj[key]; //Si es un string vacio, lo eliminamos        
            }
        }
    }
}

export default OfferMongoDBRepository;