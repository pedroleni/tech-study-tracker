# Lo mínimo que el navegador necesita para funcionar

- **Módulo:** Fundamentos del documento
- **Slug:** `lo-minimo-que-el-navegador-necesita-para-funcionar` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Document structure (web.dev)](https://web.dev/learn/html/document-structure) — ver `contenido/html/TEMARIO.md` #2

---

## Qué es y para qué sirve

Todo documento HTML necesita un esqueleto mínimo para que el navegador sepa qué está leyendo: un aviso de qué versión de HTML es, un contenedor raíz, una zona de metadatos que nadie ve y una zona de contenido que sí se ve. Cuatro piezas, siempre las mismas, siempre en el mismo orden: `<!doctype html>`, `<html>`, `<head>`, `<body>`.

Hay una razón concreta para exigirlo: sin ese esqueleto (o con él mal puesto), el navegador tiene que **adivinar** cómo interpretar el resto de la página — y lo hace de forma distinta según el navegador, según la época y según lo que crea que quisiste decir. Eso es exactamente lo que quieres evitar cuando escribes HTML que otra persona (o tú dentro de seis meses) va a tener que entender igual en cualquier sitio.

## Cuándo lo usarías de verdad 👤

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Cada archivo .html nuevo.", "texto": "Es lo primero que escribes, antes de cualquier etiqueta de contenido. Si tu editor no lo genera solo, es la plantilla que copias siempre." },
    { "titulo": "Cuando algo se ve distinto en cada navegador.", "texto": "Un doctype ausente o mal escrito activa el 'modo quirks': cada navegador rellena los huecos a su manera. Es lo primero que revisar antes de sospechar de tu CSS." },
    { "titulo": "Cuando compartes o publicas código.", "texto": "El head con charset y viewport no es opcional si esperas que se vea igual en el móvil de otra persona que en tu portátil." }
  ]
}
```

## Cómo se usa

La estructura mínima real, sin nada de más:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Título de la página</title>
  </head>
  <body>
    <!-- Aquí va todo lo que se ve -->
  </body>
</html>
```

Cada línea tiene un trabajo concreto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Título de la página</title>\n  </head>\n  <body>\n    <!-- Aquí va todo lo que se ve -->\n  </body>\n</html>",
  "anotaciones": [
    { "fragmento": "<!doctype html>", "nota": "Le dice al navegador 'interpreta esto como HTML moderno, sin adivinar'. Tiene que ser la primerísima línea del archivo — antes ni un espacio." },
    { "fragmento": "<html lang=\"es\">", "nota": "El elemento raíz. El atributo lang cumple una función real: lectores de pantalla y traductores automáticos lo usan para saber en qué idioma leer el contenido." },
    { "fragmento": "<meta charset=\"utf-8\">", "nota": "Sin esto, tildes y eñes pueden verse como símbolos raros según el navegador y el sistema operativo. Va siempre como la primera línea dentro de head." },
    { "fragmento": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", "nota": "Sin esta línea, un móvil renderiza la página como si fuera de escritorio y luego la encoge — todo se ve minúsculo hasta que haces zoom." },
    { "fragmento": "<title>Título de la página</title>", "nota": "Lo que se ve en la pestaña del navegador, en resultados de búsqueda y al compartir el enlace. El único texto de head que un humano llega a ver directamente." },
    { "fragmento": "<body>", "nota": "Todo el contenido visible va aquí dentro, y solo aquí. Nada de contenido visible antes de body ni después de cerrarlo." }
  ]
}
```

¿Y si te lo saltas? Pruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<html>\n<body>\n<p>Hola</p>\n</body>\n</html>",
  "opciones": [
    "El navegador rechaza la página y muestra un error",
    "Se ve exactamente igual, pero el navegador activa el 'modo quirks' por debajo",
    "No pasa nada, el doctype es solo para validadores automáticos"
  ],
  "correcta": 1,
  "explicacion": "Un navegador nunca 'rompe' una página por falta de doctype — pero activa un modo de compatibilidad con webs de los años 90 (quirks mode) donde el cálculo de tamaños y márgenes cambia de forma sutil y distinta según el navegador. Por eso a veces algo 'se ve raro solo en Safari' y la causa real es un doctype ausente, no el CSS."
}
```

## Errores típicos 👤

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Doctype que no es la primera línea.", "texto": "Un comentario, un espacio en blanco raro del editor o algo del servidor antes del doctype ya basta para activar modo quirks. Tiene que ser literalmente lo primero del archivo." },
    { "titulo": "Olvidar el charset.", "texto": "Si tu editor guarda en UTF-8 pero no lo declaras, cualquier tilde o eñe puede acabar mostrándose como símbolos ilegibles en otro ordenador — aunque en el tuyo se vea perfecto." },
    { "titulo": "Copiar el viewport sin entenderlo.", "texto": "Es habitual copiar y pegar la línea de meta viewport sin saber qué hace. Sin ella, cualquier diseño responsive que hagas después con CSS simplemente no se activa en móvil." },
    { "titulo": "Contenido fuera de body.", "texto": "Texto suelto antes de html o después de cerrarlo — algunos navegadores lo mueven dentro de body automáticamente, otros no. No confíes en ese comportamiento." }
  ]
}
```

## Ejercicios

1. Crea un archivo `.html` desde cero, sin usar una plantilla del editor, escribiendo las cinco piezas de memoria: doctype, html con lang, head con charset y viewport, title, y body.
2. Quita el `<!doctype html>` de una página que ya tengas y ábrela en el navegador. ¿Ves algún cambio visual? Ahora inspecciona el `<body>` con las herramientas de desarrollador y compara lo que calcula con y sin doctype.
3. Busca en un proyecto real (tuyo o de código abierto) el `<head>` de su página principal. ¿Qué metaetiquetas tiene además de charset, viewport y title? Anota una que no conocías y para qué sirve.

## Para profundizar

- [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)
- [Document structure (web.dev)](https://web.dev/learn/html/document-structure)
