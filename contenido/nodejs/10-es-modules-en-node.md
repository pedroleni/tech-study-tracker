# ES modules en Node: import/export, "type": "module"

- **Módulo:** El sistema de módulos
- **Slug:** `es-modules-en-node` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Packages reference](https://nodejs.org/api/packages.html) — ver `contenido/nodejs/TEMARIO.md` #10

---

## Qué es y para qué sirve

Los ES modules (`import`/`export`) son el sistema de módulos estándar del propio lenguaje JavaScript — el mismo que ya se usa en el navegador. Node.js los soporta de forma nativa, y es la opción recomendada para proyectos nuevos, activándose con `"type": "module"` en `package.json`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// package.json: { \"type\": \"module\" }\n\n// matematicas.js\nexport function sumar(a, b) {\n  return a + b;\n}\n\n// main.js\nimport { sumar } from './matematicas.js';\nconsole.log(sumar(2, 3));\n</script>",
  "anotaciones": [
    { "fragmento": "export function sumar(a, b) {", "nota": "export es sintaxis del propio lenguaje, comprobada por el motor JavaScript en tiempo de análisis — a diferencia de module.exports, que es solo una convención de objetos que CommonJS interpreta." },
    { "fragmento": "import { sumar } from './matematicas.js';", "nota": "A diferencia de require('./matematicas'), en ES modules la extensión .js es OBLIGATORIA en el import — Node.js no la completa automáticamente aquí." }
  ]
}
```

## Ventajas reales frente a CommonJS

```laboratorio
{
  "tipo": "roles",
  "titulo": "Por qué los proyectos nuevos suelen elegir ES modules",
  "roles": [
    { "etiqueta": "Mismo sistema que el navegador", "rol": "Un único mental model", "descripcion": "El mismo import/export que ya se usa en código de frontend — sin cambiar de sintaxis al pasar de un lado a otro." },
    { "etiqueta": "Análisis estático", "rol": "Herramientas más precisas", "descripcion": "Los imports de ES modules se pueden analizar SIN ejecutar el código (a diferencia de require(), que es una llamada de función normal) — esto es lo que permite tree-shaking real en bundlers como Vite." },
    { "etiqueta": "Top-level await", "rol": "await fuera de una función async", "descripcion": "Los ES modules permiten await directamente en el nivel superior del fichero — CommonJS no lo permite, hace falta envolverlo en una función async." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar la extensión .js en un import dentro de Node.js.", "texto": "import { algo } from './modulo' (sin .js) falla en Node.js con ES modules — a diferencia de bundlers como Vite, que sí la completan automáticamente." },
    { "titulo": "Usar import en un fichero .js sin \"type\": \"module\" en el package.json.", "texto": "Node.js lo trata como CommonJS por defecto, y import ahí es un error de sintaxis — hace falta el \"type\": \"module\", o usar la extensión .mjs directamente." }
  ]
}
```

## Ejercicios

1. Crea un proyecto con `"type": "module"` en su `package.json` y dos ficheros que se importen entre sí con `import`/`export`.
2. Explica por qué la extensión `.js` es obligatoria en un `import` dentro de Node.js, a diferencia de Vite.
3. ¿Qué es el top-level `await`, y por qué CommonJS no lo permite?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Packages reference",
      "descripcion": "Referencia oficial sobre el campo \"type\" y los ES modules en Node.js.",
      "url": "https://nodejs.org/api/packages.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
