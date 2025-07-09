class OfferNotFoundError extends Error {
    constructor(message, skus_not_found = [], skus_found = []) {
        super("No se encontro la(s) oferta(s) con el/los sku(s) "); //Llama al constructor de la clase padre (Error)
        this.message = {
      message: `No se encontraron una o varias ofertas. ${message}`,
      ...(skus_not_found.length && {
        skus_not_found: Array.isArray(skus_not_found) ? skus_not_found : [skus_not_found]
      }),
      ...(skus_found.length && {
        skus_found: Array.isArray(skus_found) ? skus_found : [skus_found]
      })
    };
  }
}



module.exports = {
    OfferNotFoundError
};