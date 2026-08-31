# setImmediate() frente a setTimeout(fn, 0)

- **Módulo:** El bucle de eventos en profundidad
- **Slug:** `setimmediate` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [Understanding setImmediate()](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate) — ver `contenido/nodejs/TEMARIO.md` #27

---

## Qué es y para qué sirve

`setImmediate(callback)` programa un callback para ejecutarse en la fase `check` del bucle de eventos — justo después de la fase `poll` (E/S), en cada vuelta. Es específico de Node.js (no existe en el navegador), y su comportamiento frente a `setTimeout(fn, 0)` depende de DESDE DÓNDE se llame.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { readFile } from 'node:fs/promises';\n\n// Dentro de un callback de E/S, el orden SÍ está garantizado:\nawait readFile('archivo.txt');\n\nsetTimeout(() => console.log('setTimeout'), 0);\nsetImmediate(() => console.log('setImmediate'));\n// Aquí, setImmediate SIEMPRE se ejecuta antes que setTimeout(fn, 0),\n// porque ya se está en (o justo después de) la fase poll de E/S,\n// y check va inmediatamente después de poll.\n</script>",
  "anotaciones": [
    { "fragmento": "// Aquí, setImmediate SIEMPRE se ejecuta antes que setTimeout(fn, 0),", "nota": "Esta garantía SOLO aplica dentro de un ciclo de E/S — en el nivel superior de un script (fuera de cualquier callback de E/S), el orden entre setTimeout(fn, 0) y setImmediate NO está garantizado, y puede depender de detalles de rendimiento del propio proceso." }
  ]
}
```

## Cuándo usar cada uno

```laboratorio
{
  "tipo": "roles",
  "titulo": "setImmediate frente a setTimeout(fn, 0)",
  "roles": [
    { "etiqueta": "setImmediate", "rol": "Ejecutar algo después de la E/S actual, dentro de Node.js", "descripcion": "Pensado específicamente para el patrón \"después de procesar esta E/S, haz esto otro\" — no existe en el navegador." },
    { "etiqueta": "setTimeout(fn, 0)", "rol": "Compatible también con el navegador", "descripcion": "Si el mismo código tiene que funcionar en Node.js y en el navegador, setTimeout es la opción portable — setImmediate es exclusivo de Node.js." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que setImmediate siempre se ejecuta antes que setTimeout(fn, 0), en cualquier contexto.", "texto": "Esa garantía solo existe dentro de un callback de E/S — en el nivel superior de un script, el orden entre los dos no está garantizado." },
    { "titulo": "Usar setImmediate en código que también debe funcionar en el navegador.", "texto": "No existe fuera de Node.js — setTimeout(fn, 0) es la alternativa portable." }
  ]
}
```

## Ejercicios

1. Escribe un script con `setTimeout(fn, 0)` y `setImmediate(fn)` dentro de un callback de lectura de fichero, y comprueba que `setImmediate` se ejecuta primero.
2. Explica en qué contexto el orden entre `setImmediate` y `setTimeout(fn, 0)` NO está garantizado.
3. ¿Por qué `setImmediate` no es una opción válida si el mismo código debe funcionar también en el navegador?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Understanding setImmediate()",
      "descripcion": "Guía oficial de setImmediate() y su comparación con setTimeout.",
      "url": "https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate",
      "etiqueta": "Node.js"
    }
  ]
}
```
