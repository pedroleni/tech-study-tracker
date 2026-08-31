# Tipos de datos primitivos: number, string y boolean

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `tipos-de-datos-primitivos-number-string-y-boolean` (autogenerado del título)
- **Orden:** 14
- **Fuentes:** [Data types and structures (web.dev)](https://web.dev/learn/javascript/data-types) + [Numbers (web.dev)](https://web.dev/learn/javascript/data-types/number) + [Booleans (web.dev)](https://web.dev/learn/javascript/data-types/boolean) — ver `contenido/javascript/TEMARIO.md` #5

---

## Qué es y para qué sirve

JavaScript tiene siete tipos primitivos: number, string, boolean, null, undefined, BigInt y Symbol. Esta lección cubre los tres más habituales — number, string y boolean — con un rasgo que comparten los siete: son inmutables. El valor `5` siempre representa `5`; lo que cambia es a qué valor apunta una variable, nunca el valor primitivo en sí.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita elegir bien el tipo de dato",
  "roles": [
    { "etiqueta": "Quien elige el tipo de dato correcto", "rol": "Number, string o boolean según el caso", "descripcion": "Cada tipo tiene sus propias reglas de conversión y comparación — confundirlas produce bugs sutiles." },
    { "etiqueta": "Quien evita la trampa de new Boolean", "rol": "Usar el primitivo, no el objeto", "descripcion": "new Boolean(false) es, paradójicamente, un valor truthy — una trampa real, no teórica." },
    { "etiqueta": "Quien interpola texto con plantillas", "rol": "Insertar variables dentro de un string", "descripcion": "Los template literals evitan concatenar con + para construir un mensaje con datos variables." }
  ]
}
```

## Números: un único tipo para todo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let entero = 42;\n  let decimal = 3.14;\n  // Los dos son EXACTAMENTE el mismo tipo: number\n</script>",
  "anotaciones": [
    { "fragmento": "// Los dos son EXACTAMENTE el mismo tipo: number", "nota": "JavaScript no distingue entre enteros y decimales como hacen otros lenguajes — usa un único tipo, coma flotante de 64 bits (IEEE 754), para representar cualquier número." }
  ]
}
```

## El problema de precisión que sorprende a todo el mundo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(0.1 + 0.7); // 0.7999999999999999\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(0.1 + 0.7); // 0.7999999999999999", "nota": "No es un bug de JavaScript — es una consecuencia de representar decimales en binario, algo que comparten prácticamente todos los lenguajes con coma flotante de 64 bits. Nunca comparar sumas de decimales con === esperando exactitud perfecta." }
  ]
}
```

## NaN e Infinity

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(10 / 0);      // Infinity\n  console.log('dos' * 2);   // NaN\n  console.log(Number('10')); // 10\n  console.log(Number('abc')); // NaN\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(10 / 0);      // Infinity", "nota": "Dividir entre cero no lanza un error — da Infinity. JavaScript distingue mayúsculas: infinity (minúscula) sería un ReferenceError." },
    { "fragmento": "console.log('dos' * 2);   // NaN", "nota": "NaN (\"Not a Number\") aparece cuando una operación matemática no puede dar un resultado numérico válido — aquí, multiplicar un texto no numérico." }
  ]
}
```

## Cadenas de texto: comillas y plantillas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const a = \"Hola\";\n  const b = 'Hola';       // Igual que a, comillas intercambiables\n  const c = `Hola`;       // Backticks: template literal\n\n  const nombre = 'Ada';\n  const saludo = `Hola, ${nombre}. El resultado es ${2 + 4}.`;\n</script>",
  "anotaciones": [
    { "fragmento": "const b = 'Hola';       // Igual que a, comillas intercambiables", "nota": "Comillas simples y dobles se comportan exactamente igual — la elección es solo de estilo, salvo cuando el propio texto contiene una de las dos." },
    { "fragmento": "const saludo = `Hola, ${nombre}. El resultado es ${2 + 4}.`;", "nota": "${} dentro de backticks INSERTA el resultado de cualquier expresión directamente en el texto — sin necesitar concatenar con +, y admitiendo saltos de línea sin escape." }
  ]
}
```

## Booleanos: true, false, y los valores falsy

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La lista completa de valores falsy",
  "contenido": "Solo estos valores se convierten a false en un contexto booleano: 0, -0, null, undefined, NaN, la cadena vacía \"\", y el propio false. Cualquier otro valor —incluida la cadena \"false\" como texto, o cualquier objeto— es truthy."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "new Boolean() es una trampa real",
  "contenido": "Boolean(0) da el primitivo false, como se espera. Pero new Boolean(0) crea un OBJETO que ENVUELVE ese false — y todos los objetos son truthy en JavaScript, sin excepción. El resultado: new Boolean(false) se comporta como verdadero dentro de un if. La recomendación es simple: nunca usar new Boolean() como constructor."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(0.1 + 0.7);\n  console.log(0.1 + 0.7 === 0.8);\n</script>",
  "opciones": [
    "0.7999999999999999 y luego false — los números en JS son de coma flotante, y no toda fracción decimal se representa con exactitud",
    "0.8 y luego true, como cabría esperar de una suma normal",
    "Un error, porque JavaScript no permite sumar decimales directamente"
  ],
  "correcta": 0,
  "explicacion": "La representación binaria de coma flotante no puede almacenar 0.1 y 0.7 con precisión perfecta — la suma real acumula un pequeño margen de error, lo bastante para que === 0.8 dé false."
}
```

