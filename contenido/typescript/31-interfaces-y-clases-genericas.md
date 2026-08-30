# Interfaces y clases genéricas

- **Módulo:** Genéricos
- **Slug:** `interfaces-y-clases-genericas` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/typescript/TEMARIO.md` #31

---

## Qué es y para qué sirve

Los genéricos no son exclusivos de funciones — una interfaz o una clase también pueden llevar su propio parámetro de tipo, para describir estructuras que funcionan igual sea cual sea el tipo de dato que contengan: una pila, una caché, un contenedor de resultados.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Una pila genérica",
  "consigna": "Crea una segunda Pila<string> y comprueba que apilar un number en ella da un error.",
  "ts": "class Pila<T> {\n  private elementos: T[] = [];\n\n  apilar(elemento: T): void {\n    this.elementos.push(elemento);\n  }\n\n  desapilar(): T | undefined {\n    return this.elementos.pop();\n  }\n}\n\nconst numeros = new Pila<number>();\nnumeros.apilar(1);\nnumeros.apilar(2);\nconsole.log(numeros.desapilar());",
  "pestañaInicial": "ts"
}
```

## Una interfaz genérica: un resultado que puede tener cualquier forma de dato

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Resultado<T> {\n  exito: boolean;\n  datos?: T;\n  error?: string;\n}\n\nfunction buscarUsuario(id: number): Resultado<{ nombre: string }> {\n  if (id === 1) {\n    return { exito: true, datos: { nombre: 'Ada' } };\n  }\n  return { exito: false, error: 'No encontrado' };\n}\n</script>",
  "anotaciones": [
    { "fragmento": "interface Resultado<T> {", "nota": "Resultado no fija de antemano qué forma tienen los datos correctos — cada función que la use decide su propio T, sin tener que declarar una interfaz de resultado distinta para cada caso." },
    { "fragmento": "function buscarUsuario(id: number): Resultado<{ nombre: string }> {", "nota": "Aquí T se fija explícitamente como { nombre: string } — datos, si existe, tendrá exactamente esa forma en todo el resto de la función." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar una nueva interfaz para cada tipo de dato en vez de una genérica reutilizable.", "texto": "ResultadoUsuario, ResultadoPedido, ResultadoProducto... repiten la misma forma con un solo campo distinto — Resultado<T> lo cubre todo con una sola declaración." },
    { "titulo": "Olvidar especificar T al instanciar una clase genérica y dejar que se infiera de forma incorrecta.", "texto": "new Pila() sin ningún argumento en el primer apilar() puede inferir T de forma poco útil — especificar new Pila<number>() explícitamente evita ambigüedad." }
  ]
}
```

## Ejercicios

1. Escribe una clase genérica `Caja<T>` con un método `guardar(valor: T)` y un método `obtener(): T | undefined`.
2. Reescribe la interfaz `Resultado<T>` del ejemplo para una función que busque productos, con `datos` tipado como `{ nombre: string; precio: number }`.
3. ¿Qué ventaja real tiene una interfaz genérica frente a declarar una interfaz distinta por cada tipo de dato?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Generics",
      "descripcion": "Capítulo del Handbook sobre interfaces y clases genéricas.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
