# Bordes, border-radius y sombras

- **Módulo:** Color, fondos y bordes
- **Slug:** `bordes-border-radius-y-sombras` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) + [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) — ver `contenido/css/TEMARIO.md` #21

---

## Qué es y para qué sirve

`border` dibuja la línea alrededor de una caja. `border-radius` redondea sus esquinas — hasta convertirla en un círculo perfecto. `box-shadow` proyecta una sombra que puede hacer que la caja parezca flotar por encima de la página, o hundirse dentro de ella. Tres propiedades, cada una con más matices de los que parece a primera vista.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién usa estas tres propiedades a diario",
  "roles": [
    { "etiqueta": "Quien diseña tarjetas y botones", "rol": "Dar sensación de elevación o profundidad", "descripcion": "box-shadow simula que un elemento flota sobre la página — o, con inset, que está hundido dentro de ella." },
    { "etiqueta": "Quien redondea esquinas a propósito", "rol": "Desde un detalle sutil hasta un círculo perfecto", "descripcion": "border-radius puede ir de un ligero redondeo de marca hasta 50%, suficiente para convertir cualquier caja cuadrada en un círculo." },
    { "etiqueta": "Quien marca solo un lado de un elemento", "rol": "Un borde que separa sin rodear por completo", "descripcion": "border-bottom o border-left aplican la línea a un solo lado — útil para pestañas activas, citas o separadores." }
  ]
}
```

## border: shorthand, por lado, y sus tres partes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    border: 5px solid #0b385f;\n  }\n\n  .b {\n    border-top: 2px dotted rebeccapurple;\n  }\n\n  .c {\n    border-width: 1px;\n    border-style: solid;\n    border-color: black;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    border: 5px solid #0b385f;\n  }", "nota": "El shorthand border fija ancho, estilo y color a la vez, en las cuatro caras. El orden de los tres valores no importa, pero los tres suelen escribirse en este orden por costumbre." },
    { "fragmento": ".b {\n    border-top: 2px dotted rebeccapurple;\n  }", "nota": "border-top (y right/bottom/left) aplican el shorthand a un solo lado — el resto de lados se quedan sin borde, salvo que se declaren aparte." },
    { "fragmento": ".c {\n    border-width: 1px;\n    border-style: solid;\n    border-color: black;\n  }", "nota": "Los tres componentes también existen como propiedades sueltas, cada una aplicándose a las cuatro caras — útil cuando se quiere cambiar solo el color sin tocar el ancho ni el estilo." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; padding: 12px; background: #567895; color: white; font-family: sans-serif; border: 5px solid #0b385f;\">Borde uniforme en los cuatro lados</div>",
  "despues": "<div style=\"width: 200px; padding: 12px; background: #567895; color: white; font-family: sans-serif; border: 5px solid #0b385f; border-bottom-style: dashed;\">Solo el borde inferior es discontinuo</div>",
  "nota": "El mismo border: 5px solid en los dos casos — lo único que se añade después es border-bottom-style: dashed. Cambia el estilo de UN solo lado sin tocar los otros tres, que se quedan con la línea sólida original."
}
```

## border-radius: de un ligero redondeo a un círculo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    border-radius: 10px;\n  }\n\n  .b {\n    border-top-right-radius: 1em 10%;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    border-radius: 10px;\n  }", "nota": "Un solo valor redondea las cuatro esquinas por igual, con el mismo radio horizontal y vertical." },
    { "fragmento": ".b {\n    border-top-right-radius: 1em 10%;\n  }", "nota": "Dos valores en una esquina crean un radio ELÍPTICO: el primero es el radio horizontal (1em), el segundo el vertical (10%) — la esquina deja de ser un cuarto de círculo para ser un cuarto de óvalo." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 200px; height: 100px; border: 6px solid #7c3aed; border-radius: 1em; background: #ede9fe;\"></div>",
  "despues": "<div style=\"width: 200px; height: 100px; border: 6px solid #7c3aed; border-radius: 1em; border-top-right-radius: 40% 70%; background: #ede9fe;\"></div>",
  "nota": "Las cuatro esquinas empiezan iguales, con border-radius: 1em. Después, se añade border-top-right-radius: 40% 70% SOLO a esa esquina — las otras tres siguen con el mismo redondeo uniforme, pero la esquina superior derecha se convierte en un óvalo claramente distinto."
}
```

## box-shadow: offset, blur, spread y color

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .simple {\n    box-shadow: 5px 5px 5px rgb(0 0 0 / 70%);\n  }\n\n  .con-spread {\n    box-shadow: 5px 5px 5px 10px rgb(0 0 0 / 70%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".simple {\n    box-shadow: 5px 5px 5px rgb(0 0 0 / 70%);\n  }", "nota": "Cuatro valores: offset-x (5px a la derecha), offset-y (5px hacia abajo), blur-radius (5px de difuminado) y el color. Sin un quinto valor, no hay spread." },
    { "fragmento": ".con-spread {\n    box-shadow: 5px 5px 5px 10px rgb(0 0 0 / 70%);\n  }", "nota": "El cuarto valor numérico (10px, justo antes del color) es el spread-radius: agranda la sombra entera 10px en todas direcciones, antes de aplicar el difuminado." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 120px; height: 80px; background: #fbbf24; margin: 30px; box-shadow: 5px 5px 2px rgb(0 0 0 / 50%);\"></div>",
  "despues": "<div style=\"width: 120px; height: 80px; background: #fbbf24; margin: 30px; box-shadow: 5px 5px 20px rgb(0 0 0 / 50%);\"></div>",
  "nota": "Mismo offset (5px, 5px) y mismo color en los dos casos — solo cambia el blur-radius, de 2px a 20px. La sombra pasa de un borde nítido y definido a un difuminado amplio y suave."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 120px; height: 80px; background: #fbbf24; margin: 30px; box-shadow: 0 0 10px 0 rgb(0 0 0 / 50%);\"></div>",
  "despues": "<div style=\"width: 120px; height: 80px; background: #fbbf24; margin: 30px; box-shadow: 0 0 10px 15px rgb(0 0 0 / 50%);\"></div>",
  "nota": "Mismo offset (0, 0) y mismo blur (10px) en los dos casos — solo cambia el spread-radius, de 0 a 15px. La sombra crece 15px más allá del propio tamaño de la caja en todas direcciones, mucho más visible alrededor de ella."
}
```

