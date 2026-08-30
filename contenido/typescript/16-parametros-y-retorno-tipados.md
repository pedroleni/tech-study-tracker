# Parámetros y retorno tipados

- **Módulo:** Funciones tipadas
- **Slug:** `parametros-y-retorno-tipados` (autogenerado del título)
- **Orden:** 16
- **Fuentes:** [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — ver `contenido/typescript/TEMARIO.md` #16

---

## Qué es y para qué sirve

Anotar los parámetros y el retorno de una función fija un contrato: qué necesita recibir para funcionar, y qué garantiza devolver. Es el punto donde el sistema de tipos aporta más valor real — una función es el sitio donde el código de otra persona (o de otro momento) va a interactuar con el tuyo, así que es donde más importa que el contrato quede explícito.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un contrato de función real",
  "consigna": "Llama a `calcularTotal` pasando un string en vez de un número para el precio, y observa el error.",
  "ts": "function calcularTotal(precio: number, cantidad: number): number {\n  return precio * cantidad;\n}\n\nconsole.log(calcularTotal(9.99, 3));",
  "pestañaInicial": "ts"
}
```

## Funciones como expresión, con el tipo en la variable

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Comparador = (a: number, b: number) => boolean;\n\nconst esMayor: Comparador = (a, b) => a > b;\n</script>",
  "anotaciones": [
    { "fragmento": "type Comparador = (a: number, b: number) => boolean;", "nota": "Un alias de tipo también puede describir la FORMA de una función: qué parámetros recibe y qué devuelve, sin implementarla todavía." },
    { "fragmento": "const esMayor: Comparador = (a, b) => a > b;", "nota": "Como esMayor ya está anotada como Comparador, TypeScript infiere los tipos de a y b de la propia anotación — no hace falta repetirlos dentro de la función." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No anotar los parámetros y confiar en que TypeScript los adivine.", "texto": "Sin contexto (como una anotación de tipo function en la variable), TypeScript no tiene forma de inferir el tipo de los parámetros — quedan como any si noImplicitAny está desactivado, o dan un error si strict está activo." },
    { "titulo": "Anotar el retorno con el tipo equivocado y confiar en que TypeScript lo ignore.", "texto": "Si el cuerpo de la función devuelve algo que no encaja con la anotación de retorno declarada, es un error de compilación — la anotación actúa también como una comprobación, no solo como documentación." }
  ]
}
```

## Ejercicios

1. Escribe una función `esParImpar` que reciba un `number` y devuelva un `'par' | 'impar'`.
2. Declara un alias de tipo `Transformador` para una función que reciba un `string` y devuelva un `string`, y una función que lo implemente.
3. ¿Qué error da TypeScript si el cuerpo de una función anotada `(): number` termina con un `return 'texto';`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "More on Functions",
      "descripcion": "Capítulo del Handbook sobre tipar parámetros y valores de retorno.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
