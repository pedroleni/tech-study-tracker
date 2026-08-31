# Funciones: declaración, expresión y ámbito

- **Módulo:** Funciones
- **Slug:** `funciones-declaracion-expresion-y-ambito` (autogenerado del título)
- **Orden:** 47
- **Fuentes:** [Functions — reusable blocks of code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions) + [Introduction to functions (web.dev)](https://web.dev/learn/javascript/functions) — ver `contenido/javascript/TEMARIO.md` #16

---

## Qué es y para qué sirve

Una función agrupa código para ejecutarlo tantas veces como haga falta, sin repetirlo. Esta lección sienta las bases — cómo declarar una, llamarla, y qué significa su ámbito — antes de entrar en piezas concretas que tienen su propia lección: valores de retorno, parámetros por defecto, funciones flecha, hoisting y closures.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita agrupar y aislar código",
  "roles": [
    { "etiqueta": "Quien agrupa código reutilizable", "rol": "Escribir una vez, ejecutar muchas", "descripcion": "Una función evita repetir el mismo bloque de código cada vez que hace falta." },
    { "etiqueta": "Quien distingue parámetro de argumento", "rol": "Definición frente a llamada real", "descripcion": "Los parámetros viven en la definición; los argumentos son los valores reales al llamar." },
    { "etiqueta": "Quien encierra variables en su ámbito", "rol": "Lo declarado dentro, se queda dentro", "descripcion": "Una variable local a una función no existe fuera de ella." }
  ]
}
```

## Declarar y llamar una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function saludar() {\n    console.log('¡Hola!');\n  }\n\n  saludar(); // la LLAMADA — ejecuta el código de dentro\n  saludar(); // se puede llamar tantas veces como haga falta\n</script>",
  "anotaciones": [
    { "fragmento": "function saludar() {\n    console.log('¡Hola!');\n  }", "nota": "Esto es la DECLARACIÓN — define la función, pero no la ejecuta todavía." },
    { "fragmento": "saludar(); // la LLAMADA — ejecuta el código de dentro", "nota": "Los paréntesis después del nombre INVOCAN la función — sin ellos, saludar por sí solo se refiere a la función como valor, sin ejecutarla." }
  ]
}
```

## Funciones de primera clase

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Se pueden tratar como cualquier otro valor",
  "contenido": "En JavaScript, las funciones son \"de primera clase\": se pueden asignar a una variable, pasar como argumento a otra función, o devolver desde otra función — exactamente igual que un número o un string. Esta idea es la base de callbacks, funciones de orden superior, y closures, temas que tienen sus propias lecciones más adelante."
}
```

## Parámetros frente a argumentos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function saludarA(nombre) { // nombre es el PARÁMETRO\n    console.log(`Hola, ${nombre}`);\n  }\n\n  saludarA('Ada'); // 'Ada' es el ARGUMENTO real\n</script>",
  "anotaciones": [
    { "fragmento": "function saludarA(nombre) { // nombre es el PARÁMETRO", "nota": "El parámetro es el nombre que aparece en la DEFINICIÓN de la función — un espacio reservado para lo que sea que llegue al llamarla." },
    { "fragmento": "saludarA('Ada'); // 'Ada' es el ARGUMENTO real", "nota": "El argumento es el valor REAL que se pasa al llamar la función. El detalle completo de parámetros — valores por defecto, rest — tiene su propia lección más adelante." }
  ]
}
```

