# El motor V8: cómo Node ejecuta JavaScript fuera del navegador

- **Módulo:** Qué es Node.js y por qué existe
- **Slug:** `el-motor-v8` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [The V8 JavaScript Engine](https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine) — ver `contenido/nodejs/TEMARIO.md` #2

---

## Qué es y para qué sirve

V8 es el motor de JavaScript de Google, el mismo que ejecuta las pestañas de Chrome — Node.js lo toma tal cual y le añade, por fuera, todo lo que hace falta para ser un entorno de ejecución completo (acceso a ficheros, red, procesos). Entender esta pieza explica por qué Node.js soporta sintaxis moderna de JavaScript casi al mismo ritmo que Chrome, y no como una implementación aparte y más lenta.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "V8 solo entiende JavaScript, no Node.js",
  "contenido": "V8, por sí solo, no sabe qué es fs ni http — esas APIs las añade Node.js POR ENCIMA de V8, escritas en C++ y expuestas a JavaScript. V8 se encarga únicamente de interpretar y ejecutar el lenguaje en sí (compilar a código máquina, gestionar memoria, el recolector de basura)."
}
```

## Por qué esto importa en la práctica

```laboratorio
{
  "tipo": "roles",
  "titulo": "Consecuencias reales de compartir motor con Chrome",
  "roles": [
    { "etiqueta": "Sintaxis moderna", "rol": "Node.js soporta ES2020+ sin transpilar", "descripcion": "Optional chaining, nullish coalescing, top-level await... llegan a Node.js casi a la vez que a Chrome, porque es literalmente el mismo motor evaluando la sintaxis." },
    { "etiqueta": "Rendimiento", "rol": "Compilación JIT (just-in-time)", "descripcion": "V8 compila JavaScript a código máquina en tiempo de ejecución, optimizando las partes que se ejecutan más — el mismo motor que hace rápida una pestaña de Chrome hace rápido un servidor de Node.js." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que Node.js tiene su propio intérprete de JavaScript distinto del navegador.", "texto": "Usa V8 directamente — las diferencias entre Node.js y el navegador (módulo 3) están en las APIS de alrededor, no en cómo se interpreta el lenguaje." },
    { "titulo": "Confundir la versión de Node.js con la versión de V8.", "texto": "Cada versión de Node.js incluye una versión concreta de V8 — comprobar qué sintaxis soporta una versión de Node.js pasa por mirar las notas de esa versión, no adivinarlo." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras qué hace V8 y qué NO hace (qué añade Node.js por encima).
2. ¿Por qué Node.js puede soportar sintaxis de JavaScript muy reciente casi al mismo tiempo que Chrome?
3. Ejecuta `node --version` en tu terminal y busca en las notas de esa versión de Node.js qué versión de V8 incluye.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The V8 JavaScript Engine",
      "descripcion": "Explicación oficial de qué es V8 y su relación con Node.js.",
      "url": "https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine",
      "etiqueta": "Node.js"
    }
  ]
}
```
