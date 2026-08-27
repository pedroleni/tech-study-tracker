# Cursores y estados de puntero

- **Módulo:** Movimiento e interactividad
- **Slug:** `cursores-y-estados-de-puntero` (autogenerado del título)
- **Orden:** 245
- **Fuentes:** [Cursors and pointers (web.dev)](https://web.dev/learn/css/cursors-and-pointers) — ver `contenido/css/TEMARIO.md` #50

---

## Qué es y para qué sirve

El navegador ya cambia el cursor solo en los casos obvios: una I sobre texto seleccionable, una mano sobre un enlace. `cursor` permite comunicar el mismo tipo de pista visual en el resto de casos — que algo se puede arrastrar, que una acción no está disponible, que hay que esperar. Cierra el módulo de movimiento e interactividad, donde encaja de forma natural junto a `pointer-events` y `touch-action`, que controlan cómo reacciona un elemento al puntero.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién comunica algo con el cursor y el puntero",
  "roles": [
    { "etiqueta": "Quien comunica qué es interactivo", "rol": "Dar una pista visual clara", "descripcion": "cursor: grab o cursor: not-allowed comunican una posibilidad (o su ausencia) antes de que la persona haga clic." },
    { "etiqueta": "Quien desactiva clics deliberadamente", "rol": "Que un elemento ignore al ratón", "descripcion": "pointer-events: none saca a un elemento de la ecuación por completo para el puntero — ni clic, ni hover." },
    { "etiqueta": "Quien ajusta gestos táctiles", "rol": "Controlar qué gestos nativos siguen activos", "descripcion": "touch-action decide si el pellizco para hacer zoom o el desplazamiento con el dedo siguen funcionando con normalidad." }
  ]
}
```

## cursor: los valores más comunes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .arrastrable {\n    cursor: grab;\n  }\n  .arrastrable:active {\n    cursor: grabbing;\n  }\n  .deshabilitado {\n    cursor: not-allowed;\n  }\n  .cargando {\n    cursor: wait;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "cursor: grab;", "nota": "Una mano abierta — sugiere que el elemento se puede arrastrar. Al combinarlo con :active (grabbing, mano cerrada), el cursor cambia mientras dura el arrastre real." },
    { "fragmento": "cursor: not-allowed;", "nota": "Un círculo tachado — comunica que una acción NO está disponible en este momento, antes incluso de intentar hacer clic." }
  ]
}
```

## Cursor personalizado: imagen con reserva obligatoria

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .pincel {\n    cursor: url(\"pincel.png\"), crosshair;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "cursor: url(\"pincel.png\"), crosshair;", "nota": "Tras la imagen (PNG o SVG), hace falta declarar una palabra clave de RESERVA — aquí, crosshair. Si la imagen no carga o el formato no está soportado, el navegador usa esa palabra clave en su lugar, en vez de dejar el cursor sin definir." }
  ]
}
```

## caret-color: el cursor de texto, no el del ratón

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un cursor que no sigue al ratón",
  "contenido": "caret-color ajusta el color del cursor de INSERCIÓN de texto — esa línea parpadeante en un campo editable. Es un concepto distinto a cursor: no se mueve con el ratón, marca la posición donde aparecería el siguiente carácter tecleado."
}
```

