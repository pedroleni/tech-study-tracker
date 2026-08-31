# Anchor positioning: anclar un elemento a otro sin JS

- **Módulo:** Layout
- **Slug:** `anchor-positioning-anclar-un-elemento-a-otro-sin-js` (autogenerado del título)
- **Orden:** 185
- **Fuentes:** [Anchor positioning (web.dev)](https://web.dev/learn/css/anchor-positioning) — ver `contenido/css/TEMARIO.md` #38

---

## Qué es y para qué sirve

Un tooltip que debe aparecer justo debajo de un botón, sin importar dónde esté ese botón en la página, tradicionalmente necesitaba JavaScript midiendo posiciones en tiempo real. Anchor positioning lo resuelve en CSS puro: `anchor-name` marca un elemento como "ancla", y `position-anchor` + `position-area` colocan otro elemento relativo a esa ancla — incluso si están en partes completamente distintas del HTML.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita anclar un elemento a otro",
  "roles": [
    { "etiqueta": "Quien construye tooltips y menús", "rol": "Que aparezcan pegados a su elemento disparador", "descripcion": "Sin medir posiciones con JavaScript — anchor-name y position-anchor conectan los dos elementos directamente en CSS." },
    { "etiqueta": "Quien evita que un popover se salga", "rol": "Reposicionar automáticamente si no cabe", "descripcion": "position-try-fallbacks prueba posiciones alternativas hasta encontrar una que no se desborde, sin ningún cálculo manual." },
    { "etiqueta": "Quien hereda el tamaño de otro elemento", "rol": "Usar el tamaño real del ancla como referencia", "descripcion": "anchor-size() lee el ancho o alto del propio elemento ancla, en vez de fijar un valor rígido a mano." }
  ]
}
```

## anchor-name y position-anchor: conectar dos elementos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  #boton {\n    anchor-name: --mi-ancla;\n  }\n  .tooltip {\n    position: absolute;\n    position-anchor: --mi-ancla;\n    position-area: bottom;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "anchor-name: --mi-ancla;", "nota": "Marca a #boton como un ancla con este nombre — cualquier elemento puede referenciarlo después, sin importar dónde viva en el HTML." },
    { "fragmento": "position: absolute;\n    position-anchor: --mi-ancla;\n    position-area: bottom;", "nota": "Los TRES son necesarios: position: absolute (o fixed) saca al elemento del flujo normal; position-anchor dice A QUÉ ancla referenciarse; position-area dice EN QUÉ LADO de esa ancla colocarse." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 150px; font-family: sans-serif; padding: 20px;\">\n  <button style=\"padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 4px;\">Botón ancla</button>\n  <div style=\"position: absolute; top: 0; left: 0; background: #16a34a; color: white; padding: 8px; border-radius: 4px;\">Caja sin anclar</div>\n</div>",
  "despues": "<div style=\"position: relative; height: 150px; font-family: sans-serif; padding: 20px;\">\n  <button style=\"anchor-name: --boton; padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 4px;\">Botón ancla</button>\n  <div style=\"position: absolute; position-anchor: --boton; position-area: bottom; margin-top: 4px; background: #16a34a; color: white; padding: 8px; border-radius: 4px;\">Caja anclada debajo</div>\n</div>",
  "nota": "Antes: la caja verde usa top: 0; left: 0; — una posición fija, sin ninguna relación real con el botón, aunque visualmente coincida por casualidad. Después: con anchor-name en el botón y position-anchor + position-area: bottom en la caja, esta se coloca justo DEBAJO del botón de verdad — si el botón se moviera, la caja lo seguiría automáticamente, sin ningún cálculo manual."
}
```

