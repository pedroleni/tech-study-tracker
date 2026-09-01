# Énfasis e importancia: por qué strong no es solo negrita

- **Módulo:** Texto y contenido
- **Slug:** `enfasis-e-importancia-por-que-strong-no-es-solo-negrita` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Emphasis and importance (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance) + [Text basics (web.dev)](https://web.dev/learn/html/text-basics) — ver `contenido/html/TEMARIO.md` #7

---

## Qué es y para qué sirve

HTML tiene dos pares de etiquetas que parecen hacer lo mismo pero significan cosas distintas: `<em>`/`<i>` y `<strong>`/`<b>`. Los cuatro se ven igual por defecto —cursiva los dos primeros, negrita los otros dos— pero solo dos de ellos cambian el **significado** del texto. `<em>` marca énfasis: la palabra que subrayarías con la voz al leerlo en alto. `<strong>` marca importancia real: una advertencia, un dato crítico. `<i>` y `<b>` son solo presentación — cursiva y negrita sin ninguna carga semántica detrás.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién nota la diferencia entre em/strong e i/b",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Cambiar el tono de voz", "descripcion": "Con em y strong puede leer con otra entonación, como haría una persona al hablar. Con i y b, ninguna diferencia." },
    { "etiqueta": "Buscador", "rol": "Dar algo más de peso", "descripcion": "El texto dentro de strong se considera ligeramente más relevante que el mismo texto suelto — con b, no hay ninguna señal extra." },
    { "etiqueta": "Quien escanea la página", "rol": "El ojo va directo ahí", "descripcion": "Visualmente da igual cuál uses — negrita es negrita. Aquí la diferencia no la ve un humano leyendo, solo las herramientas de detrás." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando algo es de verdad importante, no solo quieres que resalte",
  "contenido": "\"No apagues el servidor durante el despliegue\" necesita strong porque es una advertencia real — no porque quieras que se vea en negrita."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Sí puedes entrar.</p>",
  "despues": "<p>Sí <em>puedes</em> entrar.</p>",
  "nota": "No dicen lo mismo. \"Antes\" es un permiso neutro. \"Después\", con el énfasis en puedes, suena a respuesta a una duda — \"claro que puedes, ¿por qué no ibas a poder?\". El HTML solo cambia en em; el significado sí — exactamente lo que harías con el tono de voz al decirlo en alto."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres negrita o cursiva solo por estética",
  "contenido": "Ahí es exactamente donde NO van estas etiquetas — para eso está el CSS (font-weight, font-style), sin pretender que sea énfasis o importancia real."
}
```

## Cómo se usa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Este líquido es <strong>altamente tóxico</strong>.</p>\n<p><em>Nunca</em> lo dejes al alcance de menores.</p>\n<p>Si lo ingieres, <strong>llama <em>inmediatamente</em> a emergencias</strong>.</p>",
  "anotaciones": [
    { "fragmento": "<strong>altamente tóxico</strong>", "nota": "Importancia real: es la información crítica de la frase, el dato que no se puede pasar por alto." },
    { "fragmento": "<em>Nunca</em>", "nota": "Énfasis: cambia el matiz de la frase, como el tono de voz que usarías al decirlo en persona." },
    { "fragmento": "<strong>llama <em>inmediatamente</em> a emergencias</strong>", "nota": "Los dos anidados: toda la frase es importante (strong), y dentro de ella \"inmediatamente\" lleva además su propio énfasis (em). No compiten, se combinan." }
  ]
}
```

## em vs i, strong vs b: el mismo aspecto, distinto significado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Este texto usa <b>negrita</b> y <i>cursiva</i> sin ningún significado detrás — solo presentación.</p>",
  "despues": "<p>Este texto usa <strong>negrita</strong> y <em>cursiva</em> con significado real: importancia y énfasis.</p>",
  "nota": "Pixel por pixel, idénticos — ambos se ven exactamente igual. La diferencia está en lo que anuncia un lector de pantalla y en el peso que le da un buscador, no en nada que veas con los ojos."
}
```

## Cuando i y b sí son la etiqueta correcta

No son etiquetas "prohibidas" — tienen sus propios casos de uso legítimos, distintos de em/strong:

| Etiqueta | Caso de uso legítimo | Ejemplo |
|---|---|---|
| `<i>` | Una palabra en otro idioma | `<i lang="fr">c'est la vie</i>` |
| `<i>` | Un nombre taxonómico (biología) | `<i>Panthera leo</i>` |
| `<i>` | Un término técnico la primera vez que aparece | `Esto se llama <i>closure</i>` |
| `<b>` | Palabras clave en un resumen o índice | `Ingredientes: <b>harina</b>, <b>agua</b>, <b>sal</b>` |
| `<b>` | Nombres de producto dentro de un texto | `Escrito en <b>Visual Studio Code</b>` |

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "La clave: ¿hay significado, o es solo estilo?",
  "contenido": "Un nombre taxonómico va en cursiva por convención tipográfica, no porque sea \"importante\" ni lleve \"énfasis\" — ahí i es literalmente correcto. Lo que hay que evitar es usar i o b para lograr negrita/cursiva sin ninguna razón semántica detrás."
}
```

## Un byte más: escribir < y & sin que el navegador se confunda

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<p>Para escribir un condicional en HTML usamos < y > alrededor de la etiqueta.</p>",
  "opciones": [
    "El párrafo muestra el texto tal cual, con los símbolos < y >",
    "El navegador interpreta \"< y >\" como el inicio de una etiqueta rota y el resto del párrafo desaparece o se comporta de forma extraña",
    "El navegador escapa los símbolos automáticamente y los muestra bien"
  ],
  "correcta": 1,
  "explicacion": "El navegador no sabe distinguir un < que abre una etiqueta real de uno que forma parte de tu texto — los trata igual. Para escribir los símbolos literales hacen falta las entidades: &lt; para <, &gt; para >, y &amp; para &. Sin ellas, el navegador intenta parsear tu texto como si fuera HTML."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Para escribir un condicional usamos &lt; y &gt; alrededor de la etiqueta.</p>\n<p>Cine &amp; Palomitas — el compa&ntilde;ero cl&aacute;sico.</p>",
  "anotaciones": [
    { "fragmento": "&lt;", "nota": "El símbolo < literal. Escribirlo sin escapar confunde al navegador con el inicio de una etiqueta real." },
    { "fragmento": "&gt;", "nota": "El símbolo > literal, la pareja de <." },
    { "fragmento": "&amp;", "nota": "El símbolo & literal — necesario porque & también inicia las propias entidades, así que un & suelto también puede confundir al navegador." }
  ]
}
```

