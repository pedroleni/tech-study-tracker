# Ficheros de declaración .d.ts: tipar JavaScript sin tipos

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `ficheros-de-declaracion` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Declaration Files — Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) + [By Example](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html) — ver `contenido/typescript/TEMARIO.md` #50

---

## Qué es y para qué sirve

Un fichero `.d.ts` contiene SOLO tipos — ninguna implementación real, ningún código ejecutable. Sirve para describir la forma de código que ya existe en JavaScript puro (una librería sin tipos propios, un script antiguo) sin tener que reescribirlo en TypeScript. Es, además, exactamente el formato que usa el propio compilador de TypeScript para describir sus librerías estándar — los ficheros que este mismo proyecto usa para el editor en vivo son `.d.ts` reales.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// libreria-sin-tipos.js (JavaScript puro, sin ninguna anotación)\nfunction saludar(nombre) {\n  return 'Hola, ' + nombre;\n}\n\n// libreria-sin-tipos.d.ts (describe la forma, sin implementación)\ndeclare function saludar(nombre: string): string;\n</script>",
  "anotaciones": [
    { "fragmento": "declare function saludar(nombre: string): string;", "nota": "declare le dice a TypeScript \"esto existe en algún sitio, en tiempo de ejecución — confía en esta forma, no la vuelvas a implementar aquí\". El fichero .d.ts nunca se ejecuta, solo se usa durante la comprobación de tipos." }
  ]
}
```

## Un caso muy común: @types

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "DefinitelyTyped: tipos para librerías que no incluyen los suyos",
  "contenido": "Muchas librerías de JavaScript popular no incluyen sus propios ficheros .d.ts — la comunidad mantiene tipos para ellas en el paquete DefinitelyTyped, instalable como @types/nombre-libreria (por ejemplo, npm install --save-dev @types/lodash). TypeScript los detecta automáticamente si están en node_modules/@types, sin necesidad de importarlos explícitamente en el código."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir implementación real dentro de un fichero .d.ts.", "texto": "Un .d.ts solo admite declaraciones (declare, interface, type) — cualquier código con cuerpo real (function f() { return 1; }) no es válido ahí." },
    { "titulo": "Olvidar instalar los @types de una librería y usar any por defecto.", "texto": "Antes de recurrir a any para una librería sin tipos, comprobar si existe un paquete @types/nombre-libreria correspondiente evita perder toda la comprobación de tipos para ese código." }
  ]
}
```

## Ejercicios

1. Escribe un fichero de declaración (en prosa, describiendo su contenido) para una función `sumar(a, b)` de una librería JavaScript sin tipos.
2. Explica qué diferencia hay entre un fichero `.ts` normal y uno `.d.ts`.
3. ¿Qué es DefinitelyTyped, y cómo se instalan los tipos de una librería que forma parte de ese proyecto?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Declaration Files — Introduction",
      "descripcion": "Introducción oficial a los ficheros de declaración.",
      "url": "https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Declaration Files — By Example",
      "descripcion": "Ejemplos prácticos de cómo escribir ficheros .d.ts para distintos casos.",
      "url": "https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
