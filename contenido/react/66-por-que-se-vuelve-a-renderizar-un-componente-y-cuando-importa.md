# Por qué se vuelve a renderizar un componente (y cuándo importa)

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `por-que-se-vuelve-a-renderizar-un-componente-y-cuando-importa` (autogenerado del título)
- **Orden:** 660
- **Fuentes:** [Render and Commit](https://react.dev/learn/render-and-commit) + [React Developer Tools](https://react.dev/learn/react-developer-tools) — ver `contenido/react/TEMARIO.md` #66

---

## Qué es y para qué sirve

En la lección 17 viste el ciclo de cada actualización (disparar, renderizar, hacer commit) y que un render arrastra a todos los componentes que hay debajo. Desde entonces, el panel «Árbol de renders» te ha ido dando el motivo de cada re-render en casi cada lección. Esta junta las piezas para responder a dos preguntas que te harás en cuanto una aplicación crezca:

1. **¿Por qué se ha vuelto a renderizar este componente?** Solo hay cuatro respuestas, y el panel te dice cuál es. En tu proyecto, lo mismo te lo dicen las React DevTools.
2. **¿Importa?** Casi nunca. Aquí vas a aprender a reconocer el caso en que sí y a arreglarlo **sin memorizar nada**: bajando el estado, pasando el contenido como `children` o separando un contexto.

Medir cuánto tarda cada render, con las React DevTools y el `<Profiler>`, es la lección 65; memorizar a mano con `memo`, `useMemo` y `useCallback`, la 67.

Los ejemplos son de la sala de control de La Llave Perdida, un escape room: desde ahí, el máster de juego vigila la cuenta atrás, manda pistas a los equipos y sigue el plano de las salas.

## Las cuatro causas de un re-render

Dejando aparte el render inicial, un componente se vuelve a renderizar por una de estas cuatro razones, y por ninguna más:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Por qué se renderiza otra vez un componente",
  "roles": [
    {
      "etiqueta": "1. Su estado",
      "rol": "Ha cambiado un estado suyo",
      "descripcion": "Una función set de su useState o su useReducer ha recibido un valor distinto. El panel dice «cambió su estado», con el número si tiene varios."
    },
    {
      "etiqueta": "2. Su padre",
      "rol": "Se ha renderizado quien lo pinta",
      "descripcion": "React renderiza todo lo que devuelve un componente. El panel dice «se renderizó su padre», o «cambió la prop…» si además le llega algo distinto."
    },
    {
      "etiqueta": "3. Un contexto",
      "rol": "Ha cambiado un contexto que lee",
      "descripcion": "El value del proveedor más cercano es otro, comparado con Object.is. El panel dice «cambió el contexto «Nombre»», aunque su padre no se haya movido."
    },
    {
      "etiqueta": "4. Un Hook",
      "rol": "Uno de sus Hooks pide un render",
      "descripcion": "Un Hook propio trae su estado o su contexto. Otros, como useSyncExternalStore o useTransition, avisan por su cuenta: el panel dice «cambió otro de sus ganchos»."
    }
  ]
}
```

La sala de control tiene un botón para cada causa. Mira el panel antes de pulsar nada: commit 1, todo montado. Luego ve de uno en uno:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuatro botones, cuatro motivos",
  "consigna": "Pulsa los botones de uno en uno y en este orden: «Pausar», «Enviar pista», «Cambiar de equipo» y «Cortar la señal». Después de cada clic, lee en el panel qué componentes se han renderizado, con qué motivo, y el resumen de arriba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { ProveedorEquipo, Marcador } from './equipo'\nimport { useSenal, cortarSenal } from './senal'\nimport './estilos.css'\n\nfunction Cronometro() {\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  return (\n    <section className=\"panel\">\n      <p>Cronómetro: {enMarcha ? 'en marcha' : 'en pausa'}</p>\n      <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n    </section>\n  )\n}\n\nfunction Pistas({ enviadas }) {\n  return <p>Pistas enviadas: {enviadas} de 3</p>\n}\n\nfunction Normas() {\n  return <p className=\"normas\">Prohibido forzar candados y mover los muebles.</p>\n}\n\nfunction Camaras() {\n  const conSenal = useSenal()\n  return <p>Cámaras: {conSenal ? 'con señal' : 'sin señal'}</p>\n}\n\nexport default function App() {\n  const [enviadas, setEnviadas] = useState(0)\n\n  return (\n    <ProveedorEquipo>\n      <h1>La Llave Perdida · Sala de control</h1>\n      <Cronometro />\n      <section className=\"panel\">\n        <Pistas enviadas={enviadas} />\n        <button onClick={() => setEnviadas(enviadas + 1)}>Enviar pista</button>\n      </section>\n      <Normas />\n      <Marcador />\n      <section className=\"panel\">\n        <Camaras />\n        <button onClick={cortarSenal}>Cortar la señal</button>\n      </section>\n    </ProveedorEquipo>\n  )\n}\n"
    },
    {
      "nombre": "equipo.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst EquipoContext = createContext('')\nEquipoContext.displayName = 'Equipo'\n\nexport function ProveedorEquipo({ children }) {\n  const [equipo, setEquipo] = useState('Los Linces')\n\n  return (\n    <EquipoContext value={equipo}>\n      <main>\n        {children}\n        <button onClick={() => setEquipo(equipo === 'Los Linces' ? 'Las Ardillas' : 'Los Linces')}>\n          Cambiar de equipo\n        </button>\n      </main>\n    </EquipoContext>\n  )\n}\n\nexport function Marcador() {\n  const equipo = useContext(EquipoContext)\n  return <p>Equipo en la sala: {equipo}</p>\n}\n"
    },
    {
      "nombre": "senal.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\n\n// La señal de las cámaras vive fuera de React, en este módulo.\n// useSenal se suscribe a ella con useSyncExternalStore (lección 46).\nlet conSenal = true\nconst oyentes = new Set()\n\nexport function cortarSenal() {\n  conSenal = !conSenal\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribirse(avisar) {\n  oyentes.add(avisar)\n  return () => oyentes.delete(avisar)\n}\n\nexport function useSenal() {\n  return useSyncExternalStore(suscribirse, () => conSenal)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Cada botón dispara una causa distinta, y el panel la nombra:

- **«Pausar»**: solo `Cronometro` ← «cambió su estado». Todo lo demás, sin cambios. Un estado mueve al componente que lo guarda y a lo que tiene debajo; aquí, nada.
- **«Enviar pista»**: `App` ← «cambió su estado», y con ella **todo lo que pinta**: `Pistas` ← «cambió la prop «enviadas»», `ProveedorEquipo` ← «cambió la prop «children» (array nuevo)», porque `App` ha vuelto a crear los elementos que le pasa, y `Cronometro`, `Normas`, `Marcador` y `Camaras` ← «se renderizó su padre». El resumen: **8 renderizados · 1 cambio en el DOM**, el número de pistas.
- **«Cambiar de equipo»**: el estado vive en `ProveedorEquipo`, que recibe lo demás como `children` (lo viste en la lección 28). Se renderizan él, el proveedor «Equipo» y `Marcador` ← «cambió el contexto «Equipo»». El resto, sin cambios, aunque está dentro.
- **«Cortar la señal»**: solo `Camaras` ← «cambió otro de sus ganchos». Nadie le ha pasado nada y no tiene ningún `useState`: la señal vive fuera de React, en `senal.jsx`, y el Hook `useSenal` la lee con `useSyncExternalStore` (lección 46).

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las props no son una causa",
  "contenido": "Ningún componente se renderiza porque cambien sus props: una prop solo puede cambiar si el padre se renderiza y le pasa otra. «cambió la prop» describe qué le llega distinto en un render que ha empezado más arriba. Por eso el panel nunca da a la vez «cambió la prop» y «se renderizó su padre»: si encuentra algo concreto, lo nombra; si no, se queda con el padre."
}
```

