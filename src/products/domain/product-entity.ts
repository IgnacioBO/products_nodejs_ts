//Esto es un entity, es decir, una clase que representa un objeto del dominio
//y que tiene una identidad unica* (en este caso el sku)
//Osea aunque tengamos dos productos con los mismos campos pero distintos skus
//son dos productos distintos. Esto en contraste con un value object que no tiene identidad unica
//Porque su dos value object tiene los mismos campos y valores son el mismo value object
/*Entity:
A "what" in the domain.

Value Object:
A "description" or "attribute" of something else. 
*/
//TODO: Cambiar a camelCase los nombres de las propiedades de la clase y luego en el service se cambian a snake_case ya sea con una funcion o un DTO    
import { validateField, validateArrayField } from '../../shared/domain/utils/generic-functions';
import Attribute from './attribute-vo.js';

//Este interface define la estructura de un producto
interface IProduct {
    sku: string;
    parentSku?: string;
    title?: string;
    categoryCode?: string;
    categoryName?: string;
    description?: string;
    shortDescription?: string;
    isPublished?: boolean;
    attributes?: Attribute[];
}

class Product implements IProduct {
    sku: string;
    parentSku?: string;
    title?: string;
    categoryCode?: string;
    categoryName?: string;
    description?: string;
    shortDescription?: string;
    isPublished?: boolean;
    attributes?: Attribute[];

    //Aqui el constructor recibe un objeto que implementa el interface IProduct
    constructor(params: IProduct) {
        //Todo talvez eliminar esta validacion?    
        validateField(params.sku, "SKU", "string", true);
        validateField(params.parentSku, "Parent SKU", "string", false);
        validateField(params.title, "Title", "string", false);
        validateField(params.categoryCode, "Category Code", "string", false);
        validateField(params.description, "Description", "string", false);
        validateField(params.shortDescription, "Short Description", "string", false);
        validateArrayField(params.attributes, "Attribute", "attribute", false);
        validateField(params.isPublished, "Is Published", "boolean", false);

        
        this.sku = params.sku;
        this.parentSku = params.parentSku;
        this.title = params.title;
        this.categoryCode = params.categoryCode;
        this.categoryName = params.categoryName;
        this.description = params.description;
        this.shortDescription = params.shortDescription;
        this.isPublished = params.isPublished;
        this.attributes = params.attributes;
        }
 
}
export default Product;