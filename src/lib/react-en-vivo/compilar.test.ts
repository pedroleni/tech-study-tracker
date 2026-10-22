import { describe, expect, it, vi } from 'vitest'

import codigoCompilado from '@/lib/react-kit/__fixtures__/compilador-app.compilado.jsx?raw'
import codigoOriginal from '@/lib/react-kit/__fixtures__/compilador-app.jsx?raw'
import type { SesionCompilador } from '@/lib/react-kit/cliente'

import { compilarArchivosReact } from './compilar'

describe('compilarArchivosReact', () => {
  it('compila JSX y TSX, marca TypeScript y deja TS/CSS intactos', async () => {
    const compilar = vi
      .fn<SesionCompilador['compilar']>()
      .mockResolvedValueOnce({ ok: true, codigo: codigoCompilado, eventos: [] })
      .mockResolvedValueOnce({ ok: true, codigo: 'const vista = <p>{n}</p>', eventos: [] })
    const sesion = { compilar, descartar: vi.fn() }

    const resultado = await compilarArchivosReact(
      [
        { nombre: 'App.jsx', codigo: codigoOriginal },
        { nombre: 'Tarjeta.tsx', codigo: 'export default function Tarjeta({ n }: { n: number }) { return <p>{n}</p> }' },
        { nombre: 'datos.ts', codigo: 'export const n: number = 1' },
        { nombre: 'estilos.css', codigo: 'p { color: red }' },
      ],
      sesion,
    )

    expect(compilar).toHaveBeenNthCalledWith(1, codigoOriginal, { typescript: false })
    expect(compilar).toHaveBeenNthCalledWith(2, expect.stringContaining('Tarjeta'), {
      typescript: true,
    })
    expect(resultado).toEqual({
      archivos: [
        { nombre: 'App.jsx', codigo: codigoCompilado },
        { nombre: 'Tarjeta.tsx', codigo: 'const vista = <p>{n}</p>' },
        { nombre: 'datos.ts', codigo: 'export const n: number = 1' },
        { nombre: 'estilos.css', codigo: 'p { color: red }' },
      ],
      avisos: [],
    })
  })

  it('conserva un archivo que falla, informa con su nombre y aborta si la sesión lo descarta', async () => {
    const fallo: SesionCompilador = {
      compilar: vi.fn().mockResolvedValue({ ok: false, error: 'Sintaxis no compatible' }),
      descartar: vi.fn(),
    }
    expect(
      await compilarArchivosReact([{ nombre: 'App.jsx', codigo: codigoOriginal }], fallo),
    ).toEqual({
      archivos: [{ nombre: 'App.jsx', codigo: codigoOriginal }],
      avisos: [{ archivo: 'App.jsx', error: 'Sintaxis no compatible' }],
    })

    const descartada: SesionCompilador = {
      compilar: vi.fn().mockResolvedValue(null),
      descartar: vi.fn(),
    }
    await expect(
      compilarArchivosReact([{ nombre: 'App.jsx', codigo: codigoOriginal }], descartada),
    ).resolves.toBeNull()
  })
})
