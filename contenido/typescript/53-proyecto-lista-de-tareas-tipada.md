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
  "titulo": "Antes de escribir código",
  "contenido": "Diseña primero los tipos, en prosa o en un papel: ¿qué campos tiene una Tarea? ¿Qué estados puede tener la lista completa (vacía, con tareas, filtrando por completadas...)? El diseño de tipos ANTES de la implementación es, en sí mismo, la parte más importante de este ejercicio."
}
```

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
  "consigna": "Completa la unión EstadoLista, la función agregarTarea (que recibe el estado actual y un título, y devuelve el nuevo estado) y una función renderizar que use un switch exhaustivo (con casoImposible) sobre el discriminante.",
  "ts": "interface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\n// TODO: define EstadoLista como unión discriminada\n// con al menos 'vacia' y 'con-tareas'\ntype EstadoLista = { estado: 'vacia' }; // amplía esta unión\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\n// TODO: implementa agregarTarea\nfunction agregarTarea(estado: EstadoLista, titulo: string): EstadoLista {\n  return estado; // sustituye esto\n}\n\n// TODO: implementa renderizar con un switch exhaustivo\nfunction renderizar(estado: EstadoLista): string {\n  switch (estado.estado) {\n    case 'vacia':\n      return 'No hay tareas todavía';\n    default:\n      return casoImposible(estado);\n  }\n}\n\nlet estado: EstadoLista = { estado: 'vacia' };\nestado = agregarTarea(estado, 'Comprar leche');\nconsole.log(renderizar(estado));",
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
  "ts": "interface Tarea {\n  readonly id: number;\n  titulo: string;\n  completada: boolean;\n}\n\ntype EstadoLista =\n  | { estado: 'vacia' }\n  | { estado: 'con-tareas'; tareas: Tarea[] };\n\nfunction casoImposible(valor: never): never {\n  throw new Error(`Caso no gestionado: ${JSON.stringify(valor)}`);\n}\n\nfunction agregarTarea(estado: EstadoLista, titulo: string): EstadoLista {\n  const nuevaTarea: Tarea = { id: Date.now(), titulo, completada: false };\n  const tareasActuales = estado.estado === 'vacia' ? [] : estado.tareas;\n  return { estado: 'con-tareas', tareas: [...tareasActuales, nuevaTarea] };\n}\n\nfunction renderizar(estado: EstadoLista): string {\n  switch (estado.estado) {\n    case 'vacia':\n      return 'No hay tareas todavía';\n    case 'con-tareas':\n      return estado.tareas.map((t) => `- ${t.titulo}`).join('\\n');\n    default:\n      return casoImposible(estado);\n  }\n}\n\nlet estado: EstadoLista = { estado: 'vacia' };\nestado = agregarTarea(estado, 'Comprar leche');\nconsole.log(renderizar(estado));",
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
