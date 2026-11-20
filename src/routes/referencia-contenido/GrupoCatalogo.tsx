import { useContext, type ReactNode } from 'react'

import { CategoriaActivaContext } from '@/routes/referencia-contenido/categoriaActiva'

interface PropiedadesGrupoCatalogo {
  titulo: string
  descripcion: string
  children: ReactNode
}

function idDeCategoria(titulo: string) {
  return `grupo-${titulo.toLowerCase().replace(/\s+/g, '-')}`
}

export function GrupoCatalogo({ titulo, descripcion, children }: PropiedadesGrupoCatalogo) {
  const categoriaActiva = useContext(CategoriaActivaContext)
  if (categoriaActiva !== null && categoriaActiva !== titulo) return null

  const tituloId = idDeCategoria(titulo)

  return (
    <section aria-labelledby={tituloId} className="scroll-mt-16 space-y-8">
      <header className="border-b pb-4">
        <h2 id={tituloId} className="text-2xl font-semibold tracking-tight text-balance">
          {titulo}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-pretty text-muted-foreground">{descripcion}</p>
      </header>
      <div className="space-y-12">{children}</div>
    </section>
  )
}
