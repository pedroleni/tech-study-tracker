# Desestructuración y spread/rest en objetos y arrays

- **Módulo:** Objetos
- **Slug:** `desestructuracion-y-spread-rest-en-objetos-y-arrays` (autogenerado del título)
- **Orden:** 86
- **Fuentes:** [Destructuring assignment (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) + [Spread syntax (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) + [Rest parameters (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) — ver `contenido/javascript/TEMARIO.md` #29

---

## Qué es y para qué sirve

Cierra el módulo de objetos con tres sintaxis relacionadas, todas basadas en `[]`, `{}` y `...`: **desestructurar** extrae valores de un array o de un objeto en variables sueltas de un solo golpe; **spread** (`...`) expande un array u objeto en sus elementos individuales; **rest** (misma sintaxis `...`, sentido opuesto) recolecta lo que sobra en un array o objeto nuevo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita extraer, expandir o recolectar de un solo golpe",
  "roles": [
    { "etiqueta": "Quien extrae variables sueltas", "rol": "Desestructuración", "descripcion": "En vez de acceder propiedad por propiedad, [] o {} en el lado izquierdo de una asignación extraen varias a la vez." },
    { "etiqueta": "Quien expande una colección", "rol": "Spread (...)", "descripcion": "Convierte un array o un objeto en sus elementos o propiedades individuales — para copiarlo, combinarlo, o pasarlo como argumentos." },
    { "etiqueta": "Quien recolecta lo que sobra", "rol": "Rest (...), el sentido opuesto", "descripcion": "La misma sintaxis que spread, pero al lado izquierdo: agrupa el resto de elementos o propiedades en un array u objeto nuevo." }
  ]
}
```

## Desestructurar arrays: posición, no nombre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const colores = ['rojo', 'verde', 'azul'];\n\n  const [primero, segundo, tercero] = colores;\n  console.log(primero, segundo, tercero); // 'rojo' 'verde' 'azul'\n\n  const [, , ultimo] = colores;\n  console.log(ultimo); // 'azul' — una coma vacía SALTA esa posición\n</script>",
  "anotaciones": [
    { "fragmento": "const [primero, segundo, tercero] = colores;", "nota": "En un array, la desestructuración asigna por POSICIÓN — el primer elemento a la primera variable, el segundo a la segunda, sin importar cómo se llamen las variables." },
    { "fragmento": "const [, , ultimo] = colores;\n  console.log(ultimo); // 'azul' — una coma vacía SALTA esa posición", "nota": "Dejar un hueco entre comas (sin nombre de variable) SALTA esa posición sin crear ninguna variable para ella — una forma compacta de quedarse solo con los elementos que interesan." }
  ]
}
```

## Valor por defecto y rest en arrays

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const [a = 1, b = 1] = [10];\n  console.log(a, b); // 10 1 — b usa el valor por defecto, al no haber segundo elemento\n\n  const [primero, ...resto] = [10, 20, 30, 40];\n  console.log(primero); // 10\n  console.log(resto);   // [20, 30, 40] — un array REAL con el resto\n</script>",
  "anotaciones": [
    { "fragmento": "const [a = 1, b = 1] = [10];\n  console.log(a, b); // 10 1 — b usa el valor por defecto, al no haber segundo elemento", "nota": "= valor después de cada nombre define un valor por defecto — se usa SOLO cuando esa posición no existe en el array (o vale undefined explícitamente)." },
    { "fragmento": "console.log(resto);   // [20, 30, 40] — un array REAL con el resto", "nota": "...resto (al final de una desestructuración de array) recolecta TODOS los elementos restantes en un array nuevo — el sentido opuesto de spread, aunque use el mismo ... ." }
  ]
}
```

## Desestructurar objetos: nombre de clave, no posición

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32 };\n\n  const { nombre, edad } = persona;\n  console.log(nombre, edad); // 'Ada' 32\n\n  const { nombre: nombrePersona } = persona;\n  console.log(nombrePersona); // 'Ada' — nombre ya no existe como variable, solo nombrePersona\n</script>",
  "anotaciones": [
    { "fragmento": "const { nombre, edad } = persona;", "nota": "En un objeto, la desestructuración funciona por NOMBRE DE CLAVE, no por posición — { nombre, edad } es un atajo de { nombre: nombre, edad: edad }." },
    { "fragmento": "const { nombre: nombrePersona } = persona;\n  console.log(nombrePersona); // 'Ada' — nombre ya no existe como variable, solo nombrePersona", "nota": "clave: nuevoNombre renombra la variable local — útil para evitar colisiones de nombres. La propiedad nombre del objeto original sigue llamándose nombre; solo cambia el nombre de la VARIABLE." }
  ]
}
```

## Valor por defecto y rest en objetos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const { nombre, apellido = 'Desconocido' } = { nombre: 'Ada' };\n  console.log(apellido); // 'Desconocido' — apellido no estaba en el objeto\n\n  const { nombre: n, ...resto } = { nombre: 'Ada', edad: 32, ciudad: 'Londres' };\n  console.log(resto); // { edad: 32, ciudad: 'Londres' } — todo menos nombre\n</script>",
  "anotaciones": [
    { "fragmento": "const { nombre: n, ...resto } = { nombre: 'Ada', edad: 32, ciudad: 'Londres' };\n  console.log(resto); // { edad: 32, ciudad: 'Londres' } — todo menos nombre", "nota": "...resto en un objeto recolecta las propiedades RESTANTES (las no mencionadas antes) en un objeto nuevo — el mismo concepto que el rest de arrays, aplicado a claves en vez de posiciones." }
  ]
}
```

## Desestructuración anidada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const usuario = {\n    nombre: 'Ada',\n    direccion: { ciudad: 'Londres', pais: 'Reino Unido' },\n  };\n\n  const {\n    nombre,\n    direccion: { ciudad },\n  } = usuario;\n\n  console.log(nombre, ciudad); // 'Ada' 'Londres'\n  // console.log(direccion); // ReferenceError — direccion en sí no se creó como variable\n</script>",
  "anotaciones": [
    { "fragmento": "// console.log(direccion); // ReferenceError — direccion en sí no se creó como variable", "nota": "direccion: { ciudad } usa direccion como RUTA para llegar a ciudad, pero no crea ninguna variable llamada direccion — solo se extrae lo que se nombra explícitamente al final del patrón." }
  ]
}
```

