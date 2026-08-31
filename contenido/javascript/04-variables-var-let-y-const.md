# Variables: var, let y const

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `variables-var-let-y-const` (autogenerado del título)
- **Orden:** 11
- **Fuentes:** [Storing the information you need — Variables (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables) + [Variables (web.dev)](https://web.dev/learn/javascript/data-types/variable) — ver `contenido/javascript/TEMARIO.md` #4

---

## Qué es y para qué sirve

Una variable guarda un valor bajo un nombre, para poder usarlo (y cambiarlo) más adelante en el código. JavaScript da tres formas de declarar una: `var`, `let` y `const` — solo una de ellas (`const`) debería ser la opción por defecto hoy.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién guarda un valor bajo un nombre",
  "roles": [
    { "etiqueta": "Quien declara sin reasignar", "rol": "Usar const como opción por defecto", "descripcion": "Si el valor no va a cambiar, const dice esa intención con claridad y evita reasignaciones accidentales." },
    { "etiqueta": "Quien sí necesita reasignar", "rol": "Usar let cuando hace falta cambiar el valor", "descripcion": "Un contador, un valor que se actualiza en un bucle — ahí let es la herramienta correcta." },
    { "etiqueta": "Quien evita var por sus rarezas", "rol": "Elegir let/const en código nuevo", "descripcion": "var permite cosas que casi nunca se quieren de verdad: redeclarar la misma variable, o usarla antes de declararla." }
  ]
}
```

## Declarar, inicializar, actualizar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let miNombre;        // declarar\n  miNombre = 'Ana';    // inicializar\n\n  let miEdad = 30;     // declarar e inicializar a la vez\n\n  miNombre = 'Beatriz'; // actualizar\n</script>",
  "anotaciones": [
    { "fragmento": "let miNombre;        // declarar", "nota": "Declarar sin inicializar deja la variable con el valor undefined hasta que se le asigne algo." },
    { "fragmento": "let miEdad = 30;     // declarar e inicializar a la vez", "nota": "La forma más habitual: declarar e inicializar en la misma línea." },
    { "fragmento": "miNombre = 'Beatriz'; // actualizar", "nota": "Reasignar un nuevo valor a una variable que ya existía — solo es posible con let, no con const." }
  ]
}
```

## Reglas de nombres: qué es válido y qué se recomienda

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Letras, dígitos, _ y $ — nunca empezar por un dígito",
  "contenido": "Un identificador válido empieza por una letra, un guion bajo (_) o un símbolo de dólar ($) — nunca por un dígito. JavaScript distingue mayúsculas de minúsculas: miEdad y miedad son variables distintas. La convención recomendada es camelCase (miEdad, colorInicial): la primera palabra en minúscula, cada palabra siguiente con su primera letra en mayúscula."
}
```

## const: obligatorio inicializar, prohibido reasignar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const PI = 3.14159;\n  // PI = 3; // Error: Assignment to constant variable\n\n  const ave = { especie: 'Cernícalo' };\n  ave.especie = 'Caracara'; // Permitido\n</script>",
  "anotaciones": [
    { "fragmento": "// PI = 3; // Error: Assignment to constant variable", "nota": "const no admite reasignar la variable a un valor nuevo — el error salta en cuanto se intenta." },
    { "fragmento": "ave.especie = 'Caracara'; // Permitido", "nota": "const impide reasignar la VARIABLE, no modificar el CONTENIDO de un objeto o array que ya contenía. ave sigue apuntando al mismo objeto — solo cambió una propiedad de dentro." }
  ]
}
```

## var: por qué se evita en código nuevo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  var nombre = 'Ana';\n  var nombre = 'Beatriz'; // Permitido — redeclaración sin ningún aviso\n\n  console.log(edad); // undefined, no un error\n  var edad = 30;\n</script>",
  "anotaciones": [
    { "fragmento": "var nombre = 'Beatriz'; // Permitido — redeclaración sin ningún aviso", "nota": "var permite declarar la MISMA variable dos veces sin ningún error — con let, esta segunda línea lanzaría \"Identifier 'nombre' has already been declared\"." },
    { "fragmento": "console.log(edad); // undefined, no un error", "nota": "Por el hoisting de var, usar la variable ANTES de su declaración no lanza un error — da undefined. Confuso, y una fuente real de bugs silenciosos." }
  ]
}
```

## La zona muerta temporal: por qué let/const sí avisan

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Temporal Dead Zone: acceder antes de tiempo lanza un error",
  "contenido": "Con let y const, usar una variable ANTES de su declaración dentro del mismo bloque no da undefined como var — lanza un ReferenceError directo. A ese tramo, desde el inicio del bloque hasta la línea de declaración, se le llama zona muerta temporal (temporal dead zone). Es un comportamiento deliberadamente más estricto que el de var, pensado para detectar antes un error real."
}
```

