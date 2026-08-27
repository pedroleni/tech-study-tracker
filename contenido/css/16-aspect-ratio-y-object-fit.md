# aspect-ratio y object-fit: controlar la proporción

- **Módulo:** El modelo de caja
- **Slug:** `aspect-ratio-y-object-fit-controlar-la-proporcion` (autogenerado del título)
- **Orden:** 75
- **Fuentes:** [Understanding and setting aspect ratios (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_sizing/Aspect_ratios) — ver `contenido/css/TEMARIO.md` #16

---

## Qué es y para qué sirve

`aspect-ratio` reserva una proporción de ancho a alto para cualquier caja — con o sin contenido, con o sin imagen dentro. `object-fit` decide qué hace una imagen o un vídeo cuando su propia proporción no coincide con la de la caja que lo contiene: ¿se recorta, se distorsiona, o se ve entera con espacio vacío alrededor? Dos propiedades pequeñas que resuelven un problema muy visible: el salto de layout cuando una imagen tarda en cargar, y las fotos deformadas en una cuadrícula de tarjetas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita controlar la proporción a propósito",
  "roles": [
    { "etiqueta": "Quien evita saltos de layout", "rol": "Reservar el espacio de una imagen antes de que cargue", "descripcion": "aspect-ratio en el contenedor reserva la altura exacta desde el primer render, antes incluso de que la imagen real llegue a descargarse." },
    { "etiqueta": "Quien maqueta una cuadrícula de tarjetas", "rol": "Evitar fotos estiradas o deformadas", "descripcion": "object-fit: cover mantiene la proporción original de cada foto, recortando lo que sobre en vez de deformarla para encajar en la caja." },
    { "etiqueta": "Quien inserta vídeos embebidos", "rol": "Mantener 16:9 (o cualquier proporción) al cambiar de tamaño", "descripcion": "aspect-ratio: 16 / 9 en un iframe de vídeo mantiene esa proporción exacta sin importar el ancho disponible." }
  ]
}
```

## aspect-ratio: solo actúa si al menos una dimensión queda libre

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Con width Y height fijados a la vez, aspect-ratio se ignora por completo",
  "contenido": "aspect-ratio solo fija una proporción \"preferida\" cuando AL MENOS una de las dos dimensiones (width o height) queda en auto. Si las dos están fijadas explícitamente, aspect-ratio se ignora del todo — la caja usa esos dos valores tal cual, sin importar qué proporción se haya declarado."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    aspect-ratio: 1;\n  }\n\n  .b {\n    aspect-ratio: 16 / 9;\n  }\n\n  .c {\n    aspect-ratio: auto 16 / 9;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    aspect-ratio: 1;\n  }", "nota": "Un solo número es un atajo de 1 / 1 — un cuadrado perfecto, sin importar el ancho." },
    { "fragmento": ".b {\n    aspect-ratio: 16 / 9;\n  }", "nota": "El formato ancho / alto más habitual — 16 / 9 es la proporción clásica de vídeo." },
    { "fragmento": ".c {\n    aspect-ratio: auto 16 / 9;\n  }", "nota": "En un elemento con tamaño intrínseco propio (como una imagen), auto usa ESA proporción natural si existe; si no la tiene, cae de vuelta a 16 / 9 como respaldo." }
  ]
}
```

