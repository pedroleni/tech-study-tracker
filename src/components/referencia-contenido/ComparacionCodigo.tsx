import { Check, X } from 'lucide-react'

export interface BloqueComparacionCodigo {
  etiqueta: string
  codigo: string
}

export interface PropiedadesComparacionCodigo {
  evitar: BloqueComparacionCodigo
  preferir: BloqueComparacionCodigo
  lenguaje?: string
}

export function ComparacionCodigo({
  evitar,
  preferir,
  lenguaje = 'html',
}: PropiedadesComparacionCodigo) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="min-w-0 overflow-hidden rounded-xl border border-red-200 bg-card shadow-sm dark:border-red-950">
        <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-950 dark:bg-red-950/40">
          <p className="text-xs font-bold tracking-wide text-red-600 uppercase dark:text-red-400">
            {evitar.etiqueta}
          </p>
          <X aria-hidden="true" className="size-4 text-red-600 dark:text-red-400" />
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className={`language-${lenguaje}`} translate="no">
            {evitar.codigo}
          </code>
        </pre>
      </section>
      <section className="min-w-0 overflow-hidden rounded-xl border border-green-200 bg-card shadow-sm dark:border-green-950">
        <div className="flex items-center justify-between gap-3 border-b border-green-200 bg-green-50 px-4 py-2 dark:border-green-950 dark:bg-green-950/40">
          <p className="text-xs font-bold tracking-wide text-green-600 uppercase dark:text-green-400">
            {preferir.etiqueta}
          </p>
          <Check aria-hidden="true" className="size-4 text-green-600 dark:text-green-400" />
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className={`language-${lenguaje}`} translate="no">
            {preferir.codigo}
          </code>
        </pre>
      </section>
    </div>
  )
}
