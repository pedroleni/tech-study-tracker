# Colecciones con clave: Map y Set

- **Módulo:** Arrays y colecciones a fondo
- **Slug:** `colecciones-con-clave-map-y-set` (autogenerado del título)
- **Orden:** 95
- **Fuentes:** [Keyed collections (web.dev)](https://web.dev/learn/javascript/collections/keyed) + [Keyed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections) — ver `contenido/javascript/TEMARIO.md` #32

---

## Qué es y para qué sirve

`Map` y `Set` son dos colecciones dedicadas, con ventajas reales sobre usar un objeto o un array para lo mismo: `Map` guarda pares clave-valor aceptando cualquier tipo de clave; `Set` guarda una colección de valores únicos, sin duplicados.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que un objeto o un array",
  "roles": [
    { "etiqueta": "Quien necesita claves de cualquier tipo", "rol": "Map", "descripcion": "A diferencia de un objeto (claves siempre string), un Map acepta objetos, funciones, NaN — cualquier valor — como clave." },
    { "etiqueta": "Quien necesita valores únicos", "rol": "Set", "descripcion": "Añadir un valor que ya existe no hace nada — un Set no puede tener duplicados, por definición." },
    { "etiqueta": "Quien consulta el tamaño ya", "rol": "size, no length", "descripcion": "Tanto Map como Set exponen size como propiedad — sin necesitar Object.keys(obj).length ni un contador manual." }
  ]
}
```

## Map: crear, leer, comprobar, borrar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const sonidos = new Map();\n  sonidos.set('perro', 'guau');\n  sonidos.set('gato', 'miau');\n\n  console.log(sonidos.size);         // 2\n  console.log(sonidos.get('perro')); // 'guau'\n  console.log(sonidos.get('zorro')); // undefined — no existe esa clave\n  console.log(sonidos.has('gato'));  // true\n\n  sonidos.delete('perro');\n  console.log(sonidos.has('perro')); // false\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(sonidos.size);         // 2", "nota": "size es una PROPIEDAD, no un método — se lee directamente, sin paréntesis. A diferencia de un objeto normal, no hace falta Object.keys(obj).length para saber cuántas entradas hay." },
    { "fragmento": "console.log(sonidos.get('zorro')); // undefined — no existe esa clave", "nota": "get() de una clave que no existe devuelve undefined, sin lanzar ningún error — igual que acceder a una propiedad inexistente de un objeto." }
  ]
}
```

## Map: cualquier valor como clave, sin conversión

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const funcionComoClave = () => {};\n  const objetoComoClave = {};\n\n  const metadatos = new Map();\n  metadatos.set(funcionComoClave, 'una función como clave');\n  metadatos.set(objetoComoClave, 'un objeto como clave');\n  metadatos.set(NaN, 'incluso NaN es válida');\n\n  console.log(metadatos.get(objetoComoClave)); // 'un objeto como clave'\n  console.log(metadatos.size); // 3\n</script>",
  "anotaciones": [
    { "fragmento": "metadatos.set(funcionComoClave, 'una función como clave');\n  metadatos.set(objetoComoClave, 'un objeto como clave');\n  metadatos.set(NaN, 'incluso NaN es válida');", "nota": "A diferencia de un objeto normal (donde CUALQUIER clave se coacciona a string, visto en la lección de property accessors), un Map acepta cualquier valor como clave TAL CUAL, sin ninguna conversión — funciones, objetos, incluso NaN." }
  ]
}
```

## Map: iterar en orden de inserción

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const sonidos = new Map([['perro', 'guau'], ['gato', 'miau']]);\n\n  for (const [animal, sonido] of sonidos) {\n    console.log(`${animal} hace ${sonido}`);\n  }\n  // 'perro hace guau'\n  // 'gato hace miau' — en el mismo orden en que se insertaron\n</script>",
  "anotaciones": [
    { "fragmento": "for (const [animal, sonido] of sonidos) {", "nota": "for...of sobre un Map entrega pares [clave, valor] en cada vuelta — desestructurarlos directamente en el propio bucle es el patrón habitual." },
    { "fragmento": "// 'gato hace miau' — en el mismo orden en que se insertaron", "nota": "Un Map garantiza que el orden de iteración es SIEMPRE el orden de inserción — algo que un objeto normal no garantiza formalmente del mismo modo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Map frente a un objeto normal como colección",
  "contenido": "Un Map tiene ventajas reales frente a un objeto usado como colección: acepta cualquier tipo de clave (no solo strings), expone size directamente, garantiza el orden de inserción al iterar, y no arrastra las claves heredadas de Object.prototype. Se recomienda especialmente cuando las claves no se conocen hasta tiempo de ejecución — sobre todo si vienen de una fuente externa."
}
```

