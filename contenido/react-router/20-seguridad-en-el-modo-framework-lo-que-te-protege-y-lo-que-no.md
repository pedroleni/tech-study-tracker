# Seguridad en el modo framework: lo que te protege y lo que no

- **Módulo:** Modo framework
- **Slug:** `seguridad-en-el-modo-framework-lo-que-te-protege-y-lo-que-no` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [Security](https://reactrouter.com/how-to/security) + [react-router.config.ts: allowedActionOrigins](https://reactrouter.com/api/framework-conventions/react-router.config.ts) + [Error Boundaries: Error Sanitization](https://reactrouter.com/how-to/error-boundary) + [Sessions and Cookies: Signing cookies](https://reactrouter.com/explanation/sessions-and-cookies) + [Avisos de seguridad del repositorio](https://github.com/remix-run/react-router/security/advisories) — ver `contenido/react-router/TEMARIO.md` #20
- **Requiere:** Las lecciones 14 a 19 de esta ficha (el taller, hasta la 19), la 10 (middleware) y el proyecto 13. De React, la 81 y la 82 (metadatos y seguridad), la 85 (variables de entorno) y la 102 (autenticación en una SPA)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

El taller ya tiene casi todo lo que necesita una app de verdad: sesiones con cookie (18), una zona protegida por un middleware, rutas de recursos con un CSV de datos personales y un webhook (19). Y todo eso está en internet, al alcance de cualquiera que sepa escribir un `curl`. Esta lección repasa **lo que React Router hace por ti** en seguridad y, sobre todo, **lo que no hace**, que es más de lo que parece.

Lo que te da hecho, sin escribir nada:

- **Rechaza los envíos desde otras webs** a las `action` de las rutas de interfaz (desde la 7.12).
- **Sanea los errores en producción**: el navegador no ve el mensaje ni la pila de un `Error` del servidor.
- **Escapa el JSON** que pones en un `script:ld+json` de `meta` (desde la 7.9).

Lo que es cosa tuya:

- **Validar los destinos que vienen de fuera**, como `?volver=`. Es el centro de la lección, porque es fácil hacerlo casi bien: este mismo temario lo hizo casi bien en cuatro lecciones.
- **No meter en los metadatos lo que escribe el usuario.**
- **Una CSP con *nonce***, por petición, y saber dónde deja de funcionar.
- **Firmar las cookies**, guardar los secretos en módulos `.server` y no lanzar con `data()` lo que no quieres enseñar.

Todo lo que cuenta la lección está comprobado contra el taller, con `curl` contra el servidor de producción (`npm run build` y `npm start`) y con Chromium. Los ataques son de verdad, pero contra tu propia copia, en tu ordenador.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién te protege de qué",
  "roles": [
    {
      "etiqueta": "React Router",
      "rol": "Origen de los envíos, errores saneados y ld+json",
      "descripcion": "Rechaza con un 400 un POST a una action de interfaz desde otro origen, oculta el mensaje de un Error en producción y escapa el JSON de meta. Solo si tienes una versión con los parches."
    },
    {
      "etiqueta": "Tu código",
      "rol": "Destinos, metadatos, secretos y lo que lanzas",
      "descripcion": "Qué es una ruta interna, qué texto llega a un title, qué módulo puede ver un secreto y qué datos viajan en un data() lanzado. El router no puede saberlo."
    },
    {
      "etiqueta": "El navegador",
      "rol": "Cookies y CSP",
      "descripcion": "Cumple HttpOnly, SameSite y la Content-Security-Policy que le mandas. Si no le mandas nada, no protege nada."
    },
    {
      "etiqueta": "El proxy o el CDN",
      "rol": "HTTPS y lo que no pasa por tu servidor",
      "descripcion": "Las páginas prerenderizadas se sirven como archivos: las cabeceras de seguridad que necesiten las tiene que poner quien las sirve."
    }
  ]
}
```

## Dónde estás en el taller

Vienes de la lección 19, con el taller del [repositorio](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`) en el estado en que la dejaste: 72 tests en verde y 26 en rojo. Los 13 de esta lección están en rojo:

```text
$ npm run leccion -- 20

 Test Files  1 failed (1)
      Tests  13 failed (13)
```

Los `TODO (lección 20)` están en cuatro archivos: `app/seguridad.ts` (`destinoSeguro`), `react-router.config.ts` (`allowedActionOrigins`), `app/routes/hospitaleros/reserva.tsx` (un `<title>`) y `app/entry.server.tsx` (las cabeceras y la CSP). La lección va tema a tema y, al final, los pasos del taller los recorren en orden.

## Envíos desde otra web: `allowedActionOrigins`

Un formulario en `https://evil.example` puede tener `action="https://albergue-el-cea.es/reservar"` y `method="post"`: el navegador lo envía sin preguntar. Es la base del **CSRF** (*cross-site request forgery*, falsificar una petición desde otro sitio): una web ajena hace que tu navegador mande algo a la tuya.

La cookie de sesión del taller ya lleva `SameSite=Lax` (lección 18), así que en un `POST` desde otra web el navegador no la manda, y la zona de hospitaleros queda a salvo por ese lado. Pero `/reservar` es público: no necesita cookie. Sin más protección, cualquier web podría hacer que sus visitantes reservaran camas en El Cea sin saberlo.

