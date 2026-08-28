# Property descriptors: configurar propiedades a fondo, getters y setters

- **Módulo:** Objetos
- **Slug:** `property-descriptors-configurar-propiedades-a-fondo-getters-y-setters` (autogenerado del título)
- **Orden:** 77
- **Fuentes:** [Property descriptors (web.dev)](https://web.dev/learn/javascript/objects/property-descriptors) + [get (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) + [set (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) — ver `contenido/javascript/TEMARIO.md` #26

---

## Qué es y para qué sirve

Cada propiedad de un objeto tiene, además de su valor, un conjunto de atributos invisibles que controlan cómo se comporta: si se puede reescribir, si se puede borrar, si aparece al recorrer el objeto. A eso se le llama **property descriptor**. Y hay una segunda forma de definir una propiedad que no guarda un valor fijo, sino que ejecuta código al leerla o escribirla: **getters y setters**.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita controlar una propiedad más allá de su valor",
  "roles": [
    { "etiqueta": "Quien restringe el acceso", "rol": "writable, configurable, enumerable", "descripcion": "Atributos invisibles que deciden si una propiedad se puede reescribir, borrar o ver al recorrer el objeto." },
    { "etiqueta": "Quien calcula un valor al leer", "rol": "Un getter en vez de un valor fijo", "descripcion": "get ejecuta una función cada vez que se lee la propiedad — el valor no está guardado, se calcula en el momento." },
    { "etiqueta": "Quien reacciona a una escritura", "rol": "Un setter que intercepta la asignación", "descripcion": "set ejecuta una función cada vez que se asigna un valor a la propiedad, en vez de guardarlo directamente." }
  ]
}
```

## Object.defineProperty(): crear una propiedad no escribible

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const coche = {};\n  Object.defineProperty(coche, 'modelo', {\n    value: 'Tesla',\n    writable: false,\n  });\n\n  console.log(coche.modelo); // 'Tesla'\n  coche.modelo = 'Toyota';   // falla en silencio (o lanza en modo estricto)\n  console.log(coche.modelo); // 'Tesla' — sin cambios\n</script>",
  "anotaciones": [
    { "fragmento": "Object.defineProperty(coche, 'modelo', {\n    value: 'Tesla',\n    writable: false,\n  });", "nota": "Object.defineProperty() crea (o modifica) una propiedad indicando su DESCRIPTOR completo — un objeto con los atributos que controlan su comportamiento, no solo su valor." },
    { "fragmento": "coche.modelo = 'Toyota';   // falla en silencio (o lanza en modo estricto)", "nota": "writable: false hace que cualquier intento de reasignación no tenga efecto — sin lanzar error en modo normal, pero sí lanzaría TypeError en modo estricto ('use strict')." }
  ]
}
```

## Dos formas de crear una propiedad, dos defaults distintos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const coche = { modelo: 'Tesla' };\n  console.log(Object.getOwnPropertyDescriptor(coche, 'modelo'));\n  // { value: 'Tesla', writable: true, enumerable: true, configurable: true }\n\n  Object.defineProperty(coche, 'anio', { value: 2024 });\n  console.log(Object.getOwnPropertyDescriptor(coche, 'anio'));\n  // { value: 2024, writable: false, enumerable: false, configurable: false }\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Object.getOwnPropertyDescriptor(coche, 'modelo'));\n  // { value: 'Tesla', writable: true, enumerable: true, configurable: true }", "nota": "Object.getOwnPropertyDescriptor() devuelve el descriptor COMPLETO de una propiedad. Una propiedad creada como objeto literal tiene los tres atributos en true por defecto." },
    { "fragmento": "Object.defineProperty(coche, 'anio', { value: 2024 });\n  console.log(Object.getOwnPropertyDescriptor(coche, 'anio'));\n  // { value: 2024, writable: false, enumerable: false, configurable: false }", "nota": "Con defineProperty(), cualquier atributo que NO se especifique explícitamente vale false por defecto — el opuesto exacto de un objeto literal. anio quedó no escribible, no enumerable y no configurable sin pedirlo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El default cambia según cómo se crea la propiedad",
  "contenido": "Una propiedad de objeto literal ({ clave: valor }) nace con writable, enumerable y configurable en true. Una propiedad creada con Object.defineProperty() nace con los tres en false, salvo que se indiquen explícitamente — es fácil crear sin querer una propiedad casi congelada."
}
```

## Los seis atributos posibles

Un descriptor es de **datos** (guarda un valor fijo) o de **acceso** (ejecuta funciones) — nunca las dos cosas a la vez. `configurable` y `enumerable` son compartidos por ambos tipos.

| Atributo | Tipo de descriptor | Qué controla |
|---|---|---|
| `value` | De datos | El valor en sí de la propiedad |
| `writable` | De datos | Si `value` se puede reasignar |
| `get` | De acceso | Función que se ejecuta al LEER la propiedad |
| `set` | De acceso | Función que se ejecuta al ESCRIBIR la propiedad |
| `configurable` | Compartido | Si la propiedad se puede borrar o redefinir |
| `enumerable` | Compartido | Si aparece en `for...in`, `Object.keys()`, el spread `{...obj}`, etc. |

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "configurable: false suele ser irreversible",
  "contenido": "Marcar una propiedad como no configurable normalmente cierra la puerta a volver atrás: no se puede borrar con delete, ni redefinir con otra llamada a defineProperty. Es la forma más fuerte de bloqueo de las tres — writable y enumerable se pueden reconsiderar más adelante si configurable sigue en true, pero configurable: false compromete la propiedad de forma prácticamente definitiva."
}
```

