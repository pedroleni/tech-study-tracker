# Sesiones y cookies: iniciar sesión en el servidor

- **Módulo:** Modo framework
- **Slug:** `sesiones-y-cookies-iniciar-sesion-en-el-servidor` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [Sessions and Cookies](https://reactrouter.com/explanation/sessions-and-cookies) + [Middleware: Authentication](https://reactrouter.com/how-to/middleware) + [createCookieSessionStorage](https://reactrouter.com/api/utils/createCookieSessionStorage) + [createCookie](https://reactrouter.com/api/utils/createCookie) — ver `contenido/react-router/TEMARIO.md` #18
- **Requiere:** Las lecciones 10 (middleware), 14, 15 y 17 de esta ficha. De React, la 102 (autenticación en una SPA); de Node.js, la 50 (contraseñas), la 51 (HMAC) y el proyecto 52 (JWT)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

En el Albergue El Cea, la recepción la llevan **hospitaleros voluntarios** que se turnan: Marta tiene el turno de hoy, Ignacio el de mañana. Desde la zona de hospitaleros ven las reservas de la noche, marcan quién ha llegado y descargan la lista de pernoctas. Son datos personales, así que la zona necesita **iniciar sesión**.

Ya protegiste rutas dos veces en esta ficha y en la de React, y las dos en el navegador:

- **La lección 102 de React**: una SPA que pregunta «¿quién soy?» a una API y esconde las rutas si no hay nadie. La propia lección lo decía: eso es interfaz, la seguridad está en el servidor de la API.
- **La lección 10**: un middleware de cliente que, en modo datos, redirige a `/entrar?volver=…` antes de que se ejecute ningún `loader`. Mejor organizado, pero sigue siendo código que corre en el navegador del usuario.

En el modo framework **el servidor es tuyo**: el HTML de la zona se genera en él, así que puedes decidir quién lo ve antes de generarlo. Lo que necesitas es que el navegador **se identifique en cada petición**, y para eso están las cookies: el servidor manda una cabecera `Set-Cookie` al entrar, y el navegador la devuelve sola en cada petición, en la cabecera `Cookie`. React Router trae lo necesario para leerlas y escribirlas: `createCookie` y los almacenes de sesiones.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las piezas de la sesión en el albergue",
  "roles": [
    {
      "etiqueta": "cookie __sesion",
      "rol": "Quién eres y desde cuándo",
      "descripcion": "El id del hospitalero y la hora de entrada, en JSON y en base64, firmados con HMAC. Viaja en cada petición; el JavaScript de la página no la ve."
    },
    {
      "etiqueta": "sesiones.server.ts",
      "rol": "Leer y escribir la cookie",
      "descripcion": "createCookieSessionStorage: getSession lee la cabecera Cookie; commitSession y destroySession dan el Set-Cookie de la respuesta."
    },
    {
      "etiqueta": "middleware de la zona",
      "rol": "El portero de /hospitaleros",
      "descripcion": "Antes que ningún loader: sin sesión válida o con más de 8 horas, a /entrar. Con sesión, deja al hospitalero en el context."
    },
    {
      "etiqueta": "loader y action",
      "rol": "El trabajo de cada ruta",
      "descripcion": "Leen al hospitalero y la sesión del context. Cambian la sesión (un aviso flash), y el middleware la guarda a la vuelta."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dónde se practica, y con qué usuarios",
  "contenido": "En el taller: github.com/pedroleni/react-router-proyectos, carpeta taller (instalado con npm ci), con la lección 17 terminada. Hay dos hospitaleros de ejemplo: marta, con la contraseña camino2026, e ignacio, con sahagun2026. En el código solo están las huellas de las contraseñas, nunca las contraseñas. Todo es inventado: el albergue, los hospitaleros y los peregrinos."
}
```

Al empezar, los veintiséis tests de la lección están en rojo (en todo el taller, 27 en verde y 71 en rojo). El primero ya dice por dónde va la cosa:

```text
$ npm run leccion -- 18

 ❯ pruebas/18-sesiones.test.ts (26 tests | 26 failed) 89ms
   ❯ lección 18: sesiones y cookies (26)
     × protege toda la zona con su middleware 6ms
     × usa un secreto de desarrollo y exige uno en producción 1ms
     × da el mismo 400 para usuario y contraseña incorrectos 2ms
     × entra, respeta volver y entrega una cookie protegida 1ms
     × el destino provisional rechaza "//malo.example" 1ms
     …

 FAIL  pruebas/18-sesiones.test.ts > lección 18: sesiones y cookies > protege toda la zona con su middleware
AssertionError: expected [] to have a length of 1 but got +0
```

Todas las salidas de `curl` de esta lección son del taller con la lección terminada, construido y servido con `npm run build` y `npm start`, que es lo que pone `NODE_ENV=production` y hace que la cookie lleve `Secure`.

## Una cookie, de cerca: `createCookie`

Antes de la sesión, la pieza de abajo. **`createCookie(nombre, opciones)`** crea un objeto que sabe leer una cookie de la cabecera `Cookie` (`parse`) y escribirla en una `Set-Cookie` (`serialize`). Lo que guardas puede ser cualquier valor que se pueda pasar a JSON: React Router lo convierte a JSON y después a base64.

Un ejemplo que no está en el taller, pero podría: el peregrino cierra el aviso del Ayuntamiento de la portada y no quiere volver a verlo hasta que caduque. Lo ejecuté en Node con React Router 8.5.0:

```tsx
import { createCookie } from 'react-router'

const avisoCerrado = createCookie('aviso-cerrado', {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  maxAge: 60 * 60 * 24, // un día
})

await avisoCerrado.serialize({ hasta: '2026-10-30' })
// 'aviso-cerrado=eyJoYXN0YSI6IjIwMjYtMTAtMzAifQ%3D%3D; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax'

await avisoCerrado.parse('aviso-cerrado=eyJoYXN0YSI6IjIwMjYtMTAtMzAifQ%3D%3D')
// { hasta: '2026-10-30' }
```

Los atributos son los de siempre (la lección 102 de React los explicó con calma): **`HttpOnly`**, que el JavaScript de la página no la vea; **`SameSite=Lax`**, que no viaje en los `POST` que lanza otra web; **`Secure`**, solo por HTTPS; **`Path`**, en qué direcciones se envía, y **`Max-Age`**, cuántos segundos debe guardarla el navegador.

Fíjate en que `eyJoYXN0YSI6…` no está cifrado: es `{"hasta":"2026-10-30"}` en base64. Y como no lleva nada más, cualquiera puede escribir su propia cookie:

```tsx
await avisoCerrado.parse('aviso-cerrado=eyJoYXN0YSI6IjIwOTktMTItMzEifQ%3D%3D')
// { hasta: '2099-12-31' }
```

Para un aviso cerrado, da igual. Para decir **quién eres**, no: hay que **firmarla**.

## Firmar no es cifrar: `secrets`

Con la opción **`secrets`**, `serialize` añade detrás del valor un punto y una **firma**: un HMAC con SHA-256 del valor, calculado con el secreto (el mismo HMAC de la lección 51 de Node.js; React Router usa `crypto.subtle`). `parse` recalcula la firma de lo que le llega y, si no coincide, devuelve `null`:

```tsx
const firmada = createCookie('aviso-cerrado', { secrets: ['s3cr3t0'] })

await firmada.serialize({ hasta: '2026-10-30' })
// 'aviso-cerrado=eyJoYXN0YSI6IjIwMjYtMTAtMzAifQ%3D%3D.EDcsvbmoPKxQOGN4Ic09sEpHbluRd7dekjiVRUpwvEM'

// La misma cookie con el 30 cambiado por un 31 y la firma de antes:
await firmada.parse('aviso-cerrado=eyJoYXN0YSI6IjIwMjYtMTAtMzEifQ%3D%3D.EDcsvbmoPKxQOGN4Ic09sEpHbluRd7dekjiVRUpwvEM')
// null
```

**La firma no esconde nada, pero impide cambiarlo.** Cualquiera que tenga la cookie puede leer lo que lleva; nadie que no tenga el secreto puede fabricar una que el servidor acepte. Por eso en una cookie firmada va un id, nunca una contraseña ni datos que no deba ver quien la tiene.

### Rotar los secretos

`secrets` es una lista. **El primero firma** lo que sale; **todos valen** para comprobar lo que entra. Para cambiar el secreto sin echar a nadie, pones el nuevo delante, esperas a que caduquen las cookies firmadas con el viejo y quitas el viejo. En el taller, la lista sale de una variable de entorno:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'\n\nexport function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {\n  // L18: el primer secreto firma y los siguientes conservan válidas las cookies\n  // durante una rotación; todos deben ser largos en producción.\n  const secretos = (entorno.SECRETO_SESION ?? '')\n    .split(',')\n    .map((secreto) => secreto.trim())\n    .filter(Boolean)\n  if (secretos.length > 0) {\n    if (entorno.NODE_ENV === 'production' && secretos.some((secreto) => secreto.length < 32))\n      throw new Error('Cada valor de SECRETO_SESION debe tener al menos 32 caracteres en producción.')\n    return secretos\n  }\n  if (entorno.NODE_ENV === 'production') {\n    throw new Error('Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.')\n  }\n  return [SECRETO_DE_DESARROLLO]\n}",
  "anotaciones": [
    {
      "fragmento": "const SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'",
      "nota": "En desarrollo, para que npm run dev funcione sin configurar nada. Está en el repositorio a la vista de todos, así que no puede valer en producción."
    },
    {
      "fragmento": ".split(',')",
      "nota": "SECRETO_SESION=\"nuevo,viejo\": varios secretos separados por comas, en el orden en que los quiere createCookie, el primero el que firma."
    },
    {
      "fragmento": "secretos.some((secreto) => secreto.length < 32)",
      "nota": "En producción, cada secreto con al menos 32 caracteres. Uno corto se puede adivinar probando, y con él cualquiera fabrica cookies de cualquier hospitalero. openssl rand -hex 32 da 64."
    },
    {
      "fragmento": "throw new Error('Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.')",
      "nota": "Sin la variable, en producción, un error. Mejor no atender que firmar con un secreto público."
    },
    {
      "fragmento": "export function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {",
      "nota": "El entorno entra como parámetro, con process.env por defecto: los tests prueban producción y desarrollo sin tocar las variables del proceso."
    }
  ]
}
```

Lo probé con `curl` contra el servidor de producción. Marta entró con `SECRETO_SESION="viejo"`; después lo reinicié con `SECRETO_SESION="nuevo,viejo"` y, por último, solo con `"nuevo"` (los valores de verdad eran dos cadenas aleatorias de 64 caracteres):

```text
# Con "nuevo,viejo": la cookie de Marta, firmada con el viejo, sigue valiendo
$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros
HTTP/1.1 200 OK

# Con "nuevo": ya no
$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros
HTTP/1.1 302 Found
location: /entrar?volver=%2Fhospitaleros

# Ignacio entró con "nuevo,viejo": su cookie va firmada con el nuevo, y vale
$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_IGNACIO" http://localhost:3000/hospitaleros
HTTP/1.1 200 OK
```

## El almacén de sesiones: `createCookieSessionStorage`

Una **sesión** es un objeto con `get`, `set`, `has`, `unset` y `flash` que vive lo que dura una petición. Un **almacén de sesiones** la saca de la cabecera `Cookie` y la vuelve a meter en un `Set-Cookie`, con tres funciones:

- **`getSession(cabeceraCookie)`**: la sesión de la petición. Si no hay cookie, o la firma no cuadra, una sesión vacía, sin lanzar nada.
- **`commitSession(sesion)`**: el texto del `Set-Cookie` con la sesión tal como está ahora.
- **`destroySession(sesion)`**: el texto del `Set-Cookie` que ordena al navegador borrarla.

Ninguna toca la respuesta: **devuelven el texto de la cabecera, y eres tú quien lo pone** en la `Response`. Si cambias la sesión y no mandas el `Set-Cookie`, el cambio se pierde.

React Router trae varios almacenes. `createSessionStorage` guarda los datos donde tú digas (una base de datos) y en la cookie solo va un id; `createMemorySessionStorage`, en la memoria del proceso, para pruebas; `createFileSessionStorage`, de `@react-router/node`, en archivos. Y **`createCookieSessionStorage` guarda la sesión entera dentro de la cookie**: no hace falta base de datos. Es el que usa el taller:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createCookieSessionStorage, type Session, type SessionStorage } from 'react-router'\nimport { secretosDeSesion } from '~/config.server'\n\nexport type DatosSesion = { hospitaleroId: string; inicio: number }\nexport type DatosFlash = { aviso: string }\nexport type Sesion = Session<DatosSesion, DatosFlash>\n\nexport function crearAlmacenDeSesiones(secretos: string[]): SessionStorage<DatosSesion, DatosFlash> {\n  return createCookieSessionStorage<DatosSesion, DatosFlash>({\n    cookie: {\n      // L18: nombre propio, inaccesible a JS, solo mismo sitio, solo HTTPS en\n      // producción, válida en toda la app y limitada a ocho horas.\n      name: '__sesion',\n      httpOnly: true,\n      sameSite: 'lax',\n      secure: process.env.NODE_ENV === 'production',\n      path: '/',\n      maxAge: 60 * 60 * 8,\n      secrets: secretos,\n    },\n  })\n}\n\nlet almacen: SessionStorage<DatosSesion, DatosFlash> | undefined\nfunction almacenDeSesiones() {\n  // L18: se crea en la primera petición para leer entonces el entorno y permitir\n  // que los tests configuren secretos antes de usarlo.\n  almacen ??= crearAlmacenDeSesiones(secretosDeSesion())\n  return almacen\n}\n\nexport function leerSesion(request: Request): Promise<Sesion> {\n  return almacenDeSesiones().getSession(request.headers.get('Cookie'))\n}\n\nexport function guardarSesion(sesion: Sesion): Promise<string> {\n  return almacenDeSesiones().commitSession(sesion)\n}\n\nexport function cerrarSesion(sesion: Sesion): Promise<string> {\n  // L18: una cookie de sesión no se revoca en el servidor; salir solo ordena a\n  // este navegador borrarla. Para revocación real haría falta un almacén servidor.\n  return almacenDeSesiones().destroySession(sesion)\n}",
  "anotaciones": [
    {
      "fragmento": "export type DatosSesion = { hospitaleroId: string; inicio: number }",
      "nota": "Lo que guarda la sesión: el id del hospitalero y cuándo entró, en milisegundos. Con estos tipos en el genérico, sesion.get('inicio') es number | undefined, y sesion.set('inicio', 'ayer') no compila."
    },
    {
      "fragmento": "export type DatosFlash = { aviso: string }",
      "nota": "Los valores de un solo uso (flash), con su tipo aparte: el aviso de «Llegada marcada.»."
    },
    {
      "fragmento": "name: '__sesion',",
      "nota": "Un nombre propio. El navegador manda todas las cookies del sitio, y el almacén lee solo la suya."
    },
    {
      "fragmento": "secure: process.env.NODE_ENV === 'production',",
      "nota": "Solo por HTTPS en producción. En desarrollo no, porque http://localhost:5173 no es HTTPS."
    },
    {
      "fragmento": "maxAge: 60 * 60 * 8,",
      "nota": "Ocho horas, un turno: 28800 segundos. Es lo que el navegador debe guardarla; enseguida verás por qué no basta."
    },
    {
      "fragmento": "almacen ??= crearAlmacenDeSesiones(secretosDeSesion())",
      "nota": "Se crea con la primera petición que lo necesita, no al importar el módulo. El build importa el servidor para prerenderizar (lección 17), y no tiene por qué conocer el secreto; y los tests cambian el entorno antes de usarlo."
    },
    {
      "fragmento": "export function cerrarSesion(sesion: Sesion): Promise<string> {",
      "nota": "Tres funciones con nombre en español alrededor de getSession, commitSession y destroySession. El comentario de dentro adelanta lo más importante de la lección: una sesión en cookie no se puede revocar."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin secrets, React Router avisa",
  "contenido": "Con createCookieSessionStorage y una cookie sin secrets, React Router escribe en la terminal: The \"__sesion\" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. Es decir: la cookie de sesión no está firmada, y debería, para que nadie la cambie antes de devolverla. Es solo un aviso: la app sigue funcionando, y cualquiera puede escribirse una sesión."
}
```

## Entrar: la `action` de `/entrar`

El formulario manda `usuario`, `clave` y `volver` (un campo oculto). La `action` comprueba las credenciales y, si valen, escribe la sesión:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const Credenciales = z.object({ usuario: z.string().min(1), clave: z.string().min(1) })\nconst MENSAJE = 'El usuario o la contraseña no son correctos.'\n\nexport async function loader({ request }: Route.LoaderArgs) {\n  // L18/L20: si ya hay sesión se vuelve al destino, siempre saneado para evitar\n  // que `volver` convierta el login en una redirección abierta.\n  const volver = destinoSeguro(new URL(request.url).searchParams.get('volver'), href('/hospitaleros'))\n  const sesion = await leerSesion(request)\n  if (buscarHospitalero(sesion.get('hospitaleroId'))) throw redirect(volver)\n  return { volver }\n}\n\nexport async function action({ request }: Route.ActionArgs) {\n  const formulario = await request.formData()\n  const volver = destinoSeguro(formulario.get('volver'), href('/hospitaleros'))\n  const valores = Credenciales.safeParse(Object.fromEntries(formulario))\n  const hospitalero = valores.success\n    ? await comprobarCredenciales(valores.data.usuario, valores.data.clave)\n    : null\n  if (!hospitalero)\n    // L18: el mismo mensaje evita revelar si el usuario existe.\n    return data({ error: MENSAJE, usuario: String(formulario.get('usuario') ?? '') }, { status: 400 })\n  const sesion = await leerSesion(request)\n  sesion.set('hospitaleroId', hospitalero.id)\n  sesion.set('inicio', Date.now())\n  return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })\n}",
  "anotaciones": [
    {
      "fragmento": "const MENSAJE = 'El usuario o la contraseña no son correctos.'",
      "nota": "Un solo mensaje para un usuario que no existe y para una contraseña mala. Si fueran distintos, el formulario serviría para averiguar qué usuarios existen, como explicaba el proyecto 52 de Node.js."
    },
    {
      "fragmento": "const volver = destinoSeguro(formulario.get('volver'), href('/hospitaleros'))",
      "nota": "Adónde volver tras entrar. De momento, con destinoProvisional, importada con este nombre: la comprobación de la lección 13, con new URL. La lección 20 la sustituye por un destinoSeguro más estricto."
    },
    {
      "fragmento": "const valores = Credenciales.safeParse(Object.fromEntries(formulario))",
      "nota": "Zod comprueba que llegan los dos campos como texto. Un formulario manipulado sin clave da el mismo 400 que una clave mala."
    },
    {
      "fragmento": "return data({ error: MENSAJE, usuario: String(formulario.get('usuario') ?? '') }, { status: 400 })",
      "nota": "Devuelto con data y un 400: el formulario sigue en pantalla con el usuario escrito (nunca la contraseña) y el mensaje."
    },
    {
      "fragmento": "sesion.set('hospitaleroId', hospitalero.id)",
      "nota": "Solo el id: el nombre puede cambiar, y la cookie, que cualquiera puede leer, tiene que ser pequeña."
    },
    {
      "fragmento": "sesion.set('inicio', Date.now())",
      "nota": "La hora de entrada. Es lo que permitirá al servidor decidir que el turno ha terminado, pase lo que pase con la cookie."
    },
    {
      "fragmento": "return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })",
      "nota": "La cookie viaja en la propia redirección. /entrar está fuera de la zona y no pasa por su middleware, así que aquí hay que mandarla a mano."
    }
  ]
}
```

`comprobarCredenciales` ya viene hecha en el taller, en `app/datos/hospitaleros.server.ts`. Es la lección 50 de Node.js aplicada:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const SAL_DE_RELLENO = 'cea-relleno-2026-sal'\n\nexport async function comprobarCredenciales(usuario: string, clave: string): Promise<Hospitalero | null> {\n  const hospitalero = HOSPITALEROS.find((candidato) => candidato.usuario === usuario.trim().toLowerCase())\n  // L18: scrypt deriva una huella costosa con sal; la sal de relleno hace un\n  // trabajo equivalente si no existe el usuario y reduce la enumeración por tiempo.\n  const calculada = await derivar(clave, hospitalero?.sal ?? SAL_DE_RELLENO, 32)\n  if (!hospitalero) return null\n  // timingSafeEqual evita que el primer byte distinto se pueda inferir por duración.\n  return timingSafeEqual(calculada, Buffer.from(hospitalero.hash, 'hex')) ? publico(hospitalero) : null\n}",
  "anotaciones": [
    {
      "fragmento": "const calculada = await derivar(clave, hospitalero?.sal ?? SAL_DE_RELLENO, 32)",
      "nota": "scrypt deriva una huella de 32 bytes a partir de la contraseña y la sal de ese hospitalero. Es lento a propósito: probar millones de contraseñas contra una huella robada sale carísimo."
    },
    {
      "fragmento": "SAL_DE_RELLENO",
      "nota": "Si el usuario no existe, scrypt se ejecuta igual, con una sal de relleno. Sin esto, un usuario inexistente respondería en 1 ms y uno existente en 20: el tiempo diría qué usuarios hay, aunque el mensaje sea el mismo."
    },
    {
      "fragmento": "if (!hospitalero) return null",
      "nota": "Solo después de calcular la huella se mira si el usuario existe."
    },
    {
      "fragmento": "return timingSafeEqual(calculada, Buffer.from(hospitalero.hash, 'hex')) ? publico(hospitalero) : null",
      "nota": "timingSafeEqual compara los 32 bytes enteros, tarde lo mismo coincidan o no. Con === la comparación se para en el primer byte distinto, y el tiempo filtra cuántos coinciden. Las dos huellas miden 32 bytes; si midieran distinto, timingSafeEqual lanzaría un error."
    }
  ]
}
```

Las tres respuestas, con `curl`:

```text
$ curl -s -D - -o malo1.html -X POST http://localhost:3000/entrar -d 'usuario=nadie&clave=camino2026&volver='
HTTP/1.1 400 Bad Request
$ grep -o 'role="alert">[^<]*' malo1.html
role="alert">El usuario o la contraseña no son correctos.

$ curl -s -D - -o malo2.html -X POST http://localhost:3000/entrar -d 'usuario=marta&clave=peregrina&volver='
HTTP/1.1 400 Bad Request
$ grep -o 'role="alert">[^<]*' malo2.html
role="alert">El usuario o la contraseña no son correctos.

$ curl -s -D - -o /dev/null -X POST http://localhost:3000/entrar \
    -d 'usuario=marta&clave=camino2026&volver=%2Fhospitaleros%2Freservas%2Fr-1'
HTTP/1.1 302 Found
location: /hospitaleros/reservas/r-1
set-cookie: __sesion=eyJob3NwaXRhbGVyb0lkIjoiaC1tYXJ0YSIsImluaWNpbyI6MTc5MzEzMTA5MDY1OX0%3D.KBG4jvGBsL7SNjdZYVx0%2BYS%2BuAYHVvMgetd62QlVzDs; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax
```

Ahí están **`HttpOnly`, `Secure` y `SameSite=Lax`**, y `Max-Age=28800`, las ocho horas. Y el tiempo tampoco delata: seis intentos de cada caso tardaron entre 33 y 35 ms con el usuario inexistente, y entre 32 y 34 ms con la contraseña mala. En los dos casos se ejecuta `scrypt`.

Lo que va antes del punto, decodificado, es esto:

```text
$ node -e "console.log(Buffer.from(decodeURIComponent('eyJob3NwaXRhbGVyb0lkIjoiaC1tYXJ0YSIsImluaWNpbyI6MTc5MzEzMTA5MDY1OX0%3D'), 'base64').toString())"
{"hospitaleroId":"h-marta","inicio":1793131090659}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La cookie de Marta es  <carga>.<firma>\n// <carga> = base64 de {\"hospitaleroId\":\"h-marta\",\"inicio\":1793131090659}\n//\n// Alguien la copia, cambia la carga por la de\n//   {\"hospitaleroId\":\"h-ignacio\",\"inicio\":<ahora>}\n// y deja la firma de Marta:\n//\n// $ curl -s -D - -o /dev/null \\\n//     -H \"Cookie: __sesion=<carga de ignacio>.<firma de marta>\" \\\n//     http://localhost:3000/hospitaleros",
  "opciones": [
    "200 OK, con la zona de Ignacio",
    "200 OK, con la zona de Marta: manda la firma",
    "302 a /entrar: la firma no cuadra y la sesión llega vacía",
    "500: la cookie no se puede decodificar"
  ],
  "correcta": 2,
  "explicacion": "El almacén recalcula el HMAC de la carga con el secreto, no coincide con la firma, y getSession devuelve una sesión vacía. Sin hospitalero, el middleware redirige: 302 Found, location: /entrar?volver=%2Fhospitaleros. Lo mismo pasó al cambiar un solo carácter de la firma. Es el test «rechaza una cookie firmada que ha sido manipulada»."
}
```

## El middleware de la zona

Con la sesión escrita, falta que **toda la zona** la exija. La lección 10 lo hizo con un middleware de cliente; aquí es **de servidor**, exportado desde `zona.tsx`, la madre de `/hospitaleros`, y envuelve todas las peticiones de sus hijas: las páginas, sus `.data`, sus `action` y la ruta de recursos del CSV (19).

```tsx
// app/routes/hospitaleros/zona.tsx
export const middleware: Route.MiddlewareFunction[] = [exigirHospitalero]
```

El middleware está en su propio módulo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { href, redirect, type MiddlewareFunction } from 'react-router'\nimport { hospitaleroContext, sesionContext } from '~/contexto.server'\nimport { buscarHospitalero } from '~/datos/hospitaleros.server'\nimport { destinoProvisional as destinoSeguro } from '~/seguridad'\nimport { cerrarSesion, guardarSesion, leerSesion } from '~/sesiones.server'\n\nconst OCHO_HORAS = 8 * 60 * 60 * 1000\n\nexport const exigirHospitalero: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {\n  const sesion = await leerSesion(request)\n  const hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))\n  const inicio = sesion.get('inicio')\n  const caducada = typeof inicio !== 'number' || Date.now() - inicio > OCHO_HORAS\n  if (!hospitalero || caducada) {\n    // L18/L20: volver conserva el destino interno; throw redirect corta toda la\n    // rama protegida antes de que un loader llegue a ejecutarse.\n    const volver = destinoSeguro(url.pathname + url.search, href('/hospitaleros'))\n    const llegoCookieDeSesion = request.headers\n      .get('Cookie')\n      ?.split(';')\n      .some((cookie) => cookie.trimStart().startsWith('__sesion='))\n    throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`, {\n      headers: caducada && llegoCookieDeSesion ? { 'Set-Cookie': await cerrarSesion(sesion) } : undefined,\n    })\n  }\n  context.set(hospitaleroContext, hospitalero)\n  context.set(sesionContext, sesion)\n  // L18: se compara data completa porque leer un flash lo consume después de next().\n  const antes = JSON.stringify(sesion.data)\n  const respuesta = await next()\n  if (JSON.stringify(sesion.data) !== antes)\n    respuesta.headers.append('Set-Cookie', await guardarSesion(sesion))\n  // L18: el middleware cubre documentos, peticiones .data y el CSV de toda la zona.\n  respuesta.headers.set('Cache-Control', 'private, no-store')\n  return respuesta\n}",
  "anotaciones": [
    {
      "fragmento": "const OCHO_HORAS = 8 * 60 * 60 * 1000",
      "nota": "Un turno, en milisegundos, como Date.now()."
    },
    {
      "fragmento": "const hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))",
      "nota": "Que la sesión tenga un id no basta: el hospitalero tiene que existir. Si mañana alguien deja el voluntariado y se borra, su cookie deja de abrir la zona."
    },
    {
      "fragmento": "const caducada = typeof inicio !== 'number' || Date.now() - inicio > OCHO_HORAS",
      "nota": "La caducidad, comprobada en el servidor con la hora que guardó la action de entrar. Sin inicio también cuenta como caducada: una sesión vacía o fabricada sin hora no pasa."
    },
    {
      "fragmento": "const volver = destinoSeguro(url.pathname + url.search, href('/hospitaleros'))",
      "nota": "url, no request.url: al navegar, la petición es /hospitaleros.data, y tras entrar volverías a una respuesta de datos. La cooperativa (24) lo enseñó con un predice."
    },
    {
      "fragmento": "headers: caducada && llegoCookieDeSesion ? { 'Set-Cookie': await cerrarSesion(sesion) } : undefined,",
      "nota": "Si llegó una cookie __sesion y no vale (caducada, manipulada o sin hora), la redirección ordena además borrarla. A quien no traía ninguna no se le manda nada: no hay qué borrar."
    },
    {
      "fragmento": "context.set(hospitaleroContext, hospitalero)",
      "nota": "Deja al hospitalero para los loader y las action de la zona, con el tipo de createContext<Hospitalero>() de la lección 15. Y la sesión, con sesionContext, para el flash."
    },
    {
      "fragmento": "const respuesta = await next()",
      "nota": "Aquí se ejecutan los loader o la action de la zona y se genera la respuesta. Nada de eso pasa si antes se ha lanzado la redirección."
    },
    {
      "fragmento": "respuesta.headers.set('Cache-Control', 'private, no-store')",
      "nota": "La cabecera de la lección 17, puesta aquí para que cubra también la ruta de recursos del CSV, a la que no se aplican las funciones headers."
    }
  ]
}
```

El `throw redirect(…)` va **antes** de `next()`: ningún `loader` ni ninguna `action` de la zona llega a ejecutarse sin sesión. Pedida con `curl`, sin cookie y con la de Marta:

```text
$ curl -s -D - -o /dev/null http://localhost:3000/hospitaleros/reservas/r-1
HTTP/1.1 302 Found
location: /entrar?volver=%2Fhospitaleros%2Freservas%2Fr-1

$ curl -s -D - -o hoy.html -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros
HTTP/1.1 200 OK
cache-control: private, no-store
$ grep -o 'Hola, <strong>[^<]*' hoy.html
Hola, <strong>Marta Díez

$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros.data
HTTP/1.1 200 OK
cache-control: private, no-store
content-type: text/x-script; charset=utf-8
```

La primera es la redirección a `/entrar?volver=…` que pide el test **«el middleware redirige sin sesión y no llama a next»**, sin `Set-Cookie`, porque no llegó ninguna cookie que borrar. `URLSearchParams` codifica las barras del destino. Y si ya hay sesión, el `loader` de `/entrar` te devuelve directamente al destino: no tiene sentido enseñar el formulario a quien ya ha entrado.

### La caducidad de ocho horas, comprobada en el servidor

La cookie ya lleva `Max-Age=28800`. ¿Para qué guardar además `inicio` y comprobarlo en el middleware? Porque **`Max-Age` es una petición al navegador, no una regla del servidor**:

1. **Lo cumple el navegador, no el que copia la cookie.** El valor firmado no lleva ninguna fecha: `eyJob3…%3D.KBG4…` vale lo mismo hoy que dentro de un año. Si alguien copia la cookie (desde el ordenador de la recepción, de un registro, de una extensión del navegador), puede mandarla con `curl` cuando quiera, y el servidor solo comprueba la firma.
2. **Se renueva sola.** Cada vez que la sesión cambia y se vuelve a guardar, el `Set-Cookie` lleva otra vez `Max-Age=28800`, contadas desde ese momento. Un hospitalero que marca una llegada cada pocas horas no caducaría nunca. `inicio`, en cambio, solo se escribe al entrar.

Para comprobarlo, fabriqué en Node una sesión de Marta **bien firmada**, con el secreto del servidor, pero con `inicio` de hace nueve horas, como si alguien la hubiera guardado de ayer:

```text
$ curl -s -D - -o /dev/null -H "Cookie: $SESION_DE_HACE_9_HORAS" http://localhost:3000/hospitaleros
HTTP/1.1 302 Found
location: /entrar?volver=%2Fhospitaleros
set-cookie: __sesion=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax
```

Firma correcta, y aun así, fuera. Es el test **«rechaza y destruye una sesión con más de ocho horas»**, que hace lo mismo con `vi.useFakeTimers()`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// El middleware SIN la comprobación de inicio:\nconst hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))\nif (!hospitalero) throw redirect(/* … */)\n\n// La cookie: createCookieSessionStorage con maxAge: 60 * 60 * 8.\n// Marta entra a las 8:00. Cada vez que marca una llegada (11:00, 15:00,\n// 19:00), la respuesta trae un Set-Cookie nuevo, porque la sesión cambia.\n//\n// A las 22:00, catorce horas después de entrar, Marta recarga /hospitaleros\n// en su navegador. ¿Qué pasa?",
  "opciones": [
    "Va a /entrar: la cookie caducó a las 16:00, ocho horas después de entrar",
    "Ve la zona: su navegador aún tiene la cookie, porque el último Set-Cookie fue a las 19:00",
    "Ve la zona solo si no ha cerrado el navegador",
    "Da un error: la cookie lleva una fecha vencida dentro"
  ],
  "correcta": 1,
  "explicacion": "Cada Set-Cookie llega con Max-Age=28800 contado desde ese momento: la de las 19:00 vale hasta las 3:00. Y la cookie no lleva fecha dentro, solo los datos y la firma. Lo vimos con curl: el Set-Cookie que guarda el flash vuelve a traer Max-Age=28800, con el mismo inicio de la mañana. Solo comparar inicio con la hora en el servidor corta el turno a las 16:00."
}
```

## Mensajes *flash*: un aviso que sale una vez

Al marcar la llegada de un peregrino, la `action` redirige al listado del turno, y el listado tiene que decir «Llegada marcada.» **una vez**: si recargas, ya no. Para eso está **`session.flash(clave, valor)`**: un valor que dura hasta que alguien lo lee con `session.get(clave)`. **Leer un *flash* lo borra de la sesión**, y por eso, después de leerlo, hay que volver a guardarla.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "await actualizarReserva(reserva.id, { estado: 'llegada' })\n  // L18: el flash es breve y no copia texto del usuario para no desbordar la cookie.\n  context.get(sesionContext).flash('aviso', 'Llegada marcada.')\n  return redirect(href('/hospitaleros'))",
  "anotaciones": [
    {
      "fragmento": "context.get(sesionContext).flash('aviso', 'Llegada marcada.')",
      "nota": "La action no lee la cookie: usa la sesión que dejó el middleware en el context. Y no manda ningún Set-Cookie: lo hará el middleware a la vuelta, porque ve que la sesión ha cambiado."
    },
    {
      "fragmento": "return redirect(href('/hospitaleros'))",
      "nota": "POST, redirección y GET, como siempre: recargar el listado repite el GET, no la llegada."
    }
  ]
}
```

El listado (`hoy.tsx`) lee el aviso en su `loader` con `sesion.get('aviso') ?? null`, y lo pinta en un párrafo con `aria-live="polite"`, que está siempre en la página para que el lector de pantalla anuncie el cambio. El middleware, en vez de mirar qué ha cambiado, compara la sesión entera antes y después de `next()` (`JSON.stringify(sesion.data)`): así sirve para el *flash* que se pone y para el que se lee.

Las tres peticiones, seguidas, con `curl`:

```text
$ curl -s -D - -o /dev/null -X POST -H "Cookie: $COOKIE_DE_MARTA" \
    http://localhost:3000/hospitaleros/reservas/r-1 -d 'intencion=llegada'
HTTP/1.1 302 Found
cache-control: private, no-store
location: /hospitaleros
set-cookie: __sesion=eyJob3NwaXRhbGVyb0lkIjoiaC1tYXJ0YSIsImluaWNpbyI6MTc5MzEzMTA5MDY1OSwiX19mbGFzaF9hdmlzb19fIjoiTGxlZ2FkYSBtYXJjYWRhLiJ9.ff9kUBIKMADT9l9RrkDb1BhOzpL0C4lYgzxUvBNru%2F4; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax
```

Decodificada, la carga nueva es `{"hospitaleroId":"h-marta","inicio":1793131090659,"__flash_aviso__":"Llegada marcada."}`: el *flash* es una clave más, con un nombre especial. Con esa cookie, la primera visita al listado:

```text
HTTP/1.1 200 OK
set-cookie: __sesion=eyJob3NwaXRhbGVyb0lkIjoiaC1tYXJ0YSIsImluaWNpbyI6MTc5MzEzMTA5MDY1OX0%3D.KBG4jvGBsL7SNjdZYVx0%2BYS%2BuAYHVvMgetd62QlVzDs; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax
aria-live="polite">Llegada marcada.
```

Sale el aviso, y la respuesta trae la sesión sin él (es, letra a letra, la cookie del principio). Con esa, la segunda visita: `200 OK`, **sin** `Set-Cookie`, porque no ha cambiado nada, y el párrafo vacío.

¿Por qué «Llegada marcada.» y no «Has marcado la llegada de Aiko Tanaka»? Por dos motivos que ya conoces. **La cookie se lee**: el nombre de una peregrina viajaría en base64 en cada petición. Y **una cookie tiene un máximo de unos 4 KB**: React Router lo comprueba al guardar, y con un texto largo lanza `Error: Cookie length will exceed browser maximum. Length: 5341` (la longitud de mi prueba). Un *flash* corto y sin datos de nadie.

## Cerrar sesión, con `POST`

El botón «Salir» de la cabecera de la zona es un formulario que envía un `POST` a `/salir`:

```tsx
<Form method="post" action={href('/salir')}>
  <button className="boton secundario" type="submit">
    Salir
  </button>
</Form>
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Form, href, redirect } from 'react-router'\nimport { cerrarSesion, leerSesion } from '~/sesiones.server'\nimport type { Route } from './+types/salir'\n\nexport async function action({ request }: Route.ActionArgs) {\n  const sesion = await leerSesion(request)\n  return redirect(href('/'), { headers: { 'Set-Cookie': await cerrarSesion(sesion) } })\n}\n\nexport default function Salir() {\n  return (\n    <main className=\"pagina estrecha acceso\">\n      <title>Cerrar sesión | Hospitaleros de El Cea</title>\n      <h1>Cerrar sesión</h1>\n      <p>Confirma que quieres terminar el turno en este navegador.</p>\n      {/* L18/L20: el componente convierte /salir en ruta de interfaz; React Router\n          comprueba el origen de su POST, algo que no hace con rutas de recurso. */}\n      <Form method=\"post\">\n        <button type=\"submit\">Cerrar sesión</button>\n      </Form>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function action({ request }: Route.ActionArgs) {",
      "nota": "La action, y por tanto solo un POST, cierra la sesión. Una imagen con src=\"https://albergue-el-cea.es/salir\" en cualquier web, o un enlace precargado, harían un GET: no cierran nada. Cambiar algo nunca va en un GET; la documentación lo pide expresamente para salir."
    },
    {
      "fragmento": "return redirect(href('/'), { headers: { 'Set-Cookie': await cerrarSesion(sesion) } })",
      "nota": "destroySession: un Set-Cookie con la cookie vacía y una fecha de 1970, que el navegador entiende como «bórrala»."
    },
    {
      "fragmento": "export default function Salir() {",
      "nota": "Y una página: quien llega a /salir con un enlace ve «Cerrar sesión» y un botón que hace el POST. Tener componente la convierte en una ruta de interfaz, y React Router comprueba el origen de los POST que recibe."
    },
    {
      "fragmento": "<Form method=\"post\">",
      "nota": "Sin action: envía a la ruta en la que está pintado, /salir."
    }
  ]
}
```

Con `curl`, primero el `GET`, después un `POST` que dice venir de otra web y, por último, el `POST` de verdad:

```text
$ curl -s -D - -o salir.html -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/salir
HTTP/1.1 200 OK
$ grep -o '<h1>[^<]*' salir.html
<h1>Cerrar sesión

