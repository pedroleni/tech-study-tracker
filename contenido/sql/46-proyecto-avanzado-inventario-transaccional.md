# Proyecto avanzado: inventario transaccional

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-inventario-transaccional` (autogenerado del título)
- **Orden:** 460
- **Repositorio:** [github.com/pedroleni/sql-proyectos](https://github.com/pedroleni/sql-proyectos) (carpeta `inventario-transaccional`)
- **Requiere:** Módulo 9 (Transacciones) de este mismo temario

---

## Qué vas a construir

Un sistema de inventario con varios almacenes donde transferir stock de uno a otro es una operación ATÓMICA de verdad — o se descuenta del origen, se suma al destino y se registra el movimiento LOS TRES A LA VEZ, o no pasa nada de eso — contra SQLite real (vía `better-sqlite3`, sin Docker: es un fichero).

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/sql-proyectos (carpeta inventario-transaccional) — rama main con el esquema (incluido el CHECK cantidad >= 0) y toda la aplicación completos; solo la comprobación de stock suficiente al principio de transferirStock() está recortada. Rama solucion con la comprobación completa."
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

Luego `cd sql-proyectos/inventario-transaccional` y `npm install` —
cada carpeta de este repositorio es un proyecto independiente con su
propio `package.json`.

### Del cero a los tests pasando, paso a paso

Este proyecto no tiene servidor ni interfaz visual — todo se ve en la
terminal, incluidos los tests. No hace falta crear ningún archivo
nuevo: `src/inventario.ts` **ya existe**, con la firma de cada función
y un `TODO` en `transferirStock()` marcando qué falta escribir;
`src/db.ts` ya está completo.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `inventario-transaccional/`
   de dentro de lo que clonaste (no la del repositorio `sql-proyectos`
   entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   dentro de `src/` verás `inventario.ts` — ábrelo con un clic, no
   crees ninguno. En `migrations/` verás el esquema SQL, ya completo.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
5. **Crea la base de datos**: escribe `npm run migrate` y pulsa
   Intro — crea `db.sqlite` en la raíz del proyecto aplicando el
   esquema de `migrations/`.
6. **Ejecuta los tests**: escribe `npm test` y pulsa Intro — fallan
   al principio, es tu punto de partida. Cada test migra su propia
   base de datos temporal, así que no hace falta repetir el paso 5
   entre ejecuciones.
7. **El ciclo de trabajo**: abre `inventario.ts`, busca el `TODO` en
   `transferirStock()`, escribe la implementación, guarda con
   `Cmd`/`Ctrl` + `S`, y vuelve a lanzar `npm test` en la terminal
   para comprobarlo — el resultado (verde o rojo) aparece ahí mismo,
   no hay nada que abrir en el navegador en este proyecto.

## El punto de partida: sin comprobación explícita, el error se vuelve genérico

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst ejecutarTransferencia = db.transaction(() => {\n  // TODO: falta comprobar existenciaDe(...) antes de escribir nada\n  db.prepare('UPDATE existencias SET cantidad = cantidad - @cantidad WHERE ...').run(datos);\n  db.prepare('INSERT INTO existencias (...) VALUES (...) ON CONFLICT DO UPDATE ...').run(datos);\n  db.prepare('INSERT INTO movimientos (...) VALUES (...)').run(datos);\n});\n</script>",
  "anotaciones": [
    { "fragmento": "// TODO: falta comprobar existenciaDe(...) antes de escribir nada", "nota": "Sin la comprobación, un intento de transferir más stock del disponible deja que sea el CHECK (cantidad >= 0) de la migración quien lo rechace directamente — y entonces npm test recibe un SqliteError genérico, no el StockInsuficienteError con los datos reales (disponible, solicitado) que la aplicación necesita mostrar." },
    { "fragmento": "const ejecutarTransferencia = db.transaction(() => {", "nota": "Esta parte SÍ está completa: db.transaction() (la API nativa de better-sqlite3, no BEGIN/COMMIT escritos a mano) envuelve las tres escrituras — si cualquiera falla, ninguna de las tres queda aplicada." }
  ]
}
```

## Por qué la transacción, por sí sola, no basta

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Atómico no es lo mismo que \"con el mensaje de error correcto\"",
  "contenido": "db.transaction() ya garantiza que un fallo a mitad de camino no deja datos a medias — eso funciona incluso en la versión recortada de este proyecto. Lo que falta no es atomicidad: es DIAGNÓSTICO. Dejar que el CHECK constraint sea la única defensa significa que la aplicación solo sabe \"algo de SQLite falló\", no \"faltaban 94 unidades en el almacén 3\" — la diferencia entre un error que un usuario puede entender y uno que no."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Instala y migra — sin Docker, sin servidor.", "texto": "Clona sql-proyectos, entra en inventario-transaccional/ y ejecuta npm install, npm run migrate — crea db.sqlite en la raíz del proyecto con el esquema completo, incluido el CHECK cantidad >= 0." },
    { "titulo": "Ejecuta los tests tal cual — 1 de 5 debe fallar.", "texto": "El test de stock insuficiente falla (espera StockInsuficienteError, recibe un error genérico de SQLite); los otros 4 pasan igual, porque no dependen de esa comprobación." },
    { "titulo": "Completa la comprobación y confirma los 5.", "texto": "Usa existenciaDe(db, productoId, almacenOrigenId) (ya existe en el mismo fichero) para comparar contra la cantidad solicitada ANTES de escribir nada, y lanza StockInsuficienteError con los datos reales si no alcanza." }
  ]
}
```

## Retos para ampliarlo

1. Añade un `historialCompleto(db)` que liste TODOS los movimientos de TODOS los productos, con paginación (LIMIT/OFFSET), reutilizando lo visto en el módulo 2 de este track.
2. Añade una función `stockTotalDeProducto(db, productoId)` que sume las existencias de un producto en TODOS los almacenes con un solo GROUP BY, en vez de sumar en TypeScript tras varias consultas.
3. Añade un SAVEPOINT manual (módulo 9, lección 38) dentro de una transferencia que involucre 3 almacenes a la vez, para poder deshacer solo el último paso si falla, sin perder los anteriores.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "sql-proyectos/inventario-transaccional (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en inventario-transaccional/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/main/inventario-transaccional",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "sql-proyectos/inventario-transaccional (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/solucion/inventario-transaccional",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Transaction",
      "descripcion": "Referencia oficial de SQLite sobre transacciones, ya usada en el módulo 9 de este track.",
      "url": "https://sqlite.org/lang_transaction.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
