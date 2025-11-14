// Documentation: https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
import { MongoClient, ServerApiVersion} from 'mongodb';

//Los siguiente seran importados como "type" solo para que TypeScript los reconozca y no los incluya en el bundle final
//Esto es para poder usar tipos de TypeScript sin necesidad de importar las librerías en tiempo de ejecución
//En todo caso si los pongo dentro de import(), typescriot automáticamente los importará como tipos y no los incluirá en el bundle final, pero es mejor hacerlo explícito por claridad
//COmo saber si usar import type o import()? Si solo se necesitan los tipos, se debe usar import type. Si se necesita la implementación en tiempo de ejecución, se debe usar import().
import type { MongoClientOptions, Db } from 'mongodb';

import ('dotenv/config'); // Importa las variables de entorno desde el archivo .env
const {DB_OFFER_USER = "", DB_OFFER_PASS = "", DB_OFFER_HOST, DB_OFFER_PORT, DB_OFFER_NAME} = process.env;

/**
 * - Si es una instancia local: mongodb://usuario:pass@host:puerto/nombreDB?authSource=admin
 * - Si fuera Atlas, sería algo así: mongodb+srv://usuario:pass@cluster0.xxxx.mongodb.net/nombreDB?retryWrites=true&w=majority
 */

//encodeURIComponent se usa para codificar caracteres especiales en la URI, como @, :, /, que podria tener una contraseña y no tener errores.
//authSource=admin significa que el usuario a autenticar se encuentra en la base de datos admin (en system.users)

function buildMongoUri(env = process.env) {
  if (env.DB_OFFER_MONGODB_URI) return env.DB_OFFER_MONGODB_URI; // Atlas / cualquier URI completa

  console.log("Mongo URI no definida, se construye desde otros envs.");

  // Para Mongo local: authSource=admin si tu user es admin de la instancia
  return `mongodb://${encodeURIComponent(DB_OFFER_USER)}:${encodeURIComponent(DB_OFFER_PASS)}` + 
    `@${DB_OFFER_HOST}:${DB_OFFER_PORT}/${DB_OFFER_NAME}?authSource=admin`;
}


const mongoURI: string = buildMongoUri();

console.log(`MongoDB URI: ${mongoURI}`); //Para ver la URI que se esta usando

const clientOptions: MongoClientOptions = {
        serverApi: { //define comadnos y opciones que se pueden usar
            version: ServerApiVersion.v1, //Usar v1
            strict: true, //Se rechazan comandos u opciones fuera de v1
            deprecationErrors: true, // Error si usamos una funcion deprecada
        },
        maxPoolSize: 100 // Lo máximo de conexiones que se pueden abrir al mismo tiempo (default 100)
};

let client: MongoClient = null as unknown as MongoClient;
try{
  client = new MongoClient (mongoURI, clientOptions);
} catch (error) {
    console.error("Error al crear el cliente de MongoDB: ", error);
    //throw error; // Re-throw the error to handle it in the calling function
}

async function connectMongo(): Promise<MongoClient> {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("✅ Conexión a MongoDB establecida");

    await client.db("admin").command({ ping: 1 });
    return client;

    const database = client.db('nodeJSProject');
    const movies = database.collection('offers');
    // Queries for a movie that has a title value of 'Back to the Future'
    const query = { offer_id: 1 };
    const movie = await movies.findOne(query);
    console.log(movie);
  } catch (error) {
    throw new Error ("❌ Error al conectar a MongoDB: " + error); // Re-throw the error to handle it in the calling function
  }
}

function getDb(): Db {
  return client.db(process.env.DB_OFFER_NAME);
}

export {
  connectMongo, // Funcion para conectarse a MongoDB, se llamara en el index.js, al iniciar la aplicacion, solo una vez
  getDb, // Funcion para obtener la base de datos, se usara en los repositorios
  client, // Exportamos el cliente por si se necesite usar cliente en algún lugar
};