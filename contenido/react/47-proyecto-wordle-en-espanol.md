# Proyecto: Wordle en español

- **Módulo:** Efectos
- **Slug:** `proyecto-wordle-en-espanol` (autogenerado del título)
- **Orden:** 470
- **Fuentes:** [useReducer](https://react.dev/reference/react/useReducer) + [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) + [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) + [useEffectEvent](https://react.dev/reference/react/useEffectEvent) + [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) + [ARIA live regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — ver `contenido/react/TEMARIO.md` #47
- **Requiere:** Módulos 2 a 6 completos (lecciones 8 a 46)

---

## Qué vas a construir

*El Candil*, el periódico de la comarca, quiere un pasatiempo diario en su web: **«Cinco letras»**, un Wordle en español. Cada día hay una palabra de cinco letras y seis intentos para adivinarla. Después de cada intento, cada letra se colorea: verde si está en su sitio, ocre si está en la palabra pero en otra posición y gris si no está. Se juega con el teclado de la pantalla o con el tuyo, la partida se guarda aunque cambies de sección y quien usa un lector de pantalla oye el resultado de cada intento.

Es el proyecto que cierra el módulo 6, y lo usa casi entero:

- **Un reducer como máquina de estados** (lección 27): la partida pasa por tres fases, `'jugando'`, `'ganada'` y `'perdida'`, y el reducer decide qué acciones valen en cada una.
- **Un efecto con limpieza** (lección 38) para escuchar el teclado físico en `window` mientras el juego esté en pantalla.
- **`useEffectEvent`** (lección 41) para que ese escuchador lea la partida más reciente sin volver a suscribirse en cada tecla.
- **`useSyncExternalStore`** (lección 46) para guardar la partida en `localStorage`, fuera de React.
- **Una región viva** (lección 37) que anuncia cada intento.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Seis pasos, todos en esta página",
  "contenido": "Cada paso es un bloque React en vivo con sus archivos en pestañas, la vista previa debajo y el botón «Comprobar», que juega por ti y te dice qué falla. Cada paso arranca con la solución del anterior: si te atascas, puedes seguir en el siguiente. Para jugar con tu teclado, haz clic antes en la vista previa: las teclas van a la ventana que tiene el foco, y mientras escribes en el editor la vista previa no las recibe."
}
```

Si prefieres hacerlo en tu ordenador, crea un proyecto con Vite (lección 2) y copia en `src/` los archivos de cada paso; el `App.jsx` de cada paso sustituye al de la plantilla. Para que se vea igual que aquí, quita de `main.jsx` la importación de `index.css`.

## Las reglas del juego

Antes de React, las reglas. Te llegan hechas en `palabras.jsx`, un módulo sin una sola etiqueta, como `ganador.jsx` en el tres en raya de la lección 32:

- **Las palabras.** Una lista corta y propia de 40 palabras de cinco letras. Sirve para dos cosas: de ella sale la palabra del día y, además, solo se aceptan intentos que estén en ella («PLAZO no está en la lista»). Un pasatiempo de verdad aceptaría un diccionario de miles de palabras; para aprender, 40 bastan.
- **La palabra del día** sale de un número: `palabraDelDia(47)` cuenta 47 posiciones en la lista y, al llegar al final, vuelve a empezar (`47 % 40`, la posición 7). En un pasatiempo de verdad, el número saldría de la fecha (los días que han pasado desde el primero); aquí es fijo, para que la partida sea la misma para todos y las comprobaciones sepan qué esperar. La del n.º 47 es **OTOÑO**: ya conoces la respuesta. Si quieres jugar sin saberla, cambia `NUMERO` en `App.jsx`.
- **`comprobarIntento(palabra)`** devuelve `null` si la palabra se puede enviar, o el motivo por el que no: «Faltan letras» o «PLAZO no está en la lista».
- **`evaluar(intento, solucion)`** devuelve un estado por letra: `'correcta'`, `'presente'` o `'ausente'`. Y **`describirIntento`** lo pone en palabras: «MONTE: M no está, O en otra posición...».

### La ñ sí, las tildes no

**El abecedario español tiene 27 letras, y la ñ es una de ellas**; la «á» no es otra letra, sino una a con tilde. El juego sigue esa misma regla:

- **La Ñ es una letra propia**, con su tecla en la pantalla, y no tiene nada que ver con la N. Si la palabra es OTOÑO y pruebas MONTE, la N sale gris: OTOÑO no tiene ninguna N.
- **Las tildes no cuentan.** Las palabras se guardan sin ellas (ÁRBOL es `'ARBOL'`, LÁPIZ es `'LAPIZ'`) y el teclado de la pantalla no tiene vocales con tilde. Si escribes una «á» con tu teclado, entra como A. Así nadie pierde un intento por una tilde, y el teclado de la pantalla no necesita una tecla más por cada vocal acentuada.

### Las letras repetidas

`evaluar` hace **dos pasadas**. En la primera marca las letras que están en su sitio; en la segunda, las que están en otra posición, pero solo con las letras de la solución que han quedado libres. Cada letra de la solución se empareja una sola vez. Parece un detalle, hasta que pruebas una palabra con letras repetidas:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nevaluar('ARAÑA', 'PLAZA')\n// ¿Qué estado tiene la primera A de ARAÑA?",
  "opciones": [
    "'presente': PLAZA tiene A, aunque en otra posición",
    "'ausente': las dos A de PLAZA ya están emparejadas",
    "'correcta': ARAÑA y PLAZA comparten sus A"
  ],
  "correcta": 1,
  "explicacion": "La primera pasada empareja la tercera y la quinta A de ARAÑA con las dos A de PLAZA, que están justo ahí. Cuando la segunda pasada llega a la primera A, ya no queda ninguna A libre en la solución: no está. Si cada letra preguntara solo solucion.includes(letra), saldría en otra posición y el jugador buscaría una tercera A que no existe."
}
```

## Las piezas

El resto del juego son cuatro archivos más. Dos te llegan hechos, porque no son lo que este proyecto viene a practicar, y en los otros dos está el trabajo:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "partida.jsx",
      "rol": "El reducer: lo escribes tú",
      "descripcion": "Qué es una partida y cómo cambia con cada acción. Pasos 1 y 3."
    },
    {
      "etiqueta": "piezas.jsx",
      "rol": "Tablero, Teclado y leerTecla",
      "descripcion": "Lo que se ve: el tablero, con el nombre de cada fila para los lectores de pantalla; el teclado en pantalla, coloreado; y la traducción de un keydown a una tecla del juego."
    },
    {
      "etiqueta": "App.jsx",
      "rol": "CincoLetras y el periódico",
      "descripcion": "El componente del juego, que une la partida con los dos teclados, y una página con dos secciones: «Portada» y «Cinco letras». Pasos 2, 4, 5 y 6."
    },
    {
      "etiqueta": "guardado.jsx",
      "rol": "El almacén de la partida",
      "descripcion": "La partida en localStorage, con useSyncExternalStore. Aparece en el paso 5."
    }
  ]
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El árbol del periódico",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: seccion"
    },
    {
      "nombre": "CincoLetras",
      "nivel": 1,
      "etiqueta": "estado: partida",
      "nota": "← escucha el teclado físico"
    },
    {
      "nombre": "Tablero",
      "nivel": 2,
      "nota": "← pinta la partida"
    },
    {
      "nombre": "Teclado",
      "nivel": 2,
      "nota": "← onPulsar = manejarTecla"
    },
    {
      "nombre": "Portada",
      "nivel": 1,
      "nota": "← se pinta en lugar de CincoLetras"
    }
  ]
}
```

`App` solo decide qué sección se ve. Cambiar a «Portada» **desmonta** `CincoLetras`, con su estado y sus efectos, y volver la monta de nuevo, desde cero (lección 26). Tenlo presente: en el paso 5 será el problema que resolver.

## Paso 1: la partida, en un reducer

Una partida se describe con cuatro datos:

```js
{
  solucion: 'OTOÑO',            // la palabra que hay que adivinar
  intentos: ['MONTE', 'PLAZA'], // las palabras ya enviadas
  actual: 'NI',                 // lo que llevas escrito en la fila siguiente
  fase: 'jugando',              // 'jugando', 'ganada' o 'perdida'
}
```

Fíjate en lo que **no** está: los colores. Que la M de MONTE no está se calcula con `evaluar` cada vez que se pinta, a partir de `intentos` y `solucion`. Es el estado mínimo de la lección 24: lo que se puede calcular no se guarda, y lo que no se guarda no se puede desincronizar.

Todo lo que puede pasarle a la partida son tres acciones, con el tipo en participio, como en la lección 27:

- `{ tipo: 'letra_anadida', letra: 'P' }`: la letra va al final de `actual`, si caben (cinco como mucho).
- `{ tipo: 'letra_borrada' }`: se quita la última letra de `actual`.
- `{ tipo: 'intento_enviado' }`: si `comprobarIntento(actual)` da `null`, la palabra pasa a `intentos` y la fila siguiente empieza vacía.

`CincoLetras` ya tiene el reducer enchufado. El estado inicial se calcula con una función de inicio, como en la lección 27: `useReducer(partidaReducer, SOLUCION, partidaNueva)` llama a `partidaNueva(SOLUCION)` al montar, no en cada render. Y los dos teclados llegarán a **una sola puerta de entrada**, `manejarTecla(tecla)`, que traduce cada tecla en una acción.

Una regla importa más que las otras: **si una acción no vale en ese momento, el reducer devuelve la misma partida, sin copiarla**. Una sexta letra, «Borrar» con la fila vacía, «Enviar» con tres letras: nada cambia, y React no tiene nada que renderizar. Y cuando sí cambia algo, se copia en vez de mutar (lecciones 20 y 21): con `StrictMode`, React llama dos veces al reducer en desarrollo, y un `partida.intentos.push(...)` se delataría metiendo cada intento dos veces en el tablero.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: la partida, en un reducer",
  "consigna": "En partida.jsx, escribe las tres acciones de partidaReducer: letra_anadida (como mucho LETRAS letras en actual), letra_borrada e intento_enviado (solo si comprobarIntento(actual) da null: la palabra pasa a intentos y actual se vacía). Si una acción no vale, devuelve la misma partida. Prueba con el teclado de la pantalla: MONTE y «Enviar». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer, useState } from 'react'\nimport { palabraDelDia } from './palabras'\nimport { partidaNueva, partidaReducer } from './partida'\nimport { Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  const [partida, dispatch] = useReducer(partidaReducer, SOLUCION, partidaNueva)\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (tecla === 'Enviar') dispatch({ tipo: 'intento_enviado' })\n    else if (tecla === 'Borrar') dispatch({ tipo: 'letra_borrada' })\n    else dispatch({ tipo: 'letra_anadida', letra: tecla })\n  }\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: ¿ya has jugado hoy?</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Paso 1: las tres acciones. Si una acción no vale en ese momento,\n// devuelve la misma partida, sin copiarla.\n//   { tipo: 'letra_anadida', letra }: la letra, al final de actual\n//     (como mucho, LETRAS letras).\n//   { tipo: 'letra_borrada' }: quita la última letra de actual.\n//   { tipo: 'intento_enviado' }: si comprobarIntento(actual) da null, actual\n//     se añade a intentos y la fila siguiente empieza vacía.\nexport function partidaReducer(partida, accion) {\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      return partida\n    }\n    case 'letra_borrada': {\n      return partida\n    }\n    case 'intento_enviado': {\n      return partida\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "partida.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Cada letra que pulsas entra en la fila 1: P, L y A",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "L"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "A"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLA"
      }
    },
    {
      "descripcion": "Una fila admite cinco letras: con PLAZAS, la S ya no entra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "L"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "A"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Z"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "A"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "S"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLAZA"
      }
    },
    {
      "descripcion": "«Borrar» quita la última letra: PLO y «Borrar» dejan PL",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "L"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PL"
      }
    },
    {
      "descripcion": "«Enviar» con una palabra de la lista la puntúa: MONTE",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "M"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "N"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "T"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "E"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está"
      }
    },
    {
      "descripcion": "Una palabra incompleta no se envía: PLA se queda sin enviar",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "L"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "A"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLA"
      }
    },
    {
      "descripcion": "Una palabra que no está en la lista no se envía: PLAZO",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "L"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "A"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Z"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLAZO"
      }
    },
    {
      "descripcion": "Después de enviar, las letras van a la fila 2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "M"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "N"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "T"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "E"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "P"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 2, sin enviar: P"
      }
    }
  ]
}
```

