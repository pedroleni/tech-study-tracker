# Organizar CSS a escala: metodologías y buenas prácticas

- **Módulo:** Calidad, rendimiento y organización
- **Slug:** `organizar-css-a-escala-metodologias-y-buenas-practicas` (autogenerado del título)
- **Orden:** 285
- **Fuentes:** [Organizing your CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing) — ver `contenido/css/TEMARIO.md` #58

---

## Qué es y para qué sirve

Un archivo CSS de 50 líneas no necesita ninguna convención especial. Uno de 5000, mantenido por un equipo entero durante años, sí — sin alguna estructura, cada cambio corre el riesgo de romper algo en otra parte de la página, invisible hasta que alguien lo nota en producción. Las metodologías de esta lección (BEM, OOCSS) y las buenas prácticas de organización existen para que el CSS siga siendo predecible a medida que crece.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el CSS siga siendo predecible al crecer",
  "roles": [
    { "etiqueta": "Quien organiza CSS a gran escala", "rol": "Mantener un archivo de miles de líneas", "descripcion": "Sin ninguna convención, un cambio en un componente puede romper otro completamente distinto, de forma invisible hasta que alguien lo nota." },
    { "etiqueta": "Quien evita selectores frágiles", "rol": "Que sobrevivan a cambios en el HTML", "descripcion": "Un selector como article.main p.box se rompe con cualquier reestructuración del marcado — una clase simple, no." },
    { "etiqueta": "Quien reutiliza patrones visuales", "rol": "Extraer un objeto en vez de duplicar", "descripcion": "OOCSS separa la estructura reutilizable (el layout de una tarjeta) de la piel concreta (sus colores y bordes)." }
  ]
}
```

## BEM: Block, Element, Modifier

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<form class=\"form form--tema-navidad\">\n  <label class=\"form__label\" for=\"campo\">Nombre</label>\n  <input class=\"form__input\" type=\"text\" id=\"campo\">\n  <input class=\"form__submit form__submit--deshabilitado\" type=\"submit\" value=\"Enviar\">\n</form>",
  "anotaciones": [
    { "fragmento": "class=\"form form--tema-navidad\"", "nota": "form es el BLOQUE — una entidad independiente. form--tema-navidad es un MODIFICADOR: una variante del mismo bloque, con dos guiones." },
    { "fragmento": "class=\"form__input\"", "nota": "form__input es un ELEMENTO — una pieza que solo tiene sentido DENTRO de su bloque (form), unida con doble guion bajo." },
    { "fragmento": "class=\"form__submit form__submit--deshabilitado\"", "nota": "Un elemento puede tener también su propio modificador: form__submit--deshabilitado es una variante concreta de ESE elemento, no del bloque entero." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<button class=\"tarjeta__boton tarjeta__boton--activo\">Comprar</button>",
  "opciones": [
    "tarjeta es el bloque, boton es el elemento, activo es el modificador de ese elemento",
    "tarjeta__boton es el bloque completo, y activo no tiene ningún significado especial en BEM",
    "El doble guion bajo siempre representa un modificador, y el doble guion representa un elemento"
  ],
  "correcta": 0,
  "explicacion": "En BEM, tarjeta es el bloque; __boton (doble guion bajo) marca un elemento que solo tiene sentido dentro de tarjeta; --activo (doble guion) marca un modificador de ESE elemento concreto, una variante de tarjeta__boton."
}
```

## OOCSS: separar estructura de piel, evitar duplicación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Reutilizable: el patrón \"media object\" */\n  .media {\n    display: grid;\n    grid-template-columns: 1fr 3fr;\n  }\n  .media .content {\n    font-size: 0.8rem;\n  }\n\n  /* Específico de cada contexto */\n  .comentario img {\n    border: 1px solid grey;\n  }\n  .item-lista {\n    border-bottom: 1px solid grey;\n  }\n</style>\n<div class=\"media comentario\">\n  <img src=\"\" alt=\"\">\n  <div class=\"content\"></div>\n</div>",
  "anotaciones": [
    { "fragmento": ".media {\n    display: grid;\n    grid-template-columns: 1fr 3fr;\n  }", "nota": "El layout de dos columnas (imagen + contenido) se define UNA sola vez, en una clase reutilizable — sin OOCSS, cada componente que necesite ese mismo layout repetiría estas mismas dos líneas." },
    { "fragmento": "<div class=\"media comentario\">", "nota": "Dos clases combinadas: media aporta el layout genérico; comentario aporta los detalles propios de ESE contexto concreto (el borde de la imagen, por ejemplo)." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Otras metodologías con la misma idea de fondo",
  "contenido": "SMACSS (Jonathan Snook) organiza el CSS en categorías (base, layout, módulo, estado, tema). ITCSS (Harry Roberts) ordena las reglas de lo más genérico a lo más específico, siguiendo la especificidad de forma deliberada. Todas comparten el mismo objetivo que BEM y OOCSS — CSS predecible a escala — solo cambia el ángulo desde el que lo resuelven. No son mutuamente excluyentes: muchos equipos mezclan ideas de varias."
}
```

## Custom properties: variables nativas, con fallback

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    background-color: red; /* alternativa para navegadores sin soporte de gradientes */\n    background-image: linear-gradient(to right, red, #aa0000);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "background-color: red;", "nota": "Los custom properties nativos de CSS reducen la necesidad de un preprocesador solo para tener variables. El mismo principio de fallback aplica en general: declarar primero un valor simple que cualquier navegador entiende, y luego uno más avanzado que lo sobrescribe donde hay soporte." }
  ]
}
```

## Comentarios de sección para navegar un archivo grande

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* || Estilos generales */\n  body { }\n\n  /* || Tipografía */\n  h1, h2, h3 { }\n\n  /* || Cabecera y navegación principal */\n  header { }\n</style>",
  "anotaciones": [
    { "fragmento": "/* || Estilos generales */", "nota": "Un marcador visual sencillo (como || antes del título de sección) hace que buscar una sección concreta con Ctrl+F sea mucho más rápido en un archivo de miles de líneas — independientemente de cuán claro sea el código en sí." }
  ]
}
```

## Evitar selectores demasiado específicos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Frágil: se rompe con cualquier cambio de estructura en el HTML */\n  article.main p.box {\n    background: #567895;\n  }\n\n  /* Resistente: sobrevive a reestructuraciones del marcado */\n  .box {\n    background: #567895;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "article.main p.box {", "nota": "Además de más difícil de sobrescribir después (como ya se vio en la lección de DevTools), una cadena larga de selectores depende de una estructura HTML exacta — cualquier cambio en el marcado puede dejar la regla sin efecto." }
  ]
}
```

