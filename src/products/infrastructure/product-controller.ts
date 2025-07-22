import { ProductoNotFoundError, ProductWithSKUAlreadyExistsError } from "../domain/product-errors"; //Para poder identificar el tipo de error (instance of) que viene desde las capas dominio y poder manejarlo en el controller
import * as httpError from "../../shared/infrastructure/errors/http-errors"; //Para poder enviar al cliente error con status code y mensaje de error
import ProductFiltersDTO from '../application/product-filters-dto';
import PaginationMetadata from "../../shared/application/pagination-metadata";
import type PaginationMetadataResponseDTO from "../../shared/application/pagination-metadata-dto";
import { toPaginationMetadataResponseDTO } from "../../shared/application/pagination-metadata-mapper";
import PaginationsParams from "../../shared/domain/paginations-params-vo";
import {ProductResponseDTO} from "./product-response-dto";
import {productToResponseDTO} from "./product-response-mapper";
import {CreateProductRequestDTO, DeleteProductRequestDTO, UpdateFullProductRequestDTO, UpdatePartialProductRequestDTO} from '../application/product-request-dto';
import {jsonToCreateProductRequestDTO, jsonToUpdateFullProductRequestDTO, jsonToUpdatePartialProductRequestDTO, jsonToDeleteProductRequestDTO} from '../application/product-request-mapper';
import type ProductService from '../application/product-service.js';
import type { Request, Response, NextFunction } from 'express';
import type { CustomResponse } from '../../shared/infrastructure/middlewares/response-handlers.js';
import type Product from "../domain/product-entity";


class ProductController {
    productService: ProductService;
    //Constructor para controller que recibe el servicio de productos a través 
    //de la inyección de dependencias
    constructor(productService: ProductService) {
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
  

    async getAll(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void> {
      try {
        //Obtener los paramerto de la query string (query params) y los asignamos a un objeto
        //Esto es para poder filtrar los productos por categoria y por nombre:
        //Asi se obtiene:
        const { category_code, sku, page = 0, limit = 0 } = req.query;

        //Creamos un objeto de tipo ProductFiltersDTO que es un DTO que tiene los campos para filtrar los productos
        //Luego el servicio se encargara de transformar el DTO en un objeto de tipo ProductFilters (del dominio)
        //Le pasamos los parametros de la query string (query params) para filtrar los productos
        const productFiltersDTO: ProductFiltersDTO = {
            sku: sku?.toString(), //Si sku no existe, se convierte a undefined
            category_code: category_code?.toString(),
        };

        const totalCount: number = await this.productService.count(productFiltersDTO);
        const paginationMetadata: PaginationMetadata = new PaginationMetadata(Number(page), Number(limit), totalCount, 50);
        const paginationsParams: PaginationsParams = {offset: paginationMetadata.offset, limit: paginationMetadata.limit};

        const products: Product[] = await this.productService.getAllProducts(productFiltersDTO, paginationsParams);
        paginationMetadata.count = products.length;
        const paginationMetadataResponseDTO: PaginationMetadataResponseDTO = toPaginationMetadataResponseDTO(paginationMetadata);
        const productResponse: ProductResponseDTO[] = products.map(productToResponseDTO)

        //res.success es un metodo que se define en el middleware (en shared/infrastructure/middleware/response-handlers.js)
        //este res.succes permite tener una formato estandarizado para las respuestas de la API (osea que tenga data, message, status, etc)
        res.success({data: productResponse, message: 'success', meta: paginationMetadataResponseDTO});
      } catch (error) {
        //Si el error es de tipo Error, se envia el mensaje de error, si no, se convierte a string
        const msg = error instanceof Error
                    ? error.message
                    : String(error);

        //Aqui se hace next para     que vaya al handler de errores y se maneje el error
        //Se envia un httpError.InternalServerError, esto ya tiene definido el status code y se le envia el mensaje.
        return next(httpError.InternalServerError(msg));
        }
    }

    async getBySku(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void>  {
        try {
            //Esto es lo mismo que decir const sku = req.params.sku
            const { sku } = req.params;
            const products: Product[] = await this.productService.getProductBySku(sku);
            const productResponse = products.map(productToResponseDTO);
            res.success({data: productResponse});
        } catch (error) {
            //El erro.status puede deifnirse incluso en la capa repositorio, pero debe hacerse n esta capa porque controller es la encargada de definir
            //temas como el status code y otros temas (auqnue podria ir en un middleware)
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            const msg = error instanceof Error
                    ? error.message
                    : String(error);
            return next(httpError.InternalServerError(msg))
        }
    }

    async createProduct(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void> {
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
            const productsDTOArray: CreateProductRequestDTO[] = requestBody.map(rb => jsonToCreateProductRequestDTO(rb));
            //Version corta: const productsDTOArray = requestBody.map(jsonToCreateProductRequestDTO);
            const products = await this.productService.createProduct(productsDTOArray);
            const productResponse = products.map(productToResponseDTO);
            res.status(201).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductWithSKUAlreadyExistsError){
                return next(httpError.BadRequestError(error.message));
            }
            const msg = error instanceof Error ? error.message: String(error);
            return next(httpError.InternalServerError(msg));
        }
    }

    async updateFullProduct(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void> {
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
            const productsDTOArray: UpdateFullProductRequestDTO[] = requestBody.map(jsonToUpdateFullProductRequestDTO);
            const products = await this.productService.updateFullProduct(productsDTOArray);
            const productResponse = products.map(productToResponseDTO);
            
            res.status(201).success({data:productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            const msg = error instanceof Error ? error.message: String(error);

            return next(httpError.InternalServerError(msg));
        }
    }

    async updateProduct(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void> {
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
            const productsDTOArray: UpdatePartialProductRequestDTO[] = requestBody.map(jsonToUpdatePartialProductRequestDTO);
            const products = await this.productService.updateProduct(productsDTOArray);
            const productResponse = products.map(productToResponseDTO);

            res.status(200).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            const msg = error instanceof Error ? error.message: String(error);
            return next(httpError.InternalServerError(msg));
        }
    }

    async deleteProduct(req: Request, res: CustomResponse<ProductResponseDTO[], PaginationMetadataResponseDTO>, next: NextFunction): Promise<void> {
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
                    return next(httpError.BadRequestError(`El producto en la posicion ${i} no tiene todos los campos obligatorios para eliminar: sku`));
                }
            }
            const productsDTOArray: DeleteProductRequestDTO[] = requestBody.map(jsonToDeleteProductRequestDTO);
            const products = await this.productService.deleteProduct(productsDTOArray);
            const productResponse = products.map(productToResponseDTO);
            res.status(200).success({data: productResponse});
        } catch (error) {
            if(error instanceof ProductoNotFoundError){
                return next(httpError.NotFoundError(error.message));
            }
            const msg = error instanceof Error ? error.message: String(error);
            return next(httpError.InternalServerError(msg));
        }
    }

  }
  
export default ProductController;