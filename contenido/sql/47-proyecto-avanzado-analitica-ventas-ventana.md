# Proyecto avanzado: analítica de ventas con funciones de ventana

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-analitica-de-ventas-con-funciones-de-ventana` (autogenerado del título)
- **Orden:** 470
- **Repositorio:** [github.com/pedroleni/sql-proyectos](https://github.com/pedroleni/sql-proyectos) (carpeta `analitica-ventas-ventana`)
- **Requiere:** Módulo 11 (Funciones de ventana) de este mismo temario

---

## Qué vas a construir

Un panel de analítica que responde a tres preguntas que un `GROUP BY` normal no puede responder solo: ¿quién es el top 2 de CADA categoría (no un ranking global)? ¿cuál es el total acumulado, pedido a pedido, de un cliente? ¿cuánto cambiaron las ventas de un mes al anterior? Las tres, con `ROW_NUMBER`, `SUM() OVER` y `LAG()` reales, contra SQLite.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/sql-proyectos (carpeta analitica-ventas-ventana) — rama main con totalAcumuladoPorCliente, variacionMensual y toda la aplicación completos; solo el ranking de topClientesPorCategoria() está recortado. Rama solucion con el ranking completo."
}
```

## Antes de empezar

### La primera vez que sales del navegador en este temario

Hasta ahora todo este curso se ha podido hacer en el editor SQL
embebido de la propia lección. Este proyecto es distinto: es una
aplicación real, en TypeScript, que corre en tu ordenador. Necesitas:

- **Node.js.** Descarga la versión **LTS** desde [nodejs.org](https://nodejs.org)
  e instálala como cualquier otro programa. Comprueba tu versión con
  `node --version` en una terminal (pide la 20 o superior).
- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`).
- **El código de este proyecto**, de una de estas dos formas:
  - **Con git**: `git clone https://github.com/pedroleni/sql-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/sql-proyectos](https://github.com/pedroleni/sql-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

No hace falta instalar ningún motor de base de datos aparte: usa
`better-sqlite3`, que guarda todo en un fichero local — `npm install`
lo descarga como cualquier otra dependencia.

Luego `cd sql-proyectos/analitica-ventas-ventana` y `npm install` —
cada carpeta de este repositorio es un proyecto independiente con su
propio `package.json`.

### Del cero a los tests pasando, paso a paso

Este proyecto no tiene servidor ni interfaz visual — todo se ve en la
terminal. No hace falta crear ningún archivo nuevo: `src/analitica.ts`
**ya existe**, con la firma de cada función y un `TODO` en
`topClientesPorCategoria()` marcando qué falta escribir; el resto de
`src/` ya está completo.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `analitica-ventas-ventana/`
   de dentro de lo que clonaste (no la del repositorio `sql-proyectos`
   entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   dentro de `src/` verás `analitica.ts` — ábrelo con un clic, no
   crees ninguno.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
5. **Crea y carga la base de datos**: escribe `npm run migrate` y
   pulsa Intro, y luego `npm run seed` — los dos juntos crean y
   rellenan `data/ventas.sqlite` con datos de ejemplo.
6. **Ejecuta los tests**: escribe `npm test` y pulsa Intro — fallan
   al principio, es tu punto de partida.
7. **El ciclo de trabajo**: abre `analitica.ts`, busca el `TODO` en
   `topClientesPorCategoria()`, escribe la implementación, guarda con
   `Cmd`/`Ctrl` + `S`, y vuelve a lanzar `npm test` en la terminal
   para comprobarlo.
8. **Para ver los tres informes con datos reales**, una vez pasen los
   tests: `npm run dev` — imprime los resultados directamente en la
   terminal, no hay nada que abrir en el navegador en este proyecto.

## El punto de partida: todos empatan en el primer puesto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nWITH totales AS (...),\nclasificacion AS (\n  SELECT categoria, cliente_id, cliente_nombre, total,\n    1 AS puesto -- TODO: sustituye por ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY total DESC, cliente_id ASC)\n  FROM totales\n)\nSELECT * FROM clasificacion WHERE puesto <= ?\n</script>",
  "anotaciones": [
    { "fragmento": "1 AS puesto -- TODO", "nota": "Con un valor fijo, TODOS los clientes de cada categoría quedan en el puesto 1 — así que WHERE puesto <= n no filtra nada de verdad: con n=1 devuelve a todo el mundo, no solo al primero." },
    { "fragmento": "WHERE puesto <= ?", "nota": "Esta parte ya está bien — el filtro por la columna de la window function va en la consulta EXTERIOR a la CTE, nunca en el mismo SELECT donde se calcula. Es la misma regla que ya viste en el módulo 11: SQLite no permite filtrar directamente por ROW_NUMBER() en su propio WHERE." }
  ]
}
```

## Compruébalo: qué SÍ funciona ya (el acumulado)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nSELECT id, creado_en, importe,\n  SUM(importe) OVER (\n    ORDER BY creado_en, id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS totalAcumulado\nFROM pedidos\nWHERE cliente_id = ?\n</script>",
  "anotaciones": [
    { "fragmento": "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "nota": "El marco explícito: \"desde el principio de la partición hasta la fila actual\" — por eso cada fila suma su propio importe más el de TODAS las anteriores, en el orden de creado_en. Sin PARTITION BY aquí, porque ya se filtró por un único cliente en el WHERE." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Instala, migra y siembra — sin Docker.", "texto": "Clona sql-proyectos, entra en analitica-ventas-ventana/ y ejecuta npm install, npm run migrate, npm run seed — 4 clientes, 28 pedidos en 3 categorías y varios meses." },
    { "titulo": "Ejecuta los tests tal cual — 2 de 4 deben fallar.", "texto": "Los dos tests de topClientesPorCategoria fallan; los de totalAcumuladoPorCliente y variacionMensual pasan igual, porque no dependen del ranking." },
    { "titulo": "Completa el ROW_NUMBER() y confirma los 4.", "texto": "Sustituye 1 AS puesto por ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY total DESC, cliente_id ASC) y vuelve a correr npm test." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "cliente_id ASC no es decorativo — desempata de forma determinista",
  "contenido": "Si dos clientes de la misma categoría gastaran EXACTAMENTE lo mismo, ORDER BY total DESC por sí solo no garantiza qué orden les toca — SQLite podría devolverlos en cualquier orden, y ese orden podría cambiar entre ejecuciones. Añadir cliente_id ASC como segundo criterio de desempate hace que el resultado sea siempre el mismo, sin importar cuántas veces se ejecute — algo que un test automatizado necesita para no ser intermitente."
}
```

## Retos para ampliarlo

1. Añade `mediaMovilTresMeses(db)` usando `AVG() OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` — la media de los últimos 3 meses (incluido el actual), no solo el mes anterior con LAG.
2. Cambia `topClientesPorCategoria` para usar `RANK()` en vez de `ROW_NUMBER()` y añade un test que demuestre la diferencia real cuando dos clientes empatan en total exacto.
3. Combínalo con el proyecto de reportes con vistas (lección 49): convierte la CTE de `totales` en una vista real, y compara si el resultado de `topClientesPorCategoria` cambia.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "sql-proyectos/analitica-ventas-ventana (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en analitica-ventas-ventana/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/main/analitica-ventas-ventana",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "sql-proyectos/analitica-ventas-ventana (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/solucion/analitica-ventas-ventana",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Window Functions",
      "descripcion": "Referencia oficial de SQLite sobre funciones de ventana, ya usada en el módulo 11 de este track.",
      "url": "https://sqlite.org/windowfunctions.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
