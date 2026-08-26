# Herramientas para probar accesibilidad de verdad: lector de pantalla, axe y Lighthouse

- **Módulo:** Accesibilidad
- **Slug:** `herramientas-para-probar-accesibilidad-de-verdad-lector-de-pantalla-axe-y-lighthouse` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Accessibility tooling and assistive technology (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling) + [Web Accessibility Evaluation Guide (WebAIM)](https://webaim.org/articles/evaluationguide/) — ver `contenido/html/TEMARIO.md` #29

---

## Qué es y para qué sirve

28 lecciones de reglas no sirven de mucho si nunca se comprueban de verdad. Las herramientas automáticas (axe, Lighthouse, WAVE) detectan en segundos los problemas técnicos más obvios — pero ninguna sabe si el contenido tiene sentido navegado con teclado, o si un texto describe bien lo que describe. Esta lección cierra el módulo con cómo probar de verdad, no solo con qué herramienta instalar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué detecta cada capa de pruebas, y qué se le escapa",
  "roles": [
    { "etiqueta": "Herramientas automáticas", "rol": "Reglas técnicas objetivas", "descripcion": "axe, Lighthouse, WAVE: un alt ausente, un contraste insuficiente, un id duplicado — problemas que se detectan por código, sin entender el contenido." },
    { "etiqueta": "Teclado y lector de pantalla", "rol": "Si de verdad se puede usar", "descripcion": "Ni axe ni Lighthouse saben si el orden de foco tiene sentido, o si un aria-label describe bien lo que hay — eso solo se comprueba navegando de verdad." },
    { "etiqueta": "Personas reales con discapacidad", "rol": "La prueba que ninguna herramienta sustituye", "descripcion": "La única forma fiable de saber si algo funciona de verdad es que lo use quien depende de esa tecnología de asistencia cada día." }
  ]
}
```

## Cuándo lo harías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando terminas cualquier funcionalidad nueva",
  "contenido": "Las herramientas automáticas tardan segundos y detectan los errores más obvios — el primer filtro, nunca el único."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando algo se comporta de forma dinámica",
  "contenido": "Un formulario, un modal, contenido que cambia con JavaScript — ahí es donde las herramientas automáticas fallan más, y hace falta probarlo con teclado y lector de pantalla de verdad."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Antes de dar algo por terminado",
  "contenido": "Un vistazo con CSS desactivado o con el zoom al 400% revela problemas que, con el diseño normal, a simple vista no se notan."
}
```

## Herramientas automáticas: qué sí detectan

| Herramienta | Tipo | Qué detecta |
|---|---|---|
| axe DevTools | Extensión de navegador | Errores técnicos: alt ausente, contraste, roles ARIA mal usados |
| Lighthouse | Integrado en Chrome DevTools | Auditoría de accesibilidad junto con rendimiento y SEO |
| WAVE | Extensión o herramienta web | Resalta visualmente cada problema directamente sobre la página |

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Ninguna herramienta automática entiende el contenido",
  "contenido": "Puede confirmar que un botón tiene un texto accesible, pero no si ese texto describe bien lo que el botón hace. Puede ver que hay un alt, pero no si describe la imagen de verdad o dice solo \"imagen\". Son el primer filtro, nunca la prueba definitiva."
}
```

## Un gotcha real: aria-label pisa a todo lo demás

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<img src=\"logo.png\" alt=\"Logotipo de la empresa\" aria-label=\"Foto decorativa\">",
  "opciones": [
    "El lector de pantalla anuncia el alt: \"Logotipo de la empresa\"",
    "El lector de pantalla anuncia el aria-label: \"Foto decorativa\", ignorando el alt",
    "El lector de pantalla anuncia los dos textos seguidos"
  ],
  "correcta": 1,
  "explicacion": "aria-label tiene más prioridad que alt, label o el propio texto de un enlace — cuando está presente, lo pisa todo. Aquí gana \"Foto decorativa\", aunque sea menos preciso que el alt real — un motivo de peso para revisar con las herramientas de desarrollador o un lector de pantalla qué se está anunciando de verdad."
}
```

## Probar solo con teclado

Gratis, sin instalar nada, y suficiente para detectar muchos problemas reales:

