# Proyecto avanzado: recetario con router propio

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-recetario-con-router-propio` (autogenerado del título)
- **Orden:** 510
- **Repositorio:** [github.com/pedroleni/javascript-proyectos](https://github.com/pedroleni/javascript-proyectos) (carpeta `recetario`)
- **Requiere:** El proyecto "Explorador de personajes con Vite" (lección 77)

---

## Qué vas a construir

Una SPA de recetas contra una API real (TheMealDB) — pero esta vez con **varias páginas de verdad**: inicio, listado con búsqueda, detalle de una receta, y recetas por categoría. Navegas entre ellas sin que el navegador recargue nunca la página entera, con la URL cambiando de verdad y el botón atrás/adelante funcionando como en cualquier web — todo con un **router que escribes tú mismo**, sin ninguna librería.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/5188714fb3d0ccc70d5301dfe798bbe60dc5790416bfe92a1644df0c2747f22b.mp4",
  "poster": "https://www.techstudytracker.com/img/3fdcd2a87410426c73e89a028b3092f2e42d11826a4f31db4ba1b03ec201dfd0.jpg",
  "descripcion": "El router propio en marcha: se recorre la portada, se entra en una receta y se baja por sus ingredientes y pasos, se vuelve atrás y se salta a Categorías, todo sin recargar.",
  "titulo": "El recetario entero, sin recargas"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/javascript-proyectos (carpeta recetario) — rama main con TODOs para hacerlo tú, rama solucion con la implementación completa. La API (themealdb.com) es real, gratuita y sin clave — a diferencia del proyecto anterior, aquí no hace falta ningún .env."
}
```

## Por qué un router propio, y no una página por cada vista

Hasta ahora, cada proyecto de esta serie ha sido **una** pantalla: el gestor de tareas, el explorador de personajes. Cuando una app crece a tener varias vistas de verdad (un listado, un detalle, una categoría), hay dos caminos:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de tener varias páginas",
  "roles": [
    {
      "etiqueta": "Varios archivos .html",
      "rol": "Multi-Page App clásica",
      "descripcion": "Cada página es un archivo HTML distinto. Simple, pero cada clic recarga TODO desde cero — CSS y JS se vuelven a descargar, y cualquier estado en memoria (un scroll, lo que escribías) se pierde."
    },
    {
      "etiqueta": "Router propio en el cliente",
      "rol": "Single-Page App con varias rutas",
      "descripcion": "Un único index.html. JavaScript intercepta la navegación, cambia la URL con la History API, y pinta solo lo que cambia — igual que React Router, pero viéndolo por dentro."
    }
  ]
}
```

## Antes de empezar

### Si es la primera vez que sales del navegador en este curso

- **Node.js.** Vite necesita **20.19 o superior** (o 22.12+). Descarga
  la versión **LTS** desde [nodejs.org](https://nodejs.org) e
  instálala como cualquier otro programa. Comprueba tu versión con
  `node --version` en una terminal.
- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`), así que no hace falta buscar la
  terminal del sistema operativo por separado.
- **El código del proyecto**, de una de estas dos formas:
  - **Con git** (si ya lo tienes instalado):
    `git clone https://github.com/pedroleni/javascript-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/javascript-proyectos](https://github.com/pedroleni/javascript-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

### Del cero al proyecto abierto en el navegador, paso a paso

Si nunca has trabajado así, este es el camino completo. No hace falta
crear ningún archivo nuevo — ni siquiera `router.js`: **ya existe**
dentro de lo que acabas de clonar o descomprimir, con la firma de cada
función y varios `TODO` marcando qué falta escribir dentro.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `recetario/` de dentro de lo
   que clonaste (la de este proyecto en concreto, no la del
   repositorio `javascript-proyectos` entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   verás `router.js` y el resto de archivos de `src/`, más las
   carpetas nuevas `pages/` y `components/`. Ábrelos con un clic — no
   crees ninguno.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac). Se abre ya
   situada dentro de la carpeta del proyecto.
4. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
5. **Arranca el servidor de desarrollo**: escribe `npm run dev` y
   pulsa Intro — a diferencia del proyecto anterior, aquí no hay
   ningún paso de `.env`: TheMealDB no pide ninguna clave para las
   consultas que usa este proyecto.
6. **Abre la URL que imprime la terminal** en el navegador —
   normalmente `http://localhost:5173`, pero copia siempre la URL
   exacta que imprime tu terminal, puede variar si ese puerto ya está
   en uso. No la cierres mientras trabajas (para pararlo, `Ctrl+C`
   dentro de ella).
7. **El ciclo de trabajo**: abre un archivo con `TODO`, escribe la
   implementación, guarda con `Cmd`/`Ctrl` + `S`, y vuelve al
   navegador — el cambio aparece solo, sin refrescar nada a mano.

## Arquitectura: páginas y componentes, no solo capas

