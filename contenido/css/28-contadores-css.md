# Contadores CSS: counter-reset y counter-increment

- **Módulo:** Texto y tipografía
- **Slug:** `contadores-css-counter-reset-y-counter-increment` (autogenerado del título)
- **Orden:** 135
- **Fuentes:** [Counters (web.dev)](https://web.dev/learn/css/counters) — ver `contenido/css/TEMARIO.md` #28

---

## Qué es y para qué sirve

Un contador CSS numera elementos automáticamente — sin necesitar una `<ol>`, sin escribir el número a mano en el HTML. `counter-reset` crea el contador y le da un punto de partida; `counter-increment` lo hace avanzar en cada elemento; `counter()` (o `counters()`, para numeración anidada) muestra su valor actual dentro de un `content`. Los tres trabajan juntos — y el ALCANCE de dónde se reinicia cada uno es la parte que más sorprende la primera vez.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién numera cosas sin usar una lista ordenada",
  "roles": [
    { "etiqueta": "Quien numera encabezados personalizados", "rol": "Añadir \"1.\", \"2.\"... sin tocar el HTML", "descripcion": "Un contador en cada h2 numera automáticamente cada sección, sin escribir el número en el propio texto del encabezado." },
    { "etiqueta": "Quien construye una guía paso a paso", "rol": "Numerar pasos que se reordenan o se añaden a menudo", "descripcion": "Insertar un paso nuevo en medio no rompe la numeración — el contador se recalcula solo, sin renumerar nada a mano." },
    { "etiqueta": "Quien necesita numeración anidada", "rol": "Mostrar \"1.1\", \"1.2\", \"2.1\" en secciones y subsecciones", "descripcion": "counters() une el valor de cada nivel anidado con un separador, como el índice de un documento formal." }
  ]
}
```

## Crear, incrementar y mostrar un contador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .contenedor {\n    counter-reset: seccion;\n  }\n  h3 {\n    counter-increment: seccion;\n  }\n  h3::before {\n    content: counter(seccion) \". \";\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".contenedor {\n    counter-reset: seccion;\n  }", "nota": "Crea el contador seccion, inicializado en 0, con alcance limitado a este elemento y sus descendientes." },
    { "fragmento": "h3 {\n    counter-increment: seccion;\n  }", "nota": "Cada h3 dentro del contenedor suma 1 al contador — sin esta línea, el contador nunca avanzaría." },
    { "fragmento": "h3::before {\n    content: counter(seccion) \". \";\n  }", "nota": "counter(seccion) inserta el valor ACTUAL del contador justo antes del contenido real del h3, como texto generado." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  h3 { font-family: sans-serif; }\n</style>\n<h3>Introducción</h3>\n<h3>Desarrollo</h3>\n<h3>Conclusión</h3>",
  "despues": "<style>\n  .contenedor { counter-reset: seccion; font-family: sans-serif; }\n  h3 { counter-increment: seccion; }\n  h3::before { content: counter(seccion) \". \"; color: #7c3aed; font-weight: bold; }\n</style>\n<div class=\"contenedor\">\n  <h3>Introducción</h3>\n  <h3>Desarrollo</h3>\n  <h3>Conclusión</h3>\n</div>",
  "nota": "Mismos tres encabezados, sin ningún número escrito en el HTML en ninguno de los dos casos. Después, las tres líneas de CSS numeran automáticamente cada h3 — \"1. Introducción\", \"2. Desarrollo\", \"3. Conclusión\" — generado por completo, sin tocar el texto original."
}
```

