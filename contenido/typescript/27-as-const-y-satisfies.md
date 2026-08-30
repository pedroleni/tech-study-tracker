# as const y satisfies: alternativas a los enums

- **Módulo:** Enums y alternativas
- **Slug:** `as-const-y-satisfies` (autogenerado del título)
- **Orden:** 27
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) + [TypeScript 4.9 — satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) + [Google TypeScript Style Guide — enums](https://google.github.io/styleguide/tsguide.html) — ver `contenido/typescript/TEMARIO.md` #27

---

## Qué es y para qué sirve

Una parte real de la comunidad de TypeScript evita los `enum` para código nuevo, prefiriendo un objeto normal marcado con `as const` — sin las restricciones de compilación de `const enum`, y con una forma más cercana a JavaScript puro. `satisfies`, añadido en TypeScript 4.9, complementa este patrón: valida que un objeto cumple una forma concreta, sin ensanchar su tipo inferido como haría una anotación normal.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un objeto as const como alternativa a un enum",
  "consigna": "Intenta reasignar `Color.Rojo` a otro valor y observa el error — as const hace el objeto profundamente de solo lectura.",
  "ts": "const Color = {\n  Rojo: 'ROJO',\n  Verde: 'VERDE',\n  Azul: 'AZUL',\n} as const;\n\ntype Color = typeof Color[keyof typeof Color]; // 'ROJO' | 'VERDE' | 'AZUL'\n\nfunction pintar(color: Color) {\n  console.log('Pintando de', color);\n}\n\npintar(Color.Rojo);\n",
  "pestañaInicial": "ts"
}
```

## Qué hace exactamente as const

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst sinConst = { rol: 'admin' }; // tipo inferido: { rol: string }\nconst conConst = { rol: 'admin' } as const; // tipo inferido: { readonly rol: 'admin' }\n</script>",
  "anotaciones": [
    { "fragmento": "const sinConst = { rol: 'admin' }; // tipo inferido: { rol: string }", "nota": "Sin as const, TypeScript ensancha el tipo de la propiedad a la categoría general string — porque, en principio, rol podría reasignarse a cualquier string más adelante." },
    { "fragmento": "const conConst = { rol: 'admin' } as const; // tipo inferido: { readonly rol: 'admin' }", "nota": "as const hace dos cosas a la vez: infiere el tipo literal exacto de cada propiedad ('admin', no string), y marca todas las propiedades como readonly, recursivamente en objetos y arrays anidados." }
  ]
}
```

## satisfies: validar sin ensanchar el tipo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Paleta = Record<string, string>;\n\nconst colores = {\n  fondo: '#ffffff',\n  texto: '#000000',\n} satisfies Paleta;\n\n// A diferencia de \": Paleta\", el tipo de colores.fondo sigue siendo\n// el literal '#ffffff', no el string genérico de Paleta\nconst primeraLetra = colores.fondo[0]; // sigue funcionando con precisión\n</script>",
  "anotaciones": [
    { "fragmento": "} satisfies Paleta;", "nota": "satisfies COMPRUEBA que el objeto cumple la forma de Paleta (como lo haría una anotación : Paleta), pero sin cambiar el tipo inferido del propio objeto — colores conserva sus tipos literales exactos en vez de ensancharse al tipo general de Paleta." }
  ]
}
```

## Qué dice el Google TypeScript Style Guide sobre enums

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una discrepancia real, no un error de una fuente",
  "contenido": "El Google TypeScript Style Guide desaconseja usar enum en general, y recomienda en su lugar un objeto con as const (u objetos literales con union types), precisamente por las restricciones de const enum y porque un enum normal introduce un concepto sin equivalente directo en JavaScript. El propio Handbook oficial no hace esa recomendación — sigue presentando enum como una herramienta válida. No hay un consenso único: quien elige as const gana compatibilidad total con cualquier herramienta de compilación, a cambio de una sintaxis algo menos directa que enum."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar as const y esperar que el objeto tenga tipos literales de todas formas.", "texto": "Sin as const, un objeto normal ensancha sus propiedades a los tipos generales (string, number) — perdiendo la precisión que hace útil este patrón como alternativa a un enum." },
    { "titulo": "Usar : Tipo en vez de satisfies cuando se necesita conservar los tipos literales exactos.", "texto": "const x: Tipo = {...} ensancha el tipo de x al de Tipo — satisfies valida la forma sin perder la precisión de los literales originales." }
  ]
}
```

## Ejercicios

1. Reescribe el enum de cadena `EstadoPedido` de la lección 25 como un objeto con `as const`.
2. Explica qué hace `as const` de forma distinta a una anotación de tipo normal.
3. ¿En qué se diferencia `satisfies` de una anotación `: Tipo` normal?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre literales y as const.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "TypeScript 4.9 — el operador satisfies",
      "descripcion": "Anuncio oficial del operador satisfies, con ejemplos de uso.",
      "url": "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Google TypeScript Style Guide — enums",
      "descripcion": "Postura de Google sobre por qué prefieren evitar enum en código nuevo.",
      "url": "https://google.github.io/styleguide/tsguide.html",
      "etiqueta": "Google"
    }
  ]
}
```
