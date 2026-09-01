# Proyecto avanzado: procesador de ventas por lotes

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-procesador-de-ventas-por-lotes` (autogenerado del título)
- **Orden:** 550
- **Repositorio:** [github.com/pedroleni/nodejs-proyectos-avanzados](https://github.com/pedroleni/nodejs-proyectos-avanzados) (carpeta `procesador-ventas-streams`)
- **Requiere:** Módulo 9 (Streams, especialmente las lecciones 33 —
  `pipe()`/`pipeline()` — y 34 — Backpressure) y Módulo 12 (TypeScript en
  Node) de este mismo temario

---

## Qué vas a construir

Un procesador de un CSV de ventas potencialmente enorme, de principio a
fin por streaming: lo lee del disco trozo a trozo, lo trocea en líneas
completas, acumula totales por categoría sobre la marcha, y escribe un
informe final — sin cargar nunca el fichero entero (ni el informe) en
memoria. Escrito en TypeScript, sobre las guías oficiales "How to use
streams" y "Backpressuring in Streams".

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/nodejs-proyectos-avanzados (carpeta procesador-ventas-streams) — rama main con tipos.ts, parseo-csv.ts, informe-csv.ts, procesar.ts y cli.ts completos (la infraestructura y el diseño) y divisor-lineas.ts + agregador.ts con TODO; rama solucion con la implementación completa."
}
```

## El problema real: `readFileSync` funciona... hasta que el fichero no cabe en memoria

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Con un ventas.csv de unos pocos KB, esto funciona perfectamente\nconst contenido = readFileSync('ventas.csv', 'utf8');\nconst filas = contenido.split('\\n'); // el fichero ENTERO ya está en memoria\nconst ventas = filas.map(parsearLineaVenta);\n</script>",
  "despues": "<script>\n// Con un ventas.csv de varios GB, esto ni siquiera necesita más memoria\nawait pipeline(\n  createReadStream('ventas.csv'), // lee trozos de bytes, no el fichero entero\n  new DivisorDeLineas(),          // emite líneas completas, una a una\n  new AgregadorDeVentas(),        // acumula totales, nunca guarda las filas\n);\n</script>",
  "nota": "El 'antes' no es un error de principiante — es exactamente lo que enseña la mayoría de tutoriales, y funciona de verdad con ficheros pequeños. El problema aparece cuando el fichero de ventas real de una empresa pesa varios gigabytes: readFileSync intenta cargarlo entero en un string en memoria, y el proceso revienta con un fichero que el streaming procesaría sin despeinarse."
}
```

## La pieza más delicada: trocear bytes en líneas, sin perder ninguna

Un `fs.createReadStream` no promete que cada trozo (`chunk`) que entrega
contenga un número entero de líneas — un chunk puede cortar una línea
justo por la mitad, en cualquier punto.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport class DivisorDeLineas extends Transform {\n  #restante = '';\n\n  constructor() {\n    super({ readableObjectMode: true });\n  }\n\n  _transform(chunk, _encoding, callback) {\n    const texto = this.#restante + chunk.toString('utf8');\n    const lineas = texto.split('\\n');\n    this.#restante = lineas.pop() ?? '';\n    for (const linea of lineas) this.push(linea.replace(/\\r$/, ''));\n    callback();\n  }\n\n  _flush(callback) {\n    if (this.#restante) this.push(this.#restante.replace(/\\r$/, ''));\n    callback();\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "this.#restante = lineas.pop() ?? '';", "nota": "El ÚLTIMO elemento de dividir por '\\n' es, casi siempre, una línea sin terminar todavía — podría completarse en el siguiente chunk. Se guarda en #restante y NUNCA se emite en esta llamada; se le pega el principio del próximo trozo de bytes en la siguiente _transform." },
    { "fragmento": "_flush(callback) {", "nota": "Cuando el fichero se acaba, puede quedar una última línea pendiente en #restante (si el fichero no termina en un salto de línea). _flush() es el único momento para emitirla — es lo último que se ejecuta antes de que el stream se dé por terminado." }
  ]
}
```

