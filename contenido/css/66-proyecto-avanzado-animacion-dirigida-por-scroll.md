# Proyecto avanzado: animación dirigida por scroll sin JavaScript

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-animacion-dirigida-por-scroll-sin-javascript` (autogenerado del título)
- **Orden:** 335
- **Repositorio:** [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos) (carpeta `terral`)
- **Requiere:** Scroll dirigido (lección 49), `@property` (lección 50), `position: sticky` (lección 29) y el proyecto del descenso (lección 63)

---

## Qué vas a construir

La web de un estudio de arquitectura con el tipo de animación que se ve en los estudios de diseño caros: parallax de varios planos, una galería que corre en horizontal mientras la página se queda anclada, fotos que se descubren con cortina y un número que sube solo. Todo eso, **con catorce líneas de JavaScript que además solo se ejecutan si el navegador no soporta lo nuevo**.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/ee5ab3b823415a397815ba6a5596a96e0c2d38e85afddb177bfab510bdf86f7a.mp4",
  "poster": "https://www.techstudytracker.com/img/91473470ce419ed32534dd81f17902c0ce0e44f86d8dff878546d26c522e1258.jpg",
  "descripcion": "El titular se levanta tras su máscara, el parallax separa los planos, el muro se construye capa a capa y la galería corre en horizontal con la sección anclada.",
  "titulo": "La página entera, a paso lento"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/css-proyectos (carpeta terral) — la rama main tiene el maquetado, el contenido y las fotografías ya listos, y cuatro TODO donde va la animación. La rama solucion tiene la implementación completa."
}
```

### Si es la primera vez que sales del navegador en este curso

- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com),
  con terminal integrada en `Terminal` → `New Terminal`.
- **El código**:
  - **Con git**: `git clone https://github.com/pedroleni/css-proyectos.git`
  - **Sin git**: en [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos),
    **Code** → **Download ZIP**.
- **Node.js** solo si quieres servirlo con `npx`; con doble clic también abre.

### Del cero al proyecto abierto en el navegador

1. **Abre la carpeta `terral/`** en VS Code (`Archivo` → `Abrir carpeta...`).
2. Verás `index.html` y una carpeta `assets/` con cinco fotos. **No crees nada**: el trabajo es completar el CSS que ya está escrito a medias.
3. **Busca los `TODO`** con `Cmd`/`Ctrl` + `F`. Son cuatro y están en el bloque `<style>`.
4. **Ábrelo en el navegador**, o sírvelo con `npx serve .`.
5. **El ciclo**: editas, guardas con `Cmd`/`Ctrl` + `S`, refrescas con `Cmd`/`Ctrl` + `R` y **haces scroll despacio** — aquí el resultado no se ve quieto, se ve al bajar.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Necesitas un navegador que lo soporte",
  "contenido": "Las animaciones dirigidas por scroll van en Chrome y Edge desde la 115 y en Safari desde la 18; en Firefox siguen tras un flag. Si tu navegador no las admite no verás el efecto, aunque el código sea correcto — y la página seguirá siendo perfectamente legible, porque lleva un respaldo."
}
```

## La idea: el scroll como línea de tiempo

Una animación normal avanza con el reloj. Una animación dirigida por scroll avanza con **la posición de la barra de desplazamiento**: si paras, se para; si subes, va hacia atrás. No hay temporizador, no hay listener, no hay recálculo en JavaScript.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres piezas que hay que entender",
  "roles": [
    { "etiqueta": "animation-timeline: scroll()", "rol": "Avanza con la barra de la página", "descripcion": "El progreso de 0 a 100 % es el recorrido completo del contenedor de scroll. Sirve para cosas globales: una barra de progreso, un fondo que se mueve." },
    { "etiqueta": "animation-timeline: view()", "rol": "Avanza según cruza ESE elemento", "descripcion": "El progreso es cuánto ha atravesado la pantalla el propio elemento animado. Es el que se usa para revelados y parallax, porque cada elemento lleva su propio reloj." },
    { "etiqueta": "animation-range", "rol": "Qué tramo cuenta", "descripcion": "Acota dónde empieza y acaba. `entry` es mientras asoma por abajo, `cover` todo el rato que está a la vista, `contain` solo mientras llena la pantalla entera." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "Por qué esto no va a tirones",
  "contenido": "Un parallax hecho con addEventListener('scroll') corre en el hilo principal: si el navegador está ocupado, el efecto se atasca. Estas animaciones las resuelve el compositor, el mismo sitio donde se resuelven las transformaciones — siguen finas aunque el hilo principal esté bloqueado."
}
```

