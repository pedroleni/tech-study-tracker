# Campos y métodos de clase, encapsulación privada (#)

- **Módulo:** Clases y programación orientada a objetos
- **Slug:** `campos-y-metodos-de-clase-encapsulacion-privada` (autogenerado del título)
- **Orden:** 107
- **Fuentes:** [Class fields and methods (web.dev)](https://web.dev/learn/javascript/classes/class-fields) + [Private elements (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) — ver `contenido/javascript/TEMARIO.md` #36

---

## Qué es y para qué sirve

Dos formas de ir más allá de un campo o método normal de instancia: `static` pertenece a la CLASE, no a cada instancia — útil para contadores compartidos o métodos de fábrica. `#privado` (visto de forma introductoria en la lección de clases) tiene también su versión de método, con reglas propias que conviene conocer a fondo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo compartido o algo realmente oculto",
  "roles": [
    { "etiqueta": "Quien comparte algo entre instancias", "rol": "static", "descripcion": "Un campo o método static vive en la CLASE misma, no en cada instancia — accesible como Clase.algo, no instancia.algo." },
    { "etiqueta": "Quien oculta comportamiento interno", "rol": "Métodos privados (#metodo)", "descripcion": "Igual que un campo privado, un método #privado solo se puede llamar desde dentro de la propia clase." },
    { "etiqueta": "Quien verifica una instancia real", "rol": "El patrón brand check", "descripcion": "#campo in objeto comprueba si un objeto realmente tiene ese campo privado — imposible de falsificar desde fuera." }
  ]
}
```

## static: pertenece a la clase, no a la instancia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Usuario {\n    static contador = 0;\n\n    constructor(nombre) {\n      this.nombre = nombre;\n      Usuario.contador++;\n    }\n\n    static crearInvitado() {\n      return new Usuario('Invitado');\n    }\n  }\n\n  new Usuario('Ada');\n  new Usuario('Grace');\n\n  console.log(Usuario.contador); // 2 — compartido por la CLASE, no por instancia\n  const invitado = Usuario.crearInvitado();\n  console.log(invitado.nombre); // 'Invitado'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Usuario.contador); // 2 — compartido por la CLASE, no por instancia", "nota": "contador vive en la clase Usuario misma, no en cada instancia — se accede como Usuario.contador. Todas las instancias comparten el mismo valor, incrementado una vez por cada new Usuario(...)." },
    { "fragmento": "static crearInvitado() {\n      return new Usuario('Invitado');\n    }", "nota": "crearInvitado() es un método de FÁBRICA: se llama sobre la clase (Usuario.crearInvitado()), no sobre una instancia ya creada, y devuelve una instancia nueva por su cuenta." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "static es inaccesible desde una instancia",
  "contenido": "new Usuario('Ada').contador es undefined, no 0 — un campo o método static NO está disponible a través de una instancia. Solo existe en la clase misma: Usuario.contador, nunca instancia.contador."
}
```