## Acumular sin guardar nada de más

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport class AgregadorDeVentas extends Writable {\n  #totalVentas = 0;\n  #ingresoTotal = 0;\n  #porCategoria = new Map();\n\n  _write(linea, _encoding, callback) {\n    const venta = parsearLineaVenta(linea);\n    if (venta) {\n      const importe = venta.cantidad * venta.precioUnitario;\n      this.#totalVentas += 1;\n      this.#ingresoTotal += importe;\n      const acumulado = this.#porCategoria.get(venta.categoria) ?? { unidadesVendidas: 0, ingresoTotal: 0 };\n      acumulado.unidadesVendidas += venta.cantidad;\n      acumulado.ingresoTotal += importe;\n      this.#porCategoria.set(venta.categoria, acumulado);\n    }\n    callback();\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "export class AgregadorDeVentas extends Writable {", "nota": "Un Writable, no un Transform: este stream es el FINAL del pipeline — consume filas, no produce nada hacia adelante. El informe se lee después, con un método normal (obtenerInforme()), una vez que el stream ha terminado." },
    { "fragmento": "this.#totalVentas += 1;", "nota": "El total se suma fila a fila, según van llegando — nunca se guardan las ventas en un array para sumarlas todas al final. Con un fichero de millones de filas, esa sería exactamente la misma trampa de memoria del 'antes' de más arriba, solo que escondida un paso más adelante." }
  ]
}
```

## Por qué `pipeline()` y no `.pipe()` encadenados a mano

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "pipeline() no es solo una forma más corta de escribir .pipe()",
  "contenido": "Si un stream de en medio del pipeline falla (por ejemplo, un fichero corrupto a mitad de lectura), pipeline() se encarga de destruir TODOS los streams implicados automáticamente. Encadenar .pipe() a mano no hace eso: un stream que falla puede dejar a los demás colgados, consumiendo memoria y descriptores de fichero indefinidamente. Por eso procesar.ts usa pipeline() de node:stream/promises, no .pipe()."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Genera un fichero real de cientos de miles de filas.", "texto": "Clona nodejs-proyectos-avanzados, entra en procesador-ventas-streams/ y ejecuta npm run generar-datos -- ventas.csv 300000 — el propio generador escribe por streaming, así que ni siquiera él construye el CSV entero en memoria." },
    { "titulo": "Procésalo y mira el informe real.", "texto": "npm start -- ventas.csv — verás el total de ventas, el ingreso total, y un desglose por categoría ordenado de mayor a menor ingreso, calculado sobre un fichero de varios megabytes en un puñado de milisegundos." },
    { "titulo": "Comprueba el caso límite a propósito.", "texto": "Los tests de divisor-lineas.test.ts cubren el caso exacto de una línea partida entre dos chunks distintos — el bug más fácil de introducir sin darte cuenta al escribir un parser de streams a mano." }
  ]
}
```

## Retos para ampliarlo

1. Añade un segundo `Transform` entre el divisor y el agregador que filtre filas por rango de fechas, antes de que lleguen al agregador.
2. Cambia `AgregadorDeVentas` para que además calcule, por categoría, el ticket medio (`ingresoTotal / unidadesVendidas`).
3. Sustituye la lectura de un único fichero por la de varios (con `for` sobre un array de rutas y un `pipeline()` por fichero), acumulando en el mismo `AgregadorDeVentas` sin cerrarlo entre uno y otro.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "nodejs-proyectos-avanzados/procesador-ventas-streams (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en procesador-ventas-streams/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/main/procesador-ventas-streams",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "nodejs-proyectos-avanzados/procesador-ventas-streams (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/solucion/procesador-ventas-streams",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "How to use streams",
      "descripcion": "La guía oficial de Node.js sobre los cuatro tipos de stream y cómo encadenarlos.",
      "url": "https://nodejs.org/en/learn/modules/how-to-use-streams",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Backpressuring in Streams",
      "descripcion": "Por qué existe el backpressure y qué pasa si se ignora — la segunda fuente de este proyecto.",
      "url": "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
      "etiqueta": "Node.js"
    }
  ]
}
```
