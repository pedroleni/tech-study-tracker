# Primera toma de contacto: escribir y ejecutar código

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `primera-toma-de-contacto-escribir-y-ejecutar-codigo` (autogenerado del título)
- **Orden:** 5
- **Fuentes:** [A first splash into JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash) — ver `contenido/javascript/TEMARIO.md` #2

---

## Qué es y para qué sirve

Esta lección no profundiza en nada todavía — cada pieza que aparece aquí (variables, funciones, condicionales, seleccionar un elemento, escuchar un clic) tiene su propia lección dedicada más adelante en este mismo temario. El objetivo es solo ver, de un vistazo, cómo unas pocas piezas simples ya bastan para algo interactivo de verdad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién junta las primeras piezas del lenguaje",
  "roles": [
    { "etiqueta": "Quien prueba código en la consola", "rol": "Escribir y ver el resultado al instante", "descripcion": "La consola de DevTools ejecuta JavaScript línea a línea, sin necesitar ni un archivo ni un servidor." },
    { "etiqueta": "Quien combina piezas pequeñas", "rol": "Variables, función, condicional, evento", "descripcion": "Ninguna pieza por separado es interactiva — juntas, ya lo son." },
    { "etiqueta": "Quien conecta un clic a una función", "rol": "Reaccionar a lo que la persona hace", "descripcion": "addEventListener es el puente entre \"algo pasó en la página\" y \"que se ejecute este código\"." }
  ]
}
```

## La consola de DevTools: un patio de pruebas

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Escribir y ejecutar sin ningún archivo",
  "contenido": "Las herramientas de desarrollador del navegador incluyen una consola donde se puede escribir JavaScript directamente y ver el resultado al momento, sin necesitar guardar nada. Es el sitio más rápido para probar una idea suelta antes de escribirla en un archivo real."
}
```

## Variables: guardar un valor con un nombre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let numeroSecreto = Math.floor(Math.random() * 100) + 1;\n  const boton = document.querySelector('#boton');\n</script>",
  "anotaciones": [
    { "fragmento": "let numeroSecreto", "nota": "let declara una variable que SÍ se puede reasignar más adelante. El detalle completo de let, const y var llega en su propia lección — aquí solo hace falta saber que guardan un valor bajo un nombre." },
    { "fragmento": "const boton", "nota": "const declara algo que no se puede volver a asignar — aquí, una referencia fija al botón seleccionado." }
  ]
}
```

## Una función: código reutilizable

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function saludar() {\n    console.log('¡Hola!');\n  }\n\n  saludar();\n</script>",
  "anotaciones": [
    { "fragmento": "function saludar() {\n    console.log('¡Hola!');\n  }", "nota": "Un bloque de código con nombre, que se puede ejecutar tantas veces como haga falta sin volver a escribirlo. El módulo 3 completo está dedicado a funciones." },
    { "fragmento": "saludar();", "nota": "Los paréntesis EJECUTAN la función ahora mismo. Sin ellos (solo saludar), estaríamos refiriéndonos a la función sin llamarla — una distinción que va a importar mucho más adelante, con addEventListener." }
  ]
}
```

## Seleccionar un elemento: document.querySelector

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p id=\"resultado\"></p>\n\n<script>\n  const resultado = document.querySelector('#resultado');\n  resultado.textContent = 'Texto nuevo';\n</script>",
  "anotaciones": [
    { "fragmento": "document.querySelector('#resultado')", "nota": "querySelector SOLO selecciona y guarda una referencia al elemento — no cambia nada por sí solo. El módulo 7 (El DOM) entra en el detalle completo de cómo seleccionar y recorrer elementos." },
    { "fragmento": "resultado.textContent = 'Texto nuevo';", "nota": "Este es el paso que de verdad modifica algo — cambiar textContent sobre la referencia ya guardada." }
  ]
}
```

## Un condicional: elegir qué código ejecutar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const edad = 137;\n\n  if (edad > 100) {\n    console.log('Más de un siglo');\n  } else {\n    console.log('Todavía no llega al siglo');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (edad > 100) {", "nota": "Solo entra aquí si la condición es verdadera. El módulo 2 completo está dedicado a condicionales y control de flujo." }
  ]
}
```

