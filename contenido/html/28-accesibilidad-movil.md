# Accesibilidad móvil y táctil: tamaño de objetivos, zoom y viewport

- **Módulo:** Accesibilidad
- **Slug:** `accesibilidad-movil-y-tactil-tamano-de-objetivos-zoom-y-viewport` (autogenerado del título)
- **Orden:** 135
- **Fuentes:** [Mobile accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile) + [WCAG 2.2 — Target Size Minimum (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=258#target-size-minimum) para el número normativo exacto de tamaño de objetivo — ver `contenido/html/TEMARIO.md` #28

---

## Qué es y para qué sirve

Un dedo cubre mucha más área que la punta de un cursor, y no tiene su misma precisión. Lo que en un ratón se resuelve con un clic certero, en una pantalla táctil depende de que el objetivo sea lo bastante grande, de que el zoom siga disponible para quien lo necesita, y de que el viewport esté configurado para ayudar, no para estorbar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué necesita quien navega con el dedo, no con un cursor preciso",
  "roles": [
    { "etiqueta": "Quien tiene menos precisión motora", "rol": "Objetivos táctiles suficientemente grandes", "descripcion": "Un dedo cubre mucha más área que la punta de un cursor — un botón pequeño es fácil de fallar, sobre todo con temblor o menos control fino." },
    { "etiqueta": "Quien necesita ampliar el texto", "rol": "Poder hacer zoom sin que se rompa nada", "descripcion": "Deshabilitar el zoom le quita a esta persona la única forma que tenía de leer el contenido con comodidad." },
    { "etiqueta": "Quien usa el móvil con una sola mano", "rol": "Controles alcanzables y grandes", "descripcion": "Objetivos pequeños o muy juntos obligan a usar las dos manos o a apuntar con más cuidado del que la situación permite." }
  ]
}
```

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando diseñas cualquier botón o enlace para móvil",
  "contenido": "El tamaño del objetivo no es un detalle visual — es directamente si alguien puede pulsarlo sin fallar."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando configuras el viewport de tu página",
  "contenido": "Es el único sitio donde se decide si el zoom del usuario funciona o no — una sola línea mal puesta puede quitarle esa posibilidad a mucha gente."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el diseño incluye gestos que solo funcionan con dedo",
  "contenido": "Arrastrar, deslizar, pellizcar para hacer zoom — si no hay una alternativa por teclado o por toque simple, alguien se queda sin poder usar esa función."
}
```

## Tamaño de objetivos táctiles: el número real

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "24×24 píxeles CSS, el mínimo normativo",
  "contenido": "El criterio WCAG 2.5.8 (nivel AA) exige que un objetivo activable con puntero mida al menos 24×24 píxeles CSS — o que, si es más pequeño, tenga al menos esa misma distancia de espacio libre alrededor. Los enlaces dentro de un párrafo de texto están exentos, porque romper el flujo del texto para agrandarlos no sería razonable."
}
```

## El viewport y por qué nunca deshabilitar el zoom

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n<!-- Evita esto: -->\n<meta name=\"viewport\" content=\"width=device-width, user-scalable=no\">",
  "anotaciones": [
    { "fragmento": "content=\"width=device-width, initial-scale=1\"", "nota": "El viewport correcto: ajusta el ancho al del dispositivo, sin bloquear nada — el usuario conserva el control del zoom." },
    { "fragmento": "user-scalable=no", "nota": "Desactiva el zoom por completo. Mucha gente depende de él para leer el contenido con comodidad — quitarlo es una regresión de accesibilidad real, casi nunca justificada." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<meta name=\"viewport\" content=\"width=device-width, maximum-scale=1, user-scalable=no\">",
  "opciones": [
    "El usuario puede seguir haciendo zoom pellizcando la pantalla, solo que un poco más despacio",
    "El usuario pierde por completo la posibilidad de hacer zoom en esa página",
    "Solo afecta al zoom del navegador — el sistema operativo lo puede forzar igualmente"
  ],
  "correcta": 1,
  "explicacion": "maximum-scale=1 junto con user-scalable=no elimina la posibilidad de hacer zoom en la mayoría de navegadores móviles — quien depende del zoom para leer con comodidad se queda sin esa opción en esa página en concreto."
}
```

