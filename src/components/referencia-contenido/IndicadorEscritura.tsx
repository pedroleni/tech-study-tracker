export interface PropiedadesIndicadorEscritura {
  etiqueta?: string
  tamano?: 'pequeno' | 'mediano'
}

export function IndicadorEscritura({
  etiqueta = 'Escribiendo…',
  tamano = 'pequeno',
}: PropiedadesIndicadorEscritura) {
  return (
    <div role="status" className="inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-sm">
      <span className="sr-only">{etiqueta}</span>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        {[0, 1, 2].map((indice) => (
          <span
            key={indice}
            className={`${tamano === 'pequeno' ? 'size-2' : 'size-3'} animate-[catalogo-escritura_1.2s_ease-in-out_infinite] rounded-full bg-violet-600 motion-reduce:animate-none dark:bg-violet-400`}
            style={{ animationDelay: `${indice * 160}ms` }}
          />
        ))}
      </span>
    </div>
  )
}