Desde la 7.12, **React Router rechaza los envíos de documento a las `action` de las rutas de interfaz cuando la cabecera `Origin` no es la del propio servidor**. Llegó con un aviso de seguridad, [GHSA-h5cw-625j-3rxh](https://github.com/remix-run/react-router/security/advisories/GHSA-h5cw-625j-3rxh) (CVE-2026-22030, gravedad media, 8 de enero de 2026): hasta entonces, la 7 aceptaba esos envíos. Con el taller al terminar esta lección, en producción, esto respondieron `/entrar` (con las credenciales buenas de `marta`) y `/reservar` a distintas cabeceras `Origin`:

```text
POST /entrar  Origin: http://localhost:3237       (el mismo)       302  entra
POST /entrar  Origin: https://evil.example                         400
POST /entrar  Origin: null                                         400
POST /entrar  Origin: https://localhost:3237      (mismo, https)   400
POST /entrar  sin cabecera Origin                                  302  entra
POST /reservar  Origin: http://localhost:3237                      201
POST /reservar  Origin: https://evil.example                       400
```

En la terminal del servidor, cada rechazo deja el error y su pila (la quitas en la lección 22, cuando `handleError` pase a escribir una línea JSON):

```text
Error: The `request.url` origin does not match `origin` header from a forwarded action request. Aborting the action.
    at throwIfPotentialCSRFAttack (file:///…/node_modules/react-router/dist/production/lib/actions.js:27:67)
    at handleDocumentRequest (file:///…/node_modules/react-router/dist/production/lib/server-runtime/server.js:212:4)
    …
POST /reservar 400 - - 0.478 ms
```

Es decir: «el origen de request.url no coincide con la cabecera origin; se cancela la action». La `action` no llega a ejecutarse.

Dos filas de la tabla merecen una explicación.

**La cuarta, el mismo servidor con `https`, da 400.** La comprobación llegó en la 7.12, la 7.13 cambió su respuesta de 500 a 400 y la 8.3.1 la hizo más estricta. En la 8.5.0 compara el origen entero, con el protocolo. Y eso es justo lo que pasará en producción: el albergue irá detrás de un proxy que pone el HTTPS (casi todos los servicios donde se despliega un contenedor lo hacen, lección 22). El navegador dirá `Origin: https://albergue-el-cea.es`, pero `react-router-serve` recibe la petición por HTTP desde el proxy y construye `request.url` con `http://`. **Todos los formularios responderían 400.** Lo comprobamos simulando el proxy con `curl`, con `Host: albergue-el-cea.es` y `Origin: https://albergue-el-cea.es`: sin `allowedActionOrigins`, 400; con él, 302. Para eso está la opción:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  // Detrás del proxy HTTPS el servidor puede ver HTTP; se autoriza el host\n  // público para que esa diferencia no bloquee los formularios legítimos.\n  allowedActionOrigins: ['albergue-el-cea.es'],",
  "anotaciones": [
    {
      "fragmento": "allowedActionOrigins: ['albergue-el-cea.es'],",
      "nota": "Hosts, sin protocolo. Admite comodines: *.albergue-el-cea.es para un nivel de subdominio y **.albergue-el-cea.es para varios. Va en el build: cambiarlo exige volver a construir, o ponerlo en un servidor propio sobre el build (lo explica la documentación de la opción)."
    },
    {
      "fragmento": "// Detrás del proxy HTTPS el servidor puede ver HTTP;",
      "nota": "Otra forma de arreglarlo es que el servidor confíe en las cabeceras X-Forwarded-Proto y X-Forwarded-Host del proxy. react-router-serve no lo hace; un servidor de Express a medida, sí puede."
    }
  ]
}
```

**La quinta, sin `Origin`, entra.** Los navegadores mandan siempre `Origin` en un `POST` de formulario; un programa no tiene por qué. Esta comprobación protege a tus usuarios de webs ajenas, no a tu servidor de cualquiera con un `curl`: eso es cosa de la sesión, de validar en el servidor y, si hace falta, de limitar los intentos.

Y un límite que ya conoces de la 19: **no se aplica a las rutas de recursos**. Lo dice la documentación de la opción y lo comprobamos: un `POST /api/avisos` con `Origin: https://evil.example` llegó a la `action` y respondió 401, el de su token, no el 400 del origen. Por eso el webhook se protege con su `Authorization: Bearer`. Hubo además un aviso de seguridad para `PUT`, `PATCH` y `DELETE` ([GHSA-84g9-w2xq-vcv6](https://github.com/remix-run/react-router/security/advisories/GHSA-84g9-w2xq-vcv6), arreglado en la 7.15.1): la comprobación no los cubría. El mismo límite explica un detalle de la lección 18: **`salir.tsx` tiene componente**, una página «Cerrar sesión» con su botón, aunque el enlace de la cabecera ya hace el `POST`. Una ruta sin componente es una ruta de recursos, y la comprobación del origen no se le aplicaría. Compruébalo: quita un momento el componente de `salir.tsx`, deja solo la `action`, y manda con la sesión de `marta` un envío desde otro origen:

```text
$ curl -s -o /dev/null -D - -X POST http://localhost:3238/salir -H 'Origin: https://evil.example' -H "Cookie: __sesion=…"
HTTP/1.1 302 Found
location: /
set-cookie: __sesion=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax
```

Un 302, la `action` ejecutada y la orden de borrar la cookie: cualquier web podría intentar cerrar la sesión de un hospitalero con un formulario oculto. Con `SameSite=Lax`, el navegador no mandaría la cookie en ese envío, pero la respuesta trae igualmente la orden de borrarla. Vuelve a poner el componente: `/salir` es otra vez una ruta de interfaz, y el mismo envío desde otro origen responde `400` (un test de la 18 lo vigila). **Una `action` que cambia algo de quien la llama no debería vivir en una ruta de recursos.**

## Redirecciones abiertas con `?volver=`

Repaso rápido, porque ya lo viste en la lección 10, en el proyecto 13 y en la 102 de React: el middleware de la zona manda a quien no tiene sesión a `/entrar?volver=/hospitaleros/reservas/r-1`, y al entrar, `/entrar` lo devuelve allí. Pero `?volver=` está en la URL, y cualquiera puede fabricar un enlace. Si `/entrar` redirige a lo que diga `volver` sin mirar, un correo con un enlace a la página de entrar **de verdad** puede acabar, después de que el hospitalero escriba su contraseña en la web **de verdad**, en una copia falsa que le pide «confirmar los datos». Es una **redirección abierta**, y `destinoSeguro` existe para evitarla.

La 13 y la 24 ya te enseñaron la versión con `new URL`. Aquí vas a ver por qué es tan fácil quedarse a medias, el ataque contra una versión que parece buena y todo lo que tiene que comprobar la buena.

### Un error real: «comprobar el origen basta»

La primera idea es mirar si `volver` empieza por `/`. Falla con `//evil.example` y con `/\evil.example`: empiezan por barra, pero el navegador las lee como direcciones de otro dominio (en `http` y `https`, la barra invertida cuenta como una barra normal). La segunda idea, mucho mejor, es la de la 13: **no adivinar cómo interpreta el navegador una dirección, sino pedírselo a `new URL`**, que usa el mismo analizador, y comprobar que el origen es el tuyo:

```tsx
export function destinoSeguro(volver: FormDataEntryValue | null, porDefecto: string): string {
  if (typeof volver !== 'string' || volver === '') return porDefecto
  let destino: URL
  try {
    destino = new URL(volver, 'http://interno.invalid')
  } catch {
    return porDefecto
  }
  // Solo el origen: //evil.example, /\evil.example y https://evil.example tienen otro.
  if (destino.origin !== 'http://interno.invalid') return porDefecto
  return destino.pathname + destino.search + destino.hash
}
```

Parece impecable: interpreta como el navegador, compara orígenes y, encima, devuelve lo que ha comprobado y no el texto que llegó. **Esta versión estuvo en cuatro lecciones de esta web**, revisadas y con sus tests en verde, hasta que una prueba por HTTP contra el taller la pilló. Ya están corregidas. No es un descuido de principiante: es el error que comete casi todo el mundo que sabe lo bastante para usar `new URL`.

El problema es que `new URL` no solo interpreta: **normaliza**. Resuelve los segmentos `.` y `..` de la ruta (también escritos como `%2e`), y una ruta de tu origen puede acabar convertida en otra cosa. Esto da `new URL(volver, 'http://interno.invalid')` en Node 24 para cada entrada (escrita entre comillas, como la escribe `JSON.stringify`: `"/\\evil.example"` es `/\evil.example`, con una sola barra invertida, y `"\t/x"` empieza por un tabulador):