## Lo que trae un Hook

Un Hook propio no se renderiza por su cuenta: es código del componente que lo llama (lección 43). **Su estado es estado del componente, y sus contextos, contextos del componente.** El panel nombra siempre al componente, nunca al Hook, así que el motivo puede no corresponder a nada que veas escrito en él.

Imagina que `useSenal` no usara `useSyncExternalStore`, sino una copia de la señal en un estado, puesta al día desde un efecto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function useSenal() {\n  const [senal, setSenal] = useState(conSenal)\n\n  useEffect(() => {\n    const avisar = () => setSenal(conSenal)\n    oyentes.add(avisar)\n    return () => oyentes.delete(avisar)\n  }, [])\n\n  return senal\n}\n\nfunction Camaras() {\n  const [zoom, setZoom] = useState(1)\n  const conSenal = useSenal()\n  // ...\n}\n\n// Pulsas «Cortar la señal». ¿Qué motivo da el panel para Camaras?",
  "opciones": [
    "cambió otro de sus ganchos",
    "cambió su estado n.º 1",
    "cambió su estado n.º 2",
    "se renderizó su padre"
  ],
  "correcta": 2,
  "explicacion": "Para React, el useState de useSenal es un estado más de Camaras, y es el segundo que se ejecuta, después del de zoom. React reconoce los estados por el orden de llamada (lección 16) y no sabe que uno vive dentro de un Hook. Por eso, si un motivo no cuadra con lo que ves en un componente, mira dentro de sus Hooks."
}
```

Con el contexto pasa igual: si un Hook `useSala()` llama a `useContext(SalaContext)`, cada componente que use `useSala` saldrá con «cambió el contexto «Sala»», aunque en su código no aparezca ningún `useContext`. Y «cambió otro de sus ganchos» es lo que el panel dice cuando el aviso viene de un Hook de React que no es un estado tuyo: `useSyncExternalStore`, como en las cámaras, o `useTransition` al cambiar `isPending` (lección 51).

## El motivo dice si el render sobraba

Además de explicar el render, cada motivo te dice **si el componente podía devolver algo distinto** de lo que ya había. Esa es la pregunta que importa para optimizar:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "cambió su estado · cambió el contexto",
      "texto": "Algo que el componente lee es distinto. Renderizar es la única forma de que React sepa qué pintar ahora: este render no sobra."
    },
    {
      "titulo": "cambió la prop «enviadas»",
      "texto": "Sin nada entre paréntesis, le llega otro valor: un número, un texto, un booleano. Tampoco sobra."
    },
    {
      "titulo": "se renderizó su padre",
      "texto": "No ha cambiado nada de lo que recibe. Si el componente es puro (lección 12), devolverá exactamente lo mismo que la vez anterior: este render sobraba."
    },
    {
      "titulo": "(función nueva) · (objeto nuevo) · (array nuevo)",
      "texto": "Le llega otra referencia, aunque su contenido sea idéntico: React compara con Object.is, no por dentro (lección 20). Muchas veces sobra, y es justo lo que estropea memo en la lección 67."
    },
    {
      "titulo": "cambió la prop «children»",
      "texto": "El padre ha vuelto a crear los elementos que le pasa. Casi siempre son los mismos, escritos otra vez: un caso particular del anterior."
    }
  ]
}
```