## Dividir en varios archivos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "// foundation/_index.scss\n@use \"codigo\";\n@use \"listas\";\n@use \"pie-de-pagina\";\n\n// style.scss\n@use \"foundation\";",
  "anotaciones": [
    { "fragmento": "@use \"codigo\";\n@use \"listas\";\n@use \"pie-de-pagina\";", "nota": "Un preprocesador como Sass permite dividir el CSS en archivos parciales, cada uno con su propia responsabilidad, y combinarlos en un único archivo final — algo que CSS nativo, sin build tools, no ofrece de la misma forma." }
  ]
}
```

## Lo que estas metodologías NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "BEM, OOCSS y SMACSS son formas incompatibles, hay que elegir una para siempre",
      "realidad": "Comparten el mismo objetivo — CSS predecible y reutilizable a escala — desde ángulos distintos. No son mutuamente excluyentes; muchos equipos mezclan ideas de varias."
    },
    {
      "mito": "Los custom properties nativos de CSS sustituyen del todo a Sass y otros preprocesadores",
      "realidad": "Reducen su importancia para variables, pero los preprocesadores siguen ofreciendo cosas que CSS nativo no tiene, como partials para dividir archivos antes de compilar."
    },
    {
      "mito": "Comentar el CSS es opcional si el código ya es autoexplicativo",
      "realidad": "En hojas de estilo grandes, los comentarios de sección ayudan a navegar el archivo, sin importar cuán claro sea el código en sí."
    },
    {
      "mito": "Un selector muy específico es más seguro porque nunca se sobrescribe por accidente",
      "realidad": "Es justo lo contrario: dificulta sobrescribirlo cuando SÍ hace falta, y es más frágil ante cambios en la estructura del HTML."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Mezclar convenciones de nomenclatura sin ningún criterio en el mismo proyecto.", "texto": "Dificulta predecir cómo se llamará la siguiente clase del equipo." },
    { "titulo": "Usar selectores demasiado específicos.", "texto": "Complica sobrescribirlos más adelante y los hace frágiles ante cambios de HTML." },
    { "titulo": "No comentar secciones grandes de una hoja de estilos extensa.", "texto": "Hace mucho más lento encontrar dónde vive cada cosa." },
    { "titulo": "Duplicar el mismo patrón visual en vez de extraer un objeto reutilizable.", "texto": "El principio central que resuelve OOCSS." }
  ]
}
```

## Ejercicios

1. Escribe el HTML y el CSS de un componente "tarjeta" usando la convención BEM (bloque, elemento, modificador).
2. Reescribe dos reglas con estilos duplicados (por ejemplo, `.comentario` y `.item-lista` con el mismo grid) usando el patrón OOCSS.
3. Escribe un bloque de comentarios de sección para organizar una hoja de estilos en Tipografía, Layout y Componentes.
4. Explica qué ventaja tienen los custom properties nativos de CSS frente a las variables de un preprocesador como Sass.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe el HTML y el CSS de una tarjeta usando la convención BEM: bloque, elemento y modificador (ejercicio 1).",
  "html": "<!-- <div class=\"tarjeta\">\n  <h3 class=\"tarjeta__titulo\">...</h3>\n  <p class=\"tarjeta__cuerpo\">...</p>\n</div> -->\n<!-- Añade también una variante tarjeta--destacada -->",
  "css": "/* Escribe aquí tus reglas BEM: .tarjeta, .tarjeta__titulo, .tarjeta--destacada... */",
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
      "titulo": "Organizing your CSS",
      "descripcion": "Guía de MDN sobre custom properties, BEM, OOCSS, otras metodologías (SMACSS, ITCSS), comentarios de sección y división en varios archivos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing",
      "etiqueta": "MDN"
    }
  ]
}
```