```text
volver                     origen                   pathname + search + hash
"/hospitaleros"            http://interno.invalid   "/hospitaleros"
"//evil.example"           http://evil.example      "/"
"/\\evil.example"          http://evil.example      "/"
"/.//evil.example"         http://interno.invalid   "//evil.example"
"/a/..//evil.example"      http://interno.invalid   "//evil.example"
"/%2e//evil.example"       http://interno.invalid   "//evil.example"
"/..//evil.example/x"      http://interno.invalid   "//evil.example/x"
"/%2e%2e//evil.example"    http://interno.invalid   "//evil.example"
"javascript:alert(1)"      null                     "alert(1)"
"\t/x"                     http://interno.invalid   "/x"
```

Las cinco del medio tienen **tu origen**, así que pasan la comprobación. Y lo que la función devuelve, ya normalizado, empieza por `//`: una dirección sin protocolo, de otro dominio. Fíjate en la ironía: el texto que llegó, `/.//evil.example`, era inofensivo (el navegador lo resolvería como `https://albergue-el-cea.es//evil.example`, dentro de tu web). **Lo peligroso lo fabricó la propia función** al devolver la versión normalizada.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La versión vieja de destinoSeguro (solo comprueba el origen),\n// en la action de /entrar:\n//   const volver = destinoSeguro(formulario.get('volver'), href('/hospitaleros'))\n//   return redirect(volver, { headers: { 'Set-Cookie': … } })\n\n// Marta entra con este campo oculto:\nvolver = '/a/..//evil.example'\n\n// ¿Qué cabecera Location lleva el 302?",
  "opciones": [
    "Location: /hospitaleros, porque /a/..//evil.example no es una ruta del albergue",
    "Location: /a/..//evil.example, el texto tal cual llegó",
    "Location: //evil.example, la ruta ya normalizada por new URL",
    "Ninguna: React Router lanza un error al redirigir a una ruta con .."
  ],
  "correcta": 2,
  "explicacion": "new URL resuelve el .. contra el segmento a, y lo que queda es la ruta //evil.example, con el origen interno: la comprobación del origen pasa. La función devuelve pathname más search más hash, //evil.example, y redirect lo pone tal cual en Location. Comprobado con curl contra el taller. El navegador lee //evil.example como una dirección de otro dominio con el protocolo de la página."
}
```

### El ataque, con `curl`

Para verlo, pon esa versión vieja en `app/seguridad.ts` de una copia de tu taller (en la tuya no: ahí va la buena), construye y arranca el servidor de producción. Después, entra como `marta` con distintos valores de `volver`, mirando solo el estado y la cabecera `Location` de la respuesta:

```bash
curl -s -o /dev/null -D - -X POST http://localhost:3237/entrar \
  -H 'Origin: http://localhost:3237' \
  --data-urlencode usuario=marta --data-urlencode clave=camino2026 \
  --data-urlencode 'volver=/.//evil.example'
```

Con la versión vieja:

```text
volver                        respuesta
/hospitaleros/reservas/r-1    302 Found   location: /hospitaleros/reservas/r-1
//evil.example                302 Found   location: /hospitaleros
/\evil.example                302 Found   location: /hospitaleros
/.//evil.example              302 Found   location: //evil.example
/a/..//evil.example           302 Found   location: //evil.example
/%2e//evil.example            302 Found   location: //evil.example
/..//evil.example             302 Found   location: //evil.example
/%2e%2e//evil.example         302 Found   location: //evil.example
```

Las dos clásicas se paran; las cinco de la normalización, no. Y el ataque realista ni siquiera necesita un `POST`. Un hospitalero que ya tiene sesión abre el enlace de un correo, `/entrar?volver=%2F.%2F%2Fevil.example%2Fhospitaleros`. El `loader` de `/entrar` ve la sesión y redirige directamente:

```text
$ curl -s -o /dev/null -D - -H "Cookie: __sesion=…" 'http://localhost:3237/entrar?volver=%2F.%2F%2Fevil.example%2Fhospitaleros'
HTTP/1.1 302 Found
location: //evil.example/hospitaleros
```

En Chromium, con la sesión iniciada, abrir ese enlace (en la prueba, con `/x` al final) terminó en una petición a `http://evil.example/x`. Y lo mismo navegando desde la propia app, con el router: pidió `/entrar.data?volver=…`, recibió la redirección y salió a `http://evil.example/x`. **React Router 8.5.0, con todos los parches, te lleva a otra web si tu código le dice que vayas a `//evil.example`**: para el router es una redirección externa como cualquier otra, de las que se permiten a propósito. El router no puede saber que tú no lo querías.

### La versión buena: la del taller

