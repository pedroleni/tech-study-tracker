# Proyecto: panel de precios con Flexbox

- **Módulo:** Proyectos
- **Slug:** `proyecto-panel-de-precios-con-flexbox` (autogenerado del título)
- **Orden:** 300
- **Requiere:** Lecciones 33-34 (Flexbox: contenedor e hijos)

---

## Qué vas a construir

El panel de "Planes y precios" que tiene casi cualquier producto SaaS: tres tarjetas lado a lado, una de ellas destacada como recomendada, que se apilan en columna en pantallas estrechas. El HTML ya está escrito completo — este proyecto es 100% CSS.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El HTML no cambia en ningún paso",
  "contenido": "Las tres tarjetas de precio ya están escritas en la pestaña HTML de cada editor de abajo. Todo lo que construyes en este proyecto vive en la pestaña CSS."
}
```

## Paso 1: el contenedor flex

Convierte `.planes` en un contenedor flex, con las tres tarjetas en fila y separadas por un espacio uniforme.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: contenedor flex",
  "consigna": "Escribe display: flex en .planes, con un gap entre tarjetas y que se centren en el eje cruzado.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n    <ul><li>1 proyecto</li><li>Soporte por email</li></ul>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n    <ul><li>Proyectos ilimitados</li><li>Soporte prioritario</li><li>Estadísticas avanzadas</li></ul>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n    <ul><li>Todo lo de Pro</li><li>5 miembros de equipo</li></ul>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  /* display: flex; gap; align-items */\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  width: 220px;\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n    <ul><li>1 proyecto</li><li>Soporte por email</li></ul>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n    <ul><li>Proyectos ilimitados</li><li>Soporte prioritario</li><li>Estadísticas avanzadas</li></ul>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n    <ul><li>Todo lo de Pro</li><li>5 miembros de equipo</li></ul>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  align-items: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  width: 220px;\n}",
  "pestañaInicial": "css"
}
```

## Paso 2: la tarjeta destacada

