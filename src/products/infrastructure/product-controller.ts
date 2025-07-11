//@ts-check
const { ProductoNotFoundError, ProductWithSKUAlreadyExistsError } = require("../domain/product-errors"); //Para poder identificar el tipo de error (instance of) que viene desde las capas dominio y poder manejarlo en el controller
const httpError = require("../../shared/infrastructure/errors/http-errors"); //Para poder enviar al cliente error con status code y mensaje de error
const ProductFiltersDTO = require('../application/product-filters-dto.js');
import PaginationMetadata from "../../shared/application/pagination-metadata";
import type PaginationMetadataResponseDTO from "../../shared/application/pagination-metadata-dto";
import { toPaginationMetadataResponseDTO } from "../../shared/application/pagination-metadata-mapper";
const PaginationsParams = require("../../shared/domain/paginations-params-vo");
const ProductResponseDTO = require("./product-response-dto.js");


class ProductController {
    //Constructor para controller que recibe el servicio de productos a través 
    //de la inyección de dependencias
    constructor(productService) {
      this.productService = productService;
  
      //Ligamos el contexto para que cuando se use como callback el getAll() pueda acceder a la propiedad this.productService
      //Osea cuando routes llama a la funcion getAll:
      //router.get('/', productController.getAll);  
      //Aca puede dar error al intentar accede a this.productService
      //Osea el this.productService no se puede acceder porque el contexto de this cambia y no se puede acceder a las propiedades de la clase
      //Esto porque cuando hacemos un callack y esto hace que el contexto de this cambie.   
      //Entonces al hacer un bind de getAll permite que cuando se ejecute el callback, el contexto de this sea el de esta clase (ProductController)
      //Y ahi si se puede acceder a la propiedad productService
      this.getAll = this.getAll.bind(this);
      this.getBySku = this.getBySku.bind(this);
      this.createProduct = this.createProduct.bind(this);
      this.updateProduct = this.updateProduct.bind(this);
      this.deleteProduct = this.deleteProduct.bind(this);
      this.updateFullProduct = this.updateFullProduct.bind(this);
    }
  
    //Metodo para obtener todos los productos
    //Recibe como parametro el request, response y next
    //El next sirve para poder manejar errores y pasar al siguiente middleware
    
     /**
     * Aca definimos los parametros para que el AUTOMCOMPLTEADO AYUDE
     * @param {import("express").Request} req - The request object
     * @param {import("express").Response & {success}} res - The response object
     * @param {import("express").NextFunction} next - The next function
     */
    async getAll(req, res, next) {
      try {
        //Obtener los paramerto de la query string (query params) y los asignamos a un objeto
        //Esto es para poder filtrar los productos por categoria y por nombre:
        //Asi se obtiene:
        const { category_code, sku, page = 0, limit = 0 } = req.query;

        //Creamos un objeto de tipo ProductFiltersDTO que es un DTO que tiene los campos para filtrar los productos
        //Luego el servicio se encargara de transformar el DTO en un objeto de tipo ProductFilters (del dominio)
        //Le pasamos los parametros de la query string (query params) para filtrar los productos
        const productFiltersDTO = new ProductFiltersDTO({
            sku: sku,
            category_code: category_code,
        });

        const totalCount = await this.productService.count(productFiltersDTO);
        const paginationMetadata = new PaginationMetadata(Number(page), Number(limit), totalCount, 50);
        const paginationsParams: PaginationsParams = {offset: paginationMetadata.offset, limit: paginationMetadata.limit};

        const products = await this.productService.getAllProducts(productFiltersDTO, paginationsParams);
        paginationMetadata.count = products.length;
        const paginationMetadataResponseDTO: PaginationMetadataResponseDTO = toPaginationMetadataResponseDTO(paginationMetadata);
        const productResponse = products.map(product => new ProductResponseDTO(product));

        //res.success es un metodo que se define en el middleware (en shared/infrastructure/middleware/response-handlers.js)
        //este res.succes permite tener una formato estandarizado para las respuestas de la API (osea que tenga data, message, status, etc)
        res.success({data: productResponse, message: 'success', meta: paginationMetadataResponseDTO});
      } catch (error) {
        //Aqui se hace next para que vaya al handler de errores y se maneje el error
        //Se envia un httpError.InternalServerError, esto ya tiene definido el status code y se le envia el mensaje.
        return next(httpError.InternalServerError(error.message));
      }
    } 

