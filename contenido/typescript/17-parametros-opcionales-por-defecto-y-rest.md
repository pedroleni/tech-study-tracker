# Parámetros opcionales, por defecto y rest

- **Módulo:** Funciones tipadas
- **Slug:** `parametros-opcionales-por-defecto-y-rest` (autogenerado del título)
- **Orden:** 17
- **Fuentes:** [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — ver `contenido/typescript/TEMARIO.md` #17

---

## Qué es y para qué sirve

TypeScript tipa igual las tres variantes de parámetro que ya existen en JavaScript: opcionales (`?`, se puede omitir al llamar), con valor por defecto (`= valor`, se usa si no se pasa nada) y rest (`...nombre`, agrupa el resto de argumentos en un array). Cada una tiene su propia forma de anotar el tipo, y sus propias reglas sobre qué puede ir antes o después.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction saludar(nombre: string, saludo?: string) {\n  return `${saludo ?? 'Hola'}, ${nombre}`;\n}\n\nfunction saludarConDefecto(nombre: string, saludo: string = 'Hola') {\n  return `${saludo}, ${nombre}`;\n}\n\nfunction sumarTodos(...numeros: number[]): number {\n  return numeros.reduce((total, n) => total + n, 0);\n}\n\nsaludar('Ada'); // saludo: string | undefined\nsaludarConDefecto('Ada'); // saludo siempre es string, nunca undefined\nsumarTodos(1, 2, 3, 4);\n</script>",
  "anotaciones": [
    { "fragmento": "function saludar(nombre: string, saludo?: string) {", "nota": "saludo? tiene tipo string | undefined — puede omitirse al llamar, y dentro de la función hay que contar con que puede faltar." },
    { "fragmento": "function saludarConDefecto(nombre: string, saludo: string = 'Hola') {", "nota": "Con valor por defecto, el tipo de saludo DENTRO de la función es siempre string, nunca undefined — si no se pasa nada, ya se rellenó con 'Hola' antes de entrar al cuerpo." },
    { "fragmento": "function sumarTodos(...numeros: number[]): number {", "nota": "El parámetro rest agrupa cualquier cantidad de argumentos en un array tipado — numeros es number[], sin importar si se llama con 0, 3 o 20 argumentos." }
  ]
}
```

## El orden importa

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Opcionales y con valor por defecto van al final",
  "contenido": "function f(a: string, b?: number, c: string)  no es válido — un parámetro obligatorio no puede ir DESPUÉS de uno opcional, porque no habría forma de omitir solo b al llamar. El parámetro rest, además, siempre tiene que ser el último de todos."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Tratar un parámetro opcional como si nunca fuera undefined.", "texto": "saludo?: string tiene tipo string | undefined — usarlo sin comprobar (saludo.toUpperCase()) da un error, a menos que se haya hecho narrowing o se use un valor por defecto en su lugar." },
    { "titulo": "Poner un parámetro obligatorio después de uno opcional o con valor por defecto.", "texto": "TypeScript lo rechaza directamente — reordenar los parámetros (obligatorios primero) es la única solución." }
  ]
}
```

## Ejercicios

1. Escribe una función `crearUsuario` con `nombre` obligatorio y `rol` con valor por defecto `'invitado'`.
2. Escribe una función `concatenar` que reciba un separador y cualquier cantidad de strings (parámetro rest), devolviendo todo unido con ese separador.
3. Explica por qué un parámetro obligatorio no puede declararse después de uno opcional.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "More on Functions",
      "descripcion": "Capítulo del Handbook sobre parámetros opcionales, por defecto y rest.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
