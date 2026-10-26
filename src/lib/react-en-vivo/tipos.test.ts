import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'

import {
  crearEntornoTiposReact,
  crearSesionTiposReact,
  diagnosticarTiposReact,
} from './tipos'

async function cargarDesdeDisco(rutaPublica: string): Promise<string> {
  return readFile(join(process.cwd(), 'public', rutaPublica.replace(/^\//, '')), 'utf8')
}

const app = (codigo: string, extras: ArchivoReact[] = []): ArchivoReact[] => [
  { nombre: 'App.tsx', codigo },
  ...extras,
]

describe('diagnosticarTiposReact', () => {
  it('un App.tsx con createMemoryRouter, RouterProvider de react-router/dom y useLoaderData<typeof loader> no tiene errores', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { createMemoryRouter, useLoaderData } from 'react-router'
import { RouterProvider } from 'react-router/dom'
type Usuario = { nombre: string }
export async function loader(): Promise<Usuario> { return { nombre: 'Ada' } }
function Inicio() { const usuario = useLoaderData<typeof loader>(); return <p>{usuario.nombre}</p> }
const router = createMemoryRouter([{ path: '/', loader, Component: Inicio }])
export default function App() { return <RouterProvider router={router} /> }`),
      cargarDesdeDisco,
    )
    expect(diagnosticos).toEqual([])
  })

  it('params.id es string | undefined: asignarlo a un string da error', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import type { LoaderFunctionArgs } from 'react-router'
export function loader({ params }: LoaderFunctionArgs) { const id: string = params.id; return id }
export default function App() { return <p /> }`),
      cargarDesdeDisco,
    )
    expect(diagnosticos.map((d) => d.mensaje)).toContain(
      "Type 'string | undefined' is not assignable to type 'string'.\n  Type 'undefined' is not assignable to type 'string'.",
    )
  })

  it('createContext<Usuario>: un set con otro tipo da error', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { createContext, RouterContextProvider } from 'react-router'
type Usuario = { nombre: string }
const contexto = createContext<Usuario>()
new RouterContextProvider().set(contexto, 123)
export default function App() { return <p /> }`),
      cargarDesdeDisco,
    )
    expect(diagnosticos.map((d) => d.mensaje)).toContain(
      "Argument of type 'number' is not assignable to parameter of type 'Usuario'.",
    )
  })

  it('useLoaderData<typeof loader> conoce las propiedades', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { useLoaderData } from 'react-router'
type Usuario = { nombre: string }
export async function loader(): Promise<Usuario> { return { nombre: 'Ada' } }
export default function App() { const usuario = useLoaderData<typeof loader>(); return <p>{usuario.apellido}</p> }`),
      cargarDesdeDisco,
    )
    expect(diagnosticos.map((d) => d.mensaje)).toContain(
      "Property 'apellido' does not exist on type 'Usuario'.",
    )
  })

  it('sin importar react-router no pide tipos.json', async () => {
    const cargarArchivo = vi.fn(cargarDesdeDisco)
    await crearSesionTiposReact(cargarArchivo).diagnosticar(
      app("import { useState } from 'react'\nexport default function App() { const [n] = useState(0); return <p>{n}</p> }"),
    )
    expect(cargarArchivo).not.toHaveBeenCalledWith(
      '/vendor/react-en-vivo/react-router/8.5.0/tipos.json',
    )
  })

  it('un import type de react-router también carga sus tipos', async () => {
    const cargarArchivo = vi.fn(cargarDesdeDisco)
    await crearSesionTiposReact(cargarArchivo).diagnosticar(
      app("import type { Params } from 'react-router'\nconst params: Params = {}\nexport default function App() { return <p>{Object.keys(params).length}</p> }"),
    )
    expect(cargarArchivo).toHaveBeenCalledWith(
      '/vendor/react-en-vivo/react-router/8.5.0/tipos.json',
    )
  })

  it('pide tipos.json una sola vez por sesión', async () => {
    const cargarArchivo = vi.fn(cargarDesdeDisco)
    const sesion = crearSesionTiposReact(cargarArchivo)
    const codigo = "import type { Params } from 'react-router'\nconst params: Params = {}\nexport default function App() { return <p>{Object.keys(params).length}</p> }"
    await sesion.diagnosticar(app(codigo))
    await sesion.diagnosticar(app(codigo.replace('params).length', 'params).length + 1')))
    expect(
      cargarArchivo.mock.calls.filter(([ruta]) => ruta.endsWith('/react-router/8.5.0/tipos.json')),
    ).toHaveLength(1)
  })

  it('un tipos.json con otra versión o mal formado da un error, y la sesión se recupera con uno bueno', async () => {
    const tiposBuenos = await cargarDesdeDisco('/vendor/react-en-vivo/react-router/8.5.0/tipos.json')
    let intento = 0
    const cargarArchivo = vi.fn(async (ruta: string) => {
      if (!ruta.endsWith('/tipos.json')) return cargarDesdeDisco(ruta)
      intento += 1
      if (intento === 1) return JSON.stringify({ version: '8.4.0', archivos: {} })
      if (intento === 2) return JSON.stringify({ version: '8.5.0', archivos: { '../fuera.d.ts': 'x' } })
      return tiposBuenos
    })
    const codigo = "import type { Params } from 'react-router'\nconst params: Params = {}\nexport default function App() { return <p>{Object.keys(params).length}</p> }"

    await expect(crearSesionTiposReact(cargarArchivo).diagnosticar(app(codigo))).rejects.toThrow(
      'Los tipos de React Router no tienen el formato esperado',
    )
    await expect(crearSesionTiposReact(cargarArchivo).diagnosticar(app(codigo))).rejects.toThrow(
      'Los tipos de React Router no tienen el formato esperado',
    )
    await expect(crearSesionTiposReact(cargarArchivo).diagnosticar(app(codigo))).resolves.toEqual([])
  })

  it('un App.tsx correcto con tipos de React no produce diagnósticos', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { useState } from 'react'
export default function App() {
  const [n, setN] = useState<number>(0)
  return <button onClick={() => setN(n + 1)}>Total: {n}</button>
}`),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('detecta el tipo incorrecto pasado a setState', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { useState } from 'react'
export default function App() {
  const [n, setN] = useState<number>(0)
  setN('a')
  return <p>{n}</p>
}`),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toContainEqual(
      expect.objectContaining({
        archivo: 'App.tsx',
        linea: 4,
        mensaje: "Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.",
        severidad: 'error',
      }),
    )
  })

  it('atribuye a App.tsx una prop requerida que falta en Tarjeta', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(
        `import Tarjeta from './Tarjeta'
export default function App() {
  return <Tarjeta />
}`,
        [
          {
            nombre: 'Tarjeta.tsx',
            codigo: `interface Props { titulo: string }
export default function Tarjeta({ titulo }: Props) { return <h2>{titulo}</h2> }`,
          },
        ],
      ),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toContainEqual(
      expect.objectContaining({
        archivo: 'App.tsx',
        linea: 3,
        mensaje: expect.stringContaining("Property 'titulo' is missing"),
        severidad: 'error',
      }),
    )
  })

  it("resuelve import './Tarjeta' hacia Tarjeta.tsx", async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(
        `import Tarjeta from './Tarjeta'
export default function App() { return <Tarjeta titulo="Hola" /> }`,
        [
          {
            nombre: 'Tarjeta.tsx',
            codigo: `interface Props { titulo: string }
export default function Tarjeta({ titulo }: Props) { return <h2>{titulo}</h2> }`,
          },
        ],
      ),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('admite un archivo TSX vacío sin tumbar el análisis', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app('export default function App() { return <p>Hola</p> }', [
        { nombre: 'Tarjeta.tsx', codigo: '' },
      ]),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('ignora imports CSS de efecto lateral', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app("import './estilos.css'\nexport default function App() { return <p>Hola</p> }", [
        { nombre: 'estilos.css', codigo: 'p { color: red }' },
      ]),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('resuelve un import sin extensión hacia un archivo JSX sin comprobar su JavaScript', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(
        "import Boton from './Boton'\nexport default function App() { return <Boton /> }",
        [{ nombre: 'Boton.jsx', codigo: 'export default function Boton() { return <button /> }' }],
      ),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('resuelve react-dom y react-dom/client con los tipos reales del kit', async () => {
    const diagnosticos = await diagnosticarTiposReact(
      app(`import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
const nodo = document.createElement('div')
createPortal(<p>Portal</p>, nodo)
createRoot(nodo).render(<p>Raíz</p>)
export default function App() { return <div /> }`),
      cargarDesdeDisco,
    )

    expect(diagnosticos).toEqual([])
  })

  it('carga libs y tipos una vez y actualiza el mismo entorno entre pasadas', async () => {
    const cargarArchivo = vi.fn(cargarDesdeDisco)
    const crearEntorno = vi.fn(crearEntornoTiposReact)
    const sesion = crearSesionTiposReact(cargarArchivo, { crearEntorno })

    await sesion.diagnosticar(app('export default function App() { return <p>Uno</p> }'))
    const cargasTrasPrimeraPasada = cargarArchivo.mock.calls.length
    await sesion.diagnosticar(app('export default function App() { return <p>Dos</p> }'))

    expect(cargasTrasPrimeraPasada).toBeGreaterThan(0)
    expect(cargarArchivo).toHaveBeenCalledTimes(cargasTrasPrimeraPasada)
    expect(crearEntorno).toHaveBeenCalledTimes(1)
  })
})
