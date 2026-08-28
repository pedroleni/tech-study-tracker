# Consumir APIs de terceros

- **Módulo:** APIs del navegador
- **Slug:** `consumir-apis-de-terceros` (autogenerado del título)
- **Orden:** 194
- **Fuentes:** [Third-party APIs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Third_party_APIs) — ver `contenido/javascript/TEMARIO.md` #65

---

## Qué es y para qué sirve

Una API del navegador (como `fetch` o `Date`) ya está disponible sin hacer nada. Una API de terceros vive en servidores externos — hay dos formas habituales de usarla: cargando su propia librería, o haciendo peticiones RESTful directas con `fetch()`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita conectar con un servicio externo",
  "roles": [
    { "etiqueta": "Quien carga una librería propia", "rol": "<script src=\"...\">", "descripcion": "Sus objetos solo existen DESPUÉS de que ese script termine de cargar." },
    { "etiqueta": "Quien se identifica ante el proveedor", "rol": "Una clave de API", "descripcion": "Casi ninguna API de terceros funciona sin ella — identifica quién hace cada petición." },
    { "etiqueta": "Quien usa una API RESTful pura", "rol": "URL + fetch()", "descripcion": "Sin ninguna librería — solo una URL con parámetros codificados, y una petición normal." }
  ]
}
```

## API del navegador frente a API de terceros

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // API del navegador: disponible de inmediato, sin cargar nada\n  const audioCtx = new AudioContext();\n\n  // API de terceros: hay que CARGAR su librería antes de poder usarla\n  // <script src=\"https://ejemplo-mapas.com/sdk/mapas.js\" defer></script>\n</script>",
  "anotaciones": [
    { "fragmento": "// API de terceros: hay que CARGAR su librería antes de poder usarla", "nota": "Una API del navegador (como AudioContext) ya está disponible sin hacer nada más. Una API de terceros vive en SERVIDORES externos — hace falta cargar su librería (normalmente vía <script>) antes de que sus objetos existan." }
  ]
}
```