Prueba a pulsar «Enviar» con tres letras, o una sexta letra: no pasa nada, y está bien que no pase. Pero tampoco se avisa de por qué; lo arreglarás en el paso 4. Y la partida todavía no sabe terminar: puedes acertar OTOÑO y seguir jugando. Eso es el paso 3.

Antes, el teclado. Jugar seis intentos a golpe de ratón es un suplicio.

## Paso 2: el teclado físico

El teclado físico no es de React. Los eventos de teclado llegan al elemento que tiene el foco y suben hasta `window`, y no hay ningún JSX en el que escribir un `onKeyDown` que funcione esté donde esté el foco. Hay que **sincronizar** el componente con algo externo, `window`: mientras `CincoLetras` esté en pantalla, escuchar `keydown`; cuando desaparezca, dejar de escucharlo. Es un efecto de libro, con su limpieza (lección 38):

```jsx
useEffect(() => {
  function alPulsarTecla(evento) {
    // ...
  }
  window.addEventListener('keydown', alPulsarTecla)
  return () => window.removeEventListener('keydown', alPulsarTecla)
}, [/* ... */])
```

La limpieza quita **la misma función** que se añadió. Ya viste en la lección 38 lo que pasa si no: con `StrictMode` el efecto se monta, se limpia y se vuelve a montar, y sin limpieza quedan dos escuchadores; cada tecla escribe dos letras.

Dentro, `leerTecla(evento)`, de `piezas.jsx`, traduce el evento a una tecla del juego: `'Enviar'` para Intro, `'Borrar'` para Retroceso, la letra en mayúscula y sin tilde, o `null` si la tecla no es del juego (Mayúsculas, Tab, las flechas...). Con lo que devuelve, dos cosas:

- **`evento.preventDefault()`, solo para las teclas del juego.** Si pulsas la E de la pantalla con el ratón, en casi todos los navegadores ese botón se queda con el foco (Safari es la excepción, según MDN); y en un botón con el foco, Intro lo pulsa. Sin `preventDefault()`, tu Intro enviaría la palabra y además escribiría otra E en la fila siguiente. Una de las comprobaciones lo prueba así.
- **`manejarTecla(tecla)`**, la misma puerta de entrada que usa el teclado en pantalla. Las dos formas de jugar hacen exactamente lo mismo, porque es el mismo código.

`leerTecla` también deja pasar los atajos: si lleva Ctrl, Cmd o Alt, devuelve `null`. Un `preventDefault()` a ciegas en todas las teclas se comería Ctrl+F para buscar en la página o Cmd+C para copiar.

