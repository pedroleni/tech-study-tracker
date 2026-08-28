# Comparación de valores y coerción de tipos

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `comparacion-de-valores-y-coercion-de-tipos` (autogenerado del título)
- **Orden:** 23
- **Fuentes:** [Comparison operators (web.dev)](https://web.dev/learn/javascript/comparison) + [Equality comparisons and sameness (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness) — ver `contenido/javascript/TEMARIO.md` #8

---

## Qué es y para qué sirve

`==` compara convirtiendo tipos antes; `===` compara sin convertir nada. La diferencia parece pequeña hasta que aparecen casos como `[] == false` (true) o `null == 0` (false, a pesar de que `null == undefined` sí es true). Esta lección explica por qué, y por qué la recomendación casi universal es usar `===`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita comparar sin sorpresas",
  "roles": [
    { "etiqueta": "Quien compara sin coerción de tipos", "rol": "Usar === como opción por defecto", "descripcion": "Sin conversión automática de por medio, el resultado es mucho más fácil de predecir." },
    { "etiqueta": "Quien detecta coerciones sorprendentes", "rol": "Saber que == puede engañar", "descripcion": "[] == false da true — no por intuición, sino por reglas de conversión concretas que conviene conocer." },
    { "etiqueta": "Quien maneja el caso especial de NaN", "rol": "El único valor que no es igual a sí mismo", "descripcion": "NaN === NaN es false — rompe la intuición básica de que cualquier valor debería ser igual a sí mismo." }
  ]
}
```

## == frente a ===: la diferencia real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(2 == '2');  // true — coerciona '2' a número antes de comparar\n  console.log(2 === '2'); // false — tipos distintos, ni lo intenta\n  console.log(2 === 2);   // true — mismo valor, mismo tipo\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(2 == '2');  // true — coerciona '2' a número antes de comparar", "nota": "== convierte los operandos a un tipo común antes de comparar — aquí, la cadena '2' se convierte al número 2." },
    { "fragmento": "console.log(2 === '2'); // false — tipos distintos, ni lo intenta", "nota": "=== nunca convierte nada — si los tipos ya son distintos, el resultado es false sin más comprobación." }
  ]
}
```

## != y !==: la misma lógica, invertida

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(2 != '2');  // false — son == entre sí, así que != da false\n  console.log(2 !== '2'); // true — son de tipos distintos\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(2 != '2');  // false — son == entre sí, así que != da false", "nota": "!= usa la misma coerción que == por dentro, solo que invierte el resultado final." }
  ]
}
```

## Casos que sorprenden a casi todo el mundo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(0 == false);   // true\n  console.log('' == false);  // true\n  console.log('0' == 0);     // true\n  console.log([] == false);  // true — el array se convierte a '' primero\n</script>",
  "anotaciones": [
    { "fragmento": "console.log([] == false);  // true — el array se convierte a '' primero", "nota": "[] se convierte a la cadena vacía '' antes de comparar, y '' a su vez se convierte a 0 — dos pasos de coerción encadenados para llegar a un resultado que no es nada intuitivo a simple vista." }
  ]
}
```

## null == undefined, pero null == 0 es false

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(null == undefined); // true — caso especial en la propia especificación\n  console.log(null == 0);         // false — null NO se convierte a 0 con ==\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(null == undefined); // true — caso especial en la propia especificación", "nota": "Este es un caso especial escrito directamente en la especificación del lenguaje, no una consecuencia de una regla general de coerción." },
    { "fragmento": "console.log(null == 0);         // false — null NO se convierte a 0 con ==", "nota": "A pesar de que null == undefined sí es true, null NO se comporta como 0 con == — la coerción de null es mucho más limitada de lo que parece a primera vista." }
  ]
}
```

## La paradoja de NaN

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(NaN == NaN);  // false\n  console.log(NaN === NaN); // false — el único caso donde x !== x\n\n  console.log([NaN].indexOf(NaN)); // -1 — no lo encuentra\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(NaN === NaN); // false — el único caso donde x !== x", "nota": "NaN es el ÚNICO valor de todo JavaScript que no es igual a sí mismo, ni con == ni con ===. Rompe la intuición más básica sobre la igualdad." },
    { "fragmento": "console.log([NaN].indexOf(NaN)); // -1 — no lo encuentra", "nota": "indexOf() compara internamente con ===, así que nunca puede encontrar un NaN dentro de un array — una consecuencia directa y muy real de la paradoja anterior." }
  ]
}
```

