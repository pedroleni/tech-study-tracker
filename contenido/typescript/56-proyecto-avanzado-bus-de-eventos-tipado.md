# Proyecto avanzado: bus de eventos tipado

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-bus-de-eventos-tipado` (autogenerado del título)
- **Orden:** 560
- **Repositorio:** [github.com/pedroleni/typescript-proyectos](https://github.com/pedroleni/typescript-proyectos) (carpeta `bus-eventos`)
- **Requiere:** Módulos 5 (Narrowing), 7 (Genéricos) y 9 (Operadores de manipulación de tipos) de este mismo temario

---

## Qué vas a construir

Un bus de eventos — el patrón publish/subscribe que ya usan `EventTarget`
del navegador, `EventEmitter` de Node.js, o cualquier librería de UI con
eventos personalizados. La parte que lo hace un proyecto de TypeScript, y
no solo de JavaScript con tipos añadidos por encima: el **nombre** del
evento determina, vía tipos, la forma exacta de su payload — sin `any`,
sin casts, con autocompletado real.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/typescript-proyectos (carpeta bus-eventos) — rama main con tipos.ts completo (el diseño del proyecto) y EventBus.ts con TODO; rama solucion con la implementación completa."
}
```

## El problema real: un `EventEmitter` normal no sabe qué forma tiene cada evento

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Un emisor de eventos \"a la JavaScript\": cualquier string, cualquier payload\nemisor.on('contador:incrementado', (payload) => {\n  console.log(payload.valor.toFixed(2)); // payload es any - ¿tiene .valor? ¿es number? nadie lo sabe hasta ejecutar\n});\nemisor.emit('contador:incrementado', { valor: 'cinco' }); // compila igual, explota en tiempo de ejecución\n</script>",
  "despues": "<script>\ninterface MapaEventos {\n  'contador:incrementado': { valor: number };\n}\n\nbus.on('contador:incrementado', (payload) => {\n  console.log(payload.valor.toFixed(2)); // payload: { valor: number }, inferido, sin cast\n});\nbus.emit('contador:incrementado', { valor: 'cinco' });\n// Error de compilación: Type 'string' is not assignable to type 'number'.\n</script>",
  "nota": "La diferencia no es \"añadir tipos por encima\" — es que el nombre del evento (un tipo LITERAL) decide, a través de un genérico con keyof, exactamente qué forma tiene el payload en ESE punto concreto del código. Narrowing (Módulo 5) y operadores de manipulación de tipos (Módulo 9) trabajando juntos, no cada uno por separado."
}
```

## El diseño: MapaEventos como única fuente de verdad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport interface MapaEventos {\n  'contador:incrementado': { valor: number };\n  'contador:reiniciado': Record<string, never>;\n  'usuario:conectado': { nombre: string; hora: Date };\n}\n\nexport type Manejador<Payload> = (payload: Payload) => void;\n</script>",
  "anotaciones": [
    { "fragmento": "export interface MapaEventos {", "nota": "Todo el proyecto gira alrededor de este único tipo — cada clave es un nombre de evento real, cada valor es la forma exacta de su payload. Añadir un evento nuevo al proyecto significa añadir una línea aquí, nunca más." },
    { "fragmento": "'contador:reiniciado': Record<string, never>;", "nota": "Un evento sin datos reales se tipa como un objeto que no puede tener ninguna propiedad con valor — Record<string, never> en vez de un any o un {} suelto, para que emit('contador:reiniciado', {}) sea la única forma válida de emitirlo." }
  ]
}
```

