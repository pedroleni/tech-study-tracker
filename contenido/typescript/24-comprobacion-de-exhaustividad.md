# Comprobación de exhaustividad con never

- **Módulo:** Narrowing y uniones discriminadas
- **Slug:** `comprobacion-de-exhaustividad` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — ver `contenido/typescript/TEMARIO.md` #24

---

## Qué es y para qué sirve

Un `switch` sobre una unión discriminada suele cubrir todos los casos existentes — pero ¿qué pasa el día que alguien añade un caso nuevo a la unión y se olvida de actualizar el `switch`? Sin nada más, ese olvido compilaría sin ningún aviso. La comprobación de exhaustividad, apoyada en el tipo `never`, convierte ese olvido en un error de compilación real, en la línea exacta donde falta el caso.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Estado = { tipo: 'a' } | { tipo: 'b' } | { tipo: 'c' };\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction manejar(estado: Estado): string {\n  switch (estado.tipo) {\n    case 'a': return 'Caso A';\n    case 'b': return 'Caso B';\n    case 'c': return 'Caso C';\n    default:\n      return casoImposible(estado);\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "function casoImposible(valor: never): never {", "nota": "never es el tipo que NO TIENE NINGÚN valor posible. TypeScript solo deja pasar un valor a un parámetro never si, en ese punto exacto del código, ya ha comprobado que no queda ningún caso real sin cubrir." },
    { "fragmento": "default:\n      return casoImposible(estado);", "nota": "Si los tres case anteriores cubren TODOS los casos reales de Estado, en el default el tipo de estado ya se estrechó a never — y esta línea compila sin problema. Es la prueba, hecha por el propio compilador, de que el switch es exhaustivo." }
  ]
}
```

## Qué pasa si se añade un caso nuevo y se olvida el switch

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Añade un cuarto caso y observa el error",
  "consigna": "Añade `| { tipo: 'd' }` a la unión Estado, sin tocar el switch — el panel de diagnósticos debería señalar la línea exacta de casoImposible(estado).",
  "ts": "type Estado = { tipo: 'a' } | { tipo: 'b' } | { tipo: 'c' };\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction manejar(estado: Estado): string {\n  switch (estado.tipo) {\n    case 'a': return 'Caso A';\n    case 'b': return 'Caso B';\n    case 'c': return 'Caso C';\n    default:\n      return casoImposible(estado);\n  }\n}",
  "pestañaInicial": "ts"
}
```

## Por qué esto es mejor que confiar en acordarse

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "El compilador se acuerda por ti",
  "contenido": "Sin esta comprobación, un caso nuevo sin gestionar caería silenciosamente en un default genérico (o en ningún case, si no hay default) — un bug que solo se detectaría probando la aplicación a mano y notando que algo no se comporta bien. Con casoImposible, el mismo olvido se convierte en un error de compilación, señalado en la línea exacta, antes de ejecutar ni una sola vez el código."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Poner un default que devuelva un valor genérico en vez de llamar a casoImposible.", "texto": "default: return 'desconocido'; compila siempre, cubra o no todos los casos reales — pierde exactamente la garantía que la comprobación de exhaustividad existe para dar." },
    { "titulo": "Olvidar añadir el nuevo case al switch al ampliar la unión.", "texto": "Es justo el error que este patrón detecta — si aparece, es la señal de que el switch necesita actualizarse, no que casoImposible esté mal escrita." }
  ]
}
```

## Ejercicios

1. Retoma la unión discriminada de descarga de archivo del ejercicio anterior y añade una función `casoImposible` a su `switch`.
2. Añade un quinto estado (`'cancelada'`, por ejemplo) a esa unión sin tocar el `switch`, y describe qué error debería aparecer.
3. Explica con tus propias palabras por qué `never` es el tipo correcto para representar "esto no debería poder pasar nunca".

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Narrowing",
      "descripcion": "Capítulo del Handbook, sección sobre la comprobación de exhaustividad.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
