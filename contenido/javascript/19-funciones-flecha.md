# Funciones flecha

- **Módulo:** Funciones
- **Slug:** `funciones-flecha` (autogenerado del título)
- **Orden:** 56
- **Fuentes:** [Function expressions (web.dev)](https://web.dev/learn/javascript/functions/function-expressions) — ver `contenido/javascript/TEMARIO.md` #19

---

## Qué es y para qué sirve

Las funciones flecha (`=>`) son más que una sintaxis corta: cambian por completo cómo se determina `this` dentro de ellas — no tienen uno propio, heredan el de su entorno. El detalle completo de `this` en funciones normales llega en la siguiente lección; aquí, el foco es la sintaxis y esa herencia.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más corto, o algo distinto",
  "roles": [
    { "etiqueta": "Quien escribe funciones más cortas", "rol": "Sintaxis reducida, menos ruido", "descripcion": "Un parámetro, un retorno directo, sin function ni return de más." },
    { "etiqueta": "Quien hereda this de fuera", "rol": "Sin un this propio", "descripcion": "Una arrow function usa el this del entorno donde se escribió, no uno propio determinado al llamarla." },
    { "etiqueta": "Quien nombra su función internamente", "rol": "Function expressions con nombre", "descripcion": "Un nombre accesible solo desde dentro de la propia función, útil para llamadas recursivas." }
  ]
}
```

## Function expressions con nombre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const miVariable = function miFuncion() {\n    console.log('Esto es mi función.');\n  };\n\n  miVariable(); // funciona, a través de la variable\n  // miFuncion(); // ReferenceError fuera de la propia función\n</script>",
  "anotaciones": [
    { "fragmento": "// miFuncion(); // ReferenceError fuera de la propia función", "nota": "El nombre miFuncion solo es accesible DESDE DENTRO de la propia función — fuera de ella, solo existe miVariable. Útil sobre todo para depurar, o para que la función se llame a sí misma (recursión) sin depender del nombre de la variable externa." }
  ]
}
```

## Sintaxis básica de una arrow function

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const suma = (a, b) => {\n    return a + b;\n  };\n\n  console.log(suma(2, 3)); // 5\n</script>",
  "anotaciones": [
    { "fragmento": "const suma = (a, b) => {", "nota": "Sin la palabra function — el nombre de los parámetros entre paréntesis, seguido de => y el cuerpo entre llaves, igual que una función normal." }
  ]
}
```

## Un solo parámetro: paréntesis opcionales

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const doble = numero => numero * 2;\n  console.log(doble(5)); // 10\n</script>",
  "anotaciones": [
    { "fragmento": "const doble = numero => numero * 2;", "nota": "Con exactamente UN parámetro, los paréntesis alrededor de numero son opcionales — con cero o varios parámetros, siguen siendo obligatorios: () => {} o (a, b) => {}." }
  ]
}
```

## Retorno implícito: sin llaves, sin return

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cuadrado = numero => numero * numero; // retorno implícito\n\n  const numeros = [1, 2, 3];\n  const cuadrados = numeros.map(n => n * n);\n  console.log(cuadrados); // [1, 4, 9]\n</script>",
  "anotaciones": [
    { "fragmento": "const cuadrado = numero => numero * numero; // retorno implícito", "nota": "Sin llaves { }, el valor de la expresión se devuelve automáticamente — no hace falta escribir return. En cuanto se usan llaves, ese retorno implícito desaparece, y vuelve a hacer falta un return explícito." }
  ]
}
```

## El rasgo clave: this heredado, no propio

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function ConstructorPadre() {\n    this.miPropiedad = true;\n\n    let miFuncion = () => {\n      console.log(this); // hereda el this del PADRE\n    };\n\n    miFuncion();\n  }\n\n  new ConstructorPadre(); // Object { miPropiedad: true }\n</script>",
  "anotaciones": [
    { "fragmento": "let miFuncion = () => {\n      console.log(this); // hereda el this del PADRE\n    };", "nota": "miFuncion es una arrow function — NO tiene su propio this. En vez de determinarlo según cómo se la llame (como haría una función normal), usa directamente el this de ConstructorPadre, donde fue escrita." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El detalle completo de this llega en la siguiente lección",
  "contenido": "Cómo se determina this en una función NORMAL — según cómo se llame, no según dónde se escribió — es un tema con matices propios y trampas reales, cubierto a fondo en la lección siguiente de este mismo temario."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function ConstructorPadre() {\n    this.miPropiedad = true;\n    let miFuncion = () => {\n      console.log(this);\n    };\n    miFuncion();\n  }\n  new ConstructorPadre();\n</script>",
  "opciones": [
    "Object { miPropiedad: true } — la arrow function no tiene su propio this, hereda el de ConstructorPadre",
    "undefined — las arrow functions nunca tienen acceso a this bajo ninguna circunstancia",
    "El objeto global — this dentro de una arrow function siempre apunta al ámbito global, sin excepción"
  ],
  "correcta": 0,
  "explicacion": "miFuncion es una arrow function: no tiene un this propio, así que usa el this de ConstructorPadre, donde fue escrita — el objeto con miPropiedad: true, no un this distinto determinado por cómo se llamó a miFuncion."
}
```

## Lo que las funciones flecha NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las funciones flecha son solo una forma más corta de escribir function() {}",
      "realidad": "Además de la sintaxis más corta, cambian por completo cómo se determina this — heredan el de su entorno léxico, en vez de tener uno propio."
    },
    {
      "mito": "Una función expresada con nombre se puede llamar por ese nombre desde cualquier parte del código",
      "realidad": "Ese nombre solo es accesible DESDE DENTRO de la propia función — fuera de ella, solo funciona a través de la variable a la que se asignó."
    },
    {
      "mito": "El retorno implícito de una arrow function funciona con cualquier cuerpo de función",
      "realidad": "Solo funciona sin llaves { } — en cuanto se usan llaves, hace falta un return explícito, igual que en una función normal."
    },
    {
      "mito": "this dentro de una arrow function se determina igual que en una función normal",
      "realidad": "Una función normal tiene su PROPIO this, determinado por cómo se llama; una arrow function no tiene ninguno propio, simplemente usa el de fuera."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir las arrow functions con solo un atajo de sintaxis.", "texto": "El cambio real y con más consecuencias es cómo heredan this." },
    { "titulo": "Intentar llamar a una función expresada con nombre desde fuera de ella misma.", "texto": "Ese nombre solo existe dentro del propio cuerpo de la función." },
    { "titulo": "Usar llaves { } en una arrow function y olvidar el return explícito.", "texto": "El retorno implícito desaparece en cuanto aparecen las llaves." },
    { "titulo": "No tener en cuenta que this dentro de una arrow function no es el suyo propio.", "texto": "Usa el del entorno donde la función fue escrita, no el de cómo se la llama." }
  ]
}
```

## Ejercicios

1. Reescribe `function(x) { return x * 2; }` como una arrow function con retorno implícito.
2. Escribe una función expresada CON nombre, y explica dónde exactamente es accesible ese nombre.
3. Escribe un ejemplo donde una arrow function dentro de otra función herede el `this` de fuera.
4. Explica por qué una arrow function con llaves `{ }` necesita un `return` explícito, a diferencia de una sin llaves.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Function expressions",
      "descripcion": "Capítulo de web.dev sobre function expressions con y sin nombre, la sintaxis de las funciones flecha, y su herencia léxica de this.",
      "url": "https://web.dev/learn/javascript/functions/function-expressions",
      "etiqueta": "web.dev"
    }
  ]
}
```
