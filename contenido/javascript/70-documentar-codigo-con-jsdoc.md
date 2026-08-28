# Documentar código con JSDoc

- **Módulo:** Calidad y organización
- **Slug:** `documentar-codigo-con-jsdoc` (autogenerado del título)
- **Orden:** 209
- **Fuentes:** [Use JSDoc: Getting Started with JSDoc 3 (proyecto JSDoc)](https://jsdoc.app/about-getting-started) + [@returns (proyecto JSDoc)](https://jsdoc.app/tags-returns) + [@param (proyecto JSDoc)](https://jsdoc.app/tags-param) — ver `contenido/javascript/TEMARIO.md` #70

---

## Qué es y para qué sirve

JSDoc documenta código con comentarios de un formato concreto — no cualquier comentario vale. Bien escritos, se pueden convertir automáticamente en un sitio web de documentación navegable, y muchos editores los usan para mostrar ayuda contextual al escribir código.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita documentar una función",
  "roles": [
    { "etiqueta": "Quien documenta parámetros", "rol": "@param {tipo} nombre", "descripcion": "Uno por cada parámetro, con su tipo entre llaves y una descripción." },
    { "etiqueta": "Quien documenta el resultado", "rol": "@returns {tipo}", "descripcion": "Lo que la función devuelve, con el mismo formato de tipo que @param." },
    { "etiqueta": "Quien marca algo como opcional", "rol": "[nombre] / [nombre=valor]", "descripcion": "Corchetes para un parámetro opcional, con un valor por defecto opcional dentro." }
  ]
}
```

## El formato exacto: /** con dos asteriscos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  /**\n   * Representa un libro.\n   * @param {string} titulo - El título del libro.\n   * @param {string} autor - El autor del libro.\n   */\n  function Libro(titulo, autor) {\n    this.titulo = titulo;\n    this.autor = autor;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "* Representa un libro.", "nota": "La línea inicial (sin ninguna etiqueta @) es la DESCRIPCIÓN general — un resumen de qué hace la función." },
    { "fragmento": "* @param {string} titulo - El título del libro.", "nota": "@param {tipo} nombre - descripción documenta cada parámetro por separado, con su tipo entre llaves." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Solo /** (exactamente dos asteriscos) cuenta",
  "contenido": "Un comentario que empieza EXACTAMENTE con /** es reconocido por JSDoc — uno normal (/*) o con más asteriscos (/***) se ignora por completo, aunque tenga el mismo contenido dentro."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Debe ir inmediatamente antes del código",
  "contenido": "El comentario debe colocarse INMEDIATAMENTE antes de lo que documenta — una línea en blanco (o cualquier otra cosa) de por medio, y JSDoc deja de asociarlo con esa función."
}
```

## @returns: documentar lo que se devuelve

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  /**\n   * Devuelve la suma de a y b.\n   * @param {number} a\n   * @param {number} b\n   * @returns {number} La suma de ambos valores.\n   */\n  function sumar(a, b) {\n    return a + b;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "* @returns {number} La suma de ambos valores.", "nota": "@returns {tipo} descripción documenta lo que la función DEVUELVE — el tipo entre llaves, igual que en @param, y una descripción opcional después." }
  ]
}
```

## Parámetros opcionales: corchetes, y un valor por defecto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  /**\n   * Saluda a alguien por su nombre.\n   * @param {string} [nombre=Desconocido] - El nombre de la persona.\n   */\n  function saludar(nombre) {\n    if (!nombre) {\n      nombre = 'Desconocido';\n    }\n    console.log(`Hola, ${nombre}`);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "@param {string} [nombre=Desconocido] - El nombre de la persona.", "nota": "Los corchetes alrededor de [nombre] indican que el parámetro es OPCIONAL — =Desconocido dentro de esos mismos corchetes documenta el valor por defecto que se usará si no se pasa ningún argumento." }
  ]
}
```

