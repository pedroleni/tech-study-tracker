# Operadores y matemáticas básicas

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `operadores-y-matematicas-basicas` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [Basic math in JavaScript — numbers and operators (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Math) — ver `contenido/javascript/TEMARIO.md` #7

---

## Qué es y para qué sirve

Sumar, restar, multiplicar — lo esperable — pero también el orden en que JavaScript decide hacerlo, y una trampa muy real cuando un número llega disfrazado de texto. Los operadores de COMPARACIÓN (`===`, `<`, `>=`...) tienen su propia lección dedicada justo después de esta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita controlar cómo se calcula, no solo qué",
  "roles": [
    { "etiqueta": "Quien calcula con operadores", "rol": "Sumar, restar, multiplicar, elevar", "descripcion": "Los operadores aritméticos básicos, más % (resto) y ** (potencia)." },
    { "etiqueta": "Quien controla el orden de cálculo", "rol": "Precedencia y paréntesis", "descripcion": "El mismo conjunto de números, en orden distinto, puede dar un resultado completamente distinto." },
    { "etiqueta": "Quien evita concatenar por error", "rol": "Convertir texto a número antes de sumar", "descripcion": "+= con un valor que en realidad es una cadena de texto concatena en vez de sumar — un bug silencioso." }
  ]
}
```

## Operadores aritméticos básicos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(10 + 7);  // 17\n  console.log(20 - 15); // 5\n  console.log(3 * 7);   // 21\n  console.log(10 / 5);  // 2\n  console.log(8 % 3);   // 2 — el resto de dividir 8 entre 3\n  console.log(5 ** 2);  // 25 — 5 al cuadrado\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(8 % 3);   // 2 — el resto de dividir 8 entre 3", "nota": "% (módulo) no divide — devuelve lo que SOBRA de la división. Útil para saber si un número es par (n % 2 === 0) o para repetir un patrón cada n elementos." },
    { "fragmento": "console.log(5 ** 2);  // 25 — 5 al cuadrado", "nota": "** eleva el primer número a la potencia del segundo — la forma moderna de escribir Math.pow(5, 2)." }
  ]
}
```

## Precedencia: qué se calcula primero

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(2 + 3 ** 2);   // 11 — ** antes que +\n  console.log((2 + 3) ** 2); // 25 — los paréntesis cambian el orden\n\n  console.log(50 + 10 / 8 + 2); // 53.25 — / antes que +\n  console.log((50 + 10) / (8 + 2)); // 6\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(2 + 3 ** 2);   // 11 — ** antes que +", "nota": "El orden es el mismo que en matemáticas: paréntesis primero, luego potencias, luego *//%, y por último + y -. 3 ** 2 se calcula antes de sumarle el 2." },
    { "fragmento": "console.log((2 + 3) ** 2); // 25 — los paréntesis cambian el orden", "nota": "Los paréntesis siempre tienen la prioridad más alta — fuerzan a calcular 2 + 3 primero, antes de elevarlo al cuadrado." }
  ]
}
```

## Incremento y decremento: prefijo frente a sufijo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let a = 4;\n  console.log(a++); // 4 — devuelve el valor ANTES de incrementar\n  console.log(a);   // 5 — pero ya incrementó\n\n  let b = 4;\n  console.log(++b); // 5 — incrementa PRIMERO, y devuelve el nuevo valor\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(a++); // 4 — devuelve el valor ANTES de incrementar", "nota": "a++ (sufijo) SÍ incrementa a, pero la expresión en sí misma devuelve el valor que tenía justo ANTES del incremento." },
    { "fragmento": "console.log(++b); // 5 — incrementa PRIMERO, y devuelve el nuevo valor", "nota": "++b (prefijo) incrementa primero, y la expresión devuelve el valor YA incrementado. El valor final de la variable es el mismo en ambos casos — lo que cambia es qué devuelve la expresión en el momento." }
  ]
}
```

