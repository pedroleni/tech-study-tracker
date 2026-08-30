# ReturnType y Parameters: extraer tipos de una función

- **Módulo:** Utility types
- **Slug:** `returntype-y-parameters` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — ver `contenido/typescript/TEMARIO.md` #43

---

## Qué es y para qué sirve

`ReturnType<F>` y `Parameters<F>` extraen, respectivamente, el tipo de retorno y una tupla con los tipos de los parámetros de una función — sin tener que declarar esos tipos por separado. Son especialmente útiles con funciones de librerías externas, donde no se controla la declaración original pero sí hace falta reutilizar su forma.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Derivar tipos directamente de una función existente",
  "consigna": "Cambia el objeto pasado a `guardarUsuario` para que le falte `email`, y observa el error — Parametros se derivó directamente de la función real.",
  "ts": "function crearUsuario(nombre: string, edad: number) {\n  return { id: Date.now(), nombre, edad };\n}\n\ntype Usuario = ReturnType<typeof crearUsuario>; // { id: number; nombre: string; edad: number }\ntype ParametrosCrearUsuario = Parameters<typeof crearUsuario>; // [string, number]\n\nfunction guardarUsuario(usuario: Usuario) {\n  console.log('Guardando', usuario);\n}\n\nguardarUsuario(crearUsuario('Ada', 36));",
  "pestañaInicial": "ts"
}
```

## Por qué typeof es imprescindible aquí

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "ReturnType necesita el TIPO de la función, no la función en sí",
  "contenido": "ReturnType<crearUsuario> (sin typeof) da un error — crearUsuario ahí es un VALOR, no un tipo. typeof crearUsuario convierte ese valor en su tipo de función correspondiente, que es lo que ReturnType y Parameters realmente esperan como argumento genérico. Es el mismo patrón typeof de la lección 38, aplicado aquí a funciones en vez de objetos."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar typeof al usar ReturnType o Parameters sobre una función real.", "texto": "ReturnType<miFuncion> da un error de compilación — hace falta ReturnType<typeof miFuncion>." },
    { "titulo": "Declarar a mano el tipo de retorno de una función ya existente en vez de derivarlo con ReturnType.", "texto": "Si la función cambia su implementación (y por tanto su tipo de retorno real), un tipo escrito a mano puede quedar desactualizado — ReturnType siempre refleja el tipo de retorno actual." }
  ]
}
```

## Ejercicios

1. Escribe una función `calcularDescuento` y extrae su tipo de retorno con `ReturnType`.
2. Extrae los tipos de los parámetros de esa misma función con `Parameters`, como una tupla.
3. Explica por qué hace falta `typeof` antes del nombre de la función al usar `ReturnType` o `Parameters`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Utility Types",
      "descripcion": "Referencia oficial, secciones sobre ReturnType y Parameters.",
      "url": "https://www.typescriptlang.org/docs/handbook/utility-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
