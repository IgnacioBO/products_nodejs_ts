import OfferController from "./offer-controller";

import express, {RequestHandler} from 'express';
import { ErrorHandler } from '../../shared/infrastructure/middlewares/response-handlers';


function offerRoutesFactory (options: { offerController: OfferController }): express.Router {
    //Recibira options que será un objeto literal con las propiedades que necesitemos
    //En este caso solo necesitamos el productController (Pero peude tener otro cono logger, midleware, etc)
    const { offerController } = options;
    const router = express.Router();
    router.get('/', offerController.getAll as RequestHandler); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.post('/', offerController.createOffer as RequestHandler);
    router.put('/', offerController.updateFullOffer as RequestHandler); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.patch('/', offerController.updateOffer as RequestHandler); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.delete('/', offerController.deleteOffer as RequestHandler);

    router.use(ErrorHandler); //Este middleware se ejecuta si hay un error en cualquiera de las rutas, y se encarga de manejar el error y devolver una respuesta estandarizada
    return router;
  };
  

export default offerRoutesFactory;