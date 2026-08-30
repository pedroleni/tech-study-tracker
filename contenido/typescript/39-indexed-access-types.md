# Indexed access types

- **Módulo:** Operadores de manipulación de tipos
- **Slug:** `indexed-access-types` (autogenerado del título)
- **Orden:** 39
- **Fuentes:** [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) — ver `contenido/typescript/TEMARIO.md` #39

---

## Qué es y para qué sirve

`Tipo['propiedad']` extrae, como tipo independiente, el tipo de esa propiedad concreta dentro de `Tipo` — la misma sintaxis que se usaría para acceder al VALOR de esa propiedad en tiempo de ejecución, pero funcionando a nivel de tipos. Es útil cuando hace falta el tipo de una sola parte de una estructura más grande, sin declararlo por separado ni duplicarlo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Pedido {\n  id: number;\n  cliente: {\n    nombre: string;\n    email: string;\n  };\n  items: { producto: string; cantidad: number }[];\n}\n\ntype Cliente = Pedido['cliente']; // { nombre: string; email: string }\ntype Item = Pedido['items'][number]; // { producto: string; cantidad: number }\n</script>",
  "anotaciones": [
    { "fragmento": "type Cliente = Pedido['cliente']; // { nombre: string; email: string }", "nota": "En vez de declarar Cliente como una interfaz aparte y repetir la forma, se extrae directamente del tipo Pedido — si cliente cambia de forma dentro de Pedido, Cliente se actualiza automáticamente." },
    { "fragmento": "type Item = Pedido['items'][number]; // { producto: string; cantidad: number }", "nota": "number como índice extrae el tipo de UN ELEMENTO de un array o tupla — items es un array, así que Pedido['items'][number] da el tipo de cada elemento individual, no del array completo." }
  ]
}
```

## Combinado con keyof: el tipo de cualquier propiedad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Tipo[keyof Tipo]: la unión de todos los tipos de valor posibles",
  "contenido": "Pedido[keyof Pedido] da la unión de los tipos de TODAS las propiedades de Pedido a la vez — combina indexed access types con keyof (lección 37) para expresar \"cualquier valor que pueda aparecer en este objeto\", sin enumerar las propiedades una a una."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar una clave que no existe en el tipo original.", "texto": "Pedido['inexistente'] da un error de compilación — igual que acceder a una propiedad que no existe en un valor real." },
    { "titulo": "Olvidar [number] para extraer el tipo de un elemento de array, e intentar usar el array completo donde se necesita un solo elemento.", "texto": "Pedido['items'] es el ARRAY completo; Pedido['items'][number] es el tipo de UN elemento — son tipos distintos, con usos distintos." }
  ]
}
```

## Ejercicios

1. Declara una interfaz `Empresa` con una propiedad `direccion: { calle: string; ciudad: string }`, y extrae el tipo de `direccion` con indexed access.
2. Declara una interfaz con una propiedad que sea un array de objetos, y extrae el tipo de un elemento individual con `[number]`.
3. ¿Qué produce `Tipo[keyof Tipo]`, y en qué se diferencia de `keyof Tipo`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Indexed Access Types",
      "descripcion": "Capítulo del Handbook sobre indexed access types.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
