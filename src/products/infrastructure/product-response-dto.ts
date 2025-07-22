//@ts-check
const Product = require('../domain/product-entity').default;
//Este DTO estara a cargo de transformar el objeto de tipo Product a un objeto de tipo ProductResponseDTO
//En este caso el DTO trendra los campos mapeados a snake_case para poder ser devuelto en la respuesta de la API correctamente
//Esto seria mas un mapper o adapter que un DTO, porque un DTO deberia tenre como parametros datos mas primitivos que un objeto de tipo Product
export interface AttributeResponseDTO {
    name_code?: string;
    name?: string;
    value_code?: string;
    value?: string;
}



export interface ProductResponseDTO {
    sku: string;
    parent_sku?: string;
    title?: string;
    category_code?: string;
    category_name?: string;
    description?: string;
    short_description?: string;
    is_published?: boolean;
    attributes?: AttributeResponseDTO[];
}
