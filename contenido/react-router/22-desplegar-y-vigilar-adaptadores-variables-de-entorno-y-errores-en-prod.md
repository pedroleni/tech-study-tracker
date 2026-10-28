# Desplegar y vigilar: adaptadores, variables de entorno y errores en producción

- **Módulo:** Modo framework
- **Slug:** `desplegar-y-vigilar-adaptadores-variables-de-entorno-y-errores-en-produccion` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [Deploying](https://reactrouter.com/start/framework/deploying) + [Plantillas oficiales](https://github.com/remix-run/react-router-templates) + [Error Reporting](https://reactrouter.com/how-to/error-reporting) + [Instrumentation](https://reactrouter.com/how-to/instrumentation) + [entry.server.tsx](https://reactrouter.com/api/framework-conventions/entry.server.tsx) — ver `contenido/react-router/TEMARIO.md` #22
- **Requiere:** Las lecciones 14 a 21 de esta ficha (el taller, hasta la 21). De React, la 85 (construir, desplegar y variables de entorno), la 82 (secretos en el cliente) y la 53 (informar de errores)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

El taller funciona en tu ordenador. Esta lección lo lleva a un servidor y, sobre todo, te prepara para lo que pasa después: **en producción no hay consola del navegador ni pantalla roja de Vite**. Si algo falla a las tres de la madrugada, lo único que tendrás es lo que tu servidor haya escrito. Las dos mitades de la lección:

- **Desplegar.** Qué es `react-router-serve`, cómo se mete en una imagen de Docker sin secretos ni datos personales dentro, qué pasa con Vercel, Netlify y Cloudflare, cuándo basta un alojamiento estático y qué variables de entorno necesita el albergue.
- **Vigilar.** `handleError` para los errores del servidor, `onError` para los del navegador e `instrumentations` para medir cada `loader` y cada `action`. Y, al final, los logs de verdad del servidor, línea a línea.

La lección 85 de React desplegó una SPA: un `dist/` de archivos estáticos. Aquí hay un servidor de Node que tiene que estar en marcha, con un disco donde se guardan las reservas.

## Dónde estás en el taller

Vienes de la lección 21, con el taller del [repositorio](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`): 89 tests en verde y los 9 de esta lección en rojo:

```text
$ npm run leccion -- 22

 ❯ pruebas/22-desplegar.test.ts (9 tests | 9 failed) 11ms
   ❯ lección 22: desplegar y vigilar (9)
     × handleError ignora una petición abortada e informa las demás 3ms
     × informarError escribe una línea JSON sin pila en producción 0ms
     × informarError conserva el estado de un ErrorResponse 0ms
     × sin AVISOS_TOKEN en producción responde 503 y lo registra 1ms
     × exige un token de avisos largo en producción 1ms
     × la instrumentación registra el resultado y el error del loader 0ms
     × registra el código HTTP de Response y data lanzados 4ms
     × el Dockerfile usa node, no copia .env y hay instrumentación 0ms
     × docker ignora secretos, datos personales, dependencias y artefactos 0ms

 FAIL  pruebas/22-desplegar.test.ts > lección 22: desplegar y vigilar > handleError ignora una petición abortada e informa las demás
TypeError: Cannot read properties of undefined (reading '0')
```

El primero falla porque el test busca la línea JSON que debería escribir `handleError` y no hay ninguna. Los demás, por lo que falta: el `TODO` de `informarError` (`Error: TODO (lección 22): informe estructurado de errores.`), `expected [Function] to throw an error` en el del token, `Cannot read properties of undefined (reading 'route')` en el de la instrumentación (la lista está vacía), `expected [] to deeply equal [ 401, 403 ]` en el del código HTTP, y `ENOENT` en los dos de Docker, porque los archivos no existen.

Los `TODO (lección 22)` están en `app/entry.server.tsx` (`handleError` e `instrumentations`), `app/errores.server.ts`, `app/config.server.ts`, `app/entry.client.tsx` y el README, que te pide crear `Dockerfile` y `.dockerignore`.

## Las variables de entorno del servidor

El albergue lee tres variables, todas en `app/config.server.ts`:

- **`SECRETO_SESION`** firma la cookie de sesión (lección 18). Admite varios secretos separados por comas, para rotarlos: el primero firma y todos validan.
- **`AVISOS_TOKEN`** es la contraseña que manda el Ayuntamiento en `Authorization: Bearer …` al webhook de avisos (lección 19).
- **`URL_PUBLICA`** es el origen que se escribe en `sitemap.xml`. No es secreta; tiene un valor por defecto, `https://albergue-el-cea.es`.

En desarrollo, las dos secretas tienen un valor de desarrollo escrito en el código, para que `npm run dev` funcione sin configurar nada. **En producción, sin ellas, o con menos de 32 caracteres, el código lanza un error en vez de seguir con un valor que cualquiera puede leer en el repositorio.**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// L18/L22: estas variables solo viven en el servidor. Ninguna empieza por\n// VITE_ porque Vite expondría su valor al código del navegador.\nconst SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'\nconst TOKEN_DE_DESARROLLO = 'avisos-solo-desarrollo'\n\nexport function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {\n  // L18: el primer secreto firma y los siguientes conservan válidas las cookies\n  // durante una rotación; todos deben ser largos en producción.\n  const secretos = (entorno.SECRETO_SESION ?? '')\n    .split(',')\n    .map((secreto) => secreto.trim())\n    .filter(Boolean)\n  if (secretos.length > 0) {\n    if (entorno.NODE_ENV === 'production' && secretos.some((secreto) => secreto.length < 32))\n      throw new Error('Cada valor de SECRETO_SESION debe tener al menos 32 caracteres en producción.')\n    return secretos\n  }\n  if (entorno.NODE_ENV === 'production') {\n    throw new Error('Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.')\n  }\n  return [SECRETO_DE_DESARROLLO]\n}\n\nexport function tokenDeAvisos(entorno: NodeJS.ProcessEnv = process.env): string {\n  // L19/L22: AVISOS_TOKEN autentica el webhook y no comparte la firma de sesión.\n  if (entorno.AVISOS_TOKEN) {\n    if (entorno.NODE_ENV === 'production' && entorno.AVISOS_TOKEN.length < 32)\n      throw new Error('AVISOS_TOKEN debe tener al menos 32 caracteres en producción.')\n    return entorno.AVISOS_TOKEN\n  }\n  if (entorno.NODE_ENV === 'production')\n    throw new Error('Falta AVISOS_TOKEN: el webhook de avisos queda desactivado.')\n  return TOKEN_DE_DESARROLLO\n}",
  "anotaciones": [
    {
      "fragmento": "// L18/L22: estas variables solo viven en el servidor. Ninguna empieza por",
      "nota": "El módulo es .server (lección 20): ni el código ni los valores llegan nunca al navegador, y el build falla si algo del cliente lo importa."
    },
    {
      "fragmento": "if (entorno.NODE_ENV === 'production' && secretos.some((secreto) => secreto.length < 32))",
      "nota": "Treinta y dos caracteres como mínimo. Un secreto corto se adivina probando; openssl rand -hex 32 da 64 caracteres aleatorios."
    },
    {
      "fragmento": "throw new Error('Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.')",
      "nota": "Sin secreto, en producción, un error. Mejor no atender que firmar con el de desarrollo, que está en el repositorio: cualquiera podría fabricarse una cookie de hospitalero."
    },
    {
      "fragmento": "return [SECRETO_DE_DESARROLLO]",
      "nota": "Solo fuera de producción. NODE_ENV lo pone react-router-serve a production si no le dices otra cosa."
    },
    {
      "fragmento": "throw new Error('AVISOS_TOKEN debe tener al menos 32 caracteres en producción.')",
      "nota": "Lo que escribes en esta lección: la misma regla para el token del webhook."
    },
    {
      "fragmento": "export function tokenDeAvisos(entorno: NodeJS.ProcessEnv = process.env): string {",
      "nota": "El entorno es un parámetro con process.env por defecto: los tests prueban producción y desarrollo sin tocar el process.env de verdad."
    }
  ]
}
```

Las funciones no se llaman al arrancar, sino en la primera petición que las necesita. Así el build no necesita ningún secreto, la imagen de Docker no lleva ninguno dentro y la portada funciona aunque falten. Esto respondió el contenedor sin variables (lo construyes más abajo):

```text
/              200
/albergue/     200
/camas         200
/entrar        500
POST /api/avisos  503
```

Y en su log, una línea por fallo, con el formato que escribes en esta lección (aquí, solo esas líneas y las de cada petición; el log entero, con la instrumentación, al final de la lección):

```text
{"nivel":"error","mensaje":"Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.","url":"http://localhost:3240/entrar","metodo":"GET"}
GET /entrar 500 - - 2.684 ms
{"nivel":"error","mensaje":"Falta AVISOS_TOKEN: el webhook de avisos queda desactivado.","url":"http://localhost:3240/api/avisos","metodo":"POST"}
POST /api/avisos 503 - - 2.029 ms
```

Con `-e SECRETO_SESION=secreto123 -e AVISOS_TOKEN=token123`, demasiado cortos:

```text
{"nivel":"error","mensaje":"Cada valor de SECRETO_SESION debe tener al menos 32 caracteres en producción.","url":"http://localhost:3240/entrar","metodo":"GET"}
{"nivel":"error","mensaje":"AVISOS_TOKEN debe tener al menos 32 caracteres en producción.","url":"http://localhost:3240/api/avisos","metodo":"POST"}
```

Fíjate en el 503 de los avisos, y no un 401. La ruta de avisos atrapa el error de configuración y responde «Servicio no configurado»: un 401 diría al Ayuntamiento que su token está mal, y el problema es tuyo. Lo comprueba uno de los tests de esta lección.

### Por qué ninguna empieza por `VITE_`

La lección 85 de React lo explicó: Vite sustituye cada `import.meta.env.VITE_ALGO` del código del navegador por su valor, escrito tal cual en el JavaScript que descarga cualquiera. El prefijo `VITE_` es la forma de decirle a Vite «esto puede ser público». En el modo framework, el código de servidor lee `process.env`, que no pasa por ese mecanismo. **Ninguna de las tres necesita el navegador, así que ninguna lleva `VITE_`.** Si algún día una variable tiene que llegar al cliente (la URL pública, por ejemplo), lo correcto es que un `loader` la devuelva, o darle el prefijo sabiendo que será pública. Un secreto con `VITE_` es un secreto publicado (lección 82 de React).

## `react-router-serve`: el servidor que ya tienes

`npm start` es `react-router-serve ./build/server/index.js`. Es un servidor de Express que trae `@react-router/serve`, y leyendo su código (en `node_modules/@react-router/serve/dist/cli.js`, 8.5.0) se ve todo lo que hace:

- pone `NODE_ENV=production` si no lo has puesto tú;
- escucha en `PORT` (si no hay, en el 3000, o en otro libre) y en `HOST` si lo defines;
- comprime las respuestas y quita la cabecera `X-Powered-By`;
- sirve `build/client/assets` con `Cache-Control` de un año e `immutable`, porque cada archivo lleva un *hash* en el nombre;
- sirve el resto de `build/client` como archivos estáticos (las páginas prerenderizadas de la lección 17);
- escribe una línea por petición, con `morgan` en formato `tiny`: `GET /entrar 500 - - 2.737 ms`;
- y pasa todo lo demás a React Router.

Dos consecuencias que vas a ver en los logs. **Las páginas prerenderizadas no aparecen**: el registro de peticiones va después de los archivos estáticos, así que `/albergue/` se sirve sin dejar rastro, y tampoco pasa por la instrumentación. Y **no confía en las cabeceras del proxy**: no activa `trust proxy` de Express, así que `request.url` lleva `http://` aunque el navegador use HTTPS (la razón de `allowedActionOrigins` en la lección 20).

Si necesitas algo más (confiar en el proxy, otra forma de registrar, una ruta fuera de React Router), la plantilla `node-custom-server` cambia `react-router-serve` por un `server.js` con Express y `createRequestHandler` de `@react-router/express`. Para el taller, `react-router-serve` basta.

## El Dockerfile de cuatro etapas

La plantilla por defecto del modo framework (`default`, en el repositorio de plantillas) trae un `Dockerfile`, y el del taller es ese con comentarios y tres líneas más al final: las carpetas de datos, `USER node` y `EXPOSE 3000`. Cada etapa empieza de una imagen limpia de Node 24 y copia solo lo que necesita de las anteriores:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "# L22: cuatro etapas separan las herramientas de build de la imagen que se ejecuta.\n# 1. Todas las dependencias, necesarias para construir.\nFROM node:24-alpine AS development-dependencies-env\nCOPY . /app\nWORKDIR /app\nRUN npm ci\n\n# 2. Solo dependencias de producción, para la imagen final.\nFROM node:24-alpine AS production-dependencies-env\nCOPY ./package.json package-lock.json /app/\nWORKDIR /app\nRUN npm ci --omit=dev\n\n# 3. Genera servidor, cliente y páginas prerenderizadas.\nFROM node:24-alpine AS build-env\nCOPY . /app/\nCOPY --from=development-dependencies-env /app/node_modules /app/node_modules\nWORKDIR /app\nRUN npm run build\n\n# 4. Imagen final, sin fuentes ni herramientas de desarrollo.\nFROM node:24-alpine\nCOPY ./package.json package-lock.json /app/\nCOPY --from=production-dependencies-env /app/node_modules /app/node_modules\nCOPY --from=build-env /app/build /app/build\nWORKDIR /app\n# L22: chown permite persistir los dos volúmenes y USER node evita ejecutar como root.\nRUN mkdir -p /app/datos /app/subidas && chown -R node:node /app/datos /app/subidas\nUSER node\nEXPOSE 3000\nCMD [\"npm\", \"run\", \"start\"]",
  "anotaciones": [
    {
      "fragmento": "FROM node:24-alpine AS development-dependencies-env",
      "nota": "Etapa 1: todas las dependencias, también las de desarrollo (Vite, TypeScript, @react-router/dev), que solo hacen falta para construir."
    },
    {
      "fragmento": "COPY . /app",
      "nota": "Copia todo el proyecto. Todo menos lo que diga .dockerignore: sin él, aquí entrarían tu .env, tus reservas y las fotos de las credenciales."
    },
    {
      "fragmento": "RUN npm ci --omit=dev",
      "nota": "Etapa 2: solo las dependencias de producción, las que necesita el servidor al ejecutarse. npm ci instala exactamente lo de package-lock.json."
    },
    {
      "fragmento": "RUN npm run build",
      "nota": "Etapa 3: el build, con las dependencias de la etapa 1. Aquí se generan build/server, build/client y las páginas prerenderizadas, y en el log salen las líneas de la instrumentación de los loader del prerender."
    },
    {
      "fragmento": "COPY --from=build-env /app/build /app/build",
      "nota": "Etapa 4, la imagen final: package.json, las dependencias de producción y build/. Ni el código fuente, ni los tests, ni Vite."
    },
    {
      "fragmento": "RUN mkdir -p /app/datos /app/subidas && chown -R node:node /app/datos /app/subidas",
      "nota": "Las dos carpetas donde escribe la app (reservas y avisos, y las fotos de las credenciales), del usuario node. Sin el chown, node no podría escribir en ellas."
    },
    {
      "fragmento": "USER node",
      "nota": "El servidor no corre como root. La imagen de Node ya trae el usuario node. Si alguien encuentra un fallo en la app, no tiene el contenedor entero."
    },
    {
      "fragmento": "CMD [\"npm\", \"run\", \"start\"]",
      "nota": "react-router-serve en el puerto 3000. Las variables de entorno se pasan al arrancar, nunca al construir."
    }
  ]
}
```

Y el `.dockerignore`, que decide qué parte del proyecto ve `docker build`:

```text
.react-router
build
node_modules
datos/
subidas/
.env
README.md
```

`node_modules`, `build` y `.react-router` porque se regeneran dentro (y los de tu Mac no sirven en Linux). Esas tres y `README.md` son las mismas que en el de la plantilla. Lo que la plantilla **no** excluye, y el taller sí: **`.env`, `datos/` y `subidas/`, porque son secretos y datos personales**: las reservas con nombres y documentos, y las fotos de las credenciales de los peregrinos. Lo comprobamos: en una copia del taller pusimos un `.env` con un `SECRETO_SESION`, un `datos/reservas.json` y una foto en `subidas/`, y construimos la etapa de build **sin** `.dockerignore`:

```text
$ docker run --rm albergue-sin-ignore sh -c 'cat /app/.env; cat /app/datos/reservas.json; ls /app/subidas'
SECRETO_SESION=esto-no-debe-entrar-en-la-imagen-nunca-jamas
[{"id":"r-local","nombre":"Dato local de prueba"}]
credencial-local.png
```

Los tres dentro. Es cierto que la imagen final solo copia `build/` de esa etapa, pero las capas intermedias se quedan en la caché de quien construye, y si alguien publica la etapa de build (o cambia el `Dockerfile` y copia de más), salen con ella. Y hay algo peor: `npm run build` se ejecuta con ese `.env` presente, y Vite lee los `.env` al construir. Una variable `VITE_` en él acabaría escrita en el JavaScript del navegador. Con el `.dockerignore`, la misma etapa:

```text
ls: /app/datos: No such file or directory
cat: can't open '/app/.env': No such file or directory
```

El test de esta lección comprueba las dos cosas por texto: que el `Dockerfile` tiene `USER node` y no copia ningún `.env`, y que `.dockerignore` lista las seis entradas.

### Construirla y arrancarla

Con Docker 28.3, desde la carpeta `taller`:

```text
$ docker build -t albergue-el-cea .
#3 [internal] load .dockerignore
#5 [internal] load build context
#5 transferring context: 290.89kB 0.0s done
#12 1.441 added 101 packages, and audited 102 packages in 1s
#11 2.558 added 245 packages, and audited 246 packages in 2s
#16 [build-env 5/5] RUN npm run build
#16 1.016 {"tipo":"peticion","metodo":"GET","url":"http://[::1]:41025/albergue/","duracionMs":12,"status":200}
#16 1.025 {"tipo":"loader","ruta":"routes/etapa","metodo":"GET","url":"http://[::1]:41025/etapas/terradillos-de-los-templarios-sahagun.data","duracionMs":0,"resultado":"success"}
…
#19 [stage-3 6/6] RUN mkdir -p /app/datos /app/subidas && chown -R node:node /app/datos /app/subidas
```

El contexto que se manda a Docker ocupa 290,89 kB: el código, los tests y el `package-lock.json`, sin `node_modules` ni `build`. Las dos instalaciones (la de producción, con 101 paquetes, y la completa, con 245) se ejecutan a la vez, porque no dependen una de otra. Y durante el build salen 21 líneas de la instrumentación: el prerenderizado pide a un servidor temporal «El albergue» y, de cada una de las cinco etapas, sus datos (`.data`) y su HTML. La imagen ocupa 315 MB, casi todo Node y las dependencias. Por dentro:

```text
$ docker run --rm albergue-el-cea sh -c 'whoami; ls -la /app'
node
drwxr-xr-x    4 root     root          4096 Oct 27 21:06 build
drwxr-xr-x    2 node     node          4096 Oct 27 21:06 datos
drwxr-xr-x   91 root     root          4096 Oct 27 21:06 node_modules
-rw-r--r--    1 root     root        145262 Oct 27 19:54 package-lock.json
-rw-r--r--    1 root     root          1057 Oct 27 19:54 package.json
drwxr-xr-x    2 node     node          4096 Oct 27 21:06 subidas
```

El proceso corre como `node`, que solo puede escribir en `datos` y `subidas`: el código de la app es de `root` y no se puede cambiar desde dentro. Para arrancarla con sus variables y un volumen para los datos:

```bash
docker volume create el-cea-datos
docker run -p 3240:3000 \
  -e SECRETO_SESION="$(openssl rand -hex 32)" \
  -e AVISOS_TOKEN="$(openssl rand -hex 32)" \
  -e URL_PUBLICA=https://albergue-el-cea.es \
  -v el-cea-datos:/app/datos \
  albergue-el-cea
