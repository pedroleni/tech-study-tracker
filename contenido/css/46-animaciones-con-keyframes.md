# Animaciones con @keyframes

- **Módulo:** Movimiento e interactividad
- **Slug:** `animaciones-con-keyframes` (autogenerado del título)
- **Orden:** 225
- **Fuentes:** [Animations (web.dev)](https://web.dev/learn/css/animations) — ver `contenido/css/TEMARIO.md` #46

---

## Qué es y para qué sirve

`@keyframes` define un timeline con varios estados intermedios, no solo un punto de partida y uno de llegada como `transition`. Y a diferencia de una transición, una animación con `@keyframes` puede arrancar sola al cargar la página, sin necesitar ningún `:hover`, `:focus` ni cambio de clase por JavaScript.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita un timeline, no solo dos estados",
  "roles": [
    { "etiqueta": "Quien anima con varios estados", "rol": "Definir un timeline con @keyframes", "descripcion": "Una animación puede pasar por 0%, 25%, 50%, 75% y 100% — muchos más puntos que los dos de una transición." },
    { "etiqueta": "Quien anima sin necesitar un trigger", "rol": "Que arranque sola, sin hover ni JS", "descripcion": "A diferencia de transition, una animación con @keyframes puede reproducirse automáticamente al cargar la página." },
    { "etiqueta": "Quien controla la animación desde JS", "rol": "Pausar y reanudar bajo demanda", "descripcion": "animation-play-state permite pausar o reanudar una animación con un simple cambio de clase, sin reiniciarla desde cero." }
  ]
}
```

## transition vs animation: la diferencia real

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos estados frente a un timeline completo",
  "contenido": "transition interpola entre DOS valores, y necesita un cambio de estado real (:hover, :focus, una clase de JS) para dispararse. Una animación con @keyframes define un timeline con TANTOS puntos intermedios como haga falta, y puede empezar a reproducirse sola, sin ningún trigger — perfecta para indicadores de carga, efectos de entrada, o cualquier movimiento que no dependa de una interacción."
}
```

## @keyframes: from/to

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @keyframes aparecer {\n    from {\n      opacity: 0;\n      transform: translateY(20px);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@keyframes aparecer {", "nota": "aparecer es un identificador propio, sensible a mayúsculas — se referencia después con animation-name o dentro del shorthand animation." },
    { "fragmento": "from {", "nota": "from equivale a 0% del timeline; to equivale a 100%. Son un atajo para el caso más simple: solo un punto de partida y uno de llegada." }
  ]
}
```

## @keyframes: varios puntos con porcentajes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @keyframes pulso {\n    0% {\n      transform: scale(1);\n      opacity: 1;\n    }\n    50% {\n      transform: scale(1.4);\n      opacity: 0.4;\n    }\n    100% {\n      transform: scale(1);\n      opacity: 1;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "50% {\n      transform: scale(1.4);\n      opacity: 0.4;\n    }", "nota": "A mitad del timeline, no solo al principio o al final — con porcentajes se pueden definir tantos puntos intermedios como haga falta, cada uno con sus propios valores." }
  ]
}
```

## Reproducir la animación: name, duration, timing-function, delay

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    animation-name: pulso;\n    animation-duration: 2s;\n    animation-timing-function: ease-in-out;\n    animation-delay: 500ms;\n  }\n\n  .pasos {\n    animation-timing-function: steps(10, end);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation-name: pulso;", "nota": "Referencia al @keyframes por su nombre. Sin esto, ninguna de las demás propiedades animation-* tiene nada que reproducir." },
    { "fragmento": "animation-timing-function: steps(10, end);", "nota": "steps() divide el timeline en tramos discretos en vez de una curva continua — útil para animaciones tipo sprite-sheet, con saltos visibles en vez de movimiento fluido." }
  ]
}
```

## Repetir: iteration-count y direction

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .cargando {\n    animation: pulso 1.5s ease-in-out infinite;\n  }\n\n  .rebote {\n    animation: pulso 1.5s ease-in-out infinite alternate;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation: pulso 1.5s ease-in-out infinite;", "nota": "infinite repite la animación sin límite. Por defecto (animation-direction: normal), cada repetición vuelve a empezar desde 0%, con un salto brusco al llegar a 100%." },
    { "fragmento": "animation: pulso 1.5s ease-in-out infinite alternate;", "nota": "alternate invierte la dirección en cada repetición a partir de la segunda: adelante, atrás, adelante... sin el salto brusco entre ciclos." }
  ]
}
```