## Ámbito de bloque: dónde vive cada variable

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  if (true) {\n    let mensaje = 'Solo existe aquí dentro';\n    console.log(mensaje); // funciona\n  }\n\n  console.log(mensaje); // ReferenceError: mensaje no existe aquí fuera\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(mensaje); // ReferenceError: mensaje no existe aquí fuera", "nota": "let y const tienen ámbito de BLOQUE: una variable declarada dentro de { } no existe fuera de ese bloque concreto — a diferencia de var, que ignora los bloques y solo respeta el ámbito de función." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const contador = { valor: 1 };\n  contador.valor = 2;\n  console.log(contador.valor);\n</script>",
  "opciones": [
    "Error: Assignment to constant variable — const no permite ningún cambio",
    "2 — const impide reasignar la variable contador, pero sí permite modificar las propiedades del objeto que contiene",
    "1 — el cambio no llega a aplicarse sobre una constante"
  ],
  "correcta": 1,
  "explicacion": "const bloquea reasignar la variable contador a un valor NUEVO (contador = otraCosa fallaría), pero el objeto al que apunta se puede modificar por dentro con normalidad — contador.valor = 2 cambia una propiedad, no reasigna la variable."
}
```

## Lo que var, let y const NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "const hace que un objeto sea completamente inmutable",
      "realidad": "Solo impide reasignar la VARIABLE — las propiedades de un objeto o los elementos de un array declarados con const se pueden seguir modificando."
    },
    {
      "mito": "var y let son básicamente lo mismo, con nombres distintos",
      "realidad": "var tiene ámbito de función (ignora bloques), permite redeclaración, y da undefined si se usa antes de declararse — let corrige los tres comportamientos."
    },
    {
      "mito": "Usar una variable let antes de declararla da undefined, igual que con var",
      "realidad": "Lanza un ReferenceError directo — la zona muerta temporal de let/const es más estricta a propósito."
    },
    {
      "mito": "Los nombres de variable pueden empezar por un número si el resto es descriptivo",
      "realidad": "Un identificador nunca puede empezar por un dígito — causa un error de sintaxis."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar var por costumbre en código nuevo.", "texto": "Hereda comportamientos confusos (redeclaración, ámbito de función, hoisting con undefined) que let y const evitan." },
    { "titulo": "Esperar que const impida modificar el contenido de un objeto.", "texto": "Solo impide reasignar la variable — las propiedades internas se pueden cambiar igual." },
    { "titulo": "Declarar con let por defecto, sin plantearse si hace falta reasignar.", "texto": "const debería ser la opción por defecto; let solo cuando de verdad hace falta cambiar el valor." },
    { "titulo": "No darse cuenta del ámbito de bloque de let/const.", "texto": "Una variable declarada dentro de un if o un bucle no existe fuera de esas llaves." }
  ]
}
```

## Ejercicios

1. Declara una variable con `const` que guarde tu nombre, y explica por qué `const` es la elección correcta ahí.
2. Escribe un ejemplo donde `var` permita algo que `let` bloquearía con un error.
3. Explica qué es la zona muerta temporal y en qué se diferencia del comportamiento de `var`.
4. Escribe un objeto con `const` y modifica una de sus propiedades sin reasignar la variable.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Declara con const tu nombre (ejercicio 1). Escribe un ejemplo donde var permita algo que let bloquearía (ejercicio 2, verás el error en la salida si lo escribes con let). Declara un objeto con const y modifica una de sus propiedades sin reasignarlo (ejercicio 4).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst nombre = 'Ada';\nmostrar(nombre);\n\n// Ejercicio 2: declara dos veces la misma variable con var, y prueba a hacerlo con let\nvar contador = 1;\nvar contador = 2;\nmostrar('var permitido: ' + contador);\n\n// Ejercicio 4\nconst persona = { nombre: 'Ada' };\npersona.nombre = 'Grace';\nmostrar(persona);",
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
      "titulo": "Storing the information you need — Variables",
      "descripcion": "Guía de MDN sobre declarar, inicializar y actualizar variables, reglas de nombres, y la diferencia entre let, const y var.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Variables",
      "descripcion": "Capítulo del curso Learn JavaScript de web.dev sobre ámbito de bloque y la zona muerta temporal (temporal dead zone) de let y const.",
      "url": "https://web.dev/learn/javascript/data-types/variable",
      "etiqueta": "web.dev"
    }
  ]
}
```
