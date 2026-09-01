# Campos de formulario: tipos de input y cuándo usar cada uno

- **Módulo:** Formularios
- **Slug:** `campos-de-formulario-tipos-de-input-y-cuando-usar-cada-uno` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [The HTML5 input types (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types) + [Help users enter data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/form-fields) — ver `contenido/html/TEMARIO.md` #21

---

## Qué es y para qué sirve

`<input>` es una sola etiqueta con más de veinte personalidades distintas, todas controladas por su atributo `type`. Elegir el tipo correcto no es un detalle cosmético: cambia el teclado que aparece en el móvil, activa una validación básica gratis, y a veces sustituye por completo lo que de otra forma tendrías que construir a mano con JavaScript — un selector de fecha, un slider, un selector de color nativo del sistema.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué gana quien rellena el formulario con el tipo correcto",
  "roles": [
    { "etiqueta": "Quien usa el móvil", "rol": "Ver el teclado adecuado", "descripcion": "type=\"email\" muestra el @ a mano; type=\"tel\" muestra un teclado numérico — sin escribir ni una línea de JavaScript." },
    { "etiqueta": "El navegador", "rol": "Validar el formato básico solo", "descripcion": "email y url comprueban que el formato sea plausible antes de enviar el formulario — una primera barrera, nunca la única." },
    { "etiqueta": "Lector de pantalla", "rol": "Saber qué tipo de dato se espera", "descripcion": "Cada tipo lleva su propio rol implícito (spinbutton para number, slider para range) — información real, no solo decoración visual." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el dato tiene un formato reconocible",
  "contenido": "email, tel, url, date... siempre que el dato encaje en uno de los tipos especializados, úsalo — el navegador hace parte del trabajo gratis, sin JavaScript de por medio."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el valor exacto importa menos que el rango",
  "contenido": "range para \"más o menos aquí\", number para un valor preciso — la diferencia real es si necesitas saber el número exacto o solo una posición aproximada."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando hay que elegir entre varias opciones",
  "contenido": "checkbox para elegir varias a la vez, radio para elegir solo una de un grupo — la semántica de cada uno ya deja claro cuántas opciones se pueden marcar."
}
```

## Texto libre con superpoderes: email, tel, url y search

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input type=\"email\" name=\"correo\">\n<input type=\"tel\" name=\"telefono\">\n<input type=\"url\" name=\"web\">\n<input type=\"search\" name=\"buscar\">",
  "anotaciones": [
    { "fragmento": "type=\"email\"", "nota": "Teclado con @ en móvil, y una validación básica de formato antes de enviar — \"a@b\" ya se considera válido, sin ser una dirección real." },
    { "fragmento": "type=\"tel\"", "nota": "Teclado numérico en móvil, pero SIN ninguna validación de formato — los teléfonos varían demasiado entre países como para que el navegador imponga una forma fija." },
    { "fragmento": "type=\"url\"", "nota": "Exige un formato de URL bien formado, con su protocolo (http: o similar) incluido." },
    { "fragmento": "type=\"search\"", "nota": "Se ve con esquinas redondeadas en algunos navegadores y suele incluir un botón para vaciarlo — además, el navegador recuerda búsquedas anteriores del mismo sitio." }
  ]
}
```

## Números y rangos: number y range

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input type=\"number\" name=\"edad\" min=\"0\" max=\"120\" step=\"1\">\n\n<input type=\"range\" name=\"precio\" min=\"50000\" max=\"500000\" step=\"1000\" value=\"250000\">",
  "anotaciones": [
    { "fragmento": "type=\"number\" name=\"edad\" min=\"0\" max=\"120\" step=\"1\"", "nota": "Campo de texto con flechas para subir o bajar de uno en uno — pensado para un valor PRECISO dentro de un rango razonable." },
    { "fragmento": "type=\"range\" name=\"precio\" min=\"50000\" max=\"500000\" step=\"1000\" value=\"250000\"", "nota": "Un slider visual — pensado para \"más o menos aquí\", no para leer el número exacto: el propio control no muestra el valor en pantalla sin ayuda extra." }
  ]
}
```

## Fechas y horas: date, time y datetime-local

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input type=\"date\" name=\"fecha\">\n<input type=\"time\" name=\"hora\">\n<input type=\"datetime-local\" name=\"cita\">",
  "anotaciones": [
    { "fragmento": "type=\"date\"", "nota": "Abre un selector de calendario nativo del sistema — año, mes y día, sin hora." },
    { "fragmento": "type=\"time\"", "nota": "Selector de hora — se muestra en formato de 12 horas en muchos sistemas, pero el valor que se envía siempre es de 24 horas." },
    { "fragmento": "type=\"datetime-local\"", "nota": "Combina fecha y hora en un único selector, sin ninguna información de zona horaria." }
  ]
}
```

## Elegir entre opciones: checkbox, radio y su name compartido

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<fieldset>\n  <legend>¿Qué tecnología prefieres?</legend>\n  <input type=\"radio\" id=\"html\" name=\"tecnologia\" value=\"html\">\n  <label for=\"html\">HTML</label>\n\n  <input type=\"radio\" id=\"css\" name=\"tecnologia\" value=\"css\">\n  <label for=\"css\">CSS</label>\n</fieldset>",
  "anotaciones": [
    { "fragmento": "name=\"tecnologia\"", "nota": "Los dos radio comparten el MISMO name — eso es lo que los agrupa: marcar uno desmarca automáticamente cualquier otro con el mismo name, sin JavaScript." },
    { "fragmento": "id=\"html\"", "nota": "Cada radio necesita su propio id distinto (a diferencia del name, que se repite a propósito) para que su label individual pueda apuntar a él con for." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<input type=\"radio\" name=\"plan\" value=\"basico\" checked>\n<input type=\"radio\" name=\"plan\" value=\"pro\">\n<!-- El usuario hace clic en el segundo radio -->",
  "opciones": [
    "Los dos quedan marcados a la vez, porque cada uno es independiente",
    "El primero se desmarca automáticamente al marcar el segundo",
    "No pasa nada, porque el primero ya tenía el atributo checked"
  ],
  "correcta": 1,
  "explicacion": "Todos los radio que comparten el mismo name forman un grupo — solo uno puede estar marcado a la vez. Marcar el segundo desmarca automáticamente el primero, sin ninguna línea de JavaScript."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "color abre el selector nativo del sistema",
  "contenido": "type=\"color\" abre directamente el selector de color del sistema operativo, y siempre devuelve un valor hexadecimal de 6 dígitos en minúsculas (por ejemplo #3366ff) — sin necesitar ninguna librería externa."
}
```

## placeholder no es un label

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<input type=\"email\" name=\"correo\" placeholder=\"Tu correo electrónico\">",
  "despues": "<label for=\"correo2\">Tu correo electrónico</label>\n<input type=\"email\" id=\"correo2\" name=\"correo\" placeholder=\"nombre@ejemplo.com\">",
  "nota": "En la versión de antes, el placeholder desaparece en cuanto empiezas a escribir, y muchos lectores de pantalla ni siquiera lo anuncian como si fuera una etiqueta real. En la de después, el label queda siempre visible encima del campo, y el placeholder pasa a cumplir su papel real: un EJEMPLO de formato, no la única pista de qué es el campo."
}
```

## Lo que un tipo de input NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "placeholder puede sustituir al label",
      "realidad": "Desaparece en cuanto se escribe, y el soporte de lectores de pantalla para tratarlo como una etiqueta real es inconsistente — un label siempre debe estar presente, se vea o no visualmente."
    },
    {
      "mito": "Si el navegador valida el email, no hace falta validarlo también en el servidor",
      "realidad": "La validación del navegador es solo una ayuda de UX, fácil de saltarse — todo dato debe validarse también en el servidor."
    },
    {
      "mito": "number es la opción por defecto para cualquier número, incluido un código postal",
      "realidad": "Para números que no se incrementan de verdad, como un código postal, tel suele ser mejor — evita unas flechas de spinner que no pintan nada ahí, y sigue dando teclado numérico en móvil."
    },
    {
      "mito": "Todos los radio de una página forman un único grupo",
      "realidad": "El grupo lo define el name, no la página entera ni el fieldset que los envuelve — dos conjuntos de radio con distinto name son grupos totalmente independientes, aunque estén uno al lado del otro."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar placeholder en vez de label.", "texto": "Desaparece al escribir y muchos lectores de pantalla no lo tratan como una etiqueta real — siempre hace falta un label, aunque se oculte visualmente con CSS." },
    { "titulo": "Confiar solo en la validación del navegador.", "texto": "Es una ayuda de UX, no una medida de seguridad — se puede desactivar o saltar fácilmente; el servidor tiene que validar también." },
    { "titulo": "Repetir el mismo name en radio que deberían ser independientes.", "texto": "Agrupa sin querer controles que no tenían que competir entre sí, y uno desmarca al otro sin que se busque ese comportamiento." },
    { "titulo": "Usar number para códigos postales o números de tarjeta.", "texto": "Añade flechas de spinner que no tienen sentido ahí y puede alterar el formato — tel suele encajar mejor para esos casos." }
  ]
}
```

## Ejercicios

1. Escribe un formulario de contacto con los tipos de input adecuados para nombre, correo, teléfono y un mensaje.
2. Escribe un grupo de 3 radio buttons con el mismo name y sus label correctamente asociados con for/id.
3. Escribe un input type="range" para elegir un precio máximo, con min, max, step y value.
4. Reescribe un campo que solo tenga placeholder (sin label) añadiéndole un label real, sin quitar el placeholder.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe el formulario de contacto del ejercicio 1 con los tipos de input adecuados para nombre, correo, teléfono y mensaje. Fíjate en la vista previa qué teclado/comportamiento sugiere cada tipo.",
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
      "titulo": "The HTML5 input types",
      "descripcion": "Guía de referencia de MDN con todos los tipos de input, sus atributos propios (min, max, step) y su comportamiento en distintos navegadores.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Help users enter data in forms",
      "descripcion": "Curso de web.dev Learn Forms sobre checkbox, radio, select y cómo agrupar controles relacionados.",
      "url": "https://web.dev/learn/forms/form-fields",
      "etiqueta": "web.dev"
    }
  ]
}
```
