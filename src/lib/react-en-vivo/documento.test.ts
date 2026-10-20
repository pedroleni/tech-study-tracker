import { describe, expect, it } from 'vitest'

import { construirDocumentoReact } from './documento'

const base = {
  origen: 'https://ejemplo.test',
  css: 'p{}',
  modulos: { './App.jsx': 'x' },
  archivosCss: [],
  strictMode: true,
  conPruebas: false,
}

describe('construirDocumentoReact', () => {
  it('carga el runtime propio después del puente y sin Testing Library por defecto', () => {
    const doc = construirDocumentoReact(base)

    expect(doc).toContain(
      '<script src="https://ejemplo.test/react-en-vivo/19.3.1/react.js"></script>',
    )
    // La URL del script, no el nombre suelto: el propio montaje lo menciona en un comentario.
    expect(doc).not.toContain('/react-en-vivo/19.3.1/pruebas.js')
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
      '<script src="https://ejemplo.test/react-en-vivo/19.3.1/pruebas.js"></script>',
    )
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
})
