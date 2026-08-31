# Transformaciones: translate, rotate y scale

- **Módulo:** Movimiento e interactividad
- **Slug:** `transformaciones-translate-rotate-y-scale` (autogenerado del título)
- **Orden:** 215
- **Fuentes:** [Using CSS transforms (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms) — ver `contenido/css/TEMARIO.md` #44

---

## Qué es y para qué sirve

`transform` mueve, gira o escala un elemento sin tocar el flujo normal del documento — a diferencia de cambiar `top`/`left` o `width`/`height`, no obliga al navegador a recalcular el layout de todo lo demás. Esto abre el módulo de movimiento e interactividad: empieza aquí porque casi cualquier animación o transición parte de una transformación.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién mueve, gira o escala sin afectar el layout",
  "roles": [
    { "etiqueta": "Quien anima sin afectar el layout", "rol": "Mover un elemento sin reflow", "descripcion": "transform no dispara un recálculo del layout de la página, a diferencia de animar top/left o width/height — más barato de animar." },
    { "etiqueta": "Quien construye microinteracciones", "rol": "Hover, focus y estados activos", "descripcion": "Un botón que se agranda ligeramente al pasar el ratón, o una tarjeta que gira un poco, son transformaciones aplicadas sobre un estado." },
    { "etiqueta": "Quien combina varias transformaciones", "rol": "Entender en qué orden se aplican", "descripcion": "translate y rotate combinados no dan el mismo resultado en un orden que en otro — no es un detalle menor." }
  ]
}
```

## translate: mover sin afectar el flujo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    transform: translateX(150px);\n  }\n  .otra {\n    transform: translate(50px, 20px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transform: translateX(150px);", "nota": "Mueve el elemento 150px hacia la derecha — el espacio que ocupaba originalmente sigue reservado en el flujo, no lo cede a los elementos vecinos." },
    { "fragmento": "transform: translate(50px, 20px);", "nota": "translate() con dos valores mueve en los dos ejes a la vez: 50px en horizontal, 20px en vertical." }
  ]
}
```

## Verlo en vivo: translate

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 100px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 25px; left: 20px; width: 50px; height: 50px; background: #7c3aed; border-radius: 8px;\"></div>\n</div>",
  "despues": "<div style=\"position: relative; height: 100px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 25px; left: 20px; width: 50px; height: 50px; background: #7c3aed; border-radius: 8px; transform: translate(120px, 15px);\"></div>\n</div>",
  "nota": "Antes: la caja en su posición original. Después: la MISMA caja, con transform: translate(120px, 15px) — se desplaza 120px a la derecha y 15px hacia abajo, pero el espacio que ocupaba en el flujo original no cambia (fíjate en que el fondo rayado no se reorganiza)."
}
```

## rotate: girar sobre un punto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    transform: rotate(30deg);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transform: rotate(30deg);", "nota": "Gira el elemento 30 grados en el sentido horario, alrededor de su transform-origin — por defecto, el CENTRO exacto del elemento (50% 50%)." }
  ]
}
```

## Verlo en vivo: rotate

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 25px; font-family: sans-serif;\">\n  <div style=\"width: 70px; height: 70px; background: #16a34a; border-radius: 8px;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 25px; font-family: sans-serif;\">\n  <div style=\"width: 70px; height: 70px; background: #16a34a; border-radius: 8px; transform: rotate(30deg);\"></div>\n</div>",
  "nota": "Antes: la caja sin girar. Después: la misma caja con transform: rotate(30deg) — gira 30 grados alrededor de su propio centro, que es el transform-origin por defecto."
}
```

## scale: agrandar o encoger

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    transform: scale(1.4);\n  }\n  .otra {\n    transform: scale(0.6);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transform: scale(1.4);", "nota": "Un valor mayor que 1 agranda el elemento — aquí, un 40% más grande en ambos ejes, sin reservar más espacio real en el flujo." },
    { "fragmento": "transform: scale(0.6);", "nota": "Un valor menor que 1 lo encoge — aquí, al 60% de su tamaño original." }
  ]
}
```

