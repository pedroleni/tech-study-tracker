# Audio y vídeo desde JavaScript

- **Módulo:** APIs del navegador
- **Slug:** `audio-y-video-desde-javascript` (autogenerado del título)
- **Orden:** 191
- **Fuentes:** [Video and audio APIs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Video_and_audio_APIs) — ver `contenido/javascript/TEMARIO.md` #64

---

## Qué es y para qué sirve

`<video>` y `<audio>` comparten la misma API de control desde JavaScript — `play()`, `pause()`, y las propiedades que reflejan y controlan la reproducción. La base de cualquier reproductor con controles propios, en vez de los del navegador.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita controlar la reproducción de un medio",
  "roles": [
    { "etiqueta": "Quien alterna reproducir/pausar", "rol": "play() / pause() / paused", "descripcion": "paused refleja el estado real — se consulta antes de decidir cuál de los dos métodos llamar." },
    { "etiqueta": "Quien salta a un punto concreto", "rol": "currentTime", "descripcion": "No es de solo lectura — asignarle un valor mueve la reproducción a ese instante." },
    { "etiqueta": "Quien mantiene la interfaz actualizada", "rol": "timeupdate / ended", "descripcion": "Eventos que se disparan mientras se reproduce, o justo cuando termina por su cuenta." }
  ]
}
```

## play(), pause() y la propiedad paused

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const media = document.querySelector('video');\n  const boton = document.querySelector('.reproducir');\n\n  function alternarReproduccion() {\n    if (media.paused) {\n      media.play();\n      boton.textContent = 'Pausa';\n    } else {\n      media.pause();\n      boton.textContent = 'Reproducir';\n    }\n  }\n\n  boton.addEventListener('click', alternarReproduccion);\n</script>",
  "anotaciones": [
    { "fragmento": "if (media.paused) {", "nota": "paused es una propiedad BOOLEAN que refleja el estado real del elemento — se consulta antes de decidir si llamar a play() o a pause(), sin necesitar guardar ese estado por separado en ninguna variable propia." }
  ]
}
```

## currentTime: lectura Y escritura

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(media.currentTime); // segundos transcurridos, en cualquier momento\n  console.log(media.duration);    // duración TOTAL, en segundos (solo lectura)\n\n  media.currentTime = 0; // salta al principio\n</script>",
  "anotaciones": [
    { "fragmento": "media.currentTime = 0; // salta al principio", "nota": "currentTime NO es de solo lectura — asignarle un valor SALTA la reproducción a ese punto exacto, sin necesitar ningún método aparte. duration, en cambio, solo se lee." }
  ]
}
```

## Avanzar sin pasarse del final

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function avanzar() {\n    if (media.currentTime >= media.duration - 3) {\n      media.currentTime = 0;\n      media.pause();\n    } else {\n      media.currentTime += 3; // avanza 3 segundos\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (media.currentTime >= media.duration - 3) {", "nota": "Comprobar el límite ANTES de sumar evita pasarse de duration — si quedan menos de 3 segundos, se detiene en vez de intentar saltar más allá del final del vídeo." }
  ]
}
```

## timeupdate: mantener un contador en pantalla

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  media.addEventListener('timeupdate', () => {\n    const minutos = Math.floor(media.currentTime / 60);\n    const segundos = Math.floor(media.currentTime - minutos * 60);\n\n    const textoMinutos = minutos.toString().padStart(2, '0');\n    const textoSegundos = segundos.toString().padStart(2, '0');\n\n    document.querySelector('.tiempo').textContent = `${textoMinutos}:${textoSegundos}`;\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "media.addEventListener('timeupdate', () => {", "nota": "timeupdate se dispara repetidamente MIENTRAS se reproduce — el lugar natural para mantener un contador de tiempo actualizado en pantalla." },
    { "fragmento": "const textoMinutos = minutos.toString().padStart(2, '0');", "nota": "padStart(2, '0') asegura dos dígitos siempre (03, no 3) — un detalle visual habitual en un contador de tiempo." }
  ]
}
```

## ended: reaccionar cuando termina por su cuenta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  media.addEventListener('ended', () => {\n    media.currentTime = 0;\n    boton.textContent = 'Reproducir';\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "media.addEventListener('ended', () => {", "nota": "ended se dispara UNA vez, justo cuando el vídeo llega al final por su cuenta — el momento natural para reiniciar la interfaz a su estado inicial." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Quitar los controles nativos antes de añadir los propios",
  "contenido": "Al construir controles propios, conviene quitar el atributo controls nativo del <video> (media.removeAttribute('controls')) — de lo contrario, los controles del navegador y los personalizados conviven, duplicando la interfaz."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const media = document.querySelector('video');\n  media.currentTime = 45;\n  media.play();\n\n  console.log(media.paused);\n</script>",
  "opciones": [
    "false — llamar a play() cambia paused a false de inmediato, independientemente de currentTime",
    "true — cambiar currentTime pausa automáticamente el vídeo",
    "undefined — paused no está disponible hasta que el vídeo termina de cargar"
  ],
  "correcta": 0,
  "explicacion": "Asignar currentTime = 45 salta la posición de reproducción, sin pausar nada. Llamar a media.play() cambia paused a false — refleja si el elemento está en 'modo reproducción', sin importar en qué punto exacto se encuentre currentTime."
}
```

## Lo que estas propiedades NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "currentTime es una propiedad de solo lectura, como duration",
      "realidad": "Asignarle un valor SALTA la reproducción a ese punto — duration sí es de solo lectura."
    },
    {
      "mito": "El estado de reproducción hay que guardarlo en una variable propia, aparte del elemento",
      "realidad": "paused ya refleja el estado real — consultarlo directamente evita duplicar esa información."
    },
    {
      "mito": "timeupdate se dispara solo una vez, al empezar la reproducción",
      "realidad": "Se dispara repetidamente MIENTRAS el vídeo se reproduce."
    },
    {
      "mito": "Los controles personalizados y los nativos del navegador no interfieren entre sí",
      "realidad": "Sin quitar el atributo controls, ambos conviven y duplican la interfaz."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Guardar el estado de reproducción en una variable propia en vez de consultar paused.", "texto": "paused ya refleja la verdad — duplicarlo puede desincronizarse." },
    { "titulo": "No comprobar el límite de duration antes de sumar tiempo al avanzar.", "texto": "Se corre el riesgo de intentar saltar más allá del final del vídeo." },
    { "titulo": "Olvidar quitar el atributo controls nativo al construir una interfaz personalizada.", "texto": "Provoca que ambas interfaces convivan, duplicadas." },
    { "titulo": "Confundir currentTime (lectura y escritura) con duration (solo lectura).", "texto": "Intentar asignar duration no tiene ningún efecto." }
  ]
}
```

## Ejercicios

1. Crea un botón que alterne entre reproducir y pausar un `<video>`, consultando su propiedad `paused`.
2. Usa `currentTime` para saltar a un punto concreto del vídeo, y para reiniciarlo a `0`.
3. Escucha el evento `timeupdate` y muestra el tiempo transcurrido en formato minutos:segundos.
4. Escucha el evento `ended`, y reinicia la interfaz cuando el vídeo termine por su cuenta.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Video and audio APIs",
      "descripcion": "Guía de MDN con un reproductor de vídeo personalizado completo: play()/pause()/paused, currentTime/duration, los eventos timeupdate y ended, y la sustitución de los controles nativos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Video_and_audio_APIs",
      "etiqueta": "MDN"
    }
  ]
}
```
