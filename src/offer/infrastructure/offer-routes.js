//@ts-check
const express = require('express');
const { ErrorHandler } = require('../../shared/infrastructure/middlewares/response-handlers');


function offerRoutesFactory (options) {
    //Recibira options que será un objeto literal con las propiedades que necesitemos
    //En este caso solo necesitamos el productController (Pero peude tener otro cono logger, midleware, etc)
    const { offerController } = options;
    const router = express.Router();
  
    router.get('/', offerController.getAll); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.post('/', offerController.createOffer); 
    router.put('/', offerController.updateFullOffer); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.patch('/', offerController.updateOffer); //Esta ruta recibe los parametros de busqueda por query params y los pasa al controlador
    router.delete('/', offerController.deleteOffer); 

    router.use(ErrorHandler); //Este middleware se ejecuta si hay un error en cualquiera de las rutas, y se encarga de manejar el error y devolver una respuesta estandarizada
    return router;
  };
  

module.exports = offerRoutesFactory;