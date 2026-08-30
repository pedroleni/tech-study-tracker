# Streams de lectura y escritura

- **Módulo:** Streams
- **Slug:** `streams-de-lectura-y-escritura` (autogenerado del título)
- **Orden:** 320
- **Fuentes:** [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) — ver `contenido/nodejs/TEMARIO.md` #32

---

## Qué es y para qué sirve

`createReadStream` y `createWriteStream` son las dos funciones más usadas de todo el módulo de streams — leer un fichero trozo a trozo, y escribir datos trozo a trozo respectivamente. Sus eventos (`data`, `end`, `error`, `finish`) son la forma real de saber qué está pasando durante la operación.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createReadStream, createWriteStream } from 'node:fs';\n\nconst lector = createReadStream('entrada.txt', { encoding: 'utf8' });\nconst escritor = createWriteStream('salida.txt');\n\nlector.on('data', (trozo) => {\n  escritor.write(trozo.toUpperCase());\n});\n\nlector.on('end', () => {\n  escritor.end();\n  console.log('Copia (en mayúsculas) completada');\n});\n\nlector.on('error', (error) => console.error('Error al leer:', error.message));\nescritor.on('error', (error) => console.error('Error al escribir:', error.message));\n</script>",
  "anotaciones": [
    { "fragmento": "escritor.write(trozo.toUpperCase());", "nota": ".write() en un stream de escritura añade datos al flujo de salida — se puede llamar varias veces, una por cada trozo que va llegando del stream de lectura." },
    { "fragmento": "lector.on('end', () => {\n  escritor.end();", "nota": "El evento 'end' del lector avisa de que ya no queda nada más que leer — es el momento correcto para llamar a .end() en el escritor, indicando que tampoco habrá más escrituras." },
    { "fragmento": "lector.on('error', (error) => console.error('Error al leer:', error.message));", "nota": "Los streams, al ser EventEmitters (Módulo 8), emiten 'error' en vez de lanzar una excepción normal — sin un manejador para 'error' en cada stream, un fallo real (el fichero no existe, permisos insuficientes) puede tumbar el proceso." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No manejar el evento 'error' en cada stream por separado.", "texto": "Un stream de lectura y uno de escritura son EventEmitters independientes — un manejador de error en uno no cubre errores del otro." },
    { "titulo": "Olvidar llamar a .end() en un stream de escritura.", "texto": "Sin ella, el stream de escritura puede quedarse sin cerrar correctamente, y el proceso no termina de liberar el recurso del todo." }
  ]
}
```

## Ejercicios

1. Copia el contenido de un fichero a otro usando `createReadStream` y `createWriteStream`, trozo a trozo.
2. Añade manejadores de `'error'` a ambos streams del ejercicio anterior.
3. Explica qué evento indica que un stream de lectura ha terminado, y qué acción debería desencadenar en el stream de escritura correspondiente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to use streams",
      "descripcion": "Guía oficial de streams de lectura y escritura.",
      "url": "https://nodejs.org/en/learn/modules/how-to-use-streams",
      "etiqueta": "Node.js"
    }
  ]
}
```
