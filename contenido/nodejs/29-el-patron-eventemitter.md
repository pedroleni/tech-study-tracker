# El patrón EventEmitter

- **Módulo:** EventEmitter
- **Slug:** `el-patron-eventemitter` (autogenerado del título)
- **Orden:** 290
- **Fuentes:** [The Node.js Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) — ver `contenido/nodejs/TEMARIO.md` #29

---

## Qué es y para qué sirve

`EventEmitter` es la clase base que usa Node.js internamente para casi todo lo que emite eventos con el tiempo — un stream, un servidor HTTP, un proceso hijo, todos son (o usan por dentro) un `EventEmitter`. Aprender su API directamente explica cómo funcionan estas piezas más grandes por debajo, y da la herramienta para diseñar cosas propias con la misma forma.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { EventEmitter } from 'node:events';\n\nconst emisor = new EventEmitter();\n\nemisor.on('saludo', (nombre) => {\n  console.log(`Hola, ${nombre}`);\n});\n\nemisor.emit('saludo', 'Ada'); // dispara el evento, con el argumento que quiera\nemisor.emit('saludo', 'Grace'); // se puede emitir el mismo evento varias veces\n</script>",
  "anotaciones": [
    { "fragmento": "emisor.on('saludo', (nombre) => {", "nota": "on() registra un manejador para un evento con nombre — el mismo patrón exacto que ya se vio en el bus de eventos del temario de TypeScript, esta vez la implementación oficial de Node.js." },
    { "fragmento": "emisor.emit('saludo', 'Ada'); // dispara el evento, con el argumento que quiera", "nota": "emit() ejecuta, de forma SÍNCRONA, todos los manejadores registrados para ese evento — a diferencia de una promesa, emit() no espera a nada, simplemente llama a los manejadores uno tras otro." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que emit() sea asíncrono.", "texto": "Los manejadores se ejecutan de forma síncrona, en el mismo momento en que se llama a emit() — si un manejador hace algo asíncrono por dentro, eso sí lo será, pero la propia llamada a emit() no espera a nada." },
    { "titulo": "No manejar el evento especial 'error'.", "texto": "Si un EventEmitter emite 'error' y NADIE tiene un manejador registrado para ese evento concreto, Node.js lanza una excepción y puede tumbar el proceso entero — a diferencia de cualquier otro nombre de evento sin manejadores, que simplemente no hace nada." }
  ]
}
```

## Ejercicios

1. Crea un `EventEmitter`, regístrale un manejador para un evento con nombre propio, y dispáralo con `emit()`.
2. Registra dos manejadores distintos para el mismo evento y comprueba que ambos se ejecutan.
3. Explica qué pasa si un `EventEmitter` emite `'error'` sin que nadie tenga un manejador registrado para ese evento.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The Node.js Event Emitter",
      "descripcion": "Guía oficial del patrón EventEmitter.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter",
      "etiqueta": "Node.js"
    }
  ]
}
```
