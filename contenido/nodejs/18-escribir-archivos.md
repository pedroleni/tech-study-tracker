# Escribir y añadir contenido a archivos

- **Módulo:** El sistema de ficheros (fs)
- **Slug:** `escribir-archivos` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [Writing files with Node.js](https://nodejs.org/en/learn/manipulating-files/writing-files-with-nodejs) — ver `contenido/nodejs/TEMARIO.md` #18

---

## Qué es y para qué sirve

`fs.writeFile` crea un fichero nuevo (o **reemplaza por completo** uno existente); `fs.appendFile` añade contenido al final de uno ya existente, sin borrar lo que ya había. Confundir los dos es un error real y fácil de cometer — sobre todo porque el síntoma (los datos anteriores han desaparecido) solo se nota después de haberlo hecho.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nimport { writeFile } from 'node:fs/promises';\n\n// Cada llamada REEMPLAZA el contenido anterior por completo\nawait writeFile('registro.txt', 'Primera línea\\n');\nawait writeFile('registro.txt', 'Segunda línea\\n');\n// registro.txt ahora solo contiene 'Segunda línea' - la primera se perdió\n</script>",
  "despues": "<script>\nimport { appendFile, writeFile } from 'node:fs/promises';\n\nawait writeFile('registro.txt', 'Primera línea\\n'); // crea el fichero\nawait appendFile('registro.txt', 'Segunda línea\\n'); // añade sin borrar\n// registro.txt contiene las dos líneas, en orden\n</script>",
  "nota": "writeFile es la herramienta correcta para \"este es el contenido completo del fichero\" (una configuración, un informe generado de una vez). appendFile es la correcta para \"añade esto a lo que ya hay\" — un registro de eventos que crece con el tiempo es el ejemplo más claro."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar writeFile pensando que añade contenido, como appendFile.", "texto": "writeFile reemplaza el fichero entero — si la intención es acumular contenido con el tiempo (un log, un histórico), appendFile es la función correcta." },
    { "titulo": "No comprobar si el directorio de destino existe antes de escribir un fichero dentro de él.", "texto": "writeFile('carpeta/archivo.txt', ...) falla si carpeta no existe todavía — hace falta crearla antes (fs.mkdir, con la opción recursive) o comprobar que ya existe." }
  ]
}
```

## Ejercicios

1. Escribe un script que cree un fichero con una línea de texto, y luego le añada una segunda línea sin borrar la primera.
2. Explica con un ejemplo real cuándo usarías `writeFile` y cuándo `appendFile`.
3. ¿Qué error da `writeFile` si el directorio de destino no existe, y cómo se soluciona?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Writing files with Node.js",
      "descripcion": "Guía oficial sobre escribir y añadir contenido a ficheros.",
      "url": "https://nodejs.org/en/learn/manipulating-files/writing-files-with-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
