# Introducción a JavaScript asíncrono

- **Módulo:** Asincronía
- **Slug:** `introduccion-a-javascript-asincrono` (autogenerado del título)
- **Orden:** 143
- **Fuentes:** [Introducing asynchronous JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing) — ver `contenido/javascript/TEMARIO.md` #48

---

## Qué es y para qué sirve

Abre el módulo de asincronía. JavaScript es de un solo hilo: solo puede hacer una cosa a la vez. Una tarea síncrona que tarda congela TODO lo demás mientras dura — el problema que la programación asíncrona existe para resolver.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita no bloquear la página",
  "roles": [
    { "etiqueta": "Quien sufre el bloqueo", "rol": "Código síncrono pesado", "descripcion": "Mientras se ejecuta, la página no responde a clics, teclas, ni nada más — JavaScript es de un solo hilo." },
    { "etiqueta": "Quien inicia sin esperar", "rol": "Una tarea asíncrona", "descripcion": "Arranca, devuelve el control de inmediato, y avisa con el resultado cuando termina — sin congelar nada mientras tanto." },
    { "etiqueta": "Quien pasa una función para después", "rol": "Un callback", "descripcion": "La forma histórica de encadenar pasos asíncronos — con un problema real cuando se anidan demasiados." }
  ]
}
```

## El problema: código síncrono que bloquea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const LIMITE = 1000000;\n  const boton = document.querySelector('#generar');\n  const salida = document.querySelector('#salida');\n\n  function esPrimo(n) {\n    for (let i = 2; i <= Math.sqrt(n); i++) {\n      if (n % i === 0) return false;\n    }\n    return n > 1;\n  }\n\n  function generarPrimos(cantidad) {\n    const primos = [];\n    while (primos.length < cantidad) {\n      const candidato = Math.floor(Math.random() * LIMITE);\n      if (esPrimo(candidato)) primos.push(candidato);\n    }\n    return primos;\n  }\n\n  boton.addEventListener('click', () => {\n    const primos = generarPrimos(10000); // tarda varios segundos\n    salida.textContent = `Generados ${primos.length} números primos`;\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "const primos = generarPrimos(10000); // tarda varios segundos", "nota": "Mientras generarPrimos() se ejecuta, la página queda COMPLETAMENTE congelada — no responde a clics, ni a teclas, ni a nada — porque JavaScript es de UN SOLO HILO: solo puede hacer una cosa a la vez." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "JavaScript es single-threaded",
  "contenido": "Solo puede ejecutar una instrucción a la vez, en un único hilo. Cualquier tarea síncrona que tarde bloquea TODO lo demás mientras dura, incluida la interfaz de usuario — sin importar cuántos manejadores de eventos haya registrados."
}
```

## Lo que la asincronía permite: no esperar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log('Empieza');\n\n  setTimeout(() => {\n    console.log('Esto llega DESPUÉS, aunque se programe antes que lo de abajo');\n  }, 0);\n\n  console.log('Termina');\n\n  // Orden real de salida:\n  // 'Empieza'\n  // 'Termina'\n  // 'Esto llega DESPUÉS, aunque se programe antes que lo de abajo'\n</script>",
  "anotaciones": [
    { "fragmento": "// Orden real de salida:\n  // 'Empieza'\n  // 'Termina'\n  // 'Esto llega DESPUÉS, aunque se programe antes que lo de abajo'", "nota": "setTimeout() inicia una tarea y devuelve el control INMEDIATAMENTE — el resto del código (console.log('Termina')) sigue ejecutándose sin esperar, y la función pasada se ejecuta más tarde, sin bloquear nada mientras tanto." }
  ]
}
```

## Callbacks: la forma histórica de encadenar pasos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function paso1(inicial, callback) {\n    callback(inicial + 1);\n  }\n  function paso2(inicial, callback) {\n    callback(inicial + 2);\n  }\n\n  paso1(0, (resultado1) => {\n    paso2(resultado1, (resultado2) => {\n      console.log(resultado2); // 3\n    });\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "paso1(0, (resultado1) => {\n    paso2(resultado1, (resultado2) => {\n      console.log(resultado2); // 3\n    });\n  });", "nota": "Un callback es una función que se PASA a otra, para que la llame cuando le corresponda — la forma histórica de encadenar pasos asíncronos, antes de que existieran las promesas." }
  ]
}
```

