# Context: pasar datos en profundidad

- **Módulo:** Gestionar el estado
- **Slug:** `context-pasar-datos-en-profundidad` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) + [useContext](https://react.dev/reference/react/useContext) + [createContext](https://react.dev/reference/react/createContext) — ver `contenido/react/TEMARIO.md` #28

---

## Qué es y para qué sirve

Hasta ahora, un dato llega a un componente de una sola manera: **por props, de padre a hijo**. Es explícito y fácil de seguir. Pero tiene un precio cuando el dato hace falta muy abajo en el árbol, o en muchos sitios a la vez: cada componente que hay en medio tiene que recibirlo y pasarlo, aunque él no lo use para nada.

Context resuelve eso:

> **Un componente ofrece un dato a todo el árbol que tiene debajo, y cualquier componente de esa rama lo lee directamente, esté a la profundidad que esté, sin que los de en medio se enteren.**

En la lección 13 viste que muchas herramientas de React actúan sobre una rama entera del árbol. El contexto es la primera de ellas: llega a toda una rama sin pasar props.

## El problema: props que atraviesan componentes que no las usan

El Eco del Valle, el diario digital de la comarca, tiene modo claro y modo oscuro. El tema se elige arriba, en `App`, pero lo necesitan la cabecera y el botón «Guardar para luego» de cada noticia, que está tres componentes más abajo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El tema, pasado de mano en mano",
  "consigna": "Cambia al modo oscuro. Después abre Portada.jsx y busca los componentes que reciben la prop tema sin usarla para nada: solo se la pasan a su hijo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Portada from './Portada'\nimport './estilos.css'\n\nfunction Cabecera({ tema }) {\n  return (\n    <header className={'cabecera ' + tema}>\n      <h1>El Eco del Valle</h1>\n      <p>Diario digital de la comarca</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  const [tema, setTema] = useState('claro')\n\n  return (\n    <div className=\"pagina\">\n      <div className=\"barra\">\n        <button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>\n          {tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}\n        </button>\n      </div>\n      <Cabecera tema={tema} />\n      <Portada tema={tema} />\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "const NOTICIAS = [\n  { id: 1, titular: 'Reabre el puente romano tras dos años de obras' },\n  { id: 2, titular: 'La feria del queso bate su récord de visitantes' },\n  { id: 3, titular: 'El instituto estrena huerto escolar' },\n]\n\nfunction BotonGuardar({ titular, tema }) {\n  return (\n    <button className={tema} aria-label={'Guardar para luego: ' + titular}>\n      Guardar para luego\n    </button>\n  )\n}\n\nfunction Noticia({ titular, tema }) {\n  return (\n    <article>\n      <h3>{titular}</h3>\n      <BotonGuardar titular={titular} tema={tema} />\n    </article>\n  )\n}\n\nfunction ListaNoticias({ tema }) {\n  return (\n    <div className=\"noticias\">\n      {NOTICIAS.map((noticia) => (\n        <Noticia key={noticia.id} titular={noticia.titular} tema={tema} />\n      ))}\n    </div>\n  )\n}\n\nexport default function Portada({ tema }) {\n  return (\n    <main>\n      <h2>Portada</h2>\n      <ListaNoticias tema={tema} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".pagina {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.letra-grande {\n  font-size: 1.15rem;\n}\n\n.barra {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-family: Georgia, serif;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\n.claro {\n  background: #fffbeb;\n  color: #1c1917;\n}\n\n.oscuro {\n  background: #1c1917;\n  color: #fafaf9;\n}\n\n.noticias {\n  display: grid;\n  gap: 0.5rem;\n}\n\narticle {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\narticle h3 {\n  margin: 0 0 0.4rem;\n  font-family: Georgia, serif;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.pie {\n  margin-top: 0.75rem;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "Portada.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

`Portada`, `ListaNoticias` y `Noticia` reciben `tema` solo para entregárselo al siguiente. Dibujado sobre el árbol:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El tema atraviesa tres componentes que no lo usan",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: tema"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "nota": "← usa tema"
    },
    {
      "nombre": "Portada",
      "nivel": 1,
      "nota": "recibe tema solo para pasarlo"
    },
    {
      "nombre": "ListaNoticias",
      "nivel": 2,
      "nota": "recibe tema solo para pasarlo"
    },
    {
      "nombre": "Noticia",
      "nivel": 3,
      "clave": "1",
      "nota": "recibe tema solo para pasarlo"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 4,
      "nota": "← usa tema"
    },
    {
      "nombre": "Noticia",
      "nivel": 3,
      "clave": "2"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 4,
      "nota": "← usa tema"
    },
    {
      "nombre": "Noticia",
      "nivel": 3,
      "clave": "3"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 4,
      "nota": "← usa tema"
    }
  ]
}
```

A esto se le llama ***prop drilling***: taladrar el árbol con una prop para que llegue hasta abajo. No es un error, y con dos niveles es lo normal. El problema aparece cuando crece:

- Los componentes de en medio **dependen de datos que no les importan**. Si `Noticia` se usa en otra página donde no hay tema, también hay que dárselo.
- Si mañana el botón necesita además el idioma o el usuario, **hay que tocar todos los componentes del camino**.
- Y si el estado está tan arriba porque lo comparten componentes lejanos (lección 25), el camino puede ser muy largo.

## Context en tres pasos

Con un contexto, `BotonGuardar` le pide el tema directamente al árbol, y los de en medio dejan de transportarlo. Se hace en tres pasos:

1. **Crear** el contexto, con `createContext`.
2. **Leerlo** desde los componentes que necesitan el dato, con `useContext`.
3. **Proveerlo** desde el componente que tiene el dato, envolviendo a sus hijos.

### Paso 1: crear el contexto

Un contexto se crea fuera de cualquier componente, normalmente en su propio archivo para poder importarlo desde todos los que lo necesiten:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// TemaContext.js\nimport { createContext } from 'react'\n\nexport const TemaContext = createContext('claro')\n\n// Opcional: el nombre con el que lo enseñan las herramientas\nTemaContext.displayName = 'Tema'",
  "anotaciones": [
    {
      "fragmento": "export const TemaContext",
      "nota": "Se exporta para que lo importen tanto el componente que lo provee como los que lo leen. Tiene que ser el mismo objeto en los dos lados: por eso se crea una vez, fuera de los componentes, y no dentro de uno."
    },
    {
      "fragmento": "createContext('claro')",
      "nota": "El único argumento es el valor por defecto: el que recibe quien lee el contexto si no hay ningún proveedor por encima. Es un último recurso y nunca cambia. Si no hay un valor razonable, se pone null."
    },
    {
      "fragmento": "TemaContext.displayName = 'Tema'",
      "nota": "React no sabe cómo se llama tu variable. Con displayName, el contexto aparece con ese nombre en las React DevTools y en el árbol de renders de esta web. Sin él, sale como Context."
    }
  ]
}
```

El objeto que devuelve `createContext` **no guarda el dato**. Solo representa *qué* contexto es: el tema, y no el idioma ni el usuario. El valor lo pondrá el proveedor.

### Paso 2: leerlo con `useContext`

Cualquier componente que necesite el tema lo lee con el Hook `useContext`, pasándole el contexto. Y los de en medio pierden la prop:

```jsx
import { useContext } from 'react'
import { TemaContext } from './TemaContext'

function BotonGuardar({ titular }) {
  const tema = useContext(TemaContext)
  // ...
}

// Noticia, ListaNoticias y Portada ya no reciben tema
function Noticia({ titular }) {
  // ...
}
```

`useContext` es un Hook, así que se llama en el nivel superior del componente, como `useState` (lección 16). Le dice a React: **este componente quiere leer `TemaContext`**. Pruébalo así, a medio hacer:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Leer un contexto que nadie provee",
  "consigna": "Pulsa «Modo oscuro»: el botón cambia de texto, pero la cabecera y las noticias siguen en claro. Arréglalo en App.jsx envolviendo Cabecera y Portada en <TemaContext value={tema}> ... </TemaContext> y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext, useState } from 'react'\nimport { TemaContext } from './TemaContext'\nimport Portada from './Portada'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tema = useContext(TemaContext)\n  return (\n    <header className={'cabecera ' + tema}>\n      <h1>El Eco del Valle</h1>\n      <p>Diario digital de la comarca</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  const [tema, setTema] = useState('claro')\n\n  // Falta proveer el contexto: envuelve Cabecera y Portada en\n  // <TemaContext value={tema}> ... </TemaContext>\n  return (\n    <div className=\"pagina\">\n      <div className=\"barra\">\n        <button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>\n          {tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}\n        </button>\n      </div>\n      <Cabecera />\n      <Portada />\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "TemaContext.jsx",
      "codigo": "import { createContext } from 'react'\n\nexport const TemaContext = createContext('claro')\nTemaContext.displayName = 'Tema'\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TemaContext } from './TemaContext'\n\nconst NOTICIAS = [\n  { id: 1, titular: 'Reabre el puente romano tras dos años de obras' },\n  { id: 2, titular: 'La feria del queso bate su récord de visitantes' },\n  { id: 3, titular: 'El instituto estrena huerto escolar' },\n]\n\nfunction BotonGuardar({ titular }) {\n  const tema = useContext(TemaContext)\n  return (\n    <button className={tema} aria-label={'Guardar para luego: ' + titular}>\n      Guardar para luego\n    </button>\n  )\n}\n\nfunction Noticia({ titular }) {\n  return (\n    <article>\n      <h3>{titular}</h3>\n      <BotonGuardar titular={titular} />\n    </article>\n  )\n}\n\nfunction ListaNoticias() {\n  return (\n    <div className=\"noticias\">\n      {NOTICIAS.map((noticia) => (\n        <Noticia key={noticia.id} titular={noticia.titular} />\n      ))}\n    </div>\n  )\n}\n\nexport default function Portada() {\n  return (\n    <main>\n      <h2>Portada</h2>\n      <ListaNoticias />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".pagina {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.letra-grande {\n  font-size: 1.15rem;\n}\n\n.barra {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-family: Georgia, serif;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\n.claro {\n  background: #fffbeb;\n  color: #1c1917;\n}\n\n.oscuro {\n  background: #1c1917;\n  color: #fafaf9;\n}\n\n.noticias {\n  display: grid;\n  gap: 0.5rem;\n}\n\narticle {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\narticle h3 {\n  margin: 0 0 0.4rem;\n  font-family: Georgia, serif;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.pie {\n  margin-top: 0.75rem;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Nadie da error: los componentes leen el contexto, pero como **no hay ningún proveedor por encima, reciben el valor por defecto**, `'claro'`, siempre. El estado `tema` de `App` cambia, pero no está conectado con el contexto. Es el paso que falta.

(El archivo se llama `TemaContext.jsx` porque el editor de esta web solo admite `.jsx` y `.css`; en tu proyecto sería `TemaContext.js`.)

### Paso 3: proveerlo con `<TemaContext value={…}>`

Para dar un valor al contexto, el componente que tiene el dato **envuelve a sus hijos con el propio contexto**, usado como componente, y le pasa el valor en la prop `value`:

```jsx
export default function App() {
  const [tema, setTema] = useState('claro')

  return (
    <TemaContext value={tema}>
      <Cabecera />
      <Portada />
    </TemaContext>
  )
}
```

Eso le dice a React: **si algún componente de aquí dentro pide `TemaContext`, dale `tema`**. Y como `tema` es estado, cuando cambia, cambia el valor que reciben todos.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En código anterior a React 19 verás TemaContext.Provider",
  "contenido": "Antes de React 19, el proveedor se escribía <TemaContext.Provider value={tema}>. En React 19 basta con <TemaContext value={tema}>, que es lo que recomienda la documentación. La forma antigua sigue funcionando en 19.3 (TemaContext.Provider es el mismo objeto que TemaContext), así que la reconocerás en cualquier proyecto. La lección 91 repasa esta y otras APIs heredadas."
}
```

El árbol del diario queda así. El proveedor aparece como un nodo más, y los componentes de en medio ya no saben nada del tema:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El tema, provisto una vez y leído donde hace falta",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: tema"
    },
    {
      "nombre": "Tema",
      "nivel": 1,
      "etiqueta": "proveedor",
      "nota": "value = tema"
    },
    {
      "nombre": "Cabecera",
      "nivel": 2,
      "nota": "← useContext(TemaContext)"
    },
    {
      "nombre": "Portada",
      "nivel": 2
    },
    {
      "nombre": "ListaNoticias",
      "nivel": 3
    },
    {
      "nombre": "Noticia",
      "nivel": 4,
      "clave": "1"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 5,
      "nota": "← useContext(TemaContext)"
    },
    {
      "nombre": "Noticia",
      "nivel": 4,
      "clave": "2"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 5,
      "nota": "← useContext(TemaContext)"
    },
    {
      "nombre": "Noticia",
      "nivel": 4,
      "clave": "3"
    },
    {
      "nombre": "BotonGuardar",
      "nivel": 5,
      "nota": "← useContext(TemaContext)"
    }
  ]
}
```

En resumen, la receta completa:

1. `export const MiContexto = createContext(valorPorDefecto)`, en su archivo.
2. `const valor = useContext(MiContexto)` en cada componente que lo necesite, a cualquier profundidad.
3. `<MiContexto value={valor}>` alrededor de la rama que debe recibirlo.

## Qué se vuelve a renderizar cuando cambia el contexto

Ahora el diario funciona con contexto, y además tiene un pie que **siempre** va en oscuro y un botón de «Letra grande» que no tiene nada que ver con el tema. Debajo de la vista previa tienes el panel «Árbol de renders»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El diario con contexto, visto desde el árbol de renders",
  "consigna": "Pulsa «Modo oscuro» y lee el motivo de cada componente en el árbol. Después pulsa «Letra grande» y compara. Fíjate también en el pie: ¿cambia alguna vez de tema?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext, useState } from 'react'\nimport { TemaContext } from './TemaContext'\nimport Portada from './Portada'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tema = useContext(TemaContext)\n  return (\n    <header className={'cabecera ' + tema}>\n      <h1>El Eco del Valle</h1>\n      <p>Diario digital de la comarca</p>\n    </header>\n  )\n}\n\nfunction Pie() {\n  const tema = useContext(TemaContext)\n  return <footer className={'pie ' + tema}>El Eco del Valle · Plaza Mayor, 3 · Pie en tema {tema}</footer>\n}\n\nexport default function App() {\n  const [tema, setTema] = useState('claro')\n  const [letraGrande, setLetraGrande] = useState(false)\n\n  return (\n    <div className={letraGrande ? 'pagina letra-grande' : 'pagina'}>\n      <div className=\"barra\">\n        <button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>\n          {tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}\n        </button>\n        <button onClick={() => setLetraGrande(!letraGrande)}>\n          {letraGrande ? 'Letra normal' : 'Letra grande'}\n        </button>\n      </div>\n      <TemaContext value={tema}>\n        <Cabecera />\n        <Portada />\n        <TemaContext value=\"oscuro\">\n          <Pie />\n        </TemaContext>\n      </TemaContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "TemaContext.jsx",
      "codigo": "import { createContext } from 'react'\n\nexport const TemaContext = createContext('claro')\nTemaContext.displayName = 'Tema'\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TemaContext } from './TemaContext'\n\nconst NOTICIAS = [\n  { id: 1, titular: 'Reabre el puente romano tras dos años de obras' },\n  { id: 2, titular: 'La feria del queso bate su récord de visitantes' },\n  { id: 3, titular: 'El instituto estrena huerto escolar' },\n]\n\nfunction BotonGuardar({ titular }) {\n  const tema = useContext(TemaContext)\n  return (\n    <button className={tema} aria-label={'Guardar para luego: ' + titular}>\n      Guardar para luego\n    </button>\n  )\n}\n\nfunction Noticia({ titular }) {\n  return (\n    <article>\n      <h3>{titular}</h3>\n      <BotonGuardar titular={titular} />\n    </article>\n  )\n}\n\nfunction ListaNoticias() {\n  return (\n    <div className=\"noticias\">\n      {NOTICIAS.map((noticia) => (\n        <Noticia key={noticia.id} titular={noticia.titular} />\n      ))}\n    </div>\n  )\n}\n\nexport default function Portada() {\n  return (\n    <main>\n      <h2>Portada</h2>\n      <ListaNoticias />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".pagina {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.letra-grande {\n  font-size: 1.15rem;\n}\n\n.barra {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-family: Georgia, serif;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\n.claro {\n  background: #fffbeb;\n  color: #1c1917;\n}\n\n.oscuro {\n  background: #1c1917;\n  color: #fafaf9;\n}\n\n.noticias {\n  display: grid;\n  gap: 0.5rem;\n}\n\narticle {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\narticle h3 {\n  margin: 0 0 0.4rem;\n  font-family: Georgia, serif;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.pie {\n  margin-top: 0.75rem;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Al pulsar **«Modo oscuro»**, el árbol cuenta esto:

- `App`: «cambió su estado n.º 1». Tiene dos estados, y el primero es `tema`.
- El nodo **Tema**, con la insignia «proveedor»: es `<TemaContext value={tema}>`, con el nombre que le dio `displayName`. Sus motivos: «cambió la prop «value»» y «cambió la prop «children»», porque `App` ha vuelto a crear los elementos que envuelve. El segundo nodo **Tema**, más abajo, es el proveedor del pie.
- `Cabecera` y cada `BotonGuardar`: **«cambió el contexto «Tema»»**. Son los consumidores, los que llaman a `useContext(TemaContext)`.
- `Portada`, `ListaNoticias` y cada `Noticia`: «se renderizó su padre». No leen el contexto; se renderizan porque `App` lo ha hecho, como siempre (lección 17).
- `Pie`: también «se renderizó su padre», y no «cambió el contexto». Su proveedor más cercano es el de dentro, que dice siempre `"oscuro"`; ese valor no ha cambiado.

Al pulsar **«Letra grande»**, todos se vuelven a renderizar, pero **ninguno dice «cambió el contexto»**: el valor del proveedor sigue siendo el mismo texto, `'oscuro'` o `'claro'`, y React lo compara con `Object.is`. Los consumidores se renderizan solo porque lo hace su padre.

De ahí sale la regla del coste:

> **Cuando cambia el `value` de un proveedor, React vuelve a renderizar todos los componentes que leen ese contexto por debajo de él, estén donde estén.**

Con un tema que cambia una vez por sesión, eso no cuesta nada. Pero hay una trampa en cuanto el valor es un objeto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const [tema, setTema] = useState('claro')\n  const [letraGrande, setLetraGrande] = useState(false)\n\n  return (\n    // Ahora el valor es un objeto, para que los hijos puedan cambiar el tema\n    <TemaContext value={{ tema, setTema }}>\n      {/* ...lo mismo de antes; BotonGuardar hace\n          const { tema } = useContext(TemaContext) */}\n    </TemaContext>\n  )\n}\n\n// Pulsas «Letra grande». ¿Qué motivo da el árbol para BotonGuardar?",
  "opciones": [
    "se renderizó su padre",
    "cambió el contexto «Tema»",
    "Ninguno: sale sin cambios, porque el tema no ha cambiado"
  ],
  "correcta": 1,
  "explicacion": "Cada render de App crea un objeto nuevo en value={{ tema, setTema }}, aunque tema valga lo mismo. Object.is compara referencias, no contenidos (lección 20), así que para React el contexto ha cambiado. Con unos pocos consumidores da igual; con cientos, cada render de App los arrastra a todos. Cómo evitarlo, con useMemo o separando contextos, lo verás en las lecciones 67 y 29."
}
```

### Un detalle que el árbol deja ver: el contexto se salta a los de en medio

En el bloque anterior, `Portada` y las `Noticia` se renderizaban porque el estado vivía en `App`, que lo renderiza todo. ¿Qué pasa si el estado vive en un componente que solo **envuelve** a los demás, con `children` (lección 9)?

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El estado del tema, en un componente que recibe children",
  "consigna": "Pulsa «Modo oscuro» y mira el árbol: ¿qué componentes salen sin cambios? ¿Cuáles se renderizan, y por qué?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TemaContext } from './TemaContext'\nimport ProveedorTema from './ProveedorTema'\nimport Portada from './Portada'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tema = useContext(TemaContext)\n  return (\n    <header className={'cabecera ' + tema}>\n      <h1>El Eco del Valle</h1>\n      <p>Diario digital de la comarca</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  return (\n    <div className=\"pagina\">\n      <ProveedorTema>\n        <Cabecera />\n        <Portada />\n      </ProveedorTema>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ProveedorTema.jsx",
      "codigo": "import { useState } from 'react'\nimport { TemaContext } from './TemaContext'\n\nexport default function ProveedorTema({ children }) {\n  const [tema, setTema] = useState('claro')\n\n  return (\n    <TemaContext value={tema}>\n      <div className=\"barra\">\n        <button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>\n          {tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}\n        </button>\n      </div>\n      {children}\n    </TemaContext>\n  )\n}\n"
    },
    {
      "nombre": "TemaContext.jsx",
      "codigo": "import { createContext } from 'react'\n\nexport const TemaContext = createContext('claro')\nTemaContext.displayName = 'Tema'\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TemaContext } from './TemaContext'\n\nconst NOTICIAS = [\n  { id: 1, titular: 'Reabre el puente romano tras dos años de obras' },\n  { id: 2, titular: 'La feria del queso bate su récord de visitantes' },\n  { id: 3, titular: 'El instituto estrena huerto escolar' },\n]\n\nfunction BotonGuardar({ titular }) {\n  const tema = useContext(TemaContext)\n  return (\n    <button className={tema} aria-label={'Guardar para luego: ' + titular}>\n      Guardar para luego\n    </button>\n  )\n}\n\nfunction Noticia({ titular }) {\n  return (\n    <article>\n      <h3>{titular}</h3>\n      <BotonGuardar titular={titular} />\n    </article>\n  )\n}\n\nfunction ListaNoticias() {\n  return (\n    <div className=\"noticias\">\n      {NOTICIAS.map((noticia) => (\n        <Noticia key={noticia.id} titular={noticia.titular} />\n      ))}\n    </div>\n  )\n}\n\nexport default function Portada() {\n  return (\n    <main>\n      <h2>Portada</h2>\n      <ListaNoticias />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".pagina {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.letra-grande {\n  font-size: 1.15rem;\n}\n\n.barra {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-family: Georgia, serif;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\n.claro {\n  background: #fffbeb;\n  color: #1c1917;\n}\n\n.oscuro {\n  background: #1c1917;\n  color: #fafaf9;\n}\n\n.noticias {\n  display: grid;\n  gap: 0.5rem;\n}\n\narticle {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\narticle h3 {\n  margin: 0 0 0.4rem;\n  font-family: Georgia, serif;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.pie {\n  margin-top: 0.75rem;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "ProveedorTema.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Ahora solo se renderizan `ProveedorTema` («cambió su estado»), el proveedor y los consumidores: `Cabecera` y los tres `BotonGuardar`, con «cambió el contexto «Tema»». `App`, `Portada`, `ListaNoticias` y las `Noticia` salen **sin cambios**.

La clave está en `children`: `<Cabecera />` y `<Portada />` los crea `App`, y `App` no se ha vuelto a renderizar, así que lo que recibe `ProveedorTema` en `children` son exactamente los mismos elementos que en el render anterior. Con los mismos elementos, React no vuelve a ejecutar esa rama. Pero el contexto llega igual a los `BotonGuardar`, aunque sus padres no se hayan movido. **El contexto no baja de padre a hijo como una prop: React busca directamente a los componentes que lo leen.** Este componente proveedor que envuelve `children` es la forma en que organizarás el estado compartido en la lección 29.

## El proveedor más cercano gana

Un componente no lee «el» valor del contexto, sino **el del proveedor más cercano por encima de él**. Por eso el pie del diario iba siempre en oscuro: tiene su propio proveedor en medio, que **sobrescribe** el de fuera para esa parte del árbol.

```jsx
<TemaContext value={tema}>
  <Cabecera />            {/* lee tema */}
  <Portada />             {/* sus BotonGuardar leen tema */}
  <TemaContext value="oscuro">
    <Pie />               {/* lee "oscuro", sea cual sea tema */}
  </TemaContext>
</TemaContext>
```

Se parece mucho a la **herencia de CSS**: si un `div` tiene `color: blue`, todo lo de dentro lo hereda, salvo que un elemento intermedio diga otra cosa. Y como en CSS `color` no pisa a `background-color`, **dos contextos distintos tampoco se pisan**: un `IdiomaContext` y un `TemaContext` son independientes, y un componente puede leer los dos o proveer los dos.

Un mismo componente puede incluso **leer un contexto y proveerlo con otro valor** para lo que tiene dentro. Es lo que hace esta `Seccion`: lee a qué nivel está y les dice a sus hijos que están un nivel más abajo. `Titulo` usa ese nivel para elegir entre `h2`, `h3` o `h4`, así que los encabezados del suplemento salen siempre en orden, sin escribir el nivel a mano:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Títulos que saben a qué nivel están",
  "codigo": "import { createContext, useContext } from 'react'\nimport './estilos.css'\n\nconst NivelContext = createContext(1)\nNivelContext.displayName = 'Nivel'\n\nfunction Seccion({ children }) {\n  const nivel = useContext(NivelContext)\n  return (\n    <section>\n      <NivelContext value={nivel + 1}>{children}</NivelContext>\n    </section>\n  )\n}\n\nfunction Titulo({ children }) {\n  const nivel = useContext(NivelContext)\n  const Etiqueta = 'h' + Math.min(nivel, 6)\n  return <Etiqueta>{children}</Etiqueta>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>El Eco del Valle · Suplemento de fiestas</h1>\n      <Seccion>\n        <Titulo>Fiestas de San Roque</Titulo>\n        <p>Del 14 al 18 de agosto, en la plaza Mayor.</p>\n        <Seccion>\n          <Titulo>Programa del sábado</Titulo>\n          <Seccion>\n            <Titulo>Por la mañana</Titulo>\n            <p>Dianas y pasacalles de gigantes a las 10:00.</p>\n          </Seccion>\n          <Seccion>\n            <Titulo>Por la noche</Titulo>\n            <p>Verbena con la orquesta Mediterráneo.</p>\n          </Seccion>\n        </Seccion>\n      </Seccion>\n      <Seccion>\n        <Titulo>Deportes</Titulo>\n        <p>Torneo de frontón de las peñas.</p>\n      </Seccion>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nsection {\n  margin: 0.4rem 0;\n  padding: 0.2rem 0.8rem;\n  border-left: 3px solid #d6d3d1;\n}\n\nh1,\nh2,\nh3,\nh4 {\n  margin: 0.3rem 0;\n  font-family: Georgia, serif;\n}\n\nh2::before,\nh3::before,\nh4::before {\n  margin-right: 0.4rem;\n  padding: 0 0.3rem;\n  border-radius: 4px;\n  background: #e7e5e4;\n  font-family: ui-monospace, monospace;\n  font-size: 0.75rem;\n  vertical-align: middle;\n}\n\nh2::before {\n  content: 'h2';\n}\n\nh3::before {\n  content: 'h3';\n}\n\nh4::before {\n  content: 'h4';\n}\n\np {\n  margin: 0.2rem 0;\n}",
  "anotaciones": [
    {
      "fragmento": "createContext(1)",
      "nota": "Fuera de cualquier Seccion no hay proveedor, y el nivel es el de por defecto: 1, el del h1 que ya tiene la página. Las secciones de primer nivel empiezan en 2."
    },
    {
      "fragmento": "const nivel = useContext(NivelContext)\n  return (\n    <section>",
      "nota": "Seccion lee el nivel de la sección que la contiene. useContext nunca ve el proveedor que devuelve el propio componente, solo los de más arriba."
    },
    {
      "fragmento": "<NivelContext value={nivel + 1}>{children}</NivelContext>",
      "nota": "Y provee a sus hijos uno más. Cada sección anidada sobrescribe el valor de la de fuera para su rama, y así el número se va acumulando."
    },
    {
      "fragmento": "const Etiqueta = 'h' + Math.min(nivel, 6)",
      "nota": "Titulo elige la etiqueta según el nivel que le llega del proveedor más cercano. Una variable con mayúscula que guarda un texto como h3 se puede usar como etiqueta en JSX (lección 7)."
    },
    {
      "fragmento": "<Titulo>Por la noche</Titulo>",
      "nota": "Nadie le dice a este título que es un h4. Muévelo a otra sección y cambiará de nivel solo: los componentes se adaptan al sitio donde se usan."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Unos encabezados en orden, sin saltos de `h2` a `h4`, son los que permiten a un lector de pantalla navegar el contenido como un índice. Aquí el orden sale solo del anidamiento. Esto es lo que la documentación de React resume como **componentes que se adaptan a su entorno**: se pintan distinto según *dónde* se usan, es decir, según el contexto en que se renderizan.

Y entre el proveedor y quien lo lee puede haber **cualquier cosa**: tus componentes, etiquetas como `section` o `div`, componentes de una librería que no has escrito tú. El contexto los atraviesa a todos sin que tengan que hacer nada.

## Antes de usar contexto

El contexto es tan cómodo que es fácil abusar de él. Que una prop baje varios niveles **no significa** que deba ir en un contexto. La documentación de React propone probar antes dos cosas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de hacer llegar un dato lejos",
  "roles": [
    {
      "etiqueta": "1. Props",
      "rol": "Lo primero, siempre",
      "descripcion": "Pasar una docena de props por varios componentes es pesado, pero deja claro qué componente usa qué dato. Quien mantenga tu código lo agradecerá."
    },
    {
      "etiqueta": "2. children",
      "rol": "Si los de en medio solo transportan",
      "descripcion": "Si un dato atraviesa componentes que no lo usan, quizá falta extraer componentes y pasar JSX como children: el que tiene el dato pinta directamente al que lo necesita."
    },
    {
      "etiqueta": "3. Contexto",
      "rol": "Si nada de lo anterior encaja",
      "descripcion": "Cuando muchos componentes, en distintas partes del árbol y a distintas profundidades, necesitan el mismo dato."
    }
  ]
}
```

La segunda opción es el truco de la `Maquetacion` de la lección 9, aplicado al diario. Si `Portada` y `Noticia` aceptan `children`, es `App` quien coloca los botones, y el tema llega directo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function Portada({ children }) {\n  return (\n    <main>\n      <h2>Portada</h2>\n      <div className=\"noticias\">{children}</div>\n    </main>\n  )\n}\n\nfunction Noticia({ titular, children }) {\n  return (\n    <article>\n      <h3>{titular}</h3>\n      {children}\n    </article>\n  )\n}\n\n// En App, que tiene el tema:\n<Portada>\n  {NOTICIAS.map((noticia) => (\n    <Noticia key={noticia.id} titular={noticia.titular}>\n      <BotonGuardar titular={noticia.titular} tema={tema} />\n    </Noticia>\n  ))}\n</Portada>",
  "anotaciones": [
    {
      "fragmento": "function Portada({ children })",
      "nota": "Portada ya no sabe qué noticias hay ni qué tema se usa: pone su marco y coloca lo que le den. ListaNoticias ni siquiera hace falta."
    },
    {
      "fragmento": "<BotonGuardar titular={noticia.titular} tema={tema} />",
      "nota": "El botón recibe el tema por props, directamente del componente que lo tiene. Cero intermediarios, y el flujo del dato sigue siendo explícito."
    },
    {
      "fragmento": "{children}\n    </article>",
      "nota": "Noticia deja un hueco para lo que quiera ponerle quien la usa: hoy un botón de guardar, mañana uno de compartir, sin cambiar Noticia."
    }
  ]
}
```

Si después de esto el dato sigue haciendo falta en muchos sitios dispersos (cada botón, cada tarjeta, cada campo de formulario de la aplicación), entonces sí: contexto.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El tema visual",
      "texto": "Un proveedor arriba del todo y los componentes que cambian de aspecto lo leen. Para los colores, a menudo basta con una clase en el elemento raíz y variables CSS; el contexto hace falta cuando un componente necesita el valor en su JavaScript, por ejemplo para elegir un icono o los colores de un gráfico."
    },
    {
      "titulo": "La cuenta actual",
      "texto": "Quién ha iniciado sesión lo necesitan la cabecera, los comentarios, el menú... Algunas aplicaciones anidan un segundo proveedor para que una parte de la interfaz actúe con otra cuenta."
    },
    {
      "titulo": "El idioma",
      "texto": "Las librerías de traducción para React suelen guardar el idioma elegido en un contexto, y cada texto de la interfaz lo lee para saber qué cadena mostrar."
    },
    {
      "titulo": "El enrutado",
      "texto": "Los routers guardan la ruta actual en un contexto. Así sabe cada enlace si es el de la página activa. Lo verás con React Router en la lección 76."
    },
    {
      "titulo": "El estado de toda la aplicación",
      "texto": "Un reductor (lección 27) en un componente alto, y su estado y su dispatch repartidos por contexto a quien los necesite. Es la lección 29."
    }
  ]
}
```

### Un contexto que cambia: estado más contexto

El valor de un proveedor no tiene por qué ser fijo. Si le pasas un estado, cada vez que el estado cambia, todos los que leen el contexto reciben el valor nuevo. Y si los de abajo también tienen que **cambiarlo**, se pasa en el `value` la función para hacerlo, junto al dato:

```jsx
export const SesionContext = createContext(null)

export default function App() {
  const [usuario, setUsuario] = useState(null)

  return (
    <SesionContext value={{ usuario, setUsuario }}>
      <Pagina />
    </SesionContext>
  )
}

// En cualquier componente de dentro, a cualquier profundidad:
const { usuario, setUsuario } = useContext(SesionContext)
```

Es la misma idea que levantar el estado (lección 25), con un atajo para hacerlo llegar lejos. El estado sigue viviendo en `App`; el contexto solo lo transporta. Recuerda lo que viste en el árbol: ese objeto se crea de nuevo en cada render de `App`. Lo practicarás en el ejercicio.

### Leer un contexto con `use`

React 19 tiene otra forma de leer un contexto: `use(TemaContext)`, la API que verás a fondo en la lección 49. Devuelve lo mismo que `useContext`, el valor del proveedor más cercano, con una diferencia: **se puede llamar dentro de un `if` o de un bucle**, cosa que un Hook no permite. En el resto de casos, `useContext` sigue siendo lo habitual.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Context es una forma de gestionar el estado, como Redux",
      "realidad": "Context transporta un valor; no lo guarda ni lo actualiza. El estado sigue viviendo en un useState o un useReducer de algún componente, y el contexto lo hace llegar lejos. Las librerías de estado tienen su lección, la 75."
    },
    {
      "mito": "El valor por defecto es el valor inicial del contexto",
      "realidad": "Es lo que reciben los componentes que no tienen ningún proveedor por encima, y nunca cambia. En cuanto hay un proveedor, manda su value, aunque sea undefined."
    },
    {
      "mito": "Con contexto solo se vuelven a renderizar los componentes que lo leen",
      "realidad": "Los que lo leen se renderizan cuando cambia el valor. Pero si el estado vive en un componente que renderiza a todos los demás, su rama entera se renderiza igual que siempre, como viste con Portada y Noticia."
    },
    {
      "mito": "Con contexto ya no hacen falta las props",
      "realidad": "Las props siguen siendo la forma normal de pasar datos, y la más fácil de seguir. El contexto es para datos que necesitan muchos componentes lejanos."
    }
  ]
}
```

## Errores típicos

**Proveer y leer en el mismo componente.** `useContext` busca hacia arriba desde el componente que lo llama, y **no tiene en cuenta los proveedores que ese mismo componente devuelve**:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const TemaContext = createContext('claro')\n\nexport default function App() {\n  const tema = useContext(TemaContext)\n\n  return (\n    <TemaContext value=\"oscuro\">\n      <p>El diario se ve en tema {tema}</p>\n    </TemaContext>\n  )\n}\n\n// ¿Qué dice el párrafo?",
  "opciones": [
    "El diario se ve en tema oscuro",
    "El diario se ve en tema claro",
    "El diario se ve en tema undefined",
    "Nada: useContext no se puede usar en el componente que provee"
  ],
  "correcta": 1,
  "explicacion": "App lee el contexto antes de devolver el proveedor, y por encima de App no hay ninguno: recibe el valor por defecto, claro. El proveedor oscuro solo vale para los componentes de dentro. Si el párrafo fuera un componente aparte que llama a useContext, leería oscuro."
}
```

**Olvidar `value`, o escribirlo con otro nombre.** `<TemaContext>` sin `value`, o con `<TemaContext tema={tema}>`, es como escribir `value={undefined}`: los componentes de dentro reciben `undefined`, **no** el valor por defecto, porque sí hay un proveedor. React avisa en la consola, y el aviso sigue nombrando la forma antigua, `Context.Provider`:

```text
The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?
```

Es decir: la prop `value` es obligatoria en el proveedor; ¿la has escrito mal o se te ha olvidado?

**Leer un contexto que nadie provee, sin darte cuenta.** Lo viste en el paso 2: todo funciona, pero con el valor por defecto, y nada avisa. Si un contexto no tiene un valor por defecto que tenga sentido, créalo con `null`; así, usarlo fuera de su proveedor acaba en un error en vez de en un comportamiento raro. Un patrón muy extendido va más allá: envolver `useContext` en un Hook propio que compruebe el `null` y lance un error que explique qué falta. Lo propone el reto 2 del final.

**Crear el contexto dentro de un componente.** `const TemaContext = createContext('claro')` dentro de `App` crea un contexto distinto en cada render, y ningún otro archivo puede importarlo. Los contextos se crean una vez, fuera de los componentes, y se exportan. Por la misma razón, si tu herramienta de build acabara cargando dos copias del módulo, el proveedor y los lectores tendrían objetos distintos y no se encontrarían.

**Intentar cambiar el valor por defecto para cambiar el contexto.** El argumento de `createContext` no cambia nunca. Para que el valor cambie con el tiempo, hace falta un estado y un proveedor que lo pase, como en el diario.

**Usarlo para todo.** Meter en un contexto cualquier dato que baje dos niveles hace el código más difícil de seguir: ya no se ve en el JSX quién depende de qué. Props primero, `children` después, contexto al final.

## Ejercicios

En La Despensa, un recetario que escribe la comunidad, la cabecera ya sabe quién ha entrado: `App` le pasa el usuario por props. Pero los comentarios y el botón de cerrar sesión están dentro de `Receta`, y de momento no se enteran de nada. El contexto ya está creado en `SesionContext.jsx`; falta proveerlo y leerlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La sesión del recetario, por contexto",
  "consigna": "Provee SesionContext en App con value={{ usuario, setUsuario }}. Después léelo con useContext en Comentarios.jsx y en BotonSalir.jsx, que ahora tienen const usuario = null, y haz que «Cerrar sesión» la cierre. Receta no debe recibir ninguna prop. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Receta from './Receta'\nimport './estilos.css'\n\nfunction Cabecera({ usuario, onEntrar }) {\n  return (\n    <header className=\"cabecera\">\n      <p className=\"marca\">La Despensa · recetas de la comunidad</p>\n      {usuario ? (\n        <p>Hola, {usuario.nombre}</p>\n      ) : (\n        <button onClick={onEntrar}>Entrar como Marta</button>\n      )}\n    </header>\n  )\n}\n\nexport default function App() {\n  const [usuario, setUsuario] = useState(null)\n\n  // Los comentarios y el botón de cerrar sesión, dentro de Receta,\n  // también necesitan usuario y setUsuario\n  return (\n    <>\n      <Cabecera usuario={usuario} onEntrar={() => setUsuario({ nombre: 'Marta' })} />\n      <Receta />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "SesionContext.jsx",
      "codigo": "import { createContext } from 'react'\n\n// Guardará { usuario, setUsuario }. Sin proveedor por encima, vale null.\nexport const SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n"
    },
    {
      "nombre": "Receta.jsx",
      "codigo": "import Comentarios from './Comentarios'\nimport BotonSalir from './BotonSalir'\n\nexport default function Receta() {\n  return (\n    <main>\n      <article>\n        <h1>Pisto manchego</h1>\n        <p>Para 4 personas · 1 hora</p>\n        <h2>Ingredientes</h2>\n        <ul>\n          <li>2 calabacines</li>\n          <li>1 pimiento rojo y 1 verde</li>\n          <li>1 cebolla</li>\n          <li>800 g de tomate triturado</li>\n        </ul>\n        <Comentarios />\n      </article>\n      <footer className=\"pie\">\n        <BotonSalir />\n      </footer>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Comentarios.jsx",
      "codigo": "const COMENTARIOS = [\n  { id: 1, autor: 'Luis', texto: 'Con un huevo frito encima, de diez.' },\n  { id: 2, autor: 'Carmen', texto: 'Yo añado una pizca de azúcar al tomate.' },\n]\n\nexport default function Comentarios() {\n  // Lee aquí la sesión del contexto\n  const usuario = null\n\n  return (\n    <section aria-labelledby=\"titulo-comentarios\">\n      <h2 id=\"titulo-comentarios\">Comentarios</h2>\n      <ul>\n        {COMENTARIOS.map((c) => (\n          <li key={c.id}>\n            <strong>{c.autor}:</strong> {c.texto}\n          </li>\n        ))}\n      </ul>\n      {usuario ? (\n        <button>Comentar como {usuario.nombre}</button>\n      ) : (\n        <p>Inicia sesión para comentar</p>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "BotonSalir.jsx",
      "codigo": "export default function BotonSalir() {\n  // Lee aquí la sesión del contexto: este botón solo se ve\n  // con la sesión iniciada, y al pulsarlo la cierra\n  const usuario = null\n\n  if (!usuario) return null\n\n  return <button>Cerrar sesión</button>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.5rem 0.8rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera p {\n  margin: 0;\n}\n\n.marca {\n  font-weight: 700;\n}\n\nh1 {\n  font-size: 1.4rem;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\n.pie {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #d6d3d1;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Entrar como Marta», la cabecera saluda «Hola, Marta»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Marta"
          }
        }
      ],
      "espera": {
        "texto": "Hola, Marta"
      }
    },
    {
      "descripcion": "Con la sesión iniciada, los comentarios ofrecen el botón «Comentar como Marta»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Marta"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Comentar como Marta"
      }
    },
    {
      "descripcion": "«Cerrar sesión», al pie de la receta, vuelve a mostrar «Entrar como Marta»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cerrar sesión"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Entrar como Marta"
      }
    },
    {
      "descripcion": "Al cerrar la sesión, los comentarios vuelven a pedir «Inicia sesión para comentar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cerrar sesión"
          }
        }
      ],
      "espera": {
        "texto": "Inicia sesión para comentar"
      }
    },
    {
      "descripcion": "Sin la sesión iniciada no aparece el botón «Cerrar sesión»",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Cerrar sesión"
        }
      }
    }
  ]
}
```

Si lees el contexto antes de proveerlo, la vista previa se para con un error que en Chrome dice «Cannot destructure property 'usuario' of '…' as it is null» (cada navegador lo redacta a su manera): el valor por defecto es `null`, y `null` no se puede desestructurar. Es justo lo que se busca al crear el contexto con `null`: que olvidarse del proveedor no pase desapercibido.

Fíjate en lo que ha cambiado: `Receta` sigue sin recibir ninguna prop, y aun así sus hijos saben quién ha entrado y pueden cerrar la sesión. La cabecera sigue con props, y está bien: es hija directa de `App`.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que la cabecera del recetario también lea la sesión del contexto, quítale todas las props y comprueba que sigue funcionando.
2. Escribe un Hook propio, `useSesion()`, que llame a `useContext(SesionContext)` y lance un error con un mensaje claro si el valor es `null`. Úsalo en los tres consumidores. Los Hooks propios tienen su lección, la 43.
3. En el diario, añade un segundo contexto, `TamanoContext`, para la letra grande, y haz que solo lo lea `Noticia`. Pulsa los dos botones y comprueba en el árbol que cada contexto avisa solo a sus lectores.
4. En el suplemento de fiestas, haz que `Titulo` lance un error si se usa fuera de cualquier `Seccion`. Pista: cambia el valor por defecto de `NivelContext` para poder distinguir ese caso.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Passing Data Deeply with Context",
      "descripcion": "La página de react.dev en la que se basa esta lección: el prop drilling, los tres pasos, los títulos anidados, qué probar antes y los casos de uso.",
      "url": "https://react.dev/learn/passing-data-deeply-with-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useContext",
      "descripcion": "La referencia del Hook: el proveedor más cercano, actualizar un contexto con estado, sobrescribirlo en una parte del árbol y los problemas más habituales.",
      "url": "https://react.dev/reference/react/useContext",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "createContext",
      "descripcion": "Qué devuelve createContext, el valor por defecto, el proveedor de React 19 frente a Context.Provider, y Context.Consumer, la forma antigua de leer.",
      "url": "https://react.dev/reference/react/createContext",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use",
      "descripcion": "La API que lee un contexto, o una promesa, y que se puede llamar dentro de condiciones. Es la lección 49.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Scaling Up with Reducer and Context",
      "descripcion": "El siguiente paso: un reductor y dos contextos para repartir estado y dispatch por toda la aplicación. Es la lección 29.",
      "url": "https://react.dev/learn/scaling-up-with-reducer-and-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Inheritance",
      "descripcion": "Cómo heredan los elementos algunas propiedades de su padre, la analogía con la que react.dev explica el contexto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Inheritance",
      "etiqueta": "MDN"
    }
  ]
}
```
