import { useEffect, useRef } from 'react'
import { Layers3 } from 'lucide-react'

export interface PropiedadesParallaxCapa {
  titulo: string
  descripcion: string
  intensidad?: number
}

export function ParallaxCapa({
  titulo,
  descripcion,
  intensidad = 0.12,
}: PropiedadesParallaxCapa) {
  const contenedorRef = useRef<HTMLElement>(null)
  const capaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const contenedor = contenedorRef.current
    const capa = capaRef.current
    if (!contenedor || !capa) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const contenedorSeguro = contenedor
    const capaSegura = capa

    let visible = typeof IntersectionObserver === 'undefined'
    let fotograma: number | null = null

    function actualizar() {
      fotograma = null
      if (!visible) return
      const limites = contenedorSeguro.getBoundingClientRect()
      const desplazamiento = (limites.top - window.innerHeight / 2) * intensidad
      capaSegura.style.transform = `translate3d(0, ${desplazamiento}px, 0)`
    }

    function alDesplazar() {
      if (fotograma === null) fotograma = window.requestAnimationFrame(actualizar)
    }

    const observador =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entrada]) => {
            visible = entrada.isIntersecting
            if (visible) alDesplazar()
          })

    observador?.observe(contenedorSeguro)
    window.addEventListener('scroll', alDesplazar, { passive: true })
    window.addEventListener('resize', alDesplazar)
    alDesplazar()

    return () => {
      observador?.disconnect()
      window.removeEventListener('scroll', alDesplazar)
      window.removeEventListener('resize', alDesplazar)
      if (fotograma !== null) window.cancelAnimationFrame(fotograma)
    }
  }, [intensidad])

  return (
    <section
      ref={contenedorRef}
      className="relative isolate min-h-64 overflow-hidden rounded-xl border bg-blue-950 p-6 text-white shadow-sm sm:p-10"
    >
      <div ref={capaRef} aria-hidden="true" className="absolute -inset-20 -z-10 will-change-transform">
        <div className="absolute top-10 left-[12%] size-32 rounded-full bg-blue-600/60 blur-2xl" />
        <div className="absolute right-[8%] bottom-10 size-40 rounded-full bg-violet-600/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 rounded-full bg-teal-600/50 blur-2xl" />
      </div>
      <div className="relative max-w-xl">
        <Layers3 aria-hidden="true" className="size-7 text-blue-200" />
        <h3 className="mt-8 text-2xl font-semibold text-balance">{titulo}</h3>
        <p className="mt-3 text-sm text-pretty text-blue-100">{descripcion}</p>
      </div>
    </section>
  )
}
