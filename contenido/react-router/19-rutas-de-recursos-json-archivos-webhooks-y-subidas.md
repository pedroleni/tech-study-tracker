# Rutas de recursos: JSON, archivos, webhooks y subidas

- **Módulo:** Modo framework
- **Slug:** `rutas-de-recursos-json-archivos-webhooks-y-subidas` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [Resource Routes](https://reactrouter.com/how-to/resource-routes) + [File Uploads](https://reactrouter.com/how-to/file-uploads) + [Backend For Frontend](https://reactrouter.com/explanation/backend-for-frontend) — ver `contenido/react-router/TEMARIO.md` #19
- **Requiere:** Las lecciones 17 y 18 de esta ficha (el taller hasta la 18). De Node.js, la 51 (HMAC) y el proyecto 53 (webhooks). De React, la 82 (seguridad)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

No todo lo que sirve el Albergue El Cea es una página:

- **La lista de pernoctas**: cada noche, los hospitaleros descargan un CSV con quién duerme en el albergue, para abrirlo en una hoja de cálculo y enviarlo.
- **`etapas.json`**: otras webs del Camino (la de una asociación de amigos del Camino, la de otro albergue) muestran las etapas que pasan por Sahagún y las leen de aquí.
- **`sitemap.xml`**: la lista de páginas públicas para los buscadores.
- **`/api/avisos`**: el Ayuntamiento de Sahagún manda por ahí sus avisos (un corte de agua, las fiestas), los que salen en la portada (lección 17). Es un *webhook*: otro programa que llama al tuyo cuando pasa algo.
- **La foto de la credencial**: el pasaporte del peregrino, con sus sellos. Los hospitaleros suben una foto desde la ficha de la reserva.

Las cuatro primeras son **rutas de recursos**: módulos de ruta **sin componente**, cuyo `loader` o `action` devuelve una `Response` que sale tal cual, con el `Content-Type` y las cabeceras que tú digas. La quinta es una `action` normal que recibe un archivo, y tiene sus propios peligros.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién pide cada recurso del albergue",
  "roles": [
    {
      "etiqueta": "pernoctas.csv",
      "rol": "El hospitalero, con sesión",
      "descripcion": "Cuelga de la zona: su middleware (18) lo protege y le pone private, no-store. Lo abre una hoja de cálculo."
    },
    {
      "etiqueta": "etapas.json",
      "rol": "Otras webs del Camino",
      "descripcion": "Datos públicos, sin cookies: cualquier origen puede leerlos desde el navegador, y una caché, guardarlos una hora."
    },
    {
      "etiqueta": "sitemap.xml",
      "rol": "Los buscadores",
      "descripcion": "XML con las direcciones públicas, absolutas: el buscador no sabe en qué dominio estás."
    },
    {
      "etiqueta": "/api/avisos",
      "rol": "El servidor del Ayuntamiento",
      "descripcion": "Solo POST, con un token secreto en Authorization. No es un navegador: ni cookies, ni formularios."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dónde se practica",
  "contenido": "En el taller: github.com/pedroleni/react-router-proyectos, carpeta taller (instalado con npm ci), con la lección 18 terminada. Al final de la lección tienes un ejercicio en la vista previa (la celda CSV, que es TypeScript puro y sí corre en el navegador) y los pasos del taller. Las salidas de curl son del taller con la lección terminada, construido y servido en producción."
}
```

Al empezar, los diecinueve tests de la lección están en rojo (en todo el taller, 53 en verde y 45 en rojo):

```text
$ npm run leccion -- 19

 ❯ pruebas/19-recursos.test.ts (19 tests | 19 failed) 35ms
   ❯ lección 19: rutas de recursos (19)
     × el enlace al CSV fuerza una descarga de documento 5ms
     × crea CSV para Excel, escapa comillas y neutraliza fórmulas 0ms
     × el CSV rechaza saltos y comillas en noche sin romper sus cabeceras 13ms
     × el CSV excluye anuladas y declara descarga CSV con nosniff 3ms
     × publica las etapas como JSON con CORS y caché 0ms
     × genera un sitemap absoluto y escapa el ampersand 0ms
     × rechaza GET en el webhook y anuncia POST 0ms
     …
     × rechaza una credencial de más de 2 MB con un 413 1ms
     × declara maxFileSize de forma explícita 4ms
     × al sustituir una credencial borra el archivo anterior 0ms
```

## Un módulo de ruta sin componente

**Un módulo de ruta que exporta `loader` o `action` y no tiene `export default` es una ruta de recursos.** No hay más: ni una opción, ni otro tipo de ruta. Se registra en `routes.ts` como cualquier otra, y el nombre del archivo puede terminar en `.ts`, porque no hay JSX:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "route('hospitaleros', 'routes/hospitaleros/zona.tsx', [\n    index('routes/hospitaleros/hoy.tsx'),\n    route('reservas/:id', 'routes/hospitaleros/reserva.tsx'),\n    route('pernoctas.csv', 'routes/hospitaleros/pernoctas-csv.ts'),\n  ]),\n  route('etapas.json', 'routes/recursos/etapas-json.ts'),\n  route('sitemap.xml', 'routes/recursos/sitemap.ts'),\n  route('api/avisos', 'routes/recursos/avisos.ts'),",
  "anotaciones": [
    {
      "fragmento": "route('pernoctas.csv', 'routes/hospitaleros/pernoctas-csv.ts'),",
      "nota": "Dentro de la zona: la dirección es /hospitaleros/pernoctas.csv y el middleware de zona.tsx la envuelve como a las páginas. El .csv es parte de la dirección; a React Router le da igual, pero al usuario le dice qué va a descargar."
    },
    {
      "fragmento": "route('etapas.json', 'routes/recursos/etapas-json.ts'),",
      "nota": "Fuera de cualquier layout: no hay interfaz que compartir. Cuelgan directamente de root, pero root no pinta nada, porque una ruta de recursos no se renderiza."
    },
    {
      "fragmento": "route('api/avisos', 'routes/recursos/avisos.ts'),",
      "nota": "El webhook. Que la dirección empiece por /api es una convención para las personas: React Router no le da ningún trato especial."
    }
  ]
}
```

Lo que hay que saber de ellas, de la documentación de *Resource Routes*:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "loader para GET, action para lo demás",
      "texto": "Un GET lo atiende el loader; POST, PUT, PATCH y DELETE, la action. Si quieres distinguir entre ellos, miras request.method dentro de la action."
    },
    {
      "titulo": "Lo que devuelves sale tal cual",
      "texto": "Una Response con su cuerpo, su estado y sus cabeceras. Las funciones headers no se aplican, y no hay HTML, ni hidratación, ni ErrorBoundary."
    },
    {
      "titulo": "Response para quien está fuera, data() para tus fetchers",
      "texto": "La documentación aconseja new Response o Response.json para lo que consume otro programa: el formato queda escrito en tu código. data() tiene sentido si la llamas desde un fetcher o un Form de tu propia app."
    },
    {
      "titulo": "Una Response con 4xx es un éxito; un Error, un fallo",
      "texto": "Devolver o lanzar una Response, aunque sea un 401, no pasa por handleError: has respondido. Lanzar un Error (o cualquier otra cosa) sí: llama a handleError y responde 500."
    }
  ]
}
```

### `etapas.json`: datos públicos, con CORS

El caso más sencillo: un `loader` que devuelve un JSON.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { ETAPAS } from '~/datos/etapas'\n\nexport function loader() {\n  return Response.json(ETAPAS, {\n    headers: {\n      // L19: son datos públicos sin cookies ni información personal, por eso `*` es seguro.\n      'Access-Control-Allow-Origin': '*',\n      'Cache-Control': 'public, max-age=3600',\n      'X-Content-Type-Options': 'nosniff',\n    },\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "return Response.json(ETAPAS, {",
      "nota": "Response.json es estándar (no es de React Router): convierte a JSON y pone Content-Type: application/json."
    },
    {
      "fragmento": "'Access-Control-Allow-Origin': '*',",
      "nota": "CORS: sin esta cabecera, el JavaScript de otra web no puede leer la respuesta, aunque la petición llegue. Con *, cualquier origen. Es seguro porque son datos públicos y la respuesta no depende de ninguna cookie. Además, con * el navegador no deja leer una respuesta pedida con cookies (credentials: include)."
    },
    {
      "fragmento": "'Cache-Control': 'public, max-age=3600',",
      "nota": "Las etapas cambian una vez por temporada: una hora de caché, para el navegador y para las compartidas (lección 17)."
    },
    {
      "fragmento": "'X-Content-Type-Options': 'nosniff',",
      "nota": "Que el navegador no intente adivinar el tipo: es JSON porque lo dice Content-Type, y punto."
    }
  ]
}
```

