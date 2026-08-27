# Fondos: colores, imágenes y gradientes

- **Módulo:** Color, fondos y bordes
- **Slug:** `fondos-colores-imagenes-y-gradientes` (autogenerado del título)
- **Orden:** 95
- **Fuentes:** [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) + [Backgrounds (web.dev)](https://web.dev/learn/css/backgrounds) — ver `contenido/css/TEMARIO.md` #20

---

## Qué es y para qué sirve

Un fondo puede ser un color plano, una imagen, un degradado, o varias capas de las tres cosas a la vez. `background-image` no reemplaza al color de fondo — se dibuja ENCIMA de `background-color`, y si la imagen no carga (o tarda), ese color sigue ahí de respaldo. Repetición, tamaño, posición y capas: cuatro decisiones que cambian por completo cómo se ve la misma imagen.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién decide cada una de estas cuatro cosas a propósito",
  "roles": [
    { "etiqueta": "Quien construye una sección de portada", "rol": "Que una foto cubra toda la caja sin deformarse", "descripcion": "background-size: cover llena el espacio disponible manteniendo la proporción original, recortando lo que sobre en vez de estirar la imagen." },
    { "etiqueta": "Quien usa un patrón decorativo", "rol": "Repetir un icono pequeño para rellenar un área grande", "descripcion": "background-repeat convierte una imagen diminuta en un patrón continuo, sin tener que generar una imagen grande a mano." },
    { "etiqueta": "Quien apila varias imágenes de fondo", "rol": "Controlar qué capa queda arriba de cuál", "descripcion": "El orden en la lista de background-image decide qué se ve por encima de qué — la primera queda arriba, la última, al fondo." }
  ]
}
```

## background-color: el respaldo que siempre debería estar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    padding: 16px;\n    background-color: #567895;\n    background-image: url(\"imagen-que-podria-no-cargar.jpg\");\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "background-color: #567895;", "nota": "Se extiende bajo el content Y el padding de la caja — no solo bajo el texto. Si la imagen tarda en cargar o falla, este color sigue siendo el fondo visible, manteniendo el texto legible." }
  ]
}
```

## Repetir un patrón o mostrarlo una sola vez

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 220px; height: 100px; border: 2px solid #7c3aed; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27%3E%3Ccircle cx=%2710%27 cy=%2710%27 r=%274%27 fill=%27%237c3aed%27/%3E%3C/svg%3E'); background-repeat: repeat;\"></div>",
  "despues": "<div style=\"width: 220px; height: 100px; border: 2px solid #7c3aed; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27%3E%3Ccircle cx=%2710%27 cy=%2710%27 r=%274%27 fill=%27%237c3aed%27/%3E%3C/svg%3E'); background-repeat: no-repeat;\"></div>",
  "nota": "La misma imagen diminuta (un punto de 20×20px) en los dos casos. Antes (repeat, el valor por defecto): el punto se repite para rellenar toda la caja, como un patrón. Después (no-repeat): se muestra una sola vez, en la esquina superior izquierda, dejando el resto sin imagen."
}
```

## background-size: cover frente a contain

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "cover llena, contain muestra todo",
  "contenido": "cover agranda la imagen hasta que cubra la caja entera, manteniendo su proporción — puede recortar parte de la imagen fuera de la vista. contain agranda la imagen hasta que quepa entera dentro de la caja — puede dejar huecos vacíos si la proporción no coincide. Nunca deforman la imagen: la diferencia es si se prioriza cubrir todo o mostrarlo todo."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 200px; border: 2px solid #7c3aed; background-color: #f3f4f6; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27150%27%3E%3Crect width=%27300%27 height=%27150%27 fill=%27%23a5b4fc%27/%3E%3Ccircle cx=%27150%27 cy=%2775%27 r=%2740%27 fill=%27%23dc2626%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: center; background-size: contain;\"></div>",
  "despues": "<div style=\"width: 200px; height: 200px; border: 2px solid #7c3aed; background-color: #f3f4f6; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27150%27%3E%3Crect width=%27300%27 height=%27150%27 fill=%27%23a5b4fc%27/%3E%3Ccircle cx=%27150%27 cy=%2775%27 r=%2740%27 fill=%27%23dc2626%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: center; background-size: cover;\"></div>",
  "nota": "Misma imagen rectangular (300×150) dentro de la misma caja cuadrada (200×200) en los dos casos. Antes (contain): se ve la imagen COMPLETA, con franjas del background-color gris visibles arriba y abajo. Después (cover): la imagen llena la caja cuadrada por completo, sin ninguna franja — a cambio, los laterales quedan fuera de la vista."
}
```