## El problema real: callback hell

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  paso1(0, (resultado1) => {\n    paso2(resultado1, (resultado2) => {\n      paso3(resultado2, (resultado3) => {\n        paso4(resultado3, (resultado4) => {\n          console.log(resultado4); // cada vez más anidado...\n        });\n      });\n    });\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "paso1(0, (resultado1) => {\n    paso2(resultado1, (resultado2) => {\n      paso3(resultado2, (resultado3) => {\n        paso4(resultado3, (resultado4) => {\n          console.log(resultado4); // cada vez más anidado...\n        });\n      });\n    });\n  });", "nota": "Cada paso adicional anida el código un nivel más — el 'callback hell' o 'pirámide de la perdición'. Difícil de leer, y gestionar errores exige hacerlo en CADA nivel por separado, en vez de una sola vez." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las promesas resuelven este problema",
  "contenido": "Las APIs asíncronas modernas usan promesas (Promise) en vez de callbacks anidados — evitan el callback hell con una sintaxis mucho más plana. Su funcionamiento a fondo tiene su propia lección justo después de esta."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log('A');\n  setTimeout(() => console.log('B'), 0);\n  console.log('C');\n</script>",
  "opciones": [
    "'A', 'C', 'B' — el código síncrono (A y C) se ejecuta primero por completo; la función de setTimeout, aunque con 0ms, se ejecuta DESPUÉS",
    "'A', 'B', 'C' — setTimeout con 0ms se ejecuta inmediatamente, en su posición exacta dentro del código",
    "'B', 'A', 'C' — las tareas asíncronas siempre tienen prioridad sobre el código síncrono"
  ],
  "correcta": 0,
  "explicacion": "Incluso con un retraso de 0ms, setTimeout() programa su función para ejecutarse DESPUÉS de que todo el código síncrono actual termine — 'A' y 'C' se imprimen primero, en orden, y 'B' llega al final, aunque su retraso sea prácticamente nulo."
}
```

## Lo que la asincronía NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "JavaScript puede ejecutar varias tareas síncronas a la vez, en paralelo",
      "realidad": "Es single-threaded — una instrucción a la vez, en un único hilo."
    },
    {
      "mito": "Una tarea programada con setTimeout(fn, 0) se ejecuta inmediatamente, antes que el resto del código",
      "realidad": "Se ejecuta DESPUÉS de que todo el código síncrono actual termine, sin importar el retraso indicado."
    },
    {
      "mito": "Los callbacks anidados son solo una cuestión de estilo, sin ningún problema real",
      "realidad": "El callback hell dificulta genuinamente la lectura y la gestión de errores, que hay que repetir en cada nivel."
    },
    {
      "mito": "Las promesas son un reemplazo directo de setTimeout()",
      "realidad": "Son un patrón para gestionar el RESULTADO de una operación asíncrona — un concepto distinto, con su propia lección a continuación."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Ejecutar una tarea síncrona pesada esperando que la interfaz siga respondiendo mientras tanto.", "texto": "JavaScript de un solo hilo no puede hacer las dos cosas a la vez." },
    { "titulo": "Confundir el retraso de setTimeout(fn, 0) con una ejecución inmediata.", "texto": "Siempre se ejecuta después de que el código síncrono actual termine." },
    { "titulo": "Anidar callbacks sin límite, en vez de reconocer la necesidad de un patrón mejor.", "texto": "El callback hell empeora con cada nivel adicional." },
    { "titulo": "Gestionar errores por separado en cada nivel de una cadena de callbacks anidados.", "texto": "Un problema real que las promesas resuelven de forma más centralizada." }
  ]
}
```

## Ejercicios

1. Escribe un bucle síncrono que tarde varios segundos, y comprueba que la página deja de responder mientras se ejecuta.
2. Usa `setTimeout()` para programar una tarea, y comprueba el orden real de ejecución frente al código síncrono que la rodea.
3. Escribe una cadena de dos o tres callbacks anidados que se pasen un resultado entre sí.
4. Explica en tus propias palabras qué hace difícil de mantener el callback hell.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Usa setTimeout() para programar una tarea y comprueba el orden real de ejecución frente al código síncrono (ejercicio 2). Escribe una cadena de dos o tres callbacks anidados (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nmostrar('1: código síncrono, línea 1');\nsetTimeout(() => mostrar('3: esto se ejecuta después, aunque el timeout sea 0ms'), 0);\nmostrar('2: código síncrono, línea 2');\n\nsetTimeout(() => {\n  mostrar('Paso A');\n  setTimeout(() => {\n    mostrar('Paso B, anidado dentro de A');\n  }, 200);\n}, 200);",
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
      "titulo": "Introducing asynchronous JavaScript",
      "descripcion": "Guía de MDN sobre el problema del bloqueo síncrono, qué permite la programación asíncrona, callbacks, y el callback hell que las promesas vienen a resolver.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing",
      "etiqueta": "MDN"
    }
  ]
}
```
