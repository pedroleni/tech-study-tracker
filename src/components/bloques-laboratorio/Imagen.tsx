import type { DatosImagen } from '@/lib/laboratorio/schemas'

export function Imagen({ src, alt, titulo }: DatosImagen) {
  return (
    <figure className="my-6 space-y-2">
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-xl border" />
      {titulo && (
        <figcaption className="text-center text-sm text-muted-foreground">
          {titulo}
        </figcaption>
      )}
    </figure>
  )
}
