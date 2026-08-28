# Hoisting: cómo se procesa realmente el código

- **Módulo:** Funciones
- **Slug:** `hoisting-como-se-procesa-realmente-el-codigo` (autogenerado del título)
- **Orden:** 65
- **Fuentes:** [Grammar and types (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) — ver `contenido/javascript/TEMARIO.md` #22

---

## Qué es y para qué sirve

Antes de ejecutar una sola línea, el motor de JavaScript ya "sabe" qué variables y funciones existen en cada ámbito — a eso se le llama hoisting. Pero `var`, `let`/`const` y las declaraciones de función se hoistean de formas completamente distintas, con consecuencias reales.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita saber qué existe antes de ejecutarse",
  "roles": [
    { "etiqueta": "Quien entiende el orden real", "rol": "Qué se procesa antes de ejecutar", "descripcion": "El motor registra declaraciones antes de correr el código línea a línea." },
    { "etiqueta": "Quien evita la zona muerta temporal", "rol": "let y const, sin inicializar todavía", "descripcion": "Usarlas antes de su línea de declaración lanza un ReferenceError, no undefined." },
    { "etiqueta": "Quien llama una función antes", "rol": "Las declaraciones se hoistean por completo", "descripcion": "Nombre y cuerpo, disponibles desde el principio del ámbito." }
  ]
}
```

## var: se hoistea CON inicialización a undefined

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(x === undefined); // true\n  var x = 3;\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(x === undefined); // true", "nota": "Solo la DECLARACIÓN (var x) se hoistea, con un valor inicial de undefined — la ASIGNACIÓN (= 3) sigue ocurriendo en su línea original, no antes." }
  ]
}
```

## El modelo mental: cómo lo procesa el motor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Lo que se escribe:\n  console.log(x === undefined);\n  var x = 3;\n\n  // Cómo lo procesa el motor, en efecto:\n  var x;\n  console.log(x === undefined);\n  x = 3;\n</script>",
  "anotaciones": [
    { "fragmento": "// Cómo lo procesa el motor, en efecto:\n  var x;\n  console.log(x === undefined);\n  x = 3;", "nota": "Es un modelo mental útil para entenderlo, no algo que ocurra literalmente — el motor no mueve código de sitio, pero SÍ procesa las declaraciones antes de ejecutar nada, como si var x estuviera al principio." }
  ]
}
```

## let/const: hoisteadas, pero SIN inicializar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(y); // ReferenceError — no undefined\n  let y = 3;\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(y); // ReferenceError — no undefined", "nota": "A diferencia de var, let y const permanecen en una ZONA MUERTA TEMPORAL desde el inicio del bloque hasta que su línea de declaración se procesa — acceder antes lanza un error directo, no undefined." }
  ]
}
```

## Declaraciones de función: hoisteadas por completo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  saludar(); // funciona, aunque se llame ANTES de la declaración\n\n  function saludar() {\n    console.log('¡Hola!');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "saludar(); // funciona, aunque se llame ANTES de la declaración", "nota": "A diferencia de var (que solo hoistea el nombre, con undefined), una declaración de función se hoistea COMPLETA — nombre y cuerpo. Se puede llamar de verdad en cualquier punto de su ámbito, no solo comprobar que existe." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Tres comportamientos, no uno solo",
  "contenido": "var: se hoistea e inicializa a undefined — accesible antes, pero vacía. let/const: se hoistean SIN inicializar — inaccesibles antes, lanzan ReferenceError (zona muerta temporal). Declaración de función: se hoistea POR COMPLETO — nombre y cuerpo, totalmente utilizable antes de su línea en el código."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Buena práctica: declarar cerca del principio del ámbito",
  "contenido": "Aunque var funcione aunque se declare en cualquier parte, colocar las declaraciones cerca del principio de su función (o usar let/const, que ya obligan a esto de forma más estricta) hace mucho más fácil ver de un vistazo qué variables existen en ese ámbito."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(x === undefined);\n  var x = 3;\n\n  (function () {\n    console.log(x);\n    var x = 'valor local';\n  })();\n</script>",
  "opciones": [
    "true, y luego undefined — la declaración var x se hoistea al principio de cada ámbito, inicializada a undefined, antes de que la asignación real ocurra",
    "true, y luego 3 — la variable local hereda el valor de la variable global mientras no se reasigna",
    "Un ReferenceError en ambas líneas, porque x se usa antes de declararse"
  ],
  "correcta": 0,
  "explicacion": "En el ámbito global, var x se hoistea con undefined antes del primer console.log: true. Dentro de la función, HAY una var x propia (aunque declarada más abajo) — su hoisting local crea una x local, separada de la global, también inicializada a undefined hasta su propia asignación: undefined, no 3 ni un error."
}
```

## Lo que el hoisting NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Usar una variable let antes de declararla da undefined, igual que con var",
      "realidad": "Da un ReferenceError directo — let y const permanecen en una zona muerta temporal hasta que su línea se procesa, no undefined."
    },
    {
      "mito": "El hoisting mueve físicamente el código a la parte de arriba del archivo",
      "realidad": "Es un modelo mental útil, pero el motor procesa las declaraciones antes de ejecutar, sin mover nada línea por línea de verdad."
    },
    {
      "mito": "Las funciones declaradas se hoistean igual que var, solo el nombre",
      "realidad": "Se hoistean POR COMPLETO — nombre y cuerpo — así que se pueden llamar de verdad antes de aparecer en el código."
    },
    {
      "mito": "let y const no se hoistean en absoluto",
      "realidad": "Técnicamente sí se hoistean, pero sin inicializar — de ahí la zona muerta temporal, distinto de no hoistearse del todo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el hoisting de var (undefined) con el de let/const (ReferenceError).", "texto": "Comportamientos reales muy distintos, aunque a ambos se les llame \"hoisting\"." },
    { "titulo": "Pensar que el hoisting mueve físicamente el código.", "texto": "Es un modelo mental, no algo que ocurra literalmente en el motor." },
    { "titulo": "No aprovechar que las declaraciones de función se hoistean por completo.", "texto": "Permite organizarlas donde tenga más sentido leerlas, no donde deban ir por fuerza." },
    { "titulo": "Declarar var en medio de una función en vez de cerca del principio.", "texto": "Dificulta ver de un vistazo qué variables existen en ese ámbito." }
  ]
}
```

## Ejercicios

1. Escribe un ejemplo que demuestre que `var` da `undefined` al usarse antes de su declaración.
2. Escribe el mismo ejemplo con `let`, y explica la diferencia real en el resultado.
3. Explica por qué se puede llamar a una función declarada antes de que aparezca en el código.
4. Explica en tus propias palabras qué es la zona muerta temporal.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Grammar and types",
      "descripcion": "Guía de referencia de MDN sobre el hoisting de var, let/const (zona muerta temporal) y las declaraciones de función.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
      "etiqueta": "MDN"
    }
  ]
}
```
