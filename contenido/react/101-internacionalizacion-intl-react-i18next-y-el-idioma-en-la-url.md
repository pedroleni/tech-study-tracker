# Internacionalización: `Intl`, react-i18next y el idioma en la URL

- **Módulo:** Calidad y producción
- **Slug:** `internacionalizacion-intl-react-i18next-y-el-idioma-en-la-url` (autogenerado del título)
- **Orden:** 815
- **Fuentes:** [Intl (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) + [react-i18next: Quick start](https://react.i18next.com/guides/quick-start) + [useTranslation](https://react.i18next.com/latest/usetranslation-hook) + [Trans](https://react.i18next.com/latest/trans-component) + [i18next: Plurals](https://www.i18next.com/translation-function/plurals) + [Google: versiones localizadas de una página](https://developers.google.com/search/docs/specialty/international/localized-versions) — ver `contenido/react/TEMARIO.md` #101

---

## Qué es y para qué sirve

Turrones El Panal vende por internet a toda España. Su web está en castellano, pero una tienda de Girona la pide en catalán y los pedidos de empresas del Reino Unido llegan en inglés. En España también se escribe en euskera y en gallego, y de ellos verás aquí cómo escribe `Intl` los números y las fechas; los textos de la tienda, de momento, van en castellano, catalán e inglés. Traducir las frases es solo una parte del trabajo:

- **Los números, las fechas y las listas cambian de forma.** «1234,50 €» en castellano, «1.234,50 €» en catalán y «€1,234.50» en inglés; «jueves, 29 de octubre» en castellano y «Thursday 29 October» en inglés.
- **Los plurales no siguen la misma regla en todas las lenguas.** En castellano un millón pide un «de» («1.000.000 de tabletas»), y el árabe tiene seis formas de plural.
- **El idioma tiene que estar en algún sitio** que el navegador, el servidor y los buscadores sepan leer.

Preparar una aplicación para todo eso se llama **internacionalización**, y se abrevia **i18n**: una i, dieciocho letras y una n. Adaptarla después a cada idioma y región, con sus traducciones y sus formatos, es la **localización** (l10n). Esta lección recorre las tres piezas, de la que ya trae el navegador a la que decides tú:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres piezas de una web en varios idiomas",
  "roles": [
    {
      "etiqueta": "Intl",
      "rol": "Los formatos",
      "descripcion": "Precios, pesos, fechas, «anteayer», plurales y listas, cada uno como se escribe en cada idioma. Viene con el navegador: no se instala nada."
    },
    {
      "etiqueta": "react-i18next",
      "rol": "Los textos",
      "descripcion": "Un diccionario por idioma y una función t() que elige la frase, con sus plurales y sus valores, y que carga cada idioma cuando hace falta."
    },
    {
      "etiqueta": "La URL",
      "rol": "El idioma",
      "descripcion": "/ca/cesta dice en qué idioma está la página: se comparte, se recarga, la lee el servidor y la indexan los buscadores."
    }
  ]
}
```

Cada idioma se nombra con una **etiqueta de idioma** (el estándar se llama BCP 47): el idioma y, si importa, la región. En esta lección salen cinco: `es-ES`, `ca-ES`, `eu-ES`, `gl-ES` y `en-GB`. La región cambia detalles: `en-GB` escribe «29 October» y `en-US`, «October 29». También hay variantes registradas, como `ca-ES-valencia` para el valenciano. En las URL basta con el idioma (`/ca/`); para formatear, mejor la etiqueta completa.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Qué se ejecuta aquí y qué no",
  "contenido": "Los bloques en vivo de esta web solo cargan React, así que react-i18next no se puede usar en la vista previa: su código va anotado, como el de React Router en las lecciones 76 y 77, y está comprobado con i18next 26.5.11, react-i18next 17.1.9, React 19.3.1 y React Router 8.5.0 en un proyecto de Vite. Intl, en cambio, es del navegador: todo lo de Intl funciona en vivo, y también un t() hecho a mano que hace lo esencial de la librería."
}
```

## `Intl`: los formatos los pone el navegador

En la carta de la lección 14 usaste `Intl.NumberFormat` para escribir los precios en euros, y en la lección 66 mediste lo que cuesta crear un formateador en cada fila. `Intl` es una familia de constructores, uno por tipo de dato. Todos reciben el idioma y unas opciones, y devuelven un objeto con un método `format()`.

Este es el lote para empresas de la tienda, con los mismos datos en los cinco idiomas. Los datos llegan como llegarían del servidor, sin formato: `1234.5`, `[250, 500, 1000]`, una fecha. Todo lo demás lo pone `Intl`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los mismos datos en cinco idiomas",
  "consigna": "Cambia de idioma y compara: el punto de los miles, dónde va el símbolo del porcentaje con eu-ES, «anteayer» en cada lengua y la palabra que une los tamaños. Mira la consola: cada idioma crea sus formateadores la primera vez y, al volver a él, ya no. La última línea dice qué datos de idioma ha usado de verdad tu navegador: fíjate en ella con eu-ES y gl-ES.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { formatos } from './formatos'\nimport './estilos.css'\n\n// Las etiquetas de idioma: es lo único que necesita Intl\nconst IDIOMAS = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'en-GB']\n\n// Lo que llega del servidor: números y fechas, sin ningún formato\nconst LOTE = {\n  precio: 1234.5,\n  tamanos: [250, 500, 1000],\n  iva: 0.1,\n  entrega: new Date('2026-10-29T10:00:00+01:00'),\n  diasDesdeElPedido: -2,\n}\n\nexport default function App() {\n  const [idioma, setIdioma] = useState('es-ES')\n  const f = formatos(idioma)\n  const usado = f.dia.resolvedOptions().locale\n\n  return (\n    <main>\n      <h1>Lote para empresas · Turrones El Panal</h1>\n      <div className=\"idiomas\" role=\"group\" aria-label=\"Idioma\">\n        {IDIOMAS.map((codigo) => (\n          <button key={codigo} aria-pressed={codigo === idioma} onClick={() => setIdioma(codigo)}>\n            {codigo}\n          </button>\n        ))}\n      </div>\n      <dl className=\"ficha\">\n        <dt>Precio</dt>\n        <dd lang={idioma}>{f.euros.format(LOTE.precio)}</dd>\n        <dt>Tamaños</dt>\n        <dd lang={idioma}>{f.lista.format(LOTE.tamanos.map((gramos) => f.peso.format(gramos)))}</dd>\n        <dt>IVA</dt>\n        <dd lang={idioma}>{f.porcentaje.format(LOTE.iva)}</dd>\n        <dt>Entrega</dt>\n        <dd lang={idioma}>{f.dia.format(LOTE.entrega)}</dd>\n        <dt>Pedido</dt>\n        <dd lang={idioma}>{f.haceCuanto.format(LOTE.diasDesdeElPedido, 'day')}</dd>\n      </dl>\n      <p className=\"usado\">\n        Datos de idioma que ha usado tu navegador: <code>{usado}</code>\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "formatos.jsx",
      "codigo": "// Un juego de formateadores por idioma. Se crea la primera vez que se pide\n// ese idioma y después se reutiliza: crear uno cuesta mucho más que usarlo.\nconst juegos = new Map()\n\nexport function formatos(idioma) {\n  if (!juegos.has(idioma)) {\n    console.log(`Formateadores de ${idioma}: creados`)\n    juegos.set(idioma, {\n      euros: new Intl.NumberFormat(idioma, { style: 'currency', currency: 'EUR' }),\n      peso: new Intl.NumberFormat(idioma, { style: 'unit', unit: 'gram', unitDisplay: 'long' }),\n      porcentaje: new Intl.NumberFormat(idioma, { style: 'percent' }),\n      dia: new Intl.DateTimeFormat(idioma, {\n        weekday: 'long',\n        day: 'numeric',\n        month: 'long',\n        timeZone: 'Europe/Madrid',\n      }),\n      haceCuanto: new Intl.RelativeTimeFormat(idioma, { numeric: 'auto' }),\n      lista: new Intl.ListFormat(idioma, { type: 'conjunction' }),\n    })\n  }\n  return juegos.get(idioma)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  color: #7c2d12;\n  font-size: 1.25rem;\n}\n\n.idiomas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.idiomas button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #b45309;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.idiomas button[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\n.ficha {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 0.35rem 1rem;\n  margin: 1rem 0;\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #fef3c7;\n}\n\n.ficha dt {\n  color: #78350f;\n  font-weight: 600;\n}\n\n.ficha dd {\n  margin: 0;\n}\n\n.usado {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "formatos.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

### Crea los formateadores una vez por idioma

En las lecciones 14 y 66 el formateador era una constante fuera del componente, porque el idioma no cambiaba nunca. Ahora depende del idioma, y una constante no basta. La solución de `formatos.jsx` es **guardar un juego de formateadores por idioma en un `Map`**: se crea la primera vez que alguien pide ese idioma y después se reutiliza, desde este componente o desde cualquier otro. Por eso la consola dice «creados» una sola vez por idioma, aunque `StrictMode` renderice dos veces.

¿Cuánto se ahorra? Medido en Chrome 156 con 2.000 precios: crear un `NumberFormat` y formatear cuesta unos 10 µs por precio; reutilizarlo, unos 0,2 µs. **Unas cincuenta veces menos.** Con `DateTimeFormat` son unos 21 µs frente a menos de 1 µs. En Safari la proporción es parecida. Y `precio.toLocaleString('es-ES', opciones)` cuesta lo mismo que crearlo, porque por dentro crea un formateador en cada llamada.

Hay otras dos formas de conseguirlo:

- **`useMemo(() => crearFormatos(idioma), [idioma])`** (lección 67) dentro del componente. Funciona, pero cada componente crea su propio juego: con cien tarjetas de producto, cien juegos. El `Map` lo comparten todas.
- **Dejar que lo haga la librería.** i18next formatea dentro de las frases (`{{total, currency(EUR)}}`, lo verás más abajo) y guarda los formateadores que crea: su opción `cacheInBuiltFormats` está activada por defecto.

### Números: `NumberFormat`

Con `style` eliges qué es el número:

- **`currency`**, con `currency: 'EUR'`: «12,50 €». La moneda no sale del idioma: un cliente británico que paga en euros ve «€12.50».
- **`unit`**, con `unit: 'gram'` o `'kilogram'`: «300 g» o, con `unitDisplay: 'long'`, «300 gramos», «300 grams» y, con `eu-ES`, «300 gramo».
- **`percent`**: `0.1` se escribe «10 %» en castellano y, con `eu-ES`, «% 10», con el símbolo delante.

Entre el número y el «€» o el «%» va un espacio duro, U+00A0: ya lo viste en las lecciones 14 y 83. Y una pregunta sobre los miles:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const euros = (idioma) =>\n  new Intl.NumberFormat(idioma, { style: 'currency', currency: 'EUR' })\n\neuros('es-ES').format(1234.5)\neuros('ca-ES').format(1234.5)",
  "opciones": [
    "«1.234,50 €» y «1.234,50 €»: castellano y catalán escriben igual los números",
    "«1234,50 €» y «1.234,50 €»",
    "«1.234,50 €» y «1234,50 €»",
    "«€1,234.50» en los dos"
  ],
  "correcta": 1,
  "explicacion": "La ortografía del castellano no separa los miles en los números de cuatro cifras, y los datos que usa Intl lo recogen: «1234,50 €», pero «15.000 €». El catalán agrupa desde las cuatro cifras: «1.234,50 €». Comprobado con Node 22, Chrome 156 y Safari: los tres coinciden. Por eso no conviene formatear a mano con toFixed y replace."
}
```

### Fechas: `DateTimeFormat`, siempre con zona horaria

Con `dateStyle: 'full'` y la entrega del lote:

- castellano: «jueves, 29 de octubre de 2026»
- catalán: «dijous, 29 d’octubre del 2026»
- `eu-ES`: «2026(e)ko urriaren 29(a), osteguna»
- `gl-ES`: «xoves, 29 de outubro de 2026»
- inglés británico: «Thursday, 29 October 2026»

Tres detalles. **El orden y las partes cambian** de un idioma a otro, y no tienes que saberlo: lo sabe `Intl`. **El apóstrofo del catalán es el tipográfico** (’, U+2019), no el recto: si comparas fechas en un test, no las escribas a mano. Y **la zona horaria se fija** con `timeZone`, como en el proyecto 98: la tienda reparte desde España, así que la fecha de entrega se escribe en `'Europe/Madrid'` aunque el servidor esté en UTC o el cliente en Londres.

Los motores tampoco coinciden en todo. Con `dateStyle: 'medium'` y `timeStyle: 'short'`, Chrome escribe «29 Oct 2026, 10:00» en inglés británico y Safari, «29 Oct 2026 at 10:00». Los dos son correctos; por eso un test no debería esperar un texto escrito a mano.

### «Anteayer» y «hace 2 días»: `RelativeTimeFormat`

`RelativeTimeFormat` no calcula nada: tú le das la cantidad y la unidad, `format(-2, 'day')`, y él lo escribe. Calcular la diferencia y elegir la unidad era el trabajo de `haceCuanto` en el proyecto 98. Sin opciones escribe, en el orden de la demostración (`es-ES`, `ca-ES`, `eu-ES`, `gl-ES` y `en-GB`), «hace 2 días», «fa 2 dies», «duela 2 egun», «hai 2 días» y «2 days ago». Con `numeric: 'auto'` usa las palabras de cada idioma cuando las hay: «anteayer», «abans-d’ahir», «herenegun», «antonte»… y en inglés sigue siendo «2 days ago», porque no tiene una palabra para eso.

### Listas: `ListFormat`

Los tamaños del lote, cada uno con `NumberFormat` y unidos con `ListFormat`: «250 gramos, 500 gramos y 1000 gramos», «250 grams, 500 grams i 1.000 grams», «250 gramo, 500 gramo eta 1.000 gramo» con `eu-ES`, «250 gramos, 500 gramos e 1.000 gramos» con `gl-ES` y «250 grams, 500 grams and 1,000 grams». El inglés británico no pone coma antes de «and»; el estadounidense, sí («almonds, honey, and egg»). Con `type: 'disjunction'` une con «o», «edo», «ou» u «or». Y sabe algo más:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const y = new Intl.ListFormat('es-ES', { type: 'conjunction' })\n\ny.format(['almendra', 'higo'])\ny.format(['miel', 'hielo'])",
  "opciones": [
    "«almendra y higo» y «miel y hielo»",
    "«almendra e higo» y «miel e hielo»",
    "«almendra e higo» y «miel y hielo»",
    "«almendra, higo» y «miel, hielo»"
  ],
  "correcta": 2,
  "explicacion": "Intl conoce la regla del castellano: la «y» pasa a «e» delante de una palabra que empieza por el sonido i, como higo, pero no delante de hie-, como hielo, que suena «ye». Con disjunction hace lo mismo con la «o»: «siete u ocho», e incluso con cifras, «7 u 8». Comprobado con Node 22, Chrome 156 y Safari."
}
```

