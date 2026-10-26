import { describe, expect, it } from 'vitest'

import { construirDocumentoReact } from './documento'
import { transformarArchivos } from './transformar'

const base = {
  origen: 'https://ejemplo.test',
  css: 'p{}',
  modulos: { './App.jsx': 'x' },
  archivosCss: [],
  strictMode: true,
  conPruebas: false,
}

describe('construirDocumentoReact', () => {
  it('no carga React Router si ningún módulo lo pide', () => {
    expect(construirDocumentoReact(base)).not.toContain('/react-router/8.5.0/react-router.js')
  })

  it("carga react-router.js después de react.js y el runtime del router antes del montaje si un módulo hace require('react-router')", () => {
    const doc = construirDocumentoReact({
      ...base,
      modulos: { './App.jsx': "require('react-router')" },
    })

    expect(doc.indexOf('/19.3.1/react.js')).toBeLessThan(doc.indexOf('/react-router/8.5.0/react-router.js'))
    expect(doc.indexOf('/react-router/8.5.0/react-router.js')).toBeLessThan(doc.indexOf('window.__routerEnVivo'))
    expect(doc.indexOf('const LIBRERIA = window.__reactRouterEnVivo')).toBeLessThan(
      doc.indexOf('const R = window.__reactEnVivo'),
    )
  })

  it('también lo carga con require("react-router/dom") entre comillas dobles', () => {
    const doc = construirDocumentoReact({
      ...base,
      modulos: { './App.jsx': 'require("react-router/dom")' },
    })
    expect(doc).toContain('/react-router/8.5.0/react-router.js')
  })

  it('un import type de react-router no lo carga', async () => {
    const resultado = await transformarArchivos([
      {
        nombre: 'App.tsx',
        codigo: "import type { Params } from 'react-router'\nexport default function App() { return <p /> }",
      },
    ])
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(construirDocumentoReact({ ...base, modulos: resultado.modulos })).not.toContain(
      '/react-router/8.5.0/react-router.js',
    )
  })

  it('urlInicial va en la configuración con < escapado', () => {
    const doc = construirDocumentoReact({ ...base, urlInicial: '/buscar?q=<b>' })
    expect(doc).not.toContain('/buscar?q=<b>')
    expect(doc).toContain('/buscar?q=\\u003cb>')
  })

  it('carga el runtime propio después del puente y sin Testing Library por defecto', () => {
    const doc = construirDocumentoReact(base)

    expect(doc).toContain(
      '<script src="https://ejemplo.test/vendor/react-en-vivo/19.3.1/react.js"></script>',
    )
    // La URL del script, no el nombre suelto: el propio montaje lo menciona en un comentario.
    expect(doc).not.toContain('/vendor/react-en-vivo/19.3.1/pruebas.js')
    expect(doc.indexOf('__REACT_DEVTOOLS_GLOBAL_HOOK__')).toBeLessThan(
      doc.indexOf('react.js'),
    )
    expect(doc.indexOf('react.js')).toBeLessThan(doc.indexOf('__configReactEnVivo'))
  })

  it('fija la base en about:srcdoc para que un enlace # no saque al iframe de su documento', () => {
    // Sin <base>, un srcdoc hereda la URL de la página: <a href="#"> cargaba
    // la propia web dentro del iframe (el bug que EditorEnVivo ya corrigió).
    const doc = construirDocumentoReact(base)

    expect(doc).toContain('<base href="about:srcdoc" />')
    expect(doc.indexOf('<base href="about:srcdoc" />')).toBeLessThan(doc.indexOf('<style>'))
  })

  it('añade Testing Library solo cuando hay comprobaciones', () => {
    expect(construirDocumentoReact({ ...base, conPruebas: true })).toContain(
      '<script src="https://ejemplo.test/vendor/react-en-vivo/19.3.1/pruebas.js"></script>',
    )
  })

  it('desactiva View Transitions antes de cargar React en las comprobaciones', () => {
    const doc = construirDocumentoReact({ ...base, conPruebas: true })

    expect(doc).toContain('delete Document.prototype.startViewTransition')
    expect(doc).toContain('delete document.startViewTransition')
    expect(doc.indexOf('delete Document.prototype.startViewTransition')).toBeLessThan(
      doc.indexOf('/react.js'),
    )
  })

  it('mantiene View Transitions en la vista previa normal', () => {
    const doc = construirDocumentoReact(base)

    expect(doc).not.toContain('delete Document.prototype.startViewTransition')
    expect(doc).not.toContain('delete document.startViewTransition')
  })

  it('el código del alumno no puede cerrar el script ni el style', () => {
    const doc = construirDocumentoReact({
      ...base,
      css: 'p { color: red } </style><script>alert(2)</script>',
      modulos: { './App.jsx': "const x = '</script><script>alert(1)</script>'" },
    })

    expect(doc).toContain('\\u003c/script')
    expect(doc).not.toContain('</script><script>alert(1)')
    expect(doc).toContain('<\\/style')
    expect(doc).not.toContain('</style><script>alert(2)')
  })

  it('pasa la configuración del montaje como JSON', () => {
    const doc = construirDocumentoReact({ ...base, archivosCss: ['./estilos.css'], strictMode: false })
    const json = /window\.__configReactEnVivo = (.*?)<\/script>/s.exec(doc)?.[1]

    expect(JSON.parse(json ?? 'null')).toEqual({
      modulos: { './App.jsx': 'x' },
      archivosCss: ['./estilos.css'],
      strictMode: false,
    })
  })

  it('con api incluye red.js después de la configuración y antes del montaje', () => {
    const doc = construirDocumentoReact({
      ...base,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: { latencia: 600, desordenar: false },
    })

    expect(doc.indexOf('window.__configReactEnVivo =')).toBeLessThan(
      doc.indexOf('window.__redReactEnVivo ='),
    )
    expect(doc.indexOf('window.__redReactEnVivo =')).toBeLessThan(
      doc.indexOf('const R = window.__reactEnVivo'),
    )
  })

  it('sin api no incluye red.js', () => {
    expect(construirDocumentoReact(base)).not.toContain('window.__redReactEnVivo =')
  })

  it('conEfectos incluye efectos.js después de la configuración y antes del montaje', () => {
    const doc = construirDocumentoReact({ ...base, conEfectos: true })
    const json = /window\.__configReactEnVivo = (.*?)<\/script>/s.exec(doc)?.[1]

    expect(JSON.parse(json ?? 'null')).toEqual(expect.objectContaining({ efectos: true }))
    expect(doc.indexOf('window.__configReactEnVivo =')).toBeLessThan(
      doc.indexOf('window.__efectosReactEnVivo = { envolver }'),
    )
    expect(doc.indexOf('window.__efectosReactEnVivo = { envolver }')).toBeLessThan(
      doc.indexOf('const R = window.__reactEnVivo'),
    )
  })

  it('sin conEfectos no incluye efectos.js', () => {
    expect(construirDocumentoReact(base)).not.toContain('window.__efectosReactEnVivo = { envolver }')
  })
})