## Getters: una propiedad que se calcula al leerla

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: 'Ada',\n    apellido: 'Lovelace',\n    get nombreCompleto() {\n      return `${this.nombre} ${this.apellido}`;\n    },\n  };\n\n  console.log(persona.nombreCompleto); // 'Ada Lovelace'\n</script>",
  "anotaciones": [
    { "fragmento": "get nombreCompleto() {\n      return `${this.nombre} ${this.apellido}`;\n    },", "nota": "get seguido de un nombre define un GETTER — una función que se ejecuta cada vez que se lee esa propiedad. Debe tener exactamente CERO parámetros; con alguno, es un SyntaxError." },
    { "fragmento": "console.log(persona.nombreCompleto); // 'Ada Lovelace'", "nota": "Se accede como una propiedad NORMAL, sin paréntesis — persona.nombreCompleto(), llamándolo como función, no funciona. nombreCompleto no guarda ningún valor fijo; se recalcula cada vez que se lee." }
  ]
}
```

## Setters: interceptar una asignación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: 'Ada',\n    apellido: 'Lovelace',\n    get nombreCompleto() {\n      return `${this.nombre} ${this.apellido}`;\n    },\n    set nombreCompleto(valor) {\n      [this.nombre, this.apellido] = valor.split(' ');\n    },\n  };\n\n  persona.nombreCompleto = 'Grace Hopper';\n  console.log(persona.nombre);   // 'Grace'\n  console.log(persona.apellido); // 'Hopper'\n</script>",
  "anotaciones": [
    { "fragmento": "set nombreCompleto(valor) {\n      [this.nombre, this.apellido] = valor.split(' ');\n    },", "nota": "set seguido de un nombre define un SETTER — se ejecuta cada vez que se ASIGNA algo a esa propiedad. A diferencia del getter, debe tener exactamente UN parámetro: el valor que se está asignando." },
    { "fragmento": "persona.nombreCompleto = 'Grace Hopper';", "nota": "Se dispara con una ASIGNACIÓN normal, no con una llamada de función — persona.nombreCompleto('Grace Hopper') no activaría el setter." },
    { "fragmento": "console.log(persona.nombre);   // 'Grace'\n  console.log(persona.apellido); // 'Hopper'", "nota": "El setter no guardó 'Grace Hopper' en ningún sitio directamente — lo usó para actualizar nombre y apellido por separado, que es lo que el getter nombreCompleto lee después." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const persona = {\n    log: ['visita 1', 'visita 2'],\n    get ultimo() {\n      return this.log[this.log.length - 1];\n    },\n  };\n\n  persona.ultimo = 'intento de escritura'; // no hay ningún setter definido\n  console.log(persona.ultimo);\n</script>",
  "opciones": [
    "'visita 2' — sin setter definido, la asignación no tiene ningún efecto y se ignora en silencio",
    "'intento de escritura' — asignar a una propiedad con getter siempre sobrescribe lo que devuelve",
    "undefined, porque asignar a una propiedad que solo tiene getter lanza un error y detiene la ejecución"
  ],
  "correcta": 0,
  "explicacion": "persona solo define un getter para ultimo, sin ningún setter. Asignarle un valor (persona.ultimo = ...) no tiene ningún setter que lo intercepte, así que en modo no estricto se ignora silenciosamente — el getter se sigue calculando igual que antes, devolviendo 'visita 2'."
}
```

