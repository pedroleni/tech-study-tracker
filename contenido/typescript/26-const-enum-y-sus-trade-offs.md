# const enum y sus trade-offs

- **Módulo:** Enums y alternativas
- **Slug:** `const-enum-y-sus-trade-offs` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — ver `contenido/typescript/TEMARIO.md` #26

---

## Qué es y para qué sirve

Un `enum` normal genera un objeto JavaScript real en tiempo de ejecución, con el que se puede iterar o consultar dinámicamente. Un `const enum` es una variante que el compilador **elimina por completo** durante la compilación, sustituyendo cada uso por su valor literal directamente — sin objeto, sin código extra. La ganancia es rendimiento y tamaño de bundle; el coste es perder la capacidad de inspeccionar el enum en tiempo de ejecución.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// enum normal: genera un objeto real\nenum Color {\n  Rojo,\n  Verde,\n  Azul,\n}\n\nconsole.log(Color.Rojo); // 0, y Color existe como objeto real\nconsole.log(Object.keys(Color)); // se puede inspeccionar en tiempo de ejecución\n</script>",
  "despues": "<script>\n// const enum: se elimina en la compilación, sustituido por su valor\nconst enum ColorConst {\n  Rojo,\n  Verde,\n  Azul,\n}\n\nconsole.log(ColorConst.Rojo);\n// El JavaScript generado es literalmente: console.log(0 /* Rojo */);\n// No existe ningún objeto ColorConst en tiempo de ejecución\n</script>",
  "nota": "const enum produce JavaScript más pequeño y rápido porque no crea ningún objeto — cada uso se sustituye directamente por el número o string correspondiente durante la compilación. La contrapartida: Object.keys(ColorConst) o iterar sobre sus valores no es posible, porque el objeto sencillamente no existe una vez compilado."
}
```

## Por qué no siempre es la opción por defecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "const enum tiene restricciones reales de compilación",
  "contenido": "const enum no es compatible con algunas configuraciones de compilación aisladas por archivo (isolatedModules, que usan herramientas como esbuild, SWC o el propio Vite) porque requiere ver el enum completo para sustituir sus valores — con esas herramientas, un enum normal (o las alternativas del módulo siguiente, as const/objetos) suele ser la opción más segura."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar const enum en un proyecto compilado con Vite/esbuild sin comprobar antes si es compatible.", "texto": "Puede fallar o comportarse de forma inesperada bajo isolatedModules — vale la pena comprobarlo antes de adoptarlo en un proyecto real." },
    { "titulo": "Necesitar iterar sobre los valores de un const enum.", "texto": "Como no existe como objeto real, Object.values()/Object.keys() no funcionan sobre él — si hace falta iterar, un enum normal (o un objeto con as const, siguiente lección) es la alternativa correcta." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras qué hace el compilador de forma distinta con `const enum` frente a un `enum` normal.
2. ¿Por qué `const enum` puede dar problemas con herramientas de compilación por archivo aislado como Vite o esbuild?
3. ¿Qué se pierde exactamente al usar `const enum` en vez de un enum normal?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Enums",
      "descripcion": "Referencia oficial, sección sobre const enums.",
      "url": "https://www.typescriptlang.org/docs/handbook/enums.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
