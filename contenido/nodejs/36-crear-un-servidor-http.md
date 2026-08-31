# Crear un servidor con el módulo http

- **Módulo:** Construir un servidor HTTP desde cero
- **Slug:** `crear-un-servidor-http` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) + [HTTP](https://nodejs.org/api/http.html) — ver `contenido/nodejs/TEMARIO.md` #36

---

## Qué es y para qué sirve

`http.createServer()` crea un servidor real y funcional con muy poco código — sin ningún framework de por medio. Entender esto (aunque en un proyecto real casi siempre se use Express o similar por encima) explica exactamente qué hace un framework por ti, en vez de que sea una caja negra.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createServer } from 'node:http';\n\nconst servidor = createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader('Content-Type', 'text/plain');\n  res.end('Hola desde Node.js');\n});\n\nservidor.listen(3000, () => {\n  console.log('Servidor escuchando en http://localhost:3000');\n});\n</script>",
  "anotaciones": [
    { "fragmento": "const servidor = createServer((req, res) => {", "nota": "Esta función se ejecuta UNA VEZ POR CADA petición entrante — no una sola vez al arrancar. Cada petición recibe su propio par req/res, independiente de las demás." },
    { "fragmento": "servidor.listen(3000, () => {", "nota": "listen() empieza a aceptar conexiones reales en ese puerto — el servidor sigue vivo indefinidamente después de esto, procesando peticiones a medida que llegan, hasta que el proceso se detiene." }
  ]
}
```

## Por qué esto es un EventEmitter, por dentro

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "http.Server extiende EventEmitter",
  "contenido": "El callback pasado a createServer() es, en realidad, un atajo para servidor.on('request', callback) — http.Server es un EventEmitter (Módulo 8) que emite 'request' por cada petición entrante, entre otros eventos como 'close' o 'error'. La misma pieza (EventEmitter) que ya se estudió por separado aparece aquí, dentro de una API que se usa todos los días."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que el callback de createServer() se ejecuta una vez al arrancar.", "texto": "Se ejecuta UNA VEZ POR PETICIÓN — cualquier variable declarada fuera de él es compartida entre peticiones, algo a tener muy en cuenta si se usa para guardar estado." },
    { "titulo": "Olvidar setHeader antes de empezar a escribir con res.write()/res.end().", "texto": "Las cabeceras HTTP tienen que enviarse ANTES que el cuerpo de la respuesta — una vez que se ha escrito contenido, ya no se pueden añadir ni cambiar cabeceras." }
  ]
}
```

## Ejercicios

1. Crea un servidor HTTP mínimo que responda "Hola mundo" a cualquier petición.
2. Explica por qué el callback de `createServer()` se ejecuta una vez por cada petición, y qué implica eso para cualquier variable declarada fuera de él.
3. ¿Qué evento emite `http.Server` por cada petición entrante, y qué relación tiene con `EventEmitter`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Anatomy of an HTTP Transaction",
      "descripcion": "Guía oficial de Node.js Learn sobre servidores HTTP.",
      "url": "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "HTTP",
      "descripcion": "Referencia oficial completa del módulo http.",
      "url": "https://nodejs.org/api/http.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
