# process.nextTick()

- **Módulo:** El bucle de eventos en profundidad
- **Slug:** `process-nexttick` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [Understanding process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) — ver `contenido/nodejs/TEMARIO.md` #26

---

## Qué es y para qué sirve

`process.nextTick(callback)` programa un callback para ejecutarse INMEDIATAMENTE después de la operación síncrona actual, antes incluso de que el bucle de eventos continúe a su siguiente fase — más pronto que una promesa, y mucho más pronto que un `setTimeout`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\nconsole.log('1');\n\nprocess.nextTick(() => console.log('3: nextTick'));\n\nPromise.resolve().then(() => console.log('4: promesa'));\n\nconsole.log('2');\n</script>",
  "opciones": [
    "1, 2, 3, 4 — nextTick se adelanta incluso a las promesas ya resueltas",
    "1, 2, 4, 3 — las promesas siempre van antes que nextTick",
    "1, 3, 2, 4 — nextTick interrumpe el código síncrono en cuanto se llama"
  ],
  "correcta": 0,
  "explicacion": "process.nextTick() tiene su propia cola, que Node.js vacía POR COMPLETO antes de procesar la cola de microtasks de las promesas — por eso 'nextTick' (3) se imprime antes que 'promesa' (4), aunque las dos sean formas de ejecutar algo \"lo antes posible\" tras el código síncrono."
}
```

## Un uso real: garantizar que un callback siempre es asíncrono

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction leerConfiguracion(callback) {\n  if (configuracionYaCargada) {\n    // Sin nextTick, esto llamaría al callback DE FORMA SÍNCRONA aquí,\n    // pero de forma ASÍNCRONA en el otro caso - inconsistente\n    process.nextTick(() => callback(configuracionCacheada));\n  } else {\n    cargarDesdeDisco((datos) => callback(datos)); // esto sí es async de por sí\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "process.nextTick(() => callback(configuracionCacheada));", "nota": "Un error real y sutil: si una función a veces llama a su callback de forma síncrona y a veces asíncrona (según una condición), quien la usa no puede confiar en el orden de ejecución. Envolver el caso síncrono en nextTick lo hace SIEMPRE asíncrono, de forma consistente con el otro caso." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Encadenar demasiados process.nextTick() de forma recursiva.", "texto": "Como se procesan TODOS antes de seguir con cualquier otra cosa (incluida E/S real), un uso recursivo sin límite puede \"morir de hambre\" al resto del bucle de eventos — nunca llega a atender ninguna otra petición." },
    { "titulo": "Confundir process.nextTick() con setImmediate().", "texto": "Suenan parecido pero se ejecutan en momentos distintos del ciclo — la lección siguiente compara los dos directamente." }
  ]
}
```

## Ejercicios

1. Predice el orden de ejecución de un código con `console.log`, `process.nextTick` y una promesa resuelta, y compruébalo.
2. Explica con tus palabras el problema real que resuelve envolver un callback síncrono en `process.nextTick`.
3. ¿Qué podría pasar si se usa `process.nextTick()` de forma recursiva sin ninguna condición de parada?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Understanding process.nextTick()",
      "descripcion": "Guía oficial de process.nextTick() y su orden real de ejecución.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick",
      "etiqueta": "Node.js"
    }
  ]
}
```
