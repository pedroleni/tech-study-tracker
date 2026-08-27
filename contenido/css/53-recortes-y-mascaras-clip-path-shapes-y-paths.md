# Recortes y máscaras: clip-path, shapes y paths

- **Módulo:** Efectos visuales avanzados
- **Slug:** `recortes-y-mascaras-clip-path-shapes-y-paths` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [Paths, shapes, clipping, and masking (web.dev)](https://web.dev/learn/css/paths-shapes-clipping-masking) — ver `contenido/css/TEMARIO.md` #53

---

## Qué es y para qué sirve

`clip-path` recorta un elemento a una forma concreta — un círculo, un polígono, cualquier trazado — ocultando todo lo que quede fuera. `mask-image` va más allá: en vez de un corte binario (visible o no visible), admite transparencia progresiva. Y `shape-outside` hace que el TEXTO alrededor de un elemento flotante siga el contorno de una forma, no un rectángulo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que un rectángulo",
  "roles": [
    { "etiqueta": "Quien recorta formas no rectangulares", "rol": "Círculos, polígonos, trazados propios", "descripcion": "clip-path recorta un elemento a cualquier forma definida — no solo al rectángulo (o al círculo, con border-radius) habitual." },
    { "etiqueta": "Quien desvanece con degradado", "rol": "Transparencia progresiva, no binaria", "descripcion": "mask-image, con un gradiente, hace que un elemento se desvanezca gradualmente en vez de cortarse de golpe." },
    { "etiqueta": "Quien envuelve texto en una forma", "rol": "Que el párrafo siga el contorno real", "descripcion": "shape-outside hace que el texto de alrededor abrace la forma de un elemento flotante, no su caja rectangular." }
  ]
}
```

## clip-path: circle() y ellipse()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .redondo {\n    clip-path: circle(50%);\n  }\n  .ovalado {\n    clip-path: ellipse(40% 30% at center);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "clip-path: circle(50%);", "nota": "circle() acepta un único radio — 50% recorta el elemento a un círculo perfecto, usando su centro por defecto como punto de origen." },
    { "fragmento": "clip-path: ellipse(40% 30% at center);", "nota": "ellipse() acepta DOS radios (horizontal y vertical) — permite formas ovaladas, no solo círculos perfectos. at define el punto de origen del recorte." }
  ]
}
```

## Verlo en vivo: clip-path: circle()

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 120px; height: 120px; background: linear-gradient(135deg, #f59e0b, #ef4444);\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 120px; height: 120px; background: linear-gradient(135deg, #f59e0b, #ef4444); clip-path: circle(50%);\"></div>\n</div>",
  "nota": "El mismo cuadrado con degradado. Después: clip-path: circle(50%) recorta todo lo que queda fuera de un círculo perfecto centrado — las cuatro esquinas del cuadrado desaparecen por completo, no solo se redondean como haría border-radius."
}
```

## clip-path: inset() con esquinas redondeadas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .recortado {\n    clip-path: inset(15px 5px 15px 10px round 8px);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "clip-path: inset(15px 5px 15px 10px round 8px);", "nota": "inset() recorta hacia ADENTRO desde cada lado (arriba, derecha, abajo, izquierda, en ese orden) — round añade esquinas redondeadas al rectángulo resultante, con la misma sintaxis que border-radius." }
  ]
}
```

## clip-path: polygon(), formas a medida

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .triangulo {\n    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);", "nota": "Cada par de valores es un punto (x, y), conectado al siguiente con una línea recta — tres puntos bastan para un triángulo. Se pueden encadenar tantos puntos como haga falta para cualquier forma poligonal." }
  ]
}
```

## Verlo en vivo: clip-path: polygon()

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 140px; height: 100px; background: linear-gradient(135deg, #0ea5e9, #7c3aed);\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 140px; height: 100px; background: linear-gradient(135deg, #0ea5e9, #7c3aed); clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\"></div>\n</div>",
  "nota": "El mismo rectángulo con degradado. Después: clip-path: polygon(50% 0%, 0% 100%, 100% 100%) lo recorta a un triángulo — solo queda visible el área dentro de esos tres puntos conectados; el resto del rectángulo original desaparece."
}
```

## path() y shape(): trazados más complejos

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sintaxis SVG frente a sintaxis CSS nativa",
  "contenido": "path() acepta la misma sintaxis de trazados que SVG — muy potente, pero usa únicamente píxeles, sin adaptarse al tamaño real del elemento. shape() resuelve justo esa limitación: usa comandos nativos de CSS y admite unidades relativas (%, em...), haciendo el trazado verdaderamente responsivo. A cambio, su soporte en navegadores es más reciente y desigual."
}
```

## mask-image: transparencia progresiva con un gradiente

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .desvanecido {\n    mask-image: linear-gradient(to right, black, transparent);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "mask-image: linear-gradient(to right, black, transparent);", "nota": "En una máscara, el negro (u opaco) significa visible; el transparente significa invisible. Un gradiente entre ambos produce un desvanecido progresivo, algo que clip-path, al ser binario, no puede lograr por sí solo." }
  ]
}
```

