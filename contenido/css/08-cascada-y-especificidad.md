# La cascada y la especificidad

- **Módulo:** Fundamentos de CSS
- **Slug:** `la-cascada-y-la-especificidad` (autogenerado del título)
- **Orden:** 35
- **Fuentes:** [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [The cascade](https://web.dev/learn/css/the-cascade) + [Specificity (web.dev)](https://web.dev/learn/css/specificity) — ver `contenido/css/TEMARIO.md` #8

---

## Qué es y para qué sirve

Cuando dos reglas de CSS le dicen cosas distintas al mismo elemento, algo tiene que decidir cuál gana. Ese algoritmo es la cascada, y evalúa tres factores en orden: primero el origen y la importancia (`!important`), después la especificidad (qué tan preciso es el selector), y solo si hay empate en ambos, el orden en el que aparecen las reglas. Entender este orden es la diferencia entre "el CSS no me hace caso" y saber exactamente por qué.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita entender la cascada de verdad",
  "roles": [
    { "etiqueta": "Quien depura un estilo que no se aplica", "rol": "Saber por qué otra regla está ganando", "descripcion": "El 90% de \"mi CSS no funciona\" es en realidad \"otra regla con más especificidad o declarada después está ganando\" — no un bug del navegador." },
    { "etiqueta": "Quien mantiene una hoja de estilos", "rol": "Evitar guerras de especificidad", "descripcion": "Saber cuándo una clase basta y cuándo un id se convierte en un problema ayuda a que el CSS siga siendo fácil de sobrescribir a futuro, no una escalada de !important." },
    { "etiqueta": "Quien usa :is() y :where() a diario", "rol": "Saber cuál de los dos conviene en cada caso", "descripcion": ":where() vale siempre cero en especificidad, :is() adopta la de su argumento más específico — confundirlos rompe la prioridad esperada de un estilo." }
  ]
}
```

## Tres factores, en este orden

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Origen e importancia, después especificidad, y el orden solo como desempate",
  "contenido": "Cuando dos declaraciones compiten por la misma propiedad en el mismo elemento: 1) gana el origen/importancia más alto (un !important de autor gana a un estilo normal); 2) si empatan, gana la especificidad más alta (un id gana a una clase); 3) si también empatan en especificidad, gana la regla declarada MÁS TARDE en el código."
}
```

## El orden como desempate

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h1 {\n    color: red;\n  }\n\n  h1 {\n    color: blue;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "h1 {\n    color: blue;\n  }", "nota": "Misma especificidad exacta que la regla de arriba (0-0-1 las dos). Con un empate total, gana la que aparece MÁS TARDE en el archivo — el h1 termina azul, no rojo." }
  ]
}
```

## Cómo se calcula la especificidad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Especificidad 0-0-1: un solo elemento */\n  h1 { }\n\n  /* Especificidad 0-2-2: dos clases/atributos, dos elementos */\n  li > a[href*=\"es\"] > .aviso { }\n\n  /* Especificidad 1-0-0: un id, nada más pesa tanto */\n  #identificador { }\n</style>",
  "anotaciones": [
    { "fragmento": "h1 { }", "nota": "Se cuenta en tres columnas: ids | clases-atributos-pseudoclases | elementos-pseudoelementos. Un solo nombre de etiqueta vale 0-0-1." },
    { "fragmento": "li > a[href*=\"es\"] > .aviso { }", "nota": "li y a cuentan como elementos (2), [href*=\"es\"] y .aviso cuentan como clase/atributo (2) — el combinador > no suma nada. Total: 0-2-2." },
    { "fragmento": "#identificador { }", "nota": "Un id vale 1-0-0 — la primera columna. Ninguna cantidad de clases o elementos en la segunda o tercera columna puede alcanzar ese 1 en la primera." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p id=\"ganador\" class=\"a b c d e\" style=\"font-family: sans-serif;\">Texto de prueba</p>",
  "despues": "<style>\n  #ganador {\n    color: #2563eb;\n  }\n  .a.b.c.d.e {\n    color: #dc2626;\n  }\n</style>\n<p id=\"ganador\" class=\"a b c d e\" style=\"font-family: sans-serif;\">Texto de prueba</p>",
  "nota": "#ganador (especificidad 1-0-0) está declarado PRIMERO; .a.b.c.d.e, con cinco clases encadenadas (especificidad 0-5-0), está declarado DESPUÉS — y aun así el texto se pone azul, no rojo. La especificidad decide antes que el orden: ningún número de clases supera a un solo id."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .a.b.c.d.e { color: red; }\n  #ganador { color: blue; }\n</style>\n<p id=\"ganador\" class=\"a b c d e\">Texto</p>",
  "opciones": [
    "Se pone rojo: cinco clases combinadas pesan más que un solo id",
    "Se pone azul: ninguna cantidad de clases supera a un id",
    "Se pone morado, una mezcla de las dos reglas"
  ],
  "correcta": 1,
  "explicacion": "Cada columna de la especificidad se compara por separado, empezando por los ids. Un millón de selectores de clase combinados seguiría sin poder superar la especificidad de un solo id — la comparación ni siquiera llega a mirar la columna de clases si la de ids ya desempató."
}
```