$ curl -s -D - -o /dev/null -X POST -H 'Origin: https://malo.example' -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/salir
HTTP/1.1 400 Bad Request

$ curl -s -D - -o /dev/null -X POST -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/salir
HTTP/1.1 302 Found
location: /
set-cookie: __sesion=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax
```

- **El `GET`** pinta la página de confirmación, sin `Set-Cookie`: la sesión sigue abierta.
- **El `POST` de otro origen** se rechaza antes de llegar a la `action`. En la terminal queda «Error: The request.url origin does not match origin header from a forwarded action request. Aborting the action.» (el origen de la petición no coincide con la cabecera `Origin`; se cancela la `action`). Es la comprobación de origen que verás a fondo en la lección 20, y solo se aplica a las rutas con componente: sin la página, `/salir` sería una ruta de recursos (lección 19) y el `POST` pasaría. Es el test **«salir es una página de confirmación y rechaza un POST de otro origen»**.
- **El `POST` bueno** responde con el `Set-Cookie` de borrado y te lleva a la portada.

### Una sesión en cookie no se puede revocar

Ahora, lo incómodo. Después de ese `POST /salir`, la misma cookie de Marta, copiada antes de salir:

```text
$ curl -s -D - -o /dev/null -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros
HTTP/1.1 200 OK
cache-control: private, no-store
```

**Sigue valiendo.** «Salir» le pide a *este* navegador que borre su copia; el servidor no guarda nada, así que no tiene dónde apuntar que esa sesión ya no vale. Para el servidor, una cookie bien firmada y con `inicio` de hace menos de ocho horas es una sesión válida, venga de donde venga.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Qué hacer si necesitas revocar",
  "contenido": "Con la sesión entera en la cookie, lo único que la corta es la caducidad: por eso el turno de 8 horas se comprueba en el servidor. Si necesitas cerrar una sesión robada, o todas las de un hospitalero que deja el albergue, la sesión tiene que vivir en el servidor: createSessionStorage con una base de datos, y la cookie solo con el id. Salir borra la fila, y la cookie copiada ya no encuentra nada. Otra opción es guardar un número de versión por usuario y subirlo para invalidar todas sus cookies."
}
```

