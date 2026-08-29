# Arrays: fundamentos

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `arrays-fundamentos` (autogenerado del título)
- **Orden:** 44
- **Fuentes:** [Arrays (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays) — ver `contenido/javascript/TEMARIO.md` #15

---

## Qué es y para qué sirve

Un array guarda varios valores bajo un solo nombre, en un orden concreto. A diferencia de los strings, los arrays SÍ se pueden modificar directamente — añadir, quitar, reordenar — sin necesitar crear uno nuevo cada vez. Cierra este módulo; los métodos funcionales (`map`, `filter`, `reduce`) tienen su propio módulo dedicado más adelante.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita guardar varios valores juntos",
  "roles": [
    { "etiqueta": "Quien guarda varios valores juntos", "rol": "Bajo un único nombre, en orden", "descripcion": "Una lista de la compra, una secuencia de números, cualquier colección ordenada de datos." },
    { "etiqueta": "Quien muta un array sin reasignar", "rol": "push, pop, shift, unshift, splice", "descripcion": "A diferencia de los strings, estos métodos SÍ modifican el array original directamente." },
    { "etiqueta": "Quien convierte texto en array", "rol": "split() y join(), en direcciones opuestas", "descripcion": "Un dato que llega como texto separado por comas se convierte en array, y viceversa." }
  ]
}
```

## Crear un array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const compra = ['pan', 'leche', 'queso'];\n  const secuencia = [1, 1, 2, 3, 5, 8, 13];\n  const mezclado = ['árbol', 795, [0, 1, 2]]; // tipos distintos, incluso otro array\n</script>",
  "anotaciones": [
    { "fragmento": "const mezclado = ['árbol', 795, [0, 1, 2]]; // tipos distintos, incluso otro array", "nota": "Un array puede mezclar cualquier tipo de dato — strings, números, objetos, incluso otros arrays anidados dentro." }
  ]
}
```

## Longitud, índice y modificar un elemento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const compra = ['pan', 'leche', 'queso'];\n\n  console.log(compra.length); // 3\n  console.log(compra[0]);     // 'pan' — primer elemento, índice 0\n\n  compra[0] = 'tahini';\n  console.log(compra); // ['tahini', 'leche', 'queso']\n</script>",
  "anotaciones": [
    { "fragmento": "compra[0] = 'tahini';", "nota": "Los elementos de un array se pueden reasignar directamente por índice — a diferencia de un carácter dentro de un string, que es inmutable." }
  ]
}
```

## Arrays anidados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const datos = ['árbol', 795, [0, 1, 2]];\n  console.log(datos[2][2]); // 2 — el índice 2 DENTRO del array anidado\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(datos[2][2]); // 2 — el índice 2 DENTRO del array anidado", "nota": "El primer [2] accede al array anidado; el segundo [2] accede a un elemento DENTRO de ese array anidado — los corchetes se encadenan." }
  ]
}
```

## Añadir y quitar elementos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const ciudades = ['Manchester', 'Liverpool'];\n\n  const nuevaLongitud = ciudades.push('Cardiff'); // añade al FINAL\n  console.log(nuevaLongitud); // 3 — no el array, la nueva longitud\n\n  ciudades.unshift('Edimburgo'); // añade al PRINCIPIO\n\n  const quitado = ciudades.pop(); // quita del FINAL\n  console.log(quitado); // 'Cardiff' — el elemento quitado\n\n  ciudades.shift(); // quita del PRINCIPIO\n</script>",
  "anotaciones": [
    { "fragmento": "const nuevaLongitud = ciudades.push('Cardiff'); // añade al FINAL\n  console.log(nuevaLongitud); // 3 — no el array, la nueva longitud", "nota": "push() modifica ciudades directamente Y ADEMÁS devuelve un valor — pero ese valor es la nueva LONGITUD del array, no el array en sí." },
    { "fragmento": "const quitado = ciudades.pop(); // quita del FINAL\n  console.log(quitado); // 'Cardiff' — el elemento quitado", "nota": "pop() sí devuelve el elemento que acaba de quitar — útil cuando hace falta saber qué se quitó, no solo cuántos quedan." }
  ]
}
```

## splice(): quitar por índice

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const ciudades = ['Manchester', 'Liverpool', 'Edimburgo', 'Carlisle'];\n\n  const indice = ciudades.indexOf('Liverpool');\n  if (indice !== -1) {\n    ciudades.splice(indice, 1); // quita 1 elemento, empezando en indice\n  }\n  console.log(ciudades); // ['Manchester', 'Edimburgo', 'Carlisle']\n</script>",
  "anotaciones": [
    { "fragmento": "ciudades.splice(indice, 1); // quita 1 elemento, empezando en indice", "nota": "splice(inicio, cantidad) quita cantidad elementos EMPEZANDO en la posición inicio — a diferencia de slice() (visto en la lección de strings), splice() SÍ modifica el array original." }
  ]
}
```

