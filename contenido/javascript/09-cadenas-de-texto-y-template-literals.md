# Cadenas de texto y template literals

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `cadenas-de-texto-y-template-literals` (autogenerado del título)
- **Orden:** 26
- **Fuentes:** [Handling text — strings in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings) + [Strings (web.dev)](https://web.dev/learn/javascript/data-types/string) — ver `contenido/javascript/TEMARIO.md` #9

---

## Qué es y para qué sirve

Un string es texto entre comillas — simples, dobles, o backticks. Las dos primeras son completamente intercambiables; los backticks abren la puerta a algo que las otras dos no pueden hacer: interpolar variables y expresiones directamente dentro del texto.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién construye texto con datos variables",
  "roles": [
    { "etiqueta": "Quien construye texto con variables", "rol": "Insertar datos dentro de un mensaje", "descripcion": "Un template literal evita concatenar trozo a trozo con +." },
    { "etiqueta": "Quien evita concatenar con +", "rol": "Preferir ${} cuando hay varias piezas", "descripcion": "Cuantas más piezas hay que unir, más se nota la diferencia de legibilidad frente a +." },
    { "etiqueta": "Quien etiqueta un template literal", "rol": "Procesar el texto con una función propia", "descripcion": "Un tagged template deja que una función controle cómo se construye el resultado final." }
  ]
}
```

## Comillas: simples, dobles, backticks

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const a = 'Comillas simples';\n  const b = \"Comillas dobles\";   // igual que a\n  const c = `Backticks`;          // también igual, como texto simple\n</script>",
  "anotaciones": [
    { "fragmento": "const b = \"Comillas dobles\";   // igual que a", "nota": "Comillas simples y dobles se comportan exactamente igual — la elección es solo de estilo, salvo cuando el propio texto contiene una de las dos." }
  ]
}
```

## Escapar comillas con contrabarra

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const frase = 'No tengo\\'l derecho a mi sitio…'; // \\' escapa la comilla\n\n  // Alternativa más simple: usar el otro tipo de comilla\n  const otra = \"Ella dijo \\\"lo pienso así\\\"\";\n  const mejor = 'Ella dijo \"lo pienso así\"'; // sin ningún escape\n</script>",
  "anotaciones": [
    { "fragmento": "const frase = 'No tengo\\'l derecho a mi sitio…'; // \\' escapa la comilla", "nota": "\\ antes de una comilla del mismo tipo que envuelve el string evita que el motor la interprete como el cierre del string." },
    { "fragmento": "const mejor = 'Ella dijo \"lo pienso así\"'; // sin ningún escape", "nota": "A menudo la forma más simple es usar el OTRO tipo de comilla para envolver el string, evitando el escape por completo." }
  ]
}
```

## Concatenar con +

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const saludo = 'Hola';\n  const nombre = 'Bob';\n  console.log(saludo + ', ' + nombre); // 'Hola, Bob'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(saludo + ', ' + nombre); // 'Hola, Bob'", "nota": "Funciona, pero cuantas más piezas hay que unir, más difícil de leer se vuelve — sobre todo comparado con un template literal equivalente." }
  ]
}
```

## Template literals: interpolación con ${}

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cancion = 'Fight the Youth';\n  const nota = 9;\n  const notaMaxima = 10;\n\n  const salida = `Le doy a ${cancion} un ${(nota / notaMaxima) * 100}%.`;\n  console.log(salida); // 'Le doy a Fight the Youth un 90%.'\n</script>",
  "anotaciones": [
    { "fragmento": "`Le doy a ${cancion} un ${(nota / notaMaxima) * 100}%.`", "nota": "${} evalúa CUALQUIER expresión JavaScript válida, no solo el nombre de una variable — aquí, una operación matemática completa se resuelve e inserta directamente en el texto." }
  ]
}
```

## Multilínea sin \n

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const verso = `Un día por fin lo supiste,\ny empezaste,`;\n  console.log(verso);\n\n  // Sin template literal, haría falta escapar el salto de línea\n  const verso2 = 'Un día por fin lo supiste,\\ny empezaste,';\n</script>",
  "anotaciones": [
    { "fragmento": "const verso = `Un día por fin lo supiste,\ny empezaste,`;", "nota": "Los backticks admiten saltos de línea reales dentro del propio código — con comillas simples o dobles, haría falta un \\n explícito para lograr lo mismo." }
  ]
}
```

