//@ts-check
const Product = require('./product-entity.js');
const ProductFilters = require('./product-filters.js');
const PaginationsParams = require('../../shared/domain/paginations-params-vo.js');
//Este product.repository.js es la interfaz que define 
// los metodos que debe implementar el repositorio de productos en la capa de infraestructura
/**
 * Usando JSDoc para documentar el código dejando claro que es una interfaz
 * Osea que esta clase deberia ser implementada por otra clase
 * y no deberia ser instanciada directamente
 * @interface
 */
class ProductRepository {
    /**
     * Haremos un constructor que no recibe nada
     * Y lanzara error si se intenta instanciar la clase directamente (sin heredar de ella)
     * @throws {Error}
     * */
    constructor() {
        if (this.constructor === ProductRepository) {
            throw new Error('Cannot instantiate abstract class ProductRepository directly. This is an interface.');
        }
    }

    /**
     * Definimo que el metodo creatProduct recibe un array de objetos de la clase Product
     * Y devuelve una promesa que resuelve un array de objetos de la clase Product creados
     * @param {Product[]} products 
     * @returns {Promise<Product[]>}
     */
    createProduct(products) { throw new Error('Not implemented'); }  //Como en JS no existe el concepto de interface
    //Lo que hacemos es forzar un error si no se implementa el metodo en la clase que hereda de esta clase

    /**
     * @param {ProductFilters} productFilters
     * @param {PaginationsParams} paginationParams
     * @returns {Promise<Product[]>}
     */
    getAllProducts(productFilters, paginationParams){ throw new Error('Not implemented'); }

    /**
     * @param {string} sku 
     * 
     * @returns {Promise<Product[]>}
     */
    getProductBySku(sku) { throw new Error('Not implemented'); }

    /**
     * @param {Product[]} products
     * @returns {Promise<Product[]>}
     */ 
    updateFullProduct(products) { throw new Error('Not implemented'); }

    /**
     * @param {Product[]} products
     * @returns {Promise<Product[]>}
     */
    updateProduct(products) { throw new Error('Not implemented'); }

    /**
     * @param {Product[]} products 
     * @returns {Promise<Product[]>}
     */
    deleteProduct(products) { throw new Error('Not implemented'); }
    

    /**
     * @param {ProductFilters} productFilters
     * @returns {Promise<number>} - Devuelve el total de productos que cumplen con los filtros
     */
    count(productFilters){ throw new Error('Not implemented'); }


  }

  module.exports.ProductRepository = ProductRepository;