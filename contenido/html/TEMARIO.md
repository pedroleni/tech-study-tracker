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

## Módulo 7 — Semántica y accesibilidad

| # | Lección | Fuente principal |
|---|---|---|
| 19 | HTML semántico: por qué el navegador (y el lector de pantalla) necesita saber qué es cada cosa | [HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) |
| 20 | ARIA: cuándo hace falta y cuándo es un parche mal puesto | [HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) (sección ARIA) |

## Módulo 8 — Calidad

| # | Lección | Fuente principal |
|---|---|---|
| 21 | Depurar HTML: DevTools, validador W3C, errores de anidamiento | [Debugging HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML) |
| 22 | HTML y SEO: qué lee de verdad un buscador | [What's in the head?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) (sección metadatos SEO) |

---

## Notas de alcance

- **22 lecciones, 8 módulos** — deliberadamente sin forzar las "~24
  fichas" que se mencionaban de pasada en `specs/features/lecciones.md`
  al planear el modelo de datos; ese número nunca fue un temario real,
  solo una estimación de orden de magnitud.
- **Fuera de este temario, a propósito:** todo lo que en el módulo de
  formularios de MDN es CSS (`Styling web forms`, `Advanced form
  styling`, `Customizable select`, `UI pseudo-classes`) o JavaScript
  (`Sending forms through JavaScript`, `How to build custom form
  controls`) — pertenece a las tecnologías CSS/JavaScript de este
  mismo catálogo cuando existan, no a HTML.
- Los "Test your skills"/"Challenge" de MDN no se traducen en
  lecciones propias — se incorporan como preguntas dentro de la
  sección `## Ejercicios` de la lección correspondiente, igual que ya
  hacían las 2 lecciones piloto.
- Las 3 lecciones que ya existen en producción se sustituyen por las
  del módulo 1 correspondientes (y "Pruebas" se borra, es un
  placeholder) — no se ha tocado nada en producción todavía, esto es
  solo el plan.
