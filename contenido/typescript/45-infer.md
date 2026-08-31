# infer: extraer un tipo dentro de una condición

- **Módulo:** Tipos avanzados
- **Slug:** `infer` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — ver `contenido/typescript/TEMARIO.md` #45

---

## Qué es y para qué sirve

`infer` solo existe dentro de la rama `extends` de un conditional type — declara una variable de tipo NUEVA que TypeScript rellena automáticamente si la comparación de tipos tiene éxito, capturando una parte concreta de la estructura que se está comprobando. Es lo que hace posible extraer piezas de un tipo complejo sin conocer de antemano su forma exacta.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reimplementando ReturnType con infer",
  "consigna": "Cambia la función `crearPunto` para que devuelva un string en vez de un objeto, y observa cómo MiReturnType lo sigue automáticamente.",
  "ts": "type MiReturnType<F> = F extends (...args: any[]) => infer R ? R : never;\n\nfunction crearPunto() {\n  return { x: 0, y: 0 };\n}\n\ntype Punto = MiReturnType<typeof crearPunto>; // { x: number; y: number }\n\nconst p: Punto = { x: 1, y: 2 };\nconsole.log(p);",
  "pestañaInicial": "ts"
}
```

## Cómo leer esta sintaxis paso a paso

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype MiReturnType<F> = F extends (...args: any[]) => infer R ? R : never;\n</script>",
  "anotaciones": [
    { "fragmento": "F extends (...args: any[]) => infer R", "nota": "\"¿F tiene FORMA de función?\" — si sí, infer R captura, en una variable de tipo nueva llamada R, lo que sea que esa función devuelva, sin necesidad de saberlo de antemano." },
    { "fragmento": "? R : never", "nota": "Si la comparación tuvo éxito, el resultado es R (lo que se acaba de capturar). Si F no tiene forma de función en absoluto, el resultado es never — no hay nada que extraer." }
  ]
}
```

## Otro uso real: extraer el tipo dentro de una Promise

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Desenvolver<T> = T extends Promise<infer Contenido> ? Contenido : T;\n\ntype A = Desenvolver<Promise<string>>; // string\ntype B = Desenvolver<number>; // number (no es una Promise, se queda igual)\n</script>",
  "anotaciones": [
    { "fragmento": "type Desenvolver<T> = T extends Promise<infer Contenido> ? Contenido : T;", "nota": "Exactamente el mismo patrón: comprobar si T tiene la FORMA de una Promise de algo, y si es así, capturar ese \"algo\" con infer. Este patrón concreto (desenvolver una Promise a nivel de tipos) es tan común que TypeScript lo usa internamente para inferir el tipo de retorno de funciones async." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar infer fuera de la rama extends de un conditional type.", "texto": "infer solo tiene sentido dentro de esa posición concreta — es sintaxis inválida en cualquier otro sitio." },
    { "titulo": "Pensar que infer \"adivina\" un tipo sin ninguna estructura que lo respalde.", "texto": "infer solo captura algo si la comparación T extends Forma tiene éxito — sin esa forma coincidiendo primero, no hay nada que infer pueda extraer." }
  ]
}
```

## Ejercicios

1. Escribe un conditional type `PrimerElemento<T>` que, si `T` es una tupla, extraiga con `infer` el tipo de su primer elemento.
2. Reimplementa `Parameters<F>` (de la lección 43) usando `infer`, para un caso simplificado con un solo parámetro.
3. Explica por qué `infer` solo puede aparecer dentro de la rama `extends` de un conditional type.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Conditional Types",
      "descripcion": "Capítulo del Handbook, sección sobre infer dentro de conditional types.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
