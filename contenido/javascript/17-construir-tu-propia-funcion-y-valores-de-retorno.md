# Construir tu propia función y valores de retorno

- **Módulo:** Funciones
- **Slug:** `construir-tu-propia-funcion-y-valores-de-retorno` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Build your own function (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Build_your_own_function) + [Function return values (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Return_values) + [The "return" keyword (web.dev)](https://web.dev/learn/javascript/functions/return) — ver `contenido/javascript/TEMARIO.md` #17

---

## Qué es y para qué sirve

Antes de escribir una función, conviene planificar qué debe hacer y qué parámetros necesita. `return` es cómo una función entrega un resultado de vuelta — y corta su ejecución en el acto, sin excepciones.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién construye y planifica una función propia",
  "roles": [
    { "etiqueta": "Quien planifica antes de programar", "rol": "Qué debe hacer, y con qué datos", "descripcion": "Pensar el propósito y los parámetros antes de escribir la primera línea ahorra reescribir después." },
    { "etiqueta": "Quien usa el valor que devuelve algo", "rol": "Guardarlo, o usarlo directamente", "descripcion": "Un valor de retorno se sustituye justo en el punto donde se llamó a la función." },
    { "etiqueta": "Quien corta la función con return", "rol": "De inmediato, sin excepciones", "descripcion": "Nada de lo que venga después de un return, dentro de esa misma función, llega a ejecutarse." }
  ]
}
```

## Planificar antes de escribir

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<button>Mostrar mensaje</button>\n\n<script>\n  function mostrarMensaje() {\n    const panel = document.createElement('div');\n    panel.textContent = 'Este es un mensaje';\n    document.body.appendChild(panel);\n  }\n\n  const boton = document.querySelector('button');\n  boton.addEventListener('click', mostrarMensaje);\n</script>",
  "anotaciones": [
    { "fragmento": "boton.addEventListener('click', mostrarMensaje);", "nota": "Sin paréntesis — se pasa la función para que se ejecute MÁS TARDE, al hacer clic. Con paréntesis (mostrarMensaje()), se ejecutaría de inmediato al leer esta línea, sin esperar ningún clic." }
  ]
}
```

## Añadir parámetros a una función propia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function mostrarMensaje(texto, tipo) {\n    const panel = document.createElement('div');\n    panel.textContent = texto;\n\n    if (tipo === 'aviso') {\n      panel.style.backgroundColor = 'red';\n    } else if (tipo === 'chat') {\n      panel.style.backgroundColor = 'aqua';\n    }\n\n    document.body.appendChild(panel);\n  }\n\n  mostrarMensaje('Tu bandeja está casi llena', 'aviso');\n  mostrarMensaje('Hola, ¿qué tal?', 'chat');\n</script>",
  "anotaciones": [
    { "fragmento": "function mostrarMensaje(texto, tipo) {", "nota": "Dos parámetros hacen la función reutilizable para cualquier mensaje y cualquier tipo, en vez de escribir una función distinta para cada caso concreto." }
  ]
}
```

## Usar el valor que devuelve una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const texto = 'El clima está frío';\n  const nuevoTexto = texto.replace('frío', 'cálido');\n  console.log(nuevoTexto); // 'El clima está cálido'\n</script>",
  "anotaciones": [
    { "fragmento": "const nuevoTexto = texto.replace('frío', 'cálido');", "nota": "replace() DEVUELVE un nuevo string — ese valor de retorno es lo que se guarda en nuevoTexto. Sin guardar el resultado, el valor devuelto se perdería." }
  ]
}
```

## return en una función propia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function numeroAleatorio(maximo) {\n    return Math.floor(Math.random() * maximo);\n  }\n\n  const resultado = numeroAleatorio(10);\n  console.log(resultado); // un número entre 0 y 9\n</script>",
  "anotaciones": [
    { "fragmento": "return Math.floor(Math.random() * maximo);", "nota": "return entrega ese valor de vuelta al punto exacto donde se llamó la función — aquí, se sustituye directamente en numeroAleatorio(10), que es lo que termina guardándose en resultado." }
  ]
}
```

## Sin return explícito: undefined

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function saludar() {\n    console.log('¡Hola!');\n    // sin ningún return\n  }\n\n  const resultado = saludar();\n  console.log(resultado); // undefined\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(resultado); // undefined", "nota": "Una función SIN return explícito no devuelve \"nada\" en el sentido literal — devuelve undefined, de forma implícita. \"Nada\" en JavaScript casi siempre significa undefined." }
  ]
}
```

