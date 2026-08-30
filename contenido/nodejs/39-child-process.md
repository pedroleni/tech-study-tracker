# child_process: ejecutar otros programas

- **Módulo:** Concurrencia real
- **Slug:** `child-process` (autogenerado del título)
- **Orden:** 390
- **Fuentes:** [Child process](https://nodejs.org/api/child_process.html) + [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) — ver `contenido/nodejs/TEMARIO.md` #39

---

## Qué es y para qué sirve

`child_process` permite que un programa de Node.js ejecute OTROS programas del sistema operativo — un comando de shell, un script en otro lenguaje, cualquier ejecutable — y comunicarse con él a través de su entrada/salida estándar. Es la base de herramientas como `npm` ejecutando scripts, o cualquier CLI que a su vez invoca otras herramientas.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { exec } from 'node:child_process';\n\nexec('ls -la', (error, stdout, stderr) => {\n  if (error) {\n    console.error('Error:', error.message);\n    return;\n  }\n  console.log('Salida:', stdout);\n});\n</script>",
  "anotaciones": [
    { "fragmento": "exec('ls -la', (error, stdout, stderr) => {", "nota": "exec() ejecuta el comando A TRAVÉS de una shell (bash o similar), permitiendo pipes y comodines como en la terminal — pero por eso mismo, concatenar entrada del usuario directamente en el string del comando es un riesgo real de inyección de comandos." }
  ]
}
```

## spawn(): la alternativa para procesos de larga duración o mucha salida

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "exec() frente a spawn()",
  "contenido": "exec() acumula TODA la salida en memoria antes de llamar al callback — con un proceso que produce mucha salida (o que corre indefinidamente, como un servidor), esto es un problema real. spawn() da acceso a la salida como STREAMS (stdout, stderr), procesándola trozo a trozo según va llegando, sin acumular todo en memoria de golpe."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Construir el comando de exec() concatenando entrada de un usuario directamente.", "texto": "exec(`ls ${carpetaDelUsuario}`) es una inyección de comandos real si carpetaDelUsuario contiene algo como '; rm -rf /' — nunca concatenar entrada externa sin validar en un comando ejecutado con exec()." },
    { "titulo": "Usar exec() para un proceso que produce mucha salida o corre indefinidamente.", "texto": "exec() acumula todo en memoria antes de dar el resultado — spawn() con sus streams es la herramienta correcta para esos casos." }
  ]
}
```

## Ejercicios

1. Ejecuta un comando del sistema (por ejemplo, `node --version`) con `exec()` y muestra su salida.
2. Explica por qué construir un comando de `exec()` con entrada de usuario sin validar es peligroso.
3. ¿Cuándo tiene más sentido `spawn()` que `exec()`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Child process",
      "descripcion": "Referencia oficial del módulo child_process.",
      "url": "https://nodejs.org/api/child_process.html",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Comparing Node.js concurrency models",
      "descripcion": "Comparación oficial de los distintos modelos de concurrencia de Node.js.",
      "url": "https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models",
      "etiqueta": "Node.js"
    }
  ]
}
```