¿Y la lista de dependencias? El efecto llama a `manejarTecla`, una función declarada en el componente: un valor reactivo (lección 40). El linter pediría `[manejarTecla]`. Ponla.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: el teclado físico",
  "consigna": "En App.jsx, dentro de CincoLetras, escribe el efecto: añade a window un escuchador de keydown que traduzca el evento con leerTecla y, si es una tecla del juego, llame a evento.preventDefault() y a manejarTecla. Quítalo en la limpieza. Como lista, la que pide el linter: [manejarTecla]. Haz clic en la vista previa y escribe con tu teclado; mira también el registro de efectos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useReducer, useState } from 'react'\nimport { palabraDelDia } from './palabras'\nimport { partidaNueva, partidaReducer } from './partida'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  const [partida, dispatch] = useReducer(partidaReducer, SOLUCION, partidaNueva)\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (tecla === 'Enviar') dispatch({ tipo: 'intento_enviado' })\n    else if (tecla === 'Borrar') dispatch({ tipo: 'letra_borrada' })\n    else dispatch({ tipo: 'letra_anadida', letra: tecla })\n  }\n\n  // Paso 2: un efecto que escuche keydown en window mientras el juego esté en\n  // pantalla, y que deje de escucharlo en la limpieza. Traduce cada evento con\n  // leerTecla(evento): si da null, no es del juego; si no, llama a\n  // evento.preventDefault() y a manejarTecla(tecla).\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: ¿ya has jugado hoy?</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\nexport function partidaReducer(partida, accion) {\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      return { ...partida, intentos: [...partida.intentos, partida.actual], actual: '' }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al teclear «plaza», la palabra entra en la fila 1, cada letra una sola vez",
      "pasos": [
        {
          "teclear": "plaza"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLAZA"
      }
    },
    {
      "descripcion": "Intro envía el intento: «monte» e Intro",
      "pasos": [
        {
          "teclear": "monte{Enter}"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está"
      }
    },
    {
      "descripcion": "Retroceso borra la última letra: «plazo», Retroceso y «a» dejan PLAZA",
      "pasos": [
        {
          "teclear": "plazo{Backspace}a"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLAZA"
      }
    },
    {
      "descripcion": "La ñ es una letra del juego: «niños» e Intro",
      "pasos": [
        {
          "teclear": "niños{Enter}"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, NIÑOS: N no está, I no está, Ñ en otra posición, O en otra posición, S no está"
      }
    },
    {
      "descripcion": "Las tildes no cuentan: «árbol» se escribe ARBOL",
      "pasos": [
        {
          "teclear": "árbol"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: ARBOL"
      }
    },
    {
      "descripcion": "Tras pulsar MONTE en la pantalla, Intro envía sin volver a escribir la E en la fila 2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "M"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "N"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "T"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "E"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 2, vacío"
      }
    }
  ]
}
```

Con el paso resuelto, escribe unas letras y lee el registro de efectos. Después del montaje (el «▶ efecto · montaje», «⟲ limpieza» y «▶ efecto · repetido por StrictMode» de siempre), cada tecla añade dos líneas:

```text
commit 2
CincoLetras ⟲ limpieza
CincoLetras ▶ efecto · cambió manejarTecla: ƒ manejarTecla() → ƒ manejarTecla()
```

**Cada tecla quita el escuchador y pone otro.** Cada letra cambia la partida, la partida provoca un render, y en cada render `manejarTecla` es una función nueva (lección 42). Para React, la dependencia ha cambiado, así que limpia y vuelve a sincronizar. El juego funciona, y aquí quitar y poner un escuchador sale barato, pero no es lo que querías decir: el teclado se escucha **mientras el juego esté en pantalla**, no «hasta la próxima tecla».

¿Y con `[]`? Hoy funcionaría, por casualidad. Este `manejarTecla` solo llama a `dispatch`, y `dispatch` es siempre la misma función (lección 27): aunque el escuchador se quedara con el `manejarTecla` del primer render, cada acción llegaría al reducer, que trabaja con la partida más reciente. La casualidad dura hasta que `manejarTecla` lea la partida, que es lo que pasa en el paso 4.

## Paso 3: el final de la partida

Ahora mismo puedes acertar OTOÑO y seguir escribiendo, o enviar un séptimo intento que el tablero ni siquiera enseña. Falta lo que convierte al reducer en una **máquina de estados**: un conjunto cerrado de fases y las transiciones permitidas entre ellas (lección 27).

```text
              intento == solución
  jugando ─────────────────────────▶ ganada
     │
     │  sexto intento, y no es la solución
     └───────────────────────────────▶ perdida
```

Solo hay dos flechas, y las dos salen de `'jugando'`. **`'ganada'` y `'perdida'` son estados finales**: ninguna acción sale de ellos. En el reducer eso es una línea al principio, antes del `switch`, que devuelve la partida tal cual si la fase no es `'jugando'`. Da igual qué acción llegue, y de dónde: el teclado en pantalla, el físico o cualquier otro código que añadas dentro de un año.

La fase la decide `intento_enviado`, en este orden:

1. Si la palabra enviada es la solución, `'ganada'`.
2. Si no, y era el sexto intento, `'perdida'`.
3. Si no, se sigue jugando.

El orden importa: si aciertas en el sexto intento, has ganado, aunque ya no te queden más. Es la misma regla que el empate del tres en raya (lección 32): si la última jugada gana, es una victoria.

`CincoLetras` ya sabe pintar el final: «¡Acertaste!» o «Se acabaron los intentos. La palabra era OTOÑO.», según `partida.fase`. Solo falta que la partida llegue ahí.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: el final de la partida",
  "consigna": "En partida.jsx: al principio del reducer, si la fase no es jugando, devuelve la partida tal cual. En intento_enviado, calcula la fase nueva: ganada si la palabra es la solución; si no, perdida si era el último intento (INTENTOS); si no, jugando. App.jsx ya pinta el final según partida.fase.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useReducer, useState } from 'react'\nimport { palabraDelDia } from './palabras'\nimport { partidaNueva, partidaReducer } from './partida'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  const [partida, dispatch] = useReducer(partidaReducer, SOLUCION, partidaNueva)\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (tecla === 'Enviar') dispatch({ tipo: 'intento_enviado' })\n    else if (tecla === 'Borrar') dispatch({ tipo: 'letra_borrada' })\n    else dispatch({ tipo: 'letra_anadida', letra: tecla })\n  }\n\n  useEffect(() => {\n    function alPulsarTecla(evento) {\n      const tecla = leerTecla(evento)\n      if (tecla === null) return\n      evento.preventDefault()\n      manejarTecla(tecla)\n    }\n    window.addEventListener('keydown', alPulsarTecla)\n    return () => window.removeEventListener('keydown', alPulsarTecla)\n  }, [manejarTecla])\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: ¿ya has jugado hoy?</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, INTENTOS, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Paso 3: las fases. Con la partida 'ganada' o 'perdida', ninguna acción\n// cambia nada. Al enviar un intento: si es la solución, 'ganada'; si no, y\n// era el último (INTENTOS), 'perdida'.\nexport function partidaReducer(partida, accion) {\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      return { ...partida, intentos: [...partida.intentos, partida.actual], actual: '' }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "partida.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Al acertar OTOÑO, sale «¡Acertaste!»",
      "pasos": [
        {
          "teclear": "otoño{Enter}"
        }
      ],
      "espera": {
        "texto": "¡Acertaste!"
      }
    },
    {
      "descripcion": "Con la partida ganada, el teclado ya no escribe: la fila 2 sigue vacía",
      "pasos": [
        {
          "teclear": "otoño{Enter}plaza"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 2, vacío"
      }
    },
    {
      "descripcion": "Tras seis intentos fallidos, se desvela la palabra",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}arbol{Enter}queso{Enter}piano{Enter}"
        },
        {
          "teclear": "barco{Enter}"
        }
      ],
      "espera": {
        "texto": "Se acabaron los intentos. La palabra era OTOÑO."
      }
    },
    {
      "descripcion": "Acertar en el sexto intento es ganar, no perder",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}arbol{Enter}queso{Enter}piano{Enter}"
        },
        {
          "teclear": "otoño{Enter}"
        }
      ],
      "espera": {
        "texto": "¡Acertaste!"
      }
    },
    {
      "descripcion": "Con la partida perdida, acertar después ya no cuenta",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}arbol{Enter}queso{Enter}piano{Enter}"
        },
        {
          "teclear": "barco{Enter}otoño{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "texto": "¡Acertaste!"
        }
      }
    }
  ]
}
```

Ya hay partidas enteras. Y el reducer sigue siendo una función pura que no sabe nada de React: podrías probarla con `partidaReducer(partidaNueva('OTOÑO'), { tipo: 'letra_anadida', letra: 'O' })`, sin pintar nada.

## Paso 4: avisos que leen la partida

Pulsar Intro con tres letras no hace nada, y el jugador no sabe por qué. Toca avisar: «Faltan letras», «PLAZO no está en la lista». El motivo ya lo da `comprobarIntento`, y `manejarTecla` es el sitio para decidir qué decir, porque es la lógica de un evento: pasa porque alguien ha pulsado una tecla (lección 39).

```jsx
const [aviso, setAviso] = useState('')

function manejarTecla(tecla) {
  if (partida.fase !== 'jugando') return
  setAviso('')
  if (tecla === 'Enviar') {
    const motivo = comprobarIntento(partida.actual)
    if (motivo) setAviso(motivo)
    else dispatch({ tipo: 'intento_enviado' })
  } else if (tecla === 'Borrar') {
    // ...
```

El aviso no va en el reducer, sino en su propio `useState`, y no por casualidad: **la partida es lo que se va a guardar** en el paso 5, y el aviso no forma parte de ella. Es la conversación con el jugador sobre la última tecla. Si se guardara, volver mañana a la página te recibiría con un «Faltan letras» de ayer. El reducer sigue rechazando por su cuenta lo que no vale; `manejarTecla` solo explica por qué.

Pero ahora **`manejarTecla` lee la partida**: `partida.fase` y `partida.actual`. Con `[manejarTecla]`, el escuchador se vuelve a poner en cada tecla, como en el paso 2. Para evitarlo, alguien de la redacción quitó `manejarTecla` de la lista y silenció al linter. Es lo que vas a arreglar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: avisos y useEffectEvent",
  "consigna": "Haz clic en la vista previa, escribe monte con tu teclado y pulsa Intro: «Faltan letras», con cinco letras en la fila. Con [] el escuchador se quedó con el manejarTecla del primer render, que lee la partida vacía. Con el teclado de la pantalla sí funciona. Arréglalo con useEffectEvent: el escuchador pasa a ser un evento de efecto y la lista se queda en [], sin el comentario del linter. En el registro de efectos, una sola suscripción.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useReducer, useState } from 'react'\nimport { comprobarIntento, palabraDelDia } from './palabras'\nimport { partidaNueva, partidaReducer } from './partida'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  const [partida, dispatch] = useReducer(partidaReducer, SOLUCION, partidaNueva)\n  const [aviso, setAviso] = useState('')\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (partida.fase !== 'jugando') return\n    setAviso('')\n    if (tecla === 'Enviar') {\n      const motivo = comprobarIntento(partida.actual)\n      if (motivo) setAviso(motivo)\n      else dispatch({ tipo: 'intento_enviado' })\n    } else if (tecla === 'Borrar') {\n      dispatch({ tipo: 'letra_borrada' })\n    } else {\n      dispatch({ tipo: 'letra_anadida', letra: tecla })\n    }\n  }\n\n  // 🚩 Para no suscribirse en cada tecla, alguien quitó manejarTecla de la lista\n  useEffect(() => {\n    function alPulsarTecla(evento) {\n      const tecla = leerTecla(evento)\n      if (tecla === null) return\n      evento.preventDefault()\n      manejarTecla(tecla)\n    }\n    window.addEventListener('keydown', alPulsarTecla)\n    return () => window.removeEventListener('keydown', alPulsarTecla)\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [])\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      <p className=\"aviso\" role=\"status\" aria-live=\"polite\">\n        {aviso}\n      </p>\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: ¿ya has jugado hoy?</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, INTENTOS, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Tres fases: 'jugando', 'ganada' y 'perdida'. Las dos últimas son finales:\n// desde ellas no sale ninguna transición.\nexport function partidaReducer(partida, accion) {\n  if (partida.fase !== 'jugando') return partida\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      const intentos = [...partida.intentos, partida.actual]\n      let fase = 'jugando'\n      if (partida.actual === partida.solucion) fase = 'ganada'\n      else if (intentos.length === INTENTOS) fase = 'perdida'\n      return { ...partida, intentos, actual: '', fase }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Con cinco letras de la lista, Intro del teclado físico envía el intento",
      "pasos": [
        {
          "teclear": "monte{Enter}"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está"
      }
    },
    {
      "descripcion": "Y el segundo también: tras MONTE, «plaza» e Intro",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}"
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 2, PLAZA: P no está, L no está, A no está, Z no está, A no está"
      }
    },
    {
      "descripcion": "Una palabra fuera de la lista avisa con su nombre: «PLAZO no está en la lista»",
      "pasos": [
        {
          "teclear": "plazo{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "PLAZO no está en la lista"
      }
    },
    {
      "descripcion": "Intro con cuatro letras avisa «Faltan letras»",
      "pasos": [
        {
          "teclear": "plaz{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Faltan letras"
      }
    },
    {
      "descripcion": "Con la partida ganada, Intro ya no avisa de nada",
      "pasos": [
        {
          "teclear": "otoño{Enter}{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status",
          "texto": "Faltan letras"
        }
      }
    },
    {
      "descripcion": "El teclado en pantalla sigue funcionando: MONTE y «Enviar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "M"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "O"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "N"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "T"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "E"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está"
      }
    }
  ]
}
```

Las letras sí entraban con `[]`, porque llegaban al reducer a través de `dispatch`. Lo que fallaba era la decisión que se toma **fuera** del reducer, con la partida que había al montar: `actual` vacía, siempre «Faltan letras». Es el valor rancio que la lección 41 enseña a reconocer.

El arreglo es el de la lección 41, y el ejemplo de react.dev con un escuchador de `window`:

```jsx
const alPulsarTecla = useEffectEvent((evento) => {
  const tecla = leerTecla(evento)
  if (tecla === null) return
  evento.preventDefault()
  manejarTecla(tecla)
})

