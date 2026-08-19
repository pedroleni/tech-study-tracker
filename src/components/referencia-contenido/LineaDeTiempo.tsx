export interface ItemLineaDeTiempo {
  titulo: string
  texto: string
  fecha?: string
}

export interface PropiedadesLineaDeTiempo {
  items: ItemLineaDeTiempo[]
}

export function LineaDeTiempo({ items }: PropiedadesLineaDeTiempo) {
  if (items.length === 0) return null

  return (
    <ol className="relative ml-2 border-l">
      {items.map((item, indice) => (
        <li
          key={`${item.titulo}-${indice}`}
          className="animate-in fade-in-0 slide-in-from-bottom-2 relative pb-7 pl-7 duration-500 last:pb-0 motion-reduce:animate-none"
          style={{ animationDelay: `${indice * 90}ms`, animationFillMode: 'both' }}
        >
          <span
            aria-hidden="true"
            className="absolute top-1 -left-2 size-4 rounded-full border-4 border-background bg-primary"
          />
          {item.fecha && (
            <p className="mb-1 text-xs font-semibold tracking-wide text-violet-600 uppercase dark:text-violet-400">
              {item.fecha}
            </p>
          )}
          <h3 className="font-semibold text-balance">{item.titulo}</h3>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.texto}</p>
        </li>
      ))}
    </ol>
  )
}
