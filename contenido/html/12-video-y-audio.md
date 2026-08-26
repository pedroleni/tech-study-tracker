# Vídeo y audio: video, audio y subtítulos con track

- **Módulo:** Multimedia
- **Slug:** `video-y-audio-video-audio-y-subtitulos-con-track` (autogenerado del título)
- **Orden:** 55
- **Fuentes:** [HTML video and audio (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio) + [Audio and Video (web.dev)](https://web.dev/learn/html/audio-video) — ver `contenido/html/TEMARIO.md` #12

---

## Qué es y para qué sirve

`<video>` y `<audio>` incrustan contenido multimedia nativo, sin depender de un reproductor externo o de un plugin. Los dos comparten casi todos sus atributos, pero un par de decisiones — llevar `controls` o no, cómo ofrecer varios formatos, si añadir subtítulos — cambian bastante quién puede realmente usar ese contenido, no solo quién lo ve o lo oye cómodamente.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién depende de cómo publiques el vídeo",
  "roles": [
    { "etiqueta": "Persona sorda o con hipoacusia", "rol": "Leer los captions", "descripcion": "kind=\"captions\" no solo traduce el diálogo — también describe sonidos relevantes (\"puerta cerrándose de golpe\"), información que el audio da y el vídeo solo no." },
    { "etiqueta": "Persona ciega o con baja visión", "rol": "Escuchar las descriptions", "descripcion": "kind=\"descriptions\" narra lo que pasa en pantalla cuando el diálogo por sí solo no lo cuenta — un gesto, una acción sin palabras." },
    { "etiqueta": "Quien navega en un entorno silencioso", "rol": "Controlar el sonido con controls", "descripcion": "Sin la barra de controles nativa no hay forma de pausar ni bajar el volumen sin JavaScript propio — crítico también para quien tiene epilepsia fotosensible." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el contenido es audiovisual de verdad",
  "contenido": "Una demo de producto, una entrevista, un tutorial en vídeo — ahí video con controls es la forma nativa, sin depender de un reproductor de terceros incrustado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando solo hace falta sonido",
  "contenido": "Un podcast, una nota de voz, un efecto sonoro — audio ahorra todo el peso visual que video no necesitaría de todas formas."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el vídeo tiene diálogo o información sonora relevante",
  "contenido": "Ahí track con subtítulos o captions no es un extra — es lo que hace el contenido accesible a quien no puede, o no quiere, activar el sonido."
}
```

## Cómo se usa: video con controls

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<video controls width=\"640\" height=\"360\" poster=\"portada.jpg\">\n  <source src=\"demo.webm\" type=\"video/webm\">\n  <source src=\"demo.mp4\" type=\"video/mp4\">\n  <p>Tu navegador no soporta vídeo HTML. Aquí tienes un <a href=\"demo.mp4\">enlace directo al archivo</a>.</p>\n</video>",
  "anotaciones": [
    { "fragmento": "controls", "nota": "Sin este atributo, no hay ninguna forma de pausar, subir el volumen o ver el progreso — imprescindible por accesibilidad, no solo por comodidad." },
    { "fragmento": "poster=\"portada.jpg\"", "nota": "La imagen que se ve antes de darle a play. Conviene que tenga la misma proporción que el vídeo real, o se produce un salto de tamaño cuando el vídeo la reemplaza." },
    { "fragmento": "<p>Tu navegador no soporta vídeo HTML. Aquí tienes un <a href=\"demo.mp4\">enlace directo al archivo</a>.</p>", "nota": "Contenido de respaldo — solo se muestra si el navegador no entiende ni siquiera la etiqueta video. Cualquier navegador mínimamente moderno lo ignora por completo." }
  ]
}
```

## audio: lo mismo, sin parte visual

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<audio controls>\n  <source src=\"episodio.ogg\" type=\"audio/ogg\">\n  <source src=\"episodio.mp3\" type=\"audio/mp3\">\n  <p>Tu navegador no soporta audio HTML. <a href=\"episodio.mp3\">Descarga el episodio</a>.</p>\n</audio>",
  "anotaciones": [
    { "fragmento": "<audio controls>", "nota": "Misma sintaxis que video, pero sin componente visual propio: no acepta width, height ni poster, porque no hay nada que dibujar más allá de la barra de controles." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué casi siempre hacen falta dos source",
  "contenido": "No todos los navegadores soportan los mismos códecs — WebM (VP9) suele pesar menos pero no llega a todas partes; MP4 (H.264) es el más compatible pero pesa más. El navegador prueba cada source en orden y se queda con el primero que sepa reproducir."
}
```

## Subtítulos y descripciones con track

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un track, atributo por atributo",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "track", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "kind", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"captions\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "src", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"subs-es.vtt\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "srclang", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"es\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "label", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"Español\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

`kind` no es un único valor genérico — cada uno sirve a un caso real distinto:

| `kind` | Para qué sirve | Para quién |
|---|---|---|
| `subtitles` | Traduce el diálogo a otro idioma | Quien entiende el audio pero no el idioma hablado |
| `captions` | Transcribe el diálogo y describe sonidos relevantes | Personas sordas o con hipoacusia |
| `descriptions` | Narra lo que pasa en pantalla | Personas ciegas o con baja visión |

## autoplay, muted y por qué casi nunca deberías usarlo

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "autoplay sin muted, en la práctica, no funciona",
  "contenido": "Los navegadores modernos bloquean el autoplay con sonido salvo que el vídeo lleve también el atributo muted — es una política real del navegador contra el audio inesperado, no una sugerencia de estilo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<video src=\"anuncio.mp4\" autoplay></video>\n<!-- Sin el atributo muted -->",
  "opciones": [
    "El vídeo empieza a reproducirse automáticamente, con sonido",
    "La mayoría de navegadores modernos bloquean el autoplay porque falta muted",
    "El navegador ignora src porque autoplay necesita controls para funcionar"
  ],
  "correcta": 1,
  "explicacion": "Chrome, Firefox y Safari bloquean el autoplay con sonido por defecto, y solo lo permiten si el vídeo también lleva muted. Es una protección real contra el autoplay ruidoso, no un detalle menor: sin muted, autoplay simplemente no hace nada en la mayoría de los casos."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "playsinline, para vídeos de fondo en móvil",
  "contenido": "En iOS, un vídeo sin este atributo se abre a pantalla completa nada más reproducirse. playsinline, combinado con autoplay y muted, permite que se reproduzca integrado en la página, como un vídeo de fondo decorativo."
}
```

## Lo que video y audio NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "controls es opcional si luego añades tus propios botones",
      "realidad": "Sin JavaScript propio que implemente play, pausa y volumen, quitar controls deja el vídeo sin ninguna forma de controlarlo — crítico incluso por motivos médicos, como la epilepsia fotosensible."
    },
    {
      "mito": "autoplay funciona siempre que lo escribas",
      "realidad": "Los navegadores modernos lo bloquean salvo que también lleve muted — sin eso, el atributo simplemente no hace nada en la práctica."
    },
    {
      "mito": "subtitles y captions son la misma etiqueta con distinto nombre",
      "realidad": "subtitles asume que oyes el audio pero no entiendes el idioma; captions asume que no oyes nada, e incluye también los sonidos relevantes (\"puerta cerrándose\"), no solo el diálogo traducido."
    },
    {
      "mito": "poster es solo un detalle estético",
      "realidad": "Si no coincide en proporción con el vídeo real, provoca un salto de layout al cargar — el mismo problema que un width/height ausente en una imagen."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar autoplay con sonido esperando que funcione.", "texto": "Sin muted, la mayoría de navegadores lo bloquean directamente — el vídeo se queda pausado en el primer frame, sin ningún aviso de error." },
    { "titulo": "No incluir contenido de respaldo dentro de video/audio.", "texto": "Un párrafo con un enlace directo al archivo es la red de seguridad para el navegador más antiguo que no entienda ni siquiera la etiqueta." },
    { "titulo": "Olvidar el atributo type en cada source.", "texto": "Sin él, el navegador tiene que empezar a descargar el archivo para saber si lo soporta, en vez de descartarlo al instante por su tipo MIME." },
    { "titulo": "Publicar vídeo sin ningún track de subtítulos.", "texto": "Deja fuera a cualquiera que no pueda o no quiera activar el sonido — tan real en una oficina o en el móvil como para una persona sorda." }
  ]
}
```

## Ejercicios

1. Escribe un video con controls, dos source (webm y mp4) y contenido de respaldo con un enlace directo al archivo.
2. Añade a ese mismo vídeo un track de subtitles en español y otro de captions en inglés, con kind, src, srclang y label correctos en los dos.
3. Escribe un audio con controls para un podcast ficticio, con dos formatos distintos (mp3 y ogg).
4. Explica con tus palabras por qué un vídeo de fondo decorativo necesita autoplay, muted y playsinline los tres a la vez, no solo uno de ellos.
5. Busca un vídeo real en una web que uses a menudo — ¿tiene subtítulos disponibles? ¿Se reproduce solo, nada más cargar la página?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML video and audio",
      "descripcion": "Guía de referencia de MDN sobre video, audio, source, track y los distintos formatos y códecs soportados por cada navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Audio and Video",
      "descripcion": "Curso de web.dev centrado en accesibilidad y rendimiento: la política de autoplay de los navegadores, playsinline y vídeos de fondo.",
      "url": "https://web.dev/learn/html/audio-video",
      "etiqueta": "web.dev"
    }
  ]
}
```
