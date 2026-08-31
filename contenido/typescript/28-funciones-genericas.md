# Funciones genéricas: tipos que dependen de quien llama

- **Módulo:** Genéricos
- **Slug:** `funciones-genericas` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/typescript/TEMARIO.md` #28

---

## Qué es y para qué sirve

Un genérico es una variable de tipo — un marcador de posición, casi siempre escrito como `T`, que se rellena con un tipo concreto cada vez que se usa la función. Sirve para escribir funciones que funcionan con cualquier tipo, sin perder la relación entre lo que entra y lo que sale — algo que `any` no puede dar, porque `any` desactiva toda comprobación en vez de preservarla de forma flexible.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Con any: funciona, pero se pierde toda relación entre entrada y salida\nfunction primero(lista: any[]): any {\n  return lista[0];\n}\n\nconst resultado = primero([1, 2, 3]);\nresultado.toUpperCase(); // compila, aunque resultado sea un número — bug real\n</script>",
  "despues": "<script>\n// Con un genérico: la relación entre entrada y salida se conserva\nfunction primero<T>(lista: T[]): T {\n  return lista[0];\n}\n\nconst resultado = primero([1, 2, 3]); // T se infiere como number\nresultado.toUpperCase(); // Error: number no tiene toUpperCase\n</script>",
  "nota": "Con any, primero() acepta y devuelve cualquier cosa sin ninguna relación entre ambos — el compilador no puede avisar de un uso incorrecto del resultado. Con <T>, TypeScript infiere T a partir del argumento real (number[] en este caso) y aplica ESE tipo concreto al valor de retorno, conservando la seguridad de tipos de principio a fin."
}
```

## T se decide en cada llamada, no en la definición

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El mismo genérico, con tipos distintos según la llamada",
  "consigna": "Llama a `primero` con un array de strings y observa (en el panel o pasando el ratón) que T se infiere como string esa vez.",
  "ts": "function primero<T>(lista: T[]): T {\n  return lista[0];\n}\n\nconst numero = primero([1, 2, 3]); // T: number\nconst texto = primero(['a', 'b']); // T: string\n\nconsole.log(numero, texto);",
  "pestañaInicial": "ts"
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar any donde un genérico conservaría la relación de tipos.", "texto": "any siempre pierde información — un genérico permite que la función siga siendo flexible SIN perder qué tipo concreto entró y salió." },
    { "titulo": "Anotar T explícitamente en cada llamada cuando TypeScript ya puede inferirlo.", "texto": "primero<number>([1, 2, 3]) funciona, pero es redundante — TypeScript ya infiere T: number a partir del argumento, igual que hace con cualquier otro tipo." }
  ]
}
```

## Ejercicios

1. Escribe una función genérica `ultimo<T>` que reciba un array de `T` y devuelva su último elemento.
2. Explica con tus palabras la diferencia entre `any` y un parámetro de tipo genérico `T`.
3. ¿Por qué `primero([1, 2, 3])` no necesita anotar explícitamente qué es `T`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Generics",
      "descripcion": "Capítulo del Handbook sobre funciones genéricas.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
