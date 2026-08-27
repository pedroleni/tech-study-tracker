# Combinadores: descendiente, hijo directo y hermanos

- **Módulo:** Fundamentos de CSS
- **Slug:** `combinadores-descendiente-hijo-directo-y-hermanos` (autogenerado del título)
- **Orden:** 25
- **Fuentes:** [Combinators (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Combinators) — ver `contenido/css/TEMARIO.md` #6

---

## Qué es y para qué sirve

Un combinador une dos selectores para describir una relación entre elementos en el HTML — no "todos los párrafos", sino "los párrafos que están dentro de esta caja" o "el párrafo que viene justo después de este título". Hay cuatro: el espacio (descendiente, cualquier profundidad), `>` (hijo directo), `+` (hermano inmediato) y `~` (cualquier hermano posterior). Cada uno responde a una pregunta distinta sobre dónde vive un elemento respecto a otro.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de seleccionar por relación, no solo por etiqueta",
  "roles": [
    { "etiqueta": "Quien estiliza contenido de un CMS", "rol": "Alcanzar estructura sin poder añadir clases", "descripcion": "Cuando el HTML lo genera otra herramienta, .contenido > p o h2 + p llegan a la estructura exacta sin depender de que alguien más añada una clase." },
    { "etiqueta": "Quien maqueta listas y tablas anidadas", "rol": "Distinguir el nivel superior de los niveles anidados", "descripcion": "ul > li alcanza solo los elementos de la lista de primer nivel — una lista anidada dentro de un li no se ve afectada." },
    { "etiqueta": "Quien da estilo a texto editorial", "rol": "Distinguir el párrafo inmediato de todos los siguientes", "descripcion": "h1 + p y h1 ~ p responden preguntas distintas: \"el primero después\" frente a \"todos los que vengan después\"." }
  ]
}
```

## Los cuatro combinadores, de un vistazo

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuatro símbolos, cuatro relaciones distintas",
  "contenido": "selector1 selector2 (espacio) = descendiente, a cualquier profundidad. selector1 > selector2 = hijo directo, un solo nivel. selector1 + selector2 = el hermano que viene INMEDIATAMENTE después. selector1 ~ selector2 = cualquier hermano que venga después, aunque haya otros elementos por medio."
}
```

## Descendiente: cualquier nivel de profundidad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .box p {\n    color: red;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".box p {\n    color: red;\n  }", "nota": "El espacio entre .box y p es el combinador descendiente: selecciona cualquier <p> que esté DENTRO de .box, sin importar cuántos elementos haya de por medio — un div anidado, otro div dentro de ese, da igual." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div class=\"box\" style=\"border: 1px dashed #9ca3af; padding: 12px; margin-bottom: 12px;\">\n  <p>Texto dentro de .box</p>\n</div>\n<p>Texto fuera de .box</p>",
  "despues": "<style>\n  .box p {\n    color: #dc2626;\n    font-weight: bold;\n  }\n</style>\n<div class=\"box\" style=\"border: 1px dashed #9ca3af; padding: 12px; margin-bottom: 12px;\">\n  <p>Texto dentro de .box</p>\n</div>\n<p>Texto fuera de .box</p>",
  "nota": "Mismo HTML en los dos casos. .box p selecciona solo el párrafo que está dentro de la caja punteada — el segundo párrafo, que está fuera, nunca coincide por más que también sea un <p>."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  ul li { color: red; }\n</style>\n<ul>\n  <li>Uno\n    <ol><li>Uno punto uno</li></ol>\n  </li>\n</ul>",
  "opciones": [
    "Solo \"Uno\" se pone rojo",
    "\"Uno\" y \"Uno punto uno\" se ponen rojos, aunque el segundo esté dentro de un ol anidado",
    "Ninguno se pone rojo porque el li anidado está dentro de un ol, no directamente de un ul"
  ],
  "correcta": 1,
  "explicacion": "ul li es un combinador descendiente: selecciona cualquier li que tenga un ul como ancestro, sin importar cuántos niveles de profundidad haya — el ol anidado no rompe la relación de descendencia, solo añade un nivel más."
}
```

## Hijo directo: un solo nivel, ni uno más

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul>\n  <li>Elemento 1</li>\n  <li>Elemento 2\n    <ol>\n      <li>Sub 1</li>\n      <li>Sub 2</li>\n    </ol>\n  </li>\n</ul>",
  "despues": "<style>\n  ul > li {\n    border-top: 3px solid #dc2626;\n    padding-top: 4px;\n  }\n</style>\n<ul>\n  <li>Elemento 1</li>\n  <li>Elemento 2\n    <ol>\n      <li>Sub 1</li>\n      <li>Sub 2</li>\n    </ol>\n  </li>\n</ul>",
  "nota": "ul > li solo alcanza los li que son hijos DIRECTOS de ese ul — \"Elemento 1\" y \"Elemento 2\" reciben el borde rojo. \"Sub 1\" y \"Sub 2\" no lo reciben: son hijos directos del ol anidado, no del ul de fuera."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué > importa aquí y el espacio no serviría igual",
  "contenido": "Si el selector fuera ul li (descendiente) en vez de ul > li (hijo directo), \"Sub 1\" y \"Sub 2\" también recibirían el borde rojo — porque siguen siendo descendientes del ul, solo que a través del ol. > es la herramienta exacta cuando quieres frenar el alcance en un único nivel."
}
```

