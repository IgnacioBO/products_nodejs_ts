mongosh <<EOF # mongosh es la shell de MongoDB que permite interactuar con la base de datos y << EOF indica el inicio de un bloque de código a ejecutar
use offerTest
db.offerCollectionTest.insertOne({ name: "wACHE Lovelace", age: 205 })
EOF