# Herencia con extends y super

- **Módulo:** Clases y programación orientada a objetos
- **Slug:** `herencia-con-extends-y-super` (autogenerado del título)
- **Orden:** 104
- **Fuentes:** [Extend classes (web.dev)](https://web.dev/learn/javascript/classes/extends) — ver `contenido/javascript/TEMARIO.md` #35

---

## Qué es y para qué sirve

`extends` conecta una clase con otra como su padre — la subclase hereda todo lo que tiene, y puede sobrescribir solo lo que necesite cambiar. `super` es la herramienta para relacionarse con esa clase padre desde dentro: llamar a su constructor, o llamar a su versión de un método sobrescrito.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita construir sobre una clase ya existente",
  "roles": [
    { "etiqueta": "Quien hereda de otra clase", "rol": "extends", "descripcion": "Conecta Subclase.prototype con Clase.prototype — hereda todo automáticamente, sin copiar nada." },
    { "etiqueta": "Quien delega la inicialización", "rol": "super(...) en el constructor", "descripcion": "Llama al constructor del padre, pasándole lo que necesite, antes de poder usar this." },
    { "etiqueta": "Quien extiende (no reemplaza) un método", "rol": "super.metodo()", "descripcion": "Llama a la versión del padre desde dentro de la versión sobrescrita, para construir sobre ella en vez de descartarla." }
  ]
}
```

## extends: heredar sin escribir nada más

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Animal {\n    constructor(nombre) {\n      this.nombre = nombre;\n    }\n    describir() {\n      return `${this.nombre} es un animal`;\n    }\n  }\n\n  class Perro extends Animal {}\n\n  const rex = new Perro('Rex');\n  console.log(rex.describir());        // 'Rex es un animal' — heredado sin cambios\n  console.log(rex instanceof Animal);  // true\n</script>",
  "anotaciones": [
    { "fragmento": "class Perro extends Animal {}", "nota": "extends conecta Perro.prototype con Animal.prototype — Perro hereda TODO lo de Animal automáticamente (constructor incluido), sin escribir nada más en su cuerpo." },
    { "fragmento": "console.log(rex instanceof Animal);  // true", "nota": "instanceof confirma la relación: rex es una instancia de Perro, pero también de Animal, porque Perro extiende de él." }
  ]
}
```

