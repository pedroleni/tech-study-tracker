# Tu interfaz como un árbol

- **Módulo:** Describir la interfaz
- **Slug:** `tu-interfaz-como-un-arbol` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) — ver `contenido/react/TEMARIO.md` #13

---

## Qué es y para qué sirve

Ya conoces un árbol: el DOM. Cada etiqueta es un nodo con un padre y, a veces, hijos, y con JavaScript lo has recorrido de arriba abajo. React organiza tus componentes de la misma forma: `App` renderiza a `Cabecera` y a `ListaEpisodios`, `ListaEpisodios` renderiza a cada `Episodio`... y el resultado es un **árbol de componentes**.

Pensar en árbol no es un dibujo bonito: es la forma de responder a casi todas las preguntas que vienen en el temario. ¿De dónde le llega este dato a un componente? ¿Qué se vuelve a renderizar cuando cambia un estado? ¿Por qué un componente ha perdido su estado? ¿Por qué pesa tanto el JavaScript de mi app?

En esta lección verás dos árboles:

- El **árbol de renderizado**, que forman tus componentes cuando React los renderiza: quién pinta a quién.
- El **árbol de dependencias de módulos**, que forman tus archivos con sus `import`: qué código necesita qué otro código.

## El árbol de renderizado

Cuando un componente usa a otro en su JSX, el primero es el **padre** y el segundo, el **hijo**. Cada hijo puede ser padre de otros, y así hasta abajo. Esta app de un podcast tiene seis componentes repartidos en tres archivos, más uno de datos y otro de estilos. Cada componente escribe en la consola cuando React lo ejecuta. Aquí `StrictMode` está apagado para que cada uno salga una sola vez; ya sabes por la lección 12 por qué, si no, saldría dos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una app de podcast, componente a componente",
  "consigna": "Recorre las pestañas para ver quién usa a quién y compáralo con el orden de la consola. Después, en episodios.jsx, marca como nuevo el episodio de los pulpos (nuevo: true) y mira en qué punto de la consola aparece la nueva línea de EtiquetaNuevo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import ListaEpisodios from './ListaEpisodios'\nimport episodios from './episodios'\nimport './estilos.css'\n\nfunction Cabecera() {\n  console.log('Renderizo Cabecera')\n  return (\n    <header>\n      <h1>Ciencia de bolsillo</h1>\n      <p>Un podcast de ciencia en menos de una hora</p>\n    </header>\n  )\n}\n\nfunction Pie({ total }) {\n  console.log('Renderizo Pie')\n  return <footer>{total} episodios publicados</footer>\n}\n\nexport default function App() {\n  console.log('Renderizo App')\n  return (\n    <main>\n      <Cabecera />\n      <ListaEpisodios episodios={episodios} />\n      <Pie total={episodios.length} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaEpisodios.jsx",
      "codigo": "import Episodio from './Episodio'\n\nexport default function ListaEpisodios({ episodios }) {\n  console.log('Renderizo ListaEpisodios')\n  return (\n    <section>\n      <h2>Episodios</h2>\n      <ul>\n        {episodios.map((episodio) => (\n          <Episodio\n            key={episodio.id}\n            titulo={episodio.titulo}\n            minutos={episodio.minutos}\n            nuevo={episodio.nuevo}\n          />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Episodio.jsx",
      "codigo": "function EtiquetaNuevo() {\n  console.log('Renderizo EtiquetaNuevo')\n  return <span className=\"nuevo\">Nuevo</span>\n}\n\nexport default function Episodio({ titulo, minutos, nuevo }) {\n  console.log('Renderizo Episodio:', titulo)\n  return (\n    <li>\n      <h3>\n        {titulo} {nuevo && <EtiquetaNuevo />}\n      </h3>\n      <p>{minutos} min</p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "episodios.jsx",
      "codigo": "// En un proyecto real sería episodios.js: este editor solo admite .jsx y .css\nconst episodios = [\n  { id: 3, titulo: 'Cómo se mide un terremoto', minutos: 28, nuevo: true },\n  { id: 2, titulo: 'La vida secreta de los pulpos', minutos: 41, nuevo: false },\n  { id: 1, titulo: 'Por qué el cielo es azul', minutos: 32, nuevo: false },\n]\n\nexport default episodios\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh3 {\n  margin-bottom: 0;\n}\n\n.nuevo {\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  background: #dcfce7;\n  font-size: 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Este es el árbol que acabas de ejecutar:

