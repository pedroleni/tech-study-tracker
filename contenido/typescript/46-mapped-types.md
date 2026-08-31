# Mapped types: transformar todas las propiedades de un tipo

- **Módulo:** Tipos avanzados
- **Slug:** `mapped-types` (autogenerado del título)
- **Orden:** 460
- **Fuentes:** [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — ver `contenido/typescript/TEMARIO.md` #46

---

## Qué es y para qué sirve

Un mapped type recorre las claves de un tipo existente (con `keyof`) y construye un tipo nuevo aplicando la misma transformación a cada propiedad — es, de hecho, cómo están implementados internamente `Partial`, `Readonly` y `Pick`. Aprender a escribir uno propio permite crear transformaciones que ningún utility type incluido cubre.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reimplementando Partial con un mapped type",
  "consigna": "Compara MiPartial con Partial<Usuario> de la lección 41 — deberían comportarse igual.",
  "html": "<pre id=\"salida\"></pre>",
  "ts": "type MiPartial<T> = {\n  [Clave in keyof T]?: T[Clave];\n};\n\ninterface Usuario {\n  id: number;\n  nombre: string;\n}\n\ntype UsuarioParcial = MiPartial<Usuario>;\n\nconst u: UsuarioParcial = { nombre: 'Ada' }; // válido, id puede faltar\ndocument.getElementById('salida')!.textContent = JSON.stringify(u);",
  "pestañaInicial": "ts"
}
```

## Los modificadores +/-

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Mutable<T> = {\n  -readonly [Clave in keyof T]: T[Clave];\n};\n\ninterface Config {\n  readonly host: string;\n  readonly puerto: number;\n}\n\ntype ConfigEditable = Mutable<Config>; // host y puerto ya NO son readonly\n</script>",
  "anotaciones": [
    { "fragmento": "-readonly [Clave in keyof T]: T[Clave];", "nota": "-readonly QUITA el modificador readonly de cada propiedad, aunque el tipo original lo tuviera — el modificador + (opcional, para +?) añade una característica; - la quita. Sin signo, se conserva tal cual estaba en el tipo original." }
  ]
}
```

## Remapear claves con as (TypeScript 4.1+)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype ConPrefijo<T> = {\n  [Clave in keyof T as `get${string & Clave}`]: () => T[Clave];\n};\n\ninterface Persona {\n  nombre: string;\n  edad: number;\n}\n\ntype AccesoresPersona = ConPrefijo<Persona>;\n// { getNombre: () => string; getEdad: () => number }\n</script>",
  "anotaciones": [
    { "fragmento": "[Clave in keyof T as `get${string & Clave}`]: () => T[Clave];", "nota": "La cláusula as remapea el NOMBRE de cada clave, no solo su tipo — combinada con template literal types (siguiente lección), permite generar nombres de propiedad completamente nuevos a partir de los originales." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que Partial<T>/Readonly<T> ya cubren la mayoría de casos comunes.", "texto": "Escribir un mapped type propio tiene sentido cuando la transformación es distinta a algo ya incluido — para los casos habituales, los utility types integrados son más simples y ya están probados." },
    { "titulo": "Confundir el signo - con quitar la propiedad por completo.", "texto": "-readonly y -? quitan MODIFICADORES (de solo lectura, de opcionalidad) — no eliminan la propiedad del tipo resultante." }
  ]
}
```

## Ejercicios

1. Escribe un mapped type `MiReadonly<T>` que reimplemente `Readonly<T>` a mano.
2. Escribe un mapped type que quite la opcionalidad de todas las propiedades de un tipo (equivalente a `Required<T>`), usando el modificador `-?`.
3. Explica qué hace la cláusula `as` dentro de un mapped type, con tus propias palabras.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Mapped Types",
      "descripcion": "Capítulo del Handbook sobre mapped types, modificadores y remapeo de claves.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