## Hermano inmediato: el que viene justo después

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<h1>Título</h1>\n<p>Primer párrafo, justo después del título.</p>\n<p>Segundo párrafo, no es el hermano inmediato del h1.</p>",
  "despues": "<style>\n  h1 + p {\n    font-weight: bold;\n    background-color: #333333;\n    color: white;\n    padding: 0.5em;\n  }\n</style>\n<h1>Título</h1>\n<p>Primer párrafo, justo después del título.</p>\n<p>Segundo párrafo, no es el hermano inmediato del h1.</p>",
  "nota": "h1 + p solo alcanza al primer párrafo, el que está pegado justo después del h1 en el HTML. El segundo párrafo es hermano del h1 también, pero no es el INMEDIATAMENTE siguiente — se queda sin estilo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  h1 + p { font-weight: bold; }\n</style>\n<h1>Título</h1>\n<h2>Subtítulo</h2>\n<p>Este párrafo viene después del h2, no del h1.</p>",
  "opciones": [
    "El párrafo se pone en negrita: sigue siendo el primero después del h1 en la página",
    "El párrafo NO se pone en negrita: el h2 se interpone entre el h1 y el p",
    "Se pone en negrita solo la primera palabra del párrafo"
  ],
  "correcta": 1,
  "explicacion": "+ exige que el segundo selector sea el hermano INMEDIATAMENTE siguiente al primero. En cuanto aparece cualquier otro elemento entre medio — aquí, el h2 — la relación se rompe y el selector deja de coincidir, aunque el párrafo siga estando \"después\" del h1 en sentido amplio."
}
```

## Cualquier hermano posterior, con o sin nada de por medio

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<h1>Título</h1>\n<p>Primer párrafo.</p>\n<div style=\"padding: 4px; color: #6b7280;\">Un div en medio, sin relación directa</div>\n<p>Segundo párrafo.</p>",
  "despues": "<style>\n  h1 ~ p {\n    font-weight: bold;\n    background-color: #333333;\n    color: white;\n    padding: 0.5em;\n  }\n</style>\n<h1>Título</h1>\n<p>Primer párrafo.</p>\n<div style=\"padding: 4px; color: #6b7280;\">Un div en medio, sin relación directa</div>\n<p>Segundo párrafo.</p>",
  "nota": "h1 ~ p alcanza a LOS DOS párrafos, aunque haya un div entre ellos. A diferencia de +, ~ no exige adyacencia inmediata — solo que ambos sean hermanos y que el p venga después del h1 en algún punto."
}
```