```text
App
├── Cabecera
├── ListaEpisodios
│   ├── Episodio  «Cómo se mide un terremoto»
│   │   └── EtiquetaNuevo
│   ├── Episodio  «La vida secreta de los pulpos»
│   └── Episodio  «Por qué el cielo es azul»
└── Pie
```

Cada nodo es un componente, y cada rama va de un padre a un hijo. La **raíz** es `App`, el componente que pintas con `createRoot(...).render(<App />)` (lección 3) y el primero que React renderiza. Fíjate en tres cosas:

- **`Episodio` aparece tres veces.** El árbol tiene un nodo por cada vez que se usa un componente, no uno por cada función que has escrito. Cada uno de esos nodos es una copia independiente, con sus propias props.
- **La consola recorre el árbol en profundidad.** React baja por una rama hasta el final (el `Episodio` del terremoto y su `EtiquetaNuevo`) antes de pasar al siguiente hermano. Por eso `EtiquetaNuevo` sale entre dos episodios y no al final.
- **En el árbol no hay etiquetas HTML.** `main`, `ul` o `li` son cosa del DOM, que React genera a partir de lo que devuelven tus componentes. El árbol de renderizado solo tiene componentes, y por eso es el mismo concepto en React Native, donde no hay ni un `div`.

Si instalas las React DevTools, su panel «Components» te enseña este mismo árbol de cualquier web hecha con React. Las usarás a fondo en la lección 65.

## Raíz, nivel superior y hojas

Mirar el árbol entero ayuda a clasificar los componentes según dónde están, porque eso dice mucho de cómo se comportan:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde está cada componente del podcast",
  "roles": [
    {
      "etiqueta": "Raíz",
      "rol": "App",
      "descripcion": "El primer componente que renderiza React: todo lo demás cuelga de él. Si App se vuelve a renderizar, por defecto se vuelve a renderizar la app entera."
    },
    {
      "etiqueta": "Nivel superior",
      "rol": "Cabecera, ListaEpisodios y Pie",
      "descripcion": "Los más cercanos a la raíz. Cada vez que uno se renderiza arrastra a todo lo que tiene debajo, y suelen concentrar los datos y la lógica."
    },
    {
      "etiqueta": "Hojas",
      "rol": "Sin componentes hijos",
      "descripcion": "EtiquetaNuevo, los Episodio sin etiqueta, Cabecera y Pie: no renderizan ningún otro componente. Suelen ser pequeños y volver a renderizarse a menudo."
    }
  ]
}
```

Las dos categorías se solapan: `Cabecera` está arriba del todo y, a la vez, es una hoja, porque solo devuelve etiquetas HTML. Lo que importa es la idea: **cuanto más arriba está un componente, más cosas arrastra cuando se renderiza**. Lo vas a ver ahora mismo.

## El árbol cambia de un render a otro

Un árbol de renderizado es la foto de **un** render. Con el renderizado condicional de la lección 10, un padre puede pintar unos hijos u otros según sus datos, así que el árbol de un render no tiene por qué parecerse al del siguiente. En esta versión de la app, el reproductor solo existe mientras escuchas un episodio:

```text
Antes de pulsar «Escuchar el último episodio»:

App
└── Cabecera

Mientras escuchas:

