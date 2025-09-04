interface IResponseModel<T = any, M = any> {
  status: number;
  message?: string;
  errors?: any;
  warnings?: any;
  data?: T;
  meta?: M;
}

export class ResponseModel<T = any, M = any> implements IResponseModel<T, M> {
  status: number;
  message?: string;
  errors?: any;
  warnings?: any;
  data?: T;
  meta?: M;

  //Recibe como parametro un objeto que implementa la interfaz IResponseModel
  //Si no se le pasa nada, se inicializa como un objeto vacio
  // Osea pueda crearlo asi {status: 200, message: 'success', data: { ... } }
  //Usamos Partial para que el parametro status sea opcional
  constructor(params: Partial<IResponseModel<T, M>> = {}) {
    //Object.assign(this, params);
    this.status = params.status || 500; // Default status is 500
    this.message = params.message;
    this.errors = params.errors;
    this.warnings = params.warnings;
    this.data = params.data;
    this.meta = params.meta;
  }
}
