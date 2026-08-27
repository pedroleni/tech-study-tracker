# Transiciones

- **Módulo:** Movimiento e interactividad
- **Slug:** `transiciones` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [Transitions (web.dev)](https://web.dev/learn/css/transitions) — ver `contenido/css/TEMARIO.md` #45

---

## Qué es y para qué sirve

Una transición suaviza el cambio entre dos valores de una propiedad — en vez de que un color salte de golpe al pasar el ratón por un botón, `transition` interpola los valores intermedios durante un tiempo definido. Necesita un cambio de estado real para dispararse: `:hover`, `:focus`, o una clase añadida por JavaScript.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién suaviza el cambio entre dos estados",
  "roles": [
    { "etiqueta": "Quien evita saltos bruscos de estado", "rol": "Que un cambio se sienta gradual", "descripcion": "Un botón que cambia de color al pasar el ratón se siente mejor si el cambio es gradual, no instantáneo." },
    { "etiqueta": "Quien construye microinteracciones", "rol": "Hover, focus y estados activos", "descripcion": "transition es la base de casi cualquier feedback visual sutil en una interfaz." },
    { "etiqueta": "Quien anima con buen rendimiento", "rol": "Elegir qué propiedades transicionar", "descripcion": "transform y opacity son baratas de animar; width o height obligan a recalcular el layout en cada fotograma." }
  ]
}
```

## Las cuatro propiedades: property, duration, timing-function, delay

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .boton {\n    background: coral;\n    transition-property: background-color;\n    transition-duration: 300ms;\n  }\n  .boton:hover {\n    background: teal;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transition-property: background-color;", "nota": "Qué propiedad transicionar — puede ser una lista separada por comas, o all para cualquier propiedad animable que cambie." },
    { "fragmento": "transition-duration: 300ms;", "nota": "Cuánto dura la transición. Por defecto es 0s — sin duración, no hay transición visible, aunque transition-property esté declarado." }
  ]
}
```

## transition-timing-function: la curva de velocidad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .boton {\n    transition: background-color 300ms ease-in-out;\n  }\n  .otro {\n    transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "ease-in-out", "nota": "El valor por defecto de transition-timing-function es linear — velocidad constante, que suele sentirse mecánico. ease-in-out empieza y termina más despacio, se percibe más natural." },
    { "fragmento": "cubic-bezier(0.34, 1.56, 0.64, 1)", "nota": "Una curva personalizada — aquí, con un ligero rebote (overshoot) al pasar de 1. Las herramientas de desarrollador del navegador permiten ajustar esta curva visualmente." }
  ]
}
```

## transition-delay y el shorthand

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    transition: transform 300ms ease-in-out 150ms;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transition: transform 300ms ease-in-out 150ms;", "nota": "El shorthand, en orden: PROPIEDAD, DURACIÓN, TIMING-FUNCTION, DELAY. Aquí, la transición espera 150ms antes de empezar, y luego tarda 300ms en completarse." }
  ]
}
```

## Qué se puede transicionar y qué no

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Solo lo que tiene un 'estado intermedio' real",
  "contenido": "Una transición solo funciona en propiedades que pueden tener un valor intermedio entre el inicial y el final — un color, un tamaño, una posición. display no se puede transicionar: no existe un punto a medio camino entre none y block. Lo mismo pasa con font-family: no hay una tipografía \"a medias\" entre dos familias distintas."
}
```

## transition: all frente a listar propiedades

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .arriesgado {\n    transition: all 300ms ease;\n  }\n\n  .mas-seguro {\n    transition: background-color 300ms ease, transform 300ms ease;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".arriesgado {\n    transition: all 300ms ease;\n  }", "nota": "all transiciona CUALQUIER propiedad animable que cambie — incluidas las que cambian por motivos que no esperabas (un font-size heredado, por ejemplo), y es más costoso de calcular para el navegador." },
    { "fragmento": ".mas-seguro {\n    transition: background-color 300ms ease, transform 300ms ease;\n  }", "nota": "Listar las propiedades concretas, separadas por comas, es más predecible: solo transicionan los cambios que de verdad se esperan." }
  ]
}
```

