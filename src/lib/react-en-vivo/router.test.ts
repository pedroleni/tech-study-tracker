import { fireEvent, waitFor, within } from '@testing-library/dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact, ComprobacionReact } from '@/lib/laboratorio/schemas'

import reactRouterReal from '../../../public/vendor/react-en-vivo/react-router/8.5.0/react-router.js?raw'
import reactReal from '../../../public/vendor/react-en-vivo/19.3.1/react.js?raw'
import montaje from './runtime/montaje.js?raw'
import red from './runtime/red.js?raw'
import routerRuntime from './runtime/router.js?raw'
import { transformarArchivos } from './transformar'

type Resultado = { descripcion: string; ok: boolean; motivo?: string }
type VentanaRouter = typeof window & {
  __reactEnVivo?: Record<string, unknown> & { React: { version: string } }
  __reactRouterEnVivo?: Record<string, unknown>
  __configReactEnVivo?: {
    modulos: Record<string, string>
    archivosCss: string[]
    strictMode: boolean
    urlInicial?: string
    api?: Record<string, unknown[]>
    red?: { latencia: number; desordenar: boolean }
  }
  __enviarReactEnVivo?: ReturnType<typeof vi.fn>
  __routerEnVivo?: {
    espacios?: Record<string, unknown>
    error?: string
    reiniciar: () => void
    desmontar?: () => void
  }
  __redReactEnVivo?: { reiniciar: () => void }
  __comprobarReactEnVivo?: (comprobaciones: ComprobacionReact[]) => Promise<Resultado[]>
  __pruebasEnVivo?: Record<string, unknown>
  __recargarAppReactEnVivo?: (url: string) => void
  __documentosPruebaRouter?: number
  __evaluacionesPruebaRouter?: number
}

const ventana = window as VentanaRouter
let reactSandbox: NonNullable<VentanaRouter['__reactEnVivo']>
let routerSandbox: NonNullable<VentanaRouter['__reactRouterEnVivo']>
const consolaOriginal = { info: console.info, error: console.error }

beforeAll(() => {
  new Function(reactReal)()
  if (!ventana.__reactEnVivo) throw new Error('No se cargó React')
  reactSandbox = ventana.__reactEnVivo
  new Function(reactRouterReal)()
  if (!ventana.__reactRouterEnVivo) throw new Error('No se cargó React Router')
  routerSandbox = ventana.__reactRouterEnVivo
})

function mensajesDe(enviar: ReturnType<typeof vi.fn>) {
  return enviar.mock.calls.map(([mensaje]) => mensaje)
}

function enviarOrden(accion: 'atras' | 'adelante' | 'recargar' | 'ir', url?: string, source: Window | null = window) {
  window.dispatchEvent(new MessageEvent('message', {
    source,
    data: { canal: 'react-en-vivo', tipo: 'navegador', accion, ...(url ? { url } : {}) },
  }))
}

async function instalar(
  archivos: ArchivoReact[],
  opciones: {
    strictMode?: boolean
    urlInicial?: string
    api?: Record<string, unknown[]>
    conBundleRouter?: boolean
    conRuntimeRouter?: boolean
  } = {},
) {
  const resultado = await transformarArchivos(archivos)
  if (!resultado.ok) throw new Error(resultado.mensaje)
  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  ventana.__reactEnVivo = reactSandbox
  if (opciones.conBundleRouter !== false) ventana.__reactRouterEnVivo = routerSandbox
  else delete ventana.__reactRouterEnVivo
  const enviar = vi.fn()
  ventana.__enviarReactEnVivo = enviar
  ventana.__configReactEnVivo = {
    modulos: resultado.modulos,
    archivosCss: resultado.archivosCss,
    strictMode: opciones.strictMode ?? false,
    ...(opciones.urlInicial ? { urlInicial: opciones.urlInicial } : {}),
    ...(opciones.api
      ? { api: opciones.api, red: { latencia: 0, desordenar: false } }
      : {}),
  }
  if (opciones.api) new Function(red)()
  if (opciones.conRuntimeRouter !== false) new Function(routerRuntime)()
  new Function(montaje)()
  await waitFor(() => expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'montado' })))
  return enviar
}

async function instalarPruebas() {
  ventana.__pruebasEnVivo = {
    ...(await import('@testing-library/dom')),
    userEvent: {
      setup: () => ({
        clear: vi.fn(),
        type: vi.fn(),
        click: async (elemento: Element) => fireEvent.click(elemento),
        keyboard: vi.fn(),
        selectOptions: vi.fn(),
      }),
    },
  }
}