## Frente a la 102 de React y al JWT del proyecto 52 de Node.js

Si te suena todo esto, es porque **una sesión en una cookie firmada es casi un JWT**: datos en JSON y base64, una firma HMAC con un secreto del servidor, legible por cualquiera, imposible de cambiar sin el secreto, y sin nada guardado en el servidor. Lo que cambia es quién lo manda y cómo caduca:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La SPA de la lección 102 de React",
      "texto": "El servidor de la API decide; la SPA solo pregunta «¿quién soy?» y esconde lo que no toca. La credencial puede ser una cookie httpOnly que pone la API o un token que guarda tu código. Las rutas protegidas son comodidad, no seguridad."
    },
    {
      "titulo": "El JWT del proyecto 52 de Node.js",
      "texto": "Lo guarda tu código y lo manda en Authorization: Bearer. No hay CSRF, porque el navegador no lo añade solo, pero un XSS puede leerlo. La caducidad va dentro, en exp, y se comprueba al verificar. Tampoco se puede revocar sin guardar algo en el servidor."
    },
    {
      "titulo": "La cookie de sesión de esta lección",
      "texto": "La pone y la lee el servidor; el navegador la manda solo y el JavaScript de la página no la ve (HttpOnly). Como viaja sola, hace falta SameSite y, para las action, la comprobación de origen de la lección 20. La caducidad la decide tu código: aquí, inicio."
    },
    {
      "titulo": "Lo que comparten",
      "texto": "Firmado no es cifrado; quien tiene la credencial es quien eres; sin estado en el servidor no hay forma de echar a nadie antes de tiempo. Y la autorización (qué puedes ver) se decide en cada loader, no en la credencial."
    }
  ]
}
```

## Un caso real: GHSA-9583-h5hc-x8cw

El 8 de enero de 2026, React Router publicó un aviso de seguridad **crítico** (CVSS 9.1, [CVE-2025-61686](https://github.com/remix-run/react-router/security/advisories/GHSA-9583-h5hc-x8cw)): *«Unauthorized file access when using `createFileSessionStorage()` with unsigned cookies»*, acceso a archivos sin autorización al usar `createFileSessionStorage()` con cookies sin firmar.

- **Qué es `createFileSessionStorage`.** El almacén de `@react-router/node` que guarda cada sesión en un archivo de una carpeta del servidor; la cookie solo lleva el id de la sesión, que acaba formando parte de la ruta de ese archivo.
- **El fallo.** Con una cookie **sin firmar**, el id lo escribe quien quiera. Un id fabricado podía hacer que la sesión se leyera o se escribiera en un archivo **fuera de la carpeta de sesiones**. Hasta dónde llegaba dependía de los permisos del proceso del servidor; el contenido no se devolvía directamente, solo se cargaba en la sesión si tenía su formato.
- **A quién afectaba.** `@react-router/node` de la 7.0.0 a la 7.9.3 (corregido en la 7.9.4), y `@remix-run/node` y `@remix-run/deno` hasta la 2.17.1 (corregido en la 2.17.2).

Las dos lecciones del caso: **firma siempre la cookie de la sesión**, aunque solo lleve un id (con `secrets`, un id fabricado no pasa de `getSession`), y **mantén al día los paquetes del servidor**. El taller cumple las dos: almacén en cookie firmado, y `secretosDeSesion` no deja arrancar la sesión en producción sin secretos.

## Cuándo lo usarías de verdad

- **`createCookieSessionStorage`**: sesiones pequeñas (un id, una hora, una preferencia) en apps sin base de datos o donde no hace falta revocar: el albergue, una cooperativa, un panel interno.
- **`createSessionStorage` con base de datos**: en cuanto necesites cerrar sesiones desde el servidor (robo, baja, «cerrar todas mis sesiones»), o guardar más de lo que cabe en 4 KB.
- **`createCookie` sola**: preferencias que no son la sesión (el aviso cerrado, el idioma), firmada si lo que dice importa.
- **Un proveedor de identidad** (los de la lección 102 de React): cuando no quieres guardar contraseñas. En el servidor, la sesión de React Router guarda lo que el proveedor te devuelve.

## Errores típicos

**Cambiar la sesión y no mandar el `Set-Cookie`.** `session.set` y `session.flash` solo cambian el objeto de esta petición. Si nadie llama a `commitSession` y pone su resultado en la respuesta, el cambio se pierde sin ningún error. En el taller lo hace el middleware; en `/entrar`, que está fuera de la zona, la `action` a mano.

**Confiar en `maxAge` para que la sesión caduque.** Lo cumple el navegador, y se renueva con cada `commitSession`. La caducidad que importa se comprueba en el servidor.

**Creer que «Salir» invalida la cookie.** Solo la borra de ese navegador. Una copia sigue valiendo hasta que caduque.

**Cerrar sesión con un enlace (`GET`).** Cualquier web puede provocar un `GET` a tu dominio: una imagen, un enlace precargado. Salir, como cualquier cambio, en una `action`.

**Mensajes distintos para usuario y contraseña, o tiempos distintos.** Los dos dicen qué usuarios existen. Mismo mensaje, mismo código y `scrypt` en los dos casos.

**Guardar en la sesión lo que no debe verse.** La cookie se decodifica con una línea de Node. Ni contraseñas, ni datos de terceros, ni nada que no pueda leer quien la tiene.

**Leer el mismo *flash* en dos `loader`.** El primero que lo lee se lo queda; el segundo ve `undefined`. La documentación lo avisa: una clave *flash* por `loader`.

**Secretos cortos o en el repositorio.** Con el secreto, cualquiera fabrica la cookie de cualquier hospitalero. Largo, aleatorio, en una variable de entorno del servidor y nunca con el prefijo `VITE_` (lección 22).

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La cookie está firmada, así que nadie puede leer lo que lleva",
      "realidad": "Firmada no es cifrada: lo que va antes del punto es JSON en base64. La firma impide cambiarlo, no leerlo."
    },
    {
      "mito": "Con Max-Age=28800, la sesión dura como mucho ocho horas",
      "realidad": "Max-Age lo cumple el navegador y se renueva en cada commitSession. Quien copia la cookie la puede usar mientras el servidor acepte la firma. Por eso el taller guarda inicio y lo comprueba."
    },
    {
      "mito": "Al pulsar Salir, la sesión deja de valer",
      "realidad": "Con la sesión en la cookie, Salir solo pide al navegador que la borre. La misma cookie, copiada, siguió dando 200 después de salir."
    },
    {
      "mito": "Con HttpOnly, un XSS ya no puede hacer nada",
      "realidad": "No puede llevársela, pero un script inyectado hace peticiones desde la página y la cookie va con ellas. Evitar el XSS sigue siendo lo primero (lección 20)."
    },
    {
      "mito": "Si el usuario no existe, no hace falta ejecutar scrypt",
      "realidad": "Entonces el tiempo de respuesta diría qué usuarios existen. El taller lo ejecuta con una sal de relleno, y los dos casos tardan lo mismo."
    }
  ]
}
```

