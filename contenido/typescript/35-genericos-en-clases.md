# Genéricos en clases

- **Módulo:** Clases tipadas
- **Slug:** `genericos-en-clases` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) + [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/typescript/TEMARIO.md` #35

---

## Qué es y para qué sirve

Una clase genérica combina lo que ya se vio en el módulo de Genéricos (una `Pila<T>`, por ejemplo) con lo que aporta este módulo: métodos con su propia lógica, modificadores de acceso, herencia. Esta lección va un paso más allá de una estructura de datos simple: un patrón real, un repositorio en memoria, que combina un genérico CON un constraint sobre la forma que ese genérico debe cumplir.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un repositorio genérico con constraint",
  "consigna": "Prueba a guardar un objeto sin `id` en el repositorio y observa el error — el constraint lo exige.",
  "ts": "interface ConId {\n  id: number;\n}\n\nclass Repositorio<T extends ConId> {\n  private elementos: T[] = [];\n\n  guardar(elemento: T): void {\n    this.elementos.push(elemento);\n  }\n\n  buscarPorId(id: number): T | undefined {\n    return this.elementos.find((elemento) => elemento.id === id);\n  }\n}\n\ninterface Producto extends ConId {\n  nombre: string;\n}\n\nconst repositorioProductos = new Repositorio<Producto>();\nrepositorioProductos.guardar({ id: 1, nombre: 'Teclado' });\nconsole.log(repositorioProductos.buscarPorId(1));",
  "pestañaInicial": "ts"
}
```

## Por qué el constraint importa aquí

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin el constraint, buscarPorId no podría existir",
  "contenido": "Sin T extends ConId, TypeScript no sabría que cada elemento de tipo T tiene una propiedad id — elemento.id === id en buscarPorId daría un error de compilación. El constraint es lo que permite que Repositorio<T> ofrezca un método REAL (buscar por id) en vez de ser solo un contenedor genérico sin ninguna operación útil."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar una clase genérica sin constraint cuando sus métodos necesitan alguna propiedad concreta.", "texto": "Sin restringir T, cualquier método que intente acceder a una propiedad específica (como id) da un error — el constraint es lo que hace posible escribir lógica real dentro de la clase." },
    { "titulo": "Instanciar Repositorio<T> sin especificar T y confiar en la inferencia.", "texto": "A diferencia de una función, en una clase genérica sin argumentos en el constructor TypeScript no siempre tiene de dónde inferir T — especificarlo explícitamente (new Repositorio<Producto>()) evita ambigüedad." }
  ]
}
```

## Ejercicios

1. Añade un método `eliminarPorId(id: number)` a la clase `Repositorio<T>` del ejemplo.
2. Crea una segunda interfaz `Cliente extends ConId` con un campo `nombre: string`, y un `Repositorio<Cliente>` independiente del de productos.
3. Explica por qué `T extends ConId` es necesario para que `buscarPorId` pueda compilar.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Classes",
      "descripcion": "Capítulo del Handbook sobre clases, combinado con genéricos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/classes.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Generics",
      "descripcion": "Capítulo del Handbook sobre constraints en parámetros de tipo.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