## Paso 1: el parallax de las fotos (`.marco img`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n.marco { position: relative; overflow: hidden; }\n\n.marco img {\n  width: 100%;\n  height: 152%;\n  object-fit: cover;\n  animation: deriva linear both;\n  animation-timeline: view();\n  animation-range: cover 0% cover 100%;\n}\n\n@keyframes deriva {\n  from { transform: translateY(-34%) scale(1.14); }\n  to   { transform: translateY(0%)   scale(1.0); }\n}\n</style>",
  "anotaciones": [
    { "fragmento": "height: 152%;", "nota": "Aquí está la clave y no en la animación: la imagen tiene que sobrar respecto a su marco. Si midiera 100 % no habría nada que desplazar y el parallax no existiría — se vería moverse un hueco vacío por debajo." },
    { "fragmento": "animation-timeline: view();", "nota": "Cada foto lleva su propio reloj, atado a su propio paso por la pantalla. Por eso no hay que calcular posiciones ni llevar la cuenta de cuál está visible: el navegador lo hace por cada elemento." },
    { "fragmento": "animation-range: cover 0% cover 100%;", "nota": "cover es el tramo completo en que el elemento toca la pantalla, desde que asoma por abajo hasta que desaparece por arriba. Con entry el efecto acabaría demasiado pronto, nada más entrar." },
    { "fragmento": "from { transform: translateY(-34%) scale(1.14); }", "nota": "El escalado que se va asentando de 1,14 a 1 es la mitad del efecto. Sin él, el desplazamiento solo parece un deslizamiento; con él, parece que la foto tiene profundidad y se acomoda." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "/* Misma animación, pero con la imagen a su tamaño exacto */\n.marco img {\n  height: 100%;\n  animation: deriva linear both;\n  animation-timeline: view();\n}",
  "opciones": [
    "Se ve igual: el navegador escala la imagen para que sobre",
    "Al desplazarse deja ver el fondo del marco por debajo",
    "La animación se ignora porque no hay recorrido"
  ],
  "correcta": 1,
  "explicacion": "translateY(-34%) mueve la imagen hacia arriba de verdad. Si mide exactamente lo mismo que su marco, al subir deja destapado el 34 % inferior y se ve el fondo. El sobrante de altura no es un detalle de ajuste: es lo que hace posible el efecto."
}
```

## Paso 2: la galería que corre en horizontal (`.galeria` y `.carril`)

Este es el efecto que más impresiona y el que más se malinterpreta: la página **no** cambia de dirección. Lo que ocurre es que la sección mide varias pantallas de alto, se queda pegada con `position: sticky`, y su hijo se desplaza de lado según avanza ese tramo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n.galeria {\n  position: relative;\n  height: 360vh;\n  view-timeline: --gal block;\n}\n\n.galeria__pista {\n  position: sticky;\n  top: 0;\n  height: 100vh;\n  overflow: hidden;\n}\n\n.carril {\n  display: flex;\n  width: max-content;\n  animation: correr linear both;\n  animation-timeline: --gal;\n  animation-range: contain 0% contain 100%;\n}\n\n@keyframes correr {\n  to { transform: translateX(calc(-100% + 100vw - clamp(48px,12vw,152px))); }\n}\n</style>",
  "anotaciones": [
    { "fragmento": "height: 360vh;", "nota": "La pista de scroll. Estas tres pantallas y media de alto son el «combustible»: cuanto más alta sea la sección, más despacio se recorre la galería. Es el mando de velocidad del efecto." },
    { "fragmento": "view-timeline: --gal block;", "nota": "La sección PUBLICA su propia línea de tiempo con un nombre. Sus descendientes pueden engancharse a ella sin saber nada del scroll global — que es justo lo que hace falta, porque el carril se mueve según la SECCIÓN cruza la pantalla, no según la página." },
    { "fragmento": "position: sticky;\n  top: 0;\n  height: 100vh;", "nota": "La pista se queda clavada ocupando la pantalla mientras la sección, mucho más alta, sigue pasando por detrás. Sin esto no habría anclaje y el carril se iría hacia arriba con el resto." },
    { "fragmento": "animation-range: contain 0% contain 100%;", "nota": "contain es exactamente el tramo en que la sección llena la pantalla entera, es decir, el tiempo que está anclada. Con cover el desplazamiento empezaría antes de que se quedara quieta y se vería un salto." },
    { "fragmento": "to { transform: translateX(calc(-100% + 100vw - clamp(48px,12vw,152px))); }", "nota": "Se desplaza su propio ancho menos lo que cabe en pantalla, restando el relleno lateral. Así la última lámina acaba justo en el borde: ni se queda a medias ni se pasa dejando un hueco." }
  ]
}
```

## Paso 3: un número que cuenta solo, sin JavaScript (`.cuenta`)

Esta es la parte que más sorprende. Animar un contador siempre había obligado a usar JavaScript, porque CSS no sabe interpolar un valor arbitrario. La clave es **registrar la propiedad** para que el navegador conozca su tipo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n@property --n {\n  syntax: \"<integer>\";\n  initial-value: 0;\n  inherits: false;\n}\n\n@supports (animation-timeline: view()) {\n  .cuenta .literal { display: none; }\n  .cuenta::after { content: counter(c) attr(data-sufijo); }\n\n  .cuenta {\n    counter-reset: c var(--n);\n    animation: contar linear both;\n    animation-timeline: view();\n    animation-range: entry 20% cover 45%;\n  }\n\n  .cuenta[data-fin=\"5\"] { --destino: 5; }\n\n  @keyframes contar { to { --n: var(--destino); } }\n}\n</style>",
  "anotaciones": [
    { "fragmento": "syntax: \"<integer>\";", "nota": "Todo depende de esta línea. Una variable CSS normal es texto para el navegador, y el texto no se puede interpolar: saltaría de 0 a 5 de golpe. Al declararla como entero, el navegador sabe qué hay entre medias y la anima." },
    { "fragmento": "counter-reset: c var(--n);", "nota": "El puente entre el número animado y algo que se pueda leer en pantalla: un contador CSS toma su valor de la variable, y como la variable cambia en cada fotograma, el contador cambia con ella." },
    { "fragmento": ".cuenta::after { content: counter(c) attr(data-sufijo); }", "nota": "counter() es de las poquísimas funciones que se pueden usar dentro de content. El sufijo («%», «km») viene de un atributo para no tener que escribir una regla por cada unidad." },
    { "fragmento": "@supports (animation-timeline: view()) {", "nota": "Todo el bloque va dentro de un @supports, y el número de verdad está escrito en el HTML dentro de un span. Donde no haya soporte se ve el número normal y ya está; no se ve un cero ni un hueco." }
  ]
}
```

## El respaldo: que funcione igual sin soporte

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n(function () {\n  var soporta = window.CSS && CSS.supports &&\n                CSS.supports('animation-timeline', 'view()');\n  if (soporta) return;\n\n  document.documentElement.classList.add('sin-timeline');\n\n  var obs = new IntersectionObserver(function (es) {\n    es.forEach(function (e) {\n      if (e.isIntersecting) {\n        e.target.classList.add('vista');\n        obs.unobserve(e.target);\n      }\n    });\n  }, { threshold: 0.12 });\n\n  document.querySelectorAll('.entra, .capa').forEach(function (el) {\n    obs.observe(el);\n  });\n})();\n</script>",
  "anotaciones": [
    { "fragmento": "if (soporta) return;", "nota": "La línea más importante del archivo. Si el navegador entiende las animaciones dirigidas por scroll, este script no hace absolutamente nada: ni observadores, ni clases, ni trabajo en el hilo principal. El JavaScript es el plan B, no el plan A." },
    { "fragmento": "document.documentElement.classList.add('sin-timeline');", "nota": "Una sola clase en la raíz activa un bloque de CSS que desmonta el parallax, convierte la galería anclada en una tira con scroll lateral normal y sustituye las animaciones por transiciones. Degradar no es quitar el efecto: es cambiarlo por otro que sí funcione." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Y el bloque que casi todo el mundo olvida",
  "contenido": "prefers-reduced-motion no es un detalle de cortesía: hay personas a las que este tipo de movimiento les provoca mareo real. En este proyecto ese bloque apaga TODO — parallax, cortinas, galería horizontal y contador — y deja una página quieta y completa, no una versión mutilada."
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Se mueve al hacer scroll hacia arriba?", "texto": "Es la prueba de que está atado al scroll y no a un temporizador: al subir, la animación debe ir hacia atrás. Si solo avanza, algo sigue gobernado por el reloj." },
    { "titulo": "¿La galería empieza a correr justo cuando se ancla?", "texto": "Si se mueve antes de quedarse quieta, tienes cover donde debería haber contain." },
    { "titulo": "¿La última lámina queda pegada al borde?", "texto": "Ni a medias ni pasada. Si no cuadra, revisa el 100vw y el relleno lateral que se resta en el calc()." },
    { "titulo": "¿El número aparece aunque no haya soporte?", "texto": "Abre la página en Firefox sin el flag: debe verse el 5 % de toda la vida, no un cero ni un espacio en blanco." },
    { "titulo": "¿Con prefers-reduced-motion activo se sigue leyendo todo?", "texto": "Actívalo en el sistema operativo y recarga. No debe faltar ni una foto ni un párrafo: solo el movimiento." }
  ]
}
```

## Retos para ampliarlo

1. Haz que la cinta corrida cambie de velocidad según la velocidad del scroll. Pista: necesitarás una propiedad registrada de tipo `<number>` y pensar qué línea de tiempo la gobierna.
2. Añade una sexta lámina a la galería. ¿Hay que tocar el `calc()` del desplazamiento? ¿Y el `360vh`? Razónalo antes de probarlo.
3. Convierte el revelado de las fotos en un barrido lateral en vez de una cortina de abajo arriba, cambiando solo el `clip-path` de los `@keyframes`.
4. Mide con las herramientas de desarrollador cuántos fotogramas por segundo da la galería horizontal, y compárala con una versión hecha a mano con `addEventListener('scroll')`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "css-proyectos/terral (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO ya puestos.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/main/terral",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "css-proyectos/terral (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/solucion/terral",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "CSS scroll-driven animations",
      "descripcion": "Referencia de MDN sobre animation-timeline, scroll(), view(), animation-range y las líneas de tiempo con nombre.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations",
      "etiqueta": "MDN"
    },
    {
      "titulo": "@property",
      "descripcion": "Cómo registrar una propiedad personalizada para que el navegador conozca su tipo y pueda interpolarla.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@property",
      "etiqueta": "MDN"
    }
  ]
}
```
