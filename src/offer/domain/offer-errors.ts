//TODO: aqui puede mejorarse, message no deberia ser any, si no string
//Lo idea seria tener un campo llamado "payload" que sea un objeto con los campos que se necesiten
/*
  public payload: {
    message: string;
    skus_not_found?: Array<string|number>;
    skus_found?: Array<string|number>;
  }
Pero primero debo arreglar como httpErrors funciona (ya q recibe un msg, que es string, no un objeto ERROR)
//Puedo hacer que cuando use offerNotFOund, en un httperror envie el .payload en vez de .message
//La otra solucion es hacer que httpError reciba un objeto que pueda ser string o un ERROR
//Y si es Error, extraer el .message o .payload su existe?
*/

class OfferNotFoundError extends Error {
  
  message: any;
    constructor(message: any, skus_not_found: string[] | number[] = [], skus_found: string[] | number[] = []) {
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

export{    
  OfferNotFoundError
};