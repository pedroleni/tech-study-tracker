# Parámetros: valores por defecto, rest y arguments

- **Módulo:** Funciones
- **Slug:** `parametros-valores-por-defecto-rest-y-arguments` (autogenerado del título)
- **Orden:** 53
- **Fuentes:** [Functions (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) — ver `contenido/javascript/TEMARIO.md` #18

---

## Qué es y para qué sirve

Tres formas de dar más flexibilidad a los parámetros de una función: un valor por defecto cuando no llega nada, un rest parameter para recoger una cantidad indefinida de argumentos en un array real, y el objeto `arguments`, más antiguo y hoy menos recomendable.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita parámetros más flexibles",
  "roles": [
    { "etiqueta": "Quien da un valor por defecto", "rol": "Solo cuando falta el argumento", "descripcion": "Se activa exclusivamente cuando el parámetro es undefined — nunca con otro valor falsy pasado a propósito." },
    { "etiqueta": "Quien recoge el resto en un array", "rol": "Rest parameter, con ...", "descripcion": "Captura una cantidad indefinida de argumentos en un array real, no en un objeto parecido a un array." },
    { "etiqueta": "Quien usa arguments en vez de rest", "rol": "El objeto heredado, más limitado", "descripcion": "Existe en casi cualquier función, pero no es un array real, y no existe en las funciones flecha." }
  ]
}
```

## Valores por defecto: la sintaxis moderna

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Antes de los valores por defecto: comprobación manual\n  function multiplicarAntiguo(a, b) {\n    b = typeof b !== 'undefined' ? b : 1;\n    return a * b;\n  }\n\n  // Con valores por defecto\n  function multiplicar(a, b = 1) {\n    return a * b;\n  }\n\n  console.log(multiplicar(5)); // 5\n</script>",
  "anotaciones": [
    { "fragmento": "function multiplicar(a, b = 1) {", "nota": "b = 1 en la propia definición sustituye la comprobación manual de antes — mucho más directo de leer." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Solo undefined activa el valor por defecto",
  "contenido": "Un valor por defecto se activa ÚNICAMENTE cuando el argumento es undefined — porque no se pasó nada, o porque se pasó undefined explícitamente. Otros valores falsy pasados a propósito, como 0, '' o false, NO activan el valor por defecto: se usan tal cual."
}
```

## Rest parameters: recoger el resto en un array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function multiplicarTodos(multiplicador, ...resto) {\n    return resto.map((x) => multiplicador * x);\n  }\n\n  console.log(multiplicarTodos(2, 1, 2, 3)); // [2, 4, 6]\n</script>",
  "anotaciones": [
    { "fragmento": "function multiplicarTodos(multiplicador, ...resto) {", "nota": "...resto recoge TODOS los argumentos que sobran después de multiplicador, en un ARRAY real — con todos sus métodos disponibles, como map() aquí mismo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Solo un rest parameter, y siempre al final",
  "contenido": "Una función solo puede tener UN rest parameter, y tiene que ser el ÚLTIMO de la lista de parámetros — recoge todo lo que sobre desde ese punto en adelante, así que no tendría sentido en ninguna otra posición."
}
```

## El objeto arguments: la forma más antigua

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function unir(separador) {\n    let resultado = '';\n    for (let i = 1; i < arguments.length; i++) {\n      resultado += arguments[i] + separador;\n    }\n    return resultado;\n  }\n\n  console.log(unir(', ', 'rojo', 'naranja', 'azul'));\n  // 'rojo, naranja, azul, '\n</script>",
  "anotaciones": [
    { "fragmento": "for (let i = 1; i < arguments.length; i++) {", "nota": "arguments existe automáticamente dentro de casi cualquier función, con TODOS los argumentos recibidos (incluidos los ya capturados por nombre) — pero es un objeto \"array-like\", no un array real: tiene length e índices, pero le faltan métodos como map() o filter() sin convertirlo antes." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "arguments no existe en funciones flecha",
  "contenido": "Un detalle real, no solo teórico: arguments no está disponible dentro de una función flecha — un tema que se retoma con más detalle en la lección dedicada a ellas. Por eso, y por ser un array real con todos sus métodos, los rest parameters se prefieren hoy sobre arguments en código nuevo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function multiplicar(a, b = 1) {\n    return a * b;\n  }\n  console.log(multiplicar(5));\n  console.log(multiplicar(5, 0));\n  console.log(multiplicar(5, undefined));\n</script>",
  "opciones": [
    "5, 0 y 5 — el valor por defecto solo se activa cuando el argumento es undefined, nunca con otro valor como 0, aunque sea falsy",
    "5, 5 y 5 — el valor por defecto siempre gana si el resultado no coincide con lo esperado",
    "5, 0 y 0 — pasar undefined explícitamente no activa el valor por defecto"
  ],
  "correcta": 0,
  "explicacion": "multiplicar(5): b no se pasó, es undefined, el valor por defecto (1) se activa: 5*1=5. multiplicar(5, 0): b es 0, un valor REAL pasado a propósito, no undefined: 5*0=0. multiplicar(5, undefined): b es undefined explícitamente, el valor por defecto se activa igual: 5*1=5."
}
```

## Lo que estos parámetros NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un valor por defecto se activa con cualquier valor falsy, como 0 o ''",
      "realidad": "Solo se activa cuando el argumento es exactamente undefined — 0, '' o false pasados a propósito NO activan el valor por defecto."
    },
    {
      "mito": "Se pueden usar varios rest parameters en la misma función",
      "realidad": "Solo se permite UNO, y tiene que ser el ÚLTIMO parámetro de la lista."
    },
    {
      "mito": "arguments es un array de verdad, con todos sus métodos",
      "realidad": "Es un objeto \"array-like\" — tiene índices y length, pero le faltan métodos de array como map() o filter() sin convertirlo antes."
    },
    {
      "mito": "arguments existe en cualquier tipo de función, incluidas las flecha",
      "realidad": "NO existe dentro de una función flecha — un detalle real que se retoma en la lección dedicada a ellas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir un valor por defecto con cualquier valor falsy.", "texto": "Solo undefined lo activa — 0, '' o false pasados a propósito se usan tal cual." },
    { "titulo": "Intentar usar varios rest parameters, o colocarlo fuera del último lugar.", "texto": "Solo se permite uno, y siempre al final de la lista de parámetros." },
    { "titulo": "Usar arguments cuando un rest parameter sería más claro.", "texto": "Un rest parameter da un array real, con todos sus métodos disponibles." },
    { "titulo": "Esperar que arguments exista dentro de una función flecha.", "texto": "Simplemente no está disponible ahí — un caso real, no una curiosidad." }
  ]
}
```

## Ejercicios

1. Escribe una función con un parámetro por defecto que se active al no pasar ningún argumento.
2. Escribe una función que use un rest parameter para sumar una cantidad indefinida de números.
3. Explica por qué `multiplicar(5, 0)` no activa el valor por defecto de `b`, aunque `0` sea falsy.
4. Explica la diferencia entre `arguments` y un rest parameter.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Functions",
      "descripcion": "Guía de referencia de MDN sobre valores por defecto, rest parameters, y el objeto arguments.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      "etiqueta": "MDN"
    }
  ]
}
```
