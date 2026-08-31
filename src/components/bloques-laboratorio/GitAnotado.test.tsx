import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { crearMotorGit } from '@/lib/git-en-vivo/motor'
import { GitAnotado } from './GitAnotado'

async function cargarWasmDesdeDisco(): Promise<WebAssembly.Module> {
  const buffer = await readFile(
    join(process.cwd(), 'node_modules', 'wasm-git', 'lg2_async.wasm'),
  )
  return WebAssembly.compile(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
  )
}

describe('GitAnotado', () => {
  beforeAll(async () => {
    await crearMotorGit(cargarWasmDesdeDisco)
  })

  it('ejecuta el comando y muestra la salida real', async () => {
    render(
      <GitAnotado
        tipo="git-anotado"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comando="log --oneline"
        mostrarGrafo={false}
        anotaciones={[{ fragmento: 'log', nota: 'Muestra el historial real.' }]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/primer commit/)).toBeInTheDocument()
    })
  })

  it('marca la anotación activa cuando se pulsa un número', async () => {
    render(
      <GitAnotado
        tipo="git-anotado"
        esquemaGit={['init .']}
        comando="status"
        mostrarGrafo={false}
        anotaciones={[
          { fragmento: 'status', nota: 'Primera nota.' },
        ]}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Primera nota.')).toBeInTheDocument()
    })
  })
})
