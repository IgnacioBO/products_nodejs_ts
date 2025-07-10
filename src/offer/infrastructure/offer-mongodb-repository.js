//@ts-check
import { getDb } from '../../shared/infrastructure/config/database-mongodb';
const Offer = require('../domain/offer-entity.js');
const Price = require('../domain/price-vo.js');
const OfferRepository = require('../domain/offer-repository.js');
const OfferFilters = require('../domain/offer-filters.js');
const PaginationsParams = require('../../shared/domain/paginations-params-vo.js');
const {OfferNotFoundError} = require('../domain/offer-errors.js');

class OfferMongoDBRepository extends OfferRepository {

    /**
     * @param {Offer[]} offers 
     * @returns {Promise<Offer[]>}
     */
    async createOffer(offers) { 

        try{
            var query = []

            for (const offer of offers) {
                var queryIndividual = { offer_id: await this._getNextSequenceValue(), sku: offer.sku, is_published: offer.isPublished};            
                var queryPrices = [];
                if (Array.isArray(offer.prices)) {
                    for (const price of offer.prices){
                        queryPrices.push({currency: price.currency, type: price.type, value: price.value});
                    }
                    queryIndividual.prices = queryPrices;
                }
                offer.offerId = queryIndividual.offer_id; //Asignamos el offer_id al objeto offer para que se devuelva en la respuesta
                query.push(queryIndividual)       
            }
            const res = await getDb().collection('offers').insertMany(query, { ordered: false });
            if (res.insertedCount === offers.length) {
                console.log(`Se crearon ${res.insertedCount} offers de manera exitosa`);
                console.log('Offers creadas:', res.insertedIds);
            }else {
                throw new Error(`Se esperaban ${offers.length} pero se crearon ${res.insertedCount}`)     
            }
        }
        catch (error) {
            if(error.code == '11000') {
                let listado = [];
                for (const writeError of error.writeErrors) {
                    if (writeError.err.errmsg.includes('offer_id')){
                        listado.push({offer_id: writeError.err.op.offer_id});
                    }
                    if (writeError.err.errmsg.includes('sku')){
                        listado.push({sku: writeError.err.op.sku});
                    }
                }
                let errorNew = new Error(`Error al crear offers, sku y/o offer_id ya existen para estos registros:${(listado)}`);
                //@ts-ignore
                errorNew.message = {message:"Error al crear offers, sku y/o offer_id ya existen para estos registros", already_exists: listado};
                console.log(errorNew.message);
                throw errorNew;
            }
            console.error('Error al crear offers:', error);
            throw new Error(`Error al crear offers: ${error.message}`);     
        }
        return offers;
     }  

    /**
     * @param {OfferFilters} offerFilters
     * @param {PaginationsParams} paginationParams
     * @returns {Promise<Offer[]>}
     */
    async getAllOffers(offerFilters, paginationParams){
        let offers = []; 
         try{
            this._cleanFindQuery(offerFilters); //Limpia los filtros de busqueda de mongodb y elimina campos vacios o no definidos
            offers = await getDb().collection('offers').find(offerFilters).limit(paginationParams.limit).skip(paginationParams.offset).toArray();
        }
        catch (error) {
            console.error('Error al buscar las ofertas:', error);
            throw new Error(`Error al buscar las ofertas: ${error.message}`);     
        }
        return offers.map(offer => this._mapDocumentToOffer(offer)); //Mapea los documentos a objetos Offer
    }

    /**
     * @param {string} sku 
     * @returns {Promise<Offer[]>}
     */
    getOfferBySku(sku) { throw new Error('Not implemented'); }

    /**
     * @param {Offer[]} offers
     * @returns {Promise<Offer[]>}
     */ 
    async updateFullOffer(offers) { 
        try{
            var query = []

            for (const offer of offers) {
                var queryIndividual = { updateOne: { filter: { sku: offer.sku }, 
                                        update: { $set :{ is_published: offer.isPublished,}}, 
                                        upsert: false }};
                var queryPrices = [];
                if (Array.isArray(offer.prices)) {
                    for (const price of offer.prices){
                        queryPrices.push({currency: price.currency, type: price.type, value: price.value});
                    }
                    queryIndividual.updateOne.update.$set.prices = queryPrices;
                } else {
                    queryIndividual.updateOne.update.$unset = { prices: "" }; //Si no hay precios, los eliminamos
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
     * @returns {Promise<Offer[]>}
     */
    async updateOffer(offers) {        
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
    async deleteOffer(offers) { 
        let resultado = "";
        try{
            var query = []
            for (const offer of offers) {
                var queryIndividual = { deleteOne: { filter: { sku: offer.sku }}};

                if(offer.isPublished != undefined) { 
                    queryIndividual.updateOne.update.$set.is_published = offer.isPublished; //Si is_published esta definido, lo actualizamos
                } 
                query.push(queryIndividual)       
            }
            const res = await getDb().collection('offers').bulkWrite(query);
            resultado = `Se eliminaron ${res.deletedCount} offers `
            console.log(resultado);
        }
        catch (error) {
            console.error('Error al elimianar offers:', error);
            throw new Error(`Error al elimianar offers: ${error.message}`);     
        }
        return resultado;  
    }

    /**
     * @param {OfferFilters} offerFilters
     * @returns {Promise<number>} - Devuelve el total de offers que cumplen con los filtros
     */
    async count(offerFilters){ 
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
            throw new Error(`Error al countar los documentos: ${error.message}`);     
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
    

    /**
     * Limpia los filtros de busqueda de mongodb y elimina campos vacios o no definidos
     * @param {OfferFilters} offerFilters - Filtros para la consulta
     * @return {Object} - Devuelve un objeto con la query para mongoDB
     */
    _cleanFindQuery(offerFilters) {
        for (const key in offerFilters) {
            if (offerFilters[key] == undefined) {
                delete offerFilters[key]; //Si es un string vacio, lo eliminamos        
            }
        }
        return offerFilters;
    }

    /**
     * Mapea un documento de la base de datos a un objeto Offer
     * @param {import("mongodb").WithId<import("mongodb").Document>} document - Documento de la base de datos
     * @return {Offer} - Objeto Offer mapeado
     * @private
     */
    _mapDocumentToOffer(document) {
        const priceArray = Array.isArray(document.prices) ? document.prices : [];
        const prices = priceArray.map(a =>
          new Price({
            currency:  a.currency,
            type:      a.type,
            value:     a.value
          })
        );
        //@ts-ignore
        return new Offer({
          offerId:      document.offer_id,
          sku:          document.sku,
          isPublished:  document.is_published,
          ...(prices.length && {prices}), // Si no hay precios,
        });

    }
}

export default OfferMongoDBRepository;