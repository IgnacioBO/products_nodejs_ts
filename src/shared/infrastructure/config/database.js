//@ts-check
//Aqui usamos { Pool } porque solo necesitamos la clase Pool del paquete pg
//El paquete pg es un cliente de PostgreSQL para Node.js
const { Pool } = require('pg');

//Desestructuramos las variables de entorno que necesitamos para la conexión a la base de datos
//Lo que hace esta sintaxis es lo mismo que hacer:
// Osea toma procces.env y genera una  variable con el mismo nombre que la propiedad
// osea DB_USER = process.env.DB_USER
const { DB_PRODUCT_USER, DB_PRODUCT_PASS, DB_PRODUCT_HOST, DB_PRODUCT_PORT, DB_PRODUCT_NAME } = process.env;

//La clase Pool es un grupo de conexiones a la base de datos
//Esto permite crear un grupo de conexiones a la base de datos y reutilizarlas
//Esto es más eficiente que crear una nueva conexión cada vez que se necesita acceder a la base de datos
const pool = new Pool({
  connectionString: `postgres://${DB_PRODUCT_USER}:${DB_PRODUCT_PASS}@${DB_PRODUCT_HOST}:${DB_PRODUCT_PORT}/${DB_PRODUCT_NAME}`,
});

module.exports = pool;