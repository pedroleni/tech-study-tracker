# Filtros CSS (filter)

- **Módulo:** Efectos visuales avanzados
- **Slug:** `filtros-css-filter` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) + [Filters (web.dev)](https://web.dev/learn/css/filters) + [filter (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) — ver `contenido/css/TEMARIO.md` #51

---

## Qué es y para qué sirve

`filter` aplica efectos parecidos a los de un editor de imágenes — desenfoque, escala de grises, cambio de tono — directamente en CSS, en tiempo real, sin tocar el archivo original. Abre el módulo de efectos visuales avanzados, y su pariente cercano `backdrop-filter` extiende la misma idea a lo que hay DETRÁS de un elemento, no al elemento en sí.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién aplica efectos visuales directamente en CSS",
  "roles": [
    { "etiqueta": "Quien retoca imágenes sin editor", "rol": "Aplicar efectos en tiempo real", "descripcion": "blur, grayscale o sepia se aplican con una línea de CSS, sin exportar una versión distinta de cada imagen." },
    { "etiqueta": "Quien crea efecto de vidrio esmerilado", "rol": "Desenfocar lo que hay detrás", "descripcion": "backdrop-filter difumina el fondo detrás de un panel semitransparente — la base del efecto \"frosted glass\" tan habitual en interfaces modernas." },
    { "etiqueta": "Quien combina varios filtros a la vez", "rol": "Encadenar efectos en una declaración", "descripcion": "filter acepta varias funciones seguidas, aplicadas en el orden en que se escriben." }
  ]
}
```

## filter: blur() y la sintaxis básica

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .difuminado {\n    filter: blur(6px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "filter: blur(6px);", "nota": "blur() necesita una unidad de longitud (px, em...) — a diferencia de otros filtros, NO acepta porcentajes. Un valor más alto produce más desenfoque." }
  ]
}
```

## Verlo en vivo: blur()

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 10px;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 10px; filter: blur(6px);\"></div>\n</div>",
  "nota": "El mismo cuadrado con degradado. Después: filter: blur(6px) lo difumina por completo — los bordes antes nítidos ahora se disuelven en el fondo."
}
```

## grayscale(), sepia() e invert()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .bn { filter: grayscale(100%); }\n  .antiguo { filter: sepia(80%); }\n  .negativo { filter: invert(100%); }\n</style>",
  "anotaciones": [
    { "fragmento": "filter: grayscale(100%);", "nota": "100% quita todo el color; 0% (o sin declarar el filtro) deja la imagen intacta. Se pueden usar valores intermedios para un efecto parcial." },
    { "fragmento": "filter: sepia(80%);", "nota": "Aplica un tono sepia, evocando una foto antigua — 100% es sepia completo, 0% no tiene efecto." }
  ]
}
```

## Verlo en vivo: sepia()

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: linear-gradient(135deg, #0ea5e9, #22c55e); border-radius: 10px;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: linear-gradient(135deg, #0ea5e9, #22c55e); border-radius: 10px; filter: sepia(90%);\"></div>\n</div>",
  "nota": "El mismo degradado azul-verde. Después: filter: sepia(90%) lo convierte casi por completo en tonos marrones/ámbar, sin tocar el gradiente original en el CSS — el filtro se aplica en tiempo real, encima del color base."
}
```

## brightness(), contrast(), saturate() y hue-rotate()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .mas-brillo { filter: brightness(140%); }\n  .mas-contraste { filter: contrast(180%); }\n  .mas-saturado { filter: saturate(250%); }\n  .otro-tono { filter: hue-rotate(140deg); }\n</style>",
  "anotaciones": [
    { "fragmento": "filter: brightness(140%);", "nota": "100% es el brillo original; por encima aumenta, por debajo oscurece — 0% deja la imagen completamente negra." },
    { "fragmento": "filter: hue-rotate(140deg);", "nota": "Gira todos los colores a lo largo de la rueda cromática el ángulo indicado — un rojo puede convertirse en verde o azul, según cuántos grados se gire." }
  ]
}
```

