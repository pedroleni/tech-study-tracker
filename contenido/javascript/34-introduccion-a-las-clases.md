# Introducción a las clases

- **Módulo:** Clases y programación orientada a objetos
- **Slug:** `introduccion-a-las-clases` (autogenerado del título)
- **Orden:** 101
- **Fuentes:** [Introduction to classes (web.dev)](https://web.dev/learn/javascript/classes) + [Using classes (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes) — ver `contenido/javascript/TEMARIO.md` #34

---

## Qué es y para qué sirve

Abre el módulo de clases. `class` no es un mecanismo nuevo — es una sintaxis más clara sobre exactamente el mismo mecanismo de `new` y prototipos ya visto en el módulo de objetos, con algunas mejoras propias: un error explícito si se olvida `new`, modo estricto automático, y campos privados de verdad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita una sintaxis más clara para new y prototipos",
  "roles": [
    { "etiqueta": "Quien inicializa una instancia", "rol": "constructor()", "descripcion": "Se ejecuta automáticamente al crear la instancia con new — recibe los argumentos y suele inicializar this." },
    { "etiqueta": "Quien comparte métodos entre instancias", "rol": "Métodos en el prototipo, automáticamente", "descripcion": "Cada método del cuerpo de la clase se coloca en Clase.prototype, sin necesitar escribirlo a mano." },
    { "etiqueta": "Quien necesita privacidad real", "rol": "Campos privados con #", "descripcion": "A diferencia de una convención de nombres, un campo #privado es inaccesible de verdad desde fuera de la clase." }
  ]
}
```

## Sintaxis básica: constructor y métodos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Color {\n    constructor(r, g, b) {\n      this.valores = [r, g, b];\n    }\n    obtenerRojo() {\n      return this.valores[0];\n    }\n  }\n\n  const rojo = new Color(255, 0, 0);\n  console.log(rojo.obtenerRojo()); // 255\n</script>",
  "anotaciones": [
    { "fragmento": "constructor(r, g, b) {\n      this.valores = [r, g, b];\n    }", "nota": "constructor() se ejecuta automáticamente al crear la instancia con new — recibe los argumentos pasados (255, 0, 0) y aquí los usa para inicializar this.valores." },
    { "fragmento": "obtenerRojo() {\n      return this.valores[0];\n    }", "nota": "Un método se escribe SIN la palabra function y sin comas entre métodos — se puede llamar directamente sobre cualquier instancia, como rojo.obtenerRojo()." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "class es azúcar sintáctico sobre prototipos",
  "contenido": "typeof Color da 'function', no 'class' — por dentro, sigue siendo el mismo mecanismo de new y prototipos visto en el módulo de objetos. Cada método del cuerpo de la clase se coloca automáticamente en Color.prototype, compartido por todas las instancias, exactamente igual que Coche.prototype.arrancar en la lección de prototipos."
}
```