## Verlo en vivo: mask-image con degradado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 160px; height: 80px; background: #7c3aed;\"></div>\n</div>",
  "despues": "<div style=\"display: flex; justify-content: center; padding: 20px; font-family: sans-serif;\">\n  <div style=\"width: 160px; height: 80px; background: #7c3aed; mask-image: linear-gradient(to right, black, transparent);\"></div>\n</div>",
  "nota": "El mismo rectángulo morado, sólido de un extremo a otro. Después: mask-image con un gradiente de negro a transparente hace que el rectángulo se desvanezca progresivamente hacia la derecha — a diferencia de clip-path, no hay un borde limpio, sino una transición gradual."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "alpha frente a luminance en mask-mode",
  "contenido": "Por defecto, una máscara puede combinar transparencia (alfa) y brillo (luminancia): las zonas más brillantes de la máscara dejan ver más, las más oscuras ocultan más. mask-mode: alpha ignora el color y usa solo la transparencia real de la máscara; mask-mode: luminance usa el brillo, incluso si la máscara es totalmente opaca."
}
```

## shape-outside: el texto sigue la forma, no el rectángulo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .flotante {\n    float: left;\n    width: 150px;\n    height: 150px;\n    shape-outside: circle(50%);\n    clip-path: circle(50%);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "shape-outside: circle(50%);", "nota": "Hace que el texto de alrededor fluya siguiendo el contorno del círculo, acercándose más al elemento en las zonas donde el círculo es más estrecho que el cuadrado completo de 150x150." },
    { "fragmento": "clip-path: circle(50%);", "nota": "shape-outside por sí solo NO oculta nada visualmente — sigue haciendo falta clip-path (o algo equivalente) para que la forma también se vea recortada, no solo que el texto la rodee." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El elemento sigue reservando su caja original",
  "contenido": "Aunque shape-outside haga que el texto abrace la forma visual, el elemento flotante sigue ocupando su caja delimitadora ORIGINAL (aquí, 150x150) para efectos de cómo se posiciona respecto a otros elementos flotantes en el flujo — shape-outside cambia solo cómo fluye el TEXTO alrededor, no el espacio que el propio elemento reserva."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .flotante {\n    float: left;\n    width: 150px;\n    height: 150px;\n    shape-outside: circle(50%);\n  }\n</style>\n<div class=\"flotante\"></div>\n<p>Un párrafo largo de texto que rodea al elemento flotante...</p>",
  "opciones": [
    "El texto sigue el contorno de circle(50%), acercándose más al elemento en las zonas donde el círculo es más estrecho que el cuadrado completo",
    "El texto ignora shape-outside por completo y siempre respeta el rectángulo completo del elemento flotante",
    "shape-outside solo funciona si el elemento no tiene ningún width ni height definido"
  ],
  "correcta": 0,
  "explicacion": "shape-outside hace exactamente eso: el texto que envuelve a un elemento flotante sigue el contorno de la forma definida, en vez del rectángulo completo de la caja — es la razón de ser de esta propiedad."
}
```

## Lo que clip-path y mask-image NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "clip-path solo acepta formas geométricas simples como circle o polygon",
      "realidad": "También acepta path() con sintaxis SVG, shape() con comandos nativos de CSS, y referencias a un clipPath de SVG externo — mucho más flexible de lo que parece a primera vista."
    },
    {
      "mito": "mask-image funciona igual que clip-path, solo con otro nombre",
      "realidad": "clip-path es binario (visible o no visible); mask-image admite transparencia PARCIAL a través de gradientes o imágenes, permitiendo desvanecidos progresivos."
    },
    {
      "mito": "shape-outside hace que el elemento flotante ocupe menos espacio real en el layout",
      "realidad": "El elemento sigue ocupando su caja delimitadora original en el flujo — shape-outside solo cambia cómo fluye el TEXTO alrededor de él."
    },
    {
      "mito": "Animar entre dos clip-path distintos funciona sin ninguna restricción",
      "realidad": "Hace falta usar la MISMA función en ambos keyframes, y en polygon(), el mismo número de puntos en los dos extremos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir clip-path (binario) con mask-image (transparencia gradual).", "texto": "Uno corta de golpe; el otro permite un desvanecido progresivo." },
    { "titulo": "Esperar que shape-outside reduzca el espacio reservado por el elemento flotante.", "texto": "El elemento sigue ocupando su caja delimitadora original — solo cambia cómo fluye el texto." },
    { "titulo": "Intentar animar entre dos funciones de clip-path distintas.", "texto": "Como circle() a polygon() — hace falta la misma función (y el mismo número de puntos en polygon) en ambos extremos." },
    { "titulo": "Usar path() cuando el elemento necesita ser responsive.", "texto": "path() usa únicamente píxeles fijos — shape() es la alternativa pensada para eso." }
  ]
}
```

## Ejercicios

1. Escribe una regla `clip-path: circle(50%)` sobre una imagen cuadrada.
2. Escribe una regla `clip-path: polygon()` que dibuje un triángulo simple de tres puntos.
3. Escribe un `mask-image` con un `linear-gradient` que desvanezca un elemento de izquierda a derecha.
4. Escribe una regla `shape-outside: circle(50%)` sobre un elemento flotante, y explica qué cambia respecto a no usarla.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Paths, shapes, clipping, and masking",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre clip-path (circle, ellipse, inset, polygon, path, shape), mask-image y shape-outside.",
      "url": "https://web.dev/learn/css/paths-shapes-clipping-masking",
      "etiqueta": "web.dev"
    }
  ]
}
```
