# Proyecto avanzado: la cooperativa de consumo

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-la-cooperativa-de-consumo` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [Sessions and Cookies](https://reactrouter.com/explanation/sessions-and-cookies) + [Middleware](https://reactrouter.com/how-to/middleware) + [Resource Routes](https://reactrouter.com/how-to/resource-routes) + [Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) + [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts) + [Testing](https://reactrouter.com/start/framework/testing) + [Deploying](https://reactrouter.com/start/framework/deploying) — ver `contenido/react-router/TEMARIO.md` #24
- **Requiere:** El módulo 4 de esta ficha (lecciones 14 a 22) y las lecciones 5, 6 y 10 (fetchers, interfaz optimista y middleware). De React, la 98 (la revista en modo framework), la 61 (Zod) y la 102 (autenticación en una SPA)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `cooperativa`)

---

## Qué vas a construir

La **Cooperativa La Huerta del Ebro** junta a 214 familias de Zaragoza que compran juntas a hortelanos de Movera, Juslibol, Montañana y el resto de la vega del Ebro. Cada lunes se publica el catálogo de la semana; hasta el miércoles a las 20:00, cada socio llena su cesta y confirma el pedido, y el jueves o el viernes la recoge en el Casco Histórico, el Actur o Torrero.

Vas a construir la web de la cooperativa con **React Router 8 en modo framework**, en TSX y con renderizado en el servidor. La revista de la lección 98 de React ya enseñó el renderizado en el servidor, los `loader` y las `action`; aquí no se repite nada de aquello. **Este proyecto va de usuarios, sesiones y seguridad**: el módulo 4 entero (lecciones 14 a 22) en una sola app.

- **Iniciar sesión con una cookie firmada.** Nadie puede cambiar lo que lleva sin que el servidor lo note.
- **Un middleware de servidor que protege la zona de socios**: deja al socio en un contexto tipado y, si no hay sesión, te manda a `/entrar?volver=…`.
- **La cesta vive en la sesión** y cambia en cuanto pulsas, sin esperar al servidor.
- **El pedido se valida con Zod**: un 400 con los errores junto a cada campo, o una redirección con un mensaje *flash*.
- **La hoja de reparto, en CSV**, solo para quien coordina el reparto: una ruta de recursos.
- **La portada y «Cómo funciona», prerenderizadas**; el catálogo, con `Cache-Control` para guardarlo en una caché.
- **`?volver=` validado y `allowedActionOrigins`**, dos agujeros de seguridad con nombre propio.
- **`npm run typecheck` limpio**, con los tipos generados y `href()`.
- **Tests** de `loader`, `action` y middleware llamados como funciones, y de componentes con `createRoutesStub`.
- **Desplegada con `react-router-serve` y Docker**; Vercel, como reto.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué en una petición a la zona de socios",
  "roles": [
    {
      "etiqueta": "cookie __sesion",
      "rol": "Quién eres y tu cesta",
      "descripcion": "Viaja en cada petición. Va firmada: si alguien cambia su contenido, la firma deja de cuadrar y el servidor la trata como si no existiera."
    },
    {
      "etiqueta": "middleware",
      "rol": "El portero de /socio",
      "descripcion": "Lee la sesión antes que nadie. Sin socio, redirige a /entrar. Con socio, lo deja en el context y, a la vuelta, guarda la sesión si ha cambiado."
    },
    {
      "etiqueta": "loader y action",
      "rol": "El trabajo de cada ruta",
      "descripcion": "Leen al socio y su sesión del context, sin volver a mirar la cookie. Cambian la cesta o dejan un aviso; la cookie la manda el middleware."
    },
    {
      "etiqueta": "Cache-Control",
      "rol": "Quién puede guardar la respuesta",
      "descripcion": "public en el catálogo, que es igual para todos; private, no-store en todo lo que lleva datos de un socio."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-router-proyectos (carpeta cooperativa). La rama main trae los estilos, los datos, los componentes, el Dockerfile de la plantilla y los tests, y un comentario TODO (paso N) en cada sitio donde va tu trabajo, con el mismo número que los pasos de esta lección. La rama solucion tiene el proyecto terminado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Datos de ejemplo, contraseñas de ejemplo",
  "contenido": "Para entrar: pilar@huertadelebro.example con la contraseña borraja2026 (socia) o javier@huertadelebro.example con cebolla2026 (coordina el reparto). En el código solo está la huella de cada contraseña, calculada con scrypt y una sal distinta para cada socio, nunca la contraseña. Los pedidos se guardan en un archivo JSON, datos/pedidos.json: una cooperativa de verdad usaría una base de datos."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.22.2 o superior, o la LTS actual (24).** React Router 8 pide 22.22 y jsdom, con el que corren los tests, 22.22.2. Compruébalo con `node --version`.
- **El módulo 4 de esta ficha.** Cada paso pone en práctica una o dos lecciones, y te remito a ellas en vez de repetirlas: la 14 (la anatomía de la app), la 15 (los tipos), la 16 (servidor y navegador), la 17 (renderizado y caché), la 18 (sesiones), la 19 (rutas de recursos), la 20 (seguridad), la 21 (tests) y la 22 (despliegue).
- **Docker**, para el último paso. Si no lo tienes, todo lo demás funciona igual.
- **`curl`**, para mirar las respuestas tal como salen del servidor, sin un navegador que las interprete.

### Del cero al proyecto en marcha

1. **Consigue el código**: `git clone https://github.com/pedroleni/react-router-proyectos.git`, o en [su página](https://github.com/pedroleni/react-router-proyectos), botón **Code** → **Download ZIP**.
2. **Abre en el editor la carpeta `cooperativa/`** y su terminal.
3. **Instala y arranca**: `npm install` y después `npm run dev`. Abre `http://localhost:5173`.
4. **Ejecuta los tests en otra terminal**: `npm test`. Empiezan casi todos en rojo, y es a propósito:

```text
      Tests  41 failed | 11 passed | 3 todo (55)
```

Los once que pasan comprueban lo que ya está hecho: siete, la capa de datos; uno, el secreto de desarrollo, y tres, casos de `?volver=` que la versión ingenua del paso 7 ya resuelve. Se ponen en verde paso a paso: tras el paso 1 pasan 18; tras el 2, 22; tras el 3, 26; tras el 4, 33; tras el 5, 37; tras el 6, 39; tras el 7, 49, y tras el 8, 50. Los tres `todo` son los tests que escribes tú en el paso 9 (53), y con el 10 pasan los 55.

La portada, «Cómo funciona» y el catálogo ya se ven. La zona de socios, en cambio, enseña «Algo ha fallado», y en la terminal sale `Error: No value found for context`: el `loader` de la zona lee al socio del context, y nadie lo ha dejado ahí todavía. Lo arregla el paso 2. `npm run typecheck` marca un solo error, que es del paso 8:

```text
app/routes/pedido-detalle.tsx(13,37): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
```

## Cómo está organizado

```text
app/
├── root.tsx                  el documento y la cabecera pública: sin datos del socio
├── routes.ts                 las rutas
├── routes/
│   ├── inicio.tsx            /                    prerenderizada                  ← paso 6
│   ├── como-funciona.tsx     /como-funciona       prerenderizada                  ← paso 6
│   ├── catalogo.tsx          /catalogo            Cache-Control público           ← paso 6
│   ├── entrar.tsx            /entrar              iniciar sesión                  ← paso 1
│   ├── salir.tsx             /salir               cerrar sesión                   ← paso 1
│   ├── zona.tsx              /socio               el middleware de la zona        ← paso 2
│   ├── cesta.tsx             /socio               la action de la cesta           ← paso 3
│   ├── pedido.tsx            /socio/pedido        el pedido, con Zod              ← paso 4
│   ├── pedidos.tsx           /socio/pedidos       tus pedidos y el aviso flash    ← pasos 4 y 8
│   ├── pedido-detalle.tsx    /socio/pedidos/:id   un pedido, si es tuyo           ← paso 8
│   ├── reparto-csv.ts        /socio/reparto.csv   ruta de recursos                ← paso 5
│   └── no-encontrada.tsx     cualquier otra dirección, con su 404
├── componentes/              ListaCesta, ResumenCesta y FormularioPedido
├── datos/                    catálogo, socios y pedidos (.server)
├── middleware/socio.server.ts  exigirSocio                                         ← paso 2
├── contexto.server.ts        socioContext y sesionContext
├── sesiones.server.ts        la cookie de sesión                                   ← paso 1
├── config.server.ts          los secretos, de SECRETO_SESION                       ← paso 10
├── cesta.ts                  la cesta en funciones puras y la respuesta optimista  ← paso 3
├── validacion/pedido.ts      el esquema de Zod                                     ← paso 4
├── csv.ts                    un CSV que Excel abre bien                            ← paso 5
└── seguridad.ts              destinoSeguro, para ?volver=                          ← paso 7
react-router.config.ts        prerender y allowedActionOrigins                      ← pasos 6 y 7
pruebas/                      Vitest y Testing Library                              ← paso 9
Dockerfile                    la imagen de la plantilla                             ← paso 10
```

Sale de la plantilla oficial (`npx create-react-router@8.5.0`), como la revista, con estos cambios: sin Tailwind, con Zod 4.6.7 y Vitest, con TypeScript 7.0.2 (el panel de tipos de esta ficha usa la 6.0.3, porque la 7 no se puede ejecutar en un navegador) en vez del 5.9 de la plantilla y con el `Dockerfile` de la plantilla, que retocas en el paso 10.

Las rutas forman dos mundos. La parte pública cuelga directamente de `root`; la zona de socios, de `zona.tsx`, una ruta con su `path` (`socio`) y un `<Outlet>`, que es donde vive el middleware:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de la cooperativa",
  "nodos": [
    {
      "nombre": "root",
      "nivel": 0,
      "etiqueta": "root.tsx",
      "nota": "← sin loader: la cabecera es igual para todo el mundo"
    },
    {
      "nombre": "inicio",
      "nivel": 1,
      "etiqueta": "index",
      "nota": "← prerenderizada al construir"
    },
    {
      "nombre": "como-funciona",
      "nivel": 1,
      "etiqueta": "pública",
      "nota": "← prerenderizada al construir"
    },
    {
      "nombre": "catalogo",
      "nivel": 1,
      "etiqueta": "pública",
      "nota": "← Cache-Control: public"
    },
    {
      "nombre": "entrar",
      "nivel": 1,
      "etiqueta": "pública"
    },
    {
      "nombre": "salir",
      "nivel": 1,
      "etiqueta": "pública"
    },
    {
      "nombre": "zona",
      "nivel": 1,
      "etiqueta": "socio",
      "nota": "← middleware exigirSocio: protege a todas sus hijas"
    },
    {
      "nombre": "cesta",
      "nivel": 2,
      "etiqueta": "index"
    },
    {
      "nombre": "pedido",
      "nivel": 2
    },
    {
      "nombre": "pedidos",
      "nivel": 2
    },
    {
      "nombre": "pedido-detalle",
      "nivel": 2,
      "etiqueta": "pedidos/:id"
    },
    {
      "nombre": "reparto-csv",
      "nivel": 2,
      "etiqueta": "recursos",
      "nota": "← sin componente: responde un CSV"
    },
    {
      "nombre": "no-encontrada",
      "nivel": 1,
      "etiqueta": "*"
    }
  ]
}
```

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Pilar añade un kilo de tomate, en orden",
  "items": [
    {
      "fecha": "Navegador",
      "titulo": "Pulsa «Añadir Tomate rosa»",
      "texto": "El fetcher de la cesta envía la cesta entera con el cambio. Antes de que salga la petición, la lista y el resumen ya pintan el kilo nuevo, leyéndolo de fetcher.formData (paso 3)."
    },
    {
      "fecha": "Servidor",
      "titulo": "Llega POST /socio.data?index",
      "texto": "Con la cookie __sesion. El middleware de la zona la lee, comprueba la firma, busca a Pilar y deja socio y sesión en el context (paso 2)."
    },
    {
      "fecha": "Servidor",
      "titulo": "La action de la cesta",
      "texto": "Valida la cesta enviada contra el catálogo y la guarda en la sesión del context. No escribe ninguna cookie."
    },
    {
      "fecha": "Servidor",
      "titulo": "El middleware, a la vuelta",
      "texto": "La sesión ha cambiado: añade un Set-Cookie con la cesta nueva, firmada, y Cache-Control: private, no-store."
    },
    {
      "fecha": "Navegador",
      "titulo": "Revalidación",
      "texto": "React Router vuelve a pedir los datos de la zona, ya con la cookie nueva. Cuando llegan, el fetcher queda libre y la cesta pintada pasa a ser la del servidor: la misma, sin saltos."
    }
  ]
}
```

## Paso 1: iniciar sesión con una cookie firmada (`sesiones.server.ts`, `entrar.tsx` y `salir.tsx`)

