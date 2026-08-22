import type { ReactNode } from 'react'
import { Circle, CircleX, Code2, Info, Library, ListChecks, TriangleAlert, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { BloqueLaboratorio } from '@/components/bloques-laboratorio/BloqueLaboratorio'
import { CodigoResaltado } from '@/components/codigo'
import type { Lenguaje } from '@/components/codigo'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'

// Icono temático por apartado — mismo lenguaje visual que ya usan los
// bloques de laboratorio (insignia de color + icono), para que los
// encabezados de sección se distingan de un vistazo sin añadir un
// sistema visual nuevo. El texto se normaliza (minúsculas, sin tildes)
// porque el título exacto de "Lo que [X] no es" varía por lección.
function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function textoPlano(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(textoPlano).join('')
  return ''
}

const tonosApartado = {
  blue: { badge: 'bg-blue-50 dark:bg-blue-950/40', icono: 'text-blue-600 dark:text-blue-400' },
  violet: {
    badge: 'bg-violet-50 dark:bg-violet-950/40',
    icono: 'text-violet-600 dark:text-violet-400',
  },
  amber: { badge: 'bg-amber-50 dark:bg-amber-950/40', icono: 'text-amber-600 dark:text-amber-400' },
  rose: { badge: 'bg-rose-50 dark:bg-rose-950/40', icono: 'text-rose-600 dark:text-rose-400' },
  indigo: { badge: 'bg-indigo-50 dark:bg-indigo-950/40', icono: 'text-indigo-600 dark:text-indigo-400' },
  teal: { badge: 'bg-teal-50 dark:bg-teal-950/40', icono: 'text-teal-600 dark:text-teal-400' },
  cyan: { badge: 'bg-cyan-50 dark:bg-cyan-950/40', icono: 'text-cyan-600 dark:text-cyan-400' },
  gray: { badge: 'bg-muted', icono: 'text-muted-foreground' },
} as const

// "Lo que [X] no es" y "Errores típicos" son conceptualmente distintos
// (desmontar una idea equivocada sobre qué ES algo, frente a errores
// concretos al USARLO) — con el mismo icono se leían como repetición.
const reglasApartado: { detecta: (texto: string) => boolean; Icono: typeof Info; tono: keyof typeof tonosApartado }[] = [
  { detecta: (t) => t.includes('que es') && t.includes('para que sirve'), Icono: Info, tono: 'blue' },
  { detecta: (t) => t.includes('cuando lo usarias'), Icono: User, tono: 'violet' },
  { detecta: (t) => t.includes('como se usa'), Icono: Code2, tono: 'amber' },
  { detecta: (t) => t.startsWith('lo que'), Icono: CircleX, tono: 'indigo' },
  { detecta: (t) => t.includes('errores tipicos'), Icono: TriangleAlert, tono: 'rose' },
  { detecta: (t) => t.includes('ejercicio'), Icono: ListChecks, tono: 'teal' },
  { detecta: (t) => t.includes('profundizar'), Icono: Library, tono: 'cyan' },
]

function iconoDeApartado(textoCrudo: string) {
  const texto = normalizarTexto(textoCrudo)
  const regla = reglasApartado.find(({ detecta }) => detecta(texto))
  return { Icono: regla?.Icono ?? Circle, ...tonosApartado[regla?.tono ?? 'gray'] }
}

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
          h2: ({ children: h2Children }) => {
            const { Icono, badge, icono } = iconoDeApartado(textoPlano(h2Children))
            return (
              <h2 className="mt-12 mb-4 flex items-center gap-3 first:mt-0">
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] ${badge}`}
                >
                  <Icono className={`size-4 ${icono}`} />
                </span>
                <span className="text-xl font-bold tracking-tight text-balance">
                  {h2Children}
                </span>
              </h2>
            )
          },
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
