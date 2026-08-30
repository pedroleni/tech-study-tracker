# Constraints (extends) en genéricos

- **Módulo:** Genéricos
- **Slug:** `constraints-en-genericos` (autogenerado del título)
- **Orden:** 29
- **Fuentes:** [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/typescript/TEMARIO.md` #29

---

## Qué es y para qué sirve

Un genérico sin restricciones puede ser CUALQUIER tipo — lo que significa que dentro de la función solo se puede hacer lo que vale para absolutamente cualquier valor (casi nada útil). Un constraint (`T extends Forma`) limita qué tipos puede tomar `T`, a cambio de poder usar dentro de la función las propiedades que esa forma garantiza.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction obtenerLongitud<T>(valor: T): number {\n  return valor.length; // Error: T podría ser cualquier cosa, ni siquiera tiene .length\n}\n\ninterface ConLongitud {\n  length: number;\n}\n\nfunction obtenerLongitudBien<T extends ConLongitud>(valor: T): number {\n  return valor.length; // válido: T está restringido a tipos con .length\n}\n\nobtenerLongitudBien('hola'); // string tiene .length\nobtenerLongitudBien([1, 2, 3]); // los arrays tienen .length\nobtenerLongitudBien(42); // Error: number no tiene .length\n</script>",
  "anotaciones": [
    { "fragmento": "function obtenerLongitud<T>(valor: T): number {", "nota": "Sin restricción, T podría ser un number, un boolean, cualquier cosa — y ninguno de esos tiene garantizada una propiedad length, así que TypeScript no deja usarla." },
    { "fragmento": "function obtenerLongitudBien<T extends ConLongitud>(valor: T): number {", "nota": "extends ConLongitud no significa herencia de clases aquí — significa \"T tiene que ser un tipo que, como mínimo, cumpla la forma de ConLongitud\". Cualquier tipo con una propiedad length numérica sirve, sea un string, un array, o un objeto propio." }
  ]
}
```

## Un constraint habitual: keyof

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction obtenerPropiedad<T, K extends keyof T>(objeto: T, clave: K): T[K] {\n  return objeto[clave];\n}\n\nconst persona = { nombre: 'Ada', edad: 36 };\nobtenerPropiedad(persona, 'nombre'); // válido, devuelve string\nobtenerPropiedad(persona, 'inexistente'); // Error: 'inexistente' no es una clave de persona\n</script>",
  "anotaciones": [
    { "fragmento": "function obtenerPropiedad<T, K extends keyof T>(objeto: T, clave: K): T[K] {", "nota": "K extends keyof T restringe el segundo genérico a ser, específicamente, una de las claves REALES del primer genérico — combina dos genéricos relacionados entre sí. keyof se explica con detalle en el módulo de Operadores de manipulación de tipos." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar una propiedad de T sin restringirlo con extends.", "texto": "Sin un constraint, T podría ser cualquier tipo — TypeScript solo permite operaciones válidas para TODOS los tipos posibles, que en la práctica son casi ninguna." },
    { "titulo": "Confundir T extends Forma (constraint de genérico) con class X extends Y (herencia de clases).", "texto": "Son conceptos distintos que comparten palabra clave — el constraint de un genérico no crea ninguna relación de herencia, solo limita qué tipos son válidos para T." }
  ]
}
```

## Ejercicios

1. Escribe una función genérica `combinarNombres<T extends { nombre: string }>` que reciba dos objetos con esa forma y devuelva sus nombres unidos con un espacio.
2. Explica por qué `function f<T>(x: T) { return x.toString(); }` compila sin error, pero `x.length` no lo haría.
3. ¿Qué hace exactamente `K extends keyof T` en una función con dos parámetros de tipo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Generics",
      "descripcion": "Capítulo del Handbook sobre constraints en parámetros de tipo genéricos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
