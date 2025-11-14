//Aqui se saca la función db.system.js y createUser porque en MongoDB Atlas no estan soportadas esas funciones
db = db.getSiblingDB('nodeJSProject'); //Permite crear y usar una base de datos llamada nodeJSProject

db.counters.insertOne({ id: "offer_id", sequence_value: 0 }); //Crea una colección llamada counters y un documento con el id offer_id y el valor 0

const getNextSequenceValue = function() {
    return db.counters.findOneAndUpdate(
        { id: "offer_id" }, //Busca el documento con el id offer_id
        { $inc: { sequence_value: 1 } }, //Incrementa el valor de sequence_value en 1
        { returnNewDocument: true } //Devuelve el documento actualizado
    ).sequence_value.toString(); //Devuelve el valor actualizado de sequence_value como string
}

db.offers.createIndex(
    { offer_id: 1 }, //Crea un indice en la coleccion offers para el campo offer_id, se le pone 1 para indicar que es un indice ascendente
    { unique: true } //El indice es unico, no se pueden repetir los valores de offer_id
);

db.offers.createIndex(
    { sku: 1 },
    { unique: true });

db.offers.insertOne({ offer_id: getNextSequenceValue(), sku: "test01", is_published: true, 
    prices:[
        {currency: "CLP", type: "ORIGINAL", value: new Double(10000)},
        {currency: "CLP", type: "DISCOUNT", value: new Double(8000)},
        {currency: "CLP", type: "PROMOTION", value: new Double(7000)}
     ]}); //Inserta un documento en la colección offers con los campos name y age


db.getCollection("offers").insertOne({ offer_id: getNextSequenceValue(), sku: "test02", is_published: false, 
    prices:[
        {currency: "CLP", type: "ORIGINAL", value: new Double(15789)},
        {currency: "CLP", type: "DISCOUNT", value: new Double(12580)},
     ]});

db.getCollection("offers").insertOne({ offer_id: getNextSequenceValue(), sku: "test03", is_published: false, 
    prices:[
    {currency: "CLP", type: "ORIGINAL", value: new Double(15789)},
    {currency: "CLP", type: "DISCOUNT", value: new Double(12580)},
    ]});

db.getCollection("offers").insertOne({ offer_id: getNextSequenceValue(), sku: "test04", is_published: false, 
    prices:[
    {currency: "CLP", type: "ORIGINAL", value: new Double(15789)},
    {currency: "CLP", type: "DISCOUNT", value: new Double(12580)},
    ]});



dbAdm = db.getSiblingDB('admin'); //NOs cambiamos a admin para crear un usuario con accedo a admin

db.getCollection("offers").insertOne({ offer_id: getNextSequenceValue(), sku: "test05", is_published: false, 
    prices:[
    {currency: "CLP", type: "ORIGINAL", value: new Double(15789)},
    {currency: "CLP", type: "DISCOUNT", value: new Double(12580)},
]});





     
/* Ejemplo de esquema de validación para la colección offers
db.runCommand({
  collMod: "offers",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["offer_id", "sku", "is_published", "prices"],
      properties: {
        offer_id: {
          bsonType: ["int", "long", "double"],
          description: "Debe ser un entero incremental único"
        },
        sku: {
          bsonType: "string",
          description: "Identificador del producto"
        },
        is_published: {
          bsonType: "bool",
          description: "Flag para publicar o no la oferta"
        },
        prices: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["currency", "type", "value"],
            properties: {
              currency: { bsonType: "string" },
              type:     { bsonType: "string" },
              value:    { bsonType: ["int", "long", "double"], }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate" // Rechaza documentos que no cumplan con el esquema
});*/

