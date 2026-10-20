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
})
