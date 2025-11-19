TL;DR
Primero cree el docker file, luego use Cloud Run desde GCP directo (por la UI de la web), lo conecte a mi github, cofigure puerto 3000.

Luego use Cloud SQL para crear la bbdd posgtres, use cloud shell para inyectarle los datos de init.sql, conecte cloud run con cloud sql y agrgue variable de entorno de cloud run.

Luego use MongoDB de Atlas, deje IP publica, use el conection string dado y lo agregue al cloud run en un variable de entorno que usa mi app para conectarse, finalmente use mongosh para inyectar mi initMongo.js


0) Primero se creo el dockerFile
Luego
1) Desplegar desde la consola (sin instalar nada)

Entra a Cloud Run: Google Cloud Console → Cloud Run → Create service.
Elige Continuously deploy from a repository (desplegar desde repo). Si es tu primera vez, te pedirá conectar tu GitHub con Cloud Build (botón “Set up Cloud Build”). Sigue el wizard y autoriza el repo. 

Selecciona tu repo/branch (por ejemplo main). Indica que use tu Dockerfile del root.

Región: elige southamerica-west1 (Santiago) para baja latencia.

Nombre del servicio: algo como products-offers-api.

Puerto: no lo fijes aquí; tu app lee PORT. (Con el Dockerfile de arriba, estás bien).

Autenticación: marca Allow unauthenticated invocations para que quede pública (si tu org no restringe). Si luego ves 403, en la ficha del servicio → Security/Permissions agrega allUsers como Cloud Run Invoker. 

Deploy. La consola va a construir la imagen con Cloud Build y publicar la URL https://<tu-servicio>-<hash>-<region>.run.app. 

Si te pide habilitar APIs en el camino (Run, Build, Artifact Registry), acepta. Todo eso es normal del flujo guiado. 

Probar:
Abre la URL o haz:
curl -i https://<tu-servicio>-<hash>-southamerica-west1.run.app/health

2) Dónde poner el puert 3000 en Cloud Run (UI)

Google Cloud Console → Cloud Run → entra a tu servicio → Edit & deploy new revision.

Pestaña Container(s) → Container port: escribe 3000 → Deploy.

Con eso Cloud Run setea PORT=3000 para tu contenedor automáticamente. (Por defecto es 8080 si no tocas nada).

3) PostgreSQL en Cloud SQL (productos)
3.1) Crear la instancia

GCP Console → Cloud SQL → Create instance → PostgreSQL.

Región: southamerica-west1 (Santiago) si puedes.

Versión: Postgres 15/16.

Public IP activada (simplifica mucho con Cloud Run).

Crea la contraseña del usuario postgres. → Create.

Con public IP + Cloud Run, la conexión igual va segura via conector de Cloud Run; no necesitas SSL manual.

3.2) Sembrar la BD con tu init.sql

Tu script crea la BD products y tablas. Lo más simple:

En la página de tu instancia, arriba dale a “Connect using Cloud Shell”.

Eso te abre Cloud Shell ya conectado con psql al servidor (no necesitas instalar nada).

En Cloud Shell, sube tu archivo init.sql (botón de subir archivo) o pega el contenido en un archivo:

nano init.sql   # pega tu SQL, guarda con Ctrl+O, Enter, sale con Ctrl+X

Ejecuta el script desde psql:

\i init.sql

Tu script ya hace CREATE DATABASE products; y luego \c products, así que quedas con todo creado como en local.

3.3) Conectar Cloud Run → Cloud SQL

Cloud Console → Cloud Run → tu servicio → Edit & deploy new revision.

Container(s) → Settings → Cloud SQL connections → Add connection → elige tu instancia.

Variables & secrets (misma pantalla) → agrega estas env vars (usa tus nombres actuales):

DB_PRODUCT_USER=root            # o postgres o app_user, lo que definiste
DB_PRODUCT_PASS=root
DB_PRODUCT_NAME=products
DB_PRODUCT_PORT=5432
DB_PRODUCT_HOST=/cloudsql/PROJECT:REGION:INSTANCE_NAME


Ojo: el HOST es la ruta de socket /cloudsql/... (no 127.0.0.1).

Deploy.

4))MongoDB en Atlas (offers)
4.1) Crear el cluster gratis y usuario

Ve a MongoDB Atlas (MongoDB oficial) → Deployments → Build a Cluster → M0 Free (elige región en GCP de preferencia cercana).

Database Access → Add New Database User (ej: root / example).

Network Access → Add IP Address → por ahora “Allow access from anywhere (0.0.0.0/0)” (dev).

Luego puedes endurecer esto con egress fijo, pero para partir es lo más fácil.

4.2) Tomar el connection string

Copia el SRV:

