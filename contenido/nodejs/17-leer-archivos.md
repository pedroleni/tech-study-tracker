# Leer archivos: síncrono, con callback y con promesas

- **Módulo:** El sistema de ficheros (fs)
- **Slug:** `leer-archivos` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [Reading files with Node.js](https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs) — ver `contenido/nodejs/TEMARIO.md` #17

---

## Qué es y para qué sirve

El módulo `fs` ("file system") da acceso al sistema de ficheros real del ordenador — algo que, como ya vimos, un navegador nunca permitiría por seguridad. Node.js ofrece TRES formas de leer un fichero: síncrona (bloquea todo lo demás hasta terminar), con callback (clásica, asíncrona), y con promesas (moderna, asíncrona, compatible con `async`/`await`).

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nimport { readFileSync } from 'node:fs';\n\n// Síncrono: bloquea todo el proceso hasta que termina de leer\nconst contenido = readFileSync('datos.txt', 'utf8');\nconsole.log(contenido);\nconsole.log('Esto se imprime DESPUÉS, nunca antes');\n</script>",
  "despues": "<script>\nimport { readFile } from 'node:fs/promises';\n\n// Con promesas: no bloquea, se puede usar con await\nconst contenido = await readFile('datos.txt', 'utf8');\nconsole.log(contenido);\n</script>",
  "nota": "readFileSync bloquea el hilo único de JavaScript de Node.js mientras lee — nada más se ejecuta hasta que termina, ni siquiera atender otra petición si esto corriera dentro de un servidor. readFile (de node:fs/promises) es asíncrono: Node.js puede seguir haciendo otras cosas mientras el sistema operativo lee el fichero por detrás, y el código continúa cuando la promesa se resuelve."
}
```

## Cuándo sí tiene sentido la versión síncrona

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "No siempre es un error usar *Sync",
  "contenido": "Al arrancar un programa (leer un fichero de configuración antes de hacer nada más, por ejemplo) bloquear brevemente no tiene ningún coste real — el programa no puede continuar sin ese archivo de todas formas. El problema real de las versiones síncronas aparece dentro de un servidor que atiende peticiones: ahí sí bloquean a TODOS los usuarios conectados mientras leen, no solo a quien hizo esa petición concreta."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar readFileSync dentro del manejador de una petición HTTP.", "texto": "Bloquea el servidor entero mientras lee, dejando a TODOS los demás usuarios conectados esperando — en un servidor real, la versión con promesas o callback es casi siempre la correcta." },
    { "titulo": "Olvidar el encoding ('utf8') al leer un fichero de texto.", "texto": "Sin especificarlo, readFile/readFileSync devuelven un Buffer (datos binarios crudos), no un string legible — hace falta convertirlo aparte, o pasar 'utf8' como segundo argumento desde el principio." }
  ]
}
```

## Ejercicios

1. Crea un fichero de texto y léelo con `readFileSync`, imprimiendo su contenido.
2. Reescribe ese mismo ejercicio usando `readFile` de `node:fs/promises` con `await`.
3. Explica con tus palabras por qué `readFileSync` dentro de un servidor real es normalmente un error.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Reading files with Node.js",
      "descripcion": "Guía oficial sobre las tres formas de leer ficheros en Node.js.",
      "url": "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