## inset: la sombra se mete dentro de la caja

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"width: 160px; height: 90px; background: #d1d5db; margin: 20px; box-shadow: 4px 4px 8px rgb(0 0 0 / 40%);\"></div>",
  "despues": "<div style=\"width: 160px; height: 90px; background: #d1d5db; margin: 20px; box-shadow: inset 4px 4px 8px rgb(0 0 0 / 40%);\"></div>",
  "nota": "Mismos valores de offset, blur y color en los dos casos — el único cambio es añadir la palabra inset al principio. Antes, la caja parece flotar sobre la página. Después, la sombra se dibuja HACIA DENTRO — la caja parece hundida, como si estuviera tallada en la superficie."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    box-shadow: -10px -10px 0 red;\n  }\n</style>\n<div class=\"caja\" style=\"width: 100px; height: 60px; background: lightblue;\"></div>",
  "opciones": [
    "La sombra roja aparece a la derecha y abajo de la caja",
    "La sombra roja aparece a la izquierda y arriba de la caja",
    "No hay ninguna sombra visible: los valores negativos son inválidos en box-shadow"
  ],
  "correcta": 1,
  "explicacion": "offset-x negativo desplaza la sombra hacia la IZQUIERDA (lo contrario de un valor positivo, que va a la derecha); offset-y negativo la desplaza hacia ARRIBA. Con -10px en los dos, la sombra roja aparece en la esquina superior izquierda de la caja."
}
```

## Lo que bordes, radios y sombras NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "border-radius solo acepta un valor único para las cuatro esquinas",
      "realidad": "Se puede fijar cada esquina por separado (border-top-right-radius, etc.), e incluso con dos valores por esquina para crear radios elípticos."
    },
    {
      "mito": "box-shadow solo puede tener una sombra a la vez",
      "realidad": "Acepta varias sombras apiladas, separadas por comas, cada una con sus propios valores de offset, blur, spread y color."
    },
    {
      "mito": "inset hace que la sombra simplemente se vea más oscura",
      "realidad": "Cambia por completo DÓNDE se dibuja la sombra — de fuera de la caja a dentro de ella, dando un efecto de hundido en vez de elevado."
    },
    {
      "mito": "spread-radius y blur-radius son la misma cosa con distinto nombre",
      "realidad": "blur difumina los bordes de la sombra; spread agranda o encoge el tamaño de la sombra entera antes de difuminarla — son efectos distintos que se combinan."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el orden de los valores de box-shadow.", "texto": "El orden es offset-x, offset-y, blur-radius, spread-radius (opcional), color — escribir el color antes de tiempo produce un resultado inesperado o inválido." },
    { "titulo": "Esperar que border-radius: 50% dé el mismo resultado en cualquier caja.", "texto": "En una caja cuadrada da un círculo perfecto; en una rectangular da una elipse, no un círculo." },
    { "titulo": "Usar un blur-radius muy alto sin bajar la opacidad del color.", "texto": "Deja una sombra demasiado intensa y poco realista — un color semitransparente suele dar un resultado más creíble." },
    { "titulo": "Olvidar que inset invierte completamente el efecto visual.", "texto": "No es solo una sombra más oscura — cambia de un aspecto elevado a uno hundido." }
  ]
}
```

## Ejercicios

1. Escribe una regla que ponga un borde de 3px solo en el lado inferior de un elemento, dejando los otros tres lados sin borde.
2. Escribe una regla con `border-radius: 50%` que convierta una caja de 100×100px en un círculo perfecto.
3. Escribe una sombra con `box-shadow` que tenga desplazamiento 0, un blur amplio y un color semitransparente, para simular un resplandor alrededor de un elemento.
4. Escribe dos sombras apiladas en un mismo `box-shadow`: una exterior sutil y una `inset` más marcada.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un borde de 3px solo en el lado inferior (ejercicio 1). Convierte la segunda caja en un círculo perfecto con border-radius: 50% (ejercicio 2). Añade a la tercera una sombra amplia y difusa tipo resplandor, y después apila dos sombras (ejercicio 3 y 4).",
  "html": "<div class=\"caja-borde\">Solo borde inferior</div>\n<div class=\"caja-circulo\"></div>\n<div class=\"caja-sombra\">Resplandor</div>",
  "css": ".caja-borde { padding: 12px; margin-bottom: 12px; }\n.caja-circulo { width: 100px; height: 100px; background: #999; margin-bottom: 12px; }\n.caja-sombra { width: 120px; height: 60px; background: #333; color: white; display: flex; align-items: center; justify-content: center; }",
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
      "titulo": "Backgrounds and borders",
      "descripcion": "Guía de MDN con la sección de bordes: shorthand, propiedades por lado y border-radius con esquinas elípticas.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Advanced styling effects",
      "descripcion": "Guía de MDN sobre box-shadow: sintaxis completa, spread-radius, inset y cómo apilar varias sombras.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects",
      "etiqueta": "MDN"
    }
  ]
}
```
