# Proyecto: lista de tareas tipada, de cero

- **Módulo:** Proyectos
- **Slug:** `proyecto-lista-de-tareas-tipada` (autogenerado del título)
- **Orden:** 530
- **Fuentes:** Aplicación directa de los Módulos 2-5 de este temario (tipos primitivos, objetos, uniones, narrowing y uniones discriminadas) — ver `contenido/typescript/TEMARIO.md` #53

---

## Qué vas a construir

Una lista de tareas pequeña, pensada para aplicar de golpe lo que ya viste en los cinco primeros módulos: una `Tarea` bien tipada, un estado de la lista completa modelado con una unión discriminada (en vez de campos sueltos), y funciones que usan narrowing de verdad para trabajar con ese estado sin ningún `any` de por medio.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto se hace aquí mismo, en el navegador — no hace falta instalar nada",
  "contenido": "A diferencia de los \"proyecto avanzado\" de más adelante, este NO necesita VS Code, terminal, ni clonar ningún repositorio. Cada bloque \"EDITOR EN VIVO\" de abajo es un editor real: pestañas HTML/TypeScript arriba, tu código en medio, y \"Vista previa\" debajo, que se actualiza sola mientras escribes — no hay ningún botón de \"ejecutar\". Escribe en la pestaña que toque, sustituyendo los comentarios que ya están puestos como guía. Si algo se rompe, \"Reiniciar\" (arriba a la derecha del bloque) te devuelve al punto de partida."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Antes de escribir código",
  "contenido": "Diseña primero los tipos, en prosa o en un papel: ¿qué campos tiene una Tarea? ¿Qué estados puede tener la lista completa (vacía, con tareas, filtrando por completadas...)? El diseño de tipos ANTES de la implementación es, en sí mismo, la parte más importante de este ejercicio."
}
```

### Si prefieres hacerlo en tu propio ordenador, con VS Code

Puedes hacer este mismo proyecto fuera del navegador, en un editor real. Aquí hay un paso extra respecto a los proyectos de JavaScript: el navegador no entiende `.ts` directamente, así que hace falta compilarlo a `.js` antes de poder verlo.

1. **Instala Node.js** si todavía no lo tienes: versión **LTS** desde [nodejs.org](https://nodejs.org).
2. **Crea una carpeta** en tu ordenador con el nombre que quieras para este proyecto.
3. **Ábrela en VS Code**: menú `Archivo` → `Abrir carpeta...`.
4. **Crea dos archivos**: `index.html` y `script.ts` — el nombre `script.ts` importa, es el que compilas en un paso posterior.
5. **Escribe en `index.html` la estructura completa** que ya viste en el temario de HTML (doctype, `html`, `head` con charset y viewport, `body`) — el editor en vivo de abajo te la esconde por ti, pero en un archivo real hace falta escribirla. Fíjate en que el `<script>` apunta a `script.js` y no a `script.ts` — el navegador nunca ejecuta TypeScript directamente, solo el archivo ya compilado:
   ```html
   <!doctype html>
   <html lang="es">
     <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>Lista de tareas tipada</title>
     </head>
     <body>
       <!-- El código de la pestaña HTML de abajo va aquí dentro -->

       <script src="script.js"></script>
     </body>
   </html>
   ```
6. **Copia el código de partida** de la pestaña TypeScript del editor en vivo de abajo dentro de `script.ts`.
7. **Abre la terminal integrada**: menú `Terminal` → `New Terminal` (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
8. **Compila en modo vigilancia**: escribe `npx tsc script.ts --watch` y pulsa Intro — deja esta terminal abierta; cada vez que guardes `script.ts`, genera un `script.js` actualizado solo.
9. **Abre una SEGUNDA terminal** (icono `+` en el panel), y en esa sirve la carpeta: `npx serve .` — abre en el navegador la URL que imprima.
10. **El ciclo de trabajo**: edita `script.ts`, guarda con `Cmd`/`Ctrl` + `S` — la primera terminal recompila sola a `script.js` — y refresca el navegador para ver el cambio.

## El tipo Tarea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "readonly id: number;", "nota": "El id no debería cambiar nunca después de crear la tarea — readonly lo hace explícito y lo comprueba el compilador." }
  ]
}
```

