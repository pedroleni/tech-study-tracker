# for...of y for...in

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `for-of-y-for-in` (autogenerado del título)
- **Orden:** 41
- **Fuentes:** [Loops and iteration (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — ver `contenido/javascript/TEMARIO.md` #14

---

## Qué es y para qué sirve

Dos bucles con nombres parecidos, propósitos distintos: `for...of` recorre los VALORES de algo iterable (un array, un string, un Map); `for...in` recorre los NOMBRES de propiedad de un objeto. Confundirlos en un array es un error clásico, con una consecuencia real.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita recorrer algo, valor o clave",
  "roles": [
    { "etiqueta": "Quien recorre valores de un iterable", "rol": "Arrays, strings, Map, Set", "descripcion": "for...of da directamente cada VALOR, sin pasar por un índice intermedio." },
    { "etiqueta": "Quien recorre claves de un objeto", "rol": "Nombres de propiedad, enumerables", "descripcion": "for...in fue pensado para objetos — recorrer sus propiedades, no los elementos de un array." },
    { "etiqueta": "Quien evita for...in en arrays", "rol": "Usar for...of o un for normal en su lugar", "descripcion": "for...in puede traer propiedades añadidas a mano, no solo los índices numéricos esperados." }
  ]
}
```

## for...of: los valores de un iterable

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const gatos = ['Leopardo', 'Serval', 'Jaguar'];\n\n  for (const gato of gatos) {\n    console.log(gato);\n  }\n  // Leopardo, Serval, Jaguar — los VALORES directamente\n</script>",
  "anotaciones": [
    { "fragmento": "for (const gato of gatos) {", "nota": "of recorre los VALORES de cualquier iterable — arrays, strings, Map, Set, el objeto arguments, entre otros. Cada vuelta, gato es directamente el valor, sin ningún índice intermedio." }
  ]
}
```

## for...in: los nombres de propiedad de un objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', profesion: 'Programadora' };\n\n  for (const clave in persona) {\n    console.log(`${clave}: ${persona[clave]}`);\n  }\n  // nombre: Ada\n  // profesion: Programadora\n</script>",
  "anotaciones": [
    { "fragmento": "for (const clave in persona) {", "nota": "in recorre los NOMBRES de propiedad (las claves) de un objeto — clave es 'nombre', luego 'profesion', y persona[clave] accede al valor correspondiente." }
  ]
}
```

## El caso clásico: for...in en un array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = [3, 5, 7];\n  numeros.extra = 'no es un número'; // una propiedad añadida a mano\n\n  for (const i in numeros) {\n    console.log(i);\n  }\n  // '0', '1', '2', 'extra' — la propiedad añadida también aparece\n\n  for (const n of numeros) {\n    console.log(n);\n  }\n  // 3, 5, 7 — solo los valores reales del array\n</script>",
  "anotaciones": [
    { "fragmento": "// '0', '1', '2', 'extra' — la propiedad añadida también aparece", "nota": "for...in recorre TODAS las propiedades enumerables del array, no solo los índices numéricos — la propiedad extra añadida a mano se cuela en el recorrido igual que si fuera un elemento más." },
    { "fragmento": "// 3, 5, 7 — solo los valores reales del array", "nota": "for...of, en cambio, solo entrega los valores REALES del array — extra no forma parte de la iteración, porque no es un elemento indexado del array." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Por qué for...in se desaconseja para arrays",
  "contenido": "Además de traer propiedades añadidas a mano, for...in puede incluir propiedades HEREDADAS del prototipo del objeto. Para arrays, tanto un for normal (con índice) como for...of son opciones mucho más seguras y predecibles."
}
```

## for...of con desestructuración: clave y valor a la vez

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', profesion: 'Programadora' };\n\n  for (const [clave, valor] of Object.entries(persona)) {\n    console.log(clave, valor);\n  }\n  // nombre Ada\n  // profesion Programadora\n</script>",
  "anotaciones": [
    { "fragmento": "for (const [clave, valor] of Object.entries(persona)) {", "nota": "Object.entries() convierte un objeto en un array de pares [clave, valor] — for...of, combinado con desestructuración, da acceso directo a ambos a la vez, sin necesitar for...in." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const arr = [3, 5, 7];\n  arr.extra = 'hola';\n\n  for (const i in arr) {\n    console.log(i);\n  }\n</script>",
  "opciones": [
    "'0', '1', '2', 'extra' — for...in recorre TODAS las propiedades enumerables, incluidas las añadidas a mano, no solo los índices",
    "'0', '1', '2' — for...in solo recorre los índices numéricos de un array",
    "3, 5, 7 — for...in recorre los valores, igual que for...of"
  ],
  "correcta": 0,
  "explicacion": "for...in recorre nombres de propiedad, sin distinguir entre índices numéricos de un array y propiedades añadidas a mano — arr.extra aparece en el recorrido igual que los índices '0', '1' y '2'."
}
```

## Lo que for...of y for...in NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "for...in es una buena forma de recorrer los elementos de un array",
      "realidad": "Recorre TODAS las propiedades enumerables, incluidas las añadidas a mano — para arrays, un for normal o for...of son mucho más seguros."
    },
    {
      "mito": "for...of y for...in hacen lo mismo, solo cambia la palabra clave",
      "realidad": "for...of recorre VALORES de un iterable; for...in recorre NOMBRES de propiedad (claves) de un objeto."
    },
    {
      "mito": "for...in solo funciona con arrays",
      "realidad": "Fue pensado para objetos en general — recorrer sus propiedades enumerables, incluidas las heredadas."
    },
    {
      "mito": "for...of solo funciona con arrays",
      "realidad": "Funciona con cualquier iterable — strings, Map, Set, el objeto arguments, y más."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar for...in para recorrer un array.", "texto": "Arriesga incluir propiedades añadidas a mano, además de los índices esperados." },
    { "titulo": "Confundir qué recorre cada uno: for...of valores, for...in claves.", "texto": "Un error fácil de cometer solo por lo parecido de los nombres." },
    { "titulo": "Olvidar que for...in también trae propiedades heredadas.", "texto": "No solo las propiedades directas del propio objeto." },
    { "titulo": "No usar Object.entries() con for...of cuando hace falta clave y valor a la vez.", "texto": "Evita tener que recurrir a for...in solo para acceder a ambos." }
  ]
}
```

## Ejercicios

1. Escribe un `for...of` que recorra los valores de un array de nombres.
2. Escribe un `for...in` que recorra las claves de un objeto con tres propiedades.
3. Añade una propiedad extra a un array y demuestra con `for...in` que aparece en el recorrido.
4. Escribe un `for...of` con desestructuración que recorra clave y valor de un objeto usando `Object.entries()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Loops and iteration",
      "descripcion": "Guía de referencia de MDN sobre for...of y for...in, con el ejemplo directo que compara ambos sobre el mismo array.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
      "etiqueta": "MDN"
    }
  ]
}
```
