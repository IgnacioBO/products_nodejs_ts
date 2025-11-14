//@ts-check
//Aqui usamos { Pool } porque solo necesitamos la clase Pool del paquete pg
//El paquete pg es un cliente de PostgreSQL para Node.js
// Para que funcione esta imporacion con TypeScript, debemos instalar el paquete @types/pg
//npm i --save-dev @types/pg
import { Pool } from 'pg';

//Desestructuramos las variables de entorno que necesitamos para la conexión a la base de datos
//Lo que hace esta sintaxis es lo mismo que hacer:
// Osea toma procces.env y genera una  variable con el mismo nombre que la propiedad
// osea DB_USER = process.env.DB_USER
const { DB_PRODUCT_USER, DB_PRODUCT_PASS, DB_PRODUCT_HOST, DB_PRODUCT_PORT, DB_PRODUCT_NAME } = process.env;

if (!DB_PRODUCT_USER || !DB_PRODUCT_PASS || !DB_PRODUCT_HOST || !DB_PRODUCT_NAME) {
  throw new Error('Faltan envs de Postgres');
}

//hacemo encodeURIComponent para codificar caracteres especiales en la URI, como @, :, /, que podria tener una contraseña y no tener errores.
const user = encodeURIComponent(DB_PRODUCT_USER);
const pass = encodeURIComponent(DB_PRODUCT_PASS);
const db   = encodeURIComponent(DB_PRODUCT_NAME);
const socket = encodeURIComponent(DB_PRODUCT_HOST);

//La clase Pool es un grupo de conexiones a la base de datos
//Esto permite crear un grupo de conexiones a la base de datos y reutilizarlas
//Esto es más eficiente que crear una nueva conexión cada vez que se necesita acceder a la base de datos

const pool = new Pool({
  //connectionString: `postgres://${user}:${pass}@${socket}:${DB_PRODUCT_PORT}/${db}`,
  // Usamos socket en lugar de host para conectar via socket unix en GCP 
  //ademas el formato tendra @locahost y el host ira en ?host= parte de query string, esto es necesario para que funcione la conexion via socket en GCP
  connectionString: `postgresql://${user}:${pass}@localhost:${DB_PRODUCT_PORT}/${db}?host=${socket}`,
});

export async function verifyPostgresConnection(timeoutMs = 8000) {
  console.log("Connection string:", `postgresql://${user}:${pass}@localhost:${DB_PRODUCT_PORT}/${db}?host=${socket}`);
  const q = pool.query('select now() as now');
  const t = new Promise((_, rej) => setTimeout(() => rej(new Error('pg connect timeout')), timeoutMs));
  console.log("✅ Conexión a PostgreSQL establecida");
  return Promise.race([q, t]);
}

//Default export significa que ese módulo tiene una sola “cosa principal” para importar.
//import pool from './database-postgres';
//Ahí pool puede llamarse como quieras, porque es el export por defecto.
export default pool;