### Plurales: `PluralRules`

`PluralRules` no escribe nada: dice a qué **categoría de plural** pertenece un número en un idioma. `new Intl.PluralRules('es-ES').select(1)` devuelve `'one'`, y `select(5)`, `'other'`. Tú eliges la frase según la categoría. Parece poca cosa, pero las categorías no son las mismas en todas las lenguas (comprobado con Node 22, Chrome 156 y Safari):

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Castellano y catalán: one, many y other",
      "texto": "one para el 1; many para los millones exactos (1.000.000, 2.000.000…), que piden «de»: «1.000.000 de tabletas»; other para todo lo demás, incluidos el 0 y el 1,5."
    },
    {
      "titulo": "Euskera, gallego e inglés: one y other",
      "texto": "Solo dos categorías: one para el 1 y other para todo lo demás, incluidos el 0, el 1,5 y el millón."
    },
    {
      "titulo": "Árabe: seis",
      "texto": "zero, one, two, few, many y other. Una regla del tipo count === 1 ? singular : plural se queda corta en cuanto la app sale de dos idiomas."
    },
    {
      "titulo": "Ordinales, con type: ordinal",
      "texto": "En inglés, 1st, 2nd, 3rd y 4th son one, two, few y other. En catalán, 1r, 2n, 3r y 4t son one, two, one y few."
    },
    {
      "titulo": "La base de los plurales de i18next",
      "texto": "i18next llama a PluralRules y busca la clave con la categoría como sufijo: tabletas_one, tabletas_many, tabletas_other. El t() hecho a mano de esta lección hace lo mismo."
    }
  ]
}
```

### Chrome no trae euskera ni gallego

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin error y sin aviso",
  "contenido": "Comprobado en Chrome 156 y en Chromium: sus datos de Intl no incluyen el euskera ni el gallego. No da ningún error: usa el idioma por defecto del navegador. Con Chrome en castellano, eu-ES escribe «jueves, 29 de octubre»; con Chrome en euskera, fallan hasta los números: i18next escribió el millón como «1,000,000», con comas a la inglesa, y un total en euros con gl-ES salió «€ 34.90». Safari y Node sí los tienen. PluralRules sí funciona en euskera y gallego en Chrome."
}
```

Es lo que te enseñaba la última línea de la primera demostración: `resolvedOptions().locale` dice qué datos se han usado de verdad. Si la abres en un Chrome en castellano y pulsas `eu-ES`, esa línea dice `es-ES`, y todo sale como en castellano: «jueves, 29 de octubre», «250 gramos, 500 gramos y 1000 gramos». En Safari, «250 gramo, 500 gramo eta 1.000 gramo». Con `Intl.DateTimeFormat.supportedLocalesOf(['eu'])` lo sabes antes de formatear: en Chrome devuelve `[]`. Si tu web tiene que escribir fechas y unidades en euskera o gallego también en Chrome, los **polyfills de FormatJS** cargan los datos que faltan, y solo en el navegador que los necesita:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { shouldPolyfill } from '@formatjs/intl-datetimeformat/should-polyfill.js'\n\n// Un import() con la ruta escrita entera por idioma: Vite hace un archivo de cada uno\nconst DATOS = {\n  eu: () => import('@formatjs/intl-datetimeformat/locale-data/eu.js'),\n  gl: () => import('@formatjs/intl-datetimeformat/locale-data/gl.js'),\n}\n\n// Antes de pintar fechas en ese idioma: carga lo que le falte al navegador\nexport async function prepararFechas(idioma) {\n  const falta = shouldPolyfill(idioma)\n  if (!falta) return\n\n  await import('@formatjs/intl-datetimeformat/polyfill-force.js')\n  await Promise.all([import('@formatjs/intl-datetimeformat/add-golden-tz.js'), DATOS[falta]?.()])\n}",
  "anotaciones": [
    {
      "fragmento": "const falta = shouldPolyfill(idioma)",
      "nota": "Devuelve el idioma cuyos datos hay que cargar, o undefined si el navegador ya lo sabe. Comprobado con @formatjs/intl-datetimeformat 7.8.2: en Chrome 156 devuelve eu para eu-ES y gl para gl-ES; en Safari, undefined para los cinco idiomas de la primera demostración."
    },
    {
      "fragmento": "await import('@formatjs/intl-datetimeformat/polyfill-force.js')",
      "nota": "Sustituye el Intl.DateTimeFormat del navegador por el de FormatJS. Va primero: los datos se registran en él."
    },
    {
      "fragmento": "eu: () => import('@formatjs/intl-datetimeformat/locale-data/eu.js'),",
      "nota": "Los textos de cada idioma: meses, días, el orden de las partes. La documentación de FormatJS pone una variable en la ruta del import(), pero Vite no sabe resolver eso dentro de un paquete: comprobado, el build lo dejó tal cual y Chrome falló con «Failed to resolve module specifier». Con la ruta entera, Vite hace un archivo por idioma, de unos 17 kB comprimidos."
    },
    {
      "fragmento": "import('@formatjs/intl-datetimeformat/add-golden-tz.js')",
      "nota": "El polyfill trae su propia base de zonas horarias: esta tiene las más usadas, Europe/Madrid incluida, y add-all-tz, todas. Es lo que más pesa: unos 133 kB comprimidos."
    }
  ]
}
```

Llámalo antes de pintar en ese idioma (por ejemplo, antes de cambiarlo). Comprobado en el build de Vite: en Chrome 156, `eu-ES` pasó de «jueves, 29 de octubre de 2026» a «2026(e)ko urriaren 29(a), osteguna», y `gl-ES`, a «xoves, 29 de outubro de 2026», a cambio de unos 170 kB comprimidos que solo descarga Chrome. Safari no descargó nada. Hay un paquete así por cada formateador: `@formatjs/intl-numberformat`, `@formatjs/intl-relativetimeformat`, `@formatjs/intl-listformat`…

## El servidor no habla el idioma de tu usuario

La lista de errores de hidratación de la lección 87 incluía «fechas y números según el idioma o la zona horaria del usuario», y en el proyecto 98 arreglaste la zona horaria. El idioma tiene las mismas trampas:

- **Sin idioma, `Intl` usa el del sitio donde se ejecuta.** En Node 22, en el ordenador donde se escribió esta lección, `(1234.5).toLocaleString()` da «1,234.5»: su idioma por defecto es `en-US`. En Chrome en castellano, la misma línea da «1234,5». Pasa siempre el idioma, y la zona horaria en las fechas.
- **Incluso con el idioma, servidor y navegador pueden no coincidir.** Con `eu-ES`, Node escribe «2026(e)ko urriaren 29(a)»; Chrome, al hidratar, calcula «29 de octubre de 2026», y React responde con el error de la lección 98: `Hydration failed because the server rendered text didn't match the client`. Safari hidrata sin problemas. Comprobado con React 19.3.1. Para idiomas que no todos los navegadores tienen, carga el polyfill antes de hidratar o manda el texto ya formateado como un dato más, como hacía la revista de la lección 98 con sus fechas.
- **El servidor tiene que saber el idioma antes de pintar.** Si está en la URL (`/ca/cesta`), lo sabe desde la primera petición. La cabecera `Accept-Language` es la versión del servidor de `navigator.languages`: sirve para decidir adónde mandar a quien entra por `/`, no para cambiar el idioma de `/ca/`.

## Traducir textos: un `t()` hecho a mano

Los formatos están resueltos; las frases, no. **Hacen falta un diccionario por idioma, con las mismas claves en todos, y una función `t(clave)` que busque la frase en el idioma actual.** En React, el idioma actual es un buen caso para un contexto (lección 28): lo leen componentes de toda la app y cambia muy poco, justo lo que la lección 75 decía que un contexto hace bien.

