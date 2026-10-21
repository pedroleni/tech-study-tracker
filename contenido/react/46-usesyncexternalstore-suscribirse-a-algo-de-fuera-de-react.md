# `useSyncExternalStore`: suscribirse a algo de fuera de React

- **Módulo:** Efectos
- **Slug:** `usesyncexternalstore-suscribirse-a-algo-de-fuera-de-react` (autogenerado del título)
- **Orden:** 460
- **Fuentes:** [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) — ver `contenido/react/TEMARIO.md` #46

---

## Qué es y para qué sirve

Casi todo lo que pinta un componente sale de sus props, su estado o un contexto: datos que React controla y de los que sabe cuándo cambian. Pero algunos datos viven **fuera de React** y cambian por su cuenta:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Datos que cambian sin que React se entere",
  "roles": [
    {
      "etiqueta": "Un almacén",
      "rol": "Tuyo o de una librería",
      "descripcion": "Un módulo de JavaScript con datos y una forma de avisar cuando cambian. Así funcionan por dentro Zustand o Redux, que verás en la lección 75."
    },
    {
      "etiqueta": "El navegador",
      "rol": "APIs que cambian solas",
      "descripcion": "Si hay conexión (navigator.onLine), el tamaño de la ventana, lo guardado en localStorage, la URL. Cambian sin que tu código haga nada."
    },
    {
      "etiqueta": "Código ajeno",
      "rol": "Lo que no está escrito en React",
      "descripcion": "Un mapa, un reproductor o una conexión por WebSocket que ya tienes hecha y que quieres enseñar en un componente."
    }
  ]
}
```

Para leerlos, React tiene un Hook pensado justo para eso:

```jsx
const valor = useSyncExternalStore(subscribe, getSnapshot)
```

Le das **dos funciones**: una para suscribirse a los cambios (`subscribe`) y otra para leer el valor actual (`getSnapshot`). React se encarga del resto: se suscribe al montar el componente, se da de baja al desmontarlo y lo vuelve a renderizar cada vez que el valor cambia. Sin `useEffect` y sin `useState`.

## Lo que ya sabías hacer: un efecto y un estado

En el centro de salud Los Almendros, una pantalla enseña el turno al que llaman. El sistema de turnos no es de React: es el mismo módulo que usa la máquina de tiques, guarda el número en una variable y avisa a quien se haya suscrito cada vez que llama al siguiente. Con lo que viste en las lecciones 38 a 43, la forma de conectarlo es **copiar el valor a un estado (lección 16) y suscribirse en un efecto**:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La pantalla de turnos, con un efecto y un estado",
  "codigo": "import { useEffect, useState } from 'react'\n\n// El sistema de turnos del centro de salud: código de fuera de React,\n// el mismo que usa la máquina de tiques\nlet turnoActual = 23\nconst oyentes = new Set()\n\nfunction llamarSiguiente() {\n  turnoActual = turnoActual + 1\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribirse(avisar) {\n  console.log('Pantalla suscrita')\n  oyentes.add(avisar)\n  return () => {\n    console.log('Pantalla dada de baja')\n    oyentes.delete(avisar)\n  }\n}\n\nfunction leerTurno() {\n  return turnoActual\n}\n\nfunction Pantalla() {\n  const [turno, setTurno] = useState(leerTurno)\n\n  useEffect(() => {\n    return suscribirse(() => setTurno(leerTurno()))\n  }, [])\n\n  return <p className=\"turno\">A-{turno}</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Centro de Salud Los Almendros</h1>\n      <Pantalla />\n      <button onClick={llamarSiguiente}>Siguiente paciente</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.turno {\n  display: inline-block;\n  margin: 0 0 0.75rem;\n  padding: 0.5rem 1.25rem;\n  border-radius: 8px;\n  background: #0f3d3e;\n  color: #a7f3d0;\n  font: 700 2rem ui-monospace, monospace;\n}\n\nbutton {\n  display: block;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "const [turno, setTurno] = useState(leerTurno)",
      "nota": "Una copia del turno en el estado de React, con el valor que tenía al montar. A partir de aquí hay dos turnos: el del sistema y el de la pantalla, y tu código tiene que mantenerlos iguales."
    },
    {
      "fragmento": "useEffect(() => {\n    return suscribirse(() => setTurno(leerTurno()))\n  }, [])",
      "nota": "Después de pintar, el efecto se suscribe. Cada vez que el sistema avisa, vuelve a leer el turno y lo copia al estado, y eso provoca el render."
    },
    {
      "fragmento": "console.log('Pantalla suscrita')",
      "nota": "Mira la consola y el registro de efectos: suscrita, dada de baja y suscrita otra vez. Es StrictMode probando la limpieza del efecto, como en la lección 38."
    },
    {
      "fragmento": "<button onClick={llamarSiguiente}>Siguiente paciente</button>",
      "nota": "El botón hace de mostrador: llama directamente al sistema de turnos, sin pasar por ningún estado de React."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Funciona, y es lo que encontrarás en mucho código. Pero tiene tres pegas:

- **Hay dos copias del dato** (la del sistema y la del estado), y mantenerlas iguales es trabajo tuyo.
- **Hay una ventana sin vigilar**: entre el render y el momento en que el efecto se suscribe pueden pasar cosas, y lo que pase ahí no llega a la pantalla. Lo verás enseguida.
- **Cada componente que quiera el turno repite** el estado, el efecto y la limpieza.

## `useSyncExternalStore`: sin efecto y sin estado

La misma pantalla, con el Hook. El sistema de turnos no cambia ni una línea; solo `Pantalla`:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La misma pantalla, con useSyncExternalStore",
  "codigo": "import { useSyncExternalStore } from 'react'\n\n// El sistema de turnos del centro de salud: código de fuera de React,\n// el mismo que usa la máquina de tiques\nlet turnoActual = 23\nconst oyentes = new Set()\n\nfunction llamarSiguiente() {\n  turnoActual = turnoActual + 1\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribirse(avisar) {\n  console.log('Pantalla suscrita')\n  oyentes.add(avisar)\n  return () => {\n    console.log('Pantalla dada de baja')\n    oyentes.delete(avisar)\n  }\n}\n\nfunction leerTurno() {\n  return turnoActual\n}\n\nfunction Pantalla() {\n  const turno = useSyncExternalStore(suscribirse, leerTurno)\n  return <p className=\"turno\">A-{turno}</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Centro de Salud Los Almendros</h1>\n      <Pantalla />\n      <button onClick={llamarSiguiente}>Siguiente paciente</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.turno {\n  display: inline-block;\n  margin: 0 0 0.75rem;\n  padding: 0.5rem 1.25rem;\n  border-radius: 8px;\n  background: #0f3d3e;\n  color: #a7f3d0;\n  font: 700 2rem ui-monospace, monospace;\n}\n\nbutton {\n  display: block;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "useSyncExternalStore(suscribirse, leerTurno)",
      "nota": "Le pasas las dos funciones del sistema, sin llamarlas. React decide cuándo suscribirse, cuándo darse de baja y cuándo leer. Lo que devuelve es el turno actual, listo para pintar."
    },
    {
      "fragmento": "function suscribirse(avisar) {",
      "nota": "El primer argumento, subscribe. React le pasa una función (aquí, avisar) y espera que el almacén la llame cada vez que algo cambie. Tiene que devolver otra función, la que da de baja la suscripción."
    },
    {
      "fragmento": "function leerTurno() {\n  return turnoActual\n}",
      "nota": "El segundo, getSnapshot: devuelve el valor actual, sin cambiar nada. Cuando el almacén avisa, React la vuelve a llamar y compara el resultado con el anterior usando Object.is. Si es distinto, renderiza."
    },
    {
      "fragmento": "console.log('Pantalla suscrita')",
      "nota": "El registro de efectos dice «Todavía no hay efectos.»: no has escrito ninguno. Pero la consola demuestra que la suscripción existe, y que StrictMode también la repite. React la gestiona por dentro."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

**Una sola copia del dato, y ningún efecto escrito por ti.** El componente ya no guarda el turno: lo lee del sistema cada vez que se renderiza, y React se asegura de que se renderice cuando cambia.

De las dos funciones, React exige poco, pero lo exige siempre:

- **`subscribe(avisar)`** conecta `avisar` con el almacén y **devuelve la función que la desconecta**. No le importa qué cambió: avisar solo significa «vuelve a mirar».
- **`getSnapshot()`** devuelve el valor actual y **no cambia nada**. React la llama varias veces en cada render y cada vez que el almacén avisa, así que tiene que ser barata, y devolver lo mismo mientras nada haya cambiado (lo verás romperse más abajo).

Falta la segunda pega del efecto, la ventana sin vigilar. Aquí, otro componente llama al siguiente paciente con un `useLayoutEffect`, que se ejecuta después de pintar pero **antes** que los efectos normales (lección 45). Es decir, justo en el hueco entre el render de las pantallas y el momento en que el `useEffect` se suscribe:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un cambio antes de que el efecto se suscriba",
  "codigo": "import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react'\n\n// El sistema de turnos del centro de salud: código de fuera de React,\n// el mismo que usa la máquina de tiques\nlet turnoActual = 23\nconst oyentes = new Set()\n\nfunction llamarSiguiente() {\n  turnoActual = turnoActual + 1\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribirse(avisar) {\n  oyentes.add(avisar)\n  return () => {\n    oyentes.delete(avisar)\n  }\n}\n\nfunction leerTurno() {\n  return turnoActual\n}\n\nfunction PantallaConEfecto() {\n  const [turno, setTurno] = useState(leerTurno)\n  useEffect(() => suscribirse(() => setTurno(leerTurno())), [])\n  return <p>Con un efecto: A-{turno}</p>\n}\n\nfunction PantallaConAlmacen() {\n  const turno = useSyncExternalStore(suscribirse, leerTurno)\n  return <p>Con useSyncExternalStore: A-{turno}</p>\n}\n\nfunction MostradorConPrisa() {\n  useLayoutEffect(() => {\n    llamarSiguiente()\n  }, [])\n  return null\n}\n\nexport default function App() {\n  return (\n    <main>\n      <PantallaConEfecto />\n      <PantallaConAlmacen />\n      <MostradorConPrisa />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}",
  "anotaciones": [
    {
      "fragmento": "const [turno, setTurno] = useState(leerTurno)",
      "nota": "Copia el 23 durante el render. Cuando su efecto se suscriba, el turno ya será el 24, pero nadie volverá a avisar: el aviso de ese cambio salió antes de que estuviera escuchando."
    },
    {
      "fragmento": "useLayoutEffect(() => {\n    llamarSiguiente()\n  }, [])",
      "nota": "Cambia el sistema después de pintar y antes de los useEffect. En una app real puede ser cualquier código que no controlas: un temporizador, un mensaje del servidor, otra librería."
    },
    {
      "fragmento": "const turno = useSyncExternalStore(suscribirse, leerTurno)",
      "nota": "Este también leyó un 23 al renderizar, pero React, justo después de suscribirse, vuelve a llamar a getSnapshot y, si el valor ha cambiado desde el render, renderiza otra vez. Por eso enseña A-24."
    }
  ],
  "strictMode": false,
  "mostrarConsola": false
}
```

