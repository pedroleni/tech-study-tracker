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
