# Formularios: anatomía completa

- **Módulo:** Formularios
- **Slug:** `formularios-anatomia-completa` (autogenerado del título)
- **Orden:** 95
- **Fuentes:** [Your first form (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form) + [Use forms to get data from users (web.dev Learn Forms)](https://web.dev/learn/forms/form-element) — ver `contenido/html/TEMARIO.md` #20

---

## Qué es y para qué sirve

`<form>` es el contenedor que convierte un puñado de campos sueltos en algo que de verdad recoge y envía datos. Sin JavaScript, sin ninguna configuración adicional — el navegador sabe empaquetar los valores y mandarlos a donde le digas, con solo tres piezas: `action` (adónde), `method` (cómo) y `name` en cada campo (qué clave lleva cada dato).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué hace cada pieza mínima de un formulario",
  "roles": [
    { "etiqueta": "form", "rol": "Definir adónde y cómo se envían los datos", "descripcion": "action dice la URL de destino, method dice si van visibles en la URL (get) u ocultos en el cuerpo de la petición (post)." },
    { "etiqueta": "name en cada campo", "rol": "Dar una clave a cada dato", "descripcion": "Sin name, ese campo ni siquiera llega al servidor — es la clave con la que el backend identifica cada valor recibido." },
    { "etiqueta": "label con for", "rol": "Asociar el texto con su campo de verdad", "descripcion": "Permite hacer clic en el texto para activar el campo, y es lo que un lector de pantalla anuncia al llegar a él — no ocurre solo por estar cerca visualmente." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando necesitas recoger datos de quien visita la página",
  "contenido": "Un formulario de contacto, un buscador, un registro — cualquier caso donde la página necesita RECIBIR algo, no solo mostrar contenido."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el resultado tiene sentido compartido o guardado en marcadores",
  "contenido": "Una búsqueda con method=\"get\" deja la consulta en la propia URL — se puede copiar, compartir o guardar en marcadores tal cual, con los resultados incluidos."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando los datos son sensibles o cambian algo en el servidor",
  "contenido": "Una contraseña, un pago, cualquier acción que modifique datos — ahí method=\"post\" es obligatorio: oculta los valores del cuerpo de la petición, fuera de la URL y del historial del navegador."
}
```

## Cómo se usa: form, action y method

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un form, atributo por atributo",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "form", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "action", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"/enviar\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "method", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"post\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

## GET vs POST: dónde acaban los datos

| Método | Dónde van los datos | Cuándo usarlo |
|---|---|---|
| `get` (por defecto) | En la propia URL, como query string | Búsquedas, filtros — algo con sentido de compartir o guardar en marcadores |
| `post` | En el cuerpo de la petición, no en la URL | Datos sensibles (contraseñas, pagos) o que cambian algo en el servidor |

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<form action=\"/buscar\" method=\"get\">\n  <input type=\"text\" name=\"q\" value=\"gatos\">\n  <button type=\"submit\">Buscar</button>\n</form>",
  "opciones": [
    "Los datos viajan ocultos en el cuerpo de la petición, invisibles en la URL",
    "El navegador navega a algo como /buscar?q=gatos, con los datos visibles en la URL",
    "El formulario no se envía porque falta method=\"post\""
  ],
  "correcta": 1,
  "explicacion": "Con method=\"get\" (el valor por defecto), el navegador añade cada campo como par nombre=valor a la URL de destino, separados por &. Es lo que hace posible compartir o guardar en marcadores el resultado de una búsqueda — la propia URL contiene la consulta."
}
```

## enctype: cómo se codifica el cuerpo de la petición

Con `method="post"`, los datos van en el cuerpo de la petición — pero ¿en qué formato exactamente? Eso lo decide `enctype`, y el navegador elige por defecto uno que casi nunca sirve en cuanto el formulario sube archivos.

| `enctype` | Cómo codifica los datos | Cuándo usarlo |
|---|---|---|
| `application/x-www-form-urlencoded` (por defecto) | Pares `nombre=valor` separados por `&`, con los caracteres especiales escapados (espacio → `+`, tildes y símbolos → `%XX`) | Texto normal: nombres, emails, mensajes — la mayoría de formularios |
| `multipart/form-data` | Cada campo en su propio bloque, separados por un boundary, cada uno con su propia cabecera | Obligatorio en cuanto el formulario tiene un `input type="file"` |
| `text/plain` | Como urlencoded pero SIN escapar los caracteres especiales | Casi nunca — solo para depurar a simple vista; el resultado no es fiable de volver a interpretar |

Esto no es teoría — es el cuerpo real que un navegador de verdad envía al enviar un formulario con nombre="Ana García" y correo="ana@ejemplo.com":

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "nombre=Ana+Garc%C3%ADa&correo=ana%40ejemplo.com",
  "anotaciones": [
    { "fragmento": "Ana+Garc%C3%ADa", "nota": "Así codifica application/x-www-form-urlencoded el valor real \"Ana García\": el espacio se convierte en +, y la í (un carácter no-ASCII) se convierte en su secuencia UTF-8 con cada byte escapado como %XX." },
    { "fragmento": "ana%40ejemplo.com", "nota": "El símbolo @ tampoco es seguro dentro de esta codificación, así que se escapa como %40 — %XX es siempre el código hexadecimal de un byte." },
    { "fragmento": "&", "nota": "Separa cada par nombre=valor del siguiente — el mismo carácter que ya viste en la query string de una petición GET, porque es exactamente el mismo formato." }
  ]
}
```

Y esto es lo que envía ESE MISMO formulario con `enctype="multipart/form-data"` en su lugar:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "------WebKitFormBoundary4FxKrwOAYqLsAmMS\nContent-Disposition: form-data; name=\"nombre\"\n\nAna García\n------WebKitFormBoundary4FxKrwOAYqLsAmMS\nContent-Disposition: form-data; name=\"correo\"\n\nana@ejemplo.com\n------WebKitFormBoundary4FxKrwOAYqLsAmMS--",
  "anotaciones": [
    { "fragmento": "------WebKitFormBoundary4FxKrwOAYqLsAmMS", "nota": "Un boundary (delimitador) generado al azar por el navegador — separa un campo del siguiente. Su valor exacto viaja también en la cabecera Content-Type, para que el servidor sepa qué buscar." },
    { "fragmento": "Content-Disposition: form-data; name=\"nombre\"", "nota": "Cada campo lleva su propia mini-cabecera con el name — por eso este formato SÍ puede transportar el contenido de un archivo entero sin necesidad de escapar nada dentro." },
    { "fragmento": "Ana García", "nota": "El valor va tal cual, sin codificar espacios ni tildes — muy distinto de application/x-www-form-urlencoded, y la razón por la que este formato es obligatorio para archivos binarios." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<form action=\"/subir\" method=\"post\">\n  <input type=\"file\" name=\"foto\">\n  <button type=\"submit\">Subir</button>\n</form>\n<!-- Sin enctype -->",
  "opciones": [
    "El archivo se sube completo, enctype es opcional para los input file",
    "Solo se envía el nombre del archivo como texto, no su contenido",
    "El navegador añade multipart/form-data automáticamente al detectar un input file"
  ],
  "correcta": 1,
  "explicacion": "Sin enctype=\"multipart/form-data\" explícito, el formulario usa application/x-www-form-urlencoded por defecto — un formato de texto que no sabe transportar los bytes de un archivo. El servidor recibe solo el nombre del archivo como una cadena de texto, nunca su contenido real."
}
```

## Cómo llegan los datos: el atributo name

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<form action=\"/registro\" method=\"post\">\n  <input type=\"text\" name=\"nombre_usuario\">\n  <input type=\"email\" name=\"correo_usuario\">\n</form>",
  "anotaciones": [
    { "fragmento": "name=\"nombre_usuario\"", "nota": "El servidor recibe este dato bajo la clave nombre_usuario — sin name, ese valor ni siquiera se envía, por muy bien rellenado que esté en pantalla." },
    { "fragmento": "name=\"correo_usuario\"", "nota": "Cada campo necesita su propio name — son las claves con las que el backend identifica cada dato recibido, como un pequeño diccionario clave-valor." }
  ]
}
```

## Asociar cada campo con su etiqueta: label y for

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<label for=\"email\">Correo electrónico</label>\n<input type=\"email\" id=\"email\" name=\"user_email\">",
  "anotaciones": [
    { "fragmento": "for=\"email\"", "nota": "Coincide EXACTAMENTE con el id del campo — esa coincidencia es lo que crea la asociación, no la cercanía visual en el HTML." },
    { "fragmento": "id=\"email\"", "nota": "El id que referencia el for de arriba. Sin esta pareja for/id, el label es solo texto suelto: no ayuda a activar el campo con un clic ni a que un lector de pantalla lo anuncie." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<label for=\"email\">Correo</label>\n<input type=\"email\" id=\"email\" name=\"user_email\">",
  "opciones": [
    "Nada especial — el label es solo un texto informativo junto al campo",
    "Al hacer clic en el texto \"Correo\", el foco pasa al campo de email",
    "El navegador ignora el for porque el label no está anidado dentro del input"
  ],
  "correcta": 1,
  "explicacion": "El atributo for de un label, cuando coincide con el id de un campo, convierte todo el texto del label en una zona clicable que activa ese campo — el foco salta a él igual que si hubieras hecho clic directamente encima. Funciona sin ninguna línea de JavaScript."
}
```

## Enviar o limpiar: button y sus tipos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<button type=\"submit\">Enviar <strong>mensaje</strong></button>\n\n<input type=\"submit\" value=\"Enviar mensaje\">\n\n<button type=\"reset\">Borrar todo</button>",
  "anotaciones": [
    { "fragmento": "<button type=\"submit\">Enviar <strong>mensaje</strong></button>", "nota": "button acepta HTML completo dentro — aquí una palabra en negrita, o podría llevar un icono. Mismo comportamiento que un input submit, con más libertad de contenido." },
    { "fragmento": "<input type=\"submit\" value=\"Enviar mensaje\">", "nota": "input type=\"submit\" solo admite texto plano como etiqueta, a través de value — nada de HTML dentro." },
    { "fragmento": "<button type=\"reset\">Borrar todo</button>", "nota": "Vacía todos los campos a su valor por defecto de golpe, sin posibilidad de deshacerlo — mala práctica de UX salvo que haya una razón de peso real." }
  ]
}
```

## Compruébalo tú mismo: qué envía un formulario de verdad

Todo lo de arriba no hay que creérselo de memoria — las herramientas de desarrollador de cualquier navegador dejan ver la petición real, byte a byte, cada vez que se envía un formulario. Antes de tocar los formularios de abajo, ábrelas:

1. Pulsa F12 (o clic derecho sobre la página → "Inspeccionar"; en Mac, Cmd+Opción+I).
2. Ve a la pestaña **Network** ("Red" en español).
3. Marca la casilla **Preserve log** ("Conservar registro") — sin ella, al navegar tras enviar el formulario el navegador borra la lista de peticiones anteriores.
4. Rellena y envía cualquiera de los formularios de abajo. Aparecerá una petición nueva con destino httpbin.org.
5. Haz clic en ella. Ahí está todo lo de esta lección, pero de verdad: el método, la URL completa, y en POST, el cuerpo exacto que se envió.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Headers (Cabeceras)", "texto": "Request Method (GET o POST), Request URL completa, y en POST, la cabecera Content-Type — ahí se ve literalmente application/x-www-form-urlencoded o multipart/form-data, tal y como se explicó arriba." },
    { "titulo": "Payload / Form Data", "texto": "Solo aparece en POST. El navegador lo muestra ya interpretado, campo a campo — con la opción \"view source\" (o equivalente) se ve el cuerpo tal cual, sin interpretar, igual que en los ejemplos anotados de arriba." },
    { "titulo": "Response", "texto": "La respuesta que envía el servidor. En los formularios de abajo, httpbin.org devuelve exactamente lo que recibió, en JSON — sirve para confirmar que lo que creías enviar es lo que de verdad llegó." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿Por qué httpbin.org?",
  "contenido": "Es un servicio público hecho exactamente para esto: recibe cualquier petición y devuelve un eco de lo que recibió — método, cabeceras, cuerpo. No es tuyo ni lo controlas, así que no envíes ahí ningún dato real o sensible — pero para practicar con datos de ejemplo como los de abajo es perfecto, y es justo lo que usan muchos tutoriales y documentaciones de HTTP para lo mismo."
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un GET real: mira cómo la query string acaba en la URL",
  "consigna": "Con la pestaña Network abierta (pasos de arriba), cambia el valor del input y pulsa Buscar. La vista previa mostrará la respuesta real de httpbin.org — y en tu Network real, fíjate en que ni siquiera hace falta mirar Payload: todo está ya en la propia Request URL.",
  "html": "<form action=\"https://httpbin.org/get\" method=\"get\">\n  <input type=\"text\" name=\"q\" value=\"gatos\">\n  <button type=\"submit\">Buscar</button>\n</form>",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un POST real: application/x-www-form-urlencoded",
  "consigna": "Cambia los valores y pulsa Enviar. La respuesta de httpbin.org (el campo \"form\" de su JSON) es la prueba de qué llegó de verdad al servidor. En tu Network real, mira la pestaña Payload de esta petición y compárala con el ejemplo anotado de más arriba.",
  "html": "<form action=\"https://httpbin.org/post\" method=\"post\">\n  <label for=\"nombre-post\">Nombre</label>\n  <input type=\"text\" id=\"nombre-post\" name=\"nombre\" value=\"Ana García\">\n  <label for=\"correo-post\">Correo</label>\n  <input type=\"email\" id=\"correo-post\" name=\"correo\" value=\"ana@ejemplo.com\">\n  <button type=\"submit\">Enviar</button>\n</form>",
  "css": "form {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  max-width: 280px;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El mismo formulario, con enctype=\"multipart/form-data\"",
  "consigna": "Mismos campos, mismos valores — la única diferencia es enctype. Envíalo y compara: el Content-Type que ves en \"headers\" cambia, form sigue mostrando los mismos datos recibidos, pero el cuerpo real que viajó (el que verías en tu Network, Payload → view source) es completamente distinto, como en el ejemplo anotado de más arriba.",
  "html": "<form action=\"https://httpbin.org/post\" method=\"post\" enctype=\"multipart/form-data\">\n  <label for=\"nombre-multi\">Nombre</label>\n  <input type=\"text\" id=\"nombre-multi\" name=\"nombre\" value=\"Ana García\">\n  <label for=\"correo-multi\">Correo</label>\n  <input type=\"email\" id=\"correo-multi\" name=\"correo\" value=\"ana@ejemplo.com\">\n  <button type=\"submit\">Enviar</button>\n</form>",
  "css": "form {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  max-width: 280px;\n}",
  "pestañaInicial": "html"
}
```