La primera pantalla se queda en A-23 hasta el próximo aviso; la segunda enseña A-24. El bloque lleva StrictMode apagado para que el número sea fácil de seguir: con StrictMode, el `useLayoutEffect` se repetiría y llamaría a dos pacientes.

La página de react.dev de la lección 39, *You Might Not Need an Effect*, lo resume así: suscribirse con un efecto es habitual, pero **para un almacén externo se prefiere este Hook**, porque es menos propenso a errores que copiar a mano a un estado datos que cambian.

## Varios componentes, un solo almacén

El sistema de turnos real tiene dos datos: el turno al que llaman y el último tique que ha salido de la máquina. La pantalla grande enseña el primero; un cartel junto a la puerta, cuántas personas esperan. Cada componente lee **solo lo que pinta**, con su propio `getSnapshot`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos lectores del mismo sistema de turnos",
  "consigna": "Pulsa «Sacar tique» y mira el árbol: solo se renderiza CartelEspera. Pulsa «Siguiente paciente»: ahora cambian los dos, porque cambian los dos datos. Llama a pacientes hasta que no quede nadie esperando y pulsa una vez más: el sistema no avisa, y nadie se renderiza.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { leerActual, leerEnEspera, llamarSiguiente, sacarTique, suscribirse } from './turnos'\nimport './estilos.css'\n\nfunction Pantalla() {\n  const actual = useSyncExternalStore(suscribirse, leerActual)\n  return <p className=\"turno\">A-{actual}</p>\n}\n\nfunction CartelEspera() {\n  const enEspera = useSyncExternalStore(suscribirse, leerEnEspera)\n  return <p>Personas esperando: {enEspera}</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Centro de Salud Los Almendros</h1>\n      <Pantalla />\n      <CartelEspera />\n      <button onClick={sacarTique}>Sacar tique</button>\n      <button onClick={llamarSiguiente}>Siguiente paciente</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "turnos.jsx",
      "codigo": "// El sistema de turnos, ahora en su propio archivo\nlet actual = 23\nlet ultimo = 27\nconst oyentes = new Set()\n\nfunction avisarATodos() {\n  oyentes.forEach((avisar) => avisar())\n}\n\nexport function suscribirse(avisar) {\n  oyentes.add(avisar)\n  return () => oyentes.delete(avisar)\n}\n\nexport function leerActual() {\n  return actual\n}\n\nexport function leerEnEspera() {\n  return ultimo - actual\n}\n\nexport function llamarSiguiente() {\n  if (actual < ultimo) {\n    actual = actual + 1\n    avisarATodos()\n  }\n}\n\nexport function sacarTique() {\n  ultimo = ultimo + 1\n  avisarATodos()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.turno {\n  display: inline-block;\n  margin: 0 0 0.75rem;\n  padding: 0.5rem 1.25rem;\n  border-radius: 8px;\n  background: #0f3d3e;\n  color: #a7f3d0;\n  font: 700 2rem ui-monospace, monospace;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "turnos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Al sacar un tique, el sistema avisa a **todos** los suscritos: React vuelve a llamar a `leerActual` y a `leerEnEspera`, compara cada resultado con el anterior y solo renderiza `CartelEspera`, el único cuyo valor ha cambiado; `Pantalla` ni se entera. El árbol explica el render con «cambió otro de sus ganchos»: no es un `useState`, y el panel no le pone nombre.

