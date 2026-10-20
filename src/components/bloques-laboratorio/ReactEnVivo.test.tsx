import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DatosReactEnVivo } from '@/lib/laboratorio/schemas'

import { ReactEnVivo } from './ReactEnVivo'

// CodeMirror no se deja teclear en jsdom: aquí se prueba la lógica del
// bloque, así que el editor se sustituye por un textarea con su etiqueta.
vi.mock('@/components/bloques-laboratorio/EditorCodeMirror', () => ({
  EditorCodeMirror: ({
    etiqueta,
    valor,
    onChange,
  }: {
    etiqueta: string
    valor: string
    onChange: (valor: string) => void
  }) => <textarea aria-label={etiqueta} value={valor} onChange={(e) => onChange(e.target.value)} />,
}))

const app = "import './estilos.css'\nexport default function App() {\n  return <p>Hola</p>\n}"

const datos: DatosReactEnVivo = {
  tipo: 'react-en-vivo',
  archivos: [
    { nombre: 'App.jsx', codigo: app },
    { nombre: 'estilos.css', codigo: 'p { color: red; }' },
  ],
  strictMode: true,
  mostrarConsola: true,
  mostrarJsGenerado: true,
  mostrarArbol: false,
  mostrarEfectos: false,
  comprobaciones: [
    { descripcion: 'Saluda', pasos: [], espera: { texto: 'Hola' } },
    { descripcion: 'Guarda', pasos: [{ pulsar: { rol: 'button', nombre: 'Guardar' } }], espera: { texto: 'Guardado' } },
  ],
}

const vista = () => screen.getByTitle('Vista previa de React') as HTMLIFrameElement

function enviarDesde(origen: Window | null, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, source: origen }))
  })
}