Ponlo a prueba con este commit de otra versión de la sala de control, después de pulsar «Enviar pista»:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Commit 2 · 6 renderizados · 1 cambio en el DOM\n// App          ← cambió su estado\n// Cronometro   ← se renderizó su padre\n// Pistas       ← cambió la prop «enviadas»\n// ListaSalas   ← cambió la prop «salas» (array nuevo)\n// Camaras      ← cambió la prop «onAvisar» (función nueva)\n// Normas       ← se renderizó su padre\n\n// En App:\n<ListaSalas salas={SALAS.filter((s) => s.abierta)} />\n<Camaras onAvisar={() => avisar(sala)} />\n// SALAS y sala no han cambiado.\n\n// ¿Cuántos de estos seis renders podían devolver\n// algo distinto de lo que ya había en pantalla?",
  "opciones": [
    "Los seis: todos se han ejecutado",
    "Dos: App y Pistas",
    "Cuatro: todos menos los que dicen «se renderizó su padre»",
    "Ninguno: solo ha cambiado un texto"
  ],
  "correcta": 1,
  "explicacion": "App tiene un estado nuevo y Pistas recibe otro número: los dos pueden pintar algo distinto, y Pistas lo hace. ListaSalas recibe un array nuevo con las mismas salas, y Camaras una flecha nueva que hace lo mismo: otra referencia, igual contenido. Cronometro y Normas no reciben nada nuevo. Cuatro renders de sobra, y el resumen lo confirma: un solo cambio en el DOM."
}
```

Que un render sobre no quiere decir que haya que evitarlo. Cuatro componentes pequeños que se ejecutan para nada no cuestan casi nada. **Lo que decide si hay que hacer algo es lo que cuesta**, y eso no lo dice el motivo.

## Renderizar no es repintar… ni es gratis

En la lección 17 viste «5 renderizados · 1 cambio en el DOM»: React ejecuta todos los componentes de la rama, pero solo toca en la página lo que ha cambiado. Eso desmonta el mito de que «re-renderizar es repintar la página». Pero el mito tiene una segunda mitad que se olvida: **un render que no cambia nada en el DOM también cuesta**, porque React tiene que ejecutar tus componentes para descubrir que no hay nada que cambiar.

En este bloque, el texto del mensaje vive en `App`, y `App` pinta también el plano de las salas. Cada sala está hecha lenta a propósito: tarda 20 ms en renderizarse.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada letra, seis renders",
  "consigna": "Escribe una frase en el campo a tu ritmo normal, por ejemplo «Mirad debajo del reloj». ¿Va fluido? Mira el panel con cada letra: cuántos componentes se renderizan y cuántos cambios en el DOM hay. El recuadro ámbar de la vista previa te dice qué se ha tocado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport PlanoSalas from './PlanoSalas'\nimport './estilos.css'\n\nexport default function App() {\n  const [mensaje, setMensaje] = useState('')\n\n  return (\n    <main>\n      <h1>La Llave Perdida · Sala de control</h1>\n      <label>\n        Mensaje para el equipo\n        <input value={mensaje} onChange={(e) => setMensaje(e.target.value)} />\n      </label>\n      <PlanoSalas />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlanoSalas.jsx",
      "codigo": "const SALAS = [\n  { id: 'biblioteca', nombre: 'Biblioteca', equipo: 'Los Linces' },\n  { id: 'cripta', nombre: 'Cripta', equipo: null },\n  { id: 'laboratorio', nombre: 'Laboratorio', equipo: 'Las Ardillas' },\n  { id: 'camarote', nombre: 'Camarote', equipo: null },\n]\n\nfunction Sala({ nombre, equipo }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 20) {\n    // A propósito: cada sala tarda 20 ms en renderizarse,\n    // como un componente de verdad con mucho dentro\n  }\n  return (\n    <li className={equipo ? 'sala ocupada' : 'sala'}>\n      {nombre}: {equipo ?? 'libre'}\n    </li>\n  )\n}\n\nexport default function PlanoSalas() {\n  return (\n    <ul className=\"plano\" aria-label=\"Plano de salas\">\n      {SALAS.map((sala) => (\n        <Sala key={sala.id} nombre={sala.nombre} equipo={sala.equipo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Con cada letra, el panel dice **6 renderizados · 1 cambio en el DOM**. El único cambio es el propio campo: React copia lo que escribes en su atributo `value`, y el panel cuenta cualquier cambio del DOM. El plano y sus cuatro salas se ejecutan con cada letra para devolver exactamente lo mismo («se renderizó su padre»), y eso son 4 × 20 = 80 ms por letra; en este bloque, el doble, porque `StrictMode` llama dos veces a cada componente (lección 12). El campo se atasca y el DOM apenas se ha tocado.

Cada actualización pasa dos facturas, y el panel solo cuenta lo que se ha hecho, no lo que ha tardado:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que cuesta una actualización",
  "roles": [
    {
      "etiqueta": "Renderizar",
      "rol": "Tu código",
      "descripcion": "React ejecuta cada componente de la rama y compara lo que devuelve. Cuesta lo que tarden tus componentes, cambie algo o no. Suele ser donde está el problema."
    },
    {
      "etiqueta": "Hacer commit",
      "rol": "El DOM",
      "descripcion": "React aplica solo las diferencias. Suele ser poco, salvo que cambien muchos nodos a la vez: montar una página, filtrar o reordenar una lista larga."
    }
  ]
}
```

En el resumen del panel, «N renderizados» es la primera factura y «N cambios en el DOM», la segunda, pero sin el tiempo. Los milisegundos de cada componente te los da el Profiler de las React DevTools, en tu proyecto (lección 65). Sus opciones hablan el mismo idioma que el panel: si activas «Record why each component rendered while profiling», cada componente del commit trae su «Why did this render?», con respuestas como «The parent component rendered.».

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Dos resaltados distintos",
  "contenido": "Las React DevTools tienen la opción «Highlight updates when components render», que dibuja un recuadro alrededor de cada componente que se ha renderizado, haya cambiado algo o no. El recuadro ámbar de esta web marca otra cosa: los nodos del DOM que el commit ha cambiado de verdad. En el bloque anterior, con cada letra, las DevTools recuadrarían los seis componentes que se renderizan; aquí solo se recuadra el campo."
}
```

## Cuándo importa: lo caro, multiplicado por lo frecuente

**Un render importa cuando lo que cuesta, multiplicado por las veces que ocurre, se nota.** Un componente que tarda 2 ms y se renderiza cuando pulsas un botón no se notará nunca. Ese mismo componente dentro de una lista de 500 filas, renderizado con cada tecla, sí. A 60 imágenes por segundo, el navegador tiene unos 16 ms para preparar cada una: si un render bloquea más que eso mientras escribes, arrastras o haces scroll, la página da tirones.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Lo frecuente: cada tecla",
      "texto": "Un estado que cambia con cada letra renderiza todo lo que cuelga del componente que lo guarda, varias veces por segundo."
    },
    {
      "titulo": "Lo frecuente: ratón, scroll y arrastrar",
      "texto": "Un estado que sigue al ratón (la posición, el elemento que tiene debajo) o al scroll cambia decenas de veces por segundo."
    },
    {
      "titulo": "Lo frecuente: relojes y animaciones",
      "texto": "Una cuenta atrás, una barra de progreso o una animación hecha con estado renderizan cada segundo, o en cada fotograma, aunque nadie toque nada."
    },
    {
      "titulo": "Lo caro: listas largas",
      "texto": "Mil filas son mil componentes que ejecutar y comparar. Lo que no se nota en una fila se multiplica por mil."
    },
    {
      "titulo": "Lo caro: trabajo en el cuerpo del componente",
      "texto": "Formatear fechas o números, ordenar, filtrar o calcular algo grande en cada render, en vez de una sola vez."
    },
    {
      "titulo": "Cuando no importa",
      "texto": "Clics que cambian de página o abren un panel, listas cortas, componentes sencillos: la mayoría de los renders de una aplicación. No los persigas."
    }
  ]
}
```

