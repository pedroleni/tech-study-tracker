# ¿Qué problema resuelve TypeScript que JavaScript no resuelve?

- **Módulo:** Por qué TypeScript y primeros pasos
- **Slug:** `que-problema-resuelve-typescript` (autogenerado del título)
- **Orden:** 1
- **Fuentes:** [TypeScript for JS Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) + [TS for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) — ver `contenido/typescript/TEMARIO.md` #1

---

## Qué es y para qué sirve

TypeScript es JavaScript con un sistema de tipos estático añadido encima. No es un lenguaje distinto: todo código JavaScript válido es, con muy pocas excepciones, también código TypeScript válido. Lo que TypeScript añade es una capa que comprueba, **antes de ejecutar nada**, que los tipos de los valores que usas encajan con lo que las funciones y variables esperan — y avisa con un error de compilación si no encajan, en vez de dejar que el error aparezca en producción, en tiempo de ejecución, delante de un usuario real.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un superset, no un lenguaje aparte",
  "contenido": "TypeScript se compila (se \"transpila\") a JavaScript normal antes de ejecutarse — ningún navegador ni Node.js entiende TypeScript directamente. El compilador de TypeScript quita las anotaciones de tipo y genera JavaScript plano. Por eso todo lo que ya sabes de JavaScript (closures, promesas, el DOM, prototipos) sigue funcionando exactamente igual — TypeScript no lo sustituye, lo comprueba."
}
```

## El problema real: un error que JavaScript no puede ver hasta que es tarde

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// JavaScript: sin ninguna comprobación previa\nfunction calcularDescuento(precio, porcentaje) {\n  return precio - (precio * porcentaje / 100);\n}\n\n// Un error de tipeo real, tan fácil de cometer como parece:\ncalcularDescuento(100, '20'); // funciona \"por casualidad\" (80)\ncalcularDescuento(100, '20%'); // NaN, y nada avisa hasta que se ve el resultado\n</script>",
  "despues": "<script>\n// TypeScript: el tipo del parámetro es parte de la función\nfunction calcularDescuento(precio: number, porcentaje: number): number {\n  return precio - (precio * porcentaje / 100);\n}\n\ncalcularDescuento(100, '20%');\n// Error de compilación, ANTES de ejecutar nada:\n// Argument of type 'string' is not assignable to parameter of type 'number'.\n</script>",
  "nota": "El primer caso ('20') da un resultado que \"parece\" correcto por cómo JavaScript convierte strings numéricos en operaciones aritméticas — pero es una coincidencia, no una garantía. El segundo caso ('20%') falla de forma silenciosa: NaN, sin ningún error que lo señale. TypeScript convierte ambos en un error imposible de ignorar, detectado sin ejecutar ni una línea."
}
```

## Cuándo se nota de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde TypeScript aporta más que en un script de tres líneas",
  "roles": [
    { "etiqueta": "Proyectos que crecen", "rol": "Refactorizar sin miedo", "descripcion": "Cambiar la forma de un objeto usado en 40 sitios distintos: TypeScript señala EXACTAMENTE los 40 sitios que hay que actualizar, en vez de descubrirlos uno a uno en producción." },
    { "etiqueta": "Trabajo en equipo", "rol": "La firma de una función es su propia documentación", "descripcion": "Ver que una función espera (id: string, opciones?: { incluirBorrados: boolean }) dice más, y de forma que no puede quedar desactualizada, que un comentario." },
    { "etiqueta": "Datos que vienen de fuera", "rol": "Modelar la forma de una respuesta de API", "descripcion": "Definir el tipo de lo que devuelve un fetch hace explícito qué campos existen y cuáles son opcionales — el editor avisa en el momento si se usa un campo que no existe." }
  ]
}
```

## Lo que TypeScript no es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "TypeScript es un lenguaje de programación distinto de JavaScript",
      "realidad": "Es JavaScript con anotaciones de tipo. Se compila a JavaScript plano — en tiempo de ejecución no queda ni rastro de los tipos, solo el JavaScript de siempre."
    },
    {
      "mito": "TypeScript hace que el código se ejecute más rápido",
      "realidad": "El JavaScript generado no es distinto (ni más rápido) que el que habrías escrito a mano. La ventaja es detectar errores ANTES de ejecutar, no el rendimiento en tiempo de ejecución."
    },
    {
      "mito": "Si el código compila, no puede tener bugs",
      "realidad": "TypeScript comprueba que los TIPOS encajen, no que la LÓGICA sea correcta. Una función bien tipada puede seguir devolviendo el resultado equivocado por un error de lógica que ningún sistema de tipos detecta."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que TypeScript detecte errores de lógica.", "texto": "Solo comprueba que las formas y tipos de los valores encajen entre sí — una función con la lógica invertida pero bien tipada compila sin ningún aviso." },
    { "titulo": "Pensar que hay que reescribir todo el proyecto para empezar.", "texto": "TypeScript se puede adoptar de forma incremental, archivo a archivo — un proyecto JavaScript real no necesita convertirse entero de golpe." }
  ]
}
```

## Ejercicios

1. Explica con tus propias palabras la diferencia entre un error que TypeScript detecta y uno que no puede detectar.
2. Escribe un ejemplo (en prosa o pseudocódigo) de una función donde pasar el tipo de dato equivocado causaría un bug difícil de encontrar en JavaScript puro.
3. ¿Por qué el JavaScript generado por el compilador de TypeScript no es "más rápido" que el JavaScript escrito a mano?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "TypeScript for JavaScript Programmers",
      "descripcion": "Introducción oficial pensada para quien ya sabe JavaScript y quiere entender qué añade TypeScript.",
      "url": "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "TypeScript for the New Programmer",
      "descripcion": "El mismo contexto, con más detalle sobre por qué existe un sistema de tipos estático.",
      "url": "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
