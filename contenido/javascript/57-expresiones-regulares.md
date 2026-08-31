# Expresiones regulares

- **Módulo:** JavaScript moderno
- **Slug:** `expresiones-regulares` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [Regular expressions (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) — ver `contenido/javascript/TEMARIO.md` #57

---

## Qué es y para qué sirve

Una expresión regular describe un patrón de texto — para comprobar si algo coincide, encontrar dónde, o sustituirlo. JavaScript ofrece dos formas de crearlas, y varios métodos (en el propio regex o en los strings) según qué se necesite saber del resultado.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita describir un patrón de texto",
  "roles": [
    { "etiqueta": "Quien solo necesita sí o no", "rol": "test()", "descripcion": "Devuelve true o false — la comprobación más simple, sin detalles de la coincidencia." },
    { "etiqueta": "Quien necesita los detalles", "rol": "exec() / match()", "descripcion": "Devuelven la coincidencia real, su posición, y los grupos capturados." },
    { "etiqueta": "Quien sustituye texto", "rol": "replace() / replaceAll()", "descripcion": "replace() sin el flag g solo cambia la primera coincidencia; replaceAll() (o g) cambia todas." }
  ]
}
```

## Crear una expresión regular: literal o constructor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const patron1 = /ab+c/;               // literal — compilado al cargar el script\n  const patron2 = new RegExp('ab+c');   // constructor — compilado en tiempo de ejecución\n\n  console.log(patron1.test('abbbc')); // true\n  console.log(patron2.test('abbbc')); // true — mismo resultado, formas distintas\n</script>",
  "anotaciones": [
    { "fragmento": "const patron1 = /ab+c/;               // literal — compilado al cargar el script", "nota": "El literal /patron/ es preferible cuando el patrón es fijo, conocido de antemano en el código." },
    { "fragmento": "const patron2 = new RegExp('ab+c');   // constructor — compilado en tiempo de ejecución", "nota": "new RegExp('patron') es la opción cuando el patrón viene de una variable, o de una entrada del usuario, en tiempo de ejecución — no se puede escribir como literal si no se conoce de antemano." }
  ]
}
```

## Flags y sintaxis básica del patrón

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(/hola/i.test('¡HOLA mundo!')); // true — i ignora mayúsculas/minúsculas\n  console.log(/\\d{3}/.test('abc123'));        // true — \\d{3}: exactamente tres dígitos\n  console.log(/[a-z]/.test('ABC'));           // false — ninguna minúscula en el string\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(/hola/i.test('¡HOLA mundo!')); // true — i ignora mayúsculas/minúsculas", "nota": "El flag i hace la búsqueda insensible a mayúsculas/minúsculas — sin él, 'HOLA' no coincidiría con /hola/." },
    { "fragmento": "console.log(/\\d{3}/.test('abc123'));        // true — \\d{3}: exactamente tres dígitos", "nota": "\\d{3} combina una clase (\\d, cualquier dígito) con un CUANTIFICADOR ({3}, exactamente tres seguidos)." }
  ]
}
```

## test(): solo sí o no

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const contieneNumero = /\\d+/;\n  console.log(contieneNumero.test('sin números'));  // false\n  console.log(contieneNumero.test('tengo 5 gatos')); // true\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(contieneNumero.test('tengo 5 gatos')); // true", "nota": "test() devuelve simplemente true o false — la comprobación más simple, cuando solo interesa SABER si hay coincidencia, no dónde ni cuál." }
  ]
}
```

## exec() con el flag g: avanza en cada llamada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cadena = 'fee fi fo fum';\n  const patron = /\\w+\\s/g;\n\n  console.log(patron.exec(cadena)[0]); // 'fee '\n  console.log(patron.exec(cadena)[0]); // 'fi '\n  console.log(patron.exec(cadena)[0]); // 'fo '\n  console.log(patron.exec(cadena));    // null — ya no quedan más coincidencias\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(patron.exec(cadena)[0]); // 'fee '\n  console.log(patron.exec(cadena)[0]); // 'fi '", "nota": "Con el flag g, cada llamada a exec() sobre el MISMO patrón AVANZA a la siguiente coincidencia, recordando dónde se quedó la anterior — hasta devolver null cuando ya no hay más." }
  ]
}
```

## match() y matchAll(): todas de una vez

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cadena = 'fee fi fo fum';\n  console.log(cadena.match(/\\w+\\s/g)); // ['fee ', 'fi ', 'fo '] — todas de una vez\n\n  const coincidencias = cadena.matchAll(/\\w+\\s/g);\n  console.log([...coincidencias].length); // 3 — matchAll() devuelve un iterador\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(cadena.match(/\\w+\\s/g)); // ['fee ', 'fi ', 'fo '] — todas de una vez", "nota": "match() con el flag g devuelve TODAS las coincidencias de golpe, en un array — sin necesitar llamar varias veces como con exec()." },
    { "fragmento": "const coincidencias = cadena.matchAll(/\\w+\\s/g);\n  console.log([...coincidencias].length); // 3 — matchAll() devuelve un iterador", "nota": "matchAll() devuelve un ITERADOR (visto en la lección anterior) — útil cuando, además de cada coincidencia, interesan sus grupos capturados por separado." }
  ]
}
```

