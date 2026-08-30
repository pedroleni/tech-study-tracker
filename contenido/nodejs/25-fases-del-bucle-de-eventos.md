# Las fases del bucle de eventos

- **Módulo:** El bucle de eventos en profundidad
- **Slug:** `fases-del-bucle-de-eventos` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — ver `contenido/nodejs/TEMARIO.md` #25

---

## Qué es y para qué sirve

El bucle de eventos no es una idea vaga de "algo que gestiona lo asíncrono" — es un ciclo real con FASES concretas y ordenadas, que Node.js recorre una y otra vez mientras el proceso está vivo. Saber qué fase hace qué explica por qué un `setTimeout(fn, 0)` y una promesa resuelta no se ejecutan necesariamente en el orden en que se escribieron.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las fases principales, en el orden en que se recorren",
  "roles": [
    { "etiqueta": "timers", "rol": "Ejecuta callbacks de setTimeout/setInterval ya vencidos", "descripcion": "No garantiza el instante EXACTO — garantiza que no se ejecutan antes del tiempo indicado, pueden ejecutarse algo después." },
    { "etiqueta": "poll", "rol": "Recupera nuevos eventos de E/S y ejecuta sus callbacks", "descripcion": "Aquí se procesan la mayoría de callbacks de fs, red, y similares — es la fase donde el bucle pasa más tiempo en un servidor típico." },
    { "etiqueta": "check", "rol": "Ejecuta callbacks de setImmediate", "descripcion": "Se ejecuta justo después de poll, en cada vuelta del bucle — la lección 27 compara esto directamente con setTimeout." }
  ]
}
```

## Microtasks: antes de pasar a la siguiente fase, no después

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\nconsole.log('1: código síncrono');\n\nsetTimeout(() => console.log('4: setTimeout'), 0);\n\nPromise.resolve().then(() => console.log('3: promesa'));\n\nconsole.log('2: código síncrono');\n</script>",
  "opciones": [
    "1, 2, 3, 4 — la promesa se ejecuta antes que el setTimeout aunque los dos sean asíncronos",
    "1, 2, 4, 3 — el orden en el código es el orden de ejecución real",
    "1, 3, 2, 4 — las promesas se cuelan incluso antes del código síncrono siguiente"
  ],
  "correcta": 0,
  "explicacion": "El código síncrono siempre se ejecuta primero, en orden (1 y 2). Los callbacks de promesas (microtasks) se ejecutan DESPUÉS de que termine todo el código síncrono, pero ANTES de que el bucle de eventos pase a la siguiente fase (donde vive setTimeout) — por eso la promesa (3) se adelanta al setTimeout (4), aunque ambos se programaran de forma asíncrona."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que setTimeout(fn, 0) ejecuta fn inmediatamente.", "texto": "0 milisegundos es el MÍNIMO, no una garantía instantánea — sigue teniendo que esperar a que termine el código síncrono actual y, además, a que el bucle de eventos llegue a la fase de timers." },
    { "titulo": "Pensar que las promesas se ejecutan \"en paralelo\" con el resto del código.", "texto": "Los callbacks de promesas (microtasks) se ejecutan en el mismo hilo único, solo que en un momento concreto y predecible del ciclo — después del código síncrono actual, antes de la siguiente fase del bucle." }
  ]
}
```

## Ejercicios

1. Predice el orden de ejecución de un código con `console.log`, `setTimeout(fn, 0)` y una promesa ya resuelta, y compruébalo ejecutándolo de verdad.
2. Explica con tus palabras qué hace la fase `poll` del bucle de eventos.
3. ¿Por qué `setTimeout(fn, 0)` no garantiza que `fn` se ejecute exactamente "ahora mismo"?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The Node.js Event Loop",
      "descripcion": "Explicación oficial y detallada de las fases del bucle de eventos.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
      "etiqueta": "Node.js"
    }
  ]
}
```
