import { EditorView } from 'codemirror'
import { useEffect, useRef, useState } from 'react'

// Lo que devuelve EditorView.theme es una Extension de @codemirror/state, que no
// es dependencia directa del proyecto.
type Extension = ReturnType<typeof EditorView.theme>

// Mecanismo común de los editores CodeMirror (EditorCodeMirror y el editor de
// SqlEnVivo): sigue el modo oscuro de la web, crea la vista, avisa de cada cambio
// de texto y aplica los cambios de `valor` que llegan de fuera. Cada editor pone
// sus extensiones, su tema y su contenedor, que no son iguales.
//
// La vista se crea de nuevo cuando cambian la etiqueta, el modo oscuro o
// `crearExtensiones` (que el editor memoriza con las dependencias que le tocan).
// Los cambios de texto no la recrean: se sincronizan con una transacción.
export function useEditorCodeMirror({
  valor,
  onChange,
  etiqueta,
  crearExtensiones,
}: {
  valor: string
  onChange: (valor: string) => void
  etiqueta: string
  crearExtensiones: (modoOscuro: boolean) => Extension[]
}) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const vistaRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const valorRef = useRef(valor)
  const [modoOscuro, setModoOscuro] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valorRef.current = valor
  }, [valor])

  useEffect(() => {
    const observador = new MutationObserver(() => {
      setModoOscuro(document.documentElement.classList.contains('dark'))
    })
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!contenedorRef.current) return

    const vista = new EditorView({
      doc: valorRef.current,
      parent: contenedorRef.current,
      extensions: [
        ...crearExtensiones(modoOscuro),
        EditorView.contentAttributes.of({
          'aria-label': etiqueta,
          'aria-multiline': 'true',
          spellcheck: 'false',
        }),
        EditorView.updateListener.of((actualizacion) => {
          if (actualizacion.docChanged) {
            onChangeRef.current(actualizacion.state.doc.toString())
          }
        }),
      ],
    })
    vistaRef.current = vista

    return () => {
      vista.destroy()
      vistaRef.current = null
    }
  }, [crearExtensiones, etiqueta, modoOscuro])

  useEffect(() => {
    const vista = vistaRef.current
    if (!vista || vista.state.doc.toString() === valor) return
    vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: valor } })
  }, [valor])

  return contenedorRef
}
