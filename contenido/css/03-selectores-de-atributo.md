# Selectores de atributo

- **Módulo:** Fundamentos de CSS
- **Slug:** `selectores-de-atributo` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [Attribute selectors (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Attribute_selectors) — ver `contenido/css/TEMARIO.md` #3

---

## Qué es y para qué sirve

Un selector de atributo alcanza elementos por lo que ya tienen escrito en el HTML — un `type`, un `href`, un `lang` — sin necesitar una clase añadida a mano solo para poder estilizarlos. Entre corchetes, hay siete variantes distintas: desde "tiene este atributo" hasta "el valor empieza, termina o contiene este texto", cada una con un caso de uso propio.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de seleccionar por atributo, no solo por clase",
  "roles": [
    { "etiqueta": "Quien no controla el HTML", "rol": "Estilizar sin poder añadir clases", "descripcion": "Un CMS, contenido generado por otra herramienta — a[href$=\".pdf\"] estiliza sin necesitar tocar el marcado que genera otra pieza del sistema." },
    { "etiqueta": "Quien mantiene formularios", "rol": "Seleccionar por type sin depender de clases", "descripcion": "input[type=\"email\"] alcanza un tipo concreto de campo sin necesitar una clase adicional puesta a mano en cada uno." },
    { "etiqueta": "Quien internacionaliza un sitio", "rol": "Agrupar variantes de un mismo idioma", "descripcion": "[lang|=\"zh\"] agrupa zh, zh-Hans y zh-Hant a la vez — sin escribir tres selectores sueltos." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el HTML ya trae la información que necesitas",
  "contenido": "Un atributo como type, href o lang ya distingue elementos por sí solo — añadir una clase para lo mismo es trabajo duplicado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres estilizar según el destino de un enlace",
  "contenido": "Enlaces externos, descargas de PDF, enlaces a mailto: — el propio valor del href ya dice de qué tipo es cada uno."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando no controlas el HTML que estás estilizando",
  "contenido": "Contenido de un CMS, de una librería de terceros — los selectores de atributo alcanzan patrones sin necesitar tocar el marcado que los genera."
}
```

## Presencia y valor exacto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a[title] {\n    text-decoration: underline dotted;\n  }\n\n  li[class=\"a\"] {\n    color: red;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "a[title] {\n    text-decoration: underline dotted;\n  }", "nota": "Selecciona cualquier a que TENGA el atributo title, sin importar su valor — basta con que exista." },
    { "fragmento": "li[class=\"a\"] {\n    color: red;\n  }", "nota": "Coincidencia EXACTA: solo selecciona class=\"a\" tal cual. Un li con class=\"a b\" no coincide — el valor tiene que ser idéntico, entero, no solo contenerlo." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  li[class=\"aviso\"] { color: red; }\n</style>\n<li class=\"aviso urgente\">Mensaje</li>",
  "opciones": [
    "Se pone rojo: class contiene la palabra aviso",
    "No se pone rojo: class no es EXACTAMENTE \"aviso\"",
    "Se pone rojo solo la palabra \"aviso\" dentro del texto"
  ],
  "correcta": 1,
  "explicacion": "[class=\"aviso\"] exige que el valor completo del atributo sea exactamente \"aviso\", carácter por carácter — con class=\"aviso urgente\" el valor real es distinto, así que no coincide. Para una palabra dentro de una lista separada por espacios hace falta [class~=\"aviso\"], no el signo =."
}
```

## Coincidencia de palabra completa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  p[class~=\"especial\"] {\n    font-weight: bold;\n  }\n</style>\n<p class=\"intro especial\">Este sí</p>\n<p class=\"especialmente\">Este no</p>",
  "anotaciones": [
    { "fragmento": "p[class~=\"especial\"] {\n    font-weight: bold;\n  }", "nota": "Coincide si \"especial\" aparece como PALABRA COMPLETA en una lista separada por espacios — no como parte de otra palabra más larga." },
    { "fragmento": "class=\"especialmente\"", "nota": "\"especialmente\" contiene la cadena \"especial\", pero no es la misma palabra — ~= no coincide aquí, aunque *= sí lo haría." }
  ]
}
```

## Empieza por, termina en, contiene

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a[href^=\"https://\"] { color: green; }\n  a[href$=\".pdf\"] { font-weight: bold; }\n  a[href*=\"descarga\"] { text-decoration: underline; }\n</style>",
  "anotaciones": [
    { "fragmento": "a[href^=\"https://\"] { color: green; }", "nota": "^= es \"empieza por\": solo enlaces cuyo href arranca exactamente con ese texto." },
    { "fragmento": "a[href$=\".pdf\"] { font-weight: bold; }", "nota": "$= es \"termina en\": útil para marcar visualmente cualquier enlace de descarga a un tipo de archivo concreto." },
    { "fragmento": "a[href*=\"descarga\"] { text-decoration: underline; }", "nota": "*= es \"contiene\": la más permisiva de las tres, coincide en cualquier posición dentro del valor." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  a { color: #2563eb; }\n</style>\n<p><a href=\"pagina.html\">Ver la página</a> · <a href=\"informe.pdf\">Descargar el informe</a></p>",
  "despues": "<style>\n  a { color: #2563eb; }\n  a[href$=\".pdf\"] {\n    background: #fef3c7;\n    padding: 2px 6px;\n    border-radius: 4px;\n  }\n</style>\n<p><a href=\"pagina.html\">Ver la página</a> · <a href=\"informe.pdf\">Descargar el informe</a></p>",
  "nota": "El mismo HTML en los dos casos. a[href$=\".pdf\"] selecciona solo el segundo enlace, porque su href termina en \".pdf\" — el primero, que termina en \".html\", nunca coincide. Ni un solo cambio en el HTML: todo lo decide el propio valor del atributo."
}
```

## El caso de los idiomas: el operador |=

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  [lang|=\"zh\"] {\n    font-family: \"Noto Sans SC\", sans-serif;\n  }\n</style>\n<p lang=\"zh-Hans\">你好</p>\n<p lang=\"zh\">你好</p>",
  "anotaciones": [
    { "fragmento": "[lang|=\"zh\"] {\n    font-family: \"Noto Sans SC\", sans-serif;\n  }", "nota": "Coincide con lang=\"zh\" exacto, O con cualquier valor que empiece por \"zh-\" (con guion) — agrupa todas las variantes de un mismo idioma en un solo selector." }
  ]
}
```

## Insensible a mayúsculas: el modificador i

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a[href$=\".PDF\" i] {\n    background: #fef3c7;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "i", "nota": "Ese modificador, justo antes del corchete de cierre, hace que la comparación ignore mayúsculas y minúsculas — sin él, \".pdf\" y \".PDF\" no coincidirían con el mismo selector." }
  ]
}
```

## Lo que un selector de atributo NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "[class=\"aviso\"] selecciona cualquier elemento que tenga la clase aviso entre otras",
      "realidad": "Exige que el valor completo del atributo sea exactamente \"aviso\" — con más de una clase, hace falta ~= en su lugar, no =."
    },
    {
      "mito": "[href*=\"pdf\"] y [href$=\".pdf\"] hacen lo mismo",
      "realidad": "*= coincide en cualquier posición (también \"pdfcompressor.html\"); $= exige que termine exactamente así — para \"enlaces a un PDF de verdad\", $=\".pdf\" es más preciso."
    },
    {
      "mito": "Los selectores de atributo solo sirven para class y href",
      "realidad": "Funcionan con cualquier atributo — type, lang, data-*, target... cualquiera que aparezca en el HTML."
    },
    {
      "mito": "[lang|=\"zh\"] hace lo mismo que [lang^=\"zh\"]",
      "realidad": "|= exige que después del prefijo venga un guion (o nada); ^= coincidiría también con un idioma inventado como \"zhuang\", que no tiene nada que ver con chino."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar = esperando que coincida con una palabra dentro de una lista de clases.", "texto": "Sin ~=, [class=\"algo\"] solo coincide con ese valor exacto y completo, nunca con una clase entre varias." },
    { "titulo": "Confundir *= (contiene) con $= (termina en) para extensiones de archivo.", "texto": "[href*=\".pdf\"] también coincidiría con \"informe.pdf.backup\" — $= es la opción precisa para \"termina en esta extensión\"." },
    { "titulo": "Olvidar el modificador i cuando el valor puede venir en mayúsculas.", "texto": "Un CMS o una persona pueden escribir .PDF en vez de .pdf — sin i, ese enlace concreto se queda sin estilizar." },
    { "titulo": "Pensar que los selectores de atributo necesitan una clase o id además.", "texto": "Funcionan solos, directamente sobre cualquier atributo del HTML — no hace falta combinarlos con nada más." }
  ]
}
```

## Ejercicios

1. Escribe un selector que estilice cualquier enlace que tenga el atributo target, sin importar su valor.
2. Escribe un selector que marque visualmente los enlaces que empiezan por mailto: de forma distinta a los demás.
3. Escribe un selector que seleccione todas las imágenes cuyo atributo alt esté vacío (alt="").
4. Explica la diferencia real entre [href*="es"] y [href^="es"] con un ejemplo de una URL que coincida con uno pero no con el otro.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un selector para cualquier enlace con el atributo target (ejercicio 1), otro para los que empiezan por mailto: (ejercicio 2), y otro para las imágenes con alt vacío (ejercicio 3).",
  "html": "<a href=\"https://ejemplo.com\" target=\"_blank\">Externo</a>\n<a href=\"mailto:hola@ejemplo.com\">Escríbenos</a>\n<img src=\"foto.jpg\" alt=\"\">\n<img src=\"otra.jpg\" alt=\"Un paisaje\">",
  "css": "/* Escribe aquí tus selectores de atributo */",
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
      "titulo": "Attribute selectors",
      "descripcion": "Guía de referencia de MDN sobre los siete operadores de selección por atributo, con ejemplos comparados de cada uno.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Attribute_selectors",
      "etiqueta": "MDN"
    }
  ]
}
```