`destinoSeguro` del taller se escribe en esta lección. Es más larga que la vieja, y cada línea para un ataque distinto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "/** L20: solo acepta destinos internos, sin ambigüedades para el navegador. */\nexport function destinoSeguro(volver: FormDataEntryValue | null, porDefecto: string): string {\n  // `//` cambia de origen, `/\\` se interpreta distinto entre navegadores y los\n  // controles permiten inyectar cabeceras; por eso se rechazan antes de parsear.\n  if (typeof volver !== 'string' || volver === '' || /[\\u0000-\\u001f\\u007f\\\\]/.test(volver)) return porDefecto\n  // Solo una barra inicial representa una ruta interna inequívoca.\n  if (!/^\\/(?!\\/)/.test(volver)) return porDefecto\n  let destino: URL\n  try {\n    destino = new URL(volver, 'http://interno.invalid')\n    // Comprobar el origen no basta: URL normaliza los segmentos `.` y `..`, y algunas entradas\n    // internas acaban convertidas en una ruta que empieza por `//`.\n    if (destino.origin !== 'http://interno.invalid') return porDefecto\n    if (/[\\u0000-\\u001f\\u007f\\\\]/.test(decodeURIComponent(destino.pathname))) return porDefecto\n  } catch {\n    return porDefecto\n  }\n  const normalizado = destino.pathname + destino.search + destino.hash\n  if (!/^\\/(?!\\/)/.test(normalizado)) return porDefecto\n  // Evita bucles al volver desde las pantallas que crean o destruyen la sesión.\n  if (destino.pathname === '/entrar' || destino.pathname === '/salir') return porDefecto\n  return normalizado\n}",
  "anotaciones": [
    {
      "fragmento": "if (typeof volver !== 'string' || volver === '' || /[\\u0000-\\u001f\\u007f\\\\]/.test(volver)) return porDefecto",
      "nota": "Antes de interpretar nada: fuera los caracteres de control y la barra invertida. new URL se come en silencio el tabulador y los saltos de línea (\\t/x queda en /x), y la barra invertida es la de /\\evil.example. Una ruta interna legítima no lleva ninguno."
    },
    {
      "fragmento": "if (!/^\\/(?!\\/)/.test(volver)) return porDefecto",
      "nota": "Una barra y solo una al principio. Para //evil.example, https://evil.example y javascript:alert(1) ya no hace falta nada más."
    },
    {
      "fragmento": "destino = new URL(volver, 'http://interno.invalid')",
      "nota": "Una base inventada, con el dominio reservado .invalid, que nunca existirá. Solo sirve para que new URL resuelva la ruta; el destino se devuelve sin origen."
    },
    {
      "fragmento": "if (destino.origin !== 'http://interno.invalid') return porDefecto",
      "nota": "La comprobación de siempre. Con las dos de arriba ya no debería fallar nunca, pero cuesta una línea y protege si alguien las cambia."
    },
    {
      "fragmento": "if (/[\\u0000-\\u001f\\u007f\\\\]/.test(decodeURIComponent(destino.pathname))) return porDefecto",
      "nota": "Lo mismo, después de decodificar: /%0d%0aSet-Cookie lleva un salto de línea escrito como %0d%0a. En Location sale codificado e inofensivo, pero cualquier código que lo decodifique después recibe dos líneas. Si decodeURIComponent lanza (un % suelto), el catch devuelve el destino por defecto."
    },
    {
      "fragmento": "if (!/^\\/(?!\\/)/.test(normalizado)) return porDefecto",
      "nota": "La línea que le faltaba a la versión vieja: la misma comprobación de una sola barra, sobre la ruta ya normalizada. Aquí caen /.//evil.example, /a/..//evil.example, /%2e//evil.example y sus parientes."
    },
    {
      "fragmento": "if (destino.pathname === '/entrar' || destino.pathname === '/salir') return porDefecto",
      "nota": "Volver a /entrar después de entrar es un bucle, y volver a /salir cerraría la sesión recién abierta. Se mira el pathname normalizado: /hospitaleros/../entrar también es /entrar."
    },
    {
      "fragmento": "return normalizado",
      "nota": "Se devuelve lo que se ha comprobado, ya normalizado. Esa idea era buena; lo que faltaba era comprobar lo que se devuelve."
    }
  ]
}
```

La usan los tres sitios por donde entra un `volver`: el `loader` de `/entrar` (para el campo oculto y para redirigir a quien ya tiene sesión), su `action` (el campo oculto también se puede cambiar) y el middleware de la zona (que construye el `volver` con la ruta pedida). La misma prueba de antes, con la versión del taller:

```text
volver                        respuesta
/hospitaleros/reservas/r-1    302 Found   location: /hospitaleros/reservas/r-1
//evil.example                302 Found   location: /hospitaleros
/\evil.example                302 Found   location: /hospitaleros
/.//evil.example              302 Found   location: /hospitaleros
/a/..//evil.example           302 Found   location: /hospitaleros
/%2e//evil.example            302 Found   location: /hospitaleros
/..//evil.example             302 Found   location: /hospitaleros
/%2e%2e//evil.example         302 Found   location: /hospitaleros
/entrar                       302 Found   location: /hospitaleros
```

Y el enlace con sesión, `?volver=%2F.%2F%2Fevil.example%2Fhospitaleros`, da `location: /hospitaleros`.

**La regla: valida lo que devuelves, no lo que te llega.** Si tu función transforma la entrada (normaliza, decodifica, recorta), la comprobación tiene que ir después de la transformación, sobre el resultado que de verdad vas a usar.

### Lo que ya tenías y lo que le falta

Al empezar esta lección, `entrar.tsx` y el middleware usan `destinoProvisional`, de `app/seguridad.ts`: la versión de la lección 13, con `new URL`, el mismo origen y una ruta normalizada que no empiece por `//`. Los cinco casos de la normalización ya los para (los tests de la 18 lo comprueban). Pero contra el servidor del taller en ese estado, al entrar como `marta`:

```text
volver               respuesta
/entrar              302 Found   location: /entrar
/salir               302 Found   location: /salir
/%0d%0aSet-Cookie    302 Found   location: /%0d%0aSet-Cookie
\t/hospitaleros      302 Found   location: /hospitaleros
```

Recién entrada, otra vez a la pantalla de entrar, o a la de cerrar sesión: un bucle absurdo. Un salto de línea codificado que sale tal cual en `Location`. Y un tabulador que `new URL` se come sin avisar. Nada de eso saca a nadie del albergue, pero son entradas que una ruta interna legítima nunca trae, y `destinoSeguro` las rechaza todas.

### Los avisos del propio router

Esto no es solo un problema de tu código: React Router ha tenido su propia ristra de avisos con rutas que vienen de fuera. Los arreglos están en el router, en cómo `navigate()`, `<Link>` y `redirect()` interpretan lo que les pasas, y **ninguno te libra de validar `volver`**: todos dicen, de una forma u otra, que el problema aparece cuando la ruta sale de algo que controla un atacante.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Avisos de React Router sobre redirecciones y rutas de fuera",
  "items": [
    {
      "fecha": "8 ene 2026",
      "titulo": "GHSA-9jcx-v3wj-wh4m (media)",
      "texto": "Una ruta fabricada por un atacante que llega a navigate(), a Link o a redirect() puede acabar en una navegación a otra web. Solo si pasas contenido no fiable a esas funciones. Afecta a la 6 hasta la 6.30.1 y a la 7 hasta la 7.9.5. CVE-2025-68470."
    },
    {
      "fecha": "8 ene 2026",
      "titulo": "GHSA-2w69-qvjg-hvjx (alta)",
      "texto": "XSS por redirecciones abiertas: una redirección desde un loader o una action, en modo framework, datos o RSC, puede llevar a una URL que ejecuta JavaScript. Solo si construyes la ruta con contenido no fiable. Parche en la 7.12.0. CVE-2026-22029."
    },
    {
      "fecha": "2 jun 2026",
      "titulo": "GHSA-2j2x-hqr9-3h42 (media)",
      "texto": "Una redirección a una ruta de tu origen que empieza por // se reinterpreta como dirección sin protocolo, de otro dominio. Es justo el caso de esta lección. Parches en la 7.14.1 y la 6.30.4. CVE-2026-40181."
    },
    {
      "fecha": "22 jul 2026",
      "titulo": "GHSA-jjmj-jmhj-qwj2 (media)",
      "texto": "Con una redirección abierta en la app, un enlace fabricado puede llevar a otra web o a XSS. Afecta a la 7.9.6 a 7.12.0 y a react-router-dom 6.30.2 a 6.30.4. CVE-2026-53668."
    },
    {
      "fecha": "22 jul 2026",
      "titulo": "GHSA-wrjc-x8rr-h8h6 (media)",
      "texto": "El arreglo de GHSA-9jcx estaba incompleto. Afecta a toda la 6 y a la 7 antes de la 7.18.0, y la 6 no tiene parche: solo se cierra subiendo a la 7.18 o a la 8. Es un buen motivo para migrar (lecciones 23 y 25). CVE-2026-53669."
    }
  ]
}
```

Ya lo viste con Chromium: con la 8.5.0, que trae todos esos parches, `redirect('//evil.example')` sigue llevando a `evil.example`. Los parches cierran lo que el router hacía mal con rutas raras; decidir que `//evil.example` no es un destino válido para tu app es trabajo de `destinoSeguro`.

## XSS en los metadatos: `meta` y `script:ld+json`

