# Valores y unidades: absolutas, relativas y funciones modernas

- **Módulo:** El modelo de caja
- **Slug:** `valores-y-unidades-absolutas-relativas-y-funciones-modernas` (autogenerado del título)
- **Orden:** 65
- **Fuentes:** [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) + [Sizing units (web.dev)](https://web.dev/learn/css/sizing) — ver `contenido/css/TEMARIO.md` #14

---

## Qué es y para qué sirve

`16px`, `1rem`, `40%`, `50vh`, `calc(100% - 20px)` — todas son formas válidas de decir "este tamaño". Pero no son intercambiables: cada una responde a una pregunta distinta (¿respecto a qué se mide?), y elegir mal produce desde texto que ignora las preferencias de accesibilidad de quien lee hasta layouts que se rompen al cambiar el tamaño del contenedor.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita elegir la unidad correcta a propósito",
  "roles": [
    { "etiqueta": "Quien piensa en accesibilidad", "rol": "Respetar el tamaño de fuente que configura cada persona", "descripcion": "rem y em responden a la preferencia de tamaño de fuente del navegador; px la ignora por completo, sin importar lo que la persona haya configurado." },
    { "etiqueta": "Quien maqueta de forma responsive", "rol": "Elegir % o vw/vh cuando el tamaño depende del contexto", "descripcion": "Un ancho en porcentaje se adapta solo al contenedor; un ancho fijo en px no se entera de que el contenedor cambió." },
    { "etiqueta": "Quien anida tipografía relativa", "rol": "Evitar que el texto crezca sin querer en cada nivel", "descripcion": "em se acumula en cascada cuando se anida; rem no — confundirlos produce texto cada vez más grande (o más pequeño) según la profundidad." }
  ]
}
```

## Unidades absolutas: siempre el mismo tamaño

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "px es la única unidad absoluta de uso habitual en pantalla",
  "contenido": "cm, mm, in y pt existen pero casi nunca se usan fuera de hojas pensadas para imprimir. px es la unidad absoluta real del día a día — pero \"absoluta\" no significa \"un píxel físico exacto\": 1px está pensado para verse perceptualmente igual en un móvil, un portátil o una pantalla grande, ajustándose a la densidad real de cada dispositivo."
}
```

