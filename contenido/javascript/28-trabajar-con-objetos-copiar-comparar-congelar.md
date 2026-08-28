# Trabajar con objetos: copiar, comparar, congelar

- **Módulo:** Objetos
- **Slug:** `trabajar-con-objetos-copiar-comparar-congelar` (autogenerado del título)
- **Orden:** 83
- **Fuentes:** [Working with objects (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) + [Object.assign() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) + [Object.freeze() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) — ver `contenido/javascript/TEMARIO.md` #28

---

## Qué es y para qué sirve

Tres operaciones cotidianas con objetos que sorprenden más de lo que deberían: comparar dos objetos con `===` no compara su contenido, copiar un objeto con las herramientas más comunes no siempre copia todo de verdad, y congelar un objeto no siempre congela tanto como parece.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita ir más allá de leer y escribir propiedades",
  "roles": [
    { "etiqueta": "Quien compara dos objetos", "rol": "=== compara referencia, no contenido", "descripcion": "Dos objetos con exactamente las mismas propiedades nunca son === entre sí, salvo que sean literalmente el mismo objeto." },
    { "etiqueta": "Quien copia un objeto", "rol": "Superficial por defecto", "descripcion": "Object.assign() y el spread copian el primer nivel — los objetos anidados se siguen compartiendo por referencia." },
    { "etiqueta": "Quien impide que un objeto cambie", "rol": "freeze() también es superficial", "descripcion": "Congelar un objeto no congela los objetos que tiene dentro, solo su propio primer nivel." }
  ]
}
```

## Comparar objetos: === compara referencia, no contenido

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const fruta1 = { nombre: 'manzana' };\n  const fruta2 = { nombre: 'manzana' };\n  const fruta3 = fruta1;\n\n  console.log(fruta1 === fruta2); // false — mismo contenido, objetos distintos\n  console.log(fruta1 === fruta3); // true — misma referencia, el mismo objeto\n\n  fruta1.nombre = 'pera';\n  console.log(fruta3.nombre); // 'pera' — fruta3 apunta al MISMO objeto que fruta1\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(fruta1 === fruta2); // false — mismo contenido, objetos distintos", "nota": "fruta1 y fruta2 tienen exactamente el mismo contenido, pero son dos objetos DISTINTOS en memoria — === (y ==) para objetos compara si son el MISMO objeto, no si su contenido coincide." },
    { "fragmento": "fruta1.nombre = 'pera';\n  console.log(fruta3.nombre); // 'pera' — fruta3 apunta al MISMO objeto que fruta1", "nota": "fruta3 = fruta1 no copió nada — ambas variables apuntan al mismo objeto. Modificarlo a través de una variable se ve reflejado a través de la otra." }
  ]
}
```

## Copiar un objeto con Object.assign()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const original = { a: 1 };\n  const copia = Object.assign({}, original);\n\n  console.log(copia);              // { a: 1 }\n  console.log(copia === original); // false — un objeto NUEVO, aunque con el mismo contenido\n\n  copia.a = 2;\n  console.log(original.a); // 1 — original no se ve afectado\n</script>",
  "anotaciones": [
    { "fragmento": "const copia = Object.assign({}, original);", "nota": "Object.assign(destino, ...fuentes) copia las propiedades de fuentes sobre destino, y devuelve destino. Pasar un objeto vacío {} como destino produce, en efecto, una copia nueva de original." }
  ]
}
```

## El gotcha: la copia es SUPERFICIAL

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const original = { a: 0, b: { c: 0 } };\n  const copia = Object.assign({}, original);\n\n  copia.a = 2;\n  console.log(original.a); // 0 — a es un valor primitivo, sin problema\n\n  copia.b.c = 3;\n  console.log(original.b.c); // 3 — ¡b también cambió en original!\n</script>",
  "anotaciones": [
    { "fragmento": "copia.a = 2;\n  console.log(original.a); // 0 — a es un valor primitivo, sin problema", "nota": "a guarda un número — un valor primitivo. Reasignar copia.a crea un valor completamente independiente, sin afectar a original.a." },
    { "fragmento": "copia.b.c = 3;\n  console.log(original.b.c); // 3 — ¡b también cambió en original!", "nota": "b es un OBJETO. Object.assign() solo copió la referencia a ese objeto, no un objeto nuevo — copia.b y original.b apuntan al MISMO objeto anidado, así que modificarlo a través de una se refleja en la otra." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El spread {...obj} tiene el mismo gotcha",
  "contenido": "{ ...original } hace exactamente el mismo tipo de copia superficial que Object.assign({}, original) — solo cambia la sintaxis, no el comportamiento. Su sintaxis completa, junto al operador rest, tiene su propia lección dedicada más adelante en este módulo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Para una copia realmente profunda: structuredClone()",
  "contenido": "structuredClone(original) clona recursivamente todo el árbol de objetos anidados, sin la limitación superficial de Object.assign() ni del spread — la copia y el original no comparten ninguna referencia interna, a ningún nivel."
}
```