## Encadenar varios combinadores

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  article > p + img ~ div {\n    border: 2px solid teal;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "article >", "nota": "Primer paso: un elemento que sea hijo directo de article..." },
    { "fragmento": "p +", "nota": "...que sea un p, y justo después de ese p..." },
    { "fragmento": "img ~ div", "nota": "...una img inmediatamente adyacente, y finalmente cualquier div que venga después de esa img, sin importar qué haya entre medio. Los combinadores se leen de izquierda a derecha, cada uno acotando un poco más la relación." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuanto más atado a la estructura, más frágil",
  "contenido": "Un selector como article > p + img ~ div funciona, pero se rompe en cuanto alguien reordena el HTML. La propia guía de MDN lo advierte: a menudo es mejor crear una clase sencilla y aplicarla al elemento en cuestión. Los combinadores brillan sobre todo cuando de verdad no puedes tocar el HTML — contenido de un CMS, una librería externa — no como sustituto habitual de una clase."
}
```

## Lo que un combinador NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El combinador descendiente (espacio) solo selecciona hijos directos",
      "realidad": "Selecciona a cualquier profundidad — un nieto, un bisnieto, da igual. Para restringir a un único nivel hace falta > específicamente, no el espacio."
    },
    {
      "mito": "+ selecciona todos los hermanos que vienen después de un elemento",
      "realidad": "+ solo selecciona el hermano INMEDIATAMENTE siguiente, uno solo. Para todos los que vengan después, sin importar cuántos, hace falta ~."
    },
    {
      "mito": "+ y ~ hacen lo mismo, solo cambia el símbolo",
      "realidad": "No son intercambiables: + exige adyacencia inmediata (se rompe si algo se interpone), ~ acepta cualquier hermano posterior aunque haya otros elementos por medio."
    },
    {
      "mito": "Los combinadores solo funcionan entre dos nombres de etiqueta",
      "realidad": "Se combinan con cualquier tipo de selector a ambos lados — clases, atributos, pseudo-clases: .aviso + [type=\"submit\"] es perfectamente válido."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el espacio (descendiente) con > (hijo directo) al copiar un selector.", "texto": "El espacio alcanza cualquier profundidad; > se detiene en el primer nivel. Cambiar uno por otro sin querer cambia silenciosamente qué elementos coinciden." },
    { "titulo": "Esperar que + seleccione más de un hermano.", "texto": "+ solo selecciona el primero inmediatamente siguiente — para varios hermanos posteriores hace falta ~, no repetir +." },
    { "titulo": "Insertar un elemento nuevo entre dos selectores unidos con + sin darse cuenta de que rompe el selector.", "texto": "h1 + p deja de coincidir en cuanto aparece cualquier otro elemento — un h2, un div — entre el h1 y el p, aunque el párrafo siga estando \"cerca\"." },
    { "titulo": "Encadenar demasiados combinadores atados a la estructura exacta del HTML.", "texto": "Un selector como article > p + img ~ div es frágil ante cualquier cambio de marcado — cuando se pueda tocar el HTML, una clase suele ser la opción más robusta." }
  ]
}
```

## Ejercicios

1. Escribe un selector con el combinador descendiente que ponga en cursiva cualquier `<em>` dentro de un `<blockquote>`, sin importar la profundidad a la que esté anidado.
2. Escribe un selector con `>` que aplique un margen superior solo a los `<li>` que sean hijos directos de un `<ol>` concreto, sin afectar a una lista anidada dentro de él.
3. Usa `+` para poner un borde superior únicamente al primer párrafo que sigue inmediatamente a un `<h2>`.
4. Explica, con un ejemplo de HTML, por qué `h2 ~ p` puede seleccionar más elementos que `h2 + p` en el mismo documento.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Combinators",
      "descripcion": "Guía de MDN sobre los cuatro combinadores de CSS, con ejemplos comparados y advertencias sobre selectores demasiado atados a la estructura del HTML.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Combinators",
      "etiqueta": "MDN"
    }
  ]
}
```
