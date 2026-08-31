# popover y ::backdrop, la vista desde CSS

- **Módulo:** Layout
- **Slug:** `popover-y-backdrop-la-vista-desde-css` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [Popover and dialog (web.dev)](https://web.dev/learn/css/popover-and-dialog) — ver `contenido/css/TEMARIO.md` #39 (complementa, sin repetir, la lección de HTML sobre `<dialog>`)

---

## Qué es y para qué sirve

La lección de HTML sobre `<dialog>` explicó el elemento en sí. Esta se centra en cómo CSS lo estiliza a él y a los popovers: `::backdrop` da estilo a la capa que queda detrás, `:popover-open` selecciona un popover mientras está abierto, y ambos se renderizan en la "top layer" — un nivel por encima de todo lo demás, sin ninguna guerra de `z-index`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién estiliza popovers y dialogs desde CSS",
  "roles": [
    { "etiqueta": "Quien construye un modal sin z-index", "rol": "Verse siempre por encima, garantizado", "descripcion": "La top layer coloca a popovers y dialogs abiertos con showModal() por encima de absolutamente todo, sin necesitar ningún z-index." },
    { "etiqueta": "Quien anima la entrada de un popover", "rol": "Una transición de aparición, sin JavaScript", "descripcion": "@starting-style, combinado con transition-behavior: allow-discrete, permite animar algo que pasaba de display: none a visible de golpe." },
    { "etiqueta": "Quien diseña el fondo tras un popover", "rol": "Sin bloquear el resto de la página por error", "descripcion": "El contenido detrás de un popover sigue siendo clicable — un ::backdrop demasiado oscuro puede engañar sobre eso." }
  ]
}
```

## La top layer: sin guerras de z-index

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por encima de todo, automáticamente",
  "contenido": "Un popover, o un <dialog> abierto con showModal(), se coloca en la \"top layer\" — una capa por encima de todo el resto del documento, fuera de cualquier contexto de apilamiento normal. No hace falta ningún z-index para que se vea por encima de otros elementos posicionados: el navegador lo garantiza solo."
}
```

## ::backdrop: lo que hay detrás, pero no bloqueado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  [popover]::backdrop {\n    background: rgb(0 0 0 / 30%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "background: rgb(0 0 0 / 30%);", "nota": "El contenido DETRÁS de un popover no es inerte — se sigue pudiendo hacer clic y navegar con teclado sobre él. Un ::backdrop demasiado oscuro (o con un blur fuerte) puede dar la impresión equivocada de que ese contenido está bloqueado, cuando en realidad sigue activo." }
  ]
}
```

## :popover-open: estilar solo mientras está abierto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  [popover] {\n    border: 1px solid #7c3aed;\n  }\n\n  [popover]:popover-open {\n    display: grid;\n    gap: 8px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "[popover]:popover-open {\n    display: grid;\n    gap: 8px;\n  }", "nota": "Los estilos de LAYOUT (como display: grid) deben ir en :popover-open, no directamente en [popover]. Poner display: grid en [popover] a secas haría que TODOS los popovers fueran visibles siempre, abiertos o no — justo lo contrario de lo que se busca." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  [popover] {\n    display: grid;\n    place-items: center;\n  }\n</style>\n<div popover id=\"info\">Contenido del popover</div>",
  "opciones": [
    "El popover solo se ve cuando alguien lo abre, como es normal",
    "El popover se ve SIEMPRE, incluso cerrado — display: grid en [popover] a secas anula el display: none por defecto del estado cerrado",
    "La regla no tiene ningún efecto: [popover] no acepta display como propiedad"
  ],
  "correcta": 1,
  "explicacion": "Los popovers están ocultos por defecto con display: none mientras no se abren. Poner display: grid directamente en [popover] sobrescribe ESE display: none — el popover pasa a verse siempre, cerrado o no. Los estilos de layout deben ir en [popover]:popover-open, que solo se aplica mientras está realmente abierto."
}
```