## Congelar un objeto con Object.freeze()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const configuracion = { modoOscuro: true };\n  Object.freeze(configuracion);\n\n  configuracion.modoOscuro = false; // falla en silencio (o lanza en modo estricto)\n  configuracion.nuevaClave = 'valor'; // también falla — freeze impide añadir propiedades\n\n  console.log(configuracion); // { modoOscuro: true } — sin cambios\n  console.log(Object.isFrozen(configuracion)); // true\n</script>",
  "anotaciones": [
    { "fragmento": "configuracion.nuevaClave = 'valor'; // también falla — freeze impide añadir propiedades", "nota": "Object.freeze() no solo impide REASIGNAR propiedades existentes — también impide AÑADIR propiedades nuevas. Un objeto congelado queda fijo en la forma exacta que tenía en el momento de congelarlo." }
  ]
}
```

## freeze() también es superficial

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', direccion: { ciudad: 'Londres' } };\n  Object.freeze(persona);\n\n  persona.nombre = 'Otro nombre';       // falla — nivel superior congelado\n  persona.direccion.ciudad = 'París';   // ¡funciona! direccion no está congelado\n\n  console.log(persona.direccion.ciudad); // 'París'\n</script>",
  "anotaciones": [
    { "fragmento": "persona.direccion.ciudad = 'París';   // ¡funciona! direccion no está congelado", "nota": "Object.freeze(persona) solo congela el PRIMER NIVEL de persona. direccion sigue siendo un objeto normal, completamente mutable — congelar un objeto no congela en cascada los objetos que contiene." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Object.seal(): una versión más suave que freeze()",
  "contenido": "Object.seal() impide añadir o borrar propiedades, igual que freeze() — pero SÍ permite modificar el valor de las propiedades que ya existen. freeze() equivale a seal() más hacer, además, cada propiedad no escribible."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const original = { nombre: 'Ada', direccion: { ciudad: 'Londres' } };\n  const copia = Object.assign({}, original);\n\n  copia.nombre = 'Grace';\n  copia.direccion.ciudad = 'París';\n\n  console.log(original.nombre);\n  console.log(original.direccion.ciudad);\n</script>",
  "opciones": [
    "'Ada' y 'París' — nombre es un valor primitivo copiado de verdad, pero direccion es un objeto compartido por referencia entre copia y original",
    "'Ada' y 'Londres' — Object.assign() siempre produce una copia completamente independiente",
    "'Grace' y 'París' — copia y original son, en realidad, el mismo objeto"
  ],
  "correcta": 0,
  "explicacion": "Object.assign() hace una copia SUPERFICIAL. nombre es un string, así que copia.nombre = 'Grace' no afecta a original.nombre, que sigue siendo 'Ada'. Pero direccion es un objeto — copia.direccion y original.direccion apuntan al MISMO objeto en memoria, así que modificar copia.direccion.ciudad también cambia original.direccion.ciudad a 'París'."
}
```

## Lo que copiar, comparar y congelar NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Dos objetos con exactamente el mismo contenido son === entre sí",
      "realidad": "=== compara REFERENCIA, no contenido — dos objetos literales con el mismo contenido nunca son === salvo que sean, literalmente, el mismo objeto."
    },
    {
      "mito": "Object.assign() (o el spread) produce una copia completamente independiente del original",
      "realidad": "Es una copia SUPERFICIAL — los valores primitivos se copian de verdad, pero los objetos anidados se siguen compartiendo por referencia."
    },
    {
      "mito": "Object.freeze() congela también los objetos anidados dentro del objeto congelado",
      "realidad": "freeze() también es superficial — solo afecta al primer nivel del objeto, no en cascada a lo que contiene."
    },
    {
      "mito": "Object.freeze() y Object.seal() hacen exactamente lo mismo",
      "realidad": "seal() permite seguir modificando el valor de propiedades ya existentes; freeze() también las hace no escribibles."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Comparar objetos con === esperando que compare su contenido.", "texto": "Compara si son el mismo objeto en memoria, no si su contenido coincide." },
    { "titulo": "Confiar en que Object.assign()/spread producen una copia totalmente independiente.", "texto": "Los objetos anidados se comparten por referencia entre copia y original." },
    { "titulo": "Olvidar que freeze() (y seal()) son superficiales.", "texto": "No afectan a los objetos anidados dentro del objeto congelado o sellado." },
    { "titulo": "Confundir freeze() con seal().", "texto": "seal() sigue permitiendo modificar el valor de las propiedades que ya existían." }
  ]
}
```

## Ejercicios

1. Crea dos objetos literales con exactamente el mismo contenido, y comprueba con `===` que no son iguales.
2. Copia un objeto con `Object.assign()` que tenga una propiedad anidada, y demuestra el gotcha de la copia superficial modificándola.
3. Congela un objeto con `Object.freeze()` e intenta modificar una propiedad de primer nivel y una anidada — compara los resultados.
4. Explica en tus propias palabras la diferencia entre `Object.freeze()` y `Object.seal()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Working with objects",
      "descripcion": "Guía de MDN sobre la comparación de objetos por referencia con === y ==.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Object.assign()",
      "descripcion": "Referencia de MDN sobre Object.assign(): copia de propiedades, y el ejemplo canónico de su gotcha de copia superficial con objetos anidados.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Object.freeze()",
      "descripcion": "Referencia de MDN sobre Object.freeze(): impedir reasignar y añadir propiedades, Object.isFrozen(), y por qué el congelado tampoco alcanza a los objetos anidados.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze",
      "etiqueta": "MDN"
    }
  ]
}
```
