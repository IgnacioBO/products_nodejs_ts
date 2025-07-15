import {CreateProductRequestDTO, AttributeDTO} from './product-request-dto';
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

export function createDTOtoEntity(dto: CreateProductRequestDTO): Product {

        const attributes = dto.attributes?.map(a =>
        new Attribute({
        name_code:  a.name_code,
        name:       a.name,
        value_code: a.value_code,
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