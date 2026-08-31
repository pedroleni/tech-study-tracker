# Web Components: elementos personalizados, shadow DOM y templates

- **Módulo:** APIs del navegador
- **Slug:** `web-components-elementos-personalizados-shadow-dom-y-templates` (autogenerado del título)
- **Orden:** 203
- **Fuentes:** [Using custom elements (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) + [Using shadow DOM (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) + [Using templates and slots (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots) — ver `contenido/javascript/TEMARIO.md` #68

---

## Qué es y para qué sirve

Cierra el módulo de APIs del navegador. Los Web Components combinan tres piezas: elementos HTML propios (`customElements.define()`), un árbol DOM encapsulado dentro de cada uno (shadow DOM), y plantillas reutilizables con huecos rellenables (`<template>`/`<slot>`, ya vistos en HTML — aquí, activados desde JavaScript).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita construir un elemento HTML propio",
  "roles": [
    { "etiqueta": "Quien define el elemento", "rol": "class ... extends HTMLElement", "descripcion": "Registrado con customElements.define() — el nombre debe llevar un guion, sin excepción." },
    { "etiqueta": "Quien encapsula su contenido", "rol": "attachShadow({ mode: 'open' })", "descripcion": "Un árbol DOM separado, aislado del resto de la página en ambas direcciones." },
    { "etiqueta": "Quien rellena un hueco", "rol": "<template> + <slot>", "descripcion": "Contenido inerte hasta clonarse, con huecos que el contenido real del elemento puede sustituir." }
  ]
}
```

## Definir y registrar un elemento personalizado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class CuadradoPersonalizado extends HTMLElement {\n    constructor() {\n      super(); // SIEMPRE lo primero\n      // configuración inicial — sin tocar atributos ni hijos todavía\n    }\n  }\n\n  customElements.define('cuadrado-personalizado', CuadradoPersonalizado);\n</script>\n<cuadrado-personalizado color=\"rojo\" tamano=\"100\"></cuadrado-personalizado>",
  "anotaciones": [
    { "fragmento": "super(); // SIEMPRE lo primero", "nota": "super() debe ser SIEMPRE la primera línea del constructor, sin excepción — el mismo requisito visto en el módulo de clases al extender cualquier otra clase." },
    { "fragmento": "customElements.define('cuadrado-personalizado', CuadradoPersonalizado);", "nota": "El nombre del elemento debe empezar por minúscula y contener al menos un GUION — nunca una sola palabra, para no colisionar con futuras etiquetas HTML nativas." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El constructor no es el sitio para inspeccionar nada",
  "contenido": "El constructor NO es el lugar adecuado para inspeccionar atributos o hijos del elemento — todavía podrían no estar disponibles. Ese trabajo se hace en connectedCallback(), que se ejecuta cuando el elemento YA está insertado en el DOM."
}
```

## connectedCallback() y attributeChangedCallback()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class CuadradoPersonalizado extends HTMLElement {\n    static get observedAttributes() {\n      return ['color', 'tamano'];\n    }\n\n    connectedCallback() {\n      console.log('Elemento añadido a la página');\n      this.actualizarEstilo();\n    }\n\n    attributeChangedCallback(nombre, valorAntiguo, valorNuevo) {\n      console.log(`${nombre} cambió de ${valorAntiguo} a ${valorNuevo}`);\n      this.actualizarEstilo();\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "static get observedAttributes() {\n      return ['color', 'tamano'];\n    }", "nota": "observedAttributes (una propiedad ESTÁTICA) declara qué atributos vigilar — solo los que aparecen en esa lista disparan attributeChangedCallback() al cambiar." },
    { "fragmento": "connectedCallback() {\n      console.log('Elemento añadido a la página');\n      this.actualizarEstilo();\n    }", "nota": "connectedCallback() es el lugar recomendado para la configuración real, en vez del constructor — se ejecuta cuando el elemento ya forma parte del DOM." }
  ]
}
```

## attachShadow(): un árbol DOM separado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class CuadradoPersonalizado extends HTMLElement {\n    constructor() {\n      super();\n      const shadow = this.attachShadow({ mode: 'open' });\n      const div = document.createElement('div');\n      shadow.appendChild(div);\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "const shadow = this.attachShadow({ mode: 'open' });", "nota": "attachShadow({ mode: 'open' }) crea un árbol DOM SEPARADO, colgado del elemento — todo lo que se añada ahí dentro queda encapsulado, sin mezclarse con el resto de la página." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "open frente a closed",
  "contenido": "Con mode: 'open', el código de la página puede acceder al contenido del shadow DOM a través de elemento.shadowRoot. Con mode: 'closed', elemento.shadowRoot devuelve null — el acceso queda bloqueado desde fuera (aunque no es una barrera de seguridad fuerte, solo una convención más estricta)."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Encapsulación en ambos sentidos",
  "contenido": "document.querySelectorAll('span') desde la página NO encuentra los <span> que estén dentro del shadow DOM, y los estilos CSS de la página tampoco los afectan — ni al revés: los estilos definidos dentro del shadow DOM no se filtran hacia fuera."
}
```