## Lo que estos tipos NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "JavaScript tiene un tipo separado para enteros y otro para decimales",
      "realidad": "Usa un único tipo numérico (coma flotante de 64 bits) para todo — de ahí que sumas simples como 0.1 + 0.7 no den exactamente el resultado esperado."
    },
    {
      "mito": "Cualquier cadena de texto no vacía es siempre verdadera en un condicional",
      "realidad": "Cierto casi siempre, salvo el caso obvio de \"\" vacía — pero incluso la cadena \"false\" (como texto) es truthy, aunque parezca que debería comportarse como el booleano false."
    },
    {
      "mito": "new Boolean(false) se comporta igual que el primitivo false",
      "realidad": "Crea un OBJETO, y todos los objetos son truthy — new Boolean(false) es, paradójicamente, verdadero en un condicional."
    },
    {
      "mito": "Las comillas simples y dobles para cadenas se comportan de forma distinta",
      "realidad": "Son completamente intercambiables — la diferencia real de sintaxis está en las comillas invertidas (template literals), que añaden interpolación y multilínea."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Comparar sumas de decimales con === esperando exactitud matemática perfecta.", "texto": "La coma flotante binaria acumula pequeños errores de precisión, algo compartido por casi todos los lenguajes." },
    { "titulo": "Usar new Boolean() en vez del primitivo o la función Boolean().", "texto": "Crea un objeto siempre truthy, incluso envolviendo false." },
    { "titulo": "Olvidar que \"false\" como cadena de texto es un valor truthy.", "texto": "Solo el booleano false, no el texto que lo describe, es falsy." },
    { "titulo": "Concatenar con + en vez de usar un template literal para insertar variables.", "texto": "Los backticks con ${} son más legibles y admiten expresiones directamente." }
  ]
}
```

## Ejercicios

1. Explica por qué `0.1 + 0.7` no da exactamente `0.8` en JavaScript.
2. Escribe la lista completa de valores falsy en JavaScript.
3. Escribe un template literal que inserte el resultado de una suma dentro de un texto.
4. Explica por qué `new Boolean(false)` es truthy en un condicional, a diferencia del primitivo `false`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Comprueba por qué 0.1 + 0.7 no da exactamente 0.8 (ejercicio 1). Escribe la lista de valores falsy (ejercicio 2). Escribe un template literal que inserte el resultado de una suma (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nmostrar(0.1 + 0.7);\n\nconst falsy = [false, 0, '', null, undefined, NaN];\nmostrar(falsy);\n\nconst a = 3, b = 4;\nmostrar(`La suma de ${a} y ${b} es ${a + b}`);",
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
      "titulo": "Data types and structures",
      "descripcion": "Capítulo del curso Learn JavaScript de web.dev con la lista de los siete tipos primitivos y su inmutabilidad.",
      "url": "https://web.dev/learn/javascript/data-types",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Numbers",
      "descripcion": "Capítulo de web.dev sobre el tipo number, la precisión de coma flotante, NaN e Infinity.",
      "url": "https://web.dev/learn/javascript/data-types/number",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Booleans",
      "descripcion": "Capítulo de web.dev sobre los valores truthy y falsy, y la trampa de new Boolean().",
      "url": "https://web.dev/learn/javascript/data-types/boolean",
      "etiqueta": "web.dev"
    }
  ]
}
```