Antes de ver la librería, este es un `t()` de unas cincuenta líneas que hace lo esencial. Lee `idioma.jsx`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un t() hecho a mano, con plurales y respaldo",
  "consigna": "Cambia de idioma y usa los botones de la cesta: con 1, singular, y con 0 o 2, plural, en los tres idiomas. En catalán, el envío sale en castellano: falta la clave y se usa el respaldo. «cesta.cupon» no existe en ningún idioma: sale la clave tal cual y un aviso en la consola, repetido por StrictMode. Después borra campana.vendidas_many del castellano en traducciones.jsx y mira qué pasa con el millón.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { IdiomaProvider, useT } from './idioma'\nimport './estilos.css'\n\nconst IDIOMAS = { es: 'Español', ca: 'Català', en: 'English' }\n\nfunction Cabecera() {\n  const { t } = useT()\n  return (\n    <header>\n      <h1>Turrones El Panal</h1>\n      <p>{t('tienda.lema')}</p>\n      <p className=\"vendidas\">{t('campana.vendidas', { count: 1000000 })}</p>\n    </header>\n  )\n}\n\nfunction Producto() {\n  const { t, euros } = useT()\n  const [unidades, setUnidades] = useState(1)\n\n  return (\n    <article className=\"producto\">\n      <h2>{t('producto.nombre')}</h2>\n      <p>{t('cesta.unidades', { count: unidades })}</p>\n      <div className=\"botones\">\n        <button onClick={() => setUnidades(unidades + 1)}>{t('producto.anadir')}</button>\n        <button onClick={() => setUnidades(unidades - 1)} disabled={unidades === 0}>\n          {t('producto.quitar')}\n        </button>\n      </div>\n      <p>{t('cesta.envio', { importe: euros(50) })}</p>\n      <p>{t('cesta.cupon')}</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  const [idioma, setIdioma] = useState('es')\n\n  return (\n    <IdiomaProvider idioma={idioma}>\n      <div className=\"idiomas\" role=\"group\" aria-label=\"Idioma\">\n        {Object.entries(IDIOMAS).map(([codigo, nombre]) => (\n          <button\n            key={codigo}\n            lang={codigo}\n            aria-pressed={codigo === idioma}\n            onClick={() => setIdioma(codigo)}\n          >\n            {nombre}\n          </button>\n        ))}\n      </div>\n      <div lang={idioma}>\n        <Cabecera />\n        <Producto />\n      </div>\n    </IdiomaProvider>\n  )\n}\n"
    },
    {
      "nombre": "idioma.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { TRADUCCIONES } from './traducciones'\n\nconst IdiomaContext = createContext('es')\nIdiomaContext.displayName = 'Idioma'\n\nexport function IdiomaProvider({ idioma, children }) {\n  return <IdiomaContext value={idioma}>{children}</IdiomaContext>\n}\n\n// Lo que no esté traducido se busca en castellano\nconst RESPALDO = 'es'\n\n// Plurales, números y euros: un juego por idioma, creado una sola vez\nconst juegos = new Map()\nfunction intl(idioma) {\n  if (!juegos.has(idioma)) {\n    juegos.set(idioma, {\n      plural: new Intl.PluralRules(idioma),\n      numero: new Intl.NumberFormat(idioma),\n      euros: new Intl.NumberFormat(idioma, { style: 'currency', currency: 'EUR' }),\n    })\n  }\n  return juegos.get(idioma)\n}\n\nexport function traducir(idioma, clave, valores = {}) {\n  // Con count, la clave lleva la forma del plural: _one, _many, _other...\n  const buscada =\n    typeof valores.count === 'number'\n      ? `${clave}_${intl(idioma).plural.select(valores.count)}`\n      : clave\n  const texto = TRADUCCIONES[idioma]?.[buscada] ?? TRADUCCIONES[RESPALDO][buscada]\n\n  if (texto === undefined) {\n    console.warn(`Falta la traducción de «${buscada}» (${idioma})`)\n    return clave\n  }\n\n  // {{nombre}} se cambia por su valor; los números, con el formato del idioma\n  return texto.replace(/\\{\\{(\\w+)\\}\\}/g, (_, nombre) => {\n    const valor = valores[nombre]\n    return typeof valor === 'number' ? intl(idioma).numero.format(valor) : String(valor ?? '')\n  })\n}\n\nexport function useT() {\n  const idioma = useContext(IdiomaContext)\n  return {\n    idioma,\n    t: (clave, valores) => traducir(idioma, clave, valores),\n    euros: (cantidad) => intl(idioma).euros.format(cantidad),\n  }\n}\n"
    },
    {
      "nombre": "traducciones.jsx",
      "codigo": "// Un diccionario por idioma, con las mismas claves en todos.\n// Al catalán le falta «cesta.envio», y «cesta.cupon» no la tiene nadie.\nexport const TRADUCCIONES = {\n  es: {\n    'tienda.lema': 'Turrón artesano desde 1952',\n    'producto.nombre': 'Turrón blando de almendra',\n    'producto.anadir': 'Añadir a la cesta',\n    'producto.quitar': 'Quitar una',\n    'cesta.unidades_one': '{{count}} tableta en la cesta',\n    'cesta.unidades_other': '{{count}} tabletas en la cesta',\n    'cesta.envio': 'Envío gratis a partir de {{importe}}',\n    'campana.vendidas_one': '{{count}} tableta vendida esta campaña',\n    'campana.vendidas_many': '{{count}} de tabletas vendidas esta campaña',\n    'campana.vendidas_other': '{{count}} tabletas vendidas esta campaña',\n  },\n  ca: {\n    'tienda.lema': 'Torró artesà des de 1952',\n    'producto.nombre': 'Torró tou d’ametlla',\n    'producto.anadir': 'Afegeix a la cistella',\n    'producto.quitar': 'Treu-ne una',\n    'cesta.unidades_one': '{{count}} pastilla a la cistella',\n    'cesta.unidades_other': '{{count}} pastilles a la cistella',\n    'campana.vendidas_one': '{{count}} pastilla venuda aquesta campanya',\n    'campana.vendidas_many': '{{count}} de pastilles venudes aquesta campanya',\n    'campana.vendidas_other': '{{count}} pastilles venudes aquesta campanya',\n  },\n  en: {\n    'tienda.lema': 'Handmade turrón since 1952',\n    'producto.nombre': 'Soft almond turrón',\n    'producto.anadir': 'Add to basket',\n    'producto.quitar': 'Remove one',\n    'cesta.unidades_one': '{{count}} bar in your basket',\n    'cesta.unidades_other': '{{count}} bars in your basket',\n    'cesta.envio': 'Free delivery on orders over {{importe}}',\n    'campana.vendidas_one': '{{count}} bar sold this season',\n    'campana.vendidas_other': '{{count}} bars sold this season',\n  },\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n}\n\n.idiomas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.idiomas button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #b45309;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.idiomas button[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nh1 {\n  margin: 0.75rem 0 0;\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\nheader p {\n  margin: 0.2rem 0;\n  color: #57534e;\n}\n\n.vendidas {\n  font-weight: 600;\n}\n\n.producto {\n  margin-top: 0.75rem;\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #fef3c7;\n}\n\n.producto h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.botones button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #78350f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.botones button:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "idioma.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Si borras `campana.vendidas_many`, el millón deja de encontrar su frase: la busca en castellano, no está, y sale la clave `campana.vendidas` con su aviso. Tu `t()` no prueba con `_other`, igual que i18next: lo verás enseguida.

Este `t()` ya hace cinco cosas: busca la clave, sustituye los `{{valores}}`, formatea los números con el idioma, elige el plural con `PluralRules` y, si algo falta, cae al castellano o devuelve la clave. Para dos idiomas y veinte frases, con esto vas sobrado. Una tienda de verdad pide más:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cargar cada idioma cuando hace falta",
      "texto": "Aquí los cinco diccionarios van en el mismo archivo y se descargan siempre. Con miles de frases, cada visitante debería bajar solo su idioma, y solo las partes de la app que visita."
    },
    {
      "titulo": "Una cadena de respaldo completa",
      "texto": "De ca-ES a ca y de ca a es, con la región, el idioma y uno o varios idiomas de respaldo. Aquí solo hay un salto, al castellano."
    },
    {
      "titulo": "Marcado dentro de una frase",
      "texto": "«Envío gratis a partir de 50 €», con «gratis» en negrita y un enlace a las condiciones, todo en una frase que el traductor pueda reordenar."
    },
    {
      "titulo": "Formatos dentro del texto",
      "texto": "Que el traductor decida dónde va el total y la frase lo formatee con Intl: «Total: {{total, currency(EUR)}}»."
    },
    {
      "titulo": "Herramientas",
      "texto": "Extraer las claves del código, avisar de las que faltan, tipos para TypeScript y plataformas donde trabajan los traductores. Es lo que hay alrededor de una librería muy usada."
    }
  ]
}
```

## react-i18next: instalar y configurar

En un proyecto de Vite, con tres paquetes:

```bash
npm install i18next react-i18next i18next-resources-to-backend
```

**i18next** es el núcleo: diccionarios, `t()`, plurales, formatos y respaldo. No sabe nada de React y funciona igual en Node. **react-i18next** lo conecta con React: el Hook `useTranslation`, el componente `<Trans>`, volver a renderizar al cambiar de idioma y suspender mientras llegan las traducciones. Y **i18next-resources-to-backend** le dice de dónde sacar cada diccionario. A 25 de octubre de 2026 van por la 26.5.11 y la 17.1.9. Es, con mucho, la más descargada de las librerías que verás aquí: unos 11,3 millones de descargas semanales de react-i18next en npm.

Cada idioma tiene una carpeta y, dentro, un JSON por **espacio de nombres** (namespace): un grupo de frases que van juntas. Las de toda la tienda en `comun`; las de la cesta, en `cesta`:

```text
src/traducciones/
  es/comun.json   es/cesta.json
  ca/comun.json   ca/cesta.json
  en/comun.json   en/cesta.json
