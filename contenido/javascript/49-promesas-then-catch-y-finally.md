# Promesas: then, catch y finally

- **Módulo:** Asincronía
- **Slug:** `promesas-then-catch-y-finally` (autogenerado del título)
- **Orden:** 146
- **Fuentes:** [How to use promises (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises) + [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) + [Promise.prototype.finally() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) — ver `contenido/javascript/TEMARIO.md` #49

---

## Qué es y para qué sirve

Una `Promise` es un objeto que representa el estado de una operación asíncrona: `pending` (aún no se sabe el resultado), `fulfilled` (salió bien) o `rejected` (falló). `then()`, `catch()` y `finally()` son cómo se reacciona a cada uno de esos desenlaces, sin caer en el callback hell de la lección anterior.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita reaccionar al resultado de una promesa",
  "roles": [
    { "etiqueta": "Quien reacciona al éxito", "rol": "then()", "descripcion": "Se ejecuta cuando la promesa se cumple (fulfilled) — encadenable devolviendo otra promesa." },
    { "etiqueta": "Quien captura cualquier fallo", "rol": "catch()", "descripcion": "Un único punto al final de la cadena, para cualquier error de cualquier paso anterior." },
    { "etiqueta": "Quien limpia pase lo que pase", "rol": "finally()", "descripcion": "Se ejecuta siempre, haya ido bien o mal — sin recibir ningún argumento del resultado." }
  ]
}
```

## Una promesa: pending, y luego then()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const peticion = fetch('https://api.ejemplo.com/productos');\n  console.log(peticion); // Promise { <pending> } — todavía no se sabe el resultado\n\n  peticion.then((respuesta) => {\n    console.log(`Respuesta recibida: ${respuesta.status}`);\n  });\n\n  console.log('Petición iniciada...');\n\n  // Orden real:\n  // Promise { <pending> }\n  // 'Petición iniciada...'\n  // 'Respuesta recibida: 200'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(peticion); // Promise { <pending> } — todavía no se sabe el resultado", "nota": "fetch() devuelve INMEDIATAMENTE una Promise, en estado pending — el programa sigue ejecutándose sin esperar a que la petición real termine." },
    { "fragmento": "peticion.then((respuesta) => {\n    console.log(`Respuesta recibida: ${respuesta.status}`);\n  });", "nota": "then() registra qué hacer cuando la promesa se resuelva (fulfilled) — su función se ejecuta más tarde, sin bloquear nada mientras tanto." }
  ]
}
```

## Encadenar, no anidar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Anidado (evitar):\n  fetch('https://api.ejemplo.com/productos').then((respuesta) => {\n    const datosPromesa = respuesta.json();\n    datosPromesa.then((datos) => {\n      console.log(datos[0].nombre);\n    });\n  });\n\n  // Encadenado (preferido):\n  fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => respuesta.json())\n    .then((datos) => {\n      console.log(datos[0].nombre);\n    });\n</script>",
  "anotaciones": [
    { "fragmento": "fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => respuesta.json())\n    .then((datos) => {\n      console.log(datos[0].nombre);\n    });", "nota": "Devolver una promesa dentro de un then() permite ENCADENAR el siguiente then() directamente sobre ella — evita los niveles de indentación crecientes del callback hell visto en la lección anterior." }
  ]
}
```

## Tratar un error HTTP como un fallo real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => {\n      if (!respuesta.ok) {\n        throw new Error(`Error HTTP: ${respuesta.status}`);\n      }\n      return respuesta.json();\n    })\n    .then((datos) => console.log(datos[0].nombre));\n</script>",
  "anotaciones": [
    { "fragmento": "if (!respuesta.ok) {\n        throw new Error(`Error HTTP: ${respuesta.status}`);\n      }", "nota": "fetch() NO rechaza la promesa por un código de error HTTP (como 404 o 500) — solo por fallos de red. Comprobar respuesta.ok y lanzar un error manualmente es la forma de tratar esos casos como un fallo real dentro de la cadena." }
  ]
}
```

