# Prototipos y la herencia prototípica

- **Módulo:** Objetos
- **Slug:** `prototipos-y-la-herencia-prototipica` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [Prototypal inheritance (web.dev)](https://web.dev/learn/javascript/objects/prototypal-inheritance) + [Inheritance and the prototype chain (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) — ver `contenido/javascript/TEMARIO.md` #27

---

## Qué es y para qué sirve

Cada objeto tiene un vínculo interno a otro objeto: su **prototipo**. Cuando se lee una propiedad que el objeto no tiene, JavaScript no se rinde — sigue buscando en el prototipo, y en el prototipo del prototipo, hasta encontrarla o llegar al final de la cadena. Así es como `new` (visto en el módulo anterior) consigue que todas las instancias compartan los mismos métodos sin duplicarlos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que un objeto herede de otro",
  "roles": [
    { "etiqueta": "Quien busca una propiedad que no está", "rol": "Sigue la cadena hacia arriba", "descripcion": "Si el objeto no la tiene, JavaScript la busca en su prototipo, y así sucesivamente hasta null." },
    { "etiqueta": "Quien crea una propiedad propia", "rol": "Tapa (shadowing) la heredada", "descripcion": "Asignar un valor no modifica el prototipo — crea una propiedad nueva en el objeto que oculta la heredada." },
    { "etiqueta": "Quien comparte métodos entre instancias", "rol": "Un solo lugar, no una copia por instancia", "descripcion": "Constructor.prototype es compartido — modificarlo después afecta a todas las instancias existentes." }
  ]
}
```

## Propia vs. heredada: la cadena en acción

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const vehiculo = { ruedas: 4 };\n  const coche = {\n    marca: 'Tesla',\n    __proto__: vehiculo,\n  };\n\n  console.log(coche.marca);  // 'Tesla' — propiedad propia\n  console.log(coche.ruedas); // 4 — heredada del prototipo\n  console.log(coche.color);  // undefined — no existe en ningún punto de la cadena\n\n  console.log(Object.getPrototypeOf(coche) === vehiculo); // true\n  console.log(Object.getPrototypeOf(Object.prototype));   // null — el final de la cadena\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(coche.ruedas); // 4 — heredada del prototipo", "nota": "coche no tiene una propiedad ruedas propia — JavaScript sigue la cadena hasta vehiculo, la encuentra ahí, y la devuelve. No se copió nada: es una búsqueda en tiempo real." },
    { "fragmento": "console.log(Object.getPrototypeOf(Object.prototype));   // null — el final de la cadena", "nota": "La cadena de prototipos SIEMPRE termina en null. Object.prototype es el único objeto normal cuyo propio prototipo es null — si no fuera así, la búsqueda no tendría dónde parar." }
  ]
}
```

