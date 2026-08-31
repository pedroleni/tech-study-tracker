# Eventos de formulario y validación con JS

- **Módulo:** Eventos
- **Slug:** `eventos-de-formulario-y-validacion-con-js` (autogenerado del título)
- **Orden:** 137
- **Fuentes:** [Constraint validation (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) — ver `contenido/javascript/TEMARIO.md` #46

---

## Qué es y para qué sirve

El navegador ya valida formularios por su cuenta con atributos como `required` o `type="email"`. La Constraint Validation API deja inspeccionar y ampliar esa validación desde JavaScript — saber EXACTAMENTE qué falla en un campo, y añadir reglas propias que el HTML no puede expresar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita ir más allá de la validación del HTML",
  "roles": [
    { "etiqueta": "Quien consulta qué falla", "rol": "validity", "descripcion": "Un objeto con una propiedad boolean por cada tipo de restricción — no solo si el campo es válido, sino POR QUÉ no lo es." },
    { "etiqueta": "Quien añade una regla propia", "rol": "setCustomValidity()", "descripcion": "Marca un campo como inválido con un mensaje propio, incluso si cumple todas las restricciones del HTML." },
    { "etiqueta": "Quien toma el control del envío", "rol": "submit + preventDefault()", "descripcion": "El punto de entrada para validar antes de dejar que el formulario se envíe." }
  ]
}
```

## Interceptar el envío

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const formulario = document.querySelector('form');\n\n  formulario.addEventListener('submit', (evento) => {\n    evento.preventDefault(); // toma el control manual del envío\n    console.log('Formulario interceptado, sin recargar la página');\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "evento.preventDefault(); // toma el control manual del envío", "nota": "preventDefault() (ya visto en la lección de eventos) es el primer paso para manejar un formulario con JavaScript — detiene el envío nativo, que recargaría la página entera. Enviar los datos de verdad con fetch() tiene su propia lección justo después de esta." }
  ]
}
```

## validity: saber exactamente qué falla

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const correo = document.getElementById('correo');\n\n  console.log(correo.validity.valid);        // false si incumple cualquier restricción\n  console.log(correo.validity.valueMissing); // true si es required y está vacío\n  console.log(correo.validity.typeMismatch); // true si no tiene forma de email válido\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(correo.validity.valueMissing); // true si es required y está vacío", "nota": "validity es un objeto con una propiedad boolean por cada tipo de restricción posible (required, type=\"email\", minlength...) — permite saber EXACTAMENTE cuál falla, no solo si el campo es válido o no." }
  ]
}
```

## setCustomValidity(): un mensaje propio

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const correo = document.getElementById('correo');\n\n  correo.addEventListener('input', () => {\n    if (correo.validity.typeMismatch) {\n      correo.setCustomValidity('Esperaba una dirección de correo');\n    } else {\n      correo.setCustomValidity('');\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "correo.setCustomValidity('Esperaba una dirección de correo');", "nota": "setCustomValidity(mensaje) marca el campo como inválido con un mensaje PROPIO, sustituyendo al mensaje genérico del navegador." },
    { "fragmento": "correo.setCustomValidity('');", "nota": "Pasarle una cadena VACÍA es la forma de LIMPIAR el error personalizado y dejar que las restricciones normales del HTML decidan la validez." }
  ]
}
```

## Extender la validación nativa con una regla propia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const correo = document.getElementById('correo');\n\n  correo.addEventListener('input', () => {\n    correo.setCustomValidity(''); // limpiar cualquier error previo\n    if (!correo.validity.valid) return; // ya inválido por las restricciones nativas\n\n    if (!correo.value.endsWith('@empresa.com')) {\n      correo.setCustomValidity('Debe ser una dirección @empresa.com');\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "correo.setCustomValidity(''); // limpiar cualquier error previo\n    if (!correo.validity.valid) return; // ya inválido por las restricciones nativas", "nota": "Primero se limpia cualquier error personalizado previo y se comprueba la validez NATIVA — solo si esa pasa, se añade la restricción propia. Así las dos capas de validación conviven sin pisarse." }
  ]
}
```

## Un mensaje distinto según el problema real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const formulario = document.querySelector('form');\n  const correo = document.getElementById('correo');\n  const errorCorreo = document.querySelector('#error-correo');\n\n  function mostrarError() {\n    if (correo.validity.valueMissing) {\n      errorCorreo.textContent = 'Hace falta un correo.';\n    } else if (correo.validity.typeMismatch) {\n      errorCorreo.textContent = 'Eso no parece un correo válido.';\n    }\n  }\n\n  formulario.addEventListener('submit', (evento) => {\n    if (!correo.validity.valid) {\n      mostrarError();\n      evento.preventDefault();\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "function mostrarError() {\n    if (correo.validity.valueMissing) {\n      errorCorreo.textContent = 'Hace falta un correo.';\n    } else if (correo.validity.typeMismatch) {\n      errorCorreo.textContent = 'Eso no parece un correo válido.';\n    }\n  }", "nota": "Comprobar cada propiedad de validity por separado permite mostrar un mensaje DISTINTO según cuál sea el problema real — mucho más útil para quien rellena el formulario que un genérico 'campo inválido'." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "checkValidity() y reportValidity()",
  "contenido": "checkValidity() comprueba la validez y devuelve true/false — si el campo es inválido, además dispara un evento invalid sobre él. reportValidity() hace lo mismo, pero además le muestra al usuario el mensaje de error nativo del navegador — útil combinado con preventDefault() en el manejador de submit."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const campo = document.getElementById('usuario');\n  // campo tiene un valor que cumple todas las restricciones HTML (required, minlength...)\n\n  console.log(campo.validity.valid); // antes de la siguiente línea\n\n  campo.setCustomValidity('Ese usuario ya existe');\n  console.log(campo.validity.valid); // después\n</script>",
  "opciones": [
    "true y luego false — setCustomValidity() con un mensaje no vacío invalida el campo, aunque cumpla todas las restricciones HTML normales",
    "true las dos veces — setCustomValidity() solo añade un mensaje, sin afectar a validity.valid",
    "false y luego false — un campo con setCustomValidity() nunca puede considerarse válido, ni siquiera limpiándolo después"
  ],
  "correcta": 0,
  "explicacion": "setCustomValidity() con cualquier mensaje NO VACÍO marca el campo como inválido de inmediato, sin importar que cumpla el resto de restricciones HTML — validity.valid pasa a false. Solo volver a llamarlo con una cadena vacía ('') limpia el error y permite que el campo vuelva a ser válido."
}
```

