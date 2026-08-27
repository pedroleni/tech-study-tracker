# :has(), el selector de padre que faltaba

- **Módulo:** Fundamentos de CSS
- **Slug:** `has-el-selector-de-padre-que-faltaba` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [:has() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) — ver `contenido/css/TEMARIO.md` #7

---

## Qué es y para qué sirve

Durante décadas, CSS solo pudo mirar hacia abajo: un selector podía alcanzar un descendiente a partir de su ancestro, nunca al revés. `:has()` invierte esa dirección — selecciona un elemento según lo que TIENE dentro, o lo que viene justo después de él. Es, por fin, un selector de padre: `.tarjeta:has(img)` selecciona la tarjeta que contiene una imagen, no la imagen misma.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién llevaba años esperando esto",
  "roles": [
    { "etiqueta": "Quien construye sistemas de componentes", "rol": "Adaptar una tarjeta según su propio contenido", "descripcion": ".tarjeta:has(img) aplica una sombra distinta solo a las tarjetas que de verdad tienen imagen — sin JavaScript, sin una clase añadida a mano en cada caso." },
    { "etiqueta": "Quien valida formularios", "rol": "Resaltar un grupo de campos si algo dentro falla", "descripcion": ".grupo:has(input:invalid) marca todo el bloque en rojo en cuanto un campo dentro deja de cumplir su validación — sin escuchar eventos ni tocar JavaScript." },
    { "etiqueta": "Quien maqueta contenido editorial", "rol": "Ajustar un título según lo que viene después", "descripcion": "h1:has(+ h2) reduce el margen de un título solo cuando le sigue un subtítulo — como una mirada hacia delante dentro del propio CSS." }
  ]
}
```

## El selector que CSS nunca tuvo

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"Selector de padre\" durante años, en la lista de deseos de CSS",
  "contenido": ":has() acepta una lista de selectores relativos al elemento ancla, no al documento entero — dentro puede usar cualquier combinador que mire hacia delante: > (hijo), espacio (descendiente), + (hermano inmediato) o ~ (hermano posterior). Es parecido a una mirada hacia delante (lookahead) en expresiones regulares: comprueba qué hay sin necesitar seleccionarlo directamente."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  section:has(.destacado) {\n    border: 2px solid #7c3aed;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "section:has(.destacado) {\n    border: 2px solid #7c3aed;\n  }", "nota": "Selecciona la section que TIENE un descendiente con clase destacado — no el propio .destacado. El estilo se aplica al padre, algo que ningún selector anterior podía hacer." }
  ]
}
```

## Estilizar un contenedor por lo que tiene dentro

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .tarjeta { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-family: sans-serif; margin-bottom: 8px; }\n</style>\n<div class=\"tarjeta\"><p>Tarjeta sin imagen</p></div>\n<div class=\"tarjeta\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%237c3aed'/%3E%3C/svg%3E\" alt=\"\" width=\"40\" height=\"40\">\n  <p>Tarjeta con imagen</p>\n</div>",
  "despues": "<style>\n  .tarjeta { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-family: sans-serif; margin-bottom: 8px; }\n  .tarjeta:has(img) {\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n    border-color: #7c3aed;\n  }\n</style>\n<div class=\"tarjeta\"><p>Tarjeta sin imagen</p></div>\n<div class=\"tarjeta\">\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%237c3aed'/%3E%3C/svg%3E\" alt=\"\" width=\"40\" height=\"40\">\n  <p>Tarjeta con imagen</p>\n</div>",
  "nota": "Mismo HTML en los dos casos. .tarjeta:has(img) alcanza la propia tarjeta — no la imagen — y le añade sombra y borde morado solo cuando contiene una img. La primera tarjeta, sin imagen, se queda igual."
}
```

## Validación de formularios sin JavaScript

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .grupo { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: sans-serif; max-width: 280px; }\n  input { display: block; margin-top: 4px; padding: 6px; width: 100%; box-sizing: border-box; }\n</style>\n<div class=\"grupo\">\n  <label>Correo\n    <input type=\"email\" value=\"esto-no-es-un-correo\">\n  </label>\n</div>",
  "despues": "<style>\n  .grupo { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: sans-serif; max-width: 280px; }\n  input { display: block; margin-top: 4px; padding: 6px; width: 100%; box-sizing: border-box; }\n  .grupo:has(input:invalid) {\n    border-color: #dc2626;\n    background: #fef2f2;\n  }\n</style>\n<div class=\"grupo\">\n  <label>Correo\n    <input type=\"email\" value=\"esto-no-es-un-correo\">\n  </label>\n</div>",
  "nota": "El valor \"esto-no-es-un-correo\" no cumple el formato de type=\"email\", así que el navegador marca ese input como :invalid por su cuenta, sin JavaScript. .grupo:has(input:invalid) detecta esa invalidez desde el contenedor y tiñe todo el grupo — border-color y background incluidos."
}
```

