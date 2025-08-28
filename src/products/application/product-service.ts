//@ts-check
import Product from '../domain/product-entity';
import ProductFilters from'../domain/product-filters';
import ProductFiltersDTO from '../application/product-filters-dto.js';
import PaginationsParams  from '../../shared/domain/paginations-params-vo';
import type ProductRepository from '../domain/product-repository.js';
import {CreateProductRequestDTO, UpdateFullProductRequestDTO, UpdatePartialProductRequestDTO, DeleteProductRequestDTO} from './product-request-dto';
import {requestDTOtoEntity, requestDeleteDTOtoEntity} from './product-request-mapper';

//Aqui haremos una clase ProductService que se encargara de manejar 
// la logica de negocio de los productos y de interactuar con el repositorio de productos
// El constructor de la clase ProductService recibira como parametro el repositorio de productos y lo asignara a una propiedad de la clase productRepository

// Esto es lo que se conoce como inyeccion de dependencias.
// Osea en vez de importar directamente el repositorio de 
// productos en la clase ProductService (usando require('./product.repository.js'))
// lo inyectamos como parametro en el constructor de la clase ProductService
// Esto nos permite cambiar el repositorio de productos por otro repositorio si es necesario
// sin tener que modificar la clase ProductService

//Nosotros le pasaremos el repositorio desde el archivo index.js
// y en el archivo index.js crearemos una instancia de la clase ProductService

class ProductService {
  productRepository: ProductRepository;
  //Constructor que recibirá el repositorio de productos como parametro (que lo inyectaremos desde el index.js)
  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  //GetAllProduct recibe un objeto de tipo productFiltersDTO y parametros de paginacion (page y perpage) trasnformara este DTO a un objeto de tipo ProductFilters

  async getAllProducts(productFiltersDTO: ProductFiltersDTO, paginationsParams: PaginationsParams): Promise<Product[]> {
    try{
      //Transformamos el DTO a un intercface de tipo ProductFilters
      //Aqui a futuro en vez de transformar el DTO a un objeto de tipo ProductFilters directamente
      //podriamos usar un mapper que se encargue de transformar el DTO a un objeto de tipo ProductFilters
      const productFilters: ProductFilters = {
        sku: productFiltersDTO.sku,
        category_code: productFiltersDTO.category_code
      };
      const productos: Product[] = await this.productRepository.getAllProducts(productFilters, paginationsParams);
      return productos;
    } catch (error) {
      throw error;
    }

  }

  async count (productFiltersDTO: ProductFiltersDTO): Promise<number> {
    try{
      const productFilters: ProductFilters = {
        sku: productFiltersDTO.sku,
        category_code: productFiltersDTO.category_code
      };
      const count: number = await this.productRepository.count(productFilters);
      return count;
    } catch (error) {
      throw error;
    }
  }

  async getProductBySku(sku: string): Promise<Product[]> {
    //Obtenemos las filas de productRepository que devolvera un array de objetos
    try{
        const productos: Product[] = await this.productRepository.getProductBySku(sku);
        return productos;
    }
    catch (error: unknown) {
        //console.log(error);
        throw error;
    }
  }
  
  async createProduct(productsDTO: CreateProductRequestDTO[]): Promise<Product[]> {
    try{
        //Transformamos el array de productos de un json a un array de objetos de la clase Product
        //const productsObjectArray = products.map(p => jsonToCreateProductRequestDTO(p));
        //Aqui llamamos al repositorio de productos y le pasamos el array de objetos de la clase Product
        //El repo hace la insercion y nos devuelve un array de objetos Product con los datos insertados
        const productsObjectArray: Product[] = productsDTO.map(p => requestDTOtoEntity(p));
        const result : Product[] = await this.productRepository.createProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }


  //CreateDTOtoEntity
  async updateFullProduct(productsDTO: UpdateFullProductRequestDTO[]): Promise<Product[]> {
    try{
        //Transformamos el array de productos de un json a un array de objetos de la clase Product
        const productsObjectArray: Product[] = productsDTO.map(requestDTOtoEntity);
        //Aqui llamamos al repositorio de productos y le pasamos el array de objetos de la clase Product
        //El repo hace la insercion y nos devuelve un array de objetos Product con los datos insertados
        const result : Product[] = await this.productRepository.updateFullProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }

  async updateProduct(productsDTO: UpdatePartialProductRequestDTO[]): Promise<Product[]> {
    try{
        const productsObjectArray: Product[] = productsDTO.map(requestDTOtoEntity);
        const result: Product[] = await this.productRepository.updateProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }
  }

  async deleteProduct(productsDTO: DeleteProductRequestDTO[]): Promise<Product[]> {
 try{
        const productsObjectArray: Product[] = productsDTO.map(requestDeleteDTOtoEntity);
        const result: Product[] = await this.productRepository.deleteProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }
}

export default ProductService;