# Proyecto avanzado: acortador de URLs con rate limiting

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-acortador-de-urls-con-rate-limiting` (autogenerado del título)
- **Orden:** 540
- **Repositorio:** [github.com/pedroleni/nodejs-proyectos-avanzados](https://github.com/pedroleni/nodejs-proyectos-avanzados) (carpeta `acortador-rate-limit`)
- **Requiere:** Módulo 10 (Construir un servidor HTTP desde cero) y la
  lección 34 (Backpressure) de este mismo temario

---

## Qué vas a construir

Un acortador de URLs real, persistido con `node:sqlite`, que limita
cuántas veces se puede visitar un enlace por unidad de tiempo con el
algoritmo de **token bucket** — el mismo que usan APIs como la de Stripe
o GitHub — y que exporta el histórico de visitas como CSV **streameado**
directamente a la respuesta HTTP, sin construir nunca el fichero entero
en memoria.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/nodejs-proyectos-avanzados (carpeta acortador-rate-limit) — rama main con db.js, codigo.js y servidor.js completos (la infraestructura y el diseño) y limitador.js + csv.js con TODO; rama solucion con la implementación completa."
}
```

## El problema real: un contador simple no es lo mismo que un token bucket

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Contador simple: máximo 5 peticiones por minuto, y se resetea de golpe\nlet contador = 0;\nsetInterval(() => { contador = 0; }, 60_000);\n\nfunction permitir() {\n  if (contador >= 5) return false;\n  contador++;\n  return true;\n}\n// Problema real: alguien puede gastar sus 5 peticiones en el último\n// segundo de un minuto, y otras 5 en el primer segundo del siguiente —\n// 10 peticiones en 2 segundos, dentro de las reglas.\n</script>",
  "despues": "<script>\n// Token bucket: las fichas se recuperan de forma continua, no de golpe\nfunction permitir(cubo, capacidad, tasaPorSegundo, ahora) {\n  const transcurrido = (ahora - cubo.ultimaActualizacion) / 1000;\n  cubo.fichas = Math.min(capacidad, cubo.fichas + transcurrido * tasaPorSegundo);\n  cubo.ultimaActualizacion = ahora;\n  if (cubo.fichas < 1) return false;\n  cubo.fichas -= 1;\n  return true;\n}\n</script>",
  "nota": "El token bucket sí permite una ráfaga corta (gastar varias fichas seguidas si el cubo está lleno) pero limita de verdad el ritmo medio sostenido, sin el efecto \"doble ráfaga\" del contador que se resetea de golpe cada minuto."
}
```

## El cubo de fichas, pieza por pieza

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport function crearLimitador(capacidad, tasaPorSegundo, ahora = Date.now) {\n  const cubos = new Map(); // clave (IP, por ejemplo) -> { fichas, ultimaActualizacion }\n\n  return {\n    permitir(clave) {\n      const instanteActual = ahora();\n      let cubo = cubos.get(clave) ?? { fichas: capacidad, ultimaActualizacion: instanteActual };\n\n      const segundosTranscurridos = (instanteActual - cubo.ultimaActualizacion) / 1000;\n      cubo.fichas = Math.min(capacidad, cubo.fichas + segundosTranscurridos * tasaPorSegundo);\n      cubo.ultimaActualizacion = instanteActual;\n      cubos.set(clave, cubo);\n\n      if (cubo.fichas < 1) return false;\n      cubo.fichas -= 1;\n      return true;\n    },\n  };\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const cubos = new Map(); // clave (IP, por ejemplo) -> { fichas, ultimaActualizacion }", "nota": "Cada clave (cada cliente) tiene su propio cubo independiente — agotar el tuyo no afecta al de nadie más. Es exactamente el mismo uso de Map como 'diccionario con clave dinámica' que ya has usado en otros proyectos de este temario." },
    { "fragmento": "ahora = Date.now", "nota": "El reloj se inyecta como parámetro (con Date.now real como valor por defecto) en vez de llamar a Date.now() directamente dentro de la función — así los tests pueden simular 'ha pasado 1 segundo' sin esperas reales, controlando exactamente qué valor devuelve ahora() en cada llamada." },
    { "fragmento": "cubo.fichas = Math.min(capacidad, cubo.fichas + segundosTranscurridos * tasaPorSegundo);", "nota": "El Math.min es lo que impide que el cubo acumule fichas sin límite si nadie lo usa durante horas — por mucho tiempo que pase, nunca guarda más de `capacidad` fichas." }
  ]
}
```