useEffect(() => {
  window.addEventListener('keydown', alPulsarTecla)
  return () => window.removeEventListener('keydown', alPulsarTecla)
}, [])
```

**Escuchar el teclado es el efecto; reaccionar a una tecla es un evento.** El evento de efecto se pasa tal cual a `addEventListener`, dentro del efecto, que es donde se puede usar. El efecto se queda con el `alPulsarTecla` de su render, y lo quita con esa misma función en la limpieza; y aunque ese render ya sea viejo, al llamarlo lee los últimos valores confirmados: la partida de ahora, el `manejarTecla` de ahora. Antes de React 19.2 se hacía a mano, con una ref que guardaba el último `manejarTecla` (lecciones 33 y 41).

Mira el registro mientras juegas: tras el montaje, nada más. Ni una línea por tecla. Estas son las tres listas que has visto para el mismo escuchador:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "[manejarTecla]: correcto, pero inquieto",
      "texto": "Lee siempre la partida buena, pero quita y pone el escuchador en cada tecla. El registro lo dice: cambió manejarTecla, una y otra vez."
    },
    {
      "titulo": "[] con el linter callado: tranquilo, pero rancio",
      "texto": "Se suscribe una vez y se queda para siempre con el manejarTecla del primer render. Las letras entran; los avisos y el envío, no."
    },
    {
      "titulo": "useEffectEvent y []: tranquilo y al día",
      "texto": "Se suscribe una vez, mientras el juego está en pantalla, y cada tecla lee la partida más reciente. Es lo que el código quería decir desde el principio."
    }
  ]
}
```

Las comprobaciones no ven el registro de efectos: volver a poner `[manejarTecla]` también las supera. El registro sí lo ve. Compruébalo tú: una suscripción al montar y ninguna más.

## Paso 5: la partida guardada

Juega un par de intentos, pulsa «Portada» y vuelve a «Cinco letras»: la partida ha desaparecido. Cambiar de sección desmonta `CincoLetras`, y el estado de un componente que se desmonta se pierde (lección 26). En la web de verdad, además, recargar la página o cerrar la pestaña también la borraría. Un pasatiempo diario tiene que recordar tu partida hasta mañana.

`localStorage` la recuerda, pero vive fuera de React: es un **almacén externo**, el caso de `useSyncExternalStore` (lección 46). El módulo `guardado.jsx` sigue el patrón de los ajustes del cancionero de esa lección:

- **`suscribirse(avisar)`** apunta `avisar` en un `Set` de oyentes y en el evento `storage` de `window`, que llega cuando cambia algo en **otra** pestaña, y devuelve la función que lo quita de los dos. Está fuera del componente, así que React no se vuelve a suscribir en cada render.
- **`leerTexto()`** es el `getSnapshot`: devuelve el texto guardado tal cual, o `null`. Dos textos iguales son iguales para `Object.is`. Si devolviera `JSON.parse(...)`, cada llamada fabricaría un objeto nuevo y caerías en el bucle de «The result of getSnapshot should be cached» de la lección 46.
- **`guardar(partida)`** escribe y **avisa a los oyentes**, porque en la pestaña que escribe nadie lo hace.
- **`partidaDeHoy(texto, solucion)`** (te llega hecha) convierte el texto en partida, y descarta la guardada si es de otra palabra: la de ayer no se juega hoy.

Y encima, un Hook que se usa igual que `useReducer`:

```jsx
const [partida, dispatch] = usePartidaGuardada(SOLUCION)
```

Su `dispatch` lee la partida guardada, le aplica **el mismo `partidaReducer`** y, si ha cambiado, guarda la nueva. **El reducer no cambia ni una línea.** Antes movía el estado de un `useReducer`; ahora mueve un almacén externo. Es la idea de Redux, que verás en la lección 75: un reducer que mueve un almacén externo. Y como el reducer devuelve la misma partida cuando una acción no vale, `dispatch` puede saber si hay algo que guardar comparando con `!==`.

