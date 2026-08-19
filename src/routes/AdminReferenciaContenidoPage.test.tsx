import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { AdminReferenciaContenidoPage } from './AdminReferenciaContenidoPage'

const nombresComponentes = [
  'Callout',
  'Acordeon',
  'Pestanas',
  'LineaDeTiempo',
  'Pasos',
  'CitaDestacada',
  'TarjetaEstadistica',
  'GrupoInsignias',
  'TerminoGlosario',
  'ListaComprobacion',
  'TablaComparativa',
  'RequisitosPrevios',
  'MedidorDificultad',
  'BannerAlerta',
  'TarjetaExpandible',
  'CuadriculaRecursos',
  'BarraProgresoLectura',
  'ResumenTLDR',
  'ComparacionCodigo',
  'TarjetaRecursoExterno',
] as const

describe('AdminReferenciaContenidoPage', () => {
  it('renderiza el catálogo completo sin errores ni violaciones de accesibilidad', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { container } = render(<AdminReferenciaContenidoPage />)

    expect(screen.getByRole('heading', { name: 'Componentes de contenido' })).toBeInTheDocument()
    for (const nombre of nombresComponentes) {
      expect(screen.getByRole('heading', { name: `${nombre}.tsx` })).toBeInTheDocument()
    }

    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