## El estado de la lista, como unión discriminada

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Resiste la tentación de usar un array vacío como \"estado vacío\"",
  "contenido": "Un array vacío ([]) ya representa \"sin tareas\" de forma natural — pero para practicar el patrón del Módulo 5, modela el estado completo como una unión discriminada con al menos dos casos: { estado: 'vacia' } y { estado: 'con-tareas'; tareas: Tarea[] }. Es más código del estrictamente necesario para este caso concreto, pero es exactamente la práctica deliberada que este ejercicio busca."
}
```

## Pruébalo tú

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Implementa la lista de tareas",
  "consigna": "Completa la unión EstadoLista, la función agregarTarea (que recibe el estado actual y un título, y devuelve el nuevo estado) y una función renderizar que use un switch exhaustivo (con casoImposible) sobre el discriminante. El resultado se pinta en la vista previa, no solo en la consola.",
  "html": "<pre id=\"salida\"></pre>",
  "ts": "interface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\n// TODO: define EstadoLista como unión discriminada\n// con al menos 'vacia' y 'con-tareas'\ntype EstadoLista = { estado: 'vacia' }; // amplía esta unión\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\n// TODO: implementa agregarTarea\nfunction agregarTarea(estado: EstadoLista, titulo: string): EstadoLista {\n  return estado; // sustituye esto\n}\n\n// TODO: implementa renderizar con un switch exhaustivo\nfunction renderizar(estado: EstadoLista): string {\n  switch (estado.estado) {\n    case 'vacia':\n      return 'No hay tareas todavía';\n    default:\n      return casoImposible(estado);\n  }\n}\n\nlet estado: EstadoLista = { estado: 'vacia' };\nestado = agregarTarea(estado, 'Comprar leche');\ndocument.getElementById('salida')!.textContent = renderizar(estado);",
  "pestañaInicial": "ts"
}
```

## Retos para ampliarlo

1. Añade un tercer estado `'filtrando'` que solo muestre las tareas completadas o solo las pendientes, con un campo `filtro: 'completadas' | 'pendientes'`.
2. Escribe una función `contarPendientes(estado: EstadoLista): number` que use narrowing para devolver 0 en el caso `'vacia'`.
3. Añade una cuarta interfaz `TareaConFecha extends Tarea` con un campo `fechaLimite: Date`, y una función que ordene las tareas por fecha.

## Solución

Si te atascaste o quieres comparar tu enfoque, aquí tienes una solución real de cada parte — todas verificadas con `tsc --strict`, sin ningún `any`.

