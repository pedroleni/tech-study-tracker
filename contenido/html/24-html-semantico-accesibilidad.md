# HTML semántico: la base de la accesibilidad

- **Módulo:** Accesibilidad
- **Slug:** `html-semantico-la-base-de-la-accesibilidad` (autogenerado del título)
- **Orden:** 115
- **Fuentes:** [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) — ver `contenido/html/TEMARIO.md` #24

---

## Qué es y para qué sirve

Cada vez que el navegador procesa tu HTML, construye por debajo un segundo árbol además del visual: el árbol de accesibilidad, la estructura que de verdad usa un lector de pantalla para navegar. `header`, `nav`, `h2`, `ul` — cada etiqueta semántica añade un nodo con significado a ese árbol; `div` y `span` no añaden ninguno. La mayor parte del trabajo de accesibilidad de un sitio ya está hecho, o no, según qué etiquetas hayas elegido antes de escribir una sola línea de CSS o ARIA.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué construye cada elemento en el árbol de accesibilidad",
  "roles": [
    { "etiqueta": "header, nav, main, footer", "rol": "Puntos de referencia (landmarks)", "descripcion": "Un lector de pantalla puede saltar directo a \"navegación\" o a \"contenido principal\", igual que tú saltas visualmente entre secciones de un vistazo." },
    { "etiqueta": "h1-h6", "rol": "Una tabla de contenidos navegable", "descripcion": "El método de navegación más usado con lector de pantalla, según WebAIM: un 71,6% salta entre encabezados en vez de leer la página entera." },
    { "etiqueta": "div, span", "rol": "Nada — invisibles para el árbol", "descripcion": "No añaden ningún nodo con significado propio. Todo lo que envuelven se lee como un bloque plano, sin ninguna señal de navegación." }
  ]
}
```

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando decides qué etiqueta usar, no después",
  "contenido": "La etiqueta correcta construye el árbol de accesibilidad gratis, en el momento de escribirla — arreglarlo después casi siempre implica añadir ARIA a mano para simular lo que la etiqueta correcta ya habría dado de fábrica."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el orden del HTML no coincide con el orden visual",
  "contenido": "CSS puede reordenar visualmente el contenido (con order, flex-direction...), pero un lector de pantalla sigue el orden del HTML tal cual está escrito — asegúrate de que ese orden ya tiene sentido por sí solo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando necesitas ocultar algo — pero no de la misma forma para todos",
  "contenido": "Ocultar visualmente no siempre significa ocultar del árbol de accesibilidad, y viceversa — son dos decisiones distintas, con herramientas distintas para cada una."
}
```

## Ocultar contenido de forma accesible

No todas las formas de "ocultar" algo hacen lo mismo:

| Técnica | ¿Visible en pantalla? | ¿Lo anuncia un lector de pantalla? |
|---|---|---|
| `display: none` / atributo `hidden` | No | No |
| `aria-hidden="true"` | Sí | No |
| Clase "solo lector de pantalla" (recortada visualmente con CSS) | No | Sí |
| Contenido normal, sin nada de esto | Sí | Sí |

Cuando quieres dar contexto extra SOLO a quien usa lector de pantalla, sin mostrarlo en pantalla, la técnica habitual es recortar visualmente el texto sin ocultarlo del árbol:

```css
.solo-lector-pantalla {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

## El orden de fuente manda, no el visual

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display:flex\">\n  <p>Primero en el HTML</p>\n  <p>Segundo en el HTML</p>\n</div>",
  "despues": "<div style=\"display:flex\">\n  <p>Primero en el HTML</p>\n  <p style=\"order:-1\">Segundo en el HTML</p>\n</div>",
  "nota": "En la versión de después, \"Segundo en el HTML\" aparece VISUALMENTE primero gracias a order — pero en el código sigue siendo el segundo elemento. Un lector de pantalla no ve ese order: sigue anunciándolo en el orden real del HTML, primero \"Primero\" y luego \"Segundo\" — justo al revés de lo que se ve en pantalla."
}
```

## Lo que el HTML semántico NO hace solo

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Usar header, nav, main y footer ya garantiza que el sitio es accesible",
      "realidad": "Es la base, no el final — sigue haciendo falta alt en las imágenes, label en los campos, contraste suficiente... el HTML semántico reduce el trabajo, no lo elimina."
    },
    {
      "mito": "aria-hidden=\"true\" también oculta el elemento visualmente",
      "realidad": "No cambia nada visual — el elemento sigue viéndose igual, pero desaparece del árbol de accesibilidad. Para ocultar visual Y accesiblemente a la vez hace falta display: none o el atributo hidden."
    },
    {
      "mito": "Si el CSS cambia el orden visual, el lector de pantalla lee en ese mismo orden",
      "realidad": "Un lector de pantalla sigue el orden del HTML tal cual está escrito, no el orden visual que produce order o flex-direction en CSS."
    },
    {
      "mito": "display: none y aria-hidden hacen exactamente lo mismo",
      "realidad": "display: none oculta el contenido tanto visual como del árbol de accesibilidad; aria-hidden solo lo saca del árbol, dejándolo visible en pantalla — son herramientas para casos distintos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Maquetar el orden visual con CSS sin cuidar el orden real del HTML.", "texto": "Un lector de pantalla sigue el HTML, no lo que se ve — el orden de fuente tiene que tener sentido por sí solo." },
    { "titulo": "Usar aria-hidden pensando que también oculta visualmente.", "texto": "El elemento sigue en pantalla, solo desaparece para quien usa lector de pantalla — puede generar contenido visible que nadie anuncia." },
    { "titulo": "Envolver todo en div y span aunque exista la etiqueta semántica correcta.", "texto": "Sin marcado semántico, el árbol de accesibilidad queda plano — un lector de pantalla no tiene ningún punto de referencia para navegar." },
    { "titulo": "Dar por hecho que las herramientas automáticas detectan todos los problemas.", "texto": "Comprueban reglas técnicas, no si la navegación tiene sentido real — la única prueba fiable es navegar de verdad con un lector de pantalla." }
  ]
}
```

## Ejercicios

1. Coge una página con divs y spans sin semántica y reescríbela con header/nav/main/article/footer donde corresponda.
2. Escribe una clase CSS "solo-lector-pantalla" que oculte visualmente un texto pero lo deje disponible para un lector de pantalla.
3. Escribe un ejemplo donde el CSS reordene visualmente dos elementos con order, y explica qué orden anunciaría un lector de pantalla.
4. Activa el lector de pantalla de tu sistema operativo (VoiceOver, Narrador, Orca...) y navega una página real usando solo la lista de encabezados — ¿tiene sentido la estructura?

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Reescribe esta página hecha solo de divs con las etiquetas semánticas que correspondan (ejercicio 1). Después escribe la clase .solo-lector-pantalla del ejercicio 2 en la pestaña CSS — recorta el texto visualmente sin quitarlo del DOM.",
  "html": "<div class=\"cabecera\"><div class=\"titulo\">Mi blog</div></div>\n<div class=\"menu\"><div>Inicio</div><div>Artículos</div></div>\n<div class=\"contenido\"><div class=\"post\">Un texto cualquiera</div></div>\n<div class=\"pie\">© 2026</div>",
  "css": "/* prueba: .solo-lector-pantalla { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; } */",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML: A good basis for accessibility",
      "descripcion": "Guía de referencia de MDN sobre el árbol de accesibilidad, la navegación por encabezados de un lector de pantalla, y por qué el orden de fuente importa más que el visual.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
      "etiqueta": "MDN"
    }
  ]
}
```