```text
$ curl -s -D - -o etapas.json -H 'Origin: https://www.caminodesantiago.example' http://localhost:3000/etapas.json
HTTP/1.1 200 OK
access-control-allow-origin: *
cache-control: public, max-age=3600
content-type: application/json; charset=utf-8
x-content-type-options: nosniff

$ head -c 120 etapas.json
[{"slug":"terradillos-de-los-templarios-sahagun","origen":"Terradillos de los Templarios","destino":"Sahagún","kilometr
```

**`*` solo vale para lo que es igual para todo el mundo.** Si la respuesta dependiera de la sesión, el origen tendría que ir escrito uno a uno, con `Access-Control-Allow-Credentials: true`; la lección 102 de React lo contó al hablar de una API en otro origen.

### `sitemap.xml`: URL absolutas y escapadas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { urlPublica } from '~/config.server'\nimport { ETAPAS } from '~/datos/etapas'\n\nfunction escaparXml(valor: string): string {\n  // L19: el escape mantiene XML válido aunque URL_PUBLICA incluya caracteres reservados.\n  return valor\n    .replaceAll('&', '&amp;')\n    .replaceAll('<', '&lt;')\n    .replaceAll('>', '&gt;')\n    .replaceAll('\"', '&quot;')\n    .replaceAll(\"'\", '&apos;')\n}\n\nexport function loader() {\n  // L19: los buscadores necesitan URL absolutas, no rutas relativas de la aplicación.\n  const base = urlPublica()\n  const rutas = [\n    '/',\n    '/albergue',\n    '/etapas',\n    '/camas',\n    '/reservar',\n    ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`),\n  ]\n  const entradas = rutas\n    .map((ruta) => `  <url><loc>${escaparXml(`${base}${ruta}`)}</loc></url>`)\n    .join('\\n')\n  const xml =\n    `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n` +\n    `<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\\n${entradas}\\n</urlset>\\n`\n  return new Response(xml, {\n    headers: {\n      'Content-Type': 'application/xml; charset=utf-8',\n      'Cache-Control': 'public, max-age=3600',\n      'X-Content-Type-Options': 'nosniff',\n    },\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "    .replaceAll('&', '&amp;')",
      "nota": "El primero, el &: si fuera después, convertiría en &amp;lt; los &lt; que acaba de escribir. Un & suelto rompe el XML, y una URL con búsqueda lo lleva (?uno=1&dos=2)."
    },
    {
      "fragmento": "const base = urlPublica()",
      "nota": "El origen público, de la variable URL_PUBLICA (por defecto, https://albergue-el-cea.es). No sale de request.url: detrás de un proxy, el servidor puede recibir http://localhost:3000 y no el dominio que ven los buscadores."
    },
    {
      "fragmento": "...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`),",
      "nota": "Las mismas direcciones que se prerenderizan en la lección 17, más las páginas públicas sin parámetros. Nada de la zona de hospitaleros."
    },
    {
      "fragmento": "'Content-Type': 'application/xml; charset=utf-8',",
      "nota": "Con el tipo bien puesto, el buscador y el navegador lo tratan como XML."
    }
  ]
}
```

```text
$ curl -s -D - http://localhost:3000/sitemap.xml
HTTP/1.1 200 OK
cache-control: public, max-age=3600
content-type: application/xml; charset=utf-8
x-content-type-options: nosniff

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://albergue-el-cea.es/</loc></url>
  <url><loc>https://albergue-el-cea.es/albergue</loc></url>
  <url><loc>https://albergue-el-cea.es/etapas</loc></url>
  <url><loc>https://albergue-el-cea.es/camas</loc></url>
  <url><loc>https://albergue-el-cea.es/reservar</loc></url>
  …
```

## El CSV de pernoctas

Un CSV parece lo más fácil del mundo: valores separados por comas. Para que lo abra bien la hoja de cálculo de una oficina española, y para que no sea peligroso, hay cuatro detalles:

- **El separador es `;`.** Con la configuración regional en español, la coma es el separador decimal (12,5 km), y Excel separa las columnas de un CSV por punto y coma.
- **La marca BOM al principio.** Tres bytes (`EF BB BF`) que le dicen a Excel que el archivo está en UTF-8. Sin ellos, João y Élodie salen con caracteres raros.
- **Comillas.** Una celda con `;`, comillas o un salto de línea va entre comillas dobles, y sus comillas se escriben dos veces (el RFC 4180). Las filas terminan en `\r\n`.
- **La inyección de fórmulas.** Una hoja de cálculo trata como fórmula cualquier celda que empiece por `=`, `+`, `-` o `@` (y por un tabulador o un retorno de carro, según la versión). Los nombres los escribe cada peregrino al reservar: alguien puede llamarse `=HIPERVINCULO("https://malo.example";"Ver credencial")`, y el hospitalero que abre el CSV vería un enlace con buena pinta en su ordenador. OWASP lo llama *CSV Injection*. La defensa: una comilla simple delante, que obliga a tratarla como texto.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const SEPARADOR = ';'\n\nexport function celdaCsv(valor: string | number): string {\n  let texto = String(valor)\n  // L19: Excel interpreta estos prefijos como fórmulas; la comilla los fuerza a texto.\n  if (/^[=+\\-@\\t\\r]/.test(texto)) texto = `'${texto}`\n  if (/[;\"\\r\\n]/.test(texto)) texto = `\"${texto.replaceAll('\"', '\"\"')}\"`\n  return texto\n}\n\nexport function aCsv(filas: (string | number)[][]): string {\n  // L19: el BOM ayuda a Excel con UTF-8 y `;` es el separador habitual en España.\n  return '\\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\\r\\n') + '\\r\\n'\n}",
  "anotaciones": [
    {
      "fragmento": "const SEPARADOR = ';'",
      "nota": "Punto y coma, por la configuración regional española."
    },
    {
      "fragmento": "if (/^[=+\\-@\\t\\r]/.test(texto)) texto = `'${texto}`",
      "nota": "La comilla simple delante de lo que una hoja de cálculo tomaría por fórmula. Va primero: así, si después hay que entrecomillar, la comilla simple queda dentro."
    },
    {
      "fragmento": "if (/[;\"\\r\\n]/.test(texto)) texto = `\"${texto.replaceAll('\"', '\"\"')}\"`",
      "nota": "Entre comillas si lleva separador, comillas o saltos de línea, con las comillas de dentro duplicadas. Sin esto, «Ana \"la de Burgos\"; Ruiz» se partiría en dos columnas."
    },
    {
      "fragmento": "return '\\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\\r\\n') + '\\r\\n'",
      "nota": "La marca BOM, cada fila con sus celdas unidas por ; y las filas por retorno de carro y salto de línea."
    }
  ]
}
```

Y la ruta, dentro de la zona:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { data } from 'react-router'\nimport { aCsv } from '~/csv'\nimport { reservasDeNoche } from '~/datos/reservas.server'\nimport { FechaIsoReal, hoyEnSahagun } from '~/fechas'\nimport type { Route } from './+types/pernoctas-csv'\n\nexport async function loader({ request }: Route.LoaderArgs) {\n  const recibida = new URL(request.url).searchParams.get('noche')\n  const validada = FechaIsoReal.safeParse(recibida ?? hoyEnSahagun())\n  if (!validada.success) throw data({ mensaje: 'La noche no es una fecha válida.' }, { status: 400 })\n  const noche = validada.data\n  const reservas = (await reservasDeNoche(noche)).filter((reserva) => reserva.estado !== 'anulada')\n  const filas: (string | number)[][] = [['Noche', 'Nombre', 'Documento', 'Personas', 'Estado']]\n  for (const reserva of reservas)\n    filas.push([reserva.noche, reserva.nombre, reserva.documento, reserva.personas, reserva.estado])\n  return new Response(aCsv(filas), {\n    headers: {\n      // L19: una ruta de recurso entrega el archivo, no renderiza una pantalla;\n      // Content-Disposition hace que el navegador lo descargue con este nombre.\n      'Content-Type': 'text/csv; charset=utf-8',\n      'Content-Disposition': `attachment; filename=\"pernoctas-${noche}.csv\"`,\n      'X-Content-Type-Options': 'nosniff',\n    },\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "const recibida = new URL(request.url).searchParams.get('noche')",
      "nota": "La noche, de ?noche=. Por defecto, la de hoy en Sahagún."
    },
    {
      "fragmento": "if (!validada.success) throw data({ mensaje: 'La noche no es una fecha válida.' }, { status: 400 })",
      "nota": "Validada antes de nada, porque acaba en el nombre del archivo. Sin validar, ?noche=x\".html o un salto de línea romperían la cabecera Content-Disposition. Lanzar data() en una ruta de recursos da un 400 con su JSON, no un ErrorBoundary."
    },
    {
      "fragmento": ".filter((reserva) => reserva.estado !== 'anulada')",
      "nota": "Solo quien duerme en el albergue: las anuladas no son pernoctas."
    },
    {
      "fragmento": "return new Response(aCsv(filas), {",
      "nota": "Una Response con el texto del CSV: lo que devuelves es lo que sale."
    },
    {
      "fragmento": "'Content-Disposition': `attachment; filename=\"pernoctas-${noche}.csv\"`,",
      "nota": "attachment: descárgalo, no lo enseñes. Con este nombre de archivo."
    }
  ]
}
```

Para probarlo, reservé en el servidor dos camas con nombres pensados para romperlo, desde el formulario público de `/reservar`. Sin sesión y con la de Marta:

```text
$ curl -s -D - -o /dev/null http://localhost:3000/hospitaleros/pernoctas.csv
HTTP/1.1 302 Found
location: /entrar?volver=%2Fhospitaleros%2Fpernoctas.csv

