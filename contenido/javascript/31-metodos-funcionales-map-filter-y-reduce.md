# Métodos funcionales: map, filter y reduce

- **Módulo:** Arrays y colecciones a fondo
- **Slug:** `metodos-funcionales-map-filter-y-reduce` (autogenerado del título)
- **Orden:** 92
- **Fuentes:** [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) — ver `contenido/javascript/TEMARIO.md` #31

---

## Qué es y para qué sirve

A diferencia de `splice()` y compañía (vistos en la lección anterior), los métodos funcionales de array — `map()`, `filter()`, `reduce()`, `forEach()`, `find()`, `findIndex()` — nunca modifican el array original. Reciben una función, la aplican a cada elemento, y devuelven algo nuevo: otro array, o un único valor.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita transformar una lista sin mutarla",
  "roles": [
    { "etiqueta": "Quien transforma cada elemento", "rol": "map()", "descripcion": "Un array nuevo, del mismo tamaño, con el resultado de aplicar una función a cada elemento." },
    { "etiqueta": "Quien se queda con algunos", "rol": "filter()", "descripcion": "Un array nuevo, igual o más corto, con solo los elementos que cumplen una condición." },
    { "etiqueta": "Quien reduce todo a un solo valor", "rol": "reduce()", "descripcion": "Recorre el array acumulando un resultado — una suma, un objeto, cualquier cosa — hasta devolver un único valor final." }
  ]
}
```

## map(): transformar cada elemento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const nombres = ['ana', 'beto', 'carla'];\n  const mayusculas = nombres.map((nombre) => nombre.toUpperCase());\n\n  console.log(mayusculas); // ['ANA', 'BETO', 'CARLA']\n  console.log(nombres);    // ['ana', 'beto', 'carla'] — sin cambios, map() no muta\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(nombres);    // ['ana', 'beto', 'carla'] — sin cambios, map() no muta", "nota": "map() devuelve un array NUEVO con el resultado de aplicar la función a cada elemento — el array original queda completamente intacto, a diferencia de splice() o push()." }
  ]
}
```

## filter(): quedarse solo con algunos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const valores = ['a', 10, 'b', 20, 'c', 30];\n  const soloNumeros = valores.filter((valor) => typeof valor === 'number');\n\n  console.log(soloNumeros);    // [10, 20, 30]\n  console.log(valores.length); // 6 — el original conserva todos sus elementos\n</script>",
  "anotaciones": [
    { "fragmento": "const soloNumeros = valores.filter((valor) => typeof valor === 'number');", "nota": "filter() se queda solo con los elementos donde la función devuelve true — un array nuevo, igual de largo o más corto que el original, nunca más largo." }
  ]
}
```

## Encadenar filter() y map()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const precios = [12, 45, 8, 99, 23];\n  const caros = precios\n    .filter((precio) => precio > 10)\n    .map((precio) => precio * 2);\n\n  console.log(caros); // [24, 90, 198, 46]\n</script>",
  "anotaciones": [
    { "fragmento": "const caros = precios\n    .filter((precio) => precio > 10)\n    .map((precio) => precio * 2);", "nota": "Como ambos devuelven un array nuevo (sin mutar nada), se pueden ENCADENAR directamente: el resultado de filter() se convierte en la entrada de map(), sin necesitar ninguna variable intermedia." }
  ]
}
```

## reduce(): con valor inicial

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = [10, 20, 30];\n  const total = numeros.reduce((acumulador, actual) => acumulador + actual, 0);\n\n  console.log(total); // 60\n</script>",
  "anotaciones": [
    { "fragmento": "const total = numeros.reduce((acumulador, actual) => acumulador + actual, 0);", "nota": "0, el segundo argumento de reduce(), es el valor INICIAL del acumulador. En cada vuelta, lo que la función devuelve se convierte en el acumulador de la siguiente — hasta devolver un único valor final." }
  ]
}
```

## reduce(): sin valor inicial, un comportamiento distinto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = [10, 20, 30];\n  const total = numeros.reduce((acumulador, actual) => acumulador + actual);\n\n  console.log(total); // 60 — funciona, pero por una razón distinta\n</script>",
  "anotaciones": [
    { "fragmento": "const total = numeros.reduce((acumulador, actual) => acumulador + actual);", "nota": "SIN valor inicial, reduce() usa el PRIMER elemento (10) como acumulador de arranque, y empieza a iterar desde el SEGUNDO (20) — no desde el principio. Sobre un array VACÍO, esto lanza un TypeError; con un valor inicial explícito, no." }
  ]
}
```