En tu proyecto, `turnos.jsx` sería `turnos.js`: no tiene nada de JSX. Aquí todos los archivos del editor tienen que acabar en `.jsx` o `.css`.

## `getSnapshot`: el mismo valor mientras nada cambie

Esa comparación con `Object.is` tiene una consecuencia: **si `getSnapshot` devuelve un objeto nuevo en cada llamada, para React el valor ha cambiado siempre**. En el horario del polideportivo Las Norias, la tabla se convierte en fichas cuando la ventana es estrecha. El tamaño de la ventana cambia sin que React se entere, así que se lee con este Hook… y se lee mal:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un getSnapshot que devuelve un objeto nuevo cada vez",
  "consigna": "La vista previa no llega a pintarse: lee el recuadro y la consola. Arréglalo: el horario solo necesita saber si la ventana es estrecha, así que haz que getSnapshot devuelva eso, un booleano. Después estrecha la ventana del navegador hasta que la vista previa mida menos de 560 píxeles: la tabla pasa a fichas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport './estilos.css'\n\nconst CLASES = [\n  { hora: '09:00', actividad: 'Natación libre', sala: 'Piscina' },\n  { hora: '10:30', actividad: 'Yoga', sala: 'Sala 2' },\n  { hora: '12:00', actividad: 'Baloncesto infantil', sala: 'Pabellón' },\n  { hora: '18:00', actividad: 'Spinning', sala: 'Sala 1' },\n]\n\nfunction suscribirse(avisar) {\n  window.addEventListener('resize', avisar)\n  return () => window.removeEventListener('resize', avisar)\n}\n\nfunction leerVentana() {\n  return { ancho: window.innerWidth, alto: window.innerHeight }\n}\n\nexport default function Horario() {\n  const ventana = useSyncExternalStore(suscribirse, leerVentana)\n  const estrecha = ventana.ancho < 560\n\n  return (\n    <main>\n      <h1>Polideportivo Las Norias: clases del sábado</h1>\n      {estrecha ? (\n        <ul className=\"fichas\">\n          {CLASES.map((clase) => (\n            <li key={clase.hora}>\n              {clase.hora} · {clase.actividad} · {clase.sala}\n            </li>\n          ))}\n        </ul>\n      ) : (\n        <table>\n          <thead>\n            <tr>\n              <th>Hora</th>\n              <th>Actividad</th>\n              <th>Sala</th>\n            </tr>\n          </thead>\n          <tbody>\n            {CLASES.map((clase) => (\n              <tr key={clase.hora}>\n                <td>{clase.hora}</td>\n                <td>{clase.actividad}</td>\n                <td>{clase.sala}</td>\n              </tr>\n            ))}\n          </tbody>\n        </table>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\ntable {\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.3rem 0.75rem;\n  border-bottom: 1px solid #cbd5e1;\n  text-align: left;\n}\n\n.fichas {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.fichas li {\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #eef6ff;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

