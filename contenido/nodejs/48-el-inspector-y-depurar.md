# El inspector de Node y depurar con las DevTools del navegador

- **Módulo:** Depuración, configuración y seguridad
- **Slug:** `el-inspector-y-depurar` (autogenerado del título)
- **Orden:** 480
- **Fuentes:** [Debugging Node.js](https://nodejs.org/en/learn/getting-started/debugging) — ver `contenido/nodejs/TEMARIO.md` #48

---

## Qué es y para qué sirve

`node --inspect archivo.js` expone un puerto de depuración al que las propias DevTools de Chrome pueden conectarse — los mismos puntos de interrupción (breakpoints), inspección de variables y pila de llamadas que ya se usan para depurar JavaScript en el navegador, pero apuntando a un proceso de Node.js.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "chrome://inspect, la puerta de entrada",
  "contenido": "Tras ejecutar node --inspect archivo.js, abrir chrome://inspect en Chrome y hacer clic en \"inspect\" junto al proceso conecta las DevTools reales — con puntos de interrupción, la pestaña Sources para navegar el código fuente, y la consola conectada directamente al proceso de Node.js en ejecución."
}
```

## debugger: un punto de interrupción desde el propio código

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction calcularTotal(items) {\n  let total = 0;\n  for (const item of items) {\n    debugger; // el programa se detiene aquí SOLO si se ejecuta con --inspect\n    total += item.precio;\n  }\n  return total;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "debugger; // el programa se detiene aquí SOLO si se ejecuta con --inspect", "nota": "Sin --inspect, la palabra clave debugger no hace absolutamente nada — es un no-op completo. Solo con el inspector conectado, el proceso se detiene ahí para poder inspeccionar el estado en ese punto exacto." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar sentencias debugger en código que se despliega a producción.", "texto": "No hace nada por sí solo, pero es ruido en el código que no debería llegar a producción — una herramienta de lint puede detectarlas automáticamente antes de un commit." },
    { "titulo": "Usar solo console.log para depurar problemas complejos, en vez del inspector real.", "texto": "console.log funciona para casos simples, pero no permite inspeccionar el estado completo en un punto exacto, pausar la ejecución, ni recorrer la pila de llamadas — el inspector real da mucha más información de una vez." }
  ]
}
```

## Ejercicios

1. Ejecuta un script con `node --inspect` y conéctate con `chrome://inspect` desde Chrome.
2. Añade una sentencia `debugger;` a un script y comprueba que el proceso se detiene ahí con el inspector conectado.
3. Explica qué hace `debugger;` cuando el script se ejecuta SIN `--inspect`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Debugging Node.js",
      "descripcion": "Guía oficial de depuración de Node.js con el inspector.",
      "url": "https://nodejs.org/en/learn/getting-started/debugging",
      "etiqueta": "Node.js"
    }
  ]
}
```