## El shadowing: una propiedad propia tapa a la heredada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const vehiculo = {\n    ruedas: 4,\n    describir() {\n      return `Tiene ${this.ruedas} ruedas`;\n    },\n  };\n\n  const moto = { __proto__: vehiculo };\n  console.log(moto.describir()); // 'Tiene 4 ruedas' — usa vehiculo.ruedas vía this\n\n  moto.ruedas = 2; // crea una propiedad PROPIA, no modifica vehiculo.ruedas\n  console.log(moto.describir()); // 'Tiene 2 ruedas' — ahora usa la propia\n  console.log(vehiculo.ruedas);  // 4 — sin cambios\n</script>",
  "anotaciones": [
    { "fragmento": "moto.ruedas = 2; // crea una propiedad PROPIA, no modifica vehiculo.ruedas", "nota": "Asignar nunca modifica el prototipo — siempre crea (o actualiza) una propiedad PROPIA en el objeto sobre el que se asigna. A partir de aquí, moto.ruedas tapa (shadowing) la ruedas heredada de vehiculo." },
    { "fragmento": "console.log(moto.describir()); // 'Tiene 2 ruedas' — ahora usa la propia", "nota": "describir() vive en vehiculo, pero this dentro de un método SIEMPRE apunta a quien hizo la llamada (moto), no a donde vive el método — por eso ve la ruedas propia de moto, no la de vehiculo." }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const vehiculo = { ruedas: 4 };\n  const moto = { ruedas: 2, __proto__: vehiculo }; // ruedas ya es propia aquí\n\n  console.log(moto.hasOwnProperty('ruedas'));     // true — es propia\n  console.log(moto.hasOwnProperty('color'));      // false — ni propia ni heredada\n  console.log(Object.hasOwn(vehiculo, 'ruedas'));  // true — alternativa moderna recomendada\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(moto.hasOwnProperty('ruedas'));     // true — es propia", "nota": "hasOwnProperty() (o Object.hasOwn(), su alternativa más moderna) responde SOLO por propiedades propias — ignora la cadena de prototipos por completo, a diferencia de leer la propiedad directamente." }
  ]
}
```

## Object.getPrototypeOf() / setPrototypeOf(), no __proto__

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const vehiculo = { ruedas: 4 };\n  const bicicleta = {};\n\n  Object.setPrototypeOf(bicicleta, vehiculo);\n  console.log(Object.getPrototypeOf(bicicleta) === vehiculo); // true\n  console.log(bicicleta.ruedas); // 4 — heredado tras el enlace\n</script>",
  "anotaciones": [
    { "fragmento": "Object.setPrototypeOf(bicicleta, vehiculo);", "nota": "Object.setPrototypeOf() enlaza el prototipo de un objeto YA existente. Los ejemplos anteriores usaron __proto__ dentro del literal solo para ilustrar la cadena de forma compacta — en código real, esta es la forma recomendada." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "__proto__ funciona, pero no es la forma recomendada",
  "contenido": "Aunque todos los navegadores comunes soportan __proto__ como estándar de facto, no está formalmente estandarizado del mismo modo que el resto del lenguaje. Para leer o modificar el prototipo de un objeto en código de producción, se recomienda Object.getPrototypeOf() y Object.setPrototypeOf()."
}
```

## Object.create(): fijar el prototipo desde el momento de creación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const vehiculo = { ruedas: 4 };\n  const furgoneta = Object.create(vehiculo);\n  furgoneta.carga = '500kg';\n\n  console.log(furgoneta.ruedas); // 4 — heredado, sin necesitar setPrototypeOf después\n\n  const sinPrototipo = Object.create(null);\n  console.log(sinPrototipo.toString); // undefined — ni siquiera hereda de Object.prototype\n</script>",
  "anotaciones": [
    { "fragmento": "const furgoneta = Object.create(vehiculo);", "nota": "Object.create() crea un objeto NUEVO con el prototipo indicado desde el principio — a diferencia de setPrototypeOf(), no hace falta un objeto ya existente ni un segundo paso." },
    { "fragmento": "const sinPrototipo = Object.create(null);\n  console.log(sinPrototipo.toString); // undefined — ni siquiera hereda de Object.prototype", "nota": "Object.create(null) crea un objeto SIN prototipo — ni siquiera hereda de Object.prototype. Ni toString, ni hasOwnProperty, ni ningún método heredado por defecto: útil para objetos usados como diccionarios puros." }
  ]
}
```

## La conexión con new: Constructor.prototype

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function Coche(marca) {\n    this.marca = marca;\n  }\n\n  Coche.prototype.arrancar = function () {\n    return `${this.marca} arrancando...`;\n  };\n\n  const miCoche = new Coche('Tesla');\n  console.log(miCoche.arrancar()); // 'Tesla arrancando...'\n  console.log(Object.getPrototypeOf(miCoche) === Coche.prototype); // true\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Object.getPrototypeOf(miCoche) === Coche.prototype); // true", "nota": "Esto es lo que new hace por dentro (visto en la lección anterior): conecta automáticamente el prototipo de cada instancia nueva con Coche.prototype. arrancar() no se copia en cada instancia — vive en un único lugar compartido." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Modificar el prototipo compartido afecta a TODAS las instancias",
  "contenido": "Añadir un método nuevo a Coche.prototype después de crear instancias las afecta retroactivamente a todas — el método no está copiado en cada una, se busca en tiempo real siguiendo la cadena. Por eso compartir métodos vía prototype (en vez de asignarlos con this dentro del constructor, como en las closures) es la opción más eficiente en memoria cuando hay muchas instancias."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const vehiculo = {\n    ruedas: 4,\n    describir() {\n      return `Tiene ${this.ruedas} ruedas`;\n    },\n  };\n  const moto = { __proto__: vehiculo };\n\n  console.log(moto.describir());\n  moto.ruedas = 2;\n  console.log(moto.describir());\n  console.log(vehiculo.ruedas);\n</script>",
  "opciones": [
    "'Tiene 4 ruedas', luego 'Tiene 2 ruedas', luego 4 — la asignación crea una propiedad propia que tapa la heredada, sin tocar vehiculo",
    "'Tiene 4 ruedas' las tres veces — this dentro de un método heredado siempre apunta al objeto donde vive el método, no a quien lo llama",
    "Un error en moto.ruedas = 2, porque esa propiedad no existía originalmente en moto"
  ],
  "correcta": 0,
  "explicacion": "this dentro de describir() apunta a quien HIZO la llamada (moto), no a vehiculo, donde vive el método. Antes de la asignación, moto.ruedas se busca en la cadena y encuentra el 4 de vehiculo. moto.ruedas = 2 crea una propiedad PROPIA en moto que tapa la heredada — vehiculo.ruedas sigue siendo 4, sin cambios."
}
```

