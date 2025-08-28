1) Usare Jest (ya que es el que usan)
2) Par instalar 
    npm i -D jest typescript ts-jest @types/jest
    Jest es el runner.
    ts-jest transpila TS “al vuelo” para que no tengas que compilar antes.
    @types/jest te da autocompletado y tipos.
    Referencia oficial: instalación básica de Jest y uso de ts-jest.

3) Configuracion iniciaal y minima de JEST:
    npx ts-jest config:init
    Eso te crea un jest.config.js

4) Agregar estos pasos a package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
5) Los test unitarios deberia ir dentro de la misma carpeta por ejmeplo si va a testear offer-service.ts deberia ir en offer-service.spec.ts
Los teste de integracion deberia ir fuera se rdc, podria ir dentro d una carpeta llamda "tests" y adentro podria ir "integration" o e2e por ejemplo--

6) Exlcuir archiv dentreo de tsconfig.json
Jest por defecto detecta *.test.*/*.spec.*; con testMatch lo dejamos explícito para .ts. 
jestjs.io
En tsconfig.json excluye los tests del build a dist:
"exclude": ["**/*.test.ts", "**/*.spec.ts", "tests/**", "jest.config.*"]

si da problema agregar un include tb
"include": ["src/**/*"],


7) Comenzar a hacer test
Los archivos idealmtne deben termianer en ".. spec.ts"

Palabras reservadas
describe: Permite agrupar test
test o it: describe un test
beforeAll: ejecuta antes de los test, sirve para configurar datos ocmunes por ejmeplo

8) Para testear usar "npm run test"

9) Cuando quiera ver la cobertura puee usarse "npm run test:cov"
Ahora si quieremos un informe HTML para visualizar vine que lineas faltan se crea una carpeta "coverage" que contiene el informe en html