## Desestructurar directamente en los parámetros de una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const usuario = { id: 42, nombre: 'Ada', direccion: { ciudad: 'Londres' } };\n\n  function saludar({ nombre, direccion: { ciudad } }) {\n    return `Hola ${nombre}, desde ${ciudad}`;\n  }\n\n  console.log(saludar(usuario)); // 'Hola Ada, desde Londres'\n</script>",
  "anotaciones": [
    { "fragmento": "function saludar({ nombre, direccion: { ciudad } }) {", "nota": "El parámetro de una función también puede ser un patrón de desestructuración — al llamar a la función con un objeto, extrae nombre y ciudad directamente, sin necesitar una variable intermedia para el objeto completo." }
  ]
}
```

## Spread en arrays: combinar y copiar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const base = ['cabeza', 'hombros'];\n  const completo = ['inicio', ...base, 'fin'];\n  console.log(completo); // ['inicio', 'cabeza', 'hombros', 'fin']\n\n  const copia = [...base];\n  copia.push('rodillas');\n  console.log(base);  // ['cabeza', 'hombros'] — sin cambios\n  console.log(copia); // ['cabeza', 'hombros', 'rodillas']\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(completo); // ['inicio', 'cabeza', 'hombros', 'fin']", "nota": "...base EXPANDE cada elemento de base en su propia posición dentro del array nuevo — el sentido opuesto de rest, aunque comparta la misma sintaxis ..." },
    { "fragmento": "const copia = [...base];\n  copia.push('rodillas');\n  console.log(base);  // ['cabeza', 'hombros'] — sin cambios", "nota": "[...base] con nada más produce una copia — un array nuevo con los mismos elementos, independiente del original (aunque, igual que con objetos, sigue siendo una copia SUPERFICIAL si los elementos son a su vez objetos)." }
  ]
}
```

## Spread en objetos: fusionar, y quién gana

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const valores1 = { color: 'rojo', tamano: 'M' };\n  const valores2 = { color: 'azul', precio: 20 };\n\n  const combinado = { ...valores1, ...valores2 };\n  console.log(combinado); // { color: 'azul', tamano: 'M', precio: 20 }\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(combinado); // { color: 'azul', tamano: 'M', precio: 20 }", "nota": "Cuando dos spreads repiten la misma clave (color), gana el que se escribe DESPUÉS — el orden de los ... importa, igual que en cualquier asignación de propiedades repetidas." }
  ]
}
```

## Spread al llamar a una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function sumar(x, y, z) {\n    return x + y + z;\n  }\n\n  const numeros = [1, 2, 3];\n  console.log(sumar(...numeros)); // 6\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(sumar(...numeros)); // 6", "nota": "...numeros expande el array en argumentos INDIVIDUALES — sumar(...numeros) es exactamente igual que escribir sumar(1, 2, 3) a mano." }
  ]
}
```

