# Gráficos vectoriales: SVG inline frente a img

- **Módulo:** Multimedia
- **Slug:** `graficos-vectoriales-svg-inline-frente-a-img` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [Including vector graphics in HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML) + [especificación SVG 2 (W3C)](https://www.w3.org/TR/SVG2/) — ver `contenido/html/TEMARIO.md` #15

---

## Qué es y para qué sirve

Un PNG o un JPEG guardan un color exacto para cada píxel — por eso pixelan al ampliarlos. Un SVG (*Scalable Vector Graphics*) no guarda píxeles: guarda fórmulas — "un círculo centrado aquí, de este radio, de este color". El navegador las recalcula cada vez que hace falta, así que un SVG se ve igual de nítido en un icono de 16px que ampliado a pantalla completa. La otra decisión real, aparte de cuándo usar SVG, es CÓMO incluirlo: como archivo referenciado (`<img src="icono.svg">`) o inline, con el propio marcado `<svg>` escrito directamente en el HTML — y esa elección sí que cambia lo que puedes hacer con él después.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué gana cada forma de incluir un SVG",
  "roles": [
    { "etiqueta": "img src=\"icono.svg\"", "rol": "Simplicidad y caché", "descripcion": "Misma sintaxis que cualquier imagen, con alt incluido, y el navegador cachea el archivo — pero queda opaco: ni CSS de la página ni JavaScript pueden tocar su interior." },
    { "etiqueta": "SVG inline en el HTML", "rol": "Control total", "descripcion": "Sus formas son elementos reales del documento — se pueden seleccionar con CSS, animar, cambiar de color al pasar el ratón — a cambio de no poder cachearse como archivo aparte." },
    { "etiqueta": "Quien usa una pantalla de alta densidad", "rol": "Ver siempre nitidez perfecta", "descripcion": "Un icono SVG se ve igual de afilado en una pantalla 4K que en una normal — un PNG del mismo tamaño se vería borroso en la primera." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el icono o ilustración es siempre el mismo",
  "contenido": "Un logotipo, un icono de redes sociales, una ilustración decorativa fija — ahí img (o incluso CSS background) es más simple y se beneficia de la caché del navegador."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando necesitas cambiarlo con CSS o JavaScript",
  "contenido": "Un icono que cambia de color al pasar el ratón, una barra de progreso animada, un gráfico que se actualiza con datos reales — ahí hace falta SVG inline, sin excepción."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el mismo SVG se usa una única vez en la página",
  "contenido": "Repetirlo inline muchas veces infla el HTML — para un icono que se repite mucho, un archivo cacheable (img o un sprite) suele salir más a cuenta."
}
```

## Cómo se usa: SVG referenciado con img

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<img\n  src=\"triangulo.svg\"\n  alt=\"Triángulo equilátero con los tres lados iguales\"\n  width=\"100\"\n  height=\"87\">",
  "anotaciones": [
    { "fragmento": "src=\"triangulo.svg\"", "nota": "Exactamente la misma sintaxis que cualquier otra imagen — el navegador cachea el archivo como haría con un PNG." },
    { "fragmento": "alt=\"Triángulo equilátero con los tres lados iguales\"", "nota": "Sigue haciendo falta un alt, igual que con cualquier img — da igual que el propio SVG tenga texto o no: el navegador lo trata como una imagen opaca." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E %3Ccircle cx='12' cy='12' r='11' fill='%232563eb'/%3E %3Cpath d='M7 12.5l3 3 7-7' stroke='%23ffffff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E %3C/svg%3E\" width=\"800\" alt=\"Logotipo\">\n<!-- El SVG original mide 24x24 unidades -->",
  "opciones": [
    "Se ve borroso o pixelado al ampliarlo tanto",
    "Se ve nítido, sin importar cuánto se agrande",
    "El navegador se niega a mostrar una imagen tan ampliada"
  ],
  "correcta": 1,
  "explicacion": "A diferencia de un PNG o un JPEG, un SVG no almacena píxeles, sino fórmulas de formas. Ampliarlo a cualquier tamaño simplemente recalcula esas formas a la nueva escala, sin ningún límite real de nitidez."
}
```

## SVG inline: cuando necesitas tocarlo con CSS

Mismo CSS, mismo color de partida — la única diferencia es dónde vive el SVG:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .icono circle { fill: crimson; }\n</style>\n<img class=\"icono\" width=\"80\" height=\"80\" alt=\"Icono decorativo\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23333333'/%3E%3C/svg%3E\">",
  "despues": "<style>\n  .icono circle { fill: crimson; }\n</style>\n<svg class=\"icono\" width=\"80\" height=\"80\" viewBox=\"0 0 100 100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#333333\"/>\n</svg>",
  "nota": "En la versión de antes, ese círculo vive dentro de un img — el navegador ni siquiera intenta aplicar el selector .icono circle, porque no hay nada \"dentro\" de un img que CSS pueda alcanzar, así que se queda gris. En la de después, el mismo SVG está inline: sus formas son elementos reales del documento, y la regla se aplica sin problema."
}
```

## El sistema de coordenadas propio: viewBox

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<svg width=\"300\" height=\"200\" viewBox=\"0 0 1500 1000\">\n  <circle cx=\"750\" cy=\"500\" r=\"400\" fill=\"steelblue\"/>\n</svg>",
  "anotaciones": [
    { "fragmento": "width=\"300\" height=\"200\"", "nota": "El tamaño real en pantalla, en píxeles — el viewport donde se dibuja el SVG." },
    { "fragmento": "viewBox=\"0 0 1500 1000\"", "nota": "Un sistema de coordenadas propio, independiente del tamaño en pantalla: los dos primeros números son la esquina superior izquierda (casi siempre 0 0), los otros dos son el ancho y el alto de ese \"lienzo\" interno." },
    { "fragmento": "cx=\"750\" cy=\"500\" r=\"400\"", "nota": "Estas coordenadas se miden en las unidades del viewBox, no en píxeles reales de pantalla — por eso el mismo SVG se ve igual de nítido en un móvil que en una pantalla 4K: el navegador reescala el viewBox entero al tamaño real disponible." }
  ]
}
```

## img, inline o fondo CSS: qué elegir

| Método | ¿CSS de la página lo estiliza? | ¿Se puede animar con JS? | ¿Se cachea como archivo aparte? |
|---|---|---|---|
| `<img src="icono.svg">` | No | No | Sí |
| SVG inline en el HTML | Sí | Sí | No |
| CSS `background-image` | No | No | Sí |

## Lo que SVG NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un SVG siempre pesa menos que un PNG o JPEG equivalente",
      "realidad": "Un SVG con formas muy complejas, exportado sin optimizar desde un editor, puede pesar MÁS que un raster simple — conviene pasarlo por un optimizador (como SVGO) antes de publicarlo."
    },
    {
      "mito": "El alt de un img con SVG no hace falta porque el SVG ya lleva texto",
      "realidad": "Da igual lo que haya dentro del SVG referenciado por img — el navegador lo trata como una imagen opaca, así que sigue haciendo falta un alt, igual que con cualquier otra imagen."
    },
    {
      "mito": "SVG inline y SVG con img son intercambiables sin más",
      "realidad": "Cambiar de uno a otro puede romper silenciosamente el CSS o el JavaScript que dependía de poder tocar el interior del SVG — no es solo una cuestión de sintaxis."
    },
    {
      "mito": "Un SVG es solo para iconos pequeños",
      "realidad": "Sirve igual de bien para ilustraciones grandes, gráficos de datos o animaciones complejas — el límite real es la complejidad de las formas, no el tamaño en pantalla."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Publicar un SVG exportado directamente del editor sin optimizar.", "texto": "Suele arrastrar metadatos, capas ocultas y precisión decimal innecesaria — pasarlo por un optimizador reduce el peso sin cambiar el resultado visual." },
    { "titulo": "Esperar que una hoja de estilos externa afecte a un SVG cargado con img.", "texto": "Solo el CSS inline dentro del propio archivo SVG, o el SVG inline en el HTML, puede estilizarlo — una hoja de estilos externa enlazada desde el SVG no tiene efecto ahí." },
    { "titulo": "Repetir el mismo SVG inline muchas veces en la misma página.", "texto": "Cada copia añade su peso completo al HTML — un icono que se repite mucho se beneficia más de img (con caché) o de un sprite reutilizable." },
    { "titulo": "No comprobar la configuración del servidor cuando un SVG no se ve.", "texto": "Muchas veces el problema es que el servidor no sirve el tipo MIME image/svg+xml correctamente — no un error en el propio archivo." }
  ]
}
```

## Ejercicios

1. Escribe un SVG mínimo a mano (un círculo o un rectángulo) y decide si lo incrustarías inline o con img, justificando por qué.
2. Escribe el mismo icono dos veces: una como img referenciando un archivo, otra inline — y escribe una regla CSS que solo funcione en una de las dos versiones.
3. Investiga qué hace un viewBox="0 0 24 24" en un icono típico de una librería de iconos — ¿por qué casi todos usan esas mismas dimensiones internas?
4. Busca en una web real un icono SVG y ábrelo con las herramientas de desarrollador — ¿está inline en el HTML o referenciado con img?

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un SVG inline con un círculo o un rectángulo (ejercicio 1). Después dale color desde la pestaña CSS — funciona precisamente porque el SVG está inline, no lo conseguirías con un <img>.",
  "html": "<!-- Empieza aquí, por ejemplo: -->\n<svg viewBox=\"0 0 24 24\" width=\"64\">\n  <circle cx=\"12\" cy=\"12\" r=\"10\" />\n</svg>",
  "css": "/* prueba: svg circle { fill: steelblue; } */",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Including vector graphics in HTML",
      "descripcion": "Guía de referencia de MDN sobre las distintas formas de incluir SVG en una página y sus ventajas e inconvenientes.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML",
      "etiqueta": "MDN"
    },
    {
      "titulo": "SVG 2 — Coordinate Systems",
      "descripcion": "La especificación normativa del W3C sobre el atributo viewBox y el sistema de coordenadas de SVG.",
      "url": "https://www.w3.org/TR/SVG2/coords.html",
      "etiqueta": "W3C"
    }
  ]
}
```
