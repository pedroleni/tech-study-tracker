# Leer y modificar contenido, atributos y estilos

- **Módulo:** El DOM
- **Slug:** `leer-y-modificar-contenido-atributos-y-estilos` (autogenerado del título)
- **Orden:** 122
- **Fuentes:** [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [Element: setAttribute() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) + [Element: classList (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) — ver `contenido/javascript/TEMARIO.md` #41

---

## Qué es y para qué sirve

Con un elemento ya seleccionado (visto en la lección anterior), esta cubre las tres cosas que más se cambian sobre él: su texto, sus atributos, y su aspecto — con `style` para estilos puntuales en línea, o `classList` (la opción preferida) para aplicar reglas CSS ya escritas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita cambiar algo de un elemento ya seleccionado",
  "roles": [
    { "etiqueta": "Quien cambia el texto", "rol": "textContent", "descripcion": "Lee o reemplaza el texto de un elemento, sin interpretar ninguna etiqueta HTML dentro del valor asignado." },
    { "etiqueta": "Quien cambia un atributo", "rol": "getAttribute() / setAttribute()", "descripcion": "La API general de atributos — incluidos los personalizados (data-*) que no tienen una propiedad JS dedicada." },
    { "etiqueta": "Quien cambia el aspecto", "rol": "style / classList", "descripcion": "style para una propiedad CSS puntual en línea; classList para aplicar clases ya definidas en la hoja de estilos." }
  ]
}
```

## textContent: leer y reemplazar texto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafo = document.querySelector('p');\n  console.log(parrafo.textContent); // el texto actual\n\n  parrafo.textContent = 'Nuevo contenido';\n  console.log(parrafo.textContent); // 'Nuevo contenido'\n</script>",
  "anotaciones": [
    { "fragmento": "parrafo.textContent = 'Nuevo contenido';", "nota": "Asignar un valor nuevo REEMPLAZA todo el contenido anterior por completo — y trata cualquier string asignado como texto plano, sin interpretar ninguna etiqueta HTML que pudiera contener." }
  ]
}
```

## Atributos: setAttribute(), getAttribute() y compañía

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n\n  boton.setAttribute('data-accion', 'enviar');\n  boton.setAttribute('disabled', '');\n\n  console.log(boton.getAttribute('data-accion')); // 'enviar'\n  console.log(boton.hasAttribute('disabled'));    // true\n\n  boton.removeAttribute('disabled'); // habilita el botón\n  console.log(boton.hasAttribute('disabled'));    // false\n</script>",
  "anotaciones": [
    { "fragmento": "boton.setAttribute('disabled', '');", "nota": "Para un atributo BOOLEAN como disabled, su sola PRESENCIA cuenta como true — el valor asignado (incluso una cadena vacía) es irrelevante." },
    { "fragmento": "boton.removeAttribute('disabled'); // habilita el botón", "nota": "Solo removeAttribute() lo desactiva de verdad — asignarle 'false' como string no funciona, porque sigue estando PRESENTE." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "setAttribute() puede ser un vector de XSS",
  "contenido": "Con atributos como onclick, srcdoc, o el src de un <script>, setAttribute() puede ejecutar código arbitrario si su valor viene de un usuario sin sanear. Nunca construyas el valor de estos atributos a partir de texto no confiable — con Trusted Types forzados, exigen un objeto TrustedScript/TrustedHTML/TrustedScriptURL en vez de un string plano."
}
```

## style: estilos puntuales en línea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafo = document.querySelector('p');\n\n  parrafo.style.color = 'white';\n  parrafo.style.backgroundColor = 'black'; // background-color en CSS\n  parrafo.style.padding = '10px';\n</script>",
  "anotaciones": [
    { "fragmento": "parrafo.style.backgroundColor = 'black'; // background-color en CSS", "nota": "style solo maneja estilos EN LÍNEA (equivalentes al atributo style=\"...\" del HTML). Sus propiedades usan camelCase (backgroundColor) — CSS usa kebab-case (background-color) para la misma propiedad." }
  ]
}
```

## classList: la opción preferida para trabajar con clases

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafo = document.querySelector('p');\n\n  parrafo.classList.add('resaltado');\n  console.log(parrafo.classList.contains('resaltado')); // true\n\n  parrafo.classList.remove('resaltado');\n  console.log(parrafo.classList.contains('resaltado')); // false\n</script>",
  "anotaciones": [
    { "fragmento": "parrafo.classList.add('resaltado');", "nota": "classList trabaja con NOMBRES de clase, no con valores de estilo — para aplicar reglas CSS ya escritas en la hoja de estilos, en vez de definir cada propiedad una por una desde JavaScript." }
  ]
}
```

## classList.toggle(): el patrón del interruptor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('#boton-tema');\n\n  boton.addEventListener('click', () => {\n    document.body.classList.toggle('modo-oscuro');\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "document.body.classList.toggle('modo-oscuro');", "nota": "toggle() añade la clase si no está, y la quita si ya está — el patrón habitual para un interruptor. También acepta un segundo argumento boolean: toggle('clase', condicion) FUERZA añadir (true) o quitar (false), en vez de alternar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "classList suele preferirse frente a style",
  "contenido": "Cambiar clases mantiene el CSS separado del JavaScript — todas las reglas siguen viviendo en la hoja de estilos, en vez de mezclarse con estilos en línea escritos desde el propio script. style sigue siendo útil para valores puntuales calculados en tiempo de ejecución (una posición, un color dinámico), pero classList es la opción más limpia para el resto."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const elemento = document.querySelector('div');\n  elemento.classList.add('activo');\n\n  elemento.classList.toggle('activo', true);\n  console.log(elemento.classList.contains('activo'));\n\n  elemento.classList.toggle('activo', false);\n  console.log(elemento.classList.contains('activo'));\n</script>",
  "opciones": [
    "true y false — con un segundo argumento boolean, toggle() FUERZA el estado (añadir si true, quitar si false), en vez de alternar",
    "false y true — toggle() siempre invierte el estado actual, sin importar el segundo argumento",
    "true y true — el segundo argumento de toggle() se ignora si la clase ya existe"
  ],
  "correcta": 0,
  "explicacion": "Con un segundo argumento boolean, classList.toggle('clase', condicion) deja de ALTERNAR y pasa a FORZAR el estado: true garantiza que la clase esté presente (ya lo estaba, sigue estando: true), false garantiza que esté ausente (se quita: false)."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "textContent interpreta el HTML que se le asigna, igual que innerHTML",
      "realidad": "Trata cualquier string asignado como texto plano, sin interpretar ninguna etiqueta."
    },
    {
      "mito": "El valor asignado a un atributo boolean como disabled determina si está activo",
      "realidad": "Su sola PRESENCIA cuenta como true — solo removeAttribute() lo desactiva de verdad."
    },
    {
      "mito": "Las propiedades de style usan la misma sintaxis que el CSS (kebab-case)",
      "realidad": "Usan camelCase (backgroundColor en vez de background-color)."
    },
    {
      "mito": "classList.toggle() solo puede alternar, nunca forzar un estado concreto",
      "realidad": "Con un segundo argumento boolean, fuerza añadir o quitar, en vez de alternar."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir textContent con innerHTML, esperando que interprete etiquetas.", "texto": "textContent siempre trata el valor asignado como texto plano." },
    { "titulo": "Asignar disabled=\"false\" pensando que desactiva el atributo.", "texto": "La presencia del atributo ya cuenta como true — hace falta removeAttribute()." },
    { "titulo": "Escribir estilos con kebab-case dentro de element.style.", "texto": "Las propiedades de style usan camelCase, no la sintaxis del CSS." },
    { "titulo": "No usar el segundo argumento de classList.toggle() cuando hace falta forzar un estado concreto.", "texto": "Sin él, siempre alterna, sin importar el estado deseado." }
  ]
}
```

## Ejercicios

1. Lee y luego modifica el `textContent` de un elemento cualquiera de una página.
2. Usa `setAttribute()`/`getAttribute()`/`removeAttribute()` sobre un atributo personalizado (`data-*`) de un elemento.
3. Cambia el color y el padding de un elemento usando su propiedad `style`.
4. Implementa un interruptor de tema (claro/oscuro) usando `classList.toggle()` sobre `document.body`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "DOM scripting introduction",
      "descripcion": "Guía de MDN sobre textContent, la propiedad style y classList.add().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: setAttribute()",
      "descripcion": "Referencia de MDN sobre setAttribute()/getAttribute()/hasAttribute()/removeAttribute(), los atributos boolean, y la advertencia de seguridad sobre XSS.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: classList",
      "descripcion": "Referencia de MDN sobre los métodos completos de classList: add(), remove(), toggle() (incluido su segundo argumento) y contains().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/classList",
      "etiqueta": "MDN"
    }
  ]
}
```
