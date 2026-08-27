# View Transitions: transiciones entre vistas

- **Módulo:** Efectos visuales avanzados
- **Slug:** `view-transitions-transiciones-entre-vistas` (autogenerado del título)
- **Orden:** 265
- **Fuentes:** [View Transitions for SPAs (web.dev)](https://web.dev/learn/css/view-transitions-spas) — ver `contenido/css/TEMARIO.md` #54

---

## Qué es y para qué sirve

Cuando una SPA reemplaza el DOM al navegar a una vista nueva, el contenido simplemente aparece de golpe — sin ninguna transición entre lo que había antes y lo que hay después. La View Transitions API resuelve justo eso: envuelve la actualización del DOM y el navegador genera automáticamente una animación entre el estado antiguo y el nuevo, sin tener que animar manualmente cada elemento a mano.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita animar el cambio entre dos estados del DOM",
  "roles": [
    { "etiqueta": "Quien anima el cambio entre dos vistas", "rol": "Suavizar la navegación en una SPA", "descripcion": "En vez de que el contenido nuevo aparezca de golpe, el navegador genera una transición automática entre el estado antiguo y el nuevo." },
    { "etiqueta": "Quien aísla un elemento concreto", "rol": "Animar solo una pieza, no toda la vista", "descripcion": "view-transition-name permite que un elemento (una imagen de perfil, un título) tenga su propia animación independiente del resto." },
    { "etiqueta": "Quien respeta el navegador sin soporte", "rol": "Prever una alternativa razonable", "descripcion": "Esta API todavía no es Baseline widely available — conviene comprobar el soporte antes de depender de ella para algo esencial." }
  ]
}
```

## La API básica: startViewTransition()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  document.startViewTransition(() => {\n    actualizarElDOM();\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "document.startViewTransition(() => {\n    actualizarElDOM();\n  });", "nota": "El callback contiene la actualización real del DOM. El navegador captura una \"foto\" del estado ANTES de ejecutarlo, deja que el callback cambie el DOM, y anima entre ambos estados automáticamente." }
  ]
}
```

## El árbol de pseudo-elementos que genera el navegador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  ::view-transition-old(root) {\n    /* la vista que se va */\n  }\n  ::view-transition-new(root) {\n    /* la vista que llega */\n  }\n  ::view-transition-group(root) {\n    /* envuelve a ambas a la vez */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "::view-transition-old(root) {", "nota": "Representa una captura estática de cómo se veía la vista justo ANTES del cambio — solo existe mientras dura la transición." },
    { "fragmento": "::view-transition-new(root) {", "nota": "Representa la vista NUEVA, ya actualizada. Por defecto, el navegador hace un fundido cruzado (crossfade) entre esta capa y la anterior." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El comportamiento por defecto ya hace algo",
  "contenido": "Sin escribir ningún CSS adicional, document.startViewTransition() ya produce un fundido cruzado (crossfade): la vista antigua se desvanece mientras la nueva aparece. Personalizar ::view-transition-old y ::view-transition-new con @keyframes propios sirve para sustituir ese crossfade por algo distinto — un deslizamiento, por ejemplo — no para activar la transición por primera vez."
}
```

## view-transition-name: aislar un elemento concreto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .avatar {\n    view-transition-name: avatar-principal;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "view-transition-name: avatar-principal;", "nota": "Da a ESTE elemento su propia animación independiente, separada del resto de la vista — útil para que una imagen de perfil, por ejemplo, se anime de una posición a otra en vez de simplemente desvanecerse con todo lo demás." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Exactamente un elemento por nombre, en cada estado",
  "contenido": "Para cada view-transition-name, tiene que existir EXACTAMENTE un elemento con ese nombre antes de llamar a startViewTransition(), y exactamente uno después. Si dos elementos comparten el mismo nombre a la vez, o si el elemento desaparece sin que otro lo sustituya con ese mismo nombre, la transición para ese nombre concreto falla."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .avatar-1, .avatar-2 {\n    view-transition-name: avatar;\n  }\n</style>\n<img class=\"avatar-1\" src=\"a.jpg\">\n<img class=\"avatar-2\" src=\"b.jpg\">",
  "opciones": [
    "Ambos elementos se animan correctamente, uno detrás del otro",
    "Es un error: para cada view-transition-name debe existir exactamente UN elemento con ese nombre en cada estado del DOM",
    "El navegador ignora view-transition-name en ese caso y aplica el crossfade por defecto a todo el documento"
  ],
  "correcta": 1,
  "explicacion": "Dos elementos visibles a la vez con el mismo view-transition-name rompen la regla de \"exactamente uno por nombre\" — el navegador no puede decidir cuál de los dos animar como la versión antigua o la nueva de ese nombre."
}
```

