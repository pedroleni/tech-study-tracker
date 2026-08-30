# this en funciones y métodos

- **Módulo:** Funciones tipadas
- **Slug:** `this-en-funciones-y-metodos` (autogenerado del título)
- **Orden:** 19
- **Fuentes:** [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — ver `contenido/typescript/TEMARIO.md` #19

---

## Qué es y para qué sirve

El valor de `this` en JavaScript depende de CÓMO se llama una función, no de dónde se define — una fuente real de bugs cuando un método se pasa como callback y pierde su contexto original. TypeScript permite anotar explícitamente qué tipo debe tener `this` dentro de una función, para que ese error se detecte en compilación en vez de en ejecución.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// JavaScript: this puede perderse sin ningún aviso\nconst contador = {\n  valor: 0,\n  incrementar() {\n    this.valor++;\n  }\n};\n\nconst incrementarSuelto = contador.incrementar;\nincrementarSuelto(); // this ya no es contador — bug silencioso\n</script>",
  "despues": "<script>\n// TypeScript: this anotado explícitamente\ninterface Contador {\n  valor: number;\n}\n\nfunction incrementar(this: Contador) {\n  this.valor++;\n}\n\nconst contador: Contador = { valor: 0 };\nincrementar.call(contador); // correcto: this es explícitamente Contador\n\nconst incrementarSuelto = incrementar;\nincrementarSuelto(); // Error de compilación: 'this' context is of type 'void'\n</script>",
  "nota": "El primer parámetro this: Contador no es un parámetro real (no cuenta al llamar la función con argumentos normales) — es una anotación especial que TypeScript usa solo para comprobar en qué contexto se está llamando la función. Sin ese contexto correcto, avisa ANTES de ejecutar, no después."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pasar un método como callback sin arrow function ni bind.", "texto": "elemento.addEventListener('click', objeto.metodo) pierde el this original — usar una arrow function (() => objeto.metodo()) o .bind(objeto) lo conserva." },
    { "titulo": "Confundir el parámetro this con un parámetro normal.", "texto": "this: Tipo como primer \"parámetro\" no se pasa como argumento al llamar la función — es pura anotación de tipo, TypeScript la quita del JavaScript generado." }
  ]
}
```

## Ejercicios

1. Explica por qué `const metodo = objeto.metodo; metodo();` puede perder el `this` original.
2. Escribe una función con un parámetro `this` tipado que solo se pueda llamar correctamente sobre un objeto con una propiedad `nombre: string`.
3. ¿Qué dos formas hay de evitar el problema de perder `this` al pasar un método como callback?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "More on Functions",
      "descripcion": "Capítulo del Handbook sobre el parámetro this en funciones.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
