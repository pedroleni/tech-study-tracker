# Resolución de módulos: rutas, node_modules y exports maps

- **Módulo:** El sistema de módulos
- **Slug:** `resolucion-de-modulos` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [Packages reference](https://nodejs.org/api/packages.html) — ver `contenido/nodejs/TEMARIO.md` #12

---

## Qué es y para qué sirve

Cuando un fichero escribe `import algo from 'paquete'`, alguien tiene que decidir a qué fichero real corresponde eso. Con una ruta relativa (`./algo.js`) es directo — con el nombre de un paquete (`'paquete'`, sin `./` delante), Node.js busca en `node_modules`, y el propio `package.json` de ese paquete puede controlar con precisión qué partes de sí mismo expone.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// package.json de un paquete de npm\n{\n  \"name\": \"mi-libreria\",\n  \"exports\": {\n    \".\": \"./index.js\",\n    \"./utilidades\": \"./src/utilidades.js\"\n  }\n}\n\n// Desde fuera:\nimport algo from 'mi-libreria'; // resuelve a ./index.js\nimport { util } from 'mi-libreria/utilidades'; // resuelve a ./src/utilidades.js\nimport interno from 'mi-libreria/src/interno.js'; // Error: no está en \"exports\"\n</script>",
  "anotaciones": [
    { "fragmento": "\"exports\": {\n    \".\": \"./index.js\",\n    \"./utilidades\": \"./src/utilidades.js\"\n  }", "nota": "El campo exports define EXACTAMENTE qué rutas de un paquete son públicas — cualquier fichero interno que no aparezca explícitamente aquí queda inaccesible desde fuera, aunque exista físicamente dentro del paquete." },
    { "fragmento": "import interno from 'mi-libreria/src/interno.js'; // Error: no está en \"exports\"", "nota": "Antes de que exports existiera, cualquier fichero de un paquete publicado en npm era técnicamente accesible desde fuera — exports permite a quien mantiene una librería garantizar de verdad qué es API pública y qué es un detalle interno que puede cambiar sin previo aviso." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Importar un fichero interno de un paquete que no está expuesto en su exports.", "texto": "Falla con un error de resolución, aunque el fichero exista de verdad dentro de node_modules — exports lo bloquea a propósito, no es un bug del paquete." },
    { "titulo": "Confundir una ruta relativa (./modulo) con el nombre de un paquete (modulo).", "texto": "Sin ./ delante, Node.js busca en node_modules, nunca en la carpeta actual — un typo aquí produce un error de \"módulo no encontrado\" que puede parecer que el paquete no está instalado cuando en realidad es un problema de la ruta." }
  ]
}
```

## Ejercicios

1. Explica la diferencia entre `import './utilidades.js'` e `import 'utilidades'` en cuanto a dónde busca Node.js cada uno.
2. ¿Qué problema real resuelve el campo `exports` de un `package.json` que no existía antes de que se introdujera?
3. Diseña un `exports` map para un paquete que expone su punto de entrada principal y una subruta `/cliente`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Packages reference",
      "descripcion": "Referencia oficial sobre resolución de módulos y exports maps.",
      "url": "https://nodejs.org/api/packages.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