React escribe un error en la consola y después para el render con otro:

```text
The result of getSnapshot should be cached to avoid an infinite loop

Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Es decir: «El resultado de getSnapshot debería guardarse para no entrar en un bucle infinito», y después, «Se ha superado el máximo de actualizaciones anidadas: React limita su número para evitar bucles infinitos». En desarrollo, React llama a `getSnapshot` dos veces seguidas para comprobar que da lo mismo; recibe dos objetos `{ ancho, alto }` con los mismos números pero **distintos para `Object.is`**, y escribe el primer mensaje. El bucle viene después: tras pintar, React vuelve a leer el valor para comprobar que el almacén no ha cambiado entretanto, recibe otro objeto nuevo, entiende que sí ha cambiado y renderiza otra vez… y así hasta que corta. Es el mismo error que verás en la lección 75 con un selector que construye un objeto; «Maximum update depth exceeded» tiene además otras causas, que reúne la lista de la lección 64.

El arreglo es **devolver solo lo que el componente necesita**, un valor simple:

```jsx
function leerSiEsEstrecha() {
  return window.innerWidth < 560
}

export default function Horario() {
  const estrecha = useSyncExternalStore(suscribirse, leerSiEsEstrecha)
  // ...
}
```

Y tiene premio: mientras arrastras el borde de la ventana, `resize` se dispara muchas veces y React vuelve a llamar a `leerSiEsEstrecha` en cada una, pero **solo renderiza cuando el booleano cambia**, al cruzar los 560 píxeles. Con un `console.log` en el componente se ve: de 1024 a 500 píxeles de ancho, un render; de 500 a 520, ninguno.

¿Y si lo que necesitas es de verdad un objeto o un array? Entonces `getSnapshot` tiene que **guardar el último que devolvió** y repetirlo mientras los datos no cambien. Pasa a menudo con `localStorage`, que solo guarda texto: si haces `JSON.parse` en cada llamada, cada llamada fabrica un array nuevo y vuelves al bucle. Las reservas del polideportivo, bien leídas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const CLAVE = 'norias-reservas'\n\nlet textoAnterior = null\nlet reservasAnteriores = []\n\nfunction leerReservas() {\n  const texto = localStorage.getItem(CLAVE) ?? '[]'\n  if (texto !== textoAnterior) {\n    textoAnterior = texto\n    reservasAnteriores = JSON.parse(texto)\n  }\n  return reservasAnteriores\n}\n\n// Mal: un array nuevo en cada llamada, aunque el texto sea el mismo\nfunction leerReservasMal() {\n  return JSON.parse(localStorage.getItem(CLAVE) ?? '[]')\n}",
  "anotaciones": [
    {
      "fragmento": "let textoAnterior = null\nlet reservasAnteriores = []",
      "nota": "Fuera de la función y de cualquier componente: la memoria de la última lectura. Si estuvieran dentro, se perderían en cada llamada."
    },
    {
      "fragmento": "const texto = localStorage.getItem(CLAVE) ?? '[]'",
      "nota": "Leer el texto es barato, y dos textos iguales son iguales para Object.is. Si la clave no existe, getItem devuelve null y se usa una lista vacía."
    },
    {
      "fragmento": "if (texto !== textoAnterior) {",
      "nota": "Solo si el texto ha cambiado se fabrica un array nuevo con JSON.parse. Mientras tanto, devuelve el mismo array de la vez anterior, y React ve que nada ha cambiado."
    },
    {
      "fragmento": "function leerReservasMal() {",
      "nota": "Esta versión hace entrar a React en el bucle de arriba: dos llamadas seguidas, dos arrays distintos, aunque contengan lo mismo."
    }
  ]
}
```

La regla general, de la referencia de react.dev: **lo que devuelve `getSnapshot` no se modifica nunca**. Si los datos del almacén cambian, devuelve un valor nuevo; si no, el mismo de antes.

## Dónde declarar `subscribe`

