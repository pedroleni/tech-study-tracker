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
  "contenido": "npm install --save-dev typescript añade el compilador al proyecto (hoy instala TypeScript 7, más abajo). npx tsc --init genera un tsconfig.json de partida: unas cuantas opciones recomendadas ya activadas y otras comentadas, para activarlas si las necesitas — no hace falta escribirlo desde cero. La lección 51 lo repasa entero."
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
    { "fragmento": "\"strict\": true,", "nota": "Activa de golpe el conjunto completo de comprobaciones estrictas (noImplicitAny, strictNullChecks y varias más). Desde TypeScript 6.0 ya es el valor por defecto, aunque no lo escribas; se suele escribir igualmente para que se vea. Se explica con detalle en la lección 51." },
    { "fragmento": "\"outDir\": \"./dist\",", "nota": "Dónde escribe el compilador el JavaScript ya generado." },
    { "fragmento": "\"rootDir\": \"./src\"", "nota": "Dónde están los ficheros .ts de partida — mantiene la misma estructura de carpetas dentro de outDir. Con outDir y el código en src, no es opcional: sin rootDir, TypeScript 6 y 7 se niegan a compilar con el error TS5011 (The common source directory of 'tsconfig.json' is './src'. The 'rootDir' setting must be explicitly set...)." },
    { "fragmento": "\"include\": [\"src\"]", "nota": "Qué carpetas forman parte del proyecto de TypeScript. Sin esto, tsc compila todos los .ts de la carpeta y de sus subcarpetas: scripts sueltos, pruebas, ejemplos... Solo se salta node_modules y la carpeta de outDir, que se excluyen por defecto. Y con rootDir: ./src, un .ts que esté fuera de src da el error TS6059 (... is not under 'rootDir')." }
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

## TypeScript 7: el mismo tsc, mucho más rápido

En julio de 2026 salió TypeScript 7.0: el mismo compilador, reescrito en Go para que sea mucho más rápido. Mientras se probaba, se instalaba con otro paquete (`@typescript/native-preview`) y su comando se llamaba `tsgo`; ese era solo el nombre de la versión preliminar. En la versión publicada, el paquete vuelve a ser `typescript` y el comando, `tsc`.

- **Ya es lo que instalas.** `npm install --save-dev typescript` instala hoy la 7 (la 7.0.2 a 27 de octubre de 2026), y la plantilla `react-ts` de `create-vite` 9.3.3 trae `"typescript": "~7.0.2"`.
- **La velocidad.** El [anuncio oficial](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) habla de compilaciones completas entre 8 y 12 veces más rápidas («speedups between 8x and 12x on full builds»). Lo que se acelera es **compilar**: el JavaScript que genera es el mismo, y tu código no se ejecuta más deprisa.
- **Qué cambia si empiezas.** Casi nada. Los comandos de esta lección (`npx tsc`, `--noEmit`, `--watch`, `--init`) funcionan igual, y los errores son prácticamente los mismos (lo que más se nota: a veces escribe los miembros de una unión en otro orden). Lo único que rompe son las opciones antiguas que la 7 elimina, como `target: "ES5"`, `baseUrl` o `moduleResolution: "node"`: se cuentan en la lección 51.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué el editor en vivo de este curso usa TypeScript 6.0.3",
  "contenido": "La 7 es un programa nativo, compilado para cada sistema operativo, y de momento no se puede ejecutar dentro de un navegador: su paquete no trae la API de JavaScript que usan los editores web, y la que trae en pruebas arranca el programa nativo como un proceso aparte. Hasta el Playground oficial de typescriptlang.org sigue en la 6.0.3. Por eso los editores de esta web usan la 6.0.3, la última versión anterior, que para lo que se enseña aquí da prácticamente los mismos errores que la 7 en tu ordenador."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar \"include\" y dejar que tsc compile carpetas que no son del proyecto.", "texto": "node_modules se excluye solo, pero cualquier otra carpeta con ficheros .ts (pruebas, borradores, ejemplos copiados) entra en la compilación: sus errores salen como si fueran del proyecto, y con rootDir: ./src, tsc se niega a compilar (TS6059). include: [\"src\"] lo acota a lo que de verdad es tuyo." },
    { "titulo": "Confundir tsc (compila) con tsc --noEmit (solo comprueba).", "texto": "En un proyecto que usa Vite u otro bundler para generar el JavaScript real, tsc --noEmit es normalmente el comando correcto — el propio bundler ya se encarga de emitir los ficheros." }
  ]
}
```

## Ejercicios

1. Explica qué hace `npx tsc --init` y qué fichero genera.
2. ¿Cuál es la diferencia entre ejecutar `tsc` a secas y ejecutar `tsc --noEmit`?
3. Si `node_modules` ya se excluye por defecto, ¿por qué sigue importando `include`?
4. ¿Qué comando instala TypeScript 7 en un proyecto, y con qué comando lo ejecutas después?

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
