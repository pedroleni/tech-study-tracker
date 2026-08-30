# No bloquear el bucle de eventos: por qué importa de verdad

- **Módulo:** El bucle de eventos en profundidad
- **Slug:** `no-bloquear-el-bucle-de-eventos` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — ver `contenido/nodejs/TEMARIO.md` #28

---

## Qué es y para qué sirve

No es solo `readFileSync` lo que puede bloquear el hilo único de Node.js — cualquier cálculo puramente en JavaScript que tarde mucho (ordenar un array enorme, procesar una expresión regular compleja, un bucle largo) bloquea exactamente igual, sin que ninguna versión "asíncrona" lo arregle por sí sola.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nfunction calcularAlgoLento(n) {\n  let resultado = 0;\n  for (let i = 0; i < n; i++) {\n    resultado += Math.sqrt(i); // un bucle síncrono largo, puro cálculo\n  }\n  return resultado;\n}\n\n// Dentro de un servidor: esto bloquea a TODOS los usuarios conectados\n// mientras se ejecuta, sin importar que la función no use fs ni red\ncalcularAlgoLento(1_000_000_000);\n</script>",
  "despues": "<script>\nimport { Worker } from 'node:worker_threads';\n\n// El cálculo pesado corre en OTRO hilo real - el hilo principal\n// sigue libre para atender otras peticiones mientras tanto\nconst worker = new Worker('./calculo-pesado.js');\nworker.on('message', (resultado) => console.log(resultado));\n</script>",
  "nota": "No hay ninguna versión \"asíncrona\" de un bucle puro de JavaScript — async/await solo ayuda con operaciones de E/S (red, disco), no con cálculo puro que ya está corriendo en el único hilo de JS. La única forma real de no bloquear con cálculo pesado es moverlo a otro hilo (worker_threads, Módulo 11) o a otro proceso."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que envolver un cálculo pesado en una función async lo hace no bloqueante.", "texto": "async solo cambia CÓMO se espera un resultado (con await, sin bloquear mientras se espera una operación de E/S real) — no mueve el cálculo a otro hilo. Un bucle largo dentro de una función async sigue bloqueando igual mientras se ejecuta." },
    { "titulo": "No darse cuenta de que un JSON.parse/stringify muy grande también bloquea.", "texto": "Son operaciones puramente síncronas de JavaScript — con datos lo bastante grandes, pueden bloquear de forma perceptible, igual que cualquier otro cálculo largo." }
  ]
}
```

## Ejercicios

1. Explica por qué `async function` no convierte automáticamente en no bloqueante un bucle largo de puro cálculo.
2. Da dos ejemplos de operaciones que SÍ son puramente síncronas y pueden bloquear, aunque no sean `fs` ni `http`.
3. ¿Cuál es la única forma real de evitar que un cálculo pesado bloquee el hilo principal de Node.js?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Don't Block the Event Loop",
      "descripcion": "Guía oficial sobre qué bloquea de verdad el bucle de eventos y cómo evitarlo.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
      "etiqueta": "Node.js"
    }
  ]
}
```
