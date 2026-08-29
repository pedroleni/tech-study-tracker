# Proyecto: formulario de contacto accesible de verdad

- **Módulo:** Proyectos
- **Slug:** `proyecto-formulario-de-contacto-accesible-de-verdad` (autogenerado del título)
- **Orden:** 210
- **Requiere:** Módulo 6 (formularios) y las lecciones 19-20 (validación nativa, formularios accesibles)

---

## Qué vas a construir

Un formulario de contacto real, de los que aparecen en cualquier web: nombre, correo, asunto (una elección entre varias opciones) y mensaje. La parte fácil es que se vea bien — el CSS ya está puesto. La parte que de verdad se pone a prueba aquí es que cada campo tenga su label bien asociado, que el campo obligatorio se marque de forma que un lector de pantalla lo entienda, y que la validación nativa haga su trabajo antes de que nada llegue a ningún servidor.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que este formulario pone a prueba de verdad",
  "roles": [
    { "etiqueta": "label real", "rol": "for/id o input envuelto", "descripcion": "No un texto suelto que se ve al lado — una asociación programática de verdad." },
    { "etiqueta": "fieldset/legend", "rol": "Agrupar el asunto", "descripcion": "El asunto es un grupo de opciones relacionadas — necesita su propio nombre de grupo, no solo el label de cada opción por separado." },
    { "etiqueta": "Validación nativa", "rol": "required + type correcto", "descripcion": "El navegador ya sabe rechazar un envío incompleto o un correo mal escrito, sin una línea de JavaScript." }
  ]
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Este formulario no envía nada de verdad",
  "contenido": "No hay ningún servidor detrás del action de este ejercicio — el objetivo es la estructura y la accesibilidad, no el backend. En un proyecto real, action apuntaría a tu propio endpoint."
}
```

## Paso 1: nombre y correo

Dos campos, cada uno con su propio `label` asociado mediante `for`/`id`. El de correo, con `type="email"` y `required`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: nombre y correo",
  "consigna": "Escribe un form con action=\"#\" y method=\"post\". Dentro, un label+input para el nombre (required) y otro para el correo (type=\"email\", required).",
  "html": "<!-- <form action=\"#\" method=\"post\">\n  ...\n</form> -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; }\nform { max-width: 420px; margin: 1rem auto; display: flex; flex-direction: column; gap: 1rem; }\nlabel { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem; }\ninput, textarea { width: 100%; box-sizing: border-box; padding: 0.5rem 0.65rem; border: 1px solid #d8d3c8; border-radius: 8px; font: inherit; }\ninput:focus-visible, textarea:focus-visible { outline: 2px solid #2563eb; outline-offset: 1px; }",
  "pestañaInicial": "html"
}
```

## Paso 2: el asunto, con fieldset y legend

El asunto es una elección entre varias opciones relacionadas — tres `radio` con el mismo `name`, agrupados dentro de un `fieldset` con su `legend`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: asunto (fieldset + radio)",
  "consigna": "Escribe un fieldset con legend=\"¿Sobre qué nos escribes?\", y dentro 3 radio (mismo name=\"asunto\") con sus label asociados: \"Soporte\", \"Ventas\", \"Otro\".",
  "html": "<!-- <fieldset>\n  <legend>...</legend>\n  ...\n</fieldset> -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; }\nfieldset { max-width: 420px; margin: 1rem auto; border: 1px solid #d8d3c8; border-radius: 8px; padding: 0.75rem 1rem; }\nlegend { font-weight: 600; font-size: 0.85rem; padding: 0 0.35rem; }\nfieldset label { display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 400; margin-right: 1rem; }",
  "pestañaInicial": "html"
}
```

## Paso 3: el mensaje y el envío

Un `textarea` para el mensaje (también obligatorio), marcado de forma accesible, y el botón de envío.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: mensaje y botón",
  "consigna": "Añade un label+textarea para el mensaje (required), marcando en el propio texto del label que es obligatorio (no solo con un asterisco suelto). Termina con un button type=\"submit\".",
  "html": "<!-- Solo el fragmento nuevo, para pegar dentro de tu form -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; }\nform { max-width: 420px; margin: 1rem auto; display: flex; flex-direction: column; gap: 1rem; }\nlabel { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem; }\ntextarea { width: 100%; box-sizing: border-box; min-height: 90px; padding: 0.5rem 0.65rem; border: 1px solid #d8d3c8; border-radius: 8px; font: inherit; }\nbutton { align-self: flex-start; padding: 0.6rem 1.4rem; border: none; border-radius: 8px; background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; }",
  "pestañaInicial": "html"
}
```

## Formulario completo

Une los tres pasos. Prueba a enviarlo vacío en la vista previa — el navegador debería bloquear el envío y señalar el primer campo obligatorio sin escribir tú ni una línea de JavaScript.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Junta nombre, correo, asunto (fieldset) y mensaje en un único formulario. Después, en la pestaña CSS, dale a los campos inválidos un estilo con :invalid.",
  "html": "<!-- Tu formulario completo, de principio a fin -->",
  "css": "body { font-family: system-ui, sans-serif; color: #2c2a26; }\nform { max-width: 420px; margin: 1rem auto; display: flex; flex-direction: column; gap: 1rem; }\nlabel { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem; }\ninput, textarea { width: 100%; box-sizing: border-box; padding: 0.5rem 0.65rem; border: 1px solid #d8d3c8; border-radius: 8px; font: inherit; }\nfieldset { border: 1px solid #d8d3c8; border-radius: 8px; padding: 0.75rem 1rem; }\nlegend { font-weight: 600; font-size: 0.85rem; padding: 0 0.35rem; }\nfieldset label { display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 400; margin-right: 1rem; }\nbutton { align-self: flex-start; padding: 0.6rem 1.4rem; border: none; border-radius: 8px; background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; }\n/* prueba: input:user-invalid, textarea:user-invalid { border-color: crimson; } */",
  "pestañaInicial": "html"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Cada campo tiene su label real?", "texto": "Comprueba haciendo clic en cada texto de label en la vista previa — si el foco no salta al campo, el for/id no coincide." },
    { "titulo": "¿El grupo de radio tiene su legend?", "texto": "Sin ella, un lector de pantalla anuncia \"Soporte\", \"Ventas\", \"Otro\" sin decir a qué pregunta responden." },
    { "titulo": "¿Lo obligatorio se explica en texto, no solo con un asterisco?", "texto": "\"Mensaje (obligatorio)\" o una nota aparte funcionan; un asterisco solo, sin contexto, no." },
    { "titulo": "¿El formulario bloquea el envío si algo falta?", "texto": "Prueba a enviarlo vacío en la vista previa — el navegador debería impedirlo solo, sin ningún JavaScript de por medio." }
  ]
}
```

## Retos para ampliarlo

1. Añade un campo de teléfono opcional con `type="tel"`, sin `required`.
2. Cambia el asunto de radio buttons a un `select` con las mismas tres opciones — ¿qué label necesitaría y cómo cambiaría la experiencia de elegir una opción?
3. Añade un `pattern` al campo de nombre que rechace números, y escribe la explicación de por qué ese pattern es el correcto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "HTML: A good basis for accessibility",
      "descripcion": "Repaso de label, fieldset y legend si te atascas en el paso 2.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Client-side form validation",
      "descripcion": "Repaso de required, pattern y los mensajes automáticos del navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation",
      "etiqueta": "MDN"
    }
  ]
}
```
