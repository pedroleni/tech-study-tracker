# Componentes puros, y por qué `StrictMode` los renderiza dos veces

- **Módulo:** Describir la interfaz
- **Slug:** `componentes-puros-y-por-que-strictmode-los-renderiza-dos-veces` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) + [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) + [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) — ver `contenido/react/TEMARIO.md` #12

---

## Qué es y para qué sirve

Desde la lección 3 escribes componentes como funciones: reciben props y devuelven JSX. React les pone una condición, y no es negociable: **tienen que ser puras**. Como una fórmula de matemáticas, un componente puro devuelve siempre el mismo JSX para las mismas entradas, y mientras se ejecuta no cambia nada que existiera antes de llamarlo.

No es una manía de estilo. React decide cuándo llama a tus componentes y cuántas veces: puede llamar a uno varias veces para pintar una sola pantalla, empezar un render y tirarlo sin terminarlo o, en desarrollo, llamar a cada uno dos veces a propósito. Si un componente cambia algo de fuera mientras se ejecuta, cada una de esas llamadas deja rastro: números que saltan de dos en dos, elementos repetidos, datos de un componente que aparecen en otro.

En esta lección verás qué es exactamente una función pura, dónde sí puedes cambiar cosas, por qué no debes llamar tú a un componente como si fuera una función cualquiera, y qué hace `StrictMode`, el componente que la plantilla de Vite pone en `main.jsx` y que los bloques en vivo de esta web activan por defecto.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Se ocupa de lo suyo",
      "texto": "Durante el render no cambia ningún objeto ni variable que ya existiera antes de llamarlo: ni variables de fuera del componente, ni sus props, ni el DOM. Lo que crea él mismo en ese render sí puede cambiarlo."
    },
    {
      "titulo": "Misma entrada, misma salida",
      "texto": "Con las mismas entradas devuelve siempre el mismo JSX. Las entradas de un componente son sus props, su estado (lección 16) y el contexto (lección 28). Nada de resultados que dependan de la hora, del azar o de cuántas veces se haya ejecutado antes."
    }
  ]
}
```

## Una función pura: misma entrada, misma salida

Empieza sin React. Estas dos funciones calculan la pintura que hace falta para una pared, a razón de un litro por cada 10 m²:

```js
// Pura: solo calcula con lo que recibe
function litrosDePintura(metros) {
  return metros / 10
}

// Impura: además de calcular, cambia una variable de fuera
let litrosGastados = 0