`CincoLetras` cambia una línea. Lo demás sigue igual, incluido el aviso, que se queda en su `useState`: no se guarda, como decidiste en el paso 4. Y `Portada`, que no recibe ninguna prop del juego, puede leer la misma partida con el mismo Hook y decir cómo vas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: la partida guardada",
  "consigna": "En guardado.jsx: escribe suscribirse (oyentes y evento storage, con su baja), avisa a los oyentes en guardar y completa usePartidaGuardada con useSyncExternalStore(suscribirse, leerTexto) y partidaDeHoy; su dispatch aplica partidaReducer a la partida guardada y guarda la nueva si cambia. En App.jsx, úsalo en CincoLetras en lugar de useReducer, y en Portada para decir cómo vas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useEffectEvent, useReducer, useState } from 'react'\nimport { usePartidaGuardada } from './guardado'\nimport { comprobarIntento, INTENTOS, palabraDelDia } from './palabras'\nimport { partidaNueva, partidaReducer } from './partida'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  // Paso 5: que la partida viva en localStorage: usePartidaGuardada(SOLUCION),\n  // de guardado.jsx, en lugar de useReducer\n  const [partida, dispatch] = useReducer(partidaReducer, SOLUCION, partidaNueva)\n  const [aviso, setAviso] = useState('')\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (partida.fase !== 'jugando') return\n    setAviso('')\n    if (tecla === 'Enviar') {\n      const motivo = comprobarIntento(partida.actual)\n      if (motivo) setAviso(motivo)\n      else dispatch({ tipo: 'intento_enviado' })\n    } else if (tecla === 'Borrar') {\n      dispatch({ tipo: 'letra_borrada' })\n    } else {\n      dispatch({ tipo: 'letra_anadida', letra: tecla })\n    }\n  }\n\n  const alPulsarTecla = useEffectEvent((evento) => {\n    const tecla = leerTecla(evento)\n    if (tecla === null) return\n    evento.preventDefault()\n    manejarTecla(tecla)\n  })\n\n  useEffect(() => {\n    window.addEventListener('keydown', alPulsarTecla)\n    return () => window.removeEventListener('keydown', alPulsarTecla)\n  }, [])\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      <p className=\"aviso\" role=\"status\" aria-live=\"polite\">\n        {aviso}\n      </p>\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\n// Paso 5: lee la misma partida y di cómo vas: «Cinco letras: llevas 2 de 6\n// intentos.», «Cinco letras: ¡resuelto hoy!» o «Cinco letras: hoy no ha podido ser.»\nfunction Portada() {\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: ¿ya has jugado hoy?</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "guardado.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { partidaNueva, partidaReducer } from './partida'\n\n// La partida de hoy, guardada en localStorage: vive fuera de React.\nconst CLAVE = 'el-candil-cinco-letras'\nconst oyentes = new Set()\n\n// Paso 5: suscribirse(avisar) apunta avisar en oyentes y en el evento\n// storage de window (los cambios de otras pestañas), y devuelve la función\n// que lo quita de los dos.\n\n// El texto tal cual (o null): dos textos iguales son iguales para Object.is\nfunction leerTexto() {\n  return localStorage.getItem(CLAVE)\n}\n\nfunction guardar(partida) {\n  localStorage.setItem(CLAVE, JSON.stringify(partida))\n  // Paso 5: en esta pestaña nadie avisa: avisa tú a los oyentes\n}\n\n// La guardada, si es de la palabra de hoy; si no, una nueva.\nfunction partidaDeHoy(texto, solucion) {\n  const guardada = texto === null ? null : JSON.parse(texto)\n  return guardada?.solucion === solucion ? guardada : partidaNueva(solucion)\n}\n\n// Paso 5: se usa como useReducer, pero la partida vive en localStorage.\n// Léela con useSyncExternalStore y partidaDeHoy. dispatch(accion) aplica\n// partidaReducer a la partida guardada y, si cambia, guarda la nueva.\nexport function usePartidaGuardada(solucion) {\n  const partida = partidaNueva(solucion)\n  function dispatch(accion) {}\n  return [partida, dispatch]\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, INTENTOS, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Tres fases: 'jugando', 'ganada' y 'perdida'. Las dos últimas son finales:\n// desde ellas no sale ninguna transición.\nexport function partidaReducer(partida, accion) {\n  if (partida.fase !== 'jugando') return partida\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      const intentos = [...partida.intentos, partida.actual]\n      let fase = 'jugando'\n      if (partida.actual === partida.solucion) fase = 'ganada'\n      else if (intentos.length === INTENTOS) fase = 'perdida'\n      return { ...partida, intentos, actual: '', fase }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "guardado.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "La partida sobrevive a ir a la portada y volver",
      "pasos": [
        {
          "teclear": "monte{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cinco letras"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está"
      }
    },
    {
      "descripcion": "También lo que llevas escrito sin enviar",
      "pasos": [
        {
          "teclear": "pla"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cinco letras"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, sin enviar: PLA"
      }
    },
    {
      "descripcion": "La portada sabe cuántos intentos llevas",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        }
      ],
      "espera": {
        "texto": "Cinco letras: llevas 2 de 6 intentos."
      }
    },
    {
      "descripcion": "Una partida ganada sigue ganada al volver",
      "pasos": [
        {
          "teclear": "otoño{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cinco letras"
          }
        }
      ],
      "espera": {
        "texto": "¡Acertaste!"
      }
    },
    {
      "descripcion": "Lo que tecleas en la portada no llega a la partida",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        },
        {
          "teclear": "plaza"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cinco letras"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "nombre": "Intento 1, vacío"
      }
    },
    {
      "descripcion": "El aviso no se guarda: al volver de la portada ya no está",
      "pasos": [
        {
          "teclear": "plaz{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cinco letras"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status",
          "texto": "Faltan letras"
        }
      }
    },
    {
      "descripcion": "La portada sabe si ya la has resuelto",
      "pasos": [
        {
          "teclear": "otoño{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        }
      ],
      "espera": {
        "texto": "Cinco letras: ¡resuelto hoy!"
      }
    }
  ]
}
```

**En la vista previa, `localStorage` vive en memoria**: sobrevive a cambiar de sección, pero recargar la vista previa o editar el código lo deja vacío. En tu proyecto con Vite la partida sobrevive también a recargar la página, y si abres el juego en dos pestañas, jugar en una actualiza la otra gracias al evento `storage`.

Dos detalles que encajan con lo que ya sabes:

- **`partida` es un objeto nuevo en cada render**, porque sale de un `JSON.parse`. Para pintar da igual. Como dependencia de un efecto, no: lo volvería a sincronizar en cada render (lección 42). El escuchador del teclado no depende de la partida, la lee a través del evento de efecto, así que no le afecta.
- **Este `dispatch` también es una función nueva en cada render**, al revés que el de `useReducer` (lección 27). Por el mismo motivo, al teclado le da igual.

El registro de efectos no enseña nada de `useSyncExternalStore`: se suscribe con un efecto interno de React, no con un `useEffect` tuyo, y el registro solo apunta los tuyos.

## Paso 6: anunciar cada intento

Tras cada intento, el tablero se colorea y el teclado también. Quien no ve la pantalla no se entera de nada: las filas tienen nombre («Intento 1, MONTE: M no está...»), pero hay que ir a buscarlas. Falta que el resultado **se anuncie solo**, con una región viva (lección 37).

Lo que se anuncia se calcula a partir de la partida, como todo lo demás:

```text
Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está.
Intento 3, OTOÑO: O en su sitio, T en su sitio, O en su sitio, Ñ en su sitio, O en su sitio. ¡Acertaste!
```

Es el último intento, descrito con `describirIntento`, más el final si lo hay. Tres decisiones:

- **La región existe siempre**, vacía al empezar. Los lectores anuncian los cambios dentro de una región que ya conocen; una que aparece de golpe con el texto dentro puede pasar desapercibida (lección 37). Por eso nada de `{texto && <p role="status">…}`.
- **Es otra región, no la del aviso.** El aviso se borra con cada tecla. Si la misma región enseñara «el aviso o, si no hay, el último resultado», cada letra que escribes tras un «Faltan letras» devolvería el resultado anterior a la región, y el lector lo repetiría.
- **Cambia solo al enviar un intento.** Escribir letras no toca `intentos`, así que el texto no cambia y no hay nada que anunciar. Y el final («¡Acertaste!», «La palabra era OTOÑO.») entra en la misma región: deja de ser un párrafo que aparece y pasa a anunciarse.

Aquí la región se ve, debajo del aviso, para que leas lo que oiría un lector de pantalla. En un juego de verdad podrías ocultarla a la vista dejándola para los lectores, o dejarla visible: le sirve también a quien distingue mal el verde del ocre.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 6: anunciar cada intento",
  "consigna": "En App.jsx, escribe textoDelResultado(partida): vacío si no hay intentos; si no, «Intento N, » más describirIntento del último y un punto, y al final « ¡Acertaste!» o « Se acabaron los intentos. La palabra era OTOÑO.» según la fase. Píntalo en un <p className=\"resultado\" role=\"status\" aria-live=\"polite\"> que esté siempre, y quita los dos párrafos del final: su texto ya va en la región.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useEffectEvent, useState } from 'react'\nimport { usePartidaGuardada } from './guardado'\nimport { comprobarIntento, describirIntento, INTENTOS, palabraDelDia } from './palabras'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\nfunction CincoLetras() {\n  const [partida, dispatch] = usePartidaGuardada(SOLUCION)\n  const [aviso, setAviso] = useState('')\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (partida.fase !== 'jugando') return\n    setAviso('')\n    if (tecla === 'Enviar') {\n      const motivo = comprobarIntento(partida.actual)\n      if (motivo) setAviso(motivo)\n      else dispatch({ tipo: 'intento_enviado' })\n    } else if (tecla === 'Borrar') {\n      dispatch({ tipo: 'letra_borrada' })\n    } else {\n      dispatch({ tipo: 'letra_anadida', letra: tecla })\n    }\n  }\n\n  const alPulsarTecla = useEffectEvent((evento) => {\n    const tecla = leerTecla(evento)\n    if (tecla === null) return\n    evento.preventDefault()\n    manejarTecla(tecla)\n  })\n\n  useEffect(() => {\n    window.addEventListener('keydown', alPulsarTecla)\n    return () => window.removeEventListener('keydown', alPulsarTecla)\n  }, [])\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      <p className=\"aviso\" role=\"status\" aria-live=\"polite\">\n        {aviso}\n      </p>\n      {/* Paso 6: aquí, la región que anuncia el resultado de cada intento */}\n      {partida.fase === 'ganada' && <p className=\"final\">¡Acertaste!</p>}\n      {partida.fase === 'perdida' && (\n        <p className=\"final\">Se acabaron los intentos. La palabra era {partida.solucion}.</p>\n      )}\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  const [partida] = usePartidaGuardada(SOLUCION)\n  let estado = `llevas ${partida.intentos.length} de ${INTENTOS} intentos.`\n  if (partida.fase === 'ganada') estado = '¡resuelto hoy!'\n  if (partida.fase === 'perdida') estado = 'hoy no ha podido ser.'\n\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: {estado}</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "guardado.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { partidaNueva, partidaReducer } from './partida'\n\n// La partida de hoy, guardada en localStorage: vive fuera de React.\nconst CLAVE = 'el-candil-cinco-letras'\nconst oyentes = new Set()\n\nfunction suscribirse(avisar) {\n  oyentes.add(avisar)\n  // Los cambios hechos en otras pestañas llegan con el evento storage\n  window.addEventListener('storage', avisar)\n  return () => {\n    oyentes.delete(avisar)\n    window.removeEventListener('storage', avisar)\n  }\n}\n\n// El texto tal cual (o null): dos textos iguales son iguales para Object.is\nfunction leerTexto() {\n  return localStorage.getItem(CLAVE)\n}\n\nfunction guardar(partida) {\n  localStorage.setItem(CLAVE, JSON.stringify(partida))\n  // En esta pestaña nadie avisa: lo hacemos nosotros\n  oyentes.forEach((avisar) => avisar())\n}\n\n// La guardada, si es de la palabra de hoy; si no, una nueva.\nfunction partidaDeHoy(texto, solucion) {\n  const guardada = texto === null ? null : JSON.parse(texto)\n  return guardada?.solucion === solucion ? guardada : partidaNueva(solucion)\n}\n\n// Se usa como useReducer, pero la partida vive en localStorage\nexport function usePartidaGuardada(solucion) {\n  const texto = useSyncExternalStore(suscribirse, leerTexto)\n  const partida = partidaDeHoy(texto, solucion)\n\n  function dispatch(accion) {\n    const actual = partidaDeHoy(leerTexto(), solucion)\n    const siguiente = partidaReducer(actual, accion)\n    if (siguiente !== actual) guardar(siguiente)\n  }\n\n  return [partida, dispatch]\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, INTENTOS, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Tres fases: 'jugando', 'ganada' y 'perdida'. Las dos últimas son finales:\n// desde ellas no sale ninguna transición.\nexport function partidaReducer(partida, accion) {\n  if (partida.fase !== 'jugando') return partida\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      const intentos = [...partida.intentos, partida.actual]\n      let fase = 'jugando'\n      if (partida.actual === partida.solucion) fase = 'ganada'\n      else if (intentos.length === INTENTOS) fase = 'perdida'\n      return { ...partida, intentos, actual: '', fase }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Al enviar un intento, una región de estado lo describe letra a letra",
      "pasos": [
        {
          "teclear": "monte{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Intento 1, MONTE: M no está, O en otra posición, N no está, T en otra posición, E no está."
      }
    },
    {
      "descripcion": "Tras el segundo intento, se anuncia el segundo",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Intento 2, PLAZA: P no está, L no está, A no está, Z no está, A no está."
      }
    },
    {
      "descripcion": "Y solo el último: el primero ya no está en la región",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status",
          "texto": "Intento 1,"
        }
      }
    },
    {
      "descripcion": "Escribir letras no cambia el anuncio",
      "pasos": [
        {
          "teclear": "monte{Enter}pla"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Intento 1, MONTE:"
      }
    },
    {
      "descripcion": "Al acertar, el anuncio lo dice",
      "pasos": [
        {
          "teclear": "otoño{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "¡Acertaste!"
      }
    },
    {
      "descripcion": "Al perder, el anuncio desvela la palabra",
      "pasos": [
        {
          "teclear": "monte{Enter}plaza{Enter}arbol{Enter}queso{Enter}piano{Enter}"
        },
        {
          "teclear": "barco{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "La palabra era OTOÑO."
      }
    },
    {
      "descripcion": "Los avisos siguen en su región: «Faltan letras»",
      "pasos": [
        {
          "teclear": "pla{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Faltan letras"
      }
    },
    {
      "descripcion": "La partida se sigue guardando: tras acertar, la portada lo sabe",
      "pasos": [
        {
          "teclear": "otoño{Enter}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Portada"
          }
        }
      ],
      "espera": {
        "texto": "Cinco letras: ¡resuelto hoy!"
      }
    }
  ]
}
```