## background-position: qué parte se muestra

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 120px; border: 2px solid #7c3aed; background-color: #ede9fe; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2730%27%3E%3Ccircle cx=%2715%27 cy=%2715%27 r=%2710%27 fill=%27%23dc2626%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: top left;\"></div>",
  "despues": "<div style=\"width: 200px; height: 120px; border: 2px solid #7c3aed; background-color: #ede9fe; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2730%27%3E%3Ccircle cx=%2715%27 cy=%2715%27 r=%2710%27 fill=%27%23dc2626%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: bottom right;\"></div>",
  "nota": "La misma imagen (un círculo rojo), sin repetirse, en los dos casos. Antes (top left): aparece en la esquina superior izquierda. Después (bottom right): la misma imagen se desplaza a la esquina inferior derecha — background-position no cambia la imagen, solo dónde se ancla dentro de la caja."
}
```

## Degradados: un background-image sin archivo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .lineal {\n    background-image: linear-gradient(105deg, #7c3aed 39%, #16a34a 96%);\n  }\n\n  .radial {\n    background-image: radial-gradient(circle, #7c3aed 39%, #16a34a 96%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".lineal {\n    background-image: linear-gradient(105deg, #7c3aed 39%, #16a34a 96%);\n  }", "nota": "105deg es el ángulo de la transición — un degradado en línea recta desde un color a otro. Se comporta como cualquier background-image: acepta repeat, position y size igual que una imagen normal." },
    { "fragmento": ".radial {\n    background-image: radial-gradient(circle, #7c3aed 39%, #16a34a 96%);\n  }", "nota": "En vez de una línea recta, la transición parte de un punto central y se expande en círculos concéntricos hacia fuera." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 100px; background-image: linear-gradient(45deg, #7c3aed, #fbbf24);\"></div>",
  "despues": "<div style=\"width: 200px; height: 100px; background-image: linear-gradient(135deg, #7c3aed, #fbbf24);\"></div>",
  "nota": "Los mismos dos colores en los dos casos — solo cambia el ángulo, de 45deg a 135deg. La dirección de la transición gira 90 grados: de \"esquina inferior izquierda hacia arriba a la derecha\" a \"esquina superior izquierda hacia abajo a la derecha\"."
}
```

