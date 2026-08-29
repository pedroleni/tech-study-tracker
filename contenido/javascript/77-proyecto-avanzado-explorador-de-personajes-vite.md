# Proyecto avanzado: explorador de personajes con Vite

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-explorador-de-personajes-con-vite` (autogenerado del título)
- **Orden:** 505
- **Repositorio:** [github.com/pedroleni/explorador-personajes](https://github.com/pedroleni/explorador-personajes)
- **Requiere:** El proyecto "Gestor de tareas con arquitectura real" (lección 76) y las lecciones de fetch/promesas (49-52)

---

## Qué vas a construir

Un explorador de personajes de Rick and Morty con búsqueda, paginación y favoritos persistentes — pero esta vez con las herramientas que se usan en un proyecto real de verdad: **Vite** como servidor de desarrollo y herramienta de build, variables de entorno, y tests con Vitest para la parte de lógica pura.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/explorador-personajes — rama main con TODOs para hacerlo tú, rama solucion con la implementación completa. Es una API real y gratuita (rickandmortyapi.com), sin necesitar ninguna clave."
}
```

## Por qué Vite, y no solo un servidor estático

En el proyecto anterior serviste los archivos con `python3 -m http.server` — suficiente para módulos ES sueltos, pero ningún proyecto real de JavaScript se queda ahí.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que Vite da que un servidor estático no",
  "roles": [
    { "etiqueta": "npm run dev", "rol": "Recarga instantánea", "descripcion": "Guardas un archivo y el navegador se actualiza solo, sin recargar la página entera ni perder el estado de lo que estabas mirando." },
    { "etiqueta": "npm run build", "rol": "Optimización real", "descripcion": "Minifica el JS y el CSS, y les da nombres con hash para que el navegador pueda cachearlos agresivamente sin servir una versión vieja por error." },
    { "etiqueta": "import.meta.env", "rol": "Variables de entorno", "descripcion": "Valores que cambian según dónde se ejecute el proyecto (tu ordenador, un servidor de pruebas, producción) sin tocar el código." }
  ]
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El .env no se sube al repositorio",
  "contenido": "Clona el proyecto, ejecuta npm install, y copia .env.example a .env (cp .env.example .env) antes de npm run dev. El propio repositorio no lleva un .env real — solo la plantilla — exactamente igual que en tech-study-tracker."
}
```

## Arquitectura: seis capas, una responsabilidad cada una

Más piezas que el gestor de tareas, porque hay más que coordinar: red, estado, persistencia, orquestación y vista, cada una en su propio archivo.

```laboratorio
{
  "tipo": "esquema-de-pagina",
  "header": "utilidades.js — funciones puras (debounce, normalizar), con sus tests",
  "nav": "api.js — la única capa que sabe hacer fetch",
  "main": "estado.js — la única fuente de verdad",
  "aside": "almacenamiento.js — favoritos en localStorage",
  "footer": "acciones.js conecta todo; vista.js pinta; main.js conecta el DOM"
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "export async function cargarPersonajes() {\n  const { paginaActual, busqueda, vistaActual, favoritos } = obtenerEstado();\n  establecerCargando(true);\n\n  try {\n    if (vistaActual === 'favoritos') {\n      const personajes = await obtenerPersonajesPorId([...favoritos]);\n      establecerResultados(personajes, 1);\n      return;\n    }\n\n    const { personajes, totalPaginas } = await buscarPersonajes({ pagina: paginaActual, nombre: busqueda });\n    establecerResultados(personajes, totalPaginas);\n  } catch (error) {\n    establecerError(error.message);\n  }\n}",
  "anotaciones": [
    { "fragmento": "const { paginaActual, busqueda, vistaActual, favoritos } = obtenerEstado();", "nota": "acciones.js es el ÚNICO archivo que importa tanto de api.js como de estado.js a la vez — es la capa de orquestación, ni estado.js sabe hacer fetch ni api.js sabe qué es 'la página actual'." },
    { "fragmento": "const personajes = await obtenerPersonajesPorId([...favoritos]);\n      establecerResultados(personajes, 1);", "nota": "Los favoritos no se guardan como objetos completos — solo IDs (ver almacenamiento.js). Al ver la pestaña Favoritos, se vuelve a pedir a la API los datos de esos IDs. Es la API la única fuente de verdad de 'cómo es' un personaje." }
  ]
}
```

## La API: paginación, búsqueda y un detalle real de su forma de responder

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "export async function obtenerPersonajesPorId(ids) {\n  if (ids.length === 0) return [];\n\n  const respuesta = await fetchConReintento(`${BASE_URL}/character/${ids.join(',')}`);\n  if (respuesta.status === 404) return [];\n  if (!respuesta.ok) {\n    throw new Error(`La API respondió con un error (${respuesta.status})`);\n  }\n\n  const datos = await respuesta.json();\n  return normalizarAArray(datos);\n}",
  "anotaciones": [
    { "fragmento": "const respuesta = await fetchConReintento(`${BASE_URL}/character/${ids.join(',')}`);", "nota": "/character/1 devuelve UN objeto; /character/1,2 devuelve un ARRAY de objetos — la misma ruta, dos formas distintas según cuántos ids pidas. Un detalle real de muchas APIs que hay que descubrir leyendo la documentación, no adivinando." },
    { "fragmento": "return normalizarAArray(datos);", "nota": "En vez de comprobar Array.isArray(datos) en cada sitio donde se use este dato, se normaliza UNA VEZ aquí — y esa función es lo bastante pura y aislada como para tener sus propios tests en utilidades.test.js, sin necesitar mockear fetch." }
  ]
}
```