## El constructor de una subclase: super() antes que this

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Animal {\n    constructor(nombre) {\n      this.nombre = nombre;\n    }\n  }\n\n  class Perro extends Animal {\n    constructor(nombre, raza) {\n      super(nombre); // debe llamarse ANTES de usar this\n      this.raza = raza;\n    }\n  }\n\n  const rex = new Perro('Rex', 'Labrador');\n  console.log(rex.nombre); // 'Rex' — inicializado por Animal, vía super()\n  console.log(rex.raza);   // 'Labrador' — propio de Perro\n</script>",
  "anotaciones": [
    { "fragmento": "super(nombre); // debe llamarse ANTES de usar this", "nota": "super(nombre) ejecuta el constructor de Animal, pasándole nombre — así Perro delega la inicialización que Animal ya sabe hacer, en vez de repetirla." },
    { "fragmento": "this.raza = raza;", "nota": "Solo DESPUÉS de que super() termine puede la subclase usar this para añadir sus propias propiedades — aquí, raza, algo que Animal no tiene." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Usar this antes de super() es un error",
  "contenido": "En una subclase con su propio constructor, super() debe llamarse ANTES de usar this de cualquier forma — intentar acceder a this antes lanza un ReferenceError. Tiene sentido: this no existe todavía hasta que el constructor del padre termina de crear la instancia base."
}
```

## Sobrescribir un método, sin perder el original

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Animal {\n    describir() {\n      return 'Soy un animal genérico';\n    }\n  }\n\n  class Perro extends Animal {\n    describir() {\n      return `${super.describir()} — más concretamente, un perro`;\n    }\n  }\n\n  const rex = new Perro();\n  console.log(rex.describir()); // 'Soy un animal genérico — más concretamente, un perro'\n</script>",
  "anotaciones": [
    { "fragmento": "describir() {\n      return `${super.describir()} — más concretamente, un perro`;\n    }", "nota": "Perro SOBRESCRIBE describir() con su propia versión — pero super.describir() permite llamar a la versión del PADRE desde dentro, para EXTENDER su resultado en vez de reemplazarlo por completo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin constructor propio, se hereda uno implícito",
  "contenido": "Si una subclase NO define su propio constructor, JavaScript llama implícitamente al constructor del padre, pasándole los mismos argumentos — como si la subclase tuviera constructor(...args) { super(...args); } de forma automática, sin necesitar escribirlo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class Animal {\n    constructor(nombre) {\n      this.nombre = nombre;\n    }\n    describir() {\n      return `${this.nombre} hace ruido`;\n    }\n  }\n\n  class Gato extends Animal {\n    describir() {\n      return `${super.describir()}: miau`;\n    }\n  }\n\n  const michi = new Gato('Michi');\n  console.log(michi.describir());\n</script>",
  "opciones": [
    "'Michi hace ruido: miau' — super.describir() ejecuta la versión de Animal (con acceso al this real de la instancia), y Gato añade su propio texto después",
    "'undefined hace ruido: miau' — super.describir() no tiene acceso a this.nombre de la instancia real",
    "Un error, porque Gato no define su propio constructor con super()"
  ],
  "correcta": 0,
  "explicacion": "Gato no define un constructor propio, así que JavaScript llama implícitamente a Animal(nombre) al crear la instancia, inicializando this.nombre con 'Michi'. describir() está sobrescrito en Gato, pero super.describir() ejecuta la versión de Animal — que SÍ tiene acceso al this real de la instancia — y Gato concatena ': miau' al resultado."
}
```

## Lo que extends y super NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una subclase con constructor propio puede usar this antes de llamar a super()",
      "realidad": "Lanza un ReferenceError — super() debe llamarse primero, antes de cualquier uso de this."
    },
    {
      "mito": "Sobrescribir un método en una subclase hace que el método del padre desaparezca por completo",
      "realidad": "Sigue siendo accesible desde dentro de la subclase, vía super.metodo()."
    },
    {
      "mito": "Si una subclase no define constructor, no hereda ninguna inicialización del padre",
      "realidad": "JavaScript llama implícitamente al constructor del padre, pasándole los mismos argumentos."
    },
    {
      "mito": "extends copia las propiedades y métodos del padre dentro de la subclase",
      "realidad": "Conecta los prototipos (el mismo mecanismo de la herencia prototípica) — no existe ninguna copia real."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar this en el constructor de una subclase antes de llamar a super().", "texto": "Lanza un ReferenceError directo, deteniendo la ejecución." },
    { "titulo": "Olvidar pasar los argumentos necesarios a super() al delegar la inicialización.", "texto": "El constructor del padre los necesita para inicializar correctamente la instancia." },
    { "titulo": "No aprovechar super.metodo() para extender el comportamiento del padre en vez de reescribirlo entero.", "texto": "Evita duplicar lógica que el padre ya resuelve." },
    { "titulo": "Pensar que extends copia código en vez de conectar prototipos.", "texto": "Es el mismo mecanismo de herencia prototípica, con una sintaxis más clara." }
  ]
}
```

## Ejercicios

1. Crea una clase padre y una subclase con `extends` que herede un método sin sobrescribirlo.
2. Escribe un constructor en la subclase que llame a `super()` con los argumentos necesarios, y añada una propiedad propia.
3. Sobrescribe un método heredado, y usa `super.metodo()` para extender (no reemplazar) el comportamiento del padre.
4. Explica en tus propias palabras qué ocurre si una subclase no define su propio constructor.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Extend classes",
      "descripcion": "Capítulo de web.dev sobre extends, la exigencia de llamar a super() antes de this en el constructor de una subclase, y super.metodo() para extender un método sobrescrito.",
      "url": "https://web.dev/learn/javascript/classes/extends",
      "etiqueta": "web.dev"
    }
  ]
}
```