## Operadores de asignación compuesta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let x = 3;\n  x += 4; // x = x + 4 → 7\n  x -= 3; // x = x - 3 → 4\n  x *= 3; // x = x * 3 → 12\n  x /= 5; // x = x / 5 → 2.4\n</script>",
  "anotaciones": [
    { "fragmento": "x += 4; // x = x + 4 → 7", "nota": "Un atajo para \"tomar x, operarlo, y volver a guardarlo en x\" — evita repetir el nombre de la variable dos veces." }
  ]
}
```

## La trampa: += con un string disfrazado de número

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let miNumero = '74'; // llegó como texto, no como número\n  miNumero += 3;\n  console.log(miNumero); // '743' — concatenó, no sumó\n\n  // Arreglo: convertir explícitamente antes de operar\n  let otroNumero = '74';\n  otroNumero = Number(otroNumero) + 3;\n  console.log(otroNumero); // 77\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(miNumero); // '743' — concatenó, no sumó", "nota": "+= hereda el comportamiento de + — si cualquiera de los dos valores es una cadena de texto, concatena en vez de sumar. Un bug silencioso y muy real cuando un número llega desde un input HTML (siempre texto) sin convertir." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los operadores de comparación tienen su propia lección",
  "contenido": "===, !==, <, >, <=, >= devuelven true o false, y aparecen constantemente dentro de condicionales. La siguiente lección de este mismo temario entra a fondo en cómo comparan, y en la diferencia real entre == y ===."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(2 + 3 ** 2);\n  console.log((2 + 3) ** 2);\n</script>",
  "opciones": [
    "11 y luego 25 — ** tiene más prioridad que +, salvo que los paréntesis cambien el orden",
    "25 las dos veces, porque + y ** tienen la misma prioridad",
    "Un error en la segunda línea, porque ** no se puede usar dentro de paréntesis"
  ],
  "correcta": 0,
  "explicacion": "** se calcula antes que + (2 + 3**2 = 2 + 9 = 11). Los paréntesis en la segunda línea fuerzan a sumar primero (2+3=5), y luego elevar ese resultado al cuadrado (5**2 = 25)."
}
```

## Lo que estos operadores NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Todos los operadores aritméticos tienen la misma prioridad, se evalúan de izquierda a derecha sin más",
      "realidad": "** y */% tienen más prioridad que + y -; los paréntesis fuerzan un orden distinto cuando hace falta."
    },
    {
      "mito": "num++ y ++num hacen exactamente lo mismo",
      "realidad": "Como expresión, num++ devuelve el valor ANTES de incrementar; ++num lo devuelve DESPUÉS — el valor final de num es igual, pero lo que devuelve la expresión no."
    },
    {
      "mito": "+= siempre suma numéricamente, sin importar los tipos involucrados",
      "realidad": "Si alguno de los dos valores es una cadena de texto, += concatena en vez de sumar — '74' += 3 da '743', no 77."
    },
    {
      "mito": "3++ es una forma válida de incrementar el número 3",
      "realidad": "++ solo se puede aplicar a una VARIABLE existente, nunca directamente a un literal numérico."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir la prioridad de ** con la de + o -.", "texto": "** siempre se calcula antes, salvo que los paréntesis digan lo contrario." },
    { "titulo": "No convertir con Number() antes de sumar un valor que llegó como texto.", "texto": "Un valor de un input HTML siempre llega como string, aunque parezca un número." },
    { "titulo": "Confundir num++ (postfijo) con ++num (prefijo) al usar el valor de la expresión.", "texto": "El valor final de la variable es igual, pero lo que devuelve la expresión en ese instante no." },
    { "titulo": "Aplicar ++ o -- directamente sobre un literal en vez de una variable.", "texto": "3++ es un error de sintaxis, no una forma válida de sumar 1." }
  ]
}
```

## Ejercicios

1. Calcula `2 + 3 ** 2` a mano, y luego `(2 + 3) ** 2` — explica la diferencia.
2. Escribe una variable con `let`, y usa `+=` para sumarle 5 y luego `*=` para multiplicarla por 2.
3. Explica qué produce `"74" + 3`, y cómo arreglarlo para que sume numéricamente en vez de concatenar.
4. Explica la diferencia entre `num++` y `++num` como expresiones, no solo en el valor final de la variable.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Basic math in JavaScript — numbers and operators",
      "descripcion": "Guía de MDN sobre operadores aritméticos, precedencia, incremento/decremento, asignación compuesta y la conversión de texto a número.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Math",
      "etiqueta": "MDN"
    }
  ]
}
```
