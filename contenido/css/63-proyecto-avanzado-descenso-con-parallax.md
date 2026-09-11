# Proyecto avanzado: descenso animado con parallax real

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-descenso-animado-con-parallax-real` (autogenerado del título)
- **Orden:** 320
- **Repositorio:** [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos) (carpeta `descenso-challenger`)
- **Requiere:** Custom properties (lección 22), `@keyframes` y transiciones (lecciones 46-48), scroll-driven animations (lección 49), `clamp()` y unidades responsive (lección 30)

---

## Qué vas a construir

Una landing de una sola página donde el scroll **es** la profundidad: bajas 10.994 metros reales, desde la superficie hasta el fondo de la fosa de las Marianas, con el color del agua oscureciéndose sin saltos, un instrumento fijo que marca la profundidad de verdad, y una fauna que se mueve en capas de parallax — cada criatura a su propia velocidad, como si unas estuvieran más cerca que otras.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/14825ea0fdc4c0cfe64f965d137edd26b8aabbc97a8ed3e6f7e9caf78ae80bff.mp4",
  "poster": "https://www.techstudytracker.com/img/0fb3747e0b3a358bfd93344d1135639bd74a2cd883fea603d365d92b187113b1.jpg",
  "descripcion": "Recorrido completo del descenso, a paso lento: el agua se oscurece sin saltos, las criaturas pasan a distinta velocidad por el parallax y el instrumento cuenta los metros hasta el fondo.",
  "titulo": "El descenso completo, a 1080p"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/css-proyectos (carpeta descenso-challenger) — la rama main tiene el HTML, el CSS y la estructura de datos ya terminados, y tres funciones de JavaScript con la firma y un TODO explicando qué hacer. La rama solucion tiene la implementación completa, por si te atascas."
}
```

### Si es la primera vez que sales del navegador en este curso

- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`), así que no hace falta buscar la
  terminal del sistema operativo por separado.
- **Node.js**, solo para poder usar `npx` más abajo (no es obligatorio:
  este proyecto también funciona sin servidor, ver el paso 4). Descarga
  la versión **LTS** desde [nodejs.org](https://nodejs.org) e instálala
  como cualquier otro programa. Para comprobar que quedó bien
  instalada, abre una terminal y escribe `node --version` — debería
  imprimir algo como `v22.x.x`.
- **El código del proyecto**, de una de estas dos formas:
  - **Con git** (si ya lo tienes instalado):
    `git clone https://github.com/pedroleni/css-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

