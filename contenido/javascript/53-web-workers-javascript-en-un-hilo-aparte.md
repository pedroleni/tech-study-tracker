# Web Workers: JavaScript en un hilo aparte

- **Módulo:** Asincronía
- **Slug:** `web-workers-javascript-en-un-hilo-aparte` (autogenerado del título)
- **Orden:** 158
- **Fuentes:** [Introducing workers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing_workers) + [Worker: terminate() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate) — ver `contenido/javascript/TEMARIO.md` #53

---

## Qué es y para qué sirve

Cierra el módulo de asincronía. Las promesas evitan bloquear mientras se ESPERA algo (una respuesta de red, un temporizador) — pero un cálculo pesado y síncrono sigue congelando la página igual, porque JavaScript es de un solo hilo. Un Web Worker resuelve eso de verdad: ejecuta código en un hilo COMPLETAMENTE aparte.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita un hilo de verdad aparte",
  "roles": [
    { "etiqueta": "Quien crea el hilo aparte", "rol": "new Worker(url)", "descripcion": "Ejecuta un script en un mundo completamente distinto, sin acceso al DOM." },
    { "etiqueta": "Quien se comunica por mensajes", "rol": "postMessage() / 'message'", "descripcion": "La única forma de intercambiar datos entre el hilo principal y el worker, en ambas direcciones." },
    { "etiqueta": "Quien detiene el worker", "rol": "terminate()", "descripcion": "Lo detiene al instante, sin darle oportunidad de terminar lo que estuviera haciendo." }
  ]
}
```

## Crear un worker y enviarle un mensaje

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Script principal\n  const trabajador = new Worker('./generarPrimos.js');\n\n  document.querySelector('#generar').addEventListener('click', () => {\n    const cantidad = document.querySelector('#cantidad').value;\n    trabajador.postMessage({ comando: 'generar', cantidad });\n  });\n\n  trabajador.addEventListener('message', (mensaje) => {\n    document.querySelector('#salida').textContent =\n      `¡Generados ${mensaje.data} números primos!`;\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "const trabajador = new Worker('./generarPrimos.js');", "nota": "new Worker() crea un hilo COMPLETAMENTE aparte, ejecutando el script indicado — su código corre en paralelo, sin compartir nada directamente con el hilo principal." },
    { "fragmento": "trabajador.postMessage({ comando: 'generar', cantidad });", "nota": "postMessage() envía datos al worker de forma asíncrona — no bloquea nada en el hilo principal, ni siquiera mientras el worker calcula." }
  ]
}
```

