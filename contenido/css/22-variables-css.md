# Variables CSS (custom properties)

- **Módulo:** Color, fondos y bordes
- **Slug:** `variables-css-custom-properties` (autogenerado del título)
- **Orden:** 105
- **Fuentes:** [Custom properties (web.dev)](https://web.dev/learn/css/custom-properties) — ver `contenido/css/TEMARIO.md` #22

---

## Qué es y para qué sirve

Un color de marca repetido en veinte sitios distintos del CSS significa veinte cambios manuales el día que ese color cambie. Una custom property lo guarda una sola vez — `--color-marca: #7c3aed;` — y cada `var(--color-marca)` del archivo lee ese mismo valor. Cambiar la declaración una vez actualiza los veinte usos a la vez.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita un solo lugar de verdad para un valor",
  "roles": [
    { "etiqueta": "Quien mantiene un sistema de diseño", "rol": "Un solo lugar para cada color, espaciado o tamaño", "descripcion": "Cambiar --color-marca en un sitio actualiza todos los usos de var(--color-marca) del proyecto, sin buscar y reemplazar." },
    { "etiqueta": "Quien construye temas o modo oscuro", "rol": "Redefinir un grupo de valores según el contexto", "descripcion": "Una clase .tema-oscuro puede redefinir las mismas variables que usa el resto del sitio, sin duplicar ni una sola regla de layout." },
    { "etiqueta": "Quien actualiza estilos con JavaScript", "rol": "Cambiar un valor de CSS desde fuera de la hoja de estilos", "descripcion": "A diferencia de una variable de Sass, una custom property existe de verdad en el navegador — se puede leer y modificar con JavaScript en tiempo real." }
  ]
}
```

## Declarar y usar: el doble guion es obligatorio

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  :root {\n    --color-marca: dodgerblue;\n    --base: 1em;\n  }\n\n  .titulo {\n    font-size: calc(2 * var(--base));\n    color: var(--color-marca);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ":root {\n    --color-marca: dodgerblue;\n    --base: 1em;\n  }", "nota": "El doble guion al principio del nombre es obligatorio — evita que una custom property choque con el nombre de una propiedad real de CSS. Declararlas en :root las hace disponibles en toda la página." },
    { "fragmento": "font-size: calc(2 * var(--base));\n    color: var(--color-marca);", "nota": "var(--nombre) lee el valor de la variable donde se necesite. Se puede combinar con calc() y cualquier otra función de CSS, como si fuera un valor escrito a mano." }
  ]
}
```

## Un cambio, varios lugares actualizados a la vez

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  :root { --color-marca: #7c3aed; }\n  h3 { color: var(--color-marca); font-family: sans-serif; }\n  button { background: var(--color-marca); color: white; border: none; padding: 8px 16px; border-radius: 6px; }\n  .linea { border-left: 4px solid var(--color-marca); padding-left: 8px; font-family: sans-serif; }\n</style>\n<h3>Título con --color-marca</h3>\n<button>Botón</button>\n<div class=\"linea\">Línea con borde</div>",
  "despues": "<style>\n  :root { --color-marca: #16a34a; }\n  h3 { color: var(--color-marca); font-family: sans-serif; }\n  button { background: var(--color-marca); color: white; border: none; padding: 8px 16px; border-radius: 6px; }\n  .linea { border-left: 4px solid var(--color-marca); padding-left: 8px; font-family: sans-serif; }\n</style>\n<h3>Título con --color-marca</h3>\n<button>Botón</button>\n<div class=\"linea\">Línea con borde</div>",
  "nota": "El único cambio entre antes y después es UNA línea: --color-marca pasa de #7c3aed a #16a34a en :root. El título, el botón y el borde de la línea — tres propiedades distintas, en tres elementos distintos — cambian de morado a verde a la vez, sin haber tocado ninguna de esas tres reglas."
}
```

## El fallback de var(): solo si la variable no existe

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    color: var(--no-declarada, gray);\n  }\n\n  .b {\n    background: var(--principal, var(--secundario, white));\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    color: var(--no-declarada, gray);\n  }", "nota": "Si --no-declarada nunca se definió en ningún selector aplicable, se usa gray — el segundo argumento de var() es exactamente para este caso." },
    { "fragmento": ".b {\n    background: var(--principal, var(--secundario, white));\n  }", "nota": "Los fallbacks se pueden encadenar: si --principal no existe, prueba --secundario; si tampoco existe esa, usa white como último recurso." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"color: var(--no-existe, gray); font-family: sans-serif;\">Texto con var() y fallback</p>",
  "despues": "<div style=\"--no-existe: crimson;\">\n  <p style=\"color: var(--no-existe, gray); font-family: sans-serif;\">Texto con var() y fallback</p>\n</div>",
  "nota": "El mismo color: var(--no-existe, gray) en los dos casos. Antes, --no-existe no está declarada en ningún sitio — se usa el fallback, gray. Después, el div envolvente SÍ declara --no-existe: crimson — el texto hereda esa declaración y usa crimson, ignorando el fallback."
}
```

