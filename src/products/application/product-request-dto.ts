//TODO: Hacer el dto que luego podra usar el controller para transformar el json a un dto
//Y luego el service transformara el dto a un entity de product
//Los DTOs por lo generar son una clase por cada caso de uso
//E idealmente tambien por tipo (osea si es Request o Response), <Acción><Entidad><Tipo>Dto por ejemplo:
//CreateProductRequestDTO, CreateProductResponseDTO, UpdateProductRequestDTO, UpdateProductResponseDTO, GetAllProductsRequestDTO, GetAllProductsResponseDTO, GetProductBySkuRequestDTO, GetProductBySkuResponseDTO, DeleteProductRequestDTO, DeleteProductResponseDTO
//ProductRequestDTO y ProductResponseDTO

//Se pueden agreupgar todas estas clases / interfaces en un solo archivo, pero si son muchas se recomienda separarlas
//Pueden ir dentro de products/application/dto/ y ahi crear un archivo por cada dto o agruparlos todos en un solo archivo

//Algunos dicen que debenn ir en la capa de infrastructure porque por ejemplo convertir a JSON es parte de 
// la infraestructura, porque es parte de la forma en que se comunica con el mundo exterior (API REST, por ejemplo).

export interface AttributeDTO {
    name_code: string;
    name?: string;
    value_code: string;
    value?: string;
}

export interface CreateProductRequestDTO {
    sku: string;
    parent_sku?: string;
    title: string;
    category_code: string;
    description: string;
    short_description?: string;
    is_published?: boolean;
    attributes?: AttributeDTO[];
}

export type UpdateFullProductRequestDTO = CreateProductRequestDTO;

//De esta manera decimos que el DTO de UpdateProductRequestDTO es igual al de CreateProductRequestDTO
//pero con el campo sku obligatorio, porque al actualizar un producto necesitamos el sku para identificarlo
export type UpdatePartialProductRequestDTO = Partial<CreateProductRequestDTO> & { sku: string };

export interface DeleteProductRequestDTO {
    sku: string;
}