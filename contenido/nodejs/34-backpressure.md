# Backpressure: por qué existe y qué pasa si se ignora

- **Módulo:** Streams
- **Slug:** `backpressure` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — ver `contenido/nodejs/TEMARIO.md` #34

---

## Qué es y para qué sirve

Backpressure es lo que pasa cuando un stream de lectura produce datos MÁS RÁPIDO de lo que el de escritura puede consumirlos — sin ningún mecanismo de control, esos datos se acumularían en memoria sin límite, exactamente el problema que un stream existe para evitar en primer lugar.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El valor de retorno de .write() no es solo un booleano cualquiera",
  "contenido": "escritor.write(datos) devuelve false cuando el búfer interno del stream de escritura está lleno — es una señal real de \"para de escribir por ahora\". Ignorar ese false y seguir llamando a .write() sin parar es exactamente cómo se acumulan datos en memoria sin control, aunque se esté usando streams."
}
```

## Por qué pipeline()/pipe() resuelven esto automáticamente

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { pipeline } from 'node:stream/promises';\n\n// pipeline() gestiona el backpressure automáticamente:\n// si el destino no puede más, PAUSA el origen hasta que sí pueda\nawait pipeline(streamOrigen, streamDestino);\n\n// Hacerlo a mano requiere respetar el false de .write() explícitamente:\nfunction copiarAMano(origen, destino) {\n  origen.on('data', (trozo) => {\n    const puedeSeguir = destino.write(trozo);\n    if (!puedeSeguir) {\n      origen.pause(); // frena la lectura hasta que el destino avise\n      destino.once('drain', () => origen.resume());\n    }\n  });\n}\n</script>",
  "anotaciones": [
    { "fragmento": "await pipeline(streamOrigen, streamDestino);", "nota": "Esta es la razón real, más allá de la limpieza de errores (lección 33), por la que pipeline()/pipe() son casi siempre preferibles a conectar streams a mano: gestionan el backpressure sin que haya que pensar en ello." },
    { "fragmento": "destino.once('drain', () => origen.resume());", "nota": "'drain' es el evento que un stream de escritura emite cuando vuelve a tener espacio libre — es la señal para reanudar la lectura, si se está gestionando el backpressure manualmente." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Ignorar el valor de retorno de .write() al conectar streams manualmente.", "texto": "Seguir escribiendo sin comprobarlo puede acumular datos en el búfer interno sin límite — el mismo problema de memoria que un stream existe para evitar." },
    { "titulo": "Pensar que backpressure es un problema exclusivo de streams de red.", "texto": "Ocurre en cualquier pareja de streams donde la lectura es más rápida que la escritura — un fichero local leído muy rápido y escrito a un disco más lento tiene exactamente el mismo problema." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras qué es backpressure y por qué es un problema real, no solo teórico.
2. ¿Qué significa que `.write()` devuelva `false`, y qué debería hacer el código en ese caso si se gestiona el backpressure a mano?
3. ¿Por qué usar `pipeline()`/`pipe()` evita tener que pensar en backpressure de forma explícita?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Backpressuring in Streams",
      "descripcion": "Guía oficial y detallada sobre backpressure en streams de Node.js.",
      "url": "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
      "etiqueta": "Node.js"
    }
  ]
}
```