$ curl -s -D - -o pernoctas.csv -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros/pernoctas.csv
HTTP/1.1 200 OK
cache-control: private, no-store
content-disposition: attachment; filename="pernoctas-2026-10-27.csv"
content-type: text/csv; charset=utf-8
x-content-type-options: nosniff

$ cat pernoctas.csv
Noche;Nombre;Documento;Personas;Estado
2026-10-27;Aiko Tanaka;***482;1;reservada
2026-10-27;João Ferreira;***731;2;llegada
2026-10-27;"'=HIPERVINCULO(""https://malo.example"";""Ver credencial"")";***314;1;reservada
2026-10-27;"Ana ""la de Burgos""; Ruiz";***207;2;reservada

$ head -c 16 pernoctas.csv | xxd
00000000: efbb bf4e 6f63 6865 3b4e 6f6d 6272 653b  ...Noche;Nombre;

$ curl -s -H "Cookie: $COOKIE_DE_MARTA" 'http://localhost:3000/hospitaleros/pernoctas.csv?noche=2026-02-30'
{"mensaje":"La noche no es una fecha válida."}
```

- **El 302** es el middleware de la zona (18): la ruta de recursos está protegida sin escribir nada en ella.
- **`private, no-store`** también lo pone el middleware: a una ruta de recursos no le llegan las funciones `headers` (lo comprobamos en la lección 17).
- **La BOM** no se ve con `cat`, pero está: `ef bb bf`, los tres primeros bytes.
- **El 30 de febrero** no pasa: `FechaIsoReal` comprueba que la fecha existe, no solo su forma.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "celdaCsv('-2 camas, llegan tarde')",
  "opciones": [
    "-2 camas, llegan tarde",
    "'-2 camas, llegan tarde",
    "\"'-2 camas, llegan tarde\"",
    "\"-2 camas, llegan tarde\""
  ],
  "correcta": 1,
  "explicacion": "Empieza por un guion, así que lleva la comilla simple delante. Y ya está: la coma no es el separador (lo es el punto y coma), y no hay comillas ni saltos de línea, así que no hace falta entrecomillar. Con coma de separador, sí haría falta."
}
```

## Enlazar a una ruta de recursos: `reloadDocument`

En la cabecera de la zona, el enlace al CSV lleva **`reloadDocument`**:

```tsx
<Link reloadDocument to={href('/hospitaleros/pernoctas.csv')}>
  {/* L19: reloadDocument descarga la ruta de recurso fuera del router cliente. */}
  Pernoctas (CSV)
</Link>
```

Un `<Link>` normal no le pide al navegador que cargue la dirección: navega dentro de la app, pidiendo los datos de la ruta. Con `reloadDocument`, el enlace se comporta como un `<a>` de toda la vida: el navegador pide la dirección entera, recibe el `Content-Disposition: attachment` y descarga el archivo sin moverse de la página. La documentación lo pide expresamente: a una ruta de recursos se llega con `<a>` o con `<Link reloadDocument>`.

