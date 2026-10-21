# React DevTools, `<Profiler>` y las Performance tracks del navegador

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `react-devtools-profiler-y-las-performance-tracks-del-navegador` (autogenerado del título)
- **Orden:** 650
- **Fuentes:** [React Developer Tools](https://react.dev/learn/react-developer-tools) + [`<Profiler>`](https://react.dev/reference/react/Profiler) + [React Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks) + [React DevTools for agents](https://react.dev/reference/dev-tools/react-devtools-cdt-mcp) — ver `contenido/react/TEMARIO.md` #65

---

## Qué es y para qué sirve

En la lección 17 quedó una regla: antes de optimizar, **medir**. Un render suele costar muy poco, y llenar el código de `memo` o `useMemo` sin saber qué es lento casi nunca compensa. Esta es la lección de medir: las herramientas para ver qué hay dentro de una app de React, qué se renderiza en cada commit y cuánto tarda. Son tres, y cada una responde a una pregunta distinta:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres herramientas, cuatro preguntas",
  "roles": [
    {
      "etiqueta": "DevTools · Components",
      "rol": "Qué hay y con qué datos",
      "descripcion": "Una extensión del navegador que enseña el árbol de componentes de cualquier web hecha con React, con las props, el estado y los Hooks de cada uno."
    },
    {
      "etiqueta": "DevTools · Profiler",
      "rol": "Qué se renderizó y cuánto tardó",
      "descripcion": "Grabas mientras usas la app y te enseña cada commit: qué componentes se renderizaron, cuánto tardó cada uno y, si lo pides, por qué."
    },
    {
      "etiqueta": "<Profiler>",
      "rol": "Medir desde tu propio código",
      "descripcion": "Un componente de React que envuelve una parte del árbol y llama a tu función onRender después de cada commit, con los tiempos."
    },
    {
      "etiqueta": "Performance tracks",
      "rol": "React en la línea de tiempo",
      "descripcion": "Desde React 19.2, el panel Performance del navegador enseña pistas de React (prioridades, renders, commits, efectos) junto a la red y el JavaScript."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Medir, explicar, memorizar",
  "contenido": "Esta lección mide: qué se renderiza y cuánto cuesta. La 66 explica por qué se vuelve a renderizar un componente y cuándo importa, y la 67 enseña a evitarlo con memo, useMemo y useCallback. Aquí verás los motivos de pasada, sin arreglar nada."
}
```

## Instalar las React DevTools

Las React DevTools son una extensión del navegador para **Chrome, Firefox y Edge** (los enlaces de instalación están en la página de react.dev del final). Cuando abres las herramientas de desarrollo **en una web hecha con React**, aparecen paneles nuevos: en Chrome y Edge se llaman «Components ⚛» y «Profiler ⚛»; en Firefox, «Components» y «Profiler». Desde la versión 8 de la extensión (septiembre de 2026) sale además, por defecto, «Suspense ⚛», que enseña qué ha hecho esperar a cada `<Suspense>` (lección 48), y el panel «Elements» del navegador muestra el componente de React del nodo que inspeccionas.

En **Safari**, o en cualquier otro entorno, se usa la versión independiente, un programa que se instala con npm y se abre desde la terminal:

```bash
npm install -g react-devtools
react-devtools
```

Después, en tu página, como primera etiqueta del `<head>`, un script que la conecta con ese programa; recarga la página y listo. Es solo para depurar en tu ordenador: no lo dejes en lo que publicas.

```html
<script src="http://localhost:8097"></script>
```

Para apps de **React Native** está React Native DevTools, el depurador integrado, que funciona igual que la extensión.

Las DevTools se conectan a cualquier web hecha con React, también en producción, pero ahí ven mucho menos: no hay ubicaciones del código fuente ni pilas de owners (lección 64), y el minificador acorta los nombres de las funciones, así que tus componentes pueden salir con nombres de una letra (comprobado con un build de Vite). Donde de verdad lucen es en **tu proyecto en desarrollo**, por ejemplo el de Vite de la lección 2.

## La pestaña «Components»: el árbol, las props, el estado y los Hooks

«Components ⚛» enseña el **árbol de componentes** de la lección 13: un nodo por cada componente que está en pantalla, con su `key` si la tiene. Las etiquetas HTML (`div`, `li`…) están escondidas por defecto con un filtro que puedes quitar. Para la tienda de tebeos **La Viñeta** de esta lección, el árbol sería este:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El árbol de la tienda, como lo enseña «Components ⚛»",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: cesta"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "nota": "props: unidades"
    },
    {
      "nombre": "Catalogo",
      "nivel": 1,
      "nota": "props: cesta, onAnadir"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "sulfato"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "arrugas",
      "nota": "← al seleccionarlo: tebeo, enCesta y onAnadir"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "paracuellos"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "supergrupo"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "hispania"
    },
    {
      "nombre": "Tebeo",
      "nivel": 2,
      "clave": "trueno"
    }
  ]
}
```

Al seleccionar un componente, el panel de al lado enseña:

- **Sus props, su estado y sus Hooks**, con los objetos y arrays desplegables. Y se pueden **editar**: cambias un valor y la página se actualiza al momento, sin tocar el código. Es la forma más rápida de probar «¿y si este tebeo tuviera 3 en la cesta?».
- **Las etiquetas de `useDebugValue`** junto a tus Hooks propios: lo que prometía la lección 43.
- **Quién lo renderizó** («rendered by»): la cadena de owners de la lección 64, los componentes cuyo JSX lo creó. Cuando una prop llega con un valor raro, el culpable está ahí, no necesariamente en el padre.
- **Dónde está su código**, en desarrollo, con un enlace al archivo.

Además, un buscador encuentra componentes por nombre; los contextos salen con su `displayName` (lección 28); los componentes envueltos en `memo` llevan una insignia, y si usas el React Compiler, los que ha optimizado llevan la insignia «Memo ✨» (lección 68).

Con las DevTools instaladas cambia también la consola del navegador: la segunda llamada de `StrictMode` (lección 63) sale atenuada, en un gris más claro. En los ajustes de las DevTools, pestaña «Debugging», hay dos casillas para eso: **«Hide logs during additional invocations in Strict Mode»** la esconde del todo, y **«Disable log dimming during additional invocations in Strict Mode»** la deja igual que la primera. La consola de los bloques de esta web no atenúa nada: allí siempre salen las dos iguales.

## «Highlight updates»: lo que se renderiza, no lo que cambia

En los ajustes de las DevTools, pestaña «General», hay una casilla que conviene conocer: **«Highlight updates when components render»**. Con ella activada, cada vez que un componente se renderiza, las DevTools dibujan un recuadro sobre sus elementos en la página, con el nombre del componente. Si el mismo componente se renderiza muchas veces seguidas, el recuadro pasa del verde azulado al amarillo anaranjado y el nombre lleva la cuenta: «Tebeo x3».

Ojo con lo que marca: **los componentes que se han renderizado, hayan cambiado el DOM o no**. En el código de las DevTools está así: recuadran los nodos de cada componente que React ha vuelto a ejecutar. El árbol de renders de esta web hace justo lo contrario en la vista previa: su recuadro ámbar rodea solo lo que React ha cambiado de verdad. Compáralos en la tienda:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo que se renderiza frente a lo que cambia",
  "consigna": "Pulsa «Añadir «Arrugas»» y lee el árbol de renders: ¿cuántos componentes se han vuelto a renderizar? Mira después la vista previa: el recuadro ámbar solo rodea lo que React ha cambiado en el DOM.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst TEBEOS = [\n  { id: 'sulfato', titulo: 'El sulfato atómico', autor: 'Francisco Ibáñez', precio: 12 },\n  { id: 'arrugas', titulo: 'Arrugas', autor: 'Paco Roca', precio: 20 },\n  { id: 'paracuellos', titulo: 'Paracuellos', autor: 'Carlos Giménez', precio: 30 },\n  { id: 'supergrupo', titulo: 'El supergrupo', autor: 'Jan', precio: 11 },\n  { id: 'hispania', titulo: 'Astérix en Hispania', autor: 'Goscinny y Uderzo', precio: 13 },\n  { id: 'trueno', titulo: 'El Capitán Trueno', autor: 'Víctor Mora y Ambrós', precio: 15 },\n]\n\nfunction Cabecera({ unidades }) {\n  return (\n    <header>\n      <h1>Tebeos La Viñeta</h1>\n      <p>Cesta: {unidades} {unidades === 1 ? 'tebeo' : 'tebeos'}</p>\n    </header>\n  )\n}\n\nfunction Tebeo({ tebeo, enCesta, onAnadir }) {\n  return (\n    <li>\n      {tebeo.titulo} · {tebeo.autor} · {tebeo.precio} €{' '}\n      <button onClick={() => onAnadir(tebeo.id)}>Añadir «{tebeo.titulo}»</button>\n      {enCesta > 0 && ` · ${enCesta} en la cesta`}\n    </li>\n  )\n}\n\nfunction Catalogo({ cesta, onAnadir }) {\n  return (\n    <ul>\n      {TEBEOS.map((tebeo) => (\n        <Tebeo key={tebeo.id} tebeo={tebeo} enCesta={cesta[tebeo.id] ?? 0} onAnadir={onAnadir} />\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [cesta, setCesta] = useState({})\n  const unidades = Object.values(cesta).reduce((suma, n) => suma + n, 0)\n\n  function anadir(id) {\n    setCesta({ ...cesta, [id]: (cesta[id] ?? 0) + 1 })\n  }\n\n  return (\n    <main>\n      <Cabecera unidades={unidades} />\n      <Catalogo cesta={cesta} onAnadir={anadir} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nheader {\n  padding: 0.25rem 0.75rem;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\nli {\n  margin-bottom: 0.35rem;\n}\n\n.informe {\n  margin-top: 1rem;\n  padding: 0.25rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n"
    }
  ],
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Tras el clic, el árbol marca **nueve** componentes que se han vuelto a renderizar (`App`, `Cabecera`, `Catalogo` y los seis `Tebeo`; por qué cada uno, lo explica la lección 66), y el resumen del commit dice **2 cambios en el DOM**: el texto de la cesta y «· 1 en la cesta» junto a Arrugas. Con «Highlight updates», las DevTools habrían recuadrado la página entera. Las dos cosas son ciertas a la vez: nueve funciones ejecutadas y dos nodos tocados. Cuando lo lento son los renders, lo primero es lo que importa, y es lo que enseñan las DevTools.

