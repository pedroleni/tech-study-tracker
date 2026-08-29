# box-sizing: content-box frente a border-box

- **Módulo:** El modelo de caja
- **Slug:** `box-sizing-content-box-frente-a-border-box` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) — ver `contenido/css/TEMARIO.md` #13

---

## Qué es y para qué sirve

La lección anterior mostró que padding y border se suman al `width` declarado, agrandando la caja. `box-sizing` decide si eso sigue siendo así (`content-box`, el valor por defecto) o si, en cambio, el `width` declarado pasa a ser el tamaño TOTAL de la caja, y es el área de contenido la que se encoge para dejar sitio al padding y al border (`border-box`). Es una sola propiedad, pero cambia por completo cómo razonar sobre cualquier tamaño en CSS.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se topa con esto a diario",
  "roles": [
    { "etiqueta": "Quien maqueta con anchos en porcentaje", "rol": "Evitar que el padding rompa el ancho total", "descripcion": "Un width: 100% con padding en content-box se sale de su contenedor — border-box lo evita sin cambiar ni el width ni el padding." },
    { "etiqueta": "Quien escribe un reset de CSS", "rol": "Decidir el box-sizing de todo el proyecto de una vez", "descripcion": "El patrón *, *::before, *::after { box-sizing: border-box; } es casi universal hoy — entender por qué evita tener que redescubrirlo caja por caja." },
    { "etiqueta": "Quien calcula tamaños a mano", "rol": "Saber si el width es el total o solo el contenido", "descripcion": "Con content-box hay que sumar padding y border al width para saber el tamaño real; con border-box, el width YA es ese tamaño real." }
  ]
}
```

## Los mismos números, dos resultados distintos

```laboratorio
{
  "tipo": "capas-de-caja",
  "titulo": "content-box: el content se queda igual, la caja crece",
  "margin": "0",
  "border": "4px solid",
  "padding": "20px",
  "content": "300px (declarado)"
}
```

```laboratorio
{
  "tipo": "capas-de-caja",
  "titulo": "border-box: la caja se queda igual, el content se encoge",
  "margin": "0",
  "border": "4px solid",
  "padding": "20px",
  "content": "252px (recalculado)"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las mismas cuatro capas, distinto punto de partida",
  "contenido": "box-sizing no cambia el modelo de caja en sí — sigue habiendo content, padding, border y margin. Lo único que cambia es qué representa el width y el height que escribes: en content-box, solo el content; en border-box, content + padding + border juntos."
}
```

## content-box: el valor por defecto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    box-sizing: content-box;\n    width: 300px;\n    padding: 20px;\n    border: 4px solid #7c3aed;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "box-sizing: content-box;", "nota": "Es el valor por defecto de todo el CSS — no hace falta escribirlo, ya está activo aunque no aparezca en ninguna regla." },
    { "fragmento": "width: 300px;", "nota": "Se aplica solo al content. El padding (20+20) y el border (4+4) se SUMAN por fuera: ancho visible total = 300 + 40 + 8 = 348px." }
  ]
}
```

## border-box: el width pasa a ser el total

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  html {\n    box-sizing: border-box;\n  }\n\n  *, *::before, *::after {\n    box-sizing: inherit;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "html {\n    box-sizing: border-box;\n  }", "nota": "Fija border-box una sola vez, en la raíz del documento." },
    { "fragmento": "*, *::before, *::after {\n    box-sizing: inherit;\n  }", "nota": "box-sizing NO hereda por defecto — por eso hace falta esta regla explícita, para que cada elemento (y sus pseudo-elementos) copie el valor del html en vez de quedarse con content-box. Este patrón de dos reglas es casi universal en cualquier proyecto moderno de CSS." }
  ]
}
```

## Verlo en vivo: el mismo width: 100% con y sin border-box

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    width: 300px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    width: 100%;\n    padding: 20px;\n    border: 4px solid #7c3aed;\n    background: #ede9fe;\n    box-sizing: content-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">width: 100%, content-box</div>\n</div>",
  "despues": "<style>\n  .contenedor {\n    width: 300px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n  .caja {\n    width: 100%;\n    padding: 20px;\n    border: 4px solid #7c3aed;\n    background: #ede9fe;\n    box-sizing: border-box;\n  }\n</style>\n<div class=\"contenedor\">\n  <div class=\"caja\">width: 100%, border-box</div>\n</div>",
  "nota": "Mismo width: 100%, mismo padding, mismo border en los dos casos. Antes (content-box): el 100% se aplica solo al content, y el padding + border se suman por encima — la caja se sale visiblemente del contenedor punteado. Después (border-box): el 100% ya incluye el padding y el border — la caja encaja exacta dentro del contenedor, sin salirse ni un píxel."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    box-sizing: border-box;\n    width: 200px;\n    padding: 30px;\n    border: 10px solid black;\n  }\n</style>\n<div class=\"caja\">Contenido</div>",
  "opciones": [
    "El ancho visible total es 200px, y el área de contenido real mide 120px",
    "El ancho visible total es 280px (200 + 30 + 30 + 10 + 10)",
    "El ancho visible total es 200px, y el área de contenido también mide 200px"
  ],
  "correcta": 0,
  "explicacion": "Con border-box, el width declarado (200px) ya incluye padding y border — el navegador los resta del propio width para saber cuánto le queda al content: 200 - 30 - 30 - 10 - 10 = 120px de área de contenido real. El ancho visible total de la caja sigue siendo 200px, tal cual se declaró."
}
```