## Reservar espacio antes de que cargue una imagen

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 240px; background: #ede9fe; border: 2px dashed #7c3aed;\"></div>",
  "despues": "<div style=\"width: 240px; aspect-ratio: 16 / 9; background: #ede9fe; border: 2px dashed #7c3aed;\"></div>",
  "nota": "El mismo div vacío, sin contenido, en los dos casos. Antes: sin height ni contenido, colapsa a una línea — no hay caja visible que reservar. Después: aspect-ratio: 16 / 9 le da una altura real (135px, calculada desde los 240px de ancho) aunque siga completamente vacío — el truco exacto para reservar el hueco de una imagen antes de que termine de cargar."
}
```

## El gotcha: dos dimensiones fijadas anulan aspect-ratio

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    width: 300px;\n    height: 100px;\n    aspect-ratio: 1;\n  }\n</style>\n<div class=\"caja\" style=\"background: lightblue;\"></div>",
  "opciones": [
    "La caja mide 300×300px: aspect-ratio: 1 fuerza que sea cuadrada",
    "La caja mide 300×100px: aspect-ratio se ignora porque width Y height están fijados los dos",
    "La caja mide 100×100px: aspect-ratio recorta el ancho para igualar el alto"
  ],
  "correcta": 1,
  "explicacion": "aspect-ratio solo actúa cuando al menos una dimensión queda en auto. Con width: 300px y height: 100px fijados explícitamente los dos, aspect-ratio: 1 se ignora por completo — la caja mide exactamente 300×100px, no cuadrada en absoluto."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; aspect-ratio: 1; background: #ede9fe; border: 2px solid #7c3aed;\"></div>",
  "despues": "<div style=\"width: 200px; height: 100px; aspect-ratio: 1; background: #ede9fe; border: 2px solid #7c3aed;\"></div>",
  "nota": "Antes: solo width está fijado, así que aspect-ratio: 1 calcula la altura sola — un cuadrado perfecto de 200×200px. Después: se añade height: 100px SIN quitar aspect-ratio: 1 — y la caja se convierte en un rectángulo de 200×100px, ignorando la proporción cuadrada por completo. La única diferencia es una línea de CSS."
}
```