## Redefinir una variable solo en una parte de la página

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  :root { --acento: #7c3aed; }\n  .caja { border: 3px solid var(--acento); padding: 12px; font-family: sans-serif; margin-bottom: 8px; }\n</style>\n<div class=\"caja\">Caja normal</div>\n<div class=\"caja\">Otra caja normal</div>",
  "despues": "<style>\n  :root { --acento: #7c3aed; }\n  .tema-oscuro { --acento: #f97316; }\n  .caja { border: 3px solid var(--acento); padding: 12px; font-family: sans-serif; margin-bottom: 8px; }\n</style>\n<div class=\"caja\">Caja normal</div>\n<div class=\"caja tema-oscuro\">Caja con tema-oscuro</div>",
  "nota": "En :root, --acento sigue siendo #7c3aed en los dos casos. Después, se añade una regla .tema-oscuro { --acento: #f97316; } y esa clase a la SEGUNDA caja. Solo esa caja cambia a naranja — la primera, sin la clase, conserva el morado heredado de :root. La redefinición solo afecta a ese elemento y a sus descendientes."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un valor inválido no activa el fallback",
  "contenido": "El fallback de var() solo entra en juego si la variable NO EXISTE en absoluto. Si existe pero su valor es inválido para la propiedad donde se usa (font-size: var(--tamano) con --tamano: rojo, por ejemplo), esa declaración concreta falla — el navegador usa el valor heredado o el valor inicial de la propiedad, nunca el fallback de var()."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  :root { --tamano: not-a-real-size; }\n  p { font-size: var(--tamano, 20px); }\n</style>\n<p>Texto de prueba</p>",
  "opciones": [
    "El texto mide 20px: se usa el valor de respaldo, porque --tamano es inválido",
    "El texto usa el tamaño heredado o el inicial de font-size: el fallback NO se aplica, porque --tamano SÍ está definida",
    "La página deja de cargar: un valor inválido en una custom property detiene todo el CSS"
  ],
  "correcta": 1,
  "explicacion": "El fallback de var() solo se usa cuando la variable no existe en absoluto. --tamano SÍ existe, aunque su valor no tenga sentido como font-size — por eso esa declaración concreta falla, y font-size cae al valor heredado o inicial, nunca al 20px del fallback."
}
```

## No sirven como condición, solo como valor

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Funcionan como valores, no como condiciones",
  "contenido": "Una custom property se puede usar como el VALOR de cualquier propiedad — color, width, padding, lo que sea. No se puede usar dentro de un selector, ni dentro de la condición de un @media (@media (min-width: var(--punto)) no funciona). Sí se puede REDEFINIR una variable dentro del cuerpo de una media query, para que el resto del CSS que ya usa var() se adapte automáticamente al cambiar de tamaño de pantalla."
}
```

## Lo que las custom properties NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El fallback de var() se usa siempre que el valor de la variable no tenga sentido",
      "realidad": "Solo se usa si la variable NO EXISTE en absoluto — si existe pero es inválida, la propiedad falla y cae al valor heredado o inicial, no al fallback."
    },
    {
      "mito": "Las custom properties se pueden usar dentro de la condición de un @media",
      "realidad": "Solo funcionan como valores de propiedades — no se pueden usar dentro de selectores ni de la condición de una media query."
    },
    {
      "mito": "Declarar una variable en :root la hace disponible en todas partes sin excepción",
      "realidad": "Hereda como cualquier propiedad normal — un selector más específico puede redefinirla, y esa redefinición solo afecta a ese elemento y a sus descendientes."
    },
    {
      "mito": "Las custom properties son como las variables de Sass, se resuelven al compilar",
      "realidad": "Son valores reales en tiempo de ejecución dentro del navegador — se pueden leer y cambiar con JavaScript, algo que una variable de Sass nunca podría hacer una vez compilada."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el doble guion al declarar o usar una variable.", "texto": "color: var(nombre), sin --, no es una custom property válida — hace falta var(--nombre)." },
    { "titulo": "Confundir \"variable no definida\" con \"variable con valor inválido\".", "texto": "Solo la primera activa el fallback de var() — la segunda hace que la propiedad caiga a su valor heredado o inicial." },
    { "titulo": "Redefinir una variable en un selector muy específico esperando que afecte a toda la página.", "texto": "Solo afecta a ese elemento y a sus descendientes — el resto de la página sigue usando la declaración más general." },
    { "titulo": "Intentar usar una custom property directamente en la condición de un @media.", "texto": "Solo funciona como valor de una propiedad — no dentro de la condición de la media query en sí." }
  ]
}
```

## Ejercicios

1. Declara una variable `--espaciado` en `:root` y úsala en el `padding` de tres elementos distintos.
2. Escribe una regla que use `var(--color-alerta, orange)` y explica en qué caso exacto se usaría el naranja de respaldo.
3. Escribe dos reglas: una que declare `--tema` en `:root`, y otra que la redefina solo dentro de una clase `.oscuro` — explica qué elementos verían el nuevo valor.
4. Explica la diferencia real entre que una variable no exista y que exista pero tenga un valor inválido, en relación con el fallback de `var()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Declara --espaciado en :root y úsala en el padding de las tres cajas (ejercicio 1). Escribe una regla que use var(--color-alerta, orange) — fíjate que se usa el naranja porque la variable no existe (ejercicio 2). Redefine --tema solo dentro de .oscuro y observa qué cajas cambian (ejercicio 3).",
  "html": "<div class=\"caja\">Caja 1</div>\n<div class=\"caja\">Caja 2</div>\n<div class=\"caja alerta\">Alerta</div>\n<div class=\"oscuro\"><div class=\"caja\">Caja dentro de .oscuro</div></div>",
  "css": ":root { --tema: #f4f1ea; }\n.caja { background: var(--tema); margin-bottom: 8px; /* añade aquí --espaciado */ }\n.alerta { border: 2px solid var(--color-alerta, orange); }\n.oscuro { /* redefine --tema aquí */ }",
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
      "titulo": "Custom properties",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre variables CSS: sintaxis, herencia, alcance, fallback y el comportamiento ante valores inválidos.",
      "url": "https://web.dev/learn/css/custom-properties",
      "etiqueta": "web.dev"
    }
  ]
}
```
