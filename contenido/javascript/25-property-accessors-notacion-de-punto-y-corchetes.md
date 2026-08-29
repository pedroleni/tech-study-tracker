# Property accessors: notación de punto y corchetes

- **Módulo:** Objetos
- **Slug:** `property-accessors-notacion-de-punto-y-corchetes` (autogenerado del título)
- **Orden:** 74
- **Fuentes:** [Property accessors (web.dev)](https://web.dev/learn/javascript/objects/property-accessors) — ver `contenido/javascript/TEMARIO.md` #25

---

## Qué es y para qué sirve

La lección anterior ya presentó la notación de punto y de corchetes. Esta profundiza en el porqué: qué hace válida o inválida una clave para cada notación, cómo construir un nombre de propiedad dinámicamente, y un primer vistazo al acceso seguro con `?.`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que el acceso básico",
  "roles": [
    { "etiqueta": "Quien profundiza en el acceso", "rol": "Por qué una notación falla y otra no", "descripcion": "No es cuestión de preferencia — depende de si la clave es un identificador válido." },
    { "etiqueta": "Quien construye claves dinámicas", "rol": "Concatenar dentro de los corchetes", "descripcion": "El nombre de una propiedad se puede construir sobre la marcha, no solo leerse de una variable ya existente." },
    { "etiqueta": "Quien accede sin lanzar errores", "rol": "Un primer vistazo a ?.", "descripcion": "Acceder a una propiedad anidada que podría no existir, sin que el código se rompa." }
  ]
}
```

## Por qué la notación de punto falla con ciertas claves

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const datos = { edad: 32, 'nombre completo': 'Ada Lovelace' };\n\n  console.log(datos.edad); // 32 — 'edad' es un identificador válido\n  // console.log(datos.nombre completo); // SyntaxError\n  console.log(datos['nombre completo']); // 'Ada Lovelace' — sí funciona\n</script>",
  "anotaciones": [
    { "fragmento": "// console.log(datos.nombre completo); // SyntaxError", "nota": "La notación de punto solo acepta claves que sean IDENTIFICADORES VÁLIDOS — sin espacios, sin empezar por un dígito. 'nombre completo' tiene un espacio, así que el punto ni siquiera es una opción." },
    { "fragmento": "console.log(datos['nombre completo']); // 'Ada Lovelace' — sí funciona", "nota": "Los corchetes evalúan lo que hay dentro como una cadena de texto — sin las restricciones de un identificador, cualquier clave es accesible." }
  ]
}
```

## Construir un nombre de propiedad dinámicamente

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const colores = { color1: 'rojo', color2: 'azul', color3: 'verde' };\n  const numero = 2;\n\n  console.log(colores['color' + numero]); // 'azul'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(colores['color' + numero]); // 'azul'", "nota": "'color' + numero se evalúa PRIMERO como una expresión normal ('color2'), y ESE resultado se usa como clave — los corchetes no se limitan a leer una variable ya existente, permiten construir el nombre sobre la marcha." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El valor entre corchetes se coerciona a texto",
  "contenido": "Sea cual sea el tipo del resultado dentro de los corchetes, se convierte a string antes de usarse como clave — por eso datos[10] y datos['10'] acceden exactamente a la misma propiedad, aunque uno parezca un número y el otro un texto."
}
```

## Un primer vistazo a optional chaining

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada' };\n\n  console.log(persona.direccion.ciudad); // TypeError — direccion no existe\n  console.log(persona.direccion?.ciudad); // undefined, sin ningún error\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(persona.direccion.ciudad); // TypeError — direccion no existe", "nota": "Sin ?., intentar leer .ciudad de algo que ya es undefined (direccion) lanza un error directo — el código se detiene ahí." },
    { "fragmento": "console.log(persona.direccion?.ciudad); // undefined, sin ningún error", "nota": "?. comprueba si lo anterior (direccion) es null o undefined ANTES de intentar seguir accediendo — si lo es, devuelve undefined directamente, en vez de lanzar un error." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El detalle completo llega más adelante",
  "contenido": "?. tiene su propia lección dedicada, junto a ?? (nullish coalescing), más adelante en el módulo de JavaScript moderno de este mismo temario — aquí solo hace falta saber que existe y qué problema resuelve."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const colores = { color1: 'rojo', color2: 'azul', color3: 'verde' };\n  const numero = 2;\n  console.log(colores['color' + numero]);\n</script>",
  "opciones": [
    "'azul' — los corchetes evalúan 'color' + numero como la expresión 'color2', y acceden a esa propiedad",
    "undefined — los corchetes no pueden combinar un string fijo con una variable dentro",
    "Un error de sintaxis, porque 'color' + numero no es un nombre de propiedad válido"
  ],
  "correcta": 0,
  "explicacion": "Dentro de los corchetes, 'color' + numero se evalúa como cualquier expresión normal: 'color' + 2 da 'color2'. Ese resultado, 'color2', es la clave real usada para acceder al objeto — colores['color2'] es 'azul'."
}
```