El historial de partidas junta las dos cosas: 2.000 filas y un buscador que las filtra con cada letra. Aquí ningún render sobra, porque cada letra cambia la lista; lo que puede sobrar es trabajo dentro del render. `Historial` mide con `performance.now()` lo que tarda en construir sus filas y lo escribe en la consola. `StrictMode` está apagado para que salga una línea por render.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "2.000 partidas y un buscador",
  "consigna": "Escribe «linc» en el buscador mirando la consola: cada letra vuelve a construir cientos o miles de filas. Después crea un formateador una sola vez, fuera de Historial: const FECHA = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }), y en cada fila usa FECHA.format(partida.fecha). Borra la búsqueda, repítela y compara los milisegundos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { PARTIDAS } from './partidas'\nimport './estilos.css'\n\nfunction Historial({ partidas }) {\n  const inicio = performance.now()\n  const filas = partidas.map((partida) => (\n    <li key={partida.id}>\n      {partida.equipo} · {partida.sala} ·{' '}\n      {new Date(partida.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}\n      · {partida.minutos} min\n    </li>\n  ))\n  console.log(`${partidas.length} filas en ${(performance.now() - inicio).toFixed(1)} ms`)\n\n  return <ul className=\"historial\">{filas}</ul>\n}\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('')\n  const texto = busqueda.toLowerCase()\n  const visibles = PARTIDAS.filter((p) => p.equipo.toLowerCase().includes(texto))\n\n  return (\n    <main>\n      <h1>La Llave Perdida · Historial de partidas</h1>\n      <label>\n        Buscar equipo\n        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />\n      </label>\n      <p>{visibles.length} partidas</p>\n      <Historial partidas={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "partidas.jsx",
      "codigo": "const EQUIPOS = ['Los Linces', 'Las Ardillas', 'Los Búhos', 'Las Nutrias', 'Los Tejones', 'Las Urracas']\nconst SALAS = ['Biblioteca', 'Cripta', 'Laboratorio', 'Camarote']\n\n// 2.000 partidas inventadas: una cada cinco horas desde el 1 de enero\nexport const PARTIDAS = Array.from({ length: 2000 }, (_, i) => ({\n  id: i + 1,\n  equipo: `${EQUIPOS[i % EQUIPOS.length]} ${Math.floor(i / EQUIPOS.length) + 1}`,\n  sala: SALAS[i % SALAS.length],\n  fecha: Date.UTC(2026, 0, 1, 10) + i * 5 * 60 * 60 * 1000,\n  minutos: 35 + ((i * 7) % 25),\n}))\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true
}
```

Los milisegundos exactos dependen de tu ordenador y de tu navegador, pero la diferencia se ve: con el formateador compartido, construir las filas cuesta una fracción de lo que costaba. MDN lo explica en la página de `toLocaleDateString`: cada llamada tiene que buscar otra vez en una gran base de datos de textos de cada idioma, y si vas a formatear muchas fechas con las mismas opciones, conviene crear un `Intl.DateTimeFormat` y reutilizar su `format()`. Con 2.000 filas eran 2.000 búsquedas por letra.

Fíjate en lo que **no** ha cambiado: se renderiza lo mismo, las mismas veces. **Antes de evitar un render, abarata el que tiene que ocurrir.** Suele ser el arreglo más rentable y el más sencillo. Y si un render necesario sigue siendo caro, hay salidas que no son de esta lección: que la lista vaya por detrás del campo con `useDeferredValue` (lección 51), o pintar solo las filas que se ven, con una librería de virtualización (proyecto 94).

Ten en cuenta que el número de la consola solo mide tu código, el `map` con sus fechas. React tarda además en comparar las filas y aplicar los cambios al DOM; el tiempo total del render lo mide el Profiler (lección 65).

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Mide antes de arreglar, y mide bien",
  "contenido": "Antes de cambiar nada, comprueba que hay un problema y dónde: el Profiler de las React DevTools te dice qué componentes se han renderizado en cada commit, por qué y cuánto han tardado (lección 65). Para decidir, mide con el build de producción, porque el de desarrollo es más lento y StrictMode duplica cada render, y prueba con la CPU ralentizada: tu ordenador es más rápido que el de muchas de las personas que usarán tu aplicación."
}
```

## Arreglo 1: baja el estado hasta quien lo usa