## Lo que un formulario NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si se omite action, el formulario simplemente no envía nada",
      "realidad": "Si se omite, el formulario se envía a la propia URL de la página actual — no es que no pase nada, es que el destino por defecto es \"aquí mismo\"."
    },
    {
      "mito": "GET y POST son intercambiables, la diferencia es solo de nombre",
      "realidad": "GET expone los datos en la URL, visibles y guardados en el historial; POST los oculta en el cuerpo de la petición. Usar GET para una contraseña la dejaría escrita en el historial del navegador."
    },
    {
      "mito": "Un label cerca de un input ya está asociado a él",
      "realidad": "La cercanía visual no crea ninguna asociación real — hace falta que for coincida con el id (o envolver el input dentro del propio label) para que la relación exista de verdad."
    },
    {
      "mito": "type=\"reset\" es útil porque da una forma de empezar de nuevo",
      "realidad": "Es una trampa clásica de UX — un clic accidental borra todo el formulario sin ninguna forma de deshacerlo, así que se desaconseja salvo que haya una razón real de peso."
    },
    {
      "mito": "Un input type=\"file\" funciona igual sin importar el enctype del formulario",
      "realidad": "Sin enctype=\"multipart/form-data\", el formulario usa application/x-www-form-urlencoded por defecto — un formato de texto que no sabe transportar los bytes de un archivo. Solo llega el nombre del archivo, nunca su contenido."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Omitir el atributo name en un campo.", "texto": "Sin él, ese campo ni siquiera se envía al servidor, por muy bien que se vea rellenado en pantalla." },
    { "titulo": "Usar GET para datos sensibles o que cambian algo en el servidor.", "texto": "Quedan visibles en la URL y en el historial del navegador — POST es el que corresponde en ese caso." },
    { "titulo": "Dejar un label sin for, confiando en la cercanía visual.", "texto": "Sin la asociación real, se pierde tanto el clic-para-enfocar como el anuncio correcto en un lector de pantalla." },
    { "titulo": "Añadir un botón reset sin una razón de peso.", "texto": "Es fácil pulsarlo por error y perder todo lo escrito, sin ninguna forma de deshacerlo." },
    { "titulo": "Olvidar enctype=\"multipart/form-data\" en un formulario con archivos.", "texto": "El formulario se envía igualmente, sin ningún error visible — pero el archivo nunca llega, solo su nombre como texto. Un fallo silencioso, difícil de detectar sin mirar la petición real en Network." }
  ]
}
```

## Ejercicios

1. Escribe un form con action y method explícitos para un formulario de búsqueda — ¿qué método elegiste, y por qué?
2. Escribe dos campos con su label correctamente asociado mediante for/id.
3. Explica con tus palabras qué pasaría si envías una contraseña con method="get" en vez de "post".
4. Escribe un botón de envío usando button (con algo de HTML dentro, como un icono o una palabra en negrita) en vez de input type="submit".
5. Con las herramientas de desarrollador abiertas (Network, Preserve log activado), envía el formulario GET de esta lección y copia aquí la Request URL completa que ves.
6. Repite lo mismo con el formulario POST de application/x-www-form-urlencoded — copia el Content-Type exacto y el cuerpo (Payload) que ves.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe dos campos con su label asociado mediante for/id (ejercicio 2) — haz clic en el texto del label en la vista previa y comprueba que el foco salta al campo. Después escribe el botón de envío con button en vez de input type=\"submit\" (ejercicio 4).",
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
      "titulo": "Your first form",
      "descripcion": "Guía de referencia de MDN sobre form, action, method, name, label y los tipos de button.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Use forms to get data from users",
      "descripcion": "Curso de web.dev Learn Forms sobre GET vs POST y el envío de formularios sin necesidad de JavaScript.",
      "url": "https://web.dev/learn/forms/form-element",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Sending form data",
      "descripcion": "Guía de referencia de MDN sobre cómo viajan de verdad los datos de un formulario: GET frente a POST, y los tres valores de enctype con ejemplos de servidor.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_and_retrieving_form_data",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Inspect network activity",
      "descripcion": "Guía oficial de Chrome DevTools sobre el panel Network: cómo leer las cabeceras, el payload y la respuesta de cualquier petición real, paso a paso.",
      "url": "https://developer.chrome.com/docs/devtools/network",
      "etiqueta": "Chrome DevTools"
    }
  ]
}
```