## Function expression: una función como valor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const saludar = function () {\n    console.log('¡Hola desde una expresión!');\n  };\n\n  saludar();\n</script>",
  "anotaciones": [
    { "fragmento": "const saludar = function () {\n    console.log('¡Hola desde una expresión!');\n  };", "nota": "En vez de declarar la función con un nombre directo, se asigna una función anónima a una variable — la función existe como el VALOR de saludar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Declaración frente a expresión: solo una se hoistea",
  "contenido": "Una declaración (function nombre() {}) se puede llamar ANTES de aparecer en el código, gracias al hoisting. Una expresión (const f = function() {}) no — la variable existe, pero no tiene ninguna función asignada todavía hasta llegar a esa línea. El detalle completo de hoisting tiene su propia lección más adelante."
}
```

## Ámbito global

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const x = 1; // ámbito global\n\n  function miFuncion() {\n    console.log(x); // accesible desde dentro\n  }\n\n  miFuncion(); // 1\n</script>",
  "anotaciones": [
    { "fragmento": "const x = 1; // ámbito global", "nota": "Una variable declarada fuera de cualquier función es accesible desde CUALQUIER parte del código, incluido el interior de las funciones." }
  ]
}
```

## Ámbito de función: lo de dentro se queda dentro

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function a() {\n    const y = 2;\n    console.log(y); // funciona, dentro de la función\n  }\n\n  a();\n  console.log(y); // ReferenceError: y no está definida aquí fuera\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(y); // ReferenceError: y no está definida aquí fuera", "nota": "y es local a la función a — existe solo mientras esa función se está ejecutando, y es completamente invisible desde fuera de ella." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function miFuncion() {\n    const local = 'solo aquí dentro';\n    console.log(local);\n  }\n  miFuncion();\n  console.log(local);\n</script>",
  "opciones": [
    "'solo aquí dentro' y luego un ReferenceError — local es una variable de ámbito de función, invisible fuera de ella",
    "'solo aquí dentro' las dos veces — cualquier variable declarada en una función es accesible después de llamarla",
    "Un error en la primera línea, porque local no se declaró antes de la función"
  ],
  "correcta": 0,
  "explicacion": "local se declara DENTRO de miFuncion, así que solo existe mientras esa función se ejecuta. Al intentar acceder a local fuera de la función, JavaScript lanza un ReferenceError — esa variable, sencillamente, no existe ahí fuera."
}
```

## Lo que las funciones NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las funciones en JavaScript solo sirven para agrupar código, nada más",
      "realidad": "Son ciudadanas de primera clase — se pueden asignar a variables, pasar como argumentos, y devolver desde otra función, como cualquier otro valor."
    },
    {
      "mito": "Las funciones declaradas y las funciones expresadas se comportan exactamente igual",
      "realidad": "Las declaraciones se hoistean, permitiendo llamarlas antes de su definición en el código; las expresiones no."
    },
    {
      "mito": "Una variable declarada dentro de una función es accesible desde fuera de ella",
      "realidad": "El ámbito de función la mantiene encerrada dentro — intentar acceder desde fuera lanza un ReferenceError."
    },
    {
      "mito": "Parámetros y argumentos son dos palabras para la misma cosa",
      "realidad": "Los parámetros son los nombres que aparecen en la DEFINICIÓN de la función; los argumentos son los valores reales que se pasan al LLAMARLA."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir parámetros (en la definición) con argumentos (al llamar).", "texto": "Una distinción pequeña pero que ayuda a hablar con precisión sobre el código." },
    { "titulo": "Esperar que una función expresada se pueda llamar antes de su definición.", "texto": "Solo las declaraciones se hoistean — las expresiones no." },
    { "titulo": "Intentar acceder desde fuera a una variable declarada dentro de una función.", "texto": "El ámbito de función la mantiene completamente encerrada." },
    { "titulo": "No aprovechar que una función se puede pasar como valor a otra función o variable.", "texto": "La base de callbacks y funciones de orden superior, cubiertos más adelante." }
  ]
}
```

## Ejercicios

1. Declara una función con `function` que reciba un parámetro y lo imprima.
2. Escribe la misma función como una function expression, asignada a una variable.
3. Explica por qué llamar a una función expresada ANTES de su definición lanza un error, a diferencia de una declaración.
4. Escribe un ejemplo donde una variable local a una función no sea accesible desde fuera de ella.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Declara una función con function que reciba un parámetro y lo imprima (ejercicio 1). Escríbela también como function expression (ejercicio 2). Demuestra que una variable local no es accesible desde fuera (ejercicio 4).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nfunction saludar(nombre) {\n  mostrar('Hola, ' + nombre);\n}\nsaludar('Ada');\n\nconst saludarExpresion = function (nombre) {\n  mostrar('Hola de nuevo, ' + nombre);\n};\nsaludarExpresion('Grace');",
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
      "titulo": "Functions — reusable blocks of code",
      "descripcion": "Guía de MDN sobre declarar y llamar funciones, parámetros y argumentos, funciones anónimas, y ámbito global/función/bloque.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Introduction to functions",
      "descripcion": "Capítulo de web.dev sobre funciones como ciudadanas de primera clase, y la diferencia de hoisting entre declaraciones y expresiones.",
      "url": "https://web.dev/learn/javascript/functions",
      "etiqueta": "web.dev"
    }
  ]
}
```