## animation-fill-mode: qué pasa antes y después

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .sin-retener {\n    animation: deslizar 200ms ease-out;\n  }\n\n  .retiene-el-final {\n    animation: deslizar 200ms ease-out forwards;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".sin-retener {\n    animation: deslizar 200ms ease-out;\n  }", "nota": "Sin fill-mode (por defecto, none), al terminar la animación el elemento vuelve a su estilo BASE, declarado fuera de @keyframes — no se queda en el último frame." },
    { "fragmento": ".retiene-el-final {\n    animation: deslizar 200ms ease-out forwards;\n  }", "nota": "forwards mantiene los valores del ÚLTIMO keyframe (100% o to) una vez termina la animación, en vez de volver al estilo base." }
  ]
}
```

## Verlo en vivo: fill-mode retiene (o no) el estado final

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"padding: 20px; font-family: sans-serif;\">\n  <style>\n    @keyframes deslizar { from { transform: translateX(0); background: #94a3b8; } to { transform: translateX(120px); background: #7c3aed; } }\n    .caja { width: 50px; height: 50px; border-radius: 8px; background: #94a3b8; animation: deslizar 200ms ease-out; }\n  </style>\n  <div class=\"caja\"></div>\n</div>",
  "despues": "<div style=\"padding: 20px; font-family: sans-serif;\">\n  <style>\n    @keyframes deslizar { from { transform: translateX(0); background: #94a3b8; } to { transform: translateX(120px); background: #7c3aed; } }\n    .caja { width: 50px; height: 50px; border-radius: 8px; background: #94a3b8; animation: deslizar 200ms ease-out forwards; }\n  </style>\n  <div class=\"caja\"></div>\n</div>",
  "nota": "La misma animación de 200ms, ya terminada en las dos capturas (el tiempo suficiente para completarse pasó antes de la foto). Antes: sin fill-mode, la caja volvió a su posición y color BASE (gris, sin desplazar) al acabar. Después: con forwards, la caja se quedó con los valores del último keyframe (morada, desplazada 120px) — el mismo timeline, distinto estado final."
}
```

## animation-play-state y el shorthand completo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .pausada {\n    animation-play-state: paused;\n  }\n\n  .caja {\n    animation: pulso 2s ease-in-out infinite alternate 0s both;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation-play-state: paused;", "nota": "Pausa la animación en el punto exacto donde estaba — útil para controlarla desde JavaScript, alternando entre running y paused con una clase, sin reiniciarla desde 0%." },
    { "fragmento": "animation: pulso 2s ease-in-out infinite alternate 0s both;", "nota": "El shorthand, en orden: NAME, DURATION, TIMING-FUNCTION, DELAY, ITERATION-COUNT, DIRECTION, FILL-MODE — aunque en la práctica el navegador tolera bastante flexibilidad en el orden de los valores con palabra clave." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @keyframes crecer {\n    from { transform: scale(1); }\n    to { transform: scale(1.5); }\n  }\n  .caja {\n    animation: crecer 2s ease-in-out infinite alternate;\n  }\n</style>",
  "opciones": [
    "Cada repetición empieza siempre desde cero, saltando de golpe de 1.5 de vuelta a 1",
    "Las repeticiones alternan de dirección: hacia adelante, luego hacia atrás, sin saltos bruscos entre ciclos",
    "alternate no tiene ningún efecto cuando animation-iteration-count es infinite"
  ],
  "correcta": 1,
  "explicacion": "alternate invierte la dirección en cada repetición a partir de la segunda: la primera va de scale(1) a scale(1.5), la segunda de vuelta de 1.5 a 1, y así sucesivamente — sin el salto brusco que produciría animation-direction: normal en un bucle infinito."
}
```

## Lo que animation NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "animation y transition son básicamente lo mismo, solo con nombres distintos",
      "realidad": "transition necesita un cambio de estado real entre dos valores; animation define un timeline con varios estados vía @keyframes y puede arrancar sola, sin ningún trigger."
    },
    {
      "mito": "Sin animation-fill-mode, el elemento se queda en el último frame al terminar",
      "realidad": "Por defecto (none), al terminar la animación el elemento vuelve a su estilo base declarado fuera de @keyframes — hace falta forwards para retener el último frame."
    },
    {
      "mito": "animation-iteration-count solo acepta números enteros",
      "realidad": "Acepta valores decimales (como 2.5, para detenerse a mitad de la última repetición) además de infinite."
    },
    {
      "mito": "alternate hace que la primera repetición empiece desde el final",
      "realidad": "La primera repetición siempre va hacia adelante (normal); alternate solo invierte la dirección a partir de la segunda repetición en adelante."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el comportamiento por defecto con animation-fill-mode: forwards.", "texto": "Sin forwards, el elemento vuelve a su estado base al terminar la animación." },
    { "titulo": "Usar animation cuando en realidad hace falta una transición disparada por :hover.", "texto": "Si solo hay dos estados y un trigger claro, transition suele ser más simple." },
    { "titulo": "Olvidar animation-iteration-count: infinite.", "texto": "Sin él, la animación se reproduce una sola vez y luego se detiene." },
    { "titulo": "No respetar prefers-reduced-motion en animaciones llamativas.", "texto": "Ignora una preferencia de accesibilidad real de quien navega." }
  ]
}
```

## Ejercicios

1. Escribe un `@keyframes` llamado `aparecer` que vaya de `opacity: 0` a `opacity: 1`.
2. Aplica esa animación a una clase, con duración `400ms` y `animation-fill-mode: forwards`.
3. Explica la diferencia entre `animation-direction: alternate` y `animation-direction: reverse`.
4. Escribe una regla que pause una animación con `animation-play-state`, pensada para controlarse después desde JavaScript.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un @keyframes llamado aparecer que vaya de opacity 0 a 1 (ejercicio 1) y aplícalo a esta caja con duración 400ms y animation-fill-mode: forwards (ejercicio 2).",
  "html": "<div class=\"caja-anima\">Debería aparecer con la animación</div>",
  "css": "/* @keyframes aparecer {\n  from { opacity: 0; }\n  to { opacity: 1; }\n} */\n.caja-anima {\n  background: #7c3aed; color: white; padding: 16px;\n  /* animation: aparecer 400ms forwards; */\n}",
  "pestañaInicial": "css"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Animations",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre @keyframes, las propiedades animation-*, el shorthand animation y la diferencia con transition.",
      "url": "https://web.dev/learn/css/animations",
      "etiqueta": "web.dev"
    }
  ]
}
```
