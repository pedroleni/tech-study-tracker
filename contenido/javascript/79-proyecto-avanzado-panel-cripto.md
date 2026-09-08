# Proyecto avanzado: panel de criptomonedas con componentes reutilizables

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-panel-de-criptomonedas-con-componentes-reutilizables` (autogenerado del título)
- **Orden:** 515
- **Repositorio:** [github.com/pedroleni/javascript-proyectos](https://github.com/pedroleni/javascript-proyectos) (carpeta `panel-cripto`)
- **Requiere:** El proyecto "Explorador de personajes con Vite" (lección 77)

---

## Qué vas a construir

Un dashboard de criptomonedas contra una API real (CoinGecko): una rejilla con las monedas de mayor capitalización, cada una con su precio, su variación en 24 horas y un gráfico de los últimos 7 días dibujado a mano en un `<canvas>`. Buscas por nombre, ordenas por precio o variación, marcas favoritas y las filtras — y cada tarjeta se actualiza sola, sin que la página entera se reconstruya cada vez.

```laboratorio
{
  "tipo": "imagen",
  "src": "https://www.techstudytracker.com/img/ddb64a39f81ae1b6ff542c6a84528b4f0e44e9dc87ce276ac6e054e685e7213e.png",
  "alt": "Captura del panel de criptomonedas: rejilla de tarjetas con precio, variación y sparkline de cada moneda",
  "titulo": "El panel de criptomonedas terminado"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/javascript-proyectos (carpeta panel-cripto) — rama main con TODOs para hacerlo tú, rama solucion con la implementación completa. CoinGecko es real, gratuita y sin clave — igual que el recetario, aquí tampoco hace falta ningún .env."
}
```

## Por qué un componente necesita un ciclo de vida

En los proyectos anteriores, cada cambio de estado volvía a pintar la pantalla entera desde cero: se vaciaba el contenedor y se reconstruía todo con `createElement`. Funciona, pero tiene un coste que hasta ahora no importaba: al no había nada "vivo" entre un render y el siguiente.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de reaccionar a un cambio de estado",
  "roles": [
    {
      "etiqueta": "Destruir y recrear todo",
      "rol": "Lo que hacían los proyectos anteriores",
      "descripcion": "Cada tarjeta se crea de cero en cada render. Si tenía algo 'enganchado' fuera de sí misma — un listener en window — nada lo desconecta: el nodo desaparece, pero eso sigue vivo."
    },
    {
      "etiqueta": "Crear, actualizar o destruir",
      "rol": "Lo nuevo en este proyecto",
      "descripcion": "Cada tarjeta expone crear(), actualizar() y destruir(). Si sigue visible se actualiza in-place; si deja de estarlo se destruye de verdad — y destruir() es lo único responsable de deshacer lo que creó."
    }
  ]
}
```

Esto es, en miniatura, el problema que resuelve el `useEffect` con función de limpieza de React, el `onUnmounted` de Vue, o el `disconnectedCallback` de un Web Component — todos existen porque este problema es real y demasiado fácil de olvidar a mano.

## Antes de empezar

### Si ya hiciste el proyecto 77, esto ya lo tienes — si no, repásalo

