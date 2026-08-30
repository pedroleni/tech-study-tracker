# Scripts de npm

- **Módulo:** npm en profundidad
- **Slug:** `scripts-de-npm` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) — ver `contenido/nodejs/TEMARIO.md` #15

---

## Qué es y para qué sirve

El campo `scripts` de `package.json` define comandos con nombre, ejecutables con `npm run nombre` — la forma estándar de no tener que recordar (ni documentar aparte) los comandos exactos para arrancar, compilar o testear un proyecto.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n{\n  \"scripts\": {\n    \"dev\": \"node --watch servidor.js\",\n    \"start\": \"node servidor.js\",\n    \"test\": \"node --test\",\n    \"pretest\": \"echo 'Comprobando antes de los tests...'\"\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"dev\": \"node --watch servidor.js\",", "nota": "npm run dev ejecuta este comando — --watch reinicia el proceso automáticamente cada vez que un fichero cambia, sin necesitar ninguna herramienta externa como nodemon." },
    { "fragmento": "\"pretest\": \"echo 'Comprobando antes de los tests...'\"", "nota": "npm ejecuta automáticamente cualquier script llamado pre + nombre justo antes del script nombre — pretest se ejecuta solo, sin necesidad de escribir npm run pretest && npm run test a mano." }
  ]
}
```

## start y test: dos nombres especiales

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "npm start y npm test, sin la palabra \"run\"",
  "contenido": "start y test son los dos únicos scripts que se pueden ejecutar sin escribir run: npm start (no npm run start) y npm test (no npm run test) — una convención tan asentada que muchas herramientas externas (servicios de despliegue, CI) asumen que un proyecto de Node.js tiene un script start."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir comandos largos y repetidos directamente en la terminal en vez de un script.", "texto": "Sin un script con nombre, cada persona del equipo (y el propio despliegue en producción) tiene que recordar o volver a buscar el comando exacto — un script documenta la forma correcta de una vez." },
    { "titulo": "Olvidar que pretest/postinstall y similares se ejecutan automáticamente.", "texto": "Un script pretest que falla hace fallar también a npm test, aunque los tests en sí nunca lleguen a ejecutarse — el error puede parecer venir de los tests cuando en realidad viene del paso previo." }
  ]
}
```

## Ejercicios

1. Añade un script `build` a un `package.json` que ejecute `tsc`.
2. Explica qué hace `npm run dev` frente a simplemente escribir `node servidor.js` en la terminal.
3. ¿Qué dos scripts se pueden ejecutar sin la palabra `run` delante, y por qué existe esa excepción?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "An introduction to the npm package manager",
      "descripcion": "Guía oficial de npm y sus scripts.",
      "url": "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager",
      "etiqueta": "Node.js"
    }
  ]
}
```