## La pestaña «Profiler»: grabar, mirar los commits y preguntar por qué

«Profiler ⚛» graba lo que React hace mientras usas la app. El flujo es siempre el mismo: pulsas el botón de grabar, haces lo que va lento (escribir en un buscador, abrir un menú, cambiar de pestaña) y paras. También puedes recargar la página grabando, porque el primer montaje es justo lo que no da tiempo a grabar a mano. Lo que sale está descrito en la presentación del Profiler que enlazan las páginas de `memo` y `useMemo` de react.dev, y en el registro de cambios de las DevTools:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Lo que enseña una grabación",
  "items": [
    {
      "titulo": "Los commits, uno a uno",
      "texto": "Arriba, una barra por commit: cuanto más alta y más amarilla, más tardó. Pulsas una y el resto del panel enseña ese commit."
    },
    {
      "titulo": "El gráfico de llama",
      "texto": "Una barra por componente, con sus hijos debajo. El ancho es lo que tardó en renderizarse con sus hijos; el color, lo que tardó en este commit. En gris, los que no se renderizaron en él."
    },
    {
      "titulo": "El ranking",
      "texto": "Los componentes del commit ordenados del que más tardó al que menos. Como cada uno incluye a sus hijos, los de arriba del árbol suelen salir primero."
    },
    {
      "titulo": "Por qué se renderizó",
      "texto": "Con la casilla «Record why each component rendered while profiling», en los ajustes del Profiler, al seleccionar un componente ves qué cambió: qué props, qué estado o qué Hooks. Es la pregunta de la lección 66."
    },
    {
      "titulo": "Menos ruido",
      "texto": "La opción «Hide commits below» esconde los commits más rápidos que los milisegundos que indiques. Y las grabaciones se pueden exportar e importar para compartirlas con tu equipo."
    }
  ]
}
```

Al leer los números, dos avisos de react.dev. **En desarrollo todo va más lento**: el build de desarrollo hace comprobaciones extra y `StrictMode` renderiza dos veces (lección 63); para una idea realista, mide con React en modo producción, sin las DevTools activas y en un dispositivo parecido al de tus usuarios. **Y tu ordenador es casi seguro más rápido que el suyo**: Chrome tiene una opción en el panel Performance para ralentizar la CPU a propósito. Los tiempos de desarrollo sirven para **comparar** (antes y después de un cambio, un componente con otro), no como cifra final.

## `<Profiler>`: medir desde tu código

Las DevTools se manejan a mano. Si quieres que la app mida sola (guardar los tiempos de una pantalla, avisar cuando un render pasa de cierto umbral, comparar dos versiones), React tiene un componente: `<Profiler>`. Envuelve una parte del árbol, recibe un `id` y una función `onRender`, y **React llama a esa función después de cada commit en el que se ha renderizado algo de dentro**.

En la tienda, la cabecera y el catálogo tienen cada uno su `<Profiler>`, con la misma función `registrar`. Cada tebeo tarda 2 ms en renderizarse, a propósito. `StrictMode` está apagado en este bloque para que los tiempos no cuenten doble.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos zonas medidas con <Profiler>",
  "consigna": "Lee la consola al cargar: un mount por cada Profiler. Pulsa «Ver ofertas»: ¿qué Profiler escribe? Pulsa después «Añadir «Arrugas»» y compara.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Profiler, useState } from 'react'\nimport Cabecera from './Cabecera'\nimport Catalogo from './Catalogo'\nimport './estilos.css'\n\n// React la llama después de cada commit en el que se ha renderizado\n// algo de dentro del Profiler\nfunction registrar(id, fase, duracionReal, duracionBase) {\n  console.log(`${id} · ${fase} · ${duracionReal.toFixed(1)} ms (base: ${duracionBase.toFixed(1)} ms)`)\n}\n\nexport default function App() {\n  const [cesta, setCesta] = useState({})\n  const unidades = Object.values(cesta).reduce((suma, n) => suma + n, 0)\n\n  function anadir(id) {\n    setCesta({ ...cesta, [id]: (cesta[id] ?? 0) + 1 })\n  }\n\n  return (\n    <main>\n      <Profiler id=\"Cabecera\" onRender={registrar}>\n        <Cabecera unidades={unidades} />\n      </Profiler>\n      <Profiler id=\"Catalogo\" onRender={registrar}>\n        <Catalogo cesta={cesta} onAnadir={anadir} />\n      </Profiler>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Cabecera({ unidades }) {\n  const [conOfertas, setConOfertas] = useState(false)\n\n  return (\n    <header>\n      <h1>Tebeos La Viñeta</h1>\n      <p>\n        Cesta: {unidades} {unidades === 1 ? 'tebeo' : 'tebeos'}\n      </p>\n      <button onClick={() => setConOfertas(!conOfertas)}>\n        {conOfertas ? 'Ocultar ofertas' : 'Ver ofertas'}\n      </button>\n      {conOfertas && <p>Esta semana: 2 × 1 en Astérix.</p>}\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "Catalogo.jsx",
      "codigo": "const TEBEOS = [\n  { id: 'sulfato', titulo: 'El sulfato atómico', autor: 'Francisco Ibáñez', precio: 12 },\n  { id: 'arrugas', titulo: 'Arrugas', autor: 'Paco Roca', precio: 20 },\n  { id: 'paracuellos', titulo: 'Paracuellos', autor: 'Carlos Giménez', precio: 30 },\n  { id: 'supergrupo', titulo: 'El supergrupo', autor: 'Jan', precio: 11 },\n  { id: 'hispania', titulo: 'Astérix en Hispania', autor: 'Goscinny y Uderzo', precio: 13 },\n  { id: 'trueno', titulo: 'El Capitán Trueno', autor: 'Víctor Mora y Ambrós', precio: 15 },\n]\n\nfunction Tebeo({ tebeo, enCesta, onAnadir }) {\n  // Un render lento a propósito: 2 ms por tebeo, como si dibujara la portada\n  const fin = performance.now() + 2\n  while (performance.now() < fin) {\n    // espera activa\n  }\n\n  return (\n    <li>\n      {tebeo.titulo} · {tebeo.autor} · {tebeo.precio} €{' '}\n      <button onClick={() => onAnadir(tebeo.id)}>Añadir «{tebeo.titulo}»</button>\n      {enCesta > 0 && ` · ${enCesta} en la cesta`}\n    </li>\n  )\n}\n\nexport default function Catalogo({ cesta, onAnadir }) {\n  return (\n    <ul>\n      {TEBEOS.map((tebeo) => (\n        <Tebeo key={tebeo.id} tebeo={tebeo} enCesta={cesta[tebeo.id] ?? 0} onAnadir={onAnadir} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nheader {\n  padding: 0.25rem 0.75rem;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\nli {\n  margin-bottom: 0.35rem;\n}\n\n.informe {\n  margin-top: 1rem;\n  padding: 0.25rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true
}
```

