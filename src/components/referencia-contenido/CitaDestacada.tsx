import { Quote } from 'lucide-react'

export interface PropiedadesCitaDestacada {
  cita: string
  atribucion: string
  fuente?: string
}

export function CitaDestacada({ cita, atribucion, fuente }: PropiedadesCitaDestacada) {
  return (
    <figure className="animate-in fade-in-0 zoom-in-95 relative overflow-hidden rounded-xl border bg-card px-6 py-8 shadow-sm duration-500 motion-reduce:animate-none sm:px-10">
      <Quote
        aria-hidden="true"
        className="absolute top-4 left-4 size-14 text-muted/80 sm:size-20"
        strokeWidth={1.5}
      />
      <blockquote className="relative text-xl leading-relaxed font-medium text-pretty italic sm:text-2xl">
        “{cita}”
      </blockquote>
      <figcaption className="relative mt-5 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{atribucion}</span>
        {fuente && <span> · {fuente}</span>}
      </figcaption>
    </figure>
  )
}
