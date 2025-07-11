class ProductoNotFoundError extends Error {
    constructor(sku: string | string[]) {
        super("No se encontro el/los producto(s) con el/los sku(s) " + sku); //Llama al constructor de la clase padre (Error)
    }
}

class ProductWithSKUAlreadyExistsError extends Error {
    constructor(sku: string | string[]) {
        super(`El SKU ${sku} ya existe`); //Llama al constructor de la clase padre (Error)
    }
}


export {
    ProductoNotFoundError,
    ProductWithSKUAlreadyExistsError
};