## Saltar de un número concreto, no siempre de uno en uno

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { counter-reset: contador; font-family: sans-serif; }\n  li { counter-increment: contador; }\n  li::before { content: counter(contador) \". \"; font-weight: bold; }\n</style>\n<ul class=\"contenedor\" style=\"list-style: none; padding: 0;\">\n  <li>Elemento</li>\n  <li>Elemento</li>\n  <li>Elemento</li>\n</ul>",
  "despues": "<style>\n  .contenedor { counter-reset: contador; font-family: sans-serif; }\n  li { counter-increment: contador 10; }\n  li::before { content: counter(contador) \". \"; font-weight: bold; }\n</style>\n<ul class=\"contenedor\" style=\"list-style: none; padding: 0;\">\n  <li>Elemento</li>\n  <li>Elemento</li>\n  <li>Elemento</li>\n</ul>",
  "nota": "Antes: counter-increment: contador; suma 1 por defecto — 1., 2., 3. Después: counter-increment: contador 10; suma 10 cada vez — 10., 20., 30. El segundo valor de counter-increment fija cuánto avanza el contador en cada elemento, incluso con números negativos para contar hacia atrás."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "counter-reset crea, counter-set solo cambia un valor existente",
  "contenido": "counter-reset inicializa un contador con un valor de partida — si el contador no existía, lo crea. counter-set, en cambio, solo cambia el valor de un contador que YA existe, sin alterar su comportamiento. No son intercambiables: usar counter-set sobre un contador que nunca se creó con counter-reset no tiene el mismo efecto."
}
```

## counters(): numeración anidada con separador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  li::before {\n    content: counters(item, \".\") \" \";\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "content: counters(item, \".\") \" \";", "nota": "counters() (con S) une el valor del contador item en CADA nivel anidado, separados por el punto — el resultado es \"1.1\", \"1.2\", \"2\"... counter() (sin S) solo mostraría el nivel más interno, sin el prefijo de los niveles superiores." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { font-family: sans-serif; }\n  ol { counter-reset: item; list-style: none; padding-left: 20px; }\n  li { counter-increment: item; }\n  li::before { content: counter(item) \" \"; font-weight: bold; color: #7c3aed; }\n</style>\n<ol class=\"contenedor\">\n  <li>Primero\n    <ol>\n      <li>Primero punto uno</li>\n      <li>Primero punto dos</li>\n    </ol>\n  </li>\n  <li>Segundo</li>\n</ol>",
  "despues": "<style>\n  .contenedor { font-family: sans-serif; }\n  ol { counter-reset: item; list-style: none; padding-left: 20px; }\n  li { counter-increment: item; }\n  li::before { content: counters(item, \".\") \" \"; font-weight: bold; color: #7c3aed; }\n</style>\n<ol class=\"contenedor\">\n  <li>Primero\n    <ol>\n      <li>Primero punto uno</li>\n      <li>Primero punto dos</li>\n    </ol>\n  </li>\n  <li>Segundo</li>\n</ol>",
  "nota": "Misma lista anidada en los dos casos. Antes, con counter(item) (sin S), los elementos del nivel interno muestran solo su propio número — \"1\" y \"2\", sin rastro del nivel superior. Después, con counters(item, \".\") (con S), esos mismos elementos muestran \"1.1\" y \"1.2\" — el separador une el número de cada nivel anidado hasta llegar al más interno."
}
```