## em y rem: relativas, pero relativas a cosas distintas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  html {\n    font-size: 16px;\n  }\n\n  .a {\n    font-size: 1.3em;\n  }\n\n  .b {\n    font-size: 1.3rem;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    font-size: 1.3em;\n  }", "nota": "em, usado en font-size, se calcula sobre el font-size del elemento PADRE. Si el padre ya tiene un font-size distinto de 16px (por ejemplo, por otro em anidado), este 1.3em se multiplica sobre ESE valor, no sobre 16px." },
    { "fragmento": ".b {\n    font-size: 1.3rem;\n  }", "nota": "rem (\"root em\") siempre se calcula sobre el font-size de la raíz (<html>), sin importar en qué nivel de anidamiento esté el elemento: 16 × 1.3 = 20.8px, siempre." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  html { font-size: 16px; }\n  ul, li { font-family: sans-serif; margin: 0; padding-left: 20px; }\n  .lista-em, .lista-em li { font-size: 1.3em; }\n</style>\n<ul class=\"lista-em\">\n  <li>Nivel 1\n    <ul>\n      <li>Nivel 2\n        <ul>\n          <li>Nivel 3</li>\n        </ul>\n      </li>\n    </ul>\n  </li>\n</ul>",
  "despues": "<style>\n  html { font-size: 16px; }\n  ul, li { font-family: sans-serif; margin: 0; padding-left: 20px; }\n  .lista-rem, .lista-rem li { font-size: 1.3rem; }\n</style>\n<ul class=\"lista-rem\">\n  <li>Nivel 1\n    <ul>\n      <li>Nivel 2\n        <ul>\n          <li>Nivel 3</li>\n        </ul>\n      </li>\n    </ul>\n  </li>\n</ul>",
  "nota": "Mismo 1.3, mismo nivel de anidamiento en los dos casos. Antes (em): cada nivel multiplica sobre el tamaño YA agrandado del nivel anterior — el texto crece visiblemente en cada vuelta. Después (rem): los tres niveles miden exactamente lo mismo, porque rem siempre mira al font-size de la raíz, nunca al del padre inmediato."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  html { font-size: 16px; }\n  .a { font-size: 1.5em; }\n  .a .b { font-size: 1.5em; }\n</style>\n<div class=\"a\">Texto A\n  <div class=\"b\">Texto B</div>\n</div>",
  "opciones": [
    "Texto B mide 24px (16 × 1.5)",
    "Texto B mide 36px (16 × 1.5 × 1.5) — el em de B se calcula sobre el tamaño ya multiplicado de A",
    "Texto B mide 16px: el em anidado no tiene ningún efecto adicional"
  ],
  "correcta": 1,
  "explicacion": "Texto A ya mide 16 × 1.5 = 24px. Texto B, anidado dentro de A, vuelve a multiplicar 1.5 — pero sobre esos 24px del padre, no sobre los 16px de la raíz: 24 × 1.5 = 36px. Así es como em se va acumulando (compounding) en cada nivel anidado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "px en el texto ignora las preferencias de quien lee",
  "contenido": "Si alguien sube el tamaño de fuente por defecto en su navegador (una preferencia de accesibilidad real, no algo raro), un texto en rem o em crece con esa preferencia. Un texto en px se queda exactamente igual — la propia guía de web.dev lo señala: con px, esa preferencia del usuario simplemente se ignora."
}
```

## Porcentajes: relativos al elemento padre

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    width: 400px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    width: 40%;\n    background: #ede9fe;\n    padding: 8px;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">width: 40% de un contenedor de 400px = 160px</div>\n</div>",
  "despues": "<style>\n  .contenedor {\n    width: 200px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    width: 40%;\n    background: #ede9fe;\n    padding: 8px;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">width: 40% de un contenedor de 200px = 80px</div>\n</div>",
  "nota": "El mismo width: 40% en los dos casos — lo único que cambia es el ancho del contenedor, de 400px a 200px. El resultado en píxeles se reduce a la mitad exacta, porque un porcentaje siempre se calcula sobre el tamaño del elemento padre, nunca sobre un valor fijo propio."
}
```

## Unidades de viewport: relativas a la pantalla

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .hero {\n    width: 100vw;\n    height: 50vh;\n  }\n\n  .ancho-limitado {\n    width: min(90vw, 600px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "width: 100vw;\n    height: 50vh;", "nota": "vw es 1% del ancho del viewport, vh es 1% de su alto. 100vw es el ancho completo de la pantalla; 50vh, la mitad de su alto — sin importar el tamaño de ningún elemento padre." },
    { "fragmento": "width: min(90vw, 600px);", "nota": "min() elige el valor más pequeño de la lista: en pantallas pequeñas, gana 90vw (más pequeño que 600px); en pantallas grandes, gana el tope fijo de 600px. También existen dvh, svh y lvh — variantes de vh pensadas para móvil, donde la barra del navegador aparece y desaparece al hacer scroll." }
  ]
}
```

## calc(), min(), max() y clamp(): combinar unidades distintas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    width: calc(100% - 100px);\n  }\n\n  .titulo {\n    font-size: clamp(1.2rem, 4vw, 2.5rem);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "width: calc(100% - 100px);", "nota": "calc() puede MEZCLAR unidades completamente distintas en una sola expresión — algo que ni % ni px pueden hacer por separado. Aquí resta 100px fijos de un ancho que sigue siendo relativo al contenedor." },
    { "fragmento": "font-size: clamp(1.2rem, 4vw, 2.5rem);", "nota": "clamp(mínimo, preferido, máximo) fija un rango: el tamaño de fuente crece con el viewport (4vw) pero nunca baja de 1.2rem ni sube de 2.5rem — tipografía fluida sin necesitar una media query." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    width: 400px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .texto {\n    width: 100%;\n    background: #ede9fe;\n    padding: 8px;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"texto\">width: 100% completo</div>\n</div>",
  "despues": "<style>\n  .contenedor {\n    width: 400px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .texto {\n    width: calc(100% - 100px);\n    margin-left: 100px;\n    background: #ede9fe;\n    padding: 8px;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"texto\">width: calc(100% - 100px)</div>\n</div>",
  "nota": "Antes, el texto ocupa el 100% del contenedor. Después, calc(100% - 100px) reserva 100px fijos a la izquierda (aquí simulados con margin-left) y el elemento ocupa el resto — combinando un porcentaje relativo con un valor fijo en la misma expresión, algo que ninguna unidad por separado permite."
}
```

