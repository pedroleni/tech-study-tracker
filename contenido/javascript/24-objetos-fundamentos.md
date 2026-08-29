# Objetos: fundamentos

- **Módulo:** Objetos
- **Slug:** `objetos-fundamentos` (autogenerado del título)
- **Orden:** 71
- **Fuentes:** [Object basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics) + [Introduction to objects (web.dev)](https://web.dev/learn/javascript/objects) — ver `contenido/javascript/TEMARIO.md` #24

---

## Qué es y para qué sirve

Un objeto agrupa datos (propiedades) y comportamiento (métodos) relacionados bajo un mismo nombre. Abre el módulo de objetos — la base de casi todo lo que viene después: prototipos, clases, colecciones.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién agrupa datos y comportamiento juntos",
  "roles": [
    { "etiqueta": "Quien agrupa datos y comportamiento", "rol": "Propiedades y métodos en una unidad", "descripcion": "En vez de variables sueltas por todas partes, todo lo relacionado con \"una persona\" vive en un mismo objeto." },
    { "etiqueta": "Quien accede con punto o corchetes", "rol": "Según si el nombre es fijo o variable", "descripcion": "El punto busca literalmente el nombre escrito; los corchetes evalúan lo que haya dentro como expresión." },
    { "etiqueta": "Quien modifica un objeto tras crearlo", "rol": "Añadir, cambiar o borrar propiedades", "descripcion": "A diferencia de un primitivo, un objeto es mutable — se puede cambiar después de creado." }
  ]
}
```

## Sintaxis de objeto literal

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: ['Ada', 'Lovelace'],\n    edad: 32,\n    presentarse() {\n      console.log(`Hola, soy ${this.nombre[0]}.`);\n    },\n  };\n\n  persona.presentarse(); // 'Hola, soy Ada.'\n</script>",
  "anotaciones": [
    { "fragmento": "presentarse() {\n      console.log(`Hola, soy ${this.nombre[0]}.`);\n    },", "nota": "Un MÉTODO es una función que vive dentro de un objeto — se declara sin la palabra function, con paréntesis directamente después de su nombre." }
  ]
}
```

## Notación de punto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32 };\n\n  console.log(persona.edad);   // 32\n  persona.presentarse();       // llama al método\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(persona.edad);   // 32", "nota": "El nombre del objeto actúa como un \"espacio de nombres\" — hay que escribirlo primero para acceder a lo que hay dentro." }
  ]
}
```

## Notación de corchetes: cuándo hace falta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32 };\n\n  function leerPropiedad(nombrePropiedad) {\n    console.log(persona[nombrePropiedad]);\n  }\n\n  leerPropiedad('nombre'); // 'Ada'\n  leerPropiedad('edad');   // 32\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(persona[nombrePropiedad]);", "nota": "Los corchetes EVALÚAN lo que hay dentro como una expresión — aquí, el valor de la variable nombrePropiedad. Con notación de punto (persona.nombrePropiedad) buscaría literalmente una propiedad llamada nombrePropiedad, que no existe." }
  ]
}
```

## Objetos anidados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: {\n      nombreDePila: 'Ada',\n      apellido: 'Lovelace',\n    },\n  };\n\n  console.log(persona.nombre.nombreDePila); // 'Ada'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(persona.nombre.nombreDePila); // 'Ada'", "nota": "Los puntos se encadenan para acceder a niveles cada vez más profundos — igual que con arrays anidados." }
  ]
}
```

## Añadir y modificar propiedades después de crear el objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32 };\n\n  persona.edad = 33;             // actualizar una existente\n  persona.ojos = 'marrones';     // crear una nueva\n  persona.despedirse = function () {\n    console.log('¡Adiós!');\n  };\n\n  console.log(persona);\n</script>",
  "anotaciones": [
    { "fragmento": "persona.ojos = 'marrones';     // crear una nueva", "nota": "Un objeto es MUTABLE — se le pueden añadir propiedades nuevas, o modificar las que ya tenía, en cualquier momento después de crearlo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un objeto literal suelto necesita paréntesis",
  "contenido": "En un contexto donde un { podría confundirse con el inicio de un bloque de código, un objeto literal necesita ir envuelto entre paréntesis: ({ valor: 2 }) es válido, pero { valor: 2 } como sentencia suelta lanza un SyntaxError — el motor lo interpreta como el principio de un bloque, no como un objeto."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const persona = { nombre: 'Ada', edad: 32 };\n  const clave = 'edad';\n  console.log(persona[clave]);\n  console.log(persona.clave);\n</script>",
  "opciones": [
    "32 y luego undefined — los corchetes evalúan clave como variable; el punto busca literalmente una propiedad llamada 'clave'",
    "32 las dos veces — punto y corchetes acceden igual a cualquier propiedad",
    "undefined y luego 32 — los corchetes no se pueden usar con una variable"
  ],
  "correcta": 0,
  "explicacion": "persona[clave] evalúa clave (vale 'edad') y accede a persona.edad: 32. persona.clave busca literalmente una propiedad llamada 'clave' en el objeto — no existe, así que da undefined."
}
```

