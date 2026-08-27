# Depurar CSS con DevTools

- **Módulo:** Calidad, rendimiento y organización
- **Slug:** `depurar-css-con-devtools` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [Debugging CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS) — ver `contenido/css/TEMARIO.md` #55

---

## Qué es y para qué sirve

Cuando una regla CSS "no funciona", casi nunca es magia — es especificidad, soporte del navegador, o un selector que no coincide con lo esperado. Las herramientas de desarrollador convierten ese misterio en un proceso visual: qué regla gana, qué valor se aplica de verdad, y por qué una caja mide lo que mide. Abre el último módulo, sobre calidad, rendimiento y organización.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita ver qué CSS se está aplicando de verdad",
  "roles": [
    { "etiqueta": "Quien depura un problema de CSS", "rol": "Ver qué regla gana y por qué", "descripcion": "DevTools tacha las reglas que pierden la cascada, mostrando exactamente cuál está ganando en cada elemento." },
    { "etiqueta": "Quien distingue declarado de final", "rol": "Comparar Rules con Computed", "descripcion": "El valor que se escribió en la hoja de estilos y el valor que finalmente se aplica tras la cascada no siempre coinciden." },
    { "etiqueta": "Quien reduce un problema al mínimo", "rol": "Aislar el código que realmente falla", "descripcion": "Un caso reducido, con solo el código problemático, hace mucho más fácil encontrar la causa real." }
  ]
}
```

## Inspeccionar un elemento: el panel Rules

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- Clic derecho sobre cualquier elemento → Inspeccionar -->\n<!-- El panel HTML muestra el DOM real, no el código fuente original -->",
  "anotaciones": [
    { "fragmento": "El panel HTML muestra el DOM real, no el código fuente original", "nota": "El navegador normaliza HTML mal escrito (cierra etiquetas sin cerrar, por ejemplo) y refleja cambios hechos por JavaScript — \"Ver código fuente\" muestra el HTML tal como llegó del servidor, que puede ser distinto." }
  ]
}
```

## Especificidad: qué regla gana

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .special {\n    color: orange;\n  }\n  em {\n    color: hotpink;\n    font-weight: bold;\n  }\n</style>\n<em class=\"special\">Texto</em>",
  "anotaciones": [
    { "fragmento": ".special {\n    color: orange;\n  }", "nota": "Un selector de CLASE tiene más especificidad que uno de elemento — en DevTools, esta regla aparecería normal (ganando), y la de em tachada para color, aunque font-weight de em sí se aplique, al no haber conflicto en esa propiedad." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .special {\n    color: orange;\n  }\n  em {\n    color: hotpink;\n    font-weight: bold;\n  }\n</style>\n<em class=\"special\">Texto</em>",
  "opciones": [
    "hotpink, porque la regla em está escrita después en la hoja de estilos",
    "orange, porque un selector de clase (.special) tiene más especificidad que un selector de elemento (em)",
    "El navegador mezcla los dos colores en un tono intermedio"
  ],
  "correcta": 1,
  "explicacion": "La especificidad depende del TIPO de selector, no del orden de escritura cuando hay un conflicto de este tipo — una clase (.special) pesa más que un selector de elemento (em), así que orange gana, sin importar el orden."
}
```

## Rules frente a Computed: declarado frente a valor final

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos paneles, dos preguntas distintas",
  "contenido": "El panel Rules muestra los valores DECLARADOS en la hoja de estilos, con todas las reglas en conflicto visibles (algunas tachadas). El panel Computed muestra el valor FINAL, ya resuelta toda la cascada — la respuesta directa a \"¿qué se está aplicando de verdad ahora mismo?\", sin tener que reconstruir la cascada a mano."
}
```

## La vista Layout: entender por qué una caja mide lo que mide

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El diagrama del modelo de caja, visualmente",
  "contenido": "La vista Layout dibuja el modelo de caja del elemento seleccionado — contenido, padding, borde y margin, con sus medidas reales. Es la forma más rápida de entender por qué un elemento con width: 200px no mide realmente 200px de ancho total: casi siempre es box-sizing (content-box añade padding y borde por encima del ancho declarado; border-box los incluye dentro)."
}
```

## Activar, desactivar y editar en tiempo real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- En el panel Rules: -->\n<!-- - Pasar el ratón sobre una declaración revela una casilla para desactivarla -->\n<!-- - Clic en un valor de color abre un selector visual -->\n<!-- - Clic en la llave de cierre } añade una declaración nueva, con autocompletado -->",
  "anotaciones": [
    { "fragmento": "Clic en la llave de cierre } añade una declaración nueva, con autocompletado", "nota": "Permite probar valores sin editar el archivo real — útil para experimentar rápido, pero estos cambios son temporales: desaparecen al recargar la página, hay que copiarlos a mano a la hoja de estilos real." }
  ]
}
```

