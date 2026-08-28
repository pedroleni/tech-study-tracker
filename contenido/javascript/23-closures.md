# Closures (clausuras)

- **Módulo:** Funciones
- **Slug:** `closures-clausuras` (autogenerado del título)
- **Orden:** 68
- **Fuentes:** [Closures (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — ver `contenido/javascript/TEMARIO.md` #23

---

## Qué es y para qué sirve

Una closure es una función empaquetada junto con las variables de su entorno — su ámbito léxico. Cierra el módulo de funciones: cada función creada en JavaScript ES una closure, aunque la mayoría de las veces no se note. La diferencia se nota cuando una función interna sobrevive después de que su función contenedora terminó de ejecutarse, y sigue teniendo acceso a esas variables.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que una función recuerde su entorno",
  "roles": [
    { "etiqueta": "Quien encierra estado privado", "rol": "Datos accesibles solo desde dentro", "descripcion": "Una variable capturada por una closure es invisible desde fuera, salvo a través de las funciones que la exponen a propósito." },
    { "etiqueta": "Quien evita el gotcha clásico de var", "rol": "let en vez de var, dentro de un bucle", "descripcion": "El error más famoso relacionado con closures: todas las funciones de un bucle compartiendo la misma variable." },
    { "etiqueta": "Quien reutiliza métodos con prototype", "rol": "Evitar closures innecesarias", "descripcion": "Crear una función nueva por cada instancia tiene un coste real de memoria — el prototipo (visto más adelante) suele ser mejor para métodos compartidos." }
  ]
}
```

## El ejemplo más básico

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function crearFuncion() {\n    const nombre = 'Mozilla';\n    function mostrarNombre() {\n      console.log(nombre);\n    }\n    return mostrarNombre;\n  }\n\n  const miFuncion = crearFuncion();\n  miFuncion(); // 'Mozilla'\n</script>",
  "anotaciones": [
    { "fragmento": "return mostrarNombre;", "nota": "crearFuncion() ya terminó de ejecutarse cuando se llama miFuncion() más abajo — y sin embargo, mostrarNombre sigue teniendo acceso a nombre. Eso es una closure: la función 'recuerda' su entorno léxico." }
  ]
}
```

## Closures independientes: el contador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function crearContador() {\n    let cuenta = 0;\n    return {\n      incrementar() { cuenta++; },\n      valor() { return cuenta; },\n    };\n  }\n\n  const contadorA = crearContador();\n  const contadorB = crearContador();\n\n  contadorA.incrementar();\n  contadorA.incrementar();\n\n  console.log(contadorA.valor()); // 2\n  console.log(contadorB.valor()); // 0 — completamente independiente\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(contadorB.valor()); // 0 — completamente independiente", "nota": "Cada llamada a crearContador() genera su PROPIA closure, con su propia variable cuenta — contadorA y contadorB no comparten nada entre sí, aunque vengan de la misma función." }
  ]
}
```

## Parametrizar comportamiento: una fábrica de funciones

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function crearSumador(x) {\n    return function (y) {\n      return x + y;\n    };\n  }\n\n  const sumar5 = crearSumador(5);\n  const sumar10 = crearSumador(10);\n\n  console.log(sumar5(2));  // 7\n  console.log(sumar10(2)); // 12\n</script>",
  "anotaciones": [
    { "fragmento": "const sumar5 = crearSumador(5);\n  const sumar10 = crearSumador(10);", "nota": "sumar5 y sumar10 comparten el mismo cuerpo de función, pero cada una guarda un x distinto en su propia closure — el mismo patrón que el contador, aplicado para crear variantes de una función." }
  ]
}
```

## Emular datos privados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const contador = (function () {\n    let cuentaPrivada = 0;\n    return {\n      incrementar() { cuentaPrivada++; },\n      valor() { return cuentaPrivada; },\n    };\n  })();\n\n  contador.incrementar();\n  console.log(contador.valor()); // 1\n  // No hay ninguna forma de acceder a cuentaPrivada directamente desde fuera\n</script>",
  "anotaciones": [
    { "fragmento": "// No hay ninguna forma de acceder a cuentaPrivada directamente desde fuera", "nota": "cuentaPrivada solo es accesible A TRAVÉS de los métodos expuestos — un patrón real de encapsulación, sin necesitar ninguna sintaxis especial de \"privado\"." }
  ]
}
```

## El gotcha clásico: closures dentro de un bucle con var

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const textos = ['a', 'b', 'c'];\n\n  for (var i = 0; i < textos.length; i++) {\n    setTimeout(() => console.log(textos[i]), 0);\n  }\n  // Imprime: undefined, undefined, undefined\n</script>",
  "anotaciones": [
    { "fragmento": "// Imprime: undefined, undefined, undefined", "nota": "Las tres funciones dentro de setTimeout comparten la MISMA variable i (var es de ámbito de función, no de bloque). Para cuando finalmente se ejecutan, el bucle ya terminó — i vale 3, y textos[3] no existe." }
  ]
}
```

