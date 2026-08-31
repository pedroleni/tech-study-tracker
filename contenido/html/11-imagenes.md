# Imágenes: img, alt, figure/figcaption y formatos responsive

- **Módulo:** Multimedia
- **Slug:** `imagenes-img-alt-figure-figcaption-y-formatos-responsive` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [HTML images (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images) + [Images (web.dev)](https://web.dev/learn/html/images) — ver `contenido/html/TEMARIO.md` #11

---

## Qué es y para qué sirve

`<img>` incrusta una imagen en la página. Parece de las etiquetas más simples de HTML, pero es también una de las que más se hace mal: un `alt` mal escrito deja fuera a quien no puede ver la imagen, un `width`/`height` ausente hace que la página salte al cargar, y servir siempre el mismo archivo pesado castiga a quien tiene una conexión lenta o un móvil de gama media. Escribir un `<img>` bien no es solo poner una ruta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién depende de una imagen bien etiquetada",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Leer el alt en vez de la imagen", "descripcion": "Sin alt, solo anuncia \"imagen\" sin más contexto — con un alt bien escrito, describe lo que esa imagen aporta al contenido." },
    { "etiqueta": "Quien tiene mala conexión", "rol": "Ver el alt si la imagen no carga", "descripcion": "Con datos limitados o una red lenta, muchas imágenes nunca llegan a descargarse — el alt es lo único que queda en su lugar." },
    { "etiqueta": "El navegador al renderizar", "rol": "Reservar el hueco antes de cargar", "descripcion": "Con width y height, calcula el espacio que ocupará la imagen antes de descargarla — sin saltos de contenido cuando por fin aparece." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando la imagen aporta información real",
  "contenido": "Una foto de producto, un gráfico, una captura de pantalla — cualquier imagen que si desapareciera te dejaría sin algo importante necesita un alt que lo explique."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando la imagen es puramente decorativa",
  "contenido": "Un patrón de fondo, un separador visual sin significado propio — ahí el alt correcto es vacío (alt=\"\"), no una descripción forzada de algo que no aporta nada."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres servir la mejor versión según el dispositivo",
  "contenido": "Pantallas de alta densidad, conexiones lentas, formatos más ligeros como AVIF o WebP — para eso están srcset, sizes y picture, no un único archivo igual para todo el mundo."
}
```

## Cómo se usa: src, alt y las dimensiones

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un img completo, atributo por atributo",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "img", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "src", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"dino.jpg\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "alt", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"...\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "width", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"400\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "height", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"341\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<img src=\"imagenes/dinosaurio.jpg\" alt=\"Cráneo y torso de un esqueleto de dinosaurio, con una cabeza grande y dientes afilados\" width=\"400\" height=\"341\">",
  "anotaciones": [
    { "fragmento": "src=\"imagenes/dinosaurio.jpg\"", "nota": "img es un elemento vacío — sin etiqueta de cierre, sin contenido dentro. src suele ser una ruta relativa a una imagen alojada en tu propio servidor." },
    { "fragmento": "alt=\"Cráneo y torso de un esqueleto de dinosaurio, con una cabeza grande y dientes afilados\"", "nota": "Una descripción breve pero real de lo que se ve — no el nombre del archivo, no \"imagen\", no una repetición literal del texto que ya la acompaña." },
    { "fragmento": "width=\"400\" height=\"341\"", "nota": "Le dicen al navegador cuánto espacio reservar ANTES de descargar la imagen — evita que el resto de la página \"salte\" cuando por fin llega." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "width y height no son para redimensionar la imagen",
  "contenido": "Deben coincidir con el tamaño real del archivo. Ponerlos más grandes de lo que la imagen es de verdad la estira y la vuelve borrosa — para cambiar el tamaño visual se usa CSS, no estos atributos."
}
```

## Escribir un buen alt

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<img src=\"dino.jpg\" alt=\"imagen\">",
  "despues": "<img src=\"dino.jpg\" alt=\"Cráneo y torso de un esqueleto de dinosaurio, con una cabeza grande y dientes afilados\">",
  "nota": "La imagen que se ve es idéntica en los dos casos — la diferencia solo existe para quien no puede verla: un lector de pantalla, o cualquiera si la imagen no llega a cargar."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<img src=\"separador-decorativo.png\" alt=\"\">",
  "opciones": [
    "El lector de pantalla se salta la imagen, como si no estuviera",
    "El lector de pantalla se detiene y dice \"imagen sin descripción\"",
    "El navegador no muestra la imagen porque el alt está vacío"
  ],
  "correcta": 0,
  "explicacion": "alt=\"\" (vacío, pero presente) es la forma CORRECTA de marcar una imagen puramente decorativa — le dice al lector de pantalla que la ignore por completo y siga con el resto del contenido. Es distinto de no poner alt en absoluto, que sí puede acabar anunciando el nombre del archivo."
}
```

## figure y figcaption: cuando una imagen necesita algo más

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div class=\"figura\">\n  <img src=\"trex.jpg\" alt=\"Esqueleto completo de T-Rex\">\n  <p>Un T-Rex expuesto en el Museo de la Universidad de Manchester.</p>\n</div>",
  "despues": "<figure>\n  <img src=\"trex.jpg\" alt=\"Esqueleto completo de T-Rex\">\n  <figcaption>Un T-Rex expuesto en el Museo de la Universidad de Manchester.</figcaption>\n</figure>",
  "nota": "Visualmente pueden verse iguales. La diferencia es semántica: figure y figcaption asocian explícitamente el pie de foto con SU imagen — imprescindible en una página con varias imágenes, donde un div y un p sueltos no dejan claro cuál va con cuál."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "alt y figcaption no son lo mismo, y no deberían repetirse",
  "contenido": "alt describe la imagen para quien no puede verla; figcaption es un pie de foto visible para todo el mundo, con contexto adicional (de dónde es, cuándo se tomó). Escribir el mismo texto en los dos es redundante — cada uno cumple un papel distinto."
}
```

