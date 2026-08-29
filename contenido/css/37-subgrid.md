# Subgrid: heredar la rejilla del padre

- **Módulo:** Layout
- **Slug:** `subgrid-heredar-la-rejilla-del-padre` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [Subgrid (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid) — ver `contenido/css/TEMARIO.md` #37

---

## Qué es y para qué sirve

Un grid dentro de otro grid es, por defecto, completamente independiente — no sabe nada de las columnas o filas de su padre. Eso es un problema clásico con tarjetas: si cada tarjeta tiene su propio grid interno, un título más largo en una tarjeta empuja su descripción hacia abajo, sin afectar a las tarjetas vecinas — las descripciones quedan desalineadas entre sí. `grid-template-columns: subgrid` (o `-rows`) resuelve esto exactamente: el grid anidado deja de inventar sus propias pistas y usa las del padre.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que un grid anidado se alinee con el de fuera",
  "roles": [
    { "etiqueta": "Quien maqueta una cuadrícula de fichas", "rol": "Que títulos y descripciones se alineen entre sí", "descripcion": "Sin subgrid, cada tarjeta calcula sus filas por su cuenta — con subgrid, todas comparten las mismas líneas del grid padre." },
    { "etiqueta": "Quien construye un sistema de diseño", "rol": "Que un componente interno respete la rejilla exterior", "descripcion": "subgrid deja que un componente anidado se alinee con el layout general, sin tener que recalcular manualmente sus propias medidas." }
  ]
}
```

## El problema: un grid anidado no sabe nada del padre

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Por defecto, cada grid anidado es una isla",
  "contenido": "Poner display: grid en un elemento que ya vive dentro de otro grid no lo conecta con las pistas del padre — genera sus propias filas y columnas nuevas, sin ninguna relación con las de fuera. subgrid es la forma explícita de decir \"usa las pistas que ya existen ahí fuera, no inventes unas nuevas\"."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .padre {\n    display: grid;\n    grid-template-columns: repeat(9, 1fr);\n  }\n  .hijo {\n    display: grid;\n    grid-column: 2 / 7;\n    grid-template-columns: subgrid;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "grid-column: 2 / 7;", "nota": ".hijo abarca de la línea 2 a la línea 7 del padre — cinco pistas de columna." },
    { "fragmento": "grid-template-columns: subgrid;", "nota": "En vez de crear columnas nuevas, .hijo hereda exactamente esas cinco pistas del padre, con el mismo tamaño exacto que tienen ahí fuera. El número de pistas heredadas siempre coincide con el número de pistas que el elemento abarca." }
  ]
}
```

## Verlo en vivo: tarjetas que se alinean entre sí

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: sans-serif; width: 320px; }\n  .tarjeta { display: grid; grid-template-rows: auto auto; border: 2px solid #7c3aed; padding: 8px; gap: 4px; }\n  .titulo { font-weight: bold; }\n  .desc { color: #6b7280; font-size: 0.9em; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"tarjeta\">\n    <div class=\"titulo\">Título corto</div>\n    <div class=\"desc\">Descripción de la primera tarjeta.</div>\n  </div>\n  <div class=\"tarjeta\">\n    <div class=\"titulo\">Un título mucho más largo que ocupa dos líneas</div>\n    <div class=\"desc\">Descripción de la segunda tarjeta.</div>\n  </div>\n</div>",
  "despues": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 10px; font-family: sans-serif; width: 320px; }\n  .tarjeta { display: grid; grid-row: span 2; grid-template-rows: subgrid; border: 2px solid #7c3aed; padding: 8px; gap: 4px; }\n  .titulo { font-weight: bold; }\n  .desc { color: #6b7280; font-size: 0.9em; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"tarjeta\">\n    <div class=\"titulo\">Título corto</div>\n    <div class=\"desc\">Descripción de la primera tarjeta.</div>\n  </div>\n  <div class=\"tarjeta\">\n    <div class=\"titulo\">Un título mucho más largo que ocupa dos líneas</div>\n    <div class=\"desc\">Descripción de la segunda tarjeta.</div>\n  </div>\n</div>",
  "nota": "Dos tarjetas, con títulos de distinta longitud en los dos casos. Antes: cada tarjeta calcula sus propias filas por separado — la de la izquierda, con un título de una sola línea, empieza su descripción más arriba que la de la derecha. Después: con grid-template-rows: subgrid y grid-row: span 2, las dos tarjetas comparten las MISMAS pistas de fila del contenedor padre — la fila del título se agranda para caber el título más largo, y las dos descripciones arrancan exactamente a la misma altura."
}
```

## Gap y líneas con nombre también se heredan

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .padre {\n    display: grid;\n    grid-template-columns: repeat(9, 1fr);\n    gap: 20px;\n  }\n  .hijo {\n    display: grid;\n    grid-column: 2 / 7;\n    grid-template-columns: subgrid;\n    row-gap: 0;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "gap: 20px;", "nota": "El gap del padre se transmite automáticamente al subgrid — las mismas separaciones entre columnas se mantienen dentro de .hijo, sin declarar nada extra." },
    { "fragmento": "row-gap: 0;", "nota": "Ese gap heredado se puede sobrescribir declarando uno propio en el subgrid — aquí, row-gap: 0 anula el espaciado vertical solo dentro de .hijo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin pistas implícitas en la dimensión con subgrid",
  "contenido": "En la dimensión donde se usa subgrid, el navegador NO crea pistas implícitas de más si sobran elementos — a diferencia de un grid normal. Si hacen falta más filas o columnas de las que el elemento abarca en el padre, hay que quitar subgrid en esa dimensión concreta, o usar grid-auto-rows/grid-auto-columns."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .padre { display: grid; grid-template-columns: repeat(6, 1fr); }\n  .hijo { grid-column: 2 / 5; grid-template-columns: subgrid; display: grid; }\n</style>",
  "opciones": [
    "El hijo hereda las 6 columnas completas del padre, sin importar cuántas abarque",
    "El hijo hereda exactamente 3 columnas — las que abarca de la línea 2 a la línea 5",
    "subgrid no funciona a menos que el hijo abarque TODAS las columnas del padre"
  ],
  "correcta": 1,
  "explicacion": "El número de pistas heredadas equivale exactamente al número de pistas que el elemento abarca en el padre. De la línea 2 a la línea 5 hay tres pistas de columna (2, 3 y 4) — ni más ni menos, sin importar cuántas columnas tenga el padre en total."
}
```

