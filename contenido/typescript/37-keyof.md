# keyof: las claves de un tipo, como tipo

- **Módulo:** Operadores de manipulación de tipos
- **Slug:** `keyof` (autogenerado del título)
- **Orden:** 37
- **Fuentes:** [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) — ver `contenido/typescript/TEMARIO.md` #37

---

## Qué es y para qué sirve

`keyof` toma un tipo de objeto y produce una unión de tipos literales con TODOS sus nombres de propiedad. Es la herramienta que conecta la forma de un objeto con operaciones que necesitan referirse a sus claves de forma segura — como el `obtenerPropiedad` genérico de la lección 29, ahora explicado desde el propio operador que lo hace posible.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "keyof en acción",
  "consigna": "Cambia 'inexistente' por una clave real de Persona ('nombre' o 'edad') y observa cómo desaparece el error.",
  "ts": "interface Persona {\n  nombre: string;\n  edad: number;\n}\n\ntype ClavesDePersona = keyof Persona; // 'nombre' | 'edad'\n\nlet clave: ClavesDePersona = 'inexistente';",
  "pestañaInicial": "ts"
}
```

## Por qué keyof, y no escribir la unión a mano

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "keyof se mantiene sincronizado automáticamente",
  "contenido": "Escribir type ClavesDePersona = 'nombre' | 'edad' a mano funciona igual HOY — pero si Persona gana una propiedad nueva, esa unión escrita a mano queda desactualizada sin ningún aviso. keyof Persona siempre refleja las claves REALES de Persona en cada momento, sin mantenimiento manual."
}
```

## Un caso real: acceso seguro a propiedades dinámicas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction obtenerPropiedad<T, K extends keyof T>(objeto: T, clave: K): T[K] {\n  return objeto[clave];\n}\n\nconst persona = { nombre: 'Ada', edad: 36 };\nconst nombre = obtenerPropiedad(persona, 'nombre'); // tipo: string\nconst edad = obtenerPropiedad(persona, 'edad'); // tipo: number\n</script>",
  "anotaciones": [
    { "fragmento": "function obtenerPropiedad<T, K extends keyof T>(objeto: T, clave: K): T[K] {", "nota": "K extends keyof T garantiza que clave sea SIEMPRE un nombre de propiedad real de T — sin keyof, no habría forma de expresar esa relación, y clave tendría que ser un string genérico, sin ninguna comprobación." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir a mano la unión de claves en vez de usar keyof.", "texto": "Se desincroniza en cuanto el tipo original cambia — keyof siempre refleja el estado actual del tipo, sin mantenimiento manual." },
    { "titulo": "Usar keyof sobre un valor en vez de sobre un tipo.", "texto": "keyof persona (con minúscula, el valor) no es válido — hace falta keyof typeof persona para obtener las claves de un valor concreto, tema de la lección siguiente." }
  ]
}
```

## Ejercicios

1. Declara una interfaz `Producto` con `nombre`, `precio` y `stock`, y obtén su unión de claves con `keyof`.
2. Explica qué ventaja tiene `keyof Tipo` frente a escribir la unión de nombres de propiedad a mano.
3. Escribe una función genérica que reciba un objeto y una de sus claves, y devuelva el valor de esa propiedad con el tipo correcto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Keyof Type Operator",
      "descripcion": "Capítulo del Handbook sobre el operador keyof.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
