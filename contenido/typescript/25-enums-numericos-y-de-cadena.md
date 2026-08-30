# Enums numéricos y de cadena

- **Módulo:** Enums y alternativas
- **Slug:** `enums-numericos-y-de-cadena` (autogenerado del título)
- **Orden:** 25
- **Fuentes:** [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — ver `contenido/typescript/TEMARIO.md` #25

---

## Qué es y para qué sirve

Un `enum` define un conjunto cerrado y con nombre de valores relacionados — una alternativa a usar números o strings sueltos para representar, por ejemplo, los días de la semana o los estados de un pedido. A diferencia de un tipo (que solo existe en tiempo de compilación), un `enum` genera código JavaScript real que existe también en tiempo de ejecución.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\nenum Direccion {\n  Arriba,\n  Abajo,\n  Izquierda,\n  Derecha,\n}\n\nconsole.log(Direccion.Arriba);\n</script>",
  "opciones": [
    "'Arriba' — el nombre del miembro, como un string",
    "0 — un número asignado automáticamente empezando en 0, en el orden de declaración",
    "undefined — los enums no tienen valor hasta que se asignan explícitamente"
  ],
  "correcta": 1,
  "explicacion": "Un enum numérico sin valores explícitos asigna automáticamente 0, 1, 2... en el orden en que se declaran los miembros — Direccion.Arriba es 0, Direccion.Abajo es 1, y así sucesivamente."
}
```

## Enums de cadena: más legibles al depurar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nenum EstadoPedido {\n  Pendiente = 'PENDIENTE',\n  Enviado = 'ENVIADO',\n  Entregado = 'ENTREGADO',\n}\n\nconsole.log(EstadoPedido.Enviado); // 'ENVIADO', no un número sin significado\n</script>",
  "anotaciones": [
    { "fragmento": "enum EstadoPedido {\n  Pendiente = 'PENDIENTE',\n  Enviado = 'ENVIADO',\n  Entregado = 'ENTREGADO',\n}", "nota": "A diferencia de los enums numéricos, los de cadena requieren un valor explícito para CADA miembro — no hay incremento automático con strings." },
    { "fragmento": "console.log(EstadoPedido.Enviado); // 'ENVIADO', no un número sin significado", "nota": "Al depurar (por ejemplo, en un log o en las herramientas del navegador), un enum de cadena muestra un valor con significado — un enum numérico solo mostraría un 1 sin contexto." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Insertar un miembro en medio de un enum numérico ya usado en otro sitio (como en una base de datos).", "texto": "Como los valores se asignan automáticamente por orden, insertar un miembro nuevo en medio desplaza los números de todos los miembros siguientes — un cambio que puede romper datos ya guardados con los números antiguos." },
    { "titulo": "Mezclar miembros con y sin valor explícito en un enum numérico.", "texto": "Un miembro sin valor explícito toma el valor del anterior + 1 — mezclar esto con valores explícitos intercalados puede producir números repetidos sin ningún aviso." }
  ]
}
```

## Ejercicios

1. Declara un `enum` de cadena `Talla` con los valores `'S'`, `'M'`, `'L'`.
2. Explica por qué insertar un nuevo miembro en medio de un enum numérico ya en uso puede ser peligroso.
3. ¿Qué ventaja de depuración tiene un enum de cadena frente a uno numérico?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Enums",
      "descripcion": "Referencia oficial sobre enums numéricos y de cadena.",
      "url": "https://www.typescriptlang.org/docs/handbook/enums.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
