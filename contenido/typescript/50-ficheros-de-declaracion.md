# Ficheros de declaración .d.ts: tipar JavaScript sin tipos

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `ficheros-de-declaracion` (autogenerado del título)
- **Orden:** 500
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
  "contenido": "Muchas librerías de JavaScript popular no incluyen sus propios ficheros .d.ts — la comunidad mantiene tipos para ellas en el proyecto DefinitelyTyped, instalables como @types/nombre-libreria (por ejemplo, npm install --save-dev @types/lodash). Si importas la librería en tu código (import _ from 'lodash'), TypeScript encuentra sus tipos en node_modules/@types sin hacer nada más: no hace falta tocar el tsconfig.json."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los tipos globales, como @types/node, hay que pedirlos",
  "contenido": "Algunos @types no se importan: declaran cosas globales que usas sin más, como process o Buffer (@types/node) o describe e it (los de un framework de tests). Desde TypeScript 6.0, la opción types del tsconfig.json vale [] por defecto, así que esos ya no se cargan solos aunque estén instalados. Hay que pedirlos: \"types\": [\"node\"]. Si no, el propio error te dice qué falta: TS2591: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"types\": [\"node\"]\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"types\": [\"node\"]", "nota": "Carga los tipos globales de @types/node (process, Buffer...). Solo hace falta para los @types que no importas: los de una librería que importas (import _ from 'lodash') se encuentran solos aunque no estén en esta lista. Comprobado con TypeScript 6.0.3 y 7.0.2: sin esta línea, process da TS2591; con ella, compila." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir implementación real dentro de un fichero .d.ts.", "texto": "Un .d.ts solo admite declaraciones (declare, interface, type) — cualquier código con cuerpo real (function f() { return 1; }) no es válido ahí." },
    { "titulo": "Olvidar instalar los @types de una librería, o instalarlos y no añadirlos a types.", "texto": "Si importas una librería sin tipos ni @types, con strict (activado por defecto) no hay any silencioso: el compilador da TS7016, Could not find a declaration file for module 'lodash', y sugiere npm i --save-dev @types/lodash. Antes de recurrir a any o a un declare module, comprueba si existe ese paquete. Y si son tipos globales, como @types/node, instalarlos no basta: hay que añadirlos a \"types\" en el tsconfig.json, o sale TS2591." }
  ]
}
```

## Ejercicios

1. Escribe un fichero de declaración (en prosa, describiendo su contenido) para una función `sumar(a, b)` de una librería JavaScript sin tipos.
2. Explica qué diferencia hay entre un fichero `.ts` normal y uno `.d.ts`.
3. ¿Qué es DefinitelyTyped, y cómo se instalan los tipos de una librería que forma parte de ese proyecto?
4. Tienes `@types/node` instalado y, aun así, `process.argv` da `Cannot find name 'process'`. ¿Qué falta en el `tsconfig.json`, y por qué no le pasa lo mismo a `@types/lodash`?

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
