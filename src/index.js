//@ts-check
//El paquete dotenv permite cargar variables de entorno desde un archivo .env a process.env
//Lo mismo que hacer const dotenv = require('dotenv') y luego dotenv.config()
require('dotenv').config();
const {ResponseHandler, ErrorHandler} = require('./shared/infrastructure/middlewares/response-handlers');
const express = require('express');
const app = express();
const { connectMongo, client } = require("./shared/infrastructure/config/database-mongodb");

//Ahora importamos las capas de repositorio, servicio y controlador y la guardamos en constantes para poder usarlas parametro de cada capa
//Osea por ejemplo, al servicio le pasaremos el repositorio y al controlador le pasaremos el servicio
//Esto es lo que se conoce como inyeccion de dependencias
const ProductRepository = require('./products/infrastructure/product-postgre-repository.js');
const ProductService = require('./products/application/product-service.js');
const ProductController = require('./products/infrastructure/product-controller.js');
const productRoutesFactory = require('./products/infrastructure/product-routes.js');

//TODO: productRepository deberia recibir el pool como parametro
//const productRepository = new ProductRepository(pool);
const productRepository = new ProductRepository();
//Creamos una instancia del repositorio de productos y la pasamos como parametro al constructor de la clase ProductService
const productService = new ProductService(productRepository);
//Creamos una instancia del servicio de productos y la pasamos como parametro al constructor de la clase ProductController
const productController = new ProductController(productService);

const OfferRepository = require('./offer/infrastructure/offer-mongodb-repository.js');
const OfferService = require('./offer/application/offer-service.js');
const OfferController = require('./offer/infrastructure/offer-controller.js');
const offerRoutesFactory = require('./offer/infrastructure/offer-routes.js');

const offerRepository = new OfferRepository();
const offerService = new OfferService(productService, offerRepository);
const offerController = new OfferController(offerService);


async function main() {
    //Nos conectamos a MongoDB al iniciar la aplicacion
    await connectMongo();
    app.set('port', process.env.EP_PORT || 3000);

    //Parsea los json y el body de las peticiones
    app.use(express.json());

    //Ese permite establecer una estructura de respuesta y errores estandarizada para todas las respuestas de la API
    app.use(ResponseHandler);

    //Aqui usaremos el router de productos que hemos creado y recibe como parametro el productController
    //Osea le pasamos el controlador de productos que hemos creado
    app.use('/api/products', productRoutesFactory({productController: productController}));
    app.use('/api/offers', offerRoutesFactory({offerController: offerController}));

    const server = app.listen(app.get('port'), () => {
        console.log(`Server on port ${app.get('port')}`);
    }) 

    //Estos manejadores de eventos permiten cerrar el servidor y la conexión a MongoDB de manera limpia cuando se recibe una señal de interrupción (SIGINT o SIGTERM)
    //Esto es importante para evitar que se queden conexiones abiertas y no se liberen los recursos
    process.on("SIGINT", async () => {
        console.log("🛑 Recibí SIGINT: cerrando Express y Mongo...");
        await client.close();   // Cierra conexiones de MongoDB
        server.close(() => {
            console.log("👍 Servidor cerrado limpio.");
            process.exit(0);
        });
    });

    process.on("SIGTERM", async () => {
        console.log("🛑 Recibí SIGTERM: cerrando Express y Mongo...");
        await client.close();   // Cierra conexiones de MongoDB
        server.close(() => {
            console.log("👍 Servidor cerrado limpio.");
            process.exit(0);
        });
    });
}

main();