La lección 102 de React guardaba la sesión en el servidor de la API y la SPA solo preguntaba «¿quién soy?». Aquí la página y el servidor son la misma app, y React Router trae lo necesario: un **almacén de sesiones** que lee la sesión de la cabecera `Cookie` de la petición y la escribe en la cabecera `Set-Cookie` de la respuesta. La lección 18 los repasó todos; la cooperativa usa el más sencillo, `createCookieSessionStorage`, con **la sesión entera dentro de la cookie**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createCookieSessionStorage, type Session, type SessionStorage } from 'react-router'\nimport type { Cesta } from './tipos'\nimport { secretosDeSesion } from './config.server'\n\n/** Lo que guarda la sesión entre una petición y otra. */\nexport type DatosSesion = {\n  socioId: string\n  cesta: Cesta\n}\n\n/** Los mensajes de un solo uso: se borran al leerlos. */\nexport type DatosFlash = {\n  aviso: string\n}\n\nexport type Sesion = Session<DatosSesion, DatosFlash>\n\n/** El almacén de sesiones: la sesión entera viaja en una cookie firmada. */\nexport function crearAlmacenDeSesiones(secretos: string[]): SessionStorage<DatosSesion, DatosFlash> {\n  return createCookieSessionStorage<DatosSesion, DatosFlash>({\n    cookie: {\n      name: '__sesion',\n      // El JavaScript de la página no puede leerla: un XSS no se la lleva.\n      httpOnly: true,\n      // No viaja en los POST que lleguen desde otras webs.\n      sameSite: 'lax',\n      // En producción, solo por HTTPS.\n      secure: process.env.NODE_ENV === 'production',\n      path: '/',\n      // Dos semanas.\n      maxAge: 60 * 60 * 24 * 14,\n      // Firmada: si alguien la cambia, la firma ya no cuadra y la sesión llega vacía.\n      secrets: secretos,\n    },\n  })\n}\n\n// El almacén se crea con la primera petición, no al importar el módulo: el\n// build también importa el servidor (para prerenderizar) y no tiene por qué\n// conocer el secreto.\nlet almacen: SessionStorage<DatosSesion, DatosFlash> | undefined\nfunction almacenDeSesiones() {\n  almacen ??= crearAlmacenDeSesiones(secretosDeSesion())\n  return almacen\n}\n\n/** La sesión de la petición, leída de su cabecera Cookie. Si no hay, o no es válida, una vacía. */\nexport function leerSesion(request: Request): Promise<Sesion> {\n  return almacenDeSesiones().getSession(request.headers.get('Cookie'))\n}\n\n/** La cabecera Set-Cookie que guarda la sesión en el navegador. */\nexport function guardarSesion(sesion: Sesion): Promise<string> {\n  return almacenDeSesiones().commitSession(sesion)\n}\n\n/** La cabecera Set-Cookie que borra la cookie. */\nexport function cerrarSesion(sesion: Sesion): Promise<string> {\n  return almacenDeSesiones().destroySession(sesion)\n}",
  "anotaciones": [
    {
      "fragmento": "createCookieSessionStorage<DatosSesion, DatosFlash>",
      "nota": "Dos tipos: lo que guarda la sesión de una petición a otra (el socio y su cesta) y los mensajes de un solo uso (el aviso del paso 4). session.get y session.set solo aceptan esas claves, con esos tipos."
    },
    {
      "fragmento": "httpOnly: true,",
      "nota": "El JavaScript de la página no puede leerla: document.cookie no la ve. Si un día se cuela un script ajeno (lección 82 de React), no se lleva la sesión."
    },
    {
      "fragmento": "sameSite: 'lax',",
      "nota": "El navegador no la manda en los POST que salen de otra web. Es la primera barrera contra la falsificación de peticiones (CSRF), y el paso 7 añade otra."
    },
    {
      "fragmento": "secure: process.env.NODE_ENV === 'production',",
      "nota": "En producción, solo viaja por HTTPS. En desarrollo no, porque http://localhost:5173 no es HTTPS."
    },
    {
      "fragmento": "secrets: secretos,",
      "nota": "Firmada con el primer secreto de la lista. Al leerla, se aceptan los que estén firmados con cualquiera: así se rotan (paso 10)."
    },
    {
      "fragmento": "almacen ??= crearAlmacenDeSesiones(secretosDeSesion())",
      "nota": "El almacén se crea con la primera petición, no al importar el módulo. El build también importa el servidor para prerenderizar (paso 6), y no tiene por qué conocer el secreto."
    },
    {
      "fragmento": "export function leerSesion(request: Request): Promise<Sesion> {",
      "nota": "Tres funciones con nombre en español alrededor de getSession, commitSession y destroySession. Si la cookie no existe o su firma no cuadra, getSession devuelve una sesión vacía, sin lanzar nada."
    }
  ]
}
```

La `action` de `/entrar` comprueba el correo y la contraseña con `comprobarCredenciales` (ya viene hecha, en `datos/socios.server.ts`) y, si valen, guarda el id del socio en la sesión:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function action({ request }: Route.ActionArgs) {\n  const formulario = await request.formData()\n  const correo = String(formulario.get('correo') ?? '')\n  const clave = String(formulario.get('clave') ?? '')\n  // El destino se vuelve a validar aquí: el campo oculto también se puede cambiar.\n  const volver = destinoSeguro(formulario.get('volver'), request)\n\n  const socio = await comprobarCredenciales(correo, clave)\n  if (!socio) {\n    // Un solo mensaje para los dos casos: no decimos si el correo existe.\n    return data({ error: 'El correo o la contraseña no son correctos.', correo }, { status: 400 })\n  }\n\n  const sesion = await leerSesion(request)\n  sesion.set('socioId', socio.id)\n  return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })\n}",
  "anotaciones": [
    {
      "fragmento": "const volver = destinoSeguro(formulario.get('volver'), request)",
      "nota": "Adónde volver después de entrar. Llega en un campo oculto que rellena el loader con ?volver= de la URL. Por qué hay que validarlo es el paso 7."
    },
    {
      "fragmento": "return data({ error: 'El correo o la contraseña no son correctos.', correo }, { status: 400 })",
      "nota": "Un solo mensaje para un correo que no existe y para una contraseña mala: si fueran distintos, el formulario diría qué correos son de socios. Devuelto con data y un 400, el formulario sigue en pantalla con el correo escrito."
    },
    {
      "fragmento": "sesion.set('socioId', socio.id)",
      "nota": "Solo el id, no el socio entero: el nombre o el rol pueden cambiar, y la cookie tiene que ser pequeña (unos 4 KB como mucho)."
    },
    {
      "fragmento": "return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })",
      "nota": "La cookie viaja en la redirección. Aquí sí hay que mandarla a mano: /entrar está fuera de la zona y no pasa por el middleware del paso 2."
    }
  ]
}
```

Prueba con `curl` contra el servidor de producción (`npm run build` y `SECRETO_SESION=algo npm start`), que es donde la cookie lleva `Secure`:

```text
$ curl -s -D - -o /dev/null -X POST http://localhost:3000/entrar \
    -H 'Origin: http://localhost:3000' -d 'correo=pilar@huertadelebro.example&clave=borraja2026'
HTTP/1.1 302 Found
location: /socio
set-cookie: __sesion=eyJzb2Npb0lkIjoiUy0wMTQyIn0%3D.7Ii5wp0nYpZ5i7IDWivRd5s60nkZAWP1oHhQbrOFs5U; Max-Age=1209600; Path=/; HttpOnly; Secure; SameSite=Lax
```

(La cabecera `Origin` es la que manda el navegador con cada formulario; el paso 7 explica por qué la pongo.) Con Playwright, en Chromium y en WebKit, la cookie quedó guardada con `httpOnly`, `secure` y `SameSite=Lax`, y `document.cookie` devolvió una cadena vacía.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// El valor de la cookie de Pilar, sin el %3D del final (que es un =):\n// eyJzb2Npb0lkIjoiUy0wMTQyIn0=.7Ii5wp0nYpZ5i7IDWivRd5s60nkZAWP1oHhQbrOFs5U\n//\n// En la consola de Node:\natob('eyJzb2Npb0lkIjoiUy0wMTQyIn0=')",
  "opciones": [
    "Nada legible: la cookie está cifrada con el secreto",
    "'{\"socioId\":\"S-0142\"}'",
    "Un error: sin el secreto no se puede decodificar",
    "El correo y la contraseña de Pilar"
  ],
  "correcta": 1,
  "explicacion": "Firmada no es cifrada. Lo de antes del punto es la sesión en JSON y en base64, que cualquiera lee; lo de después, la firma, que solo puede calcular quien tiene el secreto. Lo comprobamos con Node 24: sale el id de Pilar, y tras añadir dos productos, también la cesta. Por eso en la cookie no va nada que no pueda leer quien la tiene: ni contraseñas ni datos de otros."
}
```

**La firma no esconde nada, pero impide cambiarlo.** Si alguien decodifica su cookie, cambia `S-0142` por `S-0007` (el id de Javier, que coordina el reparto), vuelve a codificarla y deja la firma de antes, el servidor calcula la firma de lo que le llega, ve que no coincide y entrega una sesión vacía. Es el tercer test del paso, `una cookie cambiada a mano no vale`.

Cerrar sesión cambia algo, así que va en una `action`, nunca en un `loader`: con un `loader`, una imagen o un enlace de otra web podrían cerrarte la sesión con un simple GET. `salir.tsx` lee la sesión y responde con lo que devuelve `cerrarSesion`, una cookie vacía que caducó en 1970:

```text
HTTP/1.1 302 Found
location: /
set-cookie: __sesion=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Lo que una cookie de sesión no puede hacer",
  "contenido": "Con la sesión dentro de la cookie, el servidor no guarda nada: no puede invalidar una sesión concreta. Salir borra la cookie de tu navegador, pero si alguien la había copiado, le sigue valiendo hasta que caduque (dos semanas). Si eso importa, la sesión tiene que vivir en el servidor, con createSessionStorage y una base de datos, y la cookie solo lleva su id (lección 18). Para la cesta de la cooperativa, la cookie basta."
}
```

## Paso 2: un middleware que protege la zona (`middleware/socio.server.ts` y `zona.tsx`)

Cada página de la zona necesita al socio. Podrías leer la sesión en cada `loader` y en cada `action`, y redirigir en cada uno si no hay nadie; con cinco rutas, son cinco sitios donde olvidarlo. La lección 10 lo resolvió en el navegador con un middleware de cliente; aquí va **en el servidor**, que es donde está la cookie, y protege de una vez todo lo que cuelga de `/socio`, también la ruta de recursos del paso 5:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { href, redirect, type MiddlewareFunction } from 'react-router'\nimport { sesionContext, socioContext } from '~/contexto.server'\nimport { buscarSocio } from '~/datos/socios.server'\nimport { guardarSesion, leerSesion } from '~/sesiones.server'\n\n/**\n * Protege la zona de socios. Envuelve cada petición a una ruta de /socio, de\n * documento o de datos (.data), por fuera de sus loader y sus action:\n * - sin sesión, manda a /entrar y apunta en ?volver= adónde ibas;\n * - con sesión, deja al socio y su sesión en el context;\n * - a la vuelta, guarda la sesión si algo la ha cambiado y marca la respuesta\n *   como privada: lleva datos de una persona.\n */\nexport const exigirSocio: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {\n  const sesion = await leerSesion(request)\n  const socio = buscarSocio(sesion.get('socioId'))\n\n  if (!socio) {\n    // url es la dirección de la página; request.url, la petición tal cual,\n    // que al navegar acaba en .data.\n    const volver = url.pathname + url.search\n    throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`)\n  }\n\n  context.set(socioContext, socio)\n  context.set(sesionContext, sesion)\n  const antes = JSON.stringify(sesion.data)\n\n  const respuesta = await next()\n\n  // Los loader y las action solo cambian la sesión; la cookie se manda aquí,\n  // una vez y solo si ha cambiado algo.\n  if (JSON.stringify(sesion.data) !== antes) {\n    respuesta.headers.append('Set-Cookie', await guardarSesion(sesion))\n  }\n  respuesta.headers.set('Cache-Control', 'private, no-store')\n  return respuesta\n}",
  "anotaciones": [
    {
      "fragmento": "export const exigirSocio: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {",
      "nota": "Un middleware de servidor recibe lo mismo que un loader (request, url, params y context) y además next. MiddlewareFunction<Response> dice que next devuelve una Response: la de la página o la de los datos."
    },
    {
      "fragmento": "const socio = buscarSocio(sesion.get('socioId'))",
      "nota": "No basta con que la sesión tenga un id: el socio tiene que existir. Si mañana alguien se da de baja, su cookie deja de abrir la zona."
    },
    {
      "fragmento": "const volver = url.pathname + url.search",
      "nota": "url es la dirección de la página; request.url, la petición tal cual. Al navegar, el navegador pide /socio/pedido.data: con request.url, después de entrar volverías a una respuesta de datos."
    },
    {
      "fragmento": "throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`)",
      "nota": "Lanzado antes de next(): ningún loader ni ninguna action de la zona llega a ejecutarse. URLSearchParams codifica la barra y el interrogante de volver."
    },
    {
      "fragmento": "context.set(socioContext, socio)",
      "nota": "Deja al socio para los loader y las action de la zona, que lo leen con context.get(socioContext). Tipado: socioContext se creó con createContext<Socio>()."
    },
    {
      "fragmento": "const respuesta = await next()",
      "nota": "Aquí se ejecutan los loader o la action y, en una visita, se genera el HTML. next() no lanza: si algo falla por debajo, devuelve la respuesta del ErrorBoundary."
    },
    {
      "fragmento": "respuesta.headers.append('Set-Cookie', await guardarSesion(sesion))",
      "nota": "Los loader y las action solo cambian la sesión del context; la cookie se escribe aquí, una vez. Y solo si algo cambió: una petición que solo lee no reescribe la cookie, y no puede pisar la de otra que sí la cambió."
    },
    {
      "fragmento": "respuesta.headers.set('Cache-Control', 'private, no-store')",
      "nota": "Todo lo de la zona lleva datos de una persona: que no lo guarde ninguna caché, ni compartida ni del navegador (paso 6)."
    }
  ]
}
```

Las claves del context, en `contexto.server.ts`, ya vienen hechas:

```tsx
export const socioContext = createContext<Socio>()
export const sesionContext = createContext<Sesion>()
```

Sin valor por defecto, a propósito: si un `loader` lee una clave que nadie ha puesto, React Router lanza `No value found for context` en vez de devolver `undefined`. Es el error que viste al arrancar. En `zona.tsx`, el middleware se registra con una línea, y el `loader` lee lo que dejó:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Todas las rutas de /socio pasan por aquí: el middleware las protege a todas,\n// también a las que no tienen loader y a la ruta de recursos del CSV.\nexport const middleware: Route.MiddlewareFunction[] = [exigirSocio]\n\n// El loader hace además que el middleware se ejecute en cada navegación por la\n// zona: sin una petición al servidor, no habría nada que envolver.\nexport async function loader({ context }: Route.LoaderArgs) {\n  const socio = context.get(socioContext)\n  const sesion = context.get(sesionContext)\n  return {\n    socio: { nombre: socio.nombre, numero: socio.numero, rol: socio.rol },\n    cesta: sesion.get('cesta') ?? {},\n    productos: productosDeLaSemana(),\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "export const middleware: Route.MiddlewareFunction[] = [exigirSocio]",
      "nota": "Exportado desde zona.tsx, envuelve las peticiones de todas sus rutas hijas. Route.MiddlewareFunction sale de los tipos generados (lección 15)."
    },
    {
      "fragmento": "export async function loader({ context }: Route.LoaderArgs) {",
      "nota": "Este loader hace dos cosas. Da a la cabecera de la zona el nombre del socio y su cesta, y obliga a pasar por el servidor en cada navegación por la zona: el middleware de servidor solo se ejecuta si hay una petición que envolver."
    },
    {
      "fragmento": "const socio = context.get(socioContext)",
      "nota": "Socio, no Socio | undefined: si el código llega aquí, el middleware ya lo dejó."
    },
    {
      "fragmento": "socio: { nombre: socio.nombre, numero: socio.numero, rol: socio.rol },",
      "nota": "Lo que devuelve un loader acaba en el HTML y en las respuestas .data: solo lo que la página necesita. El correo del socio no sale."
    }
  ]
}
```

