# color-mix() y las funciones de color modernas

- **Módulo:** Color, fondos y bordes
- **Slug:** `color-mix-y-las-funciones-de-color-modernas` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [color-mix() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — ver `contenido/css/TEMARIO.md` #19

---

## Qué es y para qué sirve

Antes, aclarar un color de marca para el estado `:hover` de un botón significaba abrir un editor de color, elegir a ojo un tono más claro, y guardar un segundo hex a mano. `color-mix()` hace esa mezcla directamente en CSS: toma dos colores, un porcentaje de cada uno, y calcula el resultado — sin salir del código, y sin inventar un nuevo valor fijo cada vez que hace falta una variante.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se ahorra un editor de color externo",
  "roles": [
    { "etiqueta": "Quien define estados hover/active", "rol": "Aclarar u oscurecer un color de marca sobre la marcha", "descripcion": "color-mix(in oklab, var(--color) 80%, white) genera el tono de :hover directamente desde el color base, sin un segundo valor fijo que mantener sincronizado." },
    { "etiqueta": "Quien necesita variantes translúcidas", "rol": "Generar una versión translúcida de cualquier color", "descripcion": "Mezclar con transparent produce el mismo efecto que ajustar el canal alfa — útil cuando el color de partida es una variable cuyo formato no se controla." },
    { "etiqueta": "Quien construye una paleta reducida", "rol": "Derivar tonos intermedios sin diseñarlos uno a uno", "descripcion": "Mezclar dos colores de marca en distintas proporciones genera una escala completa de tonos intermedios reales, no aproximados a ojo." }
  ]
}
```

## La sintaxis: espacio, color, porcentaje

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { background: color-mix(in oklab, #a71e14 25%, white); }\n  .b { background: color-mix(in oklab, #a71e14, white); }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { background: color-mix(in oklab, #a71e14 25%, white); }", "nota": "in oklab es obligatorio: define el espacio de color en el que se hace la mezcla matemática. #a71e14 al 25% implica que white toma el resto: 75% automáticamente — no hace falta escribir los dos porcentajes." },
    { "fragmento": ".b { background: color-mix(in oklab, #a71e14, white); }", "nota": "Sin ningún porcentaje escrito, los dos colores se mezclan al 50% cada uno por defecto." }
  ]
}
```

## Aclarar y oscurecer sin un segundo color fijo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 80px; background: #a71e14;\"></div>",
  "despues": "<div style=\"width: 200px; height: 80px; background: color-mix(in oklab, #a71e14 40%, white);\"></div>",
  "nota": "El mismo color de partida (#a71e14) en los dos casos. Después, color-mix() lo mezcla con white al 60% — el resultado es una versión más clara del mismo tono, calculada por el navegador, sin haber elegido un segundo hex a mano."
}
```

## Transparencia sin tocar el canal alfa

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .fondo {\n    width: 220px;\n    height: 100px;\n    background: repeating-linear-gradient(45deg, #d1d5db 0 10px, #f3f4f6 10px 20px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .swatch { width: 140px; height: 60px; background: #2563eb; }\n</style>\n<div class=\"fondo\"><div class=\"swatch\"></div></div>",
  "despues": "<style>\n  .fondo {\n    width: 220px;\n    height: 100px;\n    background: repeating-linear-gradient(45deg, #d1d5db 0 10px, #f3f4f6 10px 20px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .swatch { width: 140px; height: 60px; background: color-mix(in srgb, #2563eb 50%, transparent); }\n</style>\n<div class=\"fondo\"><div class=\"swatch\"></div></div>",
  "nota": "Mezclar con transparent produce el mismo efecto que ajustar el canal alfa a mano (como en la lección anterior) — las rayas de fondo se ven a través del azul. La ventaja de color-mix() aparece cuando el color de partida es una variable: funciona igual sin importar si esa variable es un nombre, un hex o un hsl()."
}
```