```

Las claves pueden ir anidadas, y entonces `t('portada.titulo')` busca `titulo` dentro de `portada`, o planas, como en `es/cesta.json` y su pareja en catalán:

```json
{
  "titulo": "Tu cesta",
  "vacia": "Tu cesta está vacía.",
  "unidades_one": "{{count}} producto",
  "unidades_other": "{{count}} productos",
  "total": "Total: {{total, currency(EUR)}}"
}
```

```json
{
  "titulo": "La teva cistella",
  "vacia": "La teva cistella és buida.",
  "unidades_one": "{{count}} producte",
  "unidades_other": "{{count}} productes",
  "total": "Total: {{total, currency(EUR)}}"
}
```

La configuración va en un archivo propio, `src/i18n.js`. Usa `idiomas.js`, que verás entero en la sección de la URL: la lista de idiomas y una función que elige uno a partir de los del navegador.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import i18n from 'i18next'\nimport resourcesToBackend from 'i18next-resources-to-backend'\nimport { initReactI18next } from 'react-i18next'\nimport { IDIOMAS, IDIOMA_POR_DEFECTO, elegirIdioma } from './idiomas.js'\n\n// '/ca/cesta' → 'ca'. En '/', el que prefiera el navegador\nconst primerTramo = location.pathname.split('/')[1]\nconst inicial = IDIOMAS.includes(primerTramo) ? primerTramo : elegirIdioma(navigator.languages)\n\ni18n\n  .use(initReactI18next)\n  .use(resourcesToBackend((idioma, espacio) => import(`./traducciones/${idioma}/${espacio}.json`)))\n  .init({\n    lng: inicial,\n    supportedLngs: IDIOMAS,\n    fallbackLng: IDIOMA_POR_DEFECTO,\n    ns: ['comun'],\n    defaultNS: 'comun',\n    interpolation: { escapeValue: false },\n  })\n\nexport default i18n",
  "anotaciones": [
    {
      "fragmento": ".use(initReactI18next)",
      "nota": "Le pasa la instancia de i18next a react-i18next, que la deja disponible para useTranslation y Trans en toda la app."
    },
    {
      "fragmento": "import(`./traducciones/${idioma}/${espacio}.json`)",
      "nota": "Cada diccionario se pide la primera vez que hace falta. Vite convierte cada JSON en un archivo aparte: en el build de prueba salieron seis, de 0,3 a 0,4 kB cada uno. Admite variables en la ruta porque empieza por ./, dentro de tu proyecto."
    },
    {
      "fragmento": "lng: inicial,",
      "nota": "El idioma con el que arranca: el de la URL si lo hay y, en /, el que prefiera el navegador. Así no se descarga primero el castellano para cambiarlo al momento."
    },
    {
      "fragmento": "supportedLngs: IDIOMAS,",
      "nota": "Los idiomas que existen. Si piden otro, i18next elige el más parecido de la lista: con ca-ES usa ca, y con eu o fr, el de respaldo."
    },
    {
      "fragmento": "fallbackLng: IDIOMA_POR_DEFECTO,",
      "nota": "Dónde buscar lo que no está traducido. Su valor por defecto es dev, un idioma para desarrollo; en producción, pon uno que exista."
    },
    {
      "fragmento": "ns: ['comun'],",
      "nota": "Los espacios de nombres que se cargan al arrancar. Los demás, como cesta, llegan cuando un componente los pide."
    },
    {
      "fragmento": "interpolation: { escapeValue: false },",
      "nota": "i18next escapa los valores por defecto para que no cuelen HTML. Con React sobra, porque React ya escapa el texto (lección 82), y dejarlo activado mostraría «Ane &amp; Iker» en vez de «Ane & Iker»."
    }
  ]
}
```

Basta con importarlo una vez, antes de pintar nada, y poner un `<Suspense>` (lección 48) por encima de la app, porque un componente que pide un diccionario que todavía no ha llegado **suspende**:

```jsx
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import './i18n.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<p>…</p>}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
```

## `useTranslation`: `t` en cada componente

Cada componente pide la función `t` a `useTranslation`, con el espacio de nombres que necesita:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useTranslation } from 'react-i18next'\n\nexport default function Cesta({ lineas }) {\n  const { t } = useTranslation(['cesta', 'comun'])\n  const unidades = lineas.reduce((suma, linea) => suma + linea.cantidad, 0)\n  const total = lineas.reduce((suma, linea) => suma + linea.cantidad * linea.precio, 0)\n\n  if (unidades === 0) return <p>{t('vacia')}</p>\n\n  return (\n    <section aria-labelledby=\"titulo-cesta\">\n      <h1 id=\"titulo-cesta\">{t('titulo')}</h1>\n      <p>{t('unidades', { count: unidades })}</p>\n      <p>{t('total', { total })}</p>\n      <button>{t('pagar', { ns: 'comun' })}</button>\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useTranslation(['cesta', 'comun'])",
      "nota": "Los espacios de nombres que usa este componente. El primero es el de por defecto: t('titulo') busca en cesta. Si alguno no ha llegado todavía, el componente suspende hasta que llega."
    },
    {
      "fragmento": "t('unidades', { count: unidades })",
      "nota": "Con count, i18next elige el plural: unidades_one o unidades_other en castellano. Comprobado: con 3 escribe «3 productos», y en catalán, «3 productes»."
    },
    {
      "fragmento": "t('total', { total })",
      "nota": "La frase dice cómo formatear: «Total: {{total, currency(EUR)}}». i18next usa Intl.NumberFormat con el idioma actual: «Total: 34,90 €» en castellano y «Total: €34.90» en inglés."
    },
    {
      "fragmento": "t('pagar', { ns: 'comun' })",
      "nota": "Una frase de otro espacio de nombres, con la opción ns. Sirve cualquiera de los que pediste en useTranslation."
    }
  ]
}
```

`useTranslation` devuelve también la instancia, `i18n`, por si necesitas el idioma (`i18n.resolvedLanguage`) o cambiarlo: `i18n.changeLanguage('ca')` devuelve una promesa que se cumple cuando el nuevo idioma ya está cargado, y en ese momento **vuelven a renderizarse todos los componentes que usan `useTranslation`**. Con el idioma en la URL, como verás, no llamarás a `changeLanguage` desde un botón, sino al cambiar la ruta.

Si usas TypeScript, verás que la documentación escribe `t($ => $.titulo)` en vez de `t('titulo')`. Es la API de selectores, que permite al editor autocompletar las claves y marcar las que no existen. Se activa con la opción de tipos `enableSelector`; en la versión 26.5.11 viene desactivada, y las claves como cadena siguen funcionando.

## `<Trans>`: frases con marcado dentro

La cesta quiere decir «Envío **gratis** a partir de 50 €. Condiciones», con «gratis» en negrita y «Condiciones» como enlace. La tentación es pegar trozos traducidos: `{t('envio')} <strong>{t('gratis')}</strong> {t('aPartirDe')} {importe}`. En inglés no funciona, porque la frase va en otro orden: «**Free delivery** on orders over 50 €». Lo que va en negrita pasa al principio, y el importe, al final. **El traductor necesita la frase entera**, con marcas para los elementos. Y meter HTML en la traducción y pintarlo con `dangerouslySetInnerHTML` es justo lo que la lección 82 te pidió no hacer.

Para eso está `<Trans>`. La frase lleva etiquetas inventadas, y el componente dice qué elemento de React va en cada una:

```json
{
  "envioGratis": "Envío <fuerte>gratis</fuerte> a partir de {{importe}}. <enlace>Condiciones</enlace>"
}
```

```json
{
  "envioGratis": "<fuerte>Free delivery</fuerte> on orders over {{importe}}. <enlace>Terms</enlace>"
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Trans, useTranslation } from 'react-i18next'\nimport { Link } from 'react-router'\n\nexport default function AvisoEnvio({ idioma, minimo }) {\n  const { t } = useTranslation('cesta')\n\n  return (\n    <p className=\"aviso\">\n      <Trans\n        t={t}\n        i18nKey=\"envioGratis\"\n        values={{ importe: minimo }}\n        components={{\n          fuerte: <strong />,\n          enlace: <Link to={`/${idioma}/envios`} />,\n        }}\n      />\n    </p>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "t={t}",
      "nota": "Pásale la t de useTranslation. Trans, por sí solo, no se entera de los cambios de idioma: comprobado, uno sin t en un componente que no vuelve a renderizarse se quedó en castellano al cambiar al catalán."
    },
    {
      "fragmento": "values={{ importe: minimo }}",
      "nota": "Los valores de la frase, como en t(). Llegan como texto: React los escapa, así que un importe con < o & no puede colar HTML."
    },
    {
      "fragmento": "fuerte: <strong />,",
      "nota": "La etiqueta fuerte de la traducción se convierte en este strong, con lo que haya dentro. El traductor mueve la etiqueta; tú decides qué elemento es. No uses como nombre una etiqueta de HTML sin cierre, como link o img: están reservadas."
    },
    {
      "fragmento": "enlace: <Link to={`/${idioma}/envios`} />,",
      "nota": "Puede ser cualquier componente: aquí, el Link de React Router con su ruta. El texto del enlace sale de la traducción."
    }
  ]
}
```

Comprobado con react-i18next 17.1.9 y React Router 8.5.0 en Chrome y Safari, el castellano pinta esto (el `data-discover` lo pone `Link`, como viste en la lección 76):

```html
<p class="aviso">Envío <strong>gratis</strong> a partir de 50 €. <a href="/es/envios" data-discover="true">Condiciones</a></p>
```

Y el inglés, con el orden cambiado:

```html
<p class="aviso"><strong>Free delivery</strong> on orders over 50 €. <a href="/en/envios" data-discover="true">Terms</a></p>
```

Y si una traducción trae etiquetas que no están en `components`, como un `<img onerror>` o un `<script>`, `<Trans>` las pinta como texto: no crea elementos que no le hayas dado.

`<Trans>` también admite la forma antigua, con el texto como hijos y etiquetas numeradas (`<1>gratis</1>`), que verás en código existente. La documentación recomienda la de `components` con nombres: es más fácil de leer para ti y para quien traduce. Y si la frase no lleva marcado, no hace falta: `t()` basta.

## Plurales: el formato de i18next frente a ICU

Los plurales de i18next son los de tu `t()` hecho a mano: **una clave por categoría**, con la categoría como sufijo. Para el contador de la campaña:

```json
{
  "vendidas_one": "{{count, number}} tableta vendida",
  "vendidas_many": "{{count, number}} de tabletas vendidas",
  "vendidas_other": "{{count, number}} tabletas vendidas"
}
```

La variable tiene que llamarse `count`, y `{{count, number}}` la formatea con `Intl.NumberFormat`: «1.000.000 de tabletas vendidas», pero «1500 tabletas vendidas», sin punto. ¿Y si alguien olvida la forma `many`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// es/comun.json\n{\n  \"vendidas_one\": \"{{count, number}} tableta vendida\",\n  \"vendidas_other\": \"{{count, number}} tabletas vendidas\"\n}\n\n// En un componente, con la tienda en castellano:\nt('vendidas', { count: 1000000 })",
  "opciones": [
    "«1.000.000 tabletas vendidas»",
    "«1.000.000 de tabletas vendidas»",
    "«vendidas»: la clave",
    "«1000000 tabletas vendidas»"
  ],
  "correcta": 2,
  "explicacion": "Para un millón exacto, PluralRules devuelve many en castellano, así que i18next busca vendidas_many. No está, no prueba con vendidas_other y devuelve la clave. Con debug: true lo cuenta en la consola: «missingKey es comun vendidas_many vendidas». Comprobado con i18next 26.5.11; Node, Chrome y Safari devuelven many para 1000000. Con importes o visitas que pueden llegar al millón, pon siempre la forma _many en castellano y catalán."
}
```

La otra forma de escribir plurales es **ICU MessageFormat**, un formato estándar en el que **una sola frase lleva todos los casos**:

```text
{count, plural, =0 {No quedan tabletas} one {Queda # tableta} many {Quedan # de tabletas} other {Quedan # tabletas}}
```

