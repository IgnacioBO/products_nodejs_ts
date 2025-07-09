1) Crear y configurar tsconfig.json
En la raíz del proyecto, ejecutar npx tsc --init para generar el tsconfig.json. 
(Al usar npx, se usa automáticamente la versión local que está en node_modules/.bin y no la global)

Asegúrate de activar estas opciones esenciales:

{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  }
}

2) Instalar dependencias de desarrollo:
Instala TypeScript y los tipos de Node y Express:

npm install --save-dev typescript ts-node @types/node @types/express

Los types permiten que TS pueda veirificar y proporiconar sugerencias al usar ciertos paquetes (node/express/mongoose, etc)

ts-node permite ejecutar codigo TS directametne en nodejs SIN COMPILACION. Muy util para fase de dev.

3) Agregar los siguiente script a package.json

 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node --respawn src/index.ts"
  }

build: Ejecuta el compilador de TypeScript (tsc), que convierte tu código .ts en .js según las opciones de tu tsconfig.json

start: Lanza Node.js y ejecuta el archivo de entrada compilado en dist/index.js, asumiendo que ahí está tu punto de arranque. Si se intenta correr un archivo .ts con node directamente, se obtendrá un error porque Node sólo entiende JS nativo.

dev: Usa ts-node para ejecutar tu aplicación directamente desde el código TypeScript sin compilar antes. ts-node se engancha al cargador de módulos de Node y traduce en JIT cada import de .ts a JS en memoria.
El flag --respawn asegura que el proceso hijo se cierre y vuelva a arrancar limpio al actualizar dependencias o ante errores críticos