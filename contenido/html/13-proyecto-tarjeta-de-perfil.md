# Proyecto: tarjeta de perfil personal

- **Módulo:** Multimedia
- **Slug:** `proyecto-tarjeta-de-perfil-personal` (autogenerado del título)
- **Orden:** 60
- **Requiere:** Módulos 1 y 2 (fundamentos del documento, texto y contenido), lección 10 (crear enlaces, para el mailto: de contacto) y lección 12 (imágenes)

---

## Qué vas a construir

Una tarjeta de perfil como la que verías en la página "Sobre el equipo" de cualquier web real: una foto, un nombre, un cargo, una biografía breve, una lista de habilidades y un enlace de contacto. Nada de CSS que tengas que inventar tú — el objetivo de este proyecto es HTML, así que la hoja de estilos ya viene puesta en el editor. Lo único que escribes tú es la estructura.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que esta tarjeta pone a prueba de verdad",
  "roles": [
    {
      "etiqueta": "Jerarquía",
      "rol": "Encabezados con sentido",
      "descripcion": "El nombre no es \"texto grande\", es un encabezado real — de qué nivel, lo decides tú según dónde vive esta tarjeta."
    },
    {
      "etiqueta": "Imagen con significado",
      "rol": "alt que aporte, no que repita",
      "descripcion": "La foto de perfil necesita un alt que tenga sentido si el nombre ya está justo al lado en texto."
    },
    {
      "etiqueta": "Listas reales",
      "rol": "Habilidades como lista, no como frase",
      "descripcion": "\"HTML, CSS, JavaScript\" separado por comas en un párrafo no es lo mismo que una lista real para quien navega con lector de pantalla."
    }
  ]
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El CSS de esta tarjeta ya está escrito",
  "contenido": "Ya viste en el proyecto anterior cómo una clase del HTML (class=\"tarjeta\") conecta con su regla en CSS (.tarjeta { ... }). Aquí pasa exactamente lo mismo: en la pestaña CSS del editor de abajo tienes ya todo el estilo, una regla por cada clase (tarjeta, foto, cargo, bio, habilidades...). No hace falta que sepas escribir CSS todavía — solo que pongas en el HTML la clase correcta en el sitio correcto, y el diseño aparece solo."
}
```

## Paso 1: la estructura y la foto

Recuerda cómo funciona una imagen en HTML: `<img>` es una etiqueta que no lleva cierre, y necesita un `src` (de dónde sale la imagen) y un `alt` (el texto que la describe si no se puede ver, por ejemplo con un lector de pantalla). En este proyecto el `src` es una imagen de prueba en formato `data:`: el propio dibujo va codificado ahí dentro, así que se ve igual en cualquier sitio sin depender de ningún archivo externo ni de conexión a internet.

Empieza por el contenedor y la imagen. La clase `.tarjeta` en el `<div>` exterior y `.foto` en la imagen son las que activan el estilo — sin ellas, la tarjeta se ve como texto plano sin más.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: contenedor y foto",
  "consigna": "Escribe un div con class=\"tarjeta\", y dentro una img con class=\"foto\", el src de abajo, y un alt que describa a la persona (no repitas \"foto de perfil\", eso ya lo dice el contexto).",
  "html": "<!-- <div class=\"tarjeta\">\n  <img class=\"foto\" src=\"...\" alt=\"...\">\n</div> -->",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}",
  "pestañaInicial": "html"
}
```

## Paso 2: nombre, cargo y biografía