i18next lo entiende con el plugin `i18next-icu` (y su dependencia `intl-messageformat`). Comprobado con i18next-icu 2.6.1: `#` se escribe con el formato del idioma («1.000.000»), `=0` gana a las categorías y, si falta `many`, **usa `other`** en vez de devolver la clave. Las dos formas, frente a frente:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de escribir plurales",
  "roles": [
    {
      "etiqueta": "Formato de i18next",
      "rol": "Una clave por categoría",
      "descripcion": "vendidas_one, vendidas_many, vendidas_other. Cada forma es una cadena corta y fácil de traducir. Si falta una categoría, sale la clave."
    },
    {
      "etiqueta": "ICU MessageFormat",
      "rol": "Una frase con todos los casos",
      "descripcion": "other es obligatorio y hace de respaldo; admite =0 y casos según género o tipo. Es el estándar de FormatJS y Lingui, pero con él i18next deja de entender los sufijos y las {{llaves}}."
    }
  ]
}
```

Si empiezas con i18next, su formato es más sencillo. ICU compensa cuando los traductores ya trabajan con él o cuando las frases tienen muchos casos. Lo que no conviene es mezclarlos: con `i18next-icu` activado, la documentación avisa de que los sufijos `_one`, la interpolación con `{{nombre}}` y el anidado con `$t()` dejan de funcionar.

## Espacios de nombres y traducciones bajo demanda

Con `resourcesToBackend` y `import()`, **cada diccionario se descarga la primera vez que un componente lo pide**. Comprobado en el build de producción con Chrome y la red a la vista:

- Al entrar en `/ca/`, se descargó `comun` en catalán… y también en castellano, el idioma de respaldo. i18next carga siempre el respaldo, por si falta alguna frase.
- `cesta` no se descargó hasta entrar en `/ca/cesta`. Abriendo una cesta directamente, con la red lenta, se vio el `fallback` del `<Suspense>` hasta que llegaron `comun` y `cesta`, uno detrás de otro. Pero al ir de la portada a la cesta con un enlace, el `fallback` no apareció: se siguió viendo la portada hasta que llegó el diccionario. El `BrowserRouter` de React Router 8.5.0 cambia la ubicación dentro de `startTransition`, y en una transición React mantiene lo que ya se ve (lección 51).
- Al cambiar al inglés, i18next **esperó a tener el inglés antes de cambiar**. Con un retraso de 800 ms en la red, la URL ya decía `/en/` y el texto siguió en catalán esos 800 ms. El efecto es el mismo que el de una transición: lo que se ve no cambia hasta que lo nuevo está listo.

Si prefieres no usar `<Suspense>`, `useTranslation('cesta', { useSuspense: false })` devuelve además `ready`, y eres tú quien pinta algo mientras es `false`. Y si los JSON están en una carpeta pública en lugar de en `src`, `i18next-http-backend` los pide por la red con una ruta como `/locales/{{lng}}/{{ns}}.json`.

Organiza los espacios de nombres como el código: uno común con lo que se usa en todas partes (botones, menú, errores) y uno por sección grande (cesta, cuenta, panel de administración). Así, quien solo mira la portada no descarga las frases del panel.

## Qué pasa con una clave que falta

Es el fallo más frecuente de una app traducida, así que conviene saber exactamente qué hace i18next (comprobado con la 26.5.11):

- **Primero recorre la cadena de respaldo.** Si la frase no está en catalán, la busca en el idioma de respaldo: el cliente lee esa línea en castellano. No hay ningún aviso.
- **Si no está en ninguno, devuelve la clave.** `t('cupon')` pinta «cupon» y `t('carrito.vacio')`, «carrito.vacio». No lanza ningún error: la página sigue funcionando, con una palabra rara en medio.
- **Con `debug: true`, lo cuenta en la consola**, con el idioma, el espacio de nombres, la clave y lo que ha devuelto: `i18next::translator: missingKey ca cesta cupon cupon`.
- **Puedes marcarlas mientras desarrollas.** La opción `parseMissingKeyHandler` decide qué se pinta en su lugar: con `parseMissingKeyHandler: (clave) => '⟦' + clave + '⟧'`, la clave que falta sale como «⟦cesta.cupon⟧» y salta a la vista. Y con `saveMissing: true` y `missingKeyHandler`, i18next te avisa de cada una para que las recojas.
- **Una cadena vacía cuenta como traducida.** Si un JSON tiene `"vacia": ""`, se pinta vacío; con `returnEmptyString: false`, i18next la trata como si faltara.

En los tests (lección 83), el idioma especial `cimode` hace que `t()` devuelva siempre la clave: así puedes comprobar que un componente usa la frase correcta sin depender de cómo esté redactada.

## El idioma en la URL

¿Dónde se guarda el idioma actual? En el `t()` hecho a mano era un estado de `App`: al recargar, vuelta al castellano. Guardarlo en `localStorage` lo hace sobrevivir a la recarga, pero se queda corto. La lección 77 te dio la pregunta: **¿tiene que sobrevivir a una recarga, compartirse en un enlace o deshacerse con Atrás?** Con el idioma, sí a las tres, y además lo necesitan el servidor y los buscadores. Por eso va **en la URL**: `/ca/cesta`, `/en/cesta`.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El enlace lleva el idioma",
      "texto": "Si una clienta comparte /ca/cesta, quien lo abre lo ve en catalán. Con el idioma en localStorage, cada persona vería el suyo, y «mira esta frase» dejaría de tener sentido."
    },
    {
      "titulo": "El servidor lo sabe desde la primera petición",
      "texto": "Con renderizado en el servidor (módulo 13), la página llega ya en su idioma, con su lang y sus metadatos. localStorage solo lo conoce el navegador, después de ejecutar JavaScript."
    },
    {
      "titulo": "Los buscadores ven cada versión",
      "texto": "Google recomienda una URL distinta para cada idioma «en lugar de usar cookies o la configuración del navegador» para cambiar el idioma del contenido, y así indexa cada versión por separado."
    },
    {
      "titulo": "localStorage, como preferencia",
      "texto": "Puede recordar el último idioma elegido para decidir adónde mandar a quien vuelve a entrar por /. Pero si la URL dice /ca/, manda la URL."
    }
  ]
}
```

### La primera visita: `navigator.languages`

Quien entra por `/` no ha elegido idioma. El navegador sí tiene una lista, la de su configuración: `navigator.languages`, por ejemplo `['fr-FR', 'ca-ES', 'es']`, y `navigator.language` es la primera. Lo habitual es elegir **el primero de esa lista que la tienda tenga**, comparando por el idioma base: aquí, `ca-ES` encaja con `ca`, igual que `ca-ES-valencia`. Si no hay ninguno, el de por defecto: con `['eu-ES', 'fr-FR']`, castellano.

Y solo en `/`. La guía de Google para webs en varios idiomas pide **no redirigir según el idioma que creas que tiene el usuario**: alguien con el navegador en inglés que abre un enlace a `/es/cesta` quiere ver esa página, y un buscador también. Si la URL dice el idioma, se respeta, y el selector de idiomas está ahí para cambiarlo.

La redirección desde `/` **reemplaza** la entrada del historial, como `navigate(…, { replace: true })` en la lección 77 (o el componente `<Navigate replace>`, que hace lo mismo al pintarse). Si no, Atrás volvería a `/`, que redirigiría otra vez, y el usuario no podría salir.

### `lang` y `dir` en el `<html>`

El atributo `lang` del `<html>` (lo viste en la lección 3 del temario de HTML) dice en qué idioma está la página. No es decoración: **el lector de pantalla elige con él la voz y la pronunciación**, y sin él leería el catalán con las reglas del castellano. El navegador lo usa también para ofrecer la traducción, partir palabras con `hyphens: auto` o revisar la ortografía, y el CSS, para `:lang()`. Al cambiar de idioma, `lang` tiene que cambiar con él.

En una app de Vite, React pinta dentro de `#root`; el `<html>` está fuera. Se sincroniza con un efecto (lección 38), porque es justo eso: poner algo de fuera de React al día con un valor de React. Con él va **`dir`**: `rtl` para los idiomas que se escriben de derecha a izquierda, como el árabe, el hebreo, el persa o el urdu, y `ltr` para los demás. i18next lo sabe con `i18n.dir('ar')`, que devuelve `'rtl'`.

### Las otras versiones: `hreflang`

Por último, cada página puede decir dónde están sus versiones en los demás idiomas, con un `<link rel="alternate" hreflang>` por idioma. Ya sabes de la lección 81 que un `<link>` pintado en un componente acaba en el `<head>`. Las reglas de Google:

- Cada versión enlaza **a todas, incluida ella misma**, y el conjunto es el mismo en todas las versiones.
- Los enlaces tienen que ser **recíprocos**: si `/es/cesta` apunta a `/ca/cesta` y no al revés, se ignoran.
- Las URL van **completas**, con `https://`.
- `hreflang="x-default"` señala la página para quien no tenga ninguno de esos idiomas: aquí, `/`, la que elige por él.

En JSX el atributo se escribe `hrefLang`. Con `hreflang` también funciona, pero React avisa en la consola (comprobado con React 19.3.1):

```text
Invalid DOM property `hreflang`. Did you mean `hrefLang`?
```

Es decir: esa propiedad no existe en el DOM; quizá querías decir `hrefLang`. Y recuerda lo que pasaba con las `og:` de la lección 81: en una SPA estos enlaces aparecen después de ejecutar JavaScript; Google los ve, pero otros robots no.

