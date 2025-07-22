import { ProductPostgreDTO, AttributePostgreDTO } from './product-postgre-dto';
import  Product from '../domain/product-entity';
import Attribute from '../domain/attribute-vo';

function attributeToPostgreDTO(attr: Attribute): AttributePostgreDTO {
  return {
    name_code:  attr.nameCode,    // ajusta según tu domain model
    name:       attr.name,
    value_code: attr.valueCode,
    value:      attr.value
  };
}

export function productToPostgreDTO(product: Product): ProductPostgreDTO {
    return {
        sku : product.sku,
        parent_sku : product.parentSku,
        title : product.title,
        category_code : product.categoryCode,
        category_name : product.categoryName,
        description : product.description,
        short_description : product.shortDescription,
        is_published : product.isPublished,
        attributes : product.attributes?.map(attributeToPostgreDTO) //Aqui mapeara los atribtuos solo si existen, si no queda como undefined
    }
}

//Aqui row podria ser un interface (en vez de any), por ejemplo, que tenga mapeados los campos de la base de datos
export function rowToProduct(row: any): Product {
        let attributes = row.attributes?.map((a: any) =>
          new Attribute({
            nameCode:  a.name_code,
            name:       a.name,
            valueCode: a.value_code,
            value:      a.value
          })
        );
        //Si no hay atributos, lo dejamos como undefined para que el JSON no lo incluya
        attributes = row.attributes?.length > 0 ? attributes : undefined;

        return new Product({
          sku:              row.sku,
          parentSku:        row.parent_sku ?? undefined,  // Usamos nullish coalescing (??) para dejar como undefined si es null
          title:            row.title ?? undefined,
          categoryCode:     row.category_code ?? undefined,
          categoryName:     row.category_name ?? undefined,
          description:      row.description ?? undefined,
          shortDescription: row.short_description ?? undefined,
          isPublished:      row.is_published ?? undefined,
          attributes:       attributes,
        });
}
  
