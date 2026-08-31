# Tipos primitivos: string, number, boolean

- **Módulo:** Tipos primitivos y valores
- **Slug:** `tipos-primitivos` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #5

---

## Qué es y para qué sirve

`string`, `number` y `boolean` son los tres tipos primitivos más usados en TypeScript, y corresponden exactamente a los tipos primitivos que JavaScript ya tiene en tiempo de ejecución (`typeof valor` seguiría devolviendo `"string"`, `"number"` o `"boolean"`). TypeScript no inventa tipos nuevos aquí — solo permite declarar por adelantado cuál de los tres espera una variable, un parámetro o un valor de retorno.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Prueba los tres tipos primitivos",
  "consigna": "Cambia el valor de cualquiera de las tres constantes por uno de un tipo distinto (por ejemplo, edad = 'treinta') y observa el panel de diagnósticos.",
  "ts": "const nombre: string = 'Ada Lovelace';\nconst edad: number = 36;\nconst programadora: boolean = true;\n\nconsole.log(nombre, edad, programadora);",
  "pestañaInicial": "ts"
}
```

## number cubre enteros y decimales por igual

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un único tipo number, sin distinguir enteros de decimales",
  "contenido": "A diferencia de otros lenguajes con int y float separados, TypeScript (como JavaScript) tiene un único tipo number para cualquier valor numérico — 42 y 3.14 son ambos number. Para enteros arbitrariamente grandes existe bigint, un tipo aparte con su propia sintaxis (100n)."
}
```

## Lo que estos tipos no son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "string, number y boolean son tipos exclusivos de TypeScript",
      "realidad": "Son los mismos tipos primitivos que ya existen en JavaScript en tiempo de ejecución — TypeScript solo permite declararlos por adelantado."
    },
    {
      "mito": "number distingue enteros de decimales, como int/float en otros lenguajes",
      "realidad": "Hay un único tipo number para cualquier valor numérico normal. bigint es un tipo aparte, con su propia sintaxis, para enteros muy grandes."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar String, Number o Boolean (con mayúscula) como tipo.", "texto": "Esos son los tipos de los objetos envoltorio de JavaScript (new String('x')), casi nunca lo que se quiere — el tipo correcto es siempre en minúscula: string, number, boolean." },
    { "titulo": "Pensar que hace falta bigint para cualquier número grande.", "texto": "number ya cubre con precisión hasta 2^53 - 1 — bigint solo hace falta para enteros arbitrariamente más grandes que eso, un caso poco frecuente en código de aplicación normal." }
  ]
}
```

## Ejercicios

1. Declara una constante de cada uno de los tres tipos primitivos, con su anotación explícita.
2. Explica por qué `number` no necesita distinguir entre `42` y `3.14`.
3. ¿Qué diferencia hay entre el tipo `string` y el tipo `String`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook sobre los tipos primitivos más comunes.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
