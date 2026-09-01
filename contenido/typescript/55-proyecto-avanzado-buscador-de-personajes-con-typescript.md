# Proyecto avanzado: buscador de personajes con TypeScript

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-buscador-de-personajes-con-typescript` (autogenerado del título)
- **Orden:** 550
- **Repositorio:** [github.com/pedroleni/typescript-proyectos](https://github.com/pedroleni/typescript-proyectos) (carpeta `buscador-personajes`)
- **Requiere:** Los proyectos "Gestor de tareas" (76) y "Explorador de personajes con Vite" (77) del temario de JavaScript
- **Nota:** Trasladada desde `contenido/javascript/78-proyecto-avanzado-buscador-typescript.md` — es el capstone de este temario de TypeScript, no de JavaScript. Contenido idéntico al original, solo cambia dónde vive.

---

## Qué vas a construir

La versión más pequeña de esta serie de proyectos — a propósito. Aquí no hay pestañas, ni paginación, ni favoritos: solo un buscador con un input. Toda la complejidad nueva está en los **tipos**, no en las funcionalidades.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/typescript-proyectos (carpeta buscador-personajes) — rama main con tipos.ts completo (es el diseño del proyecto) y el resto con TODOs; rama solucion con la implementación completa."
}
```

## El problema real que resuelve TypeScript aquí

En los dos proyectos anteriores, el estado tenía `cargando`, `error` y `personajes` como campos **independientes** — nada impedía, por error de programación, tener `cargando: true` y `error: 'algo falló'` a la vez, un estado que no debería poder existir pero que el propio JavaScript no evita.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// JavaScript: campos independientes\nlet cargando = false;\nlet error = null;\nlet personajes = [];\n// Nada impide esto:\ncargando = true;\nerror = 'Fallo de red';\n// ¿está cargando, o ha fallado? Los dos a la vez no tiene sentido.\n</script>",
  "despues": "<script>\n// TypeScript: una unión discriminada\ntype EstadoBusqueda =\n  | { tipo: 'inicial' }\n  | { tipo: 'cargando' }\n  | { tipo: 'listo'; personajes: Personaje[] }\n  | { tipo: 'error'; mensaje: string };\n// Solo puede ser UNO de los cuatro. 'error' y 'cargando' a la vez\n// ni siquiera es un valor que se pueda construir.\n</script>",
  "nota": "Esto no es \"más seguro\" en un sentido vago — es un tipo de dato que estructuralmente no permite el estado inconsistente. El compilador rechaza cualquier intento de mezclar campos de casos distintos."
}
```

## La comprobación de exhaustividad: la prueba de que funciona

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction casoImposible(valor) {\n  throw new Error(`Caso de estado no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction renderizar(estado) {\n  switch (estado.tipo) {\n    case 'inicial': /* ... */ break;\n    case 'cargando': /* ... */ break;\n    case 'listo': /* ... */ break;\n    case 'error': /* ... */ break;\n    default:\n      casoImposible(estado);\n  }\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "function casoImposible(valor) {",
      "nota": "En el proyecto real, esta función se tipa como (valor: never): never — 'never' es el tipo que no tiene ningún valor posible. TypeScript solo deja pasar algo a un parámetro never si ya ha comprobado, caso por caso en el switch de arriba, que no queda ningún caso sin cubrir."
    },
    {
      "fragmento": "default:\n      casoImposible(estado);",
      "nota": "Si mañana añades un quinto caso a EstadoBusqueda (por ejemplo, 'sin-conexion') y olvidas añadir su case aquí, esta línea deja de compilar — TypeScript ve que 'estado' todavía podría ser ese quinto caso, así que ya no es never."
    }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Pruébalo tú, de verdad.",
      "texto": "Clona typescript-proyectos, entra en buscador-personajes/, añade { tipo: 'prueba' } a la unión EstadoBusqueda en tipos.ts, y ejecuta npm run typecheck sin tocar vista.ts — verás el error exacto, en la línea exacta, antes de ejecutar ni una línea de código."
    },
    {
      "titulo": "Esto no es teoría abstracta.",
      "texto": "Es exactamente el tipo de bug que en los proyectos anteriores solo se detectaría probando la app a mano y notando que algo se ve raro — aquí el compilador lo impide antes de que exista."
    }
  ]
}
```

## Genéricos: funciones que conservan el tipo de lo que les pasas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nasync function obtenerJSON(url) {\n  const respuesta = await fetch(url);\n  if (!respuesta.ok) {\n    throw new ErrorHttp(respuesta.status, `La API respondió con un error (${respuesta.status})`);\n  }\n  return respuesta.json();\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "async function obtenerJSON(url) {",
      "nota": "En el proyecto real: async function obtenerJSON<T>(url: string): Promise<T>. El <T> es un genérico — quien llama a la función decide qué forma espera (obtenerJSON<RespuestaBusqueda>(url)) y recibe ese tipo de vuelta, sin tener que escribir un 'as RespuestaBusqueda' después de cada llamada."
    },
    {
      "fragmento": "return respuesta.json();",
      "nota": "Límite real de este patrón: TypeScript CONFÍA en que el <T> que le pasas es correcto — no comprueba la respuesta real contra ese tipo. Si la API cambiara de forma sin avisar, esto no lo detectaría; para eso haría falta una librería de validación en runtime como Zod (ver la lección anterior de este mismo módulo)."
    }
  ]
}
```

