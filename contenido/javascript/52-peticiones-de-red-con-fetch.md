# Peticiones de red con fetch()

- **Módulo:** Asincronía
- **Slug:** `peticiones-de-red-con-fetch` (autogenerado del título)
- **Orden:** 155
- **Fuentes:** [Making network requests with JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Network_requests) — ver `contenido/javascript/TEMARIO.md` #52

---

## Qué es y para qué sirve

Ya se vio `fetch()` con JSON en lecciones anteriores. Esta profundiza en algo que no se cubrió entonces: el cuerpo de una respuesta se puede interpretar de varias formas distintas — texto plano, JSON, o contenido binario — cada una con su propio método, y cada una asíncrona por derecho propio.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita interpretar la respuesta según su contenido",
  "roles": [
    { "etiqueta": "Quien pide texto plano", "rol": "response.text()", "descripcion": "La opción más simple — para cualquier contenido que no sea JSON ni binario." },
    { "etiqueta": "Quien pide datos estructurados", "rol": "response.json()", "descripcion": "Interpreta el cuerpo como JSON — el patrón ya visto en la lección de promesas." },
    { "etiqueta": "Quien pide contenido binario", "rol": "response.blob()", "descripcion": "Para imágenes, audio, vídeo — cualquier cosa que no sea texto." }
  ]
}
```

## response.text(): texto plano

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch('poema.txt')\n    .then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);\n      return respuesta.text();\n    })\n    .then((texto) => {\n      document.querySelector('#poema').textContent = texto;\n    })\n    .catch((error) => console.error(`Problema al obtener el poema: ${error}`));\n</script>",
  "anotaciones": [
    { "fragmento": "return respuesta.text();", "nota": "text() interpreta el cuerpo de la respuesta como texto plano — la opción más simple, para cualquier contenido que no sea JSON ni un archivo binario." }
  ]
}
```

## response.json(): datos estructurados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch('productos.json')\n    .then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);\n      return respuesta.json();\n    })\n    .then((datos) => inicializar(datos))\n    .catch((error) => console.error(`Problema al obtener los datos: ${error}`));\n</script>",
  "anotaciones": [
    { "fragmento": "return respuesta.json();", "nota": "El mismo patrón visto en la lección de promesas, aplicado con json() en vez de text() — cada método de parseo encaja con un tipo de contenido distinto, pero la estructura de la cadena es idéntica." }
  ]
}
```

## response.blob(): contenido binario

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch('foto.jpg')\n    .then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);\n      return respuesta.blob();\n    })\n    .then((blob) => mostrarImagen(blob))\n    .catch((error) => console.error(`Problema al obtener la imagen: ${error}`));\n</script>",
  "anotaciones": [
    { "fragmento": "return respuesta.blob();", "nota": "blob() es la opción para contenido BINARIO — imágenes, archivos de audio o vídeo, cualquier cosa que no sea texto ni JSON." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "text(), json() y blob() son asíncronas por su cuenta",
  "contenido": "Cada una devuelve su PROPIA promesa, por eso necesitan su propio then() (o su propio await) para leer el resultado — incluso después de que la petición fetch() original ya haya terminado. Son dos pasos asíncronos encadenados, no uno solo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  fetch('productos.json').then((respuesta) => {\n    const resultado = respuesta.json();\n    console.log(resultado);\n  });\n</script>",
  "opciones": [
    "Promise { <pending> } — response.json() es asíncrona en sí misma; devuelve una promesa, no los datos directamente",
    "El array de productos ya interpretado, directamente",
    "undefined — response.json() necesita que se le pase un callback como argumento"
  ],
  "correcta": 0,
  "explicacion": "response.json() (igual que text() y blob()) es asíncrona — devuelve una PROMESA, no los datos ya interpretados. Para obtener los datos reales hace falta otro then() (o un await) encadenado sobre ese resultado, no leerlo directamente como en este código."
}
```

## Lo que text(), json() y blob() NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "response.json() devuelve los datos ya interpretados, directamente",
      "realidad": "Es asíncrona — devuelve una promesa, que necesita su propio then() o await."
    },
    {
      "mito": "text() sirve para cualquier tipo de contenido, incluido JSON y binario",
      "realidad": "Cada método encaja con un tipo: text() para texto plano, json() para JSON, blob() para binario."
    },
    {
      "mito": "Comprobar response.ok es opcional si se usa json() en vez de text()",
      "realidad": "La regla es la misma sin importar el método de parseo — fetch() no rechaza por error HTTP en ningún caso."
    },
    {
      "mito": "blob() convierte automáticamente el contenido binario en algo mostrable en pantalla",
      "realidad": "Devuelve un objeto Blob — mostrarlo (por ejemplo, como imagen) requiere un paso adicional."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que response.json() (o text()/blob()) devuelva el resultado directamente.", "texto": "Sin un then() o await adicional, solo se obtiene la promesa, no el valor real." },
    { "titulo": "Usar text() para contenido JSON, en vez del método específico json().", "texto": "Funciona, pero obliga a parsear el JSON a mano después." },
    { "titulo": "Olvidar comprobar response.ok antes de parsear el cuerpo.", "texto": "Aplica sin importar qué método de parseo se use — text(), json() o blob()." },
    { "titulo": "No usar blob() para contenido binario como imágenes.", "texto": "Intentar leerlo como texto o JSON produce datos corruptos o un error." }
  ]
}
```

## Ejercicios

1. Usa `fetch()` con `text()` para obtener el contenido de un archivo de texto plano.
2. Usa `fetch()` con `json()` para obtener y procesar datos de una API.
3. Usa `fetch()` con `blob()` para obtener una imagen, y muéstrala en la página.
4. Explica por qué `response.json()` necesita su propio `then()` (o `await`) en vez de devolver los datos directamente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Making network requests with JavaScript",
      "descripcion": "Guía de MDN sobre fetch(), la comprobación de response.ok, y los métodos de parseo del cuerpo: text(), json() y blob().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Network_requests",
      "etiqueta": "MDN"
    }
  ]
}
```
