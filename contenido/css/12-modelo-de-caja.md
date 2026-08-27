# El modelo de caja: content, padding, border, margin

- **Módulo:** El modelo de caja
- **Slug:** `el-modelo-de-caja-content-padding-border-margin` (autogenerado del título)
- **Orden:** 55
- **Fuentes:** [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) — ver `contenido/css/TEMARIO.md` #12

---

## Qué es y para qué sirve

Todo lo que CSS pone en pantalla es, por dentro, una caja rectangular con cuatro capas concéntricas: el contenido, el padding a su alrededor, el borde que lo envuelve, y el margen que lo separa de lo demás. Entender estas cuatro capas — y cuáles suman al tamaño final de la caja y cuáles no — es la base de casi cualquier problema de "por qué esto mide más de lo que puse" en CSS.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita las cuatro capas claras en la cabeza",
  "roles": [
    { "etiqueta": "Quien depura por qué algo no encaja", "rol": "Saber qué suma al tamaño y qué no", "descripcion": "\"Puse width: 200px y mide más\" es casi siempre el border y el padding sumándose al ancho declarado — entender el modelo de caja resuelve la mayoría de estas sorpresas." },
    { "etiqueta": "Quien maqueta espaciado entre elementos", "rol": "Elegir entre padding y margin a propósito", "descripcion": "El padding empuja el borde de la propia caja hacia fuera; el margin solo aparta la caja de sus vecinas — confundirlos produce fondos y bordes en el lugar equivocado." },
    { "etiqueta": "Quien usa las herramientas de desarrollo", "rol": "Leer el diagrama de caja que muestra el inspector", "descripcion": "Firefox y Chrome dibujan las cuatro capas con colores al inspeccionar cualquier elemento — reconocerlas ahí acelera cualquier sesión de depuración." }
  ]
}
```

## Las cuatro capas, de dentro hacia fuera

```laboratorio
{
  "tipo": "capas-de-caja",
  "titulo": "Radiografía de una caja con margin: 10px, border: 5px solid y padding: 25px",
  "margin": "10px",
  "border": "5px solid",
  "padding": "25px",
  "content": "350 × 150"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Solo tres de las cuatro capas suman al tamaño de la caja",
  "contenido": "content, padding y border se suman entre sí para formar el tamaño real y visible de la caja. margin queda FUERA de esa cuenta — nunca forma parte del tamaño de la caja, solo del espacio que deja alrededor de ella. Por eso el margin puede ser negativo (para superponer cajas) y el padding no."
}
```

## El cálculo del tamaño total

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    width: 350px;\n    height: 150px;\n    padding: 25px;\n    border: 5px solid black;\n    margin: 10px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "width: 350px;\n    height: 150px;", "nota": "En el modelo estándar (el que usa CSS por defecto), width y height se aplican solo al content — la parte donde vive el contenido, no a la caja completa." },
    { "fragmento": "padding: 25px;", "nota": "Suma 25px a cada lado del content. Ancho visible hasta aquí: 350 + 25 + 25 = 400px." },
    { "fragmento": "border: 5px solid black;", "nota": "Suma otros 5px a cada lado, por fuera del padding. Ancho visible total de la caja: 400 + 5 + 5 = 410px — 60px más que el width declarado." },
    { "fragmento": "margin: 10px;", "nota": "No suma al tamaño de la caja en absoluto — solo aparta esta caja 10px de lo que tenga alrededor. La caja sigue midiendo 410px, el margin solo afecta el espacio de fuera." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    width: 200px;\n    padding: 15px;\n    border: 3px solid black;\n  }\n</style>\n<div class=\"caja\">Contenido</div>",
  "opciones": [
    "El ancho visible total es 200px",
    "El ancho visible total es 236px (200 + 15 + 15 + 3 + 3)",
    "El ancho visible total es 218px (200 + 15 + 3)"
  ],
  "correcta": 1,
  "explicacion": "En el modelo estándar, width se aplica solo al content. El padding suma 15px a cada lado (30px en total) y el border suma 3px a cada lado (6px en total): 200 + 15 + 15 + 3 + 3 = 236px de ancho visible — bastante más que los 200px que se declararon."
}
```

