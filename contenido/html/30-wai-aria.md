# WAI-ARIA: cuándo hace falta y cuándo es un parche mal puesto

- **Módulo:** Accesibilidad
- **Slug:** `wai-aria-cuando-hace-falta-y-cuando-es-un-parche-mal-puesto` (autogenerado del título)
- **Orden:** 145
- **Fuentes:** [WAI-ARIA basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics) + [ARIA Authoring Practices Guide (W3C/WAI)](https://www.w3.org/WAI/ARIA/apg/) — ver `contenido/html/TEMARIO.md` #30

---

## Qué es y para qué sirve

WAI-ARIA es un conjunto de atributos que añaden semántica donde el HTML nativo no llega — pensado sobre todo para interfaces complejas (pestañas, árboles, sliders personalizados) sin una etiqueta propia. La primera regla de ARIA, literalmente, es **no usar ARIA**: si existe una etiqueta HTML que ya hace el trabajo, usarla siempre gana. ARIA no cambia el DOM, ni el layout, ni el comportamiento — solo la información que reciben las tecnologías de asistencia.

| Tipo | Qué aporta | Ejemplo |
|---|---|---|
| Roles | Qué ES o qué HACE un elemento | `role="navigation"`, `role="alert"` |
| Propiedades | Significado extra, casi siempre fijo | `aria-labelledby`, `aria-describedby` |
| Estados | Una condición que puede cambiar | `aria-disabled="true"`, `aria-selected` |

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién depende de que ARIA se use con cabeza",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Recibir la semántica que falta", "descripcion": "role, los atributos aria-* y los estados le dan información que el HTML nativo no tenía — pero solo a él; nadie más lo nota." },
    { "etiqueta": "Quien navega con teclado", "rol": "Seguir sin recibir nada de ARIA", "descripcion": "ARIA no añade comportamiento de teclado por sí sola — un div con role=\"button\" sigue sin activarse con Enter hasta que se programa a mano." },
    { "etiqueta": "Quien escribe el código", "rol": "Usar HTML nativo primero, siempre", "descripcion": "La primera regla de ARIA es no usarla cuando existe una etiqueta HTML que ya hace lo mismo de fábrica." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando construyes algo sin equivalente en HTML",
  "contenido": "Un conjunto de pestañas, un árbol desplegable, un slider personalizado — patrones de interfaz sin una etiqueta HTML propia son el caso legítimo de usar ARIA."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando arreglas código heredado que no puedes reescribir del todo",
  "contenido": "A veces no es viable cambiar toda la estructura HTML de golpe — ARIA permite añadir la semántica que falta sin tocar el marcado por debajo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca como primera opción si existe la etiqueta HTML correcta",
  "contenido": "nav, button, dialog... ya dan el rol correcto de fábrica. Añadir ARIA encima no mejora nada y, si contradice la semántica nativa, puede empeorarlo."
}
```

## aria-label, aria-labelledby y aria-describedby

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<input type=\"search\" name=\"q\" placeholder=\"Buscar\" aria-label=\"Buscar en todo el sitio\">\n\n<h2 id=\"titulo-dialogo\">Confirmar borrado</h2>\n<div role=\"dialog\" aria-labelledby=\"titulo-dialogo\">…</div>\n\n<input id=\"contrasena\" type=\"password\" aria-describedby=\"ayuda-contrasena\">\n<p id=\"ayuda-contrasena\">Mínimo 8 caracteres, con un número.</p>",
  "anotaciones": [
    { "fragmento": "aria-label=\"Buscar en todo el sitio\"", "nota": "Un nombre accesible cuando no tiene sentido un label visible — aquí, un buscador cuyo icono ya deja clara la función a simple vista." },
    { "fragmento": "aria-labelledby=\"titulo-dialogo\"", "nota": "Reutiliza un texto que YA existe en la página como nombre accesible, en vez de duplicarlo — apunta al id de un elemento existente." },
    { "fragmento": "aria-describedby=\"ayuda-contrasena\"", "nota": "Conecta el campo con una descripción adicional — un lector de pantalla lee el nombre y esta descripción juntos al llegar al campo." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<div role=\"button\" onclick=\"eliminar()\">Eliminar</div>\n<!-- El usuario navega hasta aquí con Tab y pulsa Enter -->",
  "opciones": [
    "Se activa igual que un button real, porque role=\"button\" ya lo indica",
    "No pasa nada — role=\"button\" no añade activación con teclado por sí sola",
    "El navegador convierte automáticamente el div en un button real"
  ],
  "correcta": 1,
  "explicacion": "role=\"button\" solo cambia lo que anuncia un lector de pantalla — dice \"botón\", pero no activa ningún comportamiento de teclado. Sin JavaScript propio que escuche Enter (y probablemente espacio), pulsarla no hace nada — y ese div ni siquiera recibiría foco con Tab sin además un tabindex=\"0\"."
}
```

## Regiones activas: aria-live

