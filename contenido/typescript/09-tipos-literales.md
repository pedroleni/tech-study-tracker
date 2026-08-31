# Tipos literales e inferencia de literales

- **Módulo:** Tipos primitivos y valores
- **Slug:** `tipos-literales` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #9

---

## Qué es y para qué sirve

Un tipo literal no describe una categoría de valores (como `string`), sino un valor EXACTO — `'pendiente'` como tipo solo admite la cadena `'pendiente'`, ningún otro string. Combinados con uniones (siguiente módulo), los tipos literales son la base de patrones muy comunes en TypeScript: un estado que solo puede ser uno de unos pocos valores concretos, en vez de "cualquier string".

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un tipo literal en acción",
  "consigna": "Cambia el valor asignado a `estado` por algo que no sea 'pendiente' y observa el error.",
  "html": "<pre id=\"salida\"></pre>",
  "ts": "let estado: 'pendiente' = 'pendiente';\n\ndocument.getElementById('salida')!.textContent = estado;",
  "pestañaInicial": "ts"
}
```

## const infiere el literal, let infiere la categoría general

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst metodo = 'GET'; // tipo inferido: 'GET' (el literal exacto)\nlet metodoVariable = 'GET'; // tipo inferido: string (la categoría general)\n</script>",
  "anotaciones": [
    { "fragmento": "const metodo = 'GET'; // tipo inferido: 'GET' (el literal exacto)", "nota": "Como const no se puede reasignar, TypeScript infiere el tipo más preciso posible: el literal exacto 'GET', no cualquier string." },
    { "fragmento": "let metodoVariable = 'GET'; // tipo inferido: string (la categoría general)", "nota": "Como let SÍ se puede reasignar a cualquier otro string más adelante, TypeScript infiere el tipo más amplio string, no el literal 'GET' concreto." }
  ]
}
```

## Un caso real: parámetros con un conjunto cerrado de valores válidos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction peticion(url: string, metodo: 'GET' | 'POST' | 'DELETE') {\n  // ...\n}\n\nperticion('/api', 'GET'); // válido\nperticion('/api', 'PATCH'); // Error: 'PATCH' no está en la unión de literales permitidos\n</script>",
  "anotaciones": [
    { "fragmento": "function peticion(url: string, metodo: 'GET' | 'POST' | 'DELETE') {", "nota": "Una unión de tipos literales fija de antemano el conjunto EXACTO de valores válidos — mucho más preciso que aceptar cualquier string y comprobarlo a mano dentro de la función." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que let infiera un tipo literal como const.", "texto": "let metodo = 'GET' infiere string, no 'GET' — para forzar el tipo literal con let hace falta anotarlo explícitamente: let metodo: 'GET' = 'GET'." },
    { "titulo": "Usar string en vez de una unión de literales cuando el conjunto de valores válidos es cerrado y conocido.", "texto": "Aceptar cualquier string donde solo unos pocos valores tienen sentido traslada la comprobación al cuerpo de la función (o la pierde del todo) en vez de dejar que el compilador la haga." }
  ]
}
```

## Ejercicios

1. Declara una variable con `const` y comprueba (razonando, sin ejecutar) qué tipo infiere TypeScript si el valor es `'rojo'`.
2. Escribe una función `cambiarTema` que solo acepte `'claro'` o `'oscuro'` como parámetro.
3. Explica por qué `let` y `const` pueden inferir tipos distintos para el mismo valor literal.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre tipos literales.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
