# Arrays y tuplas tipadas

- **Módulo:** Tipos primitivos y valores
- **Slug:** `arrays-y-tuplas` (autogenerado del título)
- **Orden:** 7
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #7

---

## Qué es y para qué sirve

Un array tipado (`number[]` o, equivalente, `Array<number>`) dice que TODOS los elementos son del mismo tipo. Una tupla (`[string, number]`) es distinta: una lista de longitud FIJA donde cada posición tiene su propio tipo, no necesariamente igual al de las demás — útil para representar pares o combinaciones concretas de valores, más precisa que un array genérico.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Array frente a tupla",
  "consigna": "Añade un elemento más a la tupla `coordenada` y observa el error — una tupla tiene longitud fija, un array no.",
  "ts": "const numeros: number[] = [1, 2, 3];\nnumeros.push(4); // permitido, un array puede crecer\n\nconst coordenada: [number, number] = [40.4, -3.7];\n// coordenada.push(100); // probaría a añadir un tercer elemento\n\nconsole.log(numeros, coordenada);",
  "pestañaInicial": "ts"
}
```

## Dos sintaxis equivalentes para arrays

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst nombres: string[] = ['Ada', 'Grace'];\nconst edades: Array<number> = [36, 60];\n</script>",
  "anotaciones": [
    { "fragmento": "const nombres: string[] = ['Ada', 'Grace'];", "nota": "La sintaxis más habitual: Tipo[]." },
    { "fragmento": "const edades: Array<number> = [36, 60];", "nota": "Sintaxis genérica equivalente, Array<Tipo> — se ve con más frecuencia cuando el tipo interno es más complejo (Array<{ id: number }>, por ejemplo)." }
  ]
}
```

## Una tupla real: coordenadas, pares clave-valor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype ParClaveValor = [string, number];\n\nconst entrada: ParClaveValor = ['edad', 32];\nconst clave = entrada[0]; // string\nconst valor = entrada[1]; // number\n</script>",
  "anotaciones": [
    { "fragmento": "type ParClaveValor = [string, number];", "nota": "Cada posición de la tupla tiene su propio tipo fijo — la posición 0 siempre es string, la posición 1 siempre es number." },
    { "fragmento": "const clave = entrada[0]; // string", "nota": "TypeScript sabe el tipo exacto de CADA posición, no un tipo genérico compartido como haría un array normal (string | number)[]." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar un array normal cuando lo que se necesita es una tupla.", "texto": "[string, number][] (un array normal con esa forma) permite cualquier longitud y no fija qué tipo va en cada posición si se accede fuera de rango — una tupla comunica una intención más precisa." },
    { "titulo": "Olvidar que .push() en una tupla no está bloqueado por defecto.", "texto": "TypeScript no impide añadir elementos con .push() a una tupla en todas las versiones/configuraciones — lo que sí bloquea es la asignación inicial con una longitud o tipos incorrectos." }
  ]
}
```

## Ejercicios

1. Declara un array de `string` con al menos tres nombres.
2. Declara una tupla `[string, boolean]` que represente un nombre de tarea y si está completada.
3. Explica con tus palabras la diferencia real entre `string[]` y `[string, string]`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, secciones sobre arrays y tuplas.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
