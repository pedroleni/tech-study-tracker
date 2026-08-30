# Declaration merging

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `declaration-merging` (autogenerado del título)
- **Orden:** 52
- **Fuentes:** [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) — ver `contenido/typescript/TEMARIO.md` #52

---

## Qué es y para qué sirve

La lección 15 ya adelantó que dos `interface` con el mismo nombre se fusionan automáticamente. El declaration merging es ese mecanismo, visto en profundidad — y su aplicación real más frecuente no es en código propio, sino para **ampliar tipos de librerías externas** sin tener que modificar sus ficheros de declaración originales.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// La librería original declara esto (no se puede editar directamente):\ninterface ConfiguracionApp {\n  apiUrl: string;\n}\n\n// En el propio código del proyecto, se AMPLÍA sin tocar el original:\ninterface ConfiguracionApp {\n  modoDebug: boolean;\n}\n\n// TypeScript fusiona ambas: ConfiguracionApp tiene AMBAS propiedades\nconst config: ConfiguracionApp = {\n  apiUrl: 'https://api.ejemplo.com',\n  modoDebug: true,\n};\n</script>",
  "anotaciones": [
    { "fragmento": "interface ConfiguracionApp {\n  modoDebug: boolean;\n}", "nota": "Esta segunda declaración vive en un fichero completamente distinto del proyecto — no hace falta tener acceso ni modificar el fichero original de la librería. TypeScript combina ambas declaraciones en tiempo de compilación, como si siempre hubieran sido una sola." }
  ]
}
```

## Un caso real muy común: ampliar el objeto global Window

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Añadir una propiedad global sin que TypeScript se queje",
  "contenido": "Si un script externo añade window.miVariableGlobal, y el código propio necesita usarla, declarar interface Window { miVariableGlobal: string; } en un fichero .d.ts del proyecto fusiona esa propiedad con la declaración YA EXISTENTE de Window en las librerías estándar de TypeScript — sin ese merge, acceder a window.miVariableGlobal daría un error de propiedad inexistente."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar hacer declaration merging con type en vez de interface.", "texto": "type Config = { a: string }; type Config = { b: string }; da un error de identificador duplicado — el merge automático solo existe para interface, precisamente una de las diferencias reales entre ambas (lección 15)." },
    { "titulo": "Declarar merging pensando que sobrescribe la definición original.", "texto": "El resultado es la UNIÓN de ambas declaraciones, nunca un reemplazo — si las dos declaran la misma propiedad con tipos incompatibles, es un error, no una sobrescritura silenciosa." }
  ]
}
```

## Ejercicios

1. Explica con tus propias palabras qué es el declaration merging y por qué solo funciona con `interface`, no con `type`.
2. Escribe (en prosa, describiendo el código) cómo ampliarías el tipo global `Window` para añadir una propiedad `miApp: { version: string }`.
3. ¿Por qué el declaration merging es especialmente útil al trabajar con librerías externas que no se pueden modificar directamente?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Declaration Merging",
      "descripcion": "Referencia oficial completa sobre declaration merging.",
      "url": "https://www.typescriptlang.org/docs/handbook/declaration-merging.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