describe('árbol de renders en el documento', () => {
  // Marca que solo existe en arbol.js (el puente también nombra __arbolReactEnVivo).
  const MARCA = '__resaltados-react-en-vivo'

  it('conArbol incluye arbol.js entre #root y la configuración', () => {
    const doc = construirDocumentoReact({ ...base, conArbol: true })
    const posicion = doc.indexOf(MARCA)

    expect(posicion).toBeGreaterThan(doc.indexOf('<div id="root"></div>'))
    expect(posicion).toBeLessThan(doc.indexOf('window.__configReactEnVivo ='))
  })

  it('sin conArbol no lo incluye', () => {
    expect(construirDocumentoReact(base)).not.toContain(MARCA)
  })

  it('con conPruebas nunca incluye arbol.js', () => {
    expect(construirDocumentoReact({ ...base, conPruebas: true, conArbol: true })).not.toContain(MARCA)
  })
})

describe('registro del router en el documento', () => {
  const MARCA_REGISTRO = 'window.__registroRouterEnVivo ='
  const MARCA_ROUTER = 'const ERROR_CARGA ='

  it('incluye registro-router.js antes de router.js con conRegistroRouter y un require de react-router', () => {
    const doc = construirDocumentoReact({
      ...base,
      conRegistroRouter: true,
      modulos: { './App.jsx': "require('react-router')" },
    })

    expect(doc.indexOf(MARCA_REGISTRO)).toBeGreaterThan(-1)
    expect(doc.indexOf(MARCA_REGISTRO)).toBeLessThan(doc.indexOf(MARCA_ROUTER))
  })

  it('no lo incluye sin conRegistroRouter, sin react-router ni en el documento de las comprobaciones', () => {
    expect(
      construirDocumentoReact({ ...base, modulos: { './App.jsx': "require('react-router')" } }),
    ).not.toContain(MARCA_REGISTRO)
    expect(construirDocumentoReact({ ...base, conRegistroRouter: true })).not.toContain(
      MARCA_REGISTRO,
    )
    expect(
      construirDocumentoReact({
        ...base,
        conPruebas: true,
        conRegistroRouter: true,
        modulos: { './App.jsx': "require('react-router')" },
      }),
    ).not.toContain(MARCA_REGISTRO)
  })
})
