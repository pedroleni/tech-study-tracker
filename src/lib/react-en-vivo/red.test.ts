import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import puente from './runtime/puente.js?raw'
import red from './runtime/red.js?raw'

type ControlRed = {
  configurar: (opciones: { latencia: number; desordenar: boolean }) => void
  fallarSiguiente: () => void
}

type VentanaRed = typeof window & {
  __configReactEnVivo?: {
    api: Record<string, unknown[]>
    red: { latencia: number; desordenar: boolean }
  }
  __redReactEnVivo?: ControlRed
}

const ventana = window as VentanaRed
const recetas = [
  { id: 1, nombre: 'Salmorejo', tiempo: 20 },
  { id: 2, nombre: 'Pisto manchego', tiempo: 45 },
]
let fetchOriginal: typeof window.fetch
let postMessage: ReturnType<typeof vi.spyOn>

function mensajesPeticion() {
  return postMessage.mock.calls
    .map(([mensaje]) => mensaje)
    .filter(
      (mensaje) =>
        mensaje !== null &&
        typeof mensaje === 'object' &&
        'tipo' in mensaje &&
        mensaje.tipo === 'peticion',
    )
}

function instalar(opciones: { latencia?: number; desordenar?: boolean } = {}) {
  ventana.__configReactEnVivo = {
    api: { recetas },
    red: {
      latencia: opciones.latencia ?? 0,
      desordenar: opciones.desordenar ?? false,
    },
  }
  new Function(puente)()
  new Function(red)()
}

beforeEach(() => {
  fetchOriginal = window.fetch
  window.fetch = vi.fn(async () => new Response('original', { status: 202 }))
  postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
})