Al cargar, cada `<Profiler>` informa de su montaje (`mount`), y el catálogo tarda unos 12 ms: seis tebeos de 2 ms. «Ver ofertas» cambia un estado de `Cabecera`, así que solo escribe el `Profiler` de la cabecera: el catálogo no se ha renderizado y su `onRender` no se llama. «Añadir «Arrugas»» cambia el estado de `App`, que renderiza las dos ramas, y escriben los dos, con `update`. Los milisegundos exactos cambian de un ordenador a otro.

Esto es lo que recibe `onRender`, en el orden en que React se lo pasa (comprobado con React 19.3.1: seis argumentos):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {\n  // Guardar, agrupar o enviar las medidas…\n}\n\n<Profiler id=\"Catalogo\" onRender={onRender}>\n  <Catalogo />\n</Profiler>",
  "anotaciones": [
    {
      "fragmento": "id,",
      "nota": "El id del Profiler que acaba de hacer commit. Si usas la misma función en varios Profilers, es lo que te dice de cuál viene cada medida."
    },
    {
      "fragmento": "phase",
      "nota": "\"mount\" la primera vez que se monta ese árbol, \"update\" cuando se vuelve a renderizar por props, estado o Hooks, y \"nested-update\" cuando el render lo provoca un set dentro de un useLayoutEffect (lección 45), comprobado en 19.3.1."
    },
    {
      "fragmento": "actualDuration",
      "nota": "Milisegundos que han tardado en renderizarse el Profiler y sus descendientes en este commit. Si memorizas bien (lección 67), baja mucho después del montaje, porque los hijos que no cambian no se renderizan."
    },
    {
      "fragmento": "baseDuration",
      "nota": "Una estimación de lo que tardaría renderizar todo el subárbol sin ninguna optimización: la suma del último render de cada componente. Compararla con actualDuration dice si la memorización funciona."
    },
    {
      "fragmento": "startTime",
      "nota": "La marca de tiempo de cuándo empezó React a renderizar esta actualización."
    },
    {
      "fragmento": "commitTime",
      "nota": "La marca de tiempo del commit. Es la misma para todos los Profilers de un mismo commit, así que sirve para agrupar sus medidas."
    },
    {
      "fragmento": "<Profiler id=\"Catalogo\" onRender={onRender}>",
      "nota": "Las dos props son obligatorias. Puedes poner varios Profilers, uno al lado de otro o uno dentro de otro, pero cada uno añade algo de trabajo: úsalos solo donde estés midiendo."
    }
  ]
}
```

Comprueba si lo has entendido:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function registrar(id, fase) {\n  console.log(id, fase)\n}\n\nfunction Envios() {\n  const [abierto, setAbierto] = useState(false)\n  return (\n    <button onClick={() => setAbierto(!abierto)}>\n      {abierto ? 'Envío gratis desde 30 €' : 'Ver gastos de envío'}\n    </button>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Profiler id=\"Catalogo\" onRender={registrar}>\n        <Catalogo />\n      </Profiler>\n      <Envios />\n    </main>\n  )\n}\n\n// La tienda ya está en pantalla. Pulsas «Ver gastos de envío».\n// ¿Qué escribe la consola?",
  "opciones": [
    "Catalogo update",
    "Nada",
    "Catalogo nested-update"
  ],
  "correcta": 1,
  "explicacion": "El clic cambia el estado de Envios, y el render empieza ahí y baja por su rama (lección 13). App no se renderiza, y Catalogo, que está en otra rama, tampoco. onRender solo se llama cuando se renderiza algo de dentro de su Profiler, así que la consola se queda callada. Comprobado en React 19.3.1."
}
```

