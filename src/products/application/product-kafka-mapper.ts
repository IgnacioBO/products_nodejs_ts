import Product from '../domain/product-entity';
import Attribute from '../domain/attribute-vo';
import { ProductKafkaDTO, AttributeKafkaDTO } from './product-kafka-dto';


function attributeToKafkaDTO(attr: Attribute): AttributeKafkaDTO {
    return {
        name_code:  attr.nameCode,
        name:       attr.name,
        value_code: attr.valueCode,
        value:      attr.value
    };
}

export function productToKafkaDTO(product: Product): ProductKafkaDTO {
    return {
        sku : product.sku,
        parent_sku : product.parentSku,
        title : product.title,
        category_code : product.categoryCode,
        category_name : product.categoryName,
        description : product.description,
        short_description : product.shortDescription,
        is_published : product.isPublished,
        attributes : product.attributes?.map(attributeToKafkaDTO) // Aqui mapeara los atributos solo si existen, si no queda como undefined
    };
}


