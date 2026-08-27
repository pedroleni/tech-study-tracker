# Funciones responsivas: clamp, min y max

- **Módulo:** Diseño responsive
- **Slug:** `funciones-responsivas-clamp-min-y-max` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [Functions (web.dev)](https://web.dev/learn/css/functions) + [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) — ver `contenido/css/TEMARIO.md` #43

---

## Qué es y para qué sirve

`min()`, `max()` y `clamp()` calculan un valor comparando varias opciones en tiempo real, directamente en CSS. Con ellas, un ancho o un tamaño de letra pueden fluir de forma continua entre dos límites, sin necesitar un salto brusco en un breakpoint concreto — el valor cambia poco a poco, no de golpe.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita un valor que fluya, no que salte",
  "roles": [
    { "etiqueta": "Quien evita breakpoints innecesarios", "rol": "Que un tamaño escale de forma continua", "descripcion": "clamp() permite que un font-size crezca poco a poco con el ancho disponible, sin necesitar varios @media distintos solo para cambiar un número." },
    { "etiqueta": "Quien fija límites razonables", "rol": "Que un valor fluido no se dispare", "descripcion": "min() y max() ponen un techo o un suelo a un valor relativo, evitando que un ancho en % o vw crezca o encoja sin control." }
  ]
}
```

## El problema: un valor fluido, con límites

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Entre un valor fijo y uno puramente relativo",
  "contenido": "Un valor fijo (500px) nunca se adapta. Un valor puramente relativo (50%, 5vw) se adapta siempre, pero sin límite — puede volverse enorme o diminuto en los extremos. min(), max() y clamp() combinan ambos mundos: dejan que el valor fluya, pero dentro de un rango razonable definido a mano."
}
```

## calc(): mezclar unidades distintas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    width: calc(100% - 2rem);\n    padding: calc(1em + 8px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "width: calc(100% - 2rem);", "nota": "calc() permite restar (o sumar, multiplicar, dividir) valores en unidades DISTINTAS dentro de la misma expresión — aquí, un ancho relativo al padre menos un margen fijo en rem." }
  ]
}
```

## min() y max(): elegir el más pequeño o el más grande

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    width: min(100%, 300px);\n  }\n  .texto {\n    font-size: max(16px, 2.5vw);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "width: min(100%, 300px);", "nota": "min() evalúa TODOS los valores y usa el más pequeño de los dos, en tiempo real. Aquí, el ancho nunca supera 300px, pero puede ser menor si el 100% del contenedor es más estrecho." },
    { "fragmento": "font-size: max(16px, 2.5vw);", "nota": "max() hace lo contrario: usa el más grande. Aquí, el texto nunca baja de 16px, aunque 2.5vw sea más pequeño en pantallas estrechas." }
  ]
}
```

## Verlo en vivo: min() según el ancho del contenedor

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; font-family: sans-serif;\">\n  <style>\n    .caja { width: min(100%, 300px); background: #7c3aed; color: white; padding: 8px; border-radius: 6px; box-sizing: border-box; }\n  </style>\n  <div class=\"caja\">Caja</div>\n</div>",
  "despues": "<div style=\"width: 500px; font-family: sans-serif;\">\n  <style>\n    .caja { width: min(100%, 300px); background: #7c3aed; color: white; padding: 8px; border-radius: 6px; box-sizing: border-box; }\n  </style>\n  <div class=\"caja\">Caja</div>\n</div>",
  "nota": "La misma regla width: min(100%, 300px), en dos contenedores de distinto ancho. En 'antes' (200px de padre), el 100% vale 200px — menor que 300px, así que min() elige el 100% y la caja llena el contenedor. En 'después' (500px de padre), el 100% valdría 500px — mayor que 300px, así que min() elige el tope fijo: la caja se detiene en 300px y deja un hueco visible a la derecha."
}
```

## clamp(): mínimo, preferido y máximo en una sola función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h1 {\n    font-size: clamp(2rem, 1rem + 3vw, 3rem);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "clamp(2rem, 1rem + 3vw, 3rem)", "nota": "Tres argumentos: MÍNIMO, VALOR PREFERIDO, MÁXIMO. Por dentro equivale a max(2rem, min(1rem + 3vw, 3rem)) — el valor preferido fluye libremente, pero nunca por debajo del mínimo ni por encima del máximo." }
  ]
}
```