## Usar una librería cargada, y su clave de API

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Tras cargar la librería del ejemplo anterior:\n  Mapas.clave = 'TU-CLAVE-DE-API-AQUI';\n\n  const mapa = Mapas.crear('contenedor-mapa', {\n    centro: [40.4168, -3.7038],\n    zoom: 12,\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "const mapa = Mapas.crear('contenedor-mapa', {", "nota": "Mapas (el objeto global que la librería expone) solo existe DESPUÉS de que el <script> haya cargado — usarlo antes lanzaría un ReferenceError, igual que cualquier variable no definida." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Para qué sirve la clave de API",
  "contenido": "Una clave de API identifica quién hace cada petición — permite al proveedor rastrear el uso, detectar abusos, y revocar el acceso si hace falta. Casi ninguna API de terceros funciona sin una, ni siquiera para pruebas."
}
```

## El otro patrón: RESTful pura, sin librería

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const urlBase = 'https://api.ejemplo.com/buscar';\n  let url = `${urlBase}?clave=${clave}&pagina=${numeroPagina}&q=${terminoBusqueda}`;\n\n  if (fechaInicio) {\n    url += `&fecha_inicio=${fechaInicio}`;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "let url = `${urlBase}?clave=${clave}&pagina=${numeroPagina}&q=${terminoBusqueda}`;", "nota": "Una API RESTful no necesita ninguna librería — se construye una URL con los parámetros codificados directamente en ella, y se hace una petición HTTP normal (con fetch()) a esa dirección." }
  ]
}
```

## Procesar la respuesta: nada nuevo que aprender

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch(url)\n    .then((respuesta) => respuesta.json())\n    .then((datos) => mostrarResultados(datos))\n    .catch((error) => console.error(`Error al obtener datos: ${error.message}`));\n\n  function mostrarResultados(datos) {\n    for (const item of datos.resultados) {\n      const articulo = document.createElement('article');\n      articulo.textContent = item.titulo;\n      contenedor.appendChild(articulo);\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "const articulo = document.createElement('article');\n      articulo.textContent = item.titulo;\n      contenedor.appendChild(articulo);", "nota": "Una vez llegan los datos, construir el DOM con createElement()/appendChild() (visto en el módulo del DOM) es exactamente igual que con cualquier otro dato — una API de terceros no cambia nada de eso." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos patrones, según la documentación de cada API",
  "contenido": "Unas APIs se usan a través de una LIBRERÍA/SDK propia (con sus propios métodos, como el ejemplo del mapa); otras son RESTful puras — solo URLs y fetch(), sin ninguna librería de por medio. Conviene leer la documentación de cada una para saber cuál de los dos patrones ofrece."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const urlBase = 'https://api.ejemplo.com/buscar';\n  const terminoBusqueda = 'gatos';\n  let url = `${urlBase}?q=${terminoBusqueda}`;\n\n  const fechaInicio = '';\n  if (fechaInicio) {\n    url += `&fecha_inicio=${fechaInicio}`;\n  }\n\n  console.log(url);\n</script>",
  "opciones": [
    "'https://api.ejemplo.com/buscar?q=gatos' — fechaInicio es una cadena vacía (falsy), así que el if no añade ese parámetro a la URL",
    "'https://api.ejemplo.com/buscar?q=gatos&fecha_inicio=' — el parámetro se añade igual, aunque esté vacío",
    "Un error, porque fechaInicio está vacía y no se puede usar dentro de un if"
  ],
  "correcta": 0,
  "explicacion": "Una cadena vacía ('') es un valor FALSY — el if (fechaInicio) no se cumple, así que esa línea nunca se ejecuta. La URL final solo contiene el parámetro q, sin ningún &fecha_inicio= añadido."
}
```

## Lo que consumir una API de terceros NO implica

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Cualquier API de terceros necesita cargar su propia librería con <script>",
      "realidad": "Muchas son RESTful puras — solo necesitan una URL y fetch(), sin ninguna librería."
    },
    {
      "mito": "Las claves de API son opcionales, solo una formalidad",
      "realidad": "Casi ninguna API de terceros funciona sin una — identifican quién hace cada petición."
    },
    {
      "mito": "Los objetos de una librería de terceros están disponibles antes de que su <script> termine de cargar",
      "realidad": "Usarlos antes lanza un ReferenceError, igual que con cualquier variable no definida todavía."
    },
    {
      "mito": "Procesar la respuesta de una API de terceros requiere técnicas distintas a las del resto del DOM",
      "realidad": "createElement()/appendChild() funcionan exactamente igual, sin importar de dónde vinieran los datos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar los objetos de una librería de terceros antes de que su <script> haya cargado.", "texto": "Lanza un ReferenceError, como con cualquier variable no definida." },
    { "titulo": "Olvidar incluir la clave de API en las peticiones que la requieren.", "texto": "La mayoría de APIs de terceros la exigen, incluso para pruebas." },
    { "titulo": "Añadir un parámetro vacío a una URL sin comprobar antes si tiene contenido.", "texto": "Una cadena vacía es falsy — un if la descarta automáticamente." },
    { "titulo": "No distinguir entre una API basada en librería/SDK y una API RESTful pura.", "texto": "Cada una se documenta y se usa de forma distinta." }
  ]
}
```

## Ejercicios

1. Explica la diferencia entre una API del navegador y una API de terceros.
2. Construye una URL con parámetros de búsqueda codificados, añadiendo uno opcional solo si tiene valor.
3. Usa `fetch()` para consumir una API RESTful pública, y procesa su respuesta JSON.
4. Construye elementos del DOM a partir de los datos de una API de terceros, usando `createElement()`/`appendChild()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Third-party APIs",
      "descripcion": "Guía de MDN sobre APIs de terceros frente a APIs del navegador, claves de API, el patrón de librería/SDK (con un ejemplo de mapa), y el patrón RESTful puro con fetch().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Third_party_APIs",
      "etiqueta": "MDN"
    }
  ]
}
```