## Varias imágenes en capas: la primera queda arriba

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 120px; background-image: linear-gradient(135deg, #7c3aed, #16a34a), url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Ctext x=%2730%27 y=%2745%27 font-size=%2740%27 text-anchor=%27middle%27 fill=%27white%27%3E★%3C/text%3E%3C/svg%3E'); background-repeat: no-repeat, no-repeat; background-position: center, center;\"></div>",
  "despues": "<div style=\"width: 200px; height: 120px; background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Ctext x=%2730%27 y=%2745%27 font-size=%2740%27 text-anchor=%27middle%27 fill=%27white%27%3E★%3C/text%3E%3C/svg%3E'), linear-gradient(135deg, #7c3aed, #16a34a); background-repeat: no-repeat, no-repeat; background-position: center, center;\"></div>",
  "nota": "Las dos mismas imágenes (una estrella y un degradado), solo con el ORDEN invertido en la lista. Antes: el degradado va primero en la lista, así que queda ARRIBA — tapa la estrella por completo, que se oculta debajo, opaca. Después: la estrella va primero, así que queda arriba, visible sobre el degradado. La primera imagen de la lista siempre es la de más arriba; la última, la del fondo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    width: 100px;\n    height: 200px;\n    background-image: url(\"foto-ancha-300x150.jpg\");\n    background-size: cover;\n    background-repeat: no-repeat;\n  }\n</style>\n<div class=\"caja\"></div>",
  "opciones": [
    "La imagen se ve completa, sin recortar, aunque deje huecos vacíos",
    "La imagen se estira y se ve deformada, sin mantener su proporción original",
    "La imagen cubre toda la caja sin dejar huecos, pero parte de ella queda recortada fuera de la vista"
  ],
  "correcta": 2,
  "explicacion": "background-size: cover agranda la imagen manteniendo su proporción hasta cubrir la caja entera — nunca deja huecos ni deforma la imagen, pero en una caja con proporción muy distinta a la de la imagen, buena parte de ella queda fuera de la vista, recortada."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un fondo es decorativo, nunca el único lugar de un dato importante",
  "contenido": "Los lectores de pantalla no leen el contenido de una imagen de fondo — cualquier información real (un texto, un número, una instrucción) tiene que vivir en el HTML, nunca solo dentro de un background-image. Y siempre conviene declarar un background-color de respaldo, para que el contraste del texto se mantenga legible aunque la imagen no llegue a cargar."
}
```

## Lo que los fondos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "background-size: cover siempre muestra la imagen completa",
      "realidad": "cover llena la caja entera pero puede recortar partes de la imagen que no quepan — para verla completa sin recortar hace falta contain, no cover."
    },
    {
      "mito": "background-repeat: space y round hacen lo mismo que repeat",
      "realidad": "space añade espacio en blanco entre copias para que ninguna se corte; round estira las copias para que encajen exactas — ninguna de las dos corta una copia a la mitad, como sí puede pasar con repeat."
    },
    {
      "mito": "El último background-image de la lista queda arriba de todo",
      "realidad": "Es justo al revés — el PRIMERO de la lista queda arriba, y el último queda más abajo, sirviendo de fondo final."
    },
    {
      "mito": "Un elemento sin background-color visible no tiene ningún fondo",
      "realidad": "Su valor por defecto es transparent, no \"sin fondo\" — deja ver lo que hay detrás, algo distinto de no tener la propiedad definida en absoluto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar solo background-image sin un background-color de respaldo.", "texto": "Si la imagen no llega a cargar, el texto puede quedar ilegible sobre un fondo blanco por defecto — el color de respaldo evita ese problema." },
    { "titulo": "Confundir cover con contain esperando ver siempre la imagen completa.", "texto": "cover prioriza llenar la caja, aunque recorte — contain prioriza mostrar la imagen entera, aunque deje huecos." },
    { "titulo": "Meter contenido importante dentro de una imagen de fondo.", "texto": "Los lectores de pantalla no la leen — cualquier información real debe vivir en el HTML, no solo en el background." },
    { "titulo": "Olvidar que el orden de las imágenes en la lista determina las capas.", "texto": "La primera queda arriba, la última queda abajo — invertir el orden puede esconder por completo una de las imágenes." }
  ]
}
```

## Ejercicios

1. Escribe una regla que use un patrón repetido como fondo, pero solo en el eje horizontal.
2. Escribe una regla con `background-size: cover` que llene por completo una caja de 300×150px con una imagen de proporción distinta.
3. Escribe una regla con dos imágenes de fondo en capas, donde la segunda de la lista quede visible por debajo de la primera.
4. Explica por qué siempre conviene declarar un `background-color` de respaldo junto a un `background-image`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Backgrounds and borders",
      "descripcion": "Guía de MDN sobre background-color, background-image, repetición, tamaño, posición, degradados y el shorthand background.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Backgrounds",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre las mismas propiedades fundamentales de fondo.",
      "url": "https://web.dev/learn/css/backgrounds",
      "etiqueta": "web.dev"
    }
  ]
}
```
