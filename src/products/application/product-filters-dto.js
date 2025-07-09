/*¿Qué es un DTO?
Un Data Transfer Object es una clase simple que agrupa datos para enviarlos entre capas o procesos sin contener lógica de negocio.
La idea nació para optimizar llamadas remotas costosas, reduciendo round-trips al agrupar múltiples parámetros en un solo objeto

DTO vs Value Object
Los Value Objects del dominio representan conceptos ricos con reglas de invarianza e igualdad basada en valores, 
mientras que los DTOs solo almacenan, serializan y deserializan datos sin validar su contenido*/
class ProductFiltersDTO {
  constructor({ sku, category_code}) {
    this.sku = sku;
    this.category_code = category_code;
  }
}

module.exports = ProductFiltersDTO;