# Dependencias de desarrollo frente a producción, y npx

- **Módulo:** npm en profundidad
- **Slug:** `dependencias-dev-produccion-npx` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) — ver `contenido/nodejs/TEMARIO.md` #16

---

## Qué es y para qué sirve

No todas las dependencias de un proyecto hacen falta en producción — `vitest` o `eslint` solo se usan mientras se desarrolla, nunca cuando la aplicación ya está corriendo de verdad para usuarios reales. Separarlas en `dependencies` y `devDependencies` permite instalar solo lo estrictamente necesario en un servidor de producción.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n{\n  \"dependencies\": {\n    \"express\": \"^4.18.0\"\n  },\n  \"devDependencies\": {\n    \"vitest\": \"^3.0.0\",\n    \"eslint\": \"^9.0.0\"\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"dependencies\": {\n    \"express\": \"^4.18.0\"\n  },", "nota": "express hace falta para que la aplicación FUNCIONE en producción — sin él, el servidor ni siquiera arranca." },
    { "fragmento": "\"devDependencies\": {\n    \"vitest\": \"^3.0.0\",\n    \"eslint\": \"^9.0.0\"\n  }", "nota": "vitest y eslint solo hacen falta mientras se escribe y se prueba el código — un npm install --omit=dev en producción los salta por completo, dejando la instalación más pequeña y rápida." }
  ]
}
```

## npx: ejecutar sin instalar de forma permanente

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "npx paquete ejecuta sin dejarlo instalado en el proyecto",
  "contenido": "npx create-vite@latest descarga (o usa la copia ya en caché) y ejecuta ese paquete una sola vez, sin añadirlo a package.json ni a node_modules de forma permanente — la forma habitual de usar generadores de proyecto o herramientas puntuales sin ensuciar las dependencias reales del proyecto."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Poner una herramienta de desarrollo (un linter, un test runner) en dependencies en vez de devDependencies.", "texto": "Infla innecesariamente la instalación en producción, con paquetes que nunca se van a usar ahí." },
    { "titulo": "Confundir npx paquete con npm install paquete.", "texto": "npx EJECUTA una vez (sin dejarlo instalado de forma permanente en el proyecto); npm install lo añade a node_modules y a package.json para usarlo repetidamente." }
  ]
}
```

## Ejercicios

1. Clasifica estas herramientas como `dependencies` o `devDependencies`: un framework web, un test runner, una librería de validación de datos, un linter.
2. Explica qué diferencia real hay entre `npm install --omit=dev` y `npm install` a secas.
3. ¿Cuándo tiene sentido usar `npx` en vez de instalar un paquete de forma permanente?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "An introduction to the npm package manager",
      "descripcion": "Guía oficial de npm, dependencias y npx.",
      "url": "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager",
      "etiqueta": "Node.js"
    }
  ]
}
```
