# Trabajar con carpetas

- **Módulo:** El sistema de ficheros (fs)
- **Slug:** `trabajar-con-carpetas` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [Working with folders in Node.js](https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs) — ver `contenido/nodejs/TEMARIO.md` #20

---

## Qué es y para qué sirve

Además de leer y escribir ficheros individuales, `fs` permite crear, listar y borrar carpetas — necesario para cualquier programa que organice datos en varios ficheros (una carpeta de informes generados, una caché en disco, un proyecto que se estructura a sí mismo).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { mkdir, readdir, rm } from 'node:fs/promises';\n\nawait mkdir('informes/2026', { recursive: true });\n\nconst ficheros = await readdir('informes');\nconsole.log(ficheros); // ['2026']\n\nawait rm('informes', { recursive: true });\n</script>",
  "anotaciones": [
    { "fragmento": "await mkdir('informes/2026', { recursive: true });", "nota": "recursive: true crea también informes si todavía no existía, en el mismo paso — sin esa opción, mkdir falla si el directorio padre no existe ya." },
    { "fragmento": "const ficheros = await readdir('informes');", "nota": "readdir devuelve los nombres de lo que hay DENTRO de una carpeta — no distingue por sí solo entre ficheros y subcarpetas sin comprobarlo aparte con fs.stat (lección 21)." },
    { "fragmento": "await rm('informes', { recursive: true });", "nota": "recursive: true aquí es necesario para borrar una carpeta que tiene contenido dentro — sin ella, rm solo borra carpetas ya vacías." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Llamar a mkdir sin recursive en una ruta con carpetas intermedias que no existen.", "texto": "mkdir('a/b/c') falla si a o a/b no existen todavía — { recursive: true } las crea todas de una vez, sin necesitar comprobarlo a mano." },
    { "titulo": "Usar rm en una carpeta con contenido sin recursive.", "texto": "Falla con un error indicando que la carpeta no está vacía — es una protección deliberada contra borrar contenido por accidente." }
  ]
}
```

## Ejercicios

1. Crea una carpeta con subcarpetas anidadas en un solo paso, usando `{ recursive: true }`.
2. Lista el contenido de una carpeta con `readdir`.
3. Explica qué protección da `rm` por defecto frente a borrar una carpeta con contenido, y cómo se desactiva a propósito.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Working with folders in Node.js",
      "descripcion": "Guía oficial sobre crear, listar y borrar carpetas.",
      "url": "https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
