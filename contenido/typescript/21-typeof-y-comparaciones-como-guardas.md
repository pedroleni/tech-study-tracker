# typeof y comparaciones como guardas de tipo

- **Módulo:** Narrowing y uniones discriminadas
- **Slug:** `typeof-y-comparaciones-como-guardas` (autogenerado del título)
- **Orden:** 21
- **Fuentes:** [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — ver `contenido/typescript/TEMARIO.md` #21

---

## Qué es y para qué sirve

**Narrowing** (estrechamiento) es el proceso por el que TypeScript reduce el tipo de una variable dentro de una rama de código, a partir de una comprobación en tiempo de ejecución. `typeof valor === 'string'` no es solo JavaScript normal — dentro del bloque donde esa comprobación es verdadera, TypeScript ya sabe que `valor` es un `string`, y deja usar sus métodos sin ningún error.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El tipo cambia dentro de cada rama",
  "consigna": "Quita el `if (typeof id === 'string')` y usa id.toUpperCase() directamente fuera de él — observa el error, y vuelve a ponerlo para ver cómo desaparece.",
  "ts": "function formatearId(id: string | number) {\n  if (typeof id === 'string') {\n    return id.toUpperCase(); // aquí, TypeScript ya sabe que id es string\n  }\n  return id.toFixed(2); // aquí, por descarte, id solo puede ser number\n}\n\nconsole.log(formatearId('abc'), formatearId(42));",
  "pestañaInicial": "ts"
}
```

## Comparaciones de igualdad también estrechan el tipo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction procesar(valor: string | null) {\n  if (valor === null) {\n    return 'sin valor';\n  }\n  return valor.toUpperCase(); // aquí, valor ya no puede ser null\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (valor === null) {", "nota": "No hace falta typeof para null/undefined — una comparación directa de igualdad también cuenta como narrowing." },
    { "fragmento": "return valor.toUpperCase(); // aquí, valor ya no puede ser null", "nota": "Después del return anticipado dentro del if, TypeScript sabe que la única posibilidad que queda en el resto de la función es string — el null ya se descartó." }
  ]
}
```

## Solo funciona con comprobaciones que TypeScript puede seguir

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El narrowing sigue el flujo del código, no cualquier lógica",
  "contenido": "Guardar el resultado de typeof en una variable aparte (const esString = typeof valor === 'string';) y comprobar esa variable después NO siempre estrecha el tipo igual de bien que la comprobación directa dentro del if — TypeScript analiza el flujo de control real, no cualquier expresión booleana equivalente en lógica pero distinta en forma."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar typeof con un valor que no es un primitivo simple.", "texto": "typeof array === 'object' es cierto tanto para arrays como para objetos normales y null — para distinguir un array específicamente hace falta Array.isArray(), no typeof." },
    { "titulo": "Esperar que el narrowing sobreviva a una llamada de función intermedia.", "texto": "Si entre la comprobación y el uso hay una llamada a una función que podría reasignar la variable, TypeScript puede \"olvidar\" el narrowing — mantener la comprobación y el uso lo más juntos posible evita el problema." }
  ]
}
```

## Ejercicios

1. Escribe una función que reciba `string | boolean` y devuelva siempre un `string`, usando `typeof` para distinguir los dos casos.
2. Explica qué significa "estrechar" un tipo, con tus propias palabras.
3. ¿Por qué `typeof valor === 'object'` no basta para comprobar si `valor` es específicamente un array?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Narrowing",
      "descripcion": "Capítulo del Handbook sobre typeof y comparaciones como guardas de tipo.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