## split() y join(): entre texto y array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const datos = 'Manchester,Londres,Liverpool,Leeds';\n  const ciudades = datos.split(','); // string → array\n  console.log(ciudades.length); // 4\n\n  const unido = ciudades.join(' | '); // array → string\n  console.log(unido); // 'Manchester | Londres | Liverpool | Leeds'\n</script>",
  "anotaciones": [
    { "fragmento": "const ciudades = datos.split(','); // string → array", "nota": "split() corta un string en cada aparición del separador indicado, devolviendo un array con los trozos." },
    { "fragmento": "const unido = ciudades.join(' | '); // array → string", "nota": "join() hace justo lo contrario — une todos los elementos del array en un único string, con el separador indicado entre cada uno." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const ciudades = ['Manchester', 'Liverpool'];\n  const nuevaLongitud = ciudades.push('Cardiff');\n  console.log(nuevaLongitud);\n  console.log(ciudades);\n</script>",
  "opciones": [
    "3 y luego ['Manchester', 'Liverpool', 'Cardiff'] — push() muta el array y devuelve su nueva longitud",
    "['Manchester', 'Liverpool', 'Cardiff'] y luego 3 — push() devuelve el array actualizado primero",
    "undefined y luego ['Manchester', 'Liverpool'] — push() no modifica nada sin reasignar la variable"
  ],
  "correcta": 0,
  "explicacion": "push() modifica ciudades directamente (mutación, sin necesitar reasignar) y devuelve un número: la nueva longitud del array tras añadir el elemento — aquí, 3."
}
```

## Lo que los arrays NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Los arrays son inmutables, igual que los strings",
      "realidad": "Al contrario — push, pop, shift, unshift y splice MODIFICAN el array original directamente, sin necesitar reasignar nada."
    },
    {
      "mito": "push() devuelve el array actualizado",
      "realidad": "Devuelve la NUEVA LONGITUD del array, un número — no el array en sí."
    },
    {
      "mito": "Un array solo puede contener un tipo de dato a la vez",
      "realidad": "Puede mezclar strings, números, objetos y otros arrays libremente, todo en el mismo array."
    },
    {
      "mito": "splice() y slice() hacen lo mismo, solo con nombres parecidos",
      "realidad": "splice() MUTA el array original al quitar o insertar elementos; slice() devuelve una copia nueva, sin tocar el original."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que push() devuelva el array actualizado.", "texto": "Devuelve la nueva longitud, un número — el array ya se modificó directamente." },
    { "titulo": "Olvidar que los métodos de mutación cambian el array original sin reasignar.", "texto": "push, pop, shift, unshift y splice actúan directamente sobre el array existente." },
    { "titulo": "Confundir splice() (muta) con slice() (no muta).", "texto": "Un nombre muy parecido, un comportamiento completamente distinto." },
    { "titulo": "Usar splice() sin comprobar antes el índice real con indexOf().", "texto": "Arriesga quitar el elemento equivocado si el índice no es el esperado." }
  ]
}
```

## Ejercicios

1. Crea un array con al menos tres tipos de datos distintos.
2. Usa `push()` y `pop()` sobre el mismo array, y explica qué devuelve cada uno.
3. Usa `splice()` para quitar exactamente un elemento de un array, localizado primero con `indexOf()`.
4. Convierte una cadena de texto separada por comas en un array con `split()`, y vuelve a unirla con `join()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea un array con al menos tres tipos de datos distintos (ejercicio 1). Usa push() y pop(), y explica qué devuelve cada uno (ejercicio 2). Usa splice() para quitar un elemento localizado con indexOf() (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst mezcla = [1, 'dos', true, { cuatro: 4 }];\nmostrar(mezcla);\n\nconst numeros = [1, 2, 3];\nmostrar('push devuelve: ' + numeros.push(4));\nmostrar('pop devuelve: ' + numeros.pop());\nmostrar(numeros);",
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
      "titulo": "Arrays",
      "descripcion": "Guía de MDN sobre creación de arrays, acceso por índice, arrays anidados, métodos de mutación y conversión entre string y array.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays",
      "etiqueta": "MDN"
    }
  ]
}
```