## Mirar hacia delante: el título y lo que le sigue

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  h1 { margin: 0 0 1.5rem 0; font-family: sans-serif; }\n  h2 { margin: 0 0 1rem 0; font-family: sans-serif; color: #6b7280; }\n  p { font-family: sans-serif; }\n</style>\n<h1>Sin subtítulo debajo</h1>\n<p>Un párrafo normal, sin relación especial con el título.</p>\n<h1>Con subtítulo debajo</h1>\n<h2>Este es el subtítulo</h2>",
  "despues": "<style>\n  h1 { margin: 0 0 1.5rem 0; font-family: sans-serif; }\n  h1:has(+ h2) {\n    margin-bottom: 0.25rem;\n  }\n  h2 { margin: 0 0 1rem 0; font-family: sans-serif; color: #6b7280; }\n  p { font-family: sans-serif; }\n</style>\n<h1>Sin subtítulo debajo</h1>\n<p>Un párrafo normal, sin relación especial con el título.</p>\n<h1>Con subtítulo debajo</h1>\n<h2>Este es el subtítulo</h2>",
  "nota": "h1:has(+ h2) selecciona el h1 que tiene un h2 justo después — el primer h1, seguido de un párrafo, no coincide y conserva su margen normal. El segundo h1 sí, y el hueco antes de su subtítulo se estrecha visiblemente."
}
```

## Combinar condiciones: O, y Y

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  body:has(video, audio) {\n    /* Coincide si hay video O audio (lista separada por comas) */\n  }\n\n  body:has(video):has(audio) {\n    /* Coincide solo si hay video Y audio (dos :has() encadenados) */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "body:has(video, audio)", "nota": "Una lista separada por comas dentro de :has() es lógica O: basta con que exista UNO de los dos elementos, video o audio, en cualquier parte del body." },
    { "fragmento": "body:has(video):has(audio)", "nota": "Dos :has() encadenados, uno detrás de otro, es lógica Y: hace falta que existan AMBOS elementos a la vez para que el selector coincida." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  body:has(video):has(audio) {\n    border: 4px solid green;\n  }\n</style>\n<body>\n  <video></video>\n</body>",
  "opciones": [
    "El body tiene el borde verde: contiene un elemento video",
    "El body NO tiene el borde verde: hacen falta video Y audio a la vez",
    "Error de sintaxis: no se pueden encadenar dos :has() seguidos"
  ],
  "correcta": 1,
  "explicacion": "Encadenar :has():has() es lógica Y, no O — cada :has() añade una condición que debe cumplirse por separado, todas a la vez, sobre el mismo elemento ancla. Con solo video presente y sin audio, la segunda condición falla y el selector completo no coincide."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Ancla amplia, coste alto",
  "contenido": "Anclar :has() en selectores muy amplios como body, :root o * obliga al navegador a reevaluar la condición en cada cambio del DOM de toda la página — caro en sitios con mucha interactividad. Preferir un contenedor concreto (.tarjeta:has(...) en vez de body:has(...)) y combinadores que acoten el alcance (:has(> .hijo) en vez de :has(.cualquier-descendiente)) mantiene la comprobación barata."
}
```

## Lo que :has() NO permite

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": ":has() puede seleccionar un elemento por sus hermanos ANTERIORES",
      "realidad": "Todos los combinadores dentro de :has() miran hacia delante desde el ancla: hijo, descendiente, hermano siguiente o hermano posterior — nunca hacia atrás, en ninguna dirección."
    },
    {
      "mito": "Se puede anidar un :has() dentro de otro :has()",
      "realidad": "Está explícitamente prohibido — .ancestro:has(.hijo:has(.nieto)) es un selector inválido, no un error silencioso."
    },
    {
      "mito": "Se puede usar :has() para alcanzar un pseudo-elemento como ::before",
      "realidad": "Los pseudo-elementos no están permitidos ni dentro de :has() ni como ancla — h1:has(::before) y h1::before:has(.x) son ambos inválidos."
    },
    {
      "mito": "Si un navegador no soporta :has(), el resto del selector se sigue aplicando igual",
      "realidad": "Un :has() no soportado invalida la regla COMPLETA en la que aparece — a menos que se envuelva en :is(), que sí perdona partes no soportadas de una lista."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Anclar :has() en selectores demasiado amplios (body, :root, *).", "texto": "Fuerza al navegador a reevaluar la condición en cada cambio del DOM de toda la página — un contenedor concreto es siempre más barato." },
    { "titulo": "Esperar que :has() seleccione por lo que vino ANTES del elemento.", "texto": ":has() solo mira hacia delante — hijos, descendientes, el siguiente hermano o los hermanos posteriores — nunca hacia atrás." },
    { "titulo": "Anidar dos :has() uno dentro de otro.", "texto": "Es un selector inválido de forma explícita, no algo que simplemente no coincida con nada." },
    { "titulo": "No usar :is() como red de seguridad cuando el soporte del navegador es incierto.", "texto": "Un :has() no soportado rompe toda la regla que lo contiene, no solo esa parte del selector." }
  ]
}
```

## Ejercicios

1. Escribe un selector que ponga un borde rojo a cualquier `.tarjeta` que NO contenga una imagen (pista: combina `:has()` con `:not()`).
2. Escribe un selector que aplique un fondo distinto a un `fieldset` solo si contiene al menos un `input` con el atributo `required`.
3. Explica la diferencia entre `body:has(video, audio)` y `body:has(video):has(audio)`, con un ejemplo de HTML que coincida con el primero pero no con el segundo.
4. Explica por qué `.tarjeta:has(> .interior > .imagen)` es mejor para el rendimiento que `.tarjeta:has(.imagen)` en una página con muchos cambios dinámicos en el DOM.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": ":has()",
      "descripcion": "Referencia de MDN sobre la pseudo-clase :has(): sintaxis, especificidad, restricciones de anidamiento y consideraciones de rendimiento.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/:has",
      "etiqueta": "MDN"
    }
  ]
}
```