## Lo que box-sizing NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "border-box hace que el padding y el border ya no cuenten en el tamaño",
      "realidad": "Siguen contando exactamente igual — lo único que cambia es DE DÓNDE se restan: en vez de sumarse por fuera del width declarado, se restan del área de contenido, dentro del mismo width."
    },
    {
      "mito": "Cambiar a border-box afecta el tamaño final de cualquier caja",
      "realidad": "Una caja sin padding ni border da el mismo resultado en los dos modelos — la diferencia solo aparece cuando hay algo que sumar o restar."
    },
    {
      "mito": "box-sizing hereda por defecto, así que basta con ponerlo una vez en el html",
      "realidad": "box-sizing NO hereda por defecto — por eso el patrón de reset habitual añade *, *::before, *::after { box-sizing: inherit; } de forma explícita, para forzar esa herencia en cada elemento."
    },
    {
      "mito": "border-box es una función nueva y distinta del modelo de caja clásico",
      "realidad": "Es solo un valor alternativo de la MISMA propiedad box-sizing — usa exactamente las mismas cuatro capas del modelo de caja, solo cambia cómo se interpreta el width y el height declarados."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar width: 100% con padding en content-box y sorprenderse del overflow.", "texto": "El 100% se calcula solo sobre el content — el padding se suma por encima, sacando a la caja de su contenedor." },
    { "titulo": "Poner box-sizing: border-box solo en el html y esperar que baje solo a todos los elementos.", "texto": "box-sizing no hereda por defecto — hace falta la regla *, *::before, *::after { box-sizing: inherit; } explícita." },
    { "titulo": "Pensar que border-box cambia el tamaño de cajas sin padding ni border.", "texto": "Sin nada que restar o sumar, los dos modelos dan exactamente el mismo resultado — la diferencia solo aparece con padding o border presentes." },
    { "titulo": "Olvidar que box-sizing es una propiedad más, no un modo global del navegador.", "texto": "Sin el reset explícito, cada elemento nuevo vuelve a nacer en content-box, el valor por defecto de la especificación." }
  ]
}
```

## Ejercicios

1. Una caja tiene `box-sizing: border-box`, `width: 250px`, `padding: 25px` y `border: 5px solid`. Calcula el área de contenido real, sin ejecutarlo.
2. Explica por qué esa misma caja, con `box-sizing: content-box` en vez de `border-box`, mediría 310px de ancho total en vez de 250px.
3. Escribe el patrón de reset de dos reglas que aplica `border-box` a toda una página, incluidos los pseudo-elementos.
4. Explica por qué una caja sin padding ni border se ve exactamente igual en `content-box` que en `border-box`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Calcula primero a mano el área de contenido de esta caja con box-sizing: border-box, width 250px, padding 25px, border 5px (ejercicio 1). Cambia después a content-box y comprueba que el ancho total pasa a 310px (ejercicio 2). Escribe el reset de dos reglas del ejercicio 3.",
  "html": "<div class=\"caja\">Caja de prueba</div>",
  "css": ".caja {\n  box-sizing: border-box;\n  width: 250px;\n  padding: 25px;\n  border: 5px solid #333;\n}",
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
      "titulo": "The box model",
      "descripcion": "Guía de MDN con la comparación completa entre el modelo estándar (content-box) y el alternativo (border-box), y el patrón de reset recomendado.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Box model",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con el patrón de reset alternativo y la distinción entre tamaño intrínseco y extrínseco.",
      "url": "https://web.dev/learn/css/box-model",
      "etiqueta": "web.dev"
    }
  ]
}
```
