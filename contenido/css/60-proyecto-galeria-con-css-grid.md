# Proyecto: galería de imágenes responsive con CSS Grid

- **Módulo:** Proyectos
- **Slug:** `proyecto-galeria-de-imagenes-responsive-con-css-grid` (autogenerado del título)
- **Orden:** 305
- **Requiere:** Lecciones 35-36 (CSS Grid)

---

## Qué vas a construir

Una galería de fotos que reparte el número de columnas ella sola según el ancho disponible — sin escribir ni un media query. El truco entero está en `repeat(auto-fit, minmax(...))`, y en un pequeño efecto de superposición al pasar el ratón.

## Paso 1: la cuadrícula que se autoajusta

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: grid responsive",
  "consigna": "Escribe display: grid en .galeria, con grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) y un gap. Reduce el ancho de la vista previa para ver cómo cambia el número de columnas solo.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  /* display: grid; grid-template-columns; gap */\n}\n.foto {\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 8px;\n}\n.foto {\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

## Paso 2: una foto destacada más grande

Haz que la primera foto ocupe 2 columnas y 2 filas, usando `grid-column`/`grid-row` — un patrón habitual de "foto hero" dentro de una galería.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: destacar una foto",
  "consigna": "Escribe grid-column: span 2 y grid-row: span 2 en .foto:first-child.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  grid-auto-rows: 100px;\n  gap: 8px;\n}\n.foto {\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}\n.foto:first-child {\n  /* grid-column: span 2; grid-row: span 2; */\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n  <div class=\"foto\"></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  grid-auto-rows: 100px;\n  gap: 8px;\n}\n.foto {\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}\n.foto:first-child {\n  grid-column: span 2;\n  grid-row: span 2;\n}",
  "pestañaInicial": "css"
}
```

## Paso 3: superposición al pasar el ratón

Añade un overlay con el número de la foto, oculto por defecto y visible en `:hover`, con una transición suave.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: overlay en hover",
  "consigna": "Dentro de .foto, añade un span.overlay con opacity: 0 y transition, y pásalo a opacity: 1 en .foto:hover .overlay.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"><span class=\"overlay\">1</span></div>\n  <div class=\"foto\"><span class=\"overlay\">2</span></div>\n  <div class=\"foto\"><span class=\"overlay\">3</span></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  gap: 8px;\n}\n.foto {\n  position: relative;\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgb(0 0 0 / 0.5);\n  color: white;\n  font-size: 1.5rem;\n  /* opacity: 0; transition: opacity 200ms; */\n}\n/* .foto:hover .overlay { opacity: 1; } */",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"><span class=\"overlay\">1</span></div>\n  <div class=\"foto\"><span class=\"overlay\">2</span></div>\n  <div class=\"foto\"><span class=\"overlay\">3</span></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  gap: 8px;\n}\n.foto {\n  position: relative;\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgb(0 0 0 / 0.5);\n  color: white;\n  font-size: 1.5rem;\n  opacity: 0;\n  transition: opacity 200ms;\n}\n.foto:hover .overlay {\n  opacity: 1;\n}",
  "pestañaInicial": "css"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes la galería entera, ya resuelta — grid autoajustable, foto destacada y overlay en hover, todo junto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "La galería terminada: grid con auto-fit/minmax, la primera foto ocupando 2x2, y overlay con transición al pasar el ratón. Reduce el ancho de la vista previa para ver cómo cambian las columnas.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"><span class=\"overlay\">1</span></div>\n  <div class=\"foto\"><span class=\"overlay\">2</span></div>\n  <div class=\"foto\"><span class=\"overlay\">3</span></div>\n  <div class=\"foto\"><span class=\"overlay\">4</span></div>\n  <div class=\"foto\"><span class=\"overlay\">5</span></div>\n  <div class=\"foto\"><span class=\"overlay\">6</span></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 8px;\n}\n.foto {\n  position: relative;\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.foto:first-child {\n  grid-column: span 2;\n  grid-row: span 2;\n}\n.overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgb(0 0 0 / 0.5);\n  color: white;\n  font-size: 1.5rem;\n  opacity: 0;\n  transition: opacity 200ms;\n}\n.foto:hover .overlay {\n  opacity: 1;\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "auto-fit calcula las columnas solo, sin media queries.", "texto": "minmax(140px, 1fr) le dice al navegador \"cabe todo lo que puedas de al menos 140px, repartiendo el resto\" — cambia de 1 a 6 columnas sin escribir ni un @media." },
    { "titulo": "span 2/2 solo afecta a esa celda.", "texto": "El resto de fotos se sigue autoajustando alrededor de la destacada sin que tengas que recalcular nada a mano." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿auto-fit, no auto-fill?",
      "texto": "Con pocas fotos, auto-fit estira las columnas existentes para llenar el espacio; auto-fill dejaría columnas vacías del mismo ancho — pruébalo cambiando la palabra para ver la diferencia."
    },
    {
      "titulo": "¿La foto destacada no rompe el resto de la cuadrícula?",
      "texto": "span 2/2 solo afecta a esa celda — el resto del grid se sigue autoajustando alrededor."
    },
    {
      "titulo": "¿El overlay tiene transición, no un cambio brusco?",
      "texto": "Sin transition, opacity salta de 0 a 1 sin ningún efecto — con ella, se aprecia el desvanecido."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade `grid-auto-flow: dense` y observa qué pasa con los huecos que deja la foto destacada.
2. Convierte la galería en un `container` de consultas y cambia el `gap` cuando el contenedor sea muy estrecho.
3. Añade `prefers-reduced-motion` para desactivar la transición del overlay en quien lo prefiera.

Si quieres comparar con una solución real de cada reto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: grid-auto-flow: dense",
  "consigna": "Dos galerías idénticas, una sin dense y otra con — la foto 3 ocupa 2 columnas y no cabe al final de la primera fila, así que sin dense deja un hueco vacío (fila 1, columna 3) que el resto de fotos ya no rellena. Con dense, la foto 4 salta hacia atrás para tapar ese hueco.",
  "html": "<p class=\"etiqueta\">Sin dense (deja un hueco)</p>\n<div class=\"galeria\">\n  <div class=\"foto\">1</div>\n  <div class=\"foto\">2</div>\n  <div class=\"foto foto--ancha\">3</div>\n  <div class=\"foto\">4</div>\n  <div class=\"foto\">5</div>\n  <div class=\"foto\">6</div>\n</div>\n<p class=\"etiqueta\">Con dense (rellena el hueco)</p>\n<div class=\"galeria galeria--dense\">\n  <div class=\"foto\">1</div>\n  <div class=\"foto\">2</div>\n  <div class=\"foto foto--ancha\">3</div>\n  <div class=\"foto\">4</div>\n  <div class=\"foto\">5</div>\n  <div class=\"foto\">6</div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.etiqueta {\n  font-weight: 600;\n  margin: 1rem 0 0.5rem;\n}\n.etiqueta:first-child {\n  margin-top: 0;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.galeria--dense {\n  grid-auto-flow: dense;\n}\n.foto {\n  aspect-ratio: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 1.1rem;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}\n.foto--ancha {\n  grid-column: span 2;\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: container queries",
  "consigna": "container-type: inline-size convierte el contenedor en una unidad de medida propia — @container reacciona a SU ancho, no al de la ventana. Arrastra la esquina inferior derecha de la caja punteada en la vista previa para encogerla y ver cómo cambia el gap.",
  "html": "<div class=\"galeria-envoltorio\">\n  <div class=\"galeria\">\n    <div class=\"foto\"></div>\n    <div class=\"foto\"></div>\n    <div class=\"foto\"></div>\n    <div class=\"foto\"></div>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria-envoltorio {\n  container-type: inline-size;\n  container-name: galeria-caja;\n  resize: horizontal;\n  overflow: auto;\n  max-width: 100%;\n  border: 1px dashed #d8d3c8;\n  padding: 8px;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n  gap: 16px;\n}\n.foto {\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n}\n@container galeria-caja (max-width: 280px) {\n  .galeria {\n    gap: 4px;\n  }\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: prefers-reduced-motion en el overlay",
  "consigna": "Igual que en el proyecto de micro-interacciones: el fundido del overlay es exactamente el tipo de movimiento que puede molestar a quien activó esta preferencia — se apaga la transición, no el propio overlay.",
  "html": "<div class=\"galeria\">\n  <div class=\"foto\"><span class=\"overlay\">1</span></div>\n  <div class=\"foto\"><span class=\"overlay\">2</span></div>\n  <div class=\"foto\"><span class=\"overlay\">3</span></div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  gap: 8px;\n}\n.foto {\n  position: relative;\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgb(0 0 0 / 0.5);\n  color: white;\n  font-size: 1.5rem;\n  opacity: 0;\n  transition: opacity 200ms;\n}\n.foto:hover .overlay {\n  opacity: 1;\n}\n@media (prefers-reduced-motion: reduce) {\n  .overlay {\n    transition: none;\n  }\n}",
  "pestañaInicial": "css"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "CSS Grid — filas, columnas y áreas",
      "descripcion": "Repaso de repeat(), auto-fit/auto-fill y minmax() si te atascas en el paso 1.",
      "url": "https://web.dev/learn/css/grid",
      "etiqueta": "web.dev"
    }
  ]
}
```
