import { describe, expect, it } from 'vitest'

import { transformarArchivos, transformarParaMostrar } from './transformar'

describe('transformarArchivos', () => {
  it('transforma cada .jsx a CommonJS con JSX automático y junta el CSS', async () => {
    const resultado = await transformarArchivos([
      {
        nombre: 'App.jsx',
        codigo:
          "import './estilos.css'\nexport default function App() { return <p>Hola</p> }",
      },
      { nombre: 'estilos.css', codigo: 'p { color: red; }' },
    ])

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return

    expect(resultado.modulos['./App.jsx']).toContain('require("react/jsx-dev-runtime")')
    expect(resultado.modulos['./App.jsx']).toContain('exports.default')
    expect(resultado.archivosCss).toEqual(['./estilos.css'])
    expect(resultado.css).toBe('p { color: red; }')
  })

  it('devuelve el error de sintaxis con archivo, línea y mensaje limpio', async () => {
    const resultado = await transformarArchivos([
      {
        nombre: 'App.jsx',
        codigo: 'export default function App() {\n  return <div>\n}',
      },
    ])

    expect(resultado).toEqual({
      ok: false,
      archivo: 'App.jsx',
      linea: 2,
      mensaje: 'Unterminated JSX contents',
    })
  })

  it('quita tipos de .tsx y .ts, transforma JSX y conserva los imports CommonJS', async () => {
    const resultado = await transformarArchivos([
      {
        nombre: 'App.tsx',
        codigo: `import { limite } from './datos'
interface Props { titulo: string }
export default function App({ titulo }: Props) { return <p>{titulo}: {limite}</p> }`,
      },
      { nombre: 'datos.ts', codigo: 'export const limite: number = 3' },
    ])

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.modulos['./App.tsx']).toMatch(/require\(['"]\.\/datos['"]\)/)
    expect(resultado.modulos['./App.tsx']).toContain('require("react/jsx-dev-runtime")')
    expect(resultado.modulos['./App.tsx']).not.toContain('interface Props')
    expect(resultado.modulos['./App.tsx']).not.toContain(': Props')
    expect(resultado.modulos['./datos.ts']).toContain('const limite = 3')
    expect(resultado.modulos['./datos.ts']).not.toContain(': number')
  })
})

describe('transformarParaMostrar', () => {
  it('muestra el JavaScript de producción de cada archivo', async () => {
    const texto = await transformarParaMostrar([
      {
        nombre: 'Tarjeta.jsx',
        codigo: 'export default function Tarjeta() { return <li>a</li> }',
      },
    ])

    expect(texto).toContain('// Tarjeta.jsx')
    expect(texto).toContain('import {jsx as _jsx} from "react/jsx-runtime"')
    expect(texto).toContain("_jsx('li'")
  })

  it('incluye .tsx y .ts en el JavaScript generado sin anotaciones de tipos', async () => {
    const texto = await transformarParaMostrar([
      {
        nombre: 'App.tsx',
        codigo: 'const titulo: string = "TSX"\nexport default function App() { return <h1>{titulo}</h1> }',
      },
      { nombre: 'datos.ts', codigo: 'export const cantidad: number = 2' },
    ])

    expect(texto).toContain('// App.tsx')
    expect(texto).toContain('// datos.ts')
    expect(texto).toContain('import {jsx as _jsx} from "react/jsx-runtime"')
    expect(texto).not.toContain(': string')
    expect(texto).not.toContain(': number')
  })
})

it('detecta también los errores de sintaxis que solo ve el motor de JavaScript', async () => {
  // Sucrase deja pasar un const repetido; V8 lo rechaza al compilar. Sin esta
  // comprobación, la vista previa se rompía sin decir en qué archivo.
  const r = await transformarArchivos([
    {
      nombre: 'App.jsx',
      codigo: "import Tarjeta from './Tarjeta'\nexport default function App() { return <Tarjeta /> }",
    },
    {
      nombre: 'Tarjeta.jsx',
      codigo: 'export default function Tarjeta() {\n  const n = 1\n  const n = 2\n  return <p>{n}</p>\n}',
    },
  ])
  expect(r).toEqual({
    ok: false,
    archivo: 'Tarjeta.jsx',
    linea: null,
    mensaje: "Identifier 'n' has already been declared",
  })
})
