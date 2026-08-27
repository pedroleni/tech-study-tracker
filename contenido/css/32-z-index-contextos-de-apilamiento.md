# z-index y contextos de apilamiento

- **Módulo:** Layout
- **Slug:** `z-index-y-contextos-de-apilamiento` (autogenerado del título)
- **Orden:** 155
- **Fuentes:** [Positioning (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning) + [Stacking context (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context) — ver `contenido/css/TEMARIO.md` #32

---

## Qué es y para qué sirve

`z-index` decide qué elemento se dibuja encima de cuál cuando se superponen — un valor mayor sube en la pila, uno menor baja. Hasta ahí, sencillo. Lo que sorprende a casi todo el mundo la primera vez: `z-index` NUNCA compara toda la página de golpe. Solo compara elementos dentro del mismo contexto de apilamiento — y `opacity`, `transform`, `filter` y varias propiedades más crean uno nuevo, aunque nadie haya escrito la palabra `z-index` cerca.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se topa con esto al depurar un z-index que \"no funciona\"",
  "roles": [
    { "etiqueta": "Quien sube z-index sin resultado", "rol": "Entender por qué 9999 a veces pierde contra un 2", "descripcion": "Si el ancestro del elemento ya quedó atrapado en un contexto de apilamiento de bajo nivel, ningún z-index del hijo, por alto que sea, puede escapar de ahí." },
    { "etiqueta": "Quien anima con transform u opacity", "rol": "Saber que eso también crea un contexto nuevo", "descripcion": "Una animación de hover con transform o una transición de opacity crea un contexto de apilamiento sin que nadie lo pidiera explícitamente." },
    { "etiqueta": "Quien construye modales flotantes", "rol": "Evitar que queden atrapados detrás de otro elemento", "descripcion": "Saber qué contenedores crean contextos de apilamiento evita el clásico \"mi modal aparece detrás del header\"." }
  ]
}
```

## z-index compara dentro de un mismo contexto

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; font-family: sans-serif; height: 140px;\">\n  <div style=\"position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; background: #16a34a; color: white; padding: 4px; z-index: 1;\">z-index: 1</div>\n  <div style=\"position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; background: #dc2626; color: white; padding: 4px; z-index: 2;\">z-index: 2</div>\n</div>",
  "despues": "<div style=\"position: relative; font-family: sans-serif; height: 140px;\">\n  <div style=\"position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; background: #16a34a; color: white; padding: 4px; z-index: 3;\">z-index: 3</div>\n  <div style=\"position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; background: #dc2626; color: white; padding: 4px; z-index: 2;\">z-index: 2</div>\n</div>",
  "nota": "Dos cajas superpuestas, en el mismo contexto de apilamiento (las dos son hijas directas del mismo div relative). Antes: la roja (z-index: 2) queda por encima de la verde (z-index: 1). Después: basta con subir la verde a z-index: 3 para que pase a estar por encima de la roja. Comparación directa y simple — el comportamiento esperado, sin ninguna trampa todavía."
}
```

## Lo que crea un contexto de apilamiento nuevo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { position: relative; z-index: 1; }\n  .b { opacity: 0.9; }\n  .c { transform: scale(1); }\n  .d { filter: blur(0); }\n  .e { isolation: isolate; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { position: relative; z-index: 1; }", "nota": "position (distinto de static) CON un z-index explícito (no auto) crea un contexto de apilamiento nuevo." },
    { "fragmento": ".b { opacity: 0.9; }", "nota": "Cualquier opacity menor que 1 crea un contexto de apilamiento nuevo — sin necesitar position ni z-index en absoluto." },
    { "fragmento": ".c { transform: scale(1); }", "nota": "transform (con cualquier valor distinto de none) también crea uno — muy relevante en animaciones y efectos de hover." },
    { "fragmento": ".d { filter: blur(0); }", "nota": "filter (y backdrop-filter) hacen lo mismo — presentes en efectos de desenfoque o ajuste de color." },
    { "fragmento": ".e { isolation: isolate; }", "nota": "isolation: isolate existe justo para esto: crear un contexto de apilamiento a propósito, sin efectos visuales secundarios como opacity o transform." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "z-index nunca compara toda la página de golpe",
  "contenido": "Los contextos de apilamiento se tratan como una unidad atómica dentro de su propio padre. El z-index de un elemento dentro de un contexto solo tiene sentido DENTRO de ese contexto — para comparar con algo de fuera, lo que realmente se compara es el contexto completo (como un bloque), no el z-index individual de ningún elemento de dentro."
}
```

## La trampa clásica: un hijo con z-index enorme, atrapado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; font-family: sans-serif; height: 140px;\">\n  <div>\n    <div style=\"position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; background: #16a34a; color: white; padding: 4px; z-index: 9999;\">hijo z-index: 9999</div>\n  </div>\n  <div style=\"position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; background: #dc2626; color: white; padding: 4px; z-index: 2;\">hermano z-index: 2</div>\n</div>",
  "despues": "<div style=\"position: relative; font-family: sans-serif; height: 140px;\">\n  <div style=\"position: relative; opacity: 0.99; z-index: 1;\">\n    <div style=\"position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; background: #16a34a; color: white; padding: 4px; z-index: 9999;\">hijo z-index: 9999</div>\n  </div>\n  <div style=\"position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; background: #dc2626; color: white; padding: 4px; z-index: 2;\">hermano z-index: 2</div>\n</div>",
  "nota": "El hijo verde tiene z-index: 9999 en los dos casos, sin cambiar ni un número. Antes: su padre no crea contexto de apilamiento propio, así que el 9999 se compara DIRECTAMENTE contra el 2 del hermano rojo — gana el verde. Después: el padre gana opacity: 0.99 y z-index: 1 — se convierte en su PROPIO contexto, con nivel 1. El 9999 queda atrapado ahí dentro; lo que se compara contra el rojo es ese nivel 1 del padre, que pierde contra el 2 — ahora gana el rojo, aunque el verde siga diciendo 9999."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .a { position: relative; z-index: 3; }\n  .b { position: relative; opacity: 0.9; z-index: 1; }\n  .b .c { position: relative; z-index: 500; }\n</style>",
  "opciones": [
    "El elemento .c (z-index: 500) se dibuja por encima de .a, porque 500 es mucho mayor que 3",
    ".a se dibuja por encima de .c, porque .b crea su propio contexto de apilamiento con nivel 1 — el 500 de .c nunca se compara directamente con el 3 de .a",
    "Es imposible saberlo sin ver también el HTML completo"
  ],
  "correcta": 1,
  "explicacion": ".b tiene opacity: 0.9, así que crea un contexto de apilamiento propio, con nivel 1 en el contexto raíz (el mismo donde vive .a, con nivel 3). El z-index: 500 de .c, hijo de .b, solo tiene sentido DENTRO del contexto de .b — lo que se compara contra .a es el nivel 1 de todo el contexto de .b, que pierde contra el 3 de .a."
}
```

## Lo que z-index NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un z-index muy alto (como 9999) siempre gana, sin importar dónde esté el elemento",
      "realidad": "Si su ancestro creó un contexto de apilamiento con un nivel bajo, ese z-index enorme nunca llega a compararse directamente con elementos de fuera — queda atrapado dentro."
    },
    {
      "mito": "Solo position + z-index crean un nuevo contexto de apilamiento",
      "realidad": "opacity menor que 1, transform, filter, isolation: isolate y varias propiedades más también crean uno, sin necesitar ningún z-index explícito."
    },
    {
      "mito": "Los contextos de apilamiento son una curiosidad teórica que rara vez importa en la práctica",
      "realidad": "opacity y transform son extremadamente comunes en animaciones y efectos de hover — crear contextos de apilamiento sin darse cuenta es una causa real y frecuente de \"mi z-index no funciona\"."
    },
    {
      "mito": "z-index compara todos los elementos de la página entre sí, sin excepción",
      "realidad": "Solo compara elementos dentro del MISMO contexto de apilamiento — comparar un z-index de un contexto con uno de otro contexto distinto no tiene ningún sentido directo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Subir el z-index de un elemento cada vez más alto sin ningún resultado.", "texto": "Sin darse cuenta de que su padre ya quedó atrapado en un contexto de apilamiento de bajo nivel — el problema está más arriba en el árbol, no en ese elemento." },
    { "titulo": "Añadir opacity, transform o filter a un contenedor sin saber que crea un contexto nuevo.", "texto": "Efectos inesperados en el z-index de sus hijos, sin ningún cambio aparente en el propio código de esos hijos." },
    { "titulo": "Pensar que basta con position: relative para que z-index compare de verdad.", "texto": "Sin un z-index explícito distinto de auto, position: relative por sí solo NO crea un nuevo contexto de apilamiento." },
    { "titulo": "No usar las herramientas de desarrollador para inspeccionar el contexto real.", "texto": "El propio inspector del navegador suele mostrar qué contexto de apilamiento envuelve realmente a un elemento problemático." }
  ]
}
```

## Ejercicios

1. Explica por qué un elemento con `z-index: 9999` puede seguir apareciendo detrás de otro con `z-index: 2`, sin que ninguno de los dos valores esté mal escrito.
2. Nombra al menos tres propiedades de CSS, además de `position` + `z-index`, que crean un nuevo contexto de apilamiento.
3. Dado un padre con `opacity: 0.9; z-index: 1;` y un hijo dentro con `z-index: 500`, explica con qué se compara realmente ese `z-index: 500` frente a un elemento del mismo nivel que el padre.
4. Explica por qué `position: relative` por sí solo, sin un `z-index` explícito, no crea un nuevo contexto de apilamiento.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Positioning",
      "descripcion": "Guía de MDN con la introducción básica a z-index: qué es el eje z y cómo compara valores entre elementos posicionados.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Stacking context",
      "descripcion": "Referencia de MDN sobre contextos de apilamiento: qué propiedades los crean y el ejemplo completo de un hijo con z-index alto atrapado dentro del contexto de su padre.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context",
      "etiqueta": "MDN"
    }
  ]
}
```
