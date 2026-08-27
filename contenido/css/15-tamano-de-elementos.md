# Tamaño de elementos: width/height, min/max y overflow

- **Módulo:** El modelo de caja
- **Slug:** `tamano-de-elementos-width-height-min-max-y-overflow` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [Sizing items in CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Sizing) + [Overflowing content (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow) + [Overflow (web.dev)](https://web.dev/learn/css/overflow) — ver `contenido/css/TEMARIO.md` #15

---

## Qué es y para qué sirve

Antes de escribir un solo `width`, cada elemento ya tiene un tamaño: su tamaño natural o intrínseco — el de una imagen según su archivo, el de un `<div>` vacío según su contenido (ninguno). CSS permite fijar ese tamaño explícitamente, ponerle límites con `min-`/`max-`, o dejarlo crecer según el contenido — y cuando el contenido no cabe en el espacio que le diste, `overflow` decide qué pasa con lo que sobra.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita controlar el tamaño a propósito",
  "roles": [
    { "etiqueta": "Quien maqueta imágenes fluidas", "rol": "Evitar que una imagen se estire más de la cuenta", "descripcion": "max-width: 100% dispone que una imagen nunca crezca más allá de su tamaño natural, solo se encoja si el contenedor es más pequeño." },
    { "etiqueta": "Quien fija alturas de contenido variable", "rol": "Decidir qué pasa cuando el texto no cabe", "descripcion": "overflow: visible, hidden, scroll o auto responden de forma completamente distinta al mismo problema — elegir mal puede esconder contenido importante." },
    { "etiqueta": "Quien calcula espaciado en porcentaje", "rol": "Saber que el padding vertical también depende del ancho", "descripcion": "Un padding: 10% arriba y abajo se calcula sobre el ANCHO del contenedor, no sobre su alto — un resultado que sorprende a quien no lo conoce." }
  ]
}
```

## Tamaño natural (intrínseco) frente a tamaño fijado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<div></div>\n\n<img src=\"foto.png\" alt=\"\">",
  "anotaciones": [
    { "fragmento": "<div></div>", "nota": "Un div vacío, sin contenido ni width/height, no tiene tamaño intrínseco propio — colapsa a una línea de altura cero. El contenido es lo que le da tamaño, no el propio div." },
    { "fragmento": "<img src=\"foto.png\" alt=\"\">", "nota": "Una imagen SÍ tiene tamaño intrínseco: el que trae definido en su propio archivo. Sin ningún CSS, se muestra exactamente a ese tamaño." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"border: 3px solid #7c3aed;\">Sin width ni height fijados</div>",
  "despues": "<div style=\"border: 3px solid #7c3aed; width: 220px; height: 80px;\">Con width: 220px y height: 80px</div>",
  "nota": "Antes, la caja mide lo que ocupa su propio texto — su tamaño depende del contenido. Después, con width y height fijados explícitamente, la caja mide siempre eso, sin importar cuánto texto tenga dentro."
}
```

## El gotcha del padding y margin en porcentaje

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El padding vertical también se calcula sobre el ANCHO",
  "contenido": "Podría parecer lógico que un padding-top en porcentaje se calculara sobre la altura del contenedor. No es así: TODOS los porcentajes de padding y margin — arriba, abajo, izquierda, derecha — se calculan sobre el ancho (inline size) del contenedor, nunca sobre su alto."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .angosto {\n    width: 150px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    padding: 10%;\n    background: #ede9fe;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"angosto\">\n  <div class=\"caja\">padding: 10% (contenedor de 150px)</div>\n</div>",
  "despues": "<style>\n  .angosto {\n    width: 500px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    padding: 10%;\n    background: #ede9fe;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"angosto\">\n  <div class=\"caja\">padding: 10% (contenedor de 500px)</div>\n</div>",
  "nota": "El mismo padding: 10% en los dos casos — lo único que cambia es el ANCHO del contenedor, de 150px a 500px. El padding vertical (arriba y abajo) se nota muchísimo más grande en el segundo caso, aunque el alto del contenedor no haya cambiado en absoluto: el 10% siempre se calcula sobre el ancho, en las cuatro direcciones."
}
```

## max-width: 100% en imágenes

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    width: 200px;\n    border: 2px dashed #9ca3af;\n    padding: 8px;\n  }\n  img { width: 100%; }\n</style>\n<div class=\"contenedor\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%237c3aed'/%3E%3C/svg%3E\" alt=\"\" width=\"40\" height=\"40\">\n</div>",
  "despues": "<style>\n  .contenedor {\n    width: 200px;\n    border: 2px dashed #9ca3af;\n    padding: 8px;\n  }\n  img { max-width: 100%; }\n</style>\n<div class=\"contenedor\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%237c3aed'/%3E%3C/svg%3E\" alt=\"\" width=\"40\" height=\"40\">\n</div>",
  "nota": "La imagen mide 40×40px de forma natural. Antes, con width: 100%, se ESTIRA hasta los 200px del contenedor — mucho más grande que su tamaño real (con una foto de verdad, esto se vería borroso y pixelado). Después, con max-width: 100%, la imagen nunca crece más allá de su tamaño natural — max-width solo pone un TOPE, nunca obliga a crecer."
}
```

## overflow: qué pasa cuando el contenido no cabe

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué visible es el valor por defecto",
  "contenido": "CSS podría recortar silenciosamente cualquier contenido que no quepa. No lo hace a propósito: overflow: visible es el valor por defecto precisamente para evitar la \"pérdida de datos\" invisible — mejor un desbordamiento feo y visible que un contenido importante desaparecido sin ningún aviso."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { overflow: visible; }\n  .b { overflow: hidden; }\n  .c { overflow: scroll; }\n  .d { overflow: auto; }\n  .e { overflow: clip; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { overflow: visible; }", "nota": "El valor por defecto. El contenido que no cabe se sale de la caja, visible, sin recortarse." },
    { "fragmento": ".b { overflow: hidden; }", "nota": "Recorta y esconde por completo lo que no cabe. Sigue siendo posible desplazar ese contenido de forma programática (por ejemplo con scrollTo() en JavaScript)." },
    { "fragmento": ".c { overflow: scroll; }", "nota": "Siempre muestra barras de scroll en los dos ejes, aunque el contenido quepa perfectamente sin ellas." },
    { "fragmento": ".d { overflow: auto; }", "nota": "Muestra barras de scroll solo cuando hacen falta de verdad — la opción más práctica en la mayoría de los casos." },
    { "fragmento": ".e { overflow: clip; }", "nota": "Se comporta como hidden, pero además PROHÍBE cualquier scroll programático sobre esa caja — ni siquiera JavaScript puede desplazar ese contenido." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .caja {\n    width: 220px;\n    height: 80px;\n    border: 2px solid #7c3aed;\n    padding: 8px;\n    font-family: sans-serif;\n    overflow: visible;\n  }\n</style>\n<div class=\"caja\">Este texto es deliberadamente largo para no caber en una caja de solo 80px de alto, así se ve qué pasa con lo que sobra.</div>",
  "despues": "<style>\n  .caja {\n    width: 220px;\n    height: 80px;\n    border: 2px solid #7c3aed;\n    padding: 8px;\n    font-family: sans-serif;\n    overflow: auto;\n  }\n</style>\n<div class=\"caja\">Este texto es deliberadamente largo para no caber en una caja de solo 80px de alto, así se ve qué pasa con lo que sobra.</div>",
  "nota": "Mismo texto, misma caja de 80px de alto. Antes (overflow: visible, por defecto): el texto se sale visiblemente por debajo del borde de la caja. Después (overflow: auto): la caja se queda dentro de su tamaño fijado y aparece una barra de scroll para llegar al resto del texto."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "overflow: hidden puede esconder contenido interactivo",
  "contenido": "Una caja con overflow: hidden y una altura fija puede recortar justo el botón de enviar un formulario, o cualquier otro control importante, sin que nadie se dé cuenta hasta que un usuario real no pueda completar la acción. Antes de usar overflow: hidden, conviene probar con contenido más largo de lo habitual — y con el tamaño de fuente aumentado — para confirmar que nada esencial queda fuera de alcance."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    width: 200px;\n    height: 60px;\n    border: 2px solid black;\n  }\n</style>\n<div class=\"caja\">Un texto bastante largo que no cabe dentro de una caja de solo 60 píxeles de alto, así que algo tiene que pasar con el contenido que sobra.</div>",
  "opciones": [
    "El texto se recorta automáticamente y desaparece lo que no cabe",
    "El texto se sale visiblemente de la caja, por debajo del borde — overflow: visible es el valor por defecto",
    "Aparece automáticamente una barra de scroll, sin necesidad de escribir overflow"
  ],
  "correcta": 1,
  "explicacion": "Sin declarar overflow, el valor por defecto es visible — el contenido que no cabe se sale de la caja, visible, sin recortarse y sin generar ninguna barra de scroll. Hace falta overflow: hidden, scroll o auto explícitamente para cambiar ese comportamiento."
}
```

## Lo que el tamaño y el overflow NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un div vacío siempre tiene algún alto visible por defecto",
      "realidad": "Sin contenido ni width/height fijados, colapsa a altura cero — el contenido es lo único que le da tamaño, salvo que se fije uno explícitamente."
    },
    {
      "mito": "El padding o margin vertical en porcentaje se calcula según el alto del contenedor",
      "realidad": "TODOS los porcentajes de padding y margin — en las cuatro direcciones — se calculan sobre el ancho del contenedor, nunca sobre su alto."
    },
    {
      "mito": "width: 100% es la forma segura de que una imagen ocupe todo el ancho disponible",
      "realidad": "Puede estirarla más allá de su tamaño natural, volviéndola borrosa — max-width: 100% es la opción segura, porque solo permite encoger, nunca obliga a crecer."
    },
    {
      "mito": "overflow: hidden y overflow: clip hacen exactamente lo mismo",
      "realidad": "clip además prohíbe cualquier scroll programático (por JavaScript) sobre esa caja — hidden sigue permitiéndolo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Fijar una altura rígida en una caja de texto con contenido variable.", "texto": "Arriesga que el texto se corte o se salga en cuanto el contenido sea un poco más largo de lo previsto en el diseño original." },
    { "titulo": "Esperar que el padding vertical dependa del alto del contenedor.", "texto": "Siempre depende de su ancho — un cálculo mental basado en la altura llevará a un resultado equivocado." },
    { "titulo": "Usar width: 100% en imágenes en vez de max-width: 100%.", "texto": "Arriesga estirar la imagen más allá de su tamaño natural, volviéndola borrosa en pantalla." },
    { "titulo": "Usar overflow: hidden sin comprobar qué contenido interactivo podría estar escondiendo.", "texto": "Un botón o control importante recortado sin darse cuenta es un problema real de accesibilidad, no solo estético." }
  ]
}
```

## Ejercicios

1. Explica por qué un `<div>` vacío, sin contenido ni `width`/`height` fijados, no ocupa ninguna altura visible en la página.
2. Una caja tiene `padding: 15%` y vive dentro de un contenedor de 300px de ancho. Calcula el padding resultante en píxeles en los cuatro lados: arriba, abajo, izquierda y derecha.
3. Explica la diferencia práctica entre usar `width: 100%` y `max-width: 100%` en una imagen dentro de un contenedor más grande que la propia imagen.
4. Escribe una regla que haga que una caja con overflow se pueda desplazar solo verticalmente, nunca horizontalmente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Sizing items in CSS",
      "descripcion": "Guía de MDN sobre tamaño intrínseco y extrínseco, porcentajes, min/max-width y el patrón max-width: 100% en imágenes.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Sizing",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Overflowing content",
      "descripcion": "Guía de MDN sobre los valores de overflow, su relación con el clearfix clásico y las advertencias de accesibilidad al esconder contenido.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Overflow",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con overflow: clip, accesibilidad de regiones desplazables y overscroll-behavior.",
      "url": "https://web.dev/learn/css/overflow",
      "etiqueta": "web.dev"
    }
  ]
}
```