### En producción, `onRender` no se llama

Medir tiene un coste, así que el build de producción normal desactiva el `Profiler`: renderiza a sus hijos como si no estuviera, pero **nunca llama a `onRender`**. Comprobado con React 19.3.1 y un build de Vite: cero llamadas. Para medir en producción hay un build especial de React, `react-dom/profiling`, que se usa en lugar de `react-dom/client`. react.dev recomienda cambiarlo con un alias del bundler en vez de tocar cada import. Con Vite, por ejemplo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// npm run build -- --mode profiling\nexport default defineConfig(({ mode }) => ({\n  plugins: [react()],\n  resolve: {\n    alias: mode === 'profiling' ? { 'react-dom/client': 'react-dom/profiling' } : {},\n  },\n}))",
  "anotaciones": [
    {
      "fragmento": "// npm run build -- --mode profiling",
      "nota": "El modo sale de la opción --mode al construir. npm run build sin ella sigue haciendo el build de siempre."
    },
    {
      "fragmento": "mode === 'profiling'",
      "nota": "El alias solo se aplica en el build de medir. Así no hace falta acordarse de deshacer nada antes de publicar."
    },
    {
      "fragmento": "{ 'react-dom/client': 'react-dom/profiling' }",
      "nota": "Cada import de react-dom/client pasa a ser react-dom/profiling, que tiene el mismo createRoot. Comprobado con React 19.3.1 en Vite: el build normal hace cero llamadas a onRender y este, una por commit."
    }
  ]
}
```

## Las Performance tracks del navegador

Desde **React 19.2**, el build de desarrollo de React escribe lo que hace en la línea de tiempo del panel **Performance** de las herramientas del navegador, con la API de extensiones de Chrome. Grabas una traza como con cualquier problema de rendimiento, y junto a la red, el JavaScript y el pintado aparecen dos grupos de pistas de React.

**«Scheduler ⚛»** enseña en qué trabajaba React y con qué prioridad, en cuatro subpistas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las cuatro subpistas de «Scheduler ⚛»",
  "roles": [
    {
      "etiqueta": "Blocking",
      "rol": "Lo urgente",
      "descripcion": "Las actualizaciones síncronas, como las que provoca escribir en un campo o pulsar un botón."
    },
    {
      "etiqueta": "Transition",
      "rol": "Lo que puede esperar",
      "descripcion": "El trabajo en segundo plano, normalmente el de startTransition o useTransition (lección 51)."
    },
    {
      "etiqueta": "Suspense",
      "rol": "Esperas y fallbacks",
      "descripcion": "El trabajo de los límites de Suspense: enseñar el fallback o revelar el contenido cuando llega (lección 48)."
    },
    {
      "etiqueta": "Idle",
      "rol": "Cuando no hay nada más",
      "descripcion": "El trabajo de menos prioridad, que se hace cuando no queda nada más urgente."
    }
  ]
}
```