¿Y si se te olvida? Lo probé en una copia del taller con un `<Link>` normal, en Chromium, con la sesión de Marta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// zona.tsx, SIN reloadDocument:\n<Link to={href('/hospitaleros/pernoctas.csv')}>Pernoctas (CSV)</Link>\n\n// Marta, en /hospitaleros, pulsa «Pernoctas (CSV)». ¿Qué pasa?",
  "opciones": [
    "Se descarga el CSV, igual que con reloadDocument",
    "Un error en pantalla: no se puede navegar a una ruta sin componente",
    "La URL cambia a /hospitaleros/pernoctas.csv, no se descarga nada y la zona se queda sin contenido",
    "El navegador abre el CSV como texto en la pestaña"
  ],
  "correcta": 2,
  "explicacion": "El router navegó: pidió el código de la ruta y /hospitaleros/pernoctas.csv.data, y pintó la zona con un Outlet vacío, porque la ruta no tiene componente. Ni descarga, ni error en la consola. Y el texto del CSV viajó dentro del .data como si fueran los datos de la página: lo vimos con curl."
}
```

Esa respuesta `.data`, pedida con `curl`, lleva el CSV metido como `loaderData` de la ruta:

```text
$ curl -s -H "Cookie: $COOKIE_DE_MARTA" http://localhost:3000/hospitaleros/pernoctas.csv.data
[{"_1":2,"_3":4},"routes/hospitaleros/zona",{"_5":7},"routes/hospitaleros/pernoctas-csv",{"_5":6},"data","Noche;Nombre;Documento;Personas;Estado\r\n2026-10-27;Aiko Tanaka;***482;1;reservada\r\n2026-10-27;João Ferreira;***731;2;llegada\r\n", …]
```

El test **«el enlace al CSV fuerza una descarga de documento»** comprueba que el enlace lleva `reloadDocument`. Pulsarlo con `npm run dev` lo confirma: con él, Chromium pidió `GET /hospitaleros/pernoctas.csv` como documento, sin `.data`, y descargó `pernoctas-2026-10-27.csv` sin cambiar de página.

## El *webhook* de avisos

El Ayuntamiento manda un `POST` con un JSON cuando hay un aviso:

```json
{ "tipo": "corte-agua", "texto": "Corte de agua en la calle del Arco el jueves, de 9:00 a 13:00.", "hasta": "2026-10-30" }
```

Quien llama no es un navegador, no tiene sesión y no rellena formularios. Se identifica con un **token secreto** que el albergue le dio, en la cabecera `Authorization: Bearer …`, como el JWT del proyecto 52 de Node.js. El módulo entero:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { timingSafeEqual } from 'node:crypto'\nimport { z } from 'zod'\nimport { tokenDeAvisos } from '~/config.server'\nimport { guardarAviso } from '~/datos/avisos.server'\nimport { informarError } from '~/errores.server'\nimport type { Route } from './+types/avisos'\n\nconst Aviso = z.object({\n  tipo: z.enum(['corte-agua', 'fiesta']),\n  texto: z.string().trim().min(1).max(280),\n  hasta: z.iso.date(),\n})\n\n// L19/L22: allowedActionOrigins no se aplica a rutas de recursos y solo mira el\n// Origin que manda un navegador; este sistema externo autentica su POST con token.\nexport function loader() {\n  return new Response('Método no permitido.', { status: 405, headers: { Allow: 'POST' } })\n}\n\nfunction tokenCorrecto(recibido: string, esperado: string): boolean {\n  const a = Buffer.from(recibido)\n  const b = Buffer.from(esperado)\n  // La comparación constante no filtra caracteres; la longitud sigue siendo visible.\n  return a.length === b.length && timingSafeEqual(a, b)\n}\n\nexport async function action({ request }: Route.ActionArgs) {\n  if (request.method !== 'POST')\n    return new Response('Método no permitido.', { status: 405, headers: { Allow: 'POST' } })\n  let esperado: string\n  try {\n    esperado = tokenDeAvisos()\n  } catch (error) {\n    informarError(error, { url: request.url, metodo: request.method })\n    // 503 indica configuración ausente; 401 se reserva para credenciales incorrectas.\n    return new Response('Servicio no configurado.', { status: 503 })\n  }\n  const autorizacion = request.headers.get('Authorization') ?? ''\n  const recibido = autorizacion.startsWith('Bearer ') ? autorizacion.slice(7) : ''\n  if (!tokenCorrecto(recibido, esperado)) return new Response('No autorizado.', { status: 401 })\n  let cuerpo: unknown\n  try {\n    cuerpo = await request.json()\n  } catch {\n    return Response.json({ error: 'El cuerpo no es JSON válido.' }, { status: 400 })\n  }\n  const resultado = Aviso.safeParse(cuerpo)\n  if (!resultado.success)\n    return Response.json({ error: 'El aviso no tiene el formato esperado.' }, { status: 400 })\n  await guardarAviso(resultado.data)\n  return Response.json({ guardado: true }, { status: 201 })\n}",
  "anotaciones": [
    {
      "fragmento": "hasta: z.iso.date(),",
      "nota": "Zod valida el cuerpo: tipo, uno de los dos valores; texto, de 1 a 280 caracteres; hasta, una fecha AAAA-MM-DD. Lo que llega de fuera se valida aunque venga de un sistema de confianza."
    },
    {
      "fragmento": "return new Response('Método no permitido.', { status: 405, headers: { Allow: 'POST' } })",
      "nota": "El loader atiende los GET: un 405 Method Not Allowed, con la cabecera Allow que el estándar HTTP pide en un 405, para decir qué métodos sí valen."
    },
    {
      "fragmento": "return a.length === b.length && timingSafeEqual(a, b)",
      "nota": "Comparación en tiempo constante, como la contraseña de la 18. timingSafeEqual lanza si las longitudes difieren, así que se mira antes. El comentario de debajo lo admite: la longitud sí se puede deducir; los caracteres, no."
    },
    {
      "fragmento": "if (request.method !== 'POST')",
      "nota": "La action atiende POST, PUT, PATCH y DELETE. El webhook solo admite POST: los demás, el mismo 405 con Allow."
    },
    {
      "fragmento": "return new Response('Servicio no configurado.', { status: 503 })",
      "nota": "Sin AVISOS_TOKEN en producción, 503 Service Unavailable: el fallo es nuestro (falta configuración), no del que llama. Un 401 le diría que su token está mal, y no es verdad."
    },
    {
      "fragmento": "if (!tokenCorrecto(recibido, esperado)) return new Response('No autorizado.', { status: 401 })",
      "nota": "Sin token, con otro token o con uno de otra longitud: 401, siempre con el mismo texto."
    },
    {
      "fragmento": "return Response.json({ error: 'El cuerpo no es JSON válido.' }, { status: 400 })",
      "nota": "Un cuerpo que no es JSON es un 400, no un 500: request.json() lanza, y ese error es del que llama, no del servidor."
    },
    {
      "fragmento": "return Response.json({ guardado: true }, { status: 201 })",
      "nota": "201 Created: el aviso se ha guardado. Desde ese momento, la portada (que se genera en cada petición, lección 17) lo enseña."
    }
  ]
}
```

Todas las respuestas, una tras otra, con `curl`:

```text
$ curl -s -D - http://localhost:3000/api/avisos
HTTP/1.1 405 Method Not Allowed
allow: POST
content-type: text/plain;charset=UTF-8

Método no permitido.

$ curl -s -D - -X DELETE -H "Authorization: Bearer $AVISOS_TOKEN" http://localhost:3000/api/avisos
HTTP/1.1 405 Method Not Allowed
allow: POST

$ curl -s -D - -X POST -H 'Content-Type: application/json' http://localhost:3000/api/avisos \
    -d '{"tipo":"fiesta","texto":"x","hasta":"2026-10-31"}'
HTTP/1.1 401 Unauthorized

No autorizado.

$ curl -s -D - -X POST -H 'Authorization: Bearer 1234' -H 'Content-Type: application/json' \
    http://localhost:3000/api/avisos -d '{}'
HTTP/1.1 401 Unauthorized

$ curl -s -D - -X POST -H "Authorization: Bearer $AVISOS_TOKEN" -H 'Content-Type: application/json' \
    http://localhost:3000/api/avisos -d '{"tipo":"verbena","texto":"","hasta":"mañana"}'
HTTP/1.1 400 Bad Request

{"error":"El aviso no tiene el formato esperado."}

$ curl -s -D - -X POST -H "Authorization: Bearer $AVISOS_TOKEN" -H 'Content-Type: application/json' \
    http://localhost:3000/api/avisos \
    -d '{"tipo":"corte-agua","texto":"Corte de agua en la calle del Arco el jueves, de 9:00 a 13:00.","hasta":"2026-10-30"}'
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8

{"guardado":true}

$ curl -s http://localhost:3000/ | grep -o 'Aviso del Ayuntamiento:</strong>.\{0,80\}'
Aviso del Ayuntamiento:</strong> <!-- -->Corte de agua en la calle del Arco el jueves, de 9:00 a 13:00.</aside><
```

### Y sin `AVISOS_TOKEN`

`tokenDeAvisos()` (en `config.server.ts`) lanza un error en producción si falta la variable, y la `action` lo convierte en un 503. Pero antes de responder lo apunta con `informarError`, y `informarError` todavía es un `TODO (lección 22)` que lanza. Así que, **en este punto del taller, sin la variable el *webhook* responde un 500**, con el cuerpo `Unexpected Server Error`, y la terminal dice `Error: TODO (lección 22): informe estructurado de errores.` Con la lección 22 hecha, la misma petición da lo que buscas:

