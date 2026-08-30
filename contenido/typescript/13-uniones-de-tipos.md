# Uniones de tipos

- **Módulo:** Objetos y alias de tipos
- **Slug:** `uniones-de-tipos` (autogenerado del título)
- **Orden:** 13
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #13

---

## Qué es y para qué sirve

Una unión de tipos (`A | B`) dice que un valor puede ser DE CUALQUIERA de los tipos indicados — no una mezcla de ambos, sino uno de ellos en cada momento. Es la herramienta que permite modelar con precisión situaciones reales donde un valor legítimamente puede tener más de una forma: un ID que puede ser numérico o textual, un resultado que puede ser un dato o un error.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Una unión en acción",
  "consigna": "Prueba a llamar a `imprimirId(true)` — un booleano no está en la unión permitida.",
  "ts": "function imprimirId(id: string | number) {\n  console.log('ID:', id);\n}\n\nimprimirId('abc123');\nimprimirId(42);\n",
  "pestañaInicial": "ts"
}
```

## Solo se puede usar lo que TODOS los miembros de la unión tienen en común

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction formatear(id: string | number) {\n  return id.toUpperCase(); // Error: number no tiene toUpperCase\n}\n\nfunction formatearBien(id: string | number) {\n  if (typeof id === 'string') {\n    return id.toUpperCase(); // seguro: aquí TypeScript ya sabe que es string\n  }\n  return id.toString();\n}\n</script>",
  "anotaciones": [
    { "fragmento": "return id.toUpperCase(); // Error: number no tiene toUpperCase", "nota": "Con una unión, TypeScript solo deja usar los métodos/propiedades que EXISTEN EN TODOS los tipos de la unión — .toUpperCase() no existe en number, así que no se puede usar sin comprobar antes." },
    { "fragmento": "if (typeof id === 'string') {", "nota": "Esta comprobación es narrowing (estrechamiento) — el tema completo del módulo siguiente. Dentro del if, TypeScript ya sabe con certeza que id es string." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar un método específico de un solo tipo de la unión sin comprobar antes cuál es.", "texto": "Sin narrowing, TypeScript solo permite operaciones válidas para TODOS los tipos de la unión — usar algo específico de uno solo requiere comprobar antes de qué tipo es realmente ese valor." },
    { "titulo": "Confundir una unión (A | B) con una intersección (A & B, siguiente módulo).", "texto": "A | B es \"uno de los dos\"; A & B es \"los dos combinados en un único valor\" — se explica en el módulo de Interfaces." }
  ]
}
```

## Ejercicios

1. Escribe una función que reciba `boolean | string` y devuelva siempre un `string` legible.
2. Explica por qué `(id: string | number).toUpperCase()` da un error de compilación.
3. ¿Qué tipos concretos podrían formar parte de una unión que represente "el resultado de una búsqueda que puede no encontrar nada"?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre uniones de tipos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
