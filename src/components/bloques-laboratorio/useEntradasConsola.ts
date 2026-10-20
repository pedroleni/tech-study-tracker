import { useCallback, useEffect, useRef, useState } from 'react'

import type { EntradaConsola } from '@/components/bloques-laboratorio/ConsolaReact'
import { LIMITE_ENTRADAS_CONSOLA } from '@/lib/react-en-vivo/constantes'
import type { MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'

// Un console.log dentro del render puede mandar cientos de mensajes por
// segundo: se acumulan y se vuelcan al estado como mucho cada 50 ms, en vez
// de renderizar la consola una vez por mensaje.
const INTERVALO_VOLCADO_MS = 50

export function useEntradasConsola() {
  const [entradas, setEntradas] = useState<EntradaConsola[]>([])
  const pendientes = useRef<EntradaConsola[]>([])
  const temporizador = useRef<number | null>(null)
  const siguienteId = useRef(1)
  // Los errores fuera del render no traen commit: se apuntan en el último.
  const ultimoCommit = useRef(0)

  const agregar = useCallback((nivel: EntradaConsola['nivel'], texto: string, commit: number) => {
    pendientes.current.push({ id: siguienteId.current, nivel, texto, commit })
    siguienteId.current += 1
    if (temporizador.current !== null) return
    temporizador.current = window.setTimeout(() => {
      temporizador.current = null
      const lote = pendientes.current
      pendientes.current = []
      setEntradas((previas) => [...previas, ...lote].slice(-LIMITE_ENTRADAS_CONSOLA))
    }, INTERVALO_VOLCADO_MS)
  }, [])

  const recibirMensaje = useCallback(
    (mensaje: MensajeReactEnVivo) => {
      if (mensaje.tipo === 'commit') ultimoCommit.current = mensaje.numero
      if (mensaje.tipo === 'consola') agregar(mensaje.nivel, mensaje.texto, mensaje.commit)
      if (mensaje.tipo === 'error') agregar('error', mensaje.texto, ultimoCommit.current)
    },
    [agregar],
  )

  const limpiar = useCallback(() => {
    pendientes.current = []
    ultimoCommit.current = 0
    setEntradas([])
  }, [])

  useEffect(
    () => () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current)
    },
    [],
  )

  return { entradas, recibirMensaje, limpiar }
}