Dentro de cada subpista, cada pasada de render se divide en fases, las mismas de la lección 17: **Update** (qué la provocó), **Render** (llamar a los componentes), **Commit** (cambiar el DOM y ejecutar los efectos de layout) y **Remaining Effects** (los `useEffect`, normalmente después de pintar; tras un clic pueden ir antes). Si una actualización se pide en mitad de una pasada, React puede tirar el trabajo hecho y empezar otra: es un **Cascading update**, uno de los patrones típicos de lentitud, y en desarrollo, al pulsarlo, ves qué componente lo provocó.

**«Components ⚛»** es un gráfico de llama con la duración del render de cada componente y sus hijos y, con otros colores, la de sus efectos (solo los que tardan al menos 0,05 ms o provocan una actualización). Marca también cuándo se monta o se desmonta un subárbol (**Mount**, **Unmount**) y cuándo un `<Activity>` lo esconde o lo vuelve a mostrar (**Disconnect**, **Reconnect**). En desarrollo, al pulsar un render ves qué props cambiaron.

¿En qué builds salen?

- **Desarrollo**: todas, por defecto.
- **Profiling** (`react-dom/profiling`): las de «Scheduler ⚛». En «Components ⚛», solo los componentes que estén dentro de un `<Profiler>`, o todos si tienes instaladas las React DevTools.
- **Producción**: ninguna.
- Las pistas del servidor, **Server Requests** y **Server Components** (para los Server Components de la lección 88), solo en desarrollo.

Las propias DevTools van en esa dirección: la versión 8 quitó su antigua pestaña «Timeline», y su registro de cambios lo dice sin rodeos: para perfilar React, usa el panel Performance del navegador, que incluye las pistas de React.

### Pruébalo aquí mismo

Los bloques en vivo de esta web usan el build de desarrollo de React 19.3.1, así que **también escriben estas pistas**. En Chrome o Edge:

1. Abre las herramientas del navegador (F12) y ve al panel «Performance».
2. Pulsa grabar, escribe tres letras deprisa en «Buscar en el fondo» y para la grabación.
3. Busca los grupos «Scheduler ⚛» y «Components ⚛» en la línea de tiempo.

