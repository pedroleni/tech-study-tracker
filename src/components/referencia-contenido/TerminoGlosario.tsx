import { useId } from 'react'

export interface PropiedadesTerminoGlosario {
  termino: string
  definicion: string
}

export function TerminoGlosario({ termino, definicion }: PropiedadesTerminoGlosario) {
  const tooltipId = useId()

  return (
    <span className="group relative inline-flex">
      <dfn className="not-italic">
        <button
          type="button"
          aria-describedby={tooltipId}
          className="cursor-help touch-manipulation rounded-sm border-0 border-b border-dotted border-foreground/70 bg-transparent p-0 font-[inherit] text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {termino}
        </button>
      </dfn>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 max-w-[80vw] -translate-x-1/2 scale-95 rounded-lg border bg-popover p-3 text-xs text-pretty text-popover-foreground opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        {definicion}
      </span>
    </span>
  )
}
