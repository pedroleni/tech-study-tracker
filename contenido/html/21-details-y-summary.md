# details y summary: desplegables nativos sin JavaScript

- **Módulo:** Elementos interactivos nativos
- **Slug:** `details-y-summary-desplegables-nativos-sin-javascript` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Details and summary (web.dev)](https://web.dev/learn/html/details) + [referencia details (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) — ver `contenido/html/TEMARIO.md` #21

---

## Qué es y para qué sirve

`<details>` es un desplegable completo — clicable, navegable por teclado, con estado abierto/cerrado accesible — sin escribir ni una línea de JavaScript. `<summary>` es la parte siempre visible, el texto en el que se hace clic para expandir el resto. Preguntas frecuentes, notas técnicas opcionales, un acordeón entero: el navegador ya sabe hacerlo todo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué gana quien usa details en vez de un acordeón hecho a mano",
  "roles": [
    { "etiqueta": "Quien navega con teclado", "rol": "Abrir y cerrar con espacio", "descripcion": "summary recibe foco con Tab y se activa con espacio o Enter — comportamiento de acordeón completo, sin una sola línea de JavaScript." },
    { "etiqueta": "Lector de pantalla", "rol": "Anunciar expandido o contraído", "descripcion": "details tiene el rol group, y el estado abierto/cerrado se anuncia solo — la misma información que aria-expanded daría a un div hecho a mano." },
    { "etiqueta": "Quien escribe el código", "rol": "Cero JavaScript para lo básico", "descripcion": "Un acordeón hecho a mano necesita gestionar clic, estado y atributos ARIA por separado — con details, el navegador ya lo hace todo." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el contenido es opcional para la mayoría",
  "contenido": "Preguntas frecuentes, detalles técnicos avanzados, información secundaria — algo que la mayoría no necesita ver de entrada, pero que debe seguir estando disponible."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres un acordeón sin escribir JavaScript",
  "contenido": "El atributo name conecta varios details entre sí para que solo uno esté abierto a la vez, de forma completamente nativa."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el contenido tiene que seguir siendo indexable",
  "contenido": "A diferencia de contenido oculto con display: none, lo que hay dentro de un details colapsado sigue estando en el HTML — Chrome y Edge incluso lo expanden automáticamente si coincide con una búsqueda en la página (Ctrl+F)."
}
```

## Cómo se usa: details y summary

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<details>\n  <summary>¿Hacéis envíos internacionales?</summary>\n  <p>Sí, enviamos a más de 40 países.</p>\n</details>",
  "despues": "<details open>\n  <summary>¿Hacéis envíos internacionales?</summary>\n  <p>Sí, enviamos a más de 40 países.</p>\n</details>",
  "nota": "Mismo HTML, con una única diferencia: el atributo open. Sin él, el navegador dibuja el triángulo apuntando a la derecha y oculta el contenido; con él, el triángulo apunta hacia abajo y el contenido queda visible — todo por defecto, sin CSS ni JavaScript."
}
```

## El atributo name: acordeón nativo sin JavaScript

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<details name=\"faq\" open>\n  <summary>¿Hacéis envíos internacionales?</summary>\n  <p>Sí, a más de 40 países.</p>\n</details>\n\n<details name=\"faq\">\n  <summary>¿Puedo devolver un producto?</summary>\n  <p>Sí, tienes 30 días desde la compra.</p>\n</details>",
  "anotaciones": [
    { "fragmento": "name=\"faq\"", "nota": "Los dos details comparten el mismo name — eso los conecta como un grupo: abrir uno cierra automáticamente los demás del mismo grupo, sin JavaScript." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<details name=\"faq\" open>\n  <summary>Pregunta 1</summary>\n  <p>Respuesta 1</p>\n</details>\n\n<details name=\"faq\" open>\n  <summary>Pregunta 2</summary>\n  <p>Respuesta 2</p>\n</details>",
  "opciones": [
    "Los dos aparecen abiertos a la vez, porque los dos llevan open",
    "Solo el PRIMERO en el orden del HTML aparece abierto — el open del segundo se ignora",
    "El navegador da un error porque dos details del mismo grupo no pueden llevar open"
  ],
  "correcta": 1,
  "explicacion": "Cuando varios details comparten name, solo puede haber uno abierto a la vez. Si más de uno lleva el atributo open, gana el primero en el orden del HTML — el open de los demás simplemente se ignora al cargar la página."
}
```

## Personalizar el marcador con CSS

El triángulo por defecto se puede sustituir, quitando el marcador nativo y generando uno propio:

```css
summary {
  list-style: none;
}

summary::before {
  content: "▶ ";
}

details[open] summary::before {
  content: "▼ ";
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Quitar el marcador sin sustituirlo deja sin pista visual",
  "contenido": "list-style: none elimina el triángulo, pero si no se reemplaza por otro indicador, quien ve la página pierde la única señal de que ese texto es interactivo y se puede desplegar."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El evento toggle, para cuando sí hace falta JavaScript",
  "contenido": "details dispara un evento toggle cada vez que cambia de abierto a cerrado o al revés — útil, por ejemplo, para cargar contenido bajo demanda solo cuando el usuario despliega la sección, sin reimplementar el propio despliegue."
}
```

## Lo que details NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El contenido dentro de un details cerrado no existe para un buscador",
      "realidad": "Sigue estando en el HTML, no oculto con display: none — Chrome y Edge incluso lo expanden automáticamente si coincide con una búsqueda con Ctrl+F en la página."
    },
    {
      "mito": "summary es opcional, se puede omitir sin más",
      "realidad": "Si se omite, el navegador genera uno por defecto con una etiqueta genérica propia del navegador — mejor escribir siempre uno propio con un texto real."
    },
    {
      "mito": "Para un acordeón donde solo se abre una pregunta a la vez hace falta JavaScript",
      "realidad": "El atributo name lo resuelve de forma completamente nativa desde hace pocos años — sin una sola línea de JavaScript."
    },
    {
      "mito": "Quitar el triángulo con list-style: none no tiene ninguna consecuencia",
      "realidad": "Sin sustituirlo por otro indicador visual, deja a quien ve la página sin ninguna pista de que ese texto se puede desplegar."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Omitir el summary y confiar en el texto por defecto del navegador.", "texto": "Ese texto genérico no dice nada sobre el contenido real — siempre conviene escribir un summary propio y descriptivo." },
    { "titulo": "Anidar un enlace o un botón dentro del propio summary.", "texto": "El comportamiento de foco y activación se vuelve inconsistente entre navegadores cuando hay elementos interactivos anidados dentro de otro interactivo." },
    { "titulo": "Usar open=\"false\" pensando que así cierra el details.", "texto": "Es un atributo booleano: su sola presencia lo abre, sin importar el valor escrito — hay que quitarlo del todo para que empiece cerrado." },
    { "titulo": "Reescribir un acordeón con divs y JavaScript cuando details ya lo resuelve.", "texto": "Repite con más código algo que el navegador ya da gratis, incluido el soporte de teclado y el rol de accesibilidad." }
  ]
}
```

## Ejercicios

1. Escribe 3 preguntas frecuentes usando details y summary, con la primera abierta por defecto.
2. Añade name a las 3 para que se comporten como un acordeón donde solo una esté abierta a la vez.
3. Escribe el CSS para sustituir el triángulo nativo por un símbolo propio (+ y -, por ejemplo) que cambie según el estado abierto/cerrado.
4. Busca una web real con un componente de acordeón — ¿está hecho con details o con JavaScript y divs?

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe las 3 preguntas frecuentes con details/summary, con la primera abierta (ejercicio 1). Dales el mismo name para que se comporten como acordeón (ejercicio 2). Si te animas, sustituye el triángulo nativo por + y - en la pestaña CSS (ejercicio 3).",
  "html": "<!-- Empieza aquí -->",
  "css": "/* opcional: summary { list-style: none; } summary::before { content: '+ '; } details[open] summary::before { content: '- '; } */",
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
      "titulo": "Details and summary",
      "descripcion": "Curso de web.dev sobre details/summary, el marcador por defecto y buenas prácticas de accesibilidad al personalizarlo.",
      "url": "https://web.dev/learn/html/details",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "details",
      "descripcion": "Referencia de MDN con el atributo name para acordeones nativos, el evento toggle y el rol de accesibilidad implícito.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details",
      "etiqueta": "MDN"
    }
  ]
}
```
