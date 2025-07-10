//Aqui van las clases de errores HTTP
//Esto permite definir errores HTTP personalizados para la API con su status code y mensaje

//Este type permite definir el tipo de mensaje de error que se puede enviar
//En este caso, puede ser un string, number, boolean o un objeto con propiedades desconocidas
type ErrorMessage = string | number | boolean | Record<string, unknown>;

class HttpErrors extends Error {

    status: number;
    //no es necesario definir message porque Error ya lo tiene definido
    payload: ErrorMessage;

    constructor(status: number, payload: ErrorMessage) {
        // Convertimos a texto para el mensaje de Error (si es un objeto, lo convertimos a string)
        // Asi el mensaje de error siempre sera un string y por ejempo se podra ver el error en los logs
        const text =
        typeof payload === 'string'
            ? payload
            : JSON.stringify(payload);

        //Llamamos al constructor de la clase Error con el mensaje de error
        super(text);
        this.payload = payload;
        this.status = status;
        // Establecemos el nombre de la clase como el nombre del error (HttpErrors)
        // Esto es importante para poder identificar el tipo de error en los manejadores de errores
        this.name = this.constructor.name;
    }
}

function NotFoundError(msg: ErrorMessage){ 
    return new HttpErrors(404, msg) 
}

function BadRequestError(msg: ErrorMessage){ 
    return new HttpErrors(400, msg) 
}

function UnauthorizedError(msg: ErrorMessage){ 
    return new HttpErrors(401, msg) 
}

function ForbiddenError(msg: ErrorMessage){
    return new HttpErrors(403, msg) 
}

function InternalServerError(msg: ErrorMessage){
    return new HttpErrors(500, msg) 
}

function New(status: number, msg: ErrorMessage){
    return new HttpErrors(status, msg) 
}   

export {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  New
};