Así se comporta la zona, pedida con `curl` sin cookie: un documento recibe un 302, y una petición de datos, un 202 con la redirección dentro, que React Router sigue en el navegador.

```text
$ curl -s -D - -o /dev/null http://localhost:3000/socio | grep -iE '^HTTP|location'
HTTP/1.1 302 Found
location: /entrar?volver=%2Fsocio
$ curl -s http://localhost:3000/socio/pedido.data
[["SingleFetchRedirect",1],{"_2":3,"_4":5,"_6":7,"_8":7,"_9":7},"redirect","/entrar?volver=%2Fsocio%2Fpedido","status",302, …]
```

El `volver` del segundo es `/socio/pedido`, sin `.data`, gracias a `url`. En Chromium, abrir `/socio/pedido` sin sesión llevó a `/entrar?volver=%2Fsocio%2Fpedido`, y entrar devolvió a `/socio/pedido`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En exigirSocio, con request.url en vez de url:\nconst { pathname, search } = new URL(request.url)\nthrow redirect(`/entrar?${new URLSearchParams({ volver: pathname + search })}`)\n\n// Pilar está en el catálogo, sin sesión, y pulsa un enlace a /socio/pedido.\n// React Router pide /socio/pedido.data. Entra con su contraseña. ¿Dónde acaba?",
  "opciones": [
    "En /socio/pedido, como con url",
    "En /socio/pedido.data: una respuesta de datos, no una página",
    "En /entrar otra vez, en un bucle",
    "En /socio, porque destinoSeguro quita el .data"
  ],
  "correcta": 1,
  "explicacion": "request.url es la petición tal cual, y al navegar es la .data. Pedida como documento, /socio/pedido.data no es una página: con sesión, el servidor la respondió con un 200 y Content-Type text/x-script, los datos de la zona en el formato de React Router (lo comprobamos con curl). El test del paso, sin el .data, falla con esta versión."
}
```

## Paso 3: la cesta en la sesión, con respuesta optimista (`cesta.ts` y `routes/cesta.tsx`)

La cesta de esta semana no se guarda en ningún archivo: vive en la sesión, junto al id del socio, hasta que confirma el pedido. Cada botón «+» y «−» tiene que cambiarla **sin navegar** (un fetcher, lección 5) y **sin esperar al servidor** (la interfaz optimista de la lección 6, leída de `fetcher.formData`).

La lista ya viene hecha, en `componentes/ListaCesta.tsx`. Fíjate en cómo está montada, porque es lo que decide cómo se escribe la `action`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { totalDeCesta, useCestaOptimista } from '~/cesta'\nimport { formatearEuros } from '~/dinero'\nimport type { Cesta, Producto } from '~/tipos'\n\n/**\n * El catálogo con los botones para llenar la cesta. Es un solo formulario y un\n * solo fetcher para toda la lista: cada botón envía la cesta entera (un campo\n * oculto por producto) y su cambio. Si pulsas otro botón antes de que llegue\n * la respuesta, React Router cancela el envío anterior, y el nuevo ya lleva\n * los dos cambios. Sin JavaScript, es un formulario normal.\n */\nexport default function ListaCesta({ cesta, productos }: { cesta: Cesta; productos: Producto[] }) {\n  const { fetcher, cesta: optimista } = useCestaOptimista(cesta, productos)\n  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null\n\n  return (\n    <fetcher.Form method=\"post\" className=\"lista-cesta\">\n      <ul>\n        {productos.map((producto) => {\n          const cantidad = optimista[producto.id] ?? 0\n          return (\n            <li key={producto.id} className={cantidad > 0 ? 'fila-producto en-la-cesta' : 'fila-producto'}>\n              <input type=\"hidden\" name={`cantidad-${producto.id}`} value={cantidad} />\n              <div className=\"fila-datos\">\n                <h2>{producto.nombre}</h2>\n                <p>\n                  {producto.formato} · {formatearEuros(producto.precio)}\n                </p>\n              </div>\n              <div className=\"fila-botones\">\n                <button\n                  type=\"submit\"\n                  name=\"cambio\"\n                  value={`restar:${producto.id}`}\n                  aria-label={`Quitar ${producto.nombre}`}\n                  disabled={cantidad === 0}\n                >\n                  −\n                </button>\n                <output className=\"cantidad\" aria-label={`Cantidad de ${producto.nombre}`}>\n                  {cantidad}\n                </output>\n                <button\n                  type=\"submit\"\n                  name=\"cambio\"\n                  value={`sumar:${producto.id}`}\n                  aria-label={`Añadir ${producto.nombre}`}\n                  disabled={cantidad >= producto.maximo}\n                >\n                  +\n                </button>\n              </div>\n            </li>\n          )\n        })}\n      </ul>\n      {error && (\n        <p role=\"alert\" className=\"error\">\n          {error}\n        </p>\n      )}\n      <div className=\"cesta-pie\">\n        <p className=\"total\">Total: {formatearEuros(totalDeCesta(optimista, productos))}</p>\n        <button type=\"submit\" name=\"cambio\" value=\"vaciar\" className=\"enlace\" disabled={Object.keys(optimista).length === 0}>\n          Vaciar la cesta\n        </button>\n      </div>\n    </fetcher.Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { fetcher, cesta: optimista } = useCestaOptimista(cesta, productos)",
      "nota": "La cesta que se pinta no es la del loader: es la optimista, la que pide el envío en marcha si lo hay. La escribes tú, en cesta.ts."
    },
    {
      "fragmento": "<fetcher.Form method=\"post\" className=\"lista-cesta\">",
      "nota": "Un solo formulario y un solo fetcher para toda la lista. Sin action, envía a la ruta en la que está pintado, la índice de /socio, y React Router añade ?index a la dirección."
    },
    {
      "fragmento": "<input type=\"hidden\" name={`cantidad-${producto.id}`} value={cantidad} />",
      "nota": "Cada envío lleva la cesta entera: un campo oculto por producto, con la cantidad que se ve en ese momento, que ya incluye los cambios que todavía no han llegado al servidor."
    },
    {
      "fragmento": "value={`restar:${producto.id}`}",
      "nota": "Y el cambio que se pide, en el botón pulsado: name=\"cambio\" y un valor como restar:borraja. El navegador solo envía el name y el value del botón que se pulsa (el patrón intent de la lección 3)."
    },
    {
      "fragmento": "<output className=\"cantidad\" aria-label={`Cantidad de ${producto.nombre}`}>",
      "nota": "Un output tiene el rol status: cuando cambia, el lector de pantalla lo anuncia. Y los tests lo encuentran por su nombre."
    },
    {
      "fragmento": "const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null",
      "nota": "Si el servidor rechaza el envío, su mensaje, cuando el fetcher ya ha terminado."
    }
  ]
}
```

¿Por qué la cesta entera, y no solo «suma un kilo de tomate»? Por la cookie. Cada petición lleva la cookie que había al salir, y cada respuesta trae una nueva que **sustituye entera** a la anterior. Con un fetcher por producto, dos pulsaciones seguidas en productos distintos salen las dos con la misma cookie vieja; cada `action` añade lo suyo a esa cesta vieja, y la cookie que llega la última borra lo de la primera. Con la cesta entera en un solo fetcher, cada envío ya lleva todos los cambios, y React Router cancela el envío anterior cuando sale uno nuevo con el mismo fetcher (lección 5): gana el último, que es el más completo.

