# Proyecto avanzado: cliente tipado con Zod

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-cliente-tipado-con-zod` (autogenerado del título)
- **Orden:** 570
- **Repositorio:** [github.com/pedroleni/cliente-tipado-zod](https://github.com/pedroleni/cliente-tipado-zod)
- **Requiere:** La lección "Proyecto: validar datos de una API con Zod" (Módulo 13) y el Módulo 10 (Utility types) de este mismo temario

---

## Qué vas a construir

Este proyecto cierra el reto que dejaba abierto la lección "validar datos
de una API con Zod": un cliente HTTP real, contra una API real (la
[PokeAPI](https://pokeapi.co/)), donde el tipo de lo que llega **nunca**
es una promesa sin comprobar — siempre es el resultado de una validación
de verdad, dato a dato, en tiempo de ejecución.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/cliente-tipado-zod — rama main con esquemas.ts completo (el diseño del proyecto) y cliente.ts con TODO; rama solucion con la implementación completa."
}
```

## El problema real: `as T` es una promesa, no una comprobación

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nasync function obtenerJSON(url) {\n  const respuesta = await fetch(url);\n  return respuesta.json(); // as Promise<T> implícito - confía, no comprueba\n}\n\nconst pokemon = await obtenerJSON('/api/pokemon/pikachu');\npokemon.height / 10; // ¿y si la API ya no tiene 'height'? Nada avisa hasta el NaN\n</script>",
  "despues": "<script>\nasync function obtenerValidado(url, esquema) {\n  const respuesta = await fetch(url);\n  const datos = await respuesta.json();\n  return esquema.parse(datos); // comprueba CADA campo, lanza si no encaja\n}\n\nconst pokemon = await obtenerValidado('/api/pokemon/pikachu', esquemaPokemon);\npokemon.height / 10; // si esto se ejecuta, height YA es un number real, comprobado\n</script>",
  "nota": "La diferencia no es de sintaxis, es de garantía: as T es una instrucción para el COMPILADOR (\"confía en mí\"), sin ningún efecto en tiempo de ejecución. .parse()/.safeParse() SÍ comprueban los datos reales, campo a campo, contra el esquema — si algo no encaja, se entera en el momento exacto, con un mensaje exacto, no tres líneas después con un NaN sin explicación."
}
```

## z.infer: el tipo se deriva del esquema, nunca al revés

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport const esquemaPokemon = z.object({\n  id: z.number(),\n  name: z.string(),\n  height: z.number(),\n  weight: z.number(),\n  sprites: z.object({ front_default: z.string().nullable() }),\n  types: z.array(z.object({ type: z.object({ name: z.string() }) })),\n});\n\nexport type Pokemon = z.infer<typeof esquemaPokemon>;\n</script>",
  "anotaciones": [
    { "fragmento": "export type Pokemon = z.infer<typeof esquemaPokemon>;", "nota": "z.infer usa, por dentro, un mecanismo de inferencia condicional parecido al de ReturnType (Módulo 10) para extraer el tipo de TypeScript directamente de la forma del esquema Zod. Si mañana la API añade un campo, se añade al esquema una vez — el tipo se actualiza solo, nunca hay dos fuentes de verdad que puedan desincronizarse." }
  ]
}
```

## La función que hace todo el trabajo pesado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nasync function obtenerValidado(url, esquema) {\n  const respuesta = await fetch(url);\n  if (!respuesta.ok) {\n    throw new ErrorHttp(respuesta.status, `Error ${respuesta.status} en ${url}`);\n  }\n\n  const datos = await respuesta.json();\n  const resultado = esquema.safeParse(datos);\n  if (!resultado.success) {\n    throw new ErrorValidacion(`No encaja con el esquema:\\n${z.prettifyError(resultado.error)}`);\n  }\n\n  return resultado.data;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const resultado = esquema.safeParse(datos);", "nota": "safeParse (en vez de parse) devuelve un objeto { success, data } o { success: false, error } en vez de lanzar directamente — permite decidir aquí mismo qué tipo de error propagar, con un mensaje propio del proyecto (ErrorValidacion) en vez del error genérico de Zod." },
    { "fragmento": "throw new ErrorValidacion(`No encaja con el esquema:\\n${z.prettifyError(resultado.error)}`);", "nota": "z.prettifyError convierte la lista de incidencias de Zod en un texto legible, con la ruta exacta del campo que falló — mucho más útil para depurar que el JSON crudo del error." }
  ]
}
```

## Pruébalo tú, con la API real

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Busca un Pokémon que no existe.", "texto": "Clona el repo, ejecuta npm run dev, y busca algo como \"no-existe-123\" — verás el ErrorHttp real (404) manejado con un mensaje legible, no un error sin capturar en la consola." },
    { "titulo": "Rompe el esquema a propósito.", "texto": "Cambia height: z.number() por height: z.string() en esquemaPokemon y vuelve a buscar cualquier Pokémon real — verás ErrorValidacion con el mensaje exacto de z.prettifyError, mostrando qué campo no encajó y por qué." }
  ]
}
```

## Errores típicos al construir algo así

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir una interface aparte del esquema Zod, a mano.", "texto": "Duplica la fuente de verdad — si la API cambia y solo se actualiza el esquema (o solo la interface), quedan desincronizados sin ningún aviso del compilador. z.infer evita el problema de raíz." },
    { "titulo": "Usar .parse() en vez de .safeParse() sin envolver en try/catch.", "texto": ".parse() LANZA directamente si la validación falla — sin capturarlo, es una excepción sin manejar. .safeParse() devuelve un resultado que se puede inspeccionar antes de decidir qué hacer." }
  ]
}
```

## Retos para ampliarlo

1. Añade una función `buscarEspecie(nombre)` contra `/pokemon-species/{nombre}` de la PokeAPI, con su propio esquema Zod.
2. Añade una caché en memoria a `obtenerValidado`: si ya se pidió esa URL antes, no repitas el `fetch`.
3. Tipa una versión de `obtenerValidado` que acepte un `AbortSignal` para poder cancelar la petición en curso.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "cliente-tipado-zod (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/cliente-tipado-zod/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "cliente-tipado-zod (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/cliente-tipado-zod/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Utility Types",
      "descripcion": "Documentación oficial de ReturnType y el mismo estilo de inferencia condicional que usa z.infer por dentro.",
      "url": "https://www.typescriptlang.org/docs/handbook/utility-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
