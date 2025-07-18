//@ts-check
const Product = require('../domain/product-entity').default;
//Este DTO estara a cargo de transformar el objeto de tipo Product a un objeto de tipo ProductResponseDTO
//En este caso el DTO trendra los campos mapeados a snake_case para poder ser devuelto en la respuesta de la API correctamente
//Esto seria mas un mapper o adapter que un DTO, porque un DTO deberia tenre como parametros datos mas primitivos que un objeto de tipo Product
class ProductResponseDTO {
    /**
     * @param {Product} product - Objeto de tipo Product
     */
  constructor(product) {
    this.sku = product.sku;
    this.parent_sku = product.parentSku;
    this.title = product.title;
    this.category_code = product.categoryCode;
    this.category_name = product.categoryName;
    this.description = product.description;
    this.short_description = product.shortDescription;
    this.is_published = product.isPublished;
    this.attributes = product.attributes;
  }
}

module.exports = ProductResponseDTO;