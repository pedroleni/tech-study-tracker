# null, undefined, BigInt y Symbol

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `null-undefined-bigint-y-symbol` (autogenerado del título)
- **Orden:** 17
- **Fuentes:** [Null and undefined values (web.dev)](https://web.dev/learn/javascript/data-types/null-undefined) + [BigInt (web.dev)](https://web.dev/learn/javascript/data-types/bigint) + [Symbols (web.dev)](https://web.dev/learn/javascript/data-types/symbol) — ver `contenido/javascript/TEMARIO.md` #6

---

## Qué es y para qué sirve

Cuatro tipos primitivos menos frecuentes en el día a día, pero cada uno resuelve un problema real: `null` y `undefined` representan dos formas distintas de "nada"; `BigInt` permite enteros más allá del límite seguro de `Number`; `Symbol` crea identificadores que nunca colisionan entre sí.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que number, string y boolean",
  "roles": [
    { "etiqueta": "Quien distingue vacío de no asignado", "rol": "null frente a undefined", "descripcion": "undefined significa que nunca se asignó nada; null es una ausencia de valor asignada A PROPÓSITO." },
    { "etiqueta": "Quien necesita enteros muy grandes", "rol": "Más allá del límite seguro de Number", "descripcion": "BigInt permite operar con enteros que Number redondearía sin avisar." },
    { "etiqueta": "Quien crea identificadores únicos", "rol": "Claves de propiedad que nunca colisionan", "descripcion": "Cada Symbol() es único, incluso si dos comparten la misma descripción de texto." }
  ]
}
```

## null frente a undefined

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos formas distintas de \"nada\"",
  "contenido": "undefined significa que algo NUNCA recibió un valor — una variable declarada sin inicializar, una función sin return, un return sin ningún valor detrás. null, en cambio, hay que asignarlo explícitamente: es una forma de decir \"este valor está vacío A PROPÓSITO\", una decisión de quien escribe el código, no una ausencia accidental."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let sinAsignar;\n  console.log(sinAsignar); // undefined\n\n  function sinRetorno() {}\n  console.log(sinRetorno()); // undefined\n\n  let vacioApropósito = null;\n  console.log(vacioApropósito); // null\n</script>",
  "anotaciones": [
    { "fragmento": "let sinAsignar;\n  console.log(sinAsignar); // undefined", "nota": "Nadie decidió activamente este undefined — simplemente, todavía no se le asignó nada." },
    { "fragmento": "let vacioApropósito = null;\n  console.log(vacioApropósito); // null", "nota": "Aquí SÍ hubo una decisión explícita: null se asigna a mano, nunca aparece solo." }
  ]
}
```

## El bug histórico de typeof null

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(typeof null); // 'object' — no 'null'\n\n  console.log(null == undefined);  // true\n  console.log(null === undefined); // false\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(typeof null); // 'object' — no 'null'", "nota": "Un error conocido desde la primerísima versión de JavaScript, dejado sin corregir a propósito para no romper código ya existente que dependía de este comportamiento." },
    { "fragmento": "console.log(null == undefined);  // true", "nota": "== compara con coerción: convierte ambos a un valor equivalente antes de comparar, y los considera iguales." },
    { "fragmento": "console.log(null === undefined); // false", "nota": "=== no convierte nada — null y undefined son tipos distintos, así que nunca son estrictamente iguales." }
  ]
}
```

## BigInt: enteros más allá del límite seguro

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(9999999999999999); // 10000000000000000 — redondeado, sin avisar\n\n  const numeroGrande = 9999999999999999n; // sufijo n\n  const otro = BigInt('9999999999999999');  // o la función BigInt()\n\n  console.log(numeroGrande); // 9999999999999999n, exacto\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(9999999999999999); // 10000000000000000 — redondeado, sin avisar", "nota": "Number pierde precisión más allá de Number.MAX_SAFE_INTEGER — este entero se redondea silenciosamente, sin ningún error ni aviso." },
    { "fragmento": "const numeroGrande = 9999999999999999n; // sufijo n", "nota": "La n al final convierte el literal en un BigInt — un tipo primitivo distinto, capaz de representar enteros arbitrariamente grandes con precisión exacta." }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const bigA = 10n;\n  const numeroNormal = 5;\n\n  console.log(bigA + 5n);          // 15n — correcto\n  console.log(bigA + numeroNormal); // TypeError: Cannot mix BigInt and other types\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(bigA + numeroNormal); // TypeError: Cannot mix BigInt and other types", "nota": "BigInt y Number no se pueden mezclar directamente en una operación — hay que convertir explícitamente uno al tipo del otro antes de operar." }
  ]
}
```

