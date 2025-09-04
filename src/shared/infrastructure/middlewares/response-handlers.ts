  import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
  import { ResponseModel } from './response-model';

  //Extendemos la interfaz Response de express para agregarle un método success
  //Se usara <T> para que sea generico y "data" (payload) pueda ser de cualquier tipo
  export interface CustomResponse<T, U> extends Response {
    success(argumentos: { data?: T, message?: string, meta?: U, warnings?: any }): Response;
    ok(argumentos: { data?: T, message?: string, meta?: U }): Response;
  }

  export const ResponseHandler = (req: Request, res: Response, next: NextFunction): void => {
    // Método para respuestas exitosas
    //Agregamos la funcion res.success al objeto res para poder usarlo en cualquier parte de la aplicacion
    //Esto hace que cuando se llame a res.success, se ejecute un res.json con el objeto que le pasamos como argumento
    //Este responsHandler se ejecutar antes de cualquier otro middlware para poder definr la funcion res.success y pueda usarse en cualquier parte de la aplicacion
    

    //Hacemos un cast de res a CustomResponse para que tenga el metodo success
    //Esto es necesario porque la interfaz Response de express no tiene el metodo success
    //Ojo que este casteo no se verifica en tiempo de ejecucion, solo en tiempo de compilacion, asi que al llegar a esta linea, puede no dar error si no se ha definido el metodo success
    const r = res as CustomResponse<any, any>;
    
    r.success = ({data, message, meta = {}, warnings }) => {
      if(!message){
        message = 'success';
          if(warnings){
           message = 'success_with_warnings';
        }
      }
      return r.json(new ResponseModel({
        status: r.statusCode,          // p. ej. 200
        message,                        // p. ej. 'Datos obtenidos'
        warnings,                         
        ...(data && { data }),                             // payload
        ...(Object.keys(meta).length && { meta })          // meta solo se pone si tiene algo
        }));    
    };
    next();
  };

  interface CustomError<T> extends ErrorRequestHandler {
    status: number;
    payload: T;
  }

  //Este metodo se ejecutará si hay un error en la aplicacion
  //En vez de llamarse REsponseError, se puede llamar errorHandler o algo asi
  //ErrorHandler porque los handlers son funciones que manejan errores y se encargan de devolver una respuesta estandarizada
  //En este caso, el errorHandler se encargará de manejar los errores y devolver una respuesta estandarizada  
  export const ErrorHandler = (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): void => {
    const e = err as CustomError<any>;

    // Estatus y mensaje por defecto o personalizado
    const status = e.status || 500;
    let message = e.payload || 'Error de servidor interno';
    message = typeof e.payload === "string" ? {message: e.payload} : message; 
    // Si viene solo string, lo convertimos a objeto con la propiedad message
    // Si el error tiene un objeto de errores, lo usamos porque puede tener mas campos

    res.status(status).json(new ResponseModel({
        status: status,          
        errors: message,
        }));
  }