## Conectar un clic a una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  boton.addEventListener('click', saludar);\n</script>",
  "anotaciones": [
    { "fragmento": "boton.addEventListener('click', saludar);", "nota": "saludar se pasa SIN paréntesis — con paréntesis (saludar()) se ejecutaría de inmediato, al leer esa línea, en vez de esperar al clic. El módulo 8 completo está dedicado a eventos." }
  ]
}
```

## Todo junto: un ejemplo mínimo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<button id=\"boton\">¿Cuántos años tiene la Torre Eiffel?</button>\n<p id=\"resultado\"></p>\n\n<script>\n  const boton = document.querySelector('#boton');\n  const resultado = document.querySelector('#resultado');\n\n  function revelarRespuesta() {\n    const anios = 2026 - 1889;\n    if (anios > 100) {\n      resultado.textContent = `Más de un siglo: ${anios} años.`;\n    } else {\n      resultado.textContent = `Todavía no llega al siglo: ${anios} años.`;\n    }\n  }\n\n  boton.addEventListener('click', revelarRespuesta);\n</script>",
  "anotaciones": [
    { "fragmento": "`Más de un siglo: ${anios} años.`", "nota": "Las comillas invertidas (`) crean un template literal — permiten insertar el valor de una variable directamente dentro del texto con ${}, sin concatenar con +." },
    { "fragmento": "boton.addEventListener('click', revelarRespuesta);", "nota": "Aquí está todo junto: una referencia guardada (boton), una función (revelarRespuesta) con un condicional dentro, y un evento que conecta ambas cosas." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const anios = 2026 - 1889;\n  let mensaje;\n  if (anios > 100) {\n    mensaje = `Más de un siglo: ${anios} años.`;\n  } else {\n    mensaje = `Todavía no llega al siglo: ${anios} años.`;\n  }\n  console.log(mensaje);\n</script>",
  "opciones": [
    "Más de un siglo: 137 años.",
    "Todavía no llega al siglo: 137 años.",
    "Nada — hace falta pulsar un botón para que se calcule algo"
  ],
  "correcta": 0,
  "explicacion": "2026 - 1889 es 137, y 137 > 100 es verdadero — así que se ejecuta la primera rama del condicional. El template literal inserta 137 directamente en el texto."
}
```

## Lo que estas piezas NO hacen todavía

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Hay que aprender toda la sintaxis del lenguaje antes de escribir algo que funcione",
      "realidad": "Un puñado de piezas básicas — variables, una función, un condicional, un event listener — ya bastan para algo interactivo real, como demuestra el ejemplo de esta lección."
    },
    {
      "mito": "La consola de DevTools solo sirve para ver mensajes de error",
      "realidad": "Es un entorno completo para escribir y probar JavaScript línea a línea, sin necesitar ni un archivo ni un servidor."
    },
    {
      "mito": "document.querySelector() modifica el HTML por sí solo",
      "realidad": "Solo lo SELECCIONA y guarda una referencia — hace falta código adicional, como cambiar textContent, para modificar algo de verdad."
    },
    {
      "mito": "addEventListener necesita que la función se pase con paréntesis, igual que al llamarla normalmente",
      "realidad": "Se pasa SIN paréntesis — con paréntesis, se ejecutaría de inmediato al leer esa línea, no cuando ocurra el evento."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Ejecutar la función por accidente al pasarla a addEventListener con paréntesis de más.", "texto": "saludar() en vez de saludar la ejecuta de inmediato, no cuando ocurra el clic." },
    { "titulo": "Esperar que querySelector cambie algo por sí solo.", "texto": "Solo selecciona — modificar algo requiere un paso adicional." },
    { "titulo": "Sentir que hace falta dominar todo el lenguaje antes de escribir algo real.", "texto": "Unas pocas piezas básicas, bien combinadas, ya son suficientes." },
    { "titulo": "Olvidar que const impide reasignar la variable, no modificar lo que contiene.", "texto": "El detalle completo llega en la lección dedicada a variables." }
  ]
}
```

## Ejercicios

1. Escribe una variable `const` que guarde una referencia a un botón con `document.querySelector`.
2. Escribe una función que cambie el texto de un párrafo al ejecutarse.
3. Conecta esa función al clic del botón con `addEventListener`, sin ejecutarla por error al escribir la línea.
4. Añade un condicional dentro de la función que muestre un mensaje distinto según una condición.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "A first splash into JavaScript",
      "descripcion": "Guía de MDN con un primer vistazo práctico combinando variables, funciones, condicionales, selección de elementos y eventos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash",
      "etiqueta": "MDN"
    }
  ]
}
```