## Lo que la herencia prototípica NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una propiedad heredada se copia al objeto que hereda de ella",
      "realidad": "No se copia nunca — se busca en tiempo real siguiendo la cadena de prototipos cada vez que se accede a ella."
    },
    {
      "mito": "__proto__ es la forma recomendada de leer o modificar el prototipo de un objeto",
      "realidad": "Funciona en todos los navegadores comunes, pero no está formalmente estandarizada igual que el resto — se recomienda Object.getPrototypeOf()/setPrototypeOf()."
    },
    {
      "mito": "Modificar el prototipo compartido después de crear instancias no afecta a las ya existentes",
      "realidad": "SÍ las afecta a todas — la búsqueda es en tiempo real, no una copia congelada en el momento en que se crearon."
    },
    {
      "mito": "La cadena de prototipos puede seguir subiendo indefinidamente",
      "realidad": "Siempre termina en null — Object.prototype es el único objeto normal cuyo propio prototipo es null."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir herencia por referencia compartida con herencia por copia.", "texto": "Una propiedad heredada nunca se duplica — vive en un único lugar de la cadena." },
    { "titulo": "Usar __proto__ directamente en vez de Object.getPrototypeOf()/setPrototypeOf().", "texto": "Funciona, pero no es la forma recomendada en código de producción." },
    { "titulo": "No darse cuenta de que asignar una propiedad crea una propia, sin modificar la heredada.", "texto": "El shadowing es la causa más común de sorpresas al trabajar con prototipos." },
    { "titulo": "Olvidar que new conecta automáticamente el prototipo del constructor con cada instancia nueva.", "texto": "Es lo que permite compartir métodos sin duplicarlos por instancia." }
  ]
}
```

## Ejercicios

1. Crea un objeto base con una propiedad, y otro que lo herede usando `Object.create()`. Comprueba el acceso a la propiedad heredada.
2. Demuestra el shadowing: asigna una propiedad con el mismo nombre que una heredada, y comprueba que el objeto base no cambia.
3. Usa `Object.getPrototypeOf()` para comprobar el prototipo de una instancia creada con `new`.
4. Explica por qué añadir un método a `Constructor.prototype` después de crear instancias afecta también a las que ya existían.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Prototypal inheritance",
      "descripcion": "Capítulo de web.dev sobre qué es un prototipo, la cadena de prototipos, y por qué se recomienda Object.getPrototypeOf()/setPrototypeOf() en vez de __proto__.",
      "url": "https://web.dev/learn/javascript/objects/prototypal-inheritance",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Inheritance and the prototype chain",
      "descripcion": "Guía de MDN sobre la búsqueda de propiedades a lo largo de la cadena, el shadowing, Object.create(), y la relación entre Constructor.prototype y las instancias creadas con new.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
      "etiqueta": "MDN"
    }
  ]
}
```