App
├── Cabecera
└── Reproductor
```

El botón cambia un estado de `App` (lo verás en la lección 16) y `Reproductor` guarda su propia velocidad de reproducción. Pruébalo con la consola a la vista:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reproductor que entra y sale del árbol",
  "consigna": "Pulsa «Escuchar el último episodio» y mira qué se renderiza. Cambia la velocidad un par de veces y vuelve a mirar. Después cierra el reproductor, ábrelo otra vez y fíjate en la velocidad.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Reproductor from './Reproductor'\nimport './estilos.css'\n\nfunction Cabecera() {\n  console.log('Renderizo Cabecera')\n  return <h1>Ciencia de bolsillo</h1>\n}\n\nexport default function App() {\n  const [escuchando, setEscuchando] = useState(false)\n  console.log('Renderizo App')\n\n  return (\n    <main>\n      <Cabecera />\n      <p>Último episodio: Cómo se mide un terremoto (28 min)</p>\n      <button onClick={() => setEscuchando(!escuchando)}>\n        {escuchando ? 'Cerrar el reproductor' : 'Escuchar el último episodio'}\n      </button>\n      {escuchando && <Reproductor titulo=\"Cómo se mide un terremoto\" />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Reproductor.jsx",
      "codigo": "import { useState } from 'react'\n\nconst VELOCIDADES = ['1x', '1,5x', '2x']\n\nexport default function Reproductor({ titulo }) {\n  const [indice, setIndice] = useState(0)\n  console.log('Renderizo Reproductor')\n\n  return (\n    <section className=\"reproductor\">\n      <h2>Escuchando: {titulo}</h2>\n      <button onClick={() => setIndice((indice + 1) % VELOCIDADES.length)}>\n        Velocidad: {VELOCIDADES[indice]}\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n\n.reproductor {\n  margin-top: 1rem;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #eef2ff;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Han pasado tres cosas, y las tres se explican mirando el árbol:

1. **Al abrir el reproductor se renderizan `App`, `Cabecera` y `Reproductor`.** El estado `escuchando` es de `App`, y cuando un componente se vuelve a renderizar, React vuelve a ejecutar **toda su rama**, también `Cabecera`, que no recibe ni una prop. `Reproductor`, además, entra en el árbol por primera vez.
2. **Al cambiar la velocidad solo se renderiza `Reproductor`.** Ese estado es suyo. `App` y `Cabecera` están por encima y no se enteran.
3. **Al cerrar y volver a abrir, la velocidad vuelve a 1x.** Cerrar el reproductor lo saca del árbol, y su estado se va con él. Al abrirlo otra vez, React crea un `Reproductor` nuevo, desde cero. **El estado de un componente vive en su sitio del árbol**: la lección 26 está dedicada entera a esta regla.

Ojo con la diferencia entre quitar y esconder. Si en vez de `{escuchando && <Reproductor ... />}` envuelves el reproductor en un `<div hidden={!escuchando}>`, no sale del árbol: solo deja de verse, y conserva su velocidad. Pruébalo en el editor de arriba.

## Un render baja por su rama, nunca sube

La regla del punto 1 vale para cualquier componente del árbol: el render empieza donde cambia el estado y baja. Compruébalo con el estado en medio del árbol. Ahora es `ListaEpisodios` la que recuerda si hay que ordenar por duración:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// App renderiza <Cabecera />, <ListaEpisodios episodios={episodios} /> y <Pie />\nfunction Episodio({ titulo, nuevo }) {\n  return (\n    <li>\n      {titulo} {nuevo && <EtiquetaNuevo />}\n    </li>\n  )\n}\n\nfunction ListaEpisodios({ episodios }) {\n  const [masCortosPrimero, setMasCortosPrimero] = useState(false)\n  const lista = masCortosPrimero\n    ? episodios.toSorted((a, b) => a.minutos - b.minutos)\n    : episodios\n\n  return (\n    <section>\n      <button onClick={() => setMasCortosPrimero(!masCortosPrimero)}>\n        Ordenar por duración\n      </button>\n      <ul>\n        {lista.map((episodio) => (\n          <Episodio key={episodio.id} titulo={episodio.titulo} nuevo={episodio.nuevo} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n\n// Al pulsar «Ordenar por duración», ¿qué componentes se vuelven a renderizar?",
  "opciones": [
    "Solo ListaEpisodios, que es la que tiene el estado",
    "ListaEpisodios y todo lo que tiene debajo: los tres Episodio y EtiquetaNuevo",
    "Toda la app, desde App",
    "ListaEpisodios y App, que es su padre"
  ],
  "correcta": 1,
  "explicacion": "El render empieza en el componente cuyo estado cambia y baja por su rama: ListaEpisodios y, con ella, cada Episodio y la EtiquetaNuevo. App está por encima y Cabecera y Pie, al lado: no se ejecutan. Por eso dónde vive un estado decide cuánto se vuelve a renderizar."
}
```

