# Anatomía de una etiqueta: elementos, atributos y por qué algunas se cierran solas

- **Módulo:** Fundamentos del documento
- **Slug:** `anatomia-de-una-etiqueta-elementos-atributos-y-por-que-algunas-se-cierran-solas` (autogenerado del título)
- **Orden:** 5
- **Fuentes:** [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Overview of HTML (web.dev)](https://web.dev/learn/html/overview) — ver `contenido/html/TEMARIO.md` #2

---

## Qué es y para qué sirve

Una **etiqueta** (`tag`) es el marcador entre `<` y `>`: `<p>`, `<strong>`, `<img>`. Un **elemento** es la unidad completa: etiqueta de apertura, el contenido que envuelve, y etiqueta de cierre — `<p>Hola</p>` es un elemento; `<p>` por sí sola es solo una etiqueta. La distinción importa porque casi todo lo que vas a leer sobre HTML habla de "elementos" (el `<p>` es un elemento de bloque, el `<a>` es un elemento en línea) dando por hecho que ya sabes de qué piezas está hecho uno.

Dentro de la etiqueta de apertura pueden ir **atributos**: pares `nombre="valor"` que añaden información o configuran el comportamiento del elemento sin que se vean como contenido — el `href` de un enlace, el `src` de una imagen, el `class` que usará tu CSS. Hay dos familias de atributos que conviene distinguir desde ya: los **globales**, que funcionan en cualquier etiqueta (`class`, `id`, `title`, `lang`), y los **específicos**, que solo tienen sentido en una etiqueta concreta (`href` solo en `<a>`, `src` solo en elementos que cargan un recurso). Y no todos los atributos llevan valor: los **atributos booleanos** (`disabled`, `checked`, `required`) activan o desactivan un comportamiento solo con estar presentes — no necesitan `="algo"`, y de hecho escribir `disabled="false"` sigue dejando el elemento deshabilitado, porque lo único que importa es si el atributo aparece o no.

Y no todos los elementos siguen el patrón apertura-contenido-cierre: unos pocos, los que nunca pueden contener nada (una imagen, un salto de línea), se escriben con una sola etiqueta y punto. Cuando anidas elementos unos dentro de otros — como llevas haciendo sin darte cuenta en cada ejemplo de HTML que has visto hasta ahora — el navegador construye internamente un árbol con ellos (el DOM). No hace falta que lo entiendas hoy, pero conviene que sepas que existe: la mayoría de bugs de "por qué mi CSS no aplica" o "por qué mi JavaScript no encuentra el elemento" se explican mirando ese árbol, no la etiqueta suelta.

## Cuándo lo usarías de verdad 👤

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cada vez que escribes o lees HTML, sin excepción",
  "contenido": "Esto no es una técnica puntual, es la gramática básica: todo lo demás del temario — formularios, tablas, accesibilidad — se explica dando por hecho que ya sabes leer una etiqueta."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando depuras una página que \"se ve rota\"",
  "contenido": "Una etiqueta sin cerrar o cerrada en el orden equivocado es una de las causas más comunes de que el diseño se descuadre a partir de cierto punto de la página, sin que haya ningún error visible en la consola."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando lees la documentación de una etiqueta que no conoces",
  "contenido": "Lo primero que necesitas saber es si es normal o si se cierra sola, qué atributos acepta, y si alguno de ellos es booleano. Es la primera pregunta que responde cualquier referencia de MDN."
}
```

## Cómo se usa

Antes de nada, así se ve una etiqueta por dentro, parte por parte:

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un elemento completo, descompuesto",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "p", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "class", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"intro\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" },
    { "texto": "Hola", "rol": "contenido" },
    { "texto": "</p>", "rol": "cierre" }
  ]
}
```

Ahora en contexto, dentro de un elemento más completo, con varios atributos:

```html
<p class="intro">
  Bienvenido a <strong>mi web</strong>.
  <br>
  Aquí tienes un enlace <a href="https://ejemplo.com" target="_blank">de ejemplo</a>.
</p>
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "codigo": "<p class=\"intro\">\n  Bienvenido a <strong>mi web</strong>.\n  <br>\n  Aquí tienes un enlace <a href=\"https://ejemplo.com\" target=\"_blank\">de ejemplo</a>.\n</p>",
  "anotaciones": [
    { "fragmento": "<p class=\"intro\">", "nota": "Etiqueta de apertura con un atributo: nombre (class) igual, valor entre comillas (\"intro\"). Las comillas pueden ser simples o dobles, pero tienen que estar — sin ellas, un valor con espacios se corta en el primer espacio." },
    { "fragmento": "<strong>mi web</strong>", "nota": "Un elemento completo dentro de otro: apertura, contenido, cierre. Nada impide anidar elementos, siempre que cierres en el orden correcto." },
    { "fragmento": "<br>", "nota": "Elemento vacío (void): no tiene contenido ni etiqueta de cierre porque por definición nunca puede envolver nada. `<img>`, `<meta>`, `<input>` y `<hr>` funcionan igual." },
    { "fragmento": "<a href=\"https://ejemplo.com\" target=\"_blank\">", "nota": "Dos atributos en la misma etiqueta, separados por un espacio: href (a dónde va el enlace) y target (que se abra en pestaña nueva). El orden entre atributos no importa." },
    { "fragmento": "de ejemplo</a>", "nota": "La etiqueta de cierre repite el nombre de la de apertura con una barra delante — </a>, no </enlace> ni </A> en minúsculas distintas al abrir." }
  ]
}
```