## Formatos modernos y su fallback: picture, webp y avif

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<picture>\n  <source srcset=\"foto.avif\" type=\"image/avif\">\n  <source srcset=\"foto.webp\" type=\"image/webp\">\n  <img src=\"foto.jpg\" alt=\"Atardecer sobre la costa\">\n</picture>",
  "anotaciones": [
    { "fragmento": "<source srcset=\"foto.avif\" type=\"image/avif\">", "nota": "El navegador prueba cada source en orden y usa el primero que sepa decodificar — AVIF suele pesar bastante menos que JPEG con una calidad visual parecida." },
    { "fragmento": "<source srcset=\"foto.webp\" type=\"image/webp\">", "nota": "Si el navegador no soporta AVIF, prueba con WebP como segunda opción — también más ligero que los formatos clásicos." },
    { "fragmento": "<img src=\"foto.jpg\" alt=\"Atardecer sobre la costa\">", "nota": "El img final es OBLIGATORIO y sirve de red de seguridad: si ningún source coincide, usa este — por eso lleva siempre el formato más compatible, normalmente JPEG o PNG." }
  ]
}
```

## Imágenes responsive: srcset, sizes y carga diferida

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<img\n  src=\"foto-400.jpg\"\n  srcset=\"foto-400.jpg 400w, foto-800.jpg 800w, foto-1200.jpg 1200w\"\n  sizes=\"(max-width: 600px) 100vw, 50vw\"\n  alt=\"Atardecer sobre la costa\"\n  loading=\"lazy\">",
  "anotaciones": [
    { "fragmento": "srcset=\"foto-400.jpg 400w, foto-800.jpg 800w, foto-1200.jpg 1200w\"", "nota": "Ofrece varias versiones de la MISMA imagen a distintos anchos reales (400, 800 y 1200 píxeles) — el navegador elige cuál descargar." },
    { "fragmento": "sizes=\"(max-width: 600px) 100vw, 50vw\"", "nota": "Le dice al navegador qué ancho ocupará la imagen en pantalla según el viewport — con esa información y la del srcset, calcula qué archivo pesa menos sin perder nitidez." },
    { "fragmento": "loading=\"lazy\"", "nota": "Retrasa la descarga hasta que la imagen esté a punto de entrar en el viewport — ahorra datos si el usuario nunca llega a hacer scroll hasta ahí." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<img src=\"foto.jpg\"\n  srcset=\"foto-400.jpg 400w, foto-1200.jpg 1200w\"\n  sizes=\"100vw\">\n<!-- Visitante con un móvil de 380px de ancho -->",
  "opciones": [
    "Descarga siempre foto-1200.jpg, la de mayor calidad disponible",
    "Descarga foto-400.jpg, la versión más cercana al ancho real necesitado",
    "Descarga las dos y elige después con JavaScript"
  ],
  "correcta": 1,
  "explicacion": "El navegador combina el ancho del viewport (380px) con sizes (100vw, la imagen ocupa todo el ancho) para calcular qué archivo del srcset es suficiente sin sobrar — en este caso, foto-400.jpg. Pedir la versión de 1200px sería descargar más datos de los que esa pantalla puede aprovechar."
}
```