## Verlo en vivo: hue-rotate()

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: #dc2626; border-radius: 10px;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 100px; height: 100px; background: #dc2626; border-radius: 10px; filter: hue-rotate(140deg);\"></div>\n</div>",
  "nota": "El mismo cuadrado, rojo (#dc2626) en el CSS de los dos casos — el color declarado no cambia. Después: filter: hue-rotate(140deg) gira ese rojo a lo largo de la rueda cromática hasta un tono azul-verdoso, sin tocar la propiedad background."
}
```

## drop-shadow(): sigue la forma real, no el rectángulo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .con-box-shadow {\n    box-shadow: 6px 6px 0 rgb(0 0 0 / 40%);\n  }\n\n  .con-drop-shadow {\n    filter: drop-shadow(6px 6px 4px rgb(0 0 0 / 40%));\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "box-shadow: 6px 6px 0 rgb(0 0 0 / 40%);", "nota": "box-shadow siempre sigue el RECTÁNGULO de la caja (o su border-radius) — nunca la forma real del contenido interior, como el borde de una letra." },
    { "fragmento": "filter: drop-shadow(6px 6px 4px rgb(0 0 0 / 40%));", "nota": "drop-shadow sigue la forma REAL del contenido — el contorno exacto de cada letra en un texto, o de una imagen con transparencia, no un rectángulo genérico." }
  ]
}
```

## Verlo en vivo: drop-shadow() en texto

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"padding: 30px; font-family: sans-serif; display: flex; justify-content: center;\">\n  <div style=\"box-shadow: 6px 6px 0 rgb(0 0 0 / 30%); background: white; padding: 10px 16px; border-radius: 4px;\"><span style=\"font-size: 2.2em; font-weight: 800; color: #7c3aed;\">Café</span></div>\n</div>",
  "despues": "<div style=\"padding: 30px; font-family: sans-serif; display: flex; justify-content: center;\">\n  <span style=\"font-size: 2.2em; font-weight: 800; color: #7c3aed; filter: drop-shadow(6px 6px 3px rgb(0 0 0 / 40%));\">Café</span>\n</div>",
  "nota": "Antes: box-shadow aplicado a una caja BLANCA que envuelve el texto — la sombra dibuja el rectángulo de esa caja, sin ninguna relación con la forma de las letras. Después: filter: drop-shadow() aplicado directamente al texto, sin ninguna caja — la sombra se ciñe al contorno real de cada letra, incluida la curva de la C y el acento de la é."
}
```

## Combinar varios filtros: el orden importa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .combinado {\n    filter: contrast(150%) brightness(105%) saturate(120%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "filter: contrast(150%) brightness(105%) saturate(120%);", "nota": "Se aplican en el orden en que se escriben, de izquierda a derecha — un filtro posterior actúa sobre el resultado del anterior. Con drop-shadow(), esto importa especialmente: un hue-rotate() escrito DESPUÉS de un drop-shadow() cambia el color de esa sombra ya generada." }
  ]
}
```

## backdrop-filter: filtrar lo que hay detrás

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "filter afecta al elemento; backdrop-filter, a lo que hay detrás",
  "contenido": "filter aplica el efecto al elemento y a su propio contenido. backdrop-filter aplica el efecto a todo lo que hay DETRÁS del elemento, hasta la raíz de apilamiento más cercana — pero solo se aprecia si el elemento tiene algún grado de transparencia real. Sobre un fondo totalmente opaco, no hay nada visible detrás que filtrar."
}
```

## Verlo en vivo: el efecto vidrio esmerilado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 140px; background: repeating-linear-gradient(45deg, #7c3aed, #7c3aed 12px, #ec4899 12px, #ec4899 24px); font-family: sans-serif;\">\n  <div style=\"position: absolute; top: 30px; left: 30px; right: 30px; background: rgb(255 255 255 / 30%); padding: 16px; border-radius: 8px; color: white; font-weight: bold;\">Panel semitransparente</div>\n</div>",
  "despues": "<div style=\"position: relative; height: 140px; background: repeating-linear-gradient(45deg, #7c3aed, #7c3aed 12px, #ec4899 12px, #ec4899 24px); font-family: sans-serif;\">\n  <div style=\"position: absolute; top: 30px; left: 30px; right: 30px; background: rgb(255 255 255 / 30%); backdrop-filter: blur(8px); padding: 16px; border-radius: 8px; color: white; font-weight: bold;\">Panel semitransparente</div>\n</div>",
  "nota": "El mismo panel semitransparente, sobre el mismo fondo a rayas. Antes: sin backdrop-filter, las rayas del fondo se ven nítidas a través del panel. Después: backdrop-filter: blur(8px) difumina SOLO lo que hay detrás del panel — las rayas quedan borrosas, mientras el texto encima sigue perfectamente legible."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .panel {\n    background: white;\n    backdrop-filter: blur(10px);\n  }\n</style>",
  "opciones": [
    "El efecto de desenfoque se aprecia perfectamente, backdrop-filter no necesita ninguna transparencia",
    "El efecto no se aprecia: con un fondo blanco totalmente opaco, no hay nada visible 'detrás' que desenfocar",
    "Es un error de sintaxis: backdrop-filter no acepta la función blur()"
  ],
  "correcta": 1,
  "explicacion": "backdrop-filter filtra lo que hay DETRÁS del elemento — pero un background: white completamente opaco tapa por completo esa zona. Sin ningún grado real de transparencia (como rgb(255 255 255 / 30%)), no hay nada visible detrás que el filtro pueda difuminar."
}
```