```

Con ese contenedor reservamos dos camas, entramos como `marta` y mandamos un aviso por el webhook: `201`, `302` y `201`. Después borramos el contenedor y abrimos el volumen desde otro: la reserva de Ingrid Larsen y el aviso de las fiestas de San Juan seguían en `/app/datos`. **Sin el volumen, se habrían perdido con el contenedor.** Las fotos de las credenciales necesitan otro, en `/app/subidas`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// El albergue, desplegado con este comando:\n//\n//   docker run -p 3000:3000 \\\n//     -e SECRETO_SESION=\"$(openssl rand -hex 32)\" \\\n//     -e AVISOS_TOKEN=\"$(openssl rand -hex 32)\" \\\n//     albergue-el-cea\n//\n// Una hospitalera entra, marca llegadas y deja el turno.\n// Al día siguiente se despliega una versión nueva: se para el contenedor,\n// se borra y se arranca otro con la imagen nueva y el mismo comando.\n//\n// ¿Qué ve al entrar?",
  "opciones": [
    "Todo igual: las reservas están en la imagen",
    "Tiene que volver a entrar, pero las reservas siguen",
    "Tiene que volver a entrar, y las reservas son las tres de ejemplo: todo lo de ayer se ha perdido",
    "Un 500: el contenedor nuevo no encuentra datos/reservas.json"
  ],
  "correcta": 2,
  "explicacion": "Sin -v, datos/ vive en la capa escribible del contenedor, y se borra con él. El contenedor nuevo no tiene reservas.json, y leerReservas devuelve las tres de ejemplo. Y la sesión se pierde por otro motivo: el comando genera un SECRETO_SESION nuevo en cada arranque, así que la cookie de ayer ya no valida. Comprobado con dos contenedores seguidos: la cookie del primero dio un 302 a /entrar en el segundo, y /app/datos estaba vacía."
}
```

