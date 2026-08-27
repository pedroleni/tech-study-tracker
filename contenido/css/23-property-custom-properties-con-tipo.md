# @property: registrar custom properties con tipo

- **Módulo:** Color, fondos y bordes
- **Slug:** `property-registrar-custom-properties-con-tipo` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [@property (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property) — ver `contenido/css/TEMARIO.md` #23

---

## Qué es y para qué sirve

`--color: rebeccapurple;` es, para el navegador, una cadena de texto sin tipo — no sabe si es un color, un número o una palabra cualquiera. Eso significa que no se puede animar de forma suave entre dos valores: el navegador no sabe cómo "interpolar" entre dos cadenas de texto. `@property` registra una custom property con un TIPO real (`<color>`, `<length>`, `<number>`...), un comportamiento de herencia explícito, y un valor inicial garantizado — y eso, entre otras cosas, es lo que hace posible animarla.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita una custom property con tipo real",
  "roles": [
    { "etiqueta": "Quien anima una custom property", "rol": "Que el navegador sepa interpolar entre dos valores", "descripcion": "Una --progress: 25% normal salta directamente a 100% sin transición — registrada con @property y syntax: \"<percentage>\", anima suavemente entre los dos." },
    { "etiqueta": "Quien tipa un sistema de diseño", "rol": "Detectar un valor inválido antes de producción", "descripcion": "syntax: \"<color>\" rechaza un valor que no sea un color real — una custom property normal aceptaría cualquier cadena de texto sin quejarse." },
    { "etiqueta": "Quien necesita un valor garantizado", "rol": "Que la propiedad siempre tenga un valor real", "descripcion": "initial-value asegura un valor real desde el principio — una custom property normal, sin asignar, simplemente no existe hasta que algo la define." }
  ]
}
```

## Los tres descriptores

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @property --myColor {\n    syntax: \"<color>\";\n    inherits: true;\n    initial-value: rebeccapurple;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "syntax: \"<color>\";", "nota": "Define qué TIPO de valor acepta esta custom property — aquí, cualquier color válido. Es obligatorio: sin syntax, toda la regla @property se ignora." },
    { "fragmento": "inherits: true;", "nota": "Decide explícitamente si la propiedad hereda de un elemento padre a sus hijos. También obligatorio — a diferencia de una propiedad normal de CSS, aquí no hay un comportamiento por defecto sin declararlo." },
    { "fragmento": "initial-value: rebeccapurple;", "nota": "El valor que toma la propiedad si nunca se le asigna uno explícitamente. Obligatorio siempre que syntax no sea \"*\" — garantiza que la propiedad NUNCA quede sin un valor real." }
  ]
}
```

## Un valor inicial garantizado, incluso sin asignarlo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .caja {\n    width: 160px;\n    height: 80px;\n    background-color: var(--mi-color);\n  }\n</style>\n<div class=\"caja\"></div>",
  "despues": "<style>\n  @property --mi-color {\n    syntax: \"<color>\";\n    inherits: false;\n    initial-value: rebeccapurple;\n  }\n  .caja {\n    width: 160px;\n    height: 80px;\n    background-color: var(--mi-color);\n  }\n</style>\n<div class=\"caja\"></div>",
  "nota": "En NINGUNO de los dos casos se asigna --mi-color en ningún sitio — la caja solo usa var(--mi-color), sin fallback. Antes, sin @property, esa variable nunca existió: el fondo se queda transparente. Después, @property registra --mi-color con initial-value: rebeccapurple — y esa SOLA declaración basta para que la caja se pinte de morado, sin haber asignado el valor en ningún otro sitio."
}
```

## El tipo de dato: de un color a cualquier cosa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @property --angulo {\n    syntax: \"<angle>\";\n    inherits: false;\n    initial-value: 45deg;\n  }\n\n  @property --ancho-flexible {\n    syntax: \"<length> | <percentage>\";\n    inherits: true;\n    initial-value: 200px;\n  }\n\n  @property --cualquier-cosa {\n    syntax: \"*\";\n    inherits: true;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "syntax: \"<angle>\";", "nota": "Tipos de dato como <color>, <length>, <number>, <percentage>, <integer> o <angle> restringen la propiedad a ese tipo exacto." },
    { "fragmento": "syntax: \"<length> | <percentage>\";", "nota": "El símbolo | combina varios tipos aceptados: aquí, un length O un percentage, cualquiera de los dos." },
    { "fragmento": "syntax: \"*\";", "nota": "El comodín universal acepta cualquier valor, como una custom property normal — pero entonces initial-value deja de ser obligatorio, porque no hay un tipo concreto que garantizar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "initial-value no puede depender de nada externo",
  "contenido": "El valor de initial-value debe ser \"computacionalmente independiente\" — no puede depender del contexto donde se use. 3em es inválido, porque depende del font-size del elemento padre; 2in es válido, porque siempre significa exactamente lo mismo sin importar dónde se use."
}
```

