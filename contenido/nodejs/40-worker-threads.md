# worker_threads: paralelismo real de JavaScript

- **Módulo:** Concurrencia real
- **Slug:** `worker-threads` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) + [Worker threads](https://nodejs.org/api/worker_threads.html) — ver `contenido/nodejs/TEMARIO.md` #40

---

## Qué es y para qué sirve

La lección 28 dejó una pregunta abierta: si un cálculo pesado bloquea el único hilo de JavaScript, y `async`/`await` no lo arregla, ¿cuál es la solución real? `worker_threads` — hilos de verdad, cada uno con su propio motor V8 y su propio bucle de eventos, que pueden ejecutar JavaScript en PARALELO de verdad.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// principal.js\nimport { Worker } from 'node:worker_threads';\n\nconst worker = new Worker('./calculo-pesado.js');\n\nworker.on('message', (resultado) => {\n  console.log('Resultado:', resultado);\n});\n\nworker.postMessage(1_000_000_000); // envía datos al worker\n\n// calculo-pesado.js\nimport { parentPort } from 'node:worker_threads';\n\nparentPort.on('message', (n) => {\n  let resultado = 0;\n  for (let i = 0; i < n; i++) {\n    resultado += Math.sqrt(i); // este bucle NO bloquea el hilo principal\n  }\n  parentPort.postMessage(resultado);\n});\n</script>",
  "anotaciones": [
    { "fragmento": "const worker = new Worker('./calculo-pesado.js');", "nota": "Cada Worker corre en su PROPIO hilo del sistema operativo, con su propia instancia de V8 — el bucle largo dentro de calculo-pesado.js no comparte hilo con el código de principal.js, así que este último sigue libre para atender cualquier otra cosa mientras tanto." },
    { "fragmento": "worker.postMessage(1_000_000_000); // envía datos al worker", "nota": "La comunicación entre el hilo principal y un worker es por MENSAJES (postMessage/on('message')) — no se comparte memoria directamente por defecto, evitando toda la complejidad clásica de programación con hilos (condiciones de carrera sobre variables compartidas)." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar worker_threads para operaciones de E/S (fs, red).", "texto": "Esas ya son no bloqueantes por sí solas (Módulo 7) — worker_threads tiene sentido específicamente para CÁLCULO puro de JavaScript que sí bloquearía el hilo principal, no para E/S." },
    { "titulo": "Crear un Worker nuevo por cada petición de un servidor con mucho tráfico.", "texto": "Crear un hilo tiene un coste real — un patrón de \"pool\" de workers reutilizables es más apropiado que crear y destruir uno por cada petición individual." }
  ]
}
```

## Ejercicios

1. Crea un `Worker` que reciba un número por mensaje, calcule algo con él, y devuelva el resultado por mensaje.
2. Explica la diferencia real entre `child_process` (lección anterior) y `worker_threads`.
3. ¿Por qué `worker_threads` no tiene mucho sentido para operaciones de E/S como leer un fichero?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Comparing Node.js concurrency models",
      "descripcion": "Comparación oficial de los modelos de concurrencia de Node.js.",
      "url": "https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Worker threads",
      "descripcion": "Referencia oficial completa del módulo worker_threads.",
      "url": "https://nodejs.org/api/worker_threads.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