## Lo que estas notaciones NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La notación de punto puede acceder a cualquier nombre de propiedad, igual que los corchetes",
      "realidad": "Solo funciona con identificadores válidos — una clave como 'nombre completo' o '10' necesita corchetes."
    },
    {
      "mito": "Los corchetes solo sirven para acceder a una propiedad ya conocida por su nombre",
      "realidad": "También permiten CONSTRUIR el nombre de la propiedad dinámicamente, concatenando strings y variables dentro."
    },
    {
      "mito": "Optional chaining (?.) y la notación de punto normal son lo mismo, solo con un símbolo de más",
      "realidad": "?. evita lanzar un TypeError cuando la propiedad intermedia es null o undefined, devolviendo undefined en su lugar."
    },
    {
      "mito": "Cualquier expresión entre corchetes se evalúa igual sin importar el tipo",
      "realidad": "El resultado se COERCIONA a string antes de usarse como clave — datos[10] y datos['10'] acceden a la misma propiedad."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar notación de punto con una clave que no es un identificador válido.", "texto": "Un espacio o empezar por un dígito ya lo descarta como opción." },
    { "titulo": "No aprovechar los corchetes para construir nombres de propiedad dinámicos.", "texto": "Permiten mucho más que leer una variable ya existente con el nombre completo." },
    { "titulo": "Confundir optional chaining con la notación de punto normal.", "texto": "?. tiene un comportamiento genuinamente distinto frente a null o undefined." },
    { "titulo": "Olvidar que el valor entre corchetes se coerciona a string.", "texto": "Un número y su versión en texto acceden exactamente a la misma clave." }
  ]
}
```

## Ejercicios

1. Escribe un objeto con una clave que contenga un espacio, y accede a ella con corchetes.
2. Construye el nombre de una propiedad dinámicamente, concatenando un string fijo con una variable.
3. Explica por qué `datos.10` sería un error de sintaxis, mientras que `datos['10']` no lo es.
4. Escribe un acceso con optional chaining (`?.`) a una propiedad que podría no existir, sin que lance ningún error.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un objeto con una clave que contenga un espacio y accede con corchetes (ejercicio 1). Construye el nombre de una propiedad dinámicamente concatenando (ejercicio 2). Usa optional chaining en una propiedad que podría no existir (ejercicio 4).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst datos = { 'nombre completo': 'Ada Lovelace' };\nmostrar(datos['nombre completo']);\n\nconst prefijo = 'color';\nconst objeto = { colorFavorito: 'azul' };\nconst clave = prefijo + 'Favorito';\nmostrar(objeto[clave]);\n\nconst usuario = { perfil: null };\nmostrar(usuario.perfil?.direccion?.calle);",
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
      "titulo": "Property accessors",
      "descripcion": "Capítulo de web.dev sobre las reglas reales de la notación de punto, la construcción de claves dinámicas con corchetes, y optional chaining.",
      "url": "https://web.dev/learn/javascript/objects/property-accessors",
      "etiqueta": "web.dev"
    }
  ]
}
```
