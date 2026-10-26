# `useEffectEvent`: separar eventos de efectos

- **Módulo:** Efectos
- **Slug:** `useeffectevent-separar-eventos-de-efectos` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) + [useEffectEvent](https://react.dev/reference/react/useEffectEvent) — ver `contenido/react/TEMARIO.md` #41

---

## Qué es y para qué sirve

En la lección 40 viste que un efecto **reacciona** a todos los valores reactivos que lee: si cambia uno, para y vuelve a empezar. Casi siempre es lo que quieres. Pero a veces un efecto necesita **leer** un valor sin **seguirlo**: usarlo cuando pasa algo, sin volver a sincronizarse cada vez que cambia.

El ejemplo de esta lección es **Órdago, una web para jugar al mus en línea**. Al elegir una mesa te conectas al servidor de partidas, y cada vez que alguien se sienta te llega un aviso, con sonido o en silencio según tu preferencia. Conectarse a la mesa depende de la mesa. El aviso depende de la preferencia, pero **cambiar la preferencia no debería sacarte de la mesa**: en una partida de verdad perderías tu sitio.

React 19.2 (octubre de 2025) añadió un Hook para esto, `useEffectEvent`. Separa del efecto la parte que se comporta como un manejador de eventos: un **evento de efecto**.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres sitios para tu lógica",
  "roles": [
    {
      "etiqueta": "Manejador de evento",
      "rol": "Responde a una interacción concreta",
      "descripcion": "Pulsar «Pedir mus» envía la jugada. Lee los valores de su render, pero no se repite porque cambien: solo se ejecuta si vuelves a pulsar (lección 15)."
    },
    {
      "etiqueta": "Efecto",
      "rol": "Sincroniza mientras haga falta",
      "descripcion": "Estar conectado a la mesa elegida. Es reactivo: si cambia un valor que lee, para y vuelve a empezar (lecciones 38 y 40)."
    },
    {
      "etiqueta": "Evento de efecto",
      "rol": "Lo dispara un efecto, actúa como un manejador",
      "descripcion": "Avisar cuando alguien se sienta. Lo llama el efecto cuando pasa algo; lee los valores más recientes sin volverlos reactivos."
    }
  ]
}
```

La pregunta que decide dónde va cada línea es **por qué tiene que ejecutarse**. Enviar la jugada pasa porque el jugador pulsó un botón: manejador. Estar conectado pasa porque la mesa está en pantalla: efecto. Avisar pasa porque el servidor dice que alguien se ha sentado, algo que llega a través del efecto, pero que **no tiene nada que sincronizar con tu preferencia de sonido**: es un evento.

## El problema: un valor que quieres leer, pero no seguir

Esta es la versión sin `useEffectEvent`. El efecto lee `silencio` para escribir cada aviso, así que `silencio` es una dependencia. Al pulsar «Silenciar avisos» pasa lo que estudiaste en la lección 40, y aquí no lo quieres.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Silenciar los avisos te saca de la mesa",
  "consigna": "Espera a que lleguen un par de avisos y pulsa «Silenciar avisos». Mira las tres cosas: el registro de efectos, la consola y el número de conexión de los avisos nuevos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { conectarMesa } from './mesas'\nimport './estilos.css'\n\nfunction Mesa({ mesa, silencio }) {\n  const [avisos, setAvisos] = useState([])\n\n  useEffect(() => {\n    const conexion = conectarMesa(mesa)\n    conexion.alSentarseAlguien(({ id, jugador }) => {\n      const sonido = silencio ? 'en silencio' : 'con sonido'\n      const texto = `${jugador} se ha sentado (conexión ${conexion.numero}, ${sonido})`\n      setAvisos((anteriores) => [...anteriores.slice(-2), { id, texto }])\n    })\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [mesa, silencio])\n\n  return (\n    <section>\n      <h2>Mesa {mesa}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [mesa, setMesa] = useState(1)\n  const [silencio, setSilencio] = useState(false)\n\n  return (\n    <main>\n      <h1>Órdago, mus en línea</h1>\n      <div role=\"group\" aria-label=\"Mesa\">\n        {[1, 2, 3].map((n) => (\n          <button key={n} aria-pressed={n === mesa} onClick={() => setMesa(n)}>\n            Mesa {n}\n          </button>\n        ))}\n      </div>\n      <button aria-pressed={silencio} onClick={() => setSilencio(!silencio)}>\n        Silenciar avisos\n      </button>\n      <Mesa mesa={mesa} silencio={silencio} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "mesas.jsx",
      "codigo": "// Simula el servidor de partidas de Órdago: mientras estás conectado a\n// una mesa, cada 0,6 s se sienta alguien. Cada conexión lleva su número.\nconst JUGADORES = ['Lucía', 'Martín', 'Begoña', 'Íñigo', 'Charo', 'Paco']\nlet ultimaConexion = 0\nlet ultimoAviso = 0\n\nexport function conectarMesa(mesa) {\n  const numero = ++ultimaConexion\n  let alSentarse = null\n  let temporizador = null\n  return {\n    numero,\n    alSentarseAlguien(funcion) {\n      alSentarse = funcion\n    },\n    conectar() {\n      console.log(`🔌 Conexión ${numero}: entras en la mesa ${mesa}`)\n      let turno = mesa\n      temporizador = setInterval(() => {\n        const jugador = JUGADORES[turno++ % JUGADORES.length]\n        alSentarse?.({ id: ++ultimoAviso, jugador })\n      }, 600)\n    },\n    desconectar() {\n      console.log(`❌ Conexión ${numero}: sales de la mesa ${mesa}`)\n      clearInterval(temporizador)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #166534;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #166534;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El registro enseña «⟲ limpieza» y «▶ efecto · cambió silencio: false → true». La consola, «❌ Conexión 2: sales de la mesa 1» y «🔌 Conexión 3: entras en la mesa 1». Y los avisos nuevos ya llegan por la **conexión 3**: para silenciar un sonido, te has levantado de la mesa y te has vuelto a sentar.

Quitar `silencio` de la lista no es una salida. El linter lo marca:

```text
React Hook useEffect has a missing dependency: 'silencio'. Either include it or remove the dependency array
```

Y además tiene razón, porque sin `silencio` en la lista el efecto se queda con el valor de cuando se conectó:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "useEffect(() => {\n  const conexion = conectarMesa(mesa)\n  conexion.alSentarseAlguien(({ id, jugador }) => {\n    const sonido = silencio ? 'en silencio' : 'con sonido'\n    // ...añade el aviso con el número de conexión y el sonido\n  })\n  conexion.conectar()\n  return () => conexion.desconectar()\n}, [mesa]) // «silencio no tiene que reconectar»\n\n// Estás en la mesa 1 (conexión 2) y pulsas «Silenciar avisos».\n// ¿Cómo llegan los avisos siguientes?",
  "opciones": [
    "«(conexión 2, en silencio)»: justo lo que se quería",
    "«(conexión 2, con sonido)»: el silencio no se aplica",
    "«(conexión 3, en silencio)»: se reconecta igualmente",
    "Dejan de llegar avisos"
  ],
  "correcta": 1,
  "explicacion": "El callback que recibe los avisos se creó cuando el efecto se ejecutó, y vio el silencio de ese render: false. Como el efecto ya no se vuelve a ejecutar al cambiar silencio, el callback viejo sigue leyendo false para siempre. No se reconecta, pero tampoco se entera. Es el valor rancio que el linter intentaba evitar."
}
```