## Cuando los porcentajes no suman 100%

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { background: color-mix(in oklab, red 60%, blue 50%); }\n  .b { background: color-mix(in srgb, red 30%, blue 30%); }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { background: color-mix(in oklab, red 60%, blue 50%); }", "nota": "60% + 50% = 110%, más del 100%. El navegador NORMALIZA los dos valores manteniendo su proporción: quedan en 54,5% y 45,5% — la mezcla sigue siendo opaca, solo se reparte distinto." },
    { "fragmento": ".b { background: color-mix(in srgb, red 30%, blue 30%); }", "nota": "30% + 30% = 60%, MENOS del 100%. Aquí no se normaliza hacia arriba — la diferencia (40%) se convierte en transparencia: el resultado tiene un 60% de opacidad, no una mezcla opaca al 50/50." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .a { background: color-mix(in srgb, red 30%, blue 30%); }\n</style>\n<div class=\"a\">Caja</div>",
  "opciones": [
    "Se ve un morado totalmente opaco, mezcla al 50/50 de rojo y azul",
    "Se ve un morado, pero con transparencia: 30% + 30% = 60%, así que el resultado tiene 60% de opacidad",
    "Es inválido: los porcentajes deben sumar exactamente 100%"
  ],
  "correcta": 1,
  "explicacion": "Cuando la suma de los dos porcentajes es menor que 100%, la diferencia se convierte en transparencia — no se normaliza hacia una mezcla opaca. 30% + 30% = 60%, así que el color resultante tiene un 60% de opacidad."
}
```

## El camino importa: shorter hue frente a longer hue

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .corto { background: color-mix(in lch shorter hue, red, blue); }\n  .largo { background: color-mix(in lch longer hue, red, blue); }\n</style>",
  "anotaciones": [
    { "fragmento": ".corto { background: color-mix(in lch shorter hue, red, blue); }", "nota": "shorter hue (el valor por defecto en espacios con matiz) toma el camino más corto alrededor de la rueda de color: de rojo a azul pasando por magenta." },
    { "fragmento": ".largo { background: color-mix(in lch longer hue, red, blue); }", "nota": "longer hue toma el camino largo, en la dirección contraria: de rojo a azul pasando por naranja, amarillo, verde y cian. Mismos dos colores de partida, resultado completamente distinto." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 80px; background: color-mix(in lch shorter hue, red 50%, blue 50%);\"></div>",
  "despues": "<div style=\"width: 200px; height: 80px; background: color-mix(in lch longer hue, red 50%, blue 50%);\"></div>",
  "nota": "Exactamente los mismos dos colores de partida (red y blue, 50/50 cada uno) en los dos casos. Antes (shorter hue): el camino corto por la rueda de color da un magenta vivo. Después (longer hue): el camino largo, en la dirección contraria, da un verde — nada que ver con el resultado anterior."
}
```

## Lo que color-mix() NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "color-mix() solo funciona con hex o rgb, no con nombres de color ni variables",
      "realidad": "Acepta cualquier valor de color válido — nombres, hex, rgb, hsl, o una custom property que contenga un color."
    },
    {
      "mito": "Si solo se pone porcentaje a uno de los dos colores, el otro queda sin definir y la función falla",
      "realidad": "El color sin porcentaje toma automáticamente el resto hasta el 100% — no hace falta escribir los dos valores."
    },
    {
      "mito": "shorter hue y longer hue dan resultados parecidos, solo cambia un poco el matiz",
      "realidad": "Pueden dar colores en extremos opuestos de la rueda de color — de un magenta vivo a un verde, mezclando exactamente los mismos dos colores de partida."
    },
    {
      "mito": "color-mix() puede aumentar la opacidad de un color semitransparente",
      "realidad": "Solo puede mantenerla o reducirla, nunca aumentarla — para eso hace falta la sintaxis de color relativo, no color-mix()."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el argumento in <espacio>.", "texto": "Es obligatorio — color-mix() no funciona sin especificar el espacio de interpolación, aunque el navegador use oklab por defecto si no se indica ninguno explícito." },
    { "titulo": "Esperar que dos porcentajes menores de 100% se normalicen a una mezcla opaca.", "texto": "La diferencia hasta el 100% se convierte en transparencia, no se reparte proporcionalmente como cuando la suma supera el 100%." },
    { "titulo": "Mezclar colores en extremos opuestos de la rueda sin fijarse en shorter/longer hue.", "texto": "El resultado puede variar radicalmente según el camino elegido — conviene probar ambos si el color esperado no coincide con el obtenido." },
    { "titulo": "Esperar que color-mix() recupere opacidad perdida de un color semitransparente.", "texto": "Solo puede diluir, nunca concentrar de vuelta un color hacia la opacidad total." }
  ]
}
```

## Ejercicios

1. Escribe una regla que mezcle `#16a34a` con blanco al 30%, usando el espacio `oklab`.
2. Escribe una regla que genere una variante con 25% de opacidad de `var(--color-marca)`, usando `color-mix()` en vez del canal alfa.
3. Explica qué color resultaría de `color-mix(in srgb, red 40%, blue 40%)` y por qué no es una mezcla opaca al 50/50.
4. Explica la diferencia visual entre `color-mix(in lch shorter hue, red, blue)` y `color-mix(in lch longer hue, red, blue)`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe color-mix(in oklab, #16a34a 70%, white 30%) — ejercicio 1. Después genera una variante con 25% de opacidad de --color-marca usando color-mix() en vez del canal alfa (ejercicio 2).",
  "html": "<div class=\"muestra\"></div>\n<div class=\"marca-transparente\">Texto sobre fondo con opacidad vía color-mix</div>",
  "css": ":root { --color-marca: #16a34a; }\n.muestra { height: 50px; /* prueba color-mix() aquí */ }\n.marca-transparente { padding: 12px; /* prueba color-mix(in srgb, var(--color-marca) 25%, transparent) */ }",
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
      "titulo": "color-mix()",
      "descripcion": "Referencia de MDN sobre color-mix(): sintaxis completa, normalización de porcentajes y los cuatro métodos de interpolación de matiz en espacios polares.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix",
      "etiqueta": "MDN"
    }
  ]
}
```
