# Animaciones dirigidas por scroll

- **Módulo:** Movimiento e interactividad
- **Slug:** `animaciones-dirigidas-por-scroll` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [CSS scroll-driven animations (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) — ver `contenido/css/TEMARIO.md` #49

---

## Qué es y para qué sirve

Todas las animaciones de las lecciones anteriores avanzan con el TIEMPO — un segundo tras otro, sin importar lo que haga la persona. `animation-timeline` cambia esa base: en vez de tiempo, la animación avanza con el PROGRESO DEL SCROLL. Una barra de progreso de lectura, o un elemento que se revela al entrar en pantalla, dejan de necesitar ningún listener de JavaScript.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el scroll dirija la animación, no el reloj",
  "roles": [
    { "etiqueta": "Quien construye barras de progreso", "rol": "Que reflejen cuánto se ha bajado", "descripcion": "Una barra que crece según el scroll real de la página, no según un tiempo fijo que no tiene relación con lo que la persona hizo." },
    { "etiqueta": "Quien revela contenido al hacer scroll", "rol": "Animar la entrada de un elemento", "descripcion": "view() dispara la animación justo cuando un elemento concreto entra o sale del viewport, sin medir posiciones a mano." },
    { "etiqueta": "Quien anima sin listeners de JS", "rol": "Delegar el cálculo del progreso al navegador", "descripcion": "El navegador calcula el progreso del scroll internamente — nada de scroll event listeners ni cálculos de posición en JavaScript." }
  ]
}
```

## El cambio de base: tiempo frente a scroll

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "animation-timeline sustituye qué marca el ritmo",
  "contenido": "Una animación normal usa el timeline por defecto: avanza con animation-duration, segundo a segundo. animation-timeline reemplaza esa base — con scroll(), el progreso pasa a depender de CUÁNTO se ha desplazado un contenedor; con view(), de CUÁNTO ha entrado o salido un elemento del viewport. animation-duration deja de marcar el ritmo real cuando se usa animation-timeline."
}
```

## scroll(): el progreso de un contenedor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @keyframes crecer {\n    from { transform: scaleX(0); }\n    to { transform: scaleX(1); }\n  }\n\n  .barra {\n    transform-origin: left;\n    animation: crecer linear;\n    animation-timeline: scroll(root);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation-timeline: scroll(root);", "nota": "scroll() sigue el progreso de scroll de un contenedor — root es el documento completo. La barra crece de scaleX(0) a scaleX(1) exactamente en proporción a cuánto se ha bajado en la página." },
    { "fragmento": "animation: crecer linear;", "nota": "Ojo: aquí no hace falta declarar una duración en segundos — con animation-timeline, el scroll es quien marca el avance, no el tiempo." }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .galeria {\n    animation-timeline: scroll(nearest inline);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "scroll(nearest inline)", "nota": "El primer argumento es el SCROLLER (nearest: el contenedor con scroll más cercano; root: el documento; self: el propio elemento). El segundo es el EJE (inline u block) — aquí, sigue el scroll horizontal del contenedor más cercano." }
  ]
}
```

## view(): reaccionar a la entrada y salida del viewport

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @keyframes aparecer {\n    from { opacity: 0; transform: translateY(30px); }\n    to { opacity: 1; transform: translateY(0); }\n  }\n\n  .tarjeta {\n    animation: aparecer linear;\n    animation-timeline: view(block 20%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation-timeline: view(block 20%);", "nota": "view() sigue cuánto ha entrado o salido ESTE elemento del viewport, no el scroll de un contenedor entero. El segundo argumento (inset) ajusta cuándo se dispara: aquí, empieza un poco antes de que el elemento entre del todo." }
  ]
}
```

