# Optional chaining (?.) y nullish coalescing (??)

- **Módulo:** JavaScript moderno
- **Slug:** `optional-chaining-y-nullish-coalescing` (autogenerado del título)
- **Orden:** 164
- **Fuentes:** [Optional chaining (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) + [Nullish coalescing operator (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — ver `contenido/javascript/TEMARIO.md` #55

---

## Qué es y para qué sirve

Dos operadores ya adelantados de forma ligera en lecciones anteriores (property accessors, el operador ternario), ahora a fondo. `?.` accede a una propiedad sin lanzar error si algo intermedio no existe. `??` da un valor por defecto SOLO cuando el original es `null` o `undefined` — a diferencia de `||`, que sustituye cualquier valor falsy.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita acceder sin arriesgarse a un error",
  "roles": [
    { "etiqueta": "Quien accede sin lanzar error", "rol": "?.", "descripcion": "Si algo intermedio es null o undefined, el resto de la cadena se salta — la expresión entera da undefined." },
    { "etiqueta": "Quien da un valor por defecto preciso", "rol": "??", "descripcion": "Solo sustituye null o undefined — un 0 o un '' legítimos se conservan tal cual." },
    { "etiqueta": "Quien las combina", "rol": "?. seguido de ??", "descripcion": "Acceder sin riesgo, y dar un valor por defecto si el resultado no existía." }
  ]
}
```

## ?.: acceder a una propiedad sin lanzar error

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const aventurero = {\n    nombre: 'Alicia',\n    gato: { nombre: 'Dinah' },\n  };\n\n  const nombrePerro = aventurero.perro?.nombre;\n  console.log(nombrePerro); // undefined — sin lanzar ningún error\n</script>",
  "anotaciones": [
    { "fragmento": "const nombrePerro = aventurero.perro?.nombre;", "nota": "aventurero.perro es undefined — sin ?., seguir con .nombre lanzaría un TypeError. Con ?., en cuanto encuentra undefined/null, el resto de la cadena se SALTA y toda la expresión da undefined." }
  ]
}
```

## ?.() con llamadas a función: un límite real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const aventurero = { nombre: 'Alicia' };\n  console.log(aventurero.saludar?.()); // undefined — saludar no existe en absoluto\n\n  const otro = { nombre: 'Bruno', saludar: 'no soy una función' };\n  // otro.saludar?.(); // TypeError — saludar SÍ existe, pero no es una función\n</script>",
  "anotaciones": [
    { "fragmento": "// otro.saludar?.(); // TypeError — saludar SÍ existe, pero no es una función", "nota": "?.() solo evita el error cuando la propiedad NO EXISTE (es undefined/null) — si existe pero no es una función, sigue lanzando un TypeError real, exactamente como sin ?." }
  ]
}
```

## ?.[...]: la versión con corchetes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function imprimirIndiceMagico(arr) {\n    console.log(arr?.[42]);\n  }\n\n  imprimirIndiceMagico([0, 1, 2, 3, 4, 5]); // undefined — el índice 42 no existe\n  imprimirIndiceMagico(); // undefined — arr ni siquiera se pasó\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(arr?.[42]);", "nota": "arr?.[42] combina optional chaining con la notación de corchetes — funciona tanto si arr existe pero no tiene esa posición, como si arr en sí es undefined." }
  ]
}
```

## Short-circuiting: el resto NO se evalúa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const posiblementeNulo = null;\n  let x = 0;\n  const propiedad = posiblementeNulo?.[x++];\n\n  console.log(x); // 0 — x++ NUNCA llegó a evaluarse\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(x); // 0 — x++ NUNCA llegó a evaluarse", "nota": "En cuanto posiblementeNulo resulta null, el resto de la expresión (incluido x++) se SALTA por completo — no solo el acceso a la propiedad, cualquier código dentro de esa parte de la expresión." }
  ]
}
```

## ??: solo sustituye null o undefined

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const texto = ''; // falsy, pero NO nullish\n\n  console.log(texto || 'Hola mundo');  // 'Hola mundo' — || sustituye CUALQUIER valor falsy\n  console.log(texto ?? 'Hola mundo');  // '' — ?? solo sustituye null o undefined\n\n  console.log(0 ?? 42); // 0 — 0 es falsy, pero no nullish\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(texto || 'Hola mundo');  // 'Hola mundo' — || sustituye CUALQUIER valor falsy", "nota": "|| trata CUALQUIER valor falsy (0, '', false, NaN) como si hubiera que sustituirlo — incluido un '' completamente legítimo." },
    { "fragmento": "console.log(texto ?? 'Hola mundo');  // '' — ?? solo sustituye null o undefined", "nota": "?? es mucho más estricto: solo sustituye cuando el valor es EXACTAMENTE null o undefined — un '' o un 0 legítimos se conservan tal cual." }
  ]
}
```