afterEach(() => {
  window.fetch = fetchOriginal
  delete ventana.__configReactEnVivo
  delete ventana.__redReactEnVivo
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('API simulada de React en vivo', () => {
  it('GET /api/recetas devuelve la colección con Response real', async () => {
    instalar()

    const respuesta = await fetch('/api/recetas')

    expect(respuesta).toBeInstanceOf(Response)
    expect(respuesta.status).toBe(200)
    expect(respuesta.ok).toBe(true)
    expect(respuesta.headers.get('Content-Type')).toContain('application/json')
    expect(await respuesta.json()).toEqual(recetas)
  })

  it('GET con ?q= busca sin distinguir mayúsculas ni tildes', async () => {
    instalar()

    expect(await (await fetch('/api/recetas?q=PISTO')).json()).toEqual([recetas[1]])
    expect(await (await fetch('/api/recetas?q=manchégo')).json()).toEqual([recetas[1]])
  })

  it('GET /api/recetas/2 y 404 si no existe', async () => {
    instalar()

    expect(await (await fetch('/api/recetas/2')).json()).toEqual(recetas[1])
    for (const ruta of ['/api/recetas/9', '/api/postres']) {
      const respuesta = await fetch(ruta)
      expect(respuesta.status).toBe(404)
      expect(await respuesta.json()).toEqual({ error: expect.any(String) })
    }
  })

  it('POST asigna id y lo guarda; PUT, PATCH y DELETE modifican la copia', async () => {
    instalar()
    const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) })

    const creada = await (
      await fetch('/api/recetas', json('POST', { nombre: 'Gazpacho', tiempo: 10 }))
    ).json()
    expect(creada).toEqual({ id: 3, nombre: 'Gazpacho', tiempo: 10 })
    expect(await (await fetch('/api/recetas/3')).json()).toEqual(creada)

    expect(
      await (await fetch('/api/recetas/3', json('PUT', { nombre: 'Ajoblanco' }))).json(),
    ).toEqual({ id: 3, nombre: 'Ajoblanco' })
    expect(
      await (await fetch('/api/recetas/3', json('PATCH', { tiempo: 15 }))).json(),
    ).toEqual({ id: 3, nombre: 'Ajoblanco', tiempo: 15 })
    expect((await fetch('/api/recetas/3', { method: 'DELETE' })).status).toBe(200)
    expect((await fetch('/api/recetas/3')).status).toBe(404)

    delete ventana.__redReactEnVivo
    window.fetch = vi.fn(async () => new Response('original', { status: 202 }))
    instalar()
    expect(await (await fetch('/api/recetas')).json()).toEqual(recetas)
  })

  it('respeta la latencia', async () => {
    vi.useFakeTimers()
    instalar({ latencia: 600 })

    const terminada = vi.fn()
    void fetch('/api/recetas').then(terminada)
    await vi.advanceTimersByTimeAsync(599)
    expect(terminada).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(terminada).toHaveBeenCalledOnce()
  })

  it('abortar durante la espera rechaza con AbortError y no deja temporizadores', async () => {
    vi.useFakeTimers()
    instalar({ latencia: 600 })
    const controlador = new AbortController()

    const peticion = fetch('/api/recetas', { signal: controlador.signal })
    controlador.abort()

    await expect(peticion).rejects.toMatchObject({ name: 'AbortError' })
    expect(vi.getTimerCount()).toBe(0)
    expect(mensajesPeticion().at(-1)).toEqual(
      expect.objectContaining({ estado: 'cancelada', metodo: 'GET', ruta: '/api/recetas' }),
    )
  })

  it('con desordenar, dos peticiones seguidas llegan al revés', async () => {
    vi.useFakeTimers()
    instalar({ latencia: 100, desordenar: true })
    const orden: string[] = []

    void fetch('/api/recetas/1').then(() => orden.push('primera'))
    void fetch('/api/recetas/2').then(() => orden.push('segunda'))
    await vi.advanceTimersByTimeAsync(50)
    expect(orden).toEqual(['segunda'])
    await vi.advanceTimersByTimeAsync(150)
    expect(orden).toEqual(['segunda', 'primera'])
  })

  it('fallarSiguiente hace que la siguiente responda 500 una sola vez', async () => {
    instalar()
    ventana.__redReactEnVivo?.fallarSiguiente()

    const fallo = await fetch('/api/recetas')
    expect(fallo.status).toBe(500)
    expect(await fallo.json()).toEqual({ error: 'Error del servidor (simulado)' })
    expect((await fetch('/api/recetas')).status).toBe(200)
  })

  it('envía peticion al empezar y al terminar', async () => {
    vi.useFakeTimers()
    instalar({ latencia: 25 })

    const peticion = fetch('/api/recetas')
    expect(mensajesPeticion()).toEqual([
      expect.objectContaining({ id: 1, metodo: 'GET', ruta: '/api/recetas', estado: 'pendiente' }),
    ])
    await vi.advanceTimersByTimeAsync(25)
    await peticion
    expect(mensajesPeticion()).toEqual([
      expect.objectContaining({ id: 1, estado: 'pendiente' }),
      expect.objectContaining({ id: 1, estado: 'ok', codigo: 200, ms: 25 }),
    ])
  })

  it('solo acepta los mensajes red y fallar-siguiente que vienen de parent', async () => {
    vi.useFakeTimers()
    instalar({ latencia: 100 })
    const otro = document.createElement('iframe')
    document.body.append(otro)

    window.dispatchEvent(
      new MessageEvent('message', {
        source: otro.contentWindow,
        data: { canal: 'react-en-vivo', tipo: 'red', latencia: 0, desordenar: false },
      }),
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        source: otro.contentWindow,
        data: { canal: 'react-en-vivo', tipo: 'fallar-siguiente' },
      }),
    )
    const primera = fetch('/api/recetas')
    await vi.advanceTimersByTimeAsync(99)
    let resuelta = false
    void primera.then(() => {
      resuelta = true
    })
    await Promise.resolve()
    expect(resuelta).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect((await primera).status).toBe(200)

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window.parent,
        data: { canal: 'react-en-vivo', tipo: 'red', latencia: 0, desordenar: false },
      }),
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window.parent,
        data: { canal: 'react-en-vivo', tipo: 'fallar-siguiente' },
      }),
    )
    const fallo = fetch('/api/recetas')
    await vi.advanceTimersByTimeAsync(0)
    expect((await fallo).status).toBe(500)
  })

  it('las rutas que no son /api/ van al fetch original', async () => {
    instalar()

    const respuesta = await fetch('/datos.json', { method: 'POST' })

    expect(respuesta.status).toBe(202)
    expect(window.fetch).not.toBe(fetchOriginal)
  })
})
