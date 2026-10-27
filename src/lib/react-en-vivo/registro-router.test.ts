import { fireEvent, waitFor, within } from '@testing-library/dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import type { MensajeRouterOperacion } from '@/lib/react-en-vivo/mensajes'

import reactRouterReal from '../../../public/vendor/react-en-vivo/react-router/8.5.0/react-router.js?raw'
import reactReal from '../../../public/vendor/react-en-vivo/19.3.1/react.js?raw'
import montaje from './runtime/montaje.js?raw'
import registroRouter from './runtime/registro-router.js?raw'
import routerRuntime from './runtime/router.js?raw'
import { transformarArchivos } from './transformar'

type VentanaRegistro = typeof window & {
  __reactEnVivo?: Record<string, unknown> & { React: { version: string } }
  __reactRouterEnVivo?: Record<string, unknown>
  __configReactEnVivo?: { modulos: Record<string, string>; archivosCss: string[]; strictMode: boolean }
  __enviarReactEnVivo?: ReturnType<typeof vi.fn>
  __routerEnVivo?: { reiniciar: () => void; desmontar?: () => void }
  __registroRouterEnVivo?: { reiniciar: () => void }
  __recargarAppReactEnVivo?: (url: string, accion?: string) => void
  __instrumentacionAlumno?: number
}

const ventana = window as VentanaRegistro
let reactSandbox: NonNullable<VentanaRegistro['__reactEnVivo']>
let routerSandbox: NonNullable<VentanaRegistro['__reactRouterEnVivo']>

beforeAll(() => {
  new Function(reactReal)()
  if (!ventana.__reactEnVivo) throw new Error('No se cargó React')
  reactSandbox = ventana.__reactEnVivo
  new Function(reactRouterReal)()
  if (!ventana.__reactRouterEnVivo) throw new Error('No se cargó React Router')
  routerSandbox = ventana.__reactRouterEnVivo
})

function mensajes(enviar: ReturnType<typeof vi.fn>) {
  return enviar.mock.calls.map(([mensaje]) => mensaje)
}

function operaciones(enviar: ReturnType<typeof vi.fn>) {
  const ultimas = new Map<number, MensajeRouterOperacion>()
  for (const mensaje of mensajes(enviar)) {
    if (mensaje.tipo === 'router-operacion') ultimas.set(mensaje.id, mensaje)
  }
  return [...ultimas.values()]
}

async function instalar(
  codigo: string,
  opciones: { conRegistro?: boolean; strictMode?: boolean } = {},
) {
  const archivos: ArchivoReact[] = [{ nombre: 'App.tsx', codigo }]
  const resultado = await transformarArchivos(archivos)
  if (!resultado.ok) throw new Error(resultado.mensaje)
  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  ventana.__reactEnVivo = reactSandbox
  ventana.__reactRouterEnVivo = routerSandbox
  ventana.__configReactEnVivo = {
    modulos: resultado.modulos,
    archivosCss: resultado.archivosCss,
    strictMode: opciones.strictMode ?? false,
  }
  const enviar = vi.fn()
  ventana.__enviarReactEnVivo = enviar
  if (opciones.conRegistro !== false) new Function(registroRouter)()
  new Function(routerRuntime)()
  new Function(montaje)()
  await waitFor(() => expect(mensajes(enviar)).toContainEqual(expect.objectContaining({ tipo: 'montado' })))
  return enviar
}

async function esperarOperacion(
  enviar: ReturnType<typeof vi.fn>,
  comprobar: (operacion: MensajeRouterOperacion) => boolean,
) {
  let encontrada: MensajeRouterOperacion | undefined
  await waitFor(() => {
    encontrada = operaciones(enviar).find(comprobar)
    expect(encontrada).toBeDefined()
    expect(encontrada?.estado).not.toBe('en-curso')
  })
  return encontrada!
}

