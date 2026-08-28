# Depurar JavaScript con DevTools

- **Módulo:** Calidad y organización
- **Slug:** `depurar-javascript-con-devtools` (autogenerado del título)
- **Orden:** 206
- **Fuentes:** [JavaScript debugging and error handling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript) + [debugger (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) — ver `contenido/javascript/TEMARIO.md` #69

---

## Qué es y para qué sirve

Abre el último módulo. Más allá de `console.log()`, las herramientas de desarrollo del navegador permiten pausar la ejecución en un punto exacto, e inspeccionar el valor real de cada variable en ese instante — en vez de adivinarlo a base de imprimir cosas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que adivinar qué está pasando",
  "roles": [
    { "etiqueta": "Quien imprime para inspeccionar", "rol": "console.log() / console.error()", "descripcion": "El segundo añade formato de error y una traza de llamadas expandible." },
    { "etiqueta": "Quien pausa la ejecución desde el código", "rol": "debugger;", "descripcion": "Pausa exactamente igual que un breakpoint — pero solo con las herramientas abiertas." },
    { "etiqueta": "Quien pausa sin tocar el código", "rol": "Un breakpoint en el panel Sources/Debugger", "descripcion": "El mismo efecto, clicando directamente en el número de línea." }
  ]
}
```

## console.log() frente a console.error()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const respuesta = 'algo salió mal';\n\n  console.log(`Valor de la respuesta: ${respuesta}`);   // mensaje normal\n  console.error(`Valor de la respuesta: ${respuesta}`);  // con formato de error + traza\n</script>",
  "anotaciones": [
    { "fragmento": "console.error(`Valor de la respuesta: ${respuesta}`);  // con formato de error + traza", "nota": "console.error() hace lo mismo que console.log(), pero además destaca visualmente el mensaje como un ERROR, y añade una traza de llamadas (call stack) expandible — útil incluso para marcar situaciones problemáticas que no son errores técnicos del motor." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Qué trae un error en la consola",
  "contenido": "Como mínimo, cuatro datos: el TIPO (TypeError, ReferenceError...), una DESCRIPCIÓN de qué salió mal, el NÚMERO DE LÍNEA donde ocurrió, y una traza de llamadas — qué función llamó a qué función, hasta llegar ahí."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La traza de llamadas se lee de arriba hacia abajo",
  "contenido": "La primera línea es la función donde ocurrió el error; la siguiente, quién la llamó; y así sucesivamente hasta el punto de entrada del programa."
}
```

## debugger;: un breakpoint escrito en el código

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function funcionSospechosa(valor) {\n    debugger; // la ejecución se pausa aquí, con las herramientas abiertas\n    return valor * 2;\n  }\n\n  funcionSospechosa(21);\n</script>",
  "anotaciones": [
    { "fragmento": "debugger; // la ejecución se pausa aquí, con las herramientas abiertas", "nota": "Con las herramientas de desarrollo ABIERTAS, debugger; pausa la ejecución exactamente igual que un breakpoint puesto a mano — permite inspeccionar variables, el ámbito actual, y avanzar paso a paso desde ese punto exacto." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin herramientas abiertas, no hace nada",
  "contenido": "Con las herramientas de desarrollo CERRADAS, debugger; no hace absolutamente nada — el código sigue su curso normal, sin ninguna pausa. Por eso se puede dejar en el código sin miedo a que afecte a quien no esté depurando activamente."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El mismo efecto, sin tocar el código",
  "contenido": "Clicar directamente en un número de línea del panel Sources (Chrome) o Debugger (Firefox) añade un breakpoint SIN tocar el código fuente — la misma pausa que debugger;, pero sin dejar ningún rastro en los archivos."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El panel Scopes: ver de verdad, no adivinar",
  "contenido": "Con la ejecución pausada, el panel Scopes muestra el valor de cada variable en el ámbito ACTIVO en ese momento — local, de bloque, y global. La forma más directa de ver qué vale realmente algo, en vez de adivinarlo a base de más console.log()."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function calcular(valor) {\n    debugger;\n    return valor * 2;\n  }\n\n  console.log(calcular(10));\n  // Con las herramientas de desarrollo CERRADAS, ¿qué imprime?\n</script>",
  "opciones": [
    "20 — sin las herramientas de desarrollo abiertas, debugger; no tiene ningún efecto, y la función se ejecuta con normalidad",
    "Nada, la ejecución queda pausada para siempre esperando a que se abran las herramientas",
    "Un error, porque debugger; requiere las herramientas de desarrollo abiertas para poder ejecutarse"
  ],
  "correcta": 0,
  "explicacion": "debugger; solo pausa la ejecución cuando las herramientas de desarrollo están ABIERTAS — cerradas, la sentencia se ignora silenciosamente y el código continúa con normalidad. calcular(10) devuelve 20, sin ninguna pausa ni error."
}
```

## Lo que estas herramientas NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "console.log() y console.error() hacen exactamente lo mismo, solo con un color distinto",
      "realidad": "console.error() también añade una traza de llamadas expandible, útil para rastrear el origen del problema."
    },
    {
      "mito": "debugger; pausa la ejecución siempre, tengan las herramientas abiertas o no",
      "realidad": "Sin las herramientas abiertas, no tiene ningún efecto — el código sigue normal."
    },
    {
      "mito": "La traza de llamadas se lee de abajo hacia arriba, como una pila normal",
      "realidad": "Se lee de ARRIBA hacia abajo: primero dónde ocurrió el error, después quién lo llamó."
    },
    {
      "mito": "Un breakpoint puesto a mano en el panel Sources/Debugger modifica el código fuente",
      "realidad": "No deja ningún rastro en los archivos — solo pausa la ejecución en ese punto mientras las herramientas estén abiertas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar console.log() para reportar errores, perdiendo la traza de llamadas.", "texto": "console.error() la ofrece de forma expandible, sin esfuerzo adicional." },
    { "titulo": "Dejar sentencias debugger; olvidadas en el código.", "texto": "Inofensivas mientras las herramientas estén cerradas, pero conviene retirarlas antes de producción." },
    { "titulo": "Leer la traza de llamadas de abajo hacia arriba.", "texto": "El orden correcto empieza por la línea exacta del error." },
    { "titulo": "No usar el panel Scopes para verificar el valor real de una variable.", "texto": "Evita depender solo de suposiciones o de imprimir cosas a mano." }
  ]
}
```

## Ejercicios

1. Usa `console.log()` y `console.error()` sobre el mismo mensaje, y compara cómo se muestran en la consola.
2. Provoca un error deliberado, y lee su tipo, descripción, línea y traza de llamadas en la consola.
3. Añade una sentencia `debugger;` a una función, y comprueba que solo pausa la ejecución con las herramientas abiertas.
4. Pon un breakpoint clicando un número de línea en el panel Sources/Debugger, e inspecciona las variables en el panel Scopes.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "JavaScript debugging and error handling",
      "descripcion": "Guía de MDN sobre cómo leer errores en la consola (tipo, descripción, línea, traza de llamadas), console.log()/console.error(), y el panel Debugger/Sources con breakpoints y el panel Scopes.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript",
      "etiqueta": "MDN"
    },
    {
      "titulo": "debugger",
      "descripcion": "Referencia de MDN sobre la sentencia debugger;: pausa la ejecución igual que un breakpoint, pero solo con las herramientas de desarrollo abiertas.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger",
      "etiqueta": "MDN"
    }
  ]
}
```
