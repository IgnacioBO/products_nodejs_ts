//Aqui van las clases de errores HTTP
//Esto permite definir errores HTTP personalizados para la API con su status code y mensaje
class HttpErrors extends Error {
    constructor(status, message) {
      super();
      this.message = message;
      this.status = status;
    }
  }

function NotFoundError(msg){ 
    return new HttpErrors(404, msg) 
}

function BadRequestError(msg){ 
    return new HttpErrors(400, msg) 
}

function UnauthorizedError(msg){ 
    return new HttpErrors(401, msg) 
}

function ForbiddenError(msg){
    return new HttpErrors(403, msg) 
}

function InternalServerError(msg){
    return new HttpErrors(500, msg) 
}

function New(status, msg){
    return new HttpErrors(status, msg) 
}   

module.exports = {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    InternalServerError
};