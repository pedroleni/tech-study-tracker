# Proyecto: interruptor de modo oscuro con variables CSS

- **Módulo:** Proyectos
- **Slug:** `proyecto-interruptor-de-modo-oscuro-con-variables-css` (autogenerado del título)
- **Orden:** 310
- **Requiere:** Lección 22 (variables CSS) y lección 18 (color en CSS)

---

## Qué vas a construir

Un modo oscuro real, del mismo tipo que el que ya usa esta propia web: un conjunto de variables de color declaradas una vez en `:root`, redefinidas dentro de una clase `.oscuro`, y un botón que añade o quita esa clase. Este proyecto combina CSS con una pizca de JavaScript — lo justo para alternar una clase, no para calcular ningún color.

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
