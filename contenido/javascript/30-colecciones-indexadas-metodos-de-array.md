# Colecciones indexadas: métodos de array

- **Módulo:** Arrays y colecciones a fondo
- **Slug:** `colecciones-indexadas-metodos-de-array` (autogenerado del título)
- **Orden:** 89
- **Fuentes:** [Indexed collections (web.dev)](https://web.dev/learn/javascript/collections/indexed) + [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) — ver `contenido/javascript/TEMARIO.md` #30

---

## Qué es y para qué sirve

Abre el módulo de colecciones. Un array es, por dentro, una forma especial de objeto — indexado por posición en vez de por nombre de clave — con su propio conjunto de métodos para añadir, quitar y modificar elementos en distintas posiciones.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita manipular una lista ordenada de elementos",
  "roles": [
    { "etiqueta": "Quien crea y accede a un array", "rol": "Índices desde 0, sin errores por rango", "descripcion": "El primer elemento está en la posición 0; acceder fuera de rango da undefined, nunca un error." },
    { "etiqueta": "Quien añade o quita en los extremos", "rol": "push/pop al final, unshift/shift al principio", "descripcion": "Cuatro métodos simétricos, dos para cada extremo del array." },
    { "etiqueta": "Quien modifica en mitad del array", "rol": "splice(), eliminar e insertar a la vez", "descripcion": "El único de los cuatro anteriores que puede operar en cualquier posición, no solo en los extremos." }
  ]
}
```

## Crear un array y acceder por índice

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const frutas = ['manzana', 'pera', 'uva'];             // preferido: literal de array\n  const otras = new Array('manzana', 'pera', 'uva');     // funciona igual, pero más verboso\n\n  console.log(frutas[0]);  // 'manzana' — el índice empieza en 0\n  console.log(frutas[10]); // undefined — fuera de rango, sin lanzar ningún error\n</script>",
  "anotaciones": [
    { "fragmento": "const frutas = ['manzana', 'pera', 'uva'];             // preferido: literal de array", "nota": "[] es la forma recomendada de crear un array — más concisa que new Array(...), que produce exactamente el mismo resultado pero con más ruido." },
    { "fragmento": "console.log(frutas[10]); // undefined — fuera de rango, sin lanzar ningún error", "nota": "A diferencia de otros lenguajes, acceder a un índice que no existe NUNCA lanza un error — simplemente devuelve undefined, silenciosamente." }
  ]
}
```

## length: no siempre es el número real de elementos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const gatos = [];\n  gatos[30] = 'Bigotes';\n  console.log(gatos.length); // 31 — length es siempre mayor que el índice más alto usado\n\n  const numeros = [1, 2, 3, 4, 5];\n  numeros.length = 2;\n  console.log(numeros); // [1, 2] — asignar a length TRUNCA el array\n</script>",
  "anotaciones": [
    { "fragmento": "gatos[30] = 'Bigotes';\n  console.log(gatos.length); // 31 — length es siempre mayor que el índice más alto usado", "nota": "Asignar directamente a un índice alto crea un array DISPERSO — length pasa a ser 31 (el índice usado más 1), aunque solo haya un elemento real dentro." },
    { "fragmento": "numeros.length = 2;\n  console.log(numeros); // [1, 2] — asignar a length TRUNCA el array", "nota": "length no es solo de LECTURA — asignarle un valor más pequeño elimina los elementos sobrantes de verdad, directamente sobre el array original." }
  ]
}
```

## Añadir y quitar al final: push() y pop()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const pila = ['uno', 'dos'];\n  const nuevaLongitud = pila.push('tres');\n  console.log(pila);          // ['uno', 'dos', 'tres']\n  console.log(nuevaLongitud); // 3 — push() devuelve la nueva longitud, no el array\n\n  const ultimo = pila.pop();\n  console.log(ultimo); // 'tres' — pop() devuelve el elemento eliminado\n  console.log(pila);   // ['uno', 'dos']\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(nuevaLongitud); // 3 — push() devuelve la nueva longitud, no el array", "nota": "push() modifica pila directamente y devuelve un NÚMERO (la nueva longitud) — no el array modificado. Encadenar pila.push(...).algo no funcionaría como se podría esperar." }
  ]
}
```