Las capas que ya conoces (`api.js`, `estado.js`, `acciones.js`, `utilidades.js`) siguen aquí igual que en el proyecto anterior. Lo nuevo son dos carpetas:

```laboratorio
{
  "tipo": "esquema-de-pagina",
  "header": "router.js — matching de rutas + History API",
  "nav": "pages/ — un módulo por vista, cada uno con su render()",
  "main": "components/ — piezas reutilizadas entre páginas",
  "aside": "api.js / estado.js / acciones.js / utilidades.js",
  "footer": "main.js arranca el router y lo suscribe al estado"
}
```

La diferencia clave con "una función que pinta todo": cada página de `pages/` solo sabe pintarse a sí misma. Ninguna sabe que existen las demás, ni cómo se llegó hasta ella — eso es responsabilidad exclusiva del router.

## El corazón del router: convertir un patrón en una expresión regular

Abre `recetario/src/router.js` — ya existe, con la firma de cada
función y varios `TODO` explicando qué falta:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction compilarPatron(patron) {\n  if (patron === '/') {\n    return { expresion: /^\\/$/, nombresParametros: [] };\n  }\n\n  const nombresParametros = [];\n  const segmentos = patron.split('/').filter(Boolean).map((segmento) => {\n    if (segmento.startsWith(':')) {\n      nombresParametros.push(segmento.slice(1));\n      return '([^/]+)';\n    }\n    return segmento;\n  });\n\n  return {\n    expresion: new RegExp(`^/${segmentos.join('/')}$`),\n    nombresParametros,\n  };\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "if (segmento.startsWith(':')) {\n      nombresParametros.push(segmento.slice(1));\n      return '([^/]+)';\n    }",
      "nota": "Un patrón como '/receta/:id' se registra con el nombre 'id' guardado aparte, y ese segmento se convierte en '([^/]+)' — cualquier cosa que no sea una barra, capturada entre paréntesis para poder recuperarla después."
    },
    {
      "fragmento": "expresion: new RegExp(`^/${segmentos.join('/')}$`),",
      "nota": "Anclado con ^ y $ a propósito: sin el $ final, el patrón '/receta/:id' matchearía también '/receta/52772/algo-mas', que debería dar 404. Es el mismo tipo de anclaje exacto que ya viste en las validaciones de seguridad del proyecto de imágenes de tech-study-tracker."
    }
  ]
}
```

Con eso, resolver una ruta es solo probar el patrón contra el `pathname` actual:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport function resolverRuta(ruta) {\n  const pathname = ruta.split(/[?#]/)[0] || '/';\n\n  for (const rutaRegistrada of rutasRegistradas) {\n    const coincidencia = pathname.match(rutaRegistrada.expresion);\n    if (!coincidencia) continue;\n\n    const params = Object.fromEntries(\n      rutaRegistrada.nombresParametros.map((nombre, indice) => [nombre, coincidencia[indice + 1]]),\n    );\n\n    return { pagina: rutaRegistrada.pagina, params };\n  }\n\n  return null;\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "export function resolverRuta(ruta) {",
      "nota": "Esta función NO toca el DOM ni la History API — recibe una cadena y devuelve un objeto. Por eso es la única parte del router con tests propios (router.test.js): se puede probar sin simular un navegador."
    }
  ]
}
```

## Navegar sin recargar: interceptar el clic, no el enlace

Los enlaces del proyecto son `<a href="/receta/52772">` normales y corrientes — a propósito. Funcionan aunque JavaScript falle al cargar, y un lector de pantalla los entiende sin nada especial. El router intercepta el **clic**, no cambia cómo se escriben los enlaces — esto sigue en el mismo `recetario/src/router.js`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction manejarClickInterno(evento) {\n  if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey || evento.metaKey) return;\n\n  const enlace = evento.target.closest('a');\n  if (!enlace || enlace.target === '_blank') return;\n\n  const url = new URL(enlace.href, location.href);\n  if (url.origin !== location.origin) return;\n\n  evento.preventDefault();\n  navegarA(`${url.pathname}${url.search}${url.hash}`);\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey || evento.metaKey) return;",
      "nota": "Sin estas comprobaciones, Cmd/Ctrl+clic (abrir en pestaña nueva) o el clic con el botón central del ratón dejarían de funcionar como el usuario espera — un router casero que rompe estos atajos es peor que no tener router."
    },
    {
      "fragmento": "if (url.origin !== location.origin) return;",
      "nota": "Un enlace a otro dominio debe navegar de verdad, no intentar que el router lo resuelva. Sin esto, un <a href=\"https://themealdb.com\"> se quedaría mudo en vez de abrir esa web."
    }
  ]
}
```

Y del otro lado: `window.addEventListener('popstate', renderizarRutaActual)` es lo que hace que el botón **atrás** del navegador funcione — sin esa línea, la URL cambiaría al pulsar atrás pero la pantalla se quedaría congelada en la página anterior.

## Un bug real, encontrado construyendo este mismo proyecto

Esto no es un ejemplo inventado para la lección — pasó de verdad al construir la solución, y es exactamente el tipo de fallo que solo aparece navegando rápido, nunca en una prueba tranquila paso a paso.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El síntoma: un error viejo tapando una página nueva",
  "contenido": "Busca una receta que no existe (para forzar un error) y, antes de que responda esa búsqueda, haz clic en una categoría. A veces la página de categoría cargaba bien un instante y al momento siguiente aparecía el mensaje de error... de la búsqueda anterior, encima de datos que sí habían llegado."
}
```