El buscador actualiza el campo con prioridad normal y filtra las 120 fichas del fondo dentro de una transición, como en la lección 51. Cada ficha tarda medio milisegundo a propósito, y `StrictMode` está apagado para que cada render salga una vez.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un buscador para grabar con el panel Performance",
  "consigna": "Graba con el panel Performance mientras escribes en el buscador. Compara las subpistas Blocking y Transition de «Scheduler ⚛». Después cambia iniciarTransicion(() => setFiltro(…)) por setFiltro(…) a secas, vuelve a grabar y busca dónde ha ido a parar el render lento.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useTransition } from 'react'\nimport './estilos.css'\n\nconst SERIES = ['Mortadelo y Filemón', 'Superlópez', 'Zipi y Zape', 'Astérix', 'El Capitán Trueno', 'Spirou']\nconst FONDO = SERIES.flatMap((serie) => Array.from({ length: 20 }, (_, i) => `${serie} n.º ${i + 1}`))\n\nfunction Ficha({ titulo }) {\n  // Lenta a propósito: medio milisegundo por ficha\n  const fin = performance.now() + 0.5\n  while (performance.now() < fin) {\n    // espera activa\n  }\n  return <li>{titulo}</li>\n}\n\nfunction Lista({ filtro }) {\n  const visibles = FONDO.filter((titulo) => titulo.toLowerCase().includes(filtro))\n  return (\n    <ul>\n      {visibles.map((titulo) => (\n        <Ficha key={titulo} titulo={titulo} />\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [texto, setTexto] = useState('')\n  const [filtro, setFiltro] = useState('')\n  const [pendiente, iniciarTransicion] = useTransition()\n\n  function manejarCambio(evento) {\n    setTexto(evento.target.value) // urgente: el campo\n    iniciarTransicion(() => setFiltro(evento.target.value.toLowerCase())) // puede esperar: la lista\n  }\n\n  return (\n    <main>\n      <h1>Tebeos La Viñeta · fondo de catálogo</h1>\n      <label>\n        Buscar en el fondo <input value={texto} onChange={manejarCambio} />\n      </label>\n      {pendiente && <p>Filtrando…</p>}\n      <Lista filtro={filtro} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nheader {\n  padding: 0.25rem 0.75rem;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\nli {\n  margin-bottom: 0.35rem;\n}\n\n.informe {\n  margin-top: 1rem;\n  padding: 0.25rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n"
    }
  ],
  "strictMode": false,
  "mostrarConsola": false
}
```

En una traza de Chromium grabada con este mismo buscador, dentro de un marco aislado como el de la vista previa, salió esto al teclear «arr»:

- En **«Blocking»**, un «Event: input» por tecla, con su Render, su Commit y sus Remaining Effects, todos cortos: es el campo de texto.
- En **«Transition»**, los renders de la lista, uno de ellos marcado como **«Interrupted Render»**: React lo abandonó porque llegó otra tecla antes de terminarlo. También aparece «Waiting for Paint», cuando React espera a que el navegador pinte antes de seguir.
- En **«Components ⚛»**, una entrada por cada `Ficha` renderizada.

Es la lección 51 vista desde dentro: la transición deja pasar las teclas por delante del trabajo pesado.

## El árbol de renders de esta web no son las DevTools

Desde la lección 13 tienes, debajo de algunos bloques, el panel «Árbol de renders». Se parece a «Components ⚛» por un motivo: se engancha a React por el mismo sitio, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, un objeto global que React busca al arrancar para avisar de cada commit. Pero es una ayuda para aprender hecha para esta web, no una versión de las DevTools:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Lo que añade",
      "texto": "El motivo de cada render escrito en español, el recuento por componente y el recuadro ámbar de lo que cambió en el DOM, todo a la vista sin abrir nada ni grabar."
    },
    {
      "titulo": "Lo que no tiene",
      "texto": "Ni tiempos, ni gráficos de llama, ni Hooks editables, ni etiquetas de useDebugValue. Para medir están el Profiler y las Performance tracks."
    },
    {
      "titulo": "Dónde funciona",
      "texto": "Solo en los bloques de esta web. Las DevTools funcionan en cualquier web hecha con React, la tuya incluida."
    },
    {
      "titulo": "Qué cuenta",
      "texto": "Renders que llegan a un commit: uno por componente y commit, aunque StrictMode llame dos veces a la función (lecciones 33 y 63)."
    }
  ]
}
```

## Las React DevTools para agentes (experimental)

react.dev documenta un paquete **experimental**, `react-devtools-cdt-mcp`, que da a un agente de IA que maneja Chrome con Chrome DevTools MCP la misma vista que tú tienes con las DevTools: el árbol, las props, los Hooks, los owners, el código fuente y los tiempos de render. No es un servidor MCP: es una librería que importas en tu página **antes que React**, y solo en desarrollo, porque hace que React le avise de cada commit y eso ralentiza la app:

```js
import 'react-devtools-cdt-mcp/register'

import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
```