## Set: valores únicos, sin duplicados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = new Set([1, 2, 2, 3]);\n  console.log(numeros.size); // 3, no 4 — duplicados ignorados desde la creación\n\n  for (const numero of numeros) {\n    console.log(numero);\n  }\n  // 1\n  // 2\n  // 3\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(numeros.size); // 3, no 4 — duplicados ignorados desde la creación", "nota": "new Set([...]) elimina los duplicados automáticamente al construirse — un Set solo puede contener valores ÚNICOS, por definición, sin importar cuántas veces se intente añadir el mismo valor." }
  ]
}
```

## El idiom de deduplicar un array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const conDuplicados = [1, 2, 2, 3, 3, 3, 4];\n  const unicos = [...new Set(conDuplicados)];\n\n  console.log(unicos); // [1, 2, 3, 4]\n</script>",
  "anotaciones": [
    { "fragmento": "const unicos = [...new Set(conDuplicados)];", "nota": "new Set(array) elimina los duplicados; el spread [...] lo vuelve a convertir en un array normal — el idiom más común en JavaScript para deduplicar un array en una sola línea." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "WeakMap y WeakSet: variantes menos comunes",
  "contenido": "WeakMap y WeakSet solo aceptan objetos (o símbolos) como claves, no son iterables, y permiten que el recolector de basura libere memoria automáticamente cuando ya no queda ninguna otra referencia externa a esa clave — útiles para asociar metadatos a objetos sin impedir que se liberen cuando ya no se usan en ningún otro sitio."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const clave1 = {};\n  const clave2 = {};\n\n  const mapa = new Map();\n  mapa.set(clave1, 'primero');\n  mapa.set(clave2, 'segundo');\n\n  console.log(mapa.size);\n  console.log(mapa.get(clave1));\n  console.log(mapa.get({}));\n</script>",
  "opciones": [
    "2, 'primero', undefined — clave1 y clave2 son objetos distintos aunque estén vacíos, y un {} nuevo en get() es una tercera referencia que no coincide con ninguna guardada",
    "1, 'segundo', 'segundo' — todos los objetos vacíos {} se consideran la misma clave",
    "2, 'primero', 'primero' — un Map compara sus claves por contenido, no por referencia"
  ],
  "correcta": 0,
  "explicacion": "Igual que la comparación de objetos con === (vista en una lección anterior), un Map compara sus claves-objeto por REFERENCIA. clave1 y clave2 son dos objetos distintos, así que ocupan dos entradas independientes: size es 2. Un {} literal nuevo dentro de get({}) es una TERCERA referencia, que no coincide con ninguna de las dos guardadas: undefined."
}
```

## Lo que Map y Set NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un Map solo puede usar strings como clave, igual que un objeto normal",
      "realidad": "Acepta cualquier tipo de valor como clave, sin ninguna conversión — objetos, funciones, NaN, lo que sea."
    },
    {
      "mito": "Un Set lanza un error al intentar añadir un valor duplicado",
      "realidad": "Simplemente no hace nada — ni error, ni cambio en size."
    },
    {
      "mito": "El orden de iteración de un Map o un Set no está garantizado, igual que en un objeto normal",
      "realidad": "Ambos garantizan que el orden de iteración es siempre el orden de INSERCIÓN."
    },
    {
      "mito": "WeakMap y WeakSet son solo versiones más rápidas de Map y Set",
      "realidad": "Existen por su comportamiento con el recolector de basura y su restricción a claves de tipo objeto — no son una mejora de rendimiento genérica."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar un objeto normal cuando las claves no se conocen hasta tiempo de ejecución.", "texto": "Un Map evita riesgos como colisionar con claves heredadas de Object.prototype." },
    { "titulo": "Contar las entradas de un objeto a mano en vez de usar size.", "texto": "Map y Set lo exponen directamente, sin necesitar Object.keys(obj).length." },
    { "titulo": "Esperar que un Set compare valores compuestos (objetos, arrays) por contenido.", "texto": "Los compara por REFERENCIA, igual que === entre objetos." },
    { "titulo": "No aprovechar new Set(array) + spread como idiom directo para deduplicar.", "texto": "Evita escribir a mano un bucle con comprobación manual de duplicados." }
  ]
}
```

## Ejercicios

1. Crea un `Map` con al menos tres entradas, y recórrelo con `for...of` desestructurando clave y valor en cada vuelta.
2. Usa un objeto (o una función) como clave de un `Map`, y demuestra que un objeto "igual" pero distinto no encuentra esa entrada.
3. Deduplica un array con elementos repetidos usando `new Set()` y el spread.
4. Explica en tus propias palabras dos ventajas reales de `Map` sobre un objeto normal usado como colección.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea un Map con al menos tres entradas y recórrelo con for...of (ejercicio 1). Deduplica un array con new Set() y el spread (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst capitales = new Map([\n  ['España', 'Madrid'],\n  ['Francia', 'París'],\n  ['Italia', 'Roma'],\n]);\nfor (const [pais, capital] of capitales) {\n  mostrar(pais + ' -> ' + capital);\n}\n\nconst conRepetidos = [1, 2, 2, 3, 3, 3];\nconst unicos = [...new Set(conRepetidos)];\nmostrar(unicos);",
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
      "titulo": "Keyed collections",
      "descripcion": "Capítulo de web.dev sobre la creación de Map y Set, sus métodos principales, y las variantes WeakMap y WeakSet.",
      "url": "https://web.dev/learn/javascript/collections/keyed",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Keyed collections",
      "descripcion": "Guía de MDN con ejemplos de Map y Set: set/get/has/delete, iteración con for...of, el idiom de deduplicar con Set, y la comparación directa entre Map y un objeto normal.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections",
      "etiqueta": "MDN"
    }
  ]
}
```
