# Validación nativa: required, pattern y mensajes del navegador

- **Módulo:** Formularios
- **Slug:** `validacion-nativa-required-pattern-y-mensajes-del-navegador` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [Client-side form validation (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) + [Help users enter the right data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/validation) — ver `contenido/html/TEMARIO.md` #19

---

## Qué es y para qué sirve

Antes de escribir una sola línea de JavaScript, HTML ya sabe rechazar un formulario incompleto o mal escrito: `required` para lo obligatorio, `pattern` para un formato concreto, `minlength`/`maxlength` y `min`/`max` para límites de tamaño o rango. El navegador bloquea el envío y muestra un mensaje él solo. Es una ayuda real de experiencia de usuario — nunca, bajo ningún concepto, una medida de seguridad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué hace cada pieza de la validación nativa",
  "roles": [
    { "etiqueta": "required", "rol": "Exigir que el campo no esté vacío", "descripcion": "Bloquea el envío y muestra un mensaje si el campo (o, en un grupo de radio, todo el grupo) queda sin rellenar." },
    { "etiqueta": "pattern", "rol": "Exigir un formato concreto", "descripcion": "Una expresión regular que el valor tiene que cumplir entera — solo disponible en campos de texto, no en textarea." },
    { "etiqueta": "El servidor", "rol": "La validación que de verdad cuenta", "descripcion": "La del navegador se puede desactivar o saltar por completo modificando la petición — el servidor tiene que repetir siempre la comprobación." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando un campo no puede quedar vacío",
  "contenido": "required es la primera línea de defensa contra un envío incompleto — simple, sin JavaScript, y con un mensaje de error que el navegador genera solo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el valor tiene que seguir un formato concreto",
  "contenido": "Un código postal, una contraseña con reglas propias, un identificador con un patrón fijo — ahí pattern con una expresión regular hace el trabajo sin depender de JavaScript."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca como única defensa contra datos maliciosos",
  "contenido": "Cualquiera puede desactivar JavaScript, editar el HTML en las herramientas de desarrollador, o enviar la petición directamente sin pasar por el formulario — la validación real ocurre en el servidor."
}
```

## Cómo se usa: required

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<label for=\"nombre\">Nombre</label>\n<input type=\"text\" id=\"nombre\" name=\"nombre\" required>",
  "anotaciones": [
    { "fragmento": "required", "nota": "Sin valor propio — su sola presencia basta. El navegador bloquea el envío del formulario y muestra un mensaje si el campo queda vacío." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<input type=\"radio\" name=\"plan\" value=\"basico\" required>\n<input type=\"radio\" name=\"plan\" value=\"pro\">\n<!-- Solo el primero lleva required -->",
  "opciones": [
    "Hace falta marcar OBLIGATORIAMENTE el primer radio en concreto",
    "Basta con marcar CUALQUIERA de los dos del grupo para que sea válido",
    "El formulario nunca se puede enviar porque falta required en el segundo"
  ],
  "correcta": 1,
  "explicacion": "required en un grupo de radio (mismo name) exige que UNO cualquiera del grupo esté marcado, no necesariamente el que lleva escrito el atributo. Basta con ponerlo en uno solo del grupo para que todo el grupo quede cubierto."
}
```

## pattern: validación con expresiones regulares

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input\n  type=\"text\"\n  name=\"fruta\"\n  required\n  pattern=\"[Bb]anana|[Cc]ereza\">",
  "anotaciones": [
    { "fragmento": "pattern=\"[Bb]anana|[Cc]ereza\"", "nota": "Una expresión regular: [Bb] acepta \"B\" o \"b\", el | separa dos opciones válidas — aquí solo \"banana\", \"Banana\", \"cereza\" o \"Cereza\" pasan la validación." }
  ]
}
```

## Límites de longitud y de rango

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input\n  type=\"text\"\n  name=\"codigo\"\n  minlength=\"6\"\n  maxlength=\"6\">\n\n<input\n  type=\"number\"\n  name=\"cantidad\"\n  min=\"1\"\n  max=\"10\">",
  "anotaciones": [
    { "fragmento": "minlength=\"6\"\n  maxlength=\"6\"", "nota": "Exige EXACTAMENTE 6 caracteres, ni menos ni más. Solo se comprueba lo que la persona escribe a mano, no un valor puesto por JavaScript." },
    { "fragmento": "min=\"1\"\n  max=\"10\"", "nota": "El navegador impide subir o bajar de esos límites con las flechas del spinner, pero escribir un número fuera de rango a mano sí se puede — queda marcado como inválido, no bloqueado al teclearlo." }
  ]
}
```

## Estilar según el estado: :valid, :invalid y un problema real de UX

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  input:invalid { border: 3px solid crimson; }\n</style>\n<label for=\"correo\">Correo electrónico</label>\n<input type=\"email\" id=\"correo\" required>",
  "despues": "<style>\n  input:user-invalid { border: 3px solid crimson; }\n</style>\n<label for=\"correo2\">Correo electrónico</label>\n<input type=\"email\" id=\"correo2\" required>",
  "nota": "Ninguno de los dos campos ha sido tocado todavía. El de antes ya se ve en rojo con :invalid — un campo vacío y required ES inválido desde el primer instante, aunque nadie haya tenido ocasión de escribir nada. El de después, con :user-invalid, se queda neutral hasta que la persona interactúa de verdad con el campo y lo deja inválido — la experiencia que casi siempre se busca."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca indiques un error solo con color",
  "contenido": "Quien no distingue bien los colores se queda sin saber qué campo falló si el único aviso es un borde rojo. Hace falta también texto o un icono — y conectar ese mensaje al campo con aria-describedby, para que un lector de pantalla lo relacione correctamente."
}
```

## Lo que la validación nativa NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si el navegador ya valida, no hace falta hacerlo también en el servidor",
      "realidad": "La validación del navegador es solo UX — se puede desactivar o saltar por completo modificando la petición directamente; el servidor SIEMPRE tiene que validar de nuevo."
    },
    {
      "mito": ":invalid solo se activa cuando el usuario se equivoca escribiendo",
      "realidad": "Un campo required vacío ya es :invalid desde el primer render, antes de que nadie haya interactuado — por eso :user-invalid, que solo se activa tras una interacción real, suele dar mejor experiencia."
    },
    {
      "mito": "novalidate desactiva toda la validación, incluida la de JavaScript",
      "realidad": "Solo desactiva los mensajes automáticos del navegador y el bloqueo del envío — la Constraint Validation API (checkValidity, validity, setCustomValidity) sigue funcionando exactamente igual."
    },
    {
      "mito": "pattern funciona igual en textarea que en input",
      "realidad": "pattern no existe para textarea — solo está disponible en input de tipo texto y similares."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No validar también en el servidor.", "texto": "La validación del navegador es solo una ayuda de experiencia — cualquiera puede saltársela modificando la petición directamente." },
    { "titulo": "Usar :invalid para dar feedback visual desde el primer momento.", "texto": "Marca en rojo campos que el usuario ni siquiera ha tocado todavía — :user-invalid evita ese efecto confuso." },
    { "titulo": "Indicar un error solo con color.", "texto": "Quien no distingue bien los colores se queda sin saber qué campo falló — hace falta también texto o un icono, no solo un borde rojo." },
    { "titulo": "Escribir mensajes de error sin conectarlos al campo con aria-describedby.", "texto": "Sin esa asociación, un lector de pantalla puede no relacionar el mensaje de error con el campo al que corresponde." }
  ]
}
```

