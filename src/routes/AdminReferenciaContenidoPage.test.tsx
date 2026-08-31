import { act, render, screen } from '@testing-library/react'
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
  'EsquemaDePagina',
  'CapasDeCaja',
  'EditorEnVivo',
  'SqlAnotado',
  'SqlEnVivo',
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
    // { matches: true } a secas basta para el resto del catálogo, pero
    // EditorEnVivo monta un EditorView de CodeMirror de verdad, que además
    // necesita addEventListener/addListener en el objeto devuelto (ver
    // src/test/setup.ts) — el stub global no aplica aquí porque este test
    // lo sobrescribe con uno más simple pensado solo para el modo oscuro.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    )
    vi.spyOn(window, 'setInterval').mockImplementation(
      (() => 0) as unknown as typeof window.setInterval,
    )
    // SqlAnotado/SqlEnVivo cargan sql.js con fetch('/sql-wasm.wasm') al montar
    // — no existe servidor en este entorno de test, así que se stubea para
    // que rechace de inmediato y los dos componentes se asienten en su
    // estado de error antes de la aserción de accesibilidad, en vez de
    // dejar una actualización de estado pendiente fuera de act().
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fetch no disponible en test')))
    const { container } = render(<AdminReferenciaContenidoPage />)
    await act(async () => {
      await Promise.resolve()
    })

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
