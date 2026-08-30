# pipe() y pipeline()

- **Módulo:** Streams
- **Slug:** `pipe-y-pipeline` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) + [Stream](https://nodejs.org/api/stream.html) — ver `contenido/nodejs/TEMARIO.md` #33

---

## Qué es y para qué sirve

Conectar manualmente los eventos `data`/`end`/`error` de un stream de lectura con uno de escritura (como en la lección anterior) es exactamente el patrón que `.pipe()` automatiza — y `pipeline()` añade, sobre `.pipe()`, un manejo de errores correcto que evita un problema real y fácil de tener sin darse cuenta.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nimport { createReadStream, createWriteStream } from 'node:fs';\n\nconst lector = createReadStream('entrada.txt');\nconst escritor = createWriteStream('salida.txt');\n\nlector.pipe(escritor);\n// Si lector falla, escritor puede quedarse abierto para siempre -\n// pipe() por sí solo no limpia el otro extremo automáticamente\n</script>",
  "despues": "<script>\nimport { createReadStream, createWriteStream } from 'node:fs';\nimport { pipeline } from 'node:stream/promises';\n\nconst lector = createReadStream('entrada.txt');\nconst escritor = createWriteStream('salida.txt');\n\ntry {\n  await pipeline(lector, escritor);\n  console.log('Copia completada');\n} catch (error) {\n  console.error('Falló la copia:', error.message);\n  // pipeline() ya se encargó de cerrar ambos streams correctamente\n}\n</script>",
  "nota": "pipe() conecta la salida de un stream con la entrada de otro en una sola línea — pero si el stream de origen falla a mitad de camino, el de destino puede quedarse abierto (una fuga de recursos real). pipeline() hace lo mismo que pipe(), pero además garantiza que TODOS los streams implicados se cierran correctamente pase lo que pase, y da una única promesa que se puede esperar con await."
}
```

## Encadenar varios pasos: comprimir mientras se copia

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createReadStream, createWriteStream } from 'node:fs';\nimport { createGzip } from 'node:zlib';\nimport { pipeline } from 'node:stream/promises';\n\nawait pipeline(\n  createReadStream('datos.csv'),\n  createGzip(), // stream Transform: comprime cada trozo según pasa\n  createWriteStream('datos.csv.gz'),\n);\n</script>",
  "anotaciones": [
    { "fragmento": "createGzip(), // stream Transform: comprime cada trozo según pasa", "nota": "pipeline() puede encadenar más de dos streams — cada uno recibe la salida del anterior. Aquí, cada trozo se lee, se comprime, y se escribe, sin que el archivo completo (ni comprimido ni sin comprimir) pase nunca entero por memoria." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar pipe() en código nuevo en vez de pipeline().", "texto": "pipe() no limpia automáticamente el resto de streams si uno de ellos falla — pipeline() sí, y además da una promesa que se puede esperar con await y capturar con try/catch." },
    { "titulo": "Olvidar que pipeline() se importa de node:stream/promises, no de node:stream a secas.", "texto": "La versión de node:stream (sin /promises) usa un callback tradicional en vez de devolver una promesa." }
  ]
}
```

## Ejercicios

1. Copia un fichero de uno a otro usando `pipeline()` en vez de `pipe()`.
2. Encadena tres streams con `pipeline()`: lectura, un `Transform` (por ejemplo, `createGzip`), y escritura.
3. Explica el problema real que resuelve `pipeline()` frente a `pipe()` cuando uno de los streams falla a mitad de camino.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to use streams",
      "descripcion": "Guía oficial sobre pipe() y pipeline().",
      "url": "https://nodejs.org/en/learn/modules/how-to-use-streams",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Stream",
      "descripcion": "Referencia oficial completa del módulo stream.",
      "url": "https://nodejs.org/api/stream.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