## Ejercicios: la lección 18 en el taller

Esta lección no tiene un ejercicio en la vista previa: en el navegador no hay `Set-Cookie`, ni servidor, ni cookies firmadas. Se practica en el taller, en el orden de los pasos, que es el de las dependencias: cada paso usa lo del anterior. Al final de cada uno, el test que se pone en verde, y un enlace al archivo terminado en la rama `solucion`. Ejecuta `npm run leccion -- 18` después de cada paso.

### Paso 1: los secretos (`app/config.server.ts`)

```tsx
// TODO (lección 18): lee, rota y valida SECRETO_SESION. Busca secrets en
// createCookieSessionStorage.
```

`secretosDeSesion(entorno)` devuelve la lista de secretos de `SECRETO_SESION`, separados por comas, sin espacios ni vacíos. En producción, sin la variable, lanza un error que diga `Falta SECRETO_SESION`, y si algún secreto tiene menos de 32 caracteres, otro que diga `32 caracteres`; en desarrollo, sin la variable, un secreto de desarrollo fijo. Test: **«usa un secreto de desarrollo y exige uno en producción»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/config.server.ts)

### Paso 2: el almacén (`app/sesiones.server.ts`)

```tsx
// TODO (lección 18): crea de forma diferida el almacén de cookies, con ocho
// horas de vida y sus atributos seguros. Busca createCookieSessionStorage.
```

