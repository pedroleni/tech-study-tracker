# Conditional types: tipos que deciden según otro tipo

- **Módulo:** Tipos avanzados
- **Slug:** `conditional-types` (autogenerado del título)
- **Orden:** 44
- **Fuentes:** [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — ver `contenido/typescript/TEMARIO.md` #44

---

## Qué es y para qué sirve

Un conditional type usa la sintaxis `T extends U ? X : Y` — igual que un operador ternario, pero evaluado a nivel de TIPOS, no de valores en tiempo de ejecución. Permite que un tipo genérico produzca un resultado distinto según qué tipo concreto se le pase, algo que ni `keyof` ni los utility types vistos hasta ahora pueden hacer por sí solos.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un conditional type simple",
  "consigna": "Cambia el tipo de `resultado2` a `EsString<boolean>` y observa que se resuelve a 'no'.",
  "ts": "type EsString<T> = T extends string ? 'si' : 'no';\n\ntype Resultado1 = EsString<'hola'>; // 'si'\ntype Resultado2 = EsString<42>; // 'no'\n\nconst valor: Resultado1 = 'si';\nconsole.log(valor);",
  "pestañaInicial": "ts"
}
```

## Un caso real: aplanar un tipo que puede o no ser un array

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Elemento<T> = T extends (infer U)[] ? U : T;\n\ntype A = Elemento<string[]>; // string\ntype B = Elemento<number>; // number (no es un array, se queda igual)\n</script>",
  "anotaciones": [
    { "fragmento": "type Elemento<T> = T extends (infer U)[] ? U : T;", "nota": "Si T es un array de algo, el resultado es ese \"algo\" (capturado con infer, siguiente lección); si T no es un array, el resultado es T sin cambios. Es exactamente el tipo de lógica condicional que un simple keyof o Pick no pueden expresar." }
  ]
}
```

## Distributividad: un detalle real que sorprende

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un conditional type se aplica a cada miembro de una unión por separado",
  "contenido": "EsString<string | number> no da un único resultado combinado — se APLICA a 'string' y a 'number' por separado, y el resultado final es la unión de ambos: 'si' | 'no'. Este comportamiento (distributividad) es automático sobre parámetros de tipo genéricos usados directamente como T extends U ? ... — es una de las razones por las que los conditional types complejos pueden dar resultados inesperados si no se tiene en cuenta."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que un conditional type sobre una unión se comporte como un solo if.", "texto": "Por la distributividad, se evalúa una vez POR CADA miembro de la unión — el resultado es la unión de los resultados individuales, no una única decisión sobre toda la unión de golpe." },
    { "titulo": "Anidar demasiados conditional types en una sola línea.", "texto": "Igual que con el encadenado de operadores del módulo anterior, la legibilidad importa — dar nombres intermedios a pasos de la condición suele ayudar más que forzarlo todo en una expresión." }
  ]
}
```

## Ejercicios

1. Escribe un conditional type `EsArray<T>` que resuelva a `true` si `T` es un array, y `false` en cualquier otro caso.
2. Aplica `EsString<T>` (del primer ejemplo) a la unión `string | number | boolean` y razona qué tipo resultante produce.
3. Explica con tus palabras qué significa que un conditional type sea "distributivo" sobre una unión.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Conditional Types",
      "descripcion": "Capítulo del Handbook sobre conditional types y distributividad.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