## Vercel, Netlify y Cloudflare

La imagen sirve en cualquier servicio que ejecute contenedores; la documentación de *Deploying* nombra AWS ECS, Google Cloud Run, Azure Container Apps, DigitalOcean App Platform, Fly.io y Railway. Las plataformas que no ejecutan tu contenedor, sino tu código en sus funciones, necesitan un adaptador. El repositorio de plantillas de React Router ya solo tiene las suyas (`default`, `node-custom-server` y las de RSC) y, para cada plataforma, remite a la guía que mantiene la propia plataforma. Así están hoy, 27 de octubre de 2026, con `npm view` y una instalación de prueba (`npm install --dry-run`) sobre el taller:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Los adaptadores, con React Router 8.5.0",
  "items": [
    {
      "titulo": "Vercel: @vercel/react-router 1.3.7 (29 de septiembre de 2026)",
      "texto": "Un preset que se añade a presets en react-router.config.ts. Pero su última versión declara como dependencias @react-router/dev 7 y @react-router/node 7, y en el taller la instalación falla con ERESOLVE: peer @react-router/dev@\"7\" from @vercel/react-router@1.3.7. Para la 8, hoy, habría que forzarla con --legacy-peer-deps y asumir el riesgo, o esperar una versión nueva."
    },
    {
      "titulo": "Netlify: @netlify/vite-plugin-react-router 4.0.0 (18 de junio de 2026)",
      "texto": "Un plugin de Vite. Pide react-router 7.9.0 o superior y Vite 6 o superior, así que acepta la 8.5.0 y Vite 8: la instalación de prueba no dio ningún conflicto."
    },
    {
      "titulo": "Cloudflare: @cloudflare/vite-plugin 1.65.0 (23 de octubre de 2026)",
      "texto": "La 8 quitó el proxy propio de React Router para Cloudflare (cloudflareDevProxy): la guía de actualización dice que se cambie por el plugin de Cloudflare, cloudflare() en vite.config.ts. Pide Vite 6, 7 u 8 y wrangler 4.152 o superior (hoy, 4.154.0). Sin conflictos en la instalación de prueba."
    },
    {
      "titulo": "Lo que cambia en el código",
      "texto": "Ninguna de las tres tiene un disco que dure: lo que el albergue escribe en datos/ y subidas/ se perdería. Habría que pasar las reservas a una base de datos y las fotos a un almacén de archivos. Cloudflare, además, no es Node: node:crypto, node:fs y process.env no funcionan igual, y el entry.server.tsx del taller usa renderToPipeableStream de Node."
    }
  ]
}
```

Este tipo de dato caduca rápido. Vercel puede publicar una versión para la 8 cualquier día; antes de elegir, vuelve a mirar `npm view <paquete> peerDependencies`.

## Alojamiento estático, para el SPA Mode

Si la app no necesita servidor, `ssr: false` (el SPA Mode de la lección 17) genera solo archivos: `build/client` se sube a cualquier alojamiento estático, como la SPA de la lección 85 de React. Con la misma condición de entonces: **cualquier dirección que no sea un archivo tiene que servir el HTML de la app**, o al recargar `/etapas/sahagun-el-burgo-ranero` el alojamiento responde 404. La documentación de *Pre-Rendering* da el archivo exacto según lo que hayas prerenderizado: `index.html` si no has prerenderizado `/`, o `__spa-fallback.html` si sí. En los alojamientos que leen un archivo `_redirects`:

```text
/*    /index.html   200
```

El albergue no puede ir así: tiene sesiones, `action` que guardan reservas y un webhook, y todo eso necesita un servidor. Lo que sí se podría es servir las páginas prerenderizadas («El albergue» y las etapas) desde un CDN delante del servidor, que es lo que la lección 20 proponía para ponerles su CSP.

## Enterarte de los errores del servidor: `handleError`

Un `loader` que lanza un `Error` no tumba el servidor: React Router lo atrapa y pinta el `ErrorBoundary`, y en producción el navegador recibe el error saneado (lección 20). Así que el error no se ve en ninguna parte… salvo que lo escribas tú. **`handleError`, en `entry.server.tsx`, es la función a la que React Router llama con cada error que atrapa en el servidor**: en un `loader`, en una `action`, al pintar, y también con los rechazos del origen de la lección 20.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const handleError: HandleErrorFunction = (error, { request }) => {\n  // L22: un navegador que ya cortó la conexión no representa un fallo del servidor.\n  if (request.signal.aborted) return\n  informarError(error, { url: request.url, metodo: request.method })\n}\n\nimport { isRouteErrorResponse } from 'react-router'\n\nexport function informarError(error: unknown, contexto: { url: string; metodo: string }): void {\n  const respuesta = isRouteErrorResponse(error) ? error : undefined\n  const excepcion = error instanceof Error ? error : undefined\n  const linea: Record<string, string | number> = {\n    nivel: 'error',\n    mensaje: respuesta\n      ? `${respuesta.status} ${respuesta.statusText}`.trim()\n      : excepcion?.message ?? String(error),\n    url: contexto.url,\n    metodo: contexto.metodo,\n  }\n  if (respuesta) {\n    linea.status = respuesta.status\n    linea.statusText = respuesta.statusText\n  }\n  // L22: la pila ayuda en desarrollo, pero en producción revelaría internals.\n  if (process.env.NODE_ENV !== 'production' && excepcion?.stack) linea.pila = excepcion.stack\n  // Aquí se conectaría Sentry u otro servicio de seguimiento de errores.\n  console.error(JSON.stringify(linea))\n}",
  "anotaciones": [
    {
      "fragmento": "if (request.signal.aborted) return",
      "nota": "Una petición abortada no es un fallo del servidor: el navegador cortó la conexión, normalmente porque la persona navegó a otro sitio antes de que llegara la respuesta. La documentación de Error Reporting lo recomienda así, para no llenar el informe de ruido."
    },
    {
      "fragmento": "informarError(error, { url: request.url, metodo: request.method })",
      "nota": "El resto, con la URL y el método: sin ellos, un mensaje de error no dice dónde buscar."
    },
    {
      "fragmento": "const respuesta = isRouteErrorResponse(error) ? error : undefined",
      "nota": "No todo lo que llega es un Error: React Router también informa con respuestas de error (ErrorResponse), que tienen status y statusText pero no message. La primera versión hacía String(error) con ellas y escribía [object Object]."
    },
    {
      "fragmento": "? `${respuesta.status} ${respuesta.statusText}`.trim()",
      "nota": "Un mensaje legible en los tres casos: el estado de una respuesta de error, el message de un Error o, para cualquier otra cosa lanzada, su texto."
    },
    {
      "fragmento": "if (process.env.NODE_ENV !== 'production' && excepcion?.stack) linea.pila = excepcion.stack",
      "nota": "La pila, solo en desarrollo. En producción revelaría rutas del disco y nombres internos en un log que puede leer más gente, y lleva varias líneas que rompen el formato de una línea por evento."
    },
    {
      "fragmento": "// Aquí se conectaría Sentry u otro servicio de seguimiento de errores.",
      "nota": "El punto de integración. Un servicio como Sentry agrupa los errores iguales, te avisa y guarda la pila con los mapas de código fuente, sin que la pila salga en el log."
    },
    {
      "fragmento": "console.error(JSON.stringify(linea))",
      "nota": "Una línea JSON por error. Los servicios de logs de las plataformas de contenedores la leen como un objeto, y puedes buscar por nivel, url o mensaje."
    }
  ]
}
```

Esto escribió el servidor de producción (con una ruta de prueba cuyo `loader` lanza un `Error` con datos internos en el mensaje) al pedirla dos veces, como documento y como `.data`. Solo las líneas de `informarError` y las de cada petición:

```text
{"nivel":"error","mensaje":"No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)","url":"http://localhost:3238/prueba?fallo=error","metodo":"GET"}
GET /prueba?fallo=error 500 - - 4.291 ms
{"nivel":"error","mensaje":"No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)","url":"http://localhost:3238/prueba.data?fallo=error","metodo":"GET"}
GET /prueba.data?fallo=error 500 - - 1.242 ms
```

El navegador recibió «Unexpected Server Error»; el log, el mensaje completo, sin la pila. Es justo el reparto que quieres. Fíjate también en lo que **no** sale: un `throw data(…, { status: 403 })` en un `loader` no llama a `handleError`, porque no es un fallo sino una respuesta que has decidido tú. En el log solo queda `GET /prueba.data?fallo=data 403`.

Lo que sí le llega a `handleError` son las respuestas de error que genera el propio router. Un `POST` a `/camas`, que no tiene `action`:

```text
{"nivel":"error","mensaje":"405 Method Not Allowed","url":"http://localhost:3240/camas","metodo":"POST","status":405,"statusText":"Method Not Allowed"}
POST /camas 405 - - 2.138 ms
```

Eso no es un `Error`, sino un `ErrorResponse`: tiene `status` y `statusText`, pero no `message`. Si lo pasaras por `String(error)`, escribirías `"mensaje":"[object Object]"`, que no dice nada; por eso `informarError` lo distingue con `isRouteErrorResponse`, y uno de los tests de la lección lo comprueba.

Hasta ahora, el `handleError` provisional del taller hacía lo mismo que React Router sin `handleError`: escribir el error tal cual con `console.error`, con su pila de varias líneas. Es lo que viste en la lección 20 con los rechazos del origen. Al terminar esta lección, cada error es una sola línea JSON, sin pila en producción. **El informe de errores tiene que ser lo más seguro de la app**: si `handleError` lanzara, React Router respondería un 500 genérico en vez del 400 o el 405 que tocaba (le pasaba a la primera versión del taller).

## Los errores del navegador: `onError` en `HydratedRouter`

Después de hidratar, las navegaciones las hace el router en el navegador, y sus errores ya no pasan por `handleError` del documento. Para esos está la prop `onError` de `HydratedRouter` (en modo datos, la de `RouterProvider`, que viste en la lección 8). En el taller, `entry.client.tsx` la usa así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { startTransition, StrictMode } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\nimport { HydratedRouter } from 'react-router/dom'\n\nstartTransition(() => {\n  hydrateRoot(\n    document,\n    <StrictMode>\n      <HydratedRouter\n        // L22: onError observa fallos de navegación tras hidratar, que ya no pasan\n        // por el manejador de errores del documento servidor.\n        onError={(error, informacion) =>\n          console.error('Error en el navegador', { error, ruta: informacion.location.pathname })\n        }\n      />\n    </StrictMode>,\n  )\n})",
  "anotaciones": [
    {
      "fragmento": "<HydratedRouter",
      "nota": "El router del navegador del modo framework. entry.client.tsx se saca con react-router reveal, como entry.server.tsx en la lección 17."
    },
    {
      "fragmento": "console.error('Error en el navegador', { error, ruta: informacion.location.pathname })",
      "nota": "El error y la ruta en la que pasó. Aquí iría el SDK de Sentry para el navegador, o un fetch a una ruta de recursos tuya que lo guarde."
    },
    {
      "fragmento": "onError={(error, informacion) =>",
      "nota": "informacion trae también params, pattern (el patrón de la ruta) y errorInfo, con la pila de componentes si el error fue al pintar."
    }
  ]
}
```

Lo probamos en Chromium con la misma ruta de prueba. Si abres `/prueba?fallo=error` directamente, el error llega pintado desde el servidor y `onError` no se llama: ya lo informó `handleError`. Si llegas navegando desde otra página de la app, el router pide `/prueba.data`, recibe el error y llama a `onError`. La consola:

```text
[error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
[debug] Navegación completada en 5 ms
[error] Error en el navegador {error: Error: Unexpected Server Error, ruta: /prueba}
```

(La línea de `debug` es el middleware de cliente de la lección 16.) El error que recibe el navegador es el saneado, «Unexpected Server Error»: el detalle está en el log del servidor. Por eso necesitas los dos informes, y por eso conviene que los dos lleven la ruta: con ella cruzas el error del navegador con su línea del servidor.

## Medir: `instrumentations`

`handleError` te dice qué ha fallado. Para saber **cuánto tarda** cada cosa y qué ha ido bien, React Router tiene una API de instrumentación, estable desde la 7.15: funciones que envuelven cada petición, cada `loader`, cada `action`, cada middleware y cada `lazy`, sin tocar tu código de rutas. En el servidor se exportan desde `entry.server.tsx`; en el navegador, se pasan a `HydratedRouter`. La documentación insiste en una idea: **la instrumentación es de solo lectura**. Observas, pero no puedes cambiar los argumentos ni lo que devuelve la función.

La idea del taller era medir cada `loader` y escribirlo en la cabecera `Server-Timing`, que el navegador enseña en la pestaña Red. **En la 8.5.0 no se puede.** Los tipos lo dejan claro: la función que envuelve un `loader` recibe `ejecutar` (que devuelve solo `{ status: 'success' | 'error', error }`) y una petición de solo lectura con `method`, `url` y `headers.get`. No hay respuesta, ni cabeceras que tocar.

Y ese `status` esconde una sorpresa. En el código de la 8.5.0 (`lib/router/instrumentation.js`), el resultado de una ruta es `error` **solo si lo lanzado es un `Error`**. Un `throw data(…, { status: 403 })` o un `throw new Response(null, { status: 401 })` salen como `success`: para la instrumentación de ruta, el `loader` terminó como esperabas. Por eso el taller registra dos cosas distintas, con dos instrumentos:

- el de cada **ruta** (`route`), con `resultado: success | error` y el tiempo de cada `loader` y cada `action`;
- el de cada **petición** (`handler`), que sí recibe el código HTTP de la respuesta (`statusCode`), además de su duración total.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// La instrumentación de ruta de 8.5.0 no expone las cabeceras de respuesta.\n// Por eso registra los tiempos; no puede añadir Server-Timing con esta API.\nexport const instrumentations: ServerInstrumentation[] = [\n  {\n    handler({ instrument }) {\n      instrument({\n        async request(ejecutar, { request }) {\n          const inicio = performance.now()\n          const { statusCode, error } = await ejecutar()\n          console.info(\n            JSON.stringify({\n              tipo: 'peticion',\n              metodo: request.method,\n              url: request.url,\n              duracionMs: Math.round(performance.now() - inicio),\n              status: statusCode,\n              error: error?.message,\n            }),\n          )\n        },\n      })\n    },\n    route({ id, instrument }) {\n      instrument({\n        async loader(ejecutar, { request }) {\n          const inicio = performance.now()\n          const { status, error } = await ejecutar()\n          console.info(\n            JSON.stringify({\n              tipo: 'loader',\n              ruta: id,\n              metodo: request.method,\n              url: request.url,\n              duracionMs: Math.round(performance.now() - inicio),\n              resultado: status,\n              error: error?.message,\n            }),\n          )\n        },\n        async action(ejecutar, { request }) {",
  "anotaciones": [
    {
      "fragmento": "export const instrumentations: ServerInstrumentation[] = [",
      "nota": "Una lista: puedes tener una para los logs y otra para un servicio de trazas, y React Router las aplica todas."
    },
    {
      "fragmento": "handler({ instrument }) {",
      "nota": "El instrumento de la petición entera: envuelve todo lo que hace React Router con ella, middleware, loader, action y render."
    },
    {
      "fragmento": "const { statusCode, error } = await ejecutar()",
      "nota": "Aquí sí llega el código HTTP real de la respuesta: el 403 de un data() lanzado, el 404 de la ruta comodín o el 400 de un origen rechazado."
    },
    {
      "fragmento": "route({ id, instrument }) {",
      "nota": "Se llama una vez por ruta al arrancar. id es el de la ruta, como routes/etapa; aquí podrías no instrumentar alguna con un return."
    },
    {
      "fragmento": "const { status, error } = await ejecutar()",
      "nota": "ejecutar llama al loader de verdad y nunca lanza. status es success o error, y error solo si lo lanzado era un Error: un data() o una Response lanzados son success."
    },
    {
      "fragmento": "resultado: status,",
      "nota": "Por eso en el log se llama resultado y no status: así no se confunde con el código HTTP de la línea de la petición."
    },
    {
      "fragmento": "duracionMs: Math.round(performance.now() - inicio),",
      "nota": "Lo que tardó cada cosa, en milisegundos. En la ruta, solo el loader; en la petición, todo."
    },
    {
      "fragmento": "error: error?.message,",
      "nota": "El mensaje, si falló. Sin la pila, por lo mismo que en informarError."
    }
  ]
}
```

Las líneas de la ruta de prueba, en el servidor de producción, para un `Error` lanzado y para un `data()` con 403:

```text
{"tipo":"loader","ruta":"routes/prueba","metodo":"GET","url":"http://localhost:3238/prueba.data?fallo=error","duracionMs":0,"resultado":"error","error":"No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)"}
{"nivel":"error","mensaje":"No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)","url":"http://localhost:3238/prueba.data?fallo=error","metodo":"GET"}
{"tipo":"peticion","metodo":"GET","url":"http://localhost:3238/prueba.data?fallo=error","duracionMs":1,"status":500}
GET /prueba.data?fallo=error 500 - - 1.242 ms
{"tipo":"loader","ruta":"routes/prueba","metodo":"GET","url":"http://localhost:3238/prueba.data?fallo=data","duracionMs":0,"resultado":"success"}
{"tipo":"peticion","metodo":"GET","url":"http://localhost:3238/prueba.data?fallo=data","duracionMs":1,"status":403}
GET /prueba.data?fallo=data 403 - - 0.834 ms
```

El 403 sale como `"resultado":"success"` en la línea de la ruta, y como `"status":403` en la de la petición. Lo mismo con la página «no encontrada»: su `loader` es un `success`, y la petición, un 404. **Si quieres contar los 403 y los 404, míralos en la línea de la petición**, no en la de la ruta. Uno de los tests de la lección lo comprueba con un `Response` 401 y un `data()` 403 lanzados.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Server-Timing, si de verdad lo quieres",
  "contenido": "Un middleware de servidor sí puede tocar la respuesta: lo hace el de la zona de hospitaleros con Cache-Control. Un middleware en root que mida desde antes de next() hasta después y añada Server-Timing a la respuesta daría el tiempo de toda la petición (middleware, loader y render), no el de cada loader. Es el reto 2."
}
```

## Los logs del servidor, de principio a fin

Todo junto. Este es el log del contenedor de la imagen de esta lección, arrancado con sus tres variables, mientras le pedíamos una reserva, una entrada, un aviso del Ayuntamiento y, al final, una reserva desde otro origen, el ataque de la lección 20:

```text
> start
> react-router-serve ./build/server/index.js

[react-router-serve] http://localhost:3000 (http://172.17.0.2:3000)
{"tipo":"action","ruta":"routes/reservar","metodo":"POST","url":"http://localhost:3240/reservar","duracionMs":4,"resultado":"success"}
{"tipo":"peticion","metodo":"POST","url":"http://localhost:3240/reservar","duracionMs":18,"status":201}
POST /reservar 201 - - 36.698 ms
{"tipo":"action","ruta":"routes/entrar","metodo":"POST","url":"http://localhost:3240/entrar","duracionMs":27,"resultado":"success"}
{"tipo":"peticion","metodo":"POST","url":"http://localhost:3240/entrar","duracionMs":28,"status":302}
POST /entrar 302 - - 28.348 ms
{"tipo":"action","ruta":"routes/recursos/avisos","metodo":"POST","url":"http://localhost:3240/api/avisos","duracionMs":1,"resultado":"success"}
{"tipo":"peticion","metodo":"POST","url":"http://localhost:3240/api/avisos","duracionMs":2,"status":201}
POST /api/avisos 201 - - 2.384 ms
{"nivel":"error","mensaje":"The `request.url` origin does not match `origin` header from a forwarded action request. Aborting the action.","url":"http://localhost:3240/reservar","metodo":"POST"}
{"tipo":"peticion","metodo":"POST","url":"http://localhost:3240/reservar","duracionMs":1,"status":400}
POST /reservar 400 - - 1.122 ms
```

Cómo leerlo:

- **Cada petición deja su línea de `morgan`** (método, ruta, estado, tiempo total), **después** de las líneas de lo que pasó dentro. El contenedor escucha en el 3000, pero `request.url` dice 3240: es el `Host` de la petición (aquí la mandó `curl`; en la vida real, el navegador), con el puerto publicado por `-p 3240:3000`.
- **Una línea `tipo` por cada `loader` y cada `action`**, con su ruta, su duración y su `resultado`, y **una `peticion` por cada petición**, con el código HTTP. La reserva: 4 ms de `action` y 18 ms de petición; la diferencia es todo lo que pasa fuera de la `action`, sobre todo pintar la página de respuesta. La `action` de entrar es la más lenta: compara la contraseña con `scrypt` (lección 18), que es lento a propósito.
- **Una línea `nivel: error` por cada fallo**, de `informarError`: los que lanza tu código y los rechazos del propio router, como el del origen. La `action` rechazada no tiene línea de ruta, porque no llegó a ejecutarse; su petición sí, con el 400.
- **Lo que no sale**: las páginas prerenderizadas y los archivos de `build/client` (se sirven antes del registro), y cualquier cosa que no pase por React Router.

En una plataforma de contenedores, estas líneas van a su panel de logs, y las que son JSON se pueden filtrar: todas las de `"nivel":"error"`, o las `action` de más de 500 ms.

## Errores típicos

**Un `handleError` que puede lanzar.** Convierte cualquier error en un 500 genérico, incluidos los 400 que React Router da a propósito. Lo que hay dentro tiene que ser a prueba de todo.

**Informar de las peticiones abortadas.** Cada vez que alguien navega rápido, el servidor abortaría y tu informe se llenaría de falsos errores. `request.signal.aborted` primero.

**La pila en el log de producción.** Varias líneas por error, rutas internas y, a veces, datos que no deberían estar ahí. La pila va al servicio de errores, que la guarda aparte.

**Un `.env` sin `.dockerignore`.** Entra en la etapa de build, en la caché de las capas y, si lleva una `VITE_`, en el JavaScript del navegador.

**Generar el secreto al arrancar el contenedor.** `$(openssl rand -hex 32)` en el `docker run` sirve para probar; en producción, cada despliegue invalidaría todas las sesiones. El secreto se genera una vez y se guarda en el gestor de secretos del servicio.

**Olvidar el volumen.** Las reservas desaparecen con el contenedor, en cada despliegue.

**Correr como root.** Funciona igual, y por eso se olvida. Con `USER node`, un fallo en la app no da el contenedor entero.

**Buscar los códigos HTTP en la instrumentación de ruta.** Su resultado es `success` o `error`, y solo es `error` si se lanzó un `Error`: un `throw data(…, 404)` es un `success`. El código está en la instrumentación de la petición.

**Instalar un adaptador sin mirar sus dependencias.** El de Vercel, hoy, pide la 7. `npm view <paquete> peerDependencies` antes de elegir plataforma.

## En el taller: los pasos de la lección

Cinco pasos. Ejecuta `npm run leccion -- 22` después de cada uno.

### Paso 1: el informe de errores (`errores.server.ts` y `handleError`)

1. En `informarError`, construye un objeto con `nivel: 'error'`, el mensaje, la URL y el método. El mensaje depende de lo que llegue: si `isRouteErrorResponse(error)`, su `status` y su `statusText` (y guárdalos también en la línea); si es un `Error`, su `message`; si no, `String(error)`.
2. Añade la pila solo si `NODE_ENV` no es `production`, y escribe el objeto con `console.error(JSON.stringify(…))`: una sola llamada.
3. En `handleError`, sustituye el registro provisional: recibe `(error, { request })`, sal si `request.signal.aborted` y, si no, llama a `informarError` con `request.url` y `request.method`.

Verdes: `handleError ignora una petición abortada e informa las demás`, `informarError escribe una línea JSON sin pila en producción`, `informarError conserva el estado de un ErrorResponse` y `sin AVISOS_TOKEN en producción responde 503 y lo registra` (la ruta de avisos ya llamaba a `informarError`; faltaba que funcionara).

### Paso 2: el token largo (`config.server.ts`)

En `tokenDeAvisos`, si hay `AVISOS_TOKEN` y estás en producción, lanza un error si tiene menos de 32 caracteres; el mensaje tiene que decir «32 caracteres». Copia la idea de `secretosDeSesion`, que ya lo hace. Añade arriba el comentario de por qué ninguna variable empieza por `VITE_`. Verde: `exige un token de avisos largo en producción`.

### Paso 3: la instrumentación (`entry.server.tsx`)

Rellena `instrumentations` con un objeto que tenga dos instrumentos:

1. `handler({ instrument })` con `instrument({ request })`: guarda `performance.now()`, espera a `ejecutar()` y escribe con `console.info` una línea JSON con `tipo: 'peticion'`, `metodo`, `url`, `duracionMs`, `status` (el `statusCode` que devuelve `ejecutar`) y el mensaje de `error`.
2. `route({ id, instrument })` con `instrument({ loader, action })`: lo mismo, con `tipo`, `ruta` y `resultado` (el `status` de `ejecutar`) en vez del código HTTP.

Mira en los tipos (`ServerInstrumentation`) qué recibe cada función. Verdes: `la instrumentación registra el resultado y el error del loader` y `registra el código HTTP de Response y data lanzados`.

### Paso 4: `onError` en el navegador (`entry.client.tsx`)

Pásale a `HydratedRouter` una función `onError` que escriba con `console.error` el error y `informacion.location.pathname`. Ningún test la comprueba (necesitaría un navegador de verdad): pruébala tú como en la sección de `onError`, con una ruta cuyo `loader` falle y llegando a ella navegando.

### Paso 5: `Dockerfile` y `.dockerignore`

Crea los dos en la carpeta `taller`. El `Dockerfile`, con las cuatro etapas de la sección de Docker: puedes partir del de la plantilla oficial (`npx create-react-router@latest` lo genera) y añadirle las carpetas `datos` y `subidas` del usuario `node` y `USER node`. El `.dockerignore`, con las seis entradas. Verdes: los dos últimos tests.

Con todo:

```text
$ npm run leccion -- 22

 Test Files  1 passed (1)
      Tests  9 passed (9)

$ npm test

 Test Files  10 passed (10)
      Tests  98 passed (98)
```

**Los 98 en verde: el taller está terminado.** Si tienes Docker, construye la imagen y arráncala sin variables, con variables cortas y con las buenas, y compara tus logs con los de la lección. Y con el servidor en marcha, repite los `curl` de la lección 20 y mira cómo quedan ahora sus líneas en el log. Si te atascas, la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller) tiene el taller completo.

Lo que viene después es el examen del módulo: la cooperativa de la lección 24, una app nueva con todo lo de las lecciones 14 a 22 de una vez, sin pasos tan guiados.

## Retos para seguir practicando

Sin comprobación automática, salvo la que escribas tú.

1. **Desplegarlo de verdad.** Sube la imagen a un servicio de contenedores con disco persistente (Fly.io con un volumen, por ejemplo), con sus tres variables guardadas como secretos. Comprueba con `curl -I` que llega con HTTPS, que `/entrar` funciona (y si no, piensa en `allowedActionOrigins` y en el dominio que te da el servicio) y que las reservas sobreviven a un segundo despliegue.
2. **`Server-Timing` con un middleware.** Escribe un middleware de servidor en `root.tsx` que mida desde antes de `next()` hasta después y añada `Server-Timing: total;dur=…` a la respuesta. Mírala en la pestaña Red de Chromium. ¿Por qué no sale en `/albergue/`?
3. **Los errores del navegador, al servidor.** Haz que `onError` mande el error con `navigator.sendBeacon` a una ruta de recursos `/api/errores` que lo escriba con `informarError`. ¿Qué tienes que limitar en esa ruta para que nadie la use para llenarte el log?
4. **Vercel o Netlify.** En una copia del taller, prueba el adaptador de Netlify, o el de Vercel con `--legacy-peer-deps`. ¿Qué tienes que cambiar para que las reservas no se pierdan?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-router-proyectos/taller (rama solucion)",
      "descripcion": "El taller terminado: los 98 tests en verde, el Dockerfile, el informe de errores y la instrumentación.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Deploying",
      "descripcion": "Despliegue completo o estático, las plantillas oficiales y las guías de cada plataforma.",
      "url": "https://reactrouter.com/start/framework/deploying",
      "etiqueta": "React Router"
    },
    {
      "titulo": "react-router-templates",
      "descripcion": "Las plantillas oficiales del modo framework: default, con su Dockerfile, y node-custom-server.",
      "url": "https://github.com/remix-run/react-router-templates",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Error Reporting",
      "descripcion": "handleError en el servidor y onError en el navegador, en modo framework y en modo datos.",
      "url": "https://reactrouter.com/how-to/error-reporting",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Instrumentation",
      "descripcion": "La API de instrumentación del servidor y del navegador, con ejemplos de logs y de OpenTelemetry.",
      "url": "https://reactrouter.com/how-to/instrumentation",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Dockerfile reference: USER",
      "descripcion": "Cómo cambia USER el usuario con el que corren las instrucciones siguientes y el contenedor.",
      "url": "https://docs.docker.com/reference/dockerfile/#user",
      "etiqueta": "Docker"
    },
    {
      "titulo": "Build context: .dockerignore",
      "descripcion": "Qué ve docker build de tu proyecto y cómo excluir archivos.",
      "url": "https://docs.docker.com/build/concepts/context/#dockerignore-files",
      "etiqueta": "Docker"
    }
  ]
}
```
