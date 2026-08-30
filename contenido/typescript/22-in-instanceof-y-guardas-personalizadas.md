# in, instanceof y guardas de tipo personalizadas

- **Módulo:** Narrowing y uniones discriminadas
- **Slug:** `in-instanceof-y-guardas-personalizadas` (autogenerado del título)
- **Orden:** 22
- **Fuentes:** [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — ver `contenido/typescript/TEMARIO.md` #22

---

## Qué es y para qué sirve

`typeof` solo distingue primitivos. Para distinguir entre dos formas de OBJETO — dos tipos que no son primitivos pero tienen propiedades distintas — TypeScript reconoce otras dos comprobaciones como narrowing válido: `in` (¿existe esta propiedad en el objeto?) e `instanceof` (¿es una instancia de esta clase?). Cuando ninguna de las dos basta, se puede escribir una función propia que actúe como guarda de tipo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Perro = { ladrar: () => void };\ntype Gato = { maullar: () => void };\n\nfunction hacerSonido(animal: Perro | Gato) {\n  if ('ladrar' in animal) {\n    animal.ladrar(); // aquí, TypeScript sabe que animal es Perro\n  } else {\n    animal.maullar(); // por descarte, aquí solo puede ser Gato\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if ('ladrar' in animal) {", "nota": "El operador in comprueba si una propiedad existe en el objeto EN TIEMPO DE EJECUCIÓN — y TypeScript lo reconoce como una forma válida de narrowing entre dos tipos de objeto distintos." }
  ]
}
```

## instanceof: distinguir instancias de clases

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass ErrorDeRed extends Error {}\nclass ErrorDeValidacion extends Error {}\n\nfunction manejarError(error: ErrorDeRed | ErrorDeValidacion) {\n  if (error instanceof ErrorDeRed) {\n    console.log('Reintentar la petición');\n  } else {\n    console.log('Mostrar el campo inválido');\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (error instanceof ErrorDeRed) {", "nota": "instanceof comprueba la cadena de prototipos real del objeto — funciona con cualquier clase, incluidas las que extienden Error, como es habitual en clases de error personalizadas." }
  ]
}
```

## Una guarda de tipo personalizada: is

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Pez = { nadar: () => void };\ntype Ave = { volar: () => void };\n\nfunction esPez(animal: Pez | Ave): animal is Pez {\n  return (animal as Pez).nadar !== undefined;\n}\n\nfunction moverse(animal: Pez | Ave) {\n  if (esPez(animal)) {\n    animal.nadar(); // TypeScript confía en la anotación 'animal is Pez'\n  } else {\n    animal.volar();\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "function esPez(animal: Pez | Ave): animal is Pez {", "nota": "animal is Pez es un \"type predicate\" — le dice a TypeScript que, si esta función devuelve true, el valor comprobado se puede tratar como Pez a partir de ese punto. Es la herramienta para cuando ni in ni instanceof encajan con la forma real de distinguir los tipos." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir una guarda de tipo personalizada que mienta sobre lo que comprueba.", "texto": "animal is Pez es una promesa del programador, no algo que TypeScript verifique de verdad — si la lógica dentro de la función es incorrecta, el narrowing resultante también lo será, sin ningún aviso." },
    { "titulo": "Usar instanceof con tipos que no son clases.", "texto": "instanceof solo tiene sentido con clases (Error, Date, clases propias) — para distinguir tipos de objeto planos sin clase, in es la herramienta correcta." }
  ]
}
```

## Ejercicios

1. Escribe dos tipos de objeto (`Coche` con `conducir()` y `Barco` con `navegar()`) y una función que use `in` para distinguirlos.
2. Escribe una guarda de tipo personalizada `esNumeroPositivo(valor: unknown): valor is number`.
3. ¿Cuándo conviene usar `instanceof` en vez de `in`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Narrowing",
      "descripcion": "Capítulo del Handbook sobre in, instanceof y guardas de tipo personalizadas.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
