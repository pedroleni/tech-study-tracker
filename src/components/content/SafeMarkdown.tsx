import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
    <div className="max-w-none wrap-break-word [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren }) =>
            href && validateResourceUrl(href) ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                {linkChildren}
              </a>
            ) : (
              <span>{linkChildren}</span>
            ),
          // Comments are public, user-authored Markdown. Do not let an author make
          // every reader's browser contact an arbitrary tracking host.
          img: ({ alt }) => (alt ? <span>{alt}</span> : null),
          h1: ({ children: h1Children }) => (
            <h1 className="mt-0 mb-4 text-2xl font-bold tracking-tight text-balance">
              {h1Children}
            </h1>
          ),
          h2: ({ children: h2Children }) => (
            <h2 className="mt-12 mb-4 border-t pt-8 text-xl font-bold tracking-tight first:mt-0 first:border-0 first:pt-0">
              {h2Children}
            </h2>
          ),
          h3: ({ children: h3Children }) => (
            <h3 className="mt-8 mb-3 text-base font-semibold tracking-tight">{h3Children}</h3>
          ),
          p: ({ children: pChildren }) => (
            <p className="my-4 text-base text-pretty text-foreground/85 leading-[1.8]">
              {pChildren}
            </p>
          ),
          table: ({ children: tableChildren }) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{tableChildren}</table>
            </div>
          ),
          th: ({ children: thChildren }) => (
            <th className="border-b-2 border-foreground/80 px-3.5 py-2.5 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase first:pl-0">
              {thChildren}
            </th>
          ),
          td: ({ children: tdChildren }) => (
            <td className="border-b px-3.5 py-3 align-top text-foreground/85 first:pl-0">
              {tdChildren}
            </td>
          ),
          // `react-markdown` envuelve los bloques fenced en `pre`. El componente
          // de código ya aporta su propio `pre` accesible y con scroll.
          pre: ({ children: preChildren }) => <>{preChildren}</>,
          code: ({ className, children: codeChildren, node: _node, ...props }) => {
            void _node
            const esBloque = className?.startsWith('language-') ?? false

            if (!esBloque) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-rose-700 dark:text-rose-300"
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