## Object.is(): para los casos realmente especiales

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(Object.is(NaN, NaN)); // true — a diferencia de === y ==\n  console.log(Object.is(+0, -0));   // false — distingue el signo del cero\n  console.log(Object.is(0, '0'));   // false — sin coerción, como ===\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Object.is(NaN, NaN)); // true — a diferencia de === y ==", "nota": "Object.is() existe justo para estos casos raros donde ni == ni === dan el resultado esperado — comparar si dos valores son literalmente el MISMO valor, incluido NaN consigo mismo." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(null == undefined);\n  console.log(null == 0);\n  console.log(NaN === NaN);\n</script>",
  "opciones": [
    "true, false, false — null solo es == a undefined (caso especial), nunca a 0; y NaN nunca es igual a sí mismo, ni con ===",
    "true, true, true — null y NaN se comportan como 0 en cualquier comparación",
    "false, false, true — null y undefined son de tipos distintos, así que nunca son ni siquiera == entre sí"
  ],
  "correcta": 0,
  "explicacion": "null == undefined es un caso especial escrito en la propia especificación (true), pero null == 0 es false porque null no se coerciona a número con ==. NaN === NaN es false — el único caso en todo el lenguaje donde un valor no es igual a sí mismo."
}
```

## Lo que == y === NO garantizan

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si dos valores son == entre sí, cualquier otro valor 'equivalente' también lo será",
      "realidad": "null == undefined es true, pero null == 0 es false — la coerción de == no sigue una lógica transitiva simple."
    },
    {
      "mito": "NaN === NaN debería ser true, porque es el mismo valor especial",
      "realidad": "Es el único caso en JavaScript donde x !== x da true — NaN nunca es igual a sí mismo, ni con == ni con ===."
    },
    {
      "mito": "indexOf() puede usarse para buscar NaN dentro de un array",
      "realidad": "[NaN].indexOf(NaN) devuelve -1, precisamente porque indexOf compara internamente con ===, y NaN nunca es === a sí mismo."
    },
    {
      "mito": "== es más rápido que === porque hace menos comprobaciones",
      "realidad": "Al contrario — === es más predecible, y en motores modernos la diferencia de rendimiento es insignificante."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar == por costumbre en vez de === como opción por defecto.", "texto": "La recomendación casi universal es usar === salvo una razón concreta para lo contrario." },
    { "titulo": "Asumir que null == 0 es true porque null == undefined lo es.", "texto": "Son reglas de coerción distintas — una no implica la otra." },
    { "titulo": "Intentar buscar NaN con indexOf() en vez de un método pensado para ese caso.", "texto": "indexOf compara con ===, que nunca detecta un NaN." },
    { "titulo": "No conocer Object.is() para los casos raros donde de verdad hace falta.", "texto": "Distinguir NaN de sí mismo, o +0 de -0, son justo los casos para los que existe." }
  ]
}
```

## Ejercicios

1. Explica por qué `"0" == 0` es `true` pero `"0" === 0` es `false`.
2. Explica por qué `null == 0` es `false`, a pesar de que `null == undefined` es `true`.
3. Escribe un ejemplo que demuestre por qué `NaN === NaN` es `false`.
4. Explica para qué sirve `Object.is()`, y en qué se diferencia de `===` en el caso de `NaN`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Comparison operators",
      "descripcion": "Capítulo del curso Learn JavaScript de web.dev sobre ==, ===, != y !==, y las reglas básicas de coerción.",
      "url": "https://web.dev/learn/javascript/comparison",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Equality comparisons and sameness",
      "descripcion": "Guía de referencia de MDN sobre los casos sorprendentes de ==, la paradoja de NaN, y Object.is() como alternativa.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      "etiqueta": "MDN"
    }
  ]
}
```