## Un bug real, encontrado construyendo este mismo proyecto

Esto no es un ejemplo inventado para la lección — pasó de verdad al construir la solución de este proyecto, y merece contarse porque es exactamente el tipo de fallo que no se ve venido hasta que ya está en producción.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los síntomas: peticiones que fallaban sin motivo aparente",
  "contenido": "Al buscar, marcar un favorito, cambiar de pestaña y pasar de página seguidos, algunas peticiones a la API empezaban a fallar con un error que el navegador reportaba como problema de CORS — pero la misma URL, pedida sola, funcionaba perfectamente."
}
```

La causa real estaba en `vista.js`: `renderizar()` reconstruía la rejilla de tarjetas en **cada** cambio de estado — incluido el momento en que `cargando` pasaba a `true`, antes de que llegaran datos nuevos.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "export function renderizar() {\n  const estado = obtenerEstado();\n  pintarMensajeEstado(estado);\n  pintarRejilla(estado);\n  pintarPaginacion(estado);\n  pintarPestañas(estado);\n}",
  "despues": "export function renderizar() {\n  const estado = obtenerEstado();\n  pintarMensajeEstado(estado);\n  if (!estado.cargando) {\n    pintarRejilla(estado);\n  }\n  pintarPaginacion(estado);\n  pintarPestañas(estado);\n}",
  "nota": "Con el de antes, cada acción disparaba DOS renders (uno al empezar a cargar, otro al terminar) — y cada render de la rejilla destruye y recrea hasta 20 <img> con la misma src, disparando otras tantas peticiones de imagen abandonadas a mitad de carga. Con varias acciones seguidas eso saturaba la conexión al mismo host que la propia API. La solución: no tocar la rejilla mientras cargando sea true — se deja el contenido anterior visible hasta que hay datos nuevos de verdad."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El mensaje de error no siempre dice la causa real.", "texto": "\"Bloqueado por CORS\" fue lo que reportó el navegador — la causa real no tenía nada que ver con CORS, sino con una conexión saturada por peticiones de imagen redundantes. Cuando un error no encaja con lo que el código hace explícitamente, sospecha de efectos secundarios menos obvios." },
    { "titulo": "Renderizar de más tiene un coste real, no solo estético.", "texto": "El patrón estado→render es correcto, pero \"redibujar todo en cada cambio\" sin más criterio puede ser caro de verdad cuando lo que se redibuja incluye recursos de red (imágenes), no solo texto." },
    { "titulo": "Reproducirlo con calma, no solo una vez.", "texto": "El fallo no aparecía en pruebas sueltas y sencillas — solo con varias acciones encadenadas seguidas. Aislar la secuencia exacta que lo reproduce de forma fiable fue el paso que de verdad llevó a la causa." }
  ]
}
```

## Reintentos: cuando SÍ tiene sentido volver a intentarlo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "async function fetchConReintento(url) {\n  try {\n    return await fetch(url);\n  } catch (primerError) {\n    await new Promise((resolve) => setTimeout(resolve, 500));\n    try {\n      return await fetch(url);\n    } catch (segundoError) {\n      throw new Error(`No se pudo conectar con la API: ${segundoError.message}`);\n    }\n  }\n}",
  "anotaciones": [
    { "fragmento": "try {\n    return await fetch(url);\n  } catch (primerError) {", "nota": "Solo se reintenta cuando fetch() LANZA (un fallo de conexión) — nunca cuando responde con un error real (404, 500). Repetir una petición que ya sabemos que dará 404 no cambia nada; repetir una que falló por un corte de red sí puede funcionar la segunda vez." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿npm run test pasa?", "texto": "Los tests de utilidades.js (debounce y normalizarAArray) no dependen de red ni de DOM — deberían pasar en cuanto la lógica esté bien, sin necesitar el navegador abierto." },
    { "titulo": "¿npm run build y npm run preview funcionan igual que npm run dev?", "texto": "Es fácil que algo funcione en desarrollo y se rompa en el build de producción (una variable de entorno mal referenciada es la causa más común) — pruébalo con los tres comandos, no solo con dev." },
    { "titulo": "¿Buscar, favoritear y paginar seguidos no rompe nada?", "texto": "Es exactamente la secuencia que expuso el bug de este proyecto — repítela varias veces seguidas como prueba de estrés." }
  ]
}
```

## Retos para ampliarlo

1. Añade un `<select>` de filtro por estado (Alive/Dead/unknown) que combine con la búsqueda por nombre en la misma petición.
2. Añade una vista de detalle: al hacer clic en una tarjeta, muestra sus episodios (la API los da como URLs en `personaje.episode`).
3. Sustituye la paginación por scroll infinito con `IntersectionObserver` (lección 66) — pista: en vez de reemplazar `personajes`, tendrías que ir acumulando resultados.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "explorador-personajes (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/explorador-personajes/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "explorador-personajes (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/explorador-personajes/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Vite — Env Variables and Modes",
      "descripcion": "Documentación oficial de import.meta.env y los archivos .env.",
      "url": "https://vite.dev/guide/env-and-mode",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Rick and Morty API",
      "descripcion": "Documentación de la API pública usada en este proyecto: paginación, filtros y el formato de sus respuestas.",
      "url": "https://rickandmortyapi.com/documentation",
      "etiqueta": "API"
    }
  ]
}
```