Todo junto, en una página: pulsa los idiomas y mira el documento. El árabe no está entre los de la tienda, y no tiene `hreflang`; está para ver `dir="rtl"`.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "lang, dir y hreflang de la cesta",
  "codigo": "import { useEffect, useState } from 'react'\n\nconst WEB = 'https://turroneselpanal.example'\nconst IDIOMAS = ['es', 'ca', 'en']\nconst NOMBRES = { es: 'Español', ca: 'Català', en: 'English', ar: 'العربية' }\nconst TITULOS = {\n  es: 'Tu cesta',\n  ca: 'La teva cistella',\n  en: 'Your basket',\n  ar: 'سلة التسوق',\n}\nconst DE_DERECHA_A_IZQUIERDA = ['ar', 'he', 'fa', 'ur']\n\n// Las versiones de esta página en cada idioma, y la que elige por ti\nfunction Alternativas({ resto }) {\n  return (\n    <>\n      {IDIOMAS.map((otro) => (\n        <link key={otro} rel=\"alternate\" hrefLang={otro} href={`${WEB}/${otro}${resto}`} />\n      ))}\n      <link rel=\"alternate\" hrefLang=\"x-default\" href={`${WEB}/`} />\n    </>\n  )\n}\n\nexport default function App() {\n  const [idioma, setIdioma] = useState('es')\n  const [foto, setFoto] = useState('')\n\n  // El <html> no lo pinta React: se sincroniza con un efecto\n  useEffect(() => {\n    document.documentElement.lang = idioma\n    document.documentElement.dir = DE_DERECHA_A_IZQUIERDA.includes(idioma) ? 'rtl' : 'ltr'\n  }, [idioma])\n\n  function mirar() {\n    const { lang, dir } = document.documentElement\n    const enlaces = document.querySelectorAll('link[rel=\"alternate\"]')\n    const lineas = [...enlaces].map((l) => `<link hreflang=\"${l.hreflang}\" href=\"${l.getAttribute('href')}\">`)\n    setFoto([`<html lang=\"${lang}\" dir=\"${dir}\">`, ...lineas].join('\\n'))\n  }\n\n  return (\n    <main>\n      <Alternativas resto=\"/cesta\" />\n      <nav className=\"idiomas\" aria-label=\"Idiomas\">\n        {Object.entries(NOMBRES).map(([codigo, nombre]) => (\n          <button\n            key={codigo}\n            lang={codigo}\n            aria-pressed={codigo === idioma}\n            onClick={() => setIdioma(codigo)}\n          >\n            {nombre}\n          </button>\n        ))}\n      </nav>\n      <h1>{TITULOS[idioma]}</h1>\n      <p className=\"ruta\">/{idioma}/cesta</p>\n      <button onClick={mirar}>Mirar el documento</button>\n      {foto && <pre>{foto}</pre>}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.idiomas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #b45309;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.idiomas button[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nh1 {\n  margin: 0.75rem 0 0;\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\n.ruta {\n  margin: 0.2rem 0 0.75rem;\n  color: #57534e;\n  font-family: ui-monospace, monospace;\n}\n\npre {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n  font-size: 0.75rem;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}",
  "anotaciones": [
    {
      "fragmento": "<link key={otro} rel=\"alternate\" hrefLang={otro} href={`${WEB}/${otro}${resto}`} />",
      "nota": "Una versión por idioma, incluida la propia, con la URL completa. React los sube al head (lección 81) y los quita si el componente se desmonta."
    },
    {
      "fragmento": "<link rel=\"alternate\" hrefLang=\"x-default\" href={`${WEB}/`} />",
      "nota": "Para quien no tenga ninguno de estos idiomas: la portada sin idioma, que elige uno por él."
    },
    {
      "fragmento": "document.documentElement.lang = idioma",
      "nota": "El html no lo pinta React: se pone al día con un efecto cada vez que cambia el idioma. Pulsa Català y «Mirar el documento»: lang pasa a ca."
    },
    {
      "fragmento": "? 'rtl' : 'ltr'",
      "nota": "Pulsa العربية: dir pasa a rtl y la vista previa entera se da la vuelta, con los botones empezando por la derecha. Por eso conviene usar propiedades lógicas en el CSS, como margin-inline-start en vez de margin-left."
    },
    {
      "fragmento": "lang={codigo}",
      "nota": "El W3C recomienda escribir cada idioma en su propia lengua («Català», no «Catalán», que es su nombre en castellano) y marcar con lang lo que está en otro idioma que la página. Así un lector de pantalla puede leer cada nombre con la voz de su idioma."
    },
    {
      "fragmento": "document.querySelectorAll('link[rel=\"alternate\"]')",
      "nota": "Una foto del head en el momento del clic: si cambias de idioma, vuelve a pulsar para verlo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": false
}
```

### Con React Router y react-i18next

En el proyecto de Vite, el idioma es el primer tramo de la ruta, `:idioma`, y una ruta madre (lección 77) se encarga de todo lo de esta sección para las páginas que cuelgan de ella. Comprobado en Chrome y Safari: `/` redirige al idioma del navegador, el selector cambia de idioma sin cambiar de página y `/fr/` da la página no encontrada.

`idiomas.js`, el que usaba `i18n.js`:

```js
export const IDIOMAS = ['es', 'ca', 'en']
export const IDIOMA_POR_DEFECTO = 'es'

// ['fr-FR', 'ca-ES', 'es'] → 'ca'. El primero que tengamos, en el orden del usuario.
export function elegirIdioma(preferidos) {
  for (const etiqueta of preferidos) {
    const base = etiqueta.toLowerCase().split('-')[0]
    if (IDIOMAS.includes(base)) return base
  }
  return IDIOMA_POR_DEFECTO
}
```

Y `App.jsx`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect } from 'react'\nimport { useTranslation } from 'react-i18next'\nimport { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router'\nimport Cabecera from './Cabecera.jsx'\nimport { IDIOMAS, elegirIdioma } from './idiomas.js'\nimport Cesta from './paginas/Cesta.jsx'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\nimport Portada from './paginas/Portada.jsx'\n\nconst WEB = 'https://turroneselpanal.example'\n\n// En / no hay idioma: se elige uno y se sustituye la entrada del historial\nfunction SinIdioma() {\n  return <Navigate to={`/${elegirIdioma(navigator.languages)}/`} replace />\n}\n\nfunction ConIdioma() {\n  const { idioma } = useParams()\n  const { pathname } = useLocation()\n  const { i18n } = useTranslation()\n  const valido = IDIOMAS.includes(idioma)\n\n  // 1. La URL manda: i18next se pone al día con ella\n  useEffect(() => {\n    if (valido) i18n.changeLanguage(idioma)\n  }, [i18n, idioma, valido])\n\n  // 2. El <html> dice el idioma del texto que se ve, cuando ya ha cambiado\n  const enPantalla = i18n.resolvedLanguage\n  useEffect(() => {\n    document.documentElement.lang = enPantalla\n    document.documentElement.dir = i18n.dir(enPantalla)\n  }, [i18n, enPantalla])\n\n  if (!valido) return <NoEncontrada />\n\n  const resto = pathname.slice(idioma.length + 1) // '/ca/cesta' → '/cesta'\n  return (\n    <>\n      {IDIOMAS.map((otro) => (\n        <link key={otro} rel=\"alternate\" hrefLang={otro} href={`${WEB}/${otro}${resto}`} />\n      ))}\n      <link rel=\"alternate\" hrefLang=\"x-default\" href={`${WEB}/`} />\n      <Cabecera />\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Routes>\n      <Route index element={<SinIdioma />} />\n      <Route path=\":idioma\" element={<ConIdioma />}>\n        <Route index element={<Portada />} />\n        <Route path=\"cesta\" element={<Cesta />} />\n      </Route>\n    </Routes>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Navigate to={`/${elegirIdioma(navigator.languages)}/`} replace />",
      "nota": "Solo en /, que no dice ningún idioma. Con replace, la entrada de / se sustituye: comprobado, Atrás desde /ca/ salió de la web en vez de volver a / y rebotar."
    },
    {
      "fragmento": "<Route path=\":idioma\" element={<ConIdioma />}>",
      "nota": "El idioma es un parámetro (lección 77). /ca/cesta encaja con :idioma y cesta, y ConIdioma envuelve a todas las páginas."
    },
    {
      "fragmento": "if (valido) i18n.changeLanguage(idioma)",
      "nota": "La URL es la dueña del idioma, e i18next guarda el suyo: es otro dueño que hay que sincronizar, y para eso está un efecto. Con la URL de /fr/ no se cambia nada."
    },
    {
      "fragmento": "const enPantalla = i18n.resolvedLanguage",
      "nota": "changeLanguage tarda lo que tarde en llegar el idioma nuevo, y mientras tanto se sigue viendo el anterior. Por eso lang sigue al idioma que i18next tiene puesto, no a la URL: así siempre describe el texto que se ve."
    },
    {
      "fragmento": "document.documentElement.dir = i18n.dir(enPantalla)",
      "nota": "i18next sabe qué idiomas se escriben de derecha a izquierda: dir('ar') devuelve rtl y dir('ca'), ltr."
    },
    {
      "fragmento": "if (!valido) return <NoEncontrada />",
      "nota": "/fr/ encaja con :idioma, pero no es un idioma de la tienda. Después de los Hooks, como siempre (lección 44)."
    },
    {
      "fragmento": "const resto = pathname.slice(idioma.length + 1) // '/ca/cesta' → '/cesta'",
      "nota": "Lo que va detrás del idioma. Sirve para los hreflang y para que el selector de Cabecera lleve de /ca/cesta a /en/cesta, no a la portada."
    },
    {
      "fragmento": "<link rel=\"alternate\" hrefLang=\"x-default\" href={`${WEB}/`} />",
      "nota": "Los mismos enlaces que en la demostración, generados para cada página. Comprobado en el head de /ca/cesta: tres versiones más x-default."
    }
  ]
}
```

La `Cabecera` pinta el selector con un `<Link>` por idioma que lleva a `/${codigo}${resto}`, con `hrefLang` y `lang` en cada uno, como en la demostración. No necesita llamar a `changeLanguage`: **cambia la URL, y la URL cambia el idioma**.

## Alternativas: FormatJS y Lingui

react-i18next no es la única opción. Las dos alternativas más conocidas usan ICU MessageFormat:

- **react-intl**, del proyecto FormatJS (el de los polyfills de antes): `<FormattedMessage>`, `useIntl()` y componentes como `<FormattedNumber>` y `<FormattedDate>` sobre `Intl`. Unos 1,9 millones de descargas semanales en npm, frente a los 11,3 de react-i18next (semana del 16 al 22 de octubre de 2026).
- **Lingui**: escribes el texto original en el código con sus macros (`Trans` y `t`), y su herramienta de línea de órdenes lo extrae a catálogos para los traductores y los compila en el build. Unos 0,85 millones.

Lo demás de esta lección no depende de la librería: `Intl`, las categorías de plural, el idioma en la URL, `lang`, `dir` y `hreflang` son iguales con cualquiera.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Intl, siempre",
      "texto": "Aunque la app tenga un solo idioma: una tienda solo en castellano también tiene que escribir «1234,50 €» y «jueves, 29 de octubre». Nada de toFixed, replace ni nombres de meses escritos a mano."
    },
    {
      "titulo": "Un t() desde el principio, si habrá otro idioma",
      "texto": "Sacar las frases a un diccionario cuando la app ya tiene cien pantallas es un trabajo largo. Con dos idiomas y pocas frases, un contexto y un objeto como los de esta lección bastan."
    },
    {
      "titulo": "Una librería cuando crece",
      "texto": "Muchos idiomas, traductores que no tocan el código, carga bajo demanda, frases con marcado y plurales difíciles: ahí es donde react-i18next, react-intl o Lingui compensan."
    },
    {
      "titulo": "El idioma en la URL, si la página es pública",
      "texto": "Tiendas, blogs, documentación: todo lo que se comparte y se indexa. En una app privada, detrás de una sesión, el idioma puede ser una preferencia de la cuenta: nadie va a compartir ni indexar su panel."
    }
  ]
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El atributo lang le dice a Google en qué idioma está la página",
      "realidad": "Google lo dice expresamente: no usa hreflang ni el atributo lang para saber el idioma de una página, lo detecta con sus algoritmos. lang es para los lectores de pantalla y el navegador, y hreflang, para decirle dónde están las otras versiones."
    },
    {
      "mito": "Intl da el mismo texto en todos los navegadores",
      "realidad": "Chrome no trae euskera ni gallego, y en los idiomas que sí tienen todos, los detalles cambian entre motores y versiones, como el «at» de Safari en las horas en inglés. Un test no debería esperar un texto escrito a mano."
    },
    {
      "mito": "Con escapeValue: false, la app queda expuesta a XSS",
      "realidad": "React escapa el texto que pinta, así que t() puede devolver lo que sea. El riesgo vuelve si metes una traducción en dangerouslySetInnerHTML (lección 82). Trans no lo hace: las etiquetas que no le das se pintan como texto."
    },
    {
      "mito": "Traducir es cambiar unas palabras por otras",
      "realidad": "Cambian el orden, los plurales y la gramática. Por eso se traducen frases enteras, con huecos para los valores y los elementos, y nunca trozos pegados."
    },
    {
      "mito": "navigator.language es el idioma que quiere el usuario",
      "realidad": "Es el primero de la lista de su navegador, que muchas veces viene de fábrica. Sirve para elegir adónde mandar a quien entra por /; después decide el usuario con el selector, y la URL lo recuerda."
    },
    {
      "mito": "Para los plurales basta con count === 1",
      "realidad": "El castellano y el catalán tienen una forma para los millones, y el árabe tiene seis. Intl.PluralRules sabe las reglas de cada idioma."
    }
  ]
}
```

## Errores típicos

**Formatear sin idioma.** `precio.toLocaleString()` o `new Intl.NumberFormat()` sin argumentos dependen de dónde se ejecutan: en Node 22, «1,234.5»; en un Chrome en castellano, «1234,5». Si la página se renderiza en el servidor, eso es un error de hidratación. Pasa siempre el idioma, y la zona horaria con las fechas.

**Crear el formateador en cada render.** Funciona, pero cuesta unas cincuenta veces más que reutilizarlo. Con una lista larga que se vuelve a renderizar en cada tecla, se nota. Un juego por idioma, en un `Map`.

**Pegar trozos traducidos.** `t('envio') + ' ' + importe + ' ' + t('gratis')` funciona en castellano y se rompe en inglés, que pone las palabras en otro orden. Una frase entera con `{{huecos}}`, y `<Trans>` si lleva marcado.

**Traducir fuera de un componente.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// opciones.js\nimport i18n from './i18n.js'\n\nexport const ORDENAR = [\n  { valor: 'precio', texto: i18n.t('ordenar.precio') },\n  { valor: 'nombre', texto: i18n.t('ordenar.nombre') },\n]\n\n// La tienda arranca en /es/ y un <select> pinta las opciones de ORDENAR.\n// El usuario pulsa «Català». ¿Qué dicen las opciones?",
  "opciones": [
    "«Preu» y «Nom», en catalán",
    "«Precio» y «Nombre», en castellano",
    "«ordenar.precio» y «ordenar.nombre»",
    "Nada: el select se queda vacío"
  ],
  "correcta": 1,
  "explicacion": "i18n.t se ejecuta una sola vez, al importar el módulo, y el array guarda las cadenas de ese momento. Al cambiar de idioma se vuelven a renderizar los componentes que usan useTranslation, pero ORDENAR no cambia. Y si el diccionario se cargara bajo demanda, sería peor: comprobado, i18next devuelve la clave, ordenar.precio, porque todavía no ha llegado. Guarda las claves y traduce en el render: t(opcion.clave)."
}
```

