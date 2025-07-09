class ProductoNotFoundError extends Error {
    constructor(sku) {
        super("No se encontro el/los producto(s) con el/los sku(s) " + sku); //Llama al constructor de la clase padre (Error)
    }
}

class ProductWithSKUAlreadyExistsError extends Error {
    constructor(sku) {
        super(`El SKU ${sku} ya existe`); //Llama al constructor de la clase padre (Error)
    }
}


module.exports = {
    ProductoNotFoundError,
    ProductWithSKUAlreadyExistsError
};