Lo que escribes en `cesta.ts` es lo que usan los dos lados: el servidor, para guardar, y el navegador, para pintar antes de que el servidor conteste.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function cestaDelFormulario(formulario: FormData, productos: Producto[]): Cesta | null {\n  const cesta: Cesta = {}\n  for (const producto of productos) {\n    const valor = formulario.get(`cantidad-${producto.id}`)\n    if (valor === null) continue\n    const cantidad = Number(valor)\n    if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > producto.maximo) return null\n    if (cantidad > 0) cesta[producto.id] = cantidad\n  }\n  const cambio = leerCambio(formulario.get('cambio'))\n  if (!cambio) return null\n  if (cambio.tipo !== 'vaciar' && !productos.some((p) => p.id === cambio.productoId)) return null\n  return aplicarCambio(cesta, cambio, productos)\n}\n\n/** Las líneas de la cesta, con el nombre y el precio de cada producto. */\nexport function lineasDeCesta(cesta: Cesta, productos: Producto[]): LineaPedido[] {\n  return productos\n    .filter((p) => (cesta[p.id] ?? 0) > 0)\n    .map((p) => ({ productoId: p.id, nombre: p.nombre, formato: p.formato, precio: p.precio, cantidad: cesta[p.id] }))\n}\n\nexport function totalDeCesta(cesta: Cesta, productos: Producto[]): number {\n  return lineasDeCesta(cesta, productos).reduce((suma, l) => suma + l.precio * l.cantidad, 0)\n}\n\nexport function unidadesDeCesta(cesta: Cesta): number {\n  return Object.values(cesta).reduce((suma, n) => suma + n, 0)\n}\n\n/**\n * La cesta que hay que pintar: la del servidor o, mientras se envía un cambio,\n * la que ese envío pide. Si el servidor lo rechaza, el fetcher vuelve a estar\n * libre, formData desaparece y se vuelve a pintar la del servidor, sola.\n */\nexport function useCestaOptimista(cesta: Cesta, productos: Producto[]) {\n  const fetcher = useFetcher<typeof action>({ key: FETCHER_CESTA })\n  const enviada = fetcher.formData ? cestaDelFormulario(fetcher.formData, productos) : null\n  return { fetcher, cesta: enviada ?? cesta }\n}",
  "anotaciones": [
    {
      "fragmento": "if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > producto.maximo) return null",
      "nota": "Lo que llega del formulario no es de fiar: cualquiera puede mandar cantidad-aceite=999 sin pasar por los botones. Fuera de rango, el envío entero no vale."
    },
    {
      "fragmento": "if (cambio.tipo !== 'vaciar' && !productos.some((p) => p.id === cambio.productoId)) return null",
      "nota": "Un cambio de un producto que no existe tampoco: 400, no un 200 que no hace nada."
    },
    {
      "fragmento": "return aplicarCambio(cesta, cambio, productos)",
      "nota": "aplicarCambio es pura: recibe una cesta y devuelve otra nueva, sin bajar de 0 ni pasar del máximo. Un producto que se queda a 0 desaparece de la cesta."
    },
    {
      "fragmento": "const fetcher = useFetcher<typeof action>({ key: FETCHER_CESTA })",
      "nota": "Con una key, cualquier componente que pida el fetcher cesta ve el mismo envío. El resumen de la cabecera de la zona («Tu cesta: 5 productos · 14,40 €») usa este hook, y cambia a la vez que la lista."
    },
    {
      "fragmento": "const enviada = fetcher.formData ? cestaDelFormulario(fetcher.formData, productos) : null",
      "nota": "Mientras haya un envío en marcha, fetcher.formData es lo que se envió, y la cesta que pide se calcula con la misma función que usará el servidor."
    },
    {
      "fragmento": "return { fetcher, cesta: enviada ?? cesta }",
      "nota": "Sin envío, la del loader. Si el servidor rechaza el cambio, el fetcher termina, formData desaparece y vuelve sola la cesta de antes, sin escribir ningún deshacer."
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function action({ request, context }: Route.ActionArgs) {\n  const cesta = cestaDelFormulario(await request.formData(), productosDeLaSemana())\n  if (!cesta) {\n    return data({ ok: false as const, error: 'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }, { status: 400 })\n  }\n  context.get(sesionContext).set('cesta', cesta)\n  return { ok: true as const }\n}",
  "anotaciones": [
    {
      "fragmento": "const cesta = cestaDelFormulario(await request.formData(), productosDeLaSemana())",
      "nota": "La misma función que en el navegador, ahora contra el catálogo del servidor: lo que valga aquí es lo que se guarda."
    },
    {
      "fragmento": "return data({ ok: false as const, error: 'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }, { status: 400 })",
      "nota": "Un 400: tras una respuesta de error, React Router no revalida, y la cesta de la sesión no se ha tocado."
    },
    {
      "fragmento": "context.get(sesionContext).set('cesta', cesta)",
      "nota": "Solo cambia la sesión del context. La cookie la escribe el middleware al volver de next(), porque ve que la sesión ha cambiado."
    }
  ]
}
```

Esto es lo que pidió Chromium al pulsar «Añadir Borraja» dos veces y «Añadir Tomate rosa» una, con 150 ms entre pulsaciones y una red que retrasaba cada POST 900 ms (WebKit pidió lo mismo, con `cancelled` en lugar de `net::ERR_ABORTED`):

```text
POST /socio.data?index   net::ERR_ABORTED   la primera, cancelada por la segunda
POST /socio.data?index   net::ERR_ABORTED   la segunda, cancelada por la tercera
POST /socio.data?index                      la tercera: borraja 2, tomate 1
GET  /socio.data                            la revalidación
```

Justo después de pulsar, antes de que contestara nada, la lista ya decía 2 y 1, y el resumen, «Tu cesta: 3 productos · 8,70 €». Tras recargar la página, la cesta seguía igual: la sesión había guardado los dos productos.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Otra forma de hacerlo: un fetcher por producto, que envía solo su cantidad.\nfunction Fila({ producto, cantidad }: { producto: Producto; cantidad: number }) {\n  const fetcher = useFetcher({ key: `cesta-${producto.id}` })\n  return (\n    <fetcher.Form method=\"post\">\n      <input type=\"hidden\" name=\"producto\" value={producto.id} />\n      <button name=\"cantidad\" value={cantidad + 1}>+</button>\n    </fetcher.Form>\n  )\n}\n// Y la action: lee la cesta de la sesión, cambia ese producto y la guarda.\n\n// El servidor tarda 900 ms en cada action. Con la cesta vacía, Pilar pulsa\n// «+» en Borraja y, 200 ms después, «+» en Tomate rosa. ¿Qué cesta queda?",
  "opciones": [
    "Borraja 1 y tomate 1: cada fetcher manda lo suyo",
    "Solo tomate 1: la segunda cookie pisa a la primera",
    "Solo borraja 1: React Router cancela el segundo envío",
    "Las dos, pero el resumen tarda en ponerse al día"
  ],
  "correcta": 1,
  "explicacion": "Las dos peticiones salieron con la cookie de la cesta vacía; cada action guardó su producto en esa cesta vacía, y la cookie de la respuesta que llegó la última sustituyó a la otra. Lo comprobamos en Chromium con esta versión y un servidor de 900 ms: al pulsar se veían los dos, al terminar quedó «1 producto · 3,90 €». Con la del proyecto, en las mismas condiciones, quedaron los dos. Con la cesta en una base de datos, un fetcher por fila sería lo normal."
}
```

## Paso 4: el pedido, validado con Zod (`validacion/pedido.ts`, `pedido.tsx` y `pedidos.tsx`)

Para confirmar el pedido, el socio elige punto de recogida y día, y deja un teléfono por si falta algo. La lección 61 de React escribió estas reglas con Zod y dejó la validación en el servidor para más adelante. Este es el más adelante:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { z } from 'zod'\n\n// Las reglas del formulario del pedido, como un esquema de Zod (lección 61 de\n// React). Los mensajes van escritos en cada regla: los de Zod por defecto\n// están en inglés y no le dicen nada a quien rellena el pedido.\n\nexport const PedidoFormulario = z.object({\n  punto: z.enum(['casco', 'actur', 'torrero'], 'Elige dónde recogerás la cesta.'),\n  dia: z.enum(['jueves', 'viernes'], 'Elige qué día la recogerás.'),\n  telefono: z\n    .string('Escribe un teléfono para avisarte.')\n    .trim()\n    .regex(/^[6789]\\d{8}$/, 'Escribe un teléfono de nueve cifras, sin espacios: 612345678.'),\n  comentario: z\n    .string()\n    .trim()\n    .max(200, 'El comentario puede tener como mucho 200 caracteres.')\n    .default(''),\n})\n\nexport type DatosPedido = z.infer<typeof PedidoFormulario>\nexport type CampoPedido = keyof DatosPedido\n\n/** El pedido mínimo, en céntimos: la furgoneta reparte por barrios. */\nexport const PEDIDO_MINIMO = 1000",
  "anotaciones": [
    {
      "fragmento": "punto: z.enum(['casco', 'actur', 'torrero'], 'Elige dónde recogerás la cesta.'),",
      "nota": "Solo tres valores posibles. Un formulario manipulado que mande punto=zaragoza no pasa, y el segundo argumento es el mensaje, en español, para cuando falta o no es ninguno de los tres."
    },
    {
      "fragmento": ".regex(/^[6789]\\d{8}$/, 'Escribe un teléfono de nueve cifras, sin espacios: 612345678.'),",
      "nota": "Nueve cifras que empiezan por 6, 7, 8 o 9. Antes, trim quita los espacios de los lados (no los de en medio: «654 21 09 87» no pasa, y el mensaje lo dice)."
    },
    {
      "fragmento": ".default(''),",
      "nota": "Si el comentario no llega, vale cadena vacía. Sin default, un formulario sin ese campo daría el error genérico de Zod, en inglés."
    },
    {
      "fragmento": "export type DatosPedido = z.infer<typeof PedidoFormulario>",
      "nota": "El tipo de los datos ya validados sale del esquema: punto es casco, actur o torrero, no un string cualquiera, y encaja con lo que espera guardarPedido."
    }
  ]
}
```

La `action` valida el formulario y, además, la cesta, que **no viaja en el formulario**: está en la sesión, y es la que vale.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function action({ request, context }: Route.ActionArgs) {\n  const socio = context.get(socioContext)\n  const sesion = context.get(sesionContext)\n  const formulario = await request.formData()\n  const token = String(formulario.get('token') ?? '')\n\n  // Este formulario ya creó un pedido (otra pestaña, un doble clic, un\n  // formulario viejo): a tus pedidos, sin guardar otro y sin tocar la sesión.\n  // La cesta que haya ahora puede ser la de otra compra, y no es suya.\n  if (await pedidoConToken(socio.id, token)) return redirect(href('/socio/pedidos'))\n\n  // Lo que se escribió, para volver a pintar el formulario si hay errores.\n  const valores = {\n    punto: String(formulario.get('punto') ?? ''),\n    dia: String(formulario.get('dia') ?? ''),\n    telefono: String(formulario.get('telefono') ?? ''),\n    comentario: String(formulario.get('comentario') ?? ''),\n  }\n  const resultado = PedidoFormulario.safeParse(Object.fromEntries(formulario))\n\n  // La cesta no viaja en el formulario: está en la sesión, y es la que vale.\n  const productos = productosDeLaSemana()\n  const cesta = sesion.get('cesta') ?? {}\n  const problema = problemaDeLaCesta(totalDeCesta(cesta, productos))\n\n  if (!resultado.success || problema) {\n    const errores: Partial<Record<keyof typeof valores | 'cesta', string[]>> = resultado.success\n      ? {}\n      : z.flattenError(resultado.error).fieldErrors\n    if (problema) errores.cesta = [problema]\n    // 400: los datos no valen. Devuelto, no lanzado: el formulario sigue en\n    // pantalla con sus errores.\n    return data({ errores, valores }, { status: 400 })\n  }\n\n  // Con el token del formulario: si dos envíos con el mismo llegan a la vez,\n  // guardarPedido devuelve al segundo el pedido del primero; si el token no es\n  // el de la compra en curso, null.\n  const guardado = await guardarPedido({ socioId: socio.id, ...resultado.data, lineas: lineasDeCesta(cesta, productos), token })\n  if (!guardado) {\n    const errores = { cesta: ['Este formulario ya no vale. Recarga la página y vuelve a confirmar.'] }\n    return data({ errores, valores }, { status: 400 })\n  }\n\n  // Solo quien acaba de crear el pedido vacía la cesta y deja el aviso, que\n  // dura hasta que alguien lo lee. Un envío repetido que llegó a la vez, no.\n  const { pedido, nuevo } = guardado\n  if (nuevo) {\n    sesion.unset('cesta')\n    sesion.flash('aviso', `Pedido ${pedido.id} confirmado: recógelo el ${DIAS[pedido.dia]} en ${PUNTOS[pedido.punto]}.`)\n  }\n  // POST, redirección y GET: si recargas la página de destino, no se pide dos veces.\n  return redirect(href('/socio/pedidos'))\n}",
  "anotaciones": [
    {
      "fragmento": "if (await pedidoConToken(socio.id, token)) return redirect(href('/socio/pedidos'))",
      "nota": "Lo primero, el token de la compra en curso, que lleva el formulario en un campo oculto. Si ese formulario ya creó un pedido (otra pestaña, un doble clic, un formulario viejo), a tus pedidos, sin guardar otro y sin tocar la sesión: la cesta que haya ahora puede ser de otra compra."
    },
    {
      "fragmento": "const resultado = PedidoFormulario.safeParse(Object.fromEntries(formulario))",
      "nota": "safeParse no lanza: devuelve success y los datos limpios, o el error. Un dato mal escrito no es una excepción (lección 61)."
    },
    {
      "fragmento": "const cesta = sesion.get('cesta') ?? {}",
      "nota": "La cesta sale de la sesión, no de un campo oculto: así nadie confirma un pedido con un precio o una cantidad inventados."
    },
    {
      "fragmento": "z.flattenError(resultado.error).fieldErrors",
      "nota": "Los errores de Zod, como el formulario los necesita: un array de mensajes por campo, por ejemplo telefono: [mensaje]."
    },
    {
      "fragmento": "return data({ errores, valores }, { status: 400 })",
      "nota": "Devuelto, no lanzado, con un 400: el formulario sigue en pantalla con sus errores y lo escrito, y React Router no revalida nada, porque no ha cambiado nada."
    },
    {
      "fragmento": "const guardado = await guardarPedido({ socioId: socio.id, ...resultado.data, lineas: lineasDeCesta(cesta, productos), token })",
      "nota": "guardarPedido comprueba el token dentro de la cola que ya ordena los guardados. Con un token que no es el de la compra en curso, null, y un 400. Si dos envíos con el mismo llegan a la vez, al segundo le devuelve el pedido del primero con nuevo: false."
    },
    {
      "fragmento": "if (nuevo) {",
      "nota": "Solo quien acaba de crear el pedido vacía la cesta (unset) y deja el aviso flash, que dura hasta que alguien lo lee. Un envío repetido no toca la sesión."
    },
    {
      "fragmento": "return redirect(href('/socio/pedidos'))",
      "nota": "POST, redirección y GET: si recargas la página de tus pedidos, el navegador repite el GET, no el pedido. La cookie, con la cesta vacía y el aviso, la añade el middleware a esta redirección."
    }
  ]
}
```

Confirmar un pedido no se puede repetir sin más: dos pestañas, o un doble clic, guardarían dos pedidos. Por eso el formulario lleva **el token de la compra en curso**, que **guarda el servidor, no la cookie**. El `loader` de `pedido.tsx` lo pide a `tokenPendiente`, que devuelve el que ya tiene el socio o crea uno, y `guardarPedido` lo gasta; las dos cosas pasan por la cola que ordena los guardados. En la cookie no serviría: dos pestañas que cargan a la vez parten de la misma cookie sin token, cada una se inventaría el suyo y las dos podrían guardar su pedido. Y **un envío repetido no toca la sesión**: un formulario viejo, reenviado cuando ya hay otra cesta a medias, lleva a tus pedidos sin vaciar esa cesta. Lo probamos contra el servidor de producción, con dos `GET` y dos `POST` simultáneos desde la misma cookie (los dos `POST` respondieron 302 y quedó un solo pedido), y en Chromium con dos pestañas: las dos acabaron en «Tus pedidos», con un solo pedido nuevo y el aviso solo en la que lo creó.

Una última cosa de la capa de datos: el archivo de los pedidos se escribe en uno temporal de la misma carpeta, que después se renombra. Escrito en el sitio, una lectura que llegara a mitad lo encontraba cortado, y `JSON.parse` fallaba con `SyntaxError: Unexpected end of JSON input`: un test que lee mientras se crean 25 pedidos lo pilló en 5 de 5 ejecuciones.

En `pedidos.tsx`, el `loader` lee el aviso. **Leer un valor flash lo borra de la sesión**, y por eso hay que volver a guardarla; aquí lo hace el middleware, que ve que la sesión ha cambiado:

```tsx
export async function loader({ context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  const sesion = context.get(sesionContext)
  return {
    aviso: sesion.get('aviso') ?? null,
    pedidos: await pedidosDeSocio(socio.id),
  }
}
```

El aviso se pinta en un `<p role="status">` que está siempre en la página, para que el lector de pantalla lo anuncie al llegar. En Chromium y en WebKit, con un teléfono de cinco cifras el formulario volvió con «Escribe un teléfono de nueve cifras, sin espacios: 612345678.» y el foco en el teléfono; corregido, la página pasó a `/socio/pedidos` con este aviso:

```text
Pedido P-44-0005 confirmado: recógelo el jueves 29, de 18:00 a 20:30 en Actur, en el centro cívico.
```

Al recargar, el aviso ya no estaba, y el resumen de la cesta decía «vacía». Con JavaScript desactivado, el mismo recorrido (entrar, llenar la cesta y confirmar) funcionó igual, con recargas de página: los formularios son formularios de verdad.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Las tres respuestas de una action, en este proyecto",
  "items": [
    {
      "titulo": "Datos con un 400",
      "texto": "Los datos no valen (un teléfono mal escrito, una cesta manipulada). El formulario sigue en pantalla con sus errores. No se revalida nada."
    },
    {
      "titulo": "Una redirección",
      "texto": "Todo ha ido bien y hay que ir a otra página: entrar, salir, confirmar el pedido. La cookie nueva viaja en la propia redirección, y React Router carga los datos de la página de destino."
    },
    {
      "titulo": "Datos con un 200",
      "texto": "Todo ha ido bien y te quedas donde estabas: la cesta. Tras un 200, React Router revalida los datos de la página, y la cesta del loader se pone al día."
    }
  ]
}
```

## Paso 5: la hoja de reparto, una ruta de recursos (`csv.ts` y `reparto-csv.ts`)

El jueves por la tarde, Javier, que coordina el reparto, carga la furgoneta con una hoja: qué lleva cada pedido, de quién es, en qué punto se recoge y un teléfono por si falta algo. La quiere en una hoja de cálculo. Eso no es una página, es un archivo: una **ruta de recursos** (lección 19), un módulo con `loader` y **sin componente**, cuya respuesta es lo que devuelve el `loader`, tal cual.

Primero, el CSV. Que se abra bien en el Excel o el LibreOffice de una cooperativa española tiene sus detalles:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Un CSV que Excel y LibreOffice abren bien en español:\n// - punto y coma entre columnas, porque la coma es el separador decimal;\n// - una marca BOM al principio, para que lean las tildes como UTF-8;\n// - saltos de línea \\r\\n, como pide el RFC 4180.\n\nconst SEPARADOR = ';'\n\n/** Una celda, lista para ir entre punto y coma. */\nexport function celdaCsv(valor: string | number): string {\n  let texto = String(valor)\n  // Inyección de fórmulas: una hoja de cálculo ejecuta como fórmula cualquier\n  // celda que empiece por = + - o @. Con un apóstrofo delante, es texto.\n  if (/^[=+\\-@\\t\\r]/.test(texto)) texto = `'${texto}`\n  // Si lleva el separador, comillas o un salto de línea, va entre comillas, y\n  // las comillas de dentro se escriben dos veces.\n  if (/[;\"\\r\\n]/.test(texto)) texto = `\"${texto.replaceAll('\"', '\"\"')}\"`\n  return texto\n}\n\n/** Un CSV entero: la primera fila es la de los títulos. */\nexport function aCsv(filas: (string | number)[][]): string {\n  return '\\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\\r\\n') + '\\r\\n'\n}",
  "anotaciones": [
    {
      "fragmento": "const SEPARADOR = ';'",
      "nota": "Punto y coma, no coma: con la configuración en español, la coma es el separador decimal, y Excel separa las columnas por punto y coma."
    },
    {
      "fragmento": "if (/^[=+\\-@\\t\\r]/.test(texto)) texto = `'${texto}`",
      "nota": "Inyección de fórmulas: una hoja de cálculo trata como fórmula cualquier celda que empiece por = + - o @. Con un apóstrofo delante, es texto. OWASP lo llama CSV Injection."
    },
    {
      "fragmento": "if (/[;\"\\r\\n]/.test(texto)) texto = `\"${texto.replaceAll('\"', '\"\"')}\"`",
      "nota": "Una celda con punto y coma, comillas o un salto de línea va entre comillas, y sus comillas se escriben dos veces. Si no, un comentario como «Llegaré tarde; hacia las 12:30» se partiría en dos columnas."
    },
    {
      "fragmento": "return '\\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\\r\\n') + '\\r\\n'",
      "nota": "La marca BOM al principio le dice a Excel que el archivo está en UTF-8: sin ella, «Melocotón» sale con caracteres raros. Y las filas terminan en \\r\\n, como pide el RFC 4180."
    }
  ]
}
```

El comentario de Carmen Aznar en su pedido es «+1 docena de huevos si sobran». Sin el apóstrofo, Excel intentaría calcularlo como una fórmula y enseñaría un error en la celda. Si en vez de Carmen fuera alguien con malas intenciones, la fórmula podría ser otra, en un archivo que Javier abre en su ordenador. Ahora el `loader`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Una ruta de recursos: exporta un loader y ningún componente, así que lo que\n// devuelve el loader es la respuesta entera. Cuelga de /socio, de modo que el\n// middleware de la zona ya ha comprobado la sesión.\nexport async function loader({ context }: Route.LoaderArgs) {\n  const socio = context.get(socioContext)\n  // Tener sesión no basta: la hoja lleva nombres y teléfonos de todos.\n  if (socio.rol !== 'reparto') {\n    return new Response('Solo la coordinación de reparto puede descargar la hoja.', {\n      status: 403,\n      headers: { 'Content-Type': 'text/plain; charset=utf-8' },\n    })\n  }\n\n  const pedidos = (await pedidosDeLaSemana(SEMANA.numero)).sort(\n    (a, b) =>\n      ORDEN_DE_REPARTO.indexOf(a.punto) - ORDEN_DE_REPARTO.indexOf(b.punto) ||\n      a.dia.localeCompare(b.dia) ||\n      a.id.localeCompare(b.id),\n  )\n\n  const filas: (string | number)[][] = [\n    ['Punto de recogida', 'Día', 'Pedido', 'Socio', 'Teléfono', 'Producto', 'Formato', 'Cantidad', 'Comentario'],\n  ]\n  for (const pedido of pedidos) {\n    const nombre = buscarSocio(pedido.socioId)?.nombre ?? pedido.socioId\n    for (const linea of pedido.lineas) {\n      filas.push([\n        PUNTOS[pedido.punto],\n        DIAS[pedido.dia],\n        pedido.id,\n        nombre,\n        pedido.telefono,\n        linea.nombre,\n        linea.formato,\n        linea.cantidad,\n        pedido.comentario,\n      ])\n    }\n  }\n\n  return new Response(aCsv(filas), {\n    headers: {\n      'Content-Type': 'text/csv; charset=utf-8',\n      // attachment: el navegador lo descarga con este nombre en vez de enseñarlo.\n      'Content-Disposition': `attachment; filename=\"hoja-de-reparto-semana-${SEMANA.numero}.csv\"`,",
  "anotaciones": [
    {
      "fragmento": "Cuelga de /socio, de modo que el",
      "nota": "Por estar dentro de la zona, el middleware del paso 2 ya ha comprobado la sesión, aunque el módulo no tenga componente."
    },
    {
      "fragmento": "if (socio.rol !== 'reparto') {",
      "nota": "Autenticar no es autorizar: tener sesión dice quién eres, no qué puedes ver. La hoja lleva los nombres y los teléfonos de todos, así que solo la descarga la coordinación."
    },
    {
      "fragmento": "status: 403,",
      "nota": "Un 403: te conocemos, pero esto no es para ti. Una ruta de recursos devuelve una Response, y React Router la manda tal cual, sin ErrorBoundary."
    },
    {
      "fragmento": "ORDEN_DE_REPARTO.indexOf(a.punto) - ORDEN_DE_REPARTO.indexOf(b.punto) ||",
      "nota": "Ordenada como pasa la furgoneta: Casco Histórico, Actur y Torrero; dentro de cada punto, por día y por número de pedido."
    },
    {
      "fragmento": "'Content-Type': 'text/csv; charset=utf-8',",
      "nota": "El tipo del archivo. Con un charset explícito, el navegador no adivina la codificación."
    },
    {
      "fragmento": "attachment; filename=",
      "nota": "attachment: el navegador lo descarga con ese nombre en vez de enseñarlo."
    }
  ]
}
```

En la zona, el enlace solo sale si el rol es `reparto`, y lleva `reloadDocument`. Sin él, React Router intentaría navegar a la hoja como a una página más, pidiendo sus datos; la documentación de las rutas de recursos lo advierte: a una ruta de recursos se llega con un `<a>` o con `<Link reloadDocument>`.

```tsx
{socio.rol === 'reparto' && (
  <Link reloadDocument to={href('/socio/reparto.csv')}>
    Hoja de reparto (CSV)
  </Link>
)}
```

Que el enlace no salga no protege nada: Pilar puede escribir la dirección. Por eso la comprobación está en el `loader`. Con la cookie de Pilar y con la de Javier:

```text
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: $COOKIE_DE_PILAR" http://localhost:3000/socio/reparto.csv
403
$ curl -s -D - -H "Cookie: $COOKIE_DE_JAVIER" http://localhost:3000/socio/reparto.csv
HTTP/1.1 200 OK
cache-control: private, no-store
content-disposition: attachment; filename="hoja-de-reparto-semana-44.csv"
content-type: text/csv; charset=utf-8

Punto de recogida;Día;Pedido;Socio;Teléfono;Producto;Formato;Cantidad;Comentario
Casco Histórico, en el local de la cooperativa;jueves 29, de 18:00 a 20:30;P-44-0004;Javier Gimeno;600123456;Acelga;manojo;1;Abro yo el local.
…
Torrero, en la asociación vecinal;jueves 29, de 18:00 a 20:30;P-44-0003;Carmen Aznar;688778899;Melocotón de Calanda;kilo;2;'+1 docena de huevos si sobran
```

El `Cache-Control: private, no-store` lo puso el middleware de la zona, también a la respuesta de una ruta de recursos. Con Playwright, el enlace de Javier descargó `hoja-de-reparto-semana-44.csv` sin cambiar de página. Un detalle para tus tests: `respuesta.text()` se come la marca BOM al decodificar; el test del paso la lee con `new TextDecoder('utf-8', { ignoreBOM: true })`.

## Paso 6: páginas prerenderizadas y caché en el catálogo (`react-router.config.ts` y `catalogo.tsx`)

La lección 17 repasó las estrategias de renderizado y cómo se mezclan **por ruta**. La cooperativa usa tres:

- **La portada y «Cómo funciona» no cambian** de una semana a otra ni dependen de quién las pide: se generan una vez, al construir.
- **El catálogo cambia cada lunes**, pero es igual para todo el mundo: se genera en el servidor y se deja guardar en una caché.
- **La zona de socios es distinta para cada socio**: se genera en cada petición y no se guarda en ninguna parte.

Prerenderizar es una línea en la configuración:

```tsx
export default {
  ssr: true,
  prerender: ['/', '/como-funciona'],
} satisfies Config
```

Y `npm run build` lo dice al terminar:

```text
Prerender (html): / -> build/client/index.html
Prerender (html): /como-funciona -> build/client/como-funciona/index.html
```

No sale ningún `.data` porque ninguna de las dos rutas tiene `loader`. **Esto solo funciona porque `root.tsx` no lee la sesión.** Si la cabecera dijera «Hola, Pilar», la portada se generaría una vez, al construir, sin nadie, y la vería así todo el mundo. Por eso lo que depende del socio vive en `zona.tsx`, y la cabecera pública tiene un enlace a «Zona de socios» igual para todos.

Para el catálogo, una función `headers` en su módulo de ruta:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// La página es la misma para todo el mundo: puede guardarla el navegador\n// (max-age, 5 minutos) y una caché compartida, como la de un CDN (s-maxage,\n// 1 hora). Nunca en una página que lleve datos de alguien.\nexport function headers(_: Route.HeadersArgs) {\n  return { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }\n}",
  "anotaciones": [
    {
      "fragmento": "return { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }",
      "nota": "public: cualquier caché puede guardarla. max-age, para el navegador: 5 minutos. s-maxage, para las cachés compartidas, como la de un CDN: 1 hora."
    },
    {
      "fragmento": "Nunca en una página que lleve datos de alguien.",
      "nota": "Una caché compartida guarda una respuesta y se la da al siguiente que la pida. Con la cesta de Pilar dentro, el siguiente vería la cesta de Pilar. Por eso la zona lleva private, no-store."
    }
  ]
}
```

Así salen las respuestas del servidor de producción:

```text
$ curl -s -D - -o /dev/null http://localhost:3000/catalogo | grep -i cache-control
cache-control: public, max-age=300, s-maxage=3600
$ curl -s -D - -o /dev/null http://localhost:3000/catalogo.data | grep -i cache-control
cache-control: public, max-age=300, s-maxage=3600
$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_PILAR" http://localhost:3000/socio | grep -i cache-control
cache-control: private, no-store
$ curl -s -D - -o /dev/null http://localhost:3000/ | grep -iE 'cache-control|etag'
Cache-Control: public, max-age=0
ETag: W/"1971-1a17a1a1b4d"
```

La función `headers` vale también para la petición `.data` del catálogo, la que hace el navegador al navegar hasta él. Y la portada ya no la sirve React Router: es un archivo de `build/client`, y `react-router-serve` lo sirve con su servidor de archivos estáticos (Express), con sus propias cabeceras.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// react-router.config.ts\nprerender: ['/', '/como-funciona'],\n\n// npm run build && npm start (react-router-serve)\n// $ curl -s -D - -o /dev/null http://localhost:3000/como-funciona\n// ¿Qué responde?",
  "opciones": [
    "HTTP/1.1 200 OK, con el HTML prerenderizado",
    "HTTP/1.1 301 Moved Permanently, con Location: /como-funciona/",
    "HTTP/1.1 200 OK, pero renderizado en el momento: prerender solo vale con ssr: false",
    "HTTP/1.1 404 Not Found: la página está en build/client, no en el servidor"
  ],
  "correcta": 1,
  "explicacion": "El prerenderizado escribe build/client/como-funciona/index.html, una carpeta con su index. react-router-serve sirve build/client con el servidor de archivos de Express, que al pedir una carpeta sin barra final redirige a la misma dirección con barra. Lo comprobamos con curl, y en Chromium y WebKit: la página acaba en /como-funciona/, se hidrata sin errores y los enlaces siguen funcionando. Con otro servidor de archivos, o un CDN, puede ser distinto."
}
```

## Paso 7: `?volver=` validado y `allowedActionOrigins` (`seguridad.ts` y `react-router.config.ts`)

Dos agujeros que la lección 20 contó con sus avisos de seguridad. Los dos tienen que ver con **de dónde viene una petición y adónde te manda**.

### Una redirección abierta en `?volver=`

El middleware del paso 2 apunta en `?volver=` adónde ibas, y `/entrar` te lleva allí después. Pero `?volver=` está en la URL, y cualquiera puede fabricar un enlace. Imagina un correo con un enlace a `https://pedidos.huertadelebro.es/entrar?volver=https://huerta-del-ebro.example/pago`: la página de entrar es la de verdad, la socia escribe su contraseña en la web de verdad, y justo después la cooperativa la manda, recién identificada, a otra web que se le parece y le pide «confirmar la tarjeta». Es una **redirección abierta**. La versión de `inicio/` solo mira que empiece por barra, y no basta:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { href } from 'react-router'\n\n/**\n * Adónde llevar a alguien después de entrar. ?volver= llega en la URL, así\n * que cualquiera puede fabricar un enlace a /entrar?volver=https://otra-web:\n * sin comprobarlo, la cooperativa mandaría a sus socios, recién identificados,\n * a una web ajena (una redirección abierta). Se interpreta la dirección como\n * lo haría el navegador y solo se acepta si se queda en nuestro origen y su\n * ruta, ya normalizada, no empieza por //.\n */\nexport function destinoSeguro(volver: FormDataEntryValue | null, request: Request): string {\n  const porDefecto = href('/socio')\n  if (typeof volver !== 'string' || volver === '') return porDefecto\n\n  const origen = new URL(request.url).origin\n  let destino: URL\n  try {\n    destino = new URL(volver, origen)\n  } catch {\n    return porDefecto\n  }\n  // //otra-web.example y /\\otra-web.example empiezan por una barra, pero el\n  // navegador las lee como otro dominio: por eso no basta con startsWith('/').\n  if (destino.origin !== origen) return porDefecto\n  // Y el origen tampoco basta: new URL normaliza la ruta, y /.//otra-web.example,\n  // que es de nuestro origen, queda en //otra-web.example. En Location, el\n  // navegador también la lee como otro dominio.\n  const ruta = destino.pathname + destino.search + destino.hash\n  return ruta.startsWith('//') ? porDefecto : ruta\n}",
  "anotaciones": [
    {
      "fragmento": "const porDefecto = href('/socio')",
      "nota": "Ante la duda, a la zona de socios. href comprueba en el typecheck que /socio existe (paso 8)."
    },
    {
      "fragmento": "const origen = new URL(request.url).origin",
      "nota": "En el servidor no hay window.location, como en el destinoSeguro de la lección 102 de React: el origen de referencia es el de la propia petición."
    },
    {
      "fragmento": "destino = new URL(volver, origen)",
      "nota": "La dirección se interpreta como lo haría el navegador. new URL entiende //otra-web.example como otro dominio, y /\\otra-web.example también: el navegador trata la barra invertida como una barra normal."
    },
    {
      "fragmento": "if (destino.origin !== origen) return porDefecto",
      "nota": "Primera condición: que el destino se quede en nuestro origen. javascript:alert(1) tiene otro origen, y tampoco pasa."
    },
    {
      "fragmento": "const ruta = destino.pathname + destino.search + destino.hash",
      "nota": "Se devuelve la dirección que ha interpretado new URL, no el texto que llegó: lo que se usa es lo que se ha comprobado."
    },
    {
      "fragmento": "return ruta.startsWith('//') ? porDefecto : ruta",
      "nota": "Segunda condición, sobre la ruta ya normalizada. new URL resuelve los segmentos . y .., así que /.//malo.example tiene nuestro origen, pero su ruta queda en //malo.example, y como Location el navegador la lee como otro dominio. El origen solo no basta."
    }
  ]
}
```

La `action` de `/entrar` lo aplica al campo oculto, y el `loader` a `?volver=`: los dos vienen de fuera. Los tests del paso prueban diez ataques. Con `startsWith('/')` solo se paran dos, `https://malo.example/socio` y `javascript:alert(1)`. Si compruebas el origen pero no la ruta, se cuelan los cinco que la normalización convierte en `//malo.example`: `/.//malo.example`, `/a/..//malo.example`, `/%2e//malo.example`, `/..//malo.example/socio` y `/%2e%2e//malo.example`. La lección 20 lo trata a fondo.