### Del cero al proyecto abierto en el navegador, paso a paso

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `descenso-challenger/` de
   dentro de lo que clonaste o descomprimiste (la de este proyecto en
   concreto, no la del repositorio `css-proyectos` entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   un único `index.html`. Ábrelo haciendo clic — no crees ningún
   archivo nuevo, todo el trabajo es editar el que ya existe.
3. **Localiza los tres `TODO`** dentro de `index.html`: usa `Cmd`/`Ctrl` + `F`
   dentro del editor y busca "TODO" — te lleva directo a las tres
   funciones que hay que completar, en el orden en que aparecen abajo.
4. **Ábrelo en el navegador.** Este proyecto no usa módulos ES ni
   `localStorage`, así que funciona igual haciendo doble clic sobre
   `index.html` que sirviéndolo por HTTP — pero servirlo es el hábito
   correcto para cualquier proyecto real, así que abre la terminal
   integrada (`` Ctrl+` ``, igual en Windows, Linux y Mac, ya situada en
   la carpeta del proyecto) y escribe `npx serve .` (o
   `python3 -m http.server 8000` si no tienes Node instalado). Abre la
   URL que imprime la terminal (algo como `http://localhost:3000`) — no
   la adivines, cópiala de ahí.
5. **El ciclo de trabajo**: edita una función en `index.html`, guarda
   con `Cmd`/`Ctrl` + `S`, y vuelve al navegador — aquí hace falta
   refrescar la página a mano (`Cmd`/`Ctrl` + `R`) para ver el cambio,
   porque `npx serve` no recarga solo.

## Por qué esto no cabe en un editor en vivo

Los bloques `editor-en-vivo` de esta web viven dentro de un `<iframe sandbox="allow-scripts">`, con una altura fija pensada para mostrar un fragmento — no para hacer scroll de verdad a lo largo de una página completa. El efecto que vas a construir depende justo de lo que ese sandbox no puede dar:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que necesita este proyecto y un iframe de laboratorio no da",
  "roles": [
    {
      "etiqueta": "Una página larga de verdad",
      "rol": "Miles de píxeles de scroll real",
      "descripcion": "El efecto se construye sobre window.scrollY en un documento de varias pantallas de alto — un iframe pensado para mostrar un fragmento pequeño no reproduce esa escala."
    },
    {
      "etiqueta": "requestAnimationFrame continuo",
      "rol": "Un bucle que corre todo el rato",
      "descripcion": "El canvas de partículas necesita repintarse en cada frame, no solo cuando cambia algo — es exactamente el tipo de coste que un sandbox de vista previa está pensado para evitar."
    }
  ]
}
```

Por eso este proyecto se sale del sandbox: ábrelo en su propia pestaña, con su propia barra de scroll.

## Arquitectura del proyecto

Un único `index.html` con tres piezas ya completas y tres funciones por implementar — el proyecto es sobre las técnicas de animación, no sobre organizar ficheros.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué ya está hecho y qué falta",
  "roles": [
    { "etiqueta": "HTML y CSS", "rol": "Completos", "descripcion": "Todo el marcado, los custom properties de color y tipografía, y las reglas de layout (el HUD fijo, las fichas, la escena de fondo) ya están escritos." },
    { "etiqueta": "Los datos", "rol": "Completos", "descripcion": "PARADAS (los colores de agua por profundidad), ZONAS y las criaturas del HTML con sus atributos data-d/data-v ya están puestos." },
    { "etiqueta": "Tres funciones de JS", "rol": "Con TODO", "descripcion": "colorAgua(), colocarFauna() y sembrar()/dibujar() tienen la firma ya puesta — tu trabajo es rellenar la lógica." }
  ]
}
```

## Paso 1: color continuo por profundidad (`colorAgua`)

Abre `index.html` y busca `function colorAgua`. El array `PARADAS` de más arriba en el fichero define siete colores en puntos concretos del recorrido (0 = superficie, 1 = fondo) — la función tiene que devolver el color exacto para cualquier punto intermedio, no solo esos siete.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nvar PARADAS = [\n  { p: 0.00, c: [18, 113, 143] },\n  { p: 0.08, c: [12, 91, 128] },\n  { p: 0.22, c: [8, 62, 99] },\n  { p: 1.00, c: [1, 6, 13] }\n];\n\nfunction colorAgua(p) {\n  if (p <= 0) return PARADAS[0].c;\n  for (var i = 1; i < PARADAS.length; i++) {\n    if (p <= PARADAS[i].p) {\n      var a = PARADAS[i - 1], b = PARADAS[i];\n      var f = (p - a.p) / (b.p - a.p);\n      return [\n        Math.round(a.c[0] + (b.c[0] - a.c[0]) * f),\n        Math.round(a.c[1] + (b.c[1] - a.c[1]) * f),\n        Math.round(a.c[2] + (b.c[2] - a.c[2]) * f)\n      ];\n    }\n  }\n  return PARADAS[PARADAS.length - 1].c;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (p <= PARADAS[i].p) {\n      var a = PARADAS[i - 1], b = PARADAS[i];", "nota": "En cuanto encuentras el primer punto que \"ya pasaste\" (p es menor o igual que su marca), sabes que el color real está entre ese punto y el anterior — a y b son los dos extremos entre los que interpolar." },
    { "fragmento": "var f = (p - a.p) / (b.p - a.p);", "nota": "f es la fracción del hueco entre a y b ya recorrida: 0 justo en a, 1 justo en b, 0.5 a mitad de camino. Es el mismo cálculo que hace un gradiente CSS por dentro, solo que aquí lo escribes tú." },
    { "fragmento": "Math.round(a.c[0] + (b.c[0] - a.c[0]) * f)", "nota": "La fórmula de interpolación lineal, canal a canal (rojo, verde, azul por separado): partir del valor de a y sumarle la fracción f de la distancia hasta b." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "¿Por qué no un gradiente CSS y ya está?",
  "contenido": "Un gradiente CSS interpola en el espacio, no en el tiempo de scroll — no hay forma de decirle \"en este punto exacto del scroll, dame este color como número\" para usarlo también en el instrumento del HUD. Por eso el color se calcula en JavaScript y se aplica como background-color inline: un solo cálculo alimenta dos sitios a la vez."
}
```

## Paso 2: parallax por capas de verdad (`colocarFauna`)

Cada criatura en el HTML lleva dos atributos: `data-d` (en qué punto del recorrido "vive", de 0 a 1) y `data-v` (su velocidad relativa a la del scroll — más baja para las que deben sentirse más lejanas). Aquí es donde eso se convierte en movimiento real.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction colocarFauna() {\n  for (var i = 0; i < bichos.length; i++) {\n    var b = bichos[i];\n    var d = parseFloat(b.getAttribute('data-d'));\n    var v = menosMovimiento ? 1 : parseFloat(b.getAttribute('data-v'));\n    var destino = (d * recorrido - y) * v + alto * 0.5;\n\n    if (destino < -alto * 0.8 || destino > alto * 1.8) {\n      b.style.visibility = 'hidden';\n    } else {\n      b.style.visibility = 'visible';\n      b.style.transform = 'translate3d(0,' + destino.toFixed(1) + 'px,0)';\n    }\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "var destino = (d * recorrido - y) * v + alto * 0.5;", "nota": "d * recorrido es la posición \"natural\" de la criatura en píxeles de scroll total. Restarle y (el scroll actual) da su distancia al viewport; multiplicar esa distancia por v es lo que hace el parallax — con v pequeño, la criatura apenas se mueve respecto a ti aunque sigas bajando." },
    { "fragmento": "if (destino < -alto * 0.8 || destino > alto * 1.8) {\n      b.style.visibility = 'hidden';", "nota": "Ocultar lo que está muy lejos de la pantalla no es cosmético: sin esto, el navegador seguiría recalculando el layout de docenas de elementos posicionados a miles de píxeles de donde miras, en cada frame de scroll." },
    { "fragmento": "b.style.transform = 'translate3d(0,' + destino.toFixed(1) + 'px,0)';", "nota": "translate3d, nunca top o left: mover con transform no dispara ni reflow ni repaint, solo composición — la diferencia entre una animación fluida y una que se nota a tirones al hacer scroll rápido." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<!-- Dos criaturas con la misma d (aparecen en el mismo punto del recorrido) -->\n<div class=\"bicho\" data-d=\"0.5\" data-v=\"0.2\">A</div>\n<div class=\"bicho\" data-d=\"0.5\" data-v=\"0.6\">B</div>\n\n<!-- El usuario sigue haciendo scroll hacia abajo, alejándose del punto 0.5 -->",
  "opciones": [
    "A y B se mueven exactamente igual, porque comparten la misma d",
    "A se queda más rezagada respecto al scroll que B, porque su v es menor",
    "B desaparece antes que A, porque su v es mayor"
  ],
  "correcta": 1,
  "explicacion": "v multiplica la distancia (d * recorrido - y) — con v = 0.2, A recorre solo el 20% de lo que cambia esa distancia; con v = 0.6, B recorre el 60%. Cuanto más pequeña la v, más \"atrás\" se queda la criatura respecto al scroll, el efecto clásico de que lo lejano se mueve menos que lo cercano."
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El mismo parallax de colocarFauna(), en miniatura",
  "consigna": "Este recuadro tiene su propio scroll — bájalo a él (no la página) con la rueda o el dedo. Fíjate en la diferencia: las ✦ del fondo (data-v=\"0.12\") casi no se mueven, los peces del medio (0.4) se mueven algo más, y los del primer plano (0.85) se mueven mucho más rápido. Es exactamente el cálculo de colocarFauna() del proyecto real, aplicado dentro de esta caja en vez de a toda la ventana — por eso el editor en vivo no puede reproducir la versión a pantalla completa, pero sí la técnica.",
  "html": "<div class=\"escaparate\" id=\"escaparate\">\n  <div class=\"capa capa--lejos\" data-v=\"0.12\" style=\"top:40px\">✦&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;✦</div>\n  <div class=\"capa capa--lejos\" data-v=\"0.12\" style=\"top:520px\">✦&nbsp;&nbsp;&nbsp;✦</div>\n  <div class=\"capa capa--lejos\" data-v=\"0.12\" style=\"top:980px\">✦&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;✦</div>\n  <div class=\"capa capa--media\" data-v=\"0.4\" style=\"top:180px\">🐠</div>\n  <div class=\"capa capa--media\" data-v=\"0.4\" style=\"top:640px\">🐡</div>\n  <div class=\"capa capa--media\" data-v=\"0.4\" style=\"top:1080px\">🐠</div>\n  <div class=\"capa capa--cerca\" data-v=\"0.85\" style=\"top:80px\">🐟</div>\n  <div class=\"capa capa--cerca\" data-v=\"0.85\" style=\"top:420px\">🐙</div>\n  <div class=\"capa capa--cerca\" data-v=\"0.85\" style=\"top:900px\">🦑</div>\n  <div class=\"relleno\"></div>\n</div>",
  "css": ".escaparate {\n  position: relative;\n  height: 300px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  border-radius: 12px;\n  background: linear-gradient(to bottom, #2fd4c4 0%, #12718f 25%, #0a4a68 55%, #062b42 80%, #01131f 100%);\n}\n.capa {\n  position: absolute;\n  left: 0;\n  right: 0;\n  text-align: center;\n  pointer-events: none;\n  will-change: transform;\n}\n.capa--lejos { font-size: 1.1rem; letter-spacing: .6rem; color: #cdeef0; opacity: .5; }\n.capa--media { font-size: 1.8rem; filter: drop-shadow(0 0 6px rgba(139,247,208,.45)); }\n.capa--cerca { font-size: 2.6rem; filter: drop-shadow(0 2px 5px rgba(0,0,0,.4)); }\n.relleno { height: 1400px; }",
  "js": "const escaparate = document.getElementById('escaparate');\nconst capas = Array.from(document.querySelectorAll('.capa'));\n\nfunction colocar() {\n  const y = escaparate.scrollTop;\n  for (const capa of capas) {\n    const v = parseFloat(capa.dataset.v);\n    const destino = -y * v;\n    capa.style.transform = 'translate3d(0,' + destino.toFixed(1) + 'px,0)';\n  }\n}\n\nescaparate.addEventListener('scroll', colocar, { passive: true });\ncolocar();",
  "pestañaInicial": "js"
}
```

## Paso 3: nieve marina en canvas (`sembrar` y `dibujar`)

El fondo de toda la página es un `<canvas>` con partículas cayendo sin parar. `sembrar()` las crea una vez (y cada vez que cambia el tamaño de ventana); `dibujar()` se llama en cada frame para pintarlas y, si toca, hacerlas avanzar.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction sembrar() {\n  motas = [];\n  var cuantas = Math.round((window.innerWidth * window.innerHeight) / 11000);\n  cuantas = Math.max(40, Math.min(150, cuantas));\n  for (var i = 0; i < cuantas; i++) {\n    motas.push({\n      x: Math.random() * window.innerWidth,\n      y: Math.random() * window.innerHeight,\n      r: 0.5 + Math.random() * 2.1,\n      vel: 0.12 + Math.random() * 0.5,\n      vaiven: Math.random() * Math.PI * 2,\n      alfa: 0.16 + Math.random() * 0.42\n    });\n  }\n}\n\nfunction dibujar(animando) {\n  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);\n  for (var i = 0; i < motas.length; i++) {\n    var m = motas[i];\n    ctx.beginPath();\n    ctx.globalAlpha = m.alfa;\n    ctx.fillStyle = '#dff3f7';\n    ctx.arc(m.x + Math.sin(m.vaiven) * 6, m.y, m.r, 0, Math.PI * 2);\n    ctx.fill();\n    if (animando) {\n      m.y += m.vel;\n      m.vaiven += 0.006;\n      if (m.y - m.r > window.innerHeight) {\n        m.y = -m.r;\n        m.x = Math.random() * window.innerWidth;\n      }\n    }\n  }\n  ctx.globalAlpha = 1;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "var cuantas = Math.round((window.innerWidth * window.innerHeight) / 11000);\n  cuantas = Math.max(40, Math.min(150, cuantas));", "nota": "La cantidad se deriva del área real de la ventana, no de un número fijo — una pantalla grande no se queda con un fondo vacío ni una pequeña se satura, y los límites (40 a 150) evitan los dos extremos." },
    { "fragmento": "ctx.arc(m.x + Math.sin(m.vaiven) * 6, m.y, m.r, 0, Math.PI * 2);", "nota": "El seno de una fase que avanza (vaiven) produce el balanceo lateral: cada mota oscila ±6px alrededor de su x mientras cae, en vez de caer en línea perfectamente recta." },
    { "fragmento": "if (m.y - m.r > window.innerHeight) {\n        m.y = -m.r;\n        m.x = Math.random() * window.innerWidth;\n      }", "nota": "En vez de crear y destruir partículas sin parar (caro para el recolector de basura), cada mota que sale por abajo se recicla arriba con una x nueva — el mismo número de objetos vive para siempre." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿El agua se oscurece sin saltos entre secciones?", "texto": "Si colorAgua() solo funciona bien en las siete paradas exactas y da tirones entre medias, revisa el cálculo de f — debe variar de forma continua, no a saltos." },
    { "titulo": "¿Las criaturas lejanas se mueven menos que las cercanas?", "texto": "Compara visualmente una con data-v baja y otra con data-v alta mientras haces scroll — si se mueven igual, colocarFauna() no está aplicando v de verdad." },
    { "titulo": "¿El activador prefers-reduced-motion detiene el parallax relativo?", "texto": "Actívalo en las preferencias del sistema operativo y recarga: con menosMovimiento activo, v debería tratarse siempre como 1 (movimiento normal de scroll, sin desfase) en vez de la velocidad propia de cada criatura." },
    { "titulo": "¿El canvas no se congela ni se dispara en número de partículas al redimensionar la ventana?", "texto": "sembrar() se llama de nuevo en cada resize — comprueba que de verdad vacía motas primero, o las partículas se irán acumulando sin límite." }
  ]
}
```

## Retos para ampliarlo

1. Añade una cuarta parada de color justo antes del fondo, con un tono ligeramente distinto para simular una capa de sedimento en suspensión — ¿qué tienes que tocar además de `PARADAS`?
2. Haz que las motas más grandes (`r` mayor) caigan más despacio que las pequeñas, como pasaría de verdad con partículas de distinto peso en el agua.
3. Añade una criatura nueva con su propio `data-d`/`data-v` y compórtate como si no supieras el resultado: predice antes de probarlo si se moverá más rápido o más despacio que las que ya hay.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "css-proyectos/descenso-challenger (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO ya puestos.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/main/descenso-challenger",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "css-proyectos/descenso-challenger (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/solucion/descenso-challenger",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Using the Web Animations API",
      "descripcion": "Guía de referencia de MDN sobre requestAnimationFrame y las técnicas de animación imperativa que usa este proyecto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API",
      "etiqueta": "MDN"
    }
  ]
}
```