## pointer-events: sacar a un elemento de la ecuación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .boton[disabled] {\n    pointer-events: none;\n    opacity: 0.5;\n  }\n</style>\n<button disabled>Enviar</button>",
  "anotaciones": [
    { "fragmento": "pointer-events: none;", "nota": "No solo bloquea el clic — el elemento deja de recibir CUALQUIER evento de puntero, incluido :hover. Es como si, para el ratón, ese elemento simplemente no estuviera ahí." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .boton[disabled] {\n    pointer-events: none;\n  }\n  .boton[disabled]:hover {\n    background: teal;\n  }\n</style>\n<button disabled>Enviar</button>",
  "opciones": [
    "Solo se bloquea el clic; el hover (fondo teal) se sigue activando con normalidad al pasar el ratón",
    "Se bloquean TODOS los eventos de puntero, incluido :hover — el fondo teal nunca llega a aplicarse",
    "pointer-events: none no tiene ningún efecto sobre elementos con el atributo disabled"
  ],
  "correcta": 1,
  "explicacion": "pointer-events: none desactiva cualquier evento de puntero sobre el elemento, no solo el clic. La regla :hover definida después nunca se activa, porque el elemento ya no recibe ningún evento del ratón."
}
```

## touch-action: qué gestos táctiles siguen activos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .lienzo {\n    touch-action: none;\n  }\n  .boton {\n    touch-action: manipulation;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "touch-action: none;", "nota": "Desactiva todos los gestos táctiles nativos del navegador sobre el elemento — útil, por ejemplo, en un lienzo de dibujo que gestiona el arrastre a mano con JavaScript." },
    { "fragmento": "touch-action: manipulation;", "nota": "Equivale a pan-x pan-y pinch-zoom — desactiva SOLO el doble-tap para hacer zoom, dejando el resto de gestos (deslizar, pellizcar) intactos. Útil en botones, para eliminar el retraso del doble-tap sin sacrificar otros gestos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuidado con desactivar gestos táctiles por completo",
  "contenido": "touch-action: none puede romper gestos que la persona espera y necesita, como el pellizco para hacer zoom en contenido de lectura. Restringir gestos táctiles con demasiada amplitud es un riesgo real de accesibilidad, no solo un detalle técnico."
}
```

## Lo que cursor y pointer-events NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "cursor: pointer hace que un elemento sea clicable",
      "realidad": "Solo cambia el ASPECTO visual del puntero — no añade ningún comportamiento. Un div con cursor: pointer sigue sin reaccionar al clic si no tiene un manejador de eventos o no es un elemento interactivo real."
    },
    {
      "mito": "pointer-events: none solo bloquea el clic",
      "realidad": "Bloquea TODOS los eventos de puntero, incluido :hover — el elemento queda invisible para el ratón por completo."
    },
    {
      "mito": "Cualquier imagen sirve como cursor personalizado, sin nada más",
      "realidad": "Hace falta declarar también una palabra clave de reserva al final, por si la imagen no carga o el formato no está soportado."
    },
    {
      "mito": "Desactivar touch-action siempre mejora el control sobre los gestos táctiles",
      "realidad": "Puede romper gestos nativos esperados, como el pellizco para hacer zoom — hay que usarlo con cuidado, pensando en accesibilidad."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir cursor: pointer con hacer que un elemento sea clicable.", "texto": "Es una pista puramente visual, no añade ningún comportamiento por sí sola." },
    { "titulo": "No declarar una palabra clave de reserva al usar una imagen de cursor.", "texto": "Sin ella, el cursor queda sin definir si la imagen falla al cargar." },
    { "titulo": "Esperar que pointer-events: none solo bloquee el clic.", "texto": "También desactiva :hover y cualquier otro evento de puntero." },
    { "titulo": "Desactivar touch-action sin pensar en el impacto de accesibilidad.", "texto": "Puede romper gestos táctiles que la persona necesita, como el zoom por pellizco." }
  ]
}
```

## Ejercicios

1. Escribe una regla que cambie el cursor a `grab` en reposo y a `grabbing` mientras se arrastra (`:active`).
2. Escribe un cursor personalizado con una imagen PNG y una palabra clave de reserva.
3. Explica qué ocurre con `:hover` en un elemento con `pointer-events: none`.
4. Escribe una regla `touch-action: manipulation` y explica a qué equivale exactamente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Cursors and pointers",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre cursor, cursores personalizados, caret-color, pointer-events y touch-action.",
      "url": "https://web.dev/learn/css/cursors-and-pointers",
      "etiqueta": "web.dev"
    }
  ]
}
```
