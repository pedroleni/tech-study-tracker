# null, undefined y strictNullChecks

- **Módulo:** Tipos primitivos y valores
- **Slug:** `null-undefined-strictnullchecks` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #6

---

## Qué es y para qué sirve

`null` y `undefined` son, en JavaScript, dos formas distintas de "no hay valor". Sin ninguna comprobación especial, TypeScript dejaría asignar `null` o `undefined` a cualquier variable, del tipo que sea — exactamente el error que causa la inmensa mayoría de los `TypeError: Cannot read properties of undefined` en JavaScript real. La opción `strictNullChecks` (incluida en `strict: true`) cierra esa puerta: un valor solo puede ser `null` o `undefined` si su tipo lo permite explícitamente.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Sin strictNullChecks: esto compila sin ningún aviso\nfunction saludar(nombre: string) {\n  return 'Hola, ' + nombre.toUpperCase();\n}\n\nlet nombreUsuario: string = null; // Se permite sin queja\nsaludar(nombreUsuario); // Explota en tiempo de ejecución\n</script>",
  "despues": "<script>\n// Con strictNullChecks (incluido en strict: true):\nfunction saludar(nombre: string) {\n  return 'Hola, ' + nombre.toUpperCase();\n}\n\nlet nombreUsuario: string = null;\n// Error de compilación:\n// Type 'null' is not assignable to type 'string'.\n</script>",
  "nota": "Con strictNullChecks activo, string ya NO incluye null ni undefined por defecto — si un valor puede faltar de verdad, hay que decirlo explícitamente en el tipo (siguiente sección)."
}
```

## Permitir null/undefined explícitamente: uniones

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction buscarUsuario(id: number): string | undefined {\n  const usuarios: Record<number, string> = { 1: 'Ada' };\n  return usuarios[id]; // undefined si el id no existe\n}\n\nconst resultado = buscarUsuario(2);\nconsole.log(resultado.toUpperCase()); // Error: resultado puede ser undefined\n</script>",
  "anotaciones": [
    { "fragmento": "function buscarUsuario(id: number): string | undefined {", "nota": "string | undefined es una UNIÓN de tipos (se explica en detalle en el módulo de Narrowing): el valor devuelto puede ser un string, o puede no haber ninguno." },
    { "fragmento": "console.log(resultado.toUpperCase()); // Error: resultado puede ser undefined", "nota": "TypeScript obliga a comprobar que resultado no es undefined ANTES de usar .toUpperCase() — exactamente el error que en JavaScript puro solo aparecería en producción." }
  ]
}
```

## null y undefined no son intercambiables

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Dos ausencias distintas",
  "contenido": "undefined suele significar \"todavía no se ha asignado nada\" (una variable declarada sin valor, un parámetro no pasado, una propiedad que no existe en el objeto). null suele significar \"se asignó explícitamente la ausencia de valor\". Son tipos distintos en TypeScript — string | null no es lo mismo que string | undefined, aunque en la práctica muchas APIs usan uno u otro de forma poco consistente."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar una propiedad sin comprobar antes que no sea undefined.", "texto": "Con strictNullChecks activo, TypeScript obliga a la comprobación antes de acceder — ignorar el error con un cast (as string) reintroduce el mismo bug que el sistema de tipos estaba evitando." },
    { "titulo": "Desactivar strictNullChecks para que un error \"desaparezca\".", "texto": "El error no desaparece, solo deja de avisar — el bug real (acceder a algo que puede no existir) sigue ahí, solo que ahora en tiempo de ejecución." }
  ]
}
```

## Ejercicios

1. Escribe una función que reciba un `string | undefined` y devuelva el string en mayúsculas, o `'(sin valor)'` si no hay nada.
2. Explica la diferencia de significado habitual entre `null` y `undefined`.
3. ¿Qué hace exactamente `strictNullChecks`, y qué compilaría sin dar ningún error si estuviera desactivado?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre null y undefined y la opción strictNullChecks.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