```text
$ curl -s -D - -X POST -H 'Authorization: Bearer loquesea' -H 'Content-Type: application/json' \
    http://localhost:3000/api/avisos -d '{}'
HTTP/1.1 503 Service Unavailable

Servicio no configurado.
```

El test del 503 es de la lección 22, por eso. Fíjate en que el token se comprueba **después** de mirar la configuración: si no hay token esperado, no hay nada con qué comparar.

### Token o firma

El proyecto 53 de Node.js hizo un *webhook* más exigente: el que llama **firma el cuerpo** con HMAC (lección 51) y manda la firma en una cabecera, como hacen Stripe o GitHub. El secreto nunca viaja, y una firma solo vale para ese cuerpo exacto. Con un token *Bearer*, el secreto va en cada petición: si alguien lo ve una vez (un registro, un proxy), puede mandar los avisos que quiera. Para el aviso de un Ayuntamiento, por HTTPS, el token es razonable; para pagos, la firma. Es una de las ideas del banco de proyectos del TEMARIO.

Un aviso si buscas ejemplos: la documentación de React Router tiene una guía de *webhooks* oculta en su menú, marcada en su propio archivo como pendiente de revisar. Compara la firma con `!==` (no en tiempo constante) y la calcula sobre `JSON.stringify(payload)`, el JSON vuelto a escribir, en vez de sobre los bytes que llegaron: un cuerpo con otros espacios daría otra firma. No la copies tal cual.

### `allowedActionOrigins` no protege las rutas de recursos

En la lección 20 verás que React Router rechaza los envíos a las `action` que vienen de otro origen, salvo los hosts de `allowedActionOrigins`. Es una defensa contra el CSRF, para formularios de navegador. Su propio `.d.ts`, en `@react-router/dev` 8.5.0, avisa de su alcance:

```text
An array of allowed origin hosts for action submissions to UI routes (does not apply
to resource routes).
```

Es decir: «hosts de origen permitidos para los envíos a las `action` de **rutas de interfaz** (no se aplica a las rutas de recursos)». Lo comprobé con el taller terminado, con la misma cabecera `Origin` de otra web en dos `POST`:

```text
# Al webhook (ruta de recursos), con el token bueno:
$ curl -s -D - -X POST -H 'Origin: https://malo.example' -H "Authorization: Bearer $AVISOS_TOKEN" \
    -H 'Content-Type: application/json' http://localhost:3000/api/avisos \
    -d '{"tipo":"fiesta","texto":"Fiestas de San Juan y San Pedro.","hasta":"2026-10-30"}'
HTTP/1.1 201 Created

{"guardado":true}

# A la llegada de una reserva (ruta de interfaz), con la sesión de Marta:
$ curl -s -D - -o /dev/null -X POST -H 'Origin: https://malo.example' -H "Cookie: $COOKIE_DE_MARTA" \
    http://localhost:3000/hospitaleros/reservas/r-1 -d 'intencion=llegada'
HTTP/1.1 400 Bad Request
```

En la terminal, solo la segunda deja esta línea (con el taller terminado, dentro del JSON de `informarError`):

```text
The `request.url` origin does not match `origin` header from a forwarded action request. Aborting the action.
```

Es decir: «el origen de `request.url` no coincide con la cabecera `origin`; se cancela la `action`». **En una ruta de recursos, quién puede llamar lo decides tú**: aquí, el token, que un navegador de otra web no tiene. El comentario de `avisos.ts` lo dice.

Lo mismo valdría para cualquier módulo sin componente. Por eso `salir.tsx`, en la lección 18, tiene además una página de confirmación: con componente es una ruta de interfaz, y un `POST /salir` con `Origin: https://malo.example` responde `400`. Sin la página sería una ruta de recursos, y el `POST` pasaría. La lección 20 vuelve sobre esto.

## Subir la credencial

Al llegar, el peregrino enseña su credencial, y el hospitalero sube una foto desde la ficha de la reserva. Esto no es una ruta de recursos: es la `action` de `reserva.tsx`, una página normal, con un formulario que manda un archivo:

```tsx
<Form method="post" encType="multipart/form-data" className="formulario">
  <div className="campo">
    <label htmlFor="credencial">Foto de la credencial</label>
    <input id="credencial" name="credencial" type="file" accept="image/jpeg,image/png" … />
  </div>
  …
</Form>
```

Sin `encType="multipart/form-data"`, el navegador manda solo el nombre del archivo. Con él, el cuerpo de la petición es *multipart*: cada campo en su trozo, con sus cabeceras, y el archivo entero dentro. `request.formData()` lo leería todo en memoria. **`parseFormData`**, de `@remix-run/form-data-parser` (1.1.0, el paquete que usa la documentación), lo lee **por partes**, con límites, y te pasa cada archivo según llega para que decidas qué hacer con él.

### Lo que manda el navegador no es de fiar

El nombre del archivo, su tipo MIME y su tamaño **los escribe el cliente**. Un `curl -F 'credencial=@pagina.html;type=image/png'` manda un HTML diciendo que es un PNG. El propio `.d.ts` de `FileUpload` lo advierte:

```text
The `name` and `type` properties are untrusted client input from the submitted multipart metadata;
they do not validate the file contents. The `name` is not sanitized for filesystem use and must
not be used directly as a filesystem path […]
```

