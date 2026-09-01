# erasableSyntaxOnly: por qué un parámetro de constructor no siempre compila

- **Módulo:** Clases tipadas
- **Slug:** `erasablesyntaxonly` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** Comportamiento real de la opción `erasableSyntaxOnly` de `tsconfig.json`, ya verificado de primera mano construyendo el proyecto de la lección `proyecto-avanzado-buscador-de-personajes-con-typescript` de este mismo temario (Módulo 13) — ver `contenido/typescript/TEMARIO.md` #36

---

## Qué es y para qué sirve

La lección 32 mostró el atajo de parámetros de propiedad en el constructor (`constructor(public titulo: string) {}`) como una forma más corta de declarar y asignar una propiedad a la vez. Esa sintaxis tiene un límite real: con la opción `erasableSyntaxOnly` activada en `tsconfig.json`, deja de compilar. Esta lección explica por qué — y por qué esa opción existe.

## El problema: no toda sintaxis de TypeScript es "solo tipos"

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Compilar TypeScript es, casi siempre, solo BORRAR tipos",
  "contenido": "La inmensa mayoría de lo que hace un compilador de TypeScript es quitar anotaciones (: number, interface Foo {...}) sin generar ni una línea de código nuevo — lo que queda debajo YA ES JavaScript válido. erasableSyntaxOnly comprueba que el código cumpla exactamente esa propiedad: que compilarlo sea solo borrar, nunca generar. Esto es justo lo que permite el soporte nativo de TypeScript de Node.js (ejecutar un fichero .ts directamente, sin ningún paso de build) — porque Node solo BORRA tipos, no tiene un compilador completo detrás."
}
```

## Un ejemplo real donde el atajo del constructor falla

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nclass ErrorHttp extends Error {\n  constructor(public status: number, mensaje: string) {\n    super(mensaje);\n    this.name = 'ErrorHttp';\n  }\n}\n</script>",
  "despues": "<script>\nclass ErrorHttp extends Error {\n  status: number;\n\n  constructor(status: number, mensaje: string) {\n    super(mensaje);\n    this.name = 'ErrorHttp';\n    this.status = status;\n  }\n}\n</script>",
  "nota": "El de antes es sintaxis de TypeScript perfectamente válida en general — pero con erasableSyntaxOnly activado, no compila: ese azúcar sintáctico de \"parámetro de constructor\" obliga al compilador a GENERAR código real (this.status = status), no solo borrar una anotación de tipo. Herramientas que solo quitan tipos sin compilar de verdad no pueden con eso. El de después declara y asigna la propiedad a mano, y sí es \"solo tipos\" de principio a fin — compila igual con o sin la opción activada."
}
```

## Otros casos que tampoco son "solo borrar tipos"

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "enum (no const enum).", "texto": "Un enum normal genera un objeto JavaScript real en tiempo de ejecución (lección 25) — eso es generar código, no solo borrar tipos. const enum sí se elimina por completo, así que sí es compatible." },
    { "titulo": "Namespaces con código dentro (namespace Foo { ... }).", "texto": "Generan un objeto contenedor real en el JavaScript de salida — código nuevo, no una simple eliminación de anotaciones." },
    { "titulo": "Parámetros de propiedad en el constructor (el caso de esta lección).", "texto": "Requieren generar una asignación (this.x = x) que no existe explícitamente en el código fuente." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Activar erasableSyntaxOnly en un proyecto con enums normales o el atajo de constructor ya en uso.", "texto": "El proyecto deja de compilar hasta reescribir esas construcciones a su forma equivalente sin generación de código — no es un bug de la opción, es exactamente lo que promete comprobar." },
    { "titulo": "Pensar que erasableSyntaxOnly es una restricción arbitraria.", "texto": "Existe porque hay entornos reales (el soporte nativo de TypeScript de Node.js) que literalmente no pueden ejecutar nada que no sea \"solo borrar tipos\" — no tienen un compilador completo, solo un eliminador de anotaciones." }
  ]
}
```

## Ejercicios

1. Reescribe una clase con el atajo de parámetros de constructor a su forma explícita (propiedad declarada + asignación manual).
2. Explica con tus palabras qué significa que compilar TypeScript sea, la mayoría de las veces, "solo borrar tipos".
3. ¿Por qué un `enum` normal no es compatible con `erasableSyntaxOnly`, pero un `const enum` sí?

La otra cara de este mismo tema — por qué `const enum` sí es compatible con `erasableSyntaxOnly`, a diferencia de un `enum` normal — se explica en la lección 26 de este mismo módulo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Ver también",
  "recursos": [
    {
      "titulo": "Proyecto avanzado: Buscador de personajes con TypeScript",
      "descripcion": "El proyecto real donde se encontró este comportamiento por primera vez — la rama solucion tiene la clase ErrorHttp con la propiedad declarada y asignada a mano, tal cual el bloque \"después\" de esta lección.",
      "url": "https://github.com/pedroleni/typescript-proyectos/tree/solucion/buscador-personajes",
      "etiqueta": "GitHub"
    }
  ]
}
```