## Symbol: identificadores que nunca colisionan

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const idA = Symbol('id');\n  const idB = Symbol('id');\n\n  console.log(idA === idB); // false — misma descripción, símbolos distintos\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(idA === idB); // false — misma descripción, símbolos distintos", "nota": "La descripción ('id') es solo una etiqueta legible para depurar — no afecta a la identidad del symbol. Cada llamada a Symbol() crea un valor completamente único, sin excepción." }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const claveSecreta = Symbol('privado');\n  const objeto = {};\n\n  objeto[claveSecreta] = 'valor protegido';\n  // Ninguna otra parte del código puede recrear claveSecreta por accidente\n</script>",
  "anotaciones": [
    { "fragmento": "objeto[claveSecreta] = 'valor protegido';", "nota": "El uso típico de Symbol: una clave de propiedad que ningún otro código puede sobrescribir sin querer, porque no puede reconstruir el mismo symbol a partir de su descripción." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(typeof null);\n  console.log(null == undefined);\n  console.log(null === undefined);\n</script>",
  "opciones": [
    "'object', true, false — typeof null es un bug histórico, y == compara con coerción mientras === no",
    "'null', true, true — los tres deberían coincidir con lo que representan conceptualmente",
    "'undefined', false, false — null y undefined son exactamente el mismo valor"
  ],
  "correcta": 0,
  "explicacion": "typeof null devuelve 'object' por un bug histórico nunca corregido. null == undefined es true porque == compara con coerción de tipos. null === undefined es false porque son tipos primitivos distintos, y === no convierte nada."
}
```

## Lo que estos cuatro NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "null y undefined son exactamente lo mismo, dos formas de decir 'nada'",
      "realidad": "undefined significa que nunca se asignó ningún valor; null es una ausencia de valor asignada A PROPÓSITO por quien escribe el código."
    },
    {
      "mito": "typeof null debería devolver 'null', y si no, es un error del código",
      "realidad": "Es un bug conocido desde la primera versión del lenguaje, dejado sin corregir a propósito para no romper código ya existente."
    },
    {
      "mito": "Se puede sumar directamente un BigInt con un Number normal",
      "realidad": "Mezclar los dos tipos en una operación lanza un error — hay que convertir uno al tipo del otro antes de operar."
    },
    {
      "mito": "Dos Symbol() con la misma descripción de texto son iguales entre sí",
      "realidad": "La descripción es solo una etiqueta para depurar — cada llamada a Symbol() crea un valor único, nunca igual a otro."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir null con undefined al comprobar si algo \"no tiene valor\".", "texto": "Uno es intencional, el otro no — a veces esa distinción importa de verdad." },
    { "titulo": "Esperar que typeof null devuelva \"null\" en vez de \"object\".", "texto": "Un bug documentado, no algo que el código propio esté haciendo mal." },
    { "titulo": "Intentar mezclar BigInt y Number en la misma operación aritmética.", "texto": "Lanza un TypeError — hace falta convertir explícitamente antes." },
    { "titulo": "Esperar que dos Symbol() con la misma descripción sean iguales.", "texto": "La descripción es solo una etiqueta legible, no afecta a la identidad del symbol." }
  ]
}
```

## Ejercicios

1. Escribe un ejemplo donde `undefined` aparezca sin que nadie lo haya asignado explícitamente.
2. Explica la diferencia entre `null == undefined` y `null === undefined`.
3. Escribe un `BigInt` usando el sufijo `n`, y súmalo correctamente a otro `BigInt`.
4. Explica por qué `Symbol('id') === Symbol('id')` da `false`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un ejemplo donde undefined aparezca sin que nadie lo haya asignado (ejercicio 1). Compara null == undefined y null === undefined (ejercicio 2). Suma dos BigInt con el sufijo n (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nlet variableSinValor;\nmostrar(variableSinValor);\n\nmostrar(null == undefined);\nmostrar(null === undefined);\n\nconst grande = 900719925474099100n;\nmostrar(grande + 1n);",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Null and undefined values",
      "descripcion": "Capítulo de web.dev sobre la diferencia conceptual entre null y undefined, y el bug histórico de typeof null.",
      "url": "https://web.dev/learn/javascript/data-types/null-undefined",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "BigInt",
      "descripcion": "Capítulo de web.dev sobre el límite de precisión de Number y cómo BigInt lo resuelve.",
      "url": "https://web.dev/learn/javascript/data-types/bigint",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Symbols",
      "descripcion": "Capítulo de web.dev sobre Symbol(), la unicidad garantizada, y su uso como clave de propiedad segura.",
      "url": "https://web.dev/learn/javascript/data-types/symbol",
      "etiqueta": "web.dev"
    }
  ]
}
```
