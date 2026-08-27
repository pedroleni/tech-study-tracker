# Capas de cascada (@layer)

- **Módulo:** Fundamentos de CSS
- **Slug:** `capas-de-cascada-layer` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Cascade layers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) — ver `contenido/css/TEMARIO.md` #11

---

## Qué es y para qué sirve

Cuando el CSS de un proyecto viene de varias fuentes — un reset, un framework, componentes propios, utilidades — la especificidad se convierte en una guerra: cada equipo sube un poco más la suya para ganarle a la del anterior, hasta llegar a `!important` por todas partes. `@layer` resuelve esto de raíz: permite decidir qué HOJA ENTERA de estilos pesa más que otra, sin que la especificidad de cada selector individual tenga que competir.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita priorizar hojas enteras, no selectores sueltos",
  "roles": [
    { "etiqueta": "Quien integra un framework externo", "rol": "Bajar su precedencia sin tocar su CSS", "descripcion": "Importar Bootstrap o una librería de componentes en su propia capa hace que hasta sus selectores más específicos pesen menos que el CSS propio del proyecto, sin escribir un solo !important." },
    { "etiqueta": "Quien mantiene un sistema de diseño", "rol": "Ordenar reset, base, componentes y utilidades", "descripcion": "Declarar el orden de las capas por adelantado deja explícito qué gana a qué, en vez de que dependa de qué archivo se cargó último o de una guerra de especificidad." },
    { "etiqueta": "Quien depura CSS con muchos !important", "rol": "Reemplazar esa escalada por un orden explícito", "descripcion": "Con capas, ganar una guerra de prioridad ya no requiere subir la especificidad — basta con declarar la capa correcta en el orden correcto." }
  ]
}
```

## El orden de las capas manda antes que la especificidad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Prioridad de hojas completas, no de selectores",
  "contenido": "Las capas nombradas con @layer se comparan PRIMERO por su orden de creación — la capa declarada más tarde gana, sin importar qué tan específico sea el selector dentro de cada una. La especificidad solo se usa para desempatar DENTRO de una misma capa, nunca entre capas distintas."
}
```

## Dos formas de escribir @layer

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @layer reset, base, componentes, utilidades;\n\n  @layer base {\n    body {\n      margin: 0;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@layer reset, base, componentes, utilidades;", "nota": "Forma de declaración: fija el orden completo de las cuatro capas por adelantado, sin asignarles estilos todavía. Es la forma recomendada — deja el orden de prioridad visible de un vistazo, al principio del archivo." },
    { "fragmento": "@layer base {\n    body {\n      margin: 0;\n    }\n  }", "nota": "Forma de bloque: añade estilos a la capa base. Si base ya existía (como aquí, por la declaración de arriba), no crea una capa nueva ni cambia su posición — solo le agrega estas reglas." }
  ]
}
```

## Verlo en vivo: una capa posterior gana a un id

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p id=\"titulo\" style=\"font-family: sans-serif;\">Texto de prueba</p>",
  "despues": "<style>\n  @layer base, override;\n\n  @layer base {\n    #titulo {\n      color: #dc2626;\n    }\n  }\n\n  @layer override {\n    p {\n      color: #2563eb;\n    }\n  }\n</style>\n<p id=\"titulo\" style=\"font-family: sans-serif;\">Texto de prueba</p>",
  "nota": "#titulo (especificidad 1-0-0, un id) vive en la capa base, declarada PRIMERO. p (especificidad 0-0-1, solo un elemento) vive en override, declarada DESPUÉS. El texto se pone azul, no rojo: la capa override tiene más precedencia, y eso pesa más que la especificidad mucho mayor del id."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @layer primero, segundo;\n\n  @layer primero {\n    #especial { color: red; }\n  }\n  @layer segundo {\n    p { color: blue; }\n  }\n</style>\n<p id=\"especial\">Texto</p>",
  "opciones": [
    "Rojo: el id tiene más especificidad que un simple elemento p",
    "Azul: la capa segundo tiene más precedencia que primero, sin importar la especificidad dentro de cada una",
    "Ninguno de los dos: las capas con nombre no afectan a elementos que tienen un id"
  ],
  "correcta": 1,
  "explicacion": "Entre capas distintas, la especificidad de los selectores no se compara en absoluto — solo importa el orden de las capas. segundo fue declarada después de primero, así que gana pase lo que pase dentro de cada una."
}
```

