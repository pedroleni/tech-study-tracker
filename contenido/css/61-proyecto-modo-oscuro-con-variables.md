# Proyecto: interruptor de modo oscuro con variables CSS

- **Módulo:** Proyectos
- **Slug:** `proyecto-interruptor-de-modo-oscuro-con-variables-css` (autogenerado del título)
- **Orden:** 310
- **Requiere:** Lección 22 (variables CSS) y lección 18 (color en CSS)

---

## Qué vas a construir

Un modo oscuro real, del mismo tipo que el que ya usa esta propia web: un conjunto de variables de color declaradas una vez en `:root`, redefinidas dentro de una clase `.oscuro`, y un botón que añade o quita esa clase. Este proyecto combina CSS con una pizca de JavaScript — lo justo para alternar una clase, no para calcular ningún color.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto se hace aquí mismo, en el navegador — no hace falta instalar nada",
  "contenido": "A diferencia de los \"proyecto avanzado\" de otros temarios, este NO necesita VS Code, terminal, ni clonar ningún repositorio. Cada bloque \"EDITOR EN VIVO\" de abajo es un editor real: pestañas HTML/CSS/JavaScript arriba, tu código en medio, y \"Vista previa\" debajo, que se actualiza sola mientras escribes — no hay ningún botón de \"ejecutar\". Escribe en la pestaña que toque, sustituyendo los comentarios que ya están puestos como guía. Si algo se rompe, \"Reiniciar\" (arriba a la derecha del bloque) te devuelve al punto de partida."
}
```

### Si prefieres hacerlo en tu propio ordenador, con VS Code

Puedes hacer este mismo proyecto fuera del navegador, en un editor real — la misma dinámica que vas a usar en el resto de tu carrera, y la que usan los "proyecto avanzado" más adelante en otros temarios.

1. **Crea una carpeta** en tu ordenador (Escritorio, Documentos... donde quieras) con el nombre que quieras para este proyecto.
2. **Ábrela en VS Code**: menú `Archivo` → `Abrir carpeta...`.
3. **Crea tres archivos** dentro, con el icono de "Nuevo archivo" del explorador (o clic derecho → `New File`): `index.html`, `style.css` y `script.js` — los nombres importan, son los que enlazas en el siguiente paso.
4. **Copia el código de partida** de cada pestaña de los editores en vivo de abajo (HTML, CSS, JavaScript) en el archivo que corresponda — es el mismo código, solo que ahora en archivos de verdad, no en un widget.
5. **Enlaza los tres archivos** — esto el editor en vivo lo hace por ti, pero en un proyecto real hay que escribirlo a mano: dentro de `<head>` en `index.html`, añade `<link rel="stylesheet" href="style.css">`; justo antes de `</body>`, añade `<script src="script.js"></script>`.
6. **Abre la terminal integrada**: menú `Terminal` → `New Terminal` (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
7. **Sirve la carpeta**: escribe `npx serve .` y pulsa Intro — abre en el navegador la URL que imprima. (Alternativa sin terminal: instala la extensión "Live Server" y pulsa "Go Live" — además recarga sola con cada guardado.)
8. **El ciclo de trabajo**: edita el archivo que toque, guarda con `Cmd`/`Ctrl` + `S`, y refresca el navegador para ver el cambio.

## Paso 1: los tokens de color en `:root`

Declara las variables de un tema claro: fondo, texto y un color de acento.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: variables del tema claro",
  "consigna": "Declara --fondo, --texto y --acento en :root, y úsalas en body y en .tarjeta en vez de colores sueltos.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Este texto debería cambiar de color con el tema.</p>\n    <button class=\"boton\">Acción</button>\n  </div>\n</body>",
  "css": ":root {\n  /* --fondo: #ffffff; --texto: #1a1a1a; --acento: #7c3aed; */\n}\nbody {\n  font-family: system-ui, sans-serif;\n  /* background: var(--fondo); color: var(--texto); */\n  margin: 0;\n  padding: 1.5rem;\n}\n.tarjeta {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  /* background: var(--acento); */\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Este texto debería cambiar de color con el tema.</p>\n    <button class=\"boton\">Acción</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n}\n.tarjeta {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

## Paso 2: el tema oscuro

Redefine las mismas variables dentro de una clase `.oscuro` en `body` — no crees variables nuevas con otro nombre, redefine las mismas.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: redefinir en .oscuro",
  "consigna": "Escribe body.oscuro { } redefiniendo --fondo, --texto y --acento con valores oscuros. Añade manualmente class=\"oscuro\" al body en la pestaña HTML para comprobarlo (lo quitaremos en el paso 3, cuando lo haga un botón).",
  "html": "<body class=\"oscuro\">\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Prueba a quitar la clase \"oscuro\" del body para volver al tema claro.</p>\n    <button class=\"boton\">Acción</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\n/* body.oscuro { --fondo: ...; --texto: ...; --acento: ...; } */\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<body class=\"oscuro\">\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Prueba a quitar la clase \"oscuro\" del body para volver al tema claro.</p>\n    <button class=\"boton\">Acción</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\nbody.oscuro {\n  --fondo: #18181b;\n  --texto: #f4f4f5;\n  --acento: #a78bfa;\n}\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

## Paso 3: el botón que lo activa

Con las variables ya resueltas en CSS, JavaScript solo necesita alternar una clase — nada de calcular colores desde código.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo: botón + variables",
  "consigna": "El JS ya alterna la clase \"oscuro\" en el body al pulsar el botón. Completa tú las variables de :root y de body.oscuro en la pestaña CSS para que el cambio se vea de verdad.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Pulsa el botón para alternar el tema.</p>\n    <button class=\"boton\" id=\"interruptor\">Cambiar tema</button>\n  </div>\n</body>",
  "css": ":root {\n  /* --fondo: #ffffff; --texto: #1a1a1a; --acento: #7c3aed; */\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\n/* body.oscuro { --fondo: #18181b; --texto: #f4f4f5; --acento: #a78bfa; } */\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n}",
  "js": "document.getElementById('interruptor').addEventListener('click', () => {\n  document.body.classList.toggle('oscuro');\n});",
  "pestañaInicial": "css"
}
```