- **Node.js.** Vite necesita **20.19 o superior** (o 22.12+). Descarga
  la versión **LTS** desde [nodejs.org](https://nodejs.org) e
  instálala como cualquier otro programa. Comprueba tu versión con
  `node --version` en una terminal.
- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`).
- **El código del proyecto**, de una de estas dos formas:
  - **Con git**: `git clone https://github.com/pedroleni/javascript-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/javascript-proyectos](https://github.com/pedroleni/javascript-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

### Del cero al proyecto abierto en el navegador, paso a paso

No hace falta crear ningún archivo nuevo: todos los archivos de
`src/` **ya existen** dentro de lo que acabas de clonar o
descomprimir — `router.js` y las capas ya completos, y
`tarjetaMoneda.js`/`dashboard.js` con los `TODO` de este proyecto.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `panel-cripto/` de dentro de
   lo que clonaste (la de este proyecto en concreto, no la del
   repositorio `javascript-proyectos` entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   verás `src/components/tarjetaMoneda.js` y `src/pages/dashboard.js`
   entre otros — ábrelos con un clic, no crees ninguno.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
5. **Arranca el servidor de desarrollo**: escribe `npm run dev` y
   pulsa Intro — tampoco hay aquí ningún paso de `.env`: CoinGecko no
   pide ninguna clave para las consultas que usa este proyecto.
6. **Abre la URL que imprime la terminal** en el navegador
   (normalmente `http://localhost:5173`, o el siguiente puerto libre
   si tienes otro proyecto Vite corriendo a la vez) para ver el
   dashboard. No la cierres mientras trabajas (para pararlo, `Ctrl+C`
   dentro de ella).
7. **El ciclo de trabajo**: abre `tarjetaMoneda.js` o `dashboard.js`,
   busca el `TODO`, escribe la implementación, guarda con `Cmd`/`Ctrl`
   + `S`, y vuelve al navegador — el cambio aparece solo.

## Arquitectura: el router y las capas ya las conoces

```laboratorio
{
  "tipo": "esquema-de-pagina",
  "header": "router.js — igual que en el recetario, ya completo",
  "nav": "pages/dashboard.js y pages/detalle.js",
  "main": "components/tarjetaMoneda.js y components/buscador.js",
  "aside": "api.js / estado.js / acciones.js / utilidades.js",
  "footer": "main.js registra las rutas y arranca el router"
}
```

`buscador.js` es deliberadamente el más simple de los dos componentes: pinta un input y un `<select>`, y no escucha nada fuera de sí mismo — por eso `crear()` le basta, no necesita `actualizar()` ni `destruir()`. `tarjetaMoneda.js` sí los necesita, y es donde está la parte nueva de este proyecto.

## El contrato de un componente con ciclo de vida

Abre `panel-cripto/src/components/tarjetaMoneda.js` — `crear()` ya está
completa; `actualizar()` y `destruir()` tienen `TODO`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport function crear(moneda) {\n  const elemento = document.createElement('article');\n  // ...construye el DOM de la tarjeta...\n\n  function dibujarSparkline() {\n    // ...ajusta el tamaño del canvas y dibuja la serie de precios...\n  }\n\n  window.addEventListener('resize', dibujarSparkline);\n  requestAnimationFrame(dibujarSparkline);\n\n  function actualizar(nuevaMoneda) {\n    // TODO: cambia el precio y la variacion en el DOM ya existente\n  }\n\n  function destruir() {\n    // TODO: deshaz exactamente lo que hizo crear() fuera del propio nodo\n  }\n\n  return { elemento, actualizar, destruir };\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "window.addEventListener('resize', dibujarSparkline);",
      "nota": "Esta línea es la clave de todo el proyecto: el listener se registra en window, no en `elemento`. Cuando `elemento` se quita del DOM, ESTE listener no se entera — sigue vivo, apuntando a una función que sigue teniendo acceso al canvas ya desechado."
    },
    {
      "fragmento": "return { elemento, actualizar, destruir };",
      "nota": "El componente no expone nada más: quien lo usa (dashboard.js) no sabe ni necesita saber que por dentro hay un listener de resize — solo sabe que existen estas tres operaciones. Eso es lo que hace que sea reutilizable de verdad."
    }
  ]
}
```

## El bug real: un listener que no muere con su nodo

Prueba esto en la rama `main` sin completar los TODOs: filtra la lista varias veces seguidas (escribe y borra en el buscador) y luego redimensiona la ventana del navegador.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El síntoma",
  "contenido": "Cada letra que escribes en el buscador hace que algunas tarjetas desaparezcan de la rejilla. Si destruir() no quita su listener de resize, esa tarjeta ya no existe en el DOM — pero su función de redibujado sigue registrada en window para siempre. Tras filtrar varias veces, redimensionar la ventana ejecuta decenas de funciones fantasma, cada una intentando dibujar en un canvas que ya no está en ningún sitio."
}
```