## Lo que no está en ninguna capa gana a todo lo que sí lo está

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  @layer base, override;\n\n  @layer base {\n    p { color: #dc2626; }\n  }\n  @layer override {\n    p { color: #2563eb; }\n  }\n</style>\n<p>Texto de prueba</p>",
  "despues": "<style>\n  @layer base, override;\n\n  @layer base {\n    p { color: #dc2626; }\n  }\n  @layer override {\n    p { color: #2563eb; }\n  }\n  p { color: #16a34a; }\n</style>\n<p>Texto de prueba</p>",
  "nota": "Antes: entre las dos capas, override gana normalmente — el texto es azul. Después: se añade una sola regla p { color: green; } SIN ninguna capa — y esa gana a las dos, aunque override sea la capa de mayor precedencia. Para reglas normales, lo que no está en ninguna capa siempre gana a lo que sí lo está."
}
```

## !important invierte el orden

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Con !important, la primera capa declarada gana",
  "contenido": "Para reglas normales, la capa declarada más tarde tiene más precedencia. Con !important, ese orden se INVIERTE por completo: la primera capa declarada pasa a ganar. Es la misma lógica que ya se aplica al orden de aparición dentro de una hoja de estilos clásica — !important no solo salta la especificidad, también invierte el orden de las capas."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  @layer primero, segundo;\n\n  @layer primero {\n    p { color: #dc2626; }\n  }\n  @layer segundo {\n    p { color: #2563eb; }\n  }\n</style>\n<p>Texto de prueba</p>",
  "despues": "<style>\n  @layer primero, segundo;\n\n  @layer primero {\n    p { color: #dc2626 !important; }\n  }\n  @layer segundo {\n    p { color: #2563eb !important; }\n  }\n</style>\n<p>Texto de prueba</p>",
  "nota": "Antes (sin !important): segundo gana por ser la capa declarada después — el texto es azul. Después: el ÚNICO cambio es añadir !important a las dos reglas — y el resultado se invierte a rojo, porque con !important la PRIMERA capa declarada (primero) pasa a tener más precedencia."
}
```

## Repetir el nombre de una capa no la reordena

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @layer base {\n    h1 { font-size: 2rem; }\n  }\n\n  @layer base {\n    h1 { color: navy; }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@layer base {\n    h1 { color: navy; }\n  }", "nota": "Este segundo bloque @layer base no crea una capa nueva ni cambia su posición en el orden — añade esta regla a la MISMA capa base ya creada arriba. El orden de una capa queda fijado la primera vez que se menciona su nombre, en cualquier forma (declaración o bloque), y no se puede cambiar después." }
  ]
}
```

## Lo que las capas de cascada NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una capa declarada después siempre gana, sin excepciones",
      "realidad": "Eso es cierto solo para reglas normales. Con !important el orden se invierte por completo: la primera capa declarada pasa a ganar."
    },
    {
      "mito": "Un id dentro de una capa sigue ganando a un elemento de una capa posterior, por especificidad",
      "realidad": "La precedencia entre capas se decide ANTES que la especificidad — la especificidad de un selector solo desempata dentro de su propia capa, nunca entre capas distintas."
    },
    {
      "mito": "Un estilo sin capa (fuera de cualquier @layer) tiene la precedencia más baja, por no pertenecer a ninguna",
      "realidad": "Justo lo contrario para reglas normales: un estilo sin capa gana a CUALQUIER estilo dentro de una capa, sin importar cuál sea o cuándo se haya declarado."
    },
    {
      "mito": "Escribir @layer nombre { } varias veces crea una capa nueva cada vez",
      "realidad": "Si el nombre ya existe, esas reglas se añaden a la misma capa — no se crea una nueva ni cambia su posición en el orden."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar ganarle a otra capa subiendo la especificidad dentro de la propia.", "texto": "No funciona: el orden de capas se decide antes de mirar la especificidad — hace falta reordenar las capas, no el selector." },
    { "titulo": "Olvidar que los estilos sin capa ganan a todo lo que sí está en una.", "texto": "Un reset importado dentro de una capa nunca podrá competir con CSS suelto fuera de cualquier @layer, por muy tarde que se declare esa capa." },
    { "titulo": "No declarar el orden de las capas por adelantado.", "texto": "Sin la forma @layer a, b, c; al principio, el orden depende de qué archivo define cada capa primero — mucho más difícil de mantener y de leer." },
    { "titulo": "Usar !important dentro de una capa sin recordar que ahí el orden se invierte.", "texto": "La capa que parecía \"ganar\" para reglas normales pasa a perder en cuanto se añade !important a la mezcla." }
  ]
}
```

## Ejercicios

1. Declara tres capas llamadas `reset`, `componentes` y `utilidades`, en ese orden de precedencia, usando la forma de declaración.
2. Escribe dos reglas en capas distintas que compitan por el mismo elemento, y explica cuál gana sin mirar la especificidad de cada selector.
3. Explica qué pasa si conviertes las dos reglas del ejercicio anterior en `!important` — ¿cambia el ganador? ¿Por qué?
4. Explica por qué un estilo `p { color: red !important; }` dentro de la PRIMERA capa declarada le gana a un `p { color: blue !important; }` dentro de la SEGUNDA capa declarada — aunque para reglas normales sería justo al revés.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Cascade layers",
      "descripcion": "Guía de MDN sobre @layer: sintaxis completa, orden de precedencia, comportamiento de los estilos sin capa y la inversión de orden con !important.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers",
      "etiqueta": "MDN"
    }
  ]
}
```