## Verlo en vivo: clamp() tocando los dos límites

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 100px; font-family: sans-serif;\">\n  <style>\n    .caja { padding: clamp(8px, 5%, 32px); background: #16a34a; color: white; border-radius: 6px; }\n  </style>\n  <div class=\"caja\">Caja</div>\n</div>",
  "despues": "<div style=\"width: 800px; font-family: sans-serif;\">\n  <style>\n    .caja { padding: clamp(8px, 5%, 32px); background: #16a34a; color: white; border-radius: 6px; }\n  </style>\n  <div class=\"caja\">Caja</div>\n</div>",
  "nota": "La misma regla padding: clamp(8px, 5%, 32px), en dos contenedores muy distintos. En 'antes' (100px de padre), el 5% valdría solo 5px — por debajo del mínimo, así que se aplica el MÍNIMO: 8px de padding. En 'después' (800px de padre), el 5% valdría 40px — por encima del máximo, así que se aplica el MÁXIMO: 32px. En ninguno de los dos casos se usa realmente el 5% tal cual: clamp() solo lo deja pasar cuando cae dentro del rango."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h1 {\n    font-size: clamp(2rem, 1rem + 3vw, 3rem);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "1rem + 3vw", "nota": "Combina una unidad fija (rem) con una relativa al viewport (vw), igual que en la tipografía fluida de la lección de mobile-first — así el zoom del navegador sigue funcionando, en vez de depender solo de vw." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja { width: clamp(200px, 50%, 600px); }\n</style>\n<div style=\"width: 300px;\">\n  <div class=\"caja\">Contenido</div>\n</div>",
  "opciones": [
    "150px, porque clamp() usa siempre el valor intermedio cuando está definido",
    "200px, porque el 50% (150px) cae por debajo del mínimo definido, así que se aplica el mínimo",
    "600px, porque clamp() siempre prioriza el valor máximo de los tres"
  ],
  "correcta": 1,
  "explicacion": "El 50% de 300px es 150px — por debajo del mínimo (200px). clamp() aplica el límite más cercano cuando el valor preferido cae fuera del rango, así que el resultado real es 200px, no 150px."
}
```

## Lo que estas funciones NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "clamp(), min() y max() sustituyen por completo a las media queries",
      "realidad": "Resuelven un problema distinto: un valor que fluye entre dos límites, no un cambio de ESTRUCTURA de layout (una columna a varias, por ejemplo)."
    },
    {
      "mito": "El segundo argumento de clamp() es siempre el que se aplica",
      "realidad": "Solo se aplica cuando cae DENTRO del rango entre el mínimo y el máximo — fuera de ese rango, se aplica el límite más cercano."
    },
    {
      "mito": "min() elige siempre el primer valor de la lista de argumentos",
      "realidad": "Evalúa TODOS los valores y elige el más pequeño en tiempo real — el orden de los argumentos no cambia el resultado."
    },
    {
      "mito": "Solo se pueden combinar unidades iguales dentro de estas funciones",
      "realidad": "calc(), min(), max() y clamp() aceptan mezclar unidades distintas libremente (px, %, rem, vw...) en la misma expresión."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el valor intermedio de clamp() con el valor que siempre se aplica.", "texto": "Solo se usa cuando cae dentro del rango entre el mínimo y el máximo." },
    { "titulo": "Esperar que clamp() sustituya breakpoints donde el layout cambia de estructura.", "texto": "Resuelve valores que fluyen, no reorganizaciones completas del layout." },
    { "titulo": "Olvidar que un % dentro de estas funciones depende del elemento padre.", "texto": "No del viewport, aunque el resultado final pueda parecer parecido en algunos casos." },
    { "titulo": "No combinar una unidad de viewport con una fija en tipografía fluida.", "texto": "Depender solo de vw bloquea el zoom del navegador de quien lee." }
  ]
}
```

## Ejercicios

1. Escribe una regla que use `min()` para que un ancho nunca supere `400px`, pero pueda ser menor si el contenedor es más estrecho.
2. Escribe una regla `clamp()` para un `font-size` con mínimo `1rem`, preferido `4vw`, máximo `2.5rem`.
3. Explica qué ocurre cuando el valor intermedio de un `clamp()` cae POR ENCIMA del máximo definido.
4. Reescribe `clamp(1rem, 5vw, 3rem)` usando `max()` y `min()` combinados, sin usar `clamp()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Functions",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre min(), max() y clamp(): sintaxis, equivalencia interna de clamp() y tipografía fluida.",
      "url": "https://web.dev/learn/css/functions",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Values and units",
      "descripcion": "Guía de MDN sobre unidades absolutas y relativas: px, em, rem, %, vw/vh/vmin/vmax, y las funciones calc(), min(), max() y clamp().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units",
      "etiqueta": "MDN"
    }
  ]
}
```
