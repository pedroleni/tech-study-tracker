# any, unknown y never: los tres casos límite

- **Módulo:** Tipos primitivos y valores
- **Slug:** `any-unknown-never` (autogenerado del título)
- **Orden:** 8
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #8

---

## Qué es y para qué sirve

`any`, `unknown` y `never` no son tipos "normales" como `string` o `number` — son tres casos límite del sistema de tipos. `any` desactiva las comprobaciones por completo. `unknown` es su opuesto seguro: admite cualquier valor, pero obliga a comprobar su forma antes de usarlo. `never` representa un valor que nunca puede ocurrir — una función que siempre lanza, o una rama de código a la que es imposible llegar.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// any: sin ninguna comprobación, aunque el nombre del tipo esté ahí\nfunction procesar(dato: any) {\n  return dato.toUpperCase(); // compila, aunque dato sea un número\n}\n\nprocesar(42); // Error EN TIEMPO DE EJECUCIÓN: dato.toUpperCase is not a function\n</script>",
  "despues": "<script>\n// unknown: obliga a comprobar antes de usar\nfunction procesar(dato: unknown) {\n  if (typeof dato === 'string') {\n    return dato.toUpperCase(); // seguro: TypeScript ya sabe que es string aquí\n  }\n  return String(dato);\n}\n\nprocesar(42); // seguro en cualquier caso\n</script>",
  "nota": "any apaga el sistema de tipos para ese valor — cualquier operación compila, sin garantía de que exista en tiempo de ejecución. unknown mantiene la seguridad: obliga a NARROWING (comprobar el tipo real) antes de poder usar el valor, exactamente el mecanismo del módulo siguiente."
}
```

## never: lo que nunca puede pasar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction lanzarError(mensaje: string): never {\n  throw new Error(mensaje);\n}\n\nfunction procesarEstado(estado: 'ok' | 'error') {\n  if (estado === 'ok') return 'Todo bien';\n  if (estado === 'error') return 'Algo falló';\n  // Aquí, estado tiene tipo never: ya se cubrieron los dos únicos casos posibles\n}\n</script>",
  "anotaciones": [
    { "fragmento": "function lanzarError(mensaje: string): never {", "nota": "Una función que SIEMPRE lanza (nunca retorna con normalidad) se anota como never — es la forma más directa de este tipo." },
    { "fragmento": "// Aquí, estado tiene tipo never: ya se cubrieron los dos únicos casos posibles", "nota": "Este uso de never — comprobar que después de cubrir todos los casos reales no queda ninguno más — es la base de la comprobación de exhaustividad que se ve con detalle en el módulo de Narrowing." }
  ]
}
```

## Lo que any/unknown/never no son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "any y unknown son básicamente lo mismo",
      "realidad": "any desactiva toda comprobación — se puede llamar cualquier método sobre un any sin ningún aviso. unknown exige comprobar el tipo real antes de poder hacer casi nada con el valor."
    },
    {
      "mito": "never es lo mismo que void",
      "realidad": "void significa \"esta función no devuelve nada útil\" (pero SÍ retorna con normalidad). never significa que la función NUNCA retorna con normalidad — siempre lanza, o entra en un bucle infinito."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar any para \"que compile\" cuando aparece un error de tipos.", "texto": "any no arregla el problema, solo lo oculta — el bug que el error señalaba sigue existiendo, ahora sin ningún aviso." },
    { "titulo": "Recibir datos externos (una respuesta de red) como any en vez de unknown.", "texto": "unknown obliga a comprobar la forma real de los datos antes de usarlos — exactamente lo que hace falta con datos que vienen de fuera y no se pueden dar por buenos a ciegas." }
  ]
}
```

## Ejercicios

1. Escribe una función que reciba `unknown` y devuelva `true` solo si el valor es un `number` positivo.
2. Explica por qué `any` puede esconder un bug real que `unknown` habría detectado.
3. Escribe una función `lanzarSiNegativo` que reciba un `number` y tenga tipo de retorno `never` si el valor es negativo (lanzando un error).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, secciones sobre any y unknown.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