## Verlo en vivo: scale

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; align-items: center; height: 120px; font-family: sans-serif;\">\n  <div style=\"width: 60px; height: 60px; background: #dc2626; border-radius: 50%;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; align-items: center; height: 120px; font-family: sans-serif;\">\n  <div style=\"width: 60px; height: 60px; background: #dc2626; border-radius: 50%; transform: scale(1.6);\"></div>\n</div>",
  "nota": "Antes: el círculo a su tamaño original (60px). Después: transform: scale(1.6) lo agranda un 60% desde su centro — el navegador no reserva ese espacio extra en el flujo, así que puede superponerse a elementos vecinos."
}
```

## Propiedades individuales frente al shorthand transform

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja-a {\n    transform: translateX(50px) rotate(20deg);\n  }\n\n  .caja-b {\n    translate: 50px 0;\n    rotate: 20deg;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".caja-b {\n    translate: 50px 0;\n    rotate: 20deg;\n  }", "nota": "translate, rotate y scale también existen como propiedades INDEPENDIENTES, no solo como funciones dentro de transform — permiten animar cada una por separado en CSS, sin pisarse entre sí." }
  ]
}
```

## Combinar varias funciones: el orden importa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja-a {\n    transform: translateX(80px) rotate(45deg);\n  }\n\n  .caja-b {\n    transform: rotate(45deg) translateX(80px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".caja-a {\n    transform: translateX(80px) rotate(45deg);\n  }", "nota": "Dentro de transform, las funciones se aplican de DERECHA A IZQUIERDA. Aquí, rotate actúa primero sobre la caja, y translateX la desplaza después, sobre el eje ORIGINAL (sin girar)." },
    { "fragmento": ".caja-b {\n    transform: rotate(45deg) translateX(80px);\n  }", "nota": "Mismas dos funciones, orden invertido: aquí translateX actúa primero, y ese desplazamiento queda luego arrastrado por el rotate que se aplica encima. El resultado final es distinto al de .caja-a." }
  ]
}
```

## Verlo en vivo: el mismo par de funciones, orden distinto

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 160px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 55px; left: 30px; width: 50px; height: 50px; background: #7c3aed; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75em; transform: translateX(80px) rotate(45deg);\">A</div>\n</div>",
  "despues": "<div style=\"position: relative; height: 160px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 55px; left: 30px; width: 50px; height: 50px; background: #7c3aed; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75em; transform: rotate(45deg) translateX(80px);\">A</div>\n</div>",
  "nota": "La misma caja, las mismas dos funciones — translateX(80px) y rotate(45deg) — solo en orden distinto. Antes: translateX(80px) rotate(45deg) (rotate actúa primero, translateX mueve después en el eje original). Después: rotate(45deg) translateX(80px) (translateX actúa primero, y ese desplazamiento queda arrastrado por el giro posterior). La caja termina en una posición claramente distinta en cada caso, solo por el orden."
}
```