## Por qué esto hace posible animar una custom property

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Sin @property: --progress es solo texto, sin tipo */\n  .barra-normal {\n    --progress: 25%;\n    animation: avanzar-mal 2.5s;\n  }\n  @keyframes avanzar-mal {\n    to { --progress: 100%; }\n  }\n\n  /* Con @property: --progress tiene tipo <percentage> */\n  @property --progress {\n    syntax: \"<percentage>\";\n    inherits: false;\n    initial-value: 25%;\n  }\n  .barra-tipada {\n    animation: avanzar-bien 2.5s;\n  }\n  @keyframes avanzar-bien {\n    to { --progress: 100%; }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "/* Sin @property: --progress es solo texto, sin tipo */\n  .barra-normal {\n    --progress: 25%;\n    animation: avanzar-mal 2.5s;\n  }", "nota": "El navegador no sabe interpolar entre dos cadenas de texto (\"25%\" y \"100%\") — la propiedad SALTA directamente al valor final, sin ninguna transición suave visible durante la animación." },
    { "fragmento": "/* Con @property: --progress tiene tipo <percentage> */\n  @property --progress {\n    syntax: \"<percentage>\";\n    inherits: false;\n    initial-value: 25%;\n  }", "nota": "Con el tipo <percentage> registrado, el navegador SÍ sabe calcular los valores intermedios entre 25% y 100% — la misma animación se ve suave, avanzando gradualmente en vez de saltar." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @property --tamano {\n    syntax: \"<length>\";\n    initial-value: 10px;\n  }\n  .caja { width: var(--tamano); }\n</style>\n<div class=\"caja\" style=\"height: 40px; background: teal;\"></div>",
  "opciones": [
    "La caja mide 10px de ancho, tomando el initial-value declarado",
    "La regla @property entera se ignora, porque falta el descriptor inherits — --tamano se comporta como una custom property normal, sin tipo",
    "Error de sintaxis: initial-value no puede aparecer sin la palabra clave required"
  ],
  "correcta": 1,
  "explicacion": "syntax e inherits son AMBOS obligatorios para que @property sea válida. Si falta cualquiera de los dos, TODA la regla se ignora — no solo el descriptor que falta. Sin inherits declarado, --tamano vuelve a comportarse como una custom property normal, sin tipo ni initial-value garantizado."
}
```

## Lo que @property NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "@property es solo una forma más larga de escribir --nombre: valor;",
      "realidad": "Registra el nombre con un TIPO real, un comportamiento de herencia explícito y un valor inicial garantizado — nada de eso existe con una custom property normal."
    },
    {
      "mito": "Cualquier custom property se puede animar con transition o @keyframes",
      "realidad": "Solo las registradas con @property y un syntax tipado (no \"*\") pueden animarse de forma suave — el navegador necesita conocer el tipo del valor para poder interpolar entre dos puntos."
    },
    {
      "mito": "initial-value acepta cualquier valor válido de ese tipo, incluidos los relativos",
      "realidad": "Debe ser computacionalmente independiente — 3em (depende del font-size del padre) es inválido, pero 2in sí lo es."
    },
    {
      "mito": "Si se omite inherits, la propiedad simplemente no hereda por defecto",
      "realidad": "Si falta syntax O inherits, la regla @property ENTERA se ignora — no hay un valor por defecto silencioso para ese descriptor."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar declarar inherits explícitamente.", "texto": "Invalida toda la regla @property, sin ningún aviso visible en pantalla — la propiedad vuelve a comportarse como una custom property normal." },
    { "titulo": "Usar un valor relativo (como 3em) en initial-value.", "texto": "No es computacionalmente independiente y por tanto es inválido — hace falta un valor que no dependa de ningún contexto externo." },
    { "titulo": "Esperar que una custom property sin registrar se pueda animar igual que una registrada.", "texto": "Sin @property y un tipo concreto, el navegador no sabe interpolar — la propiedad salta de un valor a otro, sin transición visible." },
    { "titulo": "Registrar una propiedad con syntax: \"*\" esperando que sea animable.", "texto": "El comodín universal no tiene un tipo concreto que el navegador pueda interpolar — sigue comportándose como texto sin tipo para efectos de animación." }
  ]
}
```

## Ejercicios

1. Escribe una regla `@property` que registre `--opacidad-marca` con tipo `<number>`, sin herencia, y un valor inicial de `1`.
2. Explica por qué `@property --radio { syntax: "<length>"; initial-value: 3em; }` es inválida, y cómo corregirla.
3. Explica qué pasaría si se omite el descriptor `inherits` en una regla `@property` que por lo demás está bien escrita.
4. Escribe una animación de `@keyframes` que cambie una custom property registrada de tipo `<color>` de un color a otro, y explica por qué esa transición se ve suave solo gracias a `@property`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "@property",
      "descripcion": "Referencia de MDN sobre @property: los tres descriptores, los tipos aceptados por syntax, y el ejemplo completo de animación con y sin registro de tipo.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property",
      "etiqueta": "MDN"
    }
  ]
}
```