function gastarPintura(metros) {
  litrosGastados = litrosGastados + metros / 10
  return litrosGastados
}
```

`litrosDePintura(40)` devuelve `4`. Siempre: hoy, mañana y aunque la llames cien veces seguidas. `gastarPintura(40)` devuelve `4` la primera vez, `8` la segunda y `12` la tercera: con la misma entrada, una salida distinta cada vez, porque **cada llamada deja un cambio fuera de la función** que afecta a la siguiente.

Un componente puro es una función como la primera. Este calcula el presupuesto de cada habitación solo a partir de sus props:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un componente que se comporta como una fórmula",
  "codigo": "function Presupuesto({ habitacion, metros }) {\n  const litros = metros / 10\n  const botes = Math.ceil(litros / 4)\n\n  return (\n    <li>\n      {habitacion}: {metros} m², {litros} litros ({botes} {botes === 1 ? 'bote' : 'botes'} de 4 litros)\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Presupuesto de pintura</h1>\n      <ul>\n        <Presupuesto habitacion=\"Salón\" metros={60} />\n        <Presupuesto habitacion=\"Dormitorio\" metros={40} />\n        <Presupuesto habitacion=\"Baño\" metros={20} />\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}",
  "anotaciones": [
    {
      "fragmento": "function Presupuesto({ habitacion, metros })",
      "nota": "Las entradas del componente son sus props. Todo lo que muestra sale de ellas: no lee ninguna variable de fuera que pueda cambiar entre una llamada y otra."
    },
    {
      "fragmento": "const litros = metros / 10",
      "nota": "Crear variables dentro del componente y calcular con ellas es lo normal. Nacen de nuevo en cada llamada y nadie de fuera las ve."
    },
    {
      "fragmento": "{botes === 1 ? 'bote' : 'botes'}",
      "nota": "Una condición también es parte del cálculo: con 40 m² siempre dirá «1 bote», con 60 siempre «2 botes»."
    },
    {
      "fragmento": "<Presupuesto habitacion=\"Salón\" metros={60} />",
      "nota": "Con metros={60}, Presupuesto devuelve siempre «6 litros (2 botes de 4 litros)». Puedes usarlo tres veces o trescientas: cada copia calcula lo suyo sin enterarse de las demás."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Eso es lo que React da por hecho en **todos** tus componentes: que llamarlos es como resolver una fórmula. Se lo cree tanto que, en desarrollo, los llama dos veces para comprobarlo.

## Un componente impuro: los turnos de la pescadería

Ahora, el fallo de verdad. En esta pescadería, cada `Ticket` reparte su número de turno con una variable declarada fuera del componente, que suma uno cada vez que se ejecuta. Hay tres clientes, así que esperas los turnos 1, 2 y 3. Mira la vista previa y la consola:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres tickets, tres turnos... ¿o no?",
  "consigna": "Compara los turnos de la vista previa con las líneas de la consola. ¿Cuántas veces se ha ejecutado cada Ticket? Después añade un cuarto cliente e intenta adivinar su turno antes de mirarlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nlet ultimoTurno = 0\n\nfunction Ticket({ cliente }) {\n  ultimoTurno = ultimoTurno + 1\n  console.log('Ticket de', cliente, '→ turno', ultimoTurno)\n  return (\n    <li>\n      {cliente}: turno {ultimoTurno}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Pescadería Morales</h1>\n      <ol>\n        <Ticket cliente=\"Marta\" />\n        <Ticket cliente=\"Luis\" />\n        <Ticket cliente=\"Ana\" />\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Turnos 2, 4 y 6, y seis líneas en la consola para tres tickets. **Cada `Ticket` se ha ejecutado dos veces**: la primera llamada de Marta subió `ultimoTurno` a 1, la segunda lo subió a 2, y React pintó el resultado de la segunda. Luis se encontró la variable en 2 y la subió a 3 y a 4. Ana, a 5 y a 6.

El problema no es que React llame dos veces. El problema es que `Ticket` **cambia algo que existía antes de llamarlo**, así que lo que pinta depende de cuántas veces se ha ejecutado él y de cuántas se han ejecutado los demás. React no te promete ni el número de llamadas ni su orden, de modo que un componente así nunca sabe qué va a pintar.

## `StrictMode`: dos llamadas a propósito

La doble llamada es cosa de `StrictMode`. Lo viste en el `main.jsx` de la lección 2:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`StrictMode` es un componente que no pinta nada: activa comprobaciones extra, **solo en desarrollo**, para todo lo que tiene dentro. La que importa en esta lección: **llama dos veces seguidas a cada componente** (al cuerpo de la función, no a sus manejadores de eventos) y se queda con el resultado de la segunda llamada. Si el componente es puro, las dos llamadas devuelven lo mismo y no notas nada, salvo en la consola. Si no lo es, la diferencia salta a la vista en el primer render.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Llama dos veces a cada componente",
      "texto": "Y también a otras funciones que deben ser puras, como la que calcula el valor inicial de un estado o la que lo actualiza a partir del anterior (lecciones 16 y 19). La regla es la misma para todas: llamarlas dos veces no debe cambiar nada."
    },
    {
      "titulo": "Con los efectos hace otra cosa",
      "texto": "A los efectos de useEffect no los ejecuta dos veces sin más: los monta, los desmonta y los vuelve a montar, para destapar los que no limpian lo que dejan. Lo verás en el módulo 6. Con las refs de callback hace lo mismo (módulo 5)."
    },
    {
      "titulo": "No repite los manejadores de eventos",
      "texto": "Un onClick se ejecuta una vez por clic, con StrictMode o sin él. Solo se repite lo que corre durante el render."
    },
    {
      "titulo": "En producción no hace nada",
      "texto": "npm run build usa la versión de producción de React, que ignora StrictMode: tus usuarios no pagan ni una llamada de más. Por eso conviene dejarlo puesto siempre."
    },
    {
      "titulo": "A fondo, en la lección 63",
      "texto": "StrictMode también avisa si usas APIs antiguas de React. Todo lo que hace, y para qué, se repasa con calma en la lección 63, en el módulo de depuración."
    }
  ]
}
```

### ¿Y si quito `StrictMode`?

Es la tentación: «sin `StrictMode` los turnos salen bien». Aquí tienes el mismo `Ticket` con `StrictMode` apagado y un botón que obliga a React a volver a pintar la lista; el botón cambia un estado de `App`, algo que verás en la lección 16. Mira primero los turnos y después pulsa el botón:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El mismo fallo, sin StrictMode",
  "consigna": "Sin StrictMode, los turnos empiezan bien. Pulsa «Actualizar la pantalla» y mira qué les pasa a Marta, Luis y Ana sin que haya llegado nadie nuevo a la cola.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nlet ultimoTurno = 0\n\nfunction Ticket({ cliente }) {\n  ultimoTurno = ultimoTurno + 1\n  console.log('Ticket de', cliente, '→ turno', ultimoTurno)\n  return (\n    <li>\n      {cliente}: turno {ultimoTurno}\n    </li>\n  )\n}\n\nexport default function App() {\n  // Solo sirve para que React vuelva a renderizar al pulsar el botón (lección 16)\n  const [actualizaciones, setActualizaciones] = useState(0)\n\n  return (\n    <main>\n      <h1>Pescadería Morales</h1>\n      <ol>\n        <Ticket cliente=\"Marta\" />\n        <Ticket cliente=\"Luis\" />\n        <Ticket cliente=\"Ana\" />\n      </ol>\n      <button onClick={() => setActualizaciones(actualizaciones + 1)}>\n        Actualizar la pantalla\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

