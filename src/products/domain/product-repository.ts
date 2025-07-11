import type Product from './product-entity';
import ProductFilters from './product-filters';
import PaginationsParams from '../../shared/domain/paginations-params-vo';
//Este product.repository es la interfaz que define 
// los metodos que debe implementar el repositorio de productos en la capa de infraestructura

//Dentro de la arquitectura hexagonal, este interface sería un puerto de salida, osea tiene la forma que debe tener un repositorio de productos
//y en la capa de infraestructura se implementará este puerto de salida (adaptador), por ejemplo uno que use PostgreSQL, otro que use MongoDB, etc.
interface ProductRepository {
    //Definimos que el metodo createProduct recibe un array de objetos de la clase Product
    //Y devuelve una promesa que resuelve un array de objetos de la clase Product creados
    createProduct(products: Product[]): Promise<Product[]>;
    
    getAllProducts(productFilters: ProductFilters, paginationParams: PaginationsParams): Promise<Product[]>;

    getProductBySku(sku: string): Promise<Product[]>;

    updateFullProduct(products: Product[]): Promise<Product[]>;

    updateProduct(products: Product[]): Promise<Product[]>;

    deleteProduct(products: Product[]): Promise<Product[]>;

    count(productFilters: ProductFilters): Promise<number>;
  }

  export default ProductRepository;