`crearAlmacenDeSesiones(secretos)` con `createCookieSessionStorage<DatosSesion, DatosFlash>`: cookie `__sesion`, `httpOnly`, `sameSite: 'lax'`, `secure` solo en producción, `path: '/'`, ocho horas y los `secrets`. Después, un almacén que se crea en la primera llamada (no al importar) y las tres funciones `leerSesion`, `guardarSesion` y `cerrarSesion`. Tests: **«limita la cookie a ocho horas y activa Secure en producción»**, **«rechaza una cookie firmada que ha sido manipulada»** y **«acepta una cookie antigua durante la rotación de secretos»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/sesiones.server.ts)

### Paso 3: entrar (`app/seguridad.ts` y `app/routes/entrar.tsx`)

En `seguridad.ts`, completa el marcador `destinoProvisional(volver, porDefecto)`, el del `TODO (lección 18)`, con la comprobación de la lección 13: interpreta `volver` con `new URL(volver, 'http://interno.invalid')`, y devuelve `pathname + search + hash` solo si el origen sigue siendo ese y la ruta no empieza por `//`; si no, o si `new URL` lanza, o si `volver` está vacío, `porDefecto`. Los diez tests **«el destino provisional rechaza …»** lo comprueban, con `//malo.example`, `/.//malo.example`, `/\malo.example`, `javascript:alert(1)` y compañía. Importada como `destinoSeguro`, la cambiarás de golpe en la 20, que cuenta estos casos a fondo. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/seguridad.ts)