Es decir: `name` y `type` los manda el cliente y no dicen nada del contenido; y `name` no es un nombre de archivo seguro (`../../app/root.tsx` es un nombre válido para un navegador manipulado). Así que el taller **mira los primeros bytes** (los *bytes mágicos*: todo PNG empieza por `89 50 4E 47 0D 0A 1A 0A`, y todo JPEG por `FF D8 FF`) y **inventa el nombre**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "class TipoDeArchivoNoValido extends Error {}\nconst MAX_CREDENCIAL = 2 * 1024 * 1024\n\nfunction directorioSubidas(): string {\n  return process.env.DIRECTORIO_SUBIDAS ?? join(process.cwd(), 'subidas')\n}\n\nfunction tieneFirma(buffer: Buffer, firma: number[]): boolean {\n  return firma.every((byte, indice) => buffer[indice] === byte)\n}\n\nasync function guardarCredencial(archivo: FileUpload, escritos: string[]): Promise<string | null> {\n  if (archivo.fieldName !== 'credencial') return null\n  // L19: `type` lo manda el cliente; los bytes mágicos son los que confirman el formato.\n  if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png') throw new TipoDeArchivoNoValido()\n  const contenido = Buffer.from(await new Response(archivo.stream()).arrayBuffer())\n  if (contenido.length === 0) throw new TipoDeArchivoNoValido()\n  const png = tieneFirma(contenido, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])\n  const jpeg = tieneFirma(contenido, [0xff, 0xd8, 0xff])\n  if ((archivo.type === 'image/png' && !png) || (archivo.type === 'image/jpeg' && !jpeg))\n    throw new TipoDeArchivoNoValido()\n  const extension = archivo.type === 'image/png' ? '.png' : '.jpg'\n  // L19: el UUID evita rutas controladas por el nombre aportado por el navegador.\n  const nombre = `${randomUUID()}${extension}`\n  await mkdir(directorioSubidas(), { recursive: true })\n  await writeFile(join(directorioSubidas(), nombre), contenido)\n  escritos.push(nombre)\n  return nombre\n}\n\nasync function borrarSubidas(nombres: string[]): Promise<void> {\n  await Promise.all(\n    nombres.map((nombre) => unlink(join(directorioSubidas(), nombre)).catch(() => undefined)),\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const MAX_CREDENCIAL = 2 * 1024 * 1024",
      "nota": "2 MB, el límite de una foto de móvil razonable. Coincide con el valor por defecto de maxFileSize en multipart-parser 1.1.0 (2 MiB), pero escrito queda a la vista, y el test lo exige."
    },
    {
      "fragmento": "if (archivo.fieldName !== 'credencial') return null",
      "nota": "Solo el campo que esperas. Cualquier otro archivo se descarta sin leerlo."
    },
    {
      "fragmento": "if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png') throw new TipoDeArchivoNoValido()",
      "nota": "Primer filtro, el barato: si el propio cliente dice que es un HTML, ni se lee."
    },
    {
      "fragmento": "const png = tieneFirma(contenido, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])",
      "nota": "Segundo filtro, el que vale: los bytes de verdad. Un PNG que no empieza así no es un PNG, diga lo que diga type."
    },
    {
      "fragmento": "const nombre = `${randomUUID()}${extension}`",
      "nota": "El nombre lo pone el servidor: un UUID y la extensión que corresponde al contenido. El nombre que mandó el navegador no se usa para nada."
    },
    {
      "fragmento": "escritos.push(nombre)",
      "nota": "Apunta lo que ha escrito en disco, para poder borrarlo si algo falla después."
    },
    {
      "fragmento": "async function borrarSubidas(nombres: string[]): Promise<void> {",
      "nota": "Borra los archivos de la lista, sin fallar si alguno ya no existe."
    }
  ]
}
```

Y la parte de la `action` que lo usa:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  const tipo = request.headers.get('content-type') ?? ''\n  if (tipo.startsWith('multipart/form-data')) {\n    const escritos: string[] = []\n    try {\n      // L19: parseFormData limita el flujo antes de cargar más de 2 MB en memoria.\n      const formulario = await parseFormData(\n        request,\n        { maxFileSize: MAX_CREDENCIAL, maxFiles: 1 },\n        (archivo) => guardarCredencial(archivo, escritos),\n      )\n      const credencial = formulario.get('credencial')\n      if (typeof credencial !== 'string' || !credencial)\n        return data({ error: 'Selecciona una imagen de la credencial.' }, { status: 400 })\n      const actualizada = await actualizarReserva(reserva.id, { credencial })\n      if (!actualizada) throw data({ mensaje: 'No existe esa reserva.' }, { status: 404 })\n      if (reserva.credencial && reserva.credencial !== credencial) await borrarSubidas([reserva.credencial])\n      return data({ guardada: true })\n    } catch (error) {\n      await borrarSubidas(escritos)\n      if (error instanceof TipoDeArchivoNoValido)\n        return data({ error: 'La credencial debe ser una imagen JPEG o PNG válida.' }, { status: 400 })\n      // L19: 413 se reserva para tamaño; los multipart mal formados son peticiones 400.\n      if (error instanceof MaxFileSizeExceededError || error instanceof MaxTotalSizeExceededError)\n        return data({ error: 'La imagen supera el máximo de 2 MB.' }, { status: 413 })\n      if (\n        error instanceof MaxFilesExceededError ||\n        error instanceof FormDataParseError ||\n        error instanceof MultipartParseError\n      )\n        return data({ error: 'El formulario de subida no es válido.' }, { status: 400 })\n      throw error\n    }\n  }\n  if (!tipo.startsWith('application/x-www-form-urlencoded'))\n    return data({ error: 'Tipo de contenido no admitido.' }, { status: 415 })",
  "anotaciones": [
    {
      "fragmento": "{ maxFileSize: MAX_CREDENCIAL, maxFiles: 1 },",
      "nota": "Los límites, aplicados mientras se lee: en cuanto un archivo pasa de 2 MB, parseFormData lanza MaxFileSizeExceededError, sin cargar el resto en memoria. Y un solo archivo."
    },
    {
      "fragmento": "(archivo) => guardarCredencial(archivo, escritos),",
      "nota": "El manejador de subidas: recibe cada archivo y devuelve lo que se guarda en el FormData resultante, aquí el nombre generado."
    },
    {
      "fragmento": "if (reserva.credencial && reserva.credencial !== credencial) await borrarSubidas([reserva.credencial])",
      "nota": "Al sustituir la foto, se borra la anterior: sin esto, la carpeta acumularía credenciales de gente que ya se fue."
    },
    {
      "fragmento": "await borrarSubidas(escritos)",
      "nota": "Si algo falla después de escribir (el segundo archivo de dos, la reserva que ya no existe), se borra lo escrito. Ni medio guardado, ni archivos huérfanos."
    },
    {
      "fragmento": "return data({ error: 'La imagen supera el máximo de 2 MB.' }, { status: 413 })",
      "nota": "413 Content Too Large: el error es el tamaño, y el código lo dice."
    },
    {
      "fragmento": "return data({ error: 'El formulario de subida no es válido.' }, { status: 400 })",
      "nota": "400 Bad Request: el multipart está mal o trae más archivos de los permitidos. Y otro 400, arriba, para el archivo que no es una imagen."
    },
    {
      "fragmento": "return data({ error: 'Tipo de contenido no admitido.' }, { status: 415 })",
      "nota": "415 Unsupported Media Type: ni multipart ni formulario normal (un JSON, por ejemplo). La action no sabe leer ese cuerpo."
    }
  ]
}
```

Los tres códigos de error no son intercambiables: **413**, el cuerpo es demasiado grande; **415**, el cuerpo viene en un formato que no admites; **400**, el formato es el bueno pero el contenido no vale. Con `curl`, con la sesión de Marta y el PNG de verdad de un píxel (70 bytes), un HTML, un HTML con nombre `.png` y tipo `image/png`, un PNG de 3 MB, dos archivos y un JSON:

```text
$ curl -s -o resp.html -w '%{http_code}\n' -H "Cookie: $COOKIE_DE_MARTA" \
    -F 'credencial=@credencial-aiko.png;type=image/png' http://localhost:3000/hospitaleros/reservas/r-1
200
$ grep -o 'role="status">[^<]*' resp.html
role="status">Credencial guardada.

credencial=@pagina.html;type=text/html            400  La credencial debe ser una imagen JPEG o PNG válida.
credencial=@falsa.png;type=image/png              400  La credencial debe ser una imagen JPEG o PNG válida.
credencial=@grande.png;type=image/png (3 MB)      413  La imagen supera el máximo de 2 MB.
dos archivos en credencial                        400  El formulario de subida no es válido.
-H 'Content-Type: application/json' -d '{…}'      415  Tipo de contenido no admitido.

$ ls subidas
5c665282-1bd1-4131-be16-492be4d1f509.png
```

Una sola foto en `subidas/`, con el nombre que puso el servidor, y la reserva apunta a ella (`"credencial": "5c665282-1bd1-4131-be16-492be4d1f509.png"` en `datos/reservas.json`). En el caso de los dos archivos no quedó nada en la carpeta: si el primero llega a escribirse antes de que salte el límite, el `catch` lo borra, que es lo que comprueba el test «rechaza dos archivos y elimina el primero que ya hubiera escrito».