## Métodos privados: la misma restricción que los campos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Contador {\n    #cuenta = 0;\n\n    #incrementar() {\n      this.#cuenta++;\n    }\n\n    siguiente() {\n      this.#incrementar();\n      return this.#cuenta;\n    }\n  }\n\n  const contador = new Contador();\n  console.log(contador.siguiente()); // 1\n  console.log(contador.siguiente()); // 2\n  // contador.#incrementar(); // SyntaxError — inaccesible desde fuera\n</script>",
  "anotaciones": [
    { "fragmento": "#incrementar() {\n      this.#cuenta++;\n    }", "nota": "#incrementar() es un método PRIVADO — solo se puede llamar desde dentro de la propia clase, aquí desde siguiente(). Igual que un campo #privado, es inaccesible desde fuera." }
  ]
}
```

## El patrón brand check: verificar una instancia real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Moneda {\n    #valor;\n    constructor(valor) {\n      this.#valor = valor;\n    }\n    static obtenerValor(objeto) {\n      if (#valor in objeto) return objeto.#valor;\n      return 'no es una Moneda';\n    }\n  }\n\n  console.log(Moneda.obtenerValor(new Moneda(10))); // 10\n  console.log(Moneda.obtenerValor({}));             // 'no es una Moneda'\n</script>",
  "anotaciones": [
    { "fragmento": "if (#valor in objeto) return objeto.#valor;", "nota": "#valor in objeto comprueba si objeto tiene ESE campo privado específico de Moneda — un método fiable para reconocer instancias reales, imposible de falsificar creando a mano un objeto que se parezca por fuera." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos errores distintos, para dos situaciones distintas",
  "contenido": "Acceder a un campo privado FUERA de la clase (instancia.#campo, escrito literalmente en otro punto del código) es un SyntaxError, detectado antes de ejecutar nada. Acceder a él DESDE DENTRO de un método de la clase, pero sobre un objeto que no lo tiene (como {} en vez de una instancia real), es un TypeError en tiempo de ejecución."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Ni siquiera una subclase accede a lo privado del padre",
  "contenido": "Un campo o método #privado es exclusivo de la clase EXACTA donde se declara — ni siquiera una subclase (extends, visto en la lección anterior) puede acceder a los campos privados de su clase padre, sin ninguna excepción."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class Moneda {\n    #valor;\n    constructor(valor) {\n      this.#valor = valor;\n    }\n    obtenerValor(otraMoneda) {\n      return otraMoneda.#valor;\n    }\n  }\n\n  const m1 = new Moneda(10);\n  const m2 = new Moneda(20);\n\n  console.log(m1.obtenerValor(m2));\n</script>",
  "opciones": [
    "20 — un método de la clase puede acceder al campo privado de OTRA instancia de la MISMA clase, no solo de this",
    "undefined — un campo privado solo es accesible a través de this, nunca sobre otra instancia",
    "Un SyntaxError, porque otraMoneda no es this"
  ],
  "correcta": 0,
  "explicacion": "El acceso a un campo privado no depende de que sea this — cualquier código dentro de la clase Moneda puede leer #valor de CUALQUIER instancia de Moneda, incluida otraMoneda, mientras se acceda desde dentro de un método de esa misma clase. m1.obtenerValor(m2) devuelve m2.#valor: 20."
}
```

## Lo que static y #privado NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un campo o método static es accesible desde cualquier instancia de la clase",
      "realidad": "Solo existe en la clase misma — instancia.campoStatic es siempre undefined."
    },
    {
      "mito": "Un método privado (#metodo) es solo una convención, igual que un campo privado",
      "realidad": "Es tan inaccesible desde fuera como un campo privado — el mismo mecanismo real del lenguaje, no una convención de estilo."
    },
    {
      "mito": "Acceder a un campo privado inexistente siempre lanza el mismo tipo de error",
      "realidad": "SyntaxError si se escribe fuera de la clase; TypeError si se accede desde dentro sobre un objeto que no lo tiene."
    },
    {
      "mito": "Una subclase puede acceder a los campos privados de su clase padre, porque hereda de ella",
      "realidad": "Los campos privados son exclusivos de la clase exacta donde se declaran — ni siquiera sus subclases los ven."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar acceder a un campo static desde una instancia en vez de la clase.", "texto": "Solo Clase.campo funciona — instancia.campo da undefined." },
    { "titulo": "Confundir un método privado con una convención de nombres.", "texto": "Es una restricción real del lenguaje, no un simple guion bajo por delante." },
    { "titulo": "No distinguir el SyntaxError (fuera de la clase) del TypeError (dentro, sobre el objeto equivocado).", "texto": "Son dos situaciones distintas, con dos tipos de error distintos." },
    { "titulo": "Esperar que una subclase acceda a los campos privados heredados de su padre.", "texto": "No los ve, aunque extienda esa clase con extends." }
  ]
}
```

## Ejercicios

1. Crea una clase con un campo `static` que cuente cuántas instancias se han creado.
2. Añade un método privado a una clase, y llámalo solo desde otro método público de la misma clase.
3. Implementa el patrón de "brand check" (`#campo in objeto`) para comprobar si un objeto es una instancia real de tu clase.
4. Explica en tus propias palabras la diferencia entre el `SyntaxError` y el `TypeError` al trabajar con campos privados.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Class fields and methods",
      "descripcion": "Capítulo de web.dev sobre campos de clase, campos y métodos privados con #, y campos y métodos static.",
      "url": "https://web.dev/learn/javascript/classes/class-fields",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Private elements",
      "descripcion": "Referencia de MDN sobre métodos privados, el patrón brand check con #campo in objeto, y la diferencia entre SyntaxError y TypeError al acceder a campos privados.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements",
      "etiqueta": "MDN"
    }
  ]
}
```