Las comprobaciones encuentran las regiones por su rol, `status`, igual que un lector de pantalla. Esta web no tiene un panel que enseñe lo que se anuncia; para oírlo de verdad, activa el lector de tu sistema (VoiceOver en el Mac, Narrador en Windows) y juega un intento.

## La partida completa

Estos son los seis archivos con todos los pasos resueltos. Juega con el registro de efectos a la vista: al cambiar a «Portada» verás «⟲ limpieza · desmontaje», y al volver, el montaje con su repetición de `StrictMode`. Entre medias, por muchas teclas que pulses, ni una línea.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cinco letras, el pasatiempo de El Candil",
  "consigna": "Juega una partida entera con tu teclado y con el de la pantalla, cambia de sección a mitad y vuelve. Después cambia NUMERO en App.jsx para jugar sin saber la respuesta: en la vista previa, editar el código vacía localStorage, así que empiezas de cero.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useEffectEvent, useState } from 'react'\nimport { usePartidaGuardada } from './guardado'\nimport { comprobarIntento, describirIntento, INTENTOS, palabraDelDia } from './palabras'\nimport { leerTecla, Tablero, Teclado } from './piezas'\nimport './estilos.css'\n\n// El pasatiempo n.º 47. En uno de verdad, el número saldría de la fecha.\nconst NUMERO = 47\nconst SOLUCION = palabraDelDia(NUMERO)\n\n// Lo que se anuncia tras cada intento: solo cambia al enviar uno.\nfunction textoDelResultado({ intentos, solucion, fase }) {\n  if (intentos.length === 0) return ''\n  const ultimo = intentos[intentos.length - 1]\n  let texto = `Intento ${intentos.length}, ${describirIntento(ultimo, solucion)}.`\n  if (fase === 'ganada') texto += ' ¡Acertaste!'\n  if (fase === 'perdida') texto += ` Se acabaron los intentos. La palabra era ${solucion}.`\n  return texto\n}\n\nfunction CincoLetras() {\n  const [partida, dispatch] = usePartidaGuardada(SOLUCION)\n  const [aviso, setAviso] = useState('')\n\n  // Una sola puerta de entrada: el teclado en pantalla y el físico llegan aquí\n  function manejarTecla(tecla) {\n    if (partida.fase !== 'jugando') return\n    setAviso('')\n    if (tecla === 'Enviar') {\n      const motivo = comprobarIntento(partida.actual)\n      if (motivo) setAviso(motivo)\n      else dispatch({ tipo: 'intento_enviado' })\n    } else if (tecla === 'Borrar') {\n      dispatch({ tipo: 'letra_borrada' })\n    } else {\n      dispatch({ tipo: 'letra_anadida', letra: tecla })\n    }\n  }\n\n  const alPulsarTecla = useEffectEvent((evento) => {\n    const tecla = leerTecla(evento)\n    if (tecla === null) return\n    evento.preventDefault()\n    manejarTecla(tecla)\n  })\n\n  useEffect(() => {\n    window.addEventListener('keydown', alPulsarTecla)\n    return () => window.removeEventListener('keydown', alPulsarTecla)\n  }, [])\n\n  return (\n    <section className=\"juego\" aria-labelledby=\"titulo-juego\">\n      <h2 id=\"titulo-juego\">Cinco letras · n.º {NUMERO}</h2>\n      <Tablero partida={partida} />\n      <p className=\"aviso\" role=\"status\" aria-live=\"polite\">\n        {aviso}\n      </p>\n      <p className=\"resultado\" role=\"status\" aria-live=\"polite\">\n        {textoDelResultado(partida)}\n      </p>\n      <Teclado partida={partida} onPulsar={manejarTecla} />\n    </section>\n  )\n}\n\nfunction Portada() {\n  const [partida] = usePartidaGuardada(SOLUCION)\n  let estado = `llevas ${partida.intentos.length} de ${INTENTOS} intentos.`\n  if (partida.fase === 'ganada') estado = '¡resuelto hoy!'\n  if (partida.fase === 'perdida') estado = 'hoy no ha podido ser.'\n\n  return (\n    <section aria-labelledby=\"titulo-portada\">\n      <h2 id=\"titulo-portada\">Portada</h2>\n      <p>El mercado de los sábados vuelve a la plaza Mayor con quince puestos nuevos.</p>\n      <p className=\"teaser\">Cinco letras: {estado}</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [seccion, setSeccion] = useState('juego')\n  return (\n    <div className=\"periodico\">\n      <header className=\"cabecera\">\n        <h1>El Candil</h1>\n        <nav aria-label=\"Secciones\">\n          <button aria-pressed={seccion === 'portada'} onClick={() => setSeccion('portada')}>\n            Portada\n          </button>\n          <button aria-pressed={seccion === 'juego'} onClick={() => setSeccion('juego')}>\n            Cinco letras\n          </button>\n        </nav>\n      </header>\n      <main>{seccion === 'juego' ? <CincoLetras /> : <Portada />}</main>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { comprobarIntento, INTENTOS, LETRAS } from './palabras'\n\n// La partida al empezar: sin intentos, sin letras y jugando.\nexport function partidaNueva(solucion) {\n  return { solucion, intentos: [], actual: '', fase: 'jugando' }\n}\n\n// Tres fases: 'jugando', 'ganada' y 'perdida'. Las dos últimas son finales:\n// desde ellas no sale ninguna transición.\nexport function partidaReducer(partida, accion) {\n  if (partida.fase !== 'jugando') return partida\n  switch (accion.tipo) {\n    case 'letra_anadida': {\n      if (partida.actual.length === LETRAS) return partida\n      return { ...partida, actual: partida.actual + accion.letra }\n    }\n    case 'letra_borrada': {\n      if (partida.actual === '') return partida\n      return { ...partida, actual: partida.actual.slice(0, -1) }\n    }\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      const intentos = [...partida.intentos, partida.actual]\n      let fase = 'jugando'\n      if (partida.actual === partida.solucion) fase = 'ganada'\n      else if (intentos.length === INTENTOS) fase = 'perdida'\n      return { ...partida, intentos, actual: '', fase }\n    }\n    default:\n      throw Error('Acción desconocida: ' + accion.tipo)\n  }\n}\n"
    },
    {
      "nombre": "guardado.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { partidaNueva, partidaReducer } from './partida'\n\n// La partida de hoy, guardada en localStorage: vive fuera de React.\nconst CLAVE = 'el-candil-cinco-letras'\nconst oyentes = new Set()\n\nfunction suscribirse(avisar) {\n  oyentes.add(avisar)\n  // Los cambios hechos en otras pestañas llegan con el evento storage\n  window.addEventListener('storage', avisar)\n  return () => {\n    oyentes.delete(avisar)\n    window.removeEventListener('storage', avisar)\n  }\n}\n\n// El texto tal cual (o null): dos textos iguales son iguales para Object.is\nfunction leerTexto() {\n  return localStorage.getItem(CLAVE)\n}\n\nfunction guardar(partida) {\n  localStorage.setItem(CLAVE, JSON.stringify(partida))\n  // En esta pestaña nadie avisa: lo hacemos nosotros\n  oyentes.forEach((avisar) => avisar())\n}\n\n// La guardada, si es de la palabra de hoy; si no, una nueva.\nfunction partidaDeHoy(texto, solucion) {\n  const guardada = texto === null ? null : JSON.parse(texto)\n  return guardada?.solucion === solucion ? guardada : partidaNueva(solucion)\n}\n\n// Se usa como useReducer, pero la partida vive en localStorage\nexport function usePartidaGuardada(solucion) {\n  const texto = useSyncExternalStore(suscribirse, leerTexto)\n  const partida = partidaDeHoy(texto, solucion)\n\n  function dispatch(accion) {\n    const actual = partidaDeHoy(leerTexto(), solucion)\n    const siguiente = partidaReducer(actual, accion)\n    if (siguiente !== actual) guardar(siguiente)\n  }\n\n  return [partida, dispatch]\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "// Las reglas de «Cinco letras» que no son de React: las palabras y cómo se\n// puntúa un intento. Todo en mayúsculas y sin tildes; la Ñ es una letra más.\nexport const LETRAS = 5\nexport const INTENTOS = 6\n\nexport const PALABRAS = [\n  'ARBOL', 'BARCO', 'CAÑAS', 'DUEÑO', 'FERIA', 'HUEVO', 'LAPIZ', 'OTOÑO',\n  'MONTE', 'NIEVE', 'PIANO', 'PLAZA', 'QUESO', 'RELOJ', 'SUEÑO', 'TECLA',\n  'VERDE', 'YEGUA', 'ZARZA', 'ARAÑA', 'PAPEL', 'TINTA', 'LETRA', 'PLUMA',\n  'FECHA', 'RADIO', 'CALLE', 'FIRMA', 'LIBRO', 'NIÑOS', 'PEÑAS', 'SEÑAL',\n  'CAÑON', 'LIMON', 'RATON', 'JAMON', 'ANGEL', 'FACIL', 'MOÑOS', 'BAÑOS',\n]\n\n// La palabra de cada pasatiempo sale de su número.\nexport function palabraDelDia(numero) {\n  return PALABRAS[numero % PALABRAS.length]\n}\n\n// null si la palabra se puede enviar; si no, el motivo.\nexport function comprobarIntento(palabra) {\n  if (palabra.length < LETRAS) return 'Faltan letras'\n  if (!PALABRAS.includes(palabra)) return `${palabra} no está en la lista`\n  return null\n}\n\n// Un estado por letra: 'correcta' (en su sitio), 'presente' (en otra\n// posición) o 'ausente'. Cada letra de la solución se empareja una sola vez.\nexport function evaluar(intento, solucion) {\n  const estados = Array(LETRAS).fill('ausente')\n  const libres = [...solucion]\n  // 1.ª pasada: las letras en su sitio\n  for (let i = 0; i < LETRAS; i++) {\n    if (intento[i] === solucion[i]) {\n      estados[i] = 'correcta'\n      libres[i] = null\n    }\n  }\n  // 2.ª pasada: las que están en otra posición, con las letras que quedan\n  for (let i = 0; i < LETRAS; i++) {\n    if (estados[i] === 'correcta') continue\n    const j = libres.indexOf(intento[i])\n    if (j !== -1) {\n      estados[i] = 'presente'\n      libres[j] = null\n    }\n  }\n  return estados\n}\n\nconst EN_PALABRAS = { correcta: 'en su sitio', presente: 'en otra posición', ausente: 'no está' }\n\n// «MONTE: M no está, O en otra posición...», para los lectores de pantalla.\nexport function describirIntento(intento, solucion) {\n  const estados = evaluar(intento, solucion)\n  const letras = [...intento].map((letra, i) => `${letra} ${EN_PALABRAS[estados[i]]}`)\n  return `${intento}: ${letras.join(', ')}`\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { describirIntento, evaluar, INTENTOS, LETRAS } from './palabras'\n\n// El tablero: una fila por intento, cada una con un nombre que se entiende\n// sin ver los colores («Intento 1, MONTE: M no está, O en otra posición...»).\nexport function Tablero({ partida }) {\n  const { intentos, actual, solucion } = partida\n  const filas = []\n  for (let i = 0; i < INTENTOS; i++) {\n    let palabra = ''\n    let estados = []\n    let nombre = `Intento ${i + 1}, vacío`\n    if (i < intentos.length) {\n      palabra = intentos[i]\n      estados = evaluar(palabra, solucion)\n      nombre = `Intento ${i + 1}, ${describirIntento(palabra, solucion)}`\n    } else if (i === intentos.length && actual !== '') {\n      palabra = actual\n      nombre = `Intento ${i + 1}, sin enviar: ${actual}`\n    }\n    filas.push(\n      <li key={i} className=\"fila\" aria-label={nombre}>\n        {Array.from({ length: LETRAS }, (_, j) => (\n          <span key={j} className={'casilla ' + (estados[j] ?? '')}>\n            {palabra[j]}\n          </span>\n        ))}\n      </li>,\n    )\n  }\n  return <ol className=\"tablero\">{filas}</ol>\n}\n\nconst FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']\nconst ORDEN = { ausente: 1, presente: 2, correcta: 3 }\n\n// Lo mejor que se sabe de cada letra jugada: si alguna vez salió en su\n// sitio, su tecla es verde aunque otra vez saliera en otra posición.\nfunction estadosDeLetras({ intentos, solucion }) {\n  const mejores = {}\n  for (const intento of intentos) {\n    evaluar(intento, solucion).forEach((estado, i) => {\n      const letra = intento[i]\n      if (ORDEN[estado] > (ORDEN[mejores[letra]] ?? 0)) mejores[letra] = estado\n    })\n  }\n  return mejores\n}\n\n// El teclado en pantalla: avisa con onPulsar('A'), onPulsar('Enviar')...\nexport function Teclado({ partida, onPulsar }) {\n  const estados = estadosDeLetras(partida)\n  return (\n    <div className=\"teclado\" role=\"group\" aria-label=\"Teclado\">\n      {FILAS.map((fila, i) => (\n        <div key={fila} className=\"fila-teclado\">\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Enviar')}>Enviar</button>}\n          {[...fila].map((letra) => (\n            <button key={letra} className={'tecla ' + (estados[letra] ?? '')} onClick={() => onPulsar(letra)}>\n              {letra}\n            </button>\n          ))}\n          {i === 2 && <button className=\"tecla ancha\" onClick={() => onPulsar('Borrar')}>Borrar</button>}\n        </div>\n      ))}\n    </div>\n  )\n}\n\n// Traduce un keydown del teclado físico a una tecla del juego: 'Enviar',\n// 'Borrar', una letra, o null si no es del juego.\nexport function leerTecla(evento) {\n  // Ctrl+F, Cmd+C...: los atajos son del navegador, no del juego\n  if (evento.ctrlKey || evento.metaKey || evento.altKey) return null\n  if (evento.key === 'Enter') return 'Enviar'\n  if (evento.key === 'Backspace') return 'Borrar'\n  if (evento.key.length !== 1) return null // Shift, Tab, F5, 'Dead'...\n  const letra = evento.key.toUpperCase()\n  if (letra === 'Ñ') return 'Ñ'\n  // Las tildes no cuentan: Á → A, Ü → U\n  const sinTilde = letra.normalize('NFD').replace(/\\p{Diacritic}/gu, '')\n  return /^[A-Z]$/.test(sinTilde) ? sinTilde : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f7f3ea;\n  color: #222;\n  font-family: system-ui, sans-serif;\n}\n\n.periodico {\n  max-width: 32rem;\n  margin: 0 auto;\n}\n\n/* La cabecera del periódico */\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 3px double #222;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font: 700 2rem/1 Georgia, 'Times New Roman', serif;\n}\n\nnav {\n  display: flex;\n  gap: 0.25rem;\n}\n\nnav button {\n  padding: 0.3rem 0.75rem;\n  border: 1px solid #222;\n  border-radius: 999px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  background: #222;\n  color: #f7f3ea;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  font: 700 1.25rem Georgia, 'Times New Roman', serif;\n  text-align: center;\n}\n\n/* El tablero: seis filas de cinco casillas */\n.tablero {\n  display: grid;\n  justify-content: center;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  gap: 0.35rem;\n}\n\n.casilla {\n  display: grid;\n  place-items: center;\n  height: 3rem;\n  border: 2px solid #d3cdbf;\n  background: #fff;\n  font-size: 1.5rem;\n  font-weight: 700;\n}\n\n.casilla:not(:empty) {\n  border-color: #6b675d;\n}\n\n/* Los tres colores, en las casillas y en las teclas */\n.casilla.correcta,\n.tecla.correcta {\n  border-color: #2f7a42;\n  background: #2f7a42;\n  color: #fff;\n}\n\n.casilla.presente,\n.tecla.presente {\n  border-color: #94700a;\n  background: #94700a;\n  color: #fff;\n}\n\n.casilla.ausente,\n.tecla.ausente {\n  border-color: #6b675d;\n  background: #6b675d;\n  color: #fff;\n}\n\n.aviso,\n.resultado,\n.final {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  text-align: center;\n}\n\n.aviso {\n  color: #9a3412;\n  font-weight: 700;\n}\n\n.final {\n  font-weight: 700;\n}\n\n/* El teclado en pantalla */\n.teclado {\n  display: grid;\n  gap: 0.35rem;\n}\n\n.fila-teclado {\n  display: flex;\n  justify-content: center;\n  gap: 0.25rem;\n}\n\n.tecla {\n  flex: 1;\n  max-width: 2.6rem;\n  height: 3rem;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: #ddd6c6;\n  color: #222;\n  font: 700 1rem system-ui, sans-serif;\n  cursor: pointer;\n}\n\n.tecla.ancha {\n  flex: 1.6;\n  max-width: 4.5rem;\n  font-size: 0.8rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n.teaser {\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": true
}
```

Este es el viaje completo de una tecla, de tu dedo al lector de pantalla:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Pulsas Intro con OTOÑO escrito",
  "items": [
    {
      "fecha": "keydown",
      "titulo": "El escuchador de window",
      "texto": "El navegador lanza keydown y llega al único escuchador, el que puso el efecto al montar. Es alPulsarTecla, el evento de efecto."
    },
    {
      "fecha": "Evento",
      "titulo": "leerTecla y manejarTecla",
      "texto": "leerTecla traduce Intro a Enviar, preventDefault evita que un botón con el foco se pulse también, y manejarTecla, el de ahora, comprueba OTOÑO y despacha intento_enviado."
    },
    {
      "fecha": "Almacén",
      "titulo": "El reducer y localStorage",
      "texto": "dispatch lee la partida guardada, partidaReducer la pasa a ganada y guardar la escribe en localStorage y avisa a los oyentes."
    },
    {
      "fecha": "Render",
      "titulo": "useSyncExternalStore",
      "texto": "React vuelve a leer el texto guardado, ve que ha cambiado y renderiza CincoLetras. Tablero colorea la fila, Teclado sus teclas, y textoDelResultado calcula el anuncio."
    },
    {
      "fecha": "Commit",
      "titulo": "La región anuncia",
      "texto": "Cambia el texto de la región de estado, y el lector de pantalla lee el intento letra a letra, terminado en «¡Acertaste!». El escuchador sigue donde estaba: el efecto no se ha vuelto a ejecutar."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un reducer con fases",
      "texto": "Un asistente de varios pasos, un reproductor, un pago (pendiente, confirmado, rechazado): todo lo que tenga estados finales y transiciones que no siempre valen. El reducer las protege vengan de donde vengan."
    },
    {
      "titulo": "Atajos de teclado globales",
      "texto": "Las flechas en una galería, Escape para cerrar, Ctrl+S en un editor: un efecto que escucha window con su limpieza, y un evento de efecto para leer el estado actual sin volver a suscribirse."
    },
    {
      "titulo": "Lo que tiene que sobrevivir a recargar",
      "texto": "Un borrador, un carrito, las preferencias: localStorage como almacén externo con useSyncExternalStore, y lo efímero (avisos, menús abiertos) fuera de lo que se guarda."
    },
    {
      "titulo": "Interfaces que cambian sin mover el foco",
      "texto": "Resultados de búsqueda, «Guardado», el resultado de una jugada: una región viva que existe desde el principio y cuyo texto se calcula a partir del estado."
    }
  ]
}
```