React compara también la función `subscribe` de un render con la del anterior. **Si es otra función, se da de baja y se vuelve a suscribir.** Y una función declarada dentro del componente es otra en cada render:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una suscripción nueva en cada render",
  "consigna": "Pulsa «Letra grande» varias veces y mira la consola: cada clic da de baja la pantalla y la vuelve a suscribir, aunque el turno no haya cambiado. Arréglalo: saca la función suscribirse fuera del componente, debajo de llamarSiguiente, y vuelve a pulsar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport './estilos.css'\n\nlet turnoActual = 23\nconst oyentes = new Set()\n\nfunction llamarSiguiente() {\n  turnoActual = turnoActual + 1\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction Pantalla() {\n  const [grande, setGrande] = useState(false)\n\n  function suscribirse(avisar) {\n    console.log('Pantalla suscrita')\n    oyentes.add(avisar)\n    return () => {\n      console.log('Pantalla dada de baja')\n      oyentes.delete(avisar)\n    }\n  }\n\n  const turno = useSyncExternalStore(suscribirse, () => turnoActual)\n\n  return (\n    <section>\n      <p className={grande ? 'turno grande' : 'turno'}>A-{turno}</p>\n      <button onClick={() => setGrande(!grande)}>Letra grande</button>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Centro de Salud Los Almendros</h1>\n      <Pantalla />\n      <button onClick={llamarSiguiente}>Siguiente paciente</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.turno {\n  display: inline-block;\n  margin: 0 0 0.75rem;\n  padding: 0.5rem 1.25rem;\n  border-radius: 8px;\n  background: #0f3d3e;\n  color: #a7f3d0;\n  font: 700 2rem ui-monospace, monospace;\n}\n\nbutton {\n  display: block;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n\n.grande {\n  font-size: 3rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Con `suscribirse` fuera, la consola se queda en la suscripción del principio (y su repetición por StrictMode), por mucho que cambies la letra. Con un `oyentes.add` no se nota, pero si suscribirse significa abrir una conexión con un servidor, cerrarla y abrirla en cada render sí que importa.

Tres detalles más:

- **`getSnapshot` sí puede escribirse en línea.** La flecha `() => turnoActual` es una función nueva en cada render, pero React no se vuelve a suscribir por ella: solo la usa para leer. Lo comprobamos: con `suscribirse` fuera y la flecha dentro, la consola no se mueve.
- **Si `subscribe` depende de una prop** (por ejemplo, el mostrador al que te suscribes), no puede vivir fuera del componente. Para que siga siendo la misma función mientras la prop no cambie se usa `useCallback`, que verás en la lección 67.
- **No hay lista de dependencias.** `useSyncExternalStore` no la tiene: lo único que mira es si `subscribe` es la misma función. Una cosa menos que olvidar (lección 42).

## Datos del navegador: la conexión y `localStorage`