En el primer render salen 1, 2 y 3: parece que funciona. Pero en cuanto React vuelve a pintar, los clientes reciben el 4, el 5 y el 6 sin haberse movido de la cola. **El fallo estaba ahí desde el principio**: `StrictMode` no lo crea, lo adelanta. Sin él, lo descubre un usuario el día en que algo provoca un render más; con él, lo ves tú en cuanto guardas el archivo.

## Cómo se ve en la consola

Con `StrictMode`, cada `console.log` que escribas en el cuerpo de un componente sale dos veces. Lo que ves depende de dónde mires:

- **En el panel «Consola» de los bloques de esta web**, las dos llamadas salen exactamente iguales, una detrás de otra: aquí no se atenúa nada. Además, cada vez que React ha aplicado un render a la página entre un mensaje y el siguiente, el panel los separa con una raya numerada, «commit 1», «commit 2»...; ese paso se llama *commit* y lo verás en la lección 17. Así distingues lo que se imprimió al cargar de lo que vino después.
- **En la consola del navegador, en tu proyecto**, también salen las dos, y sin extensiones son idénticas. Si tienes instaladas las React DevTools (lección 65), la segunda sale atenuada, en un gris más claro, y la extensión tiene una opción, desactivada por defecto, para ocultarla del todo.
- **En la versión de producción** sale una sola, porque `StrictMode` no hace nada.