## Animar la aparición: @starting-style

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  [popover] {\n    opacity: 0;\n    transition: opacity 0.3s, display 0.3s allow-discrete;\n  }\n\n  [popover]:popover-open {\n    opacity: 1;\n  }\n\n  @starting-style {\n    [popover]:popover-open {\n      opacity: 0;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@starting-style {\n    [popover]:popover-open {\n      opacity: 0;\n    }\n  }", "nota": "Define desde qué valor parte la animación justo en el instante en que el popover se vuelve visible — sin esto, no habría un punto de partida real desde el que animar, y el cambio se vería instantáneo." },
    { "fragmento": "transition: opacity 0.3s, display 0.3s allow-discrete;", "nota": "display normalmente no se puede animar (pasa de golpe de none a block). Incluirlo en transition, junto con allow-discrete, permite que el propio cambio de display participe en la animación en vez de cortarla en seco." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "display: none rompe las transiciones normales",
  "contenido": "Sin transition-behavior: allow-discrete (o el atajo dentro de transition, como en el ejemplo), un elemento que pasa de display: none a visible no anima nada — el cambio de display ocurre de golpe, cortando cualquier transición de otras propiedades a mitad de camino. allow-discrete resuelve justo ese problema."
}
```

## Lo que popover y ::backdrop NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "::backdrop se puede oscurecer tanto como se quiera, como un overlay modal clásico",
      "realidad": "El contenido detrás de un popover NO es inerte — sigue siendo clicable y navegable por teclado, así que oscurecerlo demasiado engaña visualmente sobre qué se puede seguir usando."
    },
    {
      "mito": "Poner display: grid directamente en [popover] hace que solo se vea cuando está abierto",
      "realidad": "Hace que TODOS los popovers de esa clase sean visibles siempre — hace falta [popover]:popover-open específicamente para que el estilo solo se aplique mientras está abierto."
    },
    {
      "mito": "z-index sigue haciendo falta para que un popover se vea por encima del resto de la página",
      "realidad": "Los popovers y los dialogs abiertos con showModal() se renderizan en la top layer, por encima de todo el documento automáticamente — sin ninguna guerra de z-index."
    },
    {
      "mito": "Cualquier <dialog open> tiene un ::backdrop visible detrás",
      "realidad": "Solo los dialogs abiertos con showModal() generan un backdrop real y se promocionan a la top layer — el atributo open por sí solo no hace ninguna de las dos cosas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Aplicar estilos de layout directamente sobre [popover] en vez de [popover]:popover-open.", "texto": "Hace que todos los popovers se vean siempre, abiertos o no." },
    { "titulo": "Oscurecer demasiado el ::backdrop.", "texto": "Da a entender que el contenido de detrás está bloqueado, cuando en realidad sigue siendo interactivo." },
    { "titulo": "Olvidar transition-behavior: allow-discrete al animar apertura o cierre.", "texto": "El cambio de display: none rompe la transición a mitad de camino." },
    { "titulo": "No incluir display (y overlay, con anchor positioning) en la lista de transition.", "texto": "Impide que la animación de salida se llegue a ver." }
  ]
}
```

## Ejercicios

1. Explica por qué usar `[popover] { display: grid; }` directamente es un error, y cómo corregirlo.
2. Escribe las tres reglas necesarias (`@starting-style`, estado abierto, estado de cierre) para animar la aparición de un popover.
3. Explica qué propiedad adicional hace falta para que una transición funcione en un elemento que pasa de `display: none` a visible.
4. Explica la diferencia entre un `<dialog open>` normal y uno abierto con `showModal()`, en cuanto a `::backdrop` y la top layer.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Este popover usa display: grid directamente, lo cual es un error explicado en la lección — corrígelo con @starting-style y las reglas necesarias para animarlo (ejercicio 1 y 2).",
  "html": "<button popovertarget=\"mi-popover\">Abrir popover</button>\n<div id=\"mi-popover\" popover>Contenido del popover</div>",
  "css": "[popover] {\n  /* display: grid; -- corrige esto */\n  border-radius: 8px;\n  padding: 16px;\n}",
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
      "titulo": "Popover and dialog",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre el estilo de popover y dialog: ::backdrop, :popover-open, la top layer y la animación con @starting-style.",
      "url": "https://web.dev/learn/css/popover-and-dialog",
      "etiqueta": "web.dev"
    }
  ]
}
```
