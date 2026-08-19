import { useEffect, useState } from 'react'
import { Terminal } from 'lucide-react'

export interface PropiedadesMaquinaEscribir {
  texto: string
  velocidadMs?: number
  etiqueta?: string
}

export function MaquinaEscribir({
  texto,
  velocidadMs = 55,
  etiqueta = 'Ejemplo escrito carácter a carácter',
}: PropiedadesMaquinaEscribir) {
  const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [longitud, setLongitud] = useState(0)

  useEffect(() => {
    if (reducirMovimiento || velocidadMs <= 0) return
    let temporizador: number | null = null
    function escribir(siguiente: number) {
      setLongitud(siguiente)
      if (siguiente < texto.length) {
        temporizador = window.setTimeout(() => escribir(siguiente + 1), velocidadMs)
      }
    }
    temporizador = window.setTimeout(() => escribir(1), velocidadMs)
    return () => {
      if (temporizador !== null) window.clearTimeout(temporizador)
    }
  }, [reducirMovimiento, texto, velocidadMs])

  const longitudVisible = reducirMovimiento || velocidadMs <= 0 ? texto.length : longitud

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border bg-blue-950 p-4 font-mono text-sm text-blue-50 shadow-sm sm:p-5">
      <Terminal aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-400" />
      <p aria-label={etiqueta} className="min-w-0 break-words">
        <span aria-hidden="true" translate="no">{texto.slice(0, longitudVisible)}</span>
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-5 w-0.5 animate-[catalogo-cursor_1s_steps(1)_infinite] bg-teal-400 align-middle motion-reduce:animate-none"
        />
        <span className="sr-only">{texto}</span>
      </p>
    </div>
  )
}