**Olvidar la forma `_many`.** En castellano y catalán, un millón exacto busca la forma `many`; si no está, sale la clave (lo viste en los plurales).

**Dejar `escapeValue` activado con React.** i18next escapa los valores y React vuelve a escaparlos: con el nombre «Ane & Iker», en el HTML queda `Hola, Ane &amp;amp; Iker` y en pantalla se lee `Hola, Ane &amp; Iker`. Con React, `interpolation: { escapeValue: false }`.

**Un `<Trans>` sin `t`.** No se suscribe a los cambios de idioma: si su componente no vuelve a renderizarse por otro motivo, se queda en el idioma anterior. Pásale la `t` de `useTranslation`.

**Guardar el idioma solo en un estado o en `localStorage`.** Los enlaces compartidos se abren en el idioma de quien los recibe, el servidor no sabe en qué idioma pintar y los buscadores solo ven una versión.

**Redirigir según el navegador en cualquier página.** Si alguien abre `/es/cesta`, quiere `/es/cesta`, aunque su navegador esté en inglés. Detecta solo en `/`, y reemplazando la entrada del historial.

**Olvidar `lang`.** La página cambia de idioma, pero el `<html>` sigue diciendo `es`: el lector de pantalla lee el catalán con la voz del castellano. Un efecto que lo ponga al día con el idioma que se ve.

## Ejercicios

