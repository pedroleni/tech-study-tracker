# Funciones que nunca retornan: never

- **Módulo:** Funciones tipadas
- **Slug:** `funciones-que-nunca-retornan` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — ver `contenido/typescript/TEMARIO.md` #20

---

## Qué es y para qué sirve

Una función anotada con retorno `never` promete algo distinto de `void`: no solo que no devuelve un valor útil, sino que **nunca llega a terminar con normalidad** — siempre lanza una excepción, o entra en un bucle sin fin. Esta distinción, pequeña en apariencia, es la base de la comprobación de exhaustividad que se ve con detalle en el módulo de Narrowing.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "void frente a never",
  "consigna": "registrarEvento termina con normalidad (aunque no devuelva nada útil): void. fallarSiempre nunca termina con normalidad: never.",
  "ts": "function registrarEvento(mensaje: string): void {\n  console.log(mensaje);\n  // termina aquí con normalidad, sin devolver nada útil\n}\n\nfunction fallarSiempre(mensaje: string): never {\n  throw new Error(mensaje);\n  // nunca llega a un 'return' ni a terminar con normalidad\n}\n\nregistrarEvento('Todo listo');\n",
  "pestañaInicial": "ts"
}
```

## Por qué la distinción importa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction obtenerConfiguracion(entorno: 'dev' | 'prod'): string {\n  if (entorno === 'dev') return 'config-dev';\n  if (entorno === 'prod') return 'config-prod';\n  lanzarError('Entorno desconocido'); // never: aquí termina el análisis\n}\n\nfunction lanzarError(mensaje: string): never {\n  throw new Error(mensaje);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "lanzarError('Entorno desconocido'); // never: aquí termina el análisis", "nota": "Como lanzarError está tipada como never, TypeScript sabe que el código NUNCA sigue después de esa línea — por eso obtenerConfiguracion puede estar anotada como string, sin necesitar un return final \"por si acaso\": ese caso ya está cubierto por una función que nunca retorna." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Anotar como never una función que sí puede terminar con normalidad en algún caso.", "texto": "Si una rama del código SÍ permite que la función retorne, aunque sea undefined, el tipo correcto es void, no never — never es una promesa fuerte de que eso nunca ocurre." },
    { "titulo": "Confundir never (nunca ocurre) con void (ocurre, pero sin valor útil).", "texto": "Una función que hace console.log y termina es void — sí retorna, solo que sin nada interesante. never es exclusivamente para funciones que jamás llegan a ese punto." }
  ]
}
```

## Ejercicios

1. Escribe una función `pausaInfinita` que tenga tipo de retorno `never` mediante un bucle `while (true)`.
2. Explica la diferencia exacta entre `void` y `never` con tus propias palabras.
3. ¿Por qué una función que siempre lanza una excepción es un candidato natural para `never`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "More on Functions",
      "descripcion": "Capítulo del Handbook sobre funciones con tipo de retorno never.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