## return corta la ejecución de inmediato

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function miFuncion() {\n    return true;\n    console.log('Esto nunca se ejecuta'); // código inalcanzable\n  }\n\n  console.log(miFuncion()); // true\n</script>",
  "anotaciones": [
    { "fragmento": "console.log('Esto nunca se ejecuta'); // código inalcanzable", "nota": "En cuanto el motor llega a un return, la función termina EN ESE MISMO INSTANTE — el código que sigue, dentro de esa misma función, ni siquiera se evalúa. Algunos navegadores incluso avisan de \"unreachable code after return statement\"." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Retorno anticipado: cortar antes a propósito",
  "contenido": "Un return colocado dentro de un if, antes del final de la función, permite \"salir antes\" cuando ya se sabe el resultado — evitando anidar condicionales innecesariamente. Se conoce como early return, y suele hacer el código más plano y fácil de leer."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function miFuncion() {\n    return true;\n    console.log('¿Se ejecuta esto?');\n  }\n  console.log(miFuncion());\n</script>",
  "opciones": [
    "true — y el console.log de dentro nunca llega a ejecutarse, porque return corta la función de inmediato",
    "true, y también se imprime '¿Se ejecuta esto?' justo antes",
    "undefined, porque el código después del return rompe la función entera"
  ],
  "correcta": 0,
  "explicacion": "return true; termina miFuncion en el acto — el console.log que viene después, dentro de esa misma función, nunca se ejecuta. Solo true llega a imprimirse, resultado de miFuncion()."
}
```

## Lo que return NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una función sin return explícito no devuelve nada en absoluto",
      "realidad": "Sí devuelve algo — undefined, de forma implícita. \"Nada\" en JavaScript casi siempre es undefined, no la ausencia total de un valor."
    },
    {
      "mito": "El código después de un return se ejecuta, solo que su resultado se ignora",
      "realidad": "return corta la ejecución de la función DE INMEDIATO — el código que sigue nunca llega a ejecutarse, ni siquiera se evalúa."
    },
    {
      "mito": "return solo puede usarse una vez, al final de la función",
      "realidad": "Se puede usar en cualquier punto, incluso varias veces en distintas ramas condicionales — el patrón de retorno anticipado lo aprovecha a propósito."
    },
    {
      "mito": "Pasar una función a addEventListener con paréntesis es lo mismo que sin ellos",
      "realidad": "Con paréntesis, la función se EJECUTA de inmediato al leer esa línea; sin ellos, se pasa para que se ejecute más tarde, cuando ocurra el evento."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir código después de un return esperando que se ejecute igualmente.", "texto": "Es código inalcanzable — nunca llega a evaluarse." },
    { "titulo": "Olvidar que una función sin return explícito sigue devolviendo undefined.", "texto": "No es lo mismo que no devolver nada en absoluto." },
    { "titulo": "No aprovechar el retorno anticipado para simplificar condicionales anidados.", "texto": "Un early return suele hacer el código más plano y legible." },
    { "titulo": "Pasar una función con paréntesis de más a addEventListener.", "texto": "La ejecuta de inmediato, en vez de esperar al evento real." }
  ]
}
```

## Ejercicios

1. Escribe una función que reciba un número y devuelva su cuadrado con `return`.
2. Escribe una función sin ningún `return` explícito, y explica qué devuelve al llamarla.
3. Escribe una función con un `return` anticipado dentro de un `if`, seguido de más código después del `if`.
4. Explica por qué el código escrito justo después de un `return` nunca llega a ejecutarse.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una función que reciba un número y devuelva su cuadrado con return (ejercicio 1). Escribe una función sin return explícito y observa qué devuelve (ejercicio 2). Escribe un return anticipado dentro de un if (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nfunction cuadrado(numero) {\n  return numero * numero;\n}\nmostrar(cuadrado(5));\n\nfunction sinReturn() {\n  const x = 1;\n}\nmostrar(sinReturn());",
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
      "titulo": "Build your own function",
      "descripcion": "Guía práctica de MDN construyendo una función displayMessage() paso a paso, con parámetros añadidos progresivamente.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Build_your_own_function",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Function return values",
      "descripcion": "Guía de MDN sobre el uso de valores de retorno de funciones existentes y propias con return.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Return_values",
      "etiqueta": "MDN"
    },
    {
      "titulo": "The \"return\" keyword",
      "descripcion": "Capítulo de web.dev sobre cómo return corta la ejecución de inmediato, dejando código inalcanzable después.",
      "url": "https://web.dev/learn/javascript/functions/return",
      "etiqueta": "web.dev"
    }
  ]
}
```
