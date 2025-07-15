//@ts-check
import Product from '../domain/product-entity';
import Attribute from '../domain/attribute-vo';
import ProductFilters from'../domain/product-filters';
import ProductFiltersDTO from '../application/product-filters-dto.js';
import PaginationsParams  from '../../shared/domain/paginations-params-vo';
import type ProductRepository from '../domain/product-repository.js';
import {CreateProductRequestDTO, AttributeDTO} from './product-request-dto';
import {jsonToCreateProductRequestDTO, createDTOtoEntity} from './product-request-mapper';




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
    //Transformamos el DTO a un intercface de tipo ProductFilters
    //Aqui a futuro en vez de transformar el DTO a un objeto de tipo ProductFilters directamente
    //podriamos usar un mapper que se encargue de transformar el DTO a un objeto de tipo ProductFilters
    const productFilters: ProductFilters = {
      sku: productFiltersDTO.sku,
      category_code: productFiltersDTO.category_code
    };

    const productos: Product[] = await this.productRepository.getAllProducts(productFilters, paginationsParams);
    return productos;
  }

  async count (productFiltersDTO: ProductFiltersDTO): Promise<number> {
    const productFilters: ProductFilters = {
      sku: productFiltersDTO.sku,
      category_code: productFiltersDTO.category_code
    };
    const count: number = await this.productRepository.count(productFilters);
    return count;

  }

  async getProductBySku(sku: string): Promise<Product[]> {
    //Obtenemos las filas de productRepository que devolvera un array de objetos
    try{
        const productos: Product[] = await this.productRepository.getProductBySku(sku)
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
        console.log("productsDTO", productsDTO);
        const productsObjectArray: Product[] = productsDTO.map(p => createDTOtoEntity(p));
        console.log("productsObjectArray", productsObjectArray);


        const result = await this.productRepository.createProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }


  //CreateDTOtoEntity
  async updateFullProduct(products) {
    try{
        //Transformamos el array de productos de un json a un array de objetos de la clase Product
        const productsObjectArray = products.map(p => this._jsonArrayToProducts(p));
        //Aqui llamamos al repositorio de productos y le pasamos el array de objetos de la clase Product
        //El repo hace la insercion y nos devuelve un array de objetos Product con los datos insertados
        const result = await this.productRepository.updateFullProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }

  async updateProduct(products) {
    try{
        const productsObjectArray = products.map(p => this._jsonArrayToProducts(p));
        const result = await this.productRepository.updateProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }
  }

  async deleteProduct(products) {
    try{
        const result = await this.productRepository.deleteProduct(productsObjectArray);
        return result;
    }
    catch (error) {
        throw error;
    }

  }

  //Metodo privado que mapea un json a un objeto Product
  //A futuro, este json a product no deberia esta en esta capa de application
  //Porque application deberia recibir un objeto de tipo Product o un DTO de tipo Product pero no un json
  //Ose la capa infrastructure deberia ser la que se encargue de transformar el json a un objeto de tipo Product o un DTO de tipo Product
  _jsonArrayToProducts(json) {
    //Nos attrsArray es un array, si no es un array (null o undefinder por ejemlo) lo convertimos a un array vacio
    const attrsArray = Array.isArray(json.attributes) ? json.attributes : [];
    //Aqui hago algo similar a rows.map pero recorro el array de atributos
    // Osea que por cada atributo del array de atributos de la fila
    // creo un nuevo objeto Attribute y lo guardo en un array de atributos
    //Debo hacer un if para ver si elemento.atributes es undefined o no
    //Con este if:
    const attributes = attrsArray.map(a =>
        new Attribute({
        name_code:  a.name_code,
        name:       a.name,
        value_code: a.value_code,
        value:      a.value
        })
    );

    return new Product({
        sku:           json.sku,
        ...(json.parent_sku && { parent_sku: json.parent_sku }),  // sólo inserta parent_sku si no viene undefined o null
        title:         json.title,
        categoryCode: json.category_code,
        categoryName: json.category_name,
        description:   json.description,
        ...(json.short_description && { shortDescription: json.short_description }), // sólo inserta short_description si no viene undefined o null
        isPublished: json.is_published, // sólo inserta is_published si no viene undefined o null
        ...(attributes.length && { attributes })// sólo inserta attributes si hay al menos uno
    });
    }
}




export default ProductService;