En `entrar.tsx`, los tres `TODO (lección 18)`: el `loader` (si ya hay sesión, redirige a `volver`), la `action` (Zod, `comprobarCredenciales`, el mismo mensaje con un 400, y si vale, `hospitaleroId` e `inicio` en la sesión y la redirección con el `Set-Cookie`) y el formulario, con `usuario`, `clave` y el campo oculto `volver`, sus `label` y el error con `role="alert"`. Tests: **«da el mismo 400 para usuario y contraseña incorrectos»** y **«entra, respeta volver y entrega una cookie protegida»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/entrar.tsx)

### Paso 4: el middleware (`app/middleware/hospitalero.server.ts` y `zona.tsx`)

```tsx
// TODO (lección 18): lee la sesión, rellena los contextos, protege toda la
// rama y persiste el flash consumido. Busca route middleware.
```

Y en `zona.tsx`, además del `TODO` del `middleware` y del `loader`:

```tsx
// TODO (lección 18): añade la cabecera con el nombre del hospitalero, «Salir»
// y la navegación de la zona.
```

Escribe `exigirHospitalero` como en la sección del middleware: sesión, hospitalero, caducidad con `inicio`, redirección con `volver` (y el borrado de la cookie, si llegó una que no vale), los dos contextos, `next()`, el `Set-Cookie` si la sesión ha cambiado y `private, no-store`. En `zona.tsx`, regístralo en `middleware`, haz que el `loader` devuelva el hospitalero del contexto y pinta la cabecera de la zona: su nombre, el formulario de «Salir» (`POST` a `/salir`) y la navegación (`<nav aria-label="Zona de hospitaleros">`) con «Reservas» y «Pernoctas (CSV)». El `reloadDocument` de ese enlace es de la lección 19. Tests: **«protege toda la zona con su middleware»**, **«el middleware redirige sin sesión y no llama a next»**, **«rechaza y destruye una sesión con más de ocho horas»**, **«guarda la sesión cuando next consume un flash»** y **«el middleware deja al hospitalero en el contexto y el flash se consume una vez»**. [Solución del middleware](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/middleware/hospitalero.server.ts) · [de `zona.tsx`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/zona.tsx)