afterEach(() => {
  ventana.__routerEnVivo?.desmontar?.()
  ventana.__registroRouterEnVivo?.reiniciar()
  document.body.replaceChildren()
  for (const clave of [
    '__reactEnVivo',
    '__reactRouterEnVivo',
    '__configReactEnVivo',
    '__enviarReactEnVivo',
    '__routerEnVivo',
    '__registroRouterEnVivo',
    '__recargarAppReactEnVivo',
    '__instrumentacionAlumno',
  ]) delete (ventana as unknown as Record<string, unknown>)[clave]
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('registro del router con los bundles reales', () => {
  it('la carga inicial es una operación carga-inicial con el middleware y los dos loader a la vez', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Outlet } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const middleware = async (_args, next) => { await esperar(5); const r = await next(); await esperar(20); return r }
const router = createMemoryRouter([{ path: '/', middleware: [middleware], loader: async () => { await esperar(30); return null }, Component: Outlet, children: [{ path: 'recetas', loader: async () => { await esperar(30); return null }, Component: () => <p>Recetas</p> }] }], { initialEntries: ['/recetas'] })
export default function App() { return <RouterProvider router={router} /> }`)

    const carga = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    const loaders = carga.pasos.filter((paso) => paso.tipo === 'loader')
    const middleware = carga.pasos.find((paso) => paso.tipo === 'middleware')!
    expect(loaders).toHaveLength(2)
    expect(Math.abs(loaders[0].inicio - loaders[1].inicio)).toBeLessThan(10)
    expect(middleware.inicio).toBeLessThanOrEqual(Math.min(...loaders.map((paso) => paso.inicio)))
    expect(middleware.inicio + (middleware.duracion ?? 0)).toBeGreaterThanOrEqual(
      Math.max(...loaders.map((paso) => paso.inicio + (paso.duracion ?? 0))),
    )
  })

  it('una action con Form registra el envío y la revalidación', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Form, Outlet, useLoaderData } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const raiz = () => null
let veces = 0
const recetas = () => ({ veces: ++veces })
const action = async ({ request }) => { await request.formData(); return null }
function Lista() { const d = useLoaderData(); return <><p>{d.veces}</p><Form method="post"><button>Guardar</button></Form></> }
const router = createMemoryRouter([{ id: 'raiz', path: '/', loader: raiz, shouldRevalidate: ({ formMethod, defaultShouldRevalidate }) => formMethod === 'POST' ? false : defaultShouldRevalidate, Component: Outlet, children: [{ id: 'recetas', path: 'recetas', loader: recetas, action, Component: Lista }] }], { initialEntries: ['/recetas'] })
export default function App() { return <RouterProvider router={router} /> }`)
    ;((await within(document.body).findByRole('button', { name: 'Guardar' })).closest('form') as HTMLFormElement).requestSubmit()
    const envio = await esperarOperacion(enviar, (op) => op.clase === 'envio')
    expect(envio).toMatchObject({ metodo: 'POST', estado: 'terminada', sinEjecutar: ['raiz'] })
    expect(envio.pasos).toEqual(expect.arrayContaining([
      expect.objectContaining({ tipo: 'action', ruta: 'recetas', fase: 'envio' }),
      expect.objectContaining({ tipo: 'loader', ruta: 'recetas', fase: 'revalidacion' }),
    ]))
    expect(envio.pasos).not.toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'raiz' }))
  })

  it('un fetcher con POST incluye su action y la revalidación en la misma operación', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useFetcher } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const loader = () => null; const action = async () => null; function AppRuta() { const f = useFetcher(); return <f.Form method="post"><button>Enviar fetcher</button></f.Form> }; const router = createMemoryRouter([{ id: 'raiz', path: '/', loader, action, Component: AppRuta }]); export default function App() { return <RouterProvider router={router} /> }`)
    ;((await within(document.body).findByRole('button', { name: 'Enviar fetcher' })).closest('form') as HTMLFormElement).requestSubmit()
    const op = await esperarOperacion(enviar, (actual) => actual.clase === 'fetcher-envio')
    expect(op.pasos).toEqual(expect.arrayContaining([
      expect.objectContaining({ tipo: 'action', fase: 'envio' }),
      expect.objectContaining({ tipo: 'loader', fase: 'revalidacion' }),
    ]))
  })

  it('un fetcher.load y una navegación lanzados seguidos se atribuyen cada uno a su operación', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useFetcher, useNavigate } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const lento = () => new Promise((r) => setTimeout(() => r(null), 20)); function Inicio() { const f = useFetcher(); const n = useNavigate(); return <button onClick={() => { f.load('/datos'); n('/pagina') }}>Lanzar</button> }; const router = createMemoryRouter([{ path: '/', Component: Inicio }, { id: 'datos', path: '/datos', loader: lento, Component: () => null }, { id: 'pagina', path: '/pagina', loader: lento, Component: () => <p>Página</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Lanzar' }))
    const fetcher = await esperarOperacion(enviar, (op) => op.clase === 'fetcher-carga')
    const navegacion = await esperarOperacion(enviar, (op) => op.clase === 'navegacion' && op.destino === '/pagina')
    expect(fetcher.pasos).toContainEqual(expect.objectContaining({ ruta: 'datos' }))
    expect(navegacion.pasos).toContainEqual(expect.objectContaining({ ruta: 'pagina' }))
  })

  it('una navegación interrumpida queda cancelada por la nueva y su loader lento sale tarde', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useNavigate } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const lento = () => new Promise((r) => setTimeout(() => r(null), 80)); function Inicio() { const n = useNavigate(); return <><button onClick={() => n('/lento')}>Lento</button><button onClick={() => n('/rapido')}>Rápido</button></> }; const router = createMemoryRouter([{ path: '/', Component: Inicio }, { id: 'lento', path: '/lento', loader: lento, Component: () => <p>Lento</p> }, { id: 'rapido', path: '/rapido', loader: () => null, Component: () => <p>Rápido</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Lento' }))
    fireEvent.click(within(document.body).getByRole('button', { name: 'Rápido' }))
    const rapida = await esperarOperacion(enviar, (op) => op.destino === '/rapido')
    await waitFor(() =>
      expect(operaciones(enviar).find((op) => op.destino === '/lento')?.pasos).toContainEqual(
        expect.objectContaining({ tipo: 'loader', ruta: 'lento', tarde: true }),
      ),
    )
    const lenta = operaciones(enviar).find((op) => op.destino === '/lento')!
    expect(lenta).toMatchObject({ estado: 'cancelada', canceladaPor: rapida.id })
    expect(lenta.pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'lento', tarde: true }))
  })

  it('revalidate() es una operación revalidacion', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useRevalidator } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Inicio() { const r = useRevalidator(); return <button onClick={() => r.revalidate()}>Revalidar</button> }; const router = createMemoryRouter([{ path: '/', loader: () => null, Component: Inicio }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Revalidar' }))
    expect(await esperarOperacion(enviar, (op) => op.clase === 'revalidacion')).toMatchObject({ metodo: 'GET' })
  })

  it('un envío cuya action redirige muestra la fase redireccion y urlFinal', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Form, redirect } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Inicio() { return <Form method="post"><button>Enviar</button></Form> }; const router = createMemoryRouter([{ path: '/', action: () => redirect('/fin'), Component: Inicio }, { id: 'fin', path: '/fin', loader: () => null, Component: () => <p>Fin</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    ;((await within(document.body).findByRole('button', { name: 'Enviar' })).closest('form') as HTMLFormElement).requestSubmit()
    const op = await esperarOperacion(enviar, (actual) => actual.clase === 'envio')
    expect(op.urlFinal).toBe('/fin')
    expect(op.pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'fin', fase: 'redireccion' }))
  })

  it('Atrás es una operación atras que termina cuando terminan sus loader', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useNavigate } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Dos() { const n = useNavigate(); return <button onClick={() => n(-1)}>Atrás</button> }; const router = createMemoryRouter([{ id: 'uno', path: '/uno', loader: () => new Promise((r) => setTimeout(() => r(null), 20)), Component: () => <p>Uno</p> }, { path: '/dos', Component: Dos }], { initialEntries: ['/uno', '/dos'], initialIndex: 1 }); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Atrás' }))
    const op = await esperarOperacion(enviar, (actual) => actual.clase === 'atras')
    expect(op).toMatchObject({ estado: 'terminada', urlFinal: '/uno' })
    expect(op.pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'uno', estado: 'ok' }))
  })

  it('un lazy de función se atribuye a la navegación que lo pide, antes de su loader', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Link } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', Component: () => <Link to="/lazy">Lazy</Link> }, { id: 'lazy', path: '/lazy', lazy: async () => ({ loader: () => null, Component: () => <p>Lazy lista</p> }) }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Lazy' }))
    const op = await esperarOperacion(enviar, (actual) => actual.destino === '/lazy')
    const lazy = op.pasos.findIndex((paso) => paso.tipo === 'lazy')
    const loader = op.pasos.findIndex((paso) => paso.tipo === 'loader')
    expect(lazy).toBeGreaterThanOrEqual(0)
    expect(loader).toBeGreaterThan(lazy)
  })

  it.each([
    {
      caso: 'un ErrorBoundary en una ruta madre sin path',
      ruta: `{ ErrorBoundary: () => <p role="alert">Error madre</p>, children: [{ path: 'lazy', lazy: { loader: async () => () => null, Component: () => new Promise((_resolve, reject) => setTimeout(() => reject(new Error('descarga rota')), 20)) } }] }`,
    },
    {
      caso: 'un ErrorBoundary en la propia ruta',
      ruta: `{ path: 'lazy', ErrorBoundary: () => <p role="alert">Error propio</p>, lazy: { loader: async () => () => null, Component: () => new Promise((_resolve, reject) => setTimeout(() => reject(new Error('descarga rota')), 20)) } }`,
    },
  ])('un lazy de objeto que rechaza conserva el mismo DOM con y sin registro: $caso', async ({ ruta }) => {
    const codigo = `import { createMemoryRouter, Link, Outlet, useNavigation } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Marco() { const navegacion = useNavigation(); return <><Link to="/lazy">Abrir lazy</Link><output data-testid="estado">{navegacion.state}</output><Outlet /></> }; const router = createMemoryRouter([{ path: '/', Component: Marco, ErrorBoundary: () => <p role="alert">Error general</p>, children: [{ index: true, Component: () => <p>Inicio</p> }, ${ruta}] }]); export default function App() { return <RouterProvider router={router} /> }`
    await instalar(codigo, { conRegistro: false })
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Abrir lazy' }))
    await waitFor(() => expect(within(document.body).getByTestId('estado')).toHaveTextContent('loading'))
    await waitFor(() => expect(within(document.body).getByTestId('estado')).toHaveTextContent('idle'))
    const sinRegistro = document.querySelector('#root')?.innerHTML

    await instalar(codigo)
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Abrir lazy' }))
    await waitFor(() => expect(within(document.body).getByTestId('estado')).toHaveTextContent('loading'))
    await waitFor(() => expect(within(document.body).getByTestId('estado')).toHaveTextContent('idle'))

    expect(document.querySelector('#root')?.innerHTML).toBe(sinRegistro)
  })

  it('un throw data() de 404 sale en errores con su texto, y un Error, como paso con error', async () => {
    const enviar = await instalar(`import { createMemoryRouter, data, Link, Outlet } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function ErrorBoundary() { return <p>Error visible</p> }; const router = createMemoryRouter([{ path: '/', Component: () => <><Link to="/404">404</Link><Link to="/error">Error</Link><Outlet /></>, ErrorBoundary, children: [{ id: 'no-existe', path: '404', loader: () => { throw data('No existe', { status: 404 }) }, Component: () => null }, { id: 'rota', path: 'error', loader: () => { throw new Error('se rompió') }, Component: () => null }] }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('link', { name: '404' }))
    const cuatro = await esperarOperacion(enviar, (op) => op.destino === '/404')
    expect(cuatro.errores).toContainEqual(expect.objectContaining({ texto: '404 No existe' }))
    ventana.__recargarAppReactEnVivo?.('/', 'ir')
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Error' }))
    const error = await esperarOperacion(enviar, (op) => op.destino === '/error')
    expect(error.pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', estado: 'error', error: 'Error: se rompió' }))
  })

  it('una ruta inexistente no deja la cola desordenada', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useNavigate } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Inicio() { const n = useNavigate(); return <button onClick={async () => { await n('/no-existe'); await n('/bien') }}>Ir</button> }; const router = createMemoryRouter([{ path: '/', Component: Inicio }, { id: 'bien', path: '/bien', loader: () => null, Component: () => <p>Bien</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Ir' }))
    const bien = await esperarOperacion(enviar, (op) => op.destino === '/bien')
    expect(bien.pasos).toContainEqual(expect.objectContaining({ ruta: 'bien' }))
  })

  it('las instrumentations del alumno siguen funcionando y no cambian lo registrado', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Link } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const alumno = { router(r) { r.instrument({ navigate: async (llamar) => { globalThis.__instrumentacionAlumno = (globalThis.__instrumentacionAlumno || 0) + 1; await llamar() } }) } }; const router = createMemoryRouter([{ path: '/', Component: () => <Link to="/b">B</Link> }, { id: 'b', path: '/b', loader: () => null, Component: () => <p>B</p> }], { instrumentations: [alumno] }); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('link', { name: 'B' }))
    const op = await esperarOperacion(enviar, (actual) => actual.destino === '/b')
    expect(ventana.__instrumentacionAlumno).toBe(1)
    expect(op.pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'b' }))
  })

  it('el getContext del alumno sigue funcionando', async () => {
    await instalar(`import { createContext, createMemoryRouter, RouterContextProvider, useLoaderData } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const usuario = createContext('nadie'); const router = createMemoryRouter([{ path: '/', loader: ({ context }) => context.get(usuario), Component: () => <p>{useLoaderData()}</p> }], { getContext: async () => { const c = new RouterContextProvider(); c.set(usuario, 'Ada'); return c } }); export default function App() { return <RouterProvider router={router} /> }`)
    expect(await within(document.body).findByText('Ada')).toBeInTheDocument()
  })

  it('una instrumentación del alumno que lanza no rompe el registro', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const enviar = await instalar(`import { createMemoryRouter, Link } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', Component: () => <Link to="/b">B</Link> }, { id: 'b', path: '/b', loader: () => null, Component: () => <p>B</p> }], { instrumentations: [{ router(r) { r.instrument({ navigate: async () => { throw new Error('instrumentación rota') } }) } }] }); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('link', { name: 'B' }))
    expect(await esperarOperacion(enviar, (op) => op.destino === '/b')).toMatchObject({ estado: 'terminada' })
  })

  it('solo se envía el router activo, y al activarse envía lo que tenía', async () => {
    const enviar = await instalar(`import { useState } from 'react'; import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const oculto = createMemoryRouter([{ id: 'oculto', path: '/', loader: () => null, Component: () => <p>Oculto</p> }]); const visible = createMemoryRouter([{ id: 'visible', path: '/', loader: () => null, Component: () => <p>Visible</p> }]); export default function App() { const [mostrar, setMostrar] = useState(false); return <><button onClick={() => setMostrar(true)}>Mostrar otro</button><RouterProvider router={mostrar ? oculto : visible} /></> }`)
    await waitFor(() => expect(operaciones(enviar).some((op) => op.pasos.some((p) => p.ruta === 'visible'))).toBe(true))
    expect(operaciones(enviar).some((op) => op.pasos.some((p) => p.ruta === 'oculto'))).toBe(false)
    fireEvent.click(within(document.body).getByRole('button', { name: 'Mostrar otro' }))
    await waitFor(() => expect(operaciones(enviar).some((op) => op.pasos.some((p) => p.ruta === 'oculto'))).toBe(true))
  })

  it('recargar empieza un registro nuevo con ids que siguen creciendo', async () => {
    const enviar = await instalar(`import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', loader: () => null, Component: () => <p>Inicio</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    const primero = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    ventana.__recargarAppReactEnVivo?.('/')
    await waitFor(() => expect(operaciones(enviar).some((op) => op.id > primero.id)).toBe(true))
  })

  it('más de 200 operaciones envían router-lleno una sola vez', async () => {
    const routers = Array.from({ length: 201 }, (_, i) => `createMemoryRouter([{ path: '/', loader: () => ${i}, Component: () => null }])`).join(',')
    const enviar = await instalar(`import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const routers = [${routers}]; export default function App() { return <RouterProvider router={routers[200]} /> }`)
    await waitFor(() => expect(mensajes(enviar).filter((m) => m.tipo === 'router-lleno')).toHaveLength(1))
  })

  it('no envía más de un mensaje por operación cada 50 ms', async () => {
    // Seis middleware seguidos de 1 ms: unos catorce cambios en una operación
    // que dura menos de 50 ms. Sin el límite saldría un mensaje por cambio.
    const enviar = await instalar(`import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const esperar = (ms) => new Promise((r) => setTimeout(r, ms)); const paso = async (_a, next) => { await esperar(1); return next() }; const router = createMemoryRouter([{ path: '/', middleware: [paso, paso, paso, paso, paso, paso], loader: async () => { await esperar(1); return null }, Component: () => <p>Inicio</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    const operacion = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    expect(operacion.pasos.length).toBeGreaterThanOrEqual(7)
    const suyos = mensajes(enviar).filter((m) => m.tipo === 'router-operacion' && m.id === operacion.id)
    expect(suyos.length).toBeLessThanOrEqual(4)
  })

  it('sin registro-router.js, router.js funciona igual que antes', async () => {
    await instalar(`import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', loader: () => null, Component: () => <p>Sin registro</p> }]); export default function App() { return <RouterProvider router={router} /> }`, { conRegistro: false })
    expect(await within(document.body).findByText('Sin registro')).toBeInTheDocument()
  })
})

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('operaciones sin navigate instrumentado (carga inicial y revalidación)', () => {
  it('un 404 lanzado con data() en la carga inicial sale en errores', async () => {
    const enviar = await instalar(`import { createMemoryRouter, data } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ id: 'raiz', path: '/', ErrorBoundary: () => <p>Fallo visible</p>, children: [{ id: 'ficha', index: true, loader: () => { throw data('No existe', { status: 404 }) }, Component: () => <p>Ficha</p> }] }]); export default function App() { return <RouterProvider router={router} /> }`)
    await within(document.body).findByText('Fallo visible')
    const operacion = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    expect(operacion.errores).toContainEqual(expect.objectContaining({ texto: '404 No existe' }))
  })

  it('un redirect del middleware en la carga inicial es la fase redireccion de la misma operación', async () => {
    const enviar = await instalar(`import { createMemoryRouter, redirect } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const sesion = async ({ request }) => { const url = new URL(request.url); if (url.pathname.startsWith('/panel')) throw redirect('/entrar?volver=' + url.pathname) }; const router = createMemoryRouter([{ id: 'raiz', path: '/', middleware: [sesion], children: [{ id: 'panel', path: 'panel', loader: () => 'p', Component: () => <p>Panel</p> }, { id: 'entrar', path: 'entrar', loader: () => 'e', Component: () => <p>Entrar</p> }] }], { initialEntries: ['/panel'] }); export default function App() { return <RouterProvider router={router} /> }`)
    await within(document.body).findByText('Entrar')
    const operacion = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    await dormir(30)
    expect(operaciones(enviar).map((op) => op.clase)).toEqual(['carga-inicial'])
    expect(operacion.urlFinal).toBe('/entrar?volver=/panel')
    expect(operaciones(enviar)[0].pasos).toContainEqual(expect.objectContaining({ tipo: 'loader', ruta: 'entrar', fase: 'redireccion' }))
  })

  it('conserva la codificación de la URL final de un redirect', async () => {
    const enviar = await instalar(`import { createMemoryRouter, redirect } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/designaciones', loader: () => redirect('/entrar?volver=' + encodeURIComponent('/designaciones')) }, { path: '/entrar', Component: () => <p>Entrar</p> }], { initialEntries: ['/designaciones'] }); export default function App() { return <RouterProvider router={router} /> }`)
    await within(document.body).findByText('Entrar')
    const operacion = await esperarOperacion(enviar, (op) => op.clase === 'carga-inicial')
    expect(operacion.urlFinal).toBe('/entrar?volver=%2Fdesignaciones')
  })

  it('una revalidación interrumpida por un enlace sale cancelada por la navegación', async () => {
    const enviar = await instalar(`import { createMemoryRouter, Link, useRevalidator } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const lento = () => new Promise((r) => setTimeout(() => r('x'), 120)); function Inicio() { const r = useRevalidator(); return <><button onClick={() => r.revalidate()}>Revalidar</button><Link to="/otra">Otra</Link></> }; const router = createMemoryRouter([{ id: 'inicio', path: '/', loader: lento, Component: Inicio }, { id: 'otra', path: '/otra', loader: () => 'o', Component: () => <p>Otra</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Revalidar' }, { timeout: 2000 }))
    await dormir(20)
    fireEvent.click(within(document.body).getByRole('link', { name: 'Otra' }))
    await dormir(300)
    const revalidacion = operaciones(enviar).find((op) => op.clase === 'revalidacion')!
    const navegacion = operaciones(enviar).find((op) => op.clase === 'navegacion')!
    expect(revalidacion.estado).toBe('cancelada')
    expect(revalidacion.canceladaPor).toBe(navegacion.id)
    expect(revalidacion.sinEjecutar).toBeUndefined()
  })

  it('revalidate() sin loader que ejecutar es una revalidación que termina', async () => {
    const enviar = await instalar(`import { createMemoryRouter, useRevalidator } from 'react-router'; import { RouterProvider } from 'react-router/dom'; function Inicio() { const r = useRevalidator(); return <button onClick={() => r.revalidate()}>Revalidar</button> }; const router = createMemoryRouter([{ id: 'inicio', path: '/', Component: Inicio }]); export default function App() { return <RouterProvider router={router} /> }`)
    fireEvent.click(await within(document.body).findByRole('button', { name: 'Revalidar' }))
    await dormir(200)
    expect(operaciones(enviar)).toEqual([expect.objectContaining({ clase: 'revalidacion', estado: 'terminada' })])
  })

  it('un getContext del alumno que lanza propaga su error, como sin registro', async () => {
    await instalar(`import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', Component: () => <p>Inicio</p> }]); export default function App() { return <RouterProvider router={router} /> }`)
    const registro = ventana.__registroRouterEnVivo as unknown as {
      prepararOpciones: (o: { getContext: () => Promise<unknown> }) => { opciones: { getContext: () => Promise<unknown> } }
    }
    const { opciones } = registro.prepararOpciones({ getContext: async () => { throw new Error('getContext roto') } })
    await expect(opciones.getContext()).rejects.toThrow('getContext roto')
  })
})
