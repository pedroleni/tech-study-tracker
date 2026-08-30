# Anatomía de una petición/respuesta HTTP en Node

- **Módulo:** Construir un servidor HTTP desde cero
- **Slug:** `anatomia-http` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) — ver `contenido/nodejs/TEMARIO.md` #35

---

## Qué es y para qué sirve

Antes de escribir un servidor, conviene ver con claridad las dos piezas con las que se trabaja constantemente: el objeto de PETICIÓN (lo que envía quien hace la llamada — método, URL, cabeceras, cuerpo) y el objeto de RESPUESTA (lo que el servidor construye y devuelve). Todo framework web (Express incluido) está, por debajo, construido sobre estos dos objetos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Petición y respuesta, cada una con su propia información",
  "roles": [
    { "etiqueta": "req (IncomingMessage)", "rol": "Lo que llega, de solo lectura", "descripcion": "req.method ('GET', 'POST'...), req.url (la ruta pedida), req.headers (cabeceras como content-type o authorization), y el propio cuerpo, como un stream Readable." },
    { "etiqueta": "res (ServerResponse)", "rol": "Lo que se construye y se envía", "descripcion": "res.statusCode, res.setHeader(), res.write()/res.end() — un stream Writable que, cuando se cierra con .end(), envía la respuesta completa de vuelta." }
  ]
}
```

## El cuerpo de la petición es un stream, no un valor ya disponible

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "req no tiene ya un req.body listo para usar, como sí tiene Express",
  "contenido": "Con el módulo http puro, el cuerpo de una petición (los datos que envía un POST, por ejemplo) llega como un stream Readable — hay que escuchar sus eventos 'data' y 'end' para reunirlo, exactamente como con cualquier otro stream de lectura (Módulo 9). req.body ya construido es una comodidad que añaden frameworks como Express, no algo que dé Node.js por sí solo."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que req.body exista directamente con el módulo http puro.", "texto": "Hay que reunir el cuerpo manualmente desde el stream de la petición — la lección 38 muestra cómo hacerlo." },
    { "titulo": "Olvidar llamar a res.end().", "texto": "Sin ella, la respuesta nunca se envía por completo — la conexión queda abierta y quien hizo la petición se queda esperando indefinidamente." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras qué información contiene el objeto `req` y qué contiene el objeto `res`.
2. ¿Por qué el cuerpo de una petición no está disponible directamente como `req.body` con el módulo `http` puro?
3. ¿Qué pasa si un servidor nunca llama a `res.end()`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Anatomy of an HTTP Transaction",
      "descripcion": "Guía oficial sobre petición y respuesta HTTP en Node.js.",
      "url": "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction",
      "etiqueta": "Node.js"
    }
  ]
}
```
