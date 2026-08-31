# Implementar una API basada en promesas

- **Módulo:** Asincronía
- **Slug:** `implementar-una-api-basada-en-promesas` (autogenerado del título)
- **Orden:** 152
- **Fuentes:** [Implementing a promise-based API (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Implementing_a_promise-based_API) — ver `contenido/javascript/TEMARIO.md` #51

---

## Qué es y para qué sirve

Cierra el módulo de asincronía. Hasta ahora, `fetch()` y otras APIs nativas ya devolvían promesas listas para usar. El constructor `Promise` permite envolver CUALQUIER operación asíncrona propia (como `setTimeout()`) y convertirla en una promesa real, con el mismo `then()`/`catch()`/`await` de siempre.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita construir su propia promesa",
  "roles": [
    { "etiqueta": "Quien envuelve la operación", "rol": "new Promise((resolver, rechazar) => {...})", "descripcion": "Recibe una función ejecutora con dos parámetros: uno para el éxito, otro para el fallo." },
    { "etiqueta": "Quien marca el éxito", "rol": "resolver(valor)", "descripcion": "Se llama cuando la operación asíncrona termina bien — el valor pasa a quien use then() o await." },
    { "etiqueta": "Quien marca el fallo", "rol": "rechazar(error)", "descripcion": "Se llama ante un problema — validación previa, o un error real durante la operación." }
  ]
}
```

## El constructor Promise: envolver setTimeout()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function despertador(persona, retraso) {\n    return new Promise((resolver, rechazar) => {\n      if (retraso < 0) {\n        rechazar(new Error('El retraso no puede ser negativo'));\n        return;\n      }\n      setTimeout(() => {\n        resolver(`¡Despierta, ${persona}!`);\n      }, retraso);\n    });\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "return new Promise((resolver, rechazar) => {", "nota": "El constructor Promise recibe una función EJECUTORA con dos parámetros — resolver (para el éxito) y rechazar (para el fallo). Es la herramienta para envolver cualquier operación asíncrona (aquí, setTimeout) y convertirla en una promesa real." },
    { "fragmento": "if (retraso < 0) {\n        rechazar(new Error('El retraso no puede ser negativo'));\n        return;\n      }", "nota": "Comprobar los argumentos ANTES de empezar la operación asíncrona, y rechazar con un Error si algo no tiene sentido — el return justo después evita seguir ejecutando el resto de la función por error." },
    { "fragmento": "setTimeout(() => {\n        resolver(`¡Despierta, ${persona}!`);\n      }, retraso);", "nota": "resolver(mensaje) se llama cuando la operación asíncrona (el setTimeout) por fin termina — el valor que se le pasa es el que recibirán then() o await más adelante." }
  ]
}
```

## Usar la API implementada: igual que cualquier otra promesa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  despertador('Ana', 1000)\n    .then((mensaje) => console.log(mensaje))    // '¡Despierta, Ana!'\n    .catch((error) => console.log(`No se pudo: ${error}`));\n</script>",
  "anotaciones": [
    { "fragmento": "despertador('Ana', 1000)\n    .then((mensaje) => console.log(mensaje))    // '¡Despierta, Ana!'\n    .catch((error) => console.log(`No se pudo: ${error}`));", "nota": "La función implementada se USA exactamente igual que fetch() o cualquier otra API basada en promesas — porque, por dentro, es exactamente eso: una promesa real." }
  ]
}
```

## También funciona con async/await

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function despertarA(persona) {\n    try {\n      const mensaje = await despertador(persona, 1000);\n      console.log(mensaje);\n    } catch (error) {\n      console.log(`No se pudo: ${error}`);\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "const mensaje = await despertador(persona, 1000);", "nota": "Al ser una promesa real, despertador() también funciona con await — el mismo patrón visto en la lección anterior, sin ninguna diferencia por haberla escrito a mano." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un throw dentro del ejecutor también rechaza",
  "contenido": "Si el código dentro de la función ejecutora lanza un error (throw) en vez de llamar a rechazar() explícitamente, la promesa se rechaza IGUALMENTE de forma automática — un mecanismo de seguridad adicional, no una obligación de usar siempre rechazar() a mano."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function despertador(persona, retraso) {\n    return new Promise((resolver, rechazar) => {\n      if (retraso < 0) {\n        rechazar(new Error('El retraso no puede ser negativo'));\n        return;\n      }\n      setTimeout(() => resolver(`¡Despierta, ${persona}!`), retraso);\n    });\n  }\n\n  despertador('Ana', -500)\n    .then((mensaje) => console.log(mensaje))\n    .catch((error) => console.log(`No se pudo: ${error.message}`));\n</script>",
  "opciones": [
    "'No se pudo: El retraso no puede ser negativo' — retraso es -500, así que rechazar() se llama de inmediato, sin esperar a ningún setTimeout",
    "'¡Despierta, Ana!' — setTimeout() con un retraso negativo se ejecuta inmediatamente",
    "Nada se imprime — una promesa rechazada sin then() correspondiente se ignora en silencio"
  ],
  "correcta": 0,
  "explicacion": "retraso vale -500, así que la condición retraso < 0 es cierta — rechazar() se llama de inmediato con el Error, sin llegar siquiera a programar el setTimeout(). Como la promesa se RECHAZA, then() se salta por completo y catch() se ejecuta, imprimiendo el mensaje del error."
}
```