## catch(): un único punto para cualquier error

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);\n      return respuesta.json();\n    })\n    .then((datos) => console.log(datos[0].nombre))\n    .catch((error) => {\n      console.error('No se pudieron obtener los productos:', error);\n    });\n</script>",
  "anotaciones": [
    { "fragmento": ".catch((error) => {\n      console.error('No se pudieron obtener los productos:', error);\n    });", "nota": "Un único catch() al final de la cadena captura CUALQUIER error de cualquiera de los pasos anteriores — a diferencia del callback hell, no hace falta gestionar errores en cada nivel por separado." }
  ]
}
```

## finally(): limpieza garantizada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let cargando = true;\n\n  fetch('https://api.ejemplo.com/productos')\n    .then((respuesta) => respuesta.json())\n    .then((datos) => console.log(datos[0].nombre))\n    .catch((error) => console.error(error))\n    .finally(() => {\n      cargando = false; // se ejecuta SIEMPRE, haya ido bien o mal\n    });\n</script>",
  "anotaciones": [
    { "fragmento": ".finally(() => {\n      cargando = false; // se ejecuta SIEMPRE, haya ido bien o mal\n    });", "nota": "finally() se ejecuta pase lo que pase — éxito o fallo — el lugar ideal para tareas de limpieza como ocultar un indicador de carga, sin duplicar esa lógica en then() y en catch() por separado." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "finally() no recibe ningún argumento",
  "contenido": "El callback de finally() no recibe ni el valor de éxito ni el motivo del rechazo. Tiene sentido: su trabajo es limpiar, no procesar el resultado — para eso ya están then() y catch()."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  Promise.resolve(2)\n    .finally(() => 77)\n    .then((valor) => console.log(valor));\n</script>",
  "opciones": [
    "2 — finally() es \"transparente\": no cambia el valor con el que se resuelve la promesa original, aunque su callback devuelva algo distinto",
    "77 — el valor devuelto dentro de finally() sustituye al valor original de la promesa",
    "undefined — finally() no permite que ningún then() posterior siga leyendo el valor"
  ],
  "correcta": 0,
  "explicacion": "finally() es \"transparente\" — deja pasar el valor (o el motivo de rechazo) de la promesa original SIN modificarlo, sin importar qué devuelva su propio callback. Promise.resolve(2).finally(() => 77) sigue resolviéndose en 2; el 77 se descarta."
}
```

## Lo que then, catch y finally NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "fetch() rechaza la promesa cuando la respuesta HTTP es un error (404, 500...)",
      "realidad": "Solo rechaza por fallos de red — hay que comprobar respuesta.ok manualmente para tratar esos casos como error."
    },
    {
      "mito": "Anidar then() dentro de then() es equivalente a encadenarlos",
      "realidad": "Anidar reproduce el mismo problema del callback hell; encadenar (devolviendo la promesa) lo evita."
    },
    {
      "mito": "Cada then() de una cadena necesita su propio catch() para gestionar errores",
      "realidad": "Un único catch() al final captura errores de CUALQUIER paso anterior."
    },
    {
      "mito": "El valor que devuelve finally() sustituye al resultado de la promesa",
      "realidad": "finally() es transparente — no cambia ni el valor de éxito ni el motivo de rechazo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que fetch() falla automáticamente ante un código de error HTTP.", "texto": "Solo rechaza por fallos de red — el resto hay que comprobarlo con respuesta.ok." },
    { "titulo": "Anidar then() en vez de encadenarlos devolviendo la promesa.", "texto": "Reproduce el mismo problema de indentación creciente del callback hell." },
    { "titulo": "Repetir la misma gestión de errores en varios puntos de la cadena.", "texto": "Un catch() único al final basta para cualquier paso anterior." },
    { "titulo": "Esperar que finally() pueda modificar el resultado final de la promesa.", "texto": "Es transparente — solo sirve para efectos secundarios, no para transformar el valor." }
  ]
}
```

## Ejercicios

1. Usa `fetch().then()` sobre una URL real, y observa que la promesa se registra como `pending` antes de resolverse.
2. Reescribe una cadena de `then()` anidados como una cadena de `then()` encadenados devolviendo la promesa.
3. Comprueba `respuesta.ok` dentro de un `then()`, lanzando un error si la respuesta no fue exitosa.
4. Añade un `finally()` al final de una cadena, y demuestra que se ejecuta tanto si la promesa se cumple como si se rechaza.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to use promises",
      "descripcion": "Guía de MDN sobre los estados de una promesa, then() encadenado frente a anidado, y catch() como punto único de gestión de errores.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Promises",
      "descripcion": "Guía de referencia de MDN sobre el uso de promesas en profundidad.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Promise.prototype.finally()",
      "descripcion": "Referencia de MDN sobre finally(): que no recibe argumentos, y que es transparente al valor de la promesa original.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally",
      "etiqueta": "MDN"
    }
  ]
}
```
