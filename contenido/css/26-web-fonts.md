# Web fonts: @font-face y fuentes de terceros

- **Módulo:** Texto y tipografía
- **Slug:** `web-fonts-font-face-y-fuentes-de-terceros` (autogenerado del título)
- **Orden:** 125
- **Fuentes:** [Web fonts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts) — ver `contenido/css/TEMARIO.md` #26

---

## Qué es y para qué sirve

Los "web-safe fonts" de la lección de fundamentos son solo las que casi todos los sistemas ya tienen instaladas. Para usar una tipografía de marca que nadie tiene instalada, hace falta `@font-face`: le dice al navegador dónde descargar el archivo de la fuente y bajo qué nombre usarla después en cualquier `font-family`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita declarar una fuente propia",
  "roles": [
    { "etiqueta": "Quien añade la tipografía de marca", "rol": "Usar una fuente que nadie tiene instalada de fábrica", "descripcion": "@font-face descarga el archivo de la fuente y la registra con un nombre que luego se usa en font-family, como cualquier otra fuente." },
    { "etiqueta": "Quien cuida cuándo el texto es legible", "rol": "Que el texto se vea desde el primer momento", "descripcion": "font-display: swap muestra una fuente de respaldo de inmediato y la cambia por la definitiva en cuanto termine de cargar — nunca deja el texto invisible mientras se descarga." },
    { "etiqueta": "Quien revisa la licencia de una fuente", "rol": "Usar solo fuentes con permiso real de uso", "descripcion": "La mayoría de las fuentes tienen condiciones de licencia — autohospedarlas no elimina esa obligación." }
  ]
}
```

## La sintaxis básica de @font-face

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @font-face {\n    font-family: \"zantrokeregular\";\n    src:\n      url(\"fonts/zantroke.woff2\") format(\"woff2\"),\n      url(\"fonts/zantroke.woff\") format(\"woff\");\n    font-weight: normal;\n    font-style: normal;\n    font-display: swap;\n  }\n\n  h1 {\n    font-family: \"zantrokeregular\", sans-serif;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "font-family: \"zantrokeregular\";", "nota": "El nombre que se le da a esta fuente puede ser cualquier cadena de texto — no tiene que coincidir con el nombre real del archivo ni de la tipografía." },
    { "fragmento": "src:\n      url(\"fonts/zantroke.woff2\") format(\"woff2\"),\n      url(\"fonts/zantroke.woff\") format(\"woff\");", "nota": "Una lista de archivos con su formato — el navegador descarga el PRIMERO que sea capaz de usar, no necesariamente \"el mejor\" de la lista." },
    { "fragmento": "h1 {\n    font-family: \"zantrokeregular\", sans-serif;\n  }", "nota": "Una vez declarada, la fuente se usa exactamente como cualquier otra en font-family — incluido un genérico de respaldo al final, por si la descarga falla." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El orden en src importa: woff2 primero",
  "contenido": "El navegador elige el PRIMER formato de la lista que sea capaz de reproducir — no el más eficiente de todos los que aparecen. Por eso woff2 (más comprimido, compatible con todos los navegadores modernos) debería ir siempre primero, con woff como respaldo para casos más antiguos."
}
```

