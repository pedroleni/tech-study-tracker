# Valores por defecto en parámetros de tipo

- **Módulo:** Genéricos
- **Slug:** `valores-por-defecto-en-tipos-genericos` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/typescript/TEMARIO.md` #30

---

## Qué es y para qué sirve

Igual que un parámetro de función puede tener un valor por defecto, un parámetro de tipo genérico puede tener un TIPO por defecto (`<T = TipoPorDefecto>`) — se usa cuando quien llama no especifica explícitamente qué tipo debe tomar `T` y TypeScript no tiene suficiente información del contexto para inferirlo por sí solo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface RespuestaApi<T = unknown> {\n  datos: T;\n  exito: boolean;\n}\n\n// Sin especificar T, se usa el valor por defecto: unknown\nfunction procesarRespuestaGenerica(respuesta: RespuestaApi) {\n  console.log(respuesta.datos); // tipo: unknown\n}\n\n// Especificando T explícitamente\nfunction procesarUsuario(respuesta: RespuestaApi<{ nombre: string }>) {\n  console.log(respuesta.datos.nombre); // tipo: string, gracias al T explícito\n}\n</script>",
  "anotaciones": [
    { "fragmento": "interface RespuestaApi<T = unknown> {", "nota": "T = unknown dice: si quien usa RespuestaApi no especifica ningún tipo entre < >, usa unknown como valor por defecto — más seguro que usar any como valor por defecto, porque unknown sigue obligando a comprobar antes de usar." },
    { "fragmento": "function procesarRespuestaGenerica(respuesta: RespuestaApi) {", "nota": "RespuestaApi sin especificar nada entre < > es equivalente a RespuestaApi<unknown> — el valor por defecto se aplica automáticamente." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar any como valor por defecto de un genérico.", "texto": "RespuestaApi<T = any> desactiva la seguridad de tipos para cualquier uso que no especifique T explícitamente — unknown suele ser un valor por defecto más seguro, porque sigue exigiendo comprobación antes de usar el valor." },
    { "titulo": "Olvidar que un valor por defecto no es un constraint.", "texto": "T = unknown no limita qué tipos se pueden pasar (eso es lo que hace extends) — solo decide qué tipo se usa cuando no se especifica ninguno." }
  ]
}
```

## Ejercicios

1. Declara una interfaz genérica `Contenedor<T = string>` con una propiedad `valor: T`.
2. Explica la diferencia entre un valor por defecto de tipo (`T = X`) y un constraint (`T extends X`).
3. ¿Por qué `unknown` suele ser mejor valor por defecto que `any` para un genérico?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Generics",
      "descripcion": "Capítulo del Handbook sobre valores por defecto en parámetros de tipo.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
