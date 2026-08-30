# Enrutamiento manual, sin ningún framework

- **Módulo:** Construir un servidor HTTP desde cero
- **Slug:** `enrutamiento-manual` (autogenerado del título)
- **Orden:** 370
- **Fuentes:** [HTTP](https://nodejs.org/api/http.html) — ver `contenido/nodejs/TEMARIO.md` #37

---

## Qué es y para qué sirve

Un router es, en su forma más básica, una serie de comprobaciones sobre `req.method` y `req.url` que deciden qué código ejecutar para cada combinación — exactamente lo que Express (o cualquier otro framework de rutas) hace por debajo, con mucha más comodidad añadida encima.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createServer } from 'node:http';\n\nconst servidor = createServer((req, res) => {\n  if (req.method === 'GET' && req.url === '/') {\n    res.end('Página de inicio');\n  } else if (req.method === 'GET' && req.url === '/tareas') {\n    res.end('Lista de tareas');\n  } else if (req.method === 'POST' && req.url === '/tareas') {\n    res.statusCode = 201;\n    res.end('Tarea creada');\n  } else {\n    res.statusCode = 404;\n    res.end('No encontrado');\n  }\n});\n\nservidor.listen(3000);\n</script>",
  "anotaciones": [
    { "fragmento": "if (req.method === 'GET' && req.url === '/') {", "nota": "Una ruta real siempre combina MÉTODO y RUTA — GET /tareas y POST /tareas son dos rutas distintas, aunque compartan la misma URL, porque hacen cosas distintas." },
    { "fragmento": "} else {\n    res.statusCode = 404;\n    res.end('No encontrado');\n  }", "nota": "Un router necesita SIEMPRE un caso por defecto para lo que no coincide con ninguna ruta conocida — sin él, una petición a una URL no gestionada se queda sin ninguna respuesta." }
  ]
}
```

## Rutas con parámetros: un patrón manual real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst coincidenciaTarea = req.url.match(/^\\/tareas\\/(\\d+)$/);\nif (req.method === 'GET' && coincidenciaTarea) {\n  const id = coincidenciaTarea[1];\n  res.end(`Detalle de la tarea ${id}`);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const coincidenciaTarea = req.url.match(/^\\/tareas\\/(\\d+)$/);", "nota": "Sin un framework de rutas, extraer un parámetro de la URL (como el id de /tareas/42) es responsabilidad de código propio — una expresión regular con un grupo de captura es el patrón manual más directo." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Comprobar solo req.url sin comprobar también req.method.", "texto": "GET /tareas y POST /tareas son operaciones completamente distintas — comprobar solo la URL trataría ambas peticiones igual." },
    { "titulo": "Olvidar el caso por defecto (404) al final de la cadena de comprobaciones.", "texto": "Una petición que no coincide con ninguna ruta conocida se queda sin respuesta si no hay un caso final que la capture." }
  ]
}
```

## Ejercicios

1. Escribe un router manual con al menos tres rutas distintas (combinando método y URL).
2. Añade una ruta con un parámetro dinámico (como un id) usando una expresión regular.
3. Explica por qué comprobar solo `req.url` no es suficiente para distinguir todas las rutas reales de una API.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTTP",
      "descripcion": "Referencia oficial del módulo http, incluidos method y url de una petición.",
      "url": "https://nodejs.org/api/http.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
