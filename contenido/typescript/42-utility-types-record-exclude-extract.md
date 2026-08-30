# Record, Exclude, Extract, NonNullable

- **Módulo:** Utility types
- **Slug:** `utility-types-record-exclude-extract` (autogenerado del título)
- **Orden:** 42
- **Fuentes:** [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — ver `contenido/typescript/TEMARIO.md` #42

---

## Qué es y para qué sirve

Cuatro utility types más, esta vez centrados en construir objetos con claves dinámicas (`Record`) y en filtrar uniones de tipos (`Exclude`, `Extract`, `NonNullable`) — herramientas frecuentes al trabajar con datos que vienen de fuera o con estados que combinan varios casos posibles.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Puntuaciones = Record<string, number>;\n\nconst puntuaciones: Puntuaciones = {\n  ana: 90,\n  luis: 85,\n};\n\ntype DiaSemana = 'lunes' | 'martes' | 'miercoles';\ntype HorarioSemanal = Record<DiaSemana, boolean>;\n\nconst horario: HorarioSemanal = {\n  lunes: true,\n  martes: false,\n  miercoles: true,\n};\n</script>",
  "anotaciones": [
    { "fragmento": "type Puntuaciones = Record<string, number>;", "nota": "Record<Clave, Valor> construye un tipo de objeto donde cualquier clave del tipo Clave mapea a un valor del tipo Valor — equivalente a un index signature, pero más legible." },
    { "fragmento": "type HorarioSemanal = Record<DiaSemana, boolean>;", "nota": "Con una unión de literales como Clave, Record exige que el objeto tenga EXACTAMENTE esas claves, todas obligatorias — mucho más preciso que Record<string, boolean>." }
  ]
}
```

## Exclude, Extract y NonNullable: filtrar uniones

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Estado = 'activo' | 'inactivo' | 'pendiente' | null;\n\ntype SinPendiente = Exclude<Estado, 'pendiente'>; // 'activo' | 'inactivo' | null\ntype SoloActivos = Extract<Estado, 'activo' | 'inactivo'>; // 'activo' | 'inactivo'\ntype SinNull = NonNullable<Estado>; // 'activo' | 'inactivo' | 'pendiente'\n</script>",
  "anotaciones": [
    { "fragmento": "type SinPendiente = Exclude<Estado, 'pendiente'>; // 'activo' | 'inactivo' | null", "nota": "Exclude<Union, Miembros> quita de la unión los miembros indicados — lo que quede es todo lo demás." },
    { "fragmento": "type SoloActivos = Extract<Estado, 'activo' | 'inactivo'>; // 'activo' | 'inactivo'", "nota": "Extract hace justo lo contrario de Exclude: se queda SOLO con los miembros indicados que existan en la unión original." },
    { "fragmento": "type SinNull = NonNullable<Estado>; // 'activo' | 'inactivo' | 'pendiente'", "nota": "NonNullable es un caso particular y frecuente: quita específicamente null y undefined de una unión." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar Record<string, T> cuando las claves reales son un conjunto cerrado conocido.", "texto": "Record<'a' | 'b' | 'c', T> exige que el objeto tenga EXACTAMENTE esas claves, todas — Record<string, T> acepta cualquier clave, perdiendo esa comprobación." },
    { "titulo": "Confundir Exclude (quitar del conjunto) con Extract (quedarse solo con esos).", "texto": "Son operaciones opuestas — Exclude<A, B> es \"A menos B\"; Extract<A, B> es \"la intersección de A y B\"." }
  ]
}
```

## Ejercicios

1. Declara un tipo `Inventario` con `Record` donde las claves sean `'manzanas' | 'peras' | 'platanos'` y el valor sea `number`.
2. A partir de `type Color = 'rojo' | 'verde' | 'azul' | 'amarillo'`, usa `Exclude` para quedarte con todos menos `'amarillo'`.
3. ¿Qué diferencia hay entre `Extract<Estado, 'activo'>` y `Pick<Estado, 'activo'>`, y por qué solo una de las dos es válida aquí?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Utility Types",
      "descripcion": "Referencia oficial completa de los utility types incluidos con TypeScript.",
      "url": "https://www.typescriptlang.org/docs/handbook/utility-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
