import express, { RequestHandler } from 'express';
import { ErrorHandler } from '../../shared/infrastructure/middlewares/response-handlers';
import type ProductController from './product-controller'; // Adjust the path as needed

//En vez de llamarlo ruta mejor llamarlo productRoutesFactory
//Esto es una factory function que crea un router de productos
//Esta funcion recibe como 
function productRoutesFactory (options: { productController: ProductController }): express.Router {
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
      productController.getAll as RequestHandler  // handler ligado al contexto
    );

    //Usamos as RequestHandler (ya que getBySku esta recibiendo CustomResponse en vez de Response, que es lo que espera express)
    //Como mejora lo mejor es Augmentar el Response de express para que tenga el metodo success, asi no tenemos que hacer el cast
    router.get('/:sku', productController.getBySku as RequestHandler);

    router.post('/', productController.createProduct as RequestHandler);

    router.patch('/', productController.updateProduct as RequestHandler);

    router.delete('/', productController.deleteProduct as RequestHandler);

    router.put('/', productController.updateFullProduct as RequestHandler);


      //router.use será generico para manejar errores en todas las rutas de este router
      //Si quiero manejar errores en una ruta en particular, hacer indicando la ruta y el metodo (callback), asi:
      // router.get('/ruta', (req, res, next) => { /* ... */ }); --> POR EJEMPLO router.get('/:sku', (err, req, res, next) =>
      //Este middleware podria estar en otro archivo y lo importamos aqui, por ejemplo
      // router.use(errorMiddleware);
      router.use(ErrorHandler); //Este middleware se ejecuta si hay un error en cualquiera de las rutas, y se encarga de manejar el error y devolver una respuesta estandarizada

      return router;
  };
  

export default productRoutesFactory;