Vuelve al bloque «Cada letra, seis renders». El texto del mensaje vive en `App`, y **el render empieza donde vive el estado**: con cada letra, React arranca en `App` y baja por toda su rama, plano incluido. Si el estado baja a un componente que solo pinta el campo, el plano se queda fuera de la rama que se renderiza:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El mensaje, antes y después de bajarlo",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "antes · estado: mensaje",
      "estado": "renderizado",
      "nota": "← cambió su estado, con cada letra"
    },
    {
      "nombre": "PlanoSalas",
      "nivel": 1,
      "estado": "renderizado",
      "nota": "← se renderizó su padre: 80 ms por letra"
    },
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "después",
      "estado": "sin-cambios"
    },
    {
      "nombre": "MensajeEquipo",
      "nivel": 1,
      "etiqueta": "estado: mensaje",
      "estado": "renderizado",
      "nota": "← cambió su estado"
    },
    {
      "nombre": "PlanoSalas",
      "nivel": 1,
      "estado": "sin-cambios",
      "nota": "es su hermano, no su hijo: queda fuera"
    }
  ]
}
```

Es lo mismo que hiciste con el reloj del Teatro Alameda en la lección 17, y es el ejercicio del final de esta lección, con una complicación: los mensajes enviados también se apuntan en una lista.

Los mejores candidatos para bajar son los **estados transitorios**, los que solo le importan a un trozo pequeño de la interfaz mientras lo usas: lo que se está escribiendo en un campo, si un desplegable está abierto, qué fila tiene el ratón encima, la pestaña activa de un panel. react.dev lo resume así: no subas el estado más de lo necesario, y no guardes estados así arriba del todo ni en una librería de estado global.

El límite lo pone la lección 25: si otro componente necesita ese dato, el estado vive en el antepasado común de los dos, ni más arriba ni más abajo.

## Arreglo 2: que te pasen el contenido como children

A veces el estado ya está donde se usa, y aun así arrastra algo caro. La lupa de la sala de control guarda el tamaño del plano, y es ella quien lo pinta dentro:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lupa que arrastra al plano",
  "consigna": "Pulsa «Acercar» y mira el panel: con cada clic se renderizan la lupa, el plano y las cuatro salas, aunque lo único que cambia es el tamaño de la letra. Arréglalo sin tocar PlanoSalas.jsx: que Lupa reciba children y los pinte donde ahora está el plano, y que App escriba <Lupa><PlanoSalas /></Lupa>. Vuelve a pulsar «Acercar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport PlanoSalas from './PlanoSalas'\nimport './estilos.css'\n\n// La lupa agranda lo que tiene dentro. Ahora mismo, pinta ella el plano.\nfunction Lupa() {\n  const [tamano, setTamano] = useState(1)\n\n  return (\n    <section className=\"panel\">\n      <button onClick={() => setTamano(tamano + 0.25)}>Acercar</button>\n      <button onClick={() => setTamano(1)}>Tamaño normal</button>\n      <div style={{ fontSize: tamano + 'rem' }}>\n        <PlanoSalas />\n      </div>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>La Llave Perdida · Sala de control</h1>\n      <Lupa />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlanoSalas.jsx",
      "codigo": "const SALAS = [\n  { id: 'biblioteca', nombre: 'Biblioteca', equipo: 'Los Linces' },\n  { id: 'cripta', nombre: 'Cripta', equipo: null },\n  { id: 'laboratorio', nombre: 'Laboratorio', equipo: 'Las Ardillas' },\n  { id: 'camarote', nombre: 'Camarote', equipo: null },\n]\n\nfunction Sala({ nombre, equipo }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 20) {\n    // A propósito: cada sala tarda 20 ms en renderizarse,\n    // como un componente de verdad con mucho dentro\n  }\n  return (\n    <li className={equipo ? 'sala ocupada' : 'sala'}>\n      {nombre}: {equipo ?? 'libre'}\n    </li>\n  )\n}\n\nexport default function PlanoSalas() {\n  return (\n    <ul className=\"plano\" aria-label=\"Plano de salas\">\n      {SALAS.map((sala) => (\n        <Sala key={sala.id} nombre={sala.nombre} equipo={sala.equipo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Antes del cambio, cada clic eran **6 renderizados · 1 cambio en el DOM**: el atributo `style` del `<div>`. Después, **1 renderizado · 1 cambio en el DOM**: `Lupa` ← «cambió su estado», y `PlanoSalas` y sus salas, sin cambios. El mismo cambio en la página, con un render en vez de seis, y sin las salas lentas.

¿Por qué? El elemento `<PlanoSalas />` lo crea ahora `App`, y `App` no se ha vuelto a renderizar: en `children`, `Lupa` recibe **exactamente el mismo objeto** que la vez anterior. Un elemento no se modifica después de crearlo (lección 7), así que cuando React encuentra en un sitio el mismo elemento que ya había, el mismo objeto y no uno igual, sabe que esa rama no puede haber cambiado y se la salta entera.

La clave es quién crea el elemento. En el árbol, `PlanoSalas` sigue siendo hijo de `Lupa`, que es quien lo pinta. Pero quien escribe `<PlanoSalas />` en su JSX, su *owner*, como en la pila de owners de la lección 64, es `App`, y **un elemento solo se vuelve a crear cuando se renderiza quien lo escribe**.

Lo viste con el proveedor del tema en la lección 28, y vale para cualquier componente que envuelve: un panel plegable, un modal, un contenedor que sigue la posición del scroll, una ventana que se arrastra. Tampoco tiene que ser `children`: cualquier prop que reciba JSX, como los huecos con nombre de la lección 30, funciona igual.

## Arreglo 3: separa lo que cambia a menudo

Un contexto avisa a todos sus lectores cuando cambia su `value`, sin mirar qué parte usa cada uno (lecciones 28 y 29). Si junta algo que cambia cada segundo con algo que casi nunca cambia, los que leen lo segundo se renderizan al ritmo de lo primero.

Aquí la cuenta atrás de la partida y el nombre del equipo viajan en el mismo contexto. El plano lee el equipo para marcar su sala:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un contexto con prisa",
  "consigna": "No toques nada: mira el panel durante unos segundos. Cada segundo, ¿qué componentes se renderizan y con qué motivo? ¿Cuáles de ellos usan de verdad los segundos?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ProveedorPartida, usePartida } from './partida'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'biblioteca', nombre: 'Biblioteca', equipo: 'Los Linces' },\n  { id: 'cripta', nombre: 'Cripta', equipo: null },\n  { id: 'laboratorio', nombre: 'Laboratorio', equipo: 'Las Ardillas' },\n  { id: 'camarote', nombre: 'Camarote', equipo: null },\n]\n\nfunction CuentaAtras() {\n  const { segundos } = usePartida()\n  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0')\n  const resto = String(segundos % 60).padStart(2, '0')\n  return <p className=\"cuenta\">{minutos}:{resto}</p>\n}\n\nfunction Marcador() {\n  const { equipo } = usePartida()\n  return <p>Equipo en la sala: {equipo}</p>\n}\n\nfunction Sala({ nombre, suya }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 20) {\n    // 20 ms por sala, a propósito\n  }\n  return <li className={suya ? 'sala ocupada' : 'sala'}>{nombre}</li>\n}\n\nfunction PlanoSalas() {\n  const { equipo } = usePartida()\n  return (\n    <ul className=\"plano\" aria-label=\"Plano de salas\">\n      {SALAS.map((sala) => (\n        <Sala key={sala.id} nombre={sala.nombre} suya={sala.equipo === equipo} />\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorPartida equipo=\"Los Linces\">\n      <main>\n        <h1>La Llave Perdida · Sala de control</h1>\n        <CuentaAtras />\n        <Marcador />\n        <PlanoSalas />\n      </main>\n    </ProveedorPartida>\n  )\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst PartidaContext = createContext(null)\nPartidaContext.displayName = 'Partida'\n\nexport function ProveedorPartida({ equipo, children }) {\n  const [segundos, setSegundos] = useState(60 * 60)\n\n  useEffect(() => {\n    const id = setInterval(() => setSegundos((s) => Math.max(s - 1, 0)), 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  // Todo lo de la partida, en un solo contexto\n  return <PartidaContext value={{ segundos, equipo }}>{children}</PartidaContext>\n}\n\nexport function usePartida() {\n  return useContext(PartidaContext)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "partida.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Cada segundo, **9 renderizados · 1 cambio en el DOM**: la cuenta atrás. Solo `CuentaAtras` usa los segundos, pero `Marcador` y `PlanoSalas` dicen también «cambió el contexto «Partida»»: el `value` es un objeto nuevo en cada tic, y React no sabe que esos dos solo leen `equipo`. `PlanoSalas` arrastra además a sus cuatro salas: 80 ms de trabajo cada segundo (160 en este bloque, con `StrictMode`) para pintar lo mismo.

El arreglo es partir el contexto **por ritmo de cambio**: lo que cambia cada segundo, en uno; lo que no cambia en toda la partida, en otro.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un contexto para el tiempo y otro para el equipo",
  "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst TiempoContext = createContext(0)\nTiempoContext.displayName = 'Tiempo'\nconst EquipoContext = createContext('')\nEquipoContext.displayName = 'Equipo'\n\nfunction ProveedorPartida({ equipo, children }) {\n  const [segundos, setSegundos] = useState(60 * 60)\n\n  useEffect(() => {\n    const id = setInterval(() => setSegundos((s) => Math.max(s - 1, 0)), 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <EquipoContext value={equipo}>\n      <TiempoContext value={segundos}>{children}</TiempoContext>\n    </EquipoContext>\n  )\n}\n\nconst SALAS = [\n  { id: 'biblioteca', nombre: 'Biblioteca', equipo: 'Los Linces' },\n  { id: 'cripta', nombre: 'Cripta', equipo: null },\n  { id: 'laboratorio', nombre: 'Laboratorio', equipo: 'Las Ardillas' },\n  { id: 'camarote', nombre: 'Camarote', equipo: null },\n]\n\nfunction CuentaAtras() {\n  const segundos = useContext(TiempoContext)\n  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0')\n  const resto = String(segundos % 60).padStart(2, '0')\n  return <p className=\"cuenta\">{minutos}:{resto}</p>\n}\n\nfunction Marcador() {\n  const equipo = useContext(EquipoContext)\n  return <p>Equipo en la sala: {equipo}</p>\n}\n\nfunction Sala({ nombre, suya }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 20) {\n    // 20 ms por sala, a propósito\n  }\n  return <li className={suya ? 'sala ocupada' : 'sala'}>{nombre}</li>\n}\n\nfunction PlanoSalas() {\n  const equipo = useContext(EquipoContext)\n  return (\n    <ul className=\"plano\" aria-label=\"Plano de salas\">\n      {SALAS.map((sala) => (\n        <Sala key={sala.id} nombre={sala.nombre} suya={sala.equipo === equipo} />\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorPartida equipo=\"Los Linces\">\n      <main>\n        <h1>La Llave Perdida · Sala de control</h1>\n        <CuentaAtras />\n        <Marcador />\n        <PlanoSalas />\n      </main>\n    </ProveedorPartida>\n  )\n}",
  "css": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const TiempoContext = createContext(0)",
      "nota": "Un contexto solo para lo que cambia cada segundo. Su displayName es el nombre que verás en el panel."
    },
    {
      "fragmento": "const EquipoContext = createContext('')",
      "nota": "Y otro para lo que no cambia en toda la partida."
    },
    {
      "fragmento": "<EquipoContext value={equipo}>",
      "nota": "El value es el propio texto, no un objeto que lo envuelva. Object.is entre «Los Linces» y «Los Linces» da true: con cada tic, este contexto no ha cambiado y sus lectores no se enteran."
    },
    {
      "fragmento": "<TiempoContext value={segundos}>{children}</TiempoContext>",
      "nota": "Los children los crea App, que no se renderiza nunca: son los mismos elementos en cada tic. Solo se mueven los lectores de Tiempo."
    },
    {
      "fragmento": "const segundos = useContext(TiempoContext)",
      "nota": "CuentaAtras es el único componente que lee el tiempo, y el único que se renderiza cada segundo."
    },
    {
      "fragmento": "function PlanoSalas() {\n  const equipo = useContext(EquipoContext)",
      "nota": "El plano solo lee el equipo. En el panel, él y sus salas salen sin cambios en cada tic."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Ahora, cada segundo: **4 renderizados · 1 cambio en el DOM**. `ProveedorPartida` porque cambió su estado, los dos proveedores porque son lo que él devuelve, y `CuentaAtras` porque cambió el contexto «Tiempo». `Marcador`, el plano y sus salas, sin cambios.

Partir por ritmo de cambio es una forma más de partir un contexto. En la lección 29 lo partiste por quién lo usa: el estado para quien lo lee y `dispatch` para quien lo cambia. Y la lección 75 enseña dónde se acaba el truco: cuando muchos componentes leen trocitos distintos de algo que cambia sin parar, toca un almacén con selectores.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Si el valor tiene que ser un objeto",
  "contenido": "Con value={{ equipo, sala }} en el contexto del equipo no habrías arreglado nada: ese objeto se crea en cada render del proveedor, es decir, cada segundo, y el panel volvería a decir «cambió la prop «value» (objeto nuevo)» y «cambió el contexto «Equipo»». O pasas valores sueltos, uno por contexto, o mantienes el mismo objeto entre renders con useMemo (lección 67)."
}
```

