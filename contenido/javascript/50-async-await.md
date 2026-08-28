# async/await

- **Módulo:** Asincronía
- **Slug:** `async-await` (autogenerado del título)
- **Orden:** 149
- **Fuentes:** [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) + [async function (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — ver `contenido/javascript/TEMARIO.md` #50

---

## Qué es y para qué sirve

`async`/`await` se construye directamente sobre las promesas de la lección anterior — no las sustituye, solo ofrece una sintaxis que se lee como código síncrono, sin encadenar `then()`. Por dentro, sigue siendo exactamente el mismo mecanismo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el código asíncrono se lea como síncrono",
  "roles": [
    { "etiqueta": "Quien marca una función como asíncrona", "rol": "async", "descripcion": "Habilita el uso de await dentro — y hace que la función SIEMPRE devuelva una promesa." },
    { "etiqueta": "Quien pausa hasta tener el resultado", "rol": "await", "descripcion": "Espera a que una promesa se resuelva, sin bloquear el resto del programa mientras tanto." },
    { "etiqueta": "Quien gestiona errores", "rol": "try/catch", "descripcion": "Reemplaza a catch() — cualquier promesa rechazada dentro del try salta directamente al catch." }
  ]
}
```

## Reescribir una cadena then() con async/await

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Con then():\n  fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => respuesta.json())\n    .then((datos) => console.log(datos[0].nombre));\n\n  // Con async/await, el mismo resultado:\n  async function obtenerProductos() {\n    const respuesta = await fetch('https://api.ejemplo.com/productos');\n    const datos = await respuesta.json();\n    console.log(datos[0].nombre);\n  }\n  obtenerProductos();\n</script>",
  "anotaciones": [
    { "fragmento": "const respuesta = await fetch('https://api.ejemplo.com/productos');\n    const datos = await respuesta.json();", "nota": "await PAUSA la ejecución de la función hasta que la promesa se resuelve, y devuelve directamente su valor — sin necesitar then() ni una función de callback separada. Se lee como código síncrono, aunque siga siendo asíncrono por dentro." }
  ]
}
```

## Una función async siempre devuelve una promesa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function calcular() {\n    return 1; // un valor normal, no una promesa\n  }\n\n  calcular().then((resultado) => console.log(resultado)); // 1\n  console.log(calcular()); // Promise { 1 }\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(calcular()); // Promise { 1 }", "nota": "Toda función async devuelve SIEMPRE una promesa — aunque dentro se haga un return de un valor normal, JavaScript lo envuelve automáticamente en Promise.resolve(valor). Por eso calcular().then(...) funciona, aunque calcular() nunca menciona explícitamente ninguna promesa." }
  ]
}
```

## try/catch reemplaza a catch()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function obtenerProductos() {\n    try {\n      const respuesta = await fetch('https://api.ejemplo.com/productos');\n      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);\n      const datos = await respuesta.json();\n      console.log(datos[0].nombre);\n    } catch (error) {\n      console.error('No se pudieron obtener los productos:', error);\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "} catch (error) {\n      console.error('No se pudieron obtener los productos:', error);\n    }", "nota": "try/catch reemplaza a catch() en el mundo de async/await — cualquier promesa rechazada dentro del try (o cualquier throw manual) salta directamente al catch, igual que con un error síncrono normal." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "await solo funciona dentro de una función async",
  "contenido": "await solo se puede usar dentro de una función async (o de un módulo, en su nivel superior) — usarlo fuera de un contexto async es un SyntaxError directo, detectado antes de ejecutar nada."
}
```

## await no bloquea el resto del programa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function tareaLenta() {\n    console.log('Empieza tarea lenta');\n    await new Promise((resolver) => setTimeout(resolver, 1000));\n    console.log('Termina tarea lenta');\n  }\n\n  tareaLenta();\n  console.log('Esto se imprime ANTES de que termine la tarea lenta');\n</script>",
  "anotaciones": [
    { "fragmento": "console.log('Esto se imprime ANTES de que termine la tarea lenta');", "nota": "await pausa la función tareaLenta() en ese punto — pero NO detiene el resto del programa. Este console.log se ejecuta mientras tareaLenta() sigue esperando, exactamente igual que pasaría con then()." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  async function saludar() {\n    return 'Hola';\n  }\n\n  const resultado = saludar();\n  console.log(resultado);\n  resultado.then((valor) => console.log(valor));\n</script>",
  "opciones": [
    "Promise { 'Hola' } y luego 'Hola' — saludar() devuelve SIEMPRE una promesa, aunque dentro se haga return de un string normal",
    "'Hola' y luego undefined — saludar() devuelve el string directamente, sin envolverlo en ninguna promesa",
    "Un error, porque resultado.then() no se puede usar sobre el valor de retorno de una función async"
  ],
  "correcta": 0,
  "explicacion": "Toda función async devuelve SIEMPRE una promesa — aunque su cuerpo haga return de un valor normal como 'Hola', JavaScript lo envuelve automáticamente. console.log(resultado) muestra la promesa en sí; resultado.then() funciona porque resultado ES una promesa, y su callback recibe el valor real: 'Hola'."
}
```

## Lo que async/await NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una función async devuelve el valor directamente, tal cual se escribe en el return",
      "realidad": "SIEMPRE lo envuelve en una promesa, aunque el valor no sea una promesa en absoluto."
    },
    {
      "mito": "await se puede usar en cualquier función, sea o no async",
      "realidad": "Solo funciona dentro de una función async (o un módulo) — fuera de ahí es un SyntaxError."
    },
    {
      "mito": "await pausa TODO el programa mientras espera",
      "realidad": "Solo pausa la función async en la que se usa — el resto del código sigue ejecutándose con normalidad."
    },
    {
      "mito": "async/await sustituye a las promesas, no tiene relación con ellas",
      "realidad": "Se construye directamente SOBRE las promesas — await simplemente las espera, con una sintaxis más legible."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que una función async devuelva un valor normal, en vez de una promesa que lo envuelve.", "texto": "Hace falta await o .then() para leer el valor real dentro." },
    { "titulo": "Usar await fuera de una función async.", "texto": "Provoca un SyntaxError, detectado antes de ejecutar nada." },
    { "titulo": "Pensar que await bloquea todo el programa, en vez de solo la función donde se usa.", "texto": "El resto del código sigue corriendo con normalidad mientras tanto." },
    { "titulo": "No usar try/catch alrededor de un await.", "texto": "Deja errores de la promesa (o throws manuales) sin ninguna gestión." }
  ]
}
```

## Ejercicios

1. Reescribe una cadena de `then()` como una función `async` con `await`, manteniendo el mismo resultado.
2. Escribe una función `async` que haga `return` de un valor normal, y demuestra con `.then()` que en realidad devuelve una promesa.
3. Envuelve un `await` en `try/catch`, y provoca un error para comprobar que se captura correctamente.
4. Demuestra que `await` no bloquea el resto del programa, ejecutando código fuera de la función `async` mientras esta todavía espera.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Promises",
      "descripcion": "Guía de MDN sobre async/await construido sobre promesas, reescribir una cadena then() con await, y try/catch como gestión de errores.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
      "etiqueta": "MDN"
    },
    {
      "titulo": "async function",
      "descripcion": "Referencia de MDN confirmando que una función async siempre devuelve una promesa, con el ejemplo concreto de un return de valor normal envuelto automáticamente.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
      "etiqueta": "MDN"
    }
  ]
}
```
