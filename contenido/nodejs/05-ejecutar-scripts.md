# Ejecutar scripts desde la línea de comandos

- **Módulo:** Primeros pasos
- **Slug:** `ejecutar-scripts` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Run Node.js scripts from the command line](https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line) — ver `contenido/nodejs/TEMARIO.md` #5

---

## Qué es y para qué sirve

`node archivo.js` ejecuta un fichero JavaScript de principio a fin, igual que pulsar "ejecutar" en un editor — sin necesitar ningún servidor ni navegador de por medio. Es la forma más básica y directa de correr código con Node.js, y la base de todo lo demás: un servidor, un test, una herramienta de línea de comandos, todos empiezan igual.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// saludo.js\nconsole.log('Hola desde Node.js');\nconsole.log('Argumentos recibidos:', process.argv.slice(2));\n</script>",
  "anotaciones": [
    { "fragmento": "console.log('Hola desde Node.js');", "nota": "Ejecutar node saludo.js corre este fichero de arriba a abajo, como cualquier script — sin bucle de eventos escuchando peticiones, sin servidor: termina en cuanto acaba el código." },
    { "fragmento": "process.argv.slice(2)", "nota": "process.argv es un array con la ruta del ejecutable de node, la ruta del script, y luego los argumentos reales — .slice(2) se queda solo con estos últimos. Se ve en detalle en la lección 7." }
  ]
}
```

## Hacer un script ejecutable directamente (shebang)

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "#!/usr/bin/env node",
  "contenido": "Añadir #!/usr/bin/env node como primera línea de un fichero, y darle permisos de ejecución (chmod +x archivo.js), permite ejecutarlo directamente con ./archivo.js, sin escribir node delante — así es como funcionan por dentro herramientas de línea de comandos instaladas con npm."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir node archivo.js (ejecutar) con npm run archivo (ejecutar un script definido en package.json).", "texto": "node ejecuta un fichero directamente; npm run ejecuta un script con nombre definido dentro de \"scripts\" en package.json, que a su vez normalmente llama a node por debajo." },
    { "titulo": "Olvidar la extensión .js (o .mjs/.cjs cuando el proyecto la necesita) al ejecutar.", "texto": "node archivo (sin extensión) puede fallar si Node.js no encuentra el fichero exacto — a diferencia de require() dentro de código, node en la línea de comandos no siempre completa la extensión por ti." }
  ]
}
```

## Ejercicios

1. Crea un fichero `hola.js` que imprima tu nombre, y ejecútalo con `node hola.js`.
2. Modifica ese fichero para que imprima los argumentos que le pases: `node hola.js Ada Grace`.
3. Explica qué hace la línea `#!/usr/bin/env node` al principio de un script.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Run Node.js scripts from the command line",
      "descripcion": "Guía oficial sobre ejecutar scripts de Node.js.",
      "url": "https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line",
      "etiqueta": "Node.js"
    }
  ]
}
```
