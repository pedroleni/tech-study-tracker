# Dibujar en el navegador: la API Canvas

- **Módulo:** APIs del navegador
- **Slug:** `dibujar-en-el-navegador-la-api-canvas` (autogenerado del título)
- **Orden:** 188
- **Fuentes:** [Drawing graphics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Drawing_graphics) — ver `contenido/javascript/TEMARIO.md` #63

---

## Qué es y para qué sirve

`<canvas>` es un lienzo en blanco — todo lo que se dibuja en él pasa por su contexto de dibujo, obtenido una sola vez con `getContext('2d')`. Rectángulos, formas libres, texto: todo comparte el mismo patrón de dibujar y rellenar (o delinear).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita dibujar directamente en pantalla",
  "roles": [
    { "etiqueta": "Quien obtiene el lienzo", "rol": "getContext('2d')", "descripcion": "Todas las operaciones de dibujo pasan por este objeto, nunca directamente sobre el <canvas>." },
    { "etiqueta": "Quien rellena una forma", "rol": "fillStyle + fillRect()/fill()", "descripcion": "Dibuja el interior con el color indicado." },
    { "etiqueta": "Quien dibuja solo el contorno", "rol": "strokeStyle + strokeRect()/stroke()", "descripcion": "El mismo patrón, pero solo la línea exterior, sin rellenar." }
  ]
}
```

## El contexto 2D y un rectángulo relleno

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const canvas = document.querySelector('canvas');\n  const ctx = canvas.getContext('2d');\n\n  ctx.fillStyle = 'red';\n  ctx.fillRect(50, 50, 100, 150); // x, y, ancho, alto\n</script>",
  "anotaciones": [
    { "fragmento": "const ctx = canvas.getContext('2d');", "nota": "getContext('2d') devuelve el objeto CanvasRenderingContext2D — TODAS las operaciones de dibujo pasan por él, nunca directamente sobre el elemento <canvas>." },
    { "fragmento": "ctx.fillRect(50, 50, 100, 150); // x, y, ancho, alto", "nota": "fillRect(x, y, ancho, alto) dibuja un rectángulo relleno con el color de fillStyle." }
  ]
}
```

## Solo el contorno: strokeRect()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  ctx.strokeStyle = 'white';\n  ctx.lineWidth = 5;\n  ctx.strokeRect(25, 25, 175, 200);\n</script>",
  "anotaciones": [
    { "fragmento": "ctx.strokeRect(25, 25, 175, 200);", "nota": "strokeRect() dibuja solo el CONTORNO, con el color de strokeStyle y el grosor de lineWidth — sin rellenar el interior, a diferencia de fillRect()." }
  ]
}
```

## Formas libres: un path paso a paso

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  ctx.fillStyle = 'red';\n  ctx.beginPath();\n  ctx.moveTo(50, 50);\n  ctx.lineTo(150, 50);\n  ctx.lineTo(100, 150);\n  ctx.fill();\n</script>",
  "anotaciones": [
    { "fragmento": "ctx.beginPath();\n  ctx.moveTo(50, 50);", "nota": "beginPath() empieza una figura nueva; moveTo() mueve el 'lápiz' SIN dibujar nada todavía." },
    { "fragmento": "ctx.fill();", "nota": "fill() rellena el interior de la figura resultante — sin llamarlo, el path se define pero no se ve nada en pantalla." }
  ]
}
```