## Un nombre de familia, varios archivos según el peso

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @font-face {\n    font-family: \"miFuente\";\n    src: url(\"mifuente-regular.woff2\") format(\"woff2\");\n    font-weight: normal;\n  }\n\n  @font-face {\n    font-family: \"miFuente\";\n    src: url(\"mifuente-bold.woff2\") format(\"woff2\");\n    font-weight: bold;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "font-family: \"miFuente\";\n    src: url(\"mifuente-regular.woff2\") format(\"woff2\");\n    font-weight: normal;", "nota": "Dos reglas @font-face pueden compartir el MISMO nombre de familia, cada una con su propio archivo y su propio font-weight." },
    { "fragmento": "font-family: \"miFuente\";\n    src: url(\"mifuente-bold.woff2\") format(\"woff2\");\n    font-weight: bold;", "nota": "Con esto declarado, escribir font-weight: bold sobre cualquier texto en \"miFuente\" carga automáticamente ESTE archivo — el del diseño en negrita real, no una negrita simulada por el navegador." }
  ]
}
```

## Cuando la fuente falla, las mismas reglas de respaldo siguen valiendo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  @font-face {\n    font-family: \"MiFuenteCustom\";\n    src: url(\"esta-url-no-existe.woff2\") format(\"woff2\");\n  }\n  p { font-family: \"MiFuenteCustom\"; }\n</style>\n<p>Texto sin fuente de respaldo</p>",
  "despues": "<style>\n  @font-face {\n    font-family: \"MiFuenteCustom\";\n    src: url(\"esta-url-no-existe.woff2\") format(\"woff2\");\n  }\n  p { font-family: \"MiFuenteCustom\", sans-serif; }\n</style>\n<p>Texto con sans-serif de respaldo</p>",
  "nota": "En los dos casos, el archivo de \"MiFuenteCustom\" no existe y la descarga falla — para el navegador, una @font-face que falla se comporta igual que una fuente que nunca existió. Antes, sin ningún genérico después en la lista, el texto cae en el serif por defecto del navegador. Después, con sans-serif como respaldo, el texto se ve en una tipografía de palo seco — la misma regla de fallback de la lección de fundamentos de texto, aplicada aquí a una fuente propia que falló al cargar."
}
```

## font-display: qué se ve mientras la fuente descarga

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @font-face {\n    font-family: \"miFuente\";\n    src: url(\"mifuente.woff2\") format(\"woff2\");\n    font-display: swap;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "font-display: swap;", "nota": "Muestra el texto YA MISMO con una fuente de respaldo, y lo cambia por \"miFuente\" en cuanto termine de descargarse. block, en cambio, deja el texto INVISIBLE durante un periodo largo antes de mostrar nada — swap prioriza que el texto se pueda leer cuanto antes; block prioriza que solo se vea la tipografía definitiva." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "swap suele ser la opción recomendada",
  "contenido": "Con font-display: block, el texto queda invisible durante la descarga (el problema conocido como FOIT — \"flash of invisible text\"). Con swap, el texto es legible desde el primer instante con una fuente de respaldo, y solo cambia de aspecto cuando la fuente definitiva termina de cargar (FOUT — \"flash of unstyled text\"). Entre los dos, priorizar que el texto se pueda leer de inmediato suele pesar más que la apariencia final perfecta desde el primer segundo."
}
```

## Fuentes de terceros y licencias

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<link href=\"https://fonts.googleapis.com/css2?family=Roboto:wght@400;700\" rel=\"stylesheet\">\n<style>\n  body {\n    font-family: 'Roboto', sans-serif;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "<link href=\"https://fonts.googleapis.com/css2?family=Roboto:wght@400;700\" rel=\"stylesheet\">", "nota": "Un servicio como Google Fonts genera las reglas @font-face por ti — solo hace falta enlazar su hoja de estilos y usar el nombre de la fuente, sin escribir @font-face a mano ni alojar los archivos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Las fuentes no son de uso libre por defecto",
  "contenido": "La mayoría de las fuentes tienen condiciones de licencia: hay que pagar por ellas, dar crédito a quien las creó, o cumplir otras condiciones — descargarla y autohospedarla en el propio servidor no cambia esa obligación. Conviene comprobar la licencia antes de usar cualquier fuente en un sitio, ya sea de un buscador gratuito o de pago."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @font-face {\n    font-family: \"prueba\";\n    src:\n      url(\"fuente.ttf\") format(\"truetype\"),\n      url(\"fuente.woff2\") format(\"woff2\");\n  }\n</style>",
  "opciones": [
    "El navegador siempre elige woff2, por ser el formato más eficiente, sin importar el orden en que aparezca",
    "El navegador prueba los formatos EN EL ORDEN escrito — aquí, probaría truetype primero, aunque woff2 sea la opción más moderna",
    "Es un error: los formatos deben ir siempre en orden alfabético"
  ],
  "correcta": 1,
  "explicacion": "El navegador usa el PRIMER formato de la lista que sea capaz de reproducir, sin evaluar cuál es objetivamente mejor. Con truetype listado antes que woff2, un navegador que soporte los dos usaría truetype — por eso el orden recomendado es poner siempre woff2 primero."
}
```