## El árbol de dependencias de módulos

Hay un segundo árbol en tu app, y no lo forman los componentes, sino los **archivos**. Cada archivo es un módulo, y cada `import` es una rama que va del módulo que importa al importado. La raíz es el punto de entrada: en un proyecto de Vite, el `main.jsx` que carga `index.html` (lección 2). Este es el de la app del podcast completa, reproductor incluido:

```text
main.jsx
└── App.jsx
    ├── ListaEpisodios.jsx
    │   └── Episodio.jsx
    ├── Reproductor.jsx
    ├── episodios.js
    └── estilos.css
```

`episodios.js` es el `episodios.jsx` de los bloques de arriba: en un proyecto real, un archivo sin JSX se llama `.js`, pero el editor de esta web solo admite `.jsx` y `.css`. De este árbol cuelgan también los paquetes de npm que importas, como `react` o `react-dom/client`, aunque aquí no estén dibujados. Se parece al árbol de renderizado, pero no es el mismo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Los nodos son archivos, no componentes",
      "texto": "App.jsx es un solo nodo aunque dentro vivan App, Cabecera y Pie. Episodio.jsx aparece una vez aunque Episodio se renderice tres veces, y EtiquetaNuevo ni siquiera tiene nodo propio: vive dentro de Episodio.jsx."
    },
    {
      "titulo": "Hay módulos que no son componentes",
      "texto": "Los datos de episodios.js, el CSS o un archivo de funciones auxiliares están en el árbol de módulos y nunca en el de renderizado, que solo tiene componentes."
    },
    {
      "titulo": "Lo importado está siempre; lo renderizado, a veces",
      "texto": "Reproductor.jsx está en el árbol de módulos desde el principio, porque App.jsx lo importa. El componente Reproductor, en cambio, solo aparece en el árbol de renderizado mientras escuchas."
    },
    {
      "titulo": "Importar no es renderizar",
      "texto": "Un componente que llega como children cuelga, en el árbol de renderizado, del componente que lo coloca en lo que devuelve, no del que escribe la etiqueta; en el de módulos, del archivo que lo importa. Lo comprobarás en Errores típicos."
    }
  ]
}
```

### Para qué sirve: lo que llega al navegador

El árbol de módulos es el que usa tu herramienta de build. Cuando ejecutas `npm run build`, Vite empieza por el punto de entrada, sigue cada `import` y mete en el *bundle* todo lo que encuentra por el camino, `react` incluido. A las herramientas que hacen esto se las llama *bundlers*. Lo que no cuelga del árbol no llega al navegador: un `Huerfano.jsx` olvidado en `src` que nadie importa no ocupa ni un byte.

Esto es lo que hace Vite 8 al construir una app con estos imports:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { lazy, Suspense, useState } from 'react'\nimport Reproductor from './Reproductor.jsx'\nimport { formatearMinutos } from './utilidades.js'\n\nconst Transcripcion = lazy(() => import('./Transcripcion.jsx'))\n\nexport default function App() {\n  const [abierto, setAbierto] = useState(false)\n\n  return (\n    <main>\n      <p>Duración: {formatearMinutos(28)}</p>\n      <button onClick={() => setAbierto(true)}>Escuchar</button>\n      {abierto && <Reproductor />}\n      {abierto && (\n        <Suspense fallback={<p>Cargando la transcripción…</p>}>\n          <Transcripcion />\n        </Suspense>\n      )}\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import Reproductor from './Reproductor.jsx'",
      "nota": "Reproductor solo se renderiza al pulsar el botón, pero su código va desde el principio en el archivo principal, index-….js. Un import normal entra en el bundle tanto si el componente se llega a renderizar como si no."
    },
    {
      "fragmento": "import { formatearMinutos } from './utilidades.js'",
      "nota": "De utilidades.js solo llega lo que alguien importa. Si el archivo exporta otra función que nadie usa, Vite la deja fuera. Es lo que se llama tree shaking: sacudir el árbol para que caiga lo que sobra."
    },
    {
      "fragmento": "lazy(() => import('./Transcripcion.jsx'))",
      "nota": "import() con paréntesis corta esa rama: Vite la saca a un archivo aparte, Transcripcion-….js, y el navegador no lo descarga hasta que el componente se renderiza por primera vez. Es la división del código, y lazy tiene su lección, la 50."
    },
    {
      "fragmento": "<Suspense fallback={<p>Cargando la transcripción…</p>}>",
      "nota": "Mientras ese archivo se descarga, React enseña el fallback en su lugar. Suspense llega en la lección 48."
    }
  ]
}
```

