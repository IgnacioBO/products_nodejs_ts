import {CreateProductRequestDTO, UpdateFullProductRequestDTO, UpdatePartialProductRequestDTO, DeleteProductRequestDTO, AttributeDTO} from './product-request-dto';
import Product from '../domain/product-entity';
import Attribute from '../domain/attribute-vo';


export function jsonToCreateProductRequestDTO(json: any): CreateProductRequestDTO {

    const attrsArray: any[] = Array.isArray(json.attributes) ? json.attributes : [];

    let attributes: AttributeDTO[] | undefined = attrsArray.map(a =>
    ({
        name_code:  a.name_code,
        name:       a.name,
        value_code: a.value_code,
        value:      a.value
    }));

    attributes = attrsArray.length > 0 ? attributes : undefined;

    return {
        sku:           json.sku,
        parent_sku:  json.parent_sku, // puede ser undefined o null
        title:         json.title,
        category_code: json.category_code,
        description:   json.description,
        short_description: json.short_description, // puede ser undefined o null
        is_published: json.is_published, // sólo inserta is_published si no viene undefined o null
        attributes: attributes // puede ser undefined o null
    };
}

//Como son dos funciones que hacen lo mismo, una para crear y otra para actualizar
//Podemos reutilizar la funcion jsonToCreateProductRequestDTO para crear el DTO de Update por ahora
export function jsonToUpdateFullProductRequestDTO(json: any): UpdateFullProductRequestDTO {
    return jsonToCreateProductRequestDTO(json);
}

export function jsonToUpdatePartialProductRequestDTO(json: any): UpdatePartialProductRequestDTO {
      return jsonToCreateProductRequestDTO(json);
}

export function jsonToDeleteProductRequestDTO(json: any): DeleteProductRequestDTO {
    return {
        sku: json.sku
    };
}


// Algunos recomiendad separa cada funcion mapper para cada DTO, pero si no estan complejo ni tantas validaciones
//En mi caso yo estoy manejando los undefined y null en el repository, por lo que no necesito hacer validaciones complejas
//Si necesitas hacer validaciones complejas, entonces si es mejor separar cada mapper en su propia
export function requestDTOtoEntity(dto: CreateProductRequestDTO | UpdateFullProductRequestDTO | UpdatePartialProductRequestDTO): Product {

    const attributes = dto.attributes?.map(a =>
        new Attribute({
        nameCode:  a.name_code,
        name:       a.name,
        valueCode: a.value_code,
        value:      a.value
        })
    );

    return new Product({
        sku:             dto.sku,
        parentSku:       dto.parent_sku,
        title:           dto.title,
        categoryCode:    dto.category_code,
        description:     dto.description,
        shortDescription:dto.short_description,
        isPublished:     dto.is_published,
        attributes:      attributes,
    });
}

export function requestDeleteDTOtoEntity(dto: DeleteProductRequestDTO): Product {
    return new Product({
        sku:             dto.sku,
    });
}