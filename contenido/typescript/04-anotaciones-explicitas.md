# Anotaciones explícitas: cuándo merece la pena escribir el tipo

- **Módulo:** Por qué TypeScript y primeros pasos
- **Slug:** `anotaciones-explicitas` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) — ver `contenido/typescript/TEMARIO.md` #4

---

## Qué es y para qué sirve

Una anotación de tipo es la sintaxis `nombre: Tipo` que dice explícitamente qué forma debe tener un valor, en vez de dejar que TypeScript la infiera. No hace falta en todas partes — la lección anterior ya mostró que la inferencia cubre la mayoría de casos — pero hay sitios concretos donde anotar el tipo aporta algo real que la inferencia no puede dar por sí sola.

## Los tres sitios donde de verdad importa

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde anotar el tipo aporta algo que la inferencia no da",
  "roles": [
    { "etiqueta": "Parámetros de función", "rol": "Anotar siempre", "descripcion": "TypeScript no puede adivinar con qué valores se va a llamar una función — sin anotación, un parámetro sin tipo se trata como any." },
    { "etiqueta": "Variables sin valor inicial", "rol": "Anotar cuando se declara sin asignar", "descripcion": "let resultado; no tiene de qué inferir — anotar let resultado: number; fija el tipo desde el principio." },
    { "etiqueta": "Retorno de funciones públicas/exportadas", "rol": "Anotar por documentación y estabilidad", "descripcion": "El tipo de retorno se puede inferir, pero anotarlo a mano en una función que otros van a usar fija un contrato explícito que no cambia sin querer si se toca la implementación." }
  ]
}
```

## Anotación de variable frente a inferencia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Redundante: el tipo ya se infiere del valor\nconst edad: number = 32;\n\n// Necesario: no hay valor del que inferir nada\nlet resultado: number;\nresultado = calcularAlgo();\n\nfunction calcularAlgo(): number {\n  return 42;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const edad: number = 32;", "nota": "Anotar aquí no aporta nada — TypeScript ya infiere number del propio 32. No es un error, pero es ruido innecesario en la mayoría de guías de estilo." },
    { "fragmento": "let resultado: number;", "nota": "Aquí sí hace falta: sin valor inicial, no hay nada de qué inferir, y sin esta anotación resultado quedaría como any." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Anotar todo, incluidas variables con valor inicial evidente.", "texto": "const nombre: string = 'Ada' no aporta nada sobre const nombre = 'Ada' — añade ruido sin ninguna ganancia de seguridad." },
    { "titulo": "No anotar los parámetros de una función.", "texto": "Sin anotación, un parámetro se trata como any por defecto (o da un error si noImplicitAny está activo, dentro de strict) — casi nunca es lo que se quiere." }
  ]
}
```

## Ejercicios

1. Escribe una función `duplicar` que reciba un `number` y devuelva su doble, con el parámetro anotado explícitamente.
2. Explica por qué `let total;` sin anotación ni valor inicial es un problema real, no solo un estilo distinto.
3. ¿En qué caso anotar el tipo de retorno de una función, aunque se pueda inferir, tiene una ventaja real?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The Basics",
      "descripcion": "Capítulo del Handbook sobre anotaciones de tipo explícitas frente a inferencia.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