Ahora que sabes lo que duplica, pon a prueba la intuición. En este cine, cada componente escribe su nombre en la consola al ejecutarse:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Con StrictMode activado: ¿cuántas líneas salen en la consola al cargar?\nfunction Cabecera() {\n  console.log('Cabecera')\n  return <h1>Cine Paraíso</h1>\n}\n\nfunction Sesion({ hora }) {\n  console.log('Sesion', hora)\n  return <li>{hora}</li>\n}\n\nexport default function App() {\n  console.log('App')\n  return (\n    <main>\n      <Cabecera />\n      <ul>\n        <Sesion hora=\"18:30\" />\n        <Sesion hora=\"21:00\" />\n      </ul>\n    </main>\n  )\n}",
  "opciones": [
    "4: una por componente",
    "8: dos por componente",
    "16: App se repite, y con ella todo lo que tiene debajo"
  ],
  "correcta": 1,
  "explicacion": "StrictMode llama dos veces a cada componente, no a cada árbol: App, App, Cabecera, Cabecera, y cada Sesion dos veces. React sigue hacia abajo con el resultado de la segunda llamada de App, así que los hijos no se multiplican por cuatro."
}
```

## El arreglo: que el componente solo calcule

¿Cómo sabe entonces cada ticket su turno? No lo decide `Ticket` cambiando nada: **se lo dice su padre, por props**. Y el padre tampoco lleva la cuenta en ninguna variable: el turno sale de la posición de cada cliente en la cola.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Turnos que no dependen de cuántas veces se llame a Ticket",
  "codigo": "const cola = ['Marta', 'Luis', 'Ana']\n\nfunction Ticket({ cliente, turno }) {\n  console.log('Ticket de', cliente, '→ turno', turno)\n  return (\n    <li>\n      {cliente}: turno {turno}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Pescadería Morales</h1>\n      <ol>\n        {cola.map((cliente, posicion) => (\n          <Ticket key={cliente} cliente={cliente} turno={posicion + 1} />\n        ))}\n      </ol>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}",
  "anotaciones": [
    {
      "fragmento": "function Ticket({ cliente, turno })",
      "nota": "El turno llega como prop. Ticket ya no necesita recordar nada entre llamadas ni saber cuántos tickets se han pintado antes que él."
    },
    {
      "fragmento": "console.log('Ticket de', cliente, '→ turno', turno)",
      "nota": "La consola sigue mostrando dos líneas por ticket: StrictMode sigue llamando dos veces. La diferencia es que ahora las dos llamadas dan el mismo resultado."
    },
    {
      "fragmento": "turno={posicion + 1}",
      "nota": "El número sale de los datos: la posición de cada cliente en el array cola. Calcularlo así, en cada render, siempre da lo mismo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

En la consola siguen saliendo seis líneas, porque `StrictMode` sigue llamando dos veces a cada `Ticket`. Pero ahora da igual. **Una función pura se puede llamar dos veces, o cien, sin que cambie nada**, igual que `litrosDePintura(40)` no da otro resultado por calcularlo otra vez.

## Cambiar lo que creas dentro del render, sí

«No cambiar nada» se refiere a lo que **ya existía antes** de llamar al componente. Lo que el componente crea durante su propio render puede modificarlo cuanto quiera: nadie de fuera lo ve, y la siguiente llamada empieza con uno nuevo. Es lo que se llama **mutación local**. Esta peluquería calcula sus citas libres: crea un array vacío y le va añadiendo huecos con `push`:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un array creado y llenado en el mismo render",
  "codigo": "function Huecos({ apertura, cierre, duracion }) {\n  const huecos = []\n\n  for (let minuto = apertura; minuto < cierre; minuto += duracion) {\n    const hora = String(Math.floor(minuto / 60)).padStart(2, '0')\n    const minutos = String(minuto % 60).padStart(2, '0')\n    huecos.push(<li key={minuto}>{hora}:{minutos}</li>)\n  }\n\n  return <ol>{huecos}</ol>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Peluquería Rizos</h1>\n      <h2>Citas libres el sábado, de 10:00 a 13:00</h2>\n      <Huecos apertura={10 * 60} cierre={13 * 60} duracion={30} />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nol {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.25rem 0.5rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}",
  "anotaciones": [
    {
      "fragmento": "const huecos = []",
      "nota": "El array se crea dentro de Huecos, en cada llamada. Es suyo: ningún otro componente lo conoce, y la siguiente llamada tendrá otro distinto."
    },
    {
      "fragmento": "huecos.push(<li key={minuto}>{hora}:{minutos}</li>)",
      "nota": "push modifica el array, sí, pero es un array que acaba de nacer en este mismo render. Con StrictMode, la segunda llamada crea otro vacío y lo llena igual: mismo resultado."
    },
    {
      "fragmento": "for (let minuto = apertura; minuto < cierre; minuto += duracion)",
      "nota": "Un bucle normal también vale. No hace falta retorcer el código para evitar la mutación local: lo que importa es que no salga de la función."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

La única diferencia entre esa lista y una rota está en **dónde nace el array**:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Igual que antes, pero el array se declara FUERA de Huecos.\n// Con StrictMode activado, ¿qué citas libres se ven?\nconst huecos = []\n\nfunction Huecos({ apertura, cierre, duracion }) {\n  for (let minuto = apertura; minuto < cierre; minuto += duracion) {\n    const hora = String(Math.floor(minuto / 60)).padStart(2, '0')\n    const minutos = String(minuto % 60).padStart(2, '0')\n    huecos.push(<li key={minuto}>{hora}:{minutos}</li>)\n  }\n\n  return <ol>{huecos}</ol>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Peluquería Rizos</h1>\n      <h2>Citas libres el sábado, de 10:00 a 13:00</h2>\n      <Huecos apertura={10 * 60} cierre={13 * 60} duracion={30} />\n    </main>\n  )\n}",
  "opciones": [
    "Los mismos seis huecos, de 10:00 a 12:30",
    "Doce huecos: la lista entera, repetida dos veces",
    "Un error: no se puede hacer push de JSX en un array"
  ],
  "correcta": 1,
  "explicacion": "Ahora el array existía antes del render, así que la segunda llamada de StrictMode añade sus seis huecos detrás de los seis de la primera. La consola, además, se llena de avisos «Encountered two children with the same key», porque cada key aparece dos veces. Sin StrictMode verías seis... hasta el siguiente render, que añadiría otros seis."
}
```

## Dónde sí puedes cambiar cosas: los manejadores de eventos

Un programa que no cambia nada no sirve de mucho. Enviar una reserva al servidor, guardar algo en `localStorage`, cambiar el título de la pestaña o arrancar un temporizador son **efectos secundarios**: cambios que ocurren «al lado» del cálculo, fuera de él. La pregunta no es si los vas a necesitar, sino dónde ponerlos.

En React, casi siempre van en los **manejadores de eventos**: las funciones que React ejecuta cuando la persona hace algo, como pulsar un botón. Se escriben dentro del componente, pero no se ejecutan durante el render, así que **no tienen por qué ser puras**. Los verás a fondo en la lección 15.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El render, dos veces; el clic, una",
  "consigna": "Al cargar, la consola muestra el render de Reserva dos veces: es StrictMode. Ahora pulsa el botón varias veces y cuenta: cada clic escribe una sola línea, porque los manejadores no se repiten.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Reserva({ pista, hora }) {\n  console.log('Render de Reserva: pista', pista)\n\n  function manejarClic() {\n    // Un efecto secundario: aquí iría el envío de la reserva al servidor\n    console.log('Enviando la reserva de la pista', pista, 'a las', hora)\n  }\n\n  return (\n    <button onClick={manejarClic}>\n      Reservar la pista {pista} a las {hora}\n    </button>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de pádel</h1>\n      <Reserva pista={2} hora=\"18:00\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

¿Y si no hay ningún evento? A veces un componente tiene que hacer algo por el simple hecho de estar en pantalla: conectarse a un chat mientras se ve, o mantener un reloj en hora. Para eso existe `useEffect`, que ejecuta código **después** del render. Llega en el módulo 6, y con una advertencia que react.dev repite a menudo: es el último recurso. Antes de usarlo, busca si el cambio encaja en un manejador o si puedes calcular lo que necesitas durante el render.

## Lo que recibes es de solo lectura: props, estado y JSX

Las entradas de un componente se leen, no se tocan. Si cambias una prop, no la cambias solo para ti: es **el mismo objeto o el mismo array** que tiene el padre, y quizá otros componentes. Y algunos métodos de los arrays lo cambian sin que lo parezca. ¿En qué orden sale aquí la lista de inscripción?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const equipos = [\n  { id: 1, nombre: 'Halcones', puntos: 12 },\n  { id: 2, nombre: 'Delfines', puntos: 18 },\n  { id: 3, nombre: 'Linces', puntos: 15 },\n]\n\nfunction Clasificacion({ equipos }) {\n  const ordenados = equipos.sort((a, b) => b.puntos - a.puntos)\n  return (\n    <ol>\n      {ordenados.map((equipo) => (\n        <li key={equipo.id}>{equipo.nombre}: {equipo.puntos}</li>\n      ))}\n    </ol>\n  )\n}\n\nfunction Inscripciones({ equipos }) {\n  return (\n    <ul>\n      {equipos.map((equipo) => <li key={equipo.id}>{equipo.nombre}</li>)}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Liga del barrio</h1>\n      <h2>Clasificación</h2>\n      <Clasificacion equipos={equipos} />\n      <h2>Orden de inscripción</h2>\n      <Inscripciones equipos={equipos} />\n    </main>\n  )\n}",
  "opciones": [
    "Halcones, Delfines, Linces: el orden del array",
    "Delfines, Linces, Halcones: ordenada por puntos, como la clasificación",
    "Linces, Delfines, Halcones"
  ],
  "correcta": 1,
  "explicacion": "sort no devuelve una copia: ordena el mismo array y lo devuelve. Clasificacion se ejecutó antes y reordenó el array que App pasa a los dos. Si Inscripciones fuera primero en el JSX, el primer render saldría bien y el fallo aparecería en el siguiente: el resultado depende del orden, justo lo que un componente puro evita."
}
```

La solución es ordenar **una copia**: `[...equipos].sort(...)` o, más directo, `equipos.toSorted(...)`, que devuelve un array nuevo y deja el original como estaba. Conviene tener a mano qué métodos cambian el array y cuáles crean otro:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Métodos de array: cuáles tocan el original",
  "roles": [
    {
      "etiqueta": "Cambian el original",
      "rol": "push, pop, shift, unshift, splice, sort, reverse",
      "descripcion": "Modifican el array sobre el que los llamas. Sobre una prop, sobre el estado o sobre algo creado fuera del componente, rompen la pureza. Sobre un array creado en el mismo render, no pasa nada."
    },
    {
      "etiqueta": "Devuelven uno nuevo",
      "rol": "map, filter, slice, concat, toSorted, toReversed",
      "descripcion": "Dejan el original como estaba y te dan una copia con el cambio: son los que usarás con props y estado. El spread [...array] también crea una copia."
    }
  ]
}
```

