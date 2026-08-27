# Color en CSS: hex, rgb, hsl y los espacios modernos

- **Módulo:** Color, fondos y bordes
- **Slug:** `color-en-css-hex-rgb-hsl-y-los-espacios-modernos` (autogenerado del título)
- **Orden:** 85
- **Fuentes:** [Color (web.dev)](https://web.dev/learn/css/color) — ver `contenido/css/TEMARIO.md` #18

---

## Qué es y para qué sirve

Rojo puro se puede escribir como `red`, `#ff0000`, `#f00`, `rgb(255 0 0)` o `hsl(0 100% 50%)` — cinco formas distintas, exactamente el mismo color. No son intercambiables por capricho: cada una facilita un tipo de ajuste distinto. hex es compacto, rgb es directo en pantalla, hsl permite aclarar u oscurecer tocando un solo número, y los espacios modernos como oklch van más allá de lo que hex y rgb pueden representar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién elige el formato de color a propósito",
  "roles": [
    { "etiqueta": "Quien construye una paleta de marca", "rol": "Generar variantes más claras u oscuras de un mismo tono", "descripcion": "hsl() permite tocar solo la luminosidad para aclarar u oscurecer, sin tener que recalcular los tres canales de rgb a mano." },
    { "etiqueta": "Quien sincroniza colores repetidos", "rol": "Que un borde o una sombra sigan siempre al color del texto", "descripcion": "currentColor copia el valor de color del propio elemento — cambia una vez y todo lo demás se actualiza solo." },
    { "etiqueta": "Quien necesita transparencia real", "rol": "Dejar ver lo que hay detrás de un color", "descripcion": "El canal alfa de hex, rgb o hsl controla cuánto se ve el fondo a través del color — sin recurrir a otra propiedad como opacity." }
  ]
}
```

## Cinco formas de escribir el mismo color

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Ninguna forma es \"más correcta\" que otra",
  "contenido": "hex, rgb() y hsl() representan exactamente los mismos colores del espacio de color estándar (sRGB) — ninguno es más preciso que otro, solo cambia la forma de escribirlo y qué tan fácil resulta ajustarlo después. Los espacios modernos como oklch sí van más allá: pueden representar colores que sRGB no alcanza a mostrar."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { background: tomato; }\n  .b { background: #b71540; }\n  .c { background: #a4e; }\n  .d { background: #00000080; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { background: tomato; }", "nota": "Un nombre en inglés de entre 148 colores con nombre propio en CSS — cómodo, pero limitado a esos 148 tonos exactos." },
    { "fragmento": ".b { background: #b71540; }", "nota": "Hex de 6 dígitos: dos dígitos hexadecimales por canal (rojo, verde, azul), cada uno del 00 al ff." },
    { "fragmento": ".c { background: #a4e; }", "nota": "Hex de 3 dígitos, la forma abreviada: cada dígito se duplica — #a4e equivale exactamente a #aa44ee." },
    { "fragmento": ".d { background: #00000080; }", "nota": "Hex de 8 dígitos: los dos últimos son el canal alfa (transparencia). 80 en hexadecimal es aproximadamente 50% de opacidad." }
  ]
}
```

## Transparencia real con el canal alfa

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .fondo {\n    width: 220px;\n    height: 100px;\n    background: repeating-linear-gradient(45deg, #d1d5db 0 10px, #f3f4f6 10px 20px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .swatch { width: 140px; height: 60px; background: #dc2626; }\n</style>\n<div class=\"fondo\"><div class=\"swatch\"></div></div>",
  "despues": "<style>\n  .fondo {\n    width: 220px;\n    height: 100px;\n    background: repeating-linear-gradient(45deg, #d1d5db 0 10px, #f3f4f6 10px 20px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .swatch { width: 140px; height: 60px; background: #dc262680; }\n</style>\n<div class=\"fondo\"><div class=\"swatch\"></div></div>",
  "nota": "El fondo a rayas es idéntico en los dos casos. Antes (#dc2626, sin canal alfa): el rectángulo rojo tapa las rayas por completo. Después (#dc262680, con alfa ≈ 50%): las rayas se ven A TRAVÉS del rojo — transparencia real del propio color, sin tocar ninguna otra propiedad."
}
```

## rgb() y hsl(): sintaxis moderna con espacios

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .rgb-moderno { color: rgb(183 21 64 / 60%); }\n  .rgb-clasico { color: rgba(183, 21, 64, 0.6); }\n  .hsl-color { color: hsl(344 79% 40%); }\n</style>",
  "anotaciones": [
    { "fragmento": ".rgb-moderno { color: rgb(183 21 64 / 60%); }", "nota": "Sintaxis moderna: valores separados por espacio, alfa tras una barra. rgb() moderno YA acepta alfa directamente, sin necesitar una función aparte." },
    { "fragmento": ".rgb-clasico { color: rgba(183, 21, 64, 0.6); }", "nota": "Sintaxis clásica, con comas: rgba() es la forma antigua, previa a que rgb() unificara la sintaxis con y sin alfa. Producen el mismo color exacto." },
    { "fragmento": ".hsl-color { color: hsl(344 79% 40%); }", "nota": "hue (344, un tono rosa/rojo en la rueda de 360 grados) — saturation (79%, bastante vivo) — lightness (40%, ni muy claro ni muy oscuro)." }
  ]
}
```

## hsl(): tocar un solo canal para aclarar u oscurecer

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 80px; background: hsl(344 79% 30%);\"></div>",
  "despues": "<div style=\"width: 200px; height: 80px; background: hsl(344 79% 70%);\"></div>",
  "nota": "Mismo hue (344) y misma saturation (79%) en los dos casos — el único número que cambia es la lightness: 30% frente a 70%. hsl() permite oscurecer o aclarar un color tocando un solo canal, sin recalcular los otros dos como haría falta en rgb()."
}
```

## currentColor: sincronizar sin repetir el valor

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .aviso {\n    color: #7c3aed;\n    border: 3px solid currentColor;\n    padding: 8px 12px;\n    font-family: sans-serif;\n    display: inline-block;\n  }\n</style>\n<div class=\"aviso\">Texto y borde a juego</div>",
  "despues": "<style>\n  .aviso {\n    color: #16a34a;\n    border: 3px solid currentColor;\n    padding: 8px 12px;\n    font-family: sans-serif;\n    display: inline-block;\n  }\n</style>\n<div class=\"aviso\">Texto y borde a juego</div>",
  "nota": "border: 3px solid currentColor NO cambia entre las dos versiones — lo único que cambia es color, de morado a verde. Como currentColor siempre copia el valor de color del propio elemento, el borde cambia de color solo, sin haber tocado la propiedad border en absoluto."
}
```