La causa: en `recetario/src/acciones.js`, `buscarRecetas()`, `cargarReceta()` y `cargarPorCategoria()` compartían el mismo `establecerError()` del estado, sin ninguna forma de saber si la respuesta que acababa de llegar seguía siendo la que le importaba a la pantalla actual.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nexport async function buscarRecetas(texto) {\n  establecerBusqueda(texto);\n  establecerCargando(true);\n\n  try {\n    const recetas = await buscarPorNombre(texto);\n    establecerResultadosBusqueda(recetas);\n  } catch (error) {\n    establecerError(error.message);\n  }\n}\n</script>",
  "despues": "<script>\nlet ultimaBusqueda = 0;\n\nexport async function buscarRecetas(texto) {\n  const identificador = ++ultimaBusqueda;\n  establecerBusqueda(texto);\n  establecerCargando(true, 'busqueda');\n\n  try {\n    const recetas = await buscarPorNombre(texto);\n    if (identificador === ultimaBusqueda) establecerResultadosBusqueda(recetas);\n  } catch (error) {\n    if (identificador === ultimaBusqueda) establecerError(error.message, 'busqueda');\n  }\n}\n</script>",
  "nota": "Dos ideas combinadas. Un contador (ultimaBusqueda) se incrementa en cada llamada — la respuesta solo se aplica si su identificador sigue siendo el más reciente al llegar, así una respuesta vieja se descarta en silencio. Y cada carga/error lleva una etiqueta de origen ('busqueda', 'receta', 'categoria'), para que una página nunca borre por error el mensaje de otra. Es el mismo patrón que usa por dentro React Query para evitar justo este problema."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Una petición asíncrona nunca sabe si sigue siendo relevante.",
      "texto": "Entre que se lanza un fetch() y llega su respuesta, el usuario puede haber navegado a otro sitio por completo. El código que procesa esa respuesta tiene que comprobarlo explícitamente — el lenguaje no lo hace por ti."
    },
    {
      "titulo": "Este bug no aparece probando con calma.",
      "texto": "Solo se manifiesta si la segunda navegación ocurre ANTES de que responda la primera petición — en una conexión rápida y probando despacio, nunca lo verás. Prueba siempre navegando deliberadamente rápido, no solo paso a paso."
    }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm run test pasa?",
      "texto": "router.test.js y utilidades.test.js no dependen de red ni de DOM — deberían pasar en cuanto la lógica esté bien."
    },
    {
      "titulo": "¿El botón atrás del navegador funciona de verdad?",
      "texto": "Navega a un par de recetas distintas y pulsa atrás dos veces — debe volver exactamente por donde viniste, no quedarse congelado ni saltarse un paso."
    },
    {
      "titulo": "¿Refrescar la página estando en /receta/52772 sigue funcionando?",
      "texto": "Escribe esa URL directamente en la barra de direcciones (o refresca estando ahí) — si ves un 404 del servidor en vez de la receta, el problema está en la configuración del servidor, no en tu router (Vite ya hace este fallback solo; en un hosting real haría falta configurarlo)."
    },
    {
      "titulo": "¿Buscar y cambiar de categoría rápido, seguido, no rompe nada?",
      "texto": "Es exactamente la secuencia que expuso el bug de este proyecto — repítela varias veces como prueba de estrés."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade una página de favoritos (`/favoritos`) con persistencia en `localStorage` — combina el router con el patrón de `almacenamiento.js` que ya usaste en el proyecto anterior.
2. Añade una barra de "recetas relacionadas" en la página de detalle, usando `strCategory` de la receta actual para pedir otras de la misma categoría.
3. Haz que la búsqueda del listado también acepte llegar por URL (`/buscar?q=pollo`), de modo que compartir esa URL reproduzca la misma búsqueda.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "javascript-proyectos/recetario (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/main/recetario",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "javascript-proyectos/recetario (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/solucion/recetario",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "MDN — Working with the History API",
      "descripcion": "pushState, replaceState y el evento popstate, explicados por la documentación oficial del navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API",
      "etiqueta": "MDN"
    },
    {
      "titulo": "TheMealDB API",
      "descripcion": "Documentación de la API pública usada en este proyecto: búsqueda, categorías y el formato de sus respuestas.",
      "url": "https://www.themealdb.com/api.php",
      "etiqueta": "API"
    }
  ]
}
```