Con los objetos pasa lo mismo: `equipo.puntos = 0` sobre una prop está prohibido; si necesitas una versión cambiada, crea un objeto nuevo con `{ ...equipo, puntos: 0 }`. Y con el **estado**, igual: no se modifica, se sustituye por uno nuevo con su función `set`. Es el tema de las lecciones 16, 20 y 21.

Queda una regla menos evidente: **lo que ya has pasado a JSX, tampoco lo cambies después**. Aquí `estilo` se usa para el título y luego se encoge para el pie:

```jsx
export default function App() {
  const estilo = { color: 'darkgreen', fontSize: '2rem' }
  const titulo = <Titulo estilo={estilo} />
  estilo.fontSize = '1rem' // Mal: estilo ya está dentro del JSX del título
  const pie = <Pie estilo={estilo} />

  return (
    <main>
      {titulo}
      {pie}
    </main>
  )
}
```

El título no sale a `2rem`: sale a `1rem`, como el pie. El elemento `<Titulo estilo={estilo} />` no guarda una copia del objeto, guarda **el mismo objeto**, y `Titulo` no se ejecuta hasta más tarde, cuando React decide renderizarlo; para entonces ya lo has encogido. La solución es crear un objeto distinto para cada uso: `const estiloPie = { ...estilo, fontSize: '1rem' }`.

Ese «más tarde» es la siguiente idea de la lección.

## React llama a tus componentes; tú, no

Un componente es una función, pero tú nunca la llamas: escribes `<Aviso texto="..." />`. Como viste en la lección 7, ese JSX solo crea un **elemento**, un objeto que dice «aquí va un `Aviso` con estas props». Quien decide cuándo ejecutar `Aviso` es React: durante el render, las veces que necesite, o ninguna si el elemento no acaba en lo que devuelves. Compruébalo con la consola:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Crear un elemento no ejecuta el componente",
  "consigna": "Lee la consola de arriba abajo: App termina entera (dos veces, por StrictMode) antes de que se ejecute Aviso, y el aviso del ascensor no llega a ejecutarse nunca. Después cambia {avisoAgua} por {Aviso({ texto: \"Junta de vecinos el viernes\" })} y mira en qué momento sale ahora su línea.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Aviso({ texto }) {\n  console.log('Se ejecuta Aviso:', texto)\n  return <p className=\"aviso\">{texto}</p>\n}\n\nexport default function App() {\n  console.log('App: empiezo')\n  const avisoAgua = <Aviso texto=\"Corte de agua el martes, de 9:00 a 12:00\" />\n  const avisoAscensor = <Aviso texto=\"Revisión del ascensor el jueves\" />\n  console.log('App: ya tengo los dos elementos, y Aviso aún no se ha ejecutado')\n\n  return (\n    <main>\n      <h1>Comunidad de vecinos de Calle Mayor, 12</h1>\n      {avisoAgua}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.aviso {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #f59e0b;\n  background: #fffbeb;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

