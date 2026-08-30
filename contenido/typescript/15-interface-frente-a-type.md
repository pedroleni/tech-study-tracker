# interface frente a type: cuándo usar cada una

- **Módulo:** Objetos y alias de tipos
- **Slug:** `interface-frente-a-type` (autogenerado del título)
- **Orden:** 15
- **Fuentes:** [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) + [Google TypeScript Style Guide — Type Aliases](https://google.github.io/styleguide/tsguide.html) — ver `contenido/typescript/TEMARIO.md` #15

---

## Qué es y para qué sirve

Para describir la forma de un objeto, `interface Persona { nombre: string }` y `type Persona = { nombre: string }` son prácticamente intercambiables — misma comprobación, mismos errores. Las diferencias reales están en los bordes: qué puede describir cada una más allá de objetos, y cómo se comportan cuando se declaran dos veces con el mismo nombre.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué puede describir cada una",
  "roles": [
    { "etiqueta": "type", "rol": "Cualquier tipo: uniones, tuplas, primitivos con alias", "descripcion": "type ID = string | number o type Par = [number, number] no tienen equivalente directo con interface — interface solo describe formas de objeto." },
    { "etiqueta": "interface", "rol": "Formas de objeto, con extends y declaration merging", "descripcion": "interface se puede extender con extends, y declarar dos veces con el mismo nombre fusiona ambas declaraciones (declaration merging, módulo de Configuración) — type da un error si se repite el nombre." }
  ]
}
```

## Declaration merging: la diferencia más concreta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Ventana {\n  titulo: string;\n}\n\ninterface Ventana {\n  ancho: number;\n}\n\n// Ventana ahora tiene AMBAS propiedades: titulo y ancho\nconst v: Ventana = { titulo: 'Inicio', ancho: 800 };\n\n// type Ventana = { titulo: string }; type Ventana = { ancho: number };\n// Error: Duplicate identifier 'Ventana'\n</script>",
  "anotaciones": [
    { "fragmento": "interface Ventana {\n  titulo: string;\n}\n\ninterface Ventana {\n  ancho: number;\n}", "nota": "Dos declaraciones de interface con el mismo nombre se FUSIONAN automáticamente — TypeScript las trata como una sola interfaz con todas las propiedades combinadas. Con type, esto sería un error de identificador duplicado." }
  ]
}
```

## La postura del Google TypeScript Style Guide

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una recomendación real, no una regla universal",
  "contenido": "El Google TypeScript Style Guide recomienda type como opción por defecto, salvo que se necesite específicamente extends o declaration merging — al contrario que otras guías de estilo, que prefieren interface por defecto para objetos. No hay un consenso único en la comunidad: lo importante es elegir un criterio y ser consistente dentro de un mismo proyecto."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar declarar dos veces el mismo type con distinta forma.", "texto": "A diferencia de interface, esto es siempre un error — si se necesita fusionar declaraciones (por ejemplo, para tipar una librería externa), hace falta interface." },
    { "titulo": "Usar interface para modelar una unión de tipos.", "texto": "interface Resultado = Exito | Error no es válido — las uniones solo se pueden nombrar con type." }
  ]
}
```

## Ejercicios

1. Escribe el mismo tipo `Punto` (con `x` e `y`, ambos `number`) primero como `interface` y luego como `type`.
2. Explica con un ejemplo qué es el declaration merging y por qué solo funciona con `interface`.
3. ¿Por qué una unión de tipos (`A | B`) no se puede expresar con `interface`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Object Types",
      "descripcion": "Capítulo del Handbook sobre interfaces y tipos de objeto.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Google TypeScript Style Guide — Type Aliases",
      "descripcion": "Postura de Google sobre cuándo preferir type frente a interface, como contrapunto práctico e independiente.",
      "url": "https://google.github.io/styleguide/tsguide.html",
      "etiqueta": "Google"
    }
  ]
}
```
