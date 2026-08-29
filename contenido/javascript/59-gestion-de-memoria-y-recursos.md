# Gestión de memoria y recursos

- **Módulo:** JavaScript moderno
- **Slug:** `gestion-de-memoria-y-recursos` (autogenerado del título)
- **Orden:** 176
- **Fuentes:** [Memory management (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management) + [Resource management (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management) — ver `contenido/javascript/TEMARIO.md` #59

---

## Qué es y para qué sirve

Cierra el módulo de JavaScript moderno. La memoria se libera sola, automáticamente — pero no todo lo que hay que "cerrar" es memoria: un stream bloqueado o un archivo abierto no los toca el recolector de basura. `using` es la incorporación reciente que también resuelve eso.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita liberar algo, tarde o temprano",
  "roles": [
    { "etiqueta": "Quien libera memoria sola", "rol": "El recolector de basura", "descripcion": "Libera automáticamente todo lo que deja de ser ALCANZABLE desde el resto del programa." },
    { "etiqueta": "Quien mantiene una referencia débil", "rol": "WeakMap", "descripcion": "No impide que sus claves se liberen, a diferencia de un Map normal." },
    { "etiqueta": "Quien libera recursos que no son memoria", "rol": "using + Symbol.dispose", "descripcion": "Streams, archivos, conexiones — liberados automáticamente al salir de un bloque, incluso si hay un error." }
  ]
}
```

## Memoria reservada automáticamente

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numero = 123;              // memoria reservada para un número\n  const objeto = { a: 1, b: null }; // memoria reservada para el objeto y su contenido\n\n  const elemento = document.createElement('div'); // también reserva memoria\n\n  const cadena = 'hola';\n  const trozo = cadena.substring(0, 2); // un string NUEVO — más memoria reservada\n</script>",
  "anotaciones": [
    { "fragmento": "const trozo = cadena.substring(0, 2); // un string NUEVO — más memoria reservada", "nota": "JavaScript reserva memoria automáticamente al crear cualquier valor — un número, un objeto, un elemento del DOM. Incluso un método aparentemente simple como substring() crea un string nuevo, con su propia memoria." }
  ]
}
```

## Alcanzabilidad: lo que decide qué se libera

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let x = { a: { b: 2 } }; // dos objetos: uno guardado en x, otro en x.a\n\n  let y = x; // y también referencia al mismo objeto que x\n\n  x = 1; // el objeto original ya no es accesible desde x... pero SIGUE siéndolo desde y\n\n  y = 'otra cosa'; // ahora SÍ — nada en el programa puede alcanzar ya ese objeto\n  // A partir de aquí, el recolector de basura puede liberarlo\n</script>",
  "anotaciones": [
    { "fragmento": "y = 'otra cosa'; // ahora SÍ — nada en el programa puede alcanzar ya ese objeto\n  // A partir de aquí, el recolector de basura puede liberarlo", "nota": "El motor marca como VIVO todo lo que sea ALCANZABLE desde el objeto global, recorriendo referencias — cuando algo deja de ser alcanzable desde cualquier punto del programa, se convierte en candidato a liberarse." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Referencias circulares, y sin control manual",
  "contenido": "El algoritmo antiguo (conteo de referencias) fallaba con referencias CIRCULARES: dos objetos que se referencian mutuamente nunca llegaban a cero referencias, aunque fueran inalcanzables desde el resto del programa. El algoritmo moderno (mark-and-sweep) resuelve esto — lo que importa es la alcanzabilidad real desde la raíz. Tampoco existe ninguna forma de forzar la recolección de basura manualmente desde código normal."
}
```

## WeakMap: una referencia que no mantiene nada vivo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let clave = { id: 1 };\n  const cache = new WeakMap();\n  cache.set(clave, 'algún valor asociado');\n\n  clave = null; // ya no hay ninguna referencia NORMAL a ese objeto\n  // El objeto SÍ puede liberarse — WeakMap no cuenta como una referencia que lo mantenga vivo\n</script>",
  "anotaciones": [
    { "fragmento": "clave = null; // ya no hay ninguna referencia NORMAL a ese objeto\n  // El objeto SÍ puede liberarse — WeakMap no cuenta como una referencia que lo mantenga vivo", "nota": "A diferencia de un Map normal (visto en el módulo de colecciones), un WeakMap mantiene una referencia DÉBIL a sus claves — no evita que se liberen si ya no hay ninguna otra referencia real hacia ellas." }
  ]
}
```

## El problema que la memoria no resuelve

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function leerHasta(stream, texto) {\n    const lector = stream.getReader();\n    let trozo = await lector.read();\n\n    while (!trozo.done && trozo.value !== texto) {\n      console.log(trozo);\n      trozo = await lector.read();\n    }\n    // olvidado: lector.releaseLock()\n  }\n\n  leerHasta(miStream, 'b').then(() => {\n    const otroLector = miStream.getReader();\n    // TypeError — el stream sigue \"bloqueado\" por el lector anterior\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "// TypeError — el stream sigue \"bloqueado\" por el lector anterior", "nota": "La recolección de basura NO cubre este tipo de recursos — un stream bloqueado, un archivo abierto, una conexión sin cerrar siguen 'vivos' desde el punto de vista del programa, aunque ya nadie los use realmente." }
  ]
}
```

## using: liberación automática garantizada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class MiLector {\n    [Symbol.dispose]() {\n      this.releaseLock();\n    }\n    releaseLock() {\n      // libera el recurso real\n    }\n  }\n\n  {\n    using lector1 = stream1.getReader();\n    using lector2 = stream2.getReader();\n\n    // usar lector1 y lector2 con normalidad\n\n    // al salir de este bloque, AMBOS se liberan automáticamente\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "[Symbol.dispose]() {\n      this.releaseLock();\n    }", "nota": "Un objeto es 'disposable' si implementa [Symbol.dispose]() — ese método es lo que using ejecuta automáticamente al salir del bloque." },
    { "fragmento": "using lector1 = stream1.getReader();\n    using lector2 = stream2.getReader();", "nota": "using declara una variable que se libera SOLA al salir del bloque — sin necesitar un try/finally escrito a mano para acordarse de llamar a releaseLock()." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Orden inverso, y funciona incluso con un error",
  "contenido": "Los recursos declarados con using se liberan en orden INVERSO al de declaración (el último en entrar, el primero en salir) — y esto ocurre pase lo que pase: al terminar el bloque con normalidad, al hacer return, o incluso si se lanza un error dentro. No hace falta un try/finally explícito para garantizarlo."
}
```

## await using: para limpieza asíncrona

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  async function guardarArchivo() {\n    await using archivo = abrirArchivo('datos.txt', 'w');\n    await archivo.escribir('Hola');\n\n    // archivo.close() se llama y se espera automáticamente al salir del bloque\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "await using archivo = abrirArchivo('datos.txt', 'w');", "nota": "await using es la versión para recursos cuya limpieza es asíncrona — implementan [Symbol.asyncDispose]() en vez de [Symbol.dispose](), y liberar el recurso se espera con await automáticamente." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class Recurso {\n    [Symbol.dispose]() {\n      console.log('Recurso liberado');\n    }\n  }\n\n  function usar() {\n    using recurso = new Recurso();\n    throw new Error('algo falló');\n  }\n\n  try {\n    usar();\n  } catch (error) {\n    console.log('Error capturado:', error.message);\n  }\n</script>",
  "opciones": [
    "'Recurso liberado' y luego 'Error capturado: algo falló' — using libera el recurso INCLUSO cuando el bloque termina por un error, antes de que ese error se propague",
    "'Error capturado: algo falló', sin ningún 'Recurso liberado' — un error dentro del bloque impide que using llegue a liberar el recurso",
    "Solo 'Recurso liberado' — el error queda silenciado por using, sin llegar nunca al catch"
  ],
  "correcta": 0,
  "explicacion": "using garantiza la liberación del recurso SIN IMPORTAR cómo se salga del bloque — incluido un throw. [Symbol.dispose]() se ejecuta primero ('Recurso liberado'), y DESPUÉS el error sigue propagándose con normalidad hasta el catch ('Error capturado: algo falló')."
}
```

## Lo que la gestión de memoria y recursos NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El recolector de basura de JavaScript libera cualquier tipo de recurso, incluidos archivos y conexiones de red",
      "realidad": "Solo gestiona MEMORIA — recursos como streams, archivos o conexiones necesitan liberarse explícitamente."
    },
    {
      "mito": "Dos objetos que se referencian mutuamente nunca pueden liberarse, por las referencias circulares",
      "realidad": "Eso era una limitación del algoritmo antiguo (conteo de referencias) — el moderno (mark-and-sweep) los libera si son inalcanzables desde la raíz."
    },
    {
      "mito": "Un WeakMap evita que sus claves se liberen, igual que un Map normal",
      "realidad": "Mantiene una referencia DÉBIL — no impide que sus claves se liberen si no hay ninguna otra referencia real."
    },
    {
      "mito": "Si el código dentro de un bloque using lanza un error, el recurso queda sin liberar",
      "realidad": "using garantiza la liberación sin importar cómo se salga del bloque, incluido un error."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confiar en el recolector de basura para liberar recursos que no son memoria.", "texto": "Streams, archivos o conexiones necesitan liberación explícita, con using o a mano." },
    { "titulo": "Olvidar llamar manualmente a un método de liberación sin usar using.", "texto": "El gotcha clásico que using existe precisamente para evitar." },
    { "titulo": "Pensar que las referencias circulares siempre causan una fuga de memoria en JavaScript moderno.", "texto": "El algoritmo mark-and-sweep las libera igualmente si son inalcanzables." },
    { "titulo": "Usar using (sin await) para un recurso cuya limpieza es asíncrona.", "texto": "Hace falta await using con [Symbol.asyncDispose]() para ese caso." }
  ]
}
```

## Ejercicios

1. Explica con tus propias palabras cómo el algoritmo mark-and-sweep decide si un objeto se libera.
2. Usa un `WeakMap` para asociar datos a un objeto sin impedir que ese objeto se libere.
3. Crea una clase con `[Symbol.dispose]()`, y libérala automáticamente con una declaración `using`.
4. Demuestra que `using` libera un recurso incluso cuando el código dentro del bloque lanza un error.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Usa un WeakMap para asociar datos a un objeto sin impedir que se libere (ejercicio 2). Crea una clase con [Symbol.dispose]() y libérala automáticamente con using (ejercicio 3) — using es una función muy reciente: si tu navegador todavía no la soporta, verás un error de sintaxis, que es información real sobre el soporte actual.",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst metadatos = new WeakMap();\nlet elemento = {};\nmetadatos.set(elemento, { creado: Date.now() });\nmostrar(metadatos.get(elemento));\n\nclass Recurso {\n  constructor(nombre) { this.nombre = nombre; mostrar('Abriendo ' + nombre); }\n  [Symbol.dispose]() { mostrar('Cerrando ' + this.nombre); }\n}\n\ntry {\n  eval('{ using recurso = new Recurso(\"archivo.txt\"); mostrar(\"Usando \" + recurso.nombre); }');\n} catch (error) {\n  mostrar('using no soportado todavía en este navegador: ' + error.message);\n}",
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
      "titulo": "Memory management",
      "descripcion": "Guía de MDN sobre la asignación automática de memoria, el algoritmo mark-and-sweep, la alcanzabilidad, referencias circulares, y WeakMap/WeakSet.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Resource management",
      "descripcion": "Guía de MDN sobre using, [Symbol.dispose](), await using con [Symbol.asyncDispose](), y el orden de liberación garantizado incluso ante errores.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management",
      "etiqueta": "MDN"
    }
  ]
}
```