Pruébalo aquí, en la vista previa, con el router en memoria. Es el `/entrar` de la cooperativa sin contraseña: el `loader` lee `?volver=` y la `action` calcula adónde te llevaría. En la vista previa, el `request` lleva la URL `http://localhost/…`, el origen del historial en memoria, así que ese es el origen que tiene que respetar el destino. Cambia la dirección en la barra (por ejemplo, `/entrar?volver=%2F%2Fmalo.example%2Fsocio`), pulsa «Ir» y después «Entrar».

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio: que ?volver= no saque a nadie de la cooperativa",
  "consigna": "En seguridad.ts, destinoSeguro deja pasar //malo.example y /\\malo.example. Reescríbela: interpreta volver con new URL(volver, origen), siendo origen el de la petición (new URL(request.url).origin), y devuelve pathname + search + hash solo si el destino se queda en ese origen y esa ruta no empieza por //. Si no, o si new URL lanza un error, '/socio'. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "seguridad.ts",
      "codigo": "/**\n * Adónde llevar a alguien después de entrar. ?volver= llega en la URL, así\n * que cualquiera puede fabricar un enlace a /entrar?volver=https://otra-web.\n */\nexport function destinoSeguro(volver: FormDataEntryValue | null, request: Request): string {\n  // Tu trabajo: esto deja pasar //malo.example y /\\malo.example, que empiezan\n  // por barra pero el navegador lee como otro dominio. Interpreta volver con\n  // new URL(volver, origen), siendo origen el de la petición, y acéptalo solo\n  // si se queda en ese origen y su ruta, ya normalizada, no empieza por //\n  // (/.//malo.example es de tu origen, pero new URL lo deja en //malo.example):\n  // devuelve pathname + search + hash. Si no (o si new URL lanza un error),\n  // '/socio'.\n  void request\n  if (typeof volver === 'string' && volver.startsWith('/')) return volver\n  return '/socio'\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createMemoryRouter, Form, useActionData, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { destinoSeguro } from './seguridad'\nimport './estilos.css'\n\n// /entrar de la cooperativa, en pequeño: sin contraseña, solo el destino.\n// El loader lee ?volver= de la URL y lo deja en un campo oculto; la action lo\n// vuelve a leer del formulario, porque el campo también se puede cambiar.\nasync function loader({ request }: LoaderFunctionArgs) {\n  return { volver: new URL(request.url).searchParams.get('volver') ?? '' }\n}\n\nasync function action({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  // En tu proyecto, aquí iría redirect(destino). En la vista previa lo\n  // enseñamos: una redirección a otra web sacaría la vista previa de la página.\n  return { destino: destinoSeguro(formulario.get('volver'), request) }\n}\n\nfunction Entrar() {\n  const { volver } = useLoaderData<typeof loader>()\n  const resultado = useActionData<typeof action>()\n  return (\n    <main>\n      <h1>Zona de socios</h1>\n      <p>\n        ?volver= de esta dirección: <code>{volver || '(vacío)'}</code>\n      </p>\n      <Form method=\"post\">\n        <input type=\"hidden\" name=\"volver\" value={volver} />\n        <button type=\"submit\">Entrar</button>\n      </Form>\n      {resultado && <p role=\"status\">{`Destino: ${resultado.destino}`}</p>}\n    </main>\n  )\n}\n\nconst router = createMemoryRouter([{ path: '/entrar', loader, action, Component: Entrar }], {\n  initialEntries: ['/entrar?volver=%2Fsocio%2Fpedido'],\n})\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n  color: #1f2a22;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  color: #2f5d3a;\n  font-family: Georgia, serif;\n}\n\ncode {\n  padding: 0.1rem 0.35rem;\n  border-radius: 4px;\n  background: #e3ecdf;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n  border: 0;\n  border-radius: 6px;\n  background: #2f5d3a;\n  color: white;\n  font: inherit;\n  font-weight: 600;\n}\n\n[role='status'] {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a4a24;\n  background: #f7f3ea;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "seguridad.ts",
  "urlInicial": "/entrar?volver=%2Fsocio%2Fpedido",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Una dirección de la cooperativa pasa tal cual, con su búsqueda",
      "urlInicial": "/entrar?volver=%2Fsocio%2Fpedidos%3Fsemana%3D44",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "texto": "Destino: /socio/pedidos?semana=44"
      }
    },
    {
      "descripcion": "Con //malo.example/socio, el destino es /socio",
      "urlInicial": "/entrar?volver=%2F%2Fmalo.example%2Fsocio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "texto": "Destino: /socio"
      }
    },
    {
      "descripcion": "Con /\\malo.example/socio, el destino es /socio",
      "urlInicial": "/entrar?volver=%2F%5Cmalo.example%2Fsocio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "texto": "Destino: /socio"
      }
    },
    {
      "descripcion": "Con https://malo.example/socio, el destino es /socio",
      "urlInicial": "/entrar?volver=https%3A%2F%2Fmalo.example%2Fsocio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "texto": "Destino: /socio"
      }
    },
    {
      "descripcion": "Con /.//malo.example/socio, que new URL deja en //malo.example/socio, el destino es /socio",
      "urlInicial": "/entrar?volver=%2F.%2F%2Fmalo.example%2Fsocio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "texto": "Destino: /socio"
      }
    }
  ]
}
```

### Envíos desde otro origen: `allowedActionOrigins`

Desde la 7.12, React Router rechaza los envíos a las `action` de las rutas de interfaz cuya cabecera `Origin` no coincide con el origen de la petición: es una barrera más contra el CSRF, encima de `SameSite`. La 8.3.1 hizo la comprobación más estricta, y en la 8.5.0 se compara el origen entero, con el protocolo. Esto respondió el servidor de producción a un `POST /entrar` con las credenciales buenas y distintas cabeceras `Origin` (la petición iba a `http://localhost:…`):