afterEach(() => {
  ventana.__routerEnVivo?.desmontar?.()
  ventana.__redReactEnVivo?.reiniciar?.()
  console.info = consolaOriginal.info
  console.error = consolaOriginal.error
  document.body.replaceChildren()
  for (const clave of [
    '__reactEnVivo',
    '__reactRouterEnVivo',
    '__configReactEnVivo',
    '__enviarReactEnVivo',
    '__routerEnVivo',
    '__redReactEnVivo',
    '__comprobarReactEnVivo',
    '__pruebasEnVivo',
    '__recargarAppReactEnVivo',
    '__documentosPruebaRouter',
    '__evaluacionesPruebaRouter',
  ]) delete (ventana as unknown as Record<string, unknown>)[clave]
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('React Router en el runtime', () => {
  it('el bundle no lleva su propia copia de React', () => {
    expect(reactRouterReal).not.toContain('__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE')
    expect(reactReal).toContain('__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE')
    expect(reactRouterReal).toContain('react-router v8.5.0')
  })

  it('monta un createMemoryRouter con loader, envía un Form a la action, revalida y pinta el 404 lanzado en el ErrorBoundary', async () => {
    await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, data, Form, useLoaderData, useRouteError } from 'react-router'
import { RouterProvider } from 'react-router/dom'
let cargas = 0
const recetas = ['Migas']
async function loader() { cargas += 1; return { recetas: [...recetas], cargas } }
async function action({ request }) { const form = await request.formData(); recetas.push(String(form.get('nombre'))); return null }
function Inicio() { const datos = useLoaderData(); return <><p>{datos.recetas.join(', ')}</p><p>Cargas: {datos.cargas}</p><Form method="post"><input name="nombre" defaultValue="Pisto" /><button>Guardar</button></Form></> }
function ErrorBoundary() { const error = useRouteError(); return <p>{error.status}</p> }
const router = createMemoryRouter([{ path: '/', loader, action, Component: Inicio, ErrorBoundary }, { path: '/nada', loader() { throw data('No existe', { status: 404 }) }, Component: Inicio, ErrorBoundary }])
export default function App() { return <RouterProvider router={router} /> }` }])

    expect(await within(document.body).findByText('Migas')).toBeInTheDocument()
    ;(within(document.body).getByRole('button', { name: 'Guardar' }).closest('form') as HTMLFormElement).requestSubmit()
    expect(await within(document.body).findByText('Migas, Pisto')).toBeInTheDocument()
    expect(within(document.body).getByText('Cargas: 2')).toBeInTheDocument()
    enviarOrden('ir', '/nada')
    expect(await within(document.body).findByText('404')).toBeInTheDocument()
  })

  it('el router y el alumno comparten React: con StrictMode no hay Invalid hook call', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const router = createMemoryRouter([{ path: '/', Component: () => <p>Compartido</p> }])
export default function App() { return <RouterProvider router={router} /> }` }], { strictMode: true })
    expect(await within(document.body).findByText('Compartido')).toBeInTheDocument()
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/Invalid hook call/)
  })

  it('el middleware de cliente pasa un valor al loader con createContext', async () => {
    await instalar([{ nombre: 'App.tsx', codigo: `import { createContext, createMemoryRouter, useLoaderData } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const usuario = createContext('sin usuario')
const middleware = async ({ context }, next) => { context.set(usuario, 'Ada'); return next() }
const loader = ({ context }) => context.get(usuario)
function Inicio() { return <p>{useLoaderData()}</p> }
const router = createMemoryRouter([{ path: '/', middleware: [middleware], loader, Component: Inicio }])
export default function App() { return <RouterProvider router={router} /> }` }])
    expect(await within(document.body).findByText('Ada')).toBeInTheDocument()
  })

  it('envía ubicacion al montar y al navegar, con puedeAtras y puedeAdelante correctos tras atrás y adelante', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, Link } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const router = createMemoryRouter([{ path: '/', Component: () => <Link to="/recetas">Recetas</Link> }, { path: '/recetas', Component: () => <p>Lista</p> }])