1. **Tab** y **Mayús+Tab** para moverte hacia delante y hacia atrás.
2. **Enter** para activar enlaces y botones.
3. **Espacio** para checkboxes y para activar algunos botones.
4. Las **flechas** para radio buttons, selects y sliders.
5. **Esc** para cerrar diálogos y menús.

Si en algún punto pierdes de vista dónde está el foco, o algo solo se puede activar con clic de ratón, ahí hay un problema real.

## Probar con un lector de pantalla de verdad

| Lector | Plataforma | Coste |
|---|---|---|
| VoiceOver | macOS, iOS | Incluido, gratis |
| TalkBack | Android | Incluido, gratis |
| NVDA | Windows | Gratis |
| JAWS | Windows | De pago |

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Desactivar el CSS revela el orden de lectura real",
  "contenido": "Sin ningún estilo, el contenido se muestra en el orden exacto del HTML — el mismo orden que sigue un lector de pantalla, sin importar cómo lo haya reordenado visualmente el CSS (ver la lección 24)."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Zoom al 400% sin perder contenido",
  "contenido": "Ampliar la página a 400% y reducir la ventana a un ancho pequeño simula cómo la ve alguien con baja visión en un dispositivo modesto — si algo desaparece o se corta, es una señal real de un problema."
}
```

## Lo que probar accesibilidad NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si axe o Lighthouse no marcan ningún error, la página es accesible",
      "realidad": "Solo detectan problemas técnicos objetivos — nada les dice si el contenido tiene sentido navegado de verdad con teclado o lector de pantalla."
    },
    {
      "mito": "aria-label es solo una alternativa más a alt o label, con la misma prioridad",
      "realidad": "Cuando está presente, pisa a alt, a label y al texto del enlace — un aria-label mal escrito puede esconder un texto accesible correcto que ya existía."
    },
    {
      "mito": "Probar con lector de pantalla requiere hardware o software especial caro",
      "realidad": "VoiceOver (macOS/iOS) y TalkBack (Android) ya vienen incluidos en el sistema operativo, gratis, listos para activar."
    },
    {
      "mito": "Las herramientas automáticas sustituyen la prueba con usuarios reales",
      "realidad": "Son un primer filtro rápido — la única prueba que confirma de verdad si algo funciona es que lo use alguien que depende de esa tecnología cada día."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confiar solo en el resultado de una herramienta automática.", "texto": "Detecta reglas técnicas, no si la experiencia real tiene sentido — hace falta complementarla con teclado y lector de pantalla." },
    { "titulo": "No comprobar qué aria-label gana cuando hay varios atributos compitiendo.", "texto": "aria-label pisa a alt y a label — conviene verificar con las herramientas de desarrollador qué texto se está anunciando de verdad." },
    { "titulo": "Probar la accesibilidad solo al final del proyecto.", "texto": "Encontrar un problema estructural tarde sale mucho más caro de arreglar que detectarlo mientras se construye." },
    { "titulo": "No probar nunca con el CSS desactivado o con zoom alto.", "texto": "Son pruebas gratuitas, de segundos, que revelan problemas de orden de lectura y de contenido cortado, invisibles con el diseño normal." }
  ]
}
```

## Ejercicios

1. Instala axe DevTools o usa Lighthouse en una web tuya — ¿qué errores marca? ¿Cuáles ya conocías?
2. Navega esa misma página solo con teclado — ¿el orden de Tab tiene sentido? ¿Se ve siempre el foco?
3. Activa el lector de pantalla de tu sistema operativo y navega la página por encabezados — ¿tiene sentido la estructura?
4. Desactiva el CSS de una página (View > Page Style > No Style en Firefox) — ¿el contenido se sigue leyendo en un orden lógico?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Accessibility tooling and assistive technology",
      "descripcion": "Guía de referencia de MDN sobre axe, Lighthouse, WAVE, y atajos de teclado reales de VoiceOver y NVDA.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Web Accessibility Evaluation Guide",
      "descripcion": "Guía práctica de WebAIM con el proceso de evaluación completo, incluida la prioridad de aria-label sobre alt y label.",
      "url": "https://webaim.org/articles/evaluationguide/",
      "etiqueta": "WebAIM"
    }
  ]
}
```