## Ejercicios

1. Escribe un campo de contraseña con required, minlength="8" y un pattern que exija al menos una letra y un número.
2. Escribe CSS que dé estilo distinto a un campo según :valid y :invalid, incluyendo algo más que solo el color.
3. Cambia ese mismo CSS para usar :user-invalid en vez de :invalid, y explica con tus palabras qué cambia en la experiencia.
4. Escribe un formulario con novalidate y explica qué sigue funcionando (la Constraint Validation API) y qué deja de funcionar (los mensajes automáticos del navegador).

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe el campo de contraseña del ejercicio 1 (required, minlength=\"8\", un pattern con letra y número). Después, en la pestaña CSS, dale estilo con :valid y :invalid — escribe y borra en la vista previa para ver cómo cambia en vivo.",
  "html": "<!-- Empieza aquí -->",
  "css": "/* prueba: input:invalid { ... } input:valid { ... } */",
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
      "titulo": "Client-side form validation",
      "descripcion": "Guía de referencia de MDN sobre required, pattern, minlength/maxlength, min/max, la Constraint Validation API y novalidate.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Help users enter the right data in forms",
      "descripcion": "Curso de web.dev Learn Forms centrado en accesibilidad de la validación: aria-describedby, y por qué no depender solo del color.",
      "url": "https://web.dev/learn/forms/validation",
      "etiqueta": "web.dev"
    }
  ]
}
```
