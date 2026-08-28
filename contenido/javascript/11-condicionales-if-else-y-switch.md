# Condicionales: if/else y switch

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `condicionales-if-else-y-switch` (autogenerado del título)
- **Orden:** 32
- **Fuentes:** [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) — ver `contenido/javascript/TEMARIO.md` #11

---

## Qué es y para qué sirve

Casi todo programa real necesita ejecutar código distinto según una condición. `if`/`else` cubre la mayoría de los casos; `switch` encaja mejor cuando hay varias opciones concretas para el mismo valor. Los operadores lógicos (`&&`, `||`) y el operador ternario tienen su propia lección justo después de esta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita ejecutar código distinto según una condición",
  "roles": [
    { "etiqueta": "Quien encadena varias condiciones", "rol": "if, else if, else en cadena", "descripcion": "Cada else if añade una condición más a comprobar, en orden, hasta encontrar la primera que sea verdadera." },
    { "etiqueta": "Quien evita el fallthrough sin querer", "rol": "Un break por cada case", "descripcion": "Sin break, switch sigue ejecutando los case siguientes aunque ya no coincidan — un error real, no solo teórico." },
    { "etiqueta": "Quien elige entre if y switch", "rol": "Según la forma de la comparación", "descripcion": "switch encaja cuando se compara UN valor contra varias opciones concretas; if/else, para condiciones más complejas." }
  ]
}
```

## if / else: la base

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const temperatura = 25;\n\n  if (temperatura > 20) {\n    console.log('Hace calor');\n  } else {\n    console.log('No hace tanto calor');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (temperatura > 20) {", "nota": "La condición entre paréntesis se evalúa a true o false — solo si es true, el bloque { } que sigue se ejecuta." },
    { "fragmento": "} else {\n    console.log('No hace tanto calor');\n  }", "nota": "else es opcional — se ejecuta cuando la condición del if fue false. Sin else, el código simplemente no hace nada en ese caso." }
  ]
}
```

## else if: varias opciones en cadena

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const clima = 'nublado';\n\n  if (clima === 'soleado') {\n    console.log('Lleva gafas de sol');\n  } else if (clima === 'lluvioso') {\n    console.log('Lleva paraguas');\n  } else if (clima === 'nublado') {\n    console.log('Puede que llueva más tarde');\n  } else {\n    console.log('Clima desconocido');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "} else if (clima === 'nublado') {\n    console.log('Puede que llueva más tarde');\n  }", "nota": "Cada else if se evalúa en ORDEN, solo si las anteriores fueron false — en cuanto una es true, el resto de la cadena se ignora por completo, aunque también fueran verdaderas." }
  ]
}
```

## switch: comparar un valor contra varias opciones

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const clima = 'lluvioso';\n\n  switch (clima) {\n    case 'soleado':\n      console.log('Lleva gafas de sol');\n      break;\n    case 'lluvioso':\n      console.log('Lleva paraguas');\n      break;\n    default:\n      console.log('Clima desconocido');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "switch (clima) {", "nota": "switch toma UN valor y lo compara contra cada case, en orden, hasta encontrar una coincidencia." },
    { "fragmento": "default:\n      console.log('Clima desconocido');", "nota": "default es opcional, y se ejecuta si ningún case coincidió — no necesita su propio break, al ser el último." }
  ]
}
```

