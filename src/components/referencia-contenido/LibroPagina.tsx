import { useState } from 'react'
import { BookOpen, Undo2 } from 'lucide-react'

export interface ContenidoPaginaLibro {
  titulo: string
  contenido: string
}

export interface PropiedadesLibroPagina {
  portada: ContenidoPaginaLibro
  pagina: ContenidoPaginaLibro
  etiqueta?: string
}

export function LibroPagina({
  portada,
  pagina,
  etiqueta = 'Pasar página',
}: PropiedadesLibroPagina) {
  const [abierto, setAbierto] = useState(false)

  return (
    <section className="mx-auto max-w-2xl [perspective:1200px]">
      <div className="relative grid min-h-64 grid-cols-2 rounded-xl border bg-card shadow-lg">
        <article className="col-start-2 flex flex-col justify-center p-5 sm:p-7">
          <p className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Página 2
          </p>
          <h3 className="mt-2 font-semibold text-balance">{pagina.titulo}</h3>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{pagina.contenido}</p>
        </article>
        <button
          type="button"
          aria-label={abierto ? 'Cerrar página' : etiqueta}
          aria-pressed={abierto}
          onClick={() => setAbierto((actual) => !actual)}
          className={`absolute inset-y-0 left-0 w-1/2 touch-manipulation rounded-l-xl border-r bg-amber-50 p-5 text-left shadow-md [backface-visibility:hidden] [transform-origin:right_center] [transform-style:preserve-3d] transition-transform duration-700 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none dark:bg-amber-950/40 dark:hover:bg-amber-950/50 ${
            abierto ? '[transform:rotateY(-155deg)]' : ''
          }`}
        >
          <span className="flex h-full flex-col justify-between">
            <BookOpen aria-hidden="true" className="size-7 text-amber-600 dark:text-amber-400" />
            <span>
              <span className="block font-semibold text-balance">{portada.titulo}</span>
              <span className="mt-2 block text-sm text-pretty text-muted-foreground">
                {portada.contenido}
              </span>
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              {abierto && <Undo2 aria-hidden="true" className="size-4" />}
              {abierto ? 'Volver' : 'Abrir capítulo'}
            </span>
          </span>
        </button>
      </div>
    </section>
  )
}