## Timelines con nombre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  main {\n    scroll-timeline-name: --principal;\n  }\n\n  .indicador {\n    animation: crecer linear;\n    animation-timeline: --principal;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "scroll-timeline-name: --principal;", "nota": "Declara un timeline con nombre sobre el contenedor de scroll — cualquier elemento (incluso uno que no sea descendiente directo) puede referenciarlo después por su nombre." },
    { "fragmento": "animation-timeline: --principal;", "nota": "Referencia al timeline con nombre declarado antes — útil cuando el elemento que se anima no es hijo directo del contenedor que hace scroll." }
  ]
}
```

## animation-range: acotar el tramo que dispara la animación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    animation: aparecer linear;\n    animation-timeline: view();\n    animation-range: entry 0% cover 40%;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation-range: entry 0% cover 40%;", "nota": "Acota la animación a un tramo concreto del timeline, en vez de cubrir el 0%-100% completo — aquí, solo mientras el elemento está entrando (entry) hasta que cubre el 40% de la región visible." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un soporte de navegador todavía desigual",
  "contenido": "Es una función relativamente reciente — conviene comprobar el soporte real antes de depender de ella para algo esencial. @supports not (scroll-timeline: --t) { } permite ofrecer una alternativa (por ejemplo, sin la animación, pero con el contenido igualmente visible) para navegadores que no la soporten."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @keyframes crecer {\n    from { transform: scaleX(0); }\n    to { transform: scaleX(1); }\n  }\n  .barra {\n    animation: crecer linear;\n    animation-timeline: scroll(root);\n    transform-origin: left;\n  }\n</style>",
  "opciones": [
    "El tiempo transcurrido desde que la página cargó, como cualquier animación normal",
    "El progreso del scroll de la página completa (root) — la barra crece según cuánto se ha bajado, no según cuánto tiempo pasó",
    "Un evento de clic sobre la propia barra"
  ],
  "correcta": 1,
  "explicacion": "animation-timeline: scroll(root) sustituye la base temporal por el progreso de scroll del documento completo. La barra crece en proporción directa a cuánto se ha desplazado la página, sin importar cuánto tiempo real haya pasado."
}
```

## Lo que las animaciones dirigidas por scroll NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "animation-timeline funciona igual que animation-duration, solo con otro nombre",
      "realidad": "Sustituye el paso del tiempo por el progreso de scroll — animation-duration deja de marcar el ritmo real cuando se usa animation-timeline."
    },
    {
      "mito": "view() y scroll() hacen exactamente lo mismo",
      "realidad": "scroll() sigue el progreso del scroll de un contenedor; view() sigue cuánto ha entrado o salido un elemento concreto del viewport — resuelven problemas distintos."
    },
    {
      "mito": "Estas animaciones necesitan un listener de scroll en JavaScript por debajo",
      "realidad": "Son CSS puro — el navegador calcula el progreso internamente, sin ningún listener ni cálculo manual de posición."
    },
    {
      "mito": "animation-range siempre cubre el 100% del scroll disponible",
      "realidad": "Se puede acotar a un tramo concreto (cover, contain, entry, exit, o porcentajes), disparando la animación solo en la parte que interesa."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir animation-timeline con una simple sustitución de duration.", "texto": "Cambia la base entera del avance, de tiempo a progreso de scroll." },
    { "titulo": "Olvidar @supports como alternativa para navegadores sin soporte.", "texto": "Es una función relativamente reciente, no universal todavía." },
    { "titulo": "No diferenciar scroll() (progreso del contenedor) de view() (entrada/salida de un elemento).", "texto": "Resuelven necesidades distintas, aunque se parezcan en la sintaxis." },
    { "titulo": "No acotar animation-range cuando la animación solo debería dispararse en un tramo concreto.", "texto": "Sin acotar, cubre todo el timeline disponible, de punta a punta." }
  ]
}
```

## Ejercicios

1. Escribe una barra de progreso de lectura con `animation-timeline: scroll(root)`.
2. Escribe una animación de aparición (`opacity` de 0 a 1) disparada por `view()`, para un elemento que se revela al entrar en el viewport.
3. Escribe una regla `@supports` que muestre un aviso cuando el navegador no soporte `scroll-timeline`.
4. Explica la diferencia entre `scroll()` y `view()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una barra de progreso de lectura con animation-timeline: scroll(root) y haz scroll en la vista previa para verla avanzar (ejercicio 1). Es una API reciente — si tu navegador no la soporta, no verás movimiento, pero el código es correcto.",
  "html": "<div class=\"barra-progreso\"></div>\n<div class=\"contenido-largo\">\n  <p>Texto largo para poder hacer scroll y ver la barra de progreso avanzar según bajas por la página, repite este párrafo mentalmente varias veces para tener suficiente altura de scroll.</p>\n</div>",
  "css": ".barra-progreso {\n  position: sticky; top: 0; height: 6px; background: #7c3aed;\n  transform-origin: left;\n  /* animation: crecer linear;\n  animation-timeline: scroll(root); */\n}\n@keyframes crecer { from { transform: scaleX(0); } to { transform: scaleX(1); } }\n.contenido-largo { height: 800px; }",
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
      "titulo": "CSS scroll-driven animations",
      "descripcion": "Referencia de MDN sobre animation-timeline, las funciones scroll() y view(), los timelines con nombre y animation-range.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations",
      "etiqueta": "MDN"
    }
  ]
}
```
