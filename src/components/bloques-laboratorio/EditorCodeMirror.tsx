import type { html as lenguajeHtml } from '@codemirror/lang-html'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { basicSetup, EditorView } from 'codemirror'
import { useEffect, useRef, useState } from 'react'

import '@/components/codigo/sintaxis.css'

// Editor CodeMirror con el tema de la web, compartido por editor-en-vivo y
// react-en-vivo. Extraído tal cual de EditorEnVivo.tsx.

export type ExtensionLenguaje = ReturnType<typeof lenguajeHtml>

const estilosTemaAplicacion = {
  '&': {
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    fontSize: '0.75rem',
  },
  '&.cm-focused': {
    outline: '2px solid var(--ring)',
    outlineOffset: '-2px',
  },
  '.cm-scroller': {
    overflow: 'auto',
    maxHeight: '24rem',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-content': {
    minHeight: '6rem',
    padding: '0.75rem 0',
    caretColor: 'var(--foreground)',
    whiteSpace: 'pre',
  },
  '.cm-line': {
    padding: '0 0.75rem',
  },
  '.cm-gutters': {
    color: 'var(--muted-foreground)',
    backgroundColor: 'var(--muted)',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'var(--accent)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in oklab, var(--ring) 35%, transparent)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--foreground)',
  },
} as const

// Los colores salen de la misma paleta que los bloques de código estáticos
// (sintaxis.css, contraste comprobado en claro y en oscuro). La paleta por
// defecto de CodeMirror está pensada para fondo claro: en modo oscuro las
// palabras clave apenas se leían.
const resaltadoAplicacion = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [
        tags.keyword,
        tags.controlKeyword,
        tags.moduleKeyword,
        tags.operatorKeyword,
        tags.definitionKeyword,
        tags.modifier,
        tags.self,
        tags.null,
        tags.bool,
        tags.atom,
      ],
      color: 'var(--sintaxis-palabra-clave)',
    },
    { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--sintaxis-cadena)' },
    { tag: [tags.number, tags.integer, tags.float], color: 'var(--sintaxis-numero)' },
    {
      tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment],
      color: 'var(--sintaxis-comentario)',
    },
    {
      tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
      color: 'var(--sintaxis-funcion)',
    },
    { tag: [tags.tagName, tags.angleBracket], color: 'var(--sintaxis-etiqueta)' },
    { tag: tags.attributeName, color: 'var(--sintaxis-atributo)' },
    { tag: tags.attributeValue, color: 'var(--sintaxis-cadena)' },
    { tag: tags.propertyName, color: 'var(--sintaxis-propiedad)' },
    { tag: [tags.className, tags.typeName], color: 'var(--sintaxis-selector)' },
    { tag: [tags.unit, tags.color, tags.constant(tags.name)], color: 'var(--sintaxis-valor)' },
    {
      tag: [tags.punctuation, tags.bracket, tags.operator, tags.separator],
      color: 'var(--sintaxis-puntuacion)',
    },
    { tag: tags.invalid, color: 'var(--sintaxis-etiqueta)' },
  ]),
)

function crearTemaAplicacion(modoOscuro: boolean) {
  return EditorView.theme(estilosTemaAplicacion, { dark: modoOscuro })
}


export function EditorCodeMirror({
  etiqueta,
  extension,
  valor,
  onChange,
}: {
  etiqueta: string
  extension: ExtensionLenguaje
  valor: string
  onChange: (valor: string) => void
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
        basicSetup,
        extension,
        resaltadoAplicacion,
        crearTemaAplicacion(modoOscuro),
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
    // La vista solo se crea de nuevo al cambiar de lenguaje. Los cambios de
    // texto se sincronizan mediante la transacción del efecto siguiente.
  }, [etiqueta, extension, modoOscuro])

  useEffect(() => {
    const vista = vistaRef.current
    if (!vista || vista.state.doc.toString() === valor) return
    vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: valor } })
  }, [valor])

  return (
    <div
      ref={contenedorRef}
      className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-background [&_.cm-editor]:max-w-full [&_.cm-editor]:overflow-hidden"
    />
  )
}
