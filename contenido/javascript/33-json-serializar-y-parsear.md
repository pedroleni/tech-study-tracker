# JSON: serializar y parsear

- **Módulo:** Arrays y colecciones a fondo
- **Slug:** `json-serializar-y-parsear` (autogenerado del título)
- **Orden:** 98
- **Fuentes:** [Working with JSON (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON) + [JSON.stringify() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — ver `contenido/javascript/TEMARIO.md` #33

---

## Qué es y para qué sirve

Cierra el módulo de colecciones. JSON (JavaScript Object Notation) es un formato de texto para representar datos estructurados — pensado para transmitirse por red o guardarse en un archivo, no para trabajarse directamente como un objeto de JavaScript. **Serializar** convierte un objeto en texto JSON; **parsear** hace lo contrario.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita convertir entre objeto y texto",
  "roles": [
    { "etiqueta": "Quien serializa", "rol": "JSON.stringify()", "descripcion": "Convierte un objeto (o array) de JavaScript en una cadena de texto — el formato pensado para transmitir datos." },
    { "etiqueta": "Quien parsea", "rol": "JSON.parse()", "descripcion": "Hace lo contrario: convierte una cadena JSON en un objeto real de JavaScript, listo para usar con la notación normal." },
    { "etiqueta": "Quien escribe JSON a mano", "rol": "Una sintaxis más estricta", "descripcion": "JSON no es exactamente lo mismo que un objeto literal de JS — comillas dobles obligatorias, sin comas finales, sin comentarios." }
  ]
}
```

## JSON.stringify(): de objeto a texto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32, activo: true };\n  const texto = JSON.stringify(persona);\n\n  console.log(texto);        // '{\"nombre\":\"Ada\",\"edad\":32,\"activo\":true}'\n  console.log(typeof texto); // 'string' — ya no es un objeto, es texto\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(typeof texto); // 'string' — ya no es un objeto, es texto", "nota": "El resultado de JSON.stringify() es siempre un STRING — aunque su contenido se parezca a un objeto, no se puede acceder a texto.nombre directamente; hay que parsearlo primero." }
  ]
}
```

## JSON.parse(): de texto a objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const texto = '{\"nombre\":\"Ada\",\"edad\":32}';\n  const persona = JSON.parse(texto);\n\n  console.log(persona);        // { nombre: 'Ada', edad: 32 }\n  console.log(typeof persona); // 'object' — ya es un objeto normal de JavaScript\n  console.log(persona.nombre); // 'Ada' — se accede con notación normal\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(persona.nombre); // 'Ada' — se accede con notación normal", "nota": "Tras parsear, persona es un objeto de JavaScript como cualquier otro — accesible con notación de punto o corchetes, sin ninguna diferencia con un objeto creado a mano." }
  ]
}
```

## Indentar para que sea legible

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const configuracion = { tema: 'oscuro', notificaciones: true };\n  console.log(JSON.stringify(configuracion, null, 2));\n  // {\n  //   \"tema\": \"oscuro\",\n  //   \"notificaciones\": true\n  // }\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(JSON.stringify(configuracion, null, 2));", "nota": "El TERCER argumento controla la indentación para hacer el resultado legible — un número de espacios (hasta 10) o una cadena como '\\t'. El segundo argumento (null aquí) es el replacer, para filtrar o transformar propiedades." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "JSON es más estricto que un objeto literal de JS",
  "contenido": "Las claves y los strings van SIEMPRE entre comillas dobles, nunca simples; no se permite una coma tras el último elemento; y no se permite ningún comentario. Un objeto literal de JavaScript perfectamente válido no siempre es JSON válido — son sintaxis parecidas, no idénticas."
}
```