## replace() frente a replaceAll()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const frase = 'el sol y el color';\n\n  console.log(frase.replace(/o/, '0'));     // 'el s0l y el color' — solo la PRIMERA 'o'\n  console.log(frase.replaceAll(/o/g, '0')); // 'el s0l y el c0l0r' — TODAS las 'o'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(frase.replace(/o/, '0'));     // 'el s0l y el color' — solo la PRIMERA 'o'", "nota": "replace() sin el flag g solo sustituye la PRIMERA coincidencia, sin importar cuántas más haya en la cadena." },
    { "fragmento": "console.log(frase.replaceAll(/o/g, '0')); // 'el s0l y el c0l0r' — TODAS las 'o'", "nota": "replaceAll() (o replace() con el flag g) sustituye TODAS las coincidencias, no solo la primera." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const cadena = 'rojo verde azul';\n  const patron = /\\w+/g;\n\n  const primera = patron.exec(cadena);\n  const segunda = patron.exec(cadena);\n\n  console.log(primera[0], segunda[0]);\n</script>",
  "opciones": [
    "'rojo' y 'verde' — con el flag g, cada llamada a exec() sobre el mismo patrón avanza a la siguiente coincidencia",
    "'rojo' y 'rojo' — exec() siempre devuelve la primera coincidencia, sin importar cuántas veces se llame",
    "'rojo verde azul' y null — exec() devuelve toda la cadena en la primera llamada"
  ],
  "correcta": 0,
  "explicacion": "Con el flag g, el propio objeto regex RECUERDA dónde se quedó — cada llamada a exec() avanza a la siguiente coincidencia. La primera llamada devuelve 'rojo'; la segunda, ya avanzada, devuelve 'verde'."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "test() y exec() devuelven lo mismo, solo con nombres distintos",
      "realidad": "test() da true/false; exec() da un array con detalles (o null) — información distinta."
    },
    {
      "mito": "exec() siempre devuelve la primera coincidencia, sin importar cuántas veces se llame",
      "realidad": "Con el flag g, cada llamada avanza a la siguiente, recordando el progreso."
    },
    {
      "mito": "replace() sin el flag g sustituye todas las coincidencias, igual que replaceAll()",
      "realidad": "Sin g, replace() solo sustituye la PRIMERA."
    },
    {
      "mito": "new RegExp() y el literal /patron/ producen resultados distintos",
      "realidad": "Producen el mismo tipo de objeto y el mismo comportamiento — solo cambia cuándo se compila el patrón y de dónde viene."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar test() cuando en realidad se necesitan los detalles de la coincidencia.", "texto": "exec() o match() dan la posición y el texto real encontrado, no solo true/false." },
    { "titulo": "Olvidar el flag g y esperar que replace() sustituya todas las coincidencias.", "texto": "Sin g, siempre se detiene en la primera." },
    { "titulo": "No aprovechar que exec() con g recuerda su progreso entre llamadas.", "texto": "Permite recorrer todas las coincidencias en un bucle, una por una." },
    { "titulo": "Escribir un patrón fijo con new RegExp() cuando el literal /patron/ es más directo.", "texto": "El constructor tiene sentido sobre todo cuando el patrón viene de una variable." }
  ]
}
```

## Ejercicios

1. Crea una expresión regular con el literal `/patron/` y otra equivalente con `new RegExp()`, y compara sus resultados con `test()`.
2. Usa `exec()` con el flag `g` en un bucle, hasta que devuelva `null`.
3. Usa `match()` con el flag `g` para obtener todas las coincidencias de una cadena de una sola vez.
4. Compara `replace()` y `replaceAll()` sobre la misma cadena y patrón, explicando la diferencia de resultado.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea una expresión regular con el literal /patron/ y otra con new RegExp() (ejercicio 1). Usa match() con el flag g para obtener todas las coincidencias de una vez (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst literal = /\\d+/;\nconst construida = new RegExp('\\\\d+');\nmostrar(literal.test('Tengo 25 años'));\nmostrar(construida.test('Tengo 25 años'));\n\nconst texto = 'Hay 3 gatos, 5 perros y 12 peces';\nmostrar(texto.match(/\\d+/g));",
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
      "titulo": "Regular expressions",
      "descripcion": "Guía de MDN sobre la creación de expresiones regulares (literal y constructor), flags, sintaxis básica del patrón, test(), exec() (incluido su avance con el flag g), match(), matchAll(), replace() y replaceAll().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions",
      "etiqueta": "MDN"
    }
  ]
}
```