Ninguna de las dos opciones vale: con `silencio` en la lista te reconectas; sin él, lees un valor viejo. Hace falta separar el código en dos partes: **la conexión, que sí es reactiva, y el aviso, que no debe serlo**.

## `useEffectEvent`: sacar del efecto la parte que no es reactiva

`useEffectEvent` recibe una función y devuelve otra, el evento de efecto, que puedes llamar desde dentro del efecto. Lo que hay dentro **no es reactivo**: lee las props y el estado más recientes cada vez que se llama, pero no hace que el efecto se vuelva a sincronizar cuando cambian. Es la misma app que antes, con el aviso sacado a un evento de efecto (el servidor va en el mismo archivo para poder anotarlo todo):

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El aviso, en un evento de efecto",
  "codigo": "import { useEffect, useEffectEvent, useState } from 'react'\n\n// El servidor de partidas, simulado: cada 0,6 s se sienta alguien\nconst JUGADORES = ['Lucía', 'Martín', 'Begoña', 'Íñigo', 'Charo', 'Paco']\nlet ultimaConexion = 0\nlet ultimoAviso = 0\n\nfunction conectarMesa(mesa) {\n  const numero = ++ultimaConexion\n  let alSentarse = null\n  let temporizador = null\n  return {\n    numero,\n    alSentarseAlguien(funcion) {\n      alSentarse = funcion\n    },\n    conectar() {\n      console.log(`🔌 Conexión ${numero}: entras en la mesa ${mesa}`)\n      let turno = mesa\n      temporizador = setInterval(() => {\n        const jugador = JUGADORES[turno++ % JUGADORES.length]\n        alSentarse?.({ id: ++ultimoAviso, jugador })\n      }, 600)\n    },\n    desconectar() {\n      console.log(`❌ Conexión ${numero}: sales de la mesa ${mesa}`)\n      clearInterval(temporizador)\n    },\n  }\n}\n\nfunction Mesa({ mesa, silencio }) {\n  const [avisos, setAvisos] = useState([])\n\n  const alSentarse = useEffectEvent(({ id, jugador }, numero) => {\n    const sonido = silencio ? 'en silencio' : 'con sonido'\n    const texto = `${jugador} se ha sentado (conexión ${numero}, ${sonido})`\n    setAvisos((anteriores) => [...anteriores.slice(-2), { id, texto }])\n  })\n\n  useEffect(() => {\n    const conexion = conectarMesa(mesa)\n    conexion.alSentarseAlguien((aviso) => alSentarse(aviso, conexion.numero))\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [mesa])\n\n  return (\n    <section>\n      <h2>Mesa {mesa}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [mesa, setMesa] = useState(1)\n  const [silencio, setSilencio] = useState(false)\n\n  return (\n    <main>\n      <h1>Órdago, mus en línea</h1>\n      <div role=\"group\" aria-label=\"Mesa\">\n        {[1, 2, 3].map((n) => (\n          <button key={n} aria-pressed={n === mesa} onClick={() => setMesa(n)}>\n            Mesa {n}\n          </button>\n        ))}\n      </div>\n      <button aria-pressed={silencio} onClick={() => setSilencio(!silencio)}>\n        Silenciar avisos\n      </button>\n      <Mesa mesa={mesa} silencio={silencio} />\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #166534;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #166534;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n}",
  "anotaciones": [
    {
      "fragmento": "import { useEffect, useEffectEvent, useState } from 'react'",
      "nota": "useEffectEvent se importa de react, como los demás Hooks. Forma parte de la versión estable desde React 19.2."
    },
    {
      "fragmento": "const alSentarse = useEffectEvent(({ id, jugador }, numero) => {",
      "nota": "Se declara arriba del componente, como cualquier Hook, justo al lado del efecto que lo usa. Puede recibir argumentos: aquí, el aviso del servidor y el número de la conexión que lo trae."
    },
    {
      "fragmento": "const sonido = silencio ? 'en silencio' : 'con sonido'",
      "nota": "Lee silencio, una prop. Dentro de un evento de efecto eso no la convierte en dependencia de nadie: cuando se llame, verá el valor más reciente."
    },
    {
      "fragmento": "conexion.alSentarseAlguien((aviso) => alSentarse(aviso, conexion.numero))",
      "nota": "El efecto llama al evento cuando pasa algo, aquí cada vez que el servidor avisa. Es el único sitio desde el que se debe llamar: un efecto u otro evento de efecto del mismo componente."
    },
    {
      "fragmento": "  }, [mesa])",
      "nota": "Solo mesa. El efecto ya no lee silencio (lo lee el evento), y alSentarse no va en la lista: los eventos de efecto no son dependencias, y el linter lo sabe."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Ahora pulsa «Silenciar avisos»: **el registro de efectos no se mueve**, la consola tampoco, y los avisos siguientes llegan como «(conexión 2, en silencio)». Vuelve a pulsar y regresan «con sonido», siempre por la misma conexión. Cambiar de mesa, en cambio, sí reconecta: «⟲ limpieza» y «▶ efecto · cambió mesa: 1 → 2», porque `mesa` sigue siendo una dependencia.

Un evento de efecto se parece mucho a un manejador de eventos. La diferencia es quién lo dispara: a un manejador lo llama el navegador cuando el usuario hace algo; a un evento de efecto lo llamas tú desde un efecto, cuando el sistema externo avisa de algo. **Rompe la cadena** entre la reactividad del efecto y el código que no debe ser reactivo.

## Siempre ve lo último

Un manejador lee los valores del render en que se creó: la instantánea de la lección 18. Un evento de efecto no. La referencia de React dice que, al llamarlo, accede a **los últimos valores confirmados** del render, los del último commit. Por eso el aviso de la conexión 2 se entera del silencio aunque la conexión se abrió antes de pulsarlo.

En la lección 33, el avisador del horno conseguía lo mismo a mano: copiaba el valor en una ref para que el temporizador leyera lo último. Antes de React 19.2, en los efectos se hacía igual, y lo encontrarás en código de esa época:

```jsx
// Antes de useEffectEvent: una ref con el último valor
const silencioRef = useRef(silencio)
useEffect(() => {
  silencioRef.current = silencio
})

useEffect(() => {
  const conexion = conectarMesa(mesa)
  conexion.alSentarseAlguien(({ id, jugador }) => {
    const sonido = silencioRef.current ? 'en silencio' : 'con sonido'
    // ...
  })
  conexion.conectar()
  return () => conexion.desconectar()
}, [mesa])
```

Funciona, pero es más código y más fácil de romper: hay que acordarse de copiar el valor en cada render, y la ref se puede escribir desde cualquier parte del componente. Con `useEffectEvent` la intención queda escrita: «esto es un evento que dispara este efecto».

## Pásale lo que forma parte del evento

En el ejemplo, el número de conexión llega como **argumento** y el silencio se lee **dentro**. No es casualidad. El número describe el evento («alguien se ha sentado en la conexión 2»), y tiene que ser el de la conexión que lo trae. El silencio es una preferencia que quieres leer tal como está en ese momento. La diferencia se nota cuando hay algo asíncrono por medio:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Historial({ mesa }) {\n  const alApuntar = useEffectEvent((mesaDelEvento) => {\n    console.log(`Apuntada la mesa ${mesaDelEvento} · ahora estás en la ${mesa}`)\n  })\n\n  useEffect(() => {\n    setTimeout(() => alApuntar(mesa), 1000)\n  }, [mesa])\n  // ...\n}\n\n// Pasas a la mesa 2 y, medio segundo después, a la 3.\n// ¿Qué escribe el temporizador que puso la mesa 2?",
  "opciones": [
    "«Apuntada la mesa 2 · ahora estás en la 2»",
    "«Apuntada la mesa 2 · ahora estás en la 3»",
    "«Apuntada la mesa 3 · ahora estás en la 3»",
    "Nada: el cambio a la mesa 3 cancela el temporizador"
  ],
  "correcta": 1,
  "explicacion": "El argumento es el valor que el efecto le pasó al programar el temporizador, con mesa igual a 2: es parte del evento. Lo que se lee dentro es lo más reciente cuando el temporizador salta, y para entonces ya estás en la 3. No se cancela porque el efecto no devuelve ninguna limpieza."
}
```

**Lo que pertenece al evento, pásalo como argumento desde el efecto. Lo que solo quieres consultar en ese momento, léelo dentro.** Hay una ventaja más: si el evento recibe `mesa` como argumento, el efecto tiene que leer `mesa` para pasársela, y el linter te obligará a mantenerla en la lista. Si la leyera el evento por dentro, podrías quitarla de la lista sin que nadie avisara, y dejarías de apuntar los cambios de mesa.

## Sus límites

Un evento de efecto es una pieza no reactiva **de un efecto concreto**. De ahí salen sus tres reglas.

### Solo se llama desde efectos

Desde un `useEffect` (o un `useLayoutEffect` o `useInsertionEffect`, lección 45) o desde otro evento de efecto del mismo componente. Si lo llamas **mientras el componente se renderiza**, React lanza un error:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un evento de efecto llamado durante el render",
  "consigna": "La vista previa no llega a pintarse: lee el error. Después piensa dónde debería sonar el aviso de entrada: cuando el servidor confirme que has entrado, dentro del efecto que se conecta, no en el cuerpo del componente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffectEvent, useState } from 'react'\nimport './estilos.css'\n\nfunction Mesa({ mesa, silencio }) {\n  const sonar = useEffectEvent(() => {\n    if (!silencio) console.log('🔔 ¡Clin!')\n  })\n\n  // 🚩 «Que suene al entrar en la mesa»\n  sonar()\n\n  return <h2>Mesa {mesa}</h2>\n}\n\nexport default function App() {\n  const [silencio, setSilencio] = useState(false)\n\n  return (\n    <main>\n      <h1>Órdago, mus en línea</h1>\n      <button aria-pressed={silencio} onClick={() => setSilencio(!silencio)}>\n        Silenciar avisos\n      </button>\n      <Mesa mesa={1} silencio={silencio} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #166534;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #166534;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

El mensaje del recuadro:

```text
A function wrapped in useEffectEvent can't be called during rendering.
```

Es decir: una función envuelta en `useEffectEvent` no se puede llamar durante el render. El render tiene que ser puro (lección 12), y un evento es algo que pasa después, no una parte del cálculo de qué se pinta. Si lo que querías era ejecutar lógica al renderizar, no la envuelvas: escríbela directamente en el cuerpo.

**Tampoco desde un manejador**, aunque ahí React no lo impide al ejecutar: si llamas a `alSentarse` en el `onClick` de un botón, funciona. Pero la documentación lo prohíbe igual, el linter lo marca como error y no ganas nada: un manejador ya se ejecuta cuando toca, con los valores de su render. Para un manejador, una función normal.

### No se pasa a otros componentes ni a otros Hooks

Un evento de efecto es del efecto que tiene al lado. Si lo pasas como prop a un hijo o como argumento a un Hook propio, el que lo recibe no sabe que no es una función normal: la pondrá en sus listas, la llamará desde manejadores... Si un Hook personalizado necesita un callback no reactivo, **declara el evento de efecto dentro del Hook**, junto a su efecto. Lo verás en la lección 43.

### No va en la lista de dependencias

`useEffectEvent` devuelve **una función distinta en cada render**, a propósito: así, si alguien la pone en una lista, se nota enseguida. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un evento de efecto en la lista de dependencias",
  "consigna": "Mira el registro de efectos y los avisos: cada aviso provoca un render, y cada render, una reconexión. Martín se sienta una y otra vez, siempre por una conexión nueva. Quita alSentarse de la lista y comprueba que se acaba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useEffectEvent, useState } from 'react'\nimport { conectarMesa } from './mesas'\nimport './estilos.css'\n\nfunction Mesa({ mesa, silencio }) {\n  const [avisos, setAvisos] = useState([])\n\n  const alSentarse = useEffectEvent(({ id, jugador }, numero) => {\n    const sonido = silencio ? 'en silencio' : 'con sonido'\n    const texto = `${jugador} se ha sentado (conexión ${numero}, ${sonido})`\n    setAvisos((anteriores) => [...anteriores.slice(-2), { id, texto }])\n  })\n\n  useEffect(() => {\n    const conexion = conectarMesa(mesa)\n    conexion.alSentarseAlguien((aviso) => alSentarse(aviso, conexion.numero))\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [mesa, alSentarse]) // 🚩 un evento de efecto en la lista\n\n  return (\n    <section>\n      <h2>Mesa {mesa}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [mesa, setMesa] = useState(1)\n  const [silencio, setSilencio] = useState(false)\n\n  return (\n    <main>\n      <h1>Órdago, mus en línea</h1>\n      <div role=\"group\" aria-label=\"Mesa\">\n        {[1, 2, 3].map((n) => (\n          <button key={n} aria-pressed={n === mesa} onClick={() => setMesa(n)}>\n            Mesa {n}\n          </button>\n        ))}\n      </div>\n      <button aria-pressed={silencio} onClick={() => setSilencio(!silencio)}>\n        Silenciar avisos\n      </button>\n      <Mesa mesa={mesa} silencio={silencio} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "mesas.jsx",
      "codigo": "// Simula el servidor de partidas de Órdago: mientras estás conectado a\n// una mesa, cada 0,6 s se sienta alguien. Cada conexión lleva su número.\nconst JUGADORES = ['Lucía', 'Martín', 'Begoña', 'Íñigo', 'Charo', 'Paco']\nlet ultimaConexion = 0\nlet ultimoAviso = 0\n\nexport function conectarMesa(mesa) {\n  const numero = ++ultimaConexion\n  let alSentarse = null\n  let temporizador = null\n  return {\n    numero,\n    alSentarseAlguien(funcion) {\n      alSentarse = funcion\n    },\n    conectar() {\n      console.log(`🔌 Conexión ${numero}: entras en la mesa ${mesa}`)\n      let turno = mesa\n      temporizador = setInterval(() => {\n        const jugador = JUGADORES[turno++ % JUGADORES.length]\n        alSentarse?.({ id: ++ultimoAviso, jugador })\n      }, 600)\n    },\n    desconectar() {\n      console.log(`❌ Conexión ${numero}: sales de la mesa ${mesa}`)\n      clearInterval(temporizador)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #166534;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #166534;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El registro lo dice claro: «▶ efecto · cambió alSentarse: ƒ anónima() → ƒ anónima()», una y otra vez. Cada aviso guarda un estado, el componente se vuelve a renderizar, `useEffectEvent` devuelve una función nueva y React, al comparar la lista, la encuentra distinta. Por eso la regla es tajante: **un evento de efecto nunca va en la lista**. No hace falta, porque no es reactivo.

## Lo que vigila el linter

Los dos linters de la plantilla de Vite (lección 2) conocen `useEffectEvent`: no te piden que lo pongas en la lista, y vigilan las tres reglas anteriores. Estos son los mensajes de `eslint-plugin-react-hooks` 7.1, el que instala la plantilla si eliges ESLint; Oxlint, la opción por defecto, da los mismos avisos, a veces con el final en una línea `help` aparte. Si llamas al evento fuera de un efecto, en el render o en un manejador, o se lo pasas a un Hook:

```text
`alSentarse` is a function created with React Hook "useEffectEvent", and can only be called from Effects and Effect Events in the same component
```

Si se lo pasas a un componente hijo como prop, el mismo mensaje termina con «It cannot be assigned to a variable or passed down». Y si lo pones en la lista:

```text
Functions returned from `useEffectEvent` must not be included in the dependency array. Remove `alSentarse` from the list
```

Es decir: las funciones de `useEffectEvent` solo se pueden llamar desde efectos y eventos de efecto del mismo componente, no se pueden guardar en otra variable ni pasar hacia abajo, y no deben ir en la lista de dependencias. Los dos primeros son de la regla `rules-of-hooks` y salen como **error**; el último es de `exhaustive-deps` y sale como **aviso**.

Hay algo que el linter **no** puede ver: si usas `useEffectEvent` para esconder una dependencia que sí debería volver a sincronizar el efecto.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No lo uses para esconder dependencias",
  "contenido": "Si metes la conexión entera en un evento de efecto y lo llamas desde un efecto con [], el linter no protesta, porque formalmente todo está en regla. Pero la conexión se queda en la primera mesa: cambias a la 2 y los avisos siguen llegando de la 1. useEffectEvent es solo para lo que de verdad es un evento. Si un valor debe volver a sincronizar el efecto, se queda en la lista."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Avisos que dependen de tus preferencias",
      "texto": "Un aviso al conectarte o al recibir un mensaje, con el tema, el idioma o el sonido que tengas elegidos. Cambiar la preferencia no debe reconectar nada. Es el ejemplo de la lección, y el de react.dev con una sala de chat."
    },
    {
      "titulo": "Registrar visitas con datos del momento",
      "texto": "Apuntar en la analítica que has abierto una página, junto con lo que llevas en el carrito. La página es una dependencia (cada página es una visita); el carrito se lee dentro del evento, y meter algo en él no cuenta como otra visita."
    },
    {
      "titulo": "Temporizadores que leen lo último",
      "texto": "Un setInterval que cada segundo suma lo que marque un control: el evento de efecto lee el valor actual sin parar y volver a arrancar el intervalo cada vez que cambia."
    },
    {
      "titulo": "Escuchar el teclado o la ventana",
      "texto": "Un listener de keydown en window que actúa según el estado actual. Se añade una vez y el evento de efecto lee el estado. Lo usarás en el Wordle del proyecto 47."
    },
    {
      "titulo": "Dentro de tus propios Hooks",
      "texto": "Un useIntervalo(callback, ms) que envuelve el callback en useEffectEvent para que el intervalo no se reinicie cuando el componente le pasa una función nueva en cada render. Lección 43."
    }
  ]
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "useEffectEvent es un useCallback que nunca cambia",
      "realidad": "Al revés: devuelve una función distinta en cada render, a propósito. No es para pasarla ni para ponerla en listas; solo para llamarla desde los efectos de su componente."
    },
    {
      "mito": "Sirve para quitar las dependencias que molestan",
      "realidad": "Solo para la parte de un efecto que es un evento. Si un valor debe volver a sincronizar el efecto, va en la lista. Para quitar dependencias hay otras técnicas, en la lección 42."
    },
    {
      "mito": "Lee los valores del render en que se declaró",
      "realidad": "Lee los últimos valores confirmados en el momento de llamarlo. Por eso sirve para callbacks que llegan tarde: avisos, temporizadores, listeners."
    },
    {
      "mito": "Puedo usarlo como manejador de onClick",
      "realidad": "Funcionaría, pero el linter lo marca como error y no aporta nada: un manejador ya se ejecuta cuando toca y con los valores de su render."
    },
    {
      "mito": "Si lo meto en un efecto, ya no hace falta pensar en las dependencias",
      "realidad": "El efecto sigue siendo reactivo y sus dependencias siguen siendo todo lo que lee. Lo único que cambia es que lo que lee el evento ya no lo lee el efecto."
    }
  ]
}
```

## Errores típicos

**Llamarlo durante el render.** React lanza «A function wrapped in useEffectEvent can't be called during rendering.» y la vista no se pinta. Si es lógica de render, no la envuelvas; si es un evento, llámalo desde el efecto, cuando pase.

**Ponerlo en la lista de dependencias.** Como cambia en cada render, el efecto se vuelve a sincronizar en cada render. El linter avisa, y el registro de efectos lo enseña con «cambió alSentarse».

**Llamarlo desde un manejador.** Es el error más difícil de ver, porque al ejecutar no falla nada:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Mesa({ silencio }) {\n  const avisar = useEffectEvent((texto) => {\n    console.log(silencio ? `🔕 ${texto}` : `🔔 ${texto}`)\n  })\n\n  return (\n    <button onClick={() => avisar('Has pedido mus')}>\n      Pedir mus\n    </button>\n  )\n}\n\n// Con los avisos sin silenciar, pulsas «Pedir mus».\n// ¿Qué pasa?",
  "opciones": [
    "React lanza «A function wrapped in useEffectEvent can't be called during rendering.»",
    "La consola escribe «🔔 Has pedido mus»: funciona, y el que protesta es el linter",
    "No pasa nada: React ignora las llamadas que no vienen de un efecto",
    "Un aviso en la consola de React: «useEffectEvent called outside an Effect»"
  ],
  "correcta": 1,
  "explicacion": "Al ejecutar, React solo comprueba que no lo llames durante el render, y un clic no es un render. Así que funciona, y hasta lee el silencio más reciente. Pero el linter lo marca como error y la documentación lo prohíbe: un evento de efecto es una pieza de un efecto, y un manejador ya se ejecuta cuando toca sin ninguna ayuda. En un onClick, una función normal."
}
```

**Pasárselo a un hijo o a un Hook.** Si un hijo necesita un callback, pásale una función normal, y que él decida si la envuelve en su propio evento de efecto, junto a su efecto.

**Esconder con él una dependencia de verdad.** Si el valor que lees dentro debería reconectar el efecto, lo has puesto en el sitio equivocado, y nada te avisará.

**Leer dentro lo que tenía que llegar como argumento.** Con algo asíncrono por medio, dentro se lee lo más reciente, no el valor que disparó el evento.

## Ejercicios

En Órdago también puedes elegir tu **apodo**, y los avisos lo usan: «Conexión 2 · Rocío, Martín se ha sentado a tu mesa». Igual que en la lección 40, cada aviso lleva el número de la conexión que lo trae, y al cargar lo normal es la **conexión 2** (la 1 la abre y la cierra `StrictMode`).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cambiar de apodo sin levantarse de la mesa",
  "consigna": "Escribe otro apodo y mira el número de conexión de los avisos: cada tecla te reconecta. Saca el aviso a un evento de efecto para que el apodo se lea sin reconectar, y deja que cambiar de mesa siga reconectando. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { conectarMesa } from './mesas'\nimport './estilos.css'\n\nfunction Mesa({ mesa, apodo }) {\n  const [avisos, setAvisos] = useState([])\n\n  // 🚩 Cada tecla en «Tu apodo» te saca de la mesa y te vuelve a meter\n  useEffect(() => {\n    const conexion = conectarMesa(mesa)\n    conexion.alSentarseAlguien(({ id, jugador }) => {\n      const texto = `Conexión ${conexion.numero} · ${apodo}, ${jugador} se ha sentado a tu mesa`\n      setAvisos((anteriores) => [...anteriores.slice(-2), { id, texto }])\n    })\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [mesa, apodo])\n\n  return (\n    <section>\n      <h2>Mesa {mesa}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [mesa, setMesa] = useState(1)\n  const [apodo, setApodo] = useState('Rocío')\n\n  return (\n    <main>\n      <h1>Órdago, mus en línea</h1>\n      <label>\n        Tu apodo\n        <input value={apodo} onChange={(e) => setApodo(e.target.value)} />\n      </label>\n      <div role=\"group\" aria-label=\"Mesa\">\n        {[1, 2, 3].map((n) => (\n          <button key={n} aria-pressed={n === mesa} onClick={() => setMesa(n)}>\n            Mesa {n}\n          </button>\n        ))}\n      </div>\n      <Mesa mesa={mesa} apodo={apodo} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "mesas.jsx",
      "codigo": "// Simula el servidor de partidas de Órdago: mientras estás conectado a\n// una mesa, cada 0,6 s se sienta alguien. Cada conexión lleva su número.\nconst JUGADORES = ['Lucía', 'Martín', 'Begoña', 'Íñigo', 'Charo', 'Paco']\nlet ultimaConexion = 0\nlet ultimoAviso = 0\n\nexport function conectarMesa(mesa) {\n  const numero = ++ultimaConexion\n  let alSentarse = null\n  let temporizador = null\n  return {\n    numero,\n    alSentarseAlguien(funcion) {\n      alSentarse = funcion\n    },\n    conectar() {\n      console.log(`🔌 Conexión ${numero}: entras en la mesa ${mesa}`)\n      let turno = mesa\n      temporizador = setInterval(() => {\n        const jugador = JUGADORES[turno++ % JUGADORES.length]\n        alSentarse?.({ id: ++ultimoAviso, jugador })\n      }, 600)\n    },\n    desconectar() {\n      console.log(`❌ Conexión ${numero}: sales de la mesa ${mesa}`)\n      clearInterval(temporizador)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #166534;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #166534;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al cargar, los avisos llegan por la conexión 2 con tu apodo",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Conexión 2 · Rocío,"
      }
    },
    {
      "descripcion": "Al cambiar el apodo, los avisos siguientes lo usan sin reconectar",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu apodo",
            "texto": "Maite"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Conexión 2 · Maite,"
      }
    },
    {
      "descripcion": "Al pulsar «Mesa 3», te reconectas a la mesa nueva (conexión 3)",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mesa 3"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Conexión 3 · Rocío,"
      }
    },
    {
      "descripcion": "Si cambias el apodo y después de mesa, la conexión 3 ya usa el apodo nuevo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu apodo",
            "texto": "Maite"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mesa 2"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Conexión 3 · Maite,"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade a este ejercicio el botón «Silenciar avisos» de la lección, leído dentro del mismo evento de efecto. Comprueba en el registro que ni el apodo ni el silencio mueven el efecto.
2. Añade un reloj de partida: un efecto con `[]` que arranca un `setInterval` y cada segundo suma `paso` a los segundos jugados, con `paso` igual a 1 o a 2 según un botón «Partida rápida». Usa un evento de efecto para leer el paso actual sin reiniciar el intervalo.
3. Al entrar en una mesa, apunta en la consola «Has jugado en la mesa N con el apodo X». La mesa tiene que llegar como argumento y el apodo leerse dentro. Explica por qué en un comentario.
4. En un proyecto con Vite, provoca a propósito los tres mensajes del linter de esta lección (llamar al evento en un `onClick`, pasarlo a un hijo y ponerlo en la lista) y léelos en tu editor.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Separating Events from Effects",
      "descripcion": "La página de react.dev en la que se basa esta lección: manejadores frente a efectos, lógica reactiva y no reactiva, y los retos del final.",
      "url": "https://react.dev/learn/separating-events-from-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useEffectEvent",
      "descripcion": "La referencia del Hook: parámetros, por qué su identidad cambia en cada render, ejemplos con temporizadores y listeners, y los errores más comunes.",
      "url": "https://react.dev/reference/react/useEffectEvent",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19.2",
      "descripcion": "El anuncio de la versión que hizo estable useEffectEvent, con el ejemplo de la notificación al conectarse.",
      "url": "https://react.dev/blog/2025/10/01/react-19-2",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Lifecycle of Reactive Effects",
      "descripcion": "La lección 40: valores reactivos y por qué un efecto vuelve a sincronizarse cuando cambian.",
      "url": "https://react.dev/learn/lifecycle-of-reactive-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Removing Effect Dependencies",
      "descripcion": "La lección 42: el resto de técnicas para que un efecto no dependa de lo que no debe.",
      "url": "https://react.dev/learn/removing-effect-dependencies",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "exhaustive-deps",
      "descripcion": "La regla del linter que comprueba la lista de dependencias: por qué existe, ejemplos de lo que marca y qué hacer cuando te peleas con ella.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps",
      "etiqueta": "react.dev"
    }
  ]
}
```