## Propiedades no soportadas

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "DevTools tacha lo que el navegador no reconoce",
  "contenido": "Si una propiedad o un valor aparecen tachados sin que haya ningún conflicto de especificidad, es probable que el navegador simplemente no los reconozca — conviene comprobar la tabla de compatibilidad en MDN para esa propiedad concreta antes de asumir un error de escritura."
}
```

## El flujo de depuración, paso a paso

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "1. Tomar distancia.", "texto": "La frustración nubla el juicio — a veces un descanso corto ayuda más que seguir insistiendo." },
    { "titulo": "2. Validar el HTML y el CSS.", "texto": "Un validador puede detectar errores de sintaxis que el navegador tolera en silencio." },
    { "titulo": "3. Comprobar el soporte del navegador.", "texto": "Verificar si la propiedad o el valor concreto funcionan en el navegador objetivo." },
    { "titulo": "4. Comprobar conflictos de especificidad.", "texto": "Usar DevTools para ver qué regla está ganando de verdad." },
    { "titulo": "5. Crear un caso reducido si sigue sin resolverse.", "texto": "Aislar solo el código problemático, sin nada más alrededor, facilita encontrar la causa real y pedir ayuda." }
  ]
}
```

## Lo que DevTools NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si una propiedad no funciona, seguro que hay un error de sintaxis en el CSS",
      "realidad": "Puede ser un problema de especificidad, de soporte del navegador, o de que el selector simplemente no coincide con el elemento — no siempre es un error de escritura."
    },
    {
      "mito": "El panel Rules siempre muestra el valor REAL que se está aplicando",
      "realidad": "Rules muestra los valores declarados; Computed muestra el valor final tras resolver toda la cascada — pueden no coincidir."
    },
    {
      "mito": "Ver código fuente (View Source) es lo mismo que inspeccionar el DOM en DevTools",
      "realidad": "View Source muestra el HTML tal como llegó del servidor; el panel HTML de DevTools muestra el DOM real, normalizado por el navegador y con cambios de JavaScript incluidos."
    },
    {
      "mito": "Cambiar valores en DevTools guarda el cambio en el archivo CSS real",
      "realidad": "Los cambios en DevTools son temporales, solo para esa carga de página — hay que copiar el valor final a la hoja de estilos real a mano."
    }
  ]
}
```

## Ejercicios

1. Escribe dos reglas (una de clase, una de elemento) que compitan por el color de un mismo elemento, y explica cuál gana y por qué.
2. Describe los pasos para inspeccionar por qué un elemento no mide el ancho esperado, usando la vista Layout.
3. Explica la diferencia entre el panel Rules y el panel Computed.
4. Explica qué es un "caso reducido" y por qué ayuda a resolver un problema de CSS.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Debugging CSS",
      "descripcion": "Guía de MDN sobre el panel Rules, la vista Layout, especificidad, Computed vs Rules, y el flujo de depuración paso a paso.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS",
      "etiqueta": "MDN"
    }
  ]
}
```
