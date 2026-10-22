import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'

import { diagnosticarTiposReact } from './tipos'

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
})