## Tagged templates: procesar el texto con una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function miEtiqueta(trozos, marcador) {\n    return `${trozos[0]}MODIFICADO ${marcador}.`;\n  }\n\n  const sustantivo = 'gato';\n  console.log(miEtiqueta`Tengo un ${sustantivo}`);\n</script>",
  "anotaciones": [
    { "fragmento": "function miEtiqueta(trozos, marcador) {", "nota": "Una función colocada justo antes de un template literal (sin paréntesis ni punto) lo procesa por dentro: recibe los trozos de texto fijo por un lado, y los valores interpolados por otro — control total sobre cómo se construye el resultado final." }
  ]
}
```

## String(): convertir sin crear un objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numero = 123;\n  const comoTexto = String(numero);\n  console.log(typeof comoTexto); // 'string'\n\n  // Evitar: new String() crea un OBJETO, no un primitivo\n  const objeto = new String(numero);\n  console.log(typeof objeto); // 'object'\n</script>",
  "anotaciones": [
    { "fragmento": "const objeto = new String(numero);\n  console.log(typeof objeto); // 'object'", "nota": "new String() envuelve el valor en un objeto — con overhead y comportamiento distinto al primitivo. String() sin new (o simplemente el literal) es casi siempre la opción correcta." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const cancion = 'Fight the Youth';\n  const nota = 9;\n  const notaMaxima = 10;\n  console.log(`Le doy a ${cancion} un ${(nota / notaMaxima) * 100}%.`);\n</script>",
  "opciones": [
    "Le doy a Fight the Youth un 90%.",
    "Le doy a ${cancion} un ${(nota / notaMaxima) * 100}%. — con las llaves literales, sin evaluar nada",
    "Un error de sintaxis, porque solo se puede interpolar una variable suelta, nunca una expresión completa"
  ],
  "correcta": 0,
  "explicacion": "${} evalúa cualquier expresión válida de JavaScript, no solo el nombre de una variable — (nota / notaMaxima) * 100 se calcula (90) y se inserta directamente en el texto final."
}
```

## Lo que los template literals NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Solo se pueden interpolar variables dentro de ${}, nunca expresiones completas",
      "realidad": "${} evalúa cualquier expresión JavaScript válida — una suma, una llamada a función, un cálculo completo, no solo el nombre de una variable."
    },
    {
      "mito": "new String('hola') es lo mismo que 'hola'",
      "realidad": "new String() crea un OBJETO que envuelve el string, con overhead y comportamiento distinto — se recomienda evitarlo casi siempre."
    },
    {
      "mito": "Las comillas simples y dobles se comportan de forma distinta",
      "realidad": "Son completamente intercambiables — la única diferencia real de sintaxis está en los backticks."
    },
    {
      "mito": "Los template literals solo sirven para insertar variables, sin ninguna otra ventaja",
      "realidad": "También permiten strings multilínea sin \\n, y admiten tagged templates — funciones que procesan el literal antes de construir el resultado."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Concatenar con + cuando un template literal sería más legible.", "texto": "Cuantas más piezas hay que unir, más se nota la diferencia." },
    { "titulo": "Olvidar escapar una comilla del mismo tipo que envuelve al string.", "texto": "O, más simple, usar el otro tipo de comilla en vez de escapar." },
    { "titulo": "Usar new String() en vez del literal o de String() sin new.", "texto": "Crea un objeto con overhead, casi nunca lo que se pretendía." },
    { "titulo": "No aprovechar que ${} admite expresiones completas, no solo variables sueltas.", "texto": "Un cálculo entero puede resolverse directamente dentro del template literal." }
  ]
}
```

## Ejercicios

1. Escribe un string con una comilla simple dentro, usando comillas dobles para envolverlo sin necesitar ningún escape.
2. Escribe un template literal que interpole el resultado de una operación matemática, no solo una variable suelta.
3. Escribe un string multilínea usando backticks, sin ningún `\n`.
4. Explica la diferencia entre `String(10)` y `new String(10)`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Handling text — strings in JavaScript",
      "descripcion": "Guía de MDN sobre creación de strings, comillas, escape, concatenación y template literals.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Strings",
      "descripcion": "Capítulo de web.dev sobre inmutabilidad de strings, String() como coerción, y tagged templates.",
      "url": "https://web.dev/learn/javascript/data-types/string",
      "etiqueta": "web.dev"
    }
  ]
}
```
