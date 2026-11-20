import { ArbolDeComponentes } from '@/components/bloques-laboratorio/ArbolDeComponentes'
import { CompiladorReact } from '@/components/bloques-laboratorio/CompiladorReact'
import { ReactAnotado } from '@/components/bloques-laboratorio/ReactAnotado'
import { ReactEnVivo } from '@/components/bloques-laboratorio/ReactEnVivo'
import codigoEjemploCompilador from '@/lib/react-kit/__fixtures__/compilador-app.jsx?raw'

import { Referencia } from '@/routes/referencia-contenido/Referencia'

export function EjemplosReactEnVivo() {
  return (
    <>
      <Referencia nombre="ReactAnotado">
        <ReactAnotado
          tipo="react-anotado"
          codigo={
            "const tareas = [\n  { id: 1, texto: 'Leer' },\n  { id: 2, texto: 'Correr' },\n]\n\nexport default function App() {\n  console.log('render App')\n  return (\n    <ul>\n      {tareas.map((tarea) => (\n        <li key={tarea.id}>{tarea.texto}</li>\n      ))}\n    </ul>\n  )\n}"
          }
          css=""
          anotaciones={[
            { fragmento: 'tareas.map', nota: 'map convierte cada dato en un elemento.' },
            {
              fragmento: 'key={tarea.id}',
              nota: 'La key le dice a React qué fila es cuál entre renders.',
            },
          ]}
          strictMode
          mostrarConsola
        />
      </Referencia>

      <Referencia nombre="ReactEnVivo">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Lista de tareas"
          consigna="Añade tareas a la lista. Después haz que el campo se vacíe al añadir y pulsa «Comprobar»."
          archivos={[
            {
              nombre: 'App.jsx',
              codigo:
                "import { useState } from 'react'\nimport Tarjeta from './Tarjeta'\nimport './estilos.css'\n\nexport default function App() {\n  const [tareas, setTareas] = useState(['Leer', 'Correr'])\n  const [nueva, setNueva] = useState('')\n\n  function anadir() {\n    if (!nueva) return\n    setTareas([...tareas, nueva])\n  }\n\n  return (\n    <main>\n      <label>\n        Nueva tarea <input value={nueva} onChange={(e) => setNueva(e.target.value)} />\n      </label>\n      <button onClick={anadir}>Añadir</button>\n      <ul>\n        {tareas.map((tarea) => (\n          <Tarjeta key={tarea} texto={tarea} />\n        ))}\n      </ul>\n    </main>\n  )\n}",
            },
            {
              nombre: 'Tarjeta.jsx',
              codigo:
                'export default function Tarjeta({ texto }) {\n  return <li className="tarjeta">{texto}</li>\n}',
            },
            {
              nombre: 'estilos.css',
              codigo: 'main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  padding: 4px 0;\n}',
            },
          ]}
          strictMode
          mostrarConsola
          mostrarJsGenerado
          comprobaciones={[
            {
              descripcion: 'Al añadir una tarea, aparece en la lista',
              pasos: [
                { escribir: { etiqueta: 'Nueva tarea', texto: 'Comprar pan' } },
                { pulsar: { rol: 'button', nombre: 'Añadir' } },
              ],
              espera: { rol: 'listitem', texto: 'Comprar pan' },
            },
            {
              descripcion: 'El campo se vacía después de añadir',
              pasos: [
                { escribir: { etiqueta: 'Nueva tarea', texto: 'Comprar pan' } },
                { pulsar: { rol: 'button', nombre: 'Añadir' } },
              ],
              espera: { etiqueta: 'Nueva tarea', valor: '' },
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="ReactEnVivoTsx">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Contador con props tipadas"
          consigna="Suma una unidad y observa que React se ejecuta aunque el panel de tipos detecte errores durante la edición."
          archivos={[
            {
              nombre: 'App.tsx',
              codigo:
                "import { useState } from 'react'\nimport Tarjeta from './Tarjeta'\n\nexport default function App() {\n  const [total, setTotal] = useState<number>(1)\n  return <Tarjeta titulo=\"Artículos\" total={total} onSumar={() => setTotal(total + 1)} />\n}",
            },
            {
              nombre: 'Tarjeta.tsx',
              codigo:
                'interface Props {\n  titulo: string\n  total: number\n  onSumar: () => void\n}\n\nexport default function Tarjeta({ titulo, total, onSumar }: Props) {\n  return (\n    <section>\n      <h2>{titulo}</h2>\n      <button onClick={onSumar}>Total: {total}</button>\n    </section>\n  )\n}',
            },
          ]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado
          exigirTiposCorrectos
          comprobaciones={[
            {
              descripcion: 'El contador suma una unidad',
              pasos: [{ pulsar: { rol: 'button', nombre: 'Total: 1' } }],
              espera: { texto: 'Total: 2' },
            },
          ]}
          etiquetaSeccion="React en vivo — TSX"
        />
      </Referencia>

      <Referencia nombre="ReactEnVivoRouter">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="React Router con loaders y actions"
          consigna="Navega entre el inicio y las recetas, añade una y prueba la recarga en memoria."
          archivos={[
            {
              nombre: 'App.tsx',
              codigo:
                "import { createMemoryRouter, Form, Link, Outlet, useLoaderData } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\ntype Receta = { id: number; nombre: string }\n\nasync function loaderRaiz() {\n  return { seccion: 'recetario' }\n}\n\nasync function loader() {\n  const respuesta = await fetch('/api/recetas')\n  return respuesta.json() as Promise<Receta[]>\n}\n\nasync function action({ request }: { request: Request }) {\n  const datos = await request.formData()\n  await fetch('/api/recetas', {\n    method: 'POST',\n    body: JSON.stringify({ nombre: datos.get('nombre') }),\n  })\n  return null\n}\n\nfunction Inicio() {\n  return <main><h1>Recetario</h1><Link to=\"/recetas\">Ver recetas</Link></main>\n}\n\nfunction Recetas() {\n  const recetas = useLoaderData<typeof loader>()\n  return (\n    <main>\n      <h1>Recetas</h1>\n      <ul>{recetas.map((receta) => <li key={receta.id}>{receta.nombre}</li>)}</ul>\n      <Form method=\"post\"><label>Nueva receta <input name=\"nombre\" /></label><button>Guardar</button></Form>\n      <Link to=\"/\">Inicio</Link>\n    </main>\n  )\n}\n\nconst router = createMemoryRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    loader: loaderRaiz,\n    shouldRevalidate: ({ formMethod, defaultShouldRevalidate }) =>\n      formMethod === 'POST' ? false : defaultShouldRevalidate,\n    Component: Outlet,\n    children: [\n      { index: true, Component: Inicio },\n      { id: 'recetas', path: 'recetas', loader, action, Component: Recetas },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}",
            },
          ]}
          urlInicial="/"
          strictMode
          mostrarConsola
          mostrarRouter
          mostrarJsGenerado={false}
          api={{ recetas: [{ id: 1, nombre: 'Migas' }, { id: 2, nombre: 'Pisto' }] }}
          red={{ latencia: 300, desordenar: false }}
          comprobaciones={[
            {
              descripcion: 'Navega a la lista de recetas',
              pasos: [{ navegar: '/recetas' }],
              espera: { url: '/recetas' },
            },
            {
              descripcion: 'Recargar conserva la página actual',
              urlInicial: '/recetas',
              pasos: [{ recargar: true }],
              espera: { texto: 'Migas' },
            },
          ]}
          etiquetaSeccion="React en vivo — React Router"
          etiquetaPanelTipos="Errores de tipos de React Router"
        />
      </Referencia>
    </>
  )
}

export function EjemplosReactHerramientas() {
  return (
    <>
      <Referencia nombre="ReactAnotadoRouter">
        <ReactAnotado
          tipo="react-anotado"
          titulo="El alias de BrowserRouter en la vista previa"
          codigo={
            "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\nconst router = createBrowserRouter([\n  { path: '/', Component: () => <h1>Inicio</h1> },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}"
          }
          css=""
          anotaciones={[
            {
              fragmento: 'createBrowserRouter',
              nota: 'En la vista previa usa un historial en memoria; en un proyecto real usa la dirección del navegador.',
            },
          ]}
          lenguaje="tsx"
          strictMode
          mostrarConsola
          etiquetaSeccion="React anotado — React Router"
        />
      </Referencia>

      <Referencia nombre="ReactEnVivoLint">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Un efecto que el linter rechaza"
          consigna="Corrige la actualización síncrona de estado y declara la dependencia que falta; después pulsa «Comprobar»."
          archivos={[
            {
              nombre: 'App.jsx',
              codigo:
                "import { useEffect, useState } from 'react'\n\nfunction Saludo({ nombre }) {\n  const [mensaje, setMensaje] = useState('')\n\n  useEffect(() => {\n    setMensaje('Hola ' + nombre)\n  }, [])\n\n  return <p>{mensaje}</p>\n}\n\nexport default function App() {\n  return <Saludo nombre=\"Ada\" />\n}",
            },
          ]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado={false}
          mostrarLint
          exigirLintLimpio
          comprobaciones={[
            {
              descripcion: 'Muestra el saludo',
              pasos: [],
              espera: { texto: 'Hola Ada' },
            },
          ]}
          etiquetaSeccion="React en vivo — linter"
        />
      </Referencia>

      <Referencia nombre="CompiladorReact">
        <CompiladorReact
          tipo="compilador-react"
          titulo="El mismo componente, compilado"
          consigna="Edita el código y compara la salida y el informe real de React Compiler."
          codigo={codigoEjemploCompilador}
        />
      </Referencia>

      <Referencia nombre="ReactEnVivoCompilador">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Los mismos clics, menos renders"
          consigna="Pulsa el contador: React Compiler conserva las filas y el árbol las marca sin cambios."
          archivos={[{ nombre: 'App.jsx', codigo: codigoEjemploCompilador }]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado
          mostrarArbol
          compilador
          etiquetaSeccion="React en vivo — compilador y árbol"
        />
      </Referencia>

      <Referencia nombre="PanelRed">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="API simulada: recetas"
          consigna="Escribe deprisa en el buscador para ver cómo cada búsqueda cancela la petición anterior. Prueba también la latencia, el orden y el siguiente fallo."
          archivos={[
            {
              nombre: 'App.jsx',
              codigo:
                "import { useEffect, useState } from 'react'\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('')\n  const [recetas, setRecetas] = useState([])\n  const [error, setError] = useState('')\n\n  useEffect(() => {\n    const control = new AbortController()\n    setError('')\n    fetch('/api/recetas?q=' + encodeURIComponent(busqueda), { signal: control.signal })\n      .then((respuesta) => {\n        if (!respuesta.ok) throw new Error('No se pudieron cargar las recetas')\n        return respuesta.json()\n      })\n      .then(setRecetas)\n      .catch((fallo) => {\n        if (fallo.name !== 'AbortError') setError(fallo.message)\n      })\n    return () => control.abort()\n  }, [busqueda])\n\n  return (\n    <main>\n      <label>\n        Buscar recetas\n        <input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />\n      </label>\n      {error && <p role=\"alert\">{error}</p>}\n      <ul>{recetas.map((receta) => <li key={receta.id}>{receta.nombre}</li>)}</ul>\n    </main>\n  )\n}",
            },
          ]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado={false}
          api={{
            recetas: [
              { id: 1, nombre: 'Salmorejo', tiempo: 20 },
              { id: 2, nombre: 'Pisto manchego', tiempo: 45 },
              { id: 3, nombre: 'Tortilla de patatas', tiempo: 35 },
            ],
          }}
          red={{ latencia: 600, desordenar: false }}
          etiquetaSeccion="React en vivo — panel de red"
        />
      </Referencia>
    </>
  )
}

export function EjemplosReactRenders() {
  return (
    <>
      <Referencia nombre="RegistroEfectos">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Línea de tiempo de efectos"
          consigna="Cambia de sala y oculta el chat para ver el montaje, las dependencias y las limpiezas, incluida la repetición de StrictMode."
          archivos={[
            {
              nombre: 'App.jsx',
              codigo:
                "import { useEffect, useState } from 'react'\n\nfunction useConexion(sala) {\n  useEffect(() => {\n    return () => {}\n  }, [sala])\n}\n\nfunction Chat({ sala }) {\n  useConexion(sala)\n  useEffect(() => {\n    document.title = sala\n  }, [sala])\n  return <p>Sala {sala}</p>\n}\n\nexport default function App() {\n  const [sala, setSala] = useState('general')\n  const [ver, setVer] = useState(true)\n  return (\n    <main>\n      <button onClick={() => setSala('viaje')}>Viaje</button>\n      <button onClick={() => setVer(false)}>Ocultar</button>\n      {ver && <Chat sala={sala} />}\n    </main>\n  )\n}",
            },
          ]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado={false}
          mostrarEfectos
          etiquetaSeccion="React en vivo — registro de efectos"
        />
      </Referencia>

      <Referencia nombre="ArbolDeRenders">
        <ReactEnVivo
          tipo="react-en-vivo"
          titulo="Qué se vuelve a renderizar"
          consigna="Pulsa «Sumar» y después «Añadir». En el árbol verás qué componentes se ejecutan en cada commit y por qué, y en la vista previa, qué cambia de verdad en el DOM."
          archivos={[
            {
              nombre: 'App.jsx',
              codigo:
                "import { memo, useState } from 'react'\n\nfunction Cabecera() {\n  return <h2>Lista de la compra</h2>\n}\n\nfunction Producto({ nombre }) {\n  return <li>{nombre}</li>\n}\n\nconst Pie = memo(function Pie() {\n  return <p>Pie con memo</p>\n})\n\nfunction Contador() {\n  const [veces, setVeces] = useState(0)\n  return <button onClick={() => setVeces(veces + 1)}>Sumar ({veces})</button>\n}\n\nexport default function App() {\n  const [productos, setProductos] = useState(['Pan', 'Leche'])\n\n  return (\n    <main>\n      <Cabecera />\n      <ul>\n        {productos.map((producto) => (\n          <Producto key={producto} nombre={producto} />\n        ))}\n      </ul>\n      <button onClick={() => setProductos([...productos, 'Huevos ' + productos.length])}>Añadir</button>\n      <Contador />\n      <Pie />\n    </main>\n  )\n}",
            },
          ]}
          strictMode
          mostrarConsola={false}
          mostrarJsGenerado={false}
          mostrarArbol
          etiquetaSeccion="React en vivo — árbol de renders"
        />
      </Referencia>

      <Referencia nombre="ArbolDeComponentes">
        <ArbolDeComponentes
          tipo="arbol-de-componentes"
          titulo="El estado, levantado a App"
          nodos={[
            { nombre: 'App', nivel: 0, etiqueta: 'estado: tareas', estado: 'renderizado' },
            { nombre: 'Formulario', nivel: 1, estado: 'renderizado', nota: '← llama a onAnadir(tarea)' },
            { nombre: 'Lista', nivel: 1, estado: 'renderizado', nota: '← recibe tareas por props' },
            { nombre: 'Tarea', nivel: 2, clave: 'pan', estado: 'renderizado' },
            { nombre: 'Tarea', nivel: 2, clave: 'leche', estado: 'montado' },
            { nombre: 'Pie', nivel: 1, estado: 'sin-cambios' },
          ]}
        />
      </Referencia>
    </>
  )
}
