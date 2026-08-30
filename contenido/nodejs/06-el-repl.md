# El REPL de Node.js

- **Módulo:** Primeros pasos
- **Slug:** `el-repl` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [How to use the Node.js REPL](https://nodejs.org/en/learn/command-line/how-to-use-the-nodejs-repl) — ver `contenido/nodejs/TEMARIO.md` #6

---

## Qué es y para qué sirve

Ejecutar `node` sin ningún fichero detrás abre el REPL (Read-Eval-Print Loop): un intérprete interactivo que lee una línea, la ejecuta, imprime el resultado, y espera la siguiente — igual que la consola de las herramientas de desarrollo del navegador, pero con todas las APIs de Node.js disponibles. Es la forma más rápida de probar una idea de una línea sin crear ni ejecutar ningún fichero.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Atajos reales del REPL",
  "contenido": "La variable especial _ guarda el resultado de la última expresión evaluada. .exit (o Ctrl+D) cierra el REPL. La tecla Tab autocompleta nombres de variables y métodos, igual que en un editor real."
}
```

## Un uso real: probar una API antes de escribirla en un fichero

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Escrito directamente en el REPL, línea a línea (cada línea es una entrada distinta):\nconst numeros = [1, 2, 3, 4, 5];\n\nnumeros.filter(n => n % 2 === 0);\n// El REPL imprime esto solo, sin console.log: [ 2, 4 ]\n\n_.length;\n// _ es el resultado de la línea anterior ([2, 4]) - esto imprime: 2\n</script>",
  "anotaciones": [
    { "fragmento": "numeros.filter(n => n % 2 === 0);\n// El REPL imprime esto solo, sin console.log: [ 2, 4 ]", "nota": "El REPL imprime automáticamente el resultado de cada expresión, sin necesitar console.log — a diferencia de un script normal, donde hay que imprimir explícitamente lo que se quiere ver." },
    { "fragmento": "_.length;\n// _ es el resultado de la línea anterior ([2, 4]) - esto imprime: 2", "nota": "_ contiene el resultado de la última línea evaluada — .length da su longitud, sin tener que volver a escribir la expresión completa." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir código con varias líneas de un bloque (una función completa) sin que el REPL sepa que sigue.", "texto": "El REPL detecta automáticamente llaves o paréntesis sin cerrar y espera la siguiente línea (mostrando ... en vez de >) — no hace falta escribir todo en una sola línea." },
    { "titulo": "Confundir el REPL con \"ejecutar un fichero\".", "texto": "El REPL es para probar cosas sueltas de forma interactiva — cualquier código real que se vaya a reutilizar debería vivir en un fichero, no escribirse a mano cada vez en el REPL." }
  ]
}
```

## Ejercicios

1. Abre el REPL con `node` y calcula el resultado de una expresión matemática cualquiera.
2. Declara un array en el REPL y usa `_` para acceder al resultado de la última operación sobre él.
3. Explica cuándo tiene sentido usar el REPL y cuándo tiene más sentido escribir un fichero.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to use the Node.js REPL",
      "descripcion": "Guía oficial del REPL de Node.js.",
      "url": "https://nodejs.org/en/learn/command-line/how-to-use-the-nodejs-repl",
      "etiqueta": "Node.js"
    }
  ]
}
```