## Verlo en vivo: el padding empuja el ancho real

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    width: 300px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n    padding: 8px;\n  }\n  .caja {\n    width: 250px;\n    background: #ede9fe;\n    padding: 0;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">Caja de 250px, sin padding</div>\n</div>",
  "despues": "<style>\n  .contenedor {\n    width: 300px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n    padding: 8px;\n  }\n  .caja {\n    width: 250px;\n    background: #ede9fe;\n    padding: 40px;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">Caja con padding: 40px añadido</div>\n</div>",
  "nota": "El único cambio es añadir padding: 40px a la caja morada, sin tocar su width: 250px. Su ancho real pasa a ser 250 + 40 + 40 = 330px — más ancho que el propio contenedor punteado de 300px, así que se sale visiblemente de él."
}
```

## El margen no es parte de la caja — y puede colapsar

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .pila {\n    display: flex;\n    flex-direction: column;\n    font-family: sans-serif;\n  }\n  .uno { background: #dbeafe; margin-bottom: 50px; padding: 8px; }\n  .dos { background: #fce7f3; margin-top: 30px; padding: 8px; }\n</style>\n<div class=\"pila\">\n  <div class=\"uno\">Caja uno (margin-bottom: 50px)</div>\n  <div class=\"dos\">Caja dos (margin-top: 30px)</div>\n</div>",
  "despues": "<style>\n  .pila {\n    font-family: sans-serif;\n  }\n  .uno { background: #dbeafe; margin-bottom: 50px; padding: 8px; }\n  .dos { background: #fce7f3; margin-top: 30px; padding: 8px; }\n</style>\n<div class=\"pila\">\n  <div class=\"uno\">Caja uno (margin-bottom: 50px)</div>\n  <div class=\"dos\">Caja dos (margin-top: 30px)</div>\n</div>",
  "nota": "Mismos márgenes en los dos casos: 50px abajo, 30px arriba. Antes, dentro de un contenedor flex, los márgenes NUNCA colapsan entre elementos flex — el hueco es la suma completa, 80px. Después, en flujo normal de bloque, esos mismos márgenes COLAPSAN al mayor de los dos — el hueco final es solo 50px, no 80px."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .uno { margin-bottom: 50px; }\n  .dos { margin-top: -10px; }\n</style>\n<div class=\"uno\">Uno</div>\n<div class=\"dos\">Dos</div>",
  "opciones": [
    "El hueco final es 40px (50 menos el valor absoluto de -10)",
    "El hueco final es 60px (50 + 10, sumando los valores absolutos)",
    "El hueco final es 50px: el margen negativo simplemente se ignora"
  ],
  "correcta": 0,
  "explicacion": "Cuando colapsan un margen positivo y uno negativo, el resultado es la resta del positivo menos el valor absoluto del negativo — ni el mayor de los dos gana sin más, ni se suman los valores absolutos. 50 - 10 = 40px de hueco final."
}
```

## Un elemento inline ignora width, height y los márgenes verticales

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  span.enlace {\n    width: 150px;\n    height: 60px;\n    background: #ede9fe;\n    padding: 12px;\n    font-family: sans-serif;\n    display: inline;\n  }\n</style>\n<p>Texto antes <span class=\"enlace\">Enlace</span> texto después.</p>",
  "despues": "<style>\n  span.enlace {\n    width: 150px;\n    height: 60px;\n    background: #ede9fe;\n    padding: 12px;\n    font-family: sans-serif;\n    display: inline-block;\n  }\n</style>\n<p>Texto antes <span class=\"enlace\">Enlace</span> texto después.</p>",
  "nota": "Mismo width: 150px y height: 60px en los dos casos. Antes, con display: inline (el valor por defecto de un span), esas dos propiedades simplemente no tienen ningún efecto — el span solo mide lo que ocupa su texto. Después, con inline-block, el span respeta el width y el height declarados sin dejar de fluir en la misma línea que el texto."
}
```

## Lo que el modelo de caja NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "padding y border siempre se suman al width declarado, sin excepción",
      "realidad": "Depende de box-sizing: en el modelo estándar (content-box) sí se suman, pero con box-sizing: border-box el width declarado YA incluye padding y border — se explica en la siguiente lección."
    },
    {
      "mito": "El margin forma parte del tamaño real de una caja",
      "realidad": "El margin nunca cuenta como parte del tamaño — solo afecta el espacio alrededor de la caja en el flujo del documento. Por eso puede ser negativo, cosa que el padding nunca puede."
    },
    {
      "mito": "Dos márgenes verticales que se tocan siempre se suman",
      "realidad": "Colapsan al mayor de los dos (o se restan si uno es negativo) en flujo normal de bloque — no se suman, salvo en contextos donde el colapso está desactivado, como flexbox o grid."
    },
    {
      "mito": "width y height siempre funcionan igual, sin importar el display del elemento",
      "realidad": "En un elemento con display: inline, width, height y los márgenes verticales (arriba y abajo) simplemente no tienen ningún efecto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que padding y border se suman al width en el modelo estándar.", "texto": "Una caja con width: 200px y bastante padding termina midiendo mucho más de 200px — sorprendente hasta que se conoce esta regla." },
    { "titulo": "Esperar que dos márgenes verticales adyacentes se sumen.", "texto": "En flujo normal de bloque, colapsan al mayor de los dos — sumar mentalmente los valores lleva a calcular mal el espacio real." },
    { "titulo": "Poner width o height en un span u otro elemento inline sin cambiar su display.", "texto": "Esas propiedades no tienen efecto alguno en un elemento inline por defecto — hace falta inline-block o block." },
    { "titulo": "No usar box-sizing: border-box desde el principio del proyecto.", "texto": "Sin él, cualquier cálculo de tamaño con padding o border exige sumar manualmente esas capas — la siguiente lección explica cómo evitarlo." }
  ]
}
```

## Ejercicios

1. Una caja tiene `width: 200px`, `padding: 15px` y `border: 3px solid`, en el modelo estándar (content-box). Calcula su ancho total visible sin ejecutarlo.
2. Dos párrafos hermanos tienen `margin-bottom: 20px` y `margin-top: 35px` respectivamente, en flujo normal de bloque. Calcula el hueco final entre ellos y explica por qué no es 55px.
3. Explica por qué darle `padding-top` a un `<span>` sin cambiar su `display` puede hacer que el texto se superponga visualmente con la línea de arriba.
4. Escribe una regla que haga que un `<a>` tenga una zona de clic más grande que su propio texto, usando lo aprendido sobre elementos inline en esta lección.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The box model",
      "descripcion": "Guía de MDN sobre las cuatro capas de una caja, el colapso de márgenes y las diferencias entre cajas de bloque, en línea e inline-block.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Box model",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con la distinción entre tamaño intrínseco y extrínseco de una caja.",
      "url": "https://web.dev/learn/css/box-model",
      "etiqueta": "web.dev"
    }
  ]
}
```