Por eso conviene mirar el árbol de módulos cuando una app tarda en cargar: una librería pesada importada en un archivo de arriba, aunque solo la use una pantalla que casi nadie abre, viaja en el archivo principal para todos los usuarios. Cortar esa rama con `lazy` es una de las primeras optimizaciones que se prueban.

## Por qué pensar en árbol importa

A partir de aquí, casi todo lo que aprendas de React se puede dibujar sobre el árbol de renderizado:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Los datos bajan",
      "texto": "Las props van de padre a hijo, nunca al revés ni entre hermanos. Si dos hermanos necesitan el mismo dato, tiene que vivir en un antepasado común y bajarles a los dos: es la lección 25, levantar el estado."
    },
    {
      "titulo": "Un render arrastra a su rama",
      "texto": "Cuando un componente se renderiza, React ejecuta también todo lo que tiene debajo, pero nada de lo que tiene encima o al lado. Dónde vive cada estado decide cuánto trabajo cuesta cambiarlo: lecciones 17 y 66."
    },
    {
      "titulo": "El estado vive en una posición",
      "texto": "React guarda el estado de cada componente según su sitio en el árbol. Si la rama desaparece, el estado se pierde con ella; si sigue en el mismo sitio, se conserva. La lección 26 lo cuenta a fondo."
    },
    {
      "titulo": "Muchas herramientas actúan sobre una rama",
      "texto": "El contexto (lección 28) llega a toda una rama sin pasar props, Suspense (lección 48) enseña un aviso de carga en lugar de una rama, y un error boundary (lección 53) atrapa los errores de una rama sin tumbar el resto de la app."
    }
  ]
}
```

## Errores típicos

**Confundir quién importa un componente con quién lo renderiza.** Con `children` (lección 9), un componente puede aparecer en el JSX de un archivo y acabar colgando de otro componente:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// App.jsx\nimport Panel from './Panel'\nimport Creditos from './Creditos'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Ciencia de bolsillo</h1>\n      <Panel>\n        <Creditos />\n      </Panel>\n    </main>\n  )\n}\n\n// Panel.jsx: no importa Creditos\nexport default function Panel({ children }) {\n  return <section className=\"panel\">{children}</section>\n}\n\n// En el árbol de RENDERIZADO, ¿de qué componente es hijo Creditos?",
  "opciones": [
    "De App, que es quien lo importa y escribe <Creditos />",
    "De Panel, que es quien lo coloca en lo que devuelve",
    "De ninguno: lo que llega como children no forma parte del árbol"
  ],
  "correcta": 1,
  "explicacion": "App crea el elemento <Creditos />, pero se lo entrega a Panel como children, y es Panel quien lo coloca dentro de lo que devuelve: en el árbol de renderizado, Creditos cuelga de Panel. En el de módulos es al revés: Creditos.jsx cuelga de App.jsx, que es quien lo importa, y Panel.jsx ni sabe que existe."
}
```