## Lo que énfasis e importancia NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "strong y b hacen lo mismo, uno es solo la forma \"nueva\" de escribirlo",
      "realidad": "No es una cuestión de moda ni de versión de HTML. strong dice \"esto es importante de verdad\"; b dice \"esto va en negrita, sin más\". Un lector de pantalla los trata de forma distinta hoy mismo."
    },
    {
      "mito": "<i> está prohibido, siempre hay que usar em",
      "realidad": "i sigue siendo correcto para nombres taxonómicos, palabras en otro idioma o términos técnicos — casos donde la cursiva es una convención tipográfica, no énfasis real."
    },
    {
      "mito": "Anidar em dentro de strong (o al revés) es un error",
      "realidad": "Es exactamente para eso que existen combinados — una frase puede ser importante en su conjunto y tener además una palabra con énfasis extra dentro."
    },
    {
      "mito": "Si necesitas texto en negrita, strong es la forma \"correcta\" de conseguirlo",
      "realidad": "Si el motivo es puramente visual (quieres que resalte, sin que sea información crítica), lo correcto es CSS (font-weight), no forzar una etiqueta semántica que no le corresponde a ese texto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar strong o em solo para conseguir negrita o cursiva.", "texto": "Si no hay importancia ni énfasis real detrás, es un uso incorrecto — aunque el resultado visual sea el que buscabas." },
    { "titulo": "Abusar de strong hasta que pierde sentido.", "texto": "Si todo un párrafo está en strong, nada destaca ya sobre el resto — la importancia solo funciona por contraste con lo que no lo es." },
    { "titulo": "Olvidar escapar < y & en texto literal.", "texto": "Un símbolo < suelto en medio de una frase puede romper visualmente el resto de la página sin ningún aviso de error." },
    { "titulo": "Usar i para \"cursiva porque sí\", sin ninguno de sus casos de uso reales.", "texto": "Si no es un término técnico, un idioma distinto o un nombre taxonómico, probablemente lo que quieres es CSS, no i." }
  ]
}
```

## Ejercicios

1. Busca tres frases en algo que hayas escrito (un mensaje, un email, una nota) donde el énfasis en una palabra cambie el sentido de la frase. Márcalas con em como las escribirías en HTML.
2. Escribe un párrafo de advertencia (por ejemplo, sobre un producto peligroso o una acción irreversible) usando strong para lo importante y em anidado donde haga falta énfasis extra dentro de esa importancia.
3. Encuentra un ejemplo real (una web, una app) donde se use negrita o cursiva puramente decorativa, sin importancia ni énfasis real detrás. ¿Qué etiqueta crees que usaron: strong/em, o b/i, o CSS?
4. Escribe una frase que contenga los tres símbolos &lt;, &gt; y &amp; de forma literal (por ejemplo, explicando la sintaxis de una etiqueta HTML) usando las entidades correctas.
5. Prueba `<marquee>Texto</marquee>` en las herramientas de desarrollador de tu navegador (Elements/Inspector, no en tu código real: es una etiqueta obsoleta). Verla moverse en pantalla ayuda a entender por qué HTML evolucionó hacia separar contenido y presentación — el mismo argumento de fondo que distingue strong/em de b/i.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe el párrafo de advertencia del ejercicio 2: strong para lo importante, y em anidado donde haga falta énfasis extra dentro de esa importancia.",
  "html": "<!-- Empieza aquí -->",
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
      "titulo": "Emphasis and importance",
      "descripcion": "Guía de referencia de MDN sobre em/i y strong/b, con ejemplos de anidamiento y de cuándo i y b siguen siendo la etiqueta correcta.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Text basics",
      "descripcion": "Curso de web.dev sobre semántica a nivel de texto, incluidas las entidades de caracteres para símbolos reservados como < y &.",
      "url": "https://web.dev/learn/html/text-basics",
      "etiqueta": "web.dev"
    }
  ]
}
```
