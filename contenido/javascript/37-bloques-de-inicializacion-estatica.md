# Bloques de inicialización estática

- **Módulo:** Clases y programación orientada a objetos
- **Slug:** `bloques-de-inicializacion-estatica` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Static initialization blocks (web.dev)](https://web.dev/learn/javascript/classes/static-initialization-blocks) — ver `contenido/javascript/TEMARIO.md` #37

---

## Qué es y para qué sirve

Cierra el módulo de clases. Un campo `static campo = valor;` solo permite una única expresión. `static { ... }` es un bloque completo — con condicionales, bucles, lo que haga falta — para calcular el valor de uno o varios campos static con lógica más compleja.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita más que una sola expresión para inicializar",
  "roles": [
    { "etiqueta": "Quien necesita lógica de varios pasos", "rol": "static { ... }", "descripcion": "Un bloque completo de sentencias, no solo una expresión, para calcular el valor de campos static." },
    { "etiqueta": "Quien pregunta cuándo corre", "rol": "Al evaluar la clase, no al crear instancias", "descripcion": "Se ejecuta una única vez, en el momento en que el motor procesa la declaración de la clase — antes de cualquier new." },
    { "etiqueta": "Quien encadena varios bloques", "rol": "En orden de declaración", "descripcion": "Una clase puede tener más de un bloque static — se ejecutan de arriba a abajo, en el orden en que aparecen." }
  ]
}
```

## Lógica de varios pasos para un campo static

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Configuracion {\n    static entorno = 'produccion';\n    static urlBase;\n\n    static {\n      if (this.entorno === 'produccion') {\n        this.urlBase = 'https://api.ejemplo.com';\n      } else {\n        this.urlBase = 'http://localhost:3000';\n      }\n    }\n  }\n\n  console.log(Configuracion.urlBase); // 'https://api.ejemplo.com'\n</script>",
  "anotaciones": [
    { "fragmento": "static {\n      if (this.entorno === 'produccion') {\n        this.urlBase = 'https://api.ejemplo.com';\n      } else {\n        this.urlBase = 'http://localhost:3000';\n      }\n    }", "nota": "static { ... } permite lógica de VARIAS sentencias (aquí, un if/else) para calcular el valor de un campo — algo que static urlBase = valor; no puede expresar por sí solo, al aceptar solo una única expresión." }
  ]
}
```