Las fotos no las sirve ninguna ruta: son documentos personales, y nadie las necesita en una web. Si un día hiciera falta verlas, sería con una ruta de recursos **dentro de la zona**, que lea el archivo por el nombre guardado en la reserva (nunca por uno que venga en la URL) y responda con `private, no-store`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Rutas de recursos como Backend for Frontend",
  "contenido": "La documentación tiene una página, Backend For Frontend, sobre otro uso de los loader de servidor y de las rutas de recursos: hacer de intermediario entre tu interfaz y las APIs que ya tienes. El token de la API se queda en el servidor, la respuesta se recorta a lo que la página necesita y el navegador solo habla con tu dominio. Es lo que haría el albergue si las reservas vivieran en el sistema de la red de albergues."
}
```

## Cuándo lo usarías de verdad

- **Exportar**: un CSV, un PDF o un calendario `.ics` generados con los datos del usuario, dentro de la zona protegida.
- **Datos para otros**: un JSON público, un RSS, un `sitemap.xml`, un `robots.txt` que dependa del entorno.
- **Webhooks**: pagos, mensajería, avisos de otro sistema. Con firma HMAC si el que llama la ofrece.
- **Imágenes o archivos generados**: una miniatura, una imagen para redes sociales, un archivo protegido que no debe estar en `public/`.
- **Subidas**: con `parseFormData`, límites, bytes mágicos y nombres generados, siempre.

## Errores típicos

**Un `<Link>` normal a una ruta de recursos.** No descarga nada: el router navega y la página se queda vacía. `<Link reloadDocument>` o `<a>`.

**Un CSV que se abre mal o que ejecuta fórmulas.** Coma de separador en una oficina española, sin BOM, sin comillas, y sin la comilla simple delante de `=`, `+`, `-` y `@`. Lo que escribe un usuario acaba en el ordenador de otro.

**Fiarse del tipo MIME o del nombre del archivo.** Los dos los escribe el cliente. Los bytes mágicos dicen qué es; el nombre lo pone el servidor.

**Leer el archivo entero y después mirar el tamaño.** Para entonces ya está en memoria. `maxFileSize` corta mientras se lee.

**Dejar archivos a medias.** Si la subida falla después de escribir, o se sustituye una foto, hay que borrar lo que sobra.

**Comparar un token con `===`.** Mismo problema que con las contraseñas: `timingSafeEqual`, con la longitud comprobada antes.

**Responder 401 cuando el problema es tuyo.** Sin la variable de entorno, un 503: el que llama no puede arreglarlo cambiando su token.

**Creer que `allowedActionOrigins` protege el *webhook*.** No se aplica a las rutas de recursos. Ahí, la autenticación la pones tú.

**Lanzar un `Error` para un fallo esperado.** En una ruta de recursos, un `Error` es un 500 y pasa por `handleError`. Para un 400 o un 404, devuelve o lanza una `Response` o un `data()`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una ruta de recursos es otro tipo de ruta que se declara aparte",
      "realidad": "Es un módulo de ruta normal sin export default. Se registra en routes.ts como cualquier otra, y hereda los middleware de sus madres."
    },
    {
      "mito": "Si cuelga de la zona protegida, también le llegan las cabeceras de headers",
      "realidad": "El middleware sí la envuelve; las funciones headers, no. Por eso private, no-store lo pone el middleware."
    },
    {
      "mito": "Con accept=\"image/png\" en el input ya no pueden subir otra cosa",
      "realidad": "accept solo filtra el selector de archivos del navegador. curl, o un formulario manipulado, mandan lo que quieran."
    },
    {
      "mito": "Access-Control-Allow-Origin: * hace pública cualquier respuesta",
      "realidad": "Con *, el navegador no deja leer una respuesta pedida con cookies, así que solo sirve para lo que ya es público. Para datos con sesión hay que nombrar el origen y permitir credenciales, y pensarlo dos veces."
    },
    {
      "mito": "Un 405 basta con el código",
      "realidad": "El estándar HTTP pide la cabecera Allow en un 405, con los métodos que sí valen. El taller manda Allow: POST."
    }
  ]
}
```

## Ejercicios

### En la vista previa: la celda CSV

La función que escribe cada celda del CSV es TypeScript puro, y se puede probar aquí antes de llevarla al taller. La app pinta cada línea del CSV que sale con tus nombres de peregrinos; ahora mismo, `celdaCsv` devuelve el texto tal cual.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio: una celda CSV que no rompe ni ejecuta nada",
  "consigna": "En csv.ts, escribe celdaCsv. Si el texto empieza por = + - @ un tabulador o un retorno de carro, ponle una comilla simple delante. Después, si lleva punto y coma, comillas dobles o saltos de línea, enciérralo entre comillas dobles y escribe dos veces cada comilla doble de dentro. Pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "csv.ts",
      "codigo": "const SEPARADOR = ';'\n\n// Escribe aquí la celda segura:\n// 1. Si empieza por = + - @ tabulador o retorno de carro, una comilla simple delante.\n// 2. Si lleva ; comillas o un salto de línea, entre comillas dobles,\n//    con cada comilla doble de dentro escrita dos veces.\nexport function celdaCsv(valor: string | number): string {\n  return String(valor)\n}\n\nexport function aCsv(filas: (string | number)[][]): string {\n  return '﻿' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\\r\\n') + '\\r\\n'\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { aCsv } from './csv'\nimport './estilos.css'\n\ntype Pernocta = {\n  noche: string\n  nombre: string\n  documento: string\n  personas: number\n  estado: 'reservada' | 'llegada'\n}\n\n// Los nombres los escribe cada peregrino al reservar: no son de fiar.\nconst PERNOCTAS: Pernocta[] = [\n  { noche: '2026-10-27', nombre: 'Aiko Tanaka', documento: '***482', personas: 1, estado: 'reservada' },\n  {\n    noche: '2026-10-27',\n    nombre: '=HIPERVINCULO(\"https://malo.example\";\"Ver credencial\")',\n    documento: '***314',\n    personas: 1,\n    estado: 'reservada',\n  },\n  { noche: '2026-10-27', nombre: 'Ana \"la de Burgos\"; Ruiz', documento: '***207', personas: 2, estado: 'reservada' },\n  { noche: '2026-10-27', nombre: '@peregrino_en_bici', documento: '***559', personas: 1, estado: 'llegada' },\n  { noche: '2026-10-27', nombre: '+ Juan (acompañante)', documento: '***871', personas: 1, estado: 'llegada' },\n]\n\nexport default function App() {\n  const csv = aCsv([\n    ['Noche', 'Nombre', 'Documento', 'Personas', 'Estado'],\n    ...PERNOCTAS.map((p) => [p.noche, p.nombre, p.documento, p.personas, p.estado]),\n  ])\n  const lineas = csv.replace('﻿', '').split('\\r\\n').filter(Boolean)\n  return (\n    <main>\n      <h1>pernoctas-2026-10-27.csv</h1>\n      <p>{csv.startsWith('﻿') ? 'Empieza por la marca BOM.' : 'Sin marca BOM.'}</p>\n      <ol aria-label=\"Líneas del CSV\">\n        {lineas.map((linea, i) => (\n          <li key={i}>\n            <code>{linea}</code>\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  margin: 1rem;\n  color: #2b2620;\n  background: #f6f1e7;\n}\nh1 {\n  font-size: 1.1rem;\n}\nol {\n  padding-left: 1.5rem;\n}\nli {\n  margin: 0.25rem 0;\n}\ncode {\n  font-size: 0.85rem;\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n"
    }
  ],
  "archivoInicial": "csv.ts",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Una celda normal sale tal cual",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "2026-10-27;Aiko Tanaka;***482;1;reservada"
      }
    },
    {
      "descripcion": "La fórmula lleva la comilla simple delante, y va entre comillas con las suyas duplicadas",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "2026-10-27;\"'=HIPERVINCULO(\"\"https://malo.example\"\";\"\"Ver credencial\"\")\";***314;1;reservada"
      }
    },
    {
      "descripcion": "Un nombre con comillas y punto y coma no se parte en dos columnas",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "2026-10-27;\"Ana \"\"la de Burgos\"\"; Ruiz\";***207;2;reservada"
      }
    },
    {
      "descripcion": "Una celda que empieza por @ lleva la comilla simple, sin comillas dobles",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "2026-10-27;'@peregrino_en_bici;***559;1;llegada"
      }
    },
    {
      "descripcion": "Una celda que empieza por + también",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "2026-10-27;'+ Juan (acompañante);***871;1;llegada"
      }
    }
  ]
}
```

### En el taller: la lección 19

Siete pasos, que siguen los `TODO (lección 19)`. Ejecuta `npm run leccion -- 19` después de cada uno. Si te atascas, cada paso enlaza al archivo terminado en la rama `solucion`.

**Paso 1: `app/csv.ts`.** Los dos `TODO`: `celdaCsv`, como en el ejercicio de arriba, y `aCsv`, con la BOM, el `;` y `\r\n`. Test: **«crea CSV para Excel, escapa comillas y neutraliza fórmulas»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/csv.ts)

**Paso 2: `app/routes/hospitaleros/pernoctas-csv.ts`.** «Responde con el CSV descargable de una noche válida»: la noche de `?noche=` o la de hoy, validada con `FechaIsoReal` (400 con `data()` si no vale), sin las anuladas, con `text/csv; charset=utf-8`, el `Content-Disposition` con la fecha y `nosniff`. No compruebes la sesión: ya lo hace el middleware de la zona. Tests: **«el CSV rechaza saltos y comillas en noche sin romper sus cabeceras»** y **«el CSV excluye anuladas y declara descarga CSV con nosniff»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/pernoctas-csv.ts)

**Paso 3: `app/routes/recursos/etapas-json.ts`.** `Response.json(ETAPAS, …)` con CORS abierto, una hora de caché pública y `nosniff`. Test: **«publica las etapas como JSON con CORS y caché»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/recursos/etapas-json.ts)

**Paso 4: `urlPublica` en `app/config.server.ts` y `app/routes/recursos/sitemap.ts`.** `urlPublica` devuelve `URL_PUBLICA` sin la barra final, o `https://albergue-el-cea.es`. El sitemap, con las páginas públicas y una por etapa, absolutas y escapadas. Test: **«genera un sitemap absoluto y escapa el ampersand»** (pone `URL_PUBLICA` con un `&` dentro). [Solución del sitemap](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/recursos/sitemap.ts)