## Círculos: arc(), y radianes en vez de grados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function gradosARadianes(grados) {\n    return (grados * Math.PI) / 180;\n  }\n\n  ctx.fillStyle = 'blue';\n  ctx.beginPath();\n  ctx.arc(150, 106, 50, gradosARadianes(0), gradosARadianes(360), false);\n  ctx.fill();\n</script>",
  "anotaciones": [
    { "fragmento": "ctx.arc(150, 106, 50, gradosARadianes(0), gradosARadianes(360), false);", "nota": "arc(centroX, centroY, radio, ánguloInicial, ánguloFinal, sentidoAntihorario) — los ángulos se dan en RADIANES, no en grados, de ahí la necesidad de convertirlos a mano." }
  ]
}
```

## Texto: píxeles, no texto real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  ctx.strokeStyle = 'white';\n  ctx.font = '36px arial';\n  ctx.strokeText('Texto en canvas', 50, 50);\n\n  ctx.fillStyle = 'red';\n  ctx.font = '48px georgia';\n  ctx.fillText('Texto en canvas', 50, 150);\n\n  canvas.setAttribute('aria-label', 'Texto en canvas');\n</script>",
  "anotaciones": [
    { "fragmento": "ctx.fillText('Texto en canvas', 50, 150);", "nota": "fillText()/strokeText() dibujan texto como PÍXELES, no como texto real del DOM — invisible para lectores de pantalla o para el buscador del navegador." },
    { "fragmento": "canvas.setAttribute('aria-label', 'Texto en canvas');", "nota": "Por eso conviene añadir aria-label al propio <canvas> con el mismo contenido, para no dejarlo completamente inaccesible." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "clearRect() frente a un relleno semitransparente",
  "contenido": "clearRect(x, y, ancho, alto) borra por completo esa zona, dejándola transparente. Rellenarla con un color semitransparente en su lugar (como rgba(0, 0, 0, 0.25)) crea en cambio un efecto de estela — lo dibujado antes se va desvaneciendo poco a poco, en vez de desaparecer de golpe."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const ctx = document.querySelector('canvas').getContext('2d');\n  ctx.fillStyle = 'green';\n  ctx.fillRect(10, 20, 100, 50);\n</script>",
  "opciones": [
    "En x=10, y=20 — medido desde la esquina SUPERIOR IZQUIERDA del canvas, no desde el centro ni desde abajo",
    "En el centro del canvas, desplazado 10px a la derecha y 20px hacia abajo",
    "En x=10, y=20 medido desde la esquina INFERIOR IZQUIERDA, como en un plano cartesiano normal"
  ],
  "correcta": 0,
  "explicacion": "En un canvas, el origen (0, 0) está en la esquina SUPERIOR IZQUIERDA — x crece hacia la derecha, y crece hacia ABAJO (al revés que un plano cartesiano matemático normal). fillRect(10, 20, 100, 50) dibuja su esquina superior izquierda en (10, 20), medido desde arriba-izquierda del canvas."
}
```

## Lo que Canvas NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Se puede dibujar directamente sobre el elemento <canvas>, sin pasar por ningún objeto intermedio",
      "realidad": "Todas las operaciones pasan por el contexto obtenido con getContext('2d')."
    },
    {
      "mito": "arc() recibe los ángulos en grados, como en la vida cotidiana",
      "realidad": "Los recibe en RADIANES — hay que convertir a mano si se piensa en grados."
    },
    {
      "mito": "El texto dibujado con fillText() sigue siendo texto real, accesible para lectores de pantalla",
      "realidad": "Se convierte en píxeles — hace falta aria-label en el <canvas> para no perder la accesibilidad."
    },
    {
      "mito": "clearRect() y rellenar con un color semitransparente hacen exactamente lo mismo",
      "realidad": "clearRect() borra del todo; el color semitransparente crea un efecto de estela, superponiendo capas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar llamar a fill() o stroke() después de definir un path.", "texto": "Sin uno de los dos, la figura se define pero no se ve nada en pantalla." },
    { "titulo": "Confundir grados con radianes al usar arc().", "texto": "Un círculo completo son 2π radianes, no 360 directamente." },
    { "titulo": "No añadir aria-label al canvas cuando contiene texto o información relevante.", "texto": "Sin él, ese contenido es completamente invisible para tecnologías de asistencia." },
    { "titulo": "Pensar que el origen del canvas está en el centro o abajo.", "texto": "Siempre es la esquina superior izquierda, con y creciendo hacia abajo." }
  ]
}
```

## Ejercicios

1. Obtén el contexto 2D de un `<canvas>`, y dibuja un rectángulo relleno con `fillRect()`.
2. Dibuja un rectángulo con solo el contorno, usando `strokeRect()` y `strokeStyle`.
3. Dibuja un círculo con `arc()`, convirtiendo grados a radianes para los ángulos.
4. Escribe texto en el canvas con `fillText()`, y añade un `aria-label` equivalente al elemento.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Obtén el contexto 2D y dibuja un rectángulo relleno con fillRect() (ejercicio 1). Dibuja un rectángulo con solo contorno usando strokeRect() (ejercicio 2). Dibuja un círculo con arc(), convirtiendo grados a radianes (ejercicio 3).",
  "html": "<canvas id=\"lienzo\" width=\"300\" height=\"200\"></canvas>",
  "css": "canvas { border: 1px solid #999; }",
  "js": "const canvas = document.getElementById('lienzo');\nconst ctx = canvas.getContext('2d');\n\nctx.fillStyle = '#7c3aed';\nctx.fillRect(20, 20, 80, 60);\n\nctx.strokeStyle = '#ec4899';\nctx.lineWidth = 3;\nctx.strokeRect(120, 20, 80, 60);\n\nctx.beginPath();\nctx.arc(220, 130, 40, 0, 2 * Math.PI);\nctx.fillStyle = '#10b981';\nctx.fill();",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Drawing graphics",
      "descripcion": "Guía de MDN sobre getContext('2d'), fillRect()/strokeRect(), paths (beginPath/moveTo/lineTo/fill/stroke), arc(), texto con fillText()/strokeText(), y clearRect().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Drawing_graphics",
      "etiqueta": "MDN"
    }
  ]
}
```