## La solución moderna: let

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const textos = ['a', 'b', 'c'];\n\n  for (let i = 0; i < textos.length; i++) {\n    setTimeout(() => console.log(textos[i]), 0);\n  }\n  // Imprime: 'a', 'b', 'c'\n</script>",
  "anotaciones": [
    { "fragmento": "for (let i = 0; i < textos.length; i++) {", "nota": "let crea una i NUEVA en cada iteración del bucle, con su propio ámbito de bloque — cada closure captura su propia copia independiente, resolviendo el problema por completo, sin ningún truco adicional." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Acceso a TODA la cadena de ámbitos externos",
  "contenido": "Una closure no se limita al ámbito de su función padre inmediata — tiene acceso a toda la cadena: la función que la contiene, la que contiene a esa, y así hasta llegar al ámbito global. Funciones anidadas varios niveles de profundidad siguen viendo las variables de todos esos niveles."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un coste real: no crear closures de más",
  "contenido": "Cada closure mantiene viva una referencia a su entorno externo — no es gratis. Crear un método nuevo por cada instancia de un objeto tiene un coste real de memoria; usar prototype (visto en su propio módulo más adelante) para métodos compartidos entre instancias suele ser la opción más eficiente."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const textos = ['a', 'b', 'c'];\n  for (var i = 0; i < textos.length; i++) {\n    setTimeout(() => console.log(textos[i]), 0);\n  }\n</script>",
  "opciones": [
    "undefined tres veces — con var, todas las funciones comparten el mismo i, que vale 3 cuando finalmente se ejecutan",
    "'a', 'b', 'c' — cada iteración captura automáticamente su propio valor de i",
    "Un error, porque textos[i] no se puede usar dentro de un setTimeout"
  ],
  "correcta": 0,
  "explicacion": "var es de ámbito de función, no de bloque — las tres funciones dentro de setTimeout comparten la MISMA variable i. Cuando finalmente se ejecutan (después de que el bucle termine), i vale 3, y textos[3] es undefined."
}
```

## Lo que las closures NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una closure copia el valor de una variable externa en el momento en que se crea",
      "realidad": "No copia el VALOR — mantiene una referencia VIVA a la variable en sí. Si esa variable cambia después, la closure ve el cambio."
    },
    {
      "mito": "Todas las funciones creadas dentro de un mismo bucle comparten forzosamente el problema de var",
      "realidad": "Con let (o const), cada iteración crea su propio ámbito de bloque — cada closure captura una copia independiente, resolviendo el problema por completo."
    },
    {
      "mito": "Una closure solo tiene acceso al ámbito de su función padre inmediata",
      "realidad": "Tiene acceso a TODA la cadena de ámbitos externos — la función padre, la del padre de esa, hasta el ámbito global."
    },
    {
      "mito": "Crear closures no tiene ningún coste real, se pueden usar sin pensarlo",
      "realidad": "Cada closure mantiene viva su referencia al entorno externo, con un coste de memoria real — para métodos compartidos, el prototipo suele ser más eficiente."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar var dentro de un bucle que crea funciones.", "texto": "Todas comparten la misma variable, en vez de capturar cada una su propia iteración." },
    { "titulo": "Pensar que una closure copia el valor en vez de mantener una referencia viva.", "texto": "Si la variable externa cambia después, la closure ve ese cambio real." },
    { "titulo": "No usar el patrón de datos privados cuando hace falta encapsular estado real.", "texto": "Un IIFE o un módulo resuelven esto sin ninguna sintaxis especial de \"privado\"." },
    { "titulo": "Crear closures innecesarias para métodos que podrían compartirse vía prototype.", "texto": "Un coste de memoria real, evitable en casos de muchas instancias." }
  ]
}
```

## Ejercicios

1. Escribe una función que devuelva otra función interna, capturando una variable del ámbito externo.
2. Escribe un contador con closures, y demuestra que dos instancias distintas mantienen su propio estado.
3. Reescribe un bucle con `var` que tenga el problema clásico de closures, usando `let` para arreglarlo.
4. Explica la diferencia entre que una closure "copie" un valor y que mantenga una "referencia viva" a él.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Closures",
      "descripcion": "Guía de referencia de MDN sobre closures: el ejemplo básico, el contador con closures independientes, datos privados, el gotcha de var en bucles, y consideraciones de rendimiento.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      "etiqueta": "MDN"
    }
  ]
}
```
