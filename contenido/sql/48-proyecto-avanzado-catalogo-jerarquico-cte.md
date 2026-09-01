# Proyecto avanzado: catálogo jerárquico con CTE recursiva

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-catalogo-jerarquico-con-cte-recursiva` (autogenerado del título)
- **Orden:** 480
- **Repositorio:** [github.com/pedroleni/sql-proyectos-avanzados](https://github.com/pedroleni/sql-proyectos-avanzados) (carpeta `catalogo-jerarquico-cte`)
- **Requiere:** la lección 23 (CTEs recursivas) y el Módulo 8 (Índices y rendimiento) de este mismo temario

---

## Qué vas a construir

Un catálogo de productos organizado en un árbol de categorías sin límite de profundidad ("Electrónica > Informática > Portátiles > Gaming"). Recorrer TODO el subárbol desde cualquier punto se hace con una CTE recursiva real — no con bucles en TypeScript, no con N consultas — más una demostración real, con `EXPLAIN QUERY PLAN`, de un límite real de los índices normales.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/sql-proyectos-avanzados (carpeta catalogo-jerarquico-cte) — rama main con productosDeCategoriaYSubcategorias, la búsqueda y toda la aplicación completos; solo el término recursivo de descendientesDeCategoria() falta. Rama solucion con la CTE completa."
}
```

## El punto de partida: una CTE sin la parte recursiva

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nWITH RECURSIVE arbol(id, nombre, categoria_padre_id) AS (\n  SELECT id, nombre, categoria_padre_id\n  FROM categorias\n  WHERE id = ?\n  -- TODO: falta\n  --   UNION ALL\n  --   SELECT c.id, c.nombre, c.categoria_padre_id\n  --   FROM categorias AS c\n  --   JOIN arbol AS a ON c.categoria_padre_id = a.id\n)\nSELECT id, nombre, categoria_padre_id FROM arbol\n</script>",
  "anotaciones": [
    { "fragmento": "SELECT id, nombre, categoria_padre_id\n  FROM categorias\n  WHERE id = ?", "nota": "Esto es solo el CASO BASE — la categoría de partida, ella sola. WITH RECURSIVE sin ningún UNION ALL es SQL válido (se ejecuta sin error), pero nunca añade ningún hijo: por eso descendientesDeCategoria(hijo) solo devuelve al propio hijo, nunca al nieto." },
    { "fragmento": "JOIN arbol AS a ON c.categoria_padre_id = a.id", "nota": "El término que falta se une A SÍ MISMO (a la CTE arbol) — cada vuelta encuentra las categorías cuyo padre YA está en el árbol acumulado hasta ahora, y las añade. SQLite repite esto hasta que una vuelta no encuentra ninguna fila nueva." }
  ]
}
```

## Lo que ya funciona: por qué un índice no siempre acelera un LIKE

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "productos_nombre_idx no ayuda a WHERE nombre LIKE '%texto%'",
  "contenido": "src/busqueda.ts ya trae planDeBusqueda(), que ejecuta EXPLAIN QUERY PLAN de verdad — y los tests confirman que, ANTES y DESPUÉS de crear el índice sobre nombre, el plan sigue siendo un SCAN completo de la tabla. Un índice B-tree normal ordena valores por prefijo; un comodín % al PRINCIPIO del patrón (buscar 'texto' en cualquier posición) hace que ese orden no sirva de nada — solo un LIKE 'texto%' (comodín solo al final) podría aprovecharlo."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Instala, migra y siembra — sin Docker.", "texto": "Clona sql-proyectos-avanzados, entra en catalogo-jerarquico-cte/ y ejecuta npm install, npm run migrate, npm run seed — un árbol de 3 niveles con productos repartidos en varias hojas." },
    { "titulo": "Ejecuta los tests tal cual — 2 de 7 deben fallar.", "texto": "Los dos tests que recorren el árbol desde la raíz o desde un nodo intermedio fallan (no llegan a los nietos); los de productos y búsqueda pasan igual." },
    { "titulo": "Completa el término recursivo y confirma los 7.", "texto": "Añade el UNION ALL con el JOIN a la propia CTE, tal como se indica en el comentario TODO del código, y vuelve a correr npm test." }
  ]
}
```

## Retos para ampliarlo

1. Añade `profundidadDe(db, categoriaId)` que use la misma CTE recursiva pero acumulando un contador de nivel en cada vuelta (columna adicional en la CTE), para saber a cuántos niveles de la raíz está una categoría.
2. Combínalo con la lección de índices por expresión (módulo 8): crea un índice sobre `lower(nombre)` y compara el plan de una búsqueda `WHERE lower(nombre) = lower(?)` (coincidencia exacta, sin comodines) frente al LIKE de este proyecto.
3. Añade una restricción real: una categoría no puede ser su propio ancestro (ciclo). Escribe un test que intente crear un ciclo a mano (actualizando `categoria_padre_id` de una categoría para que apunte a uno de sus propios descendientes) y confirma qué pasa si `descendientesDeCategoria` se ejecuta sobre ese árbol roto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "sql-proyectos-avanzados/catalogo-jerarquico-cte (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en catalogo-jerarquico-cte/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/sql-proyectos-avanzados/tree/main/catalogo-jerarquico-cte",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "sql-proyectos-avanzados/catalogo-jerarquico-cte (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/sql-proyectos-avanzados/tree/solucion/catalogo-jerarquico-cte",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "The WITH Clause",
      "descripcion": "Referencia oficial de SQLite sobre CTEs, incluidas las recursivas.",
      "url": "https://sqlite.org/lang_with.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
