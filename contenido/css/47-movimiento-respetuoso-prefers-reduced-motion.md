# Movimiento respetuoso: prefers-reduced-motion

- **Módulo:** Movimiento e interactividad
- **Slug:** `movimiento-respetuoso-prefers-reduced-motion` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [WCAG 2.2 — 2.3.3 Animation from Interactions (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=233#animation-from-interactions), nivel AAA + [prefers-reduced-motion (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — ver `contenido/css/TEMARIO.md` #47

---

## Qué es y para qué sirve

Las lecciones anteriores de este módulo mencionaron `prefers-reduced-motion` varias veces, prometiendo el detalle completo aquí. `@media (prefers-reduced-motion: reduce)` detecta si la persona activó, en su sistema operativo, una preferencia por menos movimiento — y responderla no es un capricho estético: es un requisito de accesibilidad con base normativa en WCAG.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el movimiento se pueda reducir",
  "roles": [
    { "etiqueta": "Quien protege de mareo o náusea", "rol": "Evitar disparadores vestibulares", "descripcion": "Ciertos movimientos — escalados grandes, paneos, parpadeos — pueden provocar mareo real, no solo molestia, en personas con trastornos vestibulares." },
    { "etiqueta": "Quien anima respetando el sistema", "rol": "Leer una preferencia ya configurada", "descripcion": "prefers-reduced-motion no pide nada nuevo — lee una preferencia que la persona ya activó en su sistema operativo, para cualquier sitio que la respete." },
    { "etiqueta": "Quien distingue reducir de eliminar", "rol": "Simplificar el movimiento, no borrarlo todo", "descripcion": "Reducir el movimiento no siempre significa quitar toda animación — a veces basta con una versión más calmada." }
  ]
}
```

## El requisito: WCAG 2.3.3, Animation from Interactions

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El texto exacto del criterio",
  "contenido": "WCAG 2.2, criterio de éxito 2.3.3 (nivel AAA): «El movimiento de una animación disparada por una interacción se puede desactivar, a menos que la animación sea esencial para la funcionalidad o la información que se transmite». La excepción importa: no es que TODA animación deba desaparecer — solo la que no es esencial para entender o usar la interfaz."
}
```

## La sintaxis: @media (prefers-reduced-motion: reduce)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media (prefers-reduced-motion: reduce) {\n    .animacion {\n      animation: none;\n    }\n  }\n\n  @media (prefers-reduced-motion: no-preference) {\n    .animacion {\n      animation: pulso 1s infinite;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media (prefers-reduced-motion: reduce) {", "nota": "Se cumple cuando la persona activó la reducción de movimiento en su sistema — el mismo tipo de preferencia que prefers-color-scheme, pero para animaciones en vez de para el tema de color." },
    { "fragmento": "@media (prefers-reduced-motion: no-preference) {", "nota": "no-preference significa que la persona NO activó ninguna preferencia — es el valor por defecto cuando nadie ha tocado esa configuración." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "@media (prefers-reduced-motion) sin valor equivale a reduce",
  "contenido": "@media (prefers-reduced-motion) — sin especificar : reduce ni : no-preference — se evalúa como verdadero exactamente cuando la preferencia está activada. Es un atajo válido, pero escribir : reduce explícitamente suele ser más claro para quien lee el código después."
}
```

## El patrón recomendado: animado por defecto, reducido en el media query

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .aviso {\n    animation: pulso 1s linear infinite;\n    background-color: purple;\n  }\n\n  @media (prefers-reduced-motion: reduce) {\n    .aviso {\n      animation: disolver 4s linear infinite;\n      background-color: green;\n    }\n  }\n\n  @keyframes pulso {\n    0%, 100% { transform: scale(1); }\n    50% { transform: scale(1.15); }\n  }\n\n  @keyframes disolver {\n    0%, 100% { opacity: 1; }\n    50% { opacity: 0.4; }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "animation: pulso 1s linear infinite;", "nota": "La versión por defecto: un pulso que escala el elemento — un movimiento de tipo escalado grande, justo el tipo de disparador vestibular que conviene evitar para quien activó la preferencia." },
    { "fragmento": "animation: disolver 4s linear infinite;", "nota": "La versión reducida no elimina toda animación — la sustituye por algo más calmado: un cambio de opacidad, mucho más lento, sin ningún escalado ni movimiento de posición." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Reducir no siempre significa eliminar del todo",
  "contenido": "El ejemplo anterior no apaga la animación por completo dentro de prefers-reduced-motion: reduce — la reemplaza por una versión más calmada (un fundido lento de opacidad, sin escalado). Para animaciones puramente decorativas, animation: none suele ser lo más sencillo y correcto; para las que aportan información real (un indicador de progreso, por ejemplo), simplificar el movimiento sin eliminarlo del todo puede ser la opción más respetuosa con la excepción de WCAG."
}
```

## Aplicarlo a lo ya visto: transition y animation

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    transition: transform 300ms ease-out;\n  }\n\n  @media (prefers-reduced-motion: reduce) {\n    .tarjeta {\n      transition-duration: 0.01ms;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transition-duration: 0.01ms;", "nota": "Poner la duración prácticamente a cero (en vez de eliminar la transición entera) es un patrón habitual: sobrescribe SOLO la duración, dejando el resto de la regla (la propiedad afectada, el timing-function) intacta." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @media (prefers-reduced-motion) {\n    .caja { animation: none; }\n  }\n</style>",
  "opciones": [
    "Es un error de sintaxis: prefers-reduced-motion necesita siempre un valor explícito",
    "Equivale exactamente a @media (prefers-reduced-motion: reduce) — sin valor, se evalúa como verdadero cuando la preferencia está activada",
    "Se aplica siempre, sin importar la preferencia del sistema"
  ],
  "correcta": 1,
  "explicacion": "prefers-reduced-motion, sin ningún valor, se comporta como un booleano: verdadero cuando la persona activó la reducción de movimiento, exactamente igual que escribir explícitamente : reduce."
}
```

## Lo que prefers-reduced-motion NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Reducir el movimiento significa eliminar toda animación sin excepción",
      "realidad": "WCAG 2.3.3 exceptúa la animación esencial para la funcionalidad o la información — reducir puede significar simplificar, no necesariamente borrar."
    },
    {
      "mito": "prefers-reduced-motion detecta si el navegador soporta animaciones",
      "realidad": "Detecta una preferencia PERSONAL activada por la persona en su sistema operativo — nada tiene que ver con qué soporta el navegador."
    },
    {
      "mito": "@media (prefers-reduced-motion) sin valor no tiene ningún efecto",
      "realidad": "Equivale exactamente a : reduce — se evalúa como verdadero cuando la preferencia está activada."
    },
    {
      "mito": "Esta preferencia solo afecta a animaciones decorativas sin importancia",
      "realidad": "También puede afectar a movimientos con parallax, auto-reproducción de transiciones o escalados grandes que provocan mareo real en personas con trastornos vestibulares."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Ignorar prefers-reduced-motion por completo.", "texto": "Deja sin protección a personas para quienes ciertos movimientos son un disparador real de mareo o náusea." },
    { "titulo": "Eliminar TODA animación, incluida la esencial para entender la interfaz.", "texto": "WCAG exceptúa la animación esencial para la funcionalidad o la información — no es una regla de todo o nada." },
    { "titulo": "Confundir esta preferencia con una configuración del navegador.", "texto": "Se lee del sistema operativo de la persona, no de ajustes propios del navegador." },
    { "titulo": "Olvidar aplicar la reducción también a transition, no solo a animation.", "texto": "Ambas pueden ser disparadores vestibulares igual de reales." }
  ]
}
```

## Ejercicios

1. Escribe una regla `@media (prefers-reduced-motion: reduce)` que ponga `animation: none` sobre una clase `.banner`.
2. Reescribe esa misma regla usando la forma sin valor explícito, equivalente a `: reduce`.
3. Explica la excepción que WCAG 2.3.3 hace para animación esencial, con un ejemplo propio.
4. Escribe una regla que, dentro de `prefers-reduced-motion: reduce`, reduzca `transition-duration` casi a cero sin eliminar la transición entera.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una regla @media (prefers-reduced-motion: reduce) que ponga animation: none sobre .banner (ejercicio 1). Actívalo en las preferencias de tu sistema para comprobarlo de verdad — en la vista previa siempre verás la animación normal, ya que no siempre es posible simular esa preferencia desde aquí.",
  "html": "<div class=\"banner\">Banner animado</div>",
  "css": "@keyframes deslizar { from { transform: translateX(-20px); } to { transform: translateX(0); } }\n.banner { background: #eee; padding: 16px; animation: deslizar 1s infinite alternate; }\n/* @media (prefers-reduced-motion: reduce) { .banner { animation: none; } } */",
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
      "titulo": "WCAG 2.2 — 2.3.3 Animation from Interactions",
      "descripcion": "El criterio de éxito normativo (nivel AAA) que exige poder desactivar el movimiento disparado por interacción, salvo cuando es esencial.",
      "url": "https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=233#animation-from-interactions",
      "etiqueta": "W3C/WAI"
    },
    {
      "titulo": "prefers-reduced-motion",
      "descripcion": "Referencia de MDN sobre la media feature: sus valores, sintaxis y el patrón recomendado de animar por defecto y reducir dentro del media query.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
      "etiqueta": "MDN"
    }
  ]
}
```