**Esperar que un hijo solo se renderice si cambian sus props.** Ya lo has visto con `Cabecera`: cuando su padre se renderiza, ella también, aunque no reciba nada. Casi nunca importa, porque ejecutar un componente es barato. Cuando importa, hay formas de saltárselo que verás en las lecciones 66 a 68.

**Guardar algo que quieres conservar en una rama que desaparece.** Si un componente sale del árbol, su estado se pierde, como la velocidad del reproductor. Si lo necesitas después, o lo guardas más arriba, en un componente que no desaparece (lección 25), o lo escondes en vez de quitarlo, como en la versión con `hidden`. React tiene incluso un componente pensado para esconder sin perder el estado, `<Activity>`, que verás en la lección 54.

**Importar «por si acaso».** Cada `import` añade una rama al árbol de módulos, y esa rama viaja en el bundle aunque el componente no se renderice nunca.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El árbol de renderizado es el DOM",
      "realidad": "El DOM tiene un nodo por cada etiqueta; el árbol de renderizado, solo componentes. Un componente puede generar muchas etiquetas, o ninguna si devuelve null."
    },
    {
      "mito": "Cada componente es un nodo del árbol",
      "realidad": "Cada uso de un componente es un nodo. Episodio, usado tres veces, son tres nodos, y cada uno tendrá su propio estado cuando lo tenga."
    },
    {
      "mito": "Si un componente no se ve, no está en el árbol",
      "realidad": "Depende de cómo lo escondas. Con una condición sale del árbol y pierde su estado; con hidden o con CSS sigue dentro y lo conserva."
    },
    {
      "mito": "Un componente que no se renderiza no pesa nada",
      "realidad": "Si lo importas con import, viaja en el bundle igual. Para que no se descargue hasta que haga falta, hay que cargarlo con lazy (lección 50)."
    }
  ]
}
```

## Ejercicios

El centro cultural de Lavapiés quiere su agenda de la semana en React. `Cabecera`, `Evento` (con su `EtiquetaGratis`) y `Pie` ya están escritos, y `App` tiene los datos. Te toca montar este árbol:

```text
App
├── Cabecera
├── Agenda
│   ├── Evento  (uno por cada evento)
│   │   └── EtiquetaGratis  (solo si el evento es gratis)
│   ├── Evento
│   └── ...
└── Pie
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Monta el árbol de la agenda cultural",
  "consigna": "En App.jsx, renderiza Agenda debajo de la cabecera pasándole los eventos, y después Pie con el número total de eventos. En Agenda.jsx, importa Evento y pinta uno por cada evento, con su key. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Cabecera from './Cabecera'\nimport './estilos.css'\n\nconst eventos = [\n  { id: 1, titulo: 'Taller de encuadernación', dia: 'Lunes', gratis: true },\n  { id: 2, titulo: 'Concierto de guitarra flamenca', dia: 'Miércoles', gratis: false },\n  { id: 3, titulo: 'Club de lectura', dia: 'Jueves', gratis: true },\n  { id: 4, titulo: 'Teatro de títeres', dia: 'Sábado', gratis: false },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera barrio=\"Lavapiés\" />\n      {/* Debajo de la cabecera van Agenda (con los eventos) y Pie (con el total) */}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Agenda.jsx",
      "codigo": "// Importa Evento y renderiza uno por cada elemento de eventos\n\nexport default function Agenda({ eventos }) {\n  return (\n    <section>\n      <h2>Esta semana</h2>\n      <ul>{/* Un <Evento /> por evento, con su key */}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "export default function Cabecera({ barrio }) {\n  return (\n    <header>\n      <h1>Agenda cultural de {barrio}</h1>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "Evento.jsx",
      "codigo": "function EtiquetaGratis() {\n  return <span className=\"gratis\">Gratis</span>\n}\n\nexport default function Evento({ titulo, dia, gratis }) {\n  return (\n    <li>\n      <h3>{titulo}</h3>\n      <p>\n        {dia} {gratis && <EtiquetaGratis />}\n      </p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Pie.jsx",
      "codigo": "export default function Pie({ total }) {\n  return (\n    <footer>\n      <p>{total} eventos esta semana</p>\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh3 {\n  margin-bottom: 0;\n}\n\n.gratis {\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-size: 0.8rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Debajo de la cabecera aparece la agenda, con el título «Esta semana»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Esta semana"
      }
    },
    {
      "descripcion": "La agenda pinta todos los eventos, también el último, «Teatro de títeres»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Teatro de títeres"
      }
    },
    {
      "descripcion": "Los eventos gratuitos llevan la etiqueta «Gratis»",
      "pasos": [],
      "espera": {
        "texto": "Gratis"
      }
    },
    {
      "descripcion": "El pie cuenta los eventos de la semana: «4 eventos esta semana»",
      "pasos": [],
      "espera": {
        "texto": "4 eventos esta semana"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Dibuja el árbol de dependencias de módulos del ejercicio y compáralo con el de renderizado. ¿Qué nodos están en uno y no en el otro? ¿Dónde está `EtiquetaGratis` en cada uno?
2. Añade a `Evento` un componente `UltimasPlazas` que solo aparezca cuando queden menos de 10 plazas (añade el dato `plazas` a cada evento). Dibuja los dos árboles posibles de un `Evento`.
3. Pon un `console.log` en cada componente del ejercicio y comprueba que la consola recorre el árbol en profundidad. Con `StrictMode` activado, cada línea saldrá dos veces: ya sabes por qué.
4. Haz que sea `Agenda` quien renderice `Pie`, en vez de `App`. ¿Cambia el árbol de renderizado? ¿Y el de módulos? ¿Qué prop tiene que recibir ahora `Agenda`... o le basta con la que ya tiene?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Understanding Your UI as a Tree",
      "descripcion": "La página de react.dev en la que se basa esta lección, con el árbol de renderizado y el de dependencias de una app de frases inspiradoras.",
      "url": "https://react.dev/learn/understanding-your-ui-as-a-tree",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Render and Commit",
      "descripcion": "Qué hace React con el árbol cuando algo cambia: renderizar, comparar y aplicar los cambios al DOM. Es la lección 17.",
      "url": "https://react.dev/learn/render-and-commit",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "Por qué el estado está atado a la posición en el árbol, y cómo conservarlo o reiniciarlo a propósito. Es la lección 26.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "lazy",
      "descripcion": "Cargar un componente solo cuando se renderiza por primera vez, cortando su rama del bundle principal. Es la lección 50.",
      "url": "https://react.dev/reference/react/lazy",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Developer Tools",
      "descripcion": "La extensión del navegador con el panel «Components», que enseña el árbol de renderizado de cualquier web hecha con React.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Client-side tooling overview",
      "descripcion": "Qué hacen las herramientas de build y los bundlers, incluido el tree shaking, en el área de aprendizaje de MDN.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview",
      "etiqueta": "MDN"
    }
  ]
}
```