## Personalizar la animación con @keyframes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  ::view-transition-old(root) {\n    animation-name: slide-out-a-la-izquierda;\n  }\n  ::view-transition-new(root) {\n    animation-name: slide-in-desde-la-derecha;\n  }\n\n  @keyframes slide-out-a-la-izquierda {\n    to { transform: translateX(-100%); }\n  }\n  @keyframes slide-in-desde-la-derecha {\n    from { transform: translateX(100%); }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "::view-transition-old(root) {\n    animation-name: slide-out-a-la-izquierda;\n  }", "nota": "Sustituye el fundido por defecto por una animación propia, con @keyframes normales — la vista que se va desliza hacia la izquierda en vez de simplemente desvanecerse." }
  ]
}
```

## Transiciones direccionales con tipos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  html:active-view-transition-type(adelante) {\n    &::view-transition-old(root) {\n      animation-name: slide-out-a-la-izquierda;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "html:active-view-transition-type(adelante) {", "nota": "Permite distinguir el TIPO de navegación (adelante, atrás) declarado al llamar a startViewTransition({ types: [...] }), aplicando una animación distinta según la dirección — por ejemplo, deslizar a la izquierda al avanzar, a la derecha al retroceder." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Desactivar por completo con prefers-reduced-motion",
  "contenido": "Igual que cualquier otra animación, las view transitions deberían respetar la preferencia de movimiento reducido: @media (prefers-reduced-motion) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } } desactiva por completo las animaciones generadas, sin desactivar la funcionalidad en sí (el contenido sigue cambiando, solo que sin animación)."
}
```

## Lo que las View Transitions NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "document.startViewTransition() funciona igual en cualquier navegador ya",
      "realidad": "No es todavía Baseline widely available — conviene comprobar el soporte y prever una alternativa razonable para navegadores sin soporte."
    },
    {
      "mito": "view-transition-name se puede repetir en varios elementos visibles a la vez, sin problema",
      "realidad": "Para cada nombre debe existir exactamente un elemento con ese view-transition-name en cada estado del DOM — repetirlo simultáneamente rompe la transición para ese nombre."
    },
    {
      "mito": "Sin personalizar nada, una view transition no produce ningún efecto visual",
      "realidad": "El comportamiento por defecto ya incluye un fundido cruzado (crossfade) entre la vista antigua y la nueva, sin necesitar ningún CSS adicional."
    },
    {
      "mito": "Las view transitions ignoran las preferencias de accesibilidad del sistema",
      "realidad": "Se pueden (y deben) desactivar por completo dentro de @media (prefers-reduced-motion), igual que cualquier otra animación."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No comprobar el soporte real antes de depender de startViewTransition().", "texto": "Todavía no es una función universalmente soportada." },
    { "titulo": "Repetir el mismo view-transition-name en más de un elemento visible a la vez.", "texto": "Rompe la regla de exactamente un elemento por nombre en cada estado." },
    { "titulo": "Olvidar personalizar ::view-transition-old/new cuando el crossfade por defecto no encaja.", "texto": "El fundido cruzado por defecto no siempre es el efecto deseado." },
    { "titulo": "No respetar prefers-reduced-motion en las transiciones entre vistas.", "texto": "Ignora una preferencia de accesibilidad real de quien navega." }
  ]
}
```

## Ejercicios

1. Escribe la llamada básica a `document.startViewTransition()` envolviendo una actualización del DOM.
2. Escribe una regla `view-transition-name: avatar` sobre un elemento concreto para aislar su animación.
3. Explica la regla de "exactamente un elemento" para cada `view-transition-name`.
4. Escribe una regla `@media (prefers-reduced-motion)` que desactive las animaciones de `::view-transition-group(*)`, `::view-transition-old(*)` y `::view-transition-new(*)`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "View Transitions for SPAs",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre startViewTransition(), el árbol de pseudo-elementos ::view-transition-*, view-transition-name y las transiciones direccionales.",
      "url": "https://web.dev/learn/css/view-transitions-spas",
      "etiqueta": "web.dev"
    }
  ]
}
```