## object-fit: qué hace una imagen cuando no encaja

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  img {\n    width: 200px;\n    height: 200px;\n  }\n  .fill { object-fit: fill; }\n  .contain { object-fit: contain; }\n  .cover { object-fit: cover; }\n  .none { object-fit: none; }\n</style>",
  "anotaciones": [
    { "fragmento": ".fill { object-fit: fill; }", "nota": "Estira o comprime la imagen para llenar la caja exacta — si la proporción no coincide, la imagen se DEFORMA." },
    { "fragmento": ".contain { object-fit: contain; }", "nota": "Escala la imagen entera para que quepa DENTRO de la caja, sin recortar nada — puede dejar espacio vacío si la proporción no coincide." },
    { "fragmento": ".cover { object-fit: cover; }", "nota": "Escala la imagen para CUBRIR toda la caja, sin dejar espacio vacío — recorta lo que sobre, pero nunca deforma la proporción original." },
    { "fragmento": ".none { object-fit: none; }", "nota": "No escala nada — la imagen se muestra a su tamaño intrínseco real, recortada o con espacio vacío según sea más grande o más pequeña que la caja." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .marco { width: 200px; height: 200px; border: 2px solid #7c3aed; }\n  img { width: 100%; height: 100%; display: block; object-fit: fill; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='75' cy='75' r='40' fill='%23dc2626'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "despues": "<style>\n  .marco { width: 200px; height: 200px; border: 2px solid #7c3aed; }\n  img { width: 100%; height: 100%; display: block; object-fit: cover; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='75' cy='75' r='40' fill='%23dc2626'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "nota": "La imagen original es un rectángulo 300×150 con un círculo rojo perfecto dentro. Antes (object-fit: fill), al forzarla dentro de una caja cuadrada de 200×200, el círculo se ve ACHATADO, convertido en óvalo — la imagen se deformó. Después (object-fit: cover), el círculo sigue siendo perfectamente REDONDO — cover escala manteniendo la proporción y recorta lo que sobra, pero nunca distorsiona."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .marco { width: 200px; height: 200px; border: 2px solid #7c3aed; background: #f3f4f6; }\n  img { width: 100%; height: 100%; display: block; object-fit: contain; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='150' cy='75' r='40' fill='%23dc2626'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "despues": "<style>\n  .marco { width: 200px; height: 200px; border: 2px solid #7c3aed; background: #f3f4f6; }\n  img { width: 100%; height: 100%; display: block; object-fit: cover; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='150' cy='75' r='40' fill='%23dc2626'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "nota": "Antes (object-fit: contain): se ve la imagen COMPLETA dentro del marco cuadrado, con franjas de fondo gris vacías arriba y abajo — nada se recorta, pero tampoco se llena toda la caja. Después (object-fit: cover): la imagen llena el marco cuadrado por completo, sin ninguna franja vacía — a cambio, los laterales de la imagen original quedan fuera de la vista."
}
```

## object-position: qué parte de la imagen se conserva

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .marco { width: 150px; height: 150px; border: 2px solid #7c3aed; overflow: hidden; }\n  img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: left; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='30' cy='75' r='25' fill='%23dc2626'/%3E%3Ccircle cx='270' cy='75' r='25' fill='%2316a34a'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "despues": "<style>\n  .marco { width: 150px; height: 150px; border: 2px solid #7c3aed; overflow: hidden; }\n  img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: right; }\n</style>\n<div class=\"marco\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23a5b4fc'/%3E%3Ccircle cx='30' cy='75' r='25' fill='%23dc2626'/%3E%3Ccircle cx='270' cy='75' r='25' fill='%2316a34a'/%3E%3C/svg%3E\" alt=\"\">\n</div>",
  "nota": "La misma imagen ancha con un círculo rojo cerca del borde izquierdo y uno verde cerca del derecho. Con object-position: left se conserva visible el círculo ROJO (el lado izquierdo de la imagen). Con object-position: right se conserva visible el VERDE (el lado derecho). object-fit decide cuánto recortar; object-position decide qué parte exacta de la imagen sobrevive al recorte."
}
```

## Lo que aspect-ratio y object-fit NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "aspect-ratio siempre fuerza esa proporción, sin importar qué más se declare",
      "realidad": "Se ignora por completo en cuanto width y height están los dos fijados explícitamente — solo actúa cuando al menos una de las dos dimensiones queda en auto."
    },
    {
      "mito": "object-fit: cover recorta la imagen siempre desde el centro, sin poder cambiarlo",
      "realidad": "Recorta desde el centro por defecto, pero object-position permite elegir exactamente qué parte de la imagen se conserva visible."
    },
    {
      "mito": "object-fit: contain y object-fit: cover hacen básicamente lo mismo",
      "realidad": "Son casi opuestos: contain garantiza ver la imagen ENTERA, dejando espacio vacío si hace falta; cover llena la caja entera, recortando lo que sobre."
    },
    {
      "mito": "aspect-ratio solo funciona en imágenes y vídeos",
      "realidad": "Funciona en cualquier elemento, incluidos divs completamente vacíos — muy útil para reservar espacio antes de que cargue una imagen real."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Fijar width Y height a la vez esperando que aspect-ratio siga aplicando.", "texto": "Se ignora en cuanto las dos dimensiones están fijadas explícitamente — hace falta dejar al menos una en auto." },
    { "titulo": "Usar object-fit: fill sin darse cuenta de que distorsiona la imagen.", "texto": "cover o contain casi siempre son mejores opciones por defecto — fill es la única que puede deformar la proporción original." },
    { "titulo": "No fijar ningún tamaño en la propia img al usar object-fit.", "texto": "Sin un width y height (o aspect-ratio) definidos en la imagen misma, object-fit no tiene ninguna caja de la que recortar o ajustar — no hace nada." },
    { "titulo": "Olvidar que aspect-ratio en una imagen se ignora sin al menos una dimensión fijada.", "texto": "Sin width ni height, la imagen simplemente usa su tamaño intrínseco real, como si aspect-ratio no estuviera escrito." }
  ]
}
```

## Ejercicios

1. Escribe una regla que reserve un espacio de proporción 4:3 para una imagen que aún no ha cargado, usando solo `aspect-ratio` y un ancho del 100%.
2. Explica por qué `aspect-ratio: 16 / 9` no tiene ningún efecto en una caja que ya tiene `width: 300px` y `height: 200px` fijados los dos.
3. Escribe una regla que haga que una imagen llene completamente una caja de 300×200px sin distorsionarse, aceptando que parte de la imagen podría recortarse.
4. Usando la misma imagen del ejercicio anterior, escribe una variante donde se vea la imagen completa aunque queden franjas vacías a los lados.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Understanding and setting aspect ratios",
      "descripcion": "Guía de MDN sobre aspect-ratio, object-fit y object-position: sintaxis completa, casos de uso reales y las restricciones al combinarlos con width/height explícitos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_sizing/Aspect_ratios",
      "etiqueta": "MDN"
    }
  ]
}
```