`Aviso` no se ejecuta cuando escribes `<Aviso />`, sino cuando React lo decide, y solo si el elemento acaba en lo que devuelve `App`. Si lo cambias por una llamada directa, `Aviso({ texto: 'Junta de vecinos el viernes' })`, la función se ejecuta en medio de `App`, como cualquier otra función. Funciona, pero React ya no ve un componente: ve el JSX que devolvió, como si lo hubieras escrito dentro de `App`.

¿Qué se pierde? Con un componente tan simple como `Aviso`, casi nada. Con uno que usa Hooks, mucho. Aquí `Puerta` cuenta las personas que entran con `useState` (lección 16), y `App` la llama como una función:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Llamar a un componente a mano rompe sus Hooks",
  "consigna": "Pulsa el botón de la puerta norte un par de veces y después «Abrir la puerta sur». Lee el error y el aviso de la consola. Luego arréglalo: usa <Puerta nombre=\"Puerta norte\" /> y {surAbierta && <Puerta nombre=\"Puerta sur\" />}, y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction Puerta({ nombre }) {\n  const [personas, setPersonas] = useState(0)\n  return (\n    <button onClick={() => setPersonas(personas + 1)}>\n      {nombre}: {personas}\n    </button>\n  )\n}\n\nexport default function App() {\n  const [surAbierta, setSurAbierta] = useState(false)\n\n  return (\n    <main>\n      <h1>Aforo del museo</h1>\n      {Puerta({ nombre: 'Puerta norte' })}\n      {surAbierta && Puerta({ nombre: 'Puerta sur' })}\n      <button onClick={() => setSurAbierta(true)}>Abrir la puerta sur</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  display: block;\n  margin-bottom: 0.5rem;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al abrir la puerta sur, la vista previa se cae con «Rendered more hooks than during the previous render» (se han ejecutado más Hooks que en el render anterior), y la consola cuenta por qué: «React has detected a change in the order of Hooks called by App». Fíjate en el nombre: **App**. Como `App` llamó a `Puerta` a mano, React cree que esos `useState` son de `App`, y de un render a otro le ha aparecido uno nuevo. Las reglas de los Hooks (lección 44) prohíben justo eso. Con `<Puerta />`, cada puerta es un componente con su propio estado, y el error desaparece.

