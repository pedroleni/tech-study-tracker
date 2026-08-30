# Argumentos de línea de comandos y entrada estándar

- **Módulo:** Primeros pasos
- **Slug:** `argumentos-y-entrada-estandar` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [Accept input from the command line in Node.js](https://nodejs.org/en/learn/command-line/accept-input-from-the-command-line-in-nodejs) + [Output to the command line using Node.js](https://nodejs.org/en/learn/command-line/output-to-the-command-line-using-nodejs) — ver `contenido/nodejs/TEMARIO.md` #7

---

## Qué es y para qué sirve

Cualquier programa de línea de comandos necesita, como mínimo, dos formas de recibir información: argumentos al lanzarlo (`mi-cli --nombre Ada`) y entrada interactiva mientras corre (escribir una respuesta cuando el programa pregunta algo). Node.js da acceso a ambas con `process.argv` y el módulo `readline`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// node saludo.js Ada Grace\nconsole.log(process.argv);\n// [\n//   '/usr/local/bin/node',\n//   '/ruta/completa/a/saludo.js',\n//   'Ada',\n//   'Grace'\n// ]\n\nconst argumentosReales = process.argv.slice(2);\nconsole.log(argumentosReales); // ['Ada', 'Grace']\n</script>",
  "anotaciones": [
    { "fragmento": "// [\n//   '/usr/local/bin/node',\n//   '/ruta/completa/a/saludo.js',\n//   'Ada',\n//   'Grace'\n// ]", "nota": "Los dos primeros elementos SIEMPRE son la ruta del ejecutable de node y la ruta del script — nunca argumentos reales que haya pasado quien ejecuta el programa." },
    { "fragmento": "const argumentosReales = process.argv.slice(2);", "nota": ".slice(2) es el patrón estándar para quedarse solo con lo que de verdad escribió la persona que ejecutó el comando." }
  ]
}
```

## Leer una respuesta interactiva con readline

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport * as readline from 'node:readline/promises';\nimport { stdin, stdout } from 'node:process';\n\nconst rl = readline.createInterface({ input: stdin, output: stdout });\nconst nombre = await rl.question('¿Cómo te llamas? ');\nconsole.log(`Hola, ${nombre}`);\nrl.close();\n</script>",
  "anotaciones": [
    { "fragmento": "const rl = readline.createInterface({ input: stdin, output: stdout });", "nota": "readline conecta la entrada estándar (lo que se escribe en la terminal) con la salida estándar (lo que se imprime) para crear una interfaz de preguntas y respuestas." },
    { "fragmento": "const nombre = await rl.question('¿Cómo te llamas? ');", "nota": "La versión de readline/promises (en vez de la clásica basada en callbacks) permite usar await directamente, mucho más legible que anidar callbacks para cada pregunta." },
    { "fragmento": "rl.close();", "nota": "Cerrar la interfaz es necesario para que el proceso pueda terminar — sin cerrarla, el programa se queda esperando indefinidamente." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar .slice(2) y tratar process.argv[0] como si fuera el primer argumento real.", "texto": "Los dos primeros elementos son siempre la ruta de node y del script — el primer argumento real de quien ejecuta el programa es process.argv[2]." },
    { "titulo": "No cerrar la interfaz de readline al terminar.", "texto": "El proceso se queda vivo esperando más entrada, sin terminar nunca por su cuenta — rl.close() es necesario después de la última pregunta." }
  ]
}
```

## Ejercicios

1. Escribe un script que reciba dos números como argumentos (`node sumar.js 3 5`) y muestre su suma.
2. Escribe un script que pregunte el nombre por `readline` y salude con él.
3. Explica por qué `process.argv[0]` y `process.argv[1]` nunca son argumentos reales de la persona que ejecuta el script.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Accept input from the command line in Node.js",
      "descripcion": "Guía oficial sobre argumentos y entrada interactiva.",
      "url": "https://nodejs.org/en/learn/command-line/accept-input-from-the-command-line-in-nodejs",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Output to the command line using Node.js",
      "descripcion": "Guía oficial sobre las distintas formas de mostrar salida en la terminal.",
      "url": "https://nodejs.org/en/learn/command-line/output-to-the-command-line-using-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
