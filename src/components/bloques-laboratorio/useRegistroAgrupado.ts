import { useCallback, useEffect, useRef, useState } from 'react'

const INTERVALO_VOLCADO_MS = 50

// Los mensajes del iframe pueden llegar en ráfagas. Este hook los acumula y
// provoca como mucho un render por intervalo, conservando el límite indicado.
export function useRegistroAgrupado<T>(
  limite: number,
  incorporar: (actuales: T[], nuevas: T[]) => T[],
) {
  const [entradas, setEntradas] = useState<T[]>([])
  const pendientes = useRef<T[]>([])
  const temporizador = useRef<number | null>(null)

  const recibir = useCallback(
    (entrada: T) => {
      pendientes.current.push(entrada)
      if (temporizador.current !== null) return
      temporizador.current = window.setTimeout(() => {
        temporizador.current = null
        const lote = pendientes.current
        pendientes.current = []
        setEntradas((actuales) => incorporar(actuales, lote).slice(-limite))
      }, INTERVALO_VOLCADO_MS)
    },
    [incorporar, limite],
  )

  const limpiar = useCallback(() => {
    pendientes.current = []
    setEntradas([])
  }, [])

  useEffect(
    () => () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current)
    },
    [],
  )

  return { entradas, recibir, limpiar }
}