## El alcance de counter-reset: por dónde vuelve a empezar

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { counter-reset: seccion parrafo; font-family: sans-serif; }\n  h4 { counter-increment: seccion; }\n  h4::before { content: \"Sección \" counter(seccion) \": \"; font-weight: bold; color: #7c3aed; }\n  p { counter-increment: parrafo; }\n  p::before { content: counter(parrafo) \". \"; color: #6b7280; }\n</style>\n<div class=\"contenedor\">\n  <h4>Introducción</h4>\n  <p>Primer párrafo</p>\n  <p>Segundo párrafo</p>\n  <h4>Desarrollo</h4>\n  <p>Primer párrafo</p>\n</div>",
  "despues": "<style>\n  .contenedor { counter-reset: seccion parrafo; font-family: sans-serif; }\n  h4 { counter-increment: seccion; counter-reset: parrafo; }\n  h4::before { content: \"Sección \" counter(seccion) \": \"; font-weight: bold; color: #7c3aed; }\n  p { counter-increment: parrafo; }\n  p::before { content: counter(parrafo) \". \"; color: #6b7280; }\n</style>\n<div class=\"contenedor\">\n  <h4>Introducción</h4>\n  <p>Primer párrafo</p>\n  <p>Segundo párrafo</p>\n  <h4>Desarrollo</h4>\n  <p>Primer párrafo</p>\n</div>",
  "nota": "El contador parrafo se crea una sola vez, en .contenedor, en los dos casos. Antes: como nunca se vuelve a reiniciar, cuenta en GLOBAL a través de toda la página — el único párrafo de \"Desarrollo\" aparece como \"3.\", continuando la cuenta de la sección anterior. Después: al añadir counter-reset: parrafo; también en la regla de h4, el contador se reinicia a 0 en CADA nueva sección — ese mismo párrafo vuelve a mostrar \"1.\"."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .contenedor { counter-reset: contador 5; }\n  .caja { counter-set: contador 20; }\n  .caja::before { content: counter(contador); }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">Valor: </div>\n</div>",
  "opciones": [
    "El contador muestra 5, porque counter-reset ya lo inicializó y counter-set no puede sobrescribirlo",
    "El contador muestra 20: counter-set cambia el valor de un contador que ya existe, sin crear uno nuevo",
    "Es un error usar counter-reset y counter-set sobre el mismo nombre de contador"
  ],
  "correcta": 1,
  "explicacion": "counter-reset crea el contador con un valor de partida (5). counter-set, aplicado después sobre .caja, cambia ese valor ya existente a 20, sin volver a crearlo desde cero. El resultado final que se muestra es 20."
}
```

## Lo que un contador CSS NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "counter-reset y counter-set hacen lo mismo, solo con nombres distintos",
      "realidad": "counter-reset INICIALIZA (crea) un contador con un valor de partida; counter-set solo cambia el valor de uno que ya existe, sin crearlo desde cero."
    },
    {
      "mito": "counter() y counters() son intercambiables, dan el mismo resultado",
      "realidad": "counter() solo muestra el valor del nivel más interno; counters() une los valores de TODOS los niveles anidados con un separador, como \"1.2\"."
    },
    {
      "mito": "Un contador CSS cuenta automáticamente cualquier elemento sin necesitar counter-increment",
      "realidad": "Hace falta declarar counter-increment explícitamente en cada elemento que se quiera contar — sin él, el contador nunca avanza."
    },
    {
      "mito": "counter-reset en un elemento afecta al contador de toda la página, sin importar dónde se declare",
      "realidad": "Crea una nueva instancia del contador con alcance limitado a ese elemento y sus descendientes — declararlo de nuevo en un elemento anidado reinicia el conteo solo ahí dentro."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar counter-increment en el elemento que se quiere contar.", "texto": "Sin esa declaración, el contador se queda fijo en su valor inicial — no avanza en ningún elemento." },
    { "titulo": "Usar counter() en vez de counters() para numeración anidada.", "texto": "Muestra solo el nivel más interno, sin el prefijo de los niveles superiores — hace falta counters() con separador para \"1.1\", \"1.2\"." },
    { "titulo": "Confundir counter-reset con counter-set.", "texto": "counter-set no puede crear un contador nuevo — solo cambia el valor de uno que counter-reset ya haya inicializado." },
    { "titulo": "No volver a declarar counter-reset en cada nivel donde se quiera reiniciar el conteo.", "texto": "Sin repetirlo en el nivel correcto, el contador sigue sumando en global en vez de empezar de cero en cada sección nueva." }
  ]
}
```

## Ejercicios

1. Escribe las reglas necesarias para numerar automáticamente cada `<h2>` de una página como "1. ", "2. ", "3. ", usando `counter-reset`, `counter-increment` y `counter()`.
2. Escribe una regla que haga que un contador avance de 5 en 5 en vez de uno en uno.
3. Escribe una regla con `counters()` que numere una lista anidada como "1", "1.1", "1.2", "2".
4. Explica por qué un contador de párrafos que solo se reinicia una vez, al principio de la página, sigue contando en global en vez de reiniciarse en cada nueva sección — y cómo solucionarlo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Counters",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre contadores: counter-reset, counter-increment, counter-set, counter() y counters() para numeración anidada.",
      "url": "https://web.dev/learn/css/counters",
      "etiqueta": "web.dev"
    }
  ]
}
```