## transform-origin: cambiar el punto de pivote

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 130px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 40px; left: 100px; width: 60px; height: 60px; background: #ea580c; border-radius: 6px; transform: rotate(35deg);\"></div>\n</div>",
  "despues": "<div style=\"position: relative; height: 130px; font-family: sans-serif; background: repeating-linear-gradient(90deg, #f9fafb, #f9fafb 24px, #e5e7eb 24px, #e5e7eb 25px);\">\n  <div style=\"position: absolute; top: 40px; left: 100px; width: 60px; height: 60px; background: #ea580c; border-radius: 6px; transform-origin: top left; transform: rotate(35deg);\"></div>\n</div>",
  "nota": "El mismo rotate(35deg), con distinto transform-origin. Antes: origen por defecto (centro) — la caja gira sobre su propio centro, quedándose en el mismo sitio aproximado. Después: transform-origin: top left — la caja pivota desde su esquina superior izquierda, así que el giro la desplaza visiblemente hacia otra zona, no solo la inclina."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .a { transform: translateX(100px) rotate(90deg); }\n  .b { transform: rotate(90deg) translateX(100px); }\n</style>",
  "opciones": [
    "Dan exactamente el mismo resultado visual — el orden de las funciones dentro de transform no importa",
    "Dan resultados distintos — transform aplica las funciones de derecha a izquierda, así que cuál actúa primero cambia el resultado final",
    "Solo .a es válido; .b lanza un error porque rotate no puede ir antes que translateX"
  ],
  "correcta": 1,
  "explicacion": "Las funciones dentro de transform se aplican de derecha a izquierda. En .a, rotate actúa primero y translateX desplaza después sobre el eje sin girar. En .b, translateX actúa primero y ese desplazamiento queda arrastrado por el rotate posterior. El orden cambia el resultado final."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Transformaciones 3D y por qué son baratas de animar",
  "contenido": "Con perspective y transform-style: preserve-3d se pueden construir escenas 3D reales (un cubo que gira en el espacio, por ejemplo) — un tema amplio que queda fuera del alcance de esta lección. Un dato práctico que sí aplica siempre: a diferencia de animar propiedades como top, left, width o height, las transformaciones no obligan al navegador a recalcular el layout de la página — es la razón por la que se recomiendan para animaciones fluidas."
}
```

## Lo que transform NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Mover un elemento con translate() libera el espacio que ocupaba antes",
      "realidad": "El espacio original queda reservado en el flujo — translate() solo desplaza la representación visual, sin afectar cómo se colocan los elementos vecinos."
    },
    {
      "mito": "El orden de las funciones dentro de transform no cambia el resultado",
      "realidad": "Se aplican de derecha a izquierda — combinar translate y rotate en un orden distinto produce un resultado visual distinto."
    },
    {
      "mito": "transform-origin siempre es la esquina superior izquierda del elemento",
      "realidad": "El valor por defecto es el CENTRO exacto (50% 50%) — hay que cambiarlo explícitamente para pivotar desde otro punto."
    },
    {
      "mito": "translate, rotate y scale como propiedades independientes son solo un alias de transform",
      "realidad": "Son propiedades separadas que se pueden animar cada una por su cuenta, sin que una transición en una pise el valor de las otras."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que translate() reorganice el layout de los elementos vecinos.", "texto": "El espacio original queda reservado — solo cambia la posición visual." },
    { "titulo": "No tener en cuenta el orden al combinar varias funciones.", "texto": "translate y rotate combinados no dan el mismo resultado en un orden que en otro." },
    { "titulo": "Olvidar que transform-origin cambia el punto de pivote de rotate y scale.", "texto": "El valor por defecto es el centro — cambiarlo altera bastante el resultado visual." },
    { "titulo": "Animar top/left cuando transform ya resolvería lo mismo más barato.", "texto": "transform no dispara un recálculo de layout, a diferencia de esas propiedades." }
  ]
}
```

## Ejercicios

1. Escribe una regla que mueva un elemento 40px a la derecha y 10px hacia arriba con `translate()`.
2. Escribe dos reglas con las mismas dos funciones (`rotate` y `scale`) en orden distinto, y explica por qué el resultado visual puede diferir.
3. Escribe una regla `rotate(60deg)` con `transform-origin: bottom right`, y explica cómo cambia respecto al origen por defecto.
4. Explica la diferencia entre `transform: translateX(50px);` y la propiedad independiente `translate: 50px;`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Mueve esta caja 40px a la derecha y 10px hacia arriba con translate() (ejercicio 1). Prueba rotate(60deg) con transform-origin: bottom right en la segunda (ejercicio 3).",
  "html": "<div class=\"caja-translate\">translate()</div>\n<div class=\"caja-rotate\">rotate()</div>",
  "css": ".caja-translate, .caja-rotate { width: 100px; height: 60px; background: #7c3aed; color: white; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }",
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
      "titulo": "Using CSS transforms",
      "descripcion": "Guía de MDN sobre transform, translate/rotate/scale/skew, transform-origin, el orden de aplicación y una introducción a las transformaciones 3D.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms",
      "etiqueta": "MDN"
    }
  ]
}
```
