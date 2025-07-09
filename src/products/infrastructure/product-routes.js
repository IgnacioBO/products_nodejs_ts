//@ts-check
const express = require('express');
const { ErrorHandler } = require('../../shared/infrastructure/middlewares/response-handlers');

//En vez de llamarlo ruta mejor llamarlo productRoutesFactory
//Esto es una factory function que crea un router de productos
//Esta funcion recibe como 
function productRoutesFactory (options) {
    //Recibira options que será un objeto literal con las propiedades que necesitemos
    //En este caso solo necesitamos el productController (Pero peude tener otro cono logger, midleware, etc)
    const { productController } = options;
    const router = express.Router();
  
    // Listar productos
    router.get('/',
      //Aqui no es necesario ahcer option.productController.getAll
      // esto porque  const { productController } = options, hace 2 cosas :
        // 1. Le agrega la propiedad productController al objeto options (osea options.productController)
        // 2. Ademas crea una vairable productController que es igual a options.productController
      //Osea productController.getAll es lo mismo que options.productController.getAll
      productController.getAll  // handler ligado al contexto
    );
    router.get('/:sku', productController.getBySku);

    router.post('/', productController.createProduct);

    router.patch('/', productController.updateProduct);

    router.delete('/', productController.deleteProduct);

    router.put('/', productController.updateFullProduct);


      //router.use será generico para manejar errores en todas las rutas de este router
      //Si quiero manejar errores en una ruta en particular, hacer indicando la ruta y el metodo (callback), asi:
      // router.get('/ruta', (req, res, next) => { /* ... */ }); --> POR EJEMPLO router.get('/:sku', (err, req, res, next) =>
      //Este middleware podria estar en otro archivo y lo importamos aqui, por ejemplo
      // router.use(errorMiddleware);
      router.use(ErrorHandler); //Este middleware se ejecuta si hay un error en cualquiera de las rutas, y se encarga de manejar el error y devolver una respuesta estandarizada

      return router;
  };
  

module.exports = productRoutesFactory;