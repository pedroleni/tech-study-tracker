# Template literal types: tipos construidos como strings

- **Módulo:** Tipos avanzados
- **Slug:** `template-literal-types` (autogenerado del título)
- **Orden:** 470
- **Fuentes:** [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) — ver `contenido/typescript/TEMARIO.md` #47

---

## Qué es y para qué sirve

Un template literal type usa la misma sintaxis de backticks que un template literal de JavaScript (`` `texto-${variable}` ``), pero a nivel de tipos: combina tipos literales para producir nuevos tipos literales con una forma concreta. Cuando se combina con uniones, genera automáticamente TODAS las combinaciones posibles.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Todas las combinaciones, generadas automáticamente",
  "consigna": "Añade 'verde' a la unión Color y observa (razonando sobre el tipo, o probando una asignación nueva) que EventoColor gana automáticamente 'click-verde' y 'hover-verde'.",
  "ts": "type Color = 'rojo' | 'azul';\ntype Accion = 'click' | 'hover';\n\ntype EventoColor = `${Accion}-${Color}`;\n// 'click-rojo' | 'click-azul' | 'hover-rojo' | 'hover-azul'\n\nconst evento: EventoColor = 'click-rojo';\nconsole.log(evento);",
  "pestañaInicial": "ts"
}
```

## Un caso real: nombres de eventos con prefijo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype NombrePropiedad = 'nombre' | 'edad' | 'email';\ntype NombreEvento = `cambio:${NombrePropiedad}`;\n// 'cambio:nombre' | 'cambio:edad' | 'cambio:email'\n\nfunction escuchar(evento: NombreEvento, callback: () => void) {\n  // ...\n}\n\nescuchar('cambio:nombre', () => {});\nescuchar('cambio:telefono', () => {}); // Error: 'telefono' no está en NombrePropiedad\n</script>",
  "anotaciones": [
    { "fragmento": "type NombreEvento = `cambio:${NombrePropiedad}`;", "nota": "Este patrón — derivar los nombres de evento válidos directamente de las propiedades reales — conecta con la lección 40 (encadenar operadores): NombreEvento se mantiene sincronizado automáticamente si NombrePropiedad cambia, sin escribir cada combinación a mano." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir a mano cada combinación posible en vez de generarla con un template literal type.", "texto": "Con dos uniones de 5 elementos cada una, escribir las 25 combinaciones a mano es tedioso y propenso a errores — un template literal type las genera automáticamente y se mantiene sincronizado si las uniones originales cambian." },
    { "titulo": "Olvidar que el resultado de combinar dos uniones grandes crece rápido.", "texto": "Combinar varias uniones de muchos elementos con template literal types puede generar cientos o miles de combinaciones — en casos extremos, esto puede ralentizar la comprobación de tipos de forma notable." }
  ]
}
```

## Ejercicios

1. Declara `type Tamaño = 'sm' | 'md' | 'lg'` y `type Variante = 'primario' | 'secundario'`, y combínalas en un template literal type con guion entre ambas.
2. Escribe un template literal type que genere nombres de métodos `on` + el nombre capitalizado de un evento (`onClick`, `onHover`) a partir de una unión de eventos en minúscula.
3. ¿Qué ventaja real tiene derivar estas combinaciones con un template literal type frente a escribirlas todas a mano?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Template Literal Types",
      "descripcion": "Capítulo del Handbook sobre template literal types.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
