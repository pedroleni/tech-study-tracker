# Proyecto: lista de tareas tipada, de cero

- **Módulo:** Proyectos
- **Slug:** `proyecto-lista-de-tareas-tipada` (autogenerado del título)
- **Orden:** 53
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
