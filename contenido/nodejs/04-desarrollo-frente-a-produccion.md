# Desarrollo frente a producción en Node.js

- **Módulo:** Qué es Node.js y por qué existe
- **Slug:** `desarrollo-frente-a-produccion` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [Node.js, the difference between development and production](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) — ver `contenido/nodejs/TEMARIO.md` #4

---

## Qué es y para qué sirve

`NODE_ENV` es una variable de entorno que, por convención (no por magia del propio Node.js), muchas librerías usan para decidir si están corriendo en desarrollo o en producción — activando registros más detallados, mensajes de error completos, o comprobaciones extra en desarrollo, y optimizaciones de rendimiento en producción.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nif (process.env.NODE_ENV === 'production') {\n  console.log('Modo producción: registros mínimos, sin detalles internos');\n} else {\n  console.log('Modo desarrollo: registros detallados para depurar');\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (process.env.NODE_ENV === 'production') {", "nota": "process.env.NODE_ENV no es una variable especial que Node.js gestione internamente — es una variable de entorno normal, que el propio código (o una librería como Express) decide leer y respetar por convención." }
  ]
}
```

## Por qué importa de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No es solo una etiqueta — cambia comportamiento real",
  "contenido": "Frameworks como Express muestran páginas de error con el stack trace completo en desarrollo, y un mensaje genérico en producción — mostrar detalles internos de la aplicación a un usuario real en producción es un problema de seguridad, no solo de estética. Dejar NODE_ENV sin definir en un servidor real puede significar exponer información que no debería salir nunca de un entorno de desarrollo."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Desplegar a producción sin definir NODE_ENV=production.", "texto": "Muchas optimizaciones de rendimiento de librerías reales solo se activan con esa variable puesta — dejarla sin definir en producción puede significar un servidor notablemente más lento sin ningún otro cambio de código." },
    { "titulo": "Pensar que NODE_ENV lo gestiona Node.js automáticamente.", "texto": "Es responsabilidad de quien despliega la aplicación definirla — Node.js no la pone por defecto a ningún valor." }
  ]
}
```

## Ejercicios

1. Explica con tus palabras qué es `NODE_ENV` y quién decide qué hacer con su valor.
2. ¿Por qué mostrar el stack trace completo de un error a un usuario real en producción es un problema de seguridad?
3. Escribe un fragmento de código que se comporte de forma distinta según el valor de `NODE_ENV`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Node.js, the difference between development and production",
      "descripcion": "Guía oficial sobre NODE_ENV y sus implicaciones reales.",
      "url": "https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production",
      "etiqueta": "Node.js"
    }
  ]
}
```