## Lo que el constructor Promise NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El constructor Promise solo sirve para envolver funciones que ya devuelven promesas",
      "realidad": "Es precisamente la herramienta para convertir código que NO usa promesas (como setTimeout) en una promesa real."
    },
    {
      "mito": "resolve y reject pueden llamarse las dos en la misma ejecución, una tras otra",
      "realidad": "La primera llamada decide el resultado final de la promesa — las siguientes se ignoran."
    },
    {
      "mito": "Una promesa implementada a mano no funciona con async/await, solo con then()",
      "realidad": "Funciona exactamente igual — es una promesa real, sin diferencia con las que devuelve fetch() u otras APIs nativas."
    },
    {
      "mito": "Si el código dentro del ejecutor lanza un error, la promesa se queda pendiente para siempre",
      "realidad": "Un throw dentro del ejecutor rechaza la promesa automáticamente."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar convertir una función basada en callbacks a promesas sin usar el constructor Promise.", "texto": "Es precisamente la herramienta pensada para ese caso." },
    { "titulo": "Olvidar el return tras llamar a rechazar(), dejando que el resto de la función siga ejecutándose.", "texto": "Puede acabar llamando también a resolver() por error." },
    { "titulo": "Llamar a resolve() y luego también a reject() (o viceversa).", "texto": "Solo la primera llamada cuenta — las siguientes se ignoran." },
    { "titulo": "No aprovechar que un throw dentro del ejecutor ya rechaza la promesa automáticamente.", "texto": "No siempre hace falta llamar a rechazar() explícitamente." }
  ]
}
```

## Ejercicios

1. Implementa una función que envuelva `setTimeout()` en una promesa propia, usando el constructor `Promise`.
2. Añade una validación de argumentos que llame a `reject()` antes de iniciar la operación asíncrona.
3. Consume tu función implementada tanto con `then()`/`catch()` como con `async`/`await`.
4. Provoca que el código dentro del ejecutor lance un error con `throw`, y comprueba que la promesa se rechaza igualmente.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Implementa una función que envuelva setTimeout() en una promesa propia con el constructor Promise (ejercicio 1). Añade una validación que llame a reject() antes de empezar (ejercicio 2). Consúmela con then()/catch() y con async/await (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nfunction esperar(ms) {\n  return new Promise((resolve, reject) => {\n    if (ms < 0) {\n      reject(new Error('ms no puede ser negativo'));\n      return;\n    }\n    setTimeout(() => resolve('Esperé ' + ms + 'ms'), ms);\n  });\n}\n\nesperar(300).then((mensaje) => mostrar(mensaje));\n\nasync function probar() {\n  const mensaje = await esperar(500);\n  mostrar('Con async/await: ' + mensaje);\n}\nprobar();",
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
      "titulo": "Implementing a promise-based API",
      "descripcion": "Guía de MDN sobre el constructor Promise, resolve/reject, y el ejemplo completo de un despertador basado en setTimeout, consumido con then()/catch() y con async/await.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Implementing_a_promise-based_API",
      "etiqueta": "MDN"
    }
  ]
}
```