El navegador está lleno de valores que cambian solos. El ejemplo de react.dev es la conexión: `navigator.onLine` dice si hay red, y `window` lanza los eventos `online` y `offline` cuando cambia. En la app con la que los técnicos de Fontanería Caño Libre rellenan sus partes de trabajo, sirve para avisar de que el parte aún no se ha enviado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useSyncExternalStore } from 'react'\n\nfunction suscribirse(avisar) {\n  window.addEventListener('online', avisar)\n  window.addEventListener('offline', avisar)\n  return () => {\n    window.removeEventListener('online', avisar)\n    window.removeEventListener('offline', avisar)\n  }\n}\n\nfunction leerConexion() {\n  return navigator.onLine\n}\n\nexport function useEnLinea() {\n  return useSyncExternalStore(suscribirse, leerConexion)\n}\n\nexport function AvisoConexion() {\n  const enLinea = useEnLinea()\n  if (enLinea) return null\n  return (\n    <p role=\"status\">\n      Parece que no tienes conexión: el parte se guardará cuando vuelva.\n    </p>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "window.addEventListener('online', avisar)\n  window.addEventListener('offline', avisar)",
      "nota": "Dos eventos, una sola función avisar. A React le da igual cuál salte: avisar solo significa que vuelva a llamar a leerConexion."
    },
    {
      "fragmento": "return navigator.onLine",
      "nota": "Un booleano: dos lecturas seguidas devuelven lo mismo, así que no hace falta guardar nada."
    },
    {
      "fragmento": "export function useEnLinea() {",
      "nota": "Envuelto en un Hook propio (lección 43). Cualquier componente escribe useEnLinea() y no necesita saber cómo se consigue el dato."
    },
    {
      "fragmento": "<p role=\"status\">",
      "nota": "Un aviso, no un botón desactivado. MDN advierte que onLine no es del todo fiable (una red local sin salida a internet cuenta como conectada) y recomienda usarlo solo para avisar, no para bloquear funciones."
    }
  ]
}
```

Este bloque no se ejecuta aquí porque en la vista previa no hay forma de cortar la red. En tu proyecto, desconecta el wifi con la página abierta y verás aparecer el aviso.

**`localStorage` tiene una trampa.** El navegador lanza el evento `storage` cuando cambia algo guardado, pero según MDN **solo en las demás pestañas** del mismo sitio: la ventana que hizo el cambio no se entera. Así que, para que dos componentes de la misma página se pongan de acuerdo, el código que escribe tiene que avisar a los suscritos. Es lo que hace este pequeño módulo de ajustes del cancionero del coro Voces del Ebro, con un Hook propio encima:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un Hook propio sobre localStorage",
  "consigna": "Cambia el tamaño de letra: la barra, la canción y el pie se ponen de acuerdo, aunque ninguno pase nada a los otros. Después borra la línea oyentes.forEach de guardarAjuste en ajustes.jsx y vuelve a probar: ya no se entera nadie, ni la barra.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useAjuste } from './useAjuste'\nimport './estilos.css'\n\nconst TAMANOS = ['pequeña', 'normal', 'grande']\n\nfunction BarraAjustes() {\n  const [tamano, setTamano] = useAjuste('coro-tamano-letra', 'normal')\n  return (\n    <nav aria-label=\"Ajustes de lectura\">\n      {TAMANOS.map((opcion) => (\n        <button\n          key={opcion}\n          aria-pressed={opcion === tamano}\n          onClick={() => setTamano(opcion)}\n        >\n          Letra {opcion}\n        </button>\n      ))}\n    </nav>\n  )\n}\n\nfunction Cancion() {\n  const [tamano] = useAjuste('coro-tamano-letra', 'normal')\n  return (\n    <article className={'letra ' + tamano}>\n      <h2>Canción de la ribera</h2>\n      <p>\n        Baja el río por la vega,\n        <br />\n        lleva el cierzo la canción…\n      </p>\n    </article>\n  )\n}\n\nfunction PiePagina() {\n  const [tamano] = useAjuste('coro-tamano-letra', 'normal')\n  return <footer>Tamaño de letra: {tamano}</footer>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cancionero de Voces del Ebro</h1>\n      <BarraAjustes />\n      <Cancion />\n      <PiePagina />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ajustes.jsx",
      "codigo": "// Ajustes guardados en localStorage, compartidos por toda la app\nconst oyentes = new Set()\n\nexport function suscribirse(avisar) {\n  oyentes.add(avisar)\n  // Los cambios hechos en OTRAS pestañas llegan con el evento storage\n  window.addEventListener('storage', avisar)\n  return () => {\n    oyentes.delete(avisar)\n    window.removeEventListener('storage', avisar)\n  }\n}\n\nexport function leerAjuste(clave, porDefecto) {\n  return localStorage.getItem(clave) ?? porDefecto\n}\n\nexport function guardarAjuste(clave, valor) {\n  localStorage.setItem(clave, valor)\n  // En ESTA pestaña nadie avisa: lo hacemos nosotros\n  oyentes.forEach((avisar) => avisar())\n}\n"
    },
    {
      "nombre": "useAjuste.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { guardarAjuste, leerAjuste, suscribirse } from './ajustes'\n\n// Se usa como useState, pero el valor vive en localStorage\nexport function useAjuste(clave, porDefecto) {\n  const valor = useSyncExternalStore(suscribirse, () => leerAjuste(clave, porDefecto))\n  const cambiar = (nuevo) => guardarAjuste(clave, nuevo)\n  return [valor, cambiar]\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.6rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.letra {\n  margin: 0.75rem 0;\n  font-family: Georgia, serif;\n}\n\n.letra h2 {\n  font-size: 1em;\n}\n\n.pequeña {\n  font-size: 0.85rem;\n}\n\n.normal {\n  font-size: 1rem;\n}\n\n.grande {\n  font-size: 1.5rem;\n}\n\nfooter {\n  color: #475569;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "useAjuste.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Tres componentes leen el mismo ajuste y **ninguno recibe props de otro**: el dato no está en el estado de React, sino en `localStorage`, y cada uno se suscribe por su cuenta a través de `useAjuste`. Fíjate en el Hook:

- `subscribe` es una función del módulo, **la misma para cualquier clave**: siempre fuera del componente, así que nunca se vuelve a suscribir.
- `getSnapshot` es una flecha en línea, porque depende de `clave`. Devuelve un texto, y dos textos iguales son iguales para `Object.is`: no hace falta guardar nada.
- Devuelve `[valor, cambiar]`, como `useState`. Quien lo usa no tiene por qué saber dónde se guarda el dato: es la idea de los Hooks propios de la lección 43.

En tu proyecto con Vite, el ajuste **sobrevive a recargar la página**, y si abres el cancionero en dos pestañas, cambiar la letra en una cambia la otra gracias al evento `storage`. En la vista previa de esta web, `localStorage` vive en memoria: recargarla, o editar el código, lo deja vacío.

## ¿Y si la página se renderiza en el servidor?

`useSyncExternalStore` tiene un tercer argumento opcional, **`getServerSnapshot`**. Según react.dev, React solo lo usa al generar el HTML en el servidor y al hidratarlo en el navegador (módulo 13). Hace falta porque en el servidor no existen `navigator`, `window` ni `localStorage`, y porque el primer render del navegador tiene que coincidir con el HTML que llegó. Sin él, el servidor no puede renderizar el componente. Con `renderToString` de React 19.3.1:

```text
Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.
```

Es decir: «Falta getServerSnapshot, que es obligatorio para el contenido renderizado en el servidor. Se renderizará en el cliente».

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo justo por ahora",
  "contenido": "Una app de Vite como las de este temario se renderiza solo en el navegador, así que no necesita getServerSnapshot. Qué valor devolver en el servidor, qué pasa justo después de hidratar y cuándo conviene otra herramienta, use(browser()), lo explica la lección 87. No des el tema por cerrado con este párrafo."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Al conectar una librería de estado",
      "texto": "Zustand, Redux y otras se apoyan en este Hook por dentro (lección 75). Casi nunca lo escribirás para ellas, pero saber cómo funciona explica por qué sus selectores tienen que devolver valores estables."
    },
    {
      "titulo": "Al leer algo del navegador que cambia solo",
      "texto": "La conexión, el tamaño de la ventana, lo guardado en localStorage, la URL (lección 76) o una media query (lección 87)."
    },
    {
      "titulo": "Al envolver código que no es de React",
      "texto": "Un sistema de turnos, un reproductor, un mapa o los mensajes de un WebSocket: si ya tiene una forma de avisar de sus cambios, le das un subscribe y un getSnapshot y lo envuelves en un Hook propio."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Para el estado de tu propia aplicación: react.dev recomienda useState y useReducer siempre que se pueda. Y para pedir datos a un servidor tampoco: eso es la lección 52."
    }
  ]
}
```