## Cuándo se ejecuta: al evaluar la clase, no al crear instancias

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class MiClase {\n    static {\n      console.log('Bloque de inicialización estática');\n    }\n    constructor() {\n      console.log('Constructor');\n    }\n  }\n\n  // 'Bloque de inicialización estática' ya se imprimió al llegar aquí\n\n  new MiClase();\n  // 'Constructor'\n</script>",
  "anotaciones": [
    { "fragmento": "// 'Bloque de inicialización estática' ya se imprimió al llegar aquí", "nota": "El bloque static se ejecuta en cuanto el motor EVALÚA la declaración de la clase — antes de que exista ninguna instancia, sin necesitar ningún new." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Solo los campos declarados ANTES están disponibles",
  "contenido": "Dentro de un bloque static, solo son accesibles los campos static declarados ANTES de ese bloque en el cuerpo de la clase — uno declarado DESPUÉS es inaccesible desde dentro, aunque técnicamente exista en la clase una vez completa."
}
```

## Varios bloques static, en orden de declaración

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class Registro {\n    static mensajes = [];\n\n    static {\n      Registro.mensajes.push('primero');\n    }\n\n    static {\n      Registro.mensajes.push('segundo');\n    }\n  }\n\n  console.log(Registro.mensajes); // ['primero', 'segundo']\n</script>",
  "anotaciones": [
    { "fragmento": "class Registro {\n    static mensajes = [];\n\n    static {\n      Registro.mensajes.push('primero');\n    }\n\n    static {\n      Registro.mensajes.push('segundo');\n    }\n  }", "nota": "Una clase puede tener VARIOS bloques static — se evalúan en el orden en que aparecen en el cuerpo de la clase, de arriba a abajo, sin excepción." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const eventos = [];\n\n  class Servicio {\n    static {\n      eventos.push('clase evaluada');\n    }\n    constructor() {\n      eventos.push('instancia creada');\n    }\n  }\n\n  eventos.push('antes de new');\n  new Servicio();\n  eventos.push('después de new');\n\n  console.log(eventos);\n</script>",
  "opciones": [
    "['clase evaluada', 'antes de new', 'instancia creada', 'después de new'] — el bloque static corre al EVALUAR la clase, antes incluso de que el código siguiente empiece a ejecutarse",
    "['antes de new', 'clase evaluada', 'instancia creada', 'después de new'] — el bloque static corre justo antes de la primera instancia, no al declarar la clase",
    "['antes de new', 'instancia creada', 'después de new'] — el bloque static y el constructor son la misma cosa"
  ],
  "correcta": 0,
  "explicacion": "El bloque static se ejecuta en el momento en que el motor EVALÚA la declaración de la clase Servicio — mucho antes de llegar a eventos.push('antes de new'). El orden real es: 'clase evaluada' (al declarar la clase), 'antes de new', 'instancia creada' (dentro del constructor, al llamar a new), 'después de new'."
}
```

## Lo que un bloque static NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un bloque static se ejecuta cada vez que se crea una instancia con new",
      "realidad": "Se ejecuta UNA sola vez, al evaluar la clase — nunca en cada new."
    },
    {
      "mito": "Todos los campos static de la clase están disponibles dentro de cualquier bloque static",
      "realidad": "Solo los declarados ANTES de ese bloque en el cuerpo de la clase."
    },
    {
      "mito": "Una clase solo puede tener un bloque static",
      "realidad": "Puede tener varios, evaluados en el orden exacto en que se declaran."
    },
    {
      "mito": "static { ... } es equivalente a poner esa misma lógica dentro del constructor",
      "realidad": "Corre al evaluar la CLASE, no al crear cada instancia — son momentos completamente distintos en el tiempo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que un bloque static se ejecute en cada new, en vez de una sola vez.", "texto": "Corre al evaluar la clase, independientemente de cuántas instancias se creen después." },
    { "titulo": "Intentar usar dentro de un bloque un campo static declarado DESPUÉS de él.", "texto": "Solo los campos declarados antes están disponibles en ese punto." },
    { "titulo": "No aprovechar static {} para lógica de inicialización que necesita más de una sentencia.", "texto": "Un campo static = valor; solo admite una única expresión." },
    { "titulo": "Confundir el momento de ejecución de un bloque static con el del constructor.", "texto": "Son dos momentos distintos: evaluación de la clase frente a creación de cada instancia." }
  ]
}
```

## Ejercicios

1. Crea una clase con un campo `static` inicializado mediante lógica condicional dentro de un bloque `static {}`.
2. Demuestra con `console.log` que el bloque `static` se ejecuta antes de crear cualquier instancia con `new`.
3. Declara dos bloques `static` en la misma clase, y comprueba el orden exacto en que se ejecutan.
4. Explica por qué un campo `static` declarado después de un bloque no está disponible dentro de él.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea una clase con un campo static inicializado dentro de un bloque static {} con lógica condicional (ejercicio 1). Demuestra con mostrar() que se ejecuta antes de crear cualquier instancia (ejercicio 2).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nclass Config {\n  static modo;\n  static {\n    mostrar('Ejecutando el bloque static, antes de cualquier instancia');\n    Config.modo = new Date().getFullYear() >= 2026 ? 'moderno' : 'clasico';\n  }\n}\nmostrar('Modo: ' + Config.modo);\nnew Config();",
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
      "titulo": "Static initialization blocks",
      "descripcion": "Capítulo de web.dev sobre la sintaxis static {}, el momento exacto de su ejecución, la regla de disponibilidad por orden de declaración, y los bloques static múltiples.",
      "url": "https://web.dev/learn/javascript/classes/static-initialization-blocks",
      "etiqueta": "web.dev"
    }
  ]
}
```