Registra herramientas como `react_get_component_tree`, `react_find_components`, `react_start_profiling` o `react_get_commit_report`, que el agente descubre solo. Va por la versión 0.1.0 y sus herramientas pueden cambiar entre versiones.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Algo va lento al escribir o al pulsar",
      "texto": "Graba con el Profiler o con el panel Performance mientras lo haces. Busca el commit más alto y el componente más ancho: es lo primero que hay que mirar."
    },
    {
      "titulo": "Un dato sale mal y no sabes de dónde viene",
      "texto": "En Components, selecciona el componente, mira sus props y sube por «rendered by» hasta el que las decidió."
    },
    {
      "titulo": "Comparar antes y después de un cambio",
      "texto": "Un <Profiler> alrededor de lo que tocas, o dos grabaciones con las mismas acciones. Mide las dos veces en las mismas condiciones."
    },
    {
      "titulo": "Vigilar una pantalla en producción",
      "texto": "Un <Profiler> con el build de profiling, solo donde lo necesites, y un onRender que guarde o envíe los renders lentos."
    },
    {
      "titulo": "Entender una transición o una espera",
      "texto": "Las subpistas Transition y Suspense del panel Performance enseñan qué esperó a qué, y la pestaña Suspense de las DevTools, qué hizo esperar a cada límite."
    }
  ]
}
```

## Errores típicos

**Optimizar sin medir.** Envolver medio árbol en `memo` porque «seguro que es lento» complica el código y a veces no gana nada. Graba primero, mira qué componente pesa y optimiza eso (lecciones 66 y 67).

**Creerse los tiempos de desarrollo.** El catálogo del bloque del `<Profiler>`, con `StrictMode` encendido, pasa de unos 12 ms a unos 24 (comprobado con React 19.3.1): cada render cuenta doble. Y el build de desarrollo es más lento que el de producción. Los números de desarrollo valen para comparar, no como cifra final.

**Guardar las medidas en el estado desde `onRender`.** Parece lo natural para enseñarlas en pantalla:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un contador de commits que no para nunca",
  "consigna": "La vista previa se cae nada más cargar. Lee el error y piensa por qué: ¿qué provoca setCommits, y qué hace React después de cada commit?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Profiler, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [commits, setCommits] = useState(0)\n\n  // Mal: cada commit cambia el estado, y cada cambio de estado es otro commit\n  return (\n    <Profiler id=\"Tienda\" onRender={() => setCommits((n) => n + 1)}>\n      <main>\n        <h1>Tebeos La Viñeta</h1>\n        <p>Commits medidos: {commits}</p>\n      </main>\n    </Profiler>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nheader {\n  padding: 0.25rem 0.75rem;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\nli {\n  margin-bottom: 0.35rem;\n}\n\n.informe {\n  margin-top: 1rem;\n  padding: 0.25rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n"
    }
  ],
  "mostrarConsola": false
}
```

El recuadro de error dice:

```text
Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Es decir: se ha superado el máximo de actualizaciones encadenadas; React las limita para cortar los bucles infinitos. El mensaje habla de métodos de clase, pero el bucle es el mismo: `onRender` se llama después de cada commit, `setCommits` provoca otro commit, que vuelve a llamar a `onRender`… Las medidas se guardan **en una ref o fuera de React**, y se enseñan cuando alguien las pide. Es el ejercicio.

**Leer «Highlight updates» como cambios en la página.** Un recuadro de las DevTools significa «este componente se ha ejecutado», no «este trozo de la página ha cambiado». Como viste en la tienda, nueve renders pueden acabar en dos cambios en el DOM.

**Dejar un `<Profiler>` en producción esperando datos.** Con el build normal, `onRender` no se llama nunca, sin error ni aviso. Si quieres medidas de producción, necesitas el build de profiling.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las Performance tracks necesitan las React DevTools",
      "realidad": "No. Las escribe el propio React en su build de desarrollo, y las lee el panel Performance del navegador. Las DevTools solo cambian algo en el build de profiling: con ellas instaladas, «Components ⚛» incluye todos los componentes."
    },
    {
      "mito": "El Profiler hace más lenta la app de mis usuarios",
      "realidad": "En el build de producción normal está desactivado: renderiza a sus hijos y no mide nada. Solo cuesta algo en desarrollo y en el build de profiling."
    },
    {
      "mito": "Si un componente se renderiza, la página ha cambiado",
      "realidad": "Renderizar es ejecutar la función y comparar el resultado. React solo toca el DOM donde el resultado es distinto: en la tienda, nueve renders y dos cambios."
    },
    {
      "mito": "Con las DevTools se ve igual una web en producción",
      "realidad": "Se ve el árbol, pero sin ubicaciones del código ni pilas de owners, y con los nombres que haya dejado el minificador. Para depurar, tu proyecto en desarrollo."
    }
  ]
}
```

## Ejercicios