Añade el nombre como encabezado, el cargo justo debajo con la clase `.cargo`, y una biografía de 1-2 frases en un párrafo con la clase `.bio`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: texto de la tarjeta",
  "consigna": "Dentro del mismo div.tarjeta, después de la imagen: un h2 con el nombre, un p.cargo con el puesto, y un p.bio con una biografía breve.",
  "html": "<div class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n  <!-- Añade aquí el h2, el p.cargo y el p.bio -->\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}\n.bio {\n  margin: 0.75rem 0;\n  font-size: 0.9rem;\n  color: #3a362f;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n  <h2>Marta Ibáñez</h2>\n  <p class=\"cargo\">Desarrolladora frontend</p>\n  <p class=\"bio\">Construye interfaces accesibles desde hace seis años, con debilidad por el HTML semántico bien escrito.</p>\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}\n.bio {\n  margin: 0.75rem 0;\n  font-size: 0.9rem;\n  color: #3a362f;\n}",
  "pestañaInicial": "html"
}
```

## Paso 3: las habilidades y el contacto

Cierra la tarjeta con una lista de habilidades (`ul.habilidades`, cada una en su `li`) y un enlace de contacto real con `mailto:`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: habilidades y contacto",
  "consigna": "Añade un ul.habilidades con 3 o 4 li de habilidades, y un enlace mailto al final con un texto que no sea \"haz clic aquí\".",
  "html": "<!-- Solo el fragmento nuevo, para que lo pegues dentro de tu tarjeta del paso 2 -->\n<!-- <ul class=\"habilidades\"><li>...</li></ul> -->\n<!-- <a href=\"mailto:...\">...</a> -->",
  "css": ".habilidades {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  justify-content: center;\n  list-style: none;\n  padding: 0;\n  margin: 0.75rem 0;\n}\n.habilidades li {\n  background: #f4f1ea;\n  border-radius: 999px;\n  padding: 3px 10px;\n  font-size: 0.75rem;\n  color: #6b5b3a;\n}\na {\n  color: #2f5fd6;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<ul class=\"habilidades\">\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n  <li>Accesibilidad</li>\n</ul>\n<a href=\"mailto:marta@ejemplo.com\">Escríbeme</a>",
  "css": ".habilidades {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  justify-content: center;\n  list-style: none;\n  padding: 0;\n  margin: 0.75rem 0;\n}\n.habilidades li {\n  background: #f4f1ea;\n  border-radius: 999px;\n  padding: 3px 10px;\n  font-size: 0.75rem;\n  color: #6b5b3a;\n}\na {\n  color: #2f5fd6;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

## La tarjeta completa

Une los tres pasos en un único documento y compruébalo de principio a fin.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Junta aquí los tres pasos anteriores en una sola tarjeta completa: foto con alt, nombre, cargo, biografía, lista de habilidades y contacto.",
  "html": "<!-- Tu tarjeta completa, de principio a fin -->",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}\n.bio {\n  margin: 0.75rem 0;\n  font-size: 0.9rem;\n  color: #3a362f;\n}\n.habilidades {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  justify-content: center;\n  list-style: none;\n  padding: 0;\n  margin: 0.75rem 0;\n}\n.habilidades li {\n  background: #f4f1ea;\n  border-radius: 999px;\n  padding: 3px 10px;\n  font-size: 0.75rem;\n  color: #6b5b3a;\n}\na {\n  color: #2f5fd6;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes la tarjeta entera, ya resuelta — con la misma imagen de prueba (un SVG en `data:`, sin depender de ninguna URL externa) que ya viste en el Paso 2:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "La tarjeta terminada, con las tres partes juntas: foto con alt real, nombre como encabezado, cargo, biografía, lista de habilidades y contacto.",
  "html": "<div class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n  <h2>Marta Ibáñez</h2>\n  <p class=\"cargo\">Desarrolladora frontend</p>\n  <p class=\"bio\">Construye interfaces accesibles desde hace seis años, con debilidad por el HTML semántico bien escrito.</p>\n  <ul class=\"habilidades\">\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n    <li>Accesibilidad</li>\n  </ul>\n  <a href=\"mailto:marta@ejemplo.com\">Escríbeme</a>\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}\n.bio {\n  margin: 0.75rem 0;\n  font-size: 0.9rem;\n  color: #3a362f;\n}\n.habilidades {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  justify-content: center;\n  list-style: none;\n  padding: 0;\n  margin: 0.75rem 0;\n}\n.habilidades li {\n  background: #f4f1ea;\n  border-radius: 999px;\n  padding: 3px 10px;\n  font-size: 0.75rem;\n  color: #6b5b3a;\n}\na {\n  color: #2f5fd6;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El alt no repite el nombre.",
      "texto": "\"Retrato de Marta Ibáñez, sonriendo\" aporta algo que el h2 solo no dice — la expresión, el tipo de foto. No es \"foto de perfil de Marta Ibáñez\", que sería redundante con el nombre justo al lado."
    },
    {
      "titulo": "Las habilidades son una lista real, no un párrafo.",
      "texto": "Cuatro li dentro de un ul — un lector de pantalla anuncia \"lista de 4 elementos\", no una frase larga separada por comas."
    },
    {
      "titulo": "El enlace dice algo por sí solo.",
      "texto": "\"Escríbeme\" funciona leído fuera de contexto — a diferencia de \"haz clic aquí\", que no dice nada sin ver el resto de la página."
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
      "titulo": "¿El nombre es un encabezado de verdad?",
      "texto": "No un párrafo con font-size grande — un h2 o h3 real, según el contexto en el que viviría esta tarjeta."
    },
    {
      "titulo": "¿El alt describe a la persona, no repite el nombre?",
      "texto": "El nombre ya está en texto justo al lado — el alt debería aportar algo que el nombre solo no dice (una expresión, un contexto), no duplicarlo."
    },
    {
      "titulo": "¿Las habilidades son una lista real?",
      "texto": "ul/li, no un párrafo con comas — así un lector de pantalla puede anunciar cuántas hay."
    },
    {
      "titulo": "¿El enlace de contacto dice algo por sí solo?",
      "texto": "\"Escríbeme\" o el propio correo funcionan fuera de contexto; \"haz clic aquí\" no."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade un segundo enlace (por ejemplo, a un perfil de LinkedIn o GitHub ficticio) junto al de contacto.
2. Envuelve la foto en `figure`/`figcaption` con una cita breve de la persona como pie de foto.
3. Convierte la tarjeta entera en un `article` — piensa si tendría sentido fuera de esta página, como un post en un feed de "conoce al equipo".

Si quieres comparar con una solución real de cada reto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: un segundo enlace",
  "consigna": "target=\"_blank\" abre el enlace en pestaña nueva — y siempre que lo uses, rel=\"noopener\" evita que esa pestaña nueva pueda manipular la página original desde JavaScript.",
  "html": "<div class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n  <h2>Marta Ibáñez</h2>\n  <p class=\"cargo\">Desarrolladora frontend</p>\n  <div class=\"enlaces\">\n    <a href=\"mailto:marta@ejemplo.com\">Escríbeme</a>\n    <a href=\"https://github.com/martaibanez\" target=\"_blank\" rel=\"noopener\">GitHub</a>\n  </div>\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}\n.enlaces {\n  display: flex;\n  gap: 1rem;\n  justify-content: center;\n  margin-top: 0.75rem;\n}\n.enlaces a {\n  color: #2f5fd6;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: figure/figcaption con una cita",
  "consigna": "Misma relación que ya viste en la lección de imágenes: alt describe la foto para quien no puede verla, figcaption es un pie de foto visible para todo el mundo — aquí, una cita breve, no una repetición del alt.",
  "html": "<div class=\"tarjeta\">\n  <figure class=\"foto-envoltorio\">\n    <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n    <figcaption>«El buen HTML no se nota — hasta que falta.»</figcaption>\n  </figure>\n  <h2>Marta Ibáñez</h2>\n  <p class=\"cargo\">Desarrolladora frontend</p>\n</div>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto-envoltorio {\n  margin: 0;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\nfigcaption {\n  margin-top: 0.4rem;\n  font-size: 0.8rem;\n  font-style: italic;\n  color: #6f6a61;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: la tarjeta como article",
  "consigna": "Sí tendría sentido: esta tarjeta se sostiene sola fuera de esta página — podría aparecer igual en un feed de \"conoce al equipo\" o citada en otra web, que es justo el criterio de article que ya viste en el proyecto de la landing page.",
  "html": "<article class=\"tarjeta\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3C/svg%3E\" alt=\"Retrato de Marta Ibáñez, sonriendo\">\n  <h2>Marta Ibáñez</h2>\n  <p class=\"cargo\">Desarrolladora frontend</p>\n</article>",
  "css": ".tarjeta {\n  font-family: system-ui, sans-serif;\n  max-width: 320px;\n  margin: 1rem auto;\n  padding: 1.5rem;\n  border: 1px solid #e2ded6;\n  border-radius: 16px;\n  text-align: center;\n  background: #fff;\n}\n.foto {\n  width: 96px;\n  height: 96px;\n  border-radius: 999px;\n  object-fit: cover;\n}\n.tarjeta h2 {\n  margin: 0.75rem 0 0.15rem;\n  font-size: 1.15rem;\n}\n.cargo {\n  margin: 0;\n  color: #6f6a61;\n  font-size: 0.9rem;\n}",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "HTML images",
      "descripcion": "Repaso de alt, figure y figcaption si te atascas en el paso 1.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Lists",
      "descripcion": "Repaso de listas si te atascas en el paso 3.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists",
      "etiqueta": "MDN"
    }
  ]
}
```