## position-area: elegir el lado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 150px; font-family: sans-serif; padding: 30px;\">\n  <button style=\"anchor-name: --boton; padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 4px;\">Botón</button>\n  <div style=\"position: absolute; position-anchor: --boton; position-area: bottom; margin-top: 4px; background: #16a34a; color: white; padding: 8px; border-radius: 4px;\">Debajo</div>\n</div>",
  "despues": "<div style=\"position: relative; height: 150px; font-family: sans-serif; padding: 30px;\">\n  <button style=\"anchor-name: --boton; padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 4px;\">Botón</button>\n  <div style=\"position: absolute; position-anchor: --boton; position-area: right; margin-left: 4px; background: #16a34a; color: white; padding: 8px; border-radius: 4px;\">A la derecha</div>\n</div>",
  "nota": "Mismo botón ancla, misma caja anclada — el único cambio es position-area: bottom por position-area: right. La caja pasa de colocarse debajo del botón a colocarse a su derecha, sin tocar ninguna otra propiedad de posición."
}
```

## Reposicionar automáticamente si no cabe

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tooltip {\n    position: absolute;\n    position-anchor: --mi-ancla;\n    position-area: block-end span-inline-end;\n    position-try-fallbacks: block-end span-inline-start;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "position-try-fallbacks: block-end span-inline-start;", "nota": "Si la posición por defecto (position-area) haría que el elemento se desbordara del viewport, el navegador prueba esta posición alternativa en su lugar — automáticamente, sin JavaScript, sin calcular nada a mano." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "anchor-size(): el tamaño del ancla como referencia",
  "contenido": "width: anchor-size(); en un elemento anclado usa el ancho REAL del propio elemento ancla, en vez de un valor fijo escrito a mano. Si el ancla cambia de tamaño (un texto que crece, una imagen que carga), el elemento anclado se ajusta con ella, sin recalcular nada manualmente."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  #ancla { anchor-name: --mi-ancla; }\n  .caja {\n    position-anchor: --mi-ancla;\n    position-area: bottom;\n    background: teal;\n  }\n</style>\n<div id=\"ancla\">Ancla</div>\n<div class=\"caja\">Anclada</div>",
  "opciones": [
    "La caja se posiciona automáticamente debajo del ancla, sin necesitar ninguna otra propiedad",
    "La caja se queda en su posición normal del flujo — position-anchor no tiene ningún efecto sin position: absolute o fixed también declarado",
    "Es un error: position-area no puede usarse nunca sin JavaScript"
  ],
  "correcta": 1,
  "explicacion": "Anclar un elemento a otro requiere TAMBIÉN sacarlo del flujo normal con position: absolute o position: fixed. Sin eso, position-anchor y position-area no tienen ningún efecto — el elemento se queda exactamente donde el flujo normal ya lo habría puesto."
}
```

## Lo que anchor positioning NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "anchor-name conecta automáticamente dos elementos sin necesitar más propiedades",
      "realidad": "Hace falta TAMBIÉN position: absolute o fixed, y position-anchor, en el elemento que se quiere anclar — anchor-name por sí solo no mueve nada."
    },
    {
      "mito": "position-area solo acepta un valor a la vez",
      "realidad": "Acepta hasta dos palabras clave combinadas (como top right o block-end span-inline-end) para posiciones más precisas alrededor del ancla."
    },
    {
      "mito": "Sin JavaScript, no hay forma de evitar que un tooltip se salga de la pantalla",
      "realidad": "position-try-fallbacks prueba automáticamente posiciones alternativas cuando la posición por defecto se desbordaría, sin ningún JavaScript."
    },
    {
      "mito": "anchor-size() devuelve un valor fijo, igual en cualquier caso",
      "realidad": "Devuelve el tamaño REAL del elemento ancla en el eje correspondiente — cambia si el propio ancla cambia de tamaño."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar position: absolute o fixed en el elemento anclado.", "texto": "Sin eso, position-anchor no tiene ningún efecto — el elemento se queda donde el flujo normal lo hubiera colocado." },
    { "titulo": "Usar el mismo anchor-name en varios elementos sin anchor-scope.", "texto": "Genera ambigüedad sobre a cuál de todos se refiere realmente cada elemento anclado." },
    { "titulo": "No usar position-try-fallbacks en un elemento que puede desbordar el viewport.", "texto": "Arriesga que quede parcialmente oculto en pantallas pequeñas o cerca de un borde." },
    { "titulo": "Confundir anchor() con position-area.", "texto": "anchor() da un valor de posición en un solo eje; position-area define una posición general alrededor del ancla — sirven para cosas algo distintas." }
  ]
}
```

## Ejercicios

1. Escribe las reglas necesarias para anclar un `div` a un botón, con el `div` apareciendo justo debajo del botón.
2. Escribe una regla `position-try-fallbacks` que pruebe una posición alternativa si la posición por defecto se desborda del viewport.
3. Explica por qué `anchor-name` por sí solo, sin nada más, no mueve ningún elemento.
4. Escribe una regla que use `anchor-size()` para que un elemento anclado tenga el mismo ancho que su elemento ancla.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Ancla el div de abajo al botón, para que aparezca justo debajo (ejercicio 1). Nota: anchor positioning es reciente — si tu navegador no lo soporta todavía, no verás el efecto, pero el código sigue siendo correcto.",
  "html": "<button class=\"ancla\">Botón ancla</button>\n<div class=\"anclado\">Elemento anclado</div>",
  "css": ".ancla { anchor-name: --mi-boton; }\n.anclado {\n  position: fixed;\n  /* position-anchor: --mi-boton;\n  top: anchor(--mi-boton bottom);\n  left: anchor(--mi-boton left); */\n  background: #333; color: white; padding: 8px;\n}",
  "pestañaInicial": "css"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Anchor positioning",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre anchor-name, position-anchor, position-area, position-try-fallbacks y anchor-size().",
      "url": "https://web.dev/learn/css/anchor-positioning",
      "etiqueta": "web.dev"
    }
  ]
}
```