Los atributos booleanos se escriben distinto — sin `="valor"` — y por eso conviene verlos aparte:

```html
<label>
  <input type="checkbox" checked>
  Acepto los términos
</label>
<button type="submit" disabled>Enviar</button>
```

Aquí `checked` deja la casilla marcada desde el principio y `disabled` deja el botón inactivo — ninguno de los dos lleva valor, su sola presencia en la etiqueta ya activa el comportamiento. Si quitas `checked` o `disabled` de la etiqueta, vuelven al estado contrario; no existe un `checked="false"` que sirva para desactivarlos, porque el navegador solo mira si el atributo está o no está.

¿Qué pasa si cierras dos elementos anidados en el orden equivocado?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<strong><em>Texto importante</strong></em>",
  "opciones": [
    "El navegador lo rechaza y no muestra el texto",
    "El navegador lo corrige por debajo, cerrando y reabriendo elementos para que el resultado sea válido — aunque no sea exactamente lo que querías",
    "Funciona igual que si estuviera bien anidado, el orden de cierre no afecta a nada"
  ],
  "correcta": 1,
  "explicacion": "El HTML mal anidado casi nunca 'rompe' la página de forma visible. El navegador detecta que </strong> llega mientras <em> sigue abierto y reconstruye la estructura por su cuenta — cerrando y reabriendo etiquetas para acabar con un árbol válido. El resultado se parece a lo que querías, pero no es fiable: cada motor puede reconstruirlo distinto. Cerrar en el orden correcto no es una preferencia de estilo, es lo único que garantiza que todos vean lo mismo."
}
```

## Lo que una etiqueta desconocida NO hace 👤

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El navegador no rechaza una etiqueta que no reconoce",
  "contenido": "Escribe <marcador-inventado>texto</marcador-inventado> en cualquier página: no hay error, no hay aviso. La trata como un elemento genérico sin ningún estilo ni comportamiento especial, y sigue mostrando el texto de dentro con normalidad."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Por eso una etiqueta mal escrita tampoco \"avisa\"",
  "contenido": "Si escribes <strogn> en vez de <strong> por error de tecleo, el navegador no dice nada — simplemente el texto no se pondrá en negrita, porque <strogn> es, para él, una etiqueta desconocida más."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto es justo lo que hace posibles los Web Components",
  "contenido": "Etiquetas personalizadas como <mi-componente> funcionan porque el navegador ya las acepta sintácticamente sin quejarse; solo les falta que JavaScript les defina un comportamiento. No es magia nueva, es esta misma tolerancia de HTML."
}
```

## Errores típicos 👤

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar cerrar una etiqueta que sí lo necesita.", "texto": "Confundir un elemento normal con uno vacío — pensar que, como <img> no lleva cierre, tampoco hace falta cerrar un <div> o un <p>. Solo el puñado de elementos vacíos (img, br, meta, input, hr, entre otros) se libran." },
    { "titulo": "Cerrar en el orden equivocado.", "texto": "<b><i>texto</b></i> en vez de <b><i>texto</i></b> — el cierre tiene que deshacer el anidamiento en orden inverso al de apertura, como una pila." },
    { "titulo": "Olvidar las comillas en un atributo con espacios.", "texto": "class=mi clase sin comillas solo asigna \"mi\" como valor y deja \"clase\" suelto como si fuera otro atributo sin valor. Las comillas no son opcionales en cuanto el valor tiene un espacio." },
    { "titulo": "Escribir un atributo booleano como si llevara valor de verdad.", "texto": "disabled=\"false\" sigue dejando el botón deshabilitado, porque el navegador solo comprueba si disabled está presente, no qué valor tiene. Para activarlo o no, se añade o se quita la etiqueta entera del atributo." },
    { "titulo": "Añadir una barra de cierre a una etiqueta que no es vacía pensando que así se cierra sola.", "texto": "<div /> no cierra el div en HTML5 — a diferencia de XML/XHTML, el navegador lo trata como una apertura normal y sigue esperando un </div> más adelante." }
  ]
}
```

## Ejercicios

1. Abre cualquier página web real con las herramientas de desarrollador y encuentra tres elementos distintos: uno normal con contenido de texto, uno con al menos dos atributos, y uno vacío/void.
2. Escribe un párrafo con un enlace dentro que se abra en una pestaña nueva, usando los atributos correctos y las comillas en su sitio.
3. Corrige este HTML mal anidado: `<p>Texto <strong>importante</p></strong>`.
4. Escribe un `<button>` que empiece deshabilitado usando un atributo booleano, y explica con tus palabras por qué `disabled="false"` no serviría para lo contrario.
5. Escribe en un archivo `<marcador-que-te-inventes>Hola</marcador-que-te-inventes>` y ábrelo en el navegador. ¿Da algún error? ¿Se ve el texto?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Basic HTML syntax",
      "descripcion": "El artículo de MDN que cubre elementos, atributos y las reglas básicas de sintaxis — la fuente principal de esta lección.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Overview of HTML",
      "descripcion": "El resumen de web.dev sobre la anatomía de una etiqueta y la estructura de un documento HTML.",
      "url": "https://web.dev/learn/html/overview",
      "etiqueta": "web.dev"
    }
  ]
}
```