## Los estilos inline pesan más que cualquier selector

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  #main h1 {\n    color: red;\n  }\n</style>\n<div id=\"main\">\n  <h1 style=\"color: purple;\">Este título</h1>\n</div>",
  "anotaciones": [
    { "fragmento": "style=\"color: purple;\"", "nota": "Un estilo puesto directamente en el atributo style tiene una especificidad implícita de 1-0-0-0 — una columna más alta que la de los ids. Gana incluso a #main h1, que ya lleva un id dentro." }
  ]
}
```

## !important: la última palabra, y por qué evitarla

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "!important cambia las reglas del juego",
  "contenido": "!important salta por encima de toda la especificidad normal, incluidos los estilos inline. La propia guía de MDN lo advierte: se recomienda no usarlo salvo que sea absolutamente necesario, porque cambia cómo funciona la cascada y hace mucho más difícil depurar problemas de CSS, sobre todo en una hoja de estilos grande."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  #importante { color: #2563eb; }\n  .anula { color: #dc2626; }\n</style>\n<p id=\"importante\" class=\"anula\">Texto de prueba</p>",
  "despues": "<style>\n  #importante { color: #2563eb; }\n  .anula { color: #dc2626 !important; }\n</style>\n<p id=\"importante\" class=\"anula\">Texto de prueba</p>",
  "nota": "Antes: #importante (1-0-0) le gana normalmente a .anula (0-1-0), el texto es azul. Después: el único cambio es añadir !important a .anula — y eso basta para invertir el resultado a rojo, saltándose por completo la especificidad más alta del id."
}
```

