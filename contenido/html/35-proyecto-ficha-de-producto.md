# Proyecto: ficha de producto con tabla de especificaciones

- **Módulo:** Proyectos
- **Slug:** `proyecto-ficha-de-producto-con-tabla-de-especificaciones` (autogenerado del título)
- **Orden:** 215
- **Requiere:** Lección 11 (imágenes), módulo 5 (tablas) y lección 16 (accesibilidad en tablas)

---

## Qué vas a construir

La ficha de un producto como la de cualquier tienda online: foto, nombre, precio, una breve descripción, y una tabla de especificaciones técnicas de verdad — no una lista de "Peso: 200g" en párrafos sueltos. El reto de este proyecto está sobre todo en la tabla: que tenga `caption`, que sus cabeceras usen `th` con `scope`, y que un lector de pantalla pueda anunciar a qué fila y columna pertenece cada dato.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que esta ficha pone a prueba de verdad",
  "roles": [
    { "etiqueta": "figure/figcaption", "rol": "La foto con su propio pie", "descripcion": "Útil sobre todo si más adelante la página tiene varias fotos de producto — deja claro cuál va con cuál." },
    { "etiqueta": "Tabla accesible", "rol": "caption + th + scope", "descripcion": "Cada dato de la tabla necesita poder leerse junto a su cabecera de fila y de columna, no como números sueltos." },
    { "etiqueta": "dl para el precio", "rol": "Pares clave-valor", "descripcion": "\"Precio\" y su valor son exactamente el caso de uso de una lista de descripción." }
  ]
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La imagen es un placeholder",
  "contenido": "El src de la imagen de este proyecto es un SVG generado, no una foto real — lo que importa aquí es la estructura (alt, figure/figcaption), no de dónde sale la imagen."
}
```

## Paso 1: la imagen del producto

Envuelve la foto en `figure`/`figcaption`, con un `alt` que describa el producto y un `figcaption` que NO repita literalmente el mismo texto.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: figure y figcaption",
  "consigna": "Escribe un figure con una img (el src de abajo, con un alt real) y un figcaption con un dato adicional (por ejemplo, el color mostrado en la foto).",
  "html": "<!-- <figure>\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect width='240' height='240' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"...\">\n  <figcaption>...</figcaption>\n</figure> -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; }\nfigure { margin: 1rem auto; max-width: 240px; text-align: center; }\nfigure img { width: 100%; border-radius: 12px; }\nfigcaption { font-size: 0.8rem; color: #6f6a61; margin-top: 0.4rem; }",
  "pestañaInicial": "html"
}
```

## Paso 2: nombre, precio y descripción

El nombre como encabezado, el precio como una lista de descripción de un único par (`dl`/`dt`/`dd`), y una descripción breve.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: nombre, precio y descripción",
  "consigna": "Escribe un h1 con el nombre del producto, un dl con dt=\"Precio\" y dd con el importe, y un párrafo de descripción.",
  "html": "<!-- <h1>...</h1>\n<dl>...</dl>\n<p>...</p> -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; max-width: 480px; margin: 0 auto; padding: 0 1rem; }\nh1 { font-size: 1.4rem; margin-bottom: 0.25rem; }\ndl { display: flex; gap: 0.4rem; margin: 0.5rem 0; }\ndt { font-weight: 600; }\ndt::after { content: ':'; }\ndd { margin: 0; }",
  "pestañaInicial": "html"
}
```

## Paso 3: la tabla de especificaciones

Aquí está el corazón del proyecto: una tabla real, con `caption`, cabeceras `th` con `scope="col"`, y al menos 3 filas de datos.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: tabla de especificaciones",
  "consigna": "Escribe una table con caption=\"Especificaciones técnicas\", una fila de cabecera (th con scope=\"col\" para \"Característica\" y \"Detalle\"), y 3 filas de datos (peso, dimensiones, material, lo que prefieras).",
  "html": "<!-- <table>\n  <caption>...</caption>\n  <tr>...</tr>\n  ...\n</table> -->",
  "css": "table { border-collapse: collapse; margin: 1rem 0; width: 100%; max-width: 480px; }\ncaption { text-align: left; font-weight: 600; margin-bottom: 0.5rem; }\nth, td { border: 1px solid #d8d3c8; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }\nth { background: #f4f1ea; }",
  "pestañaInicial": "html"
}
```

## Ficha completa

Une los tres pasos en una única ficha de producto.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Junta la imagen, el nombre/precio/descripción y la tabla de especificaciones en una sola ficha de producto completa.",
  "html": "<!-- Tu ficha completa, de principio a fin -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; max-width: 480px; margin: 0 auto; padding: 1rem; }\nfigure { margin: 0 auto 1rem; max-width: 240px; text-align: center; }\nfigure img { width: 100%; border-radius: 12px; }\nfigcaption { font-size: 0.8rem; color: #6f6a61; margin-top: 0.4rem; }\nh1 { font-size: 1.4rem; margin-bottom: 0.25rem; }\ndl { display: flex; gap: 0.4rem; margin: 0.5rem 0; }\ndt { font-weight: 600; }\ndt::after { content: ':'; }\ndd { margin: 0; }\ntable { border-collapse: collapse; margin: 1rem 0; width: 100%; }\ncaption { text-align: left; font-weight: 600; margin-bottom: 0.5rem; }\nth, td { border: 1px solid #d8d3c8; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }\nth { background: #f4f1ea; }",
  "pestañaInicial": "html"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿La tabla tiene caption?", "texto": "Sin él, alguien con lector de pantalla que entra directo en la tabla no sabe de qué trata sin haber leído el texto de alrededor." },
    { "titulo": "¿Las cabeceras son th con scope, no td?", "texto": "Un td en la fila de cabecera pierde tanto el estilo en negrita como la asociación semántica con las celdas de su columna." },
    { "titulo": "¿El figcaption aporta algo que el alt no dice?", "texto": "Repetir el mismo texto en los dos es redundante para quien usa lector de pantalla." },
    { "titulo": "¿El precio usa dl, no un párrafo suelto?", "texto": "\"Precio: 49,99€\" en un p normal no comunica la relación clave-valor tan claramente como dt/dd." }
  ]
}
```

## Retos para ampliarlo

1. Añade una segunda fila de cabecera con `colspan` que agrupe dos columnas relacionadas de la tabla (por ejemplo, "Dimensiones" agrupando ancho y alto en columnas separadas).
2. Añade un segundo `dl` para "Disponibilidad" con varios pares término/valor (talla, color, stock).
3. Envuelve toda la ficha en un `article` — justifica en una frase por qué tendría sentido (o no) fuera de esta página.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "HTML table accessibility",
      "descripcion": "Repaso de caption, scope y thead/tbody si te atascas en el paso 3.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Lists",
      "descripcion": "Repaso de listas de descripción (dl/dt/dd) si te atascas en el paso 2.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists",
      "etiqueta": "MDN"
    }
  ]
}
```
