# Cuándo hace falta transpilar o usar un runner (tsx)

- **Módulo:** TypeScript en Node
- **Slug:** `transpilar-o-usar-un-runner` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [Running TypeScript code using transpilation](https://nodejs.org/en/learn/typescript/transpile) + [Running TypeScript with a runner](https://nodejs.org/en/learn/typescript/run) — ver `contenido/nodejs/TEMARIO.md` #43

---

## Qué es y para qué sirve

El soporte nativo (lección 42) tiene límites reales: no soporta ciertas sintaxis (enums, namespaces, atajos de constructor), y solo comprueba/quita tipos, nunca los valida. Para proyectos que necesitan esa sintaxis, o comprobación de tipos integrada en el flujo de desarrollo, hacen falta herramientas adicionales.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos caminos reales, con trade-offs distintos",
  "roles": [
    { "etiqueta": "Transpilar antes (tsc, o el propio Vite)", "rol": "Generar JavaScript real como paso previo", "descripcion": "El proyecto se compila a JavaScript puro antes de ejecutarse — el código que corre en producción nunca es TypeScript directamente. Es lo que ya hacen los proyectos de Vite de este mismo catálogo." },
    { "etiqueta": "Un runner (tsx)", "rol": "Ejecutar .ts en desarrollo sin límites del soporte nativo", "descripcion": "tsx transpila sobre la marcha, cada vez que se ejecuta — cómodo en desarrollo, pero con coste en cada arranque, así que en producción sigue siendo más común compilar antes." }
  ]
}
```

## Un caso real: enums, que el soporte nativo no acepta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nenum Estado {\n  Activo,\n  Inactivo,\n}\n\nconsole.log(Estado.Activo);\n// node archivo.ts falla aquí: enum genera un objeto real, no es borrable\n// npx tsx archivo.ts SÍ funciona: tsx transpila de verdad, no solo borra\n</script>",
  "anotaciones": [
    { "fragmento": "enum Estado {\n  Activo,\n  Inactivo,\n}", "nota": "Un enum normal genera un objeto JavaScript real en tiempo de ejecución (temario de TypeScript, lección 25) — el soporte nativo de Node.js, al ser solo type stripping, no puede con esto. Una herramienta que transpila de verdad (tsx, o tsc como paso previo) sí lo resuelve, porque genera el código necesario en vez de limitarse a borrar." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar el soporte nativo de Node.js en un proyecto que necesita enums, namespaces o el atajo de constructor.", "texto": "Ninguno de los tres es \"solo borrable\" — hace falta una herramienta de transpilación real (tsx, o compilar con tsc antes) para que funcionen." },
    { "titulo": "Desplegar a producción usando un runner como tsx en cada arranque.", "texto": "Transpilar sobre la marcha en cada arranque tiene un coste real de rendimiento — en producción es más común compilar una vez (con tsc) y desplegar el JavaScript ya generado." }
  ]
}
```

## Ejercicios

1. Escribe un fichero `.ts` con un `enum`, y comprueba que `node archivo.ts` falla pero `npx tsx archivo.ts` funciona.
2. Explica la diferencia real entre "type stripping" y "transpilación" con tus propias palabras.
3. ¿Por qué en producción suele preferirse compilar el proyecto antes, en vez de usar un runner como `tsx` en cada arranque?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Running TypeScript code using transpilation",
      "descripcion": "Guía oficial sobre transpilar TypeScript antes de ejecutarlo.",
      "url": "https://nodejs.org/en/learn/typescript/transpile",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Running TypeScript with a runner",
      "descripcion": "Guía oficial sobre usar un runner como tsx.",
      "url": "https://nodejs.org/en/learn/typescript/run",
      "etiqueta": "Node.js"
    }
  ]
}
```