## forEach() y los huecos de un array disperso

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const items = ['primero', 'segundo', , 'cuarto']; // hueco en el índice 2\n\n  items.forEach((item) => console.log(item));\n  // 'primero'\n  // 'segundo'\n  // 'cuarto' — el hueco se SALTA, no imprime undefined\n</script>",
  "anotaciones": [
    { "fragmento": "// 'cuarto' — el hueco se SALTA, no imprime undefined", "nota": "forEach() no visita las posiciones vacías de un array disperso — se saltan directamente, sin pasar ni una sola vez por la función. No es lo mismo que un elemento con valor undefined." }
  ]
}
```

## find() y findIndex(): el elemento o su posición

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const valores = ['a', 10, 'b', 20, 'c', 30];\n\n  console.log(valores.find((valor) => typeof valor === 'number'));      // 10 — el ELEMENTO\n  console.log(valores.findIndex((valor) => typeof valor === 'number')); // 1 — su ÍNDICE\n\n  console.log(valores.find((valor) => valor === 'z'));      // undefined — no encontrado\n  console.log(valores.findIndex((valor) => valor === 'z')); // -1 — no encontrado\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(valores.find((valor) => valor === 'z'));      // undefined — no encontrado\n  console.log(valores.findIndex((valor) => valor === 'z')); // -1 — no encontrado", "nota": "Ambos se detienen en la PRIMERA coincidencia, pero su valor de 'no encontrado' es distinto: undefined para find(), -1 para findIndex() — porque 0 sería un índice válido, y no podría usarse para indicar ausencia." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "thisArg: un segundo argumento opcional, salvo en reduce()",
  "contenido": "map(), filter(), forEach(), find() y findIndex() aceptan todos un segundo argumento opcional: thisArg, el valor que this tomará dentro de la función. reduce() es la excepción — su segundo argumento ya está ocupado por el valor inicial del acumulador."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const numeros = [5, 10, 15, 20];\n  const resultado = numeros.reduce((acumulador, actual) => acumulador + actual);\n  console.log(resultado);\n</script>",
  "opciones": [
    "50 — sin valor inicial, el acumulador arranca en el primer elemento (5) y la iteración empieza desde el segundo (10)",
    "undefined — reduce() siempre necesita un valor inicial explícito, o no funciona",
    "55 — el acumulador arranca en 0, igual que si se hubiera pasado un valor inicial"
  ],
  "correcta": 0,
  "explicacion": "Sin valor inicial, reduce() usa el PRIMER elemento del array (5) como acumulador de arranque, y empieza a iterar desde el SEGUNDO (10). El resultado final es la suma de todos los elementos: 5 + 10 + 15 + 20 = 50 — coincide con lo que daría un valor inicial de 0, pero por un mecanismo distinto."
}
```

## Lo que map(), filter() y reduce() NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "map(), filter() y reduce() modifican el array original",
      "realidad": "Todos devuelven un array o valor NUEVO, sin mutar el original — a diferencia de splice(), visto en la lección anterior."
    },
    {
      "mito": "reduce() siempre necesita un valor inicial explícito para funcionar",
      "realidad": "Funciona sin él, usando el primer elemento como acumulador inicial — aunque lanza un error sobre un array vacío sin valor inicial."
    },
    {
      "mito": "forEach() visita todas las posiciones de un array, incluidos los huecos de uno disperso",
      "realidad": "Los huecos se saltan por completo, sin pasar ni una vez por la función."
    },
    {
      "mito": "find() y findIndex() devuelven undefined cuando no encuentran nada",
      "realidad": "Solo find() devuelve undefined — findIndex() devuelve -1, no undefined."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que map()/filter()/reduce() modifiquen el array original en vez de devolver uno nuevo.", "texto": "El array de partida siempre queda intacto tras usarlos." },
    { "titulo": "Usar reduce() sin valor inicial sobre un array que podría estar vacío.", "texto": "Lanza un TypeError si no hay ningún elemento del que partir." },
    { "titulo": "Confundir find() (devuelve el elemento) con findIndex() (devuelve la posición).", "texto": "Sus valores de 'no encontrado' también son distintos: undefined frente a -1." },
    { "titulo": "No aprovechar que filter() y map() se pueden encadenar, al no mutar ninguno el original.", "texto": "Evita variables intermedias innecesarias." }
  ]
}
```

## Ejercicios

1. Usa `map()` para transformar cada elemento de un array, y comprueba que el array original no cambió.
2. Usa `filter()` para quedarte solo con los elementos que cumplan una condición.
3. Encadena `filter()` y `map()` en una sola expresión, sin variables intermedias.
4. Usa `reduce()` con y sin valor inicial sobre el mismo array, y explica en qué casos el resultado podría diferir.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Indexed collections",
      "descripcion": "Guía de MDN sobre los métodos funcionales de array: map(), filter(), reduce(), forEach() (y su comportamiento con arrays dispersos), find() y findIndex().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
      "etiqueta": "MDN"
    }
  ]
}
```