## Un error real de configuración: `erasableSyntaxOnly`

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nclass ErrorHttp extends Error {\n  constructor(public status: number, mensaje: string) {\n    super(mensaje);\n    this.name = 'ErrorHttp';\n  }\n}\n</script>",
  "despues": "<script>\nclass ErrorHttp extends Error {\n  status: number;\n\n  constructor(status: number, mensaje: string) {\n    super(mensaje);\n    this.name = 'ErrorHttp';\n    this.status = status;\n  }\n}\n</script>",
  "nota": "El de antes es sintaxis válida en general — pero con erasableSyntaxOnly activado (lección dedicada en el Módulo 8) no compila: ese azúcar de \"parámetro de constructor\" obliga a GENERAR código (this.status = status), no solo borrar tipos. El de después asigna la propiedad a mano, y sí es \"solo tipos\" de principio a fin."
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm run typecheck está en verde del todo?",
      "texto": "En el punto de partida va a mostrar muchos errores de \"declarado pero no usado\" — es normal mientras implementas los TODO. El objetivo es que desaparezcan todos al terminar los seis archivos."
    },
    {
      "titulo": "¿Hiciste la prueba de exhaustividad de verdad?",
      "texto": "No te fíes de que \"suena bien\" — añade un caso de más a EstadoBusqueda sin tocar el switch y comprueba con tus propios ojos que npm run typecheck falla."
    },
    {
      "titulo": "¿npm run build también pasa, no solo npm run dev?",
      "texto": "El build corre tsc antes de generar nada — si hay algún error de tipos que dev no llegó a mostrarte, build lo va a parar."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade un quinto caso real y útil a `EstadoBusqueda`: `{ tipo: 'sin-resultados' }`, distinto de `'listo'` con un array vacío — y actualiza el `switch` para que compile de nuevo.
2. Tipa una función `filtrarPorEspecie(personajes: Personaje[], especie: string): Personaje[]` y añádele sus propios tests.
3. Sustituye el `as Promise<T>` de `obtenerJSON` por una validación real con Zod — como en la lección anterior de este módulo, así el tipo declarado y los datos reales quedan comprobados de verdad, no solo prometidos.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "typescript-proyectos/buscador-personajes (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en buscador-personajes/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/typescript-proyectos/tree/main/buscador-personajes",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "typescript-proyectos/buscador-personajes (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/typescript-proyectos/tree/solucion/buscador-personajes",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "TypeScript — Narrowing y uniones discriminadas",
      "descripcion": "Documentación oficial del patrón central de este proyecto.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
