# Partial, Required, Readonly, Pick, Omit

- **Módulo:** Utility types
- **Slug:** `utility-types-partial-pick-omit` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — ver `contenido/typescript/TEMARIO.md` #41

---

## Qué es y para qué sirve

Los utility types son tipos genéricos que vienen incluidos con TypeScript, listos para usar, y que transforman un tipo existente sin tener que escribir la transformación a mano. `Partial`, `Required`, `Readonly`, `Pick` y `Omit` son los cinco más comunes para trabajar con tipos de objeto — cada uno resuelve una necesidad real y frecuente.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Cinco utility types sobre el mismo tipo base",
  "consigna": "Prueba a acceder a `usuarioParcial.email` sin comprobar antes si existe, y observa el error — Partial hace TODAS las propiedades opcionales.",
  "ts": "interface Usuario {\n  id: number;\n  nombre: string;\n  email: string;\n}\n\ntype UsuarioParcial = Partial<Usuario>; // todas las propiedades opcionales\ntype UsuarioSoloLectura = Readonly<Usuario>; // ninguna se puede reasignar\ntype UsuarioSinId = Omit<Usuario, 'id'>; // { nombre: string; email: string }\ntype SoloContacto = Pick<Usuario, 'nombre' | 'email'>;\n\nconst usuarioParcial: UsuarioParcial = { nombre: 'Ada' }; // válido, id/email pueden faltar\nconsole.log(usuarioParcial.email.length);",
  "pestañaInicial": "ts"
}
```

## Qué hace cada uno

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro transformaciones distintas sobre la misma forma",
  "roles": [
    { "etiqueta": "Partial<T> / Required<T>", "rol": "Todas opcionales, o todas obligatorias", "descripcion": "Opuestos entre sí: Partial hace opcional cada propiedad (útil para una actualización parcial); Required hace obligatoria incluso una propiedad que en T era opcional." },
    { "etiqueta": "Readonly<T>", "rol": "Todas las propiedades de solo lectura", "descripcion": "Ninguna propiedad se puede reasignar después de crear el objeto — comprobado solo en compilación, como la lección 11." },
    { "etiqueta": "Pick<T, Claves>", "rol": "Solo un subconjunto de propiedades", "descripcion": "Construye un tipo nuevo con únicamente las claves indicadas de T — el resto desaparece." },
    { "etiqueta": "Omit<T, Claves>", "rol": "Todas las propiedades menos algunas", "descripcion": "Lo contrario de Pick — construye un tipo con todo T excepto las claves indicadas." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar Pick cuando lo que se necesita es Omit, o al revés.", "texto": "Pick<T, 'a' | 'b'> se queda SOLO con a y b; Omit<T, 'a' | 'b'> se queda con TODO menos a y b — es fácil confundirlos si el tipo original tiene muchas propiedades." },
    { "titulo": "Olvidar que Partial hace la transformación de forma superficial.", "texto": "Partial<{ direccion: { calle: string } }> hace opcional direccion en su conjunto, pero NO hace opcional calle dentro de direccion si esta sí está presente — no es una transformación recursiva por defecto." }
  ]
}
```

## Ejercicios

1. A partir de una interfaz `Articulo` con `titulo`, `precio` y `stock`, crea un tipo con solo `titulo` y `precio` usando `Pick`.
2. Crea un tipo `ActualizacionArticulo` que permita actualizar cualquier subconjunto de campos de `Articulo`, usando `Partial`.
3. Explica la diferencia práctica entre `Omit<Articulo, 'stock'>` y `Pick<Articulo, 'titulo' | 'precio'>` cuando `Articulo` solo tiene esas tres propiedades.

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