## new es obligatorio, con un error explícito

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Color {\n    constructor(r, g, b) {\n      this.valores = [r, g, b];\n    }\n  }\n\n  const rojo = new Color(255, 0, 0); // correcto\n  // const otro = Color(255, 0, 0); // TypeError: Class constructor Color cannot be invoked without 'new'\n</script>",
  "anotaciones": [
    { "fragmento": "// const otro = Color(255, 0, 0); // TypeError: Class constructor Color cannot be invoked without 'new'", "nota": "A diferencia de una función constructora tradicional (donde olvidar new simplemente hace que this apunte a otro sitio, visto en la lección de new), una clase lanza un ERROR explícito al intentar llamarla sin new — un fallo mucho más fácil de detectar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El cuerpo de una clase siempre está en modo estricto",
  "contenido": "Todo el código dentro del cuerpo de una clase se evalúa SIEMPRE en modo estricto, sin necesitar 'use strict' al principio — asignar a una variable no declarada, o usar this de forma insegura, se comporta como lo haría en modo estricto en cualquier otro lugar del código."
}
```

## Campos públicos: fuera del constructor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Contador {\n    valorInicial = Math.random(); // campo público, fuera del constructor\n  }\n\n  const a = new Contador();\n  const b = new Contador();\n\n  console.log(a.valorInicial); // un número aleatorio\n  console.log(b.valorInicial); // OTRO número aleatorio\n</script>",
  "anotaciones": [
    { "fragmento": "class Contador {\n    valorInicial = Math.random(); // campo público, fuera del constructor\n  }", "nota": "Un campo público se declara directamente en el cuerpo de la clase, FUERA del constructor — equivale a asignarlo dentro con this.valorInicial = Math.random(), pero sin necesitar escribir el constructor entero solo para eso." },
    { "fragmento": "console.log(b.valorInicial); // OTRO número aleatorio", "nota": "Cada instancia evalúa el campo de forma INDEPENDIENTE al crearse — a y b no comparten el mismo valorInicial, cada Math.random() se ejecuta por su cuenta." }
  ]
}
```

## Campos privados: privacidad real, no una convención

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Color {\n    #valores; // debe declararse en el cuerpo de la clase\n\n    constructor(r, g, b) {\n      this.#valores = [r, g, b];\n    }\n    obtenerRojo() {\n      return this.#valores[0];\n    }\n  }\n\n  const rojo = new Color(255, 0, 0);\n  console.log(rojo.obtenerRojo()); // 255\n  // console.log(rojo.#valores); // SyntaxError — inaccesible desde fuera de la clase\n</script>",
  "anotaciones": [
    { "fragmento": "#valores; // debe declararse en el cuerpo de la clase", "nota": "El prefijo # marca un campo como PRIVADO — debe declararse explícitamente en el cuerpo de la clase antes de usarse, incluso si luego se asigna dentro del constructor." },
    { "fragmento": "// console.log(rojo.#valores); // SyntaxError — inaccesible desde fuera de la clase", "nota": "A diferencia de anteponer un guion bajo (_valores) por convención, #valores es inaccesible DE VERDAD desde fuera — ni siquiera es un error en tiempo de ejecución, es un SyntaxError al escribirlo." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class Mascota {\n    nombre = 'Sin nombre';\n    constructor(nombre) {\n      if (nombre) this.nombre = nombre;\n    }\n  }\n\n  const a = new Mascota();\n  const b = new Mascota('Rex');\n\n  console.log(a.nombre);\n  console.log(b.nombre);\n</script>",
  "opciones": [
    "'Sin nombre' y 'Rex' — el campo público se asigna primero, y el constructor puede sobrescribirlo después según el argumento recibido",
    "'Sin nombre' las dos veces — los campos públicos ignoran cualquier cosa que haga el constructor después",
    "undefined y 'Rex' — un campo público solo tiene efecto si el constructor no define ningún parámetro"
  ],
  "correcta": 0,
  "explicacion": "El campo público nombre = 'Sin nombre' se asigna PRIMERO, antes de que el cuerpo del constructor se ejecute. Si el constructor decide sobrescribirlo (como aquí, cuando nombre tiene un valor), la asignación del constructor gana. a.nombre queda 'Sin nombre' (no se pasó ningún argumento); b.nombre queda 'Rex' (se sobrescribió con el argumento recibido)."
}
```

## Lo que class NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "class introduce un mecanismo de herencia completamente nuevo, distinto de los prototipos",
      "realidad": "Es azúcar sintáctico sobre el mismo mecanismo de new y prototipos ya visto — typeof Clase sigue dando 'function'."
    },
    {
      "mito": "Llamar a una clase sin new simplemente hace que this apunte a otro sitio, como con una función constructora",
      "realidad": "Lanza un TypeError explícito, deteniendo la ejecución — un fallo mucho más fácil de detectar."
    },
    {
      "mito": "Un campo privado (#campo) es solo una convención de nombres, como anteponer un guion bajo",
      "realidad": "Es inaccesible de verdad desde fuera de la clase — intentarlo es directamente un SyntaxError."
    },
    {
      "mito": "El cuerpo de una clase necesita 'use strict' al principio para comportarse en modo estricto",
      "realidad": "Se evalúa siempre en modo estricto automáticamente, sin necesitar declararlo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir class con un mecanismo de herencia nuevo, en vez de una capa de sintaxis sobre prototipos.", "texto": "Por dentro sigue siendo new y Clase.prototype, como en las lecciones anteriores." },
    { "titulo": "Olvidar que una clase exige new.", "texto": "A diferencia de una función constructora tradicional, lanza un error explícito si se olvida." },
    { "titulo": "Usar un guion bajo (_campo) esperando privacidad real.", "texto": "Solo # garantiza que sea inaccesible de verdad desde fuera de la clase." },
    { "titulo": "No aprovechar los campos públicos para inicializar propiedades sin escribir un constructor completo.", "texto": "Especialmente útil cuando el valor no depende de ningún argumento." }
  ]
}
```

## Ejercicios

1. Escribe una clase con un `constructor` y al menos un método, y crea dos instancias distintas con valores diferentes.
2. Intenta llamar a la clase sin `new`, y observa el error exacto que lanza.
3. Añade un campo público a una clase (fuera del constructor), y demuestra que cada instancia lo calcula de forma independiente.
4. Añade un campo privado (`#campo`) a una clase, y demuestra que es inaccesible desde fuera.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una clase con constructor y al menos un método, y crea dos instancias (ejercicio 1). Intenta llamarla sin new y observa el error (ejercicio 2). Añade un campo privado con #campo (ejercicio 4).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nclass Persona {\n  #edad;\n  constructor(nombre, edad) {\n    this.nombre = nombre;\n    this.#edad = edad;\n  }\n  saludar() {\n    return 'Hola, soy ' + this.nombre;\n  }\n}\nconst ada = new Persona('Ada', 30);\nconst grace = new Persona('Grace', 40);\nmostrar(ada.saludar());\nmostrar(grace.saludar());\n\ntry {\n  Persona('Sin new', 1);\n} catch (error) {\n  mostrar('Error sin new: ' + error.message);\n}",
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
      "titulo": "Introduction to classes",
      "descripcion": "Capítulo de web.dev sobre la sintaxis de class, el constructor, y que las clases son azúcar sintáctico sobre prototipos.",
      "url": "https://web.dev/learn/javascript/classes",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Using classes",
      "descripcion": "Guía de MDN con ejemplos de constructor y métodos, la exigencia de new, campos públicos y campos privados con #.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes",
      "etiqueta": "MDN"
    }
  ]
}
```