## El script del worker: recibir, calcular, responder

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // generarPrimos.js — el script del worker\n  addEventListener('message', (mensaje) => {\n    if (mensaje.data.comando === 'generar') {\n      generarPrimos(mensaje.data.cantidad);\n    }\n  });\n\n  function esPrimo(n) {\n    for (let i = 2; i <= Math.sqrt(n); i++) {\n      if (n % i === 0) return false;\n    }\n    return n > 1;\n  }\n\n  function generarPrimos(cantidad) {\n    const primos = [];\n    while (primos.length < cantidad) {\n      const candidato = Math.floor(Math.random() * 1000000);\n      if (esPrimo(candidato)) primos.push(candidato);\n    }\n    postMessage(primos.length); // envía el resultado de vuelta\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "postMessage(primos.length); // envía el resultado de vuelta", "nota": "Dentro del worker, postMessage() (sin trabajador. delante) envía el resultado DE VUELTA al hilo principal — el mismo mecanismo de mensajes, en sentido contrario." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El mismo problema que congelaba la página, ahora resuelto",
  "contenido": "Este es exactamente el mismo cálculo de números primos que congelaba la página en la lección de introducción a la asincronía — la diferencia es que ahora se ejecuta en un hilo APARTE. Mientras el worker calcula, la página sigue respondiendo con total normalidad."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un worker no tiene acceso al DOM",
  "contenido": "Un worker se ejecuta en un mundo COMPLETAMENTE aparte — sin acceso a window, document, ni a ningún elemento de la página. La única forma de comunicarse con el hilo principal es a través de mensajes (postMessage), en ambas direcciones."
}
```

## terminate(): detener el worker al instante

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const trabajador = new Worker('./generarPrimos.js');\n\n  // ...\n\n  trabajador.terminate(); // detiene el worker de inmediato\n</script>",
  "anotaciones": [
    { "fragmento": "trabajador.terminate(); // detiene el worker de inmediato", "nota": "terminate() detiene el worker AL INSTANTE, sin darle oportunidad de terminar lo que estuviera haciendo — útil para cancelar una tarea que ya no hace falta." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  // Dentro del script del worker:\n  console.log(typeof document);\n  console.log(typeof self);\n</script>",
  "opciones": [
    "'undefined' y 'object' — el worker no tiene acceso a document (ni a window), pero sí a self, su propio ámbito global",
    "'object' y 'object' — un worker tiene acceso completo al DOM, igual que el hilo principal",
    "'undefined' y 'undefined' — un worker no tiene ningún objeto global propio"
  ],
  "correcta": 0,
  "explicacion": "Dentro de un worker, document (y window) simplemente no existen — typeof document da 'undefined'. self sí existe: es la referencia al propio ámbito global del worker, el equivalente a window en el hilo principal, pero sin ningún acceso al DOM."
}
```

## Lo que un worker NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un worker puede acceder al DOM, igual que el hilo principal",
      "realidad": "No tiene acceso a window, document ni a ningún elemento de la página."
    },
    {
      "mito": "postMessage() bloquea el hilo principal hasta que el worker responde",
      "realidad": "Es asíncrono — el hilo principal sigue funcionando con normalidad mientras el worker trabaja."
    },
    {
      "mito": "Todos los workers son iguales, sin ninguna distinción entre tipos",
      "realidad": "Existen dedicated (un único script), shared (compartidos entre varias ventanas) y service workers (proxy para funcionalidad offline), con propósitos distintos."
    },
    {
      "mito": "terminate() le da al worker oportunidad de terminar su tarea actual antes de detenerse",
      "realidad": "Lo detiene DE INMEDIATO, sin ninguna oportunidad de finalizar lo que estuviera haciendo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar acceder al DOM directamente desde el código de un worker.", "texto": "No existe ahí dentro — la comunicación solo puede pasar por mensajes." },
    { "titulo": "Olvidar que la comunicación con un worker es exclusivamente por mensajes, en ambas direcciones.", "texto": "No hay variables ni funciones compartidas directamente entre los dos mundos." },
    { "titulo": "No usar terminate() para cancelar una tarea de worker que ya no hace falta.", "texto": "El worker seguiría consumiendo recursos sin ningún propósito real." },
    { "titulo": "Confundir un dedicated worker con un service worker.", "texto": "Cumplen propósitos distintos — uno para cálculo en paralelo, el otro para funcionalidad offline." }
  ]
}
```

## Ejercicios

1. Crea un worker con `new Worker()` que reciba un mensaje del hilo principal y responda con otro.
2. Reescribe la tarea síncrona pesada de la lección de introducción a la asincronía usando un worker, y comprueba que la página ya no se congela.
3. Intenta acceder a `document` dentro del código de un worker, y comprueba qué ocurre.
4. Detén un worker con `terminate()`, y explica la diferencia con dejar que termine su tarea por sí solo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Introducing workers",
      "descripcion": "Guía de MDN sobre qué es un worker, los tres tipos (dedicated, shared, service), y la comunicación por mensajes con el ejemplo completo del generador de números primos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing_workers",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Worker: terminate()",
      "descripcion": "Referencia de MDN sobre terminate(): sin argumentos, y sin darle al worker oportunidad de terminar su tarea actual.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate",
      "etiqueta": "MDN"
    }
  ]
}
```
