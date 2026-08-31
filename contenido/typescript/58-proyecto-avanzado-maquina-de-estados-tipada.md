# Proyecto avanzado: máquina de estados tipada

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-maquina-de-estados-tipada` (autogenerado del título)
- **Orden:** 580
- **Repositorio:** [github.com/pedroleni/maquina-estados-ts](https://github.com/pedroleni/maquina-estados-ts)
- **Requiere:** Módulo 5 (Narrowing y uniones discriminadas) y Módulo 7 (Genéricos) de este mismo temario

---

## Qué vas a construir

Una máquina de estados finita, genérica y reutilizable — el mismo patrón
que usan librerías como XState, un router, o cualquier flujo con pasos
bien definidos: un pedido, una descarga, un formulario multi-paso. La
pieza que la hace un proyecto de TypeScript de verdad: una transición
inválida no es un `if` que alguien podría olvidar comprobar en tiempo de
ejecución — es, directamente, algo que la tabla de transiciones no puede
ni expresar si te falta un caso.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/maquina-estados-ts — rama main con tipos.ts completo (el diseño del proyecto) y MaquinaEstados.ts con TODO; rama solucion con la implementación completa."
}
```

## El diseño: una tabla de transiciones, tipada en dos niveles

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport type TablaTransiciones<Estado extends string, Evento extends string> = Record<\n  Estado,\n  Partial<Record<Evento, Estado>>\n>;\n\ntype EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';\ntype EventoPedido = 'pagar' | 'enviar' | 'entregar' | 'cancelar';\n\nconst tablaPedido: TablaTransiciones<EstadoPedido, EventoPedido> = {\n  pendiente: { pagar: 'pagado', cancelar: 'cancelado' },\n  pagado: { enviar: 'enviado', cancelar: 'cancelado' },\n  enviado: { entregar: 'entregado' },\n  entregado: {},\n  cancelado: {},\n};\n</script>",
  "anotaciones": [
    { "fragmento": "Record<\n  Estado,\n  Partial<Record<Evento, Estado>>\n>", "nota": "Dos niveles con reglas DISTINTAS a propósito. El exterior es Record (no Partial): obliga a que la tabla tenga una entrada para TODOS los estados posibles. El interior sí es Partial<Record>: cada estado concreto solo acepta ALGUNOS eventos, no todos — 'entregado' no acepta ningún evento más, y {} lo expresa con precisión." },
    { "fragmento": "entregado: {},\n  cancelado: {},", "nota": "Un objeto vacío es una respuesta completa y válida: \"desde aquí, ningún evento produce una transición\" — no hace falta ningún caso especial para \"estado final\", sale gratis de la propia estructura del tipo." }
  ]
}
```

## Comprobado con el compilador real: falta un estado, y no compila

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Quita 'cancelado' de la tabla y observa el error",
  "consigna": "Borra la línea `cancelado: {},` de la tabla y mira el panel de diagnósticos — el mensaje señala exactamente qué estado falta.",
  "html": "<pre id=\"salida\"></pre>",
  "ts": "type TablaTransiciones<Estado extends string, Evento extends string> = Record<\n  Estado,\n  Partial<Record<Evento, Estado>>\n>;\n\ntype EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';\ntype EventoPedido = 'pagar' | 'enviar' | 'entregar' | 'cancelar';\n\nconst tablaPedido: TablaTransiciones<EstadoPedido, EventoPedido> = {\n  pendiente: { pagar: 'pagado', cancelar: 'cancelado' },\n  pagado: { enviar: 'enviado', cancelar: 'cancelado' },\n  enviado: { entregar: 'entregado' },\n  entregado: {},\n  cancelado: {},\n};\n\ndocument.getElementById('salida')!.textContent = JSON.stringify(tablaPedido, null, 2);",
  "pestañaInicial": "ts"
}
```

## La clase genérica: dos parámetros de tipo relacionados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass MaquinaEstados<Estado extends string, Evento extends string> {\n  private readonly tabla: TablaTransiciones<Estado, Evento>;\n  private estadoActual: Estado;\n\n  constructor(tabla: TablaTransiciones<Estado, Evento>, estadoInicial: Estado) {\n    this.tabla = tabla;\n    this.estadoActual = estadoInicial;\n  }\n\n  enviar(evento: Evento): boolean {\n    const siguiente = this.tabla[this.estadoActual][evento];\n    if (siguiente === undefined) return false;\n    this.estadoActual = siguiente;\n    return true;\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "class MaquinaEstados<Estado extends string, Evento extends string> {", "nota": "Dos parámetros de tipo, no uno — Estado y Evento están relacionados a través de TablaTransiciones, pero son conceptos distintos: uno describe DÓNDE está la máquina, el otro QUÉ puede pasar. Separarlos permite que MaquinaEstados sea reutilizable con cualquier par de uniones de literales, no solo con pedidos." },
    { "fragmento": "const siguiente = this.tabla[this.estadoActual][evento];", "nota": "Este acceso encadenado es exactamente indexed access types (Módulo 9) aplicado dos veces seguidas: this.tabla[this.estadoActual] da el objeto de transiciones de ESE estado concreto, y [evento] da el estado siguiente (o undefined) para ESE evento concreto." }
  ]
}
```

## Un gotcha real, encontrado sin buscarlo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nclass MaquinaEstados<Estado extends string, Evento extends string> {\n  constructor(private readonly tabla: TablaTransiciones<Estado, Evento>, estadoInicial: Estado) {\n    this.estadoActual = estadoInicial;\n  }\n}\n// Error: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.\n</script>",
  "despues": "<script>\nclass MaquinaEstados<Estado extends string, Evento extends string> {\n  private readonly tabla: TablaTransiciones<Estado, Evento>;\n\n  constructor(tabla: TablaTransiciones<Estado, Evento>, estadoInicial: Estado) {\n    this.tabla = tabla;\n    this.estadoActual = estadoInicial;\n  }\n}\n</script>",
  "nota": "El mismo gotcha exacto de la lección de erasableSyntaxOnly (Módulo 8), esta vez sin buscarlo: el atajo de parámetro de constructor (private readonly tabla: ...) genera código real (this.tabla = tabla), no solo borra tipos, así que erasableSyntaxOnly lo rechaza. Dos proyectos independientes de este temario han tropezado con esto por costumbre, sin que nadie lo forzara a propósito — la señal más real posible de que merece su propia lección."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar Partial<Record> también en el nivel exterior de la tabla.", "texto": "Pierde la garantía de que todos los estados tengan una entrada — un estado olvidado por error dejaría de dar un error de compilación y pasaría a comportarse como si no tuviera transiciones, sin ningún aviso." },
    { "titulo": "Confundir eventosDisponibles() (qué es válido AHORA) con la lista completa de eventos posibles del tipo Evento.", "texto": "eventosDisponibles() depende del estado actual — desde 'entregado' devuelve un array vacío, aunque EventoPedido siga teniendo cuatro miembros en total." }
  ]
}
```

## Retos para ampliarlo

1. Añade un método `reiniciar(estadoInicial: Estado)` a `MaquinaEstados`.
2. Diseña una tabla de transiciones para un semáforo (`rojo | amarillo | verde`) y una demo aparte que la use.
3. Añade un callback opcional `alEntrar` al constructor, tipado para que reciba exactamente el `Estado` al que se acaba de entrar.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "maquina-estados-ts (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/maquina-estados-ts/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "maquina-estados-ts (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/maquina-estados-ts/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Indexed Access Types",
      "descripcion": "Documentación oficial del mecanismo detrás de tabla[estado][evento].",
      "url": "https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