## @constructor: marcar una función pensada para new

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  /**\n   * Representa un libro.\n   * @constructor\n   * @param {string} titulo - El título del libro.\n   */\n  function Libro(titulo) {\n    this.titulo = titulo;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "* @constructor", "nota": "@constructor marca explícitamente la función como pensada para usarse con new (visto en el módulo de funciones) — ayuda a las herramientas de documentación a distinguirla de una función normal." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Generar el sitio de documentación",
  "contenido": "Con JSDoc instalado, ejecutar jsdoc archivo.js genera una carpeta out/ con un sitio web HTML navegable — toda la documentación escrita en los comentarios, convertida automáticamente en páginas legibles."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  /*\n   * @param {string} nombre - No se reconoce, solo un asterisco de apertura\n   */\n  function saludar1(nombre) {}\n\n  /**\n   * @param {string} nombre - Sí se reconoce, exactamente dos asteriscos\n   */\n  function saludar2(nombre) {}\n</script>",
  "opciones": [
    "Solo saludar2 queda documentada por JSDoc — su comentario empieza con exactamente /**, mientras que el de saludar1 (/*) se ignora por completo",
    "Ambas quedan documentadas igual — JSDoc reconoce cualquier comentario de bloque",
    "Ninguna de las dos, porque falta la etiqueta @description en ambos casos"
  ],
  "correcta": 0,
  "explicacion": "JSDoc solo reconoce comentarios que empiezan EXACTAMENTE con /** (dos asteriscos) — un comentario de bloque normal (/*) se ignora por completo, aunque tenga las mismas etiquetas @ dentro. Solo saludar2 queda documentada."
}
```

## Lo que JSDoc NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Cualquier comentario de bloque (/* ... */) es reconocido por JSDoc",
      "realidad": "Solo los que empiezan EXACTAMENTE con /** (dos asteriscos)."
    },
    {
      "mito": "El comentario de JSDoc se puede colocar en cualquier parte del archivo, no solo justo antes del código",
      "realidad": "Debe ir INMEDIATAMENTE antes de lo que documenta."
    },
    {
      "mito": "Los corchetes en @param {tipo} [nombre] son solo una cuestión de estilo, sin significado real",
      "realidad": "Indican que el parámetro es OPCIONAL — con un valor por defecto opcional dentro, como [nombre=valor]."
    },
    {
      "mito": "@returns solo se puede usar sin especificar el tipo del valor devuelto",
      "realidad": "Admite {tipo} entre llaves, igual que @param, aunque sea opcional."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir un comentario de documentación con un solo asterisco de apertura.", "texto": "JSDoc solo reconoce exactamente /**, con dos asteriscos." },
    { "titulo": "Separar el comentario JSDoc del código que documenta.", "texto": "Debe ir inmediatamente antes, sin nada de por medio." },
    { "titulo": "No usar corchetes para marcar un parámetro como opcional.", "texto": "Deja ambigüedad sobre si el parámetro es obligatorio o no." },
    { "titulo": "Omitir @returns en funciones que sí devuelven un valor relevante.", "texto": "Deja incompleta la documentación de lo que se puede esperar de la función." }
  ]
}
```

## Ejercicios

1. Documenta una función con un comentario JSDoc: descripción general y al menos un `@param` con su tipo.
2. Añade `@returns` con el tipo del valor devuelto por esa misma función.
3. Documenta un parámetro opcional usando corchetes, incluido un valor por defecto.
4. Marca una función constructora con `@constructor`, y explica para qué sirve esa etiqueta.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Use JSDoc: Getting Started with JSDoc 3",
      "descripcion": "Guía oficial del proyecto JSDoc sobre el formato /**, la regla de colocación inmediata, @param y @constructor.",
      "url": "https://jsdoc.app/about-getting-started",
      "etiqueta": "JSDoc"
    },
    {
      "titulo": "@returns",
      "descripcion": "Referencia oficial de JSDoc sobre la etiqueta @returns y su sintaxis de tipo entre llaves.",
      "url": "https://jsdoc.app/tags-returns",
      "etiqueta": "JSDoc"
    },
    {
      "titulo": "@param",
      "descripcion": "Referencia oficial de JSDoc sobre la sintaxis de parámetros opcionales con corchetes, incluido el valor por defecto.",
      "url": "https://jsdoc.app/tags-param",
      "etiqueta": "JSDoc"
    }
  ]
}
```