## Lo que alt NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El atributo title puede sustituir a alt",
      "realidad": "title solo aparece al pasar el ratón por encima — invisible en móvil y para quien navega con teclado. El soporte de lectores de pantalla para title, además, es muy inconsistente."
    },
    {
      "mito": "Una imagen sin alt es solo un pequeño descuido",
      "realidad": "Sin el atributo (ni siquiera vacío), algunos lectores de pantalla anuncian el nombre completo del archivo — algo como \"IMG guion bajo 4821 punto jpg\" en vez de silencio o una descripción útil."
    },
    {
      "mito": "alt=\"\" significa que se te olvidó escribir el texto",
      "realidad": "Es la forma correcta y deliberada de marcar una imagen puramente decorativa — le dice al lector de pantalla que la ignore, no que falte información."
    },
    {
      "mito": "Cualquier imagen decorativa se puede meter con img",
      "realidad": "Si es puramente decorativa, sin significado propio, el sitio correcto es un fondo CSS (background-image), no HTML — img es para contenido con significado, no para decoración."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar width/height para redimensionar en vez de para reservar espacio.", "texto": "Deben coincidir con el tamaño real del archivo; ponerlos distintos al tamaño real produce imágenes borrosas o pixeladas, no un redimensionado limpio." },
    { "titulo": "Enlazar imágenes alojadas en otro servidor (hotlinking).", "texto": "Además de consumir el ancho de banda ajeno sin permiso, la imagen puede cambiar o desaparecer sin ningún aviso, rompiendo tu página de la noche a la mañana." },
    { "titulo": "Meter texto importante dentro de una imagen.", "texto": "Un texto renderizado como imagen no se puede seleccionar, buscar ni ampliar por el usuario — si el contenido es texto, debería ser HTML, no un .png." },
    { "titulo": "Repetir literalmente el mismo texto en alt y en el párrafo de al lado.", "texto": "Si la imagen ya está descrita del todo en el texto que la rodea, alt=\"\" evita que un lector de pantalla lea la misma información dos veces seguidas." }
  ]
}
```

## Ejercicios

1. Busca una foto tuya y escribe dos versiones de alt para ella: una mala (genérica, tipo "foto") y una buena (descriptiva y breve).
2. Marca una imagen puramente decorativa (un separador, un icono sin función propia) con el alt correcto.
3. Envuelve una imagen y su pie de foto en figure/figcaption, escribiendo un alt y un figcaption que NO se repitan entre sí.
4. Escribe un picture con dos source (avif y webp) y un img de respaldo en jpg, para una imagen de tu elección.
5. Calcula qué archivo de un srcset con 400w/800w/1200w descargaría un navegador en una pantalla de 1024px de ancho con sizes="50vw".

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Esta imagen es un placeholder (no hace falta una foto real): escríbele un alt malo, luego uno bueno, y compara. Después envuélvela en figure/figcaption con un alt y un figcaption que no se repitan entre sí (ejercicio 3).",
  "html": "<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect width='320' height='200' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%23888'%3Efoto%3C/text%3E%3C/svg%3E\" alt=\"TODO: escribe aquí un alt\">",
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
      "titulo": "HTML images",
      "descripcion": "Guía de referencia de MDN sobre img, alt, width/height y figure/figcaption, con ejemplos de buenas y malas prácticas de accesibilidad.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Images",
      "descripcion": "Curso de web.dev centrado en rendimiento: srcset, sizes, picture y carga diferida con loading=\"lazy\".",
      "url": "https://web.dev/learn/html/images",
      "etiqueta": "web.dev"
    }
  ]
}
```
