import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import type { GrafoGit } from '@/lib/git-en-vivo/motor'

import { GrafoCommits } from './GrafoCommits'

const grafo: GrafoGit = {
  commits: [
    { hash: 'aaaa', hashCorto: 'aaaa', mensaje: 'v1', padres: [] },
    {
      hash: 'bbbb',
      hashCorto: 'bbbb',
      mensaje: 'v2',
      padres: ['aaaa'],
    },
  ],
  ramas: [{ nombre: 'master', hash: 'bbbb' }],
  ramaActual: 'master',
}

describe('GrafoCommits', () => {
  it('muestra una etiqueta por cada rama', () => {
    render(<GrafoCommits grafo={grafo} />)

    expect(screen.getByText('master')).toBeInTheDocument()
    expect(screen.getByText('aaaa')).toBeInTheDocument()
    expect(screen.getByText('bbbb')).toBeInTheDocument()
  })

  it('no tiene infracciones de accesibilidad', async () => {
    const { container } = render(<GrafoCommits grafo={grafo} />)

    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