| Valor | Comportamiento |
|---|---|
| `off` (por defecto) | Los cambios no se anuncian |
| `polite` | Se anuncian cuando el usuario está inactivo, sin interrumpir |
| `assertive` | Se anuncian de inmediato, interrumpiendo lo que se esté leyendo |

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<div aria-live=\"polite\" aria-atomic=\"true\">\n  <p>Carrito actualizado: 3 artículos</p>\n</div>",
  "anotaciones": [
    { "fragmento": "aria-live=\"polite\"", "nota": "Cada vez que el contenido de este div cambie (por ejemplo, con JavaScript al añadir un producto), un lector de pantalla lo anuncia solo, sin que nadie tenga que navegar hasta ahí." },
    { "fragmento": "aria-atomic=\"true\"", "nota": "Anuncia el bloque ENTERO cada vez que cambia algo dentro, no solo la parte que cambió — útil cuando el contexto completo importa para que el mensaje tenga sentido." }
  ]
}
```

## Patrones ARIA reales: pestañas (tabs)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<div role=\"tablist\">\n  <button role=\"tab\" aria-selected=\"true\" aria-controls=\"panel-html\">HTML</button>\n  <button role=\"tab\" aria-selected=\"false\" aria-controls=\"panel-css\">CSS</button>\n</div>\n\n<div role=\"tabpanel\" id=\"panel-html\">Contenido de HTML</div>\n<div role=\"tabpanel\" id=\"panel-css\" hidden>Contenido de CSS</div>",
  "anotaciones": [
    { "fragmento": "role=\"tablist\"", "nota": "El contenedor de todas las pestañas — le dice a un lector de pantalla que agrupe estos controles como un conjunto de pestañas, no botones sueltos." },
    { "fragmento": "aria-selected=\"true\"", "nota": "Marca cuál de las pestañas está activa ahora mismo — solo una debería llevar true al mismo tiempo." },
    { "fragmento": "aria-controls=\"panel-html\"", "nota": "Conecta cada pestaña con el panel de contenido que le corresponde, por su id." }
  ]
}
```

## Lo que ARIA NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "ARIA arregla código HTML mal hecho",
      "realidad": "Solo añade información para tecnología de asistencia — no cambia el comportamiento real del elemento. Un div con role=\"button\" sigue sin activarse con Enter hasta que se programa a mano."
    },
    {
      "mito": "Cuantos más atributos aria-* pongas, más accesible es la página",
      "realidad": "ARIA mal usada puede empeorar la experiencia, contradiciendo la semántica nativa o duplicando información — la primera regla de ARIA es no usarla cuando no hace falta."
    },
    {
      "mito": "ARIA cambia el aspecto visual de la página",
      "realidad": "No toca ni el DOM ni el layout — solo la información expuesta a las APIs de accesibilidad del sistema, invisible para cualquiera que no use tecnología de asistencia."
    },
    {
      "mito": "aria-label sustituye a label en un formulario",
      "realidad": "label con for/id sigue siendo la opción preferida siempre que sea viable — aria-label es el recurso para cuando un label visible no tiene sentido en el diseño."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar role=\"button\" en un div sin añadir tabindex ni gestión de teclado.", "texto": "El rol dice qué ES el elemento, pero no le da foco ni activación con Enter o espacio — eso hay que seguir programándolo." },
    { "titulo": "Duplicar información entre aria-label y el texto visible.", "texto": "Si el texto visible ya describe bien el elemento, un aria-label distinto puede generar un anuncio confuso o contradictorio." },
    { "titulo": "Usar aria-live=\"assertive\" para cualquier actualización.", "texto": "Interrumpe lo que la persona esté leyendo en ese momento — resérvalo para alertas realmente urgentes; polite es la opción correcta casi siempre." },
    { "titulo": "No probar el patrón ARIA con un lector de pantalla real.", "texto": "El soporte de patrones complejos varía entre lector de pantalla, navegador y sistema operativo — lo que funciona en uno puede fallar en otro." }
  ]
}
```

## Ejercicios

1. Escribe un buscador con aria-label en vez de un label visible, justificando por qué el diseño lo pide.
2. Escribe un aria-live="polite" para una notificación de "guardado correctamente" que aparece tras enviar un formulario.
3. Escribe la estructura mínima de un patrón de pestañas (tablist/tab/tabpanel) con aria-selected y aria-controls.
4. Busca un ejemplo de "ARIA rota" en una web real: un role sin el comportamiento de teclado que promete.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "WAI-ARIA basics",
      "descripcion": "Guía de referencia de MDN sobre roles, propiedades, estados, aria-live y la primera regla de ARIA.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics",
      "etiqueta": "MDN"
    },
    {
      "titulo": "ARIA Authoring Practices Guide",
      "descripcion": "Guía del W3C/WAI con patrones concretos y funcionales (pestañas, diálogos, menús) para componentes sin equivalente nativo en HTML.",
      "url": "https://www.w3.org/WAI/ARIA/apg/",
      "etiqueta": "W3C/WAI"
    }
  ]
}
```