**Paso 5: `tokenDeAvisos` en `app/config.server.ts` y `app/routes/recursos/avisos.ts`.** `tokenDeAvisos` devuelve `AVISOS_TOKEN`; sin ella, en producción lanza un error, y en desarrollo devuelve un token de desarrollo. El `loader`, el 405 con `Allow`; la `action`, el resto, en este orden: el método, el token esperado (503 si falta), el token recibido (401), el JSON (400), Zod (400) y `guardarAviso` (201). Cambia el comentario del `TODO` por uno que explique por qué `allowedActionOrigins` no protege esta ruta. Tests: **«rechaza GET en el webhook y anuncia POST»**, **«rechaza tokens ausentes, distintos aunque midan lo mismo y de longitud distinta»**, **«valida el aviso, lo guarda y la portada lo lee»** y los tres de **«rechaza PUT / PATCH / DELETE en el webhook aunque el token sea válido»**. [Solución de `avisos.ts`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/recursos/avisos.ts) · [de `config.server.ts`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/config.server.ts)

**Paso 6: la credencial, en `app/routes/hospitaleros/reserva.tsx`.** Los dos `TODO`: en la `action`, la rama *multipart* con `parseFormData`, `maxFileSize: MAX_CREDENCIAL` escrito así (un test lo busca en el código), los bytes mágicos, el UUID, el borrado si algo falla y el de la foto anterior, y el 415 para lo que no es formulario; en el componente, el formulario con `encType="multipart/form-data"`, su `label`, el error con `role="alert"` y `aria-describedby`, y el «Credencial guardada.» con `role="status"`. Tests: los seis de la subida, de **«guarda un PNG con un nombre generado y rechaza HTML»** a **«al sustituir una credencial borra el archivo anterior»**. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/reserva.tsx)

**Paso 7: el enlace, en `app/routes/hospitaleros/zona.tsx`.** El `TODO (lección 19)` junto al enlace «Pernoctas (CSV)» que escribiste en la 18: añádele `reloadDocument`. Test: **«el enlace al CSV fuerza una descarga de documento»**. Y pulsa el enlace con `npm run dev`: se descarga sin cambiar de página. [Solución](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/hospitaleros/zona.tsx)

### Comprueba

```text
$ npm run leccion -- 19

 Test Files  1 passed (1)
      Tests  19 passed (19)
```

En todo el taller, `npm test` da ahora 72 tests en verde y 26 en rojo, los de las lecciones 20 a 22, y `npm run typecheck` sigue sin errores.

Y con el servidor de producción (`npm run build`, y `npm start` con `SECRETO_SESION` y `AVISOS_TOKEN` delante), repite los `curl` de la lección: el CSV con tu cookie, `etapas.json`, el sitemap y las respuestas del *webhook*. Para la cookie, entra con `curl -s -D - -o /dev/null -X POST http://localhost:3000/entrar -d 'usuario=marta&clave=camino2026&volver='` y copia el `__sesion=…` del `Set-Cookie`.

### Retos para seguir practicando

1. **Un calendario `.ics`.** Una ruta de recursos `/hospitaleros/turnos.ics` con las noches con reservas, `Content-Type: text/calendar`. ¿Qué hay que escapar en un `.ics`?
2. **Ver la credencial.** Una ruta de recursos dentro de la zona, `/hospitaleros/reservas/:id/credencial`, que sirva la foto de esa reserva con su `Content-Type`, `private, no-store` y `nosniff`. Que el nombre del archivo salga de la reserva, nunca de la URL.
3. **Firma en vez de token.** Cambia el *webhook* para que el Ayuntamiento mande una cabecera `X-Firma` con el HMAC-SHA256 del cuerpo, como en el proyecto 53 de Node.js. Calcula la firma sobre `await request.text()`, antes de `JSON.parse`.
4. **El `.data` que no debía.** Quita `reloadDocument`, pulsa el enlace y mira la petición `.data` en la pestaña Red. ¿Qué cabeceras lleva? ¿Por qué no se descarga nada?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación y referencias",
  "recursos": [
    {
      "titulo": "Resource Routes",
      "descripcion": "Rutas sin componente, cómo enlazarlas, los métodos, qué devolver y cómo se tratan los errores.",
      "url": "https://reactrouter.com/how-to/resource-routes",
      "etiqueta": "React Router"
    },
    {
      "titulo": "File Uploads",
      "descripcion": "parseFormData de @remix-run/form-data-parser, el manejador de subidas y cómo servir lo subido.",
      "url": "https://reactrouter.com/how-to/file-uploads",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Backend For Frontend",
      "descripcion": "Los loader y las rutas de recursos como intermediarios entre tu interfaz y otras APIs.",
      "url": "https://reactrouter.com/explanation/backend-for-frontend",
      "etiqueta": "React Router"
    },
    {
      "titulo": "form-data-parser",
      "descripcion": "El código y el README del paquete: opciones, límites y errores.",
      "url": "https://github.com/remix-run/remix/tree/main/packages/form-data-parser",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "CSV Injection",
      "descripcion": "Por qué una celda que empieza por = puede ser peligrosa, y cómo neutralizarla.",
      "url": "https://owasp.org/www-community/attacks/CSV_Injection",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "File Upload Cheat Sheet",
      "descripcion": "Tipos, tamaños, nombres generados y dónde guardar lo que suben los usuarios.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "CORS",
      "descripcion": "Cómo decide el navegador si el JavaScript de otro origen puede leer una respuesta.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Sitemaps XML format",
      "descripcion": "El formato del sitemap, con el escape de las URL.",
      "url": "https://www.sitemaps.org/protocol.html",
      "etiqueta": "sitemaps.org"
    }
  ]
}
```