## Lo que @font-face NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si @font-face falla en cargar, el texto simplemente desaparece",
      "realidad": "El navegador aplica las mismas reglas de fallback de cualquier font-family — con un genérico de respaldo en la lista, el texto se ve con esa fuente en su lugar."
    },
    {
      "mito": "El orden de los archivos en src no importa, el navegador elige el mejor formato automáticamente",
      "realidad": "El navegador usa el PRIMER formato de la lista que sea capaz de reproducir — por eso hay que poner woff2 primero a propósito, el navegador no decide cuál es \"mejor\"."
    },
    {
      "mito": "Cualquier fuente descargada de internet se puede subir al propio servidor sin problema",
      "realidad": "La mayoría de las fuentes tienen licencia — usarlas sin permiso o sin dar crédito puede incumplir sus términos; autohospedarlas no elimina esa obligación."
    },
    {
      "mito": "font-display: swap y font-display: block hacen básicamente lo mismo",
      "realidad": "swap muestra el texto de respaldo de inmediato y lo cambia cuando la fuente carga; block deja el texto invisible durante un periodo largo antes de mostrar nada."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar font-display, dejando el comportamiento por defecto del navegador.", "texto": "El valor por defecto suele tender al texto invisible durante la carga — swap casi siempre es la opción más segura." },
    { "titulo": "Listar los formatos de fuente en el orden equivocado.", "texto": "Sirve un formato menos eficiente antes que woff2, aunque el navegador soporte el más moderno." },
    { "titulo": "No declarar font-weight/font-style en cada @font-face.", "texto": "El navegador no sabe qué archivo usar para un texto en negrita o cursiva, y puede simular esos estilos en vez de usar el diseño real de la fuente." },
    { "titulo": "Usar una fuente sin comprobar su licencia antes de subirla a un sitio propio.", "texto": "Autohospedar una fuente no elimina la obligación de cumplir sus condiciones de uso." }
  ]
}
```

## Ejercicios

1. Escribe una regla `@font-face` que declare `woff2` como formato preferido y `woff` como respaldo.
2. Escribe dos reglas `@font-face` para el mismo nombre de familia: una para el peso normal y otra para `bold`, cada una con su propio archivo.
3. Explica la diferencia entre `font-display: swap` y `font-display: block`, y cuál convendría en un sitio de noticias donde la lectura rápida importa más que la apariencia final.
4. Explica por qué `font-family: "MiFuente", sans-serif;` sigue siendo útil aunque "MiFuente" cargue perfectamente casi siempre.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un @font-face con woff2 como formato preferido y woff como respaldo (ejercicio 1). Escribe dos @font-face para el mismo nombre de familia, uno normal y otro bold, cada uno con su propio archivo (ejercicio 2).",
  "html": "<p class=\"texto\">Texto con la fuente declarada por @font-face.</p>\n<p class=\"texto\" style=\"font-weight: bold;\">Texto en negrita con la misma familia.</p>",
  "css": "/* @font-face {\n  font-family: 'MiFuente';\n  src: url('fuente.woff2') format('woff2'), url('fuente.woff') format('woff');\n} */\n.texto { font-family: 'MiFuente', sans-serif; }",
  "pestañaInicial": "css"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Web fonts",
      "descripcion": "Guía de MDN sobre @font-face, formatos de fuente, font-display, servicios de fuentes de terceros y licencias.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts",
      "etiqueta": "MDN"
    }
  ]
}
```