## Errores típicos

**Cambiar los datos del almacén en vez de sustituirlos.** La sala de espera guarda la cola en un array, y quien la programó usó `push`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const cola = ['A-24', 'A-25']\nconst oyentes = new Set()\n\nfunction sacarTique() {\n  cola.push('A-' + (24 + cola.length))\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribirse(avisar) {\n  oyentes.add(avisar)\n  return () => oyentes.delete(avisar)\n}\n\nfunction leerCola() {\n  return cola\n}\n\nexport default function SalaDeEspera() {\n  const enEspera = useSyncExternalStore(suscribirse, leerCola)\n  return (\n    <main>\n      <p>En espera: {enEspera.length}</p>\n      <button onClick={sacarTique}>Sacar tique</button>\n    </main>\n  )\n}\n\n// Pulsas «Sacar tique» dos veces. ¿Qué enseña el párrafo?",
  "opciones": [
    "En espera: 4",
    "En espera: 2",
    "Un error: «The result of getSnapshot should be cached»"
  ],
  "correcta": 1,
  "explicacion": "El almacén avisa y React vuelve a llamar a leerCola, pero recibe el mismo array, modificado por dentro. Para Object.is es el mismo valor, así que no renderiza. Es la regla de la lección 20 fuera de React: con let cola y cola = [...cola, tique], getSnapshot devuelve un array nuevo y el párrafo se actualiza."
}
```

**Un `subscribe` que no devuelve la función de baja.** Con una flecha corta es fácil devolver otra cosa sin darse cuenta:

```jsx
const suscribirse = (avisar) => oyentes.add(avisar)
```

`Set.prototype.add` devuelve el propio `Set`, y eso es lo que recibe React. La consola avisa:

```text
useEffect must not return anything besides a function, which is used for clean-up. You returned: [object Set]
```

Es decir: «useEffect no debe devolver nada que no sea una función, que se usa para la limpieza. Has devuelto: [object Set]». El aviso habla de `useEffect` aunque no hayas escrito ninguno: `useSyncExternalStore` se suscribe con un efecto interno, y lo que devuelve tu `subscribe` es la limpieza de ese efecto. En cuanto React intenta darse de baja (con StrictMode, nada más montar), la vista previa se cae con un `TypeError` del tipo «… is not a function». Escribe las llaves y el `return` de la baja, como en todos los ejemplos de esta lección.

**Escribir en el almacén sin avisar.** Si guardas en `localStorage` y no llamas a los suscritos, nadie se entera: React no vigila `localStorage`, y el evento `storage` no llega a la pestaña que hizo el cambio. Lo has provocado en el cancionero al borrar el `oyentes.forEach`.

**Leer el almacén directamente en el render.** `const turno = leerTurno()` dentro del componente pinta el valor bueno la primera vez, y después se queda congelado: nadie le dice a React que vuelva a renderizar. Leer sin suscribirse es el error del ejercicio que viene.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "useSyncExternalStore es un useState mejor",
      "realidad": "Es para datos que viven fuera de React. Para el estado de tu aplicación, react.dev recomienda useState y useReducer siempre que se pueda: son más sencillos y React los controla del todo."
    },
    {
      "mito": "Si no escribo un useEffect, no hay suscripción",
      "realidad": "La hay, y StrictMode la repite al montar igual que un efecto. Lo que cambia es que la gestiona React: se suscribe, se da de baja y, al suscribirse, comprueba que el valor no haya cambiado desde el render."
    },
    {
      "mito": "getSnapshot se llama una vez por render",
      "realidad": "React la llama varias veces en cada render (en desarrollo, para comprobar que da lo mismo) y otra vez con cada aviso del almacén. Tiene que ser barata y no cambiar nada."
    },
    {
      "mito": "El evento storage me avisa de mis propios cambios",
      "realidad": "Solo avisa a las demás pestañas del mismo sitio. En la pestaña que escribe, el aviso lo tienes que dar tú."
    }
  ]
}
```

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los favoritos de una tienda de discos",
  "consigna": "En Discos Contraportada, pulsar un disco lo marca como favorito, pero la pantalla no cambia: los componentes leen favoritos.jsx sin suscribirse. Completa el módulo (avisar al cambiar y una función suscribirse) y el Hook useFavoritos, con useSyncExternalStore. Cuidado con leerFavoritos: ahora fabrica un array nuevo en cada llamada. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { alternarFavorito } from './favoritos'\nimport { useFavoritos } from './useFavoritos'\nimport './estilos.css'\n\nconst DISCOS = [\n  { id: 1, titulo: 'Mar de fondo', grupo: 'Los Albatros' },\n  { id: 2, titulo: 'Cierzo', grupo: 'Las Hermanas Lacasa' },\n  { id: 3, titulo: 'Luces de feria', grupo: 'La Verbena Eléctrica' },\n  { id: 4, titulo: 'Noche en Gredos', grupo: 'Trío Almanzor' },\n]\n\nfunction Cabecera() {\n  const favoritos = useFavoritos()\n  return (\n    <header>\n      <h1>Discos Contraportada</h1>\n      <p>Favoritos: {favoritos.length}</p>\n    </header>\n  )\n}\n\nfunction Catalogo() {\n  const favoritos = useFavoritos()\n  return (\n    <ul className=\"catalogo\">\n      {DISCOS.map((disco) => (\n        <li key={disco.id}>\n          <button\n            aria-pressed={favoritos.includes(disco.id)}\n            onClick={() => alternarFavorito(disco.id)}\n          >\n            {disco.titulo}\n          </button>\n          <span>{disco.grupo}</span>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Resumen() {\n  const favoritos = useFavoritos()\n  const titulos = DISCOS.filter((disco) => favoritos.includes(disco.id)).map((disco) => disco.titulo)\n  return <p>Tus favoritos: {titulos.length > 0 ? titulos.join(', ') : 'ninguno todavía'}</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <Catalogo />\n      <Resumen />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "favoritos.jsx",
      "codigo": "// Los favoritos de la tienda, guardados en localStorage.\n// Este módulo no es de React: cualquier código puede leerlos y cambiarlos.\nconst CLAVE = 'contraportada-favoritos'\n\nexport function leerFavoritos() {\n  return JSON.parse(localStorage.getItem(CLAVE) ?? '[]')\n}\n\nexport function alternarFavorito(id) {\n  const actuales = leerFavoritos()\n  const nuevos = actuales.includes(id)\n    ? actuales.filter((otro) => otro !== id)\n    : [...actuales, id]\n  localStorage.setItem(CLAVE, JSON.stringify(nuevos))\n  // TODO: avisa a quien esté suscrito\n}\n\n// TODO: export function suscribirse(avisar) { ... }\n"
    },
    {
      "nombre": "useFavoritos.jsx",
      "codigo": "import { leerFavoritos } from './favoritos'\n\n// TODO: que se suscriba con useSyncExternalStore\nexport function useFavoritos() {\n  return leerFavoritos()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin-bottom: 0;\n  font-size: 1.3rem;\n}\n\n.catalogo {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.catalogo li {\n  display: flex;\n  gap: 0.6rem;\n  align-items: center;\n}\n\n.catalogo span {\n  color: #57534e;\n}\n\nbutton {\n  min-width: 9rem;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  text-align: left;\n}\n\nbutton[aria-pressed='true'] {\n  border-color: #b45309;\n  background: #fef3c7;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "favoritos.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al marcar «Mar de fondo», la cabecera dice «Favoritos: 1»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        }
      ],
      "espera": {
        "texto": "Favoritos: 1"
      }
    },
    {
      "descripcion": "Con dos discos marcados, el resumen los nombra en el orden del catálogo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cierzo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        }
      ],
      "espera": {
        "texto": "Tus favoritos: Mar de fondo, Cierzo"
      }
    },
    {
      "descripcion": "Al desmarcar un disco, la cabecera vuelve a contar uno",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cierzo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        }
      ],
      "espera": {
        "texto": "Favoritos: 1"
      }
    },
    {
      "descripcion": "Al desmarcar un disco, el resumen deja de nombrarlo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cierzo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mar de fondo"
          }
        }
      ],
      "espera": {
        "texto": "Tus favoritos: Cierzo"
      }
    },
    {
      "descripcion": "Si desmarcas el único favorito, el resumen dice «ninguno todavía»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Noche en Gredos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Noche en Gredos"
          }
        }
      ],
      "espera": {
        "texto": "Tus favoritos: ninguno todavía"
      }
    }
  ]
}
```

Si la vista previa se cae y la consola dice «The result of getSnapshot should be cached…» en cuanto escribes el `useSyncExternalStore`, es la trampa del enunciado: `leerFavoritos` hace un `JSON.parse` en cada llamada. Guarda el último texto y el último array, como en las reservas del polideportivo. Otra solución válida es que `getSnapshot` devuelva el texto tal cual y que el Hook haga el `JSON.parse`; en ese caso, cada render tendrá un array nuevo, lo que no importa para pintar, pero sí si lo pasas como dependencia de un efecto (lección 42).

**Retos para seguir practicando** (sin comprobación automática):

1. Copia el ejercicio resuelto en tu proyecto de Vite y ábrelo en dos pestañas. Marca un favorito en una y mira la otra. Después quita el `addEventListener('storage', …)` de `suscribirse` y repite: ¿qué pestaña se entera ahora?
2. Escribe un Hook `useVentanaEstrecha(limite)` para el horario del polideportivo. `subscribe` puede vivir fuera; ¿y `getSnapshot`, que depende de `limite`?
3. Convierte el sistema de turnos del centro de salud en un Hook `useTurnos()` que devuelva `{ actual, enEspera }`. Usa dos `useSyncExternalStore`, no uno con un objeto: explica por qué con lo que viste en el polideportivo.
4. Cuando llegues a la lección 87, vuelve a `useFavoritos` y piensa qué debería devolver su `getServerSnapshot` para que el HTML del servidor y el primer render del navegador coincidan.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "La referencia del Hook: parámetros, avisos, la conexión como ejemplo, getServerSnapshot y los dos problemas típicos de esta lección.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "You Might Not Need an Effect: Subscribing to an external store",
      "descripcion": "Por qué este Hook se prefiere a un efecto con estado para suscribirse a algo de fuera de React.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reusing Logic with Custom Hooks",
      "descripcion": "Cómo esconder la suscripción detrás de un Hook propio, con useOnlineStatus como ejemplo.",
      "url": "https://react.dev/learn/reusing-logic-with-custom-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Navigator: onLine",
      "descripcion": "Qué significa de verdad estar en línea para el navegador, y por qué conviene usarlo solo para avisar.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Window: storage event",
      "descripcion": "El evento que avisa de los cambios en localStorage hechos desde otras pestañas, y solo desde otras.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Object.is()",
      "descripcion": "La comparación que usa React para decidir si el valor de getSnapshot ha cambiado.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is",
      "etiqueta": "MDN"
    }
  ]
}
```
