# Leer el cuerpo de una petición y responder JSON

- **Módulo:** Construir un servidor HTTP desde cero
- **Slug:** `leer-el-cuerpo-y-responder-json` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [HTTP](https://nodejs.org/api/http.html) — ver `contenido/nodejs/TEMARIO.md` #38

---

## Qué es y para qué sirve

La lección 35 ya adelantó que el cuerpo de una petición llega como un stream, no como un valor ya listo. Esta lección cierra el círculo: cómo reunir ese stream en un dato usable de verdad, y cómo responder JSON — el formato casi universal de cualquier API real — con las cabeceras correctas.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createServer } from 'node:http';\n\nfunction leerCuerpo(req) {\n  return new Promise((resolve, reject) => {\n    let datos = '';\n    req.on('data', (trozo) => { datos += trozo; });\n    req.on('end', () => resolve(datos));\n    req.on('error', reject);\n  });\n}\n\nconst servidor = createServer(async (req, res) => {\n  if (req.method === 'POST' && req.url === '/tareas') {\n    const cuerpoCrudo = await leerCuerpo(req);\n    const tarea = JSON.parse(cuerpoCrudo);\n\n    res.setHeader('Content-Type', 'application/json');\n    res.statusCode = 201;\n    res.end(JSON.stringify({ id: 1, titulo: tarea.titulo }));\n  }\n});\n</script>",
  "anotaciones": [
    { "fragmento": "req.on('data', (trozo) => { datos += trozo; });", "nota": "El cuerpo llega en trozos, posiblemente varios — hay que ir acumulándolos hasta que el evento 'end' confirme que ya no queda nada más." },
    { "fragmento": "const tarea = JSON.parse(cuerpoCrudo);", "nota": "Node.js no valida ni parsea JSON automáticamente — el texto crudo recibido hay que interpretarlo explícitamente, y esto puede lanzar una excepción real si el cliente envía JSON inválido (sin capturarlo aquí a propósito, para mantener el ejemplo corto)." },
    { "fragmento": "res.setHeader('Content-Type', 'application/json');", "nota": "Sin esta cabecera, quien recibe la respuesta no tiene forma fiable de saber que el cuerpo es JSON y no texto plano — un detalle fácil de olvidar que rompe clientes que sí la comprueban." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Llamar a JSON.parse() sobre el cuerpo sin capturar un posible error.", "texto": "Un cliente que envía JSON inválido hace que JSON.parse() lance una excepción real — sin un try/catch, esto puede tumbar el manejador de la petición de forma poco controlada." },
    { "titulo": "Olvidar Content-Type: application/json al responder JSON.", "texto": "El cuerpo de la respuesta puede ser JSON válido, pero sin la cabecera correcta, algunos clientes no lo interpretan como tal automáticamente." }
  ]
}
```

## Ejercicios

1. Escribe una función `leerCuerpo(req)` que reúna el cuerpo de una petición como texto.
2. Añade un `try`/`catch` alrededor de `JSON.parse()` en el ejemplo de esta lección, respondiendo un error 400 si el JSON es inválido.
3. Explica por qué hace falta establecer `Content-Type: application/json` explícitamente al responder JSON.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTTP",
      "descripcion": "Referencia oficial del módulo http, incluidos los eventos del cuerpo de una petición.",
      "url": "https://nodejs.org/api/http.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
