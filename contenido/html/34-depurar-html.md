# Depurar HTML: DevTools, el validador W3C y errores de anidamiento

- **Módulo:** Calidad
- **Slug:** `depurar-html-devtools-el-validador-w3c-y-errores-de-anidamiento` (autogenerado del título)
- **Orden:** 165
- **Fuentes:** [Debugging HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML) — ver `contenido/html/TEMARIO.md` #34

---

## Qué es y para qué sirve

El navegador nunca se rinde ante HTML roto: si falta una etiqueta de cierre o una comilla, intenta repararlo él solo con sus propias reglas, en silencio, sin ningún aviso visual. Eso es bueno porque la página no se rompe del todo — y peligroso porque el resultado reparado casi nunca es exactamente lo que se pretendía escribir. Depurar HTML es aprender a ver esa reparación antes de que se note de la peor manera.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué revela cada herramienta que el ojo no ve solo",
  "roles": [
    { "etiqueta": "El Inspector / Elements del navegador", "rol": "Mostrar lo que el navegador entendió", "descripcion": "No el código que escribiste, sino el DOM ya reparado — la diferencia entre los dos es exactamente el problema a encontrar." },
    { "etiqueta": "El validador W3C", "rol": "Señalar el error por línea y columna", "descripcion": "Encuentra problemas que nunca rompen visualmente la página, pero que siguen siendo HTML inválido de verdad." },
    { "etiqueta": "Quien depura sin ninguna herramienta", "rol": "Adivinar a ciegas", "descripcion": "Sin comparar código fuente y DOM renderizado, un error de anidamiento puede pasar semanas sin detectarse, solo notado por casualidad." }
  ]
}
```

## Cuándo lo harías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando algo se ve raro y no sabes por qué",
  "contenido": "Texto en negrita que no debería estarlo, un enlace que desapareció sin motivo aparente — casi siempre es una etiqueta o un atributo mal cerrado en algún punto anterior."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Antes de publicar algo, aunque se vea perfecto",
  "contenido": "El navegador puede haber reparado errores sin que se note nada raro en pantalla — el validador los encuentra igual, aunque el resultado visual sea aceptable de casualidad."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando copias y pegas HTML de otra fuente",
  "contenido": "El código copiado puede arrastrar errores de anidamiento o comillas mal cerradas que hasta ahora se veían bien por pura casualidad, en otro contexto."
}
```

## El navegador es permisivo — y eso no siempre es bueno

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Este texto es normal. <strong>Esto debería ser negrita, pero falta cerrar la etiqueta.</p>\n<p>Este párrafo también sale en negrita, sin quererlo.</p>",
  "despues": "<p>Este texto es normal. <strong>Esto sí es negrita, con la etiqueta bien cerrada.</strong></p>\n<p>Este párrafo vuelve a la normalidad.</p>",
  "nota": "El navegador nunca se rinde: intenta reparar el HTML roto por su cuenta. Sin la etiqueta de cierre, extiende la negrita a todo lo que viene después, sin ningún error visible en pantalla — el fallo solo se nota mirando el resultado con atención, o con el validador."
}
```

## Errores de anidamiento: por qué el orden de cierre importa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<strong>strong <em>strong y en cursiva?</strong> ¿esto qué es?</em>",
  "anotaciones": [
    { "fragmento": "<strong>strong <em>strong y en cursiva?</strong>", "nota": "em se abre DENTRO de strong, pero strong se cierra ANTES que em — un cruce de etiquetas, no un anidamiento real. El navegador no lo deja así: divide y reordena las etiquetas por su cuenta para que cada una cierre correctamente, con un resultado que no es exactamente el que se escribió." }
  ]
}
```

## Atributos sin cerrar: el error silencioso más peligroso

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<a href=\"https://ejemplo.com>Visita el sitio</a>\n<p>El resto de la página sigue aquí.</p>",
  "opciones": [
    "El enlace se ve normal, solo que sin subrayado",
    "El enlace desaparece, y el resto del documento puede desaparecer con él",
    "El navegador añade automáticamente la comilla que falta"
  ],
  "correcta": 1,
  "explicacion": "Falta la comilla de cierre en href. El navegador interpreta que TODO lo que viene después sigue formando parte del valor de ese atributo, hasta encontrar otra comilla — en el peor caso, el resto del documento entero desaparece dentro de un atributo que nunca llega a cerrarse."
}
```

## El validador W3C: encontrar el error por línea y columna

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "validator.w3.org, gratis para cualquier HTML",
  "contenido": "Acepta una URL, un archivo subido, o el código pegado directamente — y devuelve cada error con su línea y columna exactas, algo que el navegador nunca muestra por sí solo."
}
```

