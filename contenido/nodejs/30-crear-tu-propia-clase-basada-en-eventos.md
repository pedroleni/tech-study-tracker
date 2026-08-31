# Crear tu propia clase basada en eventos

- **Módulo:** EventEmitter
- **Slug:** `crear-tu-propia-clase-basada-en-eventos` (autogenerado del título)
- **Orden:** 300
- **Fuentes:** [The Node.js Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) + [Events](https://nodejs.org/api/events.html) — ver `contenido/nodejs/TEMARIO.md` #30

---

## Qué es y para qué sirve

En vez de crear un `EventEmitter` suelto, el patrón más común en código real es EXTENDER la clase — cualquier clase propia puede heredar de `EventEmitter` y así emitir sus propios eventos con nombre, con todo lo que ya vimos en la lección anterior integrado de forma natural.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { EventEmitter } from 'node:events';\n\nclass Descarga extends EventEmitter {\n  iniciar(tamanoTotal) {\n    let progreso = 0;\n    const intervalo = setInterval(() => {\n      progreso += 10;\n      this.emit('progreso', progreso);\n\n      if (progreso >= tamanoTotal) {\n        clearInterval(intervalo);\n        this.emit('completada');\n      }\n    }, 100);\n  }\n}\n\nconst descarga = new Descarga();\ndescarga.on('progreso', (p) => console.log(`${p}% completado`));\ndescarga.on('completada', () => console.log('¡Descarga terminada!'));\ndescarga.iniciar(100);\n</script>",
  "anotaciones": [
    { "fragmento": "class Descarga extends EventEmitter {", "nota": "Al extender EventEmitter, Descarga hereda on(), emit(), off() automáticamente — no hace falta crear un EventEmitter aparte ni delegar manualmente." },
    { "fragmento": "this.emit('progreso', progreso);", "nota": "Dentro de la propia clase, this.emit() dispara el evento — quien use una instancia de Descarga desde fuera solo necesita conocer los nombres de sus eventos ('progreso', 'completada'), no cómo funciona por dentro." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar llamar a super() en el constructor de una clase que extiende EventEmitter, si se define un constructor propio.", "texto": "Sin super(), EventEmitter nunca se inicializa correctamente, y on()/emit() fallan de formas confusas." },
    { "titulo": "Emitir eventos antes de que el código que los escucha haya tenido ocasión de registrar un manejador.", "texto": "on() tiene que ejecutarse ANTES del emit() correspondiente — un evento emitido sin ningún manejador todavía registrado para él simplemente no llega a nadie, no se guarda para más tarde." }
  ]
}
```

## Ejercicios

1. Crea una clase que extienda `EventEmitter` y emita un evento propio cuando ocurra algo (por ejemplo, una clase `Cronometro` que emita `'segundo'` cada segundo).
2. Explica por qué hay que registrar los manejadores con `on()` antes de que se emita el evento correspondiente.
3. ¿Qué pasa si se olvida `super()` en el constructor de una clase que extiende `EventEmitter` con un constructor propio?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The Node.js Event Emitter",
      "descripcion": "Guía oficial del patrón EventEmitter aplicado a clases propias.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Events",
      "descripcion": "Referencia oficial completa de la clase EventEmitter.",
      "url": "https://nodejs.org/api/events.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
