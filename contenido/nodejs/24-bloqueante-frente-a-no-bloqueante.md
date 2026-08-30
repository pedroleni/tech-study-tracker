# Bloqueante frente a no bloqueante

- **Módulo:** El bucle de eventos en profundidad
- **Slug:** `bloqueante-frente-a-no-bloqueante` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [Overview of Blocking vs Non-Blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking) — ver `contenido/nodejs/TEMARIO.md` #24

---

## Qué es y para qué sirve

Node.js ejecuta JavaScript en un único hilo — mientras ese hilo está ocupado con algo, no puede hacer nada más, ni siquiera atender otra petición si esto corriera dentro de un servidor. Entender qué operaciones BLOQUEAN ese hilo (y cuáles no) es la base de por qué Node.js puede atender miles de conexiones a la vez sin usar miles de hilos.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nimport { readFileSync } from 'node:fs';\n\nconsole.log('Empieza');\nconst datos = readFileSync('archivo-grande.txt', 'utf8'); // BLOQUEA aquí\nconsole.log('Termina de leer');\nconsole.log('Esto no puede ejecutarse hasta que la lectura termine');\n</script>",
  "despues": "<script>\nimport { readFile } from 'node:fs/promises';\n\nconsole.log('Empieza');\nreadFile('archivo-grande.txt', 'utf8').then((datos) => {\n  console.log('Termina de leer');\n});\nconsole.log('Esto SÍ se ejecuta antes de que termine la lectura');\n</script>",
  "nota": "Con readFileSync, ninguna otra línea de código (ni de este script, ni de cualquier petición si esto corriera en un servidor) puede ejecutarse mientras el sistema operativo lee el fichero. Con readFile (no bloqueante), Node.js delega la lectura y sigue ejecutando el resto del programa mientras tanto — el callback/promesa se resuelve cuando el sistema operativo termina, sin haber detenido nada más entretanto."
}
```

## Por qué esto es la base de todo lo que viene después

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un solo hilo, miles de conexiones",
  "contenido": "Un servidor de Node.js puede atender miles de peticiones simultáneas con un único hilo de JavaScript, PORQUE la mayoría de operaciones reales (leer de una base de datos, hacer una petición de red, leer un fichero) son no bloqueantes — el hilo nunca se queda esperando de brazos cruzados, siempre está libre para atender la siguiente cosa mientras el sistema operativo hace el trabajo pesado por detrás."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar una versión síncrona (*Sync) de una operación de fs/red dentro de un servidor.", "texto": "Bloquea a TODOS los usuarios conectados durante esa operación, no solo a quien la pidió — en un servidor real, las versiones asíncronas son casi siempre la opción correcta." },
    { "titulo": "Pensar que \"asíncrono\" significa \"en otro hilo\".", "texto": "El JavaScript de Node.js sigue corriendo en un único hilo — lo que pasa \"en paralelo\" son operaciones del sistema operativo (leer disco, red), no código JavaScript ejecutándose a la vez en otro hilo." }
  ]
}
```

## Ejercicios

1. Escribe dos versiones del mismo script: una que lea un fichero con `readFileSync`, otra con `readFile` (promesas) — imprime un mensaje antes y después de la lectura en ambas y compara el orden real de ejecución.
2. Explica con tus palabras por qué una operación bloqueante en un servidor afecta a TODOS los usuarios conectados, no solo a uno.
3. ¿Es correcto decir que el código asíncrono de Node.js se ejecuta "en paralelo"? Explica por qué sí o por qué no.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Overview of Blocking vs Non-Blocking",
      "descripcion": "Guía oficial sobre operaciones bloqueantes y no bloqueantes.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking",
      "etiqueta": "Node.js"
    }
  ]
}
```
