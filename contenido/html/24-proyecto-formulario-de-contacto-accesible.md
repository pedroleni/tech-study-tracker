# Proyecto: formulario de contacto accesible de verdad

- **Módulo:** Formularios
- **Slug:** `proyecto-formulario-de-contacto-accesible-de-verdad` (autogenerado del título)
- **Orden:** 115
- **Requiere:** Módulo 6 completo (anatomía, campos, validación nativa y formularios accesibles)

---

## Qué vas a construir

Un formulario de contacto real, de los que aparecen en cualquier web: nombre, correo, asunto (una elección entre varias opciones) y mensaje. La parte fácil es que se vea bien — el CSS ya está puesto. La parte que de verdad se pone a prueba aquí es que cada campo tenga su label bien asociado, que el campo obligatorio se marque de forma que un lector de pantalla lo entienda, y que la validación nativa haga su trabajo antes de que nada llegue a ningún servidor.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que este formulario pone a prueba de verdad",
  "roles": [
    {
      "etiqueta": "label real",
      "rol": "for/id o input envuelto",
      "descripcion": "No un texto suelto que se ve al lado — una asociación programática de verdad."
    },
    {
      "etiqueta": "fieldset/legend",
      "rol": "Agrupar el asunto",
      "descripcion": "El asunto es un grupo de opciones relacionadas — necesita su propio nombre de grupo, no solo el label de cada opción por separado."
    },
    {
      "etiqueta": "Validación nativa",
      "rol": "required + type correcto",
      "descripcion": "El navegador ya sabe rechazar un envío incompleto o un correo mal escrito, sin una línea de JavaScript."
    }
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput, textarea {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\ninput:focus-visible, textarea:focus-visible {\n  outline: 2px solid #2563eb;\n  outline-offset: 1px;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<form action=\"#\" method=\"post\">\n  <div>\n    <label for=\"nombre\">Nombre</label>\n    <input type=\"text\" id=\"nombre\" name=\"nombre\" required>\n  </div>\n  <div>\n    <label for=\"correo\">Correo electrónico</label>\n    <input type=\"email\" id=\"correo\" name=\"correo\" required>\n  </div>\n</form>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput, textarea {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\ninput:focus-visible, textarea:focus-visible {\n  outline: 2px solid #2563eb;\n  outline-offset: 1px;\n}",
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nfieldset {\n  max-width: 420px;\n  margin: 1rem auto;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\nlegend {\n  font-weight: 600;\n  font-size: 0.85rem;\n  padding: 0 0.35rem;\n}\nfieldset label {\n  display: block;\n  font-weight: 400;\n}\nfieldset label input {\n  width: 1.1em;\n  height: 1.1em;\n  margin-right: 0.5rem;\n  vertical-align: middle;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<fieldset>\n  <legend>¿Sobre qué nos escribes?</legend>\n  <label><input type=\"radio\" name=\"asunto\" value=\"soporte\"> Soporte</label>\n  <label><input type=\"radio\" name=\"asunto\" value=\"ventas\"> Ventas</label>\n  <label><input type=\"radio\" name=\"asunto\" value=\"otro\"> Otro</label>\n</fieldset>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nfieldset {\n  max-width: 420px;\n  margin: 1rem auto;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\nlegend {\n  font-weight: 600;\n  font-size: 0.85rem;\n  padding: 0 0.35rem;\n}\nfieldset label {\n  display: block;\n  font-weight: 400;\n}\nfieldset label input {\n  width: 1.1em;\n  height: 1.1em;\n  margin-right: 0.5rem;\n  vertical-align: middle;\n}",
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ntextarea {\n  width: 100%;\n  box-sizing: border-box;\n  min-height: 90px;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\nbutton {\n  align-self: flex-start;\n  padding: 0.6rem 1.4rem;\n  border: none;\n  border-radius: 8px;\n  background: #2563eb;\n  color: #fff;\n  font-weight: 600;\n  cursor: pointer;\n}",
  "pestañaInicial": "html"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo.",
  "html": "<div>\n  <label for=\"mensaje\">Mensaje (obligatorio)</label>\n  <textarea id=\"mensaje\" name=\"mensaje\" required></textarea>\n</div>\n<button type=\"submit\">Enviar</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ntextarea {\n  width: 100%;\n  box-sizing: border-box;\n  min-height: 90px;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\nbutton {\n  align-self: flex-start;\n  padding: 0.6rem 1.4rem;\n  border: none;\n  border-radius: 8px;\n  background: #2563eb;\n  color: #fff;\n  font-weight: 600;\n  cursor: pointer;\n}",
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
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput, textarea {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\nfieldset {\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\nlegend {\n  font-weight: 600;\n  font-size: 0.85rem;\n  padding: 0 0.35rem;\n}\nfieldset label {\n  display: block;\n  font-weight: 400;\n}\nfieldset label input {\n  width: 1.1em;\n  height: 1.1em;\n  margin-right: 0.5rem;\n  vertical-align: middle;\n}\nbutton {\n  align-self: flex-start;\n  padding: 0.6rem 1.4rem;\n  border: none;\n  border-radius: 8px;\n  background: #2563eb;\n  color: #fff;\n  font-weight: 600;\n  cursor: pointer;\n}\n/* prueba: input:user-invalid, textarea:user-invalid { border-color: crimson; } */",
  "pestañaInicial": "html"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes el formulario entero, ya resuelto — con el `:user-invalid` del último paso ya activado, para que veas el efecto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "El formulario terminado, con las tres partes juntas: nombre y correo, asunto agrupado en fieldset, y mensaje con botón de envío. Pruébalo vacío en la vista previa.",
  "html": "<form action=\"#\" method=\"post\">\n  <div>\n    <label for=\"nombre\">Nombre</label>\n    <input type=\"text\" id=\"nombre\" name=\"nombre\" required>\n  </div>\n  <div>\n    <label for=\"correo\">Correo electrónico</label>\n    <input type=\"email\" id=\"correo\" name=\"correo\" required>\n  </div>\n  <fieldset>\n    <legend>¿Sobre qué nos escribes?</legend>\n    <label><input type=\"radio\" name=\"asunto\" value=\"soporte\"> Soporte</label>\n    <label><input type=\"radio\" name=\"asunto\" value=\"ventas\"> Ventas</label>\n    <label><input type=\"radio\" name=\"asunto\" value=\"otro\"> Otro</label>\n  </fieldset>\n  <div>\n    <label for=\"mensaje\">Mensaje (obligatorio)</label>\n    <textarea id=\"mensaje\" name=\"mensaje\" required></textarea>\n  </div>\n  <button type=\"submit\">Enviar</button>\n</form>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput, textarea {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}\nfieldset {\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\nlegend {\n  font-weight: 600;\n  font-size: 0.85rem;\n  padding: 0 0.35rem;\n}\nfieldset label {\n  display: block;\n  font-weight: 400;\n}\nfieldset label input {\n  width: 1.1em;\n  height: 1.1em;\n  margin-right: 0.5rem;\n  vertical-align: middle;\n}\nbutton {\n  align-self: flex-start;\n  padding: 0.6rem 1.4rem;\n  border: none;\n  border-radius: 8px;\n  background: #2563eb;\n  color: #fff;\n  font-weight: 600;\n  cursor: pointer;\n}\ninput:user-invalid, textarea:user-invalid {\n  border-color: crimson;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El name del radio es el mismo en los tres.",
      "texto": "name=\"asunto\" repetido es lo que hace que el navegador los trate como UN grupo — marcar uno desmarca automáticamente los otros dos."
    },
    {
      "titulo": "\"Mensaje (obligatorio)\" va en el texto del label, no en un asterisco suelto.",
      "texto": "Un asterisco sin explicar en ningún sitio qué significa no dice nada a quien usa un lector de pantalla."
    },
    {
      "titulo": ":user-invalid solo se activa después de interactuar.",
      "texto": "A diferencia de :invalid, no marca en rojo los campos obligatorios nada más cargar la página — solo cuando el usuario ya probó a rellenarlos (o a enviar el formulario) y algo sigue sin ser válido."
    }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Cada campo tiene su label real?",
      "texto": "Comprueba haciendo clic en cada texto de label en la vista previa — si el foco no salta al campo, el for/id no coincide."
    },
    {
      "titulo": "¿El grupo de radio tiene su legend?",
      "texto": "Sin ella, un lector de pantalla anuncia \"Soporte\", \"Ventas\", \"Otro\" sin decir a qué pregunta responden."
    },
    {
      "titulo": "¿Lo obligatorio se explica en texto, no solo con un asterisco?",
      "texto": "\"Mensaje (obligatorio)\" o una nota aparte funcionan; un asterisco solo, sin contexto, no."
    },
    {
      "titulo": "¿El formulario bloquea el envío si algo falta?",
      "texto": "Prueba a enviarlo vacío en la vista previa — el navegador debería impedirlo solo, sin ningún JavaScript de por medio."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade un campo de teléfono opcional con `type="tel"`, sin `required`.
2. Cambia el asunto de radio buttons a un `select` con las mismas tres opciones — ¿qué label necesitaría y cómo cambiaría la experiencia de elegir una opción?
3. Añade un `pattern` al campo de nombre que rechace números, y escribe la explicación de por qué ese pattern es el correcto.

Si quieres comparar con una solución real de cada reto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: teléfono opcional",
  "consigna": "Sin required — type=\"tel\" por sí solo ya hace que los móviles muestren un teclado numérico, aunque el campo sea opcional.",
  "html": "<form action=\"#\" method=\"post\">\n  <div>\n    <label for=\"telefono\">Teléfono (opcional)</label>\n    <input type=\"tel\" id=\"telefono\" name=\"telefono\">\n  </div>\n</form>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: select en vez de radio",
  "consigna": "Un select necesita UN solo label (no un legend de grupo, porque ya no hay varias opciones marcables por separado) — y cambia la experiencia: con radio se ven las 3 opciones de un vistazo, con select hace falta abrir el desplegable para verlas, aunque ocupa menos espacio en pantalla.",
  "html": "<form action=\"#\" method=\"post\">\n  <div>\n    <label for=\"asunto\">¿Sobre qué nos escribes?</label>\n    <select id=\"asunto\" name=\"asunto\">\n      <option value=\"soporte\">Soporte</option>\n      <option value=\"ventas\">Ventas</option>\n      <option value=\"otro\">Otro</option>\n    </select>\n  </div>\n</form>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\nselect {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}",
  "pestañaInicial": "html"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: pattern que rechaza números",
  "consigna": "[^0-9]* significa \"cualquier cosa que NO sea un dígito, cero o más veces\" — el ^ dentro de los corchetes niega la clase de caracteres, así que basta un solo número en cualquier posición para que el navegador lo rechace. title es el texto que el navegador muestra en su mensaje de error nativo.",
  "html": "<form action=\"#\" method=\"post\">\n  <div>\n    <label for=\"nombre\">Nombre</label>\n    <input type=\"text\" id=\"nombre\" name=\"nombre\" required pattern=\"[^0-9]*\" title=\"El nombre no debe contener números\">\n  </div>\n</form>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  color: #2c2a26;\n}\nform {\n  max-width: 420px;\n  margin: 1rem auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nlabel {\n  display: block;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 0.25rem;\n}\ninput {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.5rem 0.65rem;\n  border: 1px solid #d8d3c8;\n  border-radius: 8px;\n  font: inherit;\n}",
  "pestañaInicial": "html"
}
```

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
