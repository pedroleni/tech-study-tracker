# Instalación y tu primer tsconfig.json

- **Módulo:** Por qué TypeScript y primeros pasos
- **Slug:** `instalacion-y-tsconfig` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [TypeScript Tooling in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html) + [What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) — ver `contenido/typescript/TEMARIO.md` #2

---

## Qué es y para qué sirve

TypeScript no es algo que el navegador entienda de forma nativa — hace falta un **compilador** que convierta los ficheros `.ts` en `.js` antes de ejecutarlos. Ese compilador se llama `tsc`, se instala como cualquier paquete de npm, y se configura con un fichero `tsconfig.json` que decide, entre otras cosas, qué carpeta compilar, a qué versión de JavaScript apuntar, y qué comprobaciones activar.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Instalación mínima",
  "contenido": "npm install --save-dev typescript añade el compilador al proyecto. npx tsc --init genera un tsconfig.json de partida con las opciones más comunes ya comentadas — no hace falta escribirlo desde cero."
}
```

## Un tsconfig.json real, explicado línea a línea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"module\": \"ESNext\",\n    \"strict\": true,\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\"\n  },\n  \"include\": [\"src\"]\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"target\": \"ES2020\",", "nota": "A qué versión de JavaScript se traduce el código — decide qué sintaxis moderna (async/await, optional chaining...) se puede usar sin que el compilador la reescriba a una forma más antigua." },
    { "fragmento": "\"module\": \"ESNext\",", "nota": "Qué formato de módulos genera el JavaScript de salida — import/export nativos, en vez de require de CommonJS." },
    { "fragmento": "\"strict\": true,", "nota": "Activa de golpe el conjunto completo de comprobaciones estrictas (noImplicitAny, strictNullChecks y varias más). Se explica con detalle en el módulo de configuración — la recomendación oficial es activarlo siempre en un proyecto nuevo." },
    { "fragmento": "\"outDir\": \"./dist\",", "nota": "Dónde escribe el compilador el JavaScript ya generado." },
    { "fragmento": "\"rootDir\": \"./src\"", "nota": "Dónde están los ficheros .ts de partida — mantiene la misma estructura de carpetas dentro de outDir." },
    { "fragmento": "\"include\": [\"src\"]", "nota": "Qué carpetas forman parte del proyecto de TypeScript. Sin esto, tsc compilaría por defecto todo lo que encuentre, incluido node_modules si no hay nada que lo excluya." }
  ]
}
```

## Compilar y comprobar tipos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "npx tsc", "texto": "Compila todo el proyecto según el tsconfig.json de la carpeta actual — genera los .js en outDir." },
    { "titulo": "npx tsc --noEmit", "texto": "Comprueba los tipos SIN generar ningún fichero — el comando que se usa en CI o como npm run typecheck, cuando el build ya lo hace otra herramienta (Vite, esbuild...)." },
    { "titulo": "npx tsc --watch", "texto": "Recompila automáticamente cada vez que se guarda un fichero — útil en desarrollo." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar \"include\" y dejar que tsc compile node_modules.", "texto": "Sin acotar qué carpetas forman parte del proyecto, tsc puede intentar compilar dependencias que no lo necesitan, con errores que no tienen nada que ver con el propio código." },
    { "titulo": "Confundir tsc (compila) con tsc --noEmit (solo comprueba).", "texto": "En un proyecto que usa Vite u otro bundler para generar el JavaScript real, tsc --noEmit es normalmente el comando correcto — el propio bundler ya se encarga de emitir los ficheros." }
  ]
}
```

## Ejercicios

1. Explica qué hace `npx tsc --init` y qué fichero genera.
2. ¿Cuál es la diferencia entre ejecutar `tsc` a secas y ejecutar `tsc --noEmit`?
3. ¿Por qué `include` importa en un proyecto con `node_modules`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "TypeScript Tooling in 5 minutes",
      "descripcion": "Guía oficial de instalación y primeros pasos con el compilador.",
      "url": "https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "What is a tsconfig.json",
      "descripcion": "Referencia oficial sobre qué es y para qué sirve el fichero de configuración.",
      "url": "https://www.typescriptlang.org/docs/handbook/tsconfig-json.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