## Otros factores que también importan

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una sola columna suele ganar en pantallas estrechas",
  "contenido": "Un diseño de varias columnas que funciona en escritorio rara vez funciona igual de bien en un móvil. Esto ya es terreno de CSS (media queries, flexbox), fuera del alcance de este curso, pero conviene tenerlo en la cabeza al maquetar."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un control que solo responde al ratón no funciona en móvil",
  "contenido": "Escuchar solo el evento mousedown deja fuera a quien usa pantalla táctil — territorio de JavaScript, pero elegir el control HTML correcto (button, no un div personalizado) ya evita buena parte del problema desde el principio."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un menú hamburguesa mal hecho tapa la navegación",
  "contenido": "El botón que lo abre tiene que ser alcanzable con el mecanismo de control que se use, y el resto de la página debe quedar oculto o fuera del recorrido de foco mientras el menú está abierto, para no mezclar ambos contenidos."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuanto menos se escriba a mano en móvil, mejor",
  "contenido": "Un select con opciones predefinidas evita escribir letra a letra en un teclado táctil — y los tipos de input especializados (lección 18) ya activan el teclado adecuado para cada dato: numérico, de teléfono, con @ para el correo."
}
```

## Lo que la accesibilidad móvil NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Deshabilitar el zoom evita que el usuario \"rompa\" el diseño",
      "realidad": "Le quita a mucha gente la única forma que tenía de leer el contenido con comodidad — si el diseño se rompe con zoom, el problema está en el diseño, no en el zoom."
    },
    {
      "mito": "El tamaño de un botón es solo una decisión estética",
      "realidad": "Por debajo de 24×24 píxeles CSS sin espacio compensando, se convierte en un objetivo que mucha gente falla al pulsar — es un criterio normativo real (WCAG 2.5.8), no solo una preferencia de diseño."
    },
    {
      "mito": "Si funciona bien con el ratón en escritorio, funcionará igual con el dedo en móvil",
      "realidad": "Un dedo cubre mucha más área que un cursor y no tiene su misma precisión — lo que funciona con precisión de píxel en un ratón puede ser imposible de acertar con el dedo."
    },
    {
      "mito": "Los enlaces dentro de un párrafo también necesitan 24×24 píxeles",
      "realidad": "Están exentos explícitamente en WCAG 2.5.8 — agrandarlos rompería el flujo natural del texto, así que el criterio no se aplica ahí."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar user-scalable=no o maximum-scale=1 en el viewport.", "texto": "Elimina el zoom para quien lo necesita — casi nunca hay una razón que lo justifique." },
    { "titulo": "Poner botones táctiles más pequeños de 24×24 píxeles sin espacio de compensación.", "texto": "Se convierten en objetivos que mucha gente falla al intentar pulsarlos con el dedo." },
    { "titulo": "Diseñar un menú hamburguesa sin ocultar el resto de la página mientras está abierto.", "texto": "Mezcla dos contextos de navegación a la vez, confuso tanto con teclado como con lector de pantalla." },
    { "titulo": "Pedir que se escriba a mano algo que podría ser un select o un input especializado.", "texto": "En un teclado táctil, cada carácter cuesta más que en uno físico — minimizar la escritura ayuda a todo el mundo." }
  ]
}
```

## Ejercicios

1. Revisa los botones de una web que hayas hecho o uses a menudo — ¿miden al menos 24×24 píxeles CSS, o tienen espacio suficiente alrededor?
2. Escribe la etiqueta meta viewport correcta, que nunca deshabilite el zoom.
3. Encuentra un ejemplo real de un menú hamburguesa — ¿oculta el resto de la página mientras está abierto? ¿Su botón es lo bastante grande para pulsarlo con el dedo?
4. Piensa en un formulario que hayas rellenado en el móvil — ¿pedía escribir algo que podría haber sido un select o un tipo de input especializado?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Mobile accessibility",
      "descripcion": "Guía de referencia de MDN sobre el viewport, eventos táctiles frente a eventos de ratón, y menús hamburguesa accesibles.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile",
      "etiqueta": "MDN"
    },
    {
      "titulo": "WCAG 2.2 — Target Size (Minimum)",
      "descripcion": "El criterio normativo del W3C/WAI que fija en 24×24 píxeles CSS el tamaño mínimo de un objetivo táctil, con sus excepciones exactas.",
      "url": "https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=258#target-size-minimum",
      "etiqueta": "W3C/WAI"
    }
  ]
}
```