export default function App() { return <RouterProvider router={router} /> }` }])
    await waitFor(() =>
      expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'ubicacion', url: '/', puedeAtras: false, puedeAdelante: false, origen: 'createMemoryRouter' })),
    )
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Recetas' }))
    await waitFor(() => expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'ubicacion', url: '/recetas', puedeAtras: true })))
    enviarOrden('atras')
    await waitFor(() => expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'ubicacion', url: '/', puedeAdelante: true })))
    enviarOrden('adelante')
    expect(await within(document.body).findByText('Lista')).toBeInTheDocument()
  })

  it('recargar conserva las entradas y el índice, e ir añade una entrada y descarta las de delante', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, Link, useLocation } from 'react-router'
import { RouterProvider } from 'react-router/dom'
globalThis.__documentosPruebaRouter = (globalThis.__documentosPruebaRouter || 0) + 1
const documento = globalThis.__documentosPruebaRouter
function Pagina() { const { pathname } = useLocation(); return <><p>{pathname} · documento {documento}</p><Link to="/uno">Uno</Link><Link to="/dos">Dos</Link></> }
const router = createMemoryRouter([{ path: '*', Component: Pagina }], { initialEntries: ['/inicio'] })
export default function App() { return <RouterProvider router={router} /> }` }])

    fireEvent.click(await within(document.body).findByRole('link', { name: 'Uno' }))
    expect(await within(document.body).findByText('/uno · documento 1')).toBeInTheDocument()
    fireEvent.click(within(document.body).getByRole('link', { name: 'Dos' }))
    expect(await within(document.body).findByText('/dos · documento 1')).toBeInTheDocument()
    enviarOrden('atras')
    expect(await within(document.body).findByText('/uno · documento 1')).toBeInTheDocument()

    enviarOrden('recargar')
    expect(await within(document.body).findByText('/uno · documento 2')).toBeInTheDocument()
    await waitFor(() =>
      expect(mensajesDe(enviar).at(-1)).toEqual(
        expect.objectContaining({ tipo: 'ubicacion', url: '/uno', puedeAtras: true, puedeAdelante: true }),
      ),
    )
    enviarOrden('atras')
    expect(await within(document.body).findByText('/inicio · documento 2')).toBeInTheDocument()
    enviarOrden('adelante')
    expect(await within(document.body).findByText('/uno · documento 2')).toBeInTheDocument()

    enviarOrden('ir', '/nueva')
    expect(await within(document.body).findByText('/nueva · documento 3')).toBeInTheDocument()
    enviarOrden('atras')
    expect(await within(document.body).findByText('/uno · documento 3')).toBeInTheDocument()
    enviarOrden('adelante')
    expect(await within(document.body).findByText('/nueva · documento 3')).toBeInTheDocument()
  })

  it('createBrowserRouter va a memoria, arranca en / y avisa una sola vez en la consola', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
const uno = createBrowserRouter([{ path: '/', Component: () => <p>Uno</p> }])
const dos = createBrowserRouter([{ path: '/', Component: () => <p>Dos</p> }])
export default function App() { return <RouterProvider router={uno} /> }` }])
    expect(await within(document.body).findByText('Uno')).toBeInTheDocument()
    expect(info.mock.calls.filter(([texto]) => String(texto).includes('historial en memoria'))).toHaveLength(1)
    expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'ubicacion', url: '/', origen: 'createBrowserRouter' }))
  })

  it('createHashRouter, BrowserRouter y HashRouter también van a memoria y envían ubicacion', async () => {
    for (const origen of ['createHashRouter', 'BrowserRouter', 'HashRouter'] as const) {
      const cuerpo = origen === 'createHashRouter'
        ? `const router = createHashRouter([{ path: '/', Component: () => <Link to="/juegos">Juegos</Link> }, { path: '/juegos', Component: () => <p>Lista</p> }]); export default function App() { return <RouterProvider router={router} /> }`
        : `export default function App() { return <${origen}><Routes><Route path="/" element={<Link to="/juegos">Juegos</Link>} /><Route path="/juegos" element={<p>Lista</p>} /></Routes></${origen}> }`
      const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { ${origen}, Link, Routes, Route } from 'react-router'
import { RouterProvider } from 'react-router/dom'
${cuerpo}` }])
      fireEvent.click(await within(document.body).findByRole('link', { name: 'Juegos' }))
      await waitFor(() => expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'ubicacion', url: '/juegos', origen })))
      ventana.__routerEnVivo?.reiniciar()
    }
  })

  it('urlInicial de la configuración sustituye a initialEntries en createMemoryRouter y en MemoryRouter', async () => {
    for (const declarativo of [false, true]) {
      const codigo = declarativo
        ? `import { MemoryRouter, Routes, Route } from 'react-router'; export default function App() { return <MemoryRouter initialEntries={['/otra']}><Routes><Route path="/inicio" element={<p>Inicio</p>} /><Route path="/otra" element={<p>Otra</p>} /></Routes></MemoryRouter> }`
        : `import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/inicio', Component: () => <p>Inicio</p> }, { path: '/otra', Component: () => <p>Otra</p> }], { initialEntries: ['/otra'] }); export default function App() { return <RouterProvider router={router} /> }`
      await instalar([{ nombre: 'App.tsx', codigo }], { urlInicial: '/inicio' })
      expect(await within(document.body).findByText('Inicio')).toBeInTheDocument()
      ventana.__routerEnVivo?.reiniciar()
    }
  })

  it('ir recarga la app en esa URL: los módulos se evalúan de nuevo y el loader se repite', async () => {
    await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, useLoaderData } from 'react-router'; import { RouterProvider } from 'react-router/dom'; globalThis.__evaluacionesPruebaRouter = (globalThis.__evaluacionesPruebaRouter || 0) + 1; let cargas = 0; const loader = ({ request }) => ({ evaluaciones: globalThis.__evaluacionesPruebaRouter, cargas: ++cargas, url: new URL(request.url).pathname }); function Pagina() { const d = useLoaderData(); return <p>E{d.evaluaciones} C{d.cargas} {d.url}</p> }; const router = createMemoryRouter([{ path: '*', loader, Component: Pagina }]); export default function App() { return <RouterProvider router={router} /> }` }])
    expect(await within(document.body).findByText('E1 C1 /')).toBeInTheDocument()
    enviarOrden('ir', '/otra')
    expect(await within(document.body).findByText('E2 C1 /otra')).toBeInTheDocument()
  })

  it.each(['react-router', 'react-router/dom'] as const)(
    'con StrictMode, RouterProvider de %s activa el router que React conserva',
    async (paquete) => {
      const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { StrictMode, useState } from 'react'
import { createMemoryRouter, Link } from 'react-router'
import { RouterProvider } from '${paquete}'
export default function App() {
  const [router] = useState(() => createMemoryRouter([
    { path: '/', Component: () => <Link to="/destino">Ir</Link> },
    { path: '/destino', Component: () => <p>Destino visible</p> },
  ]))
  return <StrictMode><RouterProvider router={router} /></StrictMode>
}` }], { strictMode: true })

      fireEvent.click(await within(document.body).findByRole('link', { name: 'Ir' }))
      expect(await within(document.body).findByText('Destino visible')).toBeInTheDocument()
      await waitFor(() =>
        expect(mensajesDe(enviar)).toContainEqual(
          expect.objectContaining({ tipo: 'ubicacion', url: '/destino', puedeAtras: true }),
        ),
      )
      enviarOrden('atras')
      expect(await within(document.body).findByRole('link', { name: 'Ir' })).toBeInTheDocument()
    },
  )

  it.each(['MemoryRouter', 'BrowserRouter', 'HashRouter'] as const)(
    '%s acepta ir después de que una ruta haya fallado al renderizar',
    async (origen) => {
      const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { ${origen}, Routes, Route, useParams } from 'react-router'
const usuarios = { '1': { nombre: 'Ada' } }
function Usuario() { const { id } = useParams(); return <p>{usuarios[id].nombre}</p> }
export default function App() { return <${origen}><Routes><Route path="/" element={<p>Inicio</p>} /><Route path="/usuarios/:id" element={<Usuario />} /></Routes></${origen}> }` }])
      expect(await within(document.body).findByText('Inicio')).toBeInTheDocument()

      enviarOrden('ir', '/usuarios/999')
      await waitFor(() =>
        expect(mensajesDe(enviar)).toContainEqual(
          expect.objectContaining({ tipo: 'error-render', texto: expect.any(String) }),
        ),
      )
      enviarOrden('ir', '/usuarios/1')
      expect(await within(document.body).findByText('Ada')).toBeInTheDocument()
    },
  )

  it('un Link que falla deja su URL como destino de Recargar', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { BrowserRouter, Link, Routes, Route } from 'react-router'
const debeFallar = sessionStorage.getItem('fallo-link') !== 'hecho'
function Rota() { if (debeFallar) { sessionStorage.setItem('fallo-link', 'hecho'); throw new Error('Fallo del enlace') } return <p>Ruta recuperada</p> }
export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Link to="/rota">Romper</Link>} /><Route path="/rota" element={<Rota />} /></Routes></BrowserRouter> }` }])
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Romper' }))
    await waitFor(() =>
      expect(mensajesDe(enviar)).toContainEqual(
        expect.objectContaining({ tipo: 'error-render', texto: 'Fallo del enlace' }),
      ),
    )

    enviarOrden('recargar')
    expect(await within(document.body).findByText('Ruta recuperada')).toBeInTheDocument()
  })

  it('codifica los espacios de la ubicación antes de enviarla a la página', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, Link } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '/', Component: () => <Link to="/recetas/Tortilla de patatas">Abrir</Link> }, { path: '/recetas/:nombre', Component: () => <p>Receta</p> }]); export default function App() { return <RouterProvider router={router} /> }` }])
    fireEvent.click(await within(document.body).findByRole('link', { name: 'Abrir' }))
    await waitFor(() =>
      expect(mensajesDe(enviar)).toContainEqual(
        expect.objectContaining({ tipo: 'ubicacion', url: '/recetas/Tortilla%20de%20patatas' }),
      ),
    )
  })

  it.each([
    ['/entrar?volver=%2Fdesignaciones', '/entrar?volver=%2Fdesignaciones'],
    ['/recetas/Tortilla%20de%20patatas', '/recetas/Tortilla%20de%20patatas'],
    ['/porcentaje/%', '/porcentaje/%25'],
  ])('no vuelve a codificar la ubicación %s', async (url, esperada) => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '*', Component: () => <p>Ruta</p> }], { initialEntries: [${JSON.stringify(url)}] }); export default function App() { return <RouterProvider router={router} /> }` }])
    await waitFor(() =>
      expect(mensajesDe(enviar)).toContainEqual(
        expect.objectContaining({ tipo: 'ubicacion', url: esperada }),
      ),
    )
  })

  it('recargar conserva los datos de la API simulada y el almacenamiento en memoria', async () => {
    await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, useLoaderData } from 'react-router'; import { RouterProvider } from 'react-router/dom'; localStorage.setItem('tema', localStorage.getItem('tema') || 'oscuro'); const loader = async () => ({ recetas: await (await fetch('/api/recetas')).json(), tema: localStorage.getItem('tema') }); function Inicio() { const d = useLoaderData(); return <p>{d.recetas.map(r => r.nombre).join(', ')} · {d.tema}</p> }; const router = createMemoryRouter([{ path: '/', loader, Component: Inicio }]); export default function App() { return <RouterProvider router={router} /> }` }], { api: { recetas: [{ id: 1, nombre: 'Migas' }] } })
    await fetch('/api/recetas', { method: 'POST', body: JSON.stringify({ nombre: 'Pisto' }) })
    enviarOrden('recargar')
    expect(await within(document.body).findByText('Migas, Pisto · oscuro')).toBeInTheDocument()
  })

  it('ignora los mensajes navegador que no vienen de parent y los ir con una URL no válida', async () => {
    await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const router = createMemoryRouter([{ path: '*', Component: () => <p>Quieto</p> }]); export default function App() { return <RouterProvider router={router} /> }` }])
    const recargar = vi.spyOn(ventana, '__recargarAppReactEnVivo' as never)
    enviarOrden('ir', '/otra', null)
    enviarOrden('ir', '//otro.example')
    expect(recargar).not.toHaveBeenCalled()
  })

  it('fetch a http://localhost/api pasa por la API simulada', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { createMemoryRouter, useLoaderData } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const loader = async ({ request }) => (await fetch(new URL('/api/recetas', request.url))).json(); function Inicio() { return <p>{useLoaderData()[0].nombre}</p> }; const router = createMemoryRouter([{ path: '/', loader, Component: Inicio }]); export default function App() { return <RouterProvider router={router} /> }` }], { api: { recetas: [{ id: 1, nombre: 'Migas' }] } })
    expect(await within(document.body).findByText('Migas')).toBeInTheDocument()
    expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'peticion', ruta: '/api/recetas' }))
  })

  it('importar react-router sin el bundle da un error claro', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import { Link } from 'react-router'; export default function App() { return <Link to="/">Inicio</Link> }` }], { conBundleRouter: false })
    expect(mensajesDe(enviar)[0]).toEqual({ tipo: 'runtime-no-cargado', libreria: 'react-router' })
    expect(mensajesDe(enviar)).toContainEqual({ tipo: 'runtime-no-cargado', libreria: 'react-router' })
    expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'error-render', texto: 'No se pudo cargar React Router en la vista previa. Pulsa «Recargar vista previa» para intentarlo de nuevo.' }))
  })

  it('un paquete desconocido dice solo React, React Router y tus propios archivos', async () => {
    const enviar = await instalar([{ nombre: 'App.tsx', codigo: `import x from 'paquete'; export default function App() { return <p>{x}</p> }` }])
    expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'error-render', texto: expect.stringContaining('solo se puede importar React, React Router y tus propios archivos') }))
  })

  describe('comprobaciones con URL', () => {
    const codigo = `import { createMemoryRouter, useLoaderData } from 'react-router'; import { RouterProvider } from 'react-router/dom'; const loader = async ({ request }) => { await new Promise(r => setTimeout(r, 50)); return new URL(request.url).pathname }; function Pagina() { return <p>Página {useLoaderData()}</p> }; const router = createMemoryRouter([{ path: '*', loader, Component: Pagina }]); export default function App() { return <RouterProvider router={router} /> }`

    it('urlInicial de la comprobación monta la app en esa URL', async () => {
      await instalar([{ nombre: 'App.tsx', codigo }])
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'Empieza', urlInicial: '/b', pasos: [], espera: { url: '/b' } }])).toEqual([{ descripcion: 'Empieza', ok: true }])
    })

    it('navegar, atras, adelante y recargar esperan a que la navegación termine', async () => {
      await instalar([{ nombre: 'App.tsx', codigo }])
      await instalarPruebas()
      const resultados = await ventana.__comprobarReactEnVivo?.([{ descripcion: 'Recorre', pasos: [{ navegar: '/b' }, { atras: true }, { adelante: true }, { recargar: true }], espera: { texto: 'Página /b' } }])
      expect(resultados).toEqual([{ descripcion: 'Recorre', ok: true }])
    })

    it('la espera url falla con La dirección es /a y debería ser /b', async () => {
      await instalar([{ nombre: 'App.tsx', codigo }])
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'No coincide', urlInicial: '/a', pasos: [], espera: { url: '/b' } }])).toEqual([{ descripcion: 'No coincide', ok: false, motivo: 'La dirección es «/a» y debería ser «/b».' }])
    })

    it('atras sin página anterior falla con un motivo claro', async () => {
      await instalar([{ nombre: 'App.tsx', codigo }])
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'Atrás', pasos: [{ atras: true }], espera: { url: '/' } }])).toEqual([{ descripcion: 'Atrás', ok: false, motivo: 'No hay ninguna página anterior a la que volver.' }])
    })

    it('una comprobación con URL en una app sin router falla con un motivo claro', async () => {
      await instalar([{ nombre: 'App.tsx', codigo: 'export default function App() { return <p>Sin router</p> }' }], { conRuntimeRouter: false })
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'URL', pasos: [{ navegar: '/b' }], espera: { url: '/b' } }])).toEqual([{ descripcion: 'URL', ok: false, motivo: 'Esta comprobación usa la dirección, pero la app no importa react-router.' }])
    })

    it('si el bundle del router no carga usa ese error como motivo', async () => {
      await instalar([{ nombre: 'App.tsx', codigo: `import { Link } from 'react-router'; export default function App() { return <Link to="/b">B</Link> }` }], { conBundleRouter: false })
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'URL', pasos: [{ navegar: '/b' }], espera: { url: '/b' } }])).toEqual([{ descripcion: 'URL', ok: false, motivo: 'No se pudo cargar React Router en la vista previa. Pulsa «Recargar vista previa» para intentarlo de nuevo.' }])
    })

    it('cada comprobación desecha el router de la anterior', async () => {
      await instalar([{ nombre: 'App.tsx', codigo }])
      await instalarPruebas()
      expect(await ventana.__comprobarReactEnVivo?.([
        { descripcion: 'Primera', pasos: [{ navegar: '/b' }], espera: { url: '/b' } },
        { descripcion: 'Segunda', pasos: [], espera: { url: '/' } },
      ])).toEqual([
        { descripcion: 'Primera', ok: true },
        { descripcion: 'Segunda', ok: true },
      ])
    })
  })
})