`.plan--destacado` debe verse ligeramente más grande y elevada — usa `flex` en los hijos para que la destacada crezca un poco más que las demás, en vez de fijar anchos distintos a mano.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: la tarjeta destacada",
  "consigna": "Dale a .plan un flex: 1 (para que las tres compartan el espacio disponible) y a .plan--destacado un flex-grow ligeramente mayor, además de un borde de color y una sombra propia.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n    <ul><li>1 proyecto</li><li>Soporte por email</li></ul>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n    <ul><li>Proyectos ilimitados</li><li>Soporte prioritario</li><li>Estadísticas avanzadas</li></ul>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n    <ul><li>Todo lo de Pro</li><li>5 miembros de equipo</li></ul>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan--destacado {\n  /* flex-grow mayor, borde de color, box-shadow */\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n    <ul><li>1 proyecto</li><li>Soporte por email</li></ul>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n    <ul><li>Proyectos ilimitados</li><li>Soporte prioritario</li><li>Estadísticas avanzadas</li></ul>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n    <ul><li>Todo lo de Pro</li><li>5 miembros de equipo</li></ul>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan--destacado {\n  flex-grow: 1.15;\n  border-color: #7c3aed;\n  box-shadow: 0 8px 24px rgb(124 58 237 / 0.15);\n}",
  "pestañaInicial": "css"
}
```

## Paso 3: responsive — en columna por debajo de 700px

Sin escribir ningún ancho fijo nuevo: solo cambia la dirección del flex por debajo de 700px de ancho de ventana.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: apilar en móvil",
  "consigna": "Escribe un media query max-width: 700px que cambie flex-direction a column en .planes. Reduce el ancho de la vista previa (o de tu ventana) para comprobarlo.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n/* @media (max-width: 700px) { .planes { flex-direction: column; } } */",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n@media (max-width: 700px) {\n  .planes {\n    flex-direction: column;\n  }\n}",
  "pestañaInicial": "css"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes el panel entero, ya resuelto — con las tres tarjetas, la destacada distinguida de verdad, y apilándose en columna por debajo de 700px:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "El panel terminado: contenedor flex, tarjeta destacada con su propio estilo, y responsive apilado en columna por debajo de 700px. Reduce el ancho de la vista previa para comprobarlo.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n    <ul><li>1 proyecto</li><li>Soporte por email</li></ul>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n    <ul><li>Proyectos ilimitados</li><li>Soporte prioritario</li><li>Estadísticas avanzadas</li></ul>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n    <ul><li>Todo lo de Pro</li><li>5 miembros de equipo</li></ul>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan--destacado {\n  flex-grow: 1.15;\n  border-color: #7c3aed;\n  box-shadow: 0 8px 24px rgb(124 58 237 / 0.15);\n}\n@media (max-width: 700px) {\n  .planes {\n    flex-direction: column;\n  }\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "flex-grow, no un ancho fijo distinto.", "texto": "La tarjeta destacada crece un poco más que las demás porque comparte el mismo flex-basis — no porque tenga un width propio calculado a mano." },
    { "titulo": "El media query solo cambia flex-direction.", "texto": "No hace falta redefinir anchos ni el gap — al pasar a columna, cada tarjeta ocupa el 100% del ancho disponible sola." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Usaste flex, no anchos fijos?",
      "texto": "flex: 1 en cada tarjeta reparte el espacio automáticamente — no hace falta calcular porcentajes a mano."
    },
    {
      "titulo": "¿La tarjeta destacada se distingue sin romper el layout?",
      "texto": "Un borde de color y una sombra bastan — no hace falta sacarla del flujo flex para que destaque."
    },
    {
      "titulo": "¿Se apila de verdad en pantallas estrechas?",
      "texto": "Reduce el ancho de la vista previa y comprueba que las tres tarjetas pasan a una columna."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade una insignia "Más popular" sobre la tarjeta destacada, posicionada con `position: absolute` respecto a la propia tarjeta.
2. Añade una transición suave al `flex-grow` de la tarjeta destacada al pasar el ratón por encima.
3. Cambia el criterio de "destacada" a la tarjeta del medio usando `:nth-child(2)` en vez de una clase, y compara ventajas/inconvenientes.

Si quieres comparar con una solución real de cada reto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: insignia \"Más popular\"",
  "consigna": "La tarjeta destacada necesita position: relative para que la insignia se posicione respecto a ELLA, no respecto a toda la página.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <span class=\"insignia\">Más popular</span>\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan--destacado {\n  position: relative;\n  flex-grow: 1.15;\n  border-color: #7c3aed;\n  box-shadow: 0 8px 24px rgb(124 58 237 / 0.15);\n}\n.insignia {\n  position: absolute;\n  top: -0.75rem;\n  left: 50%;\n  transform: translateX(-50%);\n  background: #7c3aed;\n  color: white;\n  font-size: 0.7rem;\n  font-weight: 600;\n  padding: 0.25rem 0.75rem;\n  border-radius: 999px;\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: transición en el flex-grow",
  "consigna": "flex-grow es un número, así que es animable como cualquier otro — transition funciona igual que con cualquier propiedad numérica. Pasa el ratón por encima de la tarjeta Pro en la vista previa.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n  </div>\n  <div class=\"plan plan--destacado\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan--destacado {\n  flex-grow: 1.15;\n  border-color: #7c3aed;\n  box-shadow: 0 8px 24px rgb(124 58 237 / 0.15);\n  transition: flex-grow 200ms;\n}\n.plan--destacado:hover {\n  flex-grow: 1.35;\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: :nth-child(2) en vez de una clase",
  "consigna": "Mismo resultado visual, pero fíjate en el HTML: ya no hay ninguna clase plan--destacado. El inconveniente real: si mañana reordenas las tarjetas o añades una cuarta antes de \"Pro\", deja de ser la del medio y el estilo se aplica a la tarjeta equivocada — con una clase explícita eso nunca pasa, da igual el orden.",
  "html": "<div class=\"planes\">\n  <div class=\"plan\">\n    <h3>Básico</h3>\n    <p class=\"precio\">9€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Pro</h3>\n    <p class=\"precio\">29€/mes</p>\n  </div>\n  <div class=\"plan\">\n    <h3>Equipo</h3>\n    <p class=\"precio\">79€/mes</p>\n  </div>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n.planes {\n  display: flex;\n  gap: 1.5rem;\n  justify-content: center;\n}\n.plan {\n  border: 1px solid #d8d3c8;\n  border-radius: 12px;\n  padding: 1.5rem;\n  flex: 1;\n}\n.plan:nth-child(2) {\n  flex-grow: 1.15;\n  border-color: #7c3aed;\n  box-shadow: 0 8px 24px rgb(124 58 237 / 0.15);\n}",
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
      "titulo": "Flexbox — el contenedor",
      "descripcion": "Repaso de display: flex, gap y align-items si te atascas en el paso 1.",
      "url": "https://web.dev/learn/css/flexbox",
      "etiqueta": "web.dev"
    }
  ]
}
```
