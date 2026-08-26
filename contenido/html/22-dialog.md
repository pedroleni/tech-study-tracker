# dialog: modales nativos con backdrop y sin JavaScript

- **Módulo:** Elementos interactivos nativos
- **Slug:** `dialog-modales-nativos-con-backdrop-y-sin-javascript` (autogenerado del título)
- **Orden:** 105
- **Fuentes:** [Dialog (web.dev)](https://web.dev/learn/html/dialog) + [referencia dialog (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) — ver `contenido/html/TEMARIO.md` #22

---

## Qué es y para qué sirve

`<dialog>` es una ventana modal nativa: fondo oscurecido, foco atrapado dentro, cierre con Esc, el resto de la página inerte hasta que se resuelve. Durante años esto se construía a mano con un div, mucho CSS y bastante JavaScript de gestión de foco — hoy el navegador lo da de fábrica, y desde hace poco, incluso abrirlo y cerrarlo se puede hacer de forma completamente declarativa, sin una sola etiqueta `<script>`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué resuelve dialog que un div superpuesto no resuelve solo",
  "roles": [
    { "etiqueta": "Quien navega con teclado", "rol": "Quedar atrapado dentro a propósito", "descripcion": "Un dialog modal atrapa el foco dentro — Tab nunca se escapa hacia el contenido de fondo mientras está abierto." },
    { "etiqueta": "Lector de pantalla", "rol": "Saber que el resto de la página está inerte", "descripcion": "El contenido fuera del modal se marca inert automáticamente — no se anuncia ni se puede alcanzar por accidente mientras el diálogo está abierto." },
    { "etiqueta": "Quien pulsa Esc por costumbre", "rol": "Cerrar el modal sin buscar la X", "descripcion": "Un dialog modal se cierra con Esc de fábrica — comportamiento que un div hecho a mano tendría que reimplementar entero." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando necesitas una confirmación bloqueante de verdad",
  "contenido": "Borrar algo, confirmar una acción irreversible — un modal real, con el resto de la página inerte hasta que la persona lo resuelve."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres un panel que NO bloquee el resto de la página",
  "contenido": "Una notificación, un panel de ayuda contextual — ahí un dialog sin modal (solo con el atributo open) tiene más sentido que uno modal de verdad."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres cero JavaScript",
  "contenido": "Los invocadores declarativos (command, commandfor) y form method=\"dialog\" cubren abrir y cerrar un modal completo sin escribir ni una etiqueta script."
}
```

## Cómo se usa: el atributo open no es lo mismo que un modal

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<dialog>\n  <p>Este diálogo no tiene open — no se ve.</p>\n</dialog>\n<p>El resto de la página, visible con normalidad.</p>",
  "despues": "<dialog open>\n  <p>Este diálogo tiene open — se ve, pero SIN backdrop ni centrado.</p>\n</dialog>\n<p>El resto de la página, visible con normalidad.</p>",
  "nota": "El atributo open por sí solo NO crea un modal de verdad — el diálogo aparece en su sitio dentro del flujo normal de la página, sin oscurecer el fondo ni centrarse en pantalla. El backdrop, el centrado y el bloqueo del resto de la página solo aparecen al abrirlo como modal de verdad, con el comando show-modal de abajo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<dialog open>\n  <p>Diálogo abierto solo con el atributo open, sin show-modal.</p>\n</dialog>\n<!-- El usuario pulsa Esc -->",
  "opciones": [
    "El diálogo se cierra, porque Esc siempre cierra cualquier dialog abierto",
    "No pasa nada — Esc solo cierra los dialog abiertos como modal",
    "El navegador muestra un error porque falta el atributo modal"
  ],
  "correcta": 1,
  "explicacion": "El cierre con Esc es un comportamiento exclusivo de los dialog abiertos como modal. Uno abierto solo con el atributo open, sin pasar por ese camino, no reacciona a Esc — sigue siendo un panel más del flujo normal de la página."
}
```

## El modal de verdad: command y commandfor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<button command=\"show-modal\" commandfor=\"confirmar\">Eliminar cuenta</button>\n\n<dialog id=\"confirmar\">\n  <p>¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.</p>\n  <button command=\"close\" commandfor=\"confirmar\">Cancelar</button>\n</dialog>",
  "anotaciones": [
    { "fragmento": "command=\"show-modal\" commandfor=\"confirmar\"", "nota": "El botón declara qué comando ejecutar (show-modal) y sobre qué elemento (el id del dialog) — el navegador lo abre como modal de verdad, con backdrop y foco atrapado dentro, sin escribir ni una etiqueta script." },
    { "fragmento": "command=\"close\" commandfor=\"confirmar\"", "nota": "El mismo mecanismo declarativo, pero para cerrar — cada botón dice qué acción quiere sobre qué diálogo, sin JavaScript de por medio." }
  ]
}
```

## El fondo oscurecido: ::backdrop

Solo existe cuando el diálogo se abre como modal de verdad — se personaliza igual que cualquier otro selector CSS:

```css
dialog::backdrop {
  background-color: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}
```

## Cerrar sin JavaScript: form method="dialog"

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<dialog id=\"info\">\n  <p>Los cambios se guardaron correctamente.</p>\n  <form method=\"dialog\">\n    <button type=\"submit\">Entendido</button>\n  </form>\n</dialog>",
  "anotaciones": [
    { "fragmento": "<form method=\"dialog\">", "nota": "Un form con este method especial cierra el dialog que lo contiene al enviarse, sin recargar la página ni necesitar JavaScript — una forma de cierre nativa, distinta del envío normal de un formulario a un servidor." }
  ]
}
```

## Lo que dialog NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El atributo open ya crea un modal completo, con backdrop incluido",
      "realidad": "open por sí solo solo hace visible el dialog dentro del flujo normal de la página — el backdrop, el centrado y el foco atrapado son exclusivos de abrirlo como modal de verdad."
    },
    {
      "mito": "Esc cierra cualquier dialog, esté abierto como sea",
      "realidad": "Esc solo cierra los dialog abiertos como modal — uno abierto solo con el atributo open, sin modal, no reacciona a Esc por defecto."
    },
    {
      "mito": "tabindex en el propio dialog mejora su accesibilidad",
      "realidad": "dialog no es un elemento interactivo en sí mismo y no debería recibir foco directamente — lo que necesita foco es su contenido interno (un botón, normalmente), no el contenedor."
    },
    {
      "mito": "form method=\"dialog\" envía los datos del formulario al servidor antes de cerrar",
      "realidad": "No envía nada a ningún sitio — simplemente cierra el diálogo, guardando en returnValue el value del botón que lo envió, si lo tenía."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Añadir tabindex al propio elemento dialog.", "texto": "No es un elemento interactivo — el foco debe recaer en su contenido (un botón, normalmente con autofocus), no en el contenedor." },
    { "titulo": "Confiar en que open crea un modal real.", "texto": "Sin abrirlo como modal, no hay backdrop, ni centrado, ni bloqueo del resto de la página — sigue siendo un panel más dentro del flujo normal." },
    { "titulo": "No ofrecer ninguna forma explícita de cerrar el diálogo.", "texto": "Esc no está garantizado en todos los casos, y no todo el mundo tiene teclado físico — siempre hace falta un botón de cierre visible." },
    { "titulo": "Poner un campo required dentro de un form method=\"dialog\" sin más.", "texto": "El formulario no se puede cerrar hasta rellenar ese campo — si el botón de cierre no debe validar nada, necesita formnovalidate." }
  ]
}
```

## Ejercicios

1. Escribe un dialog con un botón que lo abra como modal de verdad usando command="show-modal" y commandfor, y otro botón dentro que lo cierre con command="close".
2. Escribe el CSS de ::backdrop para oscurecer y difuminar el fondo cuando el diálogo esté abierto como modal.
3. Escribe un dialog de confirmación con dos botones dentro de un form method="dialog", cada uno con un value distinto, y explica cómo leerías cuál se pulsó a través de returnValue.
4. Busca en una web real un modal (de confirmación, de cookies, de inicio de sesión) — ¿está hecho con dialog o con un div y JavaScript propio?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Dialog",
      "descripcion": "Curso de web.dev sobre dialog, showModal/show, el backdrop y la gestión de foco en modales.",
      "url": "https://web.dev/learn/html/dialog",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "dialog",
      "descripcion": "Referencia de MDN con los atributos open y closedby, los eventos close/cancel, y los invocadores declarativos command/commandfor.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
      "etiqueta": "MDN"
    }
  ]
}
```