Es exactamente la misma familia de bug que la fuga de memoria de un `setInterval` que nunca se cancela, o un listener de `scroll` que sobrevive al componente que lo puso — y es invisible en una prueba rápida, porque el navegador no avisa de nada: simplemente, cada vez, queda un poco más de trabajo colgado haciendo nada útil.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nfunction destruir() {\n  // TODO: deshaz exactamente lo que hizo crear() fuera del propio nodo\n}\n</script>",
  "despues": "<script>\nfunction destruir() {\n  window.removeEventListener('resize', dibujarSparkline);\n}\n</script>",
  "nota": "removeEventListener solo quita un listener si recibe la MISMA referencia de función que se le pasó a addEventListener — no basta con volver a escribir 'resize' y una función que hace lo mismo. Por eso dibujarSparkline se declara una sola vez dentro de crear() y esa misma referencia es la que usan tanto el addEventListener de arriba como el removeEventListener de destruir()."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Esto no se ve filtrando una sola vez.",
      "texto": "Con una tarjeta de menos el efecto es insignificante. El bug se vuelve visible — y medible — solo tras filtrar/ordenar repetidamente, que es justo el patrón de uso real de un dashboard."
    },
    {
      "titulo": "Un framework no evita este bug por magia.",
      "texto": "React, Vue o Svelte también tendrían que quitar ese listener — la diferencia es que te obligan a escribirlo en un sitio concreto (la función de limpieza de un efecto) en vez de dejarte la opción de olvidarlo en cualquier destruir() a mano."
    }
  ]
}
```

## dashboard.js: decidir qué tarjeta sobrevive a un re-render

La otra pieza nueva no está en el componente, sino en quien lo usa: `panel-cripto/src/pages/dashboard.js` guarda un `Map` con las tarjetas actualmente vivas, y en cada render debe decidir, moneda a moneda, si ya existe (entonces `actualizar()`), es nueva (entonces `crear()`), o ha dejado de estar visible (entonces `destruir()` y se borra del `Map`). La función `reconciliarTarjetas()` de ese archivo tiene el `TODO` de este paso.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst instancias = new Map();\n\nfunction reconciliarTarjetas(rejilla, monedasVisibles) {\n  const idsVisibles = new Set(monedasVisibles.map(({ id }) => id));\n\n  monedasVisibles.forEach((moneda) => {\n    const instancia = instancias.get(moneda.id);\n    if (instancia) instancia.actualizar(moneda);\n    else instancias.set(moneda.id, crearTarjetaMoneda(moneda));\n  });\n\n  instancias.forEach((instancia, id) => {\n    if (!idsVisibles.has(id)) {\n      instancia.destruir();\n      instancias.delete(id);\n    }\n  });\n\n  rejilla.textContent = '';\n  monedasVisibles.forEach(({ id }) => rejilla.append(instancias.get(id).elemento));\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "const instancias = new Map();",
      "nota": "Declarado FUERA de render() a propósito, a nivel de módulo — tiene que sobrevivir entre una llamada a render() y la siguiente, igual que el Map de un caché. Si viviera dentro de render(), se perdería en cada re-render y esto no serviría de nada."
    },
    {
      "fragmento": "rejilla.textContent = '';\n  monedasVisibles.forEach(({ id }) => rejilla.append(instancias.get(id).elemento));",
      "nota": "Vaciar y volver a montar los .elemento no destruye nada: append() sobre un nodo que ya está en otro sitio del DOM simplemente lo MUEVE, conservando sus listeners propios intactos. Solo cambia el orden visual — el trabajo real de crear/actualizar/destruir ya se hizo arriba."
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
      "texto": "tarjetaMoneda.test.js espía addEventListener y removeEventListener y comprueba que destruir() quita la MISMA función que registró crear() — no basta con llamar a removeEventListener con cualquier función."
    },
    {
      "titulo": "¿Marcar y desmarcar un favorito varias veces sigue siendo instantáneo?",
      "texto": "El botón de favorito se actualiza dentro de la propia tarjeta, sin pasar por actualizar() — comprueba que no rehaces esa parte sin necesidad."
    },
    {
      "titulo": "¿El sparkline se ve bien tras redimensionar la ventana?",
      "texto": "Cambia el ancho de la ventana con varias tarjetas visibles — el gráfico debe seguir nítido y proporcionado, no quedarse con el tamaño de cuando se creó."
    },
    {
      "titulo": "¿Filtrar repetidamente no dispara errores en consola?",
      "texto": "Escribe y borra en el buscador varias veces seguidas, rápido — es la prueba de estrés que expuso el bug real de este proyecto."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade una segunda fuente de datos al detalle: el volumen de negociación de las últimas 24 h (`total_volume` ya viene en la respuesta de CoinGecko).
2. Persiste el orden y el filtro elegidos en la URL (`/?orden=variacion-descendente`), para que compartir esa URL reproduzca la misma vista — como el reto equivalente del recetario, pero aplicado a controles en vez de a una búsqueda.
3. Añade un `IntersectionObserver` que solo dibuje el sparkline de las tarjetas realmente visibles en pantalla, y compara con el enfoque actual (dibujar todas de golpe con `requestAnimationFrame`).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "javascript-proyectos/panel-cripto (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/main/panel-cripto",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "javascript-proyectos/panel-cripto (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/solucion/panel-cripto",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "MDN — EventTarget.removeEventListener()",
      "descripcion": "Por qué hace falta pasar la MISMA referencia de función que se usó en addEventListener.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener",
      "etiqueta": "MDN"
    },
    {
      "titulo": "CoinGecko API",
      "descripcion": "Documentación de la API pública usada en este proyecto: precios de mercado, sparklines y el detalle de una moneda.",
      "url": "https://docs.coingecko.com/reference/introduction",
      "etiqueta": "API"
    }
  ]
}
```
