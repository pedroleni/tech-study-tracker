# Temario de HTML — planteado desde cero

**Alcance:** temario completo de la tecnología "HTML", pensado desde
cero (2026-08-21) sin dar por buenas las 3 lecciones que ya existen en
producción ("Pruebas", "La estructura de una página", "Lo mínimo que
el navegador necesita para funcionar") — se reescriben también, siguen
este temario igual que cualquier lección nueva.

**De dónde sale el orden y el contenido:** [MDN Learn web
development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
— es la fuente que ya seguisteis de facto al escribir las 2 lecciones
piloto, es gratuita, mantenida por Mozilla (no un curso de pago con
sesgo comercial) y es la referencia técnica más citada para HTML en la
industria. Cada lección de abajo enlaza a su artículo real
correspondiente — no son URLs inventadas, se verificaron en vivo
(`WebFetch`) el 2026-08-21. Úsalas como referencia técnica al escribir,
no para copiar/traducir: el estilo narrativo propio de este proyecto
("Qué es y para qué sirve" / "Cuándo lo usarías de verdad" / "Errores
típicos" / "Ejercicios") es más informal y con más contexto de "por
qué te importa esto en 2026" que el tono de referencia de MDN.

**Plantilla de lección** (la que ya usan las 2 lecciones piloto —
mantenerla):

```
## Qué es y para qué sirve
## Cuándo lo usarías de verdad 👤
## Cómo se usa
## Errores típicos 👤
## Ejercicios
## Para profundizar
```

---

## Módulo 1 — Fundamentos del documento

| # | Lección | Fuente principal |
|---|---|---|
| 1 | Lo mínimo que el navegador necesita para funcionar (`<!doctype>`, `<html>`, `<head>`, `<body>`) | [Basic HTML syntax](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) |
| 2 | Qué va en el `<head>`: metadatos, `<title>`, favicon, enlaces a CSS | [What's in the head?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) |
| 3 | La estructura de una página: `header`, `nav`, `main`, `footer` | [Structuring documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents) |

## Módulo 2 — Texto y contenido

| # | Lección | Fuente principal |
|---|---|---|
| 4 | Encabezados y párrafos: la jerarquía del contenido | [Headings and paragraphs](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs) |
| 5 | Énfasis e importancia: por qué `<strong>` no es solo "negrita" | [Emphasis and importance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance) |
| 6 | Listas: ordenadas, desordenadas y de descripción | [Lists](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists) |
| 7 | Texto avanzado: citas, código, abreviaturas, datos de contacto | [Advanced text features](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features) |

## Módulo 3 — Enlaces

| # | Lección | Fuente principal |
|---|---|---|
| 8 | Crear enlaces: rutas relativas/absolutas, `target`, `rel`, buenas prácticas | [Creating links](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links) |

## Módulo 4 — Multimedia

| # | Lección | Fuente principal |
|---|---|---|
| 9 | Imágenes: `<img>`, `alt`, `<figure>`/`<figcaption>` | [HTML images](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images) |
| 10 | Vídeo y audio: `<video>`, `<audio>`, subtítulos | [HTML video and audio](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio) |
| 11 | Gráficos vectoriales: SVG inline vs `<img src="*.svg">` | [Including vector graphics in HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML) |
| 12 | Embeber contenido externo: `<iframe>`, `<embed>`, `<object>` | [From object to iframe](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies) |

## Módulo 5 — Tablas

| # | Lección | Fuente principal |
|---|---|---|
| 13 | Tablas: filas, celdas, cabeceras, cómo no romperlas | [HTML table basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) |
| 14 | Accesibilidad en tablas: `caption`, `scope`, `thead`/`tbody`/`tfoot` | [HTML table accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility) |

## Módulo 6 — Formularios

| # | Lección | Fuente principal |
|---|---|---|
| 15 | Formularios: anatomía completa (`<form>`, `method`, `action`) | [Your first form](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form) + [How to structure a web form](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/How_to_structure_a_web_form) |
| 16 | Campos de formulario: tipos de `<input>` y cuándo usar cada uno | [Basic native form controls](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Basic_native_form_controls) + [The HTML5 input types](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types) |
| 17 | Validación nativa: `required`, `pattern`, mensajes del navegador | [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) |
| 18 | Formularios accesibles de verdad: `label`, `fieldset`/`legend` | [HTML forms in Structuring content](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_forms) + [HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) |

## Módulo 7 — Accesibilidad

**Ampliado 2026-08-21** — la primera versión de este temario metía
"HTML semántico" y "ARIA" como 2 lecciones que además reciclaban el
mismo artículo de MDN como fuente para las dos. Insuficiente para algo
que este proyecto ya trata como transversal (ver
`specs/design-system.md` principio 3). Ahora cada lección tiene su
propia fuente real, y se cruza MDN con [WAI-ARIA (W3C)](https://www.w3.org/WAI/standards-guidelines/aria/)
y [WebAIM](https://webaim.org/) — dos autoridades independientes de
Mozilla, para no depender de una sola fuente en el tema que más se
presta a quedarse corto si solo se copia un artículo.

| # | Lección | Fuente principal |
|---|---|---|
| 19 | Qué es la accesibilidad y por qué te importa | [What is accessibility?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility) |
| 20 | HTML semántico: la base de la accesibilidad | [HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) |
| 21 | WAI-ARIA: cuándo hace falta y cuándo es un parche mal puesto | [WAI-ARIA basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics) + [ARIA Authoring Practices Guide (W3C/WAI)](https://www.w3.org/WAI/ARIA/apg/) para patrones concretos (diálogos, tabs, menús) |
| 22 | Multimedia accesible: subtítulos, transcripciones, audiodescripción | [Accessible multimedia](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia) |
| 23 | Accesibilidad móvil y táctil: tamaño de objetivos, zoom, viewport | [Mobile accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile) |
| 24 | Herramientas para probar accesibilidad de verdad: lector de pantalla, axe, Lighthouse | [Accessibility tooling and assistive technology (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling) + [Web Accessibility Evaluation Guide (WebAIM)](https://webaim.org/articles/evaluationguide/) |

## Módulo 8 — Calidad

| # | Lección | Fuente principal |
|---|---|---|
| 25 | Depurar HTML: DevTools, validador W3C, errores de anidamiento | [Debugging HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML) |
| 26 | HTML y SEO: qué lee de verdad un buscador | [What's in the head?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) (sección metadatos SEO) |

---

## Notas de alcance

- **26 lecciones, 8 módulos.** La primera versión tenía 22 — subió al
  ampliar accesibilidad de verdad (nota de arriba), no por forzar
  ningún número. Las "~24 fichas" que se mencionaban de pasada en
  `specs/features/lecciones.md` al planear el modelo de datos nunca
  fueron un temario real, solo una estimación de orden de magnitud —
  la coincidencia aproximada es eso, coincidencia.
- **Fuera de este temario, a propósito:** todo lo que en el módulo de
  formularios de MDN es CSS (`Styling web forms`, `Advanced form
  styling`, `Customizable select`, `UI pseudo-classes`) o JavaScript
  (`Sending forms through JavaScript`, `How to build custom form
  controls`) — pertenece a las tecnologías CSS/JavaScript de este
  mismo catálogo cuando existan, no a HTML. Mismo criterio para
  "CSS and JavaScript accessibility best practices" del módulo de
  accesibilidad de MDN — se revisita cuando exista la tecnología CSS.
- Los "Test your skills"/"Challenge" de MDN no se traducen en
  lecciones propias — se incorporan como preguntas dentro de la
  sección `## Ejercicios` de la lección correspondiente, igual que ya
  hacían las 2 lecciones piloto.
- Las 3 lecciones que ya existen en producción se sustituyen por las
  del módulo 1 correspondientes (y "Pruebas" se borra, es un
  placeholder) — no se ha tocado nada en producción todavía, esto es
  solo el plan.