## El peligro real: fallthrough sin break

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  switch (2 + 2 === 7) {\n    case false:\n      console.log('Falso');\n      // falta el break aquí\n    case true:\n      console.log('Verdadero');\n      break;\n  }\n  // Imprime AMBAS líneas: 'Falso' y 'Verdadero'\n</script>",
  "anotaciones": [
    { "fragmento": "// falta el break aquí", "nota": "Sin break, la ejecución NO se detiene al terminar un case que coincidió — sigue cayendo hacia el siguiente case, lo ejecute también, sin importar si ese case coincide o no. A esto se le llama fallthrough." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "switch compara con igualdad estricta",
  "contenido": "Por dentro, switch compara cada case contra el valor de entrada usando el mismo criterio que === — sin ninguna coerción de tipos. switch (2) nunca coincidiría con case '2': (con comillas), exactamente igual que 2 === '2' es false."
}
```

## El gotcha de scope: let/const dentro de case

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  switch (true) {\n    case true: {\n      let resultado = 'Verdadero'; // { } propio: ámbito aislado\n      console.log(resultado);\n      break;\n    }\n    default: {\n      let resultado = 'Otro'; // MISMO nombre, sin conflicto\n      console.log(resultado);\n      break;\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "case true: {\n      let resultado = 'Verdadero'; // { } propio: ámbito aislado\n      console.log(resultado);\n      break;\n    }", "nota": "Los case y default NO crean su propio ámbito de bloque por sí solos — declarar let resultado en dos case distintos SIN llaves propias lanzaría un SyntaxError por redeclaración. Envolver cada case en sus propias { } resuelve el problema." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuándo usar switch en vez de if/else",
  "contenido": "switch encaja mejor cuando se compara UN mismo valor contra varias opciones concretas, cada una con un bloque de código razonable. if/else sigue siendo mejor para condiciones complejas con operadores lógicos, o cuando solo hay un par de opciones."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  switch (2 + 2 === 7) {\n    case false:\n      console.log('Falso');\n    case true:\n      console.log('Verdadero');\n  }\n</script>",
  "opciones": [
    "'Falso' y luego 'Verdadero' — sin break, la ejecución sigue hacia el siguiente case aunque ya no coincida",
    "Solo 'Falso' — switch se detiene automáticamente tras el primer case que coincide",
    "Solo 'Verdadero' — switch evalúa directamente el valor true de la condición completa"
  ],
  "correcta": 0,
  "explicacion": "2 + 2 === 7 es false, así que entra en case false e imprime 'Falso'. Sin break, la ejecución sigue cayendo hacia case true y también imprime 'Verdadero' — el fallthrough clásico."
}
```

## Lo que if/else y switch NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "switch se detiene automáticamente al encontrar el case que coincide",
      "realidad": "Sin un break explícito, la ejecución sigue cayendo hacia los case siguientes, sin importar si coinciden — el fenómeno se llama fallthrough."
    },
    {
      "mito": "switch compara con == (con coerción), como una comparación relajada",
      "realidad": "Compara internamente con igualdad ESTRICTA (===) — los tipos tienen que coincidir exactamente."
    },
    {
      "mito": "Declarar let dentro de un case es igual que declararlo dentro de cualquier bloque { }",
      "realidad": "Los case y default NO crean su propio ámbito por sí solos — declarar la misma variable con let en dos case distintos lanza un SyntaxError, salvo que cada uno tenga sus propias llaves."
    },
    {
      "mito": "if (x === 5 || 7 || 10) comprueba si x es igual a 5, 7 o 10",
      "realidad": "7 y 10 se evalúan como expresiones INDEPENDIENTES, siempre truthy — la condición completa siempre da true, sin importar el valor real de x."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar break dentro de un case, provocando fallthrough sin querer.", "texto": "La ejecución sigue cayendo hacia el siguiente case, se ejecute o no coincida." },
    { "titulo": "Declarar let o const en dos case distintos sin envolverlos en sus propias llaves.", "texto": "Lanza un SyntaxError por redeclaración, ya que case y default comparten un único ámbito por defecto." },
    { "titulo": "Escribir x === 5 || 7 || 10 esperando que compare x contra los tres valores.", "texto": "Hace falta repetir x === en cada comparación: x === 5 || x === 7 || x === 10." },
    { "titulo": "Usar switch para condiciones complejas con operadores lógicos.", "texto": "if/else encaja mejor cuando la lógica no es una simple comparación de un valor contra varias opciones." }
  ]
}
```

## Ejercicios

1. Escribe un `switch` con tres `case` y un `default`, usando `break` en cada uno.
2. Explica qué pasaría si se omite el `break` del primer `case` del ejercicio anterior.
3. Explica por qué declarar `let` dentro de dos `case` sin llaves propias lanza un error.
4. Reescribe `if (x === 5 || 7 || 10)` para que compruebe correctamente los tres valores contra `x`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Making decisions in your code — conditionals",
      "descripcion": "Guía de MDN sobre if/else, else if, switch, y el error clásico de comparar contra varios valores con ||.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Control flow",
      "descripcion": "Capítulo de web.dev con dos gotchas reales de switch: la igualdad estricta interna, y el problema de ámbito con let/const dentro de case.",
      "url": "https://web.dev/learn/javascript/control-flow",
      "etiqueta": "web.dev"
    }
  ]
}
```