## Espacios de color modernos: más allá de sRGB

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .p3 { color: color(display-p3 0.9 0.2 0.4); }\n  .oklch-color { color: oklch(80% 0.1 200); }\n</style>",
  "anotaciones": [
    { "fragmento": ".p3 { color: color(display-p3 0.9 0.2 0.4); }", "nota": "Display P3 alcanza hasta un 50% más de colores que sRGB (el espacio de hex, rgb y hsl) — útil en pantallas modernas que pueden mostrar esos tonos extra." },
    { "fragmento": ".oklch-color { color: oklch(80% 0.1 200); }", "nota": "oklch (Lightness, Chroma, Hue) ajusta el color de forma perceptualmente uniforme: cambiar solo el hue no afecta a cuán claro o vívido se VE el color — algo que sí pasa al tocar el hue en hsl()." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .a { background: hsl(0 100% 50%); }\n  .b { background: hsl(360 100% 50%); }\n</style>\n<div class=\"a\">A</div>\n<div class=\"b\">B</div>",
  "opciones": [
    "Colores distintos: 0 y 360 son extremos opuestos de la rueda de color",
    "Exactamente el mismo color: 0 y 360 grados son el mismo punto en la rueda de color (rojo)",
    "A es rojo y B es transparente, porque 360 se sale del rango válido"
  ],
  "correcta": 1,
  "explicacion": "El hue es un ángulo sobre una rueda de 360 grados. 0 y 360 son EL MISMO punto exacto, tras dar una vuelta completa — ambos corresponden a rojo puro, sin ninguna diferencia visual entre los dos."
}
```

## Lo que el color en CSS NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "rgb() solo acepta números del 0 al 255, nunca porcentajes",
      "realidad": "Acepta las dos formas indistintamente — rgb(255 0 0) y rgb(100% 0% 0%) son exactamente el mismo color."
    },
    {
      "mito": "rgba() y rgb() con canal alfa son funciones distintas",
      "realidad": "rgb() con la sintaxis moderna acepta alfa directamente (rgb(0 0 0 / 50%)) — rgba() es solo la forma clásica, previa a que se unificara la sintaxis."
    },
    {
      "mito": "El código hexadecimal es la forma más precisa de especificar un color",
      "realidad": "hex, rgb y hsl representan exactamente los mismos colores del espacio sRGB — ninguno es más preciso que otro. oklch sí ofrece una gama de color más amplia que los tres."
    },
    {
      "mito": "currentColor es una palabra clave decorativa sin uso práctico real",
      "realidad": "Sincroniza automáticamente bordes, sombras o rellenos con el color del texto, sin duplicar el valor ni tener que mantenerlo actualizado a mano en varios sitios."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que un hue de 0 y uno de 360 son colores distintos.", "texto": "Son el mismo punto exacto en la rueda de color — 360 grados es una vuelta completa de regreso a 0." },
    { "titulo": "Repetir el mismo valor de color en varias propiedades relacionadas.", "texto": "Cuando de verdad deben coincidir siempre (texto y su propio borde, por ejemplo), currentColor evita mantener dos valores sincronizados a mano." },
    { "titulo": "Elegir hex por costumbre para colores que se van a ajustar a menudo.", "texto": "hsl() u oklch() hacen ese ajuste mucho más directo, tocando un solo canal en vez de recalcular tres valores hexadecimales." },
    { "titulo": "Confundir opacity con el canal alfa del propio color.", "texto": "opacity afecta a TODO el elemento (contenido incluido); el canal alfa de background o color solo afecta a esa propiedad concreta." }
  ]
}
```

## Ejercicios

1. Parte de `hsl(210 80% 45%)` y escribe la misma versión 20 puntos más clara, cambiando solo el canal correspondiente.
2. Escribe el mismo rojo puro (`#ff0000`) en sus cuatro formas: hex de 3 dígitos, hex de 6 dígitos, `rgb()` y `hsl()`.
3. Escribe una regla que haga que el borde de un botón siempre coincida con el color de su propio texto, sin repetir el valor del color dos veces.
4. Explica por qué `hsl(0 100% 50%)` y `hsl(360 100% 50%)` producen exactamente el mismo color.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Color",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre todos los formatos de color: keywords, hex, rgb, hsl, hwb y los espacios modernos como oklch y display-p3.",
      "url": "https://web.dev/learn/css/color",
      "etiqueta": "web.dev"
    }
  ]
}
```
