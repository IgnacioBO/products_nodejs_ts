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