| Mensaje del validador | Qué significa |
|---|---|
| End tag li implied, but there were open elements | Un li no se cerró de forma explícita |
| Unclosed element strong | Falta la etiqueta de cierre de strong |
| End tag strong violates nesting rules | Las etiquetas se cierran en el orden equivocado |
| End of file reached when inside an attribute value | Falta una comilla de cierre en algún atributo |

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Corrige por lotes, y vuelve a validar",
  "contenido": "Un solo error temprano (como la comilla sin cerrar de antes) puede generar una cascada de errores posteriores que desaparecen solos al arreglar el primero — no hace falta corregir cada línea marcada una por una si vienen del mismo origen."
}
```

## Lo que un HTML "que se ve bien" NO significa

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si se ve bien en pantalla, el HTML está bien escrito",
      "realidad": "El navegador repara errores en silencio, sin ningún aviso visible — el resultado puede verse aceptable de casualidad, con una estructura por debajo completamente distinta a la que se escribió."
    },
    {
      "mito": "HTML no tiene errores de sintaxis reales, así que da igual cómo se escriba",
      "realidad": "No falla como un lenguaje compilado, pero sí tiene reglas — un solo atributo sin cerrar puede hacer desaparecer el resto del documento entero."
    },
    {
      "mito": "Cada etiqueta rota afecta solo a esa etiqueta en concreto",
      "realidad": "Un strong sin cerrar se extiende a todo lo que viene después; una comilla sin cerrar puede tragarse el resto del documento — un fallo pequeño puede tener un efecto enorme."
    },
    {
      "mito": "El validador del W3C es solo para páginas oficiales o gubernamentales",
      "realidad": "Es una herramienta gratuita para cualquier HTML, útil precisamente porque el navegador nunca avisa de estos errores por sí solo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar una etiqueta sin cerrar confiando en que \"ya se ve bien\".", "texto": "El navegador la repara con sus propias reglas, que no siempre coinciden con lo que se pretendía." },
    { "titulo": "Cerrar las etiquetas en el orden equivocado (anidamiento cruzado).", "texto": "El navegador reordena las etiquetas por su cuenta para intentar arreglarlo, con un resultado distinto al esperado." },
    { "titulo": "Olvidar una comilla de cierre en un atributo.", "texto": "Uno de los errores más silenciosos y de mayor efecto: puede hacer desaparecer el resto del documento entero, sin ningún aviso visual claro de por qué." },
    { "titulo": "No comparar nunca el código fuente con el Inspector/Elements del navegador.", "texto": "Es la forma más directa de ver qué reparó el navegador por su cuenta, y si ese arreglo coincide con lo que se quería." }
  ]
}
```

## Ejercicios

1. Escribe un párrafo con una etiqueta strong sin cerrar y comprueba en el navegador hasta dónde se extiende la negrita.
2. Pasa un HTML tuyo por el validador del W3C (validator.w3.org) y corrige los errores que encuentres, uno a uno.
3. Escribe un enlace con la comilla de cierre del href olvidada a propósito, y observa en el Inspector qué pasó con el resto del documento.
4. Abre el Inspector/Elements de una web real y compara la estructura que ves ahí con el código fuente (Ver código fuente) — ¿coinciden exactamente?

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Este párrafo tiene un strong sin cerrar (ejercicio 1) — mira en la vista previa hasta dónde llega la negrita. Después prueba el ejercicio 3: quita la comilla de cierre de un href y observa qué pasa con el resto del documento.",
  "html": "<p>Este texto es normal <strong>y este está en negrita, pero falta cerrar la etiqueta y sigue así con todo lo que viene después.</p>\n<p>Un párrafo más para ver hasta dónde llega.</p>",
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
      "titulo": "Debugging HTML",
      "descripcion": "Guía de referencia de MDN sobre los errores más comunes de HTML, cómo el navegador los repara en silencio, y cómo usar el validador W3C y el Inspector del navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML",
      "etiqueta": "MDN"
    }
  ]
}
```