async function renderizarListo(props: DatosReactEnVivo = datos) {
  render(<ReactEnVivo {...props} />)
  await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('jsxDEV'))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ReactEnVivo', () => {
  it('una pestaña por archivo y otra para el JavaScript generado; abre archivoInicial', async () => {
    await renderizarListo({ ...datos, archivoInicial: 'estilos.css' })

    expect(screen.getByRole('button', { name: 'App.jsx' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'estilos.css' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Editor de estilos.css')).toHaveValue('p { color: red; }')

    fireEvent.click(screen.getByRole('button', { name: 'JavaScript generado' }))
    await waitFor(() =>
      expect(screen.getByLabelText('JavaScript generado por Sucrase')).toHaveTextContent('_jsx('),
    )
  })

  it('la vista previa carga el runtime propio y el código transformado', async () => {
    await renderizarListo()

    expect(vista().getAttribute('srcdoc')).toContain('/vendor/react-en-vivo/19.3.1/react.js')
    expect(vista().getAttribute('srcdoc')).not.toContain('/vendor/react-en-vivo/19.3.1/pruebas.js')
  })

  it('un error de sintaxis no rompe la vista previa', async () => {
    await renderizarListo()
    const valido = vista().getAttribute('srcdoc')

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() {\n  return <div>\n}' },
    })

    expect(
      await screen.findByText('Error de sintaxis en App.jsx, línea 2: Unterminated JSX contents', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toBe(valido)
  })

  it('Reiniciar devuelve los archivos originales', async () => {
    await renderizarListo()
    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), { target: { value: 'otra cosa' } })

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(screen.getByLabelText('Editor de App.jsx')).toHaveValue(app)
  })

  it('la consola agrupa por commit, se limpia, guarda las 200 últimas e ignora otras ventanas', async () => {
    await renderizarListo()
    const consola = screen.getByRole('log')

    for (const [texto, commit] of [['render', 0], ['render', 0], ['efecto', 1]] as const) {
      enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto, commit })
    }
    enviarDesde(window, { canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto: 'intruso', commit: 0 })
    await waitFor(() => expect(within(consola).getAllByText('render')).toHaveLength(2))
    expect(within(consola).getAllByText('commit 1')).toHaveLength(1)
    expect(within(consola).queryByText('intruso')).toBeNull()

    fireEvent.click(within(screen.getByRole('region', { name: 'React en vivo' })).getByRole('button', { name: 'Limpiar' }))
    expect(within(consola).queryByText('render')).toBeNull()

    for (let numero = 1; numero <= 250; numero += 1) {
      enviarDesde(vista().contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'consola',
        nivel: 'log',
        texto: `mensaje ${numero}`,
        commit: 2,
      })
    }
    await waitFor(() => expect(within(consola).getAllByText(/^mensaje \d+$/)).toHaveLength(200))
    expect(within(consola).getAllByText(/^mensaje \d+$/)[0]).toHaveTextContent('mensaje 51')
  })

  it('Comprobar lanza el iframe oculto, envía las comprobaciones y pinta el resultado', async () => {
    await renderizarListo()

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto).toHaveAttribute('aria-hidden', 'true')
    expect(oculto.getAttribute('srcdoc')).toContain('/vendor/react-en-vivo/19.3.1/pruebas.js')

    const enviado = vi.spyOn(oculto.contentWindow!, 'postMessage')
    enviarDesde(oculto.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviado).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'comprobar', comprobaciones: datos.comprobaciones },
      '*',
    )

    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [
        { descripcion: 'Saluda', ok: true },
        { descripcion: 'Guarda', ok: false, motivo: 'No encuentro ningún botón llamado «Guardar».' },
      ],
    })
    expect(await screen.findByText('1 de 2 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.getByText('No encuentro ningún botón llamado «Guardar».')).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
  })

  it('si la comprobación no responde, avisa a los 15 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderizarListo()

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    await screen.findByTitle('Comprobaciones')
    // El temporizador lo programa el efecto del iframe oculto, que puede no
    // haber corrido aún: primero se vacían los efectos pendientes, luego se
    // adelanta el reloj, y se comprueba sin esperas (un waitFor dispararía su
    // propio temporizador falso).
    await act(async () => {})
    act(() => {
      vi.advanceTimersByTime(15_000)
    })

    expect(
      screen.getByText('La comprobación tardó demasiado. Revisa si tu código se queda en un bucle.'),
    ).toBeInTheDocument()
  })

  it('Reiniciar vuelve a arrancar la app aunque el código no haya cambiado', async () => {
    await renderizarListo()
    const antes = vista()

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(vista()).not.toBe(antes)
  })

  it('Comprobar conserva el foco del teclado', async () => {
    await renderizarListo()
    const boton = screen.getByRole('button', { name: 'Comprobar' })
    boton.focus()

    fireEvent.click(boton)
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    // Mientras comprueba no se desactiva del todo (perdería el foco), solo se marca.
    expect(boton).not.toBeDisabled()
    expect(boton).toHaveAttribute('aria-disabled', 'true')

    // user-event, dentro del iframe oculto, se lleva el foco allí.
    oculto.focus()
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [{ descripcion: 'Saluda', ok: true }],
    })
    await screen.findByText('1 de 1 comprobaciones superadas')
    expect(document.activeElement).toBe(boton)
  })

  it('con mostrarArbol muestra el panel «Árbol de renders» y pinta el mensaje arbol que llega del iframe', async () => {
    await renderizarListo({ ...datos, mostrarArbol: true })

    expect(vista().getAttribute('srcdoc')).toContain('__resaltados-react-en-vivo')
    expect(screen.getByRole('heading', { name: 'Árbol de renders' })).toBeInTheDocument()
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'App', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(await screen.findByText('Commit 1 · 0 renderizados · 1 montado · 1 cambio en el DOM')).toBeInTheDocument()
  })

  it('sin mostrarArbol no hay panel ni se pide arbol.js', async () => {
    await renderizarListo()

    expect(vista().getAttribute('srcdoc')).not.toContain('__resaltados-react-en-vivo')
    expect(screen.queryByRole('heading', { name: 'Árbol de renders' })).toBeNull()
  })

  it('al reconstruir ignora árboles rezagados hasta que el documento nuevo está montado', async () => {
    await renderizarListo({ ...datos, mostrarArbol: true })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'App', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    await screen.findByText(/^Commit 1/)

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() {\n  return <p>Adiós</p>\n}' },
    })
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Adiós'), { timeout: 3000 })
    expect(screen.queryByText(/^Commit 1/)).toBeNull()
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()

    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 2,
      nodos: [{ id: 1, nivel: 0, nombre: 'Viejo', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()
    expect(screen.queryByText('Viejo')).toBeNull()

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'Nuevo', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(await screen.findByText('Nuevo')).toBeInTheDocument()
  })

  it('sin comprobaciones no ofrece Comprobar; sin consola no la pinta', async () => {
    await renderizarListo({ ...datos, comprobaciones: undefined, mostrarConsola: false })

    expect(screen.queryByRole('button', { name: 'Comprobar' })).toBeNull()
    expect(screen.queryByRole('log')).toBeNull()
  })

  it('con api muestra Red, pasa api y red al documento y envía los controles al iframe', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: { latencia: 600, desordenar: false },
    })
    expect(screen.getByRole('heading', { name: 'Red' })).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toContain('Salmorejo')
    expect(vista().getAttribute('srcdoc')).toContain('window.__redReactEnVivo =')

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    const enviar = vi.spyOn(vista().contentWindow!, 'postMessage')
    fireEvent.change(screen.getByRole('slider', { name: 'Latencia' }), { target: { value: '900' } })
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'red', latencia: 900, desordenar: false },
      '*',
    )
  })

  it('con mostrarEfectos muestra el registro y pide efectos.js', async () => {
    await renderizarListo({ ...datos, mostrarEfectos: true })
    expect(screen.getByRole('heading', { name: 'Efectos' })).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toContain('window.__efectosReactEnVivo = { envolver }')
  })

  it('al reconstruir vacía el registro de peticiones y el de efectos', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      mostrarEfectos: true,
    })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'peticion',
      id: 1,
      metodo: 'GET',
      ruta: '/api/recetas',
      estado: 'ok',
      codigo: 200,
      ms: 600,
    })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'efecto',
      commit: 1,
      componente: 'App',
      archivo: 'App.jsx',
      linea: 2,
      accion: 'efecto',
      clase: 'useEffect',
      motivo: 'montaje',
      cambios: [],
    })
    expect(await screen.findByText('GET /api/recetas · 200 · 600 ms')).toBeInTheDocument()
    expect(screen.getByText('App ▶ efecto · montaje')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Nuevo'), { timeout: 3000 })
    expect(screen.queryByText('GET /api/recetas · 200 · 600 ms')).toBeNull()
    expect(screen.queryByText('App ▶ efecto · montaje')).toBeNull()
  })

  it('el documento de comprobación lleva la red de comprobación a latencia 0', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: undefined,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto.getAttribute('srcdoc')).toContain('"red":{"latencia":0,"desordenar":false}')
  })
})