## Lo que subgrid NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un grid anidado siempre se alinea automáticamente con las columnas del grid padre",
      "realidad": "Por defecto es completamente independiente — hace falta subgrid explícitamente para que herede las pistas del padre."
    },
    {
      "mito": "subgrid crea automáticamente tantas pistas implícitas como hagan falta",
      "realidad": "En la dimensión donde se usa subgrid, NO se crean pistas implícitas — si sobran elementos, hay que resolverlo de otra forma."
    },
    {
      "mito": "El gap del subgrid siempre es independiente del gap del padre",
      "realidad": "Por defecto HEREDA el gap del padre — hay que declarar un gap propio explícitamente para sobrescribirlo."
    },
    {
      "mito": "subgrid solo puede heredar columnas, nunca filas",
      "realidad": "Funciona igual para grid-template-columns y grid-template-rows, cada una por separado o las dos juntas a la vez."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar subgrid en un elemento que solo abarca una celda del padre.", "texto": "Un elemento que no abarca varias pistas no tiene nada real que heredar o subdividir." },
    { "titulo": "Esperar pistas implícitas automáticas en la dimensión subgridded.", "texto": "Ahí no se crean — hace falta quitar subgrid en esa dimensión o usar grid-auto-rows/columns." },
    { "titulo": "No darse cuenta de que el gap se hereda por defecto.", "texto": "Declarar un gap propio sin pensarlo puede duplicar sin querer el espaciado ya heredado." },
    { "titulo": "Confundir el número de línea local del subgrid con el del grid padre.", "texto": "Dentro del subgrid, la numeración de líneas siempre empieza en 1, no en el número que tenía en el padre." }
  ]
}
```

## Ejercicios

1. Escribe un elemento que abarque las columnas 2 a 6 de su grid padre y herede esas mismas columnas con `subgrid`.
2. Explica por qué un elemento con `grid-column: 3 / 4` (una sola columna) no tiene ningún sentido usarlo con `grid-template-columns: subgrid`.
3. Escribe una regla que anule el gap heredado de un subgrid, fijando uno propio de 0.
4. Explica el problema de alineación que resuelve `subgrid` en un layout de tarjetas con títulos de distinta longitud.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Haz que este elemento abarque las columnas 2 a 6 del grid padre y herede esas columnas con grid-template-columns: subgrid (ejercicio 1). Fija un gap propio de 0 que anule el heredado (ejercicio 3).",
  "html": "<div class=\"grid-padre\">\n  <div class=\"subgrid-hijo\">Contenido con subgrid</div>\n</div>",
  "css": ".grid-padre { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; border: 1px dashed #999; padding: 8px; }\n.subgrid-hijo {\n  grid-column: 2 / 7;\n  display: grid;\n  /* grid-template-columns: subgrid; */\n  background: #eee;\n}",
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
      "titulo": "Subgrid",
      "descripcion": "Referencia de MDN sobre subgrid: sintaxis, el requisito de abarcar varias pistas, herencia de gap y líneas con nombre, y la ausencia de pistas implícitas.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid",
      "etiqueta": "MDN"
    }
  ]
}
```