## :is(), :where() y :not(): cómo cuentan para la especificidad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  :is(h1, #titulo-especial) {\n    color: purple;\n  }\n\n  :where(#titulo-especial) p {\n    color: teal;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ":is(h1, #titulo-especial) {\n    color: purple;\n  }", "nota": ":is() no suma nada por sí mismo, pero SÍ adopta la especificidad de su argumento más específico — aquí, #titulo-especial. Toda la regla pesa como si fuera 1-0-0, aunque también coincida con cualquier h1 normal." },
    { "fragmento": ":where(#titulo-especial) p {\n    color: teal;\n  }", "nota": ":where() vale SIEMPRE 0-0-0, sin importar lo que lleve dentro — ni siquiera un id cuenta. Esta regla completa pesa solo 0-0-1, por el p suelto de fuera." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div id=\"quiero-ganar\">\n  <p style=\"font-family: sans-serif;\">Texto de prueba</p>\n</div>",
  "despues": "<style>\n  :where(#quiero-ganar) p {\n    color: #dc2626;\n  }\n  p {\n    color: #2563eb;\n  }\n</style>\n<div id=\"quiero-ganar\">\n  <p style=\"font-family: sans-serif;\">Texto de prueba</p>\n</div>",
  "nota": ":where(#quiero-ganar) p tiene un id dentro y parece que debería ganar — pero :where() lo anula a cero, así que su especificidad real es 0-0-1, EXACTAMENTE igual que el simple p de abajo. Empatados en especificidad, gana el que aparece después en el código: el texto se pone azul, no rojo, pese al id."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  :is(.a, .b) { color: red; }\n  :where(.a, .b) { color: blue; }\n</style>\n<p class=\"a\">Texto</p>",
  "opciones": [
    "Se pone azul: :where() está declarado después en el código",
    "Se pone rojo: :is() adopta la especificidad de su argumento, :where() siempre vale cero",
    "Se pone morado, una mezcla de las dos reglas"
  ],
  "correcta": 1,
  "explicacion": ":is(.a, .b) pesa como una clase (0-1-0), su argumento más específico. :where(.a, .b) pesa 0-0-0 siempre, sin importar lo que lleve dentro. Con esa diferencia de especificidad, :is() gana sin que importe cuál de las dos reglas viene después."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuándo usar cada uno a propósito",
  "contenido": ":where() es ideal para estilos base de un sistema de diseño — se pueden sobrescribir después con cualquier cosa, incluso una sola clase, sin pelear con la especificidad. :is() conviene cuando sí quieres que el grupo de selectores pese como el más específico de ellos. Mantener la especificidad deliberadamente baja en general deja margen para que un estilo realmente importante pueda sobrescribir después sin recurrir a !important."
}
```

## Lo que la cascada NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si dos reglas empatan en especificidad, gana la que tenga el selector más largo o más complejo",
      "realidad": "El desempate es puramente el orden de aparición — la regla declarada más tarde en el código gana, sin importar cuántos caracteres tenga el selector."
    },
    {
      "mito": "!important hace que una regla gane siempre, sin ninguna excepción",
      "realidad": "Otro !important con especificidad igual o mayor, declarado después, puede seguir ganándole — !important cambia el origen que se compara, no elimina la especificidad de la comparación."
    },
    {
      "mito": ":where() le da a un selector la especificidad de sus argumentos, igual que :is()",
      "realidad": ":where() vale SIEMPRE 0-0-0, sin importar lo que lleve dentro — ni siquiera un id cuenta. :is() sí adopta la del argumento más específico."
    },
    {
      "mito": "Un estilo inline (style=\"\") tiene la misma prioridad que un id",
      "realidad": "Un estilo inline pesa más que cualquier selector de la hoja de estilos, id incluido — solo un !important en la hoja puede superarlo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que la última regla del archivo siempre gana.", "texto": "El orden solo desempata cuando la especificidad ya está empatada — una regla con más especificidad gana aunque esté declarada antes." },
    { "titulo": "Usar !important como primer recurso para \"forzar\" un estilo.", "texto": "Complica cualquier intento futuro de sobrescribir ese estilo, y obliga a usar OTRO !important con más peso para corregirlo — mejor bajar la especificidad de lo que compite." },
    { "titulo": "Añadir clases en cadena (.a.b.c) para intentar superar un id.", "texto": "Ninguna cantidad de clases supera a un id — el problema real suele ser haber usado un id para estilizar en primer lugar." },
    { "titulo": "Esperar que :where() aporte la especificidad de un id o clase que lleva dentro.", "texto": ":where() siempre pesa cero — si se necesita esa especificidad, hace falta :is() en su lugar." }
  ]
}
```

## Ejercicios

1. Ordena estas tres reglas de mayor a menor especificidad sin ejecutarlas: `.a .b .c`, `#id .clase`, `div p a`.
2. Escribe dos reglas con la misma especificidad exacta que compitan por el mismo elemento, y explica cuál gana y por qué.
3. Reescribe `#header .nav a { color: red !important; }` sin usar `!important`, logrando el mismo resultado solo con especificidad.
4. Explica por qué `:where(.tarjeta) h2 { }` es más fácil de sobrescribir después que `.tarjeta h2 { }`, aunque ambas parezcan seleccionar lo mismo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Handling conflicts",
      "descripcion": "Guía de MDN sobre cómo la cascada resuelve conflictos entre reglas: orden, especificidad e importancia, con la tabla completa de cálculo.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts",
      "etiqueta": "MDN"
    },
    {
      "titulo": "The cascade",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre el algoritmo completo de la cascada, incluida la jerarquía de origen y de importancia entre animaciones, transiciones y reglas normales.",
      "url": "https://web.dev/learn/css/the-cascade",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Specificity",
      "descripcion": "Capítulo del curso Learn CSS de web.dev centrado en el cálculo de especificidad, con el comportamiento detallado de :is(), :where() y :not().",
      "url": "https://web.dev/learn/css/specificity",
      "etiqueta": "web.dev"
    }
  ]
}
```