## Combinar ?. y ??

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function ciudadDelCliente(cliente) {\n    const ciudad = cliente?.ciudad ?? 'Ciudad desconocida';\n    console.log(ciudad);\n  }\n\n  ciudadDelCliente({ nombre: 'Nathan', ciudad: 'París' });          // 'París'\n  ciudadDelCliente({ nombre: 'Carl', detalles: { edad: 82 } });     // 'Ciudad desconocida'\n</script>",
  "anotaciones": [
    { "fragmento": "const ciudad = cliente?.ciudad ?? 'Ciudad desconocida';", "nota": "cliente?.ciudad usa optional chaining para no lanzar error si ciudad no existe; ?? aporta el valor por defecto cuando el resultado es null o undefined — las dos herramientas encajan naturalmente juntas." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "?. no se puede usar en cualquier sitio",
  "contenido": "?. no se puede usar en el lado izquierdo de una asignación (objeto?.propiedad = valor), ni con plantillas etiquetadas, ni con new — cualquiera de esos usos es un SyntaxError directo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "?? no se combina con && o || sin paréntesis",
  "contenido": "null || undefined ?? 'valor' es un SyntaxError — mezclar ?? directamente con && o || exige paréntesis explícitos: (null || undefined) ?? 'valor'."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const cantidad = 0;\n  const resultado1 = cantidad || 10;\n  const resultado2 = cantidad ?? 10;\n\n  console.log(resultado1, resultado2);\n</script>",
  "opciones": [
    "10 y 0 — || sustituye cualquier valor falsy (incluido 0); ?? solo sustituye null o undefined, así que conserva el 0 real",
    "0 y 0 — ambos operadores tratan 0 de la misma forma",
    "10 y 10 — ambos operadores sustituyen 0 por el valor por defecto"
  ],
  "correcta": 0,
  "explicacion": "cantidad vale 0 — un valor FALSY, pero no NULLISH. || sustituye cualquier valor falsy, así que resultado1 es 10. ?? solo sustituye null o undefined, y 0 no es ninguno de los dos, así que resultado2 conserva el 0 real."
}
```

## Lo que ?. y ?? NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "?. evita cualquier tipo de error, incluso llamar a algo que existe pero no es una función",
      "realidad": "Si la propiedad existe pero no es una función, ?.() sigue lanzando un TypeError real."
    },
    {
      "mito": "?? y || hacen exactamente lo mismo, solo con sintaxis distinta",
      "realidad": "|| sustituye cualquier valor falsy; ?? solo sustituye null o undefined, conservando 0, '' o false legítimos."
    },
    {
      "mito": "?. detiene solo el acceso a esa propiedad concreta; el resto de la expresión se sigue evaluando",
      "realidad": "En cuanto encuentra null/undefined, TODO el resto de esa expresión se salta, sin evaluarse."
    },
    {
      "mito": "?? se puede combinar libremente con && y || sin ningún paréntesis",
      "realidad": "Mezclarlos directamente sin paréntesis es un SyntaxError."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar ?. esperando que evite cualquier error, incluso al llamar algo que no es una función.", "texto": "Solo protege ante null/undefined, no ante un tipo incorrecto." },
    { "titulo": "Usar || cuando en realidad se necesitaba ??.", "texto": "Puede perder valores legítimos como 0 o ''." },
    { "titulo": "No aprovechar el short-circuiting de ?. para evitar efectos secundarios.", "texto": "Código como x++ dentro de una cadena cortada nunca llega a ejecutarse." },
    { "titulo": "Intentar combinar ?? con && o || sin paréntesis explícitos.", "texto": "Es un SyntaxError, no un comportamiento inesperado en tiempo de ejecución." }
  ]
}
```

## Ejercicios

1. Usa `?.` para acceder a una propiedad anidada que podría no existir, sin que el código lance ningún error.
2. Usa `?.()` para llamar a un método que podría no existir en un objeto.
3. Compara `||` y `??` sobre un valor `0` o una cadena vacía `''`, y explica la diferencia de resultado.
4. Combina `?.` y `??` en una sola expresión para dar un valor por defecto ante un dato que podría faltar.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Usa ?. para acceder a una propiedad anidada que podría no existir (ejercicio 1). Usa ?.() para llamar a un método que podría no existir (ejercicio 2). Compara || y ?? sobre 0 (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst usuario = { perfil: { nombre: 'Ada' } };\nmostrar(usuario.perfil?.direccion?.calle);\n\nconst objeto = {};\nmostrar(objeto.metodoQueNoExiste?.());\n\nconst cantidad = 0;\nmostrar('cantidad || 10 -> ' + (cantidad || 10));\nmostrar('cantidad ?? 10 -> ' + (cantidad ?? 10));",
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
      "titulo": "Optional chaining",
      "descripcion": "Referencia de MDN sobre ?. con propiedades, llamadas a función y corchetes, y su comportamiento de short-circuiting.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Nullish coalescing operator",
      "descripcion": "Referencia de MDN sobre ??, su diferencia real con ||, y la restricción de sintaxis al combinarlo con && o ||.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      "etiqueta": "MDN"
    }
  ]
}
```
