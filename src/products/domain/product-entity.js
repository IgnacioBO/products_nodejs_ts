//@ts-check
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
const { validateField, validateArrayField } = require('../../shared/domain/utils/generic-functions');
const Attribute = require('./attribute-vo.js');
class Product {
    //Usamos cosntructor con ({}) para poder usar destructuring y no tener que pasar todos los argumentos al constructor
    //Osea podemos crear un producto sin pasarle todos los argumentos al constructor
    //Podremos nombrar cara argumento y no pasarlos todos
    //Por ejemplo:
    // const product = new Product({
    //     sku: "123495",
    //     title: "wena",
    //     isPublished: true,
    // })
    constructor({
        sku,
        parentSku,
        title,
        categoryCode,
        categoryName,
        description,
        shortDescription,
        isPublished,
        attributes,
      }) {
            validateField(sku, "SKU", "string", true);
            validateField(parentSku, "Parent SKU", "string", false);
            validateField(title, "Title", "string", false);
            validateField(categoryCode, "Category Code", "string", false);
            validateField(description, "Description", "string", false);
            validateField(shortDescription, "Short Description", "string", false);
            validateArrayField(attributes, "Attribute", "attribute", false);
            validateField(isPublished, "Is Published", "boolean", false);

            this.sku = sku;
            this.parentSku = parentSku;
            this.title = title;
            this.categoryCode = categoryCode;
            this.categoryName = categoryName;
            this.description = description;
            this.shortDescription = shortDescription;
            this.isPublished = isPublished;
            this.attributes = attributes;
        }
 
}
module.exports = Product;