La función `meta` de un módulo de ruta (lección 14) puede devolver, además de etiquetas `<meta>`, un `script:ld+json`: los datos estructurados que leen los buscadores, como un objeto que React Router convierte en `<script type="application/ld+json">`. Hasta la 7.8.2, ese JSON se metía en el HTML sin escapar. Si llevaba un texto que venía del usuario con `</script><script>…`, el navegador cerraba el primer `script` y ejecutaba el segundo: XSS en el renderizado del servidor. Es [GHSA-3cgp-3xvw-98x8](https://github.com/remix-run/react-router/security/advisories/GHSA-3cgp-3xvw-98x8) (alta, CVE-2025-59057), arreglado en la 7.9.0. Solo afectaba al modo framework.

Lo comprobamos en la 8.5.0 con una ruta de prueba en una copia del taller: un `loader` que devuelve el `?nombre=` de la URL, un `meta` que lo mete en un `script:ld+json`, y el mismo dato escrito a mano en el componente con `dangerouslySetInnerHTML`, como harías si no conocieras `meta`. Con `?nombre=</script><script>alert(document.cookie)</script>`, el HTML que llega:

```text
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"\u003c/script\u003e\u003cscript\u003ealert(document.cookie)\u003c/script\u003e"}</script>
<script type="application/ld+json">{"@type":"Person","name":"</script><script>alert(document.cookie)</script>"}</script>
```

El primero es el de `meta`: los `<` salen como `\u003c`, que en JSON significa lo mismo y en HTML no cierra nada. El segundo es el escrito a mano: `JSON.stringify` no escapa `<`, y el `</script>` cierra la etiqueta de verdad. **El router te protege en lo que hace él; lo que escribes con `dangerouslySetInnerHTML` es cosa tuya** (lección 82 de React).

En Chromium, ese segundo script no llegó a ejecutarse, por la CSP que vas a escribir enseguida:

```text
[error] Executing inline script violates the following Content Security Policy directive 'script-src 'self' 'nonce-WOC7oRXgbfm2c3AYA+HP3A==''. Either the 'unsafe-inline' keyword, a hash ('sha256-X6WoVv8sUlFXk0r+MI/R+p2PsbD1k74Z+jLIpYAjIgE='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
```

Es decir: «ejecutar un script en línea viola la directiva script-src de la CSP; se ha bloqueado». En desarrollo, donde el taller no pone la CSP, la misma página abrió el `alert` con `localhost`. La CSP es la segunda barrera: no sustituye a escapar, pero para lo que se te escape.

La regla del taller va más allá del XSS: **ningún metadato lleva texto que haya escrito el usuario**. El título, la descripción o la tarjeta para compartir acaban en sitios que no controlas: el historial, las pestañas, las vistas previas de un chat, los registros de un proxy. La ficha de una reserva tenía `<title>{`Reserva de ${reserva.nombre} | El Cea`}</title>`: el nombre de un peregrino en el historial del ordenador del albergue, que usa todo el turno. En el taller pasa a ser el identificador: `Reserva r-1 | El Cea`. Y para los metadatos, mejor las etiquetas `<title>` y `<meta>` de React 19 dentro del componente (lección 81 de React), como hace la página de cada etapa, que escapan lo que pintan como cualquier otro texto de React.

## CSP con *nonce*: por petición, en `entry.server.tsx`

La **Content-Security-Policy** es una cabecera con la que le dices al navegador de dónde puede cargar cada cosa. Con `script-src 'self'`, solo los scripts de tu origen. Pero una página del modo framework lleva varios scripts **en línea**: los datos de la hidratación, el de `<ScrollRestoration>`, el que arranca la app. Para permitirlos sin abrir la puerta a cualquier script en línea (`'unsafe-inline'`), se usa un ***nonce***: un valor aleatorio, distinto en cada petición, que va en la cabecera y en el atributo `nonce` de cada script legítimo. Un script inyectado no lo conoce, y el navegador lo bloquea.

La documentación de *Security* dice dónde va el *nonce* en el modo framework: en la prop `nonce` de `<ServerRouter>`, que lo pasa a `<Scripts>` y a `<ScrollRestoration>`, y en la opción `nonce` de `renderToPipeableStream`, para los scripts que añade React al hacer *streaming*. En el taller, `entry.server.tsx` lo genera y lo reparte:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function cabecerasDeSeguridad(nonce: string, entorno = process.env.NODE_ENV): Record<string, string> {\n  const cabeceras: Record<string, string> = {\n    'X-Content-Type-Options': 'nosniff',\n    'Referrer-Policy': 'strict-origin-when-cross-origin',\n  }\n  // Vite necesita scripts adicionales y ws: para HMR; la política estricta\n  // se aplica al build de producción, que no necesita esas excepciones.\n  if (entorno === 'production') {\n    cabeceras['Content-Security-Policy'] =\n      `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self'; ` +\n      `img-src 'self' data:; object-src 'none'; base-uri 'none'; ` +\n      `frame-ancestors 'none'; form-action 'self'`\n  }\n  return cabeceras\n}\n\nexport default function handleRequest(\n  request: Request,\n  responseStatusCode: number,\n  responseHeaders: Headers,\n  routerContext: EntryContext,\n  _loadContext: RouterContextProvider,\n) {\n  // L20: un nonce nuevo por petición se pasa tanto al router como al stream de React.\n  const nonce = randomBytes(16).toString('base64')\n  for (const [nombre, valor] of Object.entries(cabecerasDeSeguridad(nonce)))\n    responseHeaders.set(nombre, valor)\n\n  if (request.method.toUpperCase() === 'HEAD')\n    return new Response(null, { status: responseStatusCode, headers: responseHeaders })\n\n  return new Promise<Response>((resolve, reject) => {\n    let documentoPreparado = false\n    const agente = request.headers.get('user-agent')\n    // L17: los bots esperan onAllReady para recibir el documento completo; los\n    // navegadores pueden empezar con onShellReady y aprovechar el streaming.\n    const alEstarListo: keyof RenderToPipeableStreamOptions =\n      (agente && isbot(agente)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'\n    let temporizador: ReturnType<typeof setTimeout> | undefined = setTimeout(\n      () => abort(),\n      streamTimeout + 1_000,\n    )\n    const { pipe, abort } = renderToPipeableStream(\n      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />,\n      {\n        nonce,",
  "anotaciones": [
    {
      "fragmento": "'X-Content-Type-Options': 'nosniff',",
      "nota": "Que el navegador no adivine el tipo de un archivo: un .csv con HTML dentro no se pinta como HTML. Va en todas las respuestas, también en desarrollo."
    },
    {
      "fragmento": "'Referrer-Policy': 'strict-origin-when-cross-origin',",
      "nota": "A otras webs solo les llega el origen de la página, no la ruta: /hospitaleros/reservas/r-1 no sale del albergue en la cabecera Referer."
    },
    {
      "fragmento": "if (entorno === 'production') {",
      "nota": "La CSP estricta, solo en producción. En desarrollo, Vite inyecta scripts para la recarga en caliente y abre un websocket (ws:), y esta política los bloquearía."
    },
    {
      "fragmento": "script-src 'self' 'nonce-${nonce}'",
      "nota": "Scripts del propio origen y los que lleven este nonce. Nada de unsafe-inline."
    },
    {
      "fragmento": "object-src 'none'; base-uri 'none'; ",
      "nota": "Sin plugins, y sin etiqueta base: una base inyectada cambiaría adónde apuntan todas las rutas relativas de la página."
    },
    {
      "fragmento": "frame-ancestors 'none'; form-action 'self'",
      "nota": "Nadie puede meter el albergue en un iframe (para engañar con clics por encima), y los formularios solo se envían a tu origen."
    },
    {
      "fragmento": "const nonce = randomBytes(16).toString('base64')",
      "nota": "Un nonce nuevo en cada petición: 16 bytes aleatorios de node:crypto. Si fuera fijo, un atacante lo leería en una página y lo copiaría en su script."
    },
    {
      "fragmento": "<ServerRouter context={routerContext} url={request.url} nonce={nonce} />",
      "nota": "Para los scripts del router: Scripts, ScrollRestoration y los datos de la hidratación. Lo probamos quitándolo: la CSP bloqueó cinco scripts en línea en /etapas y la página se quedó sin hidratar. En la línea siguiente, el mismo nonce para los scripts de React en renderToPipeableStream."
    }
  ]
}
```

Dos peticiones seguidas a la portada del servidor de producción. De la respuesta, las cabeceras de seguridad y cuántas veces sale cada *nonce* en el HTML:

```text
== GET /
HTTP/1.1 200 OK
content-security-policy: default-src 'self'; script-src 'self' 'nonce-EO02y0zniwh/XJQpI5E2SQ=='; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
nonces en el HTML:   13 nonce="EO02y0zniwh/XJQpI5E2SQ=="
== GET /
HTTP/1.1 200 OK
content-security-policy: default-src 'self'; script-src 'self' 'nonce-CU6OvuCoSGdyldTWjlA7zw=='; …
nonces en el HTML:   13 nonce="CU6OvuCoSGdyldTWjlA7zw=="
```

Un *nonce* distinto en cada petición, el mismo en la cabecera y en las 13 etiquetas que lo llevan. Así tiene que ser.

### Donde el *nonce* no llega: las páginas prerenderizadas

Ahora lo mismo con «El albergue», que se genera al construir (lección 17):

```text
== GET /albergue/
HTTP/1.1 200 OK
Cache-Control: public, max-age=0
Content-Type: text/html; charset=utf-8
nonces en el HTML:   16 nonce="d6aYffxI66d82gnKuec9Cw=="
== GET /albergue/
HTTP/1.1 200 OK
Cache-Control: public, max-age=0
Content-Type: text/html; charset=utf-8
nonces en el HTML:   16 nonce="d6aYffxI66d82gnKuec9Cw=="
```

**Ni CSP, ni `nosniff`, ni `Referrer-Policy`, y el mismo *nonce* las dos veces.** El HTML de `/albergue/` es un archivo, `build/client/albergue/index.html`, escrito durante `npm run build`, y ese *nonce* es el de la petición que lo generó: está 16 veces en el archivo. `react-router-serve` lo sirve como cualquier archivo estático, sin pasar por `handleRequest`, así que nadie pone las cabeceras. (Y `/albergue`, sin la barra final, responde primero `301 Moved Permanently` con `Location: /albergue/`: lo hace el servidor de archivos estáticos.)

No es un fallo de tu código: es lo que significa prerenderizar. Una página que se escribe una vez no puede tener un valor distinto en cada petición. Las salidas:

- **Que la CSP la ponga quien sirve los archivos**, el proxy o el CDN, y con ***hashes*** en vez de *nonce*: `script-src 'self' 'sha256-…'`, un *hash* por cada script en línea. `/albergue/index.html` lleva 8 scripts en línea, así que la política lleva 8 *hashes*, y cambian en cada build: hay que calcularlos después de construir (con un script, como en el reto 2) y pasarlos a la configuración del CDN.
- **No prerenderizar** las páginas que necesiten la CSP con *nonce*, y dejar que pasen por `handleRequest` como la portada.
- **Aceptarlo con conocimiento**: una página prerenderizada no tiene datos de nadie ni formularios que lean nada del usuario, así que el riesgo de XSS es mucho menor. Aun así, sin `frame-ancestors` se puede meter en un iframe.

En el taller se queda así, documentado en el README: las páginas prerenderizadas van sin CSP y, en producción, el proxy debería ponerla con *hashes*.

## Cookies firmadas: lo que garantiza la firma

La lección 18 creó la cookie de sesión con `secrets`, y ahí la firma pasó de puntillas. Mírala por dentro. Esto es lo que devolvió `POST /entrar` en producción:

```text
Set-Cookie: __sesion=eyJob3NwaXRhbGVyb0lkIjoiaC1tYXJ0YSIsImluaWNpbyI6MTc5MzEzMDk2ODk0NX0%3D.YYBHph1oO82fn6WqUDwcMnv3def%2FgSaE4cGHSVKQy0I; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax
```

El valor son dos partes separadas por un punto. La primera es el contenido de la sesión en base64, y **se lee sin ningún secreto**:

```text
{"hospitaleroId":"h-marta","inicio":1793130968945}
```

La segunda es la firma: un HMAC con SHA-256 del contenido y `SECRETO_SESION`. Cambia el `hospitaleroId` por otro, vuelve a codificarlo, deja la firma vieja y pide la zona:

```text
cookie original              GET /hospitaleros   200
hospitaleroId cambiado       GET /hospitaleros   302  → /entrar?volver=%2Fhospitaleros
```

La firma no cuadra con el contenido nuevo, y React Router trata la cookie como si no existiera. **Firmada no es cifrada: la firma impide cambiar la cookie, no leerla.** En `__sesion` solo va el id del hospitalero y la hora de entrada; nada que no pueda ver quien tiene la cookie. Si alguna vez necesitas guardar algo que no deba leerse, no lo pongas en la cookie: guárdalo en el servidor (`createSessionStorage` con un archivo o una base de datos) y deja en la cookie solo el id.

Sin `secrets`, cualquiera escribe en la cookie lo que quiera. El caso real de la lección 18, [GHSA-9583-h5hc-x8cw](https://github.com/remix-run/react-router/security/advisories/GHSA-9583-h5hc-x8cw) (crítico), era eso: con `createFileSessionStorage` y una cookie sin firmar, el id de la sesión servía para leer y escribir archivos fuera de la carpeta de sesiones.

## Los módulos `.server`: lo que nunca llega al navegador

Un módulo de ruta tiene código que corre en el servidor (`loader`, `action`, `middleware`, `headers`) y código que corre en los dos sitios (el componente). React Router quita del paquete del navegador las funciones de servidor y lo que solo ellas importan (lección 16). Pero si el componente usa algo de un módulo con secretos, ese módulo viaja al navegador entero, secretos incluidos.

**Un archivo que termina en `.server.ts` (o vive en una carpeta `.server/`) nunca puede acabar en el paquete del navegador: si algo lo intenta, el build falla.** Lo probamos importando `urlPublica` de `~/config.server` en el componente de una ruta de prueba:

```text
$ npx react-router build
✗ Build failed in 198ms
Build failed with 1 error:
[plugin react-router:dot-server]
Error: Server-only module referenced by client
    '~/config.server' imported by route 'app/routes/prueba.tsx'
  React Router automatically removes server-code from these exports:
    `loader`, `action`, `middleware`, `headers`
  But other route exports in 'app/routes/prueba.tsx' depend on '~/config.server'.
```

Es decir: «un módulo solo de servidor está referenciado desde el cliente; React Router quita el código de servidor de loader, action, middleware y headers, pero otras exportaciones de la ruta dependen de ~/config.server». En el taller, todo lo que toca secretos o archivos lleva `.server`: `config.server.ts`, `sesiones.server.ts`, `contexto.server.ts`, `datos/*.server.ts`, `errores.server.ts`. Con el build bueno, el secreto de desarrollo de `config.server.ts` aparece en un archivo de `build/server` y en ninguno de `build/client` (lo comprobamos con `grep -rl`).

`seguridad.ts`, en cambio, no lleva `.server`, y no hace falta: no tiene nada secreto, y una validación de rutas podría usarse en los dos lados.

## Errores saneados en producción, salvo los de `data()`

Cuando un `loader` lanza un `Error` en el servidor, React Router lo pinta en el `ErrorBoundary` más cercano, y para eso manda el error al navegador. En producción, **lo manda saneado**: sin el mensaje y sin la pila. Lo comprobamos con una ruta de prueba cuyo `loader` lanza `new Error('No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)')`, pidiendo sus datos como los pide el navegador al navegar (`/prueba.data`). En producción:

```text
[{"_1":2},"routes/prueba",{"_3":4},"error",["SanitizedError",5,6,-7],"Error","Unexpected Server Error"]
```

En desarrollo (`npm run dev`), el mismo error lleva el mensaje y la pila, con la ruta del archivo en tu disco:

```text
[{"_1":2},"routes/prueba",{"_3":4},"error",["SanitizedError",5,6,7],"Error","No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)","Error: No se pudo abrir /srv/el-cea/datos/reservas.json (clave interna 7f3a)\n    at loader (/Users/…/app/routes/prueba.tsx:7:32)\n…
```

El mensaje original no se pierde: está en la terminal del servidor, que es donde lo tiene que ver quien mantiene la app (lección 22). La página del error, en producción, solo dice lo que pone el `ErrorBoundary` de `root.tsx`, «Algo ha fallado».

**Lo que lanzas con `data()` no se sanea**, porque está pensado para enseñarse: es el 404 de una etapa que no existe o el 403 de una zona. El mismo `loader`, con `throw data({ mensaje: 'Solo para hospitaleros (dato lanzado con data)' }, { status: 403 })`, en producción:

```text
[{"_1":2},"routes/prueba",{"_3":4},"error",["ErrorResponse",5,6,7],{"_8":9},403,"Internal Server Error","mensaje","Solo para hospitaleros (dato lanzado con data)"]
```

Llega entero. (Y fíjate en el `statusText`: «Internal Server Error» para un 403, la trampa que vio la lección 8.) Así que la regla es simple: **en un `data()` lanzado va lo que el usuario puede leer**; nunca un mensaje de la base de datos, una ruta del disco o el objeto entero que te devolvió otro servicio.

## Los 22 avisos de seguridad de React Router

La lista completa está en la [pestaña de avisos del repositorio](https://github.com/remix-run/react-router/security/advisories). El 27 de octubre de 2026 tiene **22 avisos publicados, del 1 de abril de 2025 al 22 de julio de 2026**: uno crítico, once de gravedad alta, nueve media y uno baja. Los de esta lección ya los conoces. Los demás, por tipo:

- **Denegación de servicio**: tres en `/__manifest` y en las peticiones `.data` (una petición que hace trabajar al servidor sin límite), y uno por envenenar la caché forzando el SPA Mode.
- **XSS**: además del de `ld+json` y los de las redirecciones, uno en `<ScrollRestoration>` con SSR, uno en las redirecciones de una página prerenderizada y dos en los modos RSC.
- **Cabeceras y orígenes**: `Host` y `X-Forwarded-Host` manipulados en `@react-router/express` (el más antiguo, abril de 2025), y el CSRF de esta lección con su ampliación a `PUT`, `PATCH` y `DELETE`, y otra para los modos RSC.
- **Otros**: datos falsos en páginas prerenderizadas, inyección de constructores al hidratar, una cadena de dos pasos hasta ejecutar código en el servidor sobre una contaminación de prototipos que ya tuviera la app, y el de las sesiones en archivo de la 18.

Casi todos son del modo framework o de los modos RSC. Los de las redirecciones (GHSA-9jcx, GHSA-2w69, GHSA-2j2x, GHSA-jjmj y GHSA-wrjc) tocan también el modo datos, y cuatro de ellos (todos menos GHSA-2w69) también la 6.

La 8.5.0 no está en el rango afectado de ninguno: la versión más alta con parche es la 8.3.0, para [GHSA-qwww-vcr4-c8h2](https://github.com/remix-run/react-router/security/advisories/GHSA-qwww-vcr4-c8h2), el CSRF de los modos RSC. En el taller, `npm audit` dice `found 0 vulnerabilities`. **Dos hábitos que cuestan poco**: `npm audit` antes de cada despliegue, y mirar esa pestaña cuando subas de versión. Y si mantienes una app de la 6, sabes que GHSA-wrjc no tiene parche allí: solo se cierra migrando (lecciones 23 y 25).

## Errores típicos

**Comprobar el origen y devolver la ruta normalizada sin mirarla.** Es el error de la versión vieja: `new URL` resuelve `.` y `..`, y lo que devuelves puede empezar por `//`. Comprueba el resultado.

**Confiar en que el router lo arreglará.** Los parches de los avisos son para cómo interpreta el router las rutas; si tu código le pide `//evil.example`, te lleva a `evil.example`. Comprobado en la 8.5.0.

**Proteger solo la `action`.** `?volver=` entra por el `loader` de `/entrar` (el campo oculto y la redirección de quien ya tiene sesión), por su `action` y por el middleware. Los tres usan `destinoSeguro`, y el test de la lección comprueba la `action` y el middleware, no solo la función.

**Olvidar `allowedActionOrigins` al desplegar detrás de un proxy.** Todo funciona en local y, en producción, cada formulario responde 400. Si lo ves, mira el `Origin` que manda el navegador y el `request.url` que construye el servidor.

**Esperar que `allowedActionOrigins` proteja una ruta de recursos.** No lo hace. Un webhook necesita su propia autenticación.

**Un *nonce* fijo, o uno distinto en la cabecera y en el HTML.** Fijo, no protege; distinto, bloquea tus propios scripts y la página no se hidrata. Uno por petición, el mismo en los tres sitios.

**Dar por hecho que las páginas prerenderizadas llevan tus cabeceras.** No pasan por `handleRequest`. Pide una con `curl -I` y míralo.

**Lanzar con `data()` el error de otro servicio.** Lo que va en `data()` llega al navegador tal cual, también en producción.

**Creer que firmar una cookie la oculta.** Se lee con un `atob`. La firma solo impide cambiarla.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// react-router.config.ts del albergue, en producción, detrás de un proxy\n// que pone el HTTPS. Sin allowedActionOrigins.\n//\n// Una hospitalera abre https://albergue-el-cea.es/entrar en su navegador,\n// escribe su usuario y su contraseña buenos y pulsa «Entrar».\n// El navegador manda Origin: https://albergue-el-cea.es\n// react-router-serve recibe la petición del proxy por HTTP.\n//\n// ¿Qué responde el servidor?",
  "opciones": [
    "Un 302 a /hospitaleros: el origen es el mismo dominio",
    "Un 400: request.url empieza por http:// y el Origin por https://, y React Router compara el origen entero",
    "Un 401: la cookie no se puede poner sin HTTPS",
    "Un 302, pero la cookie no se guarda porque lleva Secure"
  ],
  "correcta": 1,
  "explicacion": "Comprobado con curl simulando el proxy (Host: albergue-el-cea.es y Origin: https://albergue-el-cea.es): 400 sin la opción y 302 con allowedActionOrigins: [albergue-el-cea.es]. En la 8.5.0 la comprobación compara el origen completo, protocolo incluido, y react-router-serve no confía en las cabeceras X-Forwarded del proxy."
}
```

## En el taller: los pasos de la lección

Cuatro pasos, en el orden de los `TODO (lección 20)`. Ejecuta `npm run leccion -- 20` después de cada uno.

### Paso 1: `destinoSeguro` (`app/seguridad.ts`, `entrar.tsx` y el middleware)

Borra el `throw` del `TODO` y escribe la función con las comprobaciones de la sección «La versión buena», en ese orden:

1. Que `volver` sea un texto no vacío, sin caracteres de control (`\u0000` a `\u001f` y `\u007f`) ni barras invertidas.
2. Que empiece por una sola barra (la expresión `/^\/(?!\/)/` lo dice así: una barra que no va seguida de otra).
3. `new URL(volver, 'http://interno.invalid')` dentro de un `try`, con el mismo origen y, en el `pathname` decodificado, tampoco controles ni barras invertidas.
4. Que la ruta ya normalizada (`pathname + search + hash`) empiece también por una sola barra.
5. Que no sea `/entrar` ni `/salir`.

En cualquier fallo, `porDefecto`. Después, en `entrar.tsx` y en `middleware/hospitalero.server.ts`, cambia el `import { destinoProvisional as destinoSeguro }` por `import { destinoSeguro }`, y borra `destinoProvisional` de `seguridad.ts`.

Se ponen en verde los seis casos de la tabla (`valida el destino …`: dos rutas buenas, `/%0d%0aSet-Cookie`, `/entrar`, `/salir` y `\t/x`) y `entrar y el middleware aplican las restricciones nuevas, no solo el helper`. Los cinco de la normalización ya los vigilan los tests de la 18: si se ponen en rojo, te falta el punto 4. Si falla `\t/x`, el 1.

### Paso 2: `allowedActionOrigins` (`react-router.config.ts`)

Añade el host público, `albergue-el-cea.es`, con un comentario de por qué hace falta detrás del proxy. Fíjate en cómo exporta la configuración el archivo: el test la importa y lee la opción. Verde: `autoriza el host público detrás del proxy`.

### Paso 3: el título de una reserva (`hospitaleros/reserva.tsx`)

Cambia el nombre del peregrino del `<title>` por el identificador de la reserva: `Reserva r-1 | El Cea`. Verde: `el title de una reserva usa el id, nunca el nombre aportado`.

### Paso 4: cabeceras y CSP (`entry.server.tsx`)

1. En `cabecerasDeSeguridad(nonce, entorno)`, devuelve siempre `X-Content-Type-Options` y `Referrer-Policy` y, solo si `entorno` es `'production'`, la `Content-Security-Policy` con el *nonce*. La política exacta está en la especificación del taller y en el código de la sección de la CSP.
2. En `handleRequest`, al principio, genera el *nonce* con `randomBytes(16).toString('base64')` (de `node:crypto`) y pon las cabeceras en `responseHeaders`, antes del `return` de las peticiones `HEAD`.
3. Pásalo a `<ServerRouter nonce={nonce} />` y a las opciones de `renderToPipeableStream`.

Se ponen en verde los cuatro últimos: la CSP con el *nonce*, las cabeceras de desarrollo, las dos peticiones `HEAD` reales a `handleRequest` con *nonces* distintos y la comprobación en el código de que el *nonce* llega a los dos sitios.

Con todo:

```text
$ npm run leccion -- 20

 Test Files  1 passed (1)
      Tests  13 passed (13)
```

Y comprueba lo que los tests no ven: `npm run build`, `npm start`, y repite los `curl` de la lección contra tu servidor (el de la portada dos veces, el de `/albergue/`, los ataques a `/entrar`). Si te atascas, la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller) tiene el taller terminado.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los ataques, solo contra tu copia",
  "contenido": "Todo lo que hace esta lección con curl y con Chromium va contra un servidor tuyo, en tu ordenador. Probar redirecciones, orígenes falsos o cookies manipuladas contra una web que no es tuya, sin permiso, puede ser un delito aunque no rompas nada."
}
```

## Retos para seguir practicando

Sin comprobación automática, salvo la que escribas tú.

1. **Tu propio ataque.** Escribe tres valores de `volver` que no estén en la tabla de los tests (piensa en `%2F`, en mayúsculas, en un `?` o un `#` delante) y añádelos al `it.each` de la lección. ¿Alguno pasa? ¿Por qué?
2. **La CSP con *hashes* para `/albergue/`.** Después de `npm run build`, calcula el SHA-256 en base64 de cada script en línea de `build/client/albergue/index.html` y escribe la cabecera `Content-Security-Policy` que pondrías en el CDN. Compruébala sirviendo la carpeta con un servidor estático que la añada, y mira la consola de Chromium.
3. **Un informe de violaciones.** Añade a la CSP la directiva `report-to` con una ruta de recursos `/api/csp` que registre en el log, en una línea JSON, cada violación que mande el navegador. ¿Por qué esa ruta no puede exigir sesión?
4. **El proxy de verdad.** Pon un Caddy o un nginx delante del servidor de producción con HTTPS local y comprueba los 400 sin `allowedActionOrigins` y los 302 con ella, esta vez desde el navegador.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-router-proyectos/taller (rama solucion)",
      "descripcion": "El taller terminado, con seguridad.ts, entry.server.tsx y los 13 tests de esta lección.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Security",
      "descripcion": "La página de seguridad de React Router: dónde va el nonce de la CSP en el modo framework y en los modos RSC.",
      "url": "https://reactrouter.com/how-to/security",
      "etiqueta": "React Router"
    },
    {
      "titulo": "react-router.config.ts",
      "descripcion": "allowedActionOrigins, con sus comodines y cómo cambiarla en un servidor propio.",
      "url": "https://reactrouter.com/api/framework-conventions/react-router.config.ts",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Avisos de seguridad de React Router",
      "descripcion": "La lista completa, con las versiones afectadas y las que tienen el parche.",
      "url": "https://github.com/remix-run/react-router/security/advisories",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Content Security Policy (CSP)",
      "descripcion": "La guía de MDN: directivas, nonces, hashes y cómo informar de las violaciones.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Unvalidated Redirects and Forwards Cheat Sheet",
      "descripcion": "La guía de OWASP sobre las redirecciones abiertas y cómo validar el destino.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "Cross-Site Request Forgery Prevention Cheat Sheet",
      "descripcion": "Por qué comprobar el Origin, SameSite y los tokens son capas distintas.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    }
  ]
}
```
