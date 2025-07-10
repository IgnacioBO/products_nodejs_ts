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
    "dev": "ts-node src/index.ts"
    "devommit": "ts-node --transpile-only src/index.ts"
  }

build: Ejecuta el compilador de TypeScript (tsc), que convierte tu código .ts en .js según las opciones de tu tsconfig.json

start: Lanza Node.js y ejecuta el archivo de entrada compilado en dist/index.js, asumiendo que ahí está tu punto de arranque. Si se intenta correr un archivo .ts con node directamente, se obtendrá un error porque Node sólo entiende JS nativo.

dev: Usa ts-node para ejecutar tu aplicación directamente desde el código TypeScript sin compilar antes. ts-node se engancha al cargador de módulos de Node y traduce en JIT cada import de .ts a JS en memoria.

devommit: Igual que dev, pero usamos la opción --transpile-only que omite la comprobación de tipos para que el reinicio sea más rápido en desarrollo, para que pueda ejecutarse (si no dará errores hasta que corrigamos todos le proyecto)

*** En los dev y devommit puede cambiarse el index.ts por .js si no es el primer archivo que cambiamos ***

4) Empezar a hacer cambios

a) Migración incremental de archivos
Habilitar la coexistencia de JS y TS
Gracias a allowJs/checkJs, tu proyecto puede compilar archivos .js y .ts simultáneamente mientras avanzas.

b) Renombrar por módulos
Comienza con módulos pequeños o menos críticos (por ejemplo, infrastructure o utils), renombra archivo.js → archivo.ts y corrige los tipos que te marque el compilador. Sigue con application y finalmente con domain, siempre validando que los tests o peticiones sigan OK.

**Ahora para probar usar npm run build (saldran errores de compilacion, pero compilará) y luego hacern npm run start. Tambien puede hacerse directo con npm devommit**

**IMPORTANTE**
Pueden haber algunos errores al intentar hacer un run, si hay modulo expoertados sin "const, let o var" puede dar error, asi que hay que ponerlos. (En todo caso informará de esto).

**ISSUE OCURRIDO**
Me paso que algunos require() quedaban con require().default, y aunque hiciese build seguia saliendo. Era al parecer cache, porque modificano el archivo (en src) donde se genera el require().default se arregla.

Una manera sencilla puede ser reiniciando el TS Server:
"If you are using VSCode, you can use Ctrl + Shift + P to open the command palette and search for Typescript: Restart TS Server or Typescript: Reload Project, both work well."

c) Refactor y tipos en tu arquitectura hexagonal
Dentro de domain, define tus entidades e interfaces de puerto (p. ej. IProductRepository) en TypeScript para garantizar tipado fuerte 

En application, ajusta los casos de uso para recibir y retornar tipos explícitos en lugar de any.

En infrastructure, implementa adaptadores concretos que cumplan esas interfaces, aprovechando los tipos para evitar errores en tiempo de compilación.