## template: contenido inerte hasta clonarse

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<template id=\"parrafo-personalizado\">\n  <style>\n    p { color: white; background-color: #666; padding: 5px; }\n  </style>\n  <p>Contenido de la plantilla</p>\n</template>\n<script>\n  class ParrafoPersonalizado extends HTMLElement {\n    constructor() {\n      super();\n      const plantilla = document.getElementById('parrafo-personalizado');\n      const shadowRoot = this.attachShadow({ mode: 'open' });\n      shadowRoot.appendChild(document.importNode(plantilla.content, true));\n    }\n  }\n\n  customElements.define('mi-parrafo', ParrafoPersonalizado);\n</script>",
  "anotaciones": [
    { "fragmento": "shadowRoot.appendChild(document.importNode(plantilla.content, true));", "nota": "El contenido de <template> es INERTE — no se renderiza en ningún sitio hasta que se clona explícitamente. document.importNode(plantilla.content, true) hace esa copia real, lista para insertarse en el shadow DOM." }
  ]
}
```

## slot: un hueco que el propio elemento puede rellenar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<template id=\"parrafo-personalizado\">\n  <p><slot name=\"mi-texto\">Texto por defecto</slot></p>\n</template>\n\n<mi-parrafo>\n  <span slot=\"mi-texto\">¡Un texto completamente distinto!</span>\n</mi-parrafo>",
  "anotaciones": [
    { "fragmento": "<p><slot name=\"mi-texto\">Texto por defecto</slot></p>", "nota": "<slot name=\"mi-texto\"> es un HUECO dentro de la plantilla — el contenido del propio elemento se proyecta ahí, sustituyendo el texto por defecto." },
    { "fragmento": "<span slot=\"mi-texto\">¡Un texto completamente distinto!</span>", "nota": "El <span> con slot=\"mi-texto\" es lo que rellena ese hueco concreto — sin ningún contenido así, se mostraría el texto por defecto de la propia plantilla." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class MiElemento extends HTMLElement {}\n\n  customElements.define('mielemento', MiElemento); // sin guion\n</script>",
  "opciones": [
    "Lanza un error — los nombres de elementos personalizados deben contener al menos un guion, sin excepción",
    "Funciona con normalidad, el guion es solo una recomendación de estilo",
    "Se registra igual, pero con un nombre distinto generado automáticamente"
  ],
  "correcta": 0,
  "explicacion": "customElements.define() exige que el nombre contenga al menos un GUION — 'mielemento' (una sola palabra) no es válido, y lanza un error. Esta regla existe para que los elementos personalizados nunca puedan colisionar con futuras etiquetas HTML nativas, que siempre son de una sola palabra."
}
```

## Lo que los Web Components NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El constructor de un elemento personalizado es el sitio correcto para inspeccionar sus atributos",
      "realidad": "Todavía podrían no estar disponibles ahí — connectedCallback() es el lugar recomendado."
    },
    {
      "mito": "mode: 'closed' es una barrera de seguridad real e infranqueable",
      "realidad": "Bloquea el acceso normal desde shadowRoot, pero no es una protección fuerte — solo una convención más estricta."
    },
    {
      "mito": "Los estilos CSS de la página afectan también al contenido dentro del shadow DOM",
      "realidad": "La encapsulación es bidireccional — ni entran, ni salen."
    },
    {
      "mito": "El contenido de <template> se renderiza automáticamente en cuanto aparece en el HTML",
      "realidad": "Es INERTE hasta que se clona explícitamente con JavaScript."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Inspeccionar atributos o hijos dentro del constructor.", "texto": "Puede que todavía no estén disponibles — hay que esperar a connectedCallback()." },
    { "titulo": "Registrar un elemento personalizado con un nombre sin guion.", "texto": "customElements.define() lo rechaza directamente." },
    { "titulo": "Confiar en mode: 'closed' como una protección de seguridad real.", "texto": "Es solo una convención más estricta, no una barrera infranqueable." },
    { "titulo": "Olvidar clonar el contenido de <template> antes de insertarlo.", "texto": "Sin document.importNode() (o cloneNode()), nunca aparece en pantalla." }
  ]
}
```

## Ejercicios

1. Crea una clase que extienda `HTMLElement`, y regístrala con `customElements.define()` usando un nombre con guion.
2. Implementa `connectedCallback()` y `attributeChangedCallback()`, declarando `observedAttributes`.
3. Adjunta un shadow DOM con `attachShadow({ mode: 'open' })`, y comprueba que sus estilos no afectan al resto de la página.
4. Usa `<template>` y `<slot>` para definir contenido por defecto que se pueda sustituir al usar el elemento.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Crea una clase que extienda HTMLElement y regístrala con customElements.define() (ejercicio 1). Adjunta un shadow DOM con attachShadow({ mode: 'open' }) y comprueba que sus estilos no afectan al resto de la página (ejercicio 3).",
  "html": "<mi-tarjeta nombre=\"Ada Lovelace\"></mi-tarjeta>\n<p>Este párrafo NO debería llevar el estilo del shadow DOM.</p>",
  "js": "class MiTarjeta extends HTMLElement {\n  connectedCallback() {\n    const shadow = this.attachShadow({ mode: 'open' });\n    shadow.innerHTML = `\n      <style>\n        p { color: white; background: #7c3aed; padding: 12px; border-radius: 8px; font-family: system-ui, sans-serif; }\n      </style>\n      <p>Tarjeta de ${this.getAttribute('nombre')}</p>\n    `;\n  }\n}\ncustomElements.define('mi-tarjeta', MiTarjeta);",
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
      "titulo": "Using custom elements",
      "descripcion": "Referencia de MDN sobre extender HTMLElement, customElements.define(), y los callbacks del ciclo de vida (connectedCallback, attributeChangedCallback...).",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Using shadow DOM",
      "descripcion": "Referencia de MDN sobre attachShadow(), los modos open/closed, y la encapsulación bidireccional de JavaScript y CSS.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Using templates and slots",
      "descripcion": "Referencia de MDN sobre el contenido inerte de <template>, document.importNode() para clonarlo, y <slot> para proyectar contenido del elemento dentro del shadow DOM.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots",
      "etiqueta": "MDN"
    }
  ]
}
```