## Errores típicos

**Olvidar la limpieza.** Con el escuchador declarado dentro del efecto, como en el paso 2, `StrictMode` te lo dice enseguida: quedan dos escuchadores al montar y, con `[manejarTecla]`, uno más en cada render. Al escribir «plaza» sale «PPLLL». Con el evento de efecto pasado tal cual es más traicionero: el ensayo de `StrictMode` vuelve a añadir **la misma función**, y `addEventListener` no añade dos veces la misma función al mismo objeto (lo dice MDN). Una sola letra por tecla, todo parece bien... hasta que cambias a «Portada». El componente se ha desmontado, pero su escuchador sigue en `window`: escribe «plaza» en la portada, vuelve, y la partida tiene PLAZA escrita. La limpieza no es opcional porque `StrictMode` no proteste.

**Callar al linter con `[]`.** Es el fallo que arreglaste en el paso 4: el escuchador se queda con el primer render. Lo engañoso es que funciona a medias, porque `dispatch` no cambia y las letras entran.

**Olvidar `preventDefault()`.** Un fallo que solo aparece cuando mezclas los dos teclados:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "useEffect(() => {\n  window.addEventListener('keydown', alPulsarTecla)\n  return () => window.removeEventListener('keydown', alPulsarTecla)\n}, [])\n\n// alPulsarTecla, sin evento.preventDefault():\nconst alPulsarTecla = useEffectEvent((evento) => {\n  const tecla = leerTecla(evento)\n  if (tecla !== null) manejarTecla(tecla)\n})\n\n// Pulsas M, O, N, T y E con el ratón en el teclado de la pantalla\n// y después Intro en tu teclado. ¿Qué pasa?",
  "opciones": [
    "Se envía MONTE, sin más",
    "Se envía MONTE y aparece una E en la fila 2",
    "No pasa nada: el foco está en un botón, no en window",
    "Se envía MONTE dos veces"
  ],
  "correcta": 1,
  "explicacion": "El keydown nace en el botón E, que conserva el foco tras el clic (salvo en Safari), y sube hasta window: el escuchador envía MONTE. Pero nadie ha cancelado el evento, así que el navegador hace lo de siempre con Intro en un botón: pulsarlo. El clic llega a manejarTecla como una E, y ya en la fila 2. Con preventDefault, el navegador no pulsa el botón."
}
```

**Una máquina de estados sin estados finales.** Si el reducer no corta al principio con la fase, nada impide seguir jugando después de ganar. Y lo que pasa es peor que seguir jugando:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export function partidaReducer(partida, accion) {\n  // Sin: if (partida.fase !== 'jugando') return partida\n  switch (accion.tipo) {\n    // ...letra_anadida y letra_borrada, como en el paso 1\n    case 'intento_enviado': {\n      if (comprobarIntento(partida.actual) !== null) return partida\n      const intentos = [...partida.intentos, partida.actual]\n      let fase = 'jugando'\n      if (partida.actual === partida.solucion) fase = 'ganada'\n      else if (intentos.length === INTENTOS) fase = 'perdida'\n      return { ...partida, intentos, actual: '', fase }\n    }\n  }\n}\n\n// Con el App.jsx del paso 3, que despacha todas las teclas:\n// aciertas OTOÑO a la primera y, sin darte cuenta, escribes\n// «monte» y pulsas Intro. ¿Qué ves?",
  "opciones": [
    "Nada cambia: la partida ya está ganada",
    "MONTE ocupa la fila 2, pero «¡Acertaste!» sigue ahí",
    "MONTE ocupa la fila 2 y «¡Acertaste!» desaparece: la partida vuelve a estar en juego",
    "Un error: «Acción desconocida: intento_enviado»"
  ],
  "correcta": 2,
  "explicacion": "Sin la guarda, las letras de MONTE entran en la fila 2 y el envío vale: MONTE está en la lista. La fase se recalcula con el último intento, que ya no es la solución, y con dos intentos de seis vuelve a ser jugando. Has «desganado» la partida. Una línea al principio del reducer convierte ganada y perdida en estados finales."
}
```