## Entrada y salida con duraciones distintas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    transform: scale(1);\n    transition: transform 150ms ease-out;\n  }\n  .tarjeta:hover {\n    transform: scale(1.05);\n    transition: transform 600ms ease-in;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "transition: transform 150ms ease-out;", "nota": "La regla base define cómo se anima la SALIDA del hover (al dejar de pasar el ratón) — aquí, rápida, 150ms." },
    { "fragmento": "transition: transform 600ms ease-in;", "nota": "La regla dentro de :hover define cómo se anima la ENTRADA — aquí, más lenta, 600ms. Es habitual que la entrada y la salida no compartan la misma duración." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    background: coral;\n    transition: all 300ms ease;\n  }\n  .caja:hover {\n    background: teal;\n    transform: scale(1.1);\n  }\n</style>",
  "opciones": [
    "Solo el background hace una transición suave; transform cambia de golpe",
    "Tanto background como transform hacen una transición suave, porque transition: all afecta a cualquier propiedad animable que cambie",
    "Ninguna de las dos transiciona, porque haría falta declarar transition-property por separado para cada una"
  ],
  "correcta": 1,
  "explicacion": "transition: all aplica la transición a CUALQUIER propiedad animable que cambie de valor, no solo a la primera que cambie. Aquí, tanto background-color como transform se transicionan suavemente en 300ms al entrar en :hover."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "prefers-reduced-motion tiene su propia lección",
  "contenido": "Toda transición llamativa debería respetar la preferencia de movimiento reducido del sistema operativo de quien navega. El detalle completo — con su base normativa en WCAG — llega en una lección dedicada más adelante en este mismo módulo."
}
```

## Lo que transition NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "transition: all es la forma más segura de animar cualquier cambio",
      "realidad": "Puede generar transiciones no deseadas en propiedades que cambian por otros motivos, y es más costoso de calcular — listar las propiedades concretas es más predecible."
    },
    {
      "mito": "Cualquier propiedad CSS se puede transicionar",
      "realidad": "Solo las que tienen un estado intermedio real entre el valor inicial y el final — display o font-family, por ejemplo, no se pueden transicionar directamente."
    },
    {
      "mito": "El timing-function por defecto (linear) es el más natural",
      "realidad": "linear avanza a velocidad constante, lo que suele sentirse mecánico — curvas como ease-in-out se perciben más naturales."
    },
    {
      "mito": "Una transición se dispara sola, sin ningún cambio real de estado",
      "realidad": "Hace falta un cambio real del valor de la propiedad — por :hover, :focus, o una clase añadida por JavaScript. Sin ese cambio, no hay nada que interpolar."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar transition: all por comodidad, sin pensarlo.", "texto": "Puede transicionar cambios que no se esperaban y cuesta más calcular." },
    { "titulo": "Intentar transicionar propiedades no animables como display.", "texto": "No tienen un estado intermedio real — la transición simplemente no ocurre." },
    { "titulo": "No respetar prefers-reduced-motion en transiciones llamativas.", "texto": "Ignora una preferencia de accesibilidad real de quien navega." },
    { "titulo": "Animar width o height en vez de transform.", "texto": "Obliga al navegador a recalcular el layout en cada fotograma, un coste evitable." }
  ]
}
```

## Ejercicios

1. Escribe una transición de `background-color` de 300ms con la curva `ease-in-out`.
2. Escribe una regla que dé a un botón una transición rápida (150ms) al entrar en `:hover` y una lenta (600ms) al salir.
3. Explica por qué `display` no se puede transicionar directamente.
4. Reescribe `transition: all 300ms;` especificando solo las propiedades concretas que realmente cambian en tu ejemplo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Transitions",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre transition-property, duration, timing-function, delay, qué propiedades son animables y buenas prácticas de rendimiento.",
      "url": "https://web.dev/learn/css/transitions",
      "etiqueta": "web.dev"
    }
  ]
}
```
