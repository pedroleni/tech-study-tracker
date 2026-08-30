# Metadatos de archivo: fs.stat

- **Módulo:** El sistema de ficheros (fs)
- **Slug:** `metadatos-de-archivo-fs-stat` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [Node.js file stats](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats) — ver `contenido/nodejs/TEMARIO.md` #21

---

## Qué es y para qué sirve

`fs.stat` da información SOBRE un fichero o carpeta sin leer su contenido: su tamaño, cuándo se modificó por última vez, y si es un fichero o un directorio. Es la herramienta correcta para preguntas como "¿esto es una carpeta?" o "¿cuánto ocupa este fichero?", sin necesitar abrirlo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { stat } from 'node:fs/promises';\n\nconst info = await stat('datos.txt');\n\nconsole.log(info.size); // tamaño en bytes\nconsole.log(info.mtime); // fecha de última modificación\nconsole.log(info.isFile()); // true\nconsole.log(info.isDirectory()); // false\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(info.isFile()); // true", "nota": "isFile() e isDirectory() son MÉTODOS, no propiedades — un error de tipeo común es escribir info.isFile (sin paréntesis), que da la función en sí en vez de true/false." }
  ]
}
```

## Un caso real: distinguir ficheros de carpetas al listar contenido

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { readdir, stat } from 'node:fs/promises';\nimport path from 'node:path';\n\nconst nombres = await readdir('.');\nfor (const nombre of nombres) {\n  const info = await stat(nombre);\n  console.log(`${nombre}: ${info.isDirectory() ? 'carpeta' : 'fichero'}`);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const info = await stat(nombre);", "nota": "readdir por sí solo solo da NOMBRES — combinarlo con stat para cada uno es el patrón real para saber qué es cada cosa dentro de una carpeta." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir info.isFile en vez de info.isFile().", "texto": "isFile es un método — sin los paréntesis, se obtiene la función en sí (siempre \"truthy\"), no el resultado real de la comprobación." },
    { "titulo": "Llamar a stat sobre una ruta que no existe sin capturar el error.", "texto": "stat lanza una excepción real si la ruta no existe — hace falta un try/catch (o comprobar antes con fs.access) si existe la posibilidad de que el fichero no esté ahí." }
  ]
}
```

## Ejercicios

1. Usa `fs.stat` para obtener el tamaño en bytes de un fichero real de tu ordenador.
2. Escribe un script que liste el contenido de una carpeta indicando, para cada entrada, si es fichero o carpeta.
3. Explica por qué `info.isFile` (sin paréntesis) no da el resultado esperado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Node.js file stats",
      "descripcion": "Guía oficial sobre metadatos de fichero con fs.stat.",
      "url": "https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats",
      "etiqueta": "Node.js"
    }
  ]
}
```