**Guardar lo que no es de la partida.** Si el aviso viviera en el reducer, se guardaría en `localStorage` con lo demás y aparecería al volver a la página. Lo efímero va en su propio estado.

**Un `getSnapshot` que hace `JSON.parse`.** Devuelve un objeto nuevo en cada llamada, y React entiende que el almacén cambia sin parar: «The result of getSnapshot should be cached to avoid an infinite loop», y después «Maximum update depth exceeded» (lección 46). Devuelve el texto y conviértelo fuera, o guarda el último objeto.

**Una región viva que aparece con el texto dentro.** `{anuncio && <p role="status">{anuncio}</p>}` se ve igual, pero un lector de pantalla puede no anunciarla. La región va siempre; lo que cambia es su contenido.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El reducer es la máquina de estados",
      "texto": "Tres fases, dos de ellas finales, y una sola función que decide qué acciones valen en cada una. Si no vale, devuelve la misma partida y React no renderiza nada."
    },
    {
      "titulo": "Calcular en vez de guardar",
      "texto": "Los colores del tablero, los del teclado, el nombre de cada fila y el anuncio salen de intentos y solucion en cada render. La partida guarda solo lo que no se puede calcular."
    },
    {
      "titulo": "Una sola puerta de entrada",
      "texto": "El teclado en pantalla y el físico llaman a manejarTecla. El físico necesita un efecto porque window no es de React; lo que hace cada tecla es igual para los dos."
    },
    {
      "titulo": "Escuchar es el efecto, reaccionar es el evento",
      "texto": "El efecto pone y quita el escuchador mientras el juego está en pantalla. useEffectEvent hace que cada tecla lea la partida más reciente sin volver a suscribirse."
    },
    {
      "titulo": "El mismo reducer, otro almacén",
      "texto": "Con useSyncExternalStore sobre localStorage, la partida sobrevive a desmontar el componente y la portada la lee sin props. El reducer no cambió ni una línea."
    },
    {
      "titulo": "Anunciar lo que cambia",
      "texto": "Una región de estado que existe desde el principio, con un texto calculado que solo cambia al enviar un intento. Los avisos, en otra."
    }
  ]
}
```

## Retos para seguir practicando

Parte de la partida completa. Estos no tienen comprobación automática:

1. **Agitar la fila que no vale.** Cuando salga «Faltan letras» o «... no está en la lista», haz que la fila actual tiemble. Necesitas una ref a su `<li>` (lección 34) y `elemento.animate()`, llamado desde `manejarTecla`: es la respuesta a un evento, no algo que sincronizar.
2. **Un Hook `useTecladoFisico(onTecla)`.** Saca el efecto y el evento de efecto de `CincoLetras` a un Hook propio (lección 43). El evento de efecto va dentro del Hook, junto a su efecto, como pide la lección 41; `CincoLetras` se queda en `useTecladoFisico(manejarTecla)`.
3. **«Cómo se juega» en un diálogo.** Un botón abre las reglas en un diálogo con un portal (lección 36). Mientras está abierto, el teclado físico no debe escribir en la partida: ¿dónde lees `ayudaAbierta` para que el escuchador no se vuelva a poner al abrir y cerrar?
4. **Estadísticas.** Partidas jugadas, porcentaje de victorias y racha, en su propia clave de `localStorage` y con su propio almacén. Piensa cuándo se suman: en el momento en que la partida pasa a `'ganada'` o `'perdida'`, no en un efecto que vigile la fase (lección 39), porque volver a la sección contaría la misma partida otra vez.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useReducer",
      "descripcion": "La referencia completa: la función de inicio, por qué StrictMode llama dos veces al reducer y cómo evitar recalcular el estado inicial.",
      "url": "https://react.dev/reference/react/useReducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useEffectEvent",
      "descripcion": "Con el ejemplo del escuchador de window que lee el último valor sin volver a suscribirse, el mismo patrón que el teclado de este proyecto.",
      "url": "https://react.dev/reference/react/useEffectEvent",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "Suscribirse a un almacén externo, por qué getSnapshot tiene que devolver lo mismo mientras nada cambie y cómo leer datos del navegador.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Separating Events from Effects",
      "descripcion": "La diferencia entre lo que sincroniza un efecto y lo que hace un evento, que decide dónde va cada línea del teclado.",
      "url": "https://react.dev/learn/separating-events-from-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "ARIA live regions",
      "descripcion": "Cómo y cuándo anuncian los lectores de pantalla los cambios de una región viva, y por qué conviene que exista antes de cambiar.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      "etiqueta": "MDN"
    },
    {
      "titulo": "KeyboardEvent: key",
      "descripcion": "Los valores de key: Enter, Backspace, las letras con sus tildes y Dead para las teclas muertas, todo lo que tiene que traducir leerTecla.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key",
      "etiqueta": "MDN"
    }
  ]
}
```
