const Response = require('./response-model')

ResponseHandler = (req, res, next) => {
  // Método para respuestas exitosas
  //Agregamos la funcion res.success al objeto res para poder usarlo en cualquier parte de la aplicacion
  //Esto hace que cuando se llame a res.success, se ejecute un res.json con el objeto que le pasamos como argumento
  //Este responsHandler se ejecutar antes de cualquier otro middlware para poder definr la funcion res.success y pueda usarse en cualquier parte de la aplicacion
  res.success = ({data, message = 'success', meta = {} }) => {
    return res.json(new Response({
      status: res.statusCode,          // p. ej. 200
      message,                          // p. ej. 'Datos obtenidos'
      ...(data && { data }),                             // payload
      ...(Object.keys(meta).length && { meta })          // meta solo se pone si tiene algo
      }));    
  };     
  next();
};

//Este metodo se ejecutará si hay un error en la aplicacion
//En vez de llamarse REsponseError, se puede llamar errorHandler o algo asi
//ErrorHandler porque los handlers son funciones que manejan errores y se encargan de devolver una respuesta estandarizada
//En este caso, el errorHandler se encargará de manejar los errores y devolver una respuesta estandarizada  
/** 
  @param {import("express").ErrorRequestHandler} err - The error object
  @param {import("express").NextFunction} next
  @param {import("express").Request} req - The request object
  @param {import("express").Response} res - The response object

*/
ErrorHandler = (err, req, res, next) => {
  // Estatus y mensaje por defecto o personalizado
  const status = err.status || 500;
  let message = err.message || 'Error de servidor interno';
  message = typeof err.message === "string" ? {message: err.message} : message; 
  // Si viene solo string, lo convertimos a objeto con la propiedad message
  // Si el error tiene un objeto de errores, lo usamos porque puede tener mas campos



  res.status(status).json(new Response({
      status: status,          
      errors: message,
      }));
}


module.exports = { ResponseHandler, ErrorHandler };