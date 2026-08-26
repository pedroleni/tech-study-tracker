import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { AdminReferenciaContenidoPage } from './AdminReferenciaContenidoPage'

const nombresComponentes = [
  'PrediceElResultado',
  'CodigoAnotado',
  'ComparadorAntesDespues',
  'NotasClave',
  'DiagramaEtiqueta',
  'Callout',
  'LineaDeTiempo',
  'Roles',
  'Recursos',
  'Mitos',
  'VistaPreviaSocial',
  'MapaDeRegiones',
  'Acordeon',
  'Pestanas',
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
  'BarraProgresoLectura',
  'ResumenTLDR',
  'ComparacionCodigo',
  'TarjetaRecursoExterno',
  'CarruselTarjetas',
  'CarruselCoverflow',
  'CarruselAutoplay',
  'GaleriaMiniaturas',
  'CarruselVertical',
  'TarjetaVolteable',
  'TarjetaInclinacion',
  'CuboGirable',
  'PilaTarjetas',
  'LibroPagina',
  'RevelarAlDesplazar',
  'ContadorEnScroll',
  'ParallaxCapa',
  'IndicadorScrollSecciones',
  'AparicionEscalonada',
  'TickerHorizontal',
  'TextoRotativo',
  'MaquinaEscribir',
  'ContadorRegresivo',
  'AntesDespuesDeslizante',
  'RuedaProgreso',
  'InterruptorAnimado',
  'TarjetaConfeti',
  'BotonMagnetico',
  'IndicadorEscritura',
  'GraficoBarras',
  'MapaCalor',
  'ArbolExpandible',
  'NubeEtiquetas',
  'LineaComparativaAnimada',
] as const

describe('AdminReferenciaContenidoPage', () => {
  it('renderiza el catálogo completo sin errores ni violaciones de accesibilidad', async () => {
    // Monta 60+ componentes reales más una auditoría axe completa — el
    // timeout por defecto de Vitest (5000ms) se queda corto según crece
    // el catálogo, sin que eso indique un problema real.
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    vi.spyOn(window, 'setInterval').mockImplementation(
      (() => 0) as unknown as typeof window.setInterval,
    )
    const { container } = render(<AdminReferenciaContenidoPage />)

    expect(screen.getByRole('heading', { name: 'Componentes de contenido' })).toBeInTheDocument()
    for (const nombre of nombresComponentes) {
      expect(screen.getByRole('heading', { name: `${nombre}.tsx` })).toBeInTheDocument()
    }

    const resultados = await axe(container, {
      iframes: false,
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  }, 20_000)
})