Dejar que React llame a tus componentes no es una formalidad. Es lo que le permite hacer esto:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cada componente tiene su propia identidad",
      "texto": "React asocia el estado y los Hooks de cada componente a su sitio en el árbol: lo verás en la lección 13 y, a fondo, en la 26. Si lo llamas tú, sus Hooks pasan a ser del padre."
    },
    {
      "titulo": "Puede saltarse componentes",
      "texto": "Si sabe que las entradas de un componente no han cambiado, React puede no volver a ejecutarlo (lecciones 67 y 68). Un trozo de función metido dentro de otra no se puede saltar."
    },
    {
      "titulo": "Puede repartir el trabajo",
      "texto": "Como es React quien llama a cada componente, puede dejar trabajar al navegador entre uno y otro para que un árbol grande no bloquee la página. Lo verás con las transiciones del módulo 7."
    },
    {
      "titulo": "Las herramientas lo ven",
      "texto": "Las React DevTools y los mensajes de error nombran cada componente. Una función llamada a mano no aparece por ningún lado: se funde con su padre, como en el aviso de la consola de arriba."
    }
  ]
}
```

## Por qué a React le importa tanto

Escribir componentes puros pide algo de disciplina, pero a cambio React puede hacer cosas que serían imposibles si cada llamada dejara cambios por ahí:

```laboratorio
{
  "tipo": "roles",
  "roles": [
    {
      "etiqueta": "Repetir o tirar un render",
      "rol": "Renders que se interrumpen",
      "descripcion": "Si los datos cambian a mitad de un render, React puede abandonarlo y empezar otro. Solo es seguro si el render a medias no cambió nada fuera. En eso se apoyan las transiciones del módulo 7."
    },
    {
      "etiqueta": "Ahorrarse trabajo",
      "rol": "memo y React Compiler",
      "descripcion": "Con las mismas props, un componente puro devuelve lo mismo, así que React puede reutilizar el resultado anterior sin llamarlo. Lo verás en las lecciones 67 y 68."
    },
    {
      "etiqueta": "Ejecutarse en un servidor",
      "rol": "Un componente, muchas peticiones",
      "descripcion": "El mismo componente puede generar HTML para muchas peticiones a la vez (módulo 13). Uno que cambia variables de fuera mezclaría los datos de una petición con los de otra."
    },
    {
      "etiqueta": "Avisarte antes",
      "rol": "El linter de React",
      "descripcion": "Tiene reglas que avisan si llamas a Math.random o Date.now durante el render (purity) o si asignas valores a props y estado, como `props.total = 0` (immutability; un `push` o un `sort` no los ve). Lo verás en la lección 70."
    }
  ]
}
```

## Cómo reconocer un componente impuro

Estas pistas casi siempre apuntan a un render que cambia algo de fuera:

- Un número que salta de dos en dos, o que crece cada vez que la pantalla se vuelve a pintar.
- Elementos de una lista repetidos, a veces con el aviso «Encountered two children with the same key» en una lista que no has tocado.
- Datos de un componente que aparecen en otro, o un resultado que cambia si reordenas los componentes en el JSX.
- Algo que funciona sin `StrictMode` y falla con él. No es `StrictMode` el que se equivoca.

## Errores típicos

**Tocar el DOM durante el render.** Cambiar la página directamente desde el cuerpo del componente es un efecto secundario y, además, llega antes de tiempo: la primera vez que React llama al componente, el elemento todavía no existe.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reloj que busca su propio título",
  "consigna": "La vista previa no llega a pintarse. Lee el error y arréglalo: en vez de buscar el h1 y cambiarle la clase, calcula la clase y ponla con className en el propio JSX.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nexport default function App() {\n  const hora = 23\n\n  // Mal: buscar el elemento y cambiarle la clase durante el render\n  document.getElementById('reloj').className = hora >= 21 ? 'noche' : 'dia'\n\n  return <h1 id=\"reloj\">Son las {hora}:00</h1>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "h1 {\n  padding: 1rem;\n  border-radius: 8px;\n  font-family: system-ui, sans-serif;\n}\n\n.dia {\n  background: #fef9c3;\n  color: #1e293b;\n}\n\n.noche {\n  background: #1e293b;\n  color: #f8fafc;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

En Chrome y Edge, el recuadro rojo dice «Error al renderizar: Cannot set properties of null (setting 'className') — App.jsx, línea 7»; otros navegadores lo cuentan con otras palabras. Durante el primer render, el `<h1 id="reloj">` todavía no está en la página: React aún está calculando qué pintar. Y aunque existiera, cambiarlo a mano sería un cambio que React no conoce. La forma pura es describir la clase en el JSX: `<h1 className={hora >= 21 ? 'noche' : 'dia'}>`.

**Calcular algo distinto en cada llamada.** `Math.random()`, `Date.now()` o `new Date()` devuelven otra cosa cada vez, así que un componente que los usa durante el render deja de cumplir «misma entrada, misma salida». Con `StrictMode` se ve en la consola:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos llamadas, dos números de lotería",
  "consigna": "Compara los dos números de la consola con el de la vista previa. Pulsa «Reiniciar» un par de veces: cambian en cada carga.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Papeleta({ socia }) {\n  const numero = String(Math.floor(Math.random() * 100000)).padStart(5, '0')\n  console.log('Número calculado en el render:', numero)\n\n  return (\n    <p>\n      Papeleta de {socia}: número {numero}\n    </p>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Lotería de Navidad de la peña</h1>\n      <Papeleta socia=\"Lucía\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La primera llamada sacó un número y la segunda otro; React pintó el de la segunda. Y cada vez que `Papeleta` se vuelva a renderizar, Lucía tendrá un número nuevo. Si el número tiene que ser al azar, se decide **fuera del render**, por ejemplo en un manejador («Repartir papeletas»), se guarda en el estado (lección 16) y el componente solo lo muestra. Con la hora pasa lo mismo: puede llegar como prop, o desde un estado que actualiza un temporizador (módulo 6).

**Comunicar dos componentes con una variable de fuera.** Es tentador que uno deje un dato en una variable del módulo para que otro lo lea más abajo. Funciona... según el orden y el número de renders, que no controlas. Los datos bajan por props. Es justo el ejercicio de esta lección.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "StrictMode provoca errores en mi app",
      "realidad": "No crea ninguno: llama dos veces a lo que ya debería poder llamarse dos veces. Si algo falla con StrictMode, ya fallaba, solo que más tarde y delante de tus usuarios."
    },
    {
      "mito": "Si quito StrictMode, se arregla",
      "realidad": "Se esconde. El componente sigue siendo impuro y el fallo vuelve en cuanto React renderiza otra vez, como les pasó a los turnos al pulsar «Actualizar la pantalla»."
    },
    {
      "mito": "StrictMode hace más lenta la app de mis usuarios",
      "realidad": "Solo actúa en desarrollo. La versión de producción de React lo ignora: ni una llamada de más."
    },
    {
      "mito": "Un componente puro no puede usar variables ni bucles",
      "realidad": "Puede crear y modificar todo lo que quiera dentro de su propio render: arrays, objetos, contadores de un bucle. Lo prohibido es cambiar lo que ya existía antes de llamarlo."
    },
    {
      "mito": "Puro significa que no puede hacer nada",
      "realidad": "El render es puro; los manejadores de eventos no tienen por qué serlo. Un componente puro puede tener botones que envían, guardan o cambian cosas cuando alguien los pulsa."
    }
  ]
}
```

## Ejercicios