```text
Origin: la misma dirección del servidor        302   entra
Origin: https://malo.example                    400   Bad Request
Origin: https://localhost:… (el mismo, con https)  400   Bad Request
Origin: null                                    400   Bad Request
sin cabecera Origin                             302   entra
```

En la terminal del servidor, cada rechazo deja esta línea:

```text
Error: The `request.url` origin does not match `origin` header from a forwarded action request. Aborting the action.
```

Es decir: «el origen de request.url no coincide con la cabecera origin; se cancela la action». La tercera fila es la que importa para desplegar. En producción, la cooperativa irá detrás de un proxy que pone el HTTPS (lo hacen casi todos los servicios donde se despliega un contenedor): el navegador dice `https://pedidos.huertadelebro.es`, pero `react-router-serve` recibe la petición por HTTP y, como no confía en las cabeceras del proxy, construye `request.url` con `http://`. **Todos los formularios responderían 400.** `allowedActionOrigins` es la lista de hosts cuyos envíos se aceptan aunque no coincidan:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  // React Router rechaza los envíos a sus action que llegan desde otro origen.\n  // En producción, la cooperativa va detrás de un proxy con HTTPS y\n  // react-router-serve ve llegar http://: sin esta línea, el navegador dice\n  // https://pedidos.huertadelebro.es, el servidor cree que es otro origen y\n  // rechaza todos los formularios con un 400.\n  allowedActionOrigins: ['pedidos.huertadelebro.es'],",
  "anotaciones": [
    {
      "fragmento": "allowedActionOrigins: ['pedidos.huertadelebro.es'],",
      "nota": "Hosts, sin protocolo, y admite comodines: *.huertadelebro.es para un subdominio. Se guarda en el build: cambiarlo exige volver a construir."
    }
  ]
}
```

Simulamos el proxy con `curl`, mandando a mano el `Host` público y el `Origin` con `https`: con esa línea, `302`; con otro host que no está en la lista (`Host: otra.example` y `Origin: https://otra.example`), `400`.

Dos límites. El primero: una petición **sin** `Origin` pasa (la última fila de la tabla). Los navegadores la mandan siempre con un formulario, pero un programa no tiene por qué: esto protege a tus socios de webs ajenas, no a tu servidor de cualquiera. El segundo: **no se aplica a las rutas de recursos**, como dice su documentación y se ve en el código de la 8.5.0, donde las peticiones a una ruta de recursos no pasan por esa comprobación. Por eso `salir.tsx` tiene componente, una página «¿Quieres salir?» que también sirve sin JavaScript: así es una ruta de interfaz, y un `POST /salir` desde otro origen respondió `400`.

## Paso 8: tipos generados y `href()` (`pedido-detalle.tsx` y `pedidos.tsx`)

`npm run typecheck` es `react-router typegen && tsc`: primero genera los tipos de cada ruta a partir de `routes.ts`, en `.react-router/types`, y después comprueba el proyecto entero, tests incluidos. La lección 15 lo contó a fondo. En `inicio/` marca un solo error, en el detalle de un pedido, que está escrito como en el modo datos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params }: LoaderFunctionArgs) {\n  const pedido = await buscarPedido(params.id)\n  // TODO (paso 8): el id llega en la URL y cualquiera puede cambiarlo. Lee el\n  // socio del context (socioContext) y, si el pedido es de otro, responde lo\n  // mismo que si no existiera.\n  if (!pedido) {\n    throw data('No encontramos ese pedido entre los tuyos.', { status: 404 })\n  }\n  return { pedido }\n}",
  "anotaciones": [
    {
      "fragmento": "export async function loader({ params }: LoaderFunctionArgs) {",
      "nota": "LoaderFunctionArgs no sabe de qué ruta es este loader, así que params es un objeto de string | undefined."
    },
    {
      "fragmento": "const pedido = await buscarPedido(params.id)",
      "nota": "Y aquí, el error: buscarPedido pide un string. «Argument of type string | undefined is not assignable to parameter of type string»."
    },
    {
      "fragmento": "if (!pedido) {",
      "nota": "Hay otro fallo que TypeScript no puede ver: cualquier socio que escriba el número de un pedido ajeno en la URL lo ve entero, con el teléfono."
    }
  ]
}
```

Con los tipos generados, los dos se arreglan en el mismo sitio:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Route.LoaderArgs sale de routes.ts: como la ruta es pedidos/:id, params.id\n// es un string, no un string | undefined.\nexport async function loader({ params, context }: Route.LoaderArgs) {\n  const socio = context.get(socioContext)\n  const pedido = await buscarPedido(params.id)\n  // El id llega en la URL y cualquiera puede cambiarlo. Un pedido de otro\n  // socio responde lo mismo que uno que no existe: un 404, sin decir de quién es.\n  if (!pedido || pedido.socioId !== socio.id) {\n    throw data('No encontramos ese pedido entre los tuyos.', { status: 404 })\n  }\n  return { pedido }\n}",
  "anotaciones": [
    {
      "fragmento": "export async function loader({ params, context }: Route.LoaderArgs) {",
      "nota": "Route.LoaderArgs sale de route('pedidos/:id', …) en routes.ts: params.id es string, sin undefined. Y en el componente, { loaderData }: Route.ComponentProps trae el tipo de lo que devuelve este loader, sin escribirlo a mano."
    },
    {
      "fragmento": "const socio = context.get(socioContext)",
      "nota": "El socio que dejó el middleware de la zona, de la que cuelga esta ruta."
    },
    {
      "fragmento": "if (!pedido || pedido.socioId !== socio.id) {",
      "nota": "Que esté autenticado no quiere decir que pueda ver cualquier pedido. Comprobarlo es cosa del loader de cada recurso, no del middleware: el middleware no sabe de quién es cada pedido."
    },
    {
      "fragmento": "throw data('No encontramos ese pedido entre los tuyos.', { status: 404 })",
      "nota": "Un 404, no un 403: con un 403 confirmarías que ese pedido existe. Para quien prueba números, uno ajeno y uno inexistente responden lo mismo."
    }
  ]
}
```

