import Product from '../domain/product-entity';
import Attribute from '../domain/attribute-vo';
import { ProductResponseDTO, AttributeResponseDTO } from './product-response-dto';


function attributeToResponseDTO(attr: Attribute): AttributeResponseDTO {
    return {
        name_code:  attr.nameCode,
        name:       attr.name,
        value_code: attr.valueCode,
        value:      attr.value
    };
}

export function productToResponseDTO(product: Product): ProductResponseDTO {
    return {
        sku : product.sku,
        parent_sku : product.parentSku,
        title : product.title,
        category_code : product.categoryCode,
        category_name : product.categoryName,
        description : product.description,
        short_description : product.shortDescription,
        is_published : product.isPublished,
        attributes : product.attributes?.map(attributeToResponseDTO) // Aqui mapeara los atributos solo si existen, si no queda como undefined
}
}