Esta app prepara el equipaje de un viaje: enseña dos maletas, cada una con lo que lleva y su peso total. Para calcular el total, cada `Objeto` suma sus kilos a una variable de fuera y `Resumen` la lee. Los totales salen mal: con `StrictMode`, cada objeto suma dos veces; y aunque lo apagaras, la segunda maleta cargaría también con los kilos de la primera.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Arregla el peso de las maletas",
  "consigna": "Haz que Maleta.jsx sea pura: quita la variable kilos, calcula el total en Maleta a partir de los objetos que recibe y pásaselo a Resumen como prop. La maleta de Ana pesa 11 kg y la de Luis, 9. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Maleta from './Maleta'\nimport './estilos.css'\n\nconst maletaDeAna = [\n  { id: 1, nombre: 'Ropa', kg: 6 },\n  { id: 2, nombre: 'Zapatos', kg: 3 },\n  { id: 3, nombre: 'Neceser', kg: 2 },\n]\n\nconst maletaDeLuis = [\n  { id: 1, nombre: 'Ropa', kg: 5 },\n  { id: 2, nombre: 'Libros', kg: 4 },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Equipaje para Lisboa</h1>\n      <Maleta titulo=\"Maleta de Ana\" objetos={maletaDeAna} />\n      <Maleta titulo=\"Maleta de Luis\" objetos={maletaDeLuis} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Maleta.jsx",
      "codigo": "// Arréglalo: Objeto cambia una variable de fuera y Resumen la lee.\n// Haz que Maleta calcule el total a partir de sus objetos y se lo pase a Resumen.\nlet kilos = 0\n\nfunction Objeto({ nombre, kg }) {\n  kilos = kilos + kg\n  return (\n    <li>\n      {nombre}: {kg} kg\n    </li>\n  )\n}\n\nfunction Resumen() {\n  return <p className=\"total\">Peso total: {kilos} kg</p>\n}\n\nexport default function Maleta({ titulo, objetos }) {\n  return (\n    <section>\n      <h2>{titulo}</h2>\n      <ul>\n        {objetos.map((objeto) => (\n          <Objeto key={objeto.id} nombre={objeto.nombre} kg={objeto.kg} />\n        ))}\n      </ul>\n      <Resumen />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nsection {\n  margin-bottom: 1rem;\n  padding: 0.5rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: bold;\n}\n"
    }
  ],
  "archivoInicial": "Maleta.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La maleta de Ana pesa 11 kg",
      "pasos": [],
      "espera": {
        "texto": "Peso total: 11 kg"
      }
    },
    {
      "descripcion": "La maleta de Luis pesa 9 kg, sin cargar con los kilos de la de Ana",
      "pasos": [],
      "espera": {
        "texto": "Peso total: 9 kg"
      }
    },
    {
      "descripcion": "Cada objeto sigue mostrando su peso",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Libros: 4 kg"
      }
    },
    {
      "descripcion": "Cada maleta conserva su título",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Maleta de Luis"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio, añade una tercera maleta en `App.jsx` y cambia el orden de las tres. Comprueba que cada total depende solo de lo que lleva esa maleta.
2. Copia el ejemplo de la peluquería en el `App.jsx` de cualquier bloque en vivo de esta lección (o en tu proyecto de Vite), saca `const huecos = []` fuera de `Huecos` y explica lo que ves en la vista previa y en la consola. Después vuelve a meterlo dentro.
3. Escribe un componente `MasVotadas` que reciba un array de canciones con sus votos y muestre las tres más votadas, sin desordenar el array original. Pista: `toSorted` y `slice`.
4. Copia el ejemplo de la liga y arregla `Clasificacion` de dos formas: con una copia hecha con spread y con `toSorted`. Luego pon `Inscripciones` antes que `Clasificacion` en el JSX de la versión rota y explica por qué el primer render parece correcto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Keeping Components Pure",
      "descripcion": "La página de react.dev en la que se basa esta lección: componentes como fórmulas, mutación local, dónde van los efectos secundarios y tres retos para practicar.",
      "url": "https://react.dev/learn/keeping-components-pure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Components and Hooks must be pure",
      "descripcion": "La regla, en la referencia: idempotencia, efectos fuera del render y por qué props, estado y valores pasados a JSX son inmutables.",
      "url": "https://react.dev/reference/rules/components-and-hooks-must-be-pure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React calls Components and Hooks",
      "descripcion": "Por qué no debes llamar a un componente como una función ni pasar Hooks como si fueran valores.",
      "url": "https://react.dev/reference/rules/react-calls-components-and-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<StrictMode>",
      "descripcion": "Todo lo que comprueba StrictMode en desarrollo, con ejemplos de cada fallo que destapa. La base de la lección 63.",
      "url": "https://react.dev/reference/react/StrictMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rules of React",
      "descripcion": "Las reglas que React da por hechas en tu código, reunidas en una sola página.",
      "url": "https://react.dev/reference/rules",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Array: copying methods and mutating methods",
      "descripcion": "La tabla de MDN con los métodos de array que modifican el original y, al lado, la alternativa que devuelve una copia (sort y toSorted, reverse y toReversed...).",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods",
      "etiqueta": "MDN"
    }
  ]
}
```