### Paso 5: el turno y la llegada (`hoy.tsx` y `reserva.tsx`)

En `hoy.tsx`, el `loader` usa la noche de hoy en Sahagún (`hoyEnSahagun()`), el hospitalero y la sesión del contexto, y devuelve las reservas de la noche, las próximas no anuladas y el aviso *flash*. En `reserva.tsx`, el `loader` busca la reserva (404 con `data()` si no existe) y la `action` marca la llegada: 400 si la intención no es `llegada`, 409 si la reserva está anulada, y si todo va bien, `flash('aviso', 'Llegada marcada.')` y la redirección. El `TODO (lección 19)` de la subida lo dejas como está. Tests: **«hoy usa la fecha de Sahagún y devuelve las reservas esperadas»**, **«no marca la llegada de una reserva anulada y el flash no copia el nombre»** y **«la llegada deja un flash breve en la sesión»**. [Solución de `hoy.tsx`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/hoy.tsx) · [de `reserva.tsx`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/reserva.tsx)

### Paso 6: salir (`app/routes/salir.tsx`)

```tsx
// TODO (lección 18): destruye la sesión y redirige al inicio. Busca
// destroySession y Set-Cookie.
…
// TODO (lección 18): crea la página «Cerrar sesión» con un Form POST. Al ser
// una ruta de interfaz, React Router podrá comprobar su origen en la lección 20.
```

