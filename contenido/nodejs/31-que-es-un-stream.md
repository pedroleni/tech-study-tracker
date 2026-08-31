# Qué es un stream y los cuatro tipos

- **Módulo:** Streams
- **Slug:** `que-es-un-stream` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) — ver `contenido/nodejs/TEMARIO.md` #31

---

## Qué es y para qué sirve

Un stream procesa datos por TROZOS, a medida que van llegando o saliendo — en vez de esperar a tener el archivo entero en memoria (como hace `readFile`) antes de hacer nada con él. Es la diferencia entre "carga los 10 GB completos y luego procésalos" y "procesa cada trozo según va llegando, sin necesitar nunca los 10 GB en memoria a la vez".

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nimport { readFile } from 'node:fs/promises';\n\n// Carga el archivo ENTERO en memoria antes de hacer nada\nconst contenido = await readFile('archivo-de-10gb.csv', 'utf8');\nprocesar(contenido);\n// Con un archivo lo bastante grande, esto agota la memoria disponible\n</script>",
  "despues": "<script>\nimport { createReadStream } from 'node:fs';\n\n// Procesa el archivo POR TROZOS, sin cargarlo entero nunca\nconst flujo = createReadStream('archivo-de-10gb.csv', { encoding: 'utf8' });\nflujo.on('data', (trozo) => {\n  procesar(trozo); // cada trozo es pequeño, nunca todo el archivo a la vez\n});\nflujo.on('end', () => console.log('Terminado'));\n</script>",
  "nota": "readFile es simple y suficiente para archivos pequeños — pero con un archivo real de varios gigabytes, cargarlo entero en memoria puede agotarla directamente. Un stream procesa trozo a trozo, así que el uso de memoria se mantiene bajo y constante sin importar el tamaño real del archivo."
}
```

## Los cuatro tipos de stream

```laboratorio
{
  "tipo": "roles",
  "titulo": "Readable, Writable, Duplex, Transform",
  "roles": [
    { "etiqueta": "Readable", "rol": "Solo se puede leer de él", "descripcion": "createReadStream de un fichero, o el cuerpo de una petición HTTP entrante." },
    { "etiqueta": "Writable", "rol": "Solo se puede escribir en él", "descripcion": "createWriteStream a un fichero, o la respuesta de un servidor HTTP." },
    { "etiqueta": "Duplex", "rol": "Se puede leer Y escribir, de forma independiente", "descripcion": "Un socket de red, por ejemplo — lo que entra y lo que sale no tienen por qué estar relacionados." },
    { "etiqueta": "Transform", "rol": "Duplex donde la salida depende de la entrada", "descripcion": "Recibe datos, los transforma, y produce una salida distinta — comprimir o descomprimir datos es el ejemplo más claro." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar readFile para archivos potencialmente muy grandes.", "texto": "Con un archivo lo bastante grande, agota la memoria disponible del proceso — un stream es la herramienta correcta cuando el tamaño real del archivo es desconocido o puede ser grande." },
    { "titulo": "Confundir Duplex con Transform.", "texto": "Un Duplex puede recibir y enviar datos sin ninguna relación entre ambos; un Transform SIEMPRE produce su salida a partir de la entrada que recibió — son conceptualmente distintos, aunque técnicamente Transform es un caso especial de Duplex." }
  ]
}
```

## Ejercicios

1. Crea un stream de lectura de un fichero de texto y muestra su contenido trozo a trozo, en vez de todo de golpe.
2. Explica con tus palabras cuándo un stream es mejor idea que `readFile`.
3. Clasifica estos casos como Readable, Writable, Duplex o Transform: el cuerpo de una petición HTTP entrante, la respuesta de un servidor, un compresor gzip.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to use streams",
      "descripcion": "Guía oficial de streams en Node.js.",
      "url": "https://nodejs.org/en/learn/modules/how-to-use-streams",
      "etiqueta": "Node.js"
    }
  ]
}
```