## Propiedades no enumerables: invisibles al recorrer el objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const coche = { modelo: 'Tesla' };\n  Object.defineProperty(coche, 'numeroDeSerie', {\n    value: 'XYZ123',\n    enumerable: false,\n  });\n\n  console.log(Object.keys(coche));     // ['modelo'] — numeroDeSerie no aparece\n  console.log(coche.numeroDeSerie);    // 'XYZ123' — pero sigue siendo accesible\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Object.keys(coche));     // ['modelo'] — numeroDeSerie no aparece", "nota": "enumerable: false oculta la propiedad de Object.keys(), for...in, JSON.stringify() y el spread {...coche} — todo lo que RECORRE las propiedades del objeto." },
    { "fragmento": "console.log(coche.numeroDeSerie);    // 'XYZ123' — pero sigue siendo accesible", "nota": "No enumerable NO significa inaccesible — accediendo directamente por su nombre (con punto o corchetes), la propiedad se lee con total normalidad. Solo desaparece de las formas de RECORRER el objeto sin conocer sus claves de antemano." }
  ]
}
```

## Lo que los property descriptors NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una propiedad creada con Object.defineProperty() tiene los mismos defaults que una de objeto literal",
      "realidad": "Un objeto literal nace con writable, enumerable y configurable en true. defineProperty() los deja en false si no se indican explícitamente — el default opuesto."
    },
    {
      "mito": "Un getter se llama como una función: objeto.propiedad()",
      "realidad": "Se accede como una propiedad normal, sin paréntesis — llamarlo como función simplemente intenta invocar el valor que devuelve, no el getter en sí."
    },
    {
      "mito": "Asignar un valor a una propiedad que solo tiene getter (sin setter) lanza un error siempre",
      "realidad": "En modo no estricto, la asignación se ignora en silencio. Solo lanza TypeError en modo estricto ('use strict')."
    },
    {
      "mito": "Una propiedad no enumerable está completamente oculta, no se puede leer de ninguna forma",
      "realidad": "Sigue siendo accesible directamente por su nombre — solo desaparece de Object.keys(), for...in y formas similares de RECORRER el objeto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que Object.defineProperty() usa los mismos defaults que un objeto literal.", "texto": "Sin indicarlos explícitamente, writable, enumerable y configurable nacen en false, no en true." },
    { "titulo": "Intentar llamar a un getter o setter como si fuera un método normal.", "texto": "Se activan con lectura o asignación directa, nunca con paréntesis." },
    { "titulo": "Confundir 'no enumerable' con 'no accesible'.", "texto": "Solo desaparece de las formas de recorrer el objeto — sigue siendo legible por su nombre." },
    { "titulo": "No usar Object.getOwnPropertyDescriptor() para comprobar el comportamiento real de una propiedad.", "texto": "Es la forma directa de ver los atributos reales en vez de asumirlos." }
  ]
}
```

## Ejercicios

1. Usa `Object.defineProperty()` para crear una propiedad no escribible, e intenta modificarla para comprobar que no cambia.
2. Compara el descriptor de una propiedad de objeto literal con el de una creada por `Object.defineProperty()`, usando `Object.getOwnPropertyDescriptor()`.
3. Escribe un getter y un setter para una misma propiedad calculada (por ejemplo, un precio con IVA incluido), y demuestra que ambos funcionan.
4. Crea una propiedad no enumerable y comprueba que `Object.keys()` no la incluye, aunque siga siendo accesible directamente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Property descriptors",
      "descripcion": "Capítulo de web.dev sobre los descriptores de datos y de acceso, los atributos compartidos configurable y enumerable, y Object.defineProperty().",
      "url": "https://web.dev/learn/javascript/objects/property-descriptors",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "get",
      "descripcion": "Referencia de MDN sobre la sintaxis get en object literals: el ejemplo canónico, la regla de cero parámetros, y el acceso como propiedad normal.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get",
      "etiqueta": "MDN"
    },
    {
      "titulo": "set",
      "descripcion": "Referencia de MDN sobre la sintaxis set en object literals: el ejemplo canónico, la regla de un único parámetro, y cómo se combina con un getter.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set",
      "etiqueta": "MDN"
    }
  ]
}
```
