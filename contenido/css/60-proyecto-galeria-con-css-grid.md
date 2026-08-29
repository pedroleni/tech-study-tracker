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
  "css": "body { font-family: system-ui, sans-serif; }\n.galeria {\n  /* display: grid; grid-template-columns; gap */\n}\n.foto { aspect-ratio: 1; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 8px; }",
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
  "css": "body { font-family: system-ui, sans-serif; }\n.galeria { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); grid-auto-rows: 100px; gap: 8px; }\n.foto { background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 8px; }\n.foto:first-child { /* grid-column: span 2; grid-row: span 2; */ }",
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
  "css": "body { font-family: system-ui, sans-serif; }\n.galeria { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }\n.foto {\n  position: relative;\n  aspect-ratio: 1;\n  background: linear-gradient(135deg, #7c3aed, #ec4899);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.overlay {\n  position: absolute; inset: 0;\n  display: flex; align-items: center; justify-content: center;\n  background: rgb(0 0 0 / 0.5); color: white; font-size: 1.5rem;\n  /* opacity: 0; transition: opacity 200ms; */\n}\n/* .foto:hover .overlay { opacity: 1; } */",
  "pestañaInicial": "css"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿auto-fit, no auto-fill?", "texto": "Con pocas fotos, auto-fit estira las columnas existentes para llenar el espacio; auto-fill dejaría columnas vacías del mismo ancho — pruébalo cambiando la palabra para ver la diferencia." },
    { "titulo": "¿La foto destacada no rompe el resto de la cuadrícula?", "texto": "span 2/2 solo afecta a esa celda — el resto del grid se sigue autoajustando alrededor." },
    { "titulo": "¿El overlay tiene transición, no un cambio brusco?", "texto": "Sin transition, opacity salta de 0 a 1 sin ningún efecto — con ella, se aprecia el desvanecido." }
  ]
}
```

## Retos para ampliarlo

1. Añade `grid-auto-flow: dense` y observa qué pasa con los huecos que deja la foto destacada.
2. Convierte la galería en un `container` de consultas y cambia el `gap` cuando el contenedor sea muy estrecho.
3. Añade `prefers-reduced-motion` para desactivar la transición del overlay en quien lo prefiera.

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
