# Proyecto: ficha de producto con tabla de especificaciones

- **Módulo:** Tablas
- **Slug:** `proyecto-ficha-de-producto-con-tabla-de-especificaciones` (autogenerado del título)
- **Orden:** 90
- **Requiere:** Lección 8 (listas, para el dl/dt/dd del precio), lección 12 (imágenes) y módulo 5 (tablas)

---

## Qué vas a construir

La ficha de un producto como la de cualquier tienda online: foto, nombre, precio, una breve descripción, y una tabla de especificaciones técnicas de verdad — no una lista de "Peso: 200g" en párrafos sueltos. El reto de este proyecto está sobre todo en la tabla: que tenga `caption`, que sus cabeceras usen `th` con `scope`, y que un lector de pantalla pueda anunciar a qué fila y columna pertenece cada dato.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que esta ficha pone a prueba de verdad",
  "roles": [
    {
      "etiqueta": "figure/figcaption",
      "rol": "La foto con su propio pie",
      "descripcion": "Útil sobre todo si más adelante la página tiene varias fotos de producto — deja claro cuál va con cuál."
    },
    {
      "etiqueta": "Tabla accesible",
      "rol": "caption + th + scope",
      "descripcion": "Cada dato de la tabla necesita poder leerse junto a su cabecera de fila y de columna, no como números sueltos."
    },
    {
      "etiqueta": "dl para el precio",
      "rol": "Pares clave-valor",
      "descripcion": "\"Precio\" y su valor son exactamente el caso de uso de una lista de descripción."
    }
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nfigure {\n  margin: 1rem auto;\n  max-width: 240px;\n  text-align: center;\n}\nfigure img {\n  width: 100%;\n  border-radius: 12px;\n}\nfigcaption {\n  font-size: 0.8rem;\n  color: #6f6a61;\n  margin-top: 0.4rem;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<figure>\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect width='240' height='240' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Auriculares inalámbricos en color gris\">\n  <figcaption>Color gris grafito, el que se muestra en la foto.</figcaption>\n</figure>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nfigure {\n  margin: 1rem auto;\n  max-width: 240px;\n  text-align: center;\n}\nfigure img {\n  width: 100%;\n  border-radius: 12px;\n}\nfigcaption {\n  font-size: 0.8rem;\n  color: #6f6a61;\n  margin-top: 0.4rem;\n}",
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n  max-width: 480px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}\nh1 {\n  font-size: 1.4rem;\n  margin-bottom: 0.25rem;\n}\ndl {\n  display: flex;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n}\ndt {\n  font-weight: 600;\n}\ndt::after {\n  content: ':';\n}\ndd {\n  margin: 0;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<h1>Auriculares inalámbricos AeroSound</h1>\n<dl>\n  <dt>Precio</dt>\n  <dd>59,99 €</dd>\n</dl>\n<p>Cancelación de ruido activa y hasta 30 horas de batería con el estuche de carga.</p>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n  max-width: 480px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}\nh1 {\n  font-size: 1.4rem;\n  margin-bottom: 0.25rem;\n}\ndl {\n  display: flex;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n}\ndt {\n  font-weight: 600;\n}\ndt::after {\n  content: ':';\n}\ndd {\n  margin: 0;\n}",
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
  "css": "table {\n  border-collapse: collapse;\n  margin: 1rem 0;\n  width: 100%;\n  max-width: 480px;\n}\ncaption {\n  text-align: left;\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\nth, td {\n  border: 1px solid #d8d3c8;\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n  font-size: 0.9rem;\n}\nth {\n  background: #f4f1ea;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<table>\n  <caption>Especificaciones técnicas</caption>\n  <tr>\n    <th scope=\"col\">Característica</th>\n    <th scope=\"col\">Detalle</th>\n  </tr>\n  <tr>\n    <td>Peso</td>\n    <td>5,4 g por auricular</td>\n  </tr>\n  <tr>\n    <td>Autonomía</td>\n    <td>8 h (30 h con estuche)</td>\n  </tr>\n  <tr>\n    <td>Conexión</td>\n    <td>Bluetooth 5.3</td>\n  </tr>\n</table>",
  "css": "table {\n  border-collapse: collapse;\n  margin: 1rem 0;\n  width: 100%;\n  max-width: 480px;\n}\ncaption {\n  text-align: left;\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\nth, td {\n  border: 1px solid #d8d3c8;\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n  font-size: 0.9rem;\n}\nth {\n  background: #f4f1ea;\n}",
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n  max-width: 480px;\n  margin: 0 auto;\n  padding: 1rem;\n}\nfigure {\n  margin: 0 auto 1rem;\n  max-width: 240px;\n  text-align: center;\n}\nfigure img {\n  width: 100%;\n  border-radius: 12px;\n}\nfigcaption {\n  font-size: 0.8rem;\n  color: #6f6a61;\n  margin-top: 0.4rem;\n}\nh1 {\n  font-size: 1.4rem;\n  margin-bottom: 0.25rem;\n}\ndl {\n  display: flex;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n}\ndt {\n  font-weight: 600;\n}\ndt::after {\n  content: ':';\n}\ndd {\n  margin: 0;\n}\ntable {\n  border-collapse: collapse;\n  margin: 1rem 0;\n  width: 100%;\n}\ncaption {\n  text-align: left;\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\nth, td {\n  border: 1px solid #d8d3c8;\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n  font-size: 0.9rem;\n}\nth {\n  background: #f4f1ea;\n}",
  "pestañaInicial": "html"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes la ficha entera, ya resuelta:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "La ficha terminada, con las tres partes juntas: foto con figcaption, nombre/precio/descripción, y tabla de especificaciones accesible.",
  "html": "<figure>\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect width='240' height='240' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Auriculares inalámbricos en color gris\">\n  <figcaption>Color gris grafito, el que se muestra en la foto.</figcaption>\n</figure>\n<h1>Auriculares inalámbricos AeroSound</h1>\n<dl>\n  <dt>Precio</dt>\n  <dd>59,99 €</dd>\n</dl>\n<p>Cancelación de ruido activa y hasta 30 horas de batería con el estuche de carga.</p>\n<table>\n  <caption>Especificaciones técnicas</caption>\n  <tr>\n    <th scope=\"col\">Característica</th>\n    <th scope=\"col\">Detalle</th>\n  </tr>\n  <tr>\n    <td>Peso</td>\n    <td>5,4 g por auricular</td>\n  </tr>\n  <tr>\n    <td>Autonomía</td>\n    <td>8 h (30 h con estuche)</td>\n  </tr>\n  <tr>\n    <td>Conexión</td>\n    <td>Bluetooth 5.3</td>\n  </tr>\n</table>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n  max-width: 480px;\n  margin: 0 auto;\n  padding: 1rem;\n}\nfigure {\n  margin: 0 auto 1rem;\n  max-width: 240px;\n  text-align: center;\n}\nfigure img {\n  width: 100%;\n  border-radius: 12px;\n}\nfigcaption {\n  font-size: 0.8rem;\n  color: #6f6a61;\n  margin-top: 0.4rem;\n}\nh1 {\n  font-size: 1.4rem;\n  margin-bottom: 0.25rem;\n}\ndl {\n  display: flex;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n}\ndt {\n  font-weight: 600;\n}\ndt::after {\n  content: ':';\n}\ndd {\n  margin: 0;\n}\ntable {\n  border-collapse: collapse;\n  margin: 1rem 0;\n  width: 100%;\n}\ncaption {\n  text-align: left;\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\nth, td {\n  border: 1px solid #d8d3c8;\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n  font-size: 0.9rem;\n}\nth {\n  background: #f4f1ea;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Las filas de datos usan td, la de cabecera usa th.",
      "texto": "Solo \"Característica\" y \"Detalle\" son th con scope=\"col\" — el resto de celdas son td normales, aunque describan cosas como \"Peso\"."
    },
    {
      "titulo": "El dl es de un único par.",
      "texto": "Un dl no necesita varios términos para tener sentido — aquí solo hay \"Precio\", y sigue siendo la etiqueta correcta porque es una relación clave-valor, no una lista de puntos."
    },
    {
      "titulo": "El figcaption no repite el alt.",
      "texto": "El alt describe el producto (\"auriculares... en color gris\"); el figcaption añade un dato que el alt no dice (que ese gris es justo el que se ve en la foto)."
    }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿La tabla tiene caption?",
      "texto": "Sin él, alguien con lector de pantalla que entra directo en la tabla no sabe de qué trata sin haber leído el texto de alrededor."
    },
    {
      "titulo": "¿Las cabeceras son th con scope, no td?",
      "texto": "Un td en la fila de cabecera pierde tanto el estilo en negrita como la asociación semántica con las celdas de su columna."
    },
    {
      "titulo": "¿El figcaption aporta algo que el alt no dice?",
      "texto": "Repetir el mismo texto en los dos es redundante para quien usa lector de pantalla."
    },
    {
      "titulo": "¿El precio usa dl, no un párrafo suelto?",
      "texto": "\"Precio: 49,99€\" en un p normal no comunica la relación clave-valor tan claramente como dt/dd."
    }
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
