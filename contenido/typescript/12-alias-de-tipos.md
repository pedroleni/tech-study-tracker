# Alias de tipos con type

- **Módulo:** Objetos y alias de tipos
- **Slug:** `alias-de-tipos` (autogenerado del título)
- **Orden:** 12
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #12

---

## Qué es y para qué sirve

Un alias de tipo (`type Nombre = ...`) le da un nombre reutilizable a cualquier tipo — un tipo de objeto, una unión, una tupla, incluso un primitivo. No crea un tipo nuevo distinto del original: es literalmente el mismo tipo, solo que con un nombre para no repetir la definición completa cada vez que se usa.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype ID = string | number;\n\nfunction buscarPorId(id: ID) { /* ... */ }\n\ntype Usuario = {\n  id: ID;\n  nombre: string;\n};\n\nfunction saludar(usuario: Usuario) {\n  return `Hola, ${usuario.nombre}`;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "type ID = string | number;", "nota": "ID no es un tipo NUEVO — es exactamente string | number con un nombre. Cualquier sitio que espere ID acepta también un string o number sueltos, y viceversa." },
    { "fragmento": "type Usuario = {\n  id: ID;\n  nombre: string;\n};", "nota": "Los alias se pueden anidar: Usuario usa ID dentro de su propia definición, sin repetir string | number." }
  ]
}
```

## Reutilizar en vez de repetir

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El mismo tipo, escrito una sola vez",
  "contenido": "Sin un alias, una forma que se repite en varias funciones (por ejemplo, { latitud: number; longitud: number }) habría que escribirla entera cada vez — con type Coordenada = { latitud: number; longitud: number }, se escribe una vez y se reutiliza por nombre en todas partes."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que dos alias con la misma forma son tipos incompatibles.", "texto": "Como TypeScript usa tipado estructural (lección anterior), type A = { x: number } y type B = { x: number } son completamente intercambiables — el nombre del alias no importa para la compatibilidad." },
    { "titulo": "Repetir la misma forma de objeto en varias funciones en vez de darle un alias.", "texto": "Además de más escritura, cualquier cambio futuro en la forma obliga a actualizar cada copia por separado en vez de un único sitio." }
  ]
}
```

## Ejercicios

1. Crea un alias `Coordenada` con `latitud` y `longitud` (ambos `number`), y una función que lo reciba como parámetro.
2. Explica por qué `type ID = string | number` no crea un tipo "nuevo" en sentido estricto.
3. ¿Qué ventaja real tiene nombrar un tipo con `type` frente a repetir su definición completa en cada sitio donde se usa?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre alias de tipos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