## Lo que los objetos NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La notación de punto y de corchetes son intercambiables en cualquier caso",
      "realidad": "Los corchetes evalúan lo de dentro como una EXPRESIÓN (incluida una variable); el punto busca literalmente el nombre escrito tal cual."
    },
    {
      "mito": "Un objeto, una vez creado, no admite propiedades nuevas",
      "realidad": "Se pueden añadir, actualizar o borrar propiedades en cualquier momento después de crearlo — los objetos son mutables."
    },
    {
      "mito": "Un objeto literal se puede escribir como sentencia suelta en cualquier contexto",
      "realidad": "En un contexto donde podría confundirse con un bloque de código, hace falta envolverlo entre paréntesis."
    },
    {
      "mito": "Las claves de un objeto literal pueden ser cualquier tipo de valor, incluidos template literals",
      "realidad": "Deben ser strings (con comillas simples o dobles) o identificadores válidos — un template literal directamente como clave produce un SyntaxError."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir notación de punto (nombre literal) con la de corchetes (evalúa una expresión).", "texto": "persona.variable y persona[variable] casi nunca hacen lo mismo." },
    { "titulo": "Esperar que un objeto sea inmutable, como un primitivo.", "texto": "Se puede modificar libremente después de creado." },
    { "titulo": "Escribir un objeto literal como sentencia suelta sin los paréntesis necesarios.", "texto": "El motor lo confunde con el inicio de un bloque de código." },
    { "titulo": "No usar this dentro de un método para acceder a otras propiedades del mismo objeto.", "texto": "Sin this, el método no tiene forma de referirse al objeto que lo contiene." }
  ]
}
```

## Ejercicios

1. Crea un objeto con al menos dos propiedades y un método que use `this`.
2. Accede a una propiedad con notación de punto, y a otra con notación de corchetes usando una variable.
3. Añade una propiedad nueva a un objeto ya creado, después de su declaración inicial.
4. Explica por qué `persona[variable]` puede devolver algo distinto que `persona.variable`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea un objeto con al menos dos propiedades y un método que use this (ejercicio 1). Accede a una con notación de punto y a otra con corchetes usando una variable (ejercicio 2). Añade una propiedad nueva después de la declaración (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst libro = {\n  titulo: 'Cien años de soledad',\n  autor: 'García Márquez',\n  resumen() {\n    return this.titulo + ' de ' + this.autor;\n  },\n};\nmostrar(libro.resumen());\n\nconst clave = 'autor';\nmostrar(libro.titulo);\nmostrar(libro[clave]);\n\nlibro.año = 1967;\nmostrar(libro);",
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
      "titulo": "Object basics",
      "descripcion": "Guía de MDN sobre sintaxis de objeto literal, notación de punto y corchetes, objetos anidados, y this dentro de un método.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Introduction to objects",
      "descripcion": "Capítulo de web.dev sobre la mutabilidad de los objetos y el gotcha de los objetos literales sueltos necesitando paréntesis.",
      "url": "https://web.dev/learn/javascript/objects",
      "etiqueta": "web.dev"
    }
  ]
}
```