mongodb+srv://root:example@TU-CLUSTER.xxxx.mongodb.net/nodeJSProject?retryWrites=true&w=majority
(Ajusta usuario/pass/DB).

B3) Poner env vars en Cloud Run

En tu servicio → Edit & deploy new revision → Variables & Secrets:

MONGODB_URI=mongodb+srv://root:example@.../nodeJSProject?retryWrites=true&w=majority
MONGODB_DB=nodeJSProject
Deploy.
Poner ahi en el code que ose el mongo_uri cuando sea posuble, ya que se construye distinto la uri si es local a si es atlas

Recuerda que en el código no debes instanciar MongoClient al importar. Llámalo dentro de connectMongo() y maneja timeouts/errores sin botar el arranque (ya lo dejamos así antes).

Ejemplo mínimo:

const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 8000 });
await client.connect();
const db = client.db(process.env.MONGODB_DB);

B4) Sembrar Mongo con tu initMongo.js

Hay varias formas. La más directa:

Opción 1 — Desde tu PC con mongosh

Instala mongosh (si no lo tienes).

Ejecuta:

mongosh "mongodb+srv://root:example@TU-CLUSTER.xxxx.mongodb.net/nodeJSProject?retryWrites=true&w=majority" --file initMongo.js

Tu script ya hace db = db.getSiblingDB('nodeJSProject'), crea índices, inserta, etc.
Ojo eso si, atlas no soporta funciones como db.system.js y createUser, sacalros en .js

Opción 2 — Con Atlas (UI)

Atlas Data Explorer → entra a tu DB nodeJSProject → Create collection offers → Insert Document y pega tus docs seed.

Si quieres correr trozos del script, abre Playgrounds en MongoDB Compass (cliente GUI) y ejecútalo contra tu cluster.

Tip: si te da lata el Double(...), puedes usar números normales o NumberDecimal("10000"):

prices: [
  { currency: "CLP", type: "ORIGINAL",  value: 10000 },
  { currency: "CLP", type: "DISCOUNT",  value:  8000 },
  { currency: "CLP", type: "PROMOTION", value:  7000 },
]

5) KAFKA
Hay dos manera por GCP o por Confluence
Por GCP opte usar SASL como metodo en vez de OATH
5.1) GPC con SASL -> LO MALO -> para ver mensajes con app como offset explroer -> debo conetarem con VPN a la VPC de google o una VM dentro de GCP, etc.
5.1.1) Crear el clúster

Console → Managed Service for Apache Kafka → Create cluster

Región: misma de tu Cloud Run (p. ej. us-central1).

Networking: conéctalo a tu VPC (default está ok).

Al terminar, copia los Bootstrap servers (varios host:port). 
Google Cloud Documentation

5.1.2) Red de Cloud Run → Kafka (VPC)

MSAK expone endpoints privados por VPC.

Crea un Serverless VPC Access connector en la misma región/VPC:
En mi caso use la subred 10.8.0.0 en US-CENTRAL que es donde esta mi api

Edita tu servicio de Cloud Run → Networking → VPC Connector: selecciónalo.
(Editar e impl nueva version -> Redes -> Connect to a VPC outbounf traffic -> Use Severs VPC access conecctor -> Seleccionar Conector -> 
Traffic Routing -> Route only requests to private IPs to the VPC )


5.1.3) Crar un Service account con rol roles/managedkafka.client. (O Cliente de Kafka Administrado).
Luego ir al usuario y a "claves" poneger agegar clave y generar uns clave JSON. 
5.1.4) LUEGO SE DESCARGA UN .JSON y debe convertirse a base64,
Suponiuendo que el archivo se llama key.json
LINUX:
base64 -w0 key.json > key.b64

W Powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json")) | Out-File -NoNewline key.b64

Lyeg

KAFKA_BROKERS=ELQUEGENERAKAFKAENGGCP
KAFKA_USER=kafka-01@................
KAFKA_PASS=0e85.......... (JSON e base 64)
KAFKA_SSL=true

LISTO


5.2) KAfka usando CONLUENCE -> Ventaje peude conectermee directo
Crea cuenta y un Basic cluster en la región cercana a tu Cloud Run.

En “API Keys”, crea API Key & Secret (guárdalos).

Luego ponder en env
KAFKA_BROKERS=Bootstrap server
KAFKA_CLIENT_ID=catalog-service
KAFKA_USER=API key
KAFKA_PASS=API secret
KAFKA_PRODUCT_TOPIC=products
KAFKA_OFFER_TOPIC=offers
KAFKA_SSL=true

COMO posible error, puede dar error de policy 44 esto porque por defecto al crear los topicos eta puesto replicationFactor en 1.
Entnces puede ponderse esto como una .env o sacar esa ocion para que se ponga la por defecto