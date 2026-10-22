import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

type RespuestaWorker = Record<string, unknown>

function cargarWorker(nombre: 'compilador.js' | 'lint.js') {
  const salidas: RespuestaWorker[] = []
  const self: {
    postMessage: (mensaje: RespuestaWorker) => void
    onmessage?: (evento: { data: unknown }) => void
  } = { postMessage: (mensaje) => salidas.push(mensaje) }
  const contexto = vm.createContext({
    self,
    console,
    queueMicrotask,
    setTimeout,
    clearTimeout,
    TextEncoder,
    TextDecoder,
    URL,
    structuredClone,
  })
  Object.assign(contexto, { globalThis: contexto })
  vm.runInContext(
    readFileSync(`public/vendor/react-kit/1/${nombre}`, 'utf8'),
    contexto,
    { filename: nombre },
  )

  return (datos: unknown) => {
    salidas.length = 0
    self.onmessage?.({ data: datos })
    return structuredClone(salidas)
  }
}

describe('workers reales de React Kit', () => {
  it('el compilador usa su runtime y conserva el motivo si rechaza una mutación de props', () => {
    const compilar = cargarWorker('compilador.js')
    const [correcto] = compilar({
      id: 1,
      tipo: 'compilar',
      nombre: 'App.jsx',
      codigo: 'export default function App({ n }) { return <p>{n}</p> }',
    })
    const [mutacion] = compilar({
      id: 2,
      tipo: 'compilar',
      nombre: 'Tarjeta.jsx',
      codigo: 'export default function Tarjeta(props) { props.n = 2; return <p>{props.n}</p> }',
    })

    expect(correcto.ok).toBe(true)
    expect(correcto.codigo).toContain('react/compiler-runtime')
    expect(mutacion).toMatchObject({ ok: true })
    expect(mutacion.eventos).toContainEqual(
      expect.objectContaining({
        componente: 'Tarjeta',
        estado: 'error',
        motivo: expect.stringContaining('cannot be modified'),
      }),
    )
  })

  it('el linter mantiene las reglas del compilador en JSX y TSX, y aísla errores de parseo', () => {
    const lint = cargarWorker('lint.js')
    const codigoJsx = `import { useEffect, useState } from 'react'
export default function App() { const [n, setN] = useState(0); useEffect(() => { setN(n + 1) }, []); return <p>{n}</p> }`
    const codigoTsx = `import { useEffect, useState } from 'react'
export default function Tarjeta() { const [n, setN] = useState<number>(0); useEffect(() => { setN(n + 1) }, []); return <p>{n}</p> }`
    const [respuesta] = lint({
      id: 1,
      tipo: 'lint',
      archivos: [
        { nombre: 'Roto.tsx', codigo: 'export default function Roto(): { return <p /> }' },
        { nombre: 'App.jsx', codigo: codigoJsx },
        { nombre: 'Tarjeta.tsx', codigo: codigoTsx },
      ],
    })

    expect(respuesta.ok).toBe(true)
    expect(respuesta.diagnosticos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          archivo: 'Roto.tsx',
          regla: null,
          mensaje: expect.stringContaining('Parsing error'),
        }),
        expect.objectContaining({
          archivo: 'App.jsx',
          regla: 'react-hooks/set-state-in-effect',
        }),
        expect.objectContaining({
          archivo: 'Tarjeta.tsx',
          columna: 0,
          regla: 'react-hooks/set-state-in-effect',
        }),
      ]),
    )
  })
})