**1. La ficha en tres idiomas.** La tienda pinta los precios, los pesos y los ingredientes a mano: «12.5 €», «300 g», «almendra, miel, huevo».

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Precios, pesos e ingredientes con Intl",
  "consigna": "En formatos.jsx, devuelve un juego de formateadores por idioma creados con Intl: euros (moneda, EUR), peso (unidad gram, con unitDisplay long) y lista (conjunción). Créalos la primera vez que se pide cada idioma y guárdalos en un Map para reutilizarlos. Prueba los tres idiomas antes de pulsar «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { formatos } from './formatos'\nimport './estilos.css'\n\nconst IDIOMAS = { 'es-ES': 'Español', 'ca-ES': 'Català', 'en-GB': 'English' }\n\nconst PRODUCTOS = [\n  {\n    id: 'tableta',\n    precio: 12.5,\n    gramos: 300,\n    nombre: {\n      'es-ES': 'Turrón blando',\n      'ca-ES': 'Torró tou',\n      'en-GB': 'Soft turrón',\n    },\n  },\n  {\n    id: 'cesta',\n    precio: 34.9,\n    gramos: 1500,\n    nombre: {\n      'es-ES': 'Cesta de Navidad',\n      'ca-ES': 'Panera de Nadal',\n      'en-GB': 'Christmas hamper',\n    },\n  },\n]\n\nconst INGREDIENTES = {\n  'es-ES': ['almendra', 'miel', 'huevo'],\n  'ca-ES': ['ametlla', 'mel', 'ou'],\n  'en-GB': ['almonds', 'honey', 'egg'],\n}\n\nexport default function App() {\n  const [idioma, setIdioma] = useState('es-ES')\n  const f = formatos(idioma)\n\n  return (\n    <main>\n      <h1>Turrones El Panal</h1>\n      <label className=\"idioma\">\n        Idioma\n        <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>\n          {Object.entries(IDIOMAS).map(([codigo, nombre]) => (\n            <option key={codigo} value={codigo}>\n              {nombre}\n            </option>\n          ))}\n        </select>\n      </label>\n      <ul className=\"productos\" lang={idioma}>\n        {PRODUCTOS.map((producto) => (\n          <li key={producto.id}>\n            <h2>{producto.nombre[idioma]}</h2>\n            <p className=\"precio\">{f.euros.format(producto.precio)}</p>\n            <p>{f.peso.format(producto.gramos)}</p>\n          </li>\n        ))}\n      </ul>\n      <p lang={idioma}>Ingredientes: {f.lista.format(INGREDIENTES[idioma])}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "formatos.jsx",
      "codigo": "// Tu trabajo: devuelve los formateadores de cada idioma con Intl, creados\n// una sola vez por idioma (guárdalos en un Map) y reutilizados después.\n// - euros: un NumberFormat de moneda en euros\n// - peso: un NumberFormat de unidad, gramos, con el nombre largo de la unidad\n// - lista: un ListFormat que une con «y», «i», «eta», «e» o «and»\nexport function formatos(idioma) {\n  return {\n    euros: { format: (cantidad) => cantidad + ' €' },\n    peso: { format: (gramos) => gramos + ' g' },\n    lista: { format: (palabras) => palabras.join(', ') },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\n.idioma {\n  display: inline-grid;\n  gap: 0.2rem;\n}\n\nselect {\n  font: inherit;\n}\n\n.productos {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));\n  gap: 0.75rem;\n  margin: 1rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.productos li {\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #fef3c7;\n}\n\n.productos h2 {\n  margin: 0;\n  font-size: 1.05rem;\n}\n\n.productos p {\n  margin: 0.25rem 0 0;\n}\n\n.precio {\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "formatos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "En castellano, el turrón blando cuesta «12,50 €»",
      "pasos": [],
      "espera": {
        "texto": "12,50 €"
      }
    },
    {
      "descripcion": "En inglés, el turrón blando cuesta «€12.50»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idioma",
            "opcion": "English"
          }
        }
      ],
      "espera": {
        "texto": "€12.50"
      }
    },
    {
      "descripcion": "En castellano, la cesta pesa «1500 gramos», sin punto en los miles",
      "pasos": [],
      "espera": {
        "texto": "1500 gramos"
      }
    },
    {
      "descripcion": "En catalán, la cesta pesa «1.500 grams»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idioma",
            "opcion": "Català"
          }
        }
      ],
      "espera": {
        "texto": "1.500 grams"
      }
    },
    {
      "descripcion": "En catalán, los ingredientes se unen con «i»: «ametlla, mel i ou»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idioma",
            "opcion": "Català"
          }
        }
      ],
      "espera": {
        "texto": "Ingredientes: ametlla, mel i ou"
      }
    },
    {
      "descripcion": "En inglés británico, sin coma antes de «and»: «almonds, honey and egg»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idioma",
            "opcion": "English"
          }
        }
      ],
      "espera": {
        "texto": "Ingredientes: almonds, honey and egg"
      }
    }
  ]
}
```

**2. El idioma en la URL.** La tienda, con el navegador de mentira de las lecciones 76 y 77 y el router a mano. `Navegador.jsx` trae una novedad: `navegar(destino, { reemplazar: true })`, que cambia la entrada actual del historial en vez de añadir otra, como `replace` en React Router. `idioma.jsx` ya tiene la lista de idiomas, `elegirIdioma`, `direccion` y un `useT` mínimo, y `MirarDocumento.jsx` es el botón para ver el `<html>` y los `hreflang`. Todo lo que tienes que tocar está en `App.jsx`, marcado con números.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Turrones El Panal, con el idioma en la URL",
  "consigna": "En App.jsx: 1) lee el idioma de la URL con useParametros y, si no es uno de IDIOMAS, pinta «Página no encontrada»; 2) pon lang y dir en el html con un efecto; 3) que cada idioma del selector lleve a la misma página en ese idioma, con hrefLang y lang; 4) en /, redirige al idioma elegido con elegirIdioma, reemplazando la entrada; 5) añade los link de hreflang y x-default. Prueba los marcadores y el desplegable de idiomas del navegador, y usa «Mirar el documento».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Navegador, { useNavegador } from './Navegador'\nimport { Enlace, Rutas, useParametros } from './router'\nimport { IDIOMAS, IdiomaProvider, NOMBRES, direccion, elegirIdioma, useT } from './idioma'\nimport MirarDocumento from './MirarDocumento'\nimport './estilos.css'\n\nconst WEB = 'https://turroneselpanal.example'\n\n// '/' no dice el idioma\nfunction SinIdioma({ preferidos }) {\n  // 4. Elige el idioma con elegirIdioma(preferidos) y redirige a /<idioma>/\n  //    reemplazando la entrada del historial, para que Atrás no vuelva aquí.\n  return (\n    <p>\n      Elige un idioma: <Enlace a=\"/es/\">Español</Enlace>\n    </p>\n  )\n}\n\nfunction ConIdioma({ pagina }) {\n  // 1. El idioma tiene que salir de la URL (useParametros), no estar fijo.\n  //    Si no es uno de IDIOMAS, pinta <h1>Página no encontrada</h1>.\n  const idioma = 'es'\n  const { url } = useNavegador()\n\n  // 2. Pon lang y dir en document.documentElement cuando cambie el idioma.\n\n  const resto = url.slice(idioma.length + 1) // '/ca/cesta' → '/cesta'\n  return (\n    <IdiomaProvider idioma={idioma}>\n      {/* 5. Un <link rel=\"alternate\" hrefLang> por idioma, con la URL completa\n             de esta misma página en ese idioma, y otro para x-default. */}\n      <SelectorIdioma resto={resto} />\n      <main>\n        <Pagina pagina={pagina} />\n      </main>\n    </IdiomaProvider>\n  )\n}\n\nfunction SelectorIdioma({ resto }) {\n  const { t } = useT()\n  return (\n    <nav className=\"selector\" aria-label={t('idiomas')}>\n      {IDIOMAS.map((otro) => (\n        // 3. Cada enlace tiene que llevar a esta misma página en el otro\n        //    idioma (de /ca/cesta a /en/cesta), no a la portada. Y dile al\n        //    lector de pantalla en qué idioma está escrito su nombre.\n        <Enlace key={otro} a={`/${otro}/`}>\n          {NOMBRES[otro]}\n        </Enlace>\n      ))}\n    </nav>\n  )\n}\n\nfunction Pagina({ pagina }) {\n  const { idioma, t } = useT()\n  if (pagina === 'cesta') return <h1>{t('cesta')}</h1>\n  return (\n    <>\n      <h1>{t('portada')}</h1>\n      <Enlace a={`/${idioma}/cesta`}>{t('verCesta')}</Enlace>\n    </>\n  )\n}\n\nexport default function App() {\n  const [preferidos, setPreferidos] = useState('navegador')\n  const lista = preferidos === 'navegador' ? navigator.languages : preferidos.split(', ')\n\n  return (\n    <>\n      <label className=\"preferidos\">\n        Idiomas de tu navegador\n        <select value={preferidos} onChange={(e) => setPreferidos(e.target.value)}>\n          <option value=\"navegador\">Los tuyos: {navigator.languages.join(', ')}</option>\n          <option>en-GB, en</option>\n          <option>fr-FR, ca-ES</option>\n          <option>ca-ES-valencia, es</option>\n          <option>eu-ES, fr-FR</option>\n        </select>\n      </label>\n      <Navegador inicio=\"/\" marcadores={['/', '/ca/cesta', '/fr/']}>\n        <Rutas\n          rutas={{\n            '/': <SinIdioma preferidos={lista} />,\n            '/:idioma': <ConIdioma pagina=\"portada\" />,\n            '/:idioma/cesta': <ConIdioma pagina=\"cesta\" />,\n            '*': <h1>Página no encontrada</h1>,\n          }}\n        />\n      </Navegador>\n      <MirarDocumento />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "idioma.jsx",
      "codigo": "import { createContext, useContext } from 'react'\n\nexport const IDIOMAS = ['es', 'ca', 'en']\nexport const NOMBRES = { es: 'Español', ca: 'Català', en: 'English' }\n\n// ['fr-FR', 'ca-ES', 'es'] → 'ca': el primero que tengamos, en el orden del usuario\nexport function elegirIdioma(preferidos) {\n  for (const etiqueta of preferidos) {\n    const base = etiqueta.toLowerCase().split('-')[0]\n    if (IDIOMAS.includes(base)) return base\n  }\n  return 'es'\n}\n\n// Árabe, hebreo, persa y urdu se escriben de derecha a izquierda\nconst DE_DERECHA_A_IZQUIERDA = ['ar', 'he', 'fa', 'ur']\nexport function direccion(idioma) {\n  return DE_DERECHA_A_IZQUIERDA.includes(idioma) ? 'rtl' : 'ltr'\n}\n\nconst TEXTOS = {\n  es: { portada: 'Turrón artesano', cesta: 'Tu cesta', verCesta: 'Ver la cesta', idiomas: 'Idiomas' },\n  ca: { portada: 'Torró artesà', cesta: 'La teva cistella', verCesta: 'Mostra la cistella', idiomas: 'Idiomes' },\n  en: { portada: 'Handmade turrón', cesta: 'Your basket', verCesta: 'View basket', idiomas: 'Languages' },\n}\n\nconst IdiomaContext = createContext('es')\nIdiomaContext.displayName = 'Idioma'\n\nexport function IdiomaProvider({ idioma, children }) {\n  return <IdiomaContext value={idioma}>{children}</IdiomaContext>\n}\n\n// Un t() mínimo: aquí no hacen falta plurales ni valores\nexport function useT() {\n  const idioma = useContext(IdiomaContext)\n  return { idioma, t: (clave) => TEXTOS[idioma]?.[clave] ?? TEXTOS.es[clave] ?? clave }\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/:idioma/cesta' encaja con '/ca/cesta' y da { idioma: 'ca' }; si no, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, url)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Cambia de página sin recargar; las demás props (lang, hrefLang...) van al <a>\nexport function Enlace({ a, children, ...props }) {\n  const { url, navegar } = useNavegador()\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={url === a ? 'page' : undefined} onClick={manejarClic} {...props}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// El navegador de mentira de las lecciones 76 y 77: la URL y el historial\n// viven aquí. Novedad: navegar(destino, { reemplazar: true }).\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino, { reemplazar = false } = {}) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      // Como replace en React Router: cambia la entrada actual, no añade otra\n      if (reemplazar) return { entradas: entradas.with(indice, destino), indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "MirarDocumento.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que React ha puesto en el <html> y en el <head>, en el momento del clic\nexport default function MirarDocumento() {\n  const [foto, setFoto] = useState(null)\n\n  function mirar() {\n    const { lang, dir } = document.documentElement\n    const enlaces = [...document.querySelectorAll('link[rel=\"alternate\"]')]\n    setFoto({\n      html: `<html lang=\"${lang}\" dir=\"${dir}\">`,\n      enlaces: enlaces.map((l) => `hreflang=\"${l.hreflang}\" → ${l.getAttribute('href')}`),\n    })\n  }\n\n  return (\n    <section className=\"mirar\" aria-label=\"El documento de la vista previa\">\n      <button onClick={mirar}>Mirar el documento</button>\n      {foto && (\n        <>\n          <p>\n            <code>{foto.html}</code>\n          </p>\n          <ul>\n            {foto.enlaces.map((enlace) => (\n              <li key={enlace}>\n                <code>{enlace}</code>\n              </li>\n            ))}\n          </ul>\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La tienda */\n.preferidos {\n  display: grid;\n  gap: 0.2rem;\n  padding: 0.5rem 0.4rem;\n  font-size: 0.85rem;\n}\n\n.preferidos select {\n  font: inherit;\n}\n\n.selector {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  padding-bottom: 0.4rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #b45309;\n}\n\n.selector a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh1 {\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\n/* Lo que ve «Mirar el documento» */\n.mirar {\n  margin: 0.5rem 0.4rem;\n  padding-top: 0.5rem;\n  border-top: 2px dashed #a8a29e;\n  font-size: 0.8rem;\n}\n\n.mirar button {\n  font: inherit;\n}\n\n.mirar ul {\n  padding-left: 1.2rem;\n}\n\n.mirar code {\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Abrir /ca/cesta enseña la cesta en catalán",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ca/cesta"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "La teva cistella"
      }
    },
    {
      "descripcion": "Un idioma que la tienda no tiene, /fr/, muestra «Página no encontrada»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/fr/"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Página no encontrada"
      }
    },
    {
      "descripcion": "Desde la cesta en catalán, «English» lleva a la cesta en inglés",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ca/cesta"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "English"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Your basket"
      }
    },
    {
      "descripcion": "Después de cambiar al inglés, el html dice lang=\"en\" y dir=\"ltr\"",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ca/cesta"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "English"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el documento"
          }
        }
      ],
      "espera": {
        "texto": "<html lang=\"en\" dir=\"ltr\">"
      }
    },
    {
      "descripcion": "La cesta en catalán enlaza su versión en inglés con hreflang y la URL completa",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ca/cesta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el documento"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "hreflang=\"en\" → https://turroneselpanal.example/en/cesta"
      }
    },
    {
      "descripcion": "En /, con el navegador en inglés, la tienda se abre en inglés",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idiomas de tu navegador",
            "opcion": "en-GB, en"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Handmade turrón"
      }
    },
    {
      "descripcion": "En /, con fr-FR y después ca-ES, se salta el francés y elige el catalán",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idiomas de tu navegador",
            "opcion": "fr-FR, ca-ES"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Torró artesà"
      }
    },
    {
      "descripcion": "En /, si la tienda no tiene ninguno de los idiomas del navegador, se abre en castellano",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Idiomas de tu navegador",
            "opcion": "eu-ES, fr-FR"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Turrón artesano"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio 1, añade a cada producto la fecha de entrega con `DateTimeFormat` (`weekday`, `day` y `month`, y `timeZone: 'Europe/Madrid'`) y cuánto hace del pedido con `RelativeTimeFormat` y `numeric: 'auto'`. Después añade `eu-ES` al selector, con los nombres en castellano mientras no tengas traducción, y compara en Chrome y en Safari lo que escribe `Intl`.
2. En el `t()` hecho a mano, añade el valenciano: `ca-ES-valencia` en el selector, con un diccionario que solo tenga las frases que cambian («Afig a la cistella») y que, para todo lo demás, caiga al catalán antes que al castellano.
3. En el ejercicio 2, añade el árabe con dos frases y comprueba con «Mirar el documento» que `dir` pasa a `rtl`. Después cambia en `estilos.css` los márgenes y rellenos de un lado por propiedades lógicas (`padding-inline-start`…) y compara.
4. En un proyecto de Vite, monta la tienda con react-i18next y React Router como en la lección: `comun` y `cesta` en JSON, `resourcesToBackend` y la ruta `:idioma`. En la pestaña Red, mira qué diccionarios se descargan al entrar y al ir a la cesta. Después activa la limitación de red «3G lenta», cambia al inglés y observa qué se ve mientras llega.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<link>",
      "descripcion": "La referencia de react.dev: qué link sube React al head y cuáles no, y la prop hrefLang, el idioma del recurso enlazado.",
      "url": "https://react.dev/reference/react-dom/components/link",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Intl",
      "descripcion": "La familia completa en MDN: NumberFormat, DateTimeFormat, RelativeTimeFormat, PluralRules, ListFormat y los demás, con sus opciones.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl",
      "etiqueta": "MDN"
    },
    {
      "titulo": "useTranslation (hook)",
      "descripcion": "Espacios de nombres, keyPrefix, el idioma fijo con lng y qué hacer si no quieres Suspense.",
      "url": "https://react.i18next.com/latest/usetranslation-hook",
      "etiqueta": "react-i18next"
    },
    {
      "titulo": "Trans Component",
      "descripcion": "Frases con marcado: la forma con components y nombres, la forma con índices y todas las props.",
      "url": "https://react.i18next.com/latest/trans-component",
      "etiqueta": "react-i18next"
    },
    {
      "titulo": "Plurals",
      "descripcion": "Los sufijos de i18next, las lenguas con muchas formas, los ordinales y la regla de que la variable se llama count.",
      "url": "https://www.i18next.com/translation-function/plurals",
      "etiqueta": "i18next"
    },
    {
      "titulo": "Tell Google about localized versions of your page",
      "descripcion": "hreflang en HTML, en cabeceras y en el sitemap, con las reglas de reciprocidad y x-default.",
      "url": "https://developers.google.com/search/docs/specialty/international/localized-versions",
      "etiqueta": "Google Search Central"
    },
    {
      "titulo": "Declaring language in HTML",
      "descripcion": "Por qué declarar el idioma en el html, cómo marcar con lang los trozos que están en otro idioma y qué etiquetas de idioma usar.",
      "url": "https://www.w3.org/International/questions/qa-html-language-declarations",
      "etiqueta": "W3C"
    },
    {
      "titulo": "Intl.DateTimeFormat polyfill",
      "descripcion": "El polyfill de FormatJS: shouldPolyfill, los datos de cada idioma y las zonas horarias. Es el que necesita Chrome para el euskera y el gallego.",
      "url": "https://formatjs.github.io/docs/polyfills/intl-datetimeformat",
      "etiqueta": "FormatJS"
    }
  ]
}
```
