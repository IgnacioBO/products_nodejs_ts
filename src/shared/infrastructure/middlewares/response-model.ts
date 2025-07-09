interface IResponseModel<T = any, M = any> {
  status?: number;
  errors?: any;
  message?: string;
  data?: T;
  meta?: M;
}

export class ResponseModel<T = any, M = any> implements IResponseModel<T, M> {
  status?: number;
  errors?: any;
  message?: string;
  data?: T;
  meta?: M;

  //Recibe como parametro un objeto que implementa la interfaz IResponseModel
  //Si no se le pasa nada, se inicializa como un objeto vacio
  // Osea pueda crearlo asi {status: 200, message: 'success', data: { ... } }
  constructor(params: IResponseModel<T, M> = {}) {
    //Object.assign(this, params);
    this.status = params.status;
    this.errors = params.errors;
    this.message = params.message;
    this.data = params.data;
    this.meta = params.meta;
  }
}
