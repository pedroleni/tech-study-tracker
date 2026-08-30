# Cómo funciona la inferencia de tipos

- **Módulo:** Por qué TypeScript y primeros pasos
- **Slug:** `como-funciona-la-inferencia-de-tipos` (autogenerado del título)
- **Orden:** 3
- **Fuentes:** [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) — ver `contenido/typescript/TEMARIO.md` #3

---

## Qué es y para qué sirve

TypeScript no obliga a escribir el tipo de cada variable a mano. En la mayoría de los casos, **infiere** el tipo a partir del valor con el que se inicializa — y ese tipo inferido es tan estricto como uno escrito a mano. Esto es lo que hace que TypeScript se sienta como JavaScript la mayor parte del tiempo: el sistema de tipos trabaja en segundo plano, sin que haga falta anotarlo todo.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Observa qué tipo infiere TypeScript",
  "consigna": "Pasa el ratón sobre \"edad\" en tu editor (o revisa el panel de diagnósticos) e intenta asignarle un string en la última línea — sin cambiar el código, léelo primero.",
  "ts": "const edad = 32;\nconst nombre = 'Ada';\nconst activo = true;\n\n// Intenta descomentar la siguiente línea:\n// edad = 'treinta y dos';\n\nconsole.log(edad, nombre, activo);",
  "pestañaInicial": "ts"
}
```

## Inferencia también en el retorno de una función

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction sumar(a: number, b: number) {\n  return a + b; // TypeScript infiere que esto devuelve number, sin anotarlo\n}\n\nconst resultado = sumar(2, 3); // resultado: number, también inferido\n</script>",
  "anotaciones": [
    { "fragmento": "function sumar(a: number, b: number) {", "nota": "Los PARÁMETROS de una función casi nunca se infieren solos — TypeScript no tiene forma de adivinar qué tipo espera quien la llama, así que anotarlos es casi siempre necesario." },
    { "fragmento": "return a + b; // TypeScript infiere que esto devuelve number, sin anotarlo", "nota": "El tipo de RETORNO sí se infiere a partir de lo que la función realmente devuelve — anotarlo explícitamente (): number es opcional aquí, aunque recomendable en funciones públicas para que el tipo quede fijado aunque cambie la implementación." }
  ]
}
```

## Cuándo la inferencia no basta

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una variable sin valor inicial no tiene nada de qué inferir",
  "contenido": "let resultado; sin un valor inicial se infiere como any — el tipo que desactiva las comprobaciones. En ese caso, anotar el tipo a mano (let resultado: number;) sí aporta algo real que la inferencia no puede deducir por sí sola."
}
```

## Lo que la inferencia no es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si no escribes el tipo, TypeScript no comprueba nada",
      "realidad": "El tipo inferido es tan real y tan estricto como uno anotado a mano — TypeScript sigue rechazando asignar un string a una variable inferida como number."
    },
    {
      "mito": "Anotar siempre el tipo, aunque se pueda inferir, es más seguro",
      "realidad": "Es más ruido sin ninguna ganancia real de seguridad — la convención habitual es dejar que la inferencia trabaje en variables locales, y anotar explícitamente en los límites públicos (parámetros de función, valores exportados)."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar una variable sin valor inicial y sin anotar el tipo.", "texto": "let x; queda como any — se pierde toda comprobación hasta que se le asigne algo, y para entonces puede ser tarde." },
    { "titulo": "Pensar que los parámetros de función se infieren solos.", "texto": "TypeScript no puede adivinar con qué se va a llamar una función — los parámetros casi siempre necesitan anotación explícita." }
  ]
}
```

## Ejercicios

1. Escribe `const x = 10;` y explica qué tipo infiere TypeScript sin necesidad de comprobarlo en un editor.
2. ¿Por qué los parámetros de una función normalmente sí necesitan anotación, a diferencia de una variable local?
3. ¿Qué tipo tiene `let y;` sin inicializar, y por qué es un problema?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The Basics",
      "descripcion": "Capítulo del Handbook sobre cómo TypeScript infiere tipos a partir del código.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