## Lo que la Constraint Validation API NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "validity.valid es la única información disponible; no se puede saber cuál restricción concreta falla",
      "realidad": "validity tiene una propiedad boolean por cada tipo de restricción (valueMissing, typeMismatch, tooShort...)."
    },
    {
      "mito": "setCustomValidity() solo añade un mensaje visual, sin afectar si el campo se considera válido",
      "realidad": "Marca el campo como INVÁLIDO mientras el mensaje no esté vacío, sin importar el resto de restricciones."
    },
    {
      "mito": "Para limpiar un error personalizado hace falta un método aparte, distinto de setCustomValidity()",
      "realidad": "Se limpia llamando a setCustomValidity('') con una cadena vacía."
    },
    {
      "mito": "checkValidity() solo comprueba la validez, sin ningún efecto adicional",
      "realidad": "Si el campo es inválido, también dispara un evento invalid sobre él."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No comprobar propiedades específicas de validity, mostrando siempre el mismo mensaje genérico.", "texto": "valueMissing, typeMismatch y compañía permiten mensajes mucho más útiles." },
    { "titulo": "Olvidar limpiar un error personalizado con setCustomValidity('') antes de volver a validar.", "texto": "Sin limpiarlo, el campo sigue inválido aunque el problema original ya no exista." },
    { "titulo": "Confundir checkValidity() (silencioso, dispara invalid) con reportValidity() (además muestra el mensaje al usuario).", "texto": "Cada uno encaja en un momento distinto del flujo de validación." },
    { "titulo": "No combinar la validación nativa (validity.valid) con restricciones propias antes de añadir un error personalizado.", "texto": "Evita que las dos capas de validación se pisen entre sí." }
  ]
}
```

## Ejercicios

1. Lee las propiedades `valueMissing` y `typeMismatch` de `validity` sobre un campo de email vacío y otro con un valor incorrecto.
2. Usa `setCustomValidity()` para añadir un mensaje de error propio, y luego límpialo con una cadena vacía.
3. Extiende la validación nativa de un campo con una restricción propia (por ejemplo, que termine en un dominio concreto).
4. Implementa un manejador de `submit` que muestre un mensaje distinto según cuál propiedad de `validity` esté fallando.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Lee valueMissing y typeMismatch de validity sobre este campo (ejercicio 1). Usa setCustomValidity() para un mensaje propio (ejercicio 2).",
  "html": "<form id=\"form\">\n  <input type=\"email\" id=\"correo\" required>\n  <button type=\"submit\">Enviar</button>\n</form>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst correo = document.getElementById('correo');\ndocument.getElementById('form').addEventListener('submit', (evento) => {\n  evento.preventDefault();\n  mostrar('valueMissing: ' + correo.validity.valueMissing);\n  mostrar('typeMismatch: ' + correo.validity.typeMismatch);\n  if (!correo.value.endsWith('@empresa.com')) {\n    correo.setCustomValidity('Usa tu correo de empresa (@empresa.com)');\n  } else {\n    correo.setCustomValidity('');\n  }\n  mostrar('Mensaje de validación: ' + correo.validationMessage);\n});",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Constraint validation",
      "descripcion": "Referencia de MDN sobre la Constraint Validation API: validity y sus propiedades, setCustomValidity(), checkValidity() y reportValidity().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation",
      "etiqueta": "MDN"
    }
  ]
}
```