## Lo que JSON.stringify() omite o transforma en silencio

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const datos = {\n    nombre: 'Ada',\n    saludar: function () { return 'Hola'; },\n    extra: undefined,\n    imposible: NaN,\n    limite: Infinity,\n  };\n\n  console.log(JSON.stringify(datos));\n  // '{\"nombre\":\"Ada\",\"imposible\":null,\"limite\":null}'\n</script>",
  "anotaciones": [
    { "fragmento": "// '{\"nombre\":\"Ada\",\"imposible\":null,\"limite\":null}'", "nota": "saludar (una función) y extra (undefined) DESAPARECEN por completo — JSON no tiene forma de representarlos. NaN e Infinity no desaparecen, pero se convierten silenciosamente en null, porque tampoco son valores válidos en JSON." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const datos = { a: 1, b: undefined, c: function () {}, d: NaN };\n  const texto = JSON.stringify(datos);\n  console.log(texto);\n</script>",
  "opciones": [
    "'{\"a\":1,\"d\":null}' — b y c desaparecen (undefined y función no son representables), NaN se convierte en null",
    "'{\"a\":1,\"b\":null,\"c\":null,\"d\":null}' — cualquier valor no representable se convierte en null, sin desaparecer nunca",
    "Un error, porque undefined y las funciones no se pueden convertir a JSON"
  ],
  "correcta": 0,
  "explicacion": "JSON.stringify() OMITE por completo las propiedades cuyo valor es undefined o una función — ni siquiera aparecen en el resultado. NaN, en cambio, sí se conserva como clave, pero su valor se convierte silenciosamente en null, porque NaN no es un valor válido en JSON. Resultado: '{\"a\":1,\"d\":null}'."
}
```

## Lo que JSON NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "JSON acepta exactamente la misma sintaxis que un objeto literal de JavaScript",
      "realidad": "Es más estricto: comillas dobles obligatorias, sin comas finales, sin comentarios."
    },
    {
      "mito": "Las propiedades con valor undefined o una función lanzan un error al hacer stringify",
      "realidad": "Se omiten en silencio, sin ningún error — simplemente no aparecen en el resultado."
    },
    {
      "mito": "NaN e Infinity se omiten igual que undefined al hacer stringify",
      "realidad": "Se conservan como clave, pero su VALOR se convierte en null, en vez de desaparecer."
    },
    {
      "mito": "JSON.parse() devuelve un string con el mismo formato, solo validado",
      "realidad": "Devuelve un objeto (o array, o valor) real de JavaScript, listo para usar con la notación normal."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir JSON con comillas simples o comas finales, como en un objeto literal de JS.", "texto": "JSON exige comillas dobles y no admite ninguna coma tras el último elemento." },
    { "titulo": "Esperar que una función o undefined sobrevivan a JSON.stringify().", "texto": "Ambos se omiten por completo del resultado, sin ningún aviso." },
    { "titulo": "Olvidar que NaN e Infinity se convierten en null, en vez de desaparecer.", "texto": "A diferencia de undefined y las funciones, su clave sí permanece en el resultado." },
    { "titulo": "No usar el tercer argumento de JSON.stringify() para depurar datos de forma legible.", "texto": "Sin él, el resultado es una única línea comprimida, difícil de leer a simple vista." }
  ]
}
```

## Ejercicios

1. Convierte un objeto con varias propiedades a JSON con `JSON.stringify()`, y vuelve a convertirlo a objeto con `JSON.parse()`.
2. Usa el tercer argumento de `JSON.stringify()` para obtener una versión indentada y legible de un objeto.
3. Añade una propiedad con una función y otra con `undefined` a un objeto, y comprueba qué le pasa a cada una al hacer stringify.
4. Explica qué le ocurre a `NaN` e `Infinity` al convertir a JSON un objeto que las contiene.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Convierte un objeto a JSON con JSON.stringify() y vuelve a convertirlo con JSON.parse() (ejercicio 1). Usa el tercer argumento de stringify() para una versión indentada (ejercicio 2). Comprueba qué pasa con una función y con undefined al hacer stringify (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst persona = { nombre: 'Ada', edad: 30, saludar: function () {}, extra: undefined };\nconst texto = JSON.stringify(persona);\nmostrar('Serializado: ' + texto);\nmostrar('Deserializado: ');\nmostrar(JSON.parse(texto));\n\nmostrar('Con indentación:');\nmostrar(JSON.stringify({ a: 1, b: 2 }, null, 2));",
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
      "titulo": "Working with JSON",
      "descripcion": "Guía de MDN sobre qué es JSON, JSON.parse() y JSON.stringify(), y las restricciones de sintaxis de JSON frente a un objeto literal de JavaScript.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON",
      "etiqueta": "MDN"
    },
    {
      "titulo": "JSON.stringify()",
      "descripcion": "Referencia de MDN sobre el tercer argumento (espaciado) de JSON.stringify(), usado para producir un resultado indentado y legible.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      "etiqueta": "MDN"
    }
  ]
}
```