## La otra mitad: exportar el histórico sin cargarlo entero en memoria

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport async function escribirVisitasComoCsv(visitas, streamSalida) {\n  streamSalida.write('codigo,visitado_en\\n');\n  for (const visita of visitas) {\n    const fila = [visita.codigo, visita.visitadoEn].map(escaparCampoCsv).join(',');\n    const hayEspacio = streamSalida.write(fila + '\\n');\n    if (!hayEspacio) {\n      await new Promise((resolve) => streamSalida.once('drain', resolve));\n    }\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const hayEspacio = streamSalida.write(fila + '\\n');", "nota": "write() devuelve false cuando el buffer interno del stream está lleno — es la señal de backpressure real de la lección 34, no una convención: hay que respetarla." },
    { "fragmento": "await new Promise((resolve) => streamSalida.once('drain', resolve));", "nota": "En vez de seguir escribiendo sin control (lo que acumularía filas en memoria esperando a que el cliente las reciba), el bucle se detiene aquí de verdad hasta que el stream avisa, con el evento 'drain', de que ya puede aceptar más." }
  ]
}
```

## Un detalle de diseño real: identificar al cliente

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "¿Por qué el servidor admite una cabecera X-Client-Id?",
  "contenido": "En producción, la clave del rate limiter sería la IP real del cliente (o la de X-Forwarded-For, validada, si hay un proxy delante). Aquí el servidor también acepta X-Client-Id explícita — no por seguridad, sino para poder simular varios \"clientes\" distintos en los tests de integración sin depender de IPs reales."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Agota el cubo con curl.", "texto": "Clona nodejs-proyectos-avanzados, entra en acortador-rate-limit/ y ejecuta npm start, acorta una URL con POST /acortar, y visita el enlace corto varias veces seguidas con GET — verás 302 hasta agotar la capacidad, y luego un 429 real." },
    { "titulo": "Exporta la analítica real.", "texto": "curl http://localhost:3000/analitica/<codigo>/exportar — debe listar, como CSV, cada visita registrada, con su fecha exacta." },
    { "titulo": "Espera y repite.", "texto": "Tras el 429, espera 1 segundo (la tasa de relleno por defecto) y vuelve a visitar el enlace — debería volver a dar 302, con exactamente 1 ficha nueva disponible." }
  ]
}
```

## Retos para ampliarlo

1. Añade un límite distinto por ruta: `POST /acortar` con un cubo más pequeño que `GET /:codigo`, para frenar la creación masiva de enlaces sin frenar las visitas normales.
2. Persiste los cubos en la propia base de datos SQLite, para que el límite sobreviva a un reinicio del servidor (ahora mismo vive solo en memoria).
3. Combínalo con el proyecto de webhooks (lección 53): dispara un webhook firmado cuando un enlace supera un número de visitas configurado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "nodejs-proyectos-avanzados/acortador-rate-limit (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en acortador-rate-limit/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/main/acortador-rate-limit",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "nodejs-proyectos-avanzados/acortador-rate-limit (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/solucion/acortador-rate-limit",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Backpressuring in Streams",
      "descripcion": "La guía oficial de Node.js sobre por qué existe el backpressure y qué pasa si se ignora.",
      "url": "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
      "etiqueta": "Node.js"
    }
  ]
}
```