## Cuándo lo usarías de verdad

Cuando hay un síntoma (un campo que se atasca, un scroll a tirones, una animación que salta) y el panel o el Profiler te han llevado hasta el componente culpable. Del síntoma al arreglo:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Del síntoma al arreglo",
  "roles": [
    {
      "etiqueta": "Un campo que se atasca",
      "rol": "Baja el estado",
      "descripcion": "Lo que escribes vive arriba y cada letra arrastra algo caro. Llévalo al formulario y sube solo el resultado al enviar."
    },
    {
      "etiqueta": "Un envoltorio que cambia",
      "rol": "Pásale el contenido como children",
      "descripcion": "Una lupa, un panel con scroll, una ventana que se arrastra: su estado cambia sin parar, pero lo que envuelve no tiene por qué."
    },
    {
      "etiqueta": "Un contexto con prisa",
      "rol": "Sepáralo por ritmo de cambio",
      "descripcion": "Lo que cambia cada segundo, en su propio contexto; lo que apenas cambia, en otro, con valores sueltos."
    },
    {
      "etiqueta": "Un render necesario y caro",
      "rol": "Abarátalo o difiérelo",
      "descripcion": "Menos trabajo por fila, una lista que va por detrás del campo (lección 51) o pintar solo lo visible (proyecto 94)."
    }
  ]
}
```

Si ninguno encaja, porque el componente caro necesita de verdad un dato del que cambia, toca memorizar: que React se salte el componente cuando sus props no han cambiado. Es la lección 67.

## Errores típicos

**Arreglar renders que no cuestan nada.** Diez «se renderizó su padre» en el panel no son un problema; son React funcionando como está pensado. Reorganizar componentes y partir contextos para ahorrar microsegundos complica el código a cambio de nada. El orden es siempre el mismo: un síntoma que se nota, una medida que señala al culpable (lección 65) y, solo entonces, el arreglo.

**Crear el contenido dentro del componente que cambia.** El truco de `children` depende de quién crea el elemento:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Marco({ children }) {\n  return <div className=\"visor\">{children}</div>\n}\n\nfunction Lupa() {\n  const [tamano, setTamano] = useState(1)\n\n  return (\n    <section style={{ fontSize: tamano + 'rem' }}>\n      <button onClick={() => setTamano(tamano + 0.25)}>Acercar</button>\n      <Marco>\n        <PlanoSalas />\n      </Marco>\n    </section>\n  )\n}\n\n// Lupa le pasa el plano a Marco como children.\n// Pulsas «Acercar». ¿Se vuelve a renderizar PlanoSalas?",
  "opciones": [
    "No: llega como children, y React se salta esa rama",
    "Sí: lo ha creado Lupa, que se acaba de renderizar",
    "Solo si Marco no tiene children"
  ],
  "correcta": 1,
  "explicacion": "<PlanoSalas /> está escrito en el JSX de Lupa, así que cada render de Lupa crea un elemento nuevo. El panel lo cuenta así: Marco, «cambió la prop «children» (objeto nuevo)», y PlanoSalas, «se renderizó su padre». Para que funcione, el elemento tiene que crearlo alguien que no se renderiza cuando cambia el tamaño: App, pasándoselo a la propia Lupa."
}
```

