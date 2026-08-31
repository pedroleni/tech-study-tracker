import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { crearMotorGit } from '@/lib/git-en-vivo/motor'
import { GitEnVivo } from './GitEnVivo'

async function cargarWasmDesdeDisco(): Promise<ArrayBuffer> {
  const buffer = await readFile(
    join(process.cwd(), 'node_modules', 'wasm-git', 'lg2_async.wasm'),
  )
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

describe('GitEnVivo', () => {
  beforeAll(async () => {
    await crearMotorGit(cargarWasmDesdeDisco)
  })

  it('ejecuta el comando inicial y muestra el resultado real', async () => {
    render(
      <GitEnVivo
        tipo="git-en-vivo"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comandoInicial="log --oneline"
        mostrarGrafo={false}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/primer commit/)).toBeInTheDocument()
    })
  })

  it('marca "Coincide con la solución" cuando el comando escrito produce la misma salida', async () => {
    render(
      <GitEnVivo
        tipo="git-en-vivo"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comandoInicial="status"
        comandoSolucion="log --oneline"
        mostrarGrafo={false}
      />,
    )

    const campo = await screen.findByRole('textbox')
    userEvent.clear(campo)
    userEvent.type(campo, 'log --oneline')

    await waitFor(
      () => {
        expect(screen.getByText('Coincide con la solución')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it('no tiene infracciones de accesibilidad', async () => {
    const { container } = render(
      <GitEnVivo
        tipo="git-en-vivo"
        esquemaGit={['init .']}
        comandoInicial=""
        mostrarGrafo={false}
      />,
    )

    await screen.findByRole('textbox')
    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