La `action`, con `destroySession`, y la página: un `<h1>` «Cerrar sesión» y un `<Form method="post">` con el botón «Cerrar sesión». Tests: **«salir devuelve una cookie que borra la sesión»** y **«salir es una página de confirmación y rechaza un POST de otro origen»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/salir.tsx)

### Comprueba

```text
$ npm run leccion -- 18

 Test Files  1 passed (1)
      Tests  26 passed (26)
```

Y en el navegador, con `npm run dev`: abre `/hospitaleros/reservas/r-1` en una ventana privada, acaba en `/entrar?volver=…`, entra como `marta` y vuelve a la reserva. Marca la llegada: el aviso sale una vez. En las herramientas de desarrollo (Aplicación, Cookies), la cookie `__sesion` tiene marcado HttpOnly y SameSite Lax, y `document.cookie` en la consola no la ve. Para ver `Secure`, repite las pruebas de `curl` de esta lección con `npm run build` y `npm start`, con `SECRETO_SESION="$(openssl rand -hex 32)"` delante. Sin la variable, `/entrar` responde 500 y la terminal dice por qué: `Error: Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.` La portada y `/albergue/` siguen respondiendo 200, porque no tocan la sesión. En todo el taller, `npm test` da ahora 53 tests en verde y 45 en rojo, los de las lecciones 19 a 22.

### Retos para seguir practicando

1. **Rota de verdad.** Arranca con un secreto, entra, y vuelve a arrancar con `"nuevo,viejo"` y después con `"nuevo"`. Comprueba con `curl` en qué momento deja de valer tu cookie, y por qué la de alguien que entró en medio sigue valiendo.
2. **Sesiones revocables.** Cambia `createCookieSessionStorage` por `createSessionStorage` con un archivo JSON (escritura atómica, como las reservas de la lección 16). Haz que «Salir» borre la sesión del archivo y comprueba que la cookie copiada ya no vale. ¿Qué pasa con el reto anterior?
3. **Un aviso al entrar.** Al iniciar sesión, deja un *flash* «Buen turno, Marta» y píntalo en el listado. ¿Cuál de las dos funciones manda el `Set-Cookie`, la `action` de `/entrar` o el middleware?
4. **Cinco intentos.** Cuenta los intentos fallidos por usuario en un `Map` y, tras cinco en diez minutos, responde un 429 con el mismo formulario. ¿Qué pasa si el servidor se reinicia, o si hay dos copias?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación y referencias",
  "recursos": [
    {
      "titulo": "Sessions and Cookies",
      "descripcion": "Los almacenes de sesiones, get, set, flash y unset, el ejemplo de entrar y salir, firmar cookies y rotar los secretos.",
      "url": "https://reactrouter.com/explanation/sessions-and-cookies",
      "etiqueta": "React Router"
    },
    {
      "titulo": "createCookieSessionStorage",
      "descripcion": "La referencia del almacén que guarda la sesión entera en la cookie.",
      "url": "https://reactrouter.com/api/utils/createCookieSessionStorage",
      "etiqueta": "React Router"
    },
    {
      "titulo": "createCookie",
      "descripcion": "La referencia de createCookie: opciones, parse, serialize e isSigned.",
      "url": "https://reactrouter.com/api/utils/createCookie",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Middleware",
      "descripcion": "Middleware de servidor, context y el patrón de autenticación.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "React Router"
    },
    {
      "titulo": "GHSA-9583-h5hc-x8cw",
      "descripcion": "El aviso de createFileSessionStorage con cookies sin firmar: versiones afectadas y corregidas.",
      "url": "https://github.com/remix-run/react-router/security/advisories/GHSA-9583-h5hc-x8cw",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Session Management Cheat Sheet",
      "descripcion": "Caducidad absoluta y por inactividad, cierre de sesión y atributos de la cookie, según OWASP.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "Set-Cookie",
      "descripcion": "HttpOnly, Secure, SameSite, Max-Age, Path y el resto de atributos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      "etiqueta": "MDN"
    }
  ]
}
```