**Bajar un estado que necesita otro componente.** Si el plano tuviera que marcar la sala que nombras en el mensaje, el texto tendría que vivir por encima de los dos (lección 25). Bajarlo los dejaría sin forma de ponerse de acuerdo. Solo se baja el estado que nadie más lee.

**Un `value` de contexto creado en el render.** `<EquipoContext value={{ equipo, setEquipo }}>` crea un objeto nuevo en cada render del proveedor, y cada uno de esos renders avisa a todos los lectores aunque no haya cambiado nada; lo viste en la lección 28. Pasa valores sueltos en contextos separados, o mantén el objeto con `useMemo` (lección 67).

**Sacar conclusiones con `StrictMode` y en desarrollo.** En desarrollo, cada render de un componente se ejecuta dos veces y React hace comprobaciones de más. Los tiempos sirven para comparar un antes y un después, pero no para decidir si algo es lento de verdad: eso se mide con el build de producción (lección 65).

## Ejercicios

El máster se queja de que el campo de los mensajes va a trompicones: es el plano de «Cada letra, seis renders». Esta vez, además, los mensajes enviados se apuntan en una lista.

Para que las comprobaciones puedan contar renders, el bloque trae una herramienta en `medidor.jsx`: `PlanoSalas` llama a `useContarRenders('PlanoSalas')`, que suma uno en un efecto cada vez que el plano llega a un commit, y el botón «Contar renders» enseña la cuenta. Es lo mismo que el contador `·N` del panel. `StrictMode` está apagado en este bloque: con él, el efecto se ejecutaría dos veces al montar (lección 38) y la cuenta empezaría en 2.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Mensajes sin arrastrar el plano",
  "consigna": "Escribe un mensaje y pulsa «Contar renders»: el plano se ha renderizado una vez por letra. Arréglalo sin memo y sin tocar PlanoSalas.jsx ni medidor.jsx: crea FormularioMensaje con el campo, su estado y el envío, y que avise a App con onEnviar(texto). Enviar tiene que seguir funcionando igual. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport PlanoSalas from './PlanoSalas'\nimport { Medidor } from './medidor'\nimport './estilos.css'\n\nlet siguienteId = 1\n\n// Cada letra del campo renderiza App y, con App, el plano entero.\n// Lleva el campo y su estado a un componente nuevo, FormularioMensaje,\n// que avise a App con onEnviar(texto). La lista de enviados se queda aquí.\nexport default function App() {\n  const [mensaje, setMensaje] = useState('')\n  const [enviados, setEnviados] = useState([])\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const texto = mensaje.trim()\n    if (texto === '') return\n    setEnviados([...enviados, { id: siguienteId++, texto }])\n    setMensaje('')\n  }\n\n  return (\n    <main>\n      <h1>La Llave Perdida · Sala de control</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Mensaje para el equipo\n          <input value={mensaje} onChange={(e) => setMensaje(e.target.value)} />\n        </label>\n        <button>Enviar</button>\n      </form>\n      <h2>Enviados</h2>\n      <ul aria-label=\"Mensajes enviados\">\n        {enviados.map((m) => (\n          <li key={m.id}>{m.texto}</li>\n        ))}\n      </ul>\n      <PlanoSalas />\n      <Medidor />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlanoSalas.jsx",
      "codigo": "import { useContarRenders } from './medidor'\n\nconst SALAS = [\n  { id: 'biblioteca', nombre: 'Biblioteca', equipo: 'Los Linces' },\n  { id: 'cripta', nombre: 'Cripta', equipo: null },\n  { id: 'laboratorio', nombre: 'Laboratorio', equipo: 'Las Ardillas' },\n  { id: 'camarote', nombre: 'Camarote', equipo: null },\n]\n\nfunction Sala({ nombre, equipo }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 10) {\n    // 10 ms por sala, a propósito\n  }\n  return (\n    <li className={equipo ? 'sala ocupada' : 'sala'}>\n      {nombre}: {equipo ?? 'libre'}\n    </li>\n  )\n}\n\nexport default function PlanoSalas() {\n  useContarRenders('PlanoSalas')\n\n  return (\n    <ul className=\"plano\" aria-label=\"Plano de salas\">\n      {SALAS.map((sala) => (\n        <Sala key={sala.id} nombre={sala.nombre} equipo={sala.equipo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "medidor.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\n// Herramienta de medida para las comprobaciones: cuenta los renders de cada\n// componente que llegan a un commit, igual que el contador ·N del árbol.\n// No hace falta que la toques.\nconst cuentas = new Map()\n\nexport function useContarRenders(nombre) {\n  useEffect(() => {\n    cuentas.set(nombre, (cuentas.get(nombre) ?? 0) + 1)\n  })\n}\n\nexport function Medidor() {\n  const [foto, setFoto] = useState(null)\n\n  return (\n    <aside className=\"panel\">\n      <button onClick={() => setFoto([...cuentas])}>Contar renders</button>\n      {foto && (\n        <ul aria-label=\"Renders\">\n          {foto.map(([nombre, veces]) => (\n            <li key={nombre}>\n              {nombre}: {veces}\n            </li>\n          ))}\n        </ul>\n      )}\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #7c2d12;\n}\n\nh2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.panel {\n  margin: 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.panel p {\n  margin: 0.25rem 0;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.plano {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.sala {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n}\n\n.ocupada {\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.cuenta {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\n.normas {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.historial {\n  max-height: 14rem;\n  overflow: auto;\n  padding-left: 1.25rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir un mensaje y pulsar «Enviar», aparece en la lista de enviados",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje para el equipo",
            "texto": "Mirad debajo del reloj"
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
        "texto": "Mirad debajo del reloj"
      }
    },
    {
      "descripcion": "Después de enviarlo, el campo se queda vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje para el equipo",
            "texto": "Mirad debajo del reloj"
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
        "etiqueta": "Mensaje para el equipo",
        "valor": ""
      }
    },
    {
      "descripcion": "Se pueden enviar dos mensajes seguidos y quedan los dos en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje para el equipo",
            "texto": "Buscad la llave"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje para el equipo",
            "texto": "Mirad debajo del reloj"
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
        "texto": "Buscad la llave"
      }
    },
    {
      "descripcion": "Mientras escribes, el plano de salas no se vuelve a renderizar",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje para el equipo",
            "texto": "Mirad debajo del reloj"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Contar renders"
          }
        }
      ],
      "espera": {
        "texto": "PlanoSalas: 1"
      }
    }
  ]
}
```

Con la solución, cada letra es **1 renderizado · 1 cambio en el DOM**: `FormularioMensaje` ← «cambió su estado». `App`, el plano y la lista, sin cambios. Al pulsar «Enviar», `App` sí se renderiza, porque cambia `enviados`, y el plano con ella: una vez por mensaje en lugar de una por letra.

Fíjate en que `FormularioMensaje` recibe `onEnviar` y en el panel sale con «cambió la prop «onEnviar» (función nueva)» cada vez que `App` se renderiza. Aquí no importa, porque el formulario es barato. Cuando el que la recibe es caro, esa función nueva es el problema que resuelve la lección 67.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que el plano tampoco se renderice al enviar. Pista: ¿quién tiene que guardar la lista de enviados para que `App` no cambie? Comprueba con «Contar renders» que, después de enviar dos mensajes, sigue en 1.
2. En «Cuatro botones, cuatro motivos», cambia el `value` de `ProveedorEquipo` por `{ equipo }` y lee `const { equipo } = useContext(EquipoContext)` en `Marcador`. Antes de pulsar «Enviar pista», predice qué motivo dará el panel para `Marcador`; después compruébalo.
3. En «Un contexto con prisa», haz que «Cambiar de equipo» funcione desde `Marcador` sin que el plano vuelva a renderizarse cada segundo. ¿Dónde guardas el estado del equipo, y cómo le llega a `Marcador` la función para cambiarlo?
4. En el historial de partidas, calcula el texto de cada fecha una sola vez, en `partidas.jsx`, como un campo más de cada partida. Compara la consola con la versión del formateador compartido.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Render and Commit",
      "descripcion": "La página de react.dev de la lección 17, con su apartado sobre rendimiento: renderizar todo lo que cuelga del componente que cambia no es lo ideal muy arriba del árbol, pero no optimices antes de tiempo.",
      "url": "https://react.dev/learn/render-and-commit",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Developer Tools",
      "descripcion": "Cómo instalar la extensión del navegador con los paneles Components y Profiler. Su uso a fondo es la lección 65.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "memo: Should you add memo everywhere?",
      "descripcion": "Los principios que hacen innecesaria buena parte de la memorización: aceptar JSX como children, estado local, renders puros y menos efectos que encadenan actualizaciones.",
      "url": "https://react.dev/reference/react/memo#should-you-add-memo-everywhere",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Passing JSX as children",
      "descripcion": "Cómo un componente recibe contenido anidado en la prop children, la base del segundo arreglo.",
      "url": "https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Before You memo()",
      "descripcion": "Artículo de Dan Abramov, del equipo de React, con los dos arreglos de esta lección antes de memorizar: bajar el estado y subir el contenido.",
      "url": "https://overreacted.io/before-you-memo/",
      "etiqueta": "overreacted.io"
    },
    {
      "titulo": "Date.prototype.toLocaleDateString()",
      "descripcion": "Incluye la nota de rendimiento del historial de partidas: para formatear muchas fechas, crea un Intl.DateTimeFormat y reutiliza su format().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString",
      "etiqueta": "MDN"
    }
  ]
}
```