En Chromium, Pilar escribió en la barra la dirección del pedido de Lucía, `/socio/pedidos/P-44-0001`, y la página dijo «Pedido no encontrado».

Queda `href()`. Con los tipos generados, `typegen` registra todas las páginas de la app en el tipo de React Router (el aumento de módulo de `.react-router/types/+routes.ts`), y `href()` solo acepta esas direcciones, con sus parámetros. El resto de la app ya las escribe así; en `pedidos.tsx` queda un enlace escrito a mano, y tiene un fallo que ningún test ha visto:

```tsx
<Link to={`/socio/pedido/${pedido.id}`}>Pedido {pedido.id}</Link>
```

Falta una `s`: lleva a `/socio/pedido/P-44-0005`, que no es de ninguna ruta, y se pinta la página «Esta página no existe». Escrito con `href()` y la misma errata, el typecheck lo dice:

```text
app/routes/pedidos.tsx(36,30): error TS2345: Argument of type '"/socio/pedido/:id"' is not assignable to parameter of type 'keyof Pages'.
```

Es decir: «/socio/pedido/:id no es ninguna de las páginas». Y si escribes bien la dirección pero olvidas el parámetro, `href('/socio/pedidos/:id')`, también:

```text
app/routes/pedidos.tsx(36,25): error TS2554: Expected 2 arguments, but got 1.
```

Con `href('/socio/pedidos/:id', { id: pedido.id })` y el detalle con `Route.LoaderArgs`, `npm run typecheck` termina sin decir nada. `href()` además codifica los parámetros (desde la 8.3, con las reglas del RFC 3986): un id con un espacio o una barra no rompe la dirección.

## Paso 9: tus tests (`pruebas/componentes.test.tsx`)

Hasta aquí, los tests venían hechos. Casi todos **llaman a un `loader`, una `action` o un middleware como funciones**, con un `Request` de verdad, que es lo que recomienda la lección 21: son funciones normales que reciben una petición y un context y devuelven una respuesta o datos. Lo que necesitan está en `pruebas/peticion.ts`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function argumentos<A>(\n  ruta: string,\n  { init, params = {}, context = new RouterContextProvider() }: { init?: RequestInit; params?: Record<string, string>; context?: RouterContextProvider } = {},\n): A {\n  const request = new Request(`${ORIGEN}${ruta}`, init)\n  const url = new URL(request.url)\n  url.pathname = url.pathname.replace(/\\.data$/, '')\n  return { request, url, params, context, pattern: '' } as unknown as A\n}\n\n/**\n * Lo que devolvió un loader o una action, cuando tiene que ser una Response\n * (un redirect, por ejemplo). Si no lo es, el test falla diciendo qué llegó.\n */\nexport function respuesta(valor: unknown): Response {\n  if (valor instanceof Response) return valor\n  throw new Error(`Se esperaba una Response y llegó ${JSON.stringify(valor)}`)\n}\n\n/** Un formulario enviado con POST, como lo enviaría el navegador. */\nexport function envio(campos: Record<string, string>, cabeceras: Record<string, string> = {}): RequestInit {\n  return { method: 'POST', body: new URLSearchParams(campos), headers: cabeceras }\n}\n\n/** De «__sesion=abc.def; Max-Age=…; Path=/», solo «__sesion=abc.def», para la cabecera Cookie. */\nexport function cookieDe(setCookie: string | null): string {\n  if (!setCookie) throw new Error('La respuesta no trae Set-Cookie')\n  return setCookie.split(';')[0]\n}\n\n/**\n * Un context como el que deja el middleware de la zona: el socio y una sesión\n * (vacía o con la cesta que digas). Devuelve también la sesión, para mirar\n * después qué ha cambiado.\n */\nexport async function contextoDeSocio(socioId: string, cesta?: Cesta): Promise<{ context: RouterContextProvider; sesion: Sesion }> {\n  const socio = buscarSocio(socioId)\n  if (!socio) throw new Error(`No existe el socio ${socioId}`)\n  const sesion = await leerSesion(new Request(ORIGEN))\n  sesion.set('socioId', socio.id)\n  if (cesta) sesion.set('cesta', cesta)\n  const context = new RouterContextProvider()\n  context.set(socioContext, socio)\n  context.set(sesionContext, sesion)\n  return { context, sesion }\n}",
  "anotaciones": [
    {
      "fragmento": "const request = new Request(`${ORIGEN}${ruta}`, init)",
      "nota": "Un Request de la API estándar de la web, como el que construye el servidor: con su método, sus cabeceras (la Cookie) y su cuerpo."
    },
    {
      "fragmento": "url.pathname = url.pathname.replace(/\\.data$/, '')",
      "nota": "url sin el .data, como la prepara React Router. El test del paso 2 pasa /socio/pedido.data en request.url para comprobar que el middleware usa url."
    },
    {
      "fragmento": "return { request, url, params, context, pattern: '' } as unknown as A",
      "nota": "Los argumentos completos de un loader, una action o un middleware. A es el tipo de esos argumentos, que cada test saca con Parameters<typeof loader>[0]."
    },
    {
      "fragmento": "export async function contextoDeSocio(",
      "nota": "Un context como el que deja el middleware de la zona, montado a mano con RouterContextProvider. Así se prueba la action del pedido sin pasar por el middleware, y se mira después qué le ha hecho a la sesión."
    }
  ]
}
```

Para lo que depende de la cookie, el mismo archivo tiene `atender()`, que pasa la petición por el middleware de la zona antes del `loader` o la `action` y devuelve la respuesta con sus `Set-Cookie`. Con ella, el test de las dos pestañas del paso 4 hace lo que haría un navegador: dos cargas desde la misma cookie, cada una con la cookie que le toca, y los dos envíos a la vez.

Lo que falta son los componentes que usan hooks del router: `ListaCesta` y `ResumenCesta`, con su fetcher, y `FormularioPedido`, con `useNavigation`. Para eso está **`createRoutesStub`**: monta un componente dentro de un router de verdad, con las rutas, los `loader` y las `action` que le des. En `inicio/` el archivo tiene tres `it.todo`. Este es el primero de la cesta. El montaje sirve también para el segundo, en el que el servidor rechaza el cambio: la cesta vuelve sola a como estaba y, como tras un 400 no hay revalidación, el test vuelve a montar la página con `recargar()` para ver que el servidor no guardó nada:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function montarCesta(aceptar: () => Promise<boolean>) {\n  let enElServidor: Cesta = {}\n  let cargas = 0\n  function Pagina() {\n    const { cesta, cargas } = useLoaderData() as { cesta: Cesta; cargas: number }\n    return (\n      <>\n        <ResumenCesta cesta={cesta} productos={productos} />\n        <ListaCesta cesta={cesta} productos={productos} />\n        <p>{`Cargas del loader: ${cargas}`}</p>\n      </>\n    )\n  }\n  const Stub = createRoutesStub([\n    {\n      path: '/socio',\n      Component: Pagina,\n      loader: () => ({ cesta: enElServidor, cargas: ++cargas }),\n      // Como la action de verdad: solo guarda la cesta si el cambio vale.\n      async action({ request }) {\n        const cesta = cestaDelFormulario(await request.formData(), productos)\n        if (!cesta || !(await aceptar())) {\n          return data({ ok: false, error: 'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }, { status: 400 })\n        }\n        enElServidor = cesta\n        return { ok: true }\n      },\n    },\n  ])\n  const { unmount } = render(<Stub initialEntries={['/socio']} />)\n  // Desmonta la página y la vuelve a montar con el mismo servidor de mentira:\n  // su loader se ejecuta otra vez y enseña lo que el servidor tiene guardado.\n  function recargar() {\n    unmount()\n    render(<Stub initialEntries={['/socio']} />)\n  }\n  return { usuario: userEvent.setup(), recargar }\n}\n\n/** FormularioPedido con lo que devolvió la action, como en la página del pedido. */\nfunction FormularioConActionData() {\n  const actionData = useActionData() as ResultadoPedido | undefined\n  return <FormularioPedido token=\"token-de-prueba\" resultado={actionData} />\n}\n\nconst cantidad = (nombre: string) => screen.getByRole('status', { name: `Cantidad de ${nombre}` })\n\ndescribe('Paso 9: probar los componentes con createRoutesStub', () => {\n  it('la cesta cambia en cuanto pulsas, antes de que responda el servidor, y el resumen también', async () => {\n    const servidor = espera()\n    const { usuario } = montarCesta(async () => {\n      await servidor.promesa\n      return true\n    })\n\n    await usuario.click(await screen.findByRole('button', { name: 'Añadir Borraja' }))\n    await usuario.click(screen.getByRole('button', { name: 'Añadir Borraja' }))\n    await usuario.click(screen.getByRole('button', { name: 'Añadir Huevos camperos' }))\n\n    // El servidor todavía no ha respondido a nada.\n    expect(cantidad('Borraja')).toHaveTextContent('2')\n    expect(cantidad('Huevos camperos')).toHaveTextContent('1')\n    expect(screen.getByText('Total: 8,40 €')).toBeInTheDocument()\n    expect(screen.getByText(/3 productos · 8,40/)).toBeInTheDocument()\n\n    servidor.seguir()\n    // La revalidación tras la action vuelve a ejecutar el loader: la segunda\n    // carga. Entonces la cesta que se pinta ya es la del servidor, y es la misma.\n    expect(await screen.findByText('Cargas del loader: 2')).toBeInTheDocument()\n    expect(cantidad('Borraja')).toHaveTextContent('2')\n    expect(cantidad('Huevos camperos')).toHaveTextContent('1')\n    expect(screen.getByText('Total: 8,40 €')).toBeInTheDocument()\n    expect(screen.getByText(/3 productos · 8,40/)).toBeInTheDocument()\n  })",
  "anotaciones": [
    {
      "fragmento": "let enElServidor: Cesta = {}",
      "nota": "El «servidor» de mentira: una variable que el loader lee y la action cambia, solo si acepta el cambio, como la de verdad. Así, tras la action, la revalidación trae la cesta nueva."
    },
    {
      "fragmento": "loader: () => ({ cesta: enElServidor, cargas: ++cargas }),",
      "nota": "El loader cuenta sus ejecuciones y la página lo enseña: la segunda carga es la revalidación tras la action. Es la señal de que el envío ha terminado de verdad."
    },
    {
      "fragmento": "const Stub = createRoutesStub([",
      "nota": "Una ruta /socio con el componente, su loader y su action. No hace falta root, ni middleware, ni cookies: se prueba el componente, no la app entera."
    },
    {
      "fragmento": "const cesta = cestaDelFormulario(await request.formData(), productos)",
      "nota": "La action de mentira entiende el formulario igual que la de verdad, con la misma función de cesta.ts."
    },
    {
      "fragmento": "await servidor.promesa",
      "nota": "La «latencia» del servidor: aceptar espera hasta que el test llama a servidor.seguir(). Así se puede mirar la pantalla con el envío a medias."
    },
    {
      "fragmento": "expect(cantidad('Borraja')).toHaveTextContent('2')",
      "nota": "Comprobado antes de que el servidor responda: es la respuesta optimista. Dos pulsaciones en Borraja y una en Huevos, y la lista y el resumen ya lo dicen."
    },
    {
      "fragmento": "expect(await screen.findByText('Cargas del loader: 2')).toBeInTheDocument()",
      "nota": "Y después, otra vez: cuando ya ha llegado la cesta del servidor. Sin esperar a esta señal, el test comprobaría el estado optimista dos veces, y no vería un servidor que pierde los cambios."
    }
  ]
}
```

El tercero monta `FormularioPedido` con una `action` de mentira que devuelve un error en el teléfono con un 400, rellena el formulario como lo haría una persona y comprueba el mensaje junto al campo, `aria-invalid`, la descripción accesible y que el foco está en el teléfono.

¿Por qué no montar directamente `PaginaPedido`, el módulo de ruta entero? La documentación de *Testing* lo desaconseja: los tipos `Route.*` salen de tu app de verdad (el `loader` real, el árbol de rutas real), y no cuadran con lo que le das a un stub; TypeScript se queja con razón. **`createRoutesStub` es para componentes reutilizables que usan hooks del router**; la ruta entera se prueba de punta a punta, con Playwright, contra la app en marcha, que es tema de la ficha de Testing.

## Paso 10: desplegar con `react-router-serve` y Docker (`config.server.ts` y `Dockerfile`)

