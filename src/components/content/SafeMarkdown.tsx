import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'

import { BloqueLaboratorio } from '@/components/bloques-laboratorio/BloqueLaboratorio'
import { CodigoResaltado } from '@/components/codigo'
import type { Lenguaje } from '@/components/codigo'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'

type PropiedadesSafeMarkdown = {
  children: string
  permitirLaboratorios?: boolean
}

function textoDelCodigo(children: ReactNode) {
  return String(children).replace(/\n$/, '')
}

function lenguajeDelBloque(className?: string): Lenguaje {
  const lenguaje = className?.replace(/^language-/, '').toLowerCase()

  if (lenguaje === 'html' || lenguaje === 'xml' || lenguaje === 'markup') return 'html'
  if (lenguaje === 'css') return 'css'
  if (['js', 'jsx', 'javascript', 'ts', 'tsx', 'typescript'].includes(lenguaje ?? '')) {
    return 'js'
  }
  return 'texto'
}

export function SafeMarkdown({
  children,
  permitirLaboratorios = false,
}: PropiedadesSafeMarkdown) {
  return (
    <div className="space-y-3 break-words text-sm leading-6 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:text-pretty [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown
        components={{
          a: ({ href, children: linkChildren }) =>
            href && validateResourceUrl(href) ? (
              <a href={href} target="_blank" rel="noreferrer">
                {linkChildren}
              </a>
            ) : (
              <span>{linkChildren}</span>
            ),
          // Comments are public, user-authored Markdown. Do not let an author make
          // every reader's browser contact an arbitrary tracking host.
          img: ({ alt }) => (alt ? <span>{alt}</span> : null),
          // `react-markdown` envuelve los bloques fenced en `pre`. El componente
          // de código ya aporta su propio `pre` accesible y con scroll.
          pre: ({ children: preChildren }) => <>{preChildren}</>,
          code: ({ className, children: codeChildren, node: _node, ...props }) => {
            void _node
            const esBloque = className?.startsWith('language-') ?? false

            if (!esBloque) {
              return (
                <code
                  className="rounded bg-muted px-1 font-mono text-xs"
                  {...props}
                >
                  {codeChildren}
                </code>
              )
            }

            const codigo = textoDelCodigo(codeChildren)
            if (className === 'language-laboratorio' && permitirLaboratorios) {
              const laboratorio = BloqueLaboratorio({ contenido: codigo })
              if (laboratorio) return laboratorio
            }

            const lenguaje = lenguajeDelBloque(className)
            const nombreLenguaje = className?.replace(/^language-/, '')
            return (
              <CodigoResaltado
                codigo={codigo}
                lenguaje={lenguaje}
                etiqueta={
                  nombreLenguaje
                    ? `Bloque de código ${nombreLenguaje}`
                    : 'Bloque de código'
                }
              />
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