## Lo que filter NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "filter y backdrop-filter son la misma propiedad con otro nombre",
      "realidad": "filter afecta al propio elemento y su contenido; backdrop-filter afecta a lo que hay DETRÁS del elemento, hasta la raíz de apilamiento más cercana."
    },
    {
      "mito": "drop-shadow() y box-shadow producen siempre el mismo resultado visual",
      "realidad": "drop-shadow sigue la forma real del contenido (letras, transparencias); box-shadow siempre sigue el rectángulo de la caja."
    },
    {
      "mito": "El orden de varios filtros en una misma declaración no importa",
      "realidad": "Se aplican en el orden en que se escriben — un filtro posterior actúa sobre el resultado del anterior, no al revés."
    },
    {
      "mito": "backdrop-filter funciona igual con cualquier fondo, transparente o no",
      "realidad": "Sin ningún grado real de transparencia, no hay nada visible detrás que filtrar — el efecto simplemente no se aprecia."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir filter con backdrop-filter.", "texto": "Uno afecta al elemento, el otro a lo que hay detrás — no son intercambiables." },
    { "titulo": "Olvidar que backdrop-filter necesita un fondo semitransparente para notarse.", "texto": "Sobre un fondo opaco, el efecto simplemente no se ve." },
    { "titulo": "Esperar que box-shadow siga la forma real del contenido.", "texto": "Siempre sigue el rectángulo de la caja — para eso está drop-shadow." },
    { "titulo": "No tener en cuenta que el orden de varios filtros afecta el resultado.", "texto": "Cada filtro actúa sobre el resultado del anterior, no de forma independiente." }
  ]
}
```

## Ejercicios

1. Escribe una regla que aplique `blur(6px)` y `grayscale(50%)` a la vez sobre una imagen.
2. Escribe un efecto de vidrio esmerilado con `backdrop-filter: blur()` sobre un fondo semitransparente.
3. Explica la diferencia entre `drop-shadow()` y `box-shadow` con un ejemplo propio.
4. Explica por qué `backdrop-filter: blur(10px)` sobre un `background: white` totalmente opaco no produce ningún efecto visible.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Aplica blur(6px) y grayscale(50%) a la vez sobre esta imagen (ejercicio 1). Escribe también un efecto de vidrio esmerilado con backdrop-filter: blur() sobre el panel semitransparente (ejercicio 2).",
  "html": "<img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160'%3E%3Crect width='240' height='160' fill='%23e07a3f'/%3E%3C/svg%3E\" alt=\"\">\n<div class=\"fondo\">\n  <div class=\"panel-cristal\">Panel con backdrop-filter</div>\n</div>",
  "css": ".foto { /* filter: blur(6px) grayscale(50%); */ }\n.fondo { background: linear-gradient(45deg, #7c3aed, #ec4899); padding: 40px; }\n.panel-cristal { background: rgb(255 255 255 / 0.2); padding: 16px; color: white; /* backdrop-filter: blur(8px); */ }",
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
      "titulo": "Advanced styling effects",
      "descripcion": "Guía de MDN con una introducción a filter: blur, grayscale y drop-shadow, comparado con box-shadow.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Filters",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre las funciones de filter y su combinación con backdrop-filter.",
      "url": "https://web.dev/learn/css/filters",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "filter",
      "descripcion": "Referencia de MDN con el detalle completo de cada función de filtro, incluidas hue-rotate, saturate y sepia, y cómo se combinan varias en una declaración.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/filter",
      "etiqueta": "MDN"
    }
  ]
}
```
