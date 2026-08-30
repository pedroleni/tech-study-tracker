# Módulos ES en TypeScript: import/export tipados

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `modulos-es-en-typescript` (autogenerado del título)
- **Orden:** 48
- **Fuentes:** [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) + [Modules — Introduction](https://www.typescriptlang.org/docs/handbook/modules/introduction.html) — ver `contenido/typescript/TEMARIO.md` #48

---

## Qué es y para qué sirve

Los módulos ES (`import`/`export`) funcionan exactamente igual en TypeScript que en JavaScript — la diferencia es que, al importar algo de otro fichero, TypeScript también trae consigo su tipo completo. Un tipo o interfaz exportado desde un módulo se puede importar en otro exactamente igual que una función o una clase.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// tipos.ts\nexport interface Usuario {\n  id: number;\n  nombre: string;\n}\n\nexport function crearUsuario(nombre: string): Usuario {\n  return { id: Date.now(), nombre };\n}\n\n// main.ts\nimport { crearUsuario, type Usuario } from './tipos';\n\nconst usuario: Usuario = crearUsuario('Ada');\n</script>",
  "anotaciones": [
    { "fragmento": "import { crearUsuario, type Usuario } from './tipos';", "nota": "import { type Usuario } marca explícitamente que Usuario se importa SOLO como tipo, no como valor — útil para que herramientas de compilación que procesan un fichero a la vez sepan con certeza que esa importación se puede eliminar del todo al compilar (no genera ningún código, a diferencia de crearUsuario, que sí es una función real)." }
  ]
}
```

## export type frente a export normal

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los tipos no generan código, aunque se exporten igual que los valores",
  "contenido": "export interface Usuario {...} no produce absolutamente nada en el JavaScript compilado — las interfaces (y los tipos en general) existen solo en tiempo de compilación. export type { Usuario } (con la palabra type explícita) deja aún más claro, para quien lee el código o para herramientas automáticas, que esa exportación en concreto es \"solo tipos\"."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Importar un tipo sin la palabra type cuando isolatedModules está activo (Vite, esbuild).", "texto": "Algunas herramientas que compilan un fichero a la vez necesitan saber, sin analizar el resto del proyecto, qué importaciones son solo tipos — sin la anotación explícita, pueden generar código incorrecto o directamente fallar." },
    { "titulo": "Pensar que exportar una interfaz añade algo al JavaScript generado.", "texto": "Las interfaces y los tipos se eliminan por completo al compilar — solo las funciones, clases y valores reales generan código." }
  ]
}
```

## Ejercicios

1. Declara un tipo `Coordenada` en un fichero (en prosa, describiendo el fichero), y una función que lo use, exportando ambos.
2. Explica qué diferencia práctica hay entre `import { Usuario }` e `import { type Usuario }`.
3. ¿Por qué exportar una interfaz no añade ningún código al JavaScript final?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Modules",
      "descripcion": "Capítulo del Handbook sobre módulos ES en TypeScript.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/modules.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Modules — Introduction",
      "descripcion": "Introducción de la referencia de módulos, con más detalle sobre import type.",
      "url": "https://www.typescriptlang.org/docs/handbook/modules/introduction.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
