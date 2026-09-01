# Multimedia accesible: subtítulos, transcripciones y audiodescripción

- **Módulo:** Accesibilidad
- **Slug:** `multimedia-accesible-subtitulos-transcripciones-y-audiodescripcion` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [Accessible multimedia (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia) — ver `contenido/html/TEMARIO.md` #31

---

## Qué es y para qué sirve

La lección 12 enseñó la sintaxis de `track` (subtitles, captions, descriptions). Esta va sobre el porqué: qué necesita de verdad cada persona ante el mismo vídeo, por qué un transcript sigue haciendo falta aunque ya haya captions, y un límite real de los controles nativos que casi nadie tiene en cuenta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué necesita cada persona del mismo vídeo",
  "roles": [
    { "etiqueta": "Persona sorda", "rol": "Leer diálogo Y contexto sonoro", "descripcion": "captions no es solo el texto de lo que se dice — también \"puerta cerrándose\", \"música tensa\", quién habla y con qué tono." },
    { "etiqueta": "Persona que no entiende el idioma", "rol": "Leer solo la traducción del diálogo", "descripcion": "subtitles asume que SÍ se oye el audio, solo hace falta el diálogo traducido — sin las notas de sonido que sí llevan los captions." },
    { "etiqueta": "Persona ciega", "rol": "Escuchar lo que la pantalla no dice con palabras", "descripcion": "La audiodescripción narra la acción visual relevante en los huecos de silencio del propio audio original." }
  ]
}
```

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el vídeo tiene diálogo, sea cual sea la audiencia",
  "contenido": "Captions o subtitles casi nunca son opcionales de verdad si el vídeo tiene algo que decir."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres que el contenido se pueda buscar y citar",
  "contenido": "Un transcript hace el vídeo indexable, citable con marca de tiempo, y accesible incluso sin reproducir nada."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando la acción visual cuenta algo que el diálogo no dice",
  "contenido": "Un gesto, una expresión, un cambio de escena sin palabras — ahí es donde la audiodescripción aporta algo que ni captions ni subtitles cubren."
}
```

## Captions, subtitles y transcripción: no son intercambiables

| Formato | Qué incluye | Para quién |
|---|---|---|
| Captions | Diálogo + sonidos relevantes (música, efectos, tono) | Personas sordas o con hipoacusia |
| Subtitles | Solo el diálogo, traducido | Quien oye el audio pero no entiende el idioma |
| Transcripción completa | Todo el contenido hablado, en texto corrido | Cualquiera — buscable, citable, accesible sin reproducir nada |

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "SEO real, no solo accesibilidad",
  "contenido": "Los buscadores indexan texto, no vídeo — un transcript hace que el contenido del vídeo aparezca en resultados de búsqueda, y permite enlazar directo a un punto concreto del contenido."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sordera situacional, no solo permanente",
  "contenido": "Un bar ruidoso, una biblioteca donde no se puede subir el volumen — cualquiera se beneficia de tener el texto disponible, no solo quien tiene una discapacidad auditiva."
}
```

## Audiodescripción: narrar lo que la pantalla no dice con palabras

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<video controls>\n  <source src=\"documental.mp4\" type=\"video/mp4\">\n  <track kind=\"descriptions\" src=\"descripciones-es.vtt\" srclang=\"es\" label=\"Español\">\n</video>",
  "anotaciones": [
    { "fragmento": "kind=\"descriptions\"", "nota": "Un track distinto de subtitles o captions — narra lo que ocurre visualmente en los huecos de silencio del audio original, para quien no puede ver la pantalla." }
  ]
}
```

## Un límite real de los controles nativos

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los controles nativos de video no son perfectos",
  "contenido": "En la mayoría de navegadores no se puede navegar con Tab entre los controles internos del reproductor (play, volumen, progreso) — están ahí, pero no son del todo accesibles por teclado. Para control total hace falta construir una interfaz propia sobre la API de HTMLMediaElement."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<video controls src=\"pelicula.mp4\"></video>\n<!-- El usuario llega al vídeo con Tab y sigue pulsando Tab para entrar en los controles -->",
  "opciones": [
    "Tab entra dentro del reproductor y navega entre play, volumen y progreso uno a uno",
    "En la mayoría de navegadores, Tab NO permite moverse entre los controles internos",
    "El navegador abre automáticamente un menú de accesibilidad al llegar al vídeo"
  ],
  "correcta": 1,
  "explicacion": "Los controles nativos del reproductor no son completamente navegables con Tab en la mayoría de navegadores — están ahí visualmente, pero no del todo accesibles por teclado. Para control total hace falta construir una interfaz propia sobre la API de HTMLMediaElement."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No publiques el audio prometiendo la transcripción \"más adelante\"",
  "contenido": "Esa promesa casi nunca se cumple a tiempo, y erosiona la confianza de quien de verdad la necesitaba desde el primer día. Si el contenido es una charla en directo, tomar notas durante la sesión y publicarlas junto al audio, aunque no estén perfectas, es mejor que no publicar nada."
}
```

## Lo que unos subtítulos NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "captions y subtitles son la misma cosa con nombre distinto",
      "realidad": "subtitles traduce solo el diálogo, asumiendo que se oye el audio; captions añade también el contexto sonoro (música, efectos, tono), pensado para quien no oye nada."
    },
    {
      "mito": "Si el vídeo ya tiene captions, no hace falta transcripción",
      "realidad": "Un transcript aporta algo que los captions no dan: contenido buscable, citable con marca de tiempo, y accesible sin reproducir el vídeo entero."
    },
    {
      "mito": "Los controles nativos de video ya son accesibles del todo por defecto",
      "realidad": "En la mayoría de navegadores no se puede navegar entre ellos completamente con teclado — para control total hace falta construir una interfaz propia."
    },
    {
      "mito": "Las herramientas automáticas de subtitulado ya dan un resultado publicable tal cual",
      "realidad": "Su calidad varía mucho — conviene revisarlas y corregirlas antes de publicarlas como definitivas, no confiar en ellas a ciegas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Publicar un vídeo con diálogo sin ningún track de subtítulos.", "texto": "Deja fuera a cualquiera que no pueda o no quiera activar el sonido, sea cual sea el motivo." },
    { "titulo": "Prometer una transcripción para \"más adelante\".", "texto": "Esa promesa casi nunca se cumple a tiempo — mejor publicar algo imperfecto desde el principio que nada." },
    { "titulo": "Confiar en el subtitulado automático sin revisarlo.", "texto": "Su calidad varía mucho según el audio — un error de transcripción puede cambiar el sentido de una frase entera." },
    { "titulo": "Dar por hecho que controls ya hace el reproductor accesible del todo.", "texto": "Los controles nativos no siempre son navegables completamente por teclado — compruébalo en el navegador real antes de darlo por bueno." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras la diferencia entre captions y subtitles con un ejemplo concreto de cada uno.
2. Escribe los tres track (subtitles, captions, descriptions) que añadirías a un documental con diálogo y música de fondo relevante.
3. Piensa en un vídeo que hayas visto sin sonido (en el metro, en una sala de espera) — ¿tenía subtítulos? ¿Lo habrías entendido igual sin ellos?
4. Busca un vídeo real con transcripción publicada — ¿permite saltar a un punto concreto del vídeo desde el propio texto?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Accessible multimedia",
      "descripcion": "Guía de referencia de MDN sobre captions, subtitles, transcripciones, audiodescripción y las limitaciones reales de los controles nativos de video.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia",
      "etiqueta": "MDN"
    }
  ]
}
```
