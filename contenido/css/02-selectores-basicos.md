# Selectores básicos: elemento, clase, id y agrupados

- **Módulo:** Fundamentos de CSS
- **Slug:** `selectores-basicos-elemento-clase-id-y-agrupados` (autogenerado del título)
- **Orden:** 5
- **Fuentes:** [Basic CSS selectors (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) + [Selectors (web.dev)](https://web.dev/learn/css/selectors) — ver `contenido/css/TEMARIO.md` #2

---

## Qué es y para qué sirve

Un selector es la parte de una regla CSS que decide A QUIÉN se le aplica el estilo. Antes de nada, hace falta elegir bien entre tres herramientas con un alcance muy distinto: un selector de elemento afecta a todo un tipo de etiqueta, uno de clase a un grupo reutilizable, y uno de id a un único elemento irrepetible. Elegir el equivocado no rompe nada visiblemente — hasta que hace falta reutilizar ese estilo en otro sitio y no se puede.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué selector usarías según lo que quieres alcanzar",
  "roles": [
    { "etiqueta": "Selector de elemento", "rol": "Todo un tipo de etiqueta a la vez", "descripcion": "Cambia TODOS los párrafos o TODOS los h2 de golpe — el más amplio de los tres, y el más fácil de que algo se vea afectado sin querer." },
    { "etiqueta": "Selector de clase", "rol": "Un grupo reutilizable de elementos", "descripcion": "La opción por defecto para estilos que se repiten — se aplica a tantos elementos como haga falta, sea cual sea su tipo." },
    { "etiqueta": "Selector de id", "rol": "Un único elemento, y solo uno", "descripcion": "Pensado para un elemento irrepetible en la página — pero con tanta especificidad que sobreescribirlo después cuesta más de lo que ahorra." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres afectar a todas las instancias de una etiqueta",
  "contenido": "Un selector de elemento (p, h2, li) es la forma más directa cuando el estilo debe aplicarse a TODOS los elementos de ese tipo, sin excepción."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el mismo estilo se repite en elementos distintos",
  "contenido": "Ahí es donde brilla una clase: úsala en un párrafo, un span o un div por igual, sin que el tipo de etiqueta importe."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Casi nunca, para estilos reutilizables con id",
  "contenido": "Un id solo puede existir una vez por página — si el mismo estilo hace falta en más de un sitio, una clase es casi siempre la opción correcta."
}
```

## Selector de elemento y selector universal

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  p {\n    color: #334155;\n  }\n\n  strong {\n    color: #7c3aed;\n  }\n\n  * {\n    margin: 0;\n    box-sizing: border-box;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "p {\n    color: #334155;\n  }", "nota": "Sin ningún prefijo: selecciona TODOS los párrafos de la página, sin excepción." },
    { "fragmento": "strong {\n    color: #7c3aed;\n  }", "nota": "Igual de directo, pero para otra etiqueta — cada selector de elemento afecta solo al tipo que nombra." },
    { "fragmento": "* {\n    margin: 0;\n    box-sizing: border-box;\n  }", "nota": "El asterisco selecciona absolutamente todo el documento — el selector más amplio que existe. Se usa casi solo para \"resets\" al principio de una hoja de estilos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El asterisco alcanza a todo, no solo a lo que pretendías",
  "contenido": "Un * { color: red; } cambia hasta el texto de un botón nativo o un widget de terceros incrustado — resérvalo para resets deliberados al principio de la hoja, no para atajos rápidos a mitad de proyecto."
}
```

## Selector de clase

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .aviso {\n    background: #fef3c7;\n    padding: 8px;\n  }\n</style>\n\n<p class=\"aviso\">Cuidado con esto</p>\n<span class=\"aviso\">Y con esto también</span>",
  "anotaciones": [
    { "fragmento": ".aviso {\n    background: #fef3c7;\n    padding: 8px;\n  }", "nota": "El punto delante indica una clase, no un nombre de etiqueta — aquí afecta a un p Y a un span, dos tipos de elemento distintos, porque ambos comparten la misma clase." },
    { "fragmento": "class=\"aviso\"", "nota": "Cada elemento puede llevar la clase que haga falta — y la MISMA clase puede repetirse en tantos elementos como se quiera, a diferencia de un id." }
  ]
}
```

## Combinar varias clases en un mismo elemento

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .notebox { border: 4px solid #666; padding: 8px; border-radius: 6px; }\n  .notebox.warning { border-color: orange; font-weight: bold; }\n</style>\n<div class=\"notebox\">Solo la clase notebox</div>",
  "despues": "<style>\n  .notebox { border: 4px solid #666; padding: 8px; border-radius: 6px; }\n  .notebox.warning { border-color: orange; font-weight: bold; }\n</style>\n<div class=\"notebox warning\">notebox Y warning juntas</div>",
  "nota": "El mismo CSS en los dos casos. El selector .notebox.warning (sin espacio entre los dos puntos) exige las DOS clases a la vez en el mismo elemento — con solo notebox, esa regla extra ni se aplica."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .notebox.danger { border-color: red; }\n</style>\n<div class=\"danger\">Solo tengo la clase danger</div>",
  "opciones": [
    "Se aplica la regla: el borde se pone rojo",
    "NO se aplica: al elemento le falta la clase notebox",
    "Se aplica solo a medias: el borde queda de un rojo más claro"
  ],
  "correcta": 1,
  "explicacion": "El selector .notebox.danger, sin espacio entre los dos puntos, exige que el elemento tenga LAS DOS clases a la vez. Con solo danger, le falta notebox — la regla no coincide, y el borde se queda con el estilo por defecto."
}
```

## Selector de id

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  #titulo-principal {\n    color: #7c3aed;\n  }\n</style>\n\n<h1 id=\"titulo-principal\">Bienvenido</h1>",
  "anotaciones": [
    { "fragmento": "id=\"titulo-principal\"", "nota": "Un id solo puede aparecer UNA VEZ por página — es la referencia de un elemento concreto e irrepetible, no una categoría reutilizable." },
    { "fragmento": "#titulo-principal {\n    color: #7c3aed;\n  }", "nota": "El símbolo # selecciona por id. Tiene tanta especificidad que, si más adelante hace falta cambiar ese estilo desde otra regla, cuesta más trabajo del que ahorró al escribirlo." }
  ]
}
```

## Agrupar selectores con comas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h1,\n  h2,\n  .destacado {\n    font-family: system-ui, sans-serif;\n    color: #1e293b;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "h1,\n  h2,\n  .destacado {\n    font-family: system-ui, sans-serif;\n    color: #1e293b;\n  }", "nota": "Tres selectores distintos, una sola regla — evita repetir las mismas dos declaraciones tres veces seguidas." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  h1 { color: blue; }\n\n  h1, ..destacado {\n    color: red;\n  }\n</style>\n<h1>Título</h1>",
  "opciones": [
    "h1 se pone rojo, y el error de ..destacado se ignora sin más",
    "NINGUNA de las dos partes se aplica: toda la línea se descarta por el error de sintaxis",
    "El navegador corrige ..destacado a .destacado automáticamente"
  ],
  "correcta": 1,
  "explicacion": "Cuando varios selectores se agrupan con comas, un solo error de sintaxis en cualquiera de ellos invalida la regla ENTERA, no solo la parte rota. h1, ..destacado (con dos puntos, sintaxis inválida) hace que ni siquiera h1 reciba ese color: red — el h1 se queda con el azul de la regla anterior."
}
```

## Lo que un selector NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Repetir el mismo id en varios elementos funciona si visualmente se ve bien",
      "realidad": "El navegador puede \"tolerarlo\" visualmente, pero es HTML inválido — la especificación exige que cada id sea único, y repetirlo puede dar comportamientos extraños en JavaScript o en herramientas de accesibilidad."
    },
    {
      "mito": "El asterisco (*) es solo para casos muy raros, casi nunca hace falta",
      "realidad": "Es la base de casi cualquier \"CSS reset\" real — quitar los márgenes por defecto de todos los elementos antes de empezar a maquetar es un uso legítimo y frecuente."
    },
    {
      "mito": ".notebox.danger selecciona cualquier elemento con notebox O con danger",
      "realidad": "Selecciona solo los que tienen LAS DOS clases a la vez — para \"o\" hace falta la coma, no escribirlas pegadas."
    },
    {
      "mito": "Los nombres de clase pueden empezar por un número, como .1ra-columna",
      "realidad": "No es válido — un nombre de clase no puede empezar con un dígito, aunque el resto del nombre sí puede llevarlos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar un id para un estilo que se repite en más de un sitio.", "texto": "Un id solo puede existir una vez por página — si el mismo estilo hace falta en varios elementos, la clase es la herramienta correcta." },
    { "titulo": "Un error de sintaxis en un selector agrupado invalida toda la regla.", "texto": "h1, ..clase { } descarta la regla entera, incluido el h1 que estaba perfectamente escrito." },
    { "titulo": "Escribir .clase1 .clase2 pensando que exige las dos en el mismo elemento.", "texto": "Con un espacio de por medio significa \"clase2 dentro de clase1\", no \"las dos juntas\" — para eso hace falta pegarlas sin espacio: .clase1.clase2." },
    { "titulo": "Abusar del selector universal para atajos rápidos, no resets deliberados.", "texto": "* { color: red; } cambia hasta lo que no tenías intención de tocar — texto de botones nativos, o de un widget de terceros incrustado." }
  ]
}
```

## Ejercicios

1. Escribe un selector de elemento que ponga en cursiva todos los `<em>` de una página.
2. Escribe una clase .tarjeta y aplícala a un div y a un article distintos — comprueba que el mismo estilo llega a los dos.
3. Combina dos clases en un mismo elemento (como .notebox.warning) y escribe una regla que solo se aplique cuando las dos están presentes a la vez.
4. Encuentra el error en `h1, ..especial { color: red; }` y explica qué pasaría con el h1 si esa línea se quedara así en producción.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un selector de elemento para los <em> (ejercicio 1). Crea una clase .tarjeta y aplícala al div y al article de abajo (ejercicio 2). Prueba también a combinar dos clases a la vez, como .notebox.warning (ejercicio 3).",
  "html": "<p>Esto es <em>importante</em>.</p>\n<div class=\"tarjeta\">Tarjeta en un div</div>\n<article class=\"tarjeta\">Tarjeta en un article</article>\n<div class=\"notebox warning\">Aviso combinado</div>",
  "css": "/* Escribe aquí tus selectores */",
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
      "titulo": "Basic CSS selectors",
      "descripcion": "Guía de referencia de MDN sobre selectores de elemento, clase, id, universal, y por qué un error en un selector agrupado invalida toda la regla.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_selectors",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Selectors",
      "descripcion": "Curso de web.dev sobre selectores básicos y de atributo, con la nota de que las clases no pueden empezar por un número.",
      "url": "https://web.dev/learn/css/selectors",
      "etiqueta": "web.dev"
    }
  ]
}
```