## Añadir y quitar al principio: unshift() y shift()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cola = ['tres', 'cuatro'];\n  cola.unshift('uno', 'dos');\n  console.log(cola); // ['uno', 'dos', 'tres', 'cuatro']\n\n  const primero = cola.shift();\n  console.log(primero); // 'uno'\n  console.log(cola);    // ['dos', 'tres', 'cuatro']\n</script>",
  "anotaciones": [
    { "fragmento": "cola.unshift('uno', 'dos');\n  console.log(cola); // ['uno', 'dos', 'tres', 'cuatro']", "nota": "unshift() inserta al PRINCIPIO, en el mismo orden en que se pasan los argumentos — el par push/pop trabaja en el final del array, unshift/shift en el principio." }
  ]
}
```

## En cualquier posición: splice()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = ['1', '2', '3', '4', '5'];\n  const eliminados = numeros.splice(1, 3, 'a', 'b', 'c', 'd');\n\n  console.log(numeros);    // ['1', 'a', 'b', 'c', 'd', '5']\n  console.log(eliminados); // ['2', '3', '4'] — lo que splice() quitó, no el resultado\n</script>",
  "anotaciones": [
    { "fragmento": "const eliminados = numeros.splice(1, 3, 'a', 'b', 'c', 'd');", "nota": "splice(índice, cantidad, ...nuevos) muta numeros directamente: empieza en el índice 1, elimina 3 elementos desde ahí, e inserta 'a', 'b', 'c', 'd' en su lugar — todo en una sola llamada." },
    { "fragmento": "console.log(eliminados); // ['2', '3', '4'] — lo que splice() quitó, no el resultado", "nota": "El valor de RETORNO de splice() es un array con los elementos ELIMINADOS, no el array resultante — para ver el resultado hay que mirar numeros, que splice() modificó por su cuenta." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los arrays también son un tipo por referencia",
  "contenido": "Igual que los objetos (visto en el módulo anterior), los arrays se asignan y se comparan por REFERENCIA, no por valor — dos variables que apuntan al mismo array comparten cualquier cambio hecho a través de cualquiera de ellas."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const numeros = ['1', '2', '3', '4', '5'];\n  const eliminados = numeros.splice(1, 2);\n\n  console.log(numeros);\n  console.log(eliminados);\n</script>",
  "opciones": [
    "['1', '4', '5'] y ['2', '3'] — splice(1, 2) elimina 2 elementos desde el índice 1, y devuelve justo esos elementos eliminados",
    "['1', '2', '3', '4', '5'] y ['2', '3'] — splice() nunca modifica el array original, solo devuelve lo que habría eliminado",
    "['2', '3'] y ['1', '4', '5'] — splice() devuelve lo que queda, y el original se convierte en lo eliminado"
  ],
  "correcta": 0,
  "explicacion": "splice(1, 2), sin un tercer argumento, solo ELIMINA: quita 2 elementos empezando en el índice 1 ('2' y '3'), mutando numeros directamente. numeros queda ['1', '4', '5']; el valor de retorno, eliminados, es un array nuevo con justo lo que se quitó: ['2', '3']."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "new Array() es la forma preferida de crear un array",
      "realidad": "Se recomienda el literal [] — produce el mismo resultado, con una sintaxis más concisa."
    },
    {
      "mito": "Acceder a un índice fuera de rango lanza un error",
      "realidad": "Devuelve undefined silenciosamente, sin interrumpir la ejecución."
    },
    {
      "mito": "length siempre refleja el número real de elementos del array",
      "realidad": "Es siempre mayor que el índice más alto usado — un array disperso puede tener un length mucho mayor que sus elementos reales."
    },
    {
      "mito": "splice() devuelve el array ya modificado, con el resultado final",
      "realidad": "Devuelve los elementos ELIMINADOS; el array original se modifica por su cuenta (mutación), no a través del valor de retorno."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar new Array() sin ninguna necesidad real.", "texto": "El literal [] hace exactamente lo mismo, con menos ruido visual." },
    { "titulo": "Esperar un error al acceder a un índice que no existe.", "texto": "JavaScript devuelve undefined en silencio, en vez de lanzar una excepción." },
    { "titulo": "Confiar en que length siempre coincide con el número de elementos reales.", "texto": "Un array disperso (con huecos) puede tener un length mayor de lo esperado." },
    { "titulo": "Olvidar que splice() muta el array original, a diferencia de otros métodos.", "texto": "Su valor de retorno son los elementos eliminados, no el resultado final." }
  ]
}
```

## Ejercicios

1. Crea un array con el literal `[]`, y accede a un índice fuera de rango para comprobar que da `undefined`.
2. Asigna directamente a un índice alto (por ejemplo, `[20]`) y comprueba qué valor toma `length` como consecuencia.
3. Usa `push()`/`pop()` para añadir y quitar al final, y `unshift()`/`shift()` para hacerlo al principio.
4. Usa `splice()` para eliminar e insertar elementos a la vez en mitad de un array, y examina lo que devuelve frente a lo que queda en el array original.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea un array con [] y accede a un índice fuera de rango (ejercicio 1). Asigna a un índice alto y comprueba qué pasa con length (ejercicio 2). Usa push/pop y unshift/shift (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst vacio = [];\nmostrar(vacio[5]);\n\nconst array = [1, 2, 3];\narray[10] = 'último';\nmostrar('length: ' + array.length);\n\narray.unshift('primero');\nmostrar(array);",
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
      "titulo": "Indexed collections",
      "descripcion": "Capítulo de web.dev sobre la creación de arrays con literal frente a new Array(), y el acceso por índice sin errores fuera de rango.",
      "url": "https://web.dev/learn/javascript/collections/indexed",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Indexed collections",
      "descripcion": "Guía de MDN sobre la propiedad length, y los métodos push(), pop(), unshift(), shift() y splice().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
      "etiqueta": "MDN"
    }
  ]
}
```
