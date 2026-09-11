import { useEffect, useRef } from 'react'

import type { DatosVideo } from '@/lib/laboratorio/schemas'

export function Video({ src, poster, descripcion, titulo }: DatosVideo) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.play().catch(() => {})
    }
  }, [])

  return (
    <figure className="my-6 space-y-2">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={descripcion}
        controls
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full rounded-xl border"
      >
        Tu navegador no admite la reproducción de vídeo.
      </video>
      {titulo && (
        <figcaption className="text-center text-sm text-muted-foreground">
          {titulo}
        </figcaption>
      )}
    </figure>
  )
}