Hasta ahora, la cookie se ha firmado con un secreto que está escrito en el código, el de desarrollo. En producción, el secreto sale de una variable de entorno que solo existe en el servidor (la lección 22 explicó la diferencia con las `VITE_` de la lección 85 de React), y si falta, **mejor no atender que firmar con un secreto que cualquiera puede leer en el repositorio**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Los secretos con los que se firma la cookie de sesión. Salen de la variable\n// de entorno SECRETO_SESION, que solo existe en el servidor: este módulo es\n// .server y nunca llega al navegador.\n//\n// Para rotarlos sin echar a nadie, pon el nuevo delante y deja el viejo detrás,\n// separados por comas: SECRETO_SESION=\"nuevo,viejo\". Se firma con el primero y\n// se aceptan cookies firmadas con cualquiera de los dos.\n\nconst SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'\n\nexport function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {\n  const secretos = (entorno.SECRETO_SESION ?? '')\n    .split(',')\n    .map((secreto) => secreto.trim())\n    .filter(Boolean)\n  if (secretos.length > 0) return secretos\n\n  if (entorno.NODE_ENV === 'production') {\n    // Mejor no arrancar que firmar con un secreto que está en el repositorio.\n    throw new Error('Falta la variable de entorno SECRETO_SESION: sin ella no se pueden firmar las cookies de sesión.')\n  }\n  return [SECRETO_DE_DESARROLLO]\n}",
  "anotaciones": [
    {
      "fragmento": "const secretos = (entorno.SECRETO_SESION ?? '')",
      "nota": "El secreto, de la variable de entorno. El módulo es .server: ni el código ni el valor llegan nunca al navegador."
    },
    {
      "fragmento": ".split(',')",
      "nota": "Varios secretos separados por comas, para rotarlos: SECRETO_SESION=\"nuevo,viejo\". Se firma con el primero y se aceptan cookies firmadas con cualquiera de los dos. Cuando caducan las últimas cookies viejas (dos semanas), se quita el viejo."
    },
    {
      "fragmento": "throw new Error('Falta la variable de entorno SECRETO_SESION: sin ella no se pueden firmar las cookies de sesión.')",
      "nota": "En producción, sin secreto, un error. Como el almacén se crea con la primera petición que necesita la sesión (paso 1), el build y las páginas públicas funcionan; /entrar y la zona responden 500 y la terminal dice por qué."
    },
    {
      "fragmento": "export function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {",
      "nota": "El entorno es un parámetro, con process.env por defecto: los tests prueban producción y desarrollo sin tocar el process.env de verdad."
    }
  ]
}
```

`npm start` es `react-router-serve ./build/server/index.js`: el servidor de Express de React Router, que pone `NODE_ENV=production` si no le dices otra cosa, sirve `build/client` como archivos estáticos (las páginas prerenderizadas incluidas) y pasa el resto a React Router. Sin la variable:

```text
$ npm start
[react-router-serve] http://localhost:3000
GET /catalogo 200 - - 23.016 ms
Error: Falta la variable de entorno SECRETO_SESION: sin ella no se pueden firmar las cookies de sesión.
    at secretosDeSesion (file:///…/build/server/index.js:528:47)
    …
GET /entrar 500 - - 3.500 ms
```

Con ella, `SECRETO_SESION="$(openssl rand -hex 32)" npm start`, todo funciona, y la cookie lleva `Secure`.

El `Dockerfile` es el de la plantilla oficial, en cuatro etapas: todas las dependencias para construir, solo las de producción para ejecutar, el build y la imagen final. A la última le añades tres líneas:

```text
FROM node:24-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
# El usuario node, que ya trae la imagen, en vez de root.
RUN mkdir -p /app/datos && chown node:node /app/datos
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
```

- **`USER node`**: el servidor no corre como root. Si alguien encuentra un fallo en la app, no tiene el contenedor entero.
- **`/app/datos` es del usuario `node`**: es donde se escriben los pedidos, y sin ese `chown` el usuario `node` no podría.
- **El build no necesita el secreto**, porque el almacén de sesiones se crea con la primera petición: la imagen no lleva ningún secreto dentro, y el mismo build sirve para pruebas y para producción.

```bash
docker build -t cooperativa .
docker run -p 3000:3000 -e SECRETO_SESION="$(openssl rand -hex 32)" -v cooperativa-datos:/app/datos cooperativa
```

Lo probamos con Docker 28.3: la imagen ocupa 303 MB; dentro, `whoami` dice `node`; sin `-e SECRETO_SESION`, la portada y el catálogo responden 200 y `/entrar`, 500; con él, se entra, se llena la cesta y se confirma un pedido (`POST /socio/pedido 302`), que aparece en `/app/datos/pedidos.json`. Y al borrar el contenedor y crear otro con el mismo volumen (`-v cooperativa-datos:/app/datos`), el pedido `P-44-0005` seguía allí.

Para ponerla en internet, la imagen vale en cualquier servicio que ejecute contenedores (la lección 22 los repasa). Fíjate en dos cosas: que el servicio ponga HTTPS delante, y que el host público esté en `allowedActionOrigins` (paso 7); y que el disco del contenedor sea un volumen, o los pedidos desaparecen en cada despliegue.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Antes de darlo por terminado",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "Cuarenta y nueve tests: la sesión, el middleware, la cesta, el pedido, el CSV, la caché, la seguridad, el detalle, tus tres tests de componentes y los secretos."
    },
    {
      "titulo": "¿npm run typecheck no marca nada?",
      "texto": "Genera los tipos de las rutas y comprueba los de todo el proyecto, tests incluidos. El build no comprueba tipos: hay que pedirlo aparte."
    },
    {
      "titulo": "¿La zona te echa sin sesión y te devuelve después?",
      "texto": "Abre /socio/pedido en una ventana privada: acabas en /entrar?volver=%2Fsocio%2Fpedido y, al entrar, en /socio/pedido."
    },
    {
      "titulo": "¿La cookie es httpOnly, Lax y, en producción, Secure?",
      "texto": "En las herramientas de desarrollo, pestaña Aplicación, Cookies. Y document.cookie, en la consola, no la ve."
    },
    {
      "titulo": "¿La cesta cambia sin esperar?",
      "texto": "Con la red limitada (Red, Slow 4G), pulsa varios «+» seguidos: la lista y el resumen cambian al momento, y tras recargar sigue todo."
    },
    {
      "titulo": "¿Las cabeceras de caché son las que tocan?",
      "texto": "Con curl -I: public en /catalogo, private, no-store en todo lo de /socio, también en la hoja de reparto."
    },
    {
      "titulo": "¿Funciona sin JavaScript?",
      "texto": "Desactívalo y repite: entrar, llenar la cesta y confirmar el pedido, con recargas de página."
    },
    {
      "titulo": "¿La imagen arranca sin el secreto dentro?",
      "texto": "docker run sin SECRETO_SESION: /entrar responde 500 y la terminal dice qué falta. Con él, todo funciona y los pedidos sobreviven al contenedor."
    }
  ]
}
```

## Errores típicos

**Leer la sesión en `root`.** Es tentador: la cabecera diría «Hola, Pilar» en todas las páginas. Pero entonces ninguna página es igual para todo el mundo. La portada prerenderizada se generó al construir, sin nadie, y la verías sin tu nombre; y si el catálogo, con su `Cache-Control: public`, llevara tu nombre o tu cesta, una caché compartida se lo daría al siguiente que lo pidiera. Lo que depende de quién pide va en la zona, que es privada.

**Mandar la cookie desde cada `loader` y cada `action`.** Funciona, pero es fácil olvidarlo en uno, y entonces el cambio se pierde sin ningún error. Y si los `loader` que solo leen también reescriben la cookie, una respuesta lenta de una lectura puede llegar después de la de un cambio y devolver la cookie vieja. En este proyecto la escribe el middleware, una vez y solo si la sesión ha cambiado.

**Olvidar que leer un *flash* lo borra.** `sesion.get('aviso')` lo quita de la sesión, y si no la guardas después, el aviso vuelve a salir en cada recarga. Y al revés: si dos `loader` de la misma página leen el mismo *flash*, el primero se lo queda y el segundo no ve nada. La documentación lo avisa: un solo `loader` por cada clave *flash*.

**Comprobar el rol en la interfaz y no en el `loader`.** Que el enlace a la hoja de reparto no salga para Pilar no impide que escriba `/socio/reparto.csv`. Lo que protege es el 403 del `loader`; esconder el enlace solo es educación.

**Validar `?volver=` con `startsWith('/')`.** `//malo.example` y `/\malo.example` empiezan por barra y son otro dominio. Interpreta la dirección con `new URL`, compara el origen y comprueba que la ruta que devuelves no empiece por `//`: `/.//malo.example` tiene tu origen, pero `new URL` lo deja en `//malo.example`.

**Una cookie sin firmar.** Sin `secrets`, la cookie sigue siendo base64 legible, y además cualquiera puede escribir en ella lo que quiera, por ejemplo el id de otro socio. El caso real de la lección 18, [GHSA-9583-h5hc-x8cw](https://github.com/remix-run/react-router/security/advisories/GHSA-9583-h5hc-x8cw), es de esto: con `createFileSessionStorage` y una cookie sin firmar, el id de la sesión permitía leer y escribir archivos fuera de la carpeta de sesiones.

**Un `Link` normal a la ruta de recursos.** React Router intenta navegar a ella como a una página. Con `reloadDocument`, o con un `<a>`, el navegador la pide entera y descarga el archivo.

**Convertir `salir` en una ruta de recursos.** Si le quitas el componente, sigue funcionando desde el botón de la cabecera, pero deja de ser una ruta de interfaz, y React Router ya no rechaza los envíos que le lleguen desde otro origen.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En zona.tsx, alguien quita el loader porque «la zona no necesita datos»:\nexport const middleware: Route.MiddlewareFunction[] = [exigirSocio]\n// export async function loader(...) { ... }   ← borrado\n\n// cesta.tsx, pedido.tsx... tampoco tienen loader.\n// Pilar entra en /socio y, en otra pestaña, sale. Vuelve a la primera\n// pestaña y pulsa el enlace «Confirmar el pedido». ¿Pasa por el middleware?",
  "opciones": [
    "Sí: el middleware de servidor envuelve todas las navegaciones de la zona",
    "No: sin ningún loader, la navegación no pide nada al servidor, y el middleware de servidor no se ejecuta",
    "Sí, pero solo si la página tiene action",
    "No, y además la página da un error porque falta el loader"
  ],
  "correcta": 1,
  "explicacion": "El middleware de servidor solo se ejecuta si hay una petición .data, y sin loader no la hay. Lo comprobamos en Chromium, ya sin cookie: el clic solo pidió /__manifest y el JavaScript de la página, y /socio/pedido se pintó. La action sí pasaría por el middleware al enviar. Por eso la documentación propone un loader en la ruta del middleware; el de zona.tsx, además, trae el socio y la cesta."
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La cookie está firmada, así que nadie puede leer lo que lleva",
      "realidad": "Firmada no es cifrada: el contenido va en base64 y se lee con atob. La firma impide cambiarlo, no leerlo. En la cookie de la cooperativa va el id del socio y su cesta; nada que no pueda ver quien la tiene."
    },
    {
      "mito": "Con SameSite=Lax ya no hace falta comprobar el origen",
      "realidad": "Son dos capas. SameSite decide si el navegador manda la cookie; la comprobación de origen de React Router rechaza la action aunque la cookie llegue por otro camino. Y ninguna de las dos protege de un programa que no sea un navegador: para eso está validar en el servidor."
    },
    {
      "mito": "Con un middleware que exige sesión, la zona ya es segura",
      "realidad": "El middleware dice quién eres. Qué puedes ver lo decide cada loader: el detalle de un pedido mira de quién es, y la hoja de reparto, tu rol. Autenticar no es autorizar."
    },
    {
      "mito": "Cache-Control: public hace la web más rápida, así que cuanto más, mejor",
      "realidad": "Solo en lo que es igual para todos. En una página con datos de alguien, una caché compartida se los daría a otro. La zona lleva private, no-store por eso."
    },
    {
      "mito": "La interfaz optimista miente al usuario",
      "realidad": "Enseña lo que pidió mientras llega la respuesta, leído del propio envío. Si el servidor lo rechaza, el envío termina y vuelve lo que hay de verdad, con un mensaje. No hay estado propio que se quede desincronizado."
    }
  ]
}
```

## Retos para ampliarlo

Sin comprobación automática, salvo la que escribas tú.

1. **Desplegarla en Vercel.** Vercel tiene su preset para el modo framework, `@vercel/react-router`, que se añade a `presets` en `react-router.config.ts`. El 27 de octubre de 2026, su última versión, la 1.3.7, declara como dependencias `@react-router/dev` 7 y `@react-router/node` 7, y en este proyecto `npm install @vercel/react-router` falla con `ERESOLVE` («Could not resolve dependency: peer @react-router/dev@"7"»). Mira si ya hay una versión para la 8 y, si no, qué riesgo corres con `--legacy-peer-deps`. Y piensa en los pedidos: una función de Vercel no tiene un disco que dure, y lo que escriba en `datos/pedidos.json` se perdería.
2. **La sesión en el servidor.** Cambia `createCookieSessionStorage` por `createSessionStorage` con un archivo o una base de datos: la cookie solo lleva el id. ¿Qué gana «Salir»? ¿Y qué pasa ahora con dos pulsaciones seguidas de un fetcher por producto (la pregunta del paso 3)?
3. **Pocos intentos de entrar.** Cuenta los intentos fallidos por correo en un `Map` y, tras cinco en diez minutos, responde un 429 con un mensaje. ¿Dónde lo pones: en la `action` de `/entrar` o en un middleware? ¿Qué pasa si hay dos copias del servidor?
4. **Un test para el middleware que falte.** Escribe uno que compruebe que una cookie con el id de un socio que ya no existe manda a `/entrar`, y otro que pruebe que la hoja de reparto lleva `Cache-Control: private, no-store` llamando al middleware con la ruta de recursos detrás.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-router-proyectos/cooperativa (rama main, punto de partida)",
      "descripcion": "La cooperativa con los estilos, los datos, los componentes y los tests, y los TODO de cada paso.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/main/cooperativa",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-router-proyectos/cooperativa (rama solucion)",
      "descripcion": "El proyecto terminado, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/cooperativa",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Sessions and Cookies",
      "descripcion": "Los almacenes de sesiones, get, set, flash y unset, firmar cookies y rotar los secretos.",
      "url": "https://reactrouter.com/explanation/sessions-and-cookies",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Middleware",
      "descripcion": "Middleware de servidor y de cliente, cuándo se ejecuta cada uno, el context y los patrones de autenticación y de cabeceras.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Resource Routes",
      "descripcion": "Rutas sin componente que responden lo que quieran, y cómo enlazarlas.",
      "url": "https://reactrouter.com/how-to/resource-routes",
      "etiqueta": "React Router"
    },
    {
      "titulo": "react-router.config.ts",
      "descripcion": "prerender, ssr y allowedActionOrigins, entre otras opciones.",
      "url": "https://reactrouter.com/api/framework-conventions/react-router.config.ts",
      "etiqueta": "React Router"
    },
    {
      "titulo": "CSV Injection",
      "descripcion": "Por qué una celda que empieza por = puede ser peligrosa, y cómo neutralizarla.",
      "url": "https://owasp.org/www-community/attacks/CSV_Injection",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "Set-Cookie",
      "descripcion": "HttpOnly, Secure, SameSite, Max-Age y el resto de atributos de una cookie.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      "etiqueta": "MDN"
    }
  ]
}
```