    async getBySku(req, res, next) {
        try {
            //Esto es lo mismo que decir const sku = req.params.sku
            const { sku } = req.params;
            const product = await this.productService.getProductBySku(sku);
            const productResponse = product.map(product => new ProductResponseDTO(product));
            res.success({data: productResponse});
        } catch (error) {
            //El erro.status puede deifnirse incluso en la capa repositorio, pero debe hacerse n esta capa porque controller es la encargada de definir
            //temas como el status code y otros temas (auqnue podria ir en un middleware)
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message))
        }
    }

    /**JSdoc para definir los tipos de los parametros de la funcion:
     @param {import("express").Request} req - The request object
     @param {import("express").Response & {success}} res - The response object
     @param {import("express").NextFunction} next - The next function
    */
    async createProduct(req, res, next) {
        try {
            
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de productos'));
            }
            //Recorremos el array de productos y validamos que cada producto tenga los campos obligatorios (sku, title, category_code, description e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const product = requestBody[i];
                if (!product.sku || !product.title || !product.category_code || !product.description || product.is_published == undefined) {
                    return next(httpError.BadRequestError(`El producto en la posicion ${i} no tiene todos los campos obligatorios: sku, title, category_code, description e is_published`));
                }
            }
            const result = await this.productService.createProduct(requestBody);
            const productResponse = result.map(product => new ProductResponseDTO(product));
            res.status(201).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductWithSKUAlreadyExistsError){
                return next(httpError.BadRequestError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

    async updateFullProduct(req, res, next) {
        try {
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de productos'));
            }
            //Recorremos el array de productos y validamos que cada producto tenga los campos obligatorios (sku, title, category_code, description e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const product = requestBody[i];
                if (!product.sku || !product.title || !product.category_code || !product.description || product.is_published == undefined) {
                    return next(httpError.BadRequestError(`El producto en la posicion ${i} no tiene todos los campos obligatorios: sku, title, category_code, description e is_published`));
                }
            }
            const result = await this.productService.updateFullProduct(requestBody);
            const productResponse = result.map(product => new ProductResponseDTO(product));
            
            res.status(201).success({data:productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

    async updateProduct(req, res, next) {
        try {
            const requestBody = req.body;
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de productos'));
            }
            //Recorremos el array de productos y validamos que cada producto tenga los campos obligatorios (sku, title, category_code, description e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const product = requestBody[i];
                if (!product.sku) {
                    return next(httpError.BadRequestError(`El producto en la posicion ${i} no tiene todos los campos obligatorios para actualizar: sku`));
                }
            }
            const result = await this.productService.updateProduct(requestBody);
            const productResponse = result.map(product => new ProductResponseDTO(product));

            res.status(200).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const requestBody = req.body;
            let arrayDeSkus = [];
            //Si el req.body no es un array, da error con un if
            if (!Array.isArray(requestBody)) {
                return next(httpError.BadRequestError('El body debe ser un array de productos'));
            }
            //Recorremos el array de productos y validamos que cada producto tenga los campos obligatorios (sku, title, category_code, description e is_published)
            for (let i = 0; i < requestBody.length; i++) {
                const product = requestBody[i];
                if (!product.sku) {
                    return next(httpError.BadRequestError(`El producto en la posicion ${i} no tiene todos los campos obligatorios para eliminar: sku`));
                }
                arrayDeSkus.push({sku : product.sku});
            }
            const result = await this.productService.deleteProduct(arrayDeSkus);
            const productResponse = result.map(product => new ProductResponseDTO(product));
            res.status(200).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            return next(httpError.InternalServerError(error.message));
        }
    }

  }
  
  module.exports = ProductController;