**Un informe de commits.** La tienda quiere saber cuántas veces se ha hecho commit en el catálogo de novedades y de qué tipo fue el último. El `<Profiler>` ya está puesto y el informe ya sabe enseñar las medidas; falta la función que las apunta. Las medidas viven en una ref para no provocar renders (lección 33), y «Ver medidas» las copia al estado de `Informe`, que está fuera del `Profiler`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuenta los commits del catálogo",
  "consigna": "En App.jsx, completa registrar: cada vez que React la llame, suma un commit en medidas.current.commits y guarda la fase en medidas.current.fase. No uses estado: ya has visto lo que pasa. Pulsa «Ver medidas» al cargar, después de añadir tebeos y después de «Ver gastos de envío», y explica cada número.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Profiler, useRef } from 'react'\nimport Catalogo from './Catalogo'\nimport Envios from './Envios'\nimport Informe from './Informe'\nimport './estilos.css'\n\nexport default function App() {\n  // Las medidas viven en una ref: cambiarlas no provoca ningún render\n  const medidas = useRef({ commits: 0, fase: 'ninguna' })\n\n  function registrar(id, fase) {\n    // Escribe aquí: cuenta un commit más y guarda la fase de este commit\n  }\n\n  return (\n    <main>\n      <h1>Tebeos La Viñeta</h1>\n      <Profiler id=\"Catalogo\" onRender={registrar}>\n        <Catalogo />\n      </Profiler>\n      <Envios />\n      <Informe medidas={medidas} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Catalogo.jsx",
      "codigo": "import { useState } from 'react'\n\nconst NOVEDADES = [\n  { id: 'arrugas', titulo: 'Arrugas', precio: 20 },\n  { id: 'paracuellos', titulo: 'Paracuellos', precio: 30 },\n  { id: 'supergrupo', titulo: 'El supergrupo', precio: 11 },\n]\n\nexport default function Catalogo() {\n  const [cesta, setCesta] = useState([])\n\n  return (\n    <section>\n      <h2>Novedades</h2>\n      <ul>\n        {NOVEDADES.map((tebeo) => (\n          <li key={tebeo.id}>\n            {tebeo.titulo} · {tebeo.precio} €{' '}\n            <button onClick={() => setCesta([...cesta, tebeo.id])}>Añadir «{tebeo.titulo}»</button>\n          </li>\n        ))}\n      </ul>\n      <p>En la cesta: {cesta.length}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Envios.jsx",
      "codigo": "import { useState } from 'react'\n\n// Fuera del Profiler: tiene su propio estado\nexport default function Envios() {\n  const [abierto, setAbierto] = useState(false)\n\n  return (\n    <p>\n      <button onClick={() => setAbierto(!abierto)}>\n        {abierto ? 'Ocultar gastos de envío' : 'Ver gastos de envío'}\n      </button>\n      {abierto && ' Envío gratis a partir de 30 €.'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "Informe.jsx",
      "codigo": "import { useState } from 'react'\n\n// Copia las medidas de la ref al estado solo cuando se lo pides\nexport default function Informe({ medidas }) {\n  const [copia, setCopia] = useState(null)\n\n  return (\n    <section className=\"informe\" aria-label=\"Informe del Profiler\">\n      <button onClick={() => setCopia({ ...medidas.current })}>Ver medidas</button>\n      {copia && (\n        <p>\n          Commits medidos: {copia.commits} · última fase: {copia.fase}\n        </p>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nheader {\n  padding: 0.25rem 0.75rem;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\nli {\n  margin-bottom: 0.35rem;\n}\n\n.informe {\n  margin-top: 1rem;\n  padding: 0.25rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, el informe cuenta el commit del montaje",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver medidas"
          }
        }
      ],
      "espera": {
        "texto": "Commits medidos: 1 · última fase: mount"
      }
    },
    {
      "descripcion": "Cada tebeo añadido es un commit más del catálogo, de tipo update",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «Arrugas»"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «Paracuellos»"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver medidas"
          }
        }
      ],
      "espera": {
        "texto": "Commits medidos: 3 · última fase: update"
      }
    },
    {
      "descripcion": "Lo que se renderiza fuera del Profiler no cuenta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver gastos de envío"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver medidas"
          }
        }
      ],
      "espera": {
        "texto": "Commits medidos: 1 · última fase: mount"
      }
    },
    {
      "descripcion": "Pulsar «Ver medidas» no cuenta como commit del catálogo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver medidas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver medidas"
          }
        }
      ],
      "espera": {
        "texto": "Commits medidos: 1 · última fase: mount"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Instala las React DevTools y abre tu proyecto de Vite de la lección 2. Busca `App` en «Components ⚛», cambia un estado desde el panel y mira cómo cambia la página. Si tienes algún Hook propio, ponle un `useDebugValue` y búscalo.
2. Activa «Highlight updates when components render» en tu proyecto y escribe en algún campo. ¿Qué se recuadra en cada tecla? Compáralo con el recuadro ámbar del bloque de la cesta de esta lección.
3. En el ejercicio, guarda también `actualDuration` y enséñala en el informe redondeada a un decimal. Pon y quita `StrictMode` en `main.jsx` de tu proyecto (o compara dos bloques) y anota la diferencia.
4. En tu proyecto de Vite, añade el alias a `react-dom/profiling`, construye con `npm run build -- --mode profiling`, sirve el resultado con `npx vite preview` y comprueba que un `onRender` con `console.log` escribe en la consola; con el build normal, no.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "React Developer Tools",
      "descripcion": "Cómo instalar la extensión en Chrome, Firefox y Edge, la versión independiente para Safari y las DevTools de React Native.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Profiler>",
      "descripcion": "La referencia: las props id y onRender, los seis argumentos de onRender y cómo medir varias partes de la app.",
      "url": "https://react.dev/reference/react/Profiler",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Performance tracks",
      "descripcion": "Todas las pistas de React en el panel Performance: Scheduler, Components y las del servidor, y en qué builds salen.",
      "url": "https://react.dev/reference/dev-tools/react-performance-tracks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React DevTools for agents",
      "descripcion": "El paquete experimental que da a un agente de IA la vista de las DevTools a través de Chrome DevTools MCP, con un banco de pruebas para probar sus herramientas a mano.",
      "url": "https://react.dev/reference/dev-tools/react-devtools-cdt-mcp",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Introducing the React Profiler",
      "descripcion": "La presentación del Profiler de las DevTools que enlazan las páginas de memo y useMemo de react.dev: commits, gráfico de llama y ranking. Es de 2018, así que algunos detalles de la interfaz han cambiado.",
      "url": "https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React DevTools changelog",
      "descripcion": "El registro de cambios oficial de las DevTools: «Highlight updates», «Why did this render?», la pestaña Suspense y la retirada de Timeline en la versión 8.",
      "url": "https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Analyze runtime performance",
      "descripcion": "La guía de Chrome para grabar y leer una traza en el panel Performance, incluida la ralentización de CPU.",
      "url": "https://developer.chrome.com/docs/devtools/performance",
      "etiqueta": "Chrome"
    }
  ]
}
```
