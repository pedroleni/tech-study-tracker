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
    { "titulo": "Añadir un botón reset sin una razón de peso.", "texto": "Es fácil pulsarlo por error y perder todo lo escrito, sin ninguna forma de deshacerlo." }
  ]
}
```

## Ejercicios

1. Escribe un form con action y method explícitos para un formulario de búsqueda — ¿qué método elegiste, y por qué?
2. Escribe dos campos con su label correctamente asociado mediante for/id.
3. Explica con tus palabras qué pasaría si envías una contraseña con method="get" en vez de "post".
4. Escribe un botón de envío usando button (con algo de HTML dentro, como un icono o una palabra en negrita) en vez de input type="submit".

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
    }
  ]
}
```