## Lo que las unidades NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "em y rem son intercambiables, solo cambia el nombre",
      "realidad": "em se acumula en cada nivel anidado cuando se usa para font-size; rem siempre parte del font-size de la raíz, sin acumularse nunca, sin importar cuántos niveles de anidamiento haya."
    },
    {
      "mito": "px es la unidad más segura porque siempre da el mismo resultado",
      "realidad": "Para tamaño de texto, px ignora la preferencia de tamaño de fuente que la persona haya configurado en su navegador — rem y em sí la respetan."
    },
    {
      "mito": "Un mismo porcentaje siempre produce el mismo tamaño en píxeles",
      "realidad": "Depende por completo del tamaño del elemento padre — el mismo 40% da resultados distintos en contenedores de distinto tamaño."
    },
    {
      "mito": "calc() solo puede combinar dos porcentajes, o dos valores en px",
      "realidad": "Puede mezclar unidades completamente distintas en la misma expresión, como % y px juntos — algo que ninguna de las dos por separado permite hacer."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar em para font-size en elementos anidados sin pensar en la acumulación.", "texto": "Cada nivel multiplica sobre el tamaño ya agrandado del padre — tres niveles anidados con 1.2em cada uno no dan un texto 1.2 veces más grande, sino mucho más." },
    { "titulo": "Usar px para tamaños de texto por costumbre.", "texto": "Ignora sin querer la preferencia de tamaño de fuente configurada en el navegador de quien lee — rem respeta esa preferencia." },
    { "titulo": "Olvidar que un porcentaje depende del tamaño del padre.", "texto": "El mismo 50% da resultados distintos según el contenedor — sorprende cuando el layout cambia sin haber tocado ese valor." },
    { "titulo": "No dejar espacios alrededor de + y - dentro de calc().", "texto": "calc(100% -10px) no funciona como se espera — el operador de resta necesita un espacio real a cada lado para que el navegador lo interprete como una operación, no como parte de un número negativo." }
  ]
}
```

## Ejercicios

1. Convierte `2rem` a píxeles sabiendo que el font-size de la raíz es `16px`.
2. Explica por qué `font-size: 1.2em` en tres niveles de listas anidadas no da el mismo tamaño de texto en cada nivel, y cómo se arregla usando `rem` en su lugar.
3. Escribe una regla con `calc()` que haga que un elemento mida el 100% del ancho de su contenedor, menos 40px fijos.
4. Explica por qué escribir `font-size: 16px` en vez de `font-size: 1rem` hace que una persona que sube el tamaño de fuente por defecto en su navegador no vea ningún cambio en ese texto concreto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Values and units",
      "descripcion": "Guía de MDN sobre los tipos de valores de CSS: unidades absolutas y relativas, porcentajes y la función calc().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Sizing units",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con unidades menos comunes (ch, dvh/svh/lvh) y la razón de accesibilidad para preferir rem sobre px.",
      "url": "https://web.dev/learn/css/sizing",
      "etiqueta": "web.dev"
    }
  ]
}
```