## Rest en parámetros de función: un array real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function registrar(primero, ...resto) {\n    console.log(primero); // 'a'\n    console.log(resto);   // ['b', 'c', 'd'] — un array REAL\n    console.log(resto.sort()); // funciona directamente\n  }\n\n  registrar('a', 'b', 'c', 'd');\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(resto.sort()); // funciona directamente", "nota": "...resto recolecta los argumentos sobrantes en un array de VERDAD — soporta sort(), map(), filter()... directamente. El objeto arguments (más antiguo, ya no necesario con rest) es solo array-like: arguments.sort() lanza un TypeError." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El patrón rest siempre va al final",
  "contenido": "Tanto en parámetros de función como en desestructuración, ...algo debe ser el ÚLTIMO elemento del patrón — function f(...resto, ultimo) o const [a, ...resto, b] = arr son errores de sintaxis. Tiene sentido: no habría forma de saber cuántos elementos le corresponden a resto si algo viene después."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const valores1 = { color: 'rojo', tamano: 'M' };\n  const valores2 = { color: 'azul' };\n\n  const combinado = { tamano: 'S', ...valores1, ...valores2 };\n  console.log(combinado.tamano);\n  console.log(combinado.color);\n</script>",
  "opciones": [
    "'M' y 'azul' — cada spread se aplica en orden y sobrescribe las claves repetidas; tamano solo se define en valores1, así que no vuelve a cambiar",
    "'S' y 'rojo' — el primer valor escrito para cada clave siempre gana",
    "'M' y 'rojo' — solo se sobrescriben las claves que aparecen en los DOS objetos combinados a la vez"
  ],
  "correcta": 0,
  "explicacion": "Los spreads se aplican en orden, de izquierda a derecha: { tamano: 'S' } → se fusiona con valores1 → tamano pasa a 'M', se añade color: 'rojo' → se fusiona con valores2 → color pasa a 'azul' (valores2 no tiene tamano, así que ese no vuelve a cambiar). Resultado: tamano 'M', color 'azul'."
}
```

## Lo que desestructuración, spread y rest NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La desestructuración solo funciona con arrays, no con objetos",
      "realidad": "Funciona igual de bien con objetos — por posición en arrays, por nombre de clave en objetos."
    },
    {
      "mito": "El patrón rest (...) se puede colocar en cualquier posición de un patrón o lista de parámetros",
      "realidad": "Siempre debe ir en último lugar — tanto en desestructuración como en parámetros de función."
    },
    {
      "mito": "Renombrar una variable al desestructurar un objeto ({ clave: nuevoNombre }) también renombra la propiedad original",
      "realidad": "Solo cambia el nombre de la VARIABLE local — la propiedad del objeto original sigue llamándose igual."
    },
    {
      "mito": "arguments y un parámetro rest (...algo) son exactamente lo mismo, solo con sintaxis distinta",
      "realidad": "rest es un array de verdad (soporta sort(), map()... directamente); arguments es solo array-like, y esos métodos lanzan TypeError sobre él."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No usar valores por defecto cuando un elemento o propiedad podría faltar.", "texto": "Sin ellos, la variable simplemente queda en undefined." },
    { "titulo": "Confundir spread (expandir) con rest (recolectar).", "texto": "Comparten la misma sintaxis ..., pero significan lo opuesto según el lado de la asignación." },
    { "titulo": "Colocar rest en una posición que no sea la última del patrón.", "texto": "Es un error de sintaxis, no un comportamiento inesperado." },
    { "titulo": "Esperar que un nivel intermedio de una desestructuración anidada quede disponible como variable.", "texto": "Solo se crean variables para lo que se nombra explícitamente al final del patrón." }
  ]
}
```

## Ejercicios

1. Desestructura un array con al menos un valor por defecto y un elemento saltado con una coma vacía.
2. Desestructura un objeto renombrando al menos una variable, y usa rest para capturar el resto de propiedades en un objeto nuevo.
3. Combina dos objetos con spread donde ambos tengan una clave repetida, y comprueba experimentalmente cuál gana.
4. Escribe una función con un parámetro rest, y demuestra que es un array real usando `sort()` o `map()` directamente sobre él.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Destructuring assignment",
      "descripcion": "Referencia de MDN sobre desestructuración de arrays y objetos: valores por defecto, renombrado, patrones anidados, rest, y desestructuración en parámetros de función.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Spread syntax",
      "descripcion": "Referencia de MDN sobre spread en literales de array, literales de objeto (incluida la regla de qué clave gana), y llamadas a función.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Rest parameters",
      "descripcion": "Referencia de MDN sobre parámetros rest en funciones: que producen un array real, la regla de ir siempre al final, y la comparación con el objeto arguments.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters",
      "etiqueta": "MDN"
    }
  ]
}
```