Si te atascas, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes el interruptor entero, ya resuelto — este paso ya era el proyecto completo, así que esta es también la solución final:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "El interruptor terminado: variables en :root, redefinidas en body.oscuro, y un botón que alterna la clase. Pulsa \"Cambiar tema\" en la vista previa para comprobarlo.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Pulsa el botón para alternar el tema.</p>\n    <button class=\"boton\" id=\"interruptor\">Cambiar tema</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\nbody.oscuro {\n  --fondo: #18181b;\n  --texto: #f4f4f5;\n  --acento: #a78bfa;\n}\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n}",
  "js": "document.getElementById('interruptor').addEventListener('click', () => {\n  document.body.classList.toggle('oscuro');\n});",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Mismo nombre de variable, valor distinto.", "texto": "body.oscuro redeclara --fondo/--texto/--acento con el MISMO nombre que :root — eso es lo que hace que todo lo que ya usa var(--fondo) cambie solo, sin tocar el resto del CSS." },
    { "titulo": "JavaScript no calcula ningún color.", "texto": "El único trabajo del JS es alternar una clase — el cambio de color en sí vive entero en las variables CSS." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Redefiniste las mismas variables, no creaste otras?",
      "texto": "body.oscuro tiene que redeclarar --fondo/--texto/--acento con el MISMO nombre — es eso lo que hace que todo lo que ya usa var(--fondo) cambie solo, sin tocar el resto del CSS."
    },
    {
      "titulo": "¿El cambio tiene una transición suave?",
      "texto": "Sin transition en background/color, el cambio de tema se ve como un salto brusco en vez de un fundido."
    },
    {
      "titulo": "¿JavaScript solo alterna una clase?",
      "texto": "Todo el cálculo de color vive en CSS — JS no debería tener ningún color escrito dentro."
    }
  ]
}
```

## Retos para ampliarlo

1. Guarda la preferencia en `localStorage` para que se recuerde al recargar la página (verás esta API en el temario de JavaScript).
2. Añade un tercer tema ("alto contraste") como una segunda clase alternativa.
3. Sustituye el toggle manual por `prefers-color-scheme` como valor inicial, y deja el botón solo para forzar lo contrario.

Si quieres comparar con una solución real de cada reto:

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El reto 1 no puede demostrar la persistencia aquí",
  "contenido": "El editor en vivo de esta página vive dentro de un iframe con sandbox por seguridad, y ese sandbox bloquea localStorage con un SecurityError real. El código de abajo es el correcto y funcionaría tal cual en tu propia web — con try/catch para que, si el almacenamiento no está disponible (como aquí, o en modo privado), el interruptor siga funcionando en vez de romperse."
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: recordar el tema con localStorage",
  "consigna": "El try/catch es la parte importante: si localStorage falla (como en este sandbox), el interruptor sigue cambiando el tema con normalidad, solo que no lo recuerda.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Pulsa el botón para alternar el tema.</p>\n    <button class=\"boton\" id=\"interruptor\">Cambiar tema</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\nbody.oscuro {\n  --fondo: #18181b;\n  --texto: #f4f4f5;\n  --acento: #a78bfa;\n}\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n}",
  "js": "const CLAVE = 'tema-preferido';\n\nfunction leerTemaGuardado() {\n  try {\n    return localStorage.getItem(CLAVE);\n  } catch {\n    return null; // almacenamiento no disponible (sandbox, modo privado...)\n  }\n}\n\nfunction guardarTema(valor) {\n  try {\n    localStorage.setItem(CLAVE, valor);\n  } catch {\n    // el interruptor sigue funcionando, solo que no recuerda la próxima vez\n  }\n}\n\nif (leerTemaGuardado() === 'oscuro') {\n  document.body.classList.add('oscuro');\n}\n\ndocument.getElementById('interruptor').addEventListener('click', () => {\n  document.body.classList.toggle('oscuro');\n  guardarTema(document.body.classList.contains('oscuro') ? 'oscuro' : 'claro');\n});",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: un tercer tema, alto contraste",
  "consigna": "El botón ya no alterna una sola clase, sino que recorre un array de 3 temas en orden. El color del texto del botón usa var(--fondo) a propósito — así siempre contrasta con var(--acento), sea cual sea el tema activo.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>Cada clic pasa al siguiente tema: claro, oscuro, alto contraste.</p>\n    <button class=\"boton\" id=\"interruptor\">Cambiar tema</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\nbody.oscuro {\n  --fondo: #18181b;\n  --texto: #f4f4f5;\n  --acento: #a78bfa;\n}\nbody.alto-contraste {\n  --fondo: #000000;\n  --texto: #ffffff;\n  --acento: #ffff00;\n}\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: var(--fondo);\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n}",
  "js": "const TEMAS = ['claro', 'oscuro', 'alto-contraste'];\nlet indice = 0;\n\ndocument.getElementById('interruptor').addEventListener('click', () => {\n  document.body.classList.remove(TEMAS[indice]);\n  indice = (indice + 1) % TEMAS.length;\n  if (TEMAS[indice] !== 'claro') {\n    document.body.classList.add(TEMAS[indice]);\n  }\n});",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: prefers-color-scheme como punto de partida",
  "consigna": "matchMedia lee la preferencia del sistema UNA vez, al cargar — el botón solo añade una clase que fuerza el tema contrario a esa preferencia inicial.",
  "html": "<body>\n  <div class=\"tarjeta\">\n    <h2>Tarjeta de ejemplo</h2>\n    <p>El tema inicial depende de la preferencia de tu sistema operativo.</p>\n    <button class=\"boton\" id=\"interruptor\">Forzar el tema contrario</button>\n  </div>\n</body>",
  "css": ":root {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --fondo: #18181b;\n    --texto: #f4f4f5;\n    --acento: #a78bfa;\n  }\n}\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--fondo);\n  color: var(--texto);\n  margin: 0;\n  padding: 1.5rem;\n  transition: background 200ms, color 200ms;\n}\nbody.forzar-oscuro {\n  --fondo: #18181b;\n  --texto: #f4f4f5;\n  --acento: #a78bfa;\n}\nbody.forzar-claro {\n  --fondo: #ffffff;\n  --texto: #1a1a1a;\n  --acento: #7c3aed;\n}\n.tarjeta {\n  border: 1px solid color-mix(in srgb, var(--texto) 20%, transparent);\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 320px;\n}\n.boton {\n  background: var(--acento);\n  color: var(--fondo);\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n}",
  "js": "const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;\n\ndocument.getElementById('interruptor').addEventListener('click', () => {\n  document.body.classList.toggle(prefiereOscuro ? 'forzar-claro' : 'forzar-oscuro');\n});",
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
      "titulo": "Custom properties (variables CSS)",
      "descripcion": "Repaso de :root, redefinir variables dentro de una clase, y el fallback de var().",
      "url": "https://web.dev/learn/css/custom-properties",
      "etiqueta": "web.dev"
    }
  ]
}
```
