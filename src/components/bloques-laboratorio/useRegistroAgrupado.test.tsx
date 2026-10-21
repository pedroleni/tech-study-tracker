import { act, render, screen } from '@testing-library/react'
import { Profiler, useEffect } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import { useRegistroAgrupado } from './useRegistroAgrupado'

const incorporar = (actuales: number[], nuevas: number[]) => [...actuales, ...nuevas]

function Banco({ onListo }: { onListo: (recibir: (valor: number) => void) => void }) {
  const { entradas, recibir } = useRegistroAgrupado<number>(200, incorporar)
  useEffect(() => onListo(recibir), [onListo, recibir])
  return <p>{entradas.join(',')}</p>
}

afterEach(() => vi.useRealTimers())

it('agrupa 500 mensajes en un solo volcado y conserva los 200 últimos en orden', () => {
  vi.useFakeTimers()
  const alRenderizar = vi.fn()
  const onListo = vi.fn()
  render(<Profiler id="registro" onRender={alRenderizar}><Banco onListo={onListo} /></Profiler>)
  const recibirMensaje = onListo.mock.calls[0][0]
  act(() => {
    for (let numero = 1; numero <= 500; numero += 1) recibirMensaje(numero)
  })
  expect(alRenderizar).toHaveBeenCalledOnce()
  act(() => vi.advanceTimersByTime(50))
  const texto = screen.getByText(/^301,/).textContent ?? ''
  expect(texto.split(',')).toEqual(
    Array.from({ length: 200 }, (_, indice) => String(indice + 301)),
  )
  expect(alRenderizar).toHaveBeenCalledTimes(2)
})