### "Pruébalo tú", resuelto

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución de \"Implementa la lista de tareas\"",
  "consigna": "La unión EstadoLista ya tiene sus dos variantes, agregarTarea crea una tarea real y renderizar cubre ambos casos — el switch exhaustivo compila porque, ahora sí, hay algo real que agotar. Cambia el código y comprueba que el error de tipos desaparece.",
  "html": "<pre id=\"salida\"></pre>",
  "ts": "interface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\ntype EstadoLista =\n  | { estado: 'vacia' }\n  | { estado: 'con-tareas'; tareas: Tarea[] };\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction agregarTarea(estado: EstadoLista, titulo: string): EstadoLista {\n  const nuevaTarea: Tarea = { id: Date.now(), titulo, completada: false };\n  const tareasActuales = estado.estado === 'vacia' ? [] : estado.tareas;\n  return { estado: 'con-tareas', tareas: [...tareasActuales, nuevaTarea] };\n}\n\nfunction renderizar(estado: EstadoLista): string {\n  switch (estado.estado) {\n    case 'vacia':\n      return 'No hay tareas todavía';\n    case 'con-tareas':\n      return estado.tareas.map((t) => `- ${t.titulo}`).join('\\n');\n    default:\n      return casoImposible(estado);\n  }\n}\n\nlet estado: EstadoLista = { estado: 'vacia' };\nestado = agregarTarea(estado, 'Comprar leche');\nestado = agregarTarea(estado, 'Sacar la basura');\ndocument.getElementById('salida')!.textContent = renderizar(estado);",
  "pestañaInicial": "ts"
}
```

### Los tres retos, resueltos

**Reto 1 — un tercer estado `'filtrando'`:**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\ntype EstadoLista =\n  | { estado: 'vacia' }\n  | { estado: 'con-tareas'; tareas: Tarea[] }\n  | { estado: 'filtrando'; tareas: Tarea[]; filtro: 'completadas' | 'pendientes' };\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction renderizar(estado: EstadoLista): string {\n  switch (estado.estado) {\n    case 'vacia':\n      return 'No hay tareas todavía';\n    case 'con-tareas':\n      return estado.tareas.map((t) => `- ${t.titulo}`).join('\\n');\n    case 'filtrando': {\n      const visibles = estado.tareas.filter((t) =>\n        estado.filtro === 'completadas' ? t.completada : !t.completada,\n      );\n      return visibles.map((t) => `- ${t.titulo}`).join('\\n');\n    }\n    default:\n      return casoImposible(estado);\n  }\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "| { estado: 'filtrando'; tareas: Tarea[]; filtro: 'completadas' | 'pendientes' }",
      "nota": "Un tercer miembro de la unión, con su propio campo filtro — TypeScript exige que renderizar cubra este caso también, o casoImposible vuelve a fallar."
    },
    {
      "fragmento": "case 'filtrando': {\n      const visibles = estado.tareas.filter((t) =>\n        estado.filtro === 'completadas' ? t.completada : !t.completada,\n      );\n      return visibles.map((t) => `- ${t.titulo}`).join('\\n');\n    }",
      "nota": "Dentro de este case, TypeScript ya sabe que estado tiene tareas y filtro — el narrowing del switch se aplica también a las ramas nuevas, no solo a las originales."
    }
  ]
}
```

**Reto 2 — `contarPendientes` con narrowing:**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\ntype EstadoLista =\n  | { estado: 'vacia' }\n  | { estado: 'con-tareas'; tareas: Tarea[] };\n\nfunction contarPendientes(estado: EstadoLista): number {\n  if (estado.estado === 'vacia') return 0;\n  return estado.tareas.filter((t) => !t.completada).length;\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "if (estado.estado === 'vacia') return 0;",
      "nota": "Narrowing de verdad: tras este if, TypeScript ya sabe que en el resto de la función estado es la variante con-tareas — puede acceder a estado.tareas sin comprobarlo de nuevo ni usar un cast."
    }
  ]
}
```

**Reto 3 — `TareaConFecha` y ordenar por fecha:**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\ninterface TareaConFecha extends Tarea {\n  fechaLimite: Date;\n}\n\nfunction ordenarPorFecha(tareas: TareaConFecha[]): TareaConFecha[] {\n  return [...tareas].sort((a, b) => a.fechaLimite.getTime() - b.fechaLimite.getTime());\n}\n</script>",
  "anotaciones": [
    {
      "fragmento": "interface TareaConFecha extends Tarea {\n  fechaLimite: Date;\n}",
      "nota": "extends reutiliza los tres campos de Tarea (id, titulo, completada) y añade fechaLimite — sin repetirlos a mano ni arriesgarse a que las dos interfaces se desincronicen."
    },
    {
      "fragmento": "return [...tareas].sort((a, b) => a.fechaLimite.getTime() - b.fechaLimite.getTime());",
      "nota": "El spread [...tareas] copia el array antes de ordenar — sort muta el array original, y una función que ordena no debería tener el efecto secundario de reordenar los datos de quien la llama."
    }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Módulos de este temario que aplica este proyecto",
  "recursos": [
    {
      "titulo": "Uniones discriminadas: el patrón central de TypeScript",
      "descripcion": "El patrón central que este proyecto pone en práctica.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