## La firma genérica que enlaza evento y payload

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass EventBus<EventMap extends object> {\n  private manejadores: { [Evento in keyof EventMap]?: Set<Manejador<EventMap[Evento]>> } = {};\n\n  on<Evento extends keyof EventMap>(\n    evento: Evento,\n    manejador: Manejador<EventMap[Evento]>,\n  ): () => void {\n    // ...\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "private manejadores: { [Evento in keyof EventMap]?: Set<Manejador<EventMap[Evento]>> } = {};", "nota": "Un mapped type (Módulo 11): recorre cada clave de EventMap y construye, para cada una, el tipo exacto de Set que le corresponde — Set<Manejador<{ valor: number }>> para 'contador:incrementado', Set<Manejador<{ nombre: string; hora: Date }>> para 'usuario:conectado', cada uno distinto, generado automáticamente." },
    { "fragmento": "on<Evento extends keyof EventMap>(\n    evento: Evento,\n    manejador: Manejador<EventMap[Evento]>,\n  ): () => void {", "nota": "Evento extends keyof EventMap liga el segundo parámetro al primero: en cuanto TypeScript sabe qué literal concreto es evento, EventMap[Evento] (indexed access, Módulo 9) resuelve el tipo exacto del payload — el mismo patrón de obtenerPropiedad del Módulo 9, aplicado aquí a eventos." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El registro de eventos de la demo prueba la inferencia en vivo.", "texto": "Clona typescript-proyectos, entra en bus-eventos/, abre src/main.ts, y comprueba que el payload de cada 'on' tiene el tipo correcto sin ninguna anotación explícita — el editor te lo muestra al pasar el ratón por encima." },
    { "titulo": "Rompe algo a propósito.", "texto": "Cambia bus.emit('contador:incrementado', { valor: 5 }) por { valor: '5' } y ejecuta npm run typecheck — verás el error exacto, antes de ejecutar nada." }
  ]
}
```

## Un gotcha real de tipos: `Record<string, unknown>` no es lo que parece

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nclass EventBus<EventMap extends Record<string, unknown>> {\n  // ...\n}\n// Error real al usarlo con MapaEventos:\n// Type 'MapaEventos' does not satisfy the constraint 'Record<string, unknown>'.\n// Index signature for type 'string' is missing in type 'MapaEventos'.\n</script>",
  "despues": "<script>\nclass EventBus<EventMap extends object> {\n  // ...\n}\n// MapaEventos (claves cerradas, sin index signature) sí satisface 'object'\n</script>",
  "nota": "Este fue el primer intento real de este proyecto, y no compiló. Record<string, unknown> exige que el tipo acepte CUALQUIER clave string — un mapa de eventos cerrado, con nombres concretos y sin index signature, no cumple eso, aunque parezca que \"debería\" encajar. El fix real: restringir con extends object (o sin restricción), no con Record — un mapa de eventos es, a propósito, un conjunto cerrado, no un diccionario abierto."
}
```

## Otro bug real: los tipos no evitan todos los bugs

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El botón \"Reiniciar\" no actualizaba el número en pantalla",
  "contenido": "Al construir la demo, reiniciar ponía valor = 0 y emitía 'contador:reiniciado' — pero ningún manejador de ese evento actualizaba el DOM. Compilaba perfectamente: el sistema de tipos no tiene forma de saber que \"reiniciar el estado\" y \"repintar la pantalla\" son dos pasos distintos que hacían falta los dos. Un recordatorio real: los tipos evitan una categoría entera de bugs (formas incorrectas), no cualquier bug."
}
```

## Retos para ampliarlo

1. Añade un método `once(evento, manejador)` que se autocancele después de la primera vez que se dispare.
2. Añade un evento nuevo a `MapaEventos` (por ejemplo, `'tema:cambiado': { modo: 'claro' | 'oscuro' }`) y su UI correspondiente en `main.ts`.
3. Tipa un método `emitAsync` que espere (con `Promise.all`) a que todos los manejadores que devuelvan una `Promise` terminen antes de resolver.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "typescript-proyectos/bus-eventos (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en bus-eventos/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/typescript-proyectos/tree/main/bus-eventos",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "typescript-proyectos/bus-eventos (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/typescript-proyectos/tree/solucion/bus-eventos",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Mapped Types",
      "descripcion": "Documentación oficial del mecanismo detrás de la